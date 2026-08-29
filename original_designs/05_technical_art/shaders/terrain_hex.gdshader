// ============================================================================
// terrain_hex.gdshader — Project Chronos 六边形地形超级 shader
// 风格对标：Sid Meier's Civilization V
// 功能：地形贴图混合 + 三态战争迷雾 + 领土边界 + 云影（四合一，单 draw call）
//
// 用法（Godot 4.x）：
//   1. 地形 mesh 由 SurfaceTool 合并生成，每格顶点：
//        COLOR.rg = 格子中心在数据纹理中的归一化坐标 (cell_x/grid_w, cell_y/grid_h)
//        UV       = 格子内局部坐标 [0,1]（六边形内切方形近似）
//   2. grid_data 为 40×30 RGBA8 ImageTexture，每回合由逻辑层重写：
//        R = 地形类型索引 (0..7)
//        G = 迷雾状态 (0=未探索 / 128=已探索 / 255=可见)
//        B = 领土归属索引 (0=无主, 1..N=文明)
//        A = 变化遮罩位 (bit0: 河流边, bit1: 道路边, bit2: 可达高亮)
//   3. terrain_textures 为 8 层 Texture2DArray，每层 512×512 可平铺手绘贴图。
//   4. civ_colors 为 256×1 渐变查找表：B 通道值直接当 U 索引。
// ============================================================================

shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back;

// ---- 资源 ----
uniform sampler2D grid_data : source_color, filter_nearest;
uniform sampler2DArray terrain_textures : source_color, filter_linear_mipmap, repeat_enable;
uniform sampler2D civ_colors : source_color, filter_linear;

// ---- 调色参数（美术可调，须有 tooltip） ----
uniform vec4 terrain_tint : source_color = vec4(1.0, 1.0, 1.0, 1.0); // 全局地形色调锁定
uniform float fog_unexplored_darkness : hint_range(0.0, 0.2) = 0.02; // 未探索亮度
uniform float fog_explored_darkness  : hint_range(0.1, 0.8) = 0.45;  // 记忆态亮度
uniform float fog_desaturation       : hint_range(0.0, 1.0)  = 0.7;  // 记忆态去饱和
uniform float border_width           : hint_range(0.01, 0.2) = 0.06; // 领土边界描线宽度（格单位）
uniform float border_glow            : hint_range(0.0, 2.0)  = 1.2;  // 边界发光强度
uniform float territory_tint_amount  : hint_range(0.0, 0.3)  = 0.08; // 领土内侧渐染透明度
uniform float cloud_shadow_strength  : hint_range(0.0, 0.5)  = 0.15; // 云影暗度
uniform vec2  cloud_wind_dir         = vec2(-0.7, 0.3);              // 西北风
uniform float cloud_speed            = 0.01;                         // 云影速度
uniform float edge_blend             : hint_range(0.0, 0.3)  = 0.12; // 地形贴图边缘咬合带宽
uniform float uv_tile_scale          = 2.0;                          // 贴图在格内的平铺次数
uniform float pulse_speed            = 1.5;                          // 边界呼吸频率

// ---- 传递变量 ----
varying vec2 v_cell_center; // 本格在数据纹理中的中心坐标
varying vec2 v_local;       // 格内局部坐标 [0,1]
varying vec3 v_world_pos;

// ---- 工具：采样数据纹理（自动坐标包裹） ----
vec4 sample_cell(vec2 cell_uv) {
    return texture(grid_data, fract(cell_uv));
}

// ---- 工具：伪 Perlin（两层 value noise，无需贴图） ----
float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float value_noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1, 0)), f.x),
               mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), f.x), f.y);
}

void vertex() {
    v_cell_center = COLOR.rg; // 合并 mesh 时由逻辑层写入顶点色
    v_local = UV;
    v_world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    // ------------------------------------------------------------------
    // 1) 地形类型 + 邻格采样（用于边缘咬合与边界判定）
    // ------------------------------------------------------------------
    vec4 cell = sample_cell(v_cell_center);
    float my_type = cell.r * 255.0;

    // 四方向邻格中心偏移（数据纹理一格 = 1/grid_size 纹素步长）
    vec2 texel = 1.0 / vec2(textureSize(grid_data, 0));
    vec4 n_up  = sample_cell(v_cell_center + vec2(0.0, -texel.y));
    vec4 n_dn  = sample_cell(v_cell_center + vec2(0.0,  texel.y));
    vec4 n_lf  = sample_cell(v_cell_center + vec2(-texel.x, 0.0));
    vec4 n_rt  = sample_cell(v_cell_center + vec2( texel.x, 0.0));

    // ------------------------------------------------------------------
    // 2) 地形贴图：本格贴图 + 边缘混入最相似的邻格 → 文明5 式自然咬合
    // ------------------------------------------------------------------
    vec2 tile_uv = v_local * uv_tile_scale;
    vec3 albedo = texture(terrain_textures, vec3(tile_uv, my_type)).rgb;

    // 距最近格边的距离（局部坐标）
    vec2 d2edge = min(v_local, 1.0 - v_local);
    float edge_dist = min(d2edge.x, d2edge.y);

    if (edge_dist < edge_blend) {
        // 找出对应方向的邻格并按带宽做平滑权重混合
        float w = 1.0 - smoothstep(0.0, edge_blend, edge_dist);
        float n_type = my_type;
        if (d2edge.y < d2edge.x) {
            n_type = (v_local.y < 0.5) ? n_up.r * 255.0 : n_dn.r * 255.0;
        } else {
            n_type = (v_local.x < 0.5) ? n_lf.r * 255.0 : n_rt.r * 255.0;
        }
        if (n_type != my_type) {
            vec3 n_col = texture(terrain_textures, vec3(tile_uv, n_type)).rgb;
            albedo = mix(albedo, n_col, w * 0.85); // 不完全混合，保留格子秩序感
        }
    }

    // ------------------------------------------------------------------
    // 3) 领土边界：本格与邻格归属不同 → 文明色描线 + 内侧渐染 + 呼吸
    // ------------------------------------------------------------------
    float my_owner = cell.b * 255.0;
    vec3 border_col = vec3(0.0);
    float border_mask = 0.0;

    if (my_owner > 0.5) {
        vec3 my_civ = texture(civ_colors, vec2(cell.b, 0.5)).rgb;
        // 检查四方向是否为异主格
        float diff = step(0.5, abs(n_up.b - cell.b)) + step(0.5, abs(n_dn.b - cell.b))
                   + step(0.5, abs(n_lf.b - cell.b)) + step(0.5, abs(n_rt.b - cell.b));
        if (diff > 0.0) {
            float line = 1.0 - smoothstep(border_width * 0.5, border_width, edge_dist);
            border_mask = line;
            border_col = my_civ;
            // 微呼吸（文明5 经典细节）
            border_mask *= 0.9 + 0.1 * sin(TIME * pulse_speed);
            // 内侧渐染：领土底色
            albedo = mix(albedo, mix(albedo, my_civ, 0.5), territory_tint_amount * 4.0 * (1.0 - edge_dist));
        }
    }

    // ------------------------------------------------------------------
    // 4) 云影：两层反向滚动噪声做光照乘数（西北风扫过战场）
    // ------------------------------------------------------------------
    vec2 cloud_uv = v_world_pos.xz * 0.08 + cloud_wind_dir * TIME * cloud_speed;
    float cloud = value_noise(cloud_uv) * 0.6 + value_noise(cloud_uv * 2.7 - cloud_wind_dir * TIME * cloud_speed * 1.6) * 0.4;
    float cloud_factor = 1.0 - cloud_shadow_strength * smoothstep(0.45, 0.75, cloud);

    // ------------------------------------------------------------------
    // 5) 三态战争迷雾（在地形 shader 内完成，无后处理 pass）
    // ------------------------------------------------------------------
    float fog = cell.g; // 0 / 0.5 / 1.0 (即 0/128/255 归一化)
    // 迷雾边缘柔化：与四邻迷雾值做平均 → 文明5 式柔和渐变
    float fog_avg = (fog + n_up.g + n_dn.g + n_lf.g + n_rt.g) / 5.0;
    fog = mix(fog_avg, fog, 0.5);

    float brightness = 1.0;
    float desat = 0.0;
    if (fog < 0.25) {                 // 未探索：近乎纯黑 + 星尘噪点
        brightness = fog_unexplored_darkness + 0.03 * value_noise(v_local * 40.0 + vec2(7.7));
        desat = 1.0;
    } else if (fog < 0.75) {          // 记忆态：暗纱 + 去饱和
        brightness = fog_explored_darkness;
        desat = fog_desaturation;
    }

    float grey = dot(albedo, vec3(0.299, 0.587, 0.114));
    albedo = mix(albedo, vec3(grey), desat) * brightness;

    // ------------------------------------------------------------------
    // 6) 可达范围高亮（数据纹理 A bit2，选单位时逻辑层写入）
    // ------------------------------------------------------------------
    float reachable = step(0.5, fract(cell.a * 255.0 / 4.0)); // bit2
    float pulse = 0.5 + 0.5 * sin(TIME * 2.0);
    albedo += vec3(0.9, 0.95, 1.0) * reachable * pulse * 0.12;

    // ------------------------------------------------------------------
    // 边界发光叠加（emission，走 bloom 出微光晕）
    // ------------------------------------------------------------------
    EMISSION = border_col * border_mask * border_glow;

    ALBEDO = albedo * terrain_tint.rgb;
    ROUGHNESS = 0.95; // 手绘哑光质感
    SPECULAR = 0.05;  // 地形几乎无高光
}

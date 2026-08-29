// ============================================================================
// water_hex.gdshader — Project Chronos 水体 shader（黄河/洛水/伊水/涧水）
// 风格对标：文明5 —— 不透明偏写实、岸线泡沫、缓慢流动高光、无折射
//
// 用法：
//   水面 mesh = 水格在固定水面高度 (-0.05) 的合并 mesh，顶点数据同地形 mesh。
//   cloud_shadow 参数与 terrain_hex.gdshader 保持同步（同一 WorldEnvironment 脚本下发）。
// Mobile-safe：无深度纹理、无折射、无屏幕采样；泡沫与流动均在 opaque pass。
// ============================================================================

shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back;

uniform sampler2D grid_data : source_color, filter_nearest;
uniform sampler2D water_normal : hint_normal, filter_linear_mipmap, repeat_enable; // 平铺法线图 256²

// ---- 调色参数 ----
uniform vec3 shallow_color : source_color = vec3(0.32, 0.30, 0.20); // 岸边浅水（黄河土黄）
uniform vec3 deep_color    : source_color = vec3(0.12, 0.14, 0.12); // 深水
uniform vec3 foam_color    : source_color = vec3(0.85, 0.88, 0.80); // 岸线泡沫
uniform float water_tint_amount : hint_range(0.0, 1.0) = 1.0; // 时代水质调色（黄河浑浊度）
uniform vec2  flow_dir    = vec2(1.0, 0.0);   // 流向（洛水自西向东）
uniform float flow_speed  = 0.03;             // 流速
uniform float foam_width  : hint_range(0.05, 0.4) = 0.18; // 泡沫带宽度（格单位）
uniform float foam_pulse  = 0.5;              // 泡沫脉动速度
uniform float roughness_base : hint_range(0.0, 1.0) = 0.15;
uniform float cloud_shadow_strength : hint_range(0.0, 0.5) = 0.15; // 与地形同步
uniform vec2  cloud_wind_dir = vec2(-0.7, 0.3);
uniform float cloud_speed = 0.01;

varying vec2 v_cell_center;
varying vec2 v_local;
varying vec3 v_world_pos;

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

// 陆地判定：地形类型非"河流 R"（约定 river 类型索引 = 4，见设计圣经 §3.2）
bool is_land_cell(vec4 c) {
    return c.r * 255.0 < 3.5 || c.r * 255.0 > 4.5;
}

void vertex() {
    v_cell_center = COLOR.rg;
    v_local = UV;
    v_world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    // ------------------------------------------------------------------
    // 1) 岸线检测：四方向邻格是否陆地 → 泡沫遮罩与离岸距离
    // ------------------------------------------------------------------
    vec2 texel = 1.0 / vec2(textureSize(grid_data, 0));
    vec4 cell = texture(grid_data, fract(v_cell_center));
    float land_up = is_land_cell(texture(grid_data, fract(v_cell_center + vec2(0.0, -texel.y)))) ? 1.0 : 0.0;
    float land_dn = is_land_cell(texture(grid_data, fract(v_cell_center + vec2(0.0,  texel.y)))) ? 1.0 : 0.0;
    float land_lf = is_land_cell(texture(grid_data, fract(v_cell_center + vec2(-texel.x, 0.0)))) ? 1.0 : 0.0;
    float land_rt = is_land_cell(texture(grid_data, fract(v_cell_center + vec2( texel.x, 0.0)))) ? 1.0 : 0.0;

    vec2 d2edge = min(v_local, 1.0 - v_local);
    // 邻岸方向上的最近陆地距离（格单位）
    float shore = 1.0;
    if (land_up > 0.5) shore = min(shore, d2edge.y);
    if (land_dn > 0.5) shore = min(shore, d2edge.y);
    if (land_lf > 0.5) shore = min(shore, d2edge.x);
    if (land_rt > 0.5) shore = min(shore, d2edge.x);

    // ------------------------------------------------------------------
    // 2) 深度渐变：离岸越远越深
    // ------------------------------------------------------------------
    float depth_t = smoothstep(0.0, 0.8, shore);
    vec3 albedo = mix(shallow_color, deep_color, depth_t) * water_tint_amount;

    // ------------------------------------------------------------------
    // 3) 岸线泡沫：白带 + 时间脉动 + 噪声破碎边缘
    // ------------------------------------------------------------------
    float foam_band = 1.0 - smoothstep(foam_width * (0.8 + 0.2 * sin(TIME * foam_pulse)),
                                       foam_width, shore);
    float foam_noise = 0.7 + 0.3 * value_noise(v_local * 18.0 + vec2(TIME * 0.3));
    float foam = foam_band * foam_noise;
    albedo = mix(albedo, foam_color, clamp(foam, 0.0, 1.0) * 0.9);

    // ------------------------------------------------------------------
    // 4) 流动法线：两层反向滚动 → 缓慢流动高光
    // ------------------------------------------------------------------
    vec2 flow_uv1 = v_world_pos.xz * 0.35 + flow_dir * TIME * flow_speed;
    vec2 flow_uv2 = v_world_pos.xz * 0.35 - flow_dir * TIME * flow_speed * 0.6 + vec2(0.5);
    vec3 n1 = texture(water_normal, flow_uv1).rgb * 2.0 - 1.0;
    vec3 n2 = texture(water_normal, flow_uv2).rgb * 2.0 - 1.0;
    NORMAL_MAP = normalize(n1 + n2) * 0.5 + 0.5;
    NORMAL_MAP_DEPTH = 0.6;

    // ------------------------------------------------------------------
    // 5) 云影（与地形 shader 同步，保持全场一致）
    // ------------------------------------------------------------------
    vec2 cloud_uv = v_world_pos.xz * 0.08 + cloud_wind_dir * TIME * cloud_speed;
    float cloud = value_noise(cloud_uv) * 0.6 + value_noise(cloud_uv * 2.7) * 0.4;
    float cloud_factor = 1.0 - cloud_shadow_strength * smoothstep(0.45, 0.75, cloud);

    // ------------------------------------------------------------------
    // 6) 迷雾（与地形同步：未探索近黑，记忆态暗纱）
    // ------------------------------------------------------------------
    float fog = cell.g;
    float brightness = 1.0;
    if (fog < 0.25) brightness = 0.02;
    else if (fog < 0.75) brightness = 0.4;

    ALBEDO = albedo * brightness * cloud_factor;
    ROUGHNESS = roughness_base + foam * 0.5; // 泡沫处更哑光
    SPECULAR = 0.6;                          // 水面保留文明5 式柔和高光
    METALLIC = 0.0;
}

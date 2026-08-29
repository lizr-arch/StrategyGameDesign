// ============================================================================
// prop_fog_fade.gdshader — Project Chronos 装饰物迷雾淡出 shader
// 用于：树木/岩石/农田等 MultiMesh 装饰物
// 目的：避免文明5 里被诟病的"黑纱下立着一片树"——记忆态迷雾下装饰物
//       整体压暗 + 半透明淡出，未探索格子装饰物近乎隐形。
//
// 用法：装饰物 MultiMesh 的每个实例 COLOR.rg 写入所在格子的数据纹理坐标
//       （与地形 mesh 同一约定），逻辑层更新迷雾后无需通知装饰物。
// Mobile-safe：无额外 pass，仅 albedo/alpha 修改。
// ============================================================================

shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back, depth_prepass_alpha;

uniform sampler2D grid_data : source_color, filter_nearest;
uniform sampler2D base_texture : source_color, filter_linear_mipmap; // 装饰物 atlas 贴图
uniform float fog_unexplored_alpha : hint_range(0.0, 1.0) = 0.06; // 未探索装饰物近乎隐形
uniform float fog_explored_alpha  : hint_range(0.0, 1.0) = 0.55; // 记忆态半透明
uniform float fog_explored_dark   : hint_range(0.0, 1.0) = 0.5;  // 记忆态压暗

varying vec4 v_cell_data; // 本格数据（含迷雾）

void vertex() {
    // MultiMesh 实例色 = 格子数据纹理坐标（逻辑层生成实例时写入）
    v_cell_data = texture(grid_data, fract(COLOR.rg));
}

void fragment() {
    float fog = v_cell_data.g; // 0=未探索 / 0.5=记忆态 / 1=可见

    float brightness = 1.0;
    float alpha = 1.0;

    if (fog < 0.25) {            // 未探索：压黑 + 几乎隐形
        brightness = 0.05;
        alpha = fog_unexplored_alpha;
    } else if (fog < 0.75) {     // 记忆态：压暗 + 半透明淡出
        brightness = fog_explored_dark;
        alpha = fog_explored_alpha;
    }

    vec3 tex = texture(base_texture, UV).rgb;
    ALBEDO = tex * brightness;
    ALPHA = alpha;
    ROUGHNESS = 0.95;
}

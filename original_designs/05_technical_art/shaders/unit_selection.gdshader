// ============================================================================
// unit_selection.gdshader — Project Chronos 单位选圈 shader
// 风格对标：文明5 —— 旋转双环 + 呼吸亮度 + 移动范围呼吸光圈
//
// 用法：贴地 QuadMesh (1.2×1.2) 挂在单位脚下，no_depth_test + billboard 关闭，
//       渲染优先级调到单位之下、地形之上。
// 状态由实例 uniform（ShaderMaterial 每单位一份，或用 instance uniform 批量）：
//   selectable_state: 0=未选中 / 1=已选中 / 2=敌方(红色)
// ============================================================================

shader_type spatial;
render_mode blend_mix, depth_draw_never, cull_disabled, unshaded;

uniform vec3 friendly_color : source_color = vec3(0.95, 0.85, 0.3);  // 己方金黄
uniform vec3 enemy_color    : source_color = vec3(0.9, 0.2, 0.2);    // 敌方红
uniform float ring_speed    = 0.8;    // 外环旋转速度
uniform float pulse_speed   = 2.0;    // 呼吸频率
uniform float ring_width    = 0.08;   // 环宽（UV 单位）
uniform float ring_radius   = 0.38;   // 环半径

// 实例化 uniform：每单位一份状态，批量渲染时不产生 shader 变体
instance uniform int selectable_state = 0; // 0=未选中 / 1=已选中 / 2=敌方

varying vec2 v_uv;

void vertex() {
    v_uv = UV;
}

void fragment() {
    vec2 p = v_uv - 0.5;
    float dist = length(p);
    float angle = atan(p.y, p.x);

    vec3 base_col = (selectable_state == 2) ? enemy_color : friendly_color;
    float alpha = 0.0;

    // 主环（选中时才显示）
    if (selectable_state == 1) {
        float ring = 1.0 - smoothstep(ring_width * 0.4, ring_width,
                                      abs(dist - ring_radius));
        // 旋转缺口环（文明5 式两段弧）
        float arc = step(0.15, fract(angle / TAU + TIME * ring_speed * sign(p.x)));
        alpha = max(alpha, ring * (0.55 + 0.45 * arc));
    }

    // 内圈呼吸光晕（始终微弱显示，提示可交互）
    float inner = 1.0 - smoothstep(0.0, ring_radius * 0.85, dist);
    float breath = 0.5 + 0.5 * sin(TIME * pulse_speed);
    alpha = max(alpha, inner * 0.18 * breath);

    // 悬停/选中时整体提亮
    float bright = 1.0 + breath * 0.3 * float(selectable_state == 1);

    ALBEDO = base_col * bright;
    ALPHA = clamp(alpha, 0.0, 1.0);
}

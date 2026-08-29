# =============================================================================
# hex_terrain_mesh.gd — 六边形合并地形 Mesh 构建器  (Godot 4.3+)
# -----------------------------------------------------------------------------
# 作用：从一个二维 heightmap 烘焙出整个 40×30 地图的 ArrayMesh（含顶面 + 侧壁），
#       每个顶点的 COLOR.rg 携带"本格在数据纹理中的归一化坐标"，让
#       terrain_hex.gdshader 能逐像素采样 grid_data。
#
# 几何约定：pointy-top 六边形（与 maps/gen_luoyang_map.py / 洛阳地图一致）
#   - 六边形边长 = hex_size（世界单位），宽 = sqrt(3)*hex_size，高 = 2*hex_size
#   - 偶数行 (y 为偶) x 原位；奇数行 (y 为奇) x 偏移 +sqrt(3)/2*hex_size
#   - 同邻格高度差 > STEP_THRESHOLD 时生成竖直侧壁 quad（文明5 式悬崖）
# =============================================================================

class_name HexTerrainMeshBuilder

const TERRAIN_HEIGHT : Dictionary = {
	0: 0.0,    # plains
	1: -0.25,  # valley
	2: 0.35,   # hills
	3: 0.8,    # mountain
	4: -0.05,  # river
	5: 0.5,    # snow
	6: 0.0,    # desert
}

# 高度差大于此值才生成侧壁（防止平地抖动产生大量薄壁）
const STEP_THRESHOLD : float = 0.05

# ---------------------------------------------------------------------------

static func build_terrain_mesh(
	grid_width: int,
	grid_height: int,
	terrain_type: PackedByteArray,   # size = grid_width*grid_height
	hex_size: float = 1.0
) -> ArrayMesh:
	var st : SurfaceTool = SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)

	# 先生成全部顶面
	for y in range(grid_height):
		for x in range(grid_width):
			var t : int = terrain_type[y * grid_width + x]
			var h : float = TERRAIN_HEIGHT.get(t, 0.0)
			_add_hex_top(st, x, y, hex_size, h, grid_width, grid_height)

	# 邻接比较 → 侧壁（仅在需要处生成，避免 ~3× quad 开销）
	for y in range(grid_height):
		for x in range(grid_width):
			var t_here : int = terrain_type[y * grid_width + x]
			var h_here : float = TERRAIN_HEIGHT.get(t_here, 0.0)
			# 六方向邻居：偶行 / 奇行偏移略不同（pointy-top offset）
			for dir in range(6):
				var n_xy : Vector2i = _neighbor(x, y, dir)
				if n_xy.x < 0 or n_xy.y < 0 or n_xy.x >= grid_width or n_xy.y >= grid_height:
					continue
				var t_n : int = terrain_type[n_xy.y * grid_width + n_xy.x]
				var h_n : float = TERRAIN_HEIGHT.get(t_n, 0.0)
				if abs(h_here - h_n) > STEP_THRESHOLD:
					_add_side_wall(st, x, y, dir, hex_size, h_here, h_n)

	st.generate_normals()
	st.generate_tangents()
	return st.commit()

# ---------------------------------------------------------------------------

static func _cell_center(x: int, y: int, hex_size: float) -> Vector3:
	# pointy-top：行高 = 1.5 * hex_size；偶数行无偏移，奇数行 +0.5*水平步长
	var w : float = sqrt(3.0) * hex_size
	var row_h : float = 1.5 * hex_size
	var px : float = x * w + (w * 0.5 if (y & 1) == 1 else 0.0)
	var pz : float = y * row_h
	return Vector3(px, 0.0, pz)

# 6 个角的"格内局部"位置（用于 v_local UV）
static func _hex_local_corners() -> Array:
	var s : float = 1.0  # 归一化到 1.0 = 半高
	var c : float = sqrt(3.0) / 2.0
	return [
		Vector2(0.0,  s),     # 0 top
		Vector2( c,  0.5),    # 1 upper-right
		Vector2( c, -0.5),    # 2 lower-right
		Vector2(0.0, -s),     # 3 bottom
		Vector2(-c, -0.5),    # 4 lower-left
		Vector2(-c,  0.5),    # 5 upper-left
	]

static func _neighbor(x: int, y: int, dir: int) -> Vector2i:
	# pointy-top offset 邻居
	# dir: 0=NE, 1=E, 2=SE, 3=SW, 4=W, 5=NW
	var even : bool = (y & 1) == 0
	match dir:
		0: return Vector2i(x + (0 if even else 1), y - 1)
		1: return Vector2i(x + 1, y)
		2: return Vector2i(x + (0 if even else 1), y + 1)
		3: return Vector2i(x + (-1 if even else 0), y + 1)
		4: return Vector2i(x - 1, y)
		5: return Vector2i(x + (-1 if even else 0), y - 1)
	return Vector2i(x, y)

static func _add_hex_top(
	st: SurfaceTool,
	cx: int, cy: int,
	hex_size: float, h: float,
	grid_w: int, grid_h: int
) -> void:
	var center : Vector3 = _cell_center(cx, cy, hex_size) + Vector3(0, h, 0)
	var corners : Array = _hex_local_corners()
	# 把 corners 转到世界空间 + 局部归一化 UV（v_local）
	var world_pts : Array = []
	var uvs : Array = []
	for c in corners:
		var wp : Vector3 = center + Vector3(c.x * hex_size, 0.0, -c.y * hex_size)
		# UV：v_local 0..1，center = 0.5/0.5，corner 范围 [~0,~1]
		var u : float = 0.5 + c.x * 0.5 / 0.866
		var v : float = 0.5 - c.y * 0.25
		world_pts.append(wp)
		uvs.append(Vector2(clamp(u, 0.0, 1.0), clamp(v, 0.0, 1.0)))
	# shader 期望 COLOR.rg = (cell_x/grid_w, cell_y/grid_h)
	var cell_color : Color = Color(
		float(cx) / max(1, grid_w - 1),
		float(cy) / max(1, grid_h - 1),
		0.0, 0.0
	)
	# 6 个三角形扇出（中心 + 6 角）
	for i in range(6):
		var a : int = i
		var b : int = (i + 1) % 6
		# tri: center, world_pts[a], world_pts[b]
		_emit_vertex(st, center, uvs[0], cell_color)
		_emit_vertex(st, world_pts[a], uvs[a], cell_color)
		_emit_vertex(st, world_pts[b], uvs[b], cell_color)

static func _add_side_wall(
	st: SurfaceTool,
	cx: int, cy: int, dir: int,
	hex_size: float, h_here: float, h_n: float
) -> void:
	# 仅生成从本格 h_here 下到邻格 h_n 顶的竖直 quad
	# 简化：使用六边形对应该方向的左右两个本地角，生成 2 个三角形
	var c : Vector3 = _cell_center(cx, cy, hex_size)
	var corners : Array = _hex_local_corners()
	# pointy-top 中 dir 对应的两个角索引
	var a : int
	var b : int
	match dir:
		0: a, b = 0, 1  # NE
		1: a, b = 1, 2  # E
		2: a, b = 2, 3  # SE
		3: a, b = 3, 4  # SW
		4: a, b = 4, 5  # W
		5: a, b = 5, 0  # NW
		_: return
	var p_top_a : Vector3 = c + Vector3(corners[a].x * hex_size, h_here, -corners[a].y * hex_size)
	var p_top_b : Vector3 = c + Vector3(corners[b].x * hex_size, h_here, -corners[b].y * hex_size)
	var p_bot_a : Vector3 = Vector3(p_top_a.x, h_n, p_top_a.z)
	var p_bot_b : Vector3 = Vector3(p_top_b.x, h_n, p_top_b.z)
	# 顶面三角的 v_local 用于材质分配悬崖纹理（如需可加特殊标记）
	var uv : Vector2 = Vector2(0.5, 0.5)
	var cell_color : Color = Color(
		float(cx) / 40.0,
		float(cy) / 30.0,
		0.0, 0.0
	)
	# 两个三角形
	_emit_vertex(st, p_top_a, uv, cell_color)
	_emit_vertex(st, p_bot_a, uv, cell_color)
	_emit_vertex(st, p_top_b, uv, cell_color)
	_emit_vertex(st, p_top_b, uv, cell_color)
	_emit_vertex(st, p_bot_a, uv, cell_color)
	_emit_vertex(st, p_bot_b, uv, cell_color)

static func _emit_vertex(st: SurfaceTool, p: Vector3, uv: Vector2, col: Color) -> void:
	st.set_color(col)
	st.set_uv(uv)
	st.set_normal(Vector3.UP)
	st.add_vertex(p)

# =============================================================================
# grid_data_texture.gd — 六边形网格 → RGBA8 数据纹理  (Godot 4.3+)
# -----------------------------------------------------------------------------
# 作用：把 40×30 六边形网格的逻辑状态烘焙成一张 ImageTexture，供
#       terrain_hex / water_hex / prop_fog_fade 三个 shader 共享采样。
#
# 数据纹理契约（与设计圣经 §3.4 / §6 完全一致）：
#   R 通道 (0..7)   = 地形类型索引（0=平原 1=谷地 2=丘陵 3=山地 4=河流
#                     5=雪顶 6=沙漠 7=预留）
#   G 通道 (0/128/255) = 迷雾三态 (0=未探索 128=已探索记忆态 255=当前可见)
#   B 通道 (0..255) = 领土归属索引（0=无主 1..N=文明）
#   A 通道位运算      = 变化遮罩 bit0=河流边 bit1=道路边 bit2=可到达位
#
# 关键设计：CPU 每回合只更新这张贴图（一次 small write），GPU 端完成
#           所有视觉判定（地形混合/迷雾/边界/云影/可达高亮）——整张地图
#           地形恒定 1 个 draw call。
# =============================================================================

class_name HexGridDataTexture
extends Node

const TERRAIN_PLAINS : int = 0
const TERRAIN_VALLEY : int = 1
const TERRAIN_HILLS  : int = 2
const TERRAIN_MOUNTAIN : int = 3
const TERRAIN_RIVER  : int = 4
const TERRAIN_SNOW   : int = 5
const TERRAIN_DESERT : int = 6

const FOG_UNEXPLORED : int = 0
const FOG_EXPLORED   : int = 128
const FOG_VISIBLE    : int = 255

# 河流/道路/可达位 掩码（A 通道位）
const MASK_RIVER_BIT  : int = 1
const MASK_ROAD_BIT   : int = 2
const MASK_REACH_BIT  : int = 4

@export var grid_width : int = 40
@export var grid_height : int = 30

var _image : Image
var _texture : ImageTexture
# 每格独立 state（CPU 端操作），上传时合成到 _image
var _terrain : PackedByteArray
var _fog     : PackedByteArray
var _owner   : PackedByteArray
var _mask    : PackedByteArray
var _dirty   : bool = true

func _init(w: int = 40, h: int = 30) -> void:
	grid_width = w
	grid_height = h
	var n : int = w * h
	_terrain.resize(n); _fog.resize(n); _owner.resize(n); _mask.resize(n)
	# 全部初始化为：平原 / 未探索 / 无主 / 无遮罩
	for i in range(n):
		_terrain[i] = TERRAIN_PLAINS
		_fog[i]     = FOG_UNEXPLORED
		_owner[i]   = 0
		_mask[i]    = 0
	_image = Image.create(w, h, false, Image.FORMAT_RGBA8)
	_rebuild_image()

# ------------------------------------------------------------------ 写入 API

func set_terrain(x: int, y: int, t: int) -> void:
	_terrain[_idx(x, y)] = t
	_dirty = true

func set_fog(x: int, y: int, f: int) -> void:
	_fog[_idx(x, y)] = f
	_dirty = true

func set_owner(x: int, y: int, civ: int) -> void:
	_owner[_idx(x, y)] = civ
	_dirty = true

func set_mask_bit(x: int, y: int, bit: int, on: bool) -> void:
	var i : int = _idx(x, y)
	if on:
		_mask[i] |= bit
	else:
		_mask[i] &= ~bit
	_dirty = true

# 选中单位时把可达范围统一置位（A bit2），由逻辑层调用
func mark_reachable(cells: Array) -> void:
	for c in cells:
		set_mask_bit(c.x, c.y, MASK_REACH_BIT, true)

func clear_reachable() -> void:
	for i in range(_mask.size()):
		_mask[i] &= ~MASK_REACH_BIT
	_dirty = true

# ------------------------------------------------------------------ 装载

# 从数据数组装载：[ { "x": int, "y": int, "terrain": String, "owner": int,
#                       "fog": int, "river_edge": bool, "road_edge": bool } ]
# 地图生成器（maps/gen_luoyang_map.py）输出的 JSON 经转换后喂入此函数。
# 注意：本会话中 maps/ 目录丢失，转换脚本待补；以下是 schema 规约的最小实现。
func load_from_cells(cells: Array) -> void:
	var TERR_MAP : Dictionary = {
		"P": TERRAIN_PLAINS, "V": TERRAIN_VALLEY, "H": TERRAIN_HILLS,
		"M": TERRAIN_MOUNTAIN, "R": TERRAIN_RIVER,
		"S": TERRAIN_SNOW, "D": TERRAIN_DESERT,
	}
	for c in cells:
		var x : int = c.get("x", -1)
		var y : int = c.get("y", -1)
		if x < 0 or y < 0 or x >= grid_width or y >= grid_height:
			continue
		var tname : String = c.get("terrain", "P")
		_terrain[_idx(x, y)] = TERR_MAP.get(tname, TERRAIN_PLAINS)
		_fog[_idx(x, y)]     = c.get("fog", FOG_VISIBLE)
		_owner[_idx(x, y)]   = c.get("owner", 0)
		var mask : int = 0
		if c.get("river_edge", false): mask |= MASK_RIVER_BIT
		if c.get("road_edge", false):  mask |= MASK_ROAD_BIT
		_mask[_idx(x, y)] = mask
	_dirty = true

# 内置测试网格：洛阳轮廓的极简占位，用于在没拿到真实数据前调试 shader。
# 返回的 PackedByteArray 与 load_from_cells 接受的 dict 数组等价。
func make_test_grid() -> Array:
	var cells : Array = []
	for y in range(grid_height):
		for x in range(grid_width):
			var t : String = "P"
			# 中心区域模拟洛阳
			var cx : int = grid_width / 2
			var cy : int = grid_height / 2
			var dx : int = abs(x - cx)
			var dy : int = abs(y - cy)
			if dx + dy <= 1:
				t = "V"  # 谷地（城址）
			elif dx + dy == 2 and (x == cx or y == cy):
				t = "R"  # 河流穿城
			elif (x < 8 and y < 8) or (x + y < 6):
				t = "M"  # 西北山地
			elif dx + dy in [3, 4]:
				t = "H"  # 丘陵带
			cells.append({
				"x": x, "y": y, "terrain": t,
				"fog": FOG_VISIBLE if (dx + dy) <= 6 else (FOG_EXPLORED if (dx + dy) <= 10 else FOG_UNEXPLORED),
				"owner": 1 if dx + dy <= 4 else 0,
				"river_edge": t == "R",
				"road_edge": (x + y) % 7 == 0,
			})
	return cells

# ------------------------------------------------------------------ 渲染

func get_texture() -> ImageTexture:
	if _dirty:
		_rebuild_image()
		_dirty = false
		_texture = ImageTexture.create_from_image(_image)
	return _texture

# 强制下一帧重传纹理（用于外部逻辑每回合统一刷一次）
func flush() -> void:
	get_texture()

func _rebuild_image() -> void:
	for y in range(grid_height):
		for x in range(grid_width):
			var i : int = _idx(x, y)
			_image.set_pixel(x, y, Color(
				_terrain[i] / 255.0,
				_fog[i] / 255.0,
				_owner[i] / 255.0,
				_mask[i] / 255.0
			))

func _idx(x: int, y: int) -> int:
	return y * grid_width + x

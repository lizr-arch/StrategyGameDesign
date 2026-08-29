---
title: M1 工具集 (M1 Tooling)
category: tools
version: v1.0.0
updated: 2026-08-29
---

# M1 工具集 (M1 Tooling)

把[设计圣经](../civ5_style_art_tech_design.md)里的"数据纹理契约"与"合并地形 mesh"在 Godot 4 中落地的最小可用工具骨架。M1 原型期（2 周）直接基于这套工具搭场景。

## 文件清单

| 文件 | 用途 |
| :--- | :--- |
| `grid_data_texture.gd` | `HexGridDataTexture` 类——管理 40×30 RGBA8 数据纹理，暴露 `set_terrain / set_fog / set_owner / set_mask_bit / mark_reachable` 等写入 API 与 `get_texture / flush` 渲染 API |
| `hex_terrain_mesh.gd` | `HexTerrainMeshBuilder` 静态类——从 heightmap 一次性烘焙整张地图的 `ArrayMesh`（含顶面 + 邻接悬崖侧壁），每顶点 COLOR.rg 写入格子在数据纹理中的归一化坐标 |

## 5 行快速上手

```gdscript
# 1. 实例化数据纹理
var grid := HexGridDataTexture.new(40, 30)

# 2. 装载或填测试数据（见下方"数据格式"小节）
grid.load_from_cells(grid.make_test_grid())   # 没拿到真数据时用 stub

# 3. 烘焙地形 Mesh
var terrain := HexTerrainMeshBuilder.build_terrain_mesh(
    40, 30, grid._terrain, 1.0
)

# 4. 挂上 MeshInstance3D + 地形 shader 材质
var mi := MeshInstance3D.new()
mi.mesh = terrain
var mat := ShaderMaterial.new()
mat.shader = load("res://original_designs/05_technical_art/shaders/terrain_hex.gdshader")
mat.set_shader_parameter("grid_data", grid.get_texture())
mi.material_override = mat
add_child(mi)

# 5. 每回合改迷雾/领土后调用 grid.flush() 即可
```

## 数据格式（load_from_cells 输入契约）

```json
[
  { "x": 12, "y": 8, "terrain": "P", "fog": 255, "owner": 1,
    "river_edge": false, "road_edge": true },
  ...
]
```

| 字段 | 类型 | 含义 |
| :--- | :--- | :--- |
| `x`, `y` | int | 格子坐标（0..39, 0..29） |
| `terrain` | str | `P`=平原 / `V`=谷地 / `H`=丘陵 / `M`=山地 / `R`=河流 / `S`=雪顶 / `D`=沙漠 |
| `fog` | int | 0=未探索 / 128=已探索 / 255=可见 |
| `owner` | int | 0=无主, 1..N=文明索引 |
| `river_edge` | bool | 该格是否贴河岸（驱动水体岸线泡沫） |
| `road_edge` | bool | 该格是否贴道路（驱动道路 shader） |

## 注意事项

- **`.gd` 是 GDScript 文件**——Godot 4.3+ 打开工程后会自动识别 `class_name`，在编辑器里有完整代码补全。
- 真实地图数据走 `maps/gen_luoyang_map.py` 生成 JSON（当前会话中 `maps/` 目录意外丢失，恢复后用一段 5 行 JSON-to-cells 转换器把数据喂入 `load_from_cells`）。
- stub 网格（`make_test_grid`）画出的是洛阳轮廓的极简占位——能用，但别拿去做截图验收。
- 悬崖侧壁只生成高度差 > `STEP_THRESHOLD` 的邻接；微抖动不会产生海量薄壁。
- `COLOR.rg` 在 Godot 4 的 vertex color 中是 8-bit 量化（256 阶），对 40×30 网格精度足够；如果未来扩到 256×192 才需要切到 16-bit pack。

## 相关文档

- [文明5风格技术美术设计圣经 §3.4 数据纹理契约](../civ5_style_art_tech_design.md)
- [工坊 README](../README.md)

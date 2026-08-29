---
title: 技术美术工坊 (Technical Art Workshop)
category: architecture
version: v1.0.0
updated: 2026-08-29
---

# 技术美术工坊 (Technical Art Workshop)

《Project Chronos》美术与开发之间的桥梁层：风格解构、渲染架构、shader 实现、资产预算与管线规范的唯一权威来源。

## 目录内容

| 文件 | 说明 |
| :--- | :--- |
| [civ5_style_art_tech_design.md](civ5_style_art_tech_design.md) | 技术美术设计圣经：文明5 风格解构 → Godot 4 渲染架构 → 各系统效果设计 → 资产预算 → 管线规范 → 里程碑 |
| `shaders/terrain_hex.gdshader` | 六边形地形超级 shader（贴图混合 + 三态迷雾 + 领土边界 + 云影，单 draw call） |
| `shaders/water_hex.gdshader` | 水体 shader（深度渐变 + 岸线泡沫 + 流动法线） |
| `shaders/unit_selection.gdshader` | 单位选圈 shader（旋转双环 + 呼吸光晕，instance uniform 驱动） |
| `shaders/prop_fog_fade.gdshader` | 装饰物迷雾淡出 shader（记忆态压暗淡出，避免"黑纱立树"） |
| `tools/` | M1 工具骨架：`grid_data_texture.gd`（数据纹理管理类）+ `hex_terrain_mesh.gd`（合并地形 Mesh 构建器）+ `README.md`（5 行接入指南与 JSON 数据契约） |
| `reference/` | AI 风格参考图：**v3 终极版**（双河汇流 + 土黄黄河定调）/ v2 单河色板 / v1 蓝绿草稿 |

## 核心架构一句话

游戏逻辑每回合把网格状态写入一张 40×30 的 **RGBA8 数据纹理**（R=地形类型，G=迷雾三态，B=领土归属，A=河流/道路/可达位），单个合并地形 Mesh + 一个超级 shader 在 GPU 端完成全部视觉判定——**整张地图地形恒定 1 个 draw call**。

## 使用方式

1. 先读设计圣经，理解数据纹理契约与调色参数；
2. 浏览 `reference/` 下风格参考图（**v3 为定稿**），与美术组对齐色板与场景构成；
3. 按 `tools/README.md` 接入 `HexGridDataTexture` + `HexTerrainMeshBuilder`，把 `shaders/*.gdshader` 拖入 Godot 4.3+ 项目；
4. 资产制作前先查阅圣经 §11 预算表与 §12 管线规范——**先看预算再建模**。

## 风格参考图交接说明（v3 / v2 / v1）

- **v3 (`Top_down_strategy_game_screens_2026-08-29T06-45-31.png`)** ⭐ **定稿版**：双河汇流（右侧土黄黄河 + 左侧清流洛水）+ 洛阳城坐落汇流处 + 关隘在左上山脊，色板与 v2 一致。**直接用此图作为美术组定调基线**。
- **v2 (`Top_down_strategy_game_screens_2026-08-29T06-44-14.png`)**：单大河构图气势版——黄河土黄正确，色板定调备查。
- **v1 (`Top_down_strategy_game_screens_2026-08-29T06-42-55.png`)**：双河汇流草稿——黄河被渲成蓝绿色（色板错），仅作废稿留档。
- 三张图右下角均有 ImageGen 平台水印，正式分发给美术组前裁剪右下角即可。

<!-- TODO: maps/ 目录在本会话中意外丢失（gen_luoyang_map.py 与 luoyang_hexmap.json 不在），恢复后回填 tools/README.md 里的"真实数据装载"小节。 -->

## 相关文档

- [文明5风格技术美术设计圣经](civ5_style_art_tech_design.md)
- [M1 工具集接入指南](tools/README.md)
- [模块化机制设计指南](../02_mechanics_architecture/modular_systems_guide.md)
- [自研设计工坊说明](../README.md)

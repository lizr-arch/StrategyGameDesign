---
title: 文档整理与写作规范
category: standard
version: v1.0.0
updated: 2026-08-29
---

# 文档整理与写作规范 (Documentation Standard)

本规范定义仓库内所有 Markdown 文档的**元信息格式、命名规则、目录职责与交叉引用规则**。目标：任何一个新访客（或半年后的你自己）都能在 30 秒内定位到所需文档，并判断它是否可信、是否过时。

---

## 一、目录职责划分 (Directory Taxonomy)

| 目录 | 职责 | 内容形态 |
| :--- | :--- | :--- |
| `/`（根） | 仓库门面与导航 | `README.md` + 门户 `index.html` |
| `analysis/` | 行业经典游戏逆向解构 | 每个游戏一个子目录，含 `index.html` + `data/*.json` |
| `original_designs/` | 自研设计工坊 | 按编号目录分层：`01_GDD` / `02_机制架构` / `03_原型工具` / `04_历史原型` |
| `docs/` | 方法论、规范等跨模块知识沉淀 | 单主题单文件，`snake_case.md` |
| `maps/` | 地图生成器与地理数据 | `gen_*.py` 脚本 + 输出数据 + `README.md` 说明 |

**规则**：
- 根目录只允许 `README.md`、门户 HTML 与历史遗留的重定向桩（须注释说明去向）。
- 新增顶层目录必须先在本表登记职责，再动手建目录。

---

## 二、元信息头 (Front-Matter Standard)

所有 `docs/`、`original_designs/`、`maps/` 下的 `.md` 文件，开头必须携带 YAML 元信息块：

```yaml
---
title: 文档中文标题 (English Title)
category: methodology | gdd | architecture | archetypes | research | tools | standard | map
version: v1.0.0
updated: YYYY-MM-DD
---
```

| 字段 | 必填 | 说明 |
| :--- | :--- | :--- |
| `title` | ✅ | 中英双语标题，与正文一级标题一致 |
| `category` | ✅ | 固定枚举值：`methodology` / `gdd` / `architecture` / `archetypes` / `research` / `tools` / `standard` / `map`，用于自动索引与检索 |
| `version` | ✅ | 语义化版本：结构变更升次版本，笔误修正升修订号 |
| `updated` | ✅ | 最后一次实质修改日期（格式修正不算） |

---

## 三、命名规则 (Naming Conventions)

- **目录**：`小写snake_case` 或 `两位数字_中文语义`（如 `01_game_design_documents/`，自研设计工坊专用分层目录）。
- **文件**：`snake_case.md`，英文语义命名；GDD 正式策划案以项目代号开头（如 `chronos_gdd_v1.md`）。
- **数据**：`<主题>_<粒度>.json`（如 `eu4_daily.json`、`civ_daily.json`）。
- **禁止**：空格、中文文件名、`最终版`/`新版`/`copy` 后缀。

---

## 四、交叉引用规则 (Cross-Reference Rules)

- 每篇文档结尾设 **「相关文档」** 小节，链接 2–4 篇强相关文档（使用仓库相对路径）。
- 正文引用另一篇文档的核心概念时，**首次出现处**内联链接，结尾不必重复。
- 逆向分析（`analysis/`）与自研设计（`original_designs/`）之间的映射关系必须双向标注——例如 EU4 贸易 DAG 的逆向结论应被 `modular_systems_guide.md` 引用。

---

## 五、内容完整度标注 (Completeness Markers)

文档存在已知缺口时，必须在**显眼位置**（正文首段或对应小节）使用统一标记：

| 标记 | 含义 |
| :--- | :--- |
| `<!-- TODO: 缺口描述 -->` | 计划补充的内容 |
| `<!-- STUB: 占位说明 -->` | 结构占位，内容未写 |

禁止"索引表列了 6 项、正文只拆解 2 项"却不加说明——这正是本规范诞生的直接原因。

---

## 六、README 同步义务

根 `README.md` 的目录树是**唯一权威导航**。任何文件/目录的新增、改名、删除，必须在同一次提交中同步更新目录树与在线演示链接，两者不一致视为 bug。

---

## 相关文档

- [策略游戏设计方法论](../docs/strategy_game_methodology.md)
- [自研设计工坊说明](../original_designs/README.md)
- [根 README 目录树](../README.md)

# Strategy Game Design & Algorithmic Reverse-Engineering Hub
### 大战略与 4X 策略游戏底层机制逆向、历史制度映射与自研设计架构中心

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=flat-square&logo=github)](https://lizr-arch.github.io/StrategyGameDesign/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

本项目是一个专注于**深度策略游戏（Grand Strategy / 4X / Turn-based Tactics）底层机制逆向、算法数学建模、前 30 回合/天博弈分析以及原创策略游戏方案与架构设计**的综合性开源知识库与工程中枢。

---

## 🌐 在线体验与实时演算沙盘 (Live Demos)

- 🌟 **[策略游戏设计与分析统一门户总站 (Portal Hub)](https://lizr-arch.github.io/StrategyGameDesign/)**
- 👑 **[《欧陆风云4》（EU4）底层算法全景库与 6 大交互演算沙盘](https://lizr-arch.github.io/StrategyGameDesign/analysis/eu4/index.html)**
- ⚔️ **[跨时代大战略前 30 天/回合 玩家 vs AI 博弈 & 冷兵器 MOD 全景看板](https://lizr-arch.github.io/StrategyGameDesign/analysis/early_game_meta/index.html)**
- 🧪 **[自研策略游戏战术伤害与士气双轨衰减原型工作台](https://lizr-arch.github.io/StrategyGameDesign/original_designs/03_prototypes_and_tools/index.html)**

---

## 📂 仓库模块与目录结构

```text
StrategyGameDesign/
├── index.html                               # 🌟 统一门户总站 / Portal Hub
├── README.md                                # 📖 仓库总说明文档
├── .gitignore
│
├── analysis/                                # 🔍 行业经典策略游戏深度逆向与机制解构库
│   ├── eu4/                                 # 《欧陆风云4》（Clausewitz Engine）底层算法与沙盘系统
│   │   ├── index.html                       # EU4 算法与沙盘单页主站
│   │   ├── app.js                           # 6 大实时演算模拟器逻辑脚本
│   │   ├── data_payload.js                  # 前端数据载荷
│   │   └── data/                            # 21 项完整机制 JSON 数据库
│   │       ├── eu4_mechanisms_data.json     # 全量机制标准数据库 (LaTeX/伪代码/历史原型)
│   │       ├── data_tactical.json           # 军事战术类算法
│   │       ├── data_economy.json            # 经济贸易类算法
│   │       ├── data_diplomatic.json         # 外交联统类算法
│   │       └── data_ai.json                 # AI 决策与行为树数据
│   │
│   └── early_game_meta/                     # 跨时代前 30 回合/天 玩家vsAI博弈 & 冷兵器MOD看板
│       ├── index.html                       # 全景看板单页应用
│       └── data/                            # 逐日/逐回全量数据集 (文明VI/EU4/HoI2/春秋三国/罗马中世纪)
│           ├── civ_daily.json               # 文明 VI 30 回合数据与独立收益
│           ├── eu4_daily.json               # EU4 31 天数据与独立收益
│           ├── hoi2_daily.json              # HoI2 30 天数据与独立收益
│           ├── china_cold_daily.json        # 🇨🇳 国内冷兵器 MOD 30 节点数据与收益
│           └── foreign_cold_daily.json      # 🌍 国外冷兵器 MOD 30 节点数据与收益
│
├── original_designs/                        # 💡 自研策略游戏方案、GDD 与系统架构设计工坊
│   ├── README.md                            # 自研设计工作流与设计标准规范
│   ├── 01_game_design_documents/            # 📄 核心策划案 (GDD)
│   │   ├── GDD_TEMPLATE.md                  # 策略游戏标准化完整策划案模板
│   │   └── chronos_gdd_v1.md                # 《Project Chronos》第一期策划案 v0.1（调研决策落地）
│   ├── 02_mechanics_architecture/           # ⚙️ 核心机制与系统架构深度拆解
│   │   └── modular_systems_guide.md         # 模块化机制设计指南 (时钟/经济/战斗/AI)
│   ├── 03_prototypes_and_tools/             # 🧪 交互原型与数值平衡演练沙盘
│   │   └── index.html                       # 自研机制在线原型与数值平衡工作台
│   └── 04_historical_archetypes/            # 🏛️ 历史制度原型与机制映射灵感库
│       └── archetypes_catalog.md            # 经典历史制度转数值机制分类典籍
│   └── 05_technical_art/                    # 🎨 技术美术工坊：美术与开发的桥梁层
│       ├── README.md                        # 工坊导航与核心架构说明
│       ├── civ5_style_art_tech_design.md    # 文明5风格技术美术设计圣经 (Godot 4)
│       ├── shaders/                         # Godot 4 核心shader (地形/水体/选圈/迷雾淡出)
│       ├── tools/                           # M1 工具骨架 (数据纹理类+合并地形Mesh构建器)
│       └── reference/                       # AI 风格参考图 v3 定稿 + v2/v1 留档
│
└── docs/                                    # 📚 策略游戏设计方法论与理论沉淀
    ├── DOCUMENTATION_STANDARD.md            # 文档整理与写作规范（front-matter/命名/交叉引用）
    ├── strategy_game_methodology.md         # 策略游戏核心心流、信息论与博弈论哲学
    ├── chronos_research_analysis.md         # 《Project Chronos》玩法框架与玩家调研分析
    └── chronos_research_analysis.html       # 调研分析 HTML 浏览版（自包含单页）
```

---

## 🛠️ 技术栈与设计标准

- **前端表现层**：纯原生 HTML5 + Tailwind CSS + FontAwesome 6 + KaTeX (数学公式排版) + Chart.js (交互图表渲染)，零复杂构建依赖，极速即开即用。
- **数据层**：标准 JSON 格式，严格定义字段结构（`algorithm_definition`, `latex_formula`, `cpp_pseudocode`, `historical_mapping`, `early_game_roi`）。
- **部署模式**：GitHub Pages 静态托管，自动化无缝部署。

---

## 📜 贡献与演进路线 (Roadmap)

1. [x] 《欧陆风云4》21 项核心底层算法逆向与 6 大实时沙盘构建
2. [x] 跨时代前 30 回合/天 玩家 vs AI 博弈全景看板（文明/EU4/HoI2/冷兵器MOD）
3. [x] 仓库重构为大战略设计中枢，建立自研 GDD 模板与模块化架构指南
4. [ ] 《维多利亚 3》POPs 职业与动态市场供需网络算法逆向
5. [ ] 《钢铁雄心 4》工业产能分配与前线后勤中继损耗模型逆向
6. [ ] 自研大战略项目《Project Chronos》第一期 GDD 策划案与原型 Demo

# Original Strategy Game Design & Architecture Hub
### 自研策略类游戏方案、策划案 (GDD) 与系统架构设计工坊

本目录是本仓库的核心原创板块，用于存放**自研大战略（Grand Strategy）、4X 策略、回合制战术及历史模拟类游戏**的策划案、数值模型、底层机制设计文档以及交互式演算工具。

---

## 📂 目录架构与设计模块

```bash
original_designs/
├── 01_game_design_documents/     # 📄 核心策划案 (GDD - Game Design Documents)
│   └── GDD_TEMPLATE.md           # 策略游戏标准化完整策划案模板 (包含核心心流、机制定义、UI规范)
│
├── 02_mechanics_architecture/    # ⚙️ 核心机制与系统架构深度拆解
│   └── modular_systems_guide.md  # 模块化机制设计指南 (时钟系统、人口/经济流动、战斗解算、AI状态机)
│
├── 03_prototypes_and_tools/      # 🧪 交互原型与数值平衡演练沙盘
│   └── index.html                # 自研游戏机制在线即时演算工作台 (战斗曲线、经济复利与围城概率验证)
│
└── 04_historical_archetypes/     # 🏛️ 历史制度原型与机制映射灵感库
    └── archetypes_catalog.md     # 经典历史制度（中外封建、军功爵、重商主义、朝贡体系）转数值机制分类典籍
```

---

## 🎯 自研策略游戏设计三大黄金法则

1. **决策密度与信息不对称（Decision Density & Information Horizon）**：
   - 优秀的策略游戏不依赖操作 APM，而依赖“有限信息下的风险收益权衡”。
   - 每一回合/每一天的操作必须具备清晰的**机会成本（Opportunity Cost）**。

2. **正负反馈飞轮的动态平衡（Feedback Loops Balancing）**：
   - **正反馈**：胜利带来更多资源（如吞并领土增加税收），驱动扩张快感。
   - **负反馈**：过度扩张必须伴随阻力（如通讯效率惩罚、包围网 AE 威胁、阶层忠诚度反噬），防止过早滚雪球进入垃圾时间。

3. **历史真实感与机制抽象的统一（Historical Verisimilitude vs Game Abstraction）**：
   - 机制应当是历史现实的数学抽象（如将中世纪封建采邑抽象为附庸仆从网络，将近代常备军转型抽象为专业度与国库赤字）。

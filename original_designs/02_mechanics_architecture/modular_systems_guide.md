# 策略游戏底层模块化架构设计指南 (Modular Systems Guide)

在自研策略游戏（Grand Strategy / 4X / Turn-based Tactics）开发中，将庞大复杂的系统拆解为**松耦合、高性能、数据驱动的模块**是确保游戏可扩展性与易调试性的核心。

---

## 一、系统模块拆解总览 (System Decomposition)

```text
┌─────────────────────────────────────────────────────────────┐
│                    游戏状态调度引擎 (Core Engine)               │
│         - 日历时钟 (Tick Manager)  - 随机数种子 (RNG)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  地理与省份  │        │  人口与经济  │        │  军事与战役  │
│  Topology    │        │  Pop/Economy │        │  Combat Core │
└──────┬───────┘        └──────┬───────┘        └──────┬───────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  外交与地缘政治网络 (Geopolitics)             │
│        - 关系矩阵  - 侵略扩张(AE)  - 宗藩同盟关系树          │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI 效用决策与有限状态机 (AI Brain)          │
│            - 威胁评估  - 目标排序  - 战术兵团调度            │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、六大核心模块设计规范

### 1. 时序心跳调度器 (Tick & Pulse Scheduler)
- **日频 Tick (Daily Tick)**：军队移动插值、围城计时器计数、战役轮次解算、间谍点数累加。
- **月频 Pulse (Monthly Pulse)**：税收与生产结算、军费与顾问开销扣除、人力池增量补充、外交关系自然衰减、士气恢复。
- **年频 Epoch (Annual Epoch)**：科技点数惩罚步进、君主寿元与健康判定、阶层权力再平衡。

### 2. 战役解算引擎 (Deterministic / Stochastic Combat)
- **双轨解算模型**：
  1. **实体伤亡 (Physical Casualties)**：直接削减兵力数值与预备役人力。
  2. **组织度/士气损伤 (Morale / Organization Loss)**：决定部队是否崩溃溃逃（Shattered Retreat）。
- **宽战面展开算法**：
  $$\text{CombatWidth} = \text{BaseWidth} \times (1 + \text{TechBonus}) \times \text{TerrainModifier}$$

### 3. 贸易与物流有向图 (Trade & Logistics DAG)
- 贸易网络天然适合建模为**有向无环图（Directed Acyclic Graph, DAG）**。
- 节点为贸易中心/集散省份，连边为贸易流向。
- 每个国家的贸易力量（Trade Power）决定其在节点处分流提取（Collect）还是向下游推流（Steer）的权重比例。

### 4. 侵略扩张与博弈制衡网络 (AE & Coalition Mechanics)
- 吞并领土产生的威胁度公式：
  $$\text{Threat} = \text{BaseDev} \times \text{DistanceDecay} \times \text{ReligionModifier} \times \text{CultureGroupModifier}$$
- 当某势力对周边 4 个以上势力的 Threat 超过阈值（如 50 点）且无休战协议时，自动激活反国家同盟状态机。

### 5. 阶层与封建采邑模型 (Estates & Decentralized Fiefs)
- **王权与自治度对立统一**：
  $$\text{ProvinceYield} = \text{BaseYield} \times (1 - \text{Autonomy})$$
- 允许玩家在中央集权（高直辖产出但高维稳成本）与封建分封（低直辖收益但享有附庸仆从军）之间自由切换。

### 6. AI 效用估值架构 (Utility-Based AI Architecture)
- AI 绝不硬编码脚本，而是基于效用加权（Utility Weighting）做出理性有限评估：
  $$U(\text{Action}) = \sum_{i=1}^n w_i \cdot f_i(\text{GameState})$$
- 引入**AI 人格偏好乘数**（如“军国主义狂人”、“重商主义守财奴”、“宗教狂热者”），赋予世界生动的历史多样性。

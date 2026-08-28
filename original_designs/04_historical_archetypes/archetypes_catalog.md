# 历史制度原型与策略机制映射典籍 (Historical Archetypes Catalog)

本典籍系统整理了世界历史上最具代表性的政治、军事、经济与社会制度原型，并提炼其在自研策略游戏中的**数学模型、变量定义与机制映射规则**。

---

## 目录索引 (Index of Archetypes)

| 制度名称 | 历史发源与纪元 | 核心机制特征 | 游戏设计映射 |
| :--- | :--- | :--- | :--- |
| **商鞅军功爵与编户齐民** | 战国秦（BC 356） | 废世卿世禄、按斩首授田、户籍联保 | 狂暴提升预备役上限与士气，但剥夺贵族阶层利益 |
| **欧洲封建采邑制** | 中世纪欧洲（AD 800–1400） | 附庸分封、采邑免税、自备铠甲战马征召 | 极低常备军维稳成本，但战时调度存在抗命与时延 |
| **罗马行省包税与奴隶庄园** | 罗马共和国/帝国（BC 200–AD 200） | 行省骑士包税、地中海粮食海运、矿山奴隶 | 奴隶零工资超额生产，但面临斯巴达克斯起义风险 |
| **威尼斯与热那亚海权重商** | 中世纪地中海（AD 1000–1500） | 贸易据点（Feitoria）、私掠舰队、国债银行 | 极高贸易力量引流，可用金币直接雇佣万国军团 |
| **游牧帝国大聚落与鸣镝射雕** | 亚欧大草原（BC 200–AD 1300） | 全民皆兵、游牧逐水草、焦土掠夺（Raze） | 战后直接拆毁省份（Raze）变现为君主点数与战备马匹 |
| **朝贡体系与宗藩册封** | 东亚华夏帝国（BC 200–AD 1840） | 羁縻统治、厚往薄来、方伯征伐大义 | 外交威望极高，附庸不占直辖槽，按年上缴奇珍异宝 |

---

## 经典机制量化原型拆解

### 1. 军功爵制（Meritocratic Aristocracy）
- **数学映射**：
  $$\text{ArmyMorale} = \text{Base} + 0.15 \times \text{MilitarizationRatio}$$
  $$\text{NobilityLoyalty} = \text{Base} - 0.20 \times \text{MeritReformLevel}$$
- **博弈权衡**：玩家必须在“强大的常备军战力”与“旧贵族阶层叛乱威胁”之间寻找动态平衡点。

### 2. 封建通讯效率（Communication Efficiency / CE）
- **数学映射**：
  $$\text{TravelDays} = \sum_{\text{path}} \frac{\text{Distance}}{\text{Speed}(\text{Infrastructure}, \text{Terrain})}$$
  $$\text{MinAutonomy} = \min\left(100\%, \frac{\text{TravelDays}}{30} \times 40\%\right)$$
- **博弈权衡**：偏远领土直辖收益归零，强迫玩家设立封建采邑（Fief）或修筑国家大道（Royal Road）。

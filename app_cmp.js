// Timeline Data and Charts for 30 Turns Comparison

const TIMELINE_DATA = {
  1: {
    civ: { p: "极限找平原丘陵(2粮2锤)+沿河坐城，市民锁最高产出，首发侦察兵/投石兵，科技点采矿或畜牧。", a: "初始自带3移民5勇士2弓手，就地无脑秒坐首府与2个分城，全图盲目散布勇士。" },
    eu4: { p: "Day 1 暂停！扒阶层+1君主点数与垄断特权换钱，雇3位1级顾问，关要塞降军费，派使节跨级拉大国盟友与造宣称。", a: "机械扫描同体量邻国互拉结盟，按国库慢速补兵，全开要塞导致财政负增长，无阶层特权规划。" },
    hoi2: { p: "1月1日必推滑条(鹰派/计划经济/常备军)，拉满消费品快速消不满至0%，科研团队秒指派基础机床与农业，解散老旧师省补给。", a: "严格按 .ai 脚本固定比例分 IC，大量建造低效民兵/卫戍部队，承受不满度产能损耗，研发不卡年份惩罚。" }
  },
  5: {
    civ: { p: "首都首个侦察兵完工，勇士探明周边地貌，锁定最近的城邦位置，侦察兵直奔外围探路。", a: "分城开始自发建造纪念碑或勇士，部队漫无目的地在地图边缘巡逻。" },
    eu4: { p: "外交官抵达目标强权，签署第一份战略同盟协议；在核心目标国建立第一阶段间谍网。", a: "向周边小国索要军事通行权，分散驻军导致补给消耗失衡。" },
    hoi2: { p: "不满度降为 0%，有效 IC 恢复至 100%；将所有闲置产能一键投入第一批连续工厂建造序列 (IC Whore)。", a: "继续按硬编码比例分配 IC 给海军/空军维护，工厂建造预算不足 15%。" }
  },
  10: {
    civ: { p: "侦察兵踩中首个村庄吃尤里卡；拦截敌方蛮族斥候视野，绝不让其感叹号回营；首发科技研发完成。", a: "数支勇士被野蛮人营地阻隔并陷入拉锯战；科技树盲目多头并进。" },
    eu4: { p: "12月11日解禁日！第一时间向核心破局目标宣战(如附庸拜占庭)；招募自由佣兵团(Free Company)直扑敌方首都。", a: "若满足意愿则按任务树宣战，常因未带足攻城炮兵/兵力在要塞前陷入漫长对峙。" },
    hoi2: { p: "基础机床研发进入中后期；第一批工业原材料(橡胶/稀金)通过对苏/美贸易完成长协锁定。", a: "资源经常面临单项短缺警报，被动接受高溢价的散单贸易。" }
  },
  18: {
    civ: { p: "首都人口达 3，手动切高锤地块，启动第一位开拓者(移民)建造；发万神殿首选《宗教移民》或《苍天神》。", a: "已经开始建造第 4-5 个移民；集结 5 勇士逼近玩家边境企图早战施压。" },
    eu4: { p: "首场决战歼灭敌主力，围陷敌方首都城堡；向市民阶层借 1% 低息贷款维持战时佣兵赤字开销。", a: "在围城时承受 5% 月度非战斗损耗；国库耗尽后开始盲目向银行借 4% 高息贷款。" },
    hoi2: { p: "第一批工厂建造进度达 80%；西班牙内战爆发，玩家立即选派志愿物资换取常备军滑条偏置。", a: "走固定脚本选项介入内战，由于未消不满导致工业动员严重滞后。" }
  },
  25: {
    civ: { p: "开拓者在勇士护航下抵达战略咽喉点坐下二城；将多余奢侈品高价卖给 AI 换现金买弓手；好感转正后秒签宣布友谊。", a: "发动远古突袭战争，残血勇士硬撞玩家山地弓手防线白送经验；乱挤地块造成忠诚度暴跌。" },
    eu4: { p: "达成 100% 战争分数全胜和约(割地+赔款+全额现金)；立刻启动造核心与降自治；派外交官拉高周边好感防包围网。", a: "割取碎片省份或因未算清神罗/同宗教 AE 加成而引发多国反国家包围网。" },
    hoi2: { p: "第一轮工厂波次全部竣工，基础 IC 暴涨 20%+；正式启动《1939年型步兵师》与《CAS近距支援机》99轮流水线。", a: "继续零散建造过时的 1918/1936 年型步兵与民兵，部队编制混乱。" }
  },
  30: {
    civ: { p: "二城开始运转并规划首个学院/圣地(+3/+4邻接)；首批弓箭手升级就绪，彻底度过远古早战危险期。", a: "突袭失败后被动请求和解并割让金币；扩张停滞陷入战略被动。" },
    eu4: { p: "核心化完成，自治度平稳下降；存满君主点数等待 1450 年文艺复兴思潮秒点地爆种；首战红利彻底消化。", a: "核心化点数不足导致过度扩张叛军四起；点数满溢直接硬点超前科技造成严重浪费。" },
    hoi2: { p: "迎来德奥合并事件(白嫖部队与工业)；野战装甲军团编组完毕(纯3装甲+高技能将领)；为二战全面爆发储备巨额军备。", a: "部队编制混乱混编杂牌师；高级将领闲置或乱配；升级预算长期赤字。" }
  }
};

function updateTimeline(val) {
  document.getElementById("slider-val-badge").innerText = "第 " + val + " 回合 / 月";
  document.querySelectorAll(".turn-display").forEach(el => el.innerText = val);

  const keys = [1, 5, 10, 18, 25, 30];
  let closest = keys[0];
  for (let k of keys) {
    if (Math.abs(val - k) <= Math.abs(val - closest)) {
      closest = k;
    }
  }

  const data = TIMELINE_DATA[closest];
  document.getElementById("civ-snap-player").innerHTML = "<span class='text-emerald-400 font-semibold'>玩家:</span> " + data.civ.p;
  document.getElementById("civ-snap-ai").innerHTML = "<span class='text-rose-400 font-semibold'>神级 AI:</span> " + data.civ.a;

  document.getElementById("eu4-snap-player").innerHTML = "<span class='text-emerald-400 font-semibold'>玩家:</span> " + data.eu4.p;
  document.getElementById("eu4-snap-ai").innerHTML = "<span class='text-rose-400 font-semibold'>引擎 AI:</span> " + data.eu4.a;

  document.getElementById("hoi2-snap-player").innerHTML = "<span class='text-emerald-400 font-semibold'>玩家:</span> " + data.hoi2.p;
  document.getElementById("hoi2-snap-ai").innerHTML = "<span class='text-rose-400 font-semibold'>脚本 AI:</span> " + data.hoi2.a;
}

function switchTab(tabId) {
  const tabs = ["dashboard", "civ", "eu4", "hoi2", "table"];
  tabs.forEach(t => {
    const view = document.getElementById("view-" + t);
    const btn = document.getElementById("tab-btn-" + t);
    if (t === tabId) {
      view.classList.remove("hidden");
      btn.className = "px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-brand-gold font-semibold border border-brand-gold/40 shadow-sm";
    } else {
      view.classList.add("hidden");
      btn.className = "px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const ctxRadar = document.getElementById("radarChart").getContext("2d");
  new Chart(ctxRadar, {
    type: "radar",
    data: {
      labels: ["长期复利规划", "极限微操套利", "早战决断破局", "地缘外交杠杆", "战略视野预判", "风险承受边界"],
      datasets: [
        {
          label: "人类高玩 (Human Expert)",
          data: [95, 98, 92, 90, 94, 96],
          backgroundColor: "rgba(212, 175, 55, 0.25)",
          borderColor: "#d4af37",
          pointBackgroundColor: "#d4af37",
          borderWidth: 2
        },
        {
          label: "游戏引擎 AI (Engine / Script AI)",
          data: [35, 40, 60, 45, 30, 25],
          backgroundColor: "rgba(244, 63, 94, 0.2)",
          borderColor: "#f43f5e",
          pointBackgroundColor: "#f43f5e",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: "#1f2937" },
          grid: { color: "#1f2937" },
          pointLabels: { color: "#94a3b8", font: { size: 10 } },
          ticks: { display: false, max: 100, min: 0 }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#cbd5e1", font: { size: 11 } }
        }
      }
    }
  });

  const ctxArea = document.getElementById("areaChart").getContext("2d");
  new Chart(ctxArea, {
    type: "line",
    data: {
      labels: ["T1", "T5", "T10", "T15", "T20", "T25", "T30"],
      datasets: [
        {
          label: "🔍 探索情报",
          data: [40, 35, 25, 15, 10, 5, 5],
          fill: true,
          backgroundColor: "rgba(212, 175, 55, 0.35)",
          borderColor: "#d4af37",
          tension: 0.3
        },
        {
          label: "🏗️ 内政基建 (IC/移民)",
          data: [35, 40, 35, 45, 50, 45, 40],
          fill: true,
          backgroundColor: "rgba(16, 185, 129, 0.35)",
          borderColor: "#10b981",
          tension: 0.3
        },
        {
          label: "⚔️ 军事征服 (早战/爆兵)",
          data: [5, 10, 25, 20, 25, 35, 40],
          fill: true,
          backgroundColor: "rgba(244, 63, 94, 0.35)",
          borderColor: "#f43f5e",
          tension: 0.3
        },
        {
          label: "🤝 外交地缘 (结盟/使节)",
          data: [15, 10, 10, 15, 10, 10, 10],
          fill: true,
          backgroundColor: "rgba(168, 85, 247, 0.35)",
          borderColor: "#a855f7",
          tension: 0.3
        },
        {
          label: "🔬 科技市政 (尤里卡/机床)",
          data: [5, 5, 5, 5, 5, 5, 5],
          fill: true,
          backgroundColor: "rgba(6, 182, 212, 0.35)",
          borderColor: "#06b6d4",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: "#1f2937" }, ticks: { color: "#94a3b8" } },
        y: {
          stacked: true,
          max: 100,
          grid: { color: "#1f2937" },
          ticks: { color: "#94a3b8", callback: v => v + "%" }
        }
      },
      plugins: {
        legend: {
          labels: { color: "#cbd5e1", font: { size: 10 } }
        }
      }
    }
  });
});

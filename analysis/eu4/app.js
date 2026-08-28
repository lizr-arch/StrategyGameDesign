// EU4 Clausewitz Architecture - Interactive Logic & Simulators

let currentCategoryFilter = "all";
let siegeCurrentProgress = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  renderMatrix();
  renderJSONView();
  initSimulators();
  renderMath();
});

function switchTab(tabId) {
  const tabs = ["knowledge", "simulators", "matrix", "json"];
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
  if (tabId === "knowledge" || tabId === "simulators") {
    setTimeout(renderMath, 50);
  }
}

function switchSimulator(simId) {
  document.querySelectorAll(".sim-panel").forEach(p => p.classList.add("hidden"));
  document.getElementById(simId).classList.remove("hidden");

  document.querySelectorAll(".sim-nav-btn").forEach(b => {
    b.className = "sim-nav-btn px-4 py-2 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800";
  });
  const activeBtn = document.getElementById("btn-" + simId);
  if (activeBtn) {
    activeBtn.className = "sim-nav-btn px-4 py-2 rounded-xl bg-brand-gold text-slate-950 font-bold border border-brand-gold";
  }
  setTimeout(renderMath, 50);
}

function setCategoryFilter(cat) {
  currentCategoryFilter = cat;
  document.querySelectorAll(".cat-pill").forEach(p => {
    p.className = "cat-pill px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800";
  });
  event.target.className = "cat-pill px-3 py-1.5 rounded-lg border bg-amber-500/20 text-brand-gold border-brand-gold/40 font-medium";
  renderCards();
}

function clearSearch() {
  document.getElementById("search-input").value = "";
  document.getElementById("clear-search-btn").classList.add("hidden");
  renderCards();
}

function renderCards() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  const logicType = document.getElementById("logic-filter").value;
  const container = document.getElementById("cards-container");
  
  const clearBtn = document.getElementById("clear-search-btn");
  if (query) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
  }

  const filtered = ALL_ALGORITHMS.filter(item => {
    if (currentCategoryFilter !== "all" && item.category !== currentCategoryFilter) return false;
    if (logicType !== "all" && item.logic_type !== logicType) return false;
    if (query) {
      const matchTitle = item.mechanism_name.toLowerCase().includes(query);
      const matchHistory = item.historical_archetype.event_or_concept.toLowerCase().includes(query) || item.historical_archetype.historical_context.toLowerCase().includes(query);
      const matchDesign = item.game_design_rationale.design_goal.toLowerCase().includes(query);
      const matchNotes = item.reverse_engineered_notes.toLowerCase().includes(query);
      const matchParams = item.key_parameters.some(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      return matchTitle || matchHistory || matchDesign || matchNotes || matchParams;
    }
    return true;
  });

  document.getElementById("results-count").innerText = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500"><i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-600"></i><p class="text-sm">未匹配到符合条件的机制词条，请调整搜索关键字或筛选条件</p></div>`;
    return;
  }

  const categoryBadges = {
    tactical_and_military: { label: "⚔️ 战术与陆战", color: "bg-red-950/60 text-red-400 border-red-800/50" },
    ai_decision_engine: { label: "🤖 AI 决策引擎", color: "bg-blue-950/60 text-blue-400 border-blue-800/50" },
    diplomatic_and_dynastic: { label: "👑 王朝与外交", color: "bg-amber-950/60 text-amber-400 border-amber-800/50" },
    macro_economy_and_trade: { label: "🚢 宏观经济与贸易", color: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50" }
  };

  container.innerHTML = filtered.map((item, idx) => {
    const catBadge = categoryBadges[item.category] || { label: item.category, color: "bg-slate-800 text-slate-300 border-slate-700" };
    
    return `
      <div class="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all gold-border-hover space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div class="space-y-1 flex-1 min-w-[280px]">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full border ` + catBadge.color + `">` + catBadge.label + `</span>
              <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400"><i class="fa-solid fa-code-branch text-amber-500/70 mr-1"></i> ` + item.logic_type + `</span>
              <span class="text-[11px] text-slate-500 font-mono"><i class="fa-solid fa-clock mr-1"></i> ` + item.historical_archetype.historical_period + `</span>
            </div>
            <h3 class="text-base sm:text-lg font-bold text-amber-200 font-serif pt-1">` + item.mechanism_name + `</h3>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <a href="` + item.source_url + `" target="_blank" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border border-slate-700" title="查看 Wiki"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            <button onclick="copyItemJSON(` + idx + `)" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border border-slate-700" title="复制 JSON"><i class="fa-regular fa-copy"></i></button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
          <div class="lg:col-span-6 space-y-3.5">
            <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
              <div class="font-semibold text-amber-300 flex items-center gap-1.5"><i class="fa-solid fa-landmark-dome text-amber-400"></i><span>历史原型与演变 (` + item.historical_archetype.event_or_concept + `)</span></div>
              <p class="text-slate-300 leading-relaxed">` + item.historical_archetype.historical_context + `</p>
            </div>
            <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
              <div class="font-semibold text-cyan-300 flex items-center gap-1.5"><i class="fa-solid fa-lightbulb text-cyan-400"></i><span>P 社设计初衷与抽象逻辑</span></div>
              <p class="text-slate-300 leading-relaxed"><strong class="text-slate-200">设计目标:</strong> ` + item.game_design_rationale.design_goal + `</p>
              <p class="text-slate-400 leading-relaxed mt-1"><strong class="text-slate-300">抽象方法:</strong> ` + item.game_design_rationale.abstraction_method + `</p>
            </div>
          </div>

          <div class="lg:col-span-6 space-y-3.5">
            <div class="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/20 space-y-2">
              <div class="font-semibold text-amber-400 flex items-center justify-between"><span class="flex items-center gap-1.5"><i class="fa-solid fa-calculator"></i> 数学公式与权重矩阵</span><span class="text-[10px] font-mono text-slate-500">LaTeX</span></div>
              <div class="text-slate-200 overflow-x-auto custom-scroll text-[11px] py-1 font-mono">` + item.math_formula_or_weights + `</div>
            </div>
            <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
              <div class="font-semibold text-rose-300 flex items-center gap-1.5"><i class="fa-solid fa-microchip text-rose-400"></i><span>Clausewitz 引擎逆向剖析</span></div>
              <p class="text-slate-300 leading-relaxed font-mono text-[11px]">` + item.reverse_engineered_notes + `</p>
            </div>
            <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
              <div class="font-semibold text-emerald-300 flex items-center gap-1.5"><i class="fa-solid fa-arrows-split-up-and-left text-emerald-400"></i><span>系统级蝴蝶效应</span></div>
              <p class="text-slate-400 leading-relaxed">` + item.causal_effect + `</p>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800/60">
          <div class="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><i class="fa-solid fa-table-list text-amber-500"></i> 关键参数与 Defines.lua 常量映射:</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">` + 
            item.key_parameters.map(p => `
              <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800/90 text-[11px]">
                <div class="font-mono font-semibold text-amber-300/90 truncate">` + p.name + `</div>
                <div class="text-slate-400 mt-0.5 text-[10px] line-clamp-2">` + p.description + `</div>
              </div>
            `).join("") + 
          `</div>
        </div>
      </div>
    `;
  }).join("");

  renderMath();
}

function renderMatrix() {
  const tbody = document.getElementById("matrix-table-body");
  tbody.innerHTML = ALL_ALGORITHMS.map(item => `
    <tr class="hover:bg-slate-900/60 transition-colors">
      <td class="py-3.5 px-4 font-semibold text-amber-200 whitespace-nowrap">
        ` + item.mechanism_name.split("(")[0] + `
        <div class="text-[10px] text-slate-500 font-mono mt-0.5">` + item.logic_type + `</div>
      </td>
      <td class="py-3.5 px-4 font-medium text-slate-300">` + item.historical_archetype.event_or_concept + `</td>
      <td class="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">` + item.historical_archetype.historical_period + `</td>
      <td class="py-3.5 px-4 text-slate-400 max-w-xs leading-relaxed">` + item.historical_archetype.historical_context.substring(0, 110) + `...</td>
      <td class="py-3.5 px-4 text-cyan-300/90 max-w-xs leading-relaxed">` + item.game_design_rationale.abstraction_method.substring(0, 110) + `...</td>
    </tr>
  `).join("");
}

function renderJSONView() {
  const pre = document.getElementById("json-pre");
  pre.textContent = JSON.stringify(RAW_DATABASE, null, 2);
}

function initSimulators() {
  calcCombat();
  calcSiege();
  calcPU();
  calcAE();
  calcTrade();
  calcAI();
}

function calcCombat() {
  const strength = parseFloat(document.getElementById("combat-strength").value) || 1000;
  const die = parseFloat(document.getElementById("combat-die").value) || 0;
  const leaderDiff = parseFloat(document.getElementById("combat-leader-diff").value) || 0;
  const pipDiff = parseFloat(document.getElementById("combat-pip-diff").value) || 0;
  const terrain = parseFloat(document.getElementById("combat-terrain").value) || 0;
  const techMod = parseFloat(document.getElementById("combat-tech-mod").value) || 1.0;
  const disc = (parseFloat(document.getElementById("combat-discipline").value) || 100) / 100;
  const tactics = parseFloat(document.getElementById("combat-tactics").value) || 1.0;
  const ca = (parseFloat(document.getElementById("combat-ability").value) || 0) / 100;
  const morale = parseFloat(document.getElementById("combat-morale").value) || 3.0;

  const effRoll = Math.max(0, Math.min(15, die + leaderDiff + pipDiff + terrain));
  const baseCas = 15 + 5 * effRoll;
  const cas = Math.round(baseCas * (strength / 1000) * techMod * (1 + ca) * (disc / tactics));
  const moraleLoss = (baseCas * (morale / 600) * (strength / 1000) * techMod * (1 + ca) * (disc / tactics)).toFixed(2);

  document.getElementById("out-combat-eff-roll").innerText = effRoll;
  document.getElementById("out-combat-base-cas").innerText = "基础伤亡: " + baseCas + " 人";
  document.getElementById("out-combat-casualties").innerText = cas;
  document.getElementById("out-combat-morale-dmg").innerText = moraleLoss;
  document.getElementById("out-combat-disc-ratio").innerText = (disc / tactics).toFixed(3);

  const stackwipeBanner = document.getElementById("stackwipe-banner");
  if (strength >= 10000 && cas > 300) {
    stackwipeBanner.className = "mt-3 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center gap-3";
    stackwipeBanner.innerHTML = `<i class="fa-solid fa-skull-crossbones text-rose-400 text-base"></i><div class="text-xs"><div class="font-semibold text-rose-300">极高歼灭威胁 (Stackwipe Risk)</div><div class="text-[11px] text-slate-400 mt-0.5">若敌军兵力少于 ` + Math.round(strength/10) + ` 且开战12天内士气清零，将直接瞬间全歼！</div></div>`;
  } else {
    stackwipeBanner.className = "mt-3 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-3";
    stackwipeBanner.innerHTML = `<i class="fa-solid fa-shield-virus text-emerald-400 text-base"></i><div class="text-xs"><div class="font-semibold text-emerald-300">常规战线消耗 (Standard Line Combat)</div><div class="text-[11px] text-slate-400 mt-0.5">未触发 10:1 绝对碾压比，按正常阶段轮换承受伤亡与士气衰减。</div></div>`;
  }
}

function calcSiege() {
  const fortLvl = parseInt(document.getElementById("siege-fort-level").value) || 2;
  const art = parseInt(document.getElementById("siege-artillery").value) || 0;
  const leader = parseInt(document.getElementById("siege-leader").value) || 0;
  const breach = parseInt(document.getElementById("siege-breach").value) || 0;
  const def = (parseFloat(document.getElementById("siege-defensiveness").value) || 0) / 100;
  const siegeAb = (parseFloat(document.getElementById("siege-ability").value) || 0) / 100;

  const tickDays = Math.round(30 * Math.max(0.1, 1 - siegeAb + def));
  document.getElementById("out-siege-tick-days").innerText = tickDays + " 天";

  const mod = siegeCurrentProgress + art + leader + breach - fortLvl;
  
  let surrenderCount = 0, desertCount = 0, waterCount = 0, foodCount = 0, supplyCount = 0, statusQuoCount = 0;

  for (let die = 1; die <= 14; die++) {
    const total = die + mod;
    if (total >= 20) surrenderCount++;
    else if (total >= 14) desertCount++;
    else if (total >= 12) waterCount++;
    else if (total >= 5) foodCount++;
    else if (total >= 2) supplyCount++;
    else statusQuoCount++;
  }

  const fallPct = ((surrenderCount / 14) * 100).toFixed(1);
  document.getElementById("out-siege-fall-chance").innerText = fallPct + "%";
  document.getElementById("out-siege-progress-val").innerText = "+" + siegeCurrentProgress + " / 12";
  
  const pct = Math.min(100, Math.round((siegeCurrentProgress / 12) * 85 + (surrenderCount > 0 ? 15 : 0)));
  document.getElementById("siege-phase-percent").innerText = "陷落预估: " + pct + "%";
  document.getElementById("siege-progress-bar").style.width = Math.max(5, pct) + "%";

  const probBox = document.getElementById("siege-probability-bars");
  probBox.innerHTML = `
    <div class="flex items-center justify-between"><span class="text-emerald-400">要塞陷落 (Surrender ≥20):</span><span class="font-mono">` + ((surrenderCount/14)*100).toFixed(1) + `% (` + surrenderCount + `/14)</span></div>
    <div class="flex items-center justify-between"><span class="text-cyan-400">守军逃亡 (Desert 14–19):</span><span class="font-mono">` + ((desertCount/14)*100).toFixed(1) + `% (` + desertCount + `/14)</span></div>
    <div class="flex items-center justify-between"><span class="text-blue-400">水源枯竭 (Water 12–13):</span><span class="font-mono">` + ((waterCount/14)*100).toFixed(1) + `% (` + waterCount + `/14)</span></div>
    <div class="flex items-center justify-between"><span class="text-amber-400">食物匮乏 (Food 5–11):</span><span class="font-mono">` + ((foodCount/14)*100).toFixed(1) + `% (` + foodCount + `/14)</span></div>
    <div class="flex items-center justify-between"><span class="text-slate-400">补给短缺 (Supplies 2–4):</span><span class="font-mono">` + ((supplyCount/14)*100).toFixed(1) + `% (` + supplyCount + `/14)</span></div>
    <div class="flex items-center justify-between"><span class="text-rose-400">疾病蔓延 (Disease Outbreak ≤1):</span><span class="font-mono">` + ((statusQuoCount/14)*100).toFixed(1) + `% (` + statusQuoCount + `/14)</span></div>
  `;
}

function rollNextSiegeTick() {
  const fortLvl = parseInt(document.getElementById("siege-fort-level").value) || 2;
  const art = parseInt(document.getElementById("siege-artillery").value) || 0;
  const leader = parseInt(document.getElementById("siege-leader").value) || 0;
  const breach = parseInt(document.getElementById("siege-breach").value) || 0;
  const mod = siegeCurrentProgress + art + leader + breach - fortLvl;

  const roll = Math.floor(Math.random() * 14) + 1;
  const total = roll + mod;
  const log = document.getElementById("siege-log");

  let outcomeText = "";
  if (total >= 20) {
    outcomeText = "<span class='text-emerald-300 font-bold'>🎉 要塞开城投降！(Surrender) 围攻胜利！</span>";
    siegeCurrentProgress = 0;
  } else if (total >= 14) {
    siegeCurrentProgress = Math.min(12, siegeCurrentProgress + 2);
    outcomeText = "<span class='text-cyan-300'>守军逃亡 (Defenders Desert)，进度 +2</span>";
  } else if (total >= 12) {
    siegeCurrentProgress = Math.min(12, siegeCurrentProgress + 3);
    outcomeText = "<span class='text-blue-300'>水源枯竭 (Water Shortage)，进度 +3</span>";
  } else if (total >= 5) {
    siegeCurrentProgress = Math.min(12, siegeCurrentProgress + 2);
    outcomeText = "<span class='text-amber-300'>食物匮乏 (Food Shortage)，进度 +2</span>";
  } else if (total >= 2) {
    siegeCurrentProgress = Math.min(12, siegeCurrentProgress + 1);
    outcomeText = "<span class='text-slate-300'>补给短缺 (Supplies Shortage)，进度 +1</span>";
  } else {
    outcomeText = "<span class='text-rose-400'>疾病蔓延 (Disease Outbreak)！攻城方阵亡 5% 人力，进度 +0</span>";
  }

  log.innerHTML = "<div>[Tick] 掷骰: <span class='text-amber-300'>" + roll + "</span> + 修正值 <span class='text-cyan-300'>" + mod + "</span> = 总计 <span class='text-emerald-300 font-bold'>" + total + "</span> &rarr; " + outcomeText + "</div>";
  calcSiege();
}

function resetSiege() {
  siegeCurrentProgress = 0;
  document.getElementById("siege-log").innerHTML = "<div class='text-slate-500'>// 围城进度已重置</div>";
  calcSiege();
}

function calcPU() {
  const year = parseInt(document.getElementById("pu-year").value) || 1500;
  const day = parseInt(document.getElementById("pu-day").value) || 1;
  const provId = parseInt(document.getElementById("pu-prov-id").value) || 1;
  const dev = parseInt(document.getElementById("pu-dev").value) || 100;
  const dipRep = parseFloat(document.getElementById("pu-diprep").value) || 0;
  const provinces = parseInt(document.getElementById("pu-provinces").value) || 1;

  const hashVal = (day + provId + dev) % 100;
  document.getElementById("pu-hash-val").innerText = "Cycle Hash: " + hashVal + " / 100";

  const resultBox = document.getElementById("pu-phase-result-box");
  if (hashVal < 75) {
    resultBox.className = "p-4 rounded-xl border border-blue-800/60 bg-blue-950/40 space-y-1.5";
    resultBox.innerHTML = `
      <div class="font-bold text-blue-300 text-sm flex items-center gap-2"><i class="fa-solid fa-chess-king"></i> Phase 0: 王朝传播 / 贵族继位 (Dynasty Spread / Noble)</div>
      <p class="text-slate-300 text-xs">当前落入 75% 常规周期。若目标国与强权联姻，发展度最高的联姻强权家族王朝将成功入主王位；若无联姻，由同文化本土贵族登基。</p>
    `;
  } else if (hashVal < 95) {
    resultBox.className = "p-4 rounded-xl border border-amber-800/60 bg-amber-950/40 space-y-1.5";
    resultBox.innerHTML = `
      <div class="font-bold text-amber-300 text-sm flex items-center gap-2"><i class="fa-solid fa-crown"></i> Phase 1: 同君联合与王位继承战争 (Succession War / Personal Union)</div>
      <p class="text-slate-300 text-xs">当前落入 20% 联统窗口期！目标国将直接沦为最高权重联姻国的初级附庸（Junior Partner），同时由最大宿敌发起继承战争！</p>
    `;
  } else {
    resultBox.className = "p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/40 space-y-1.5";
    resultBox.innerHTML = `
      <div class="font-bold text-emerald-300 text-sm flex items-center gap-2"><i class="fa-solid fa-handshake-angle"></i> Phase 2: 直接领土全境继承 (Direct Inheritance)</div>
      <p class="text-slate-300 text-xs">当前落入 5% 奇迹吞并期！若目标国省份未超限，最高权重联姻国将瞬间全境直辖继承（全境变本土核心，跳过漫长联统兼并）。</p>
    `;
  }

  const inheritChance = Math.max(0, Math.min(100, Math.round(dipRep * 5 + 1 + 5 - provinces)));
  document.getElementById("pu-inherit-chance").innerText = inheritChance + "%";
}

function calcAE() {
  const dev = parseFloat(document.getElementById("ae-dev").value) || 10;
  const cb = parseFloat(document.getElementById("ae-cb").value) || 1.0;
  const reduction = (parseFloat(document.getElementById("ae-reduction").value) || 0) / 100;
  const impRel = (parseFloat(document.getElementById("ae-improve-rel").value) || 0) / 100;

  let mult = 1.0;
  if (document.getElementById("ae-chk-same-religion").checked) mult *= 1.5;
  if (document.getElementById("ae-chk-same-culture").checked) mult *= 1.25;
  if (document.getElementById("ae-chk-hre-province").checked) mult *= 1.5;
  if (document.getElementById("ae-chk-hre-member").checked) mult *= 1.5;

  const baseAE = dev * 0.75 * cb * (1 - reduction);
  const peakAE = (baseAE * mult).toFixed(1);
  const decayRate = (2.0 * (1 + impRel)).toFixed(2);
  const yearsNeeded = (peakAE / decayRate).toFixed(1);

  document.getElementById("out-ae-peak").innerText = peakAE;
  document.getElementById("out-ae-decay-rate").innerText = decayRate + " / 年";
  document.getElementById("out-ae-years-needed").innerText = yearsNeeded + " 年";

  const status = document.getElementById("out-ae-coalition-status");
  if (peakAE >= 50) {
    status.innerText = "⚠️ 触发包围网阈值 (AE ≥ 50)";
    status.className = "text-[10px] text-rose-400 font-bold mt-0.5";
  } else {
    status.innerText = "✅ 安全范围 (AE < 50)";
    status.className = "text-[10px] text-emerald-400 font-bold mt-0.5";
  }
}

function calcTrade() {
  const localVal = parseFloat(document.getElementById("trade-local-val").value) || 0;
  const inVal = parseFloat(document.getElementById("trade-incoming-val").value) || 0;
  const powerShare = (parseFloat(document.getElementById("trade-power-share").value) || 50) / 100;
  const merchants = parseInt(document.getElementById("trade-merchants").value) || 1;
  const steeringMod = (parseFloat(document.getElementById("trade-steering-mod").value) || 0) / 100;
  const eff = (parseFloat(document.getElementById("trade-efficiency").value) || 0) / 100;

  const totalNodeVal = localVal + inVal;
  const compoundFactor = Math.pow(1 + 0.05 * (1 + steeringMod), merchants);
  const outgoing = (totalNodeVal * powerShare * compoundFactor).toFixed(2);
  const collected = (totalNodeVal * powerShare * (1 + eff)).toFixed(2);

  document.getElementById("out-trade-multiplier").innerText = compoundFactor.toFixed(3) + "×";
  document.getElementById("out-trade-outgoing").innerText = outgoing + " ¤";
  document.getElementById("out-trade-collected").innerText = collected + " ¤ / 月";
}

function calcAI() {
  const dipRep = parseFloat(document.getElementById("ai-diprep").value) || 0;
  const trust = parseFloat(document.getElementById("ai-trust").value) || 50;
  const attitude = parseFloat(document.getElementById("ai-attitude").value) || 0;
  const armyRatio = parseFloat(document.getElementById("ai-army-ratio").value) || 1.0;
  const ae = parseFloat(document.getElementById("ai-ae").value) || 0;
  const dist = parseFloat(document.getElementById("ai-distance").value) || 0;

  const dipScore = dipRep * 5;
  const trustScore = trust - 50;
  const armyScore = Math.round(20 * (armyRatio - 1.0));
  const aeScore = -Math.round(ae);
  const totalAlliance = Math.round(dipScore + trustScore + attitude + armyScore + aeScore + dist);

  document.getElementById("out-ai-alliance-score").innerText = totalAlliance > 0 ? ("+" + totalAlliance) : totalAlliance;
  
  const status = document.getElementById("out-ai-alliance-status");
  if (totalAlliance > 0) {
    status.innerText = "✅ AI 同意建立同盟";
    status.className = "text-[10px] text-emerald-400 font-bold mt-0.5";
  } else {
    status.innerText = "❌ AI 拒绝外交提案";
    status.className = "text-[10px] text-rose-400 font-bold mt-0.5";
  }

  const warDesire = Math.round(50 * (1 / armyRatio) + ae * 0.5 - trustScore - 100);
  document.getElementById("out-ai-war-score").innerText = warDesire;

  const breakdown = document.getElementById("ai-score-breakdown");
  breakdown.innerHTML = `
    <div class="flex justify-between"><span>外交声誉加分:</span><span class="` + (dipScore>=0?"text-emerald-400":"text-rose-400") + `">` + (dipScore>=0?"+":"") + dipScore + `</span></div>
    <div class="flex justify-between"><span>信任度偏置加分:</span><span class="` + (trustScore>=0?"text-emerald-400":"text-rose-400") + `">` + (trustScore>=0?"+":"") + trustScore + `</span></div>
    <div class="flex justify-between"><span>态度加权:</span><span class="` + (attitude>=0?"text-emerald-400":"text-rose-400") + `">` + (attitude>=0?"+":"") + attitude + `</span></div>
    <div class="flex justify-between"><span>相对军力加成:</span><span class="` + (armyScore>=0?"text-emerald-400":"text-rose-400") + `">` + (armyScore>=0?"+":"") + armyScore + `</span></div>
    <div class="flex justify-between"><span>AE 负面惩罚:</span><span class="text-rose-400">` + aeScore + `</span></div>
    <div class="flex justify-between"><span>边境距离惩罚:</span><span class="text-rose-400">` + dist + `</span></div>
  `;
}

function copyItemJSON(index) {
  const item = ALL_ALGORITHMS[index];
  navigator.clipboard.writeText(JSON.stringify(item, null, 2)).then(() => {
    showToast("已成功复制该机制的 JSON 数据");
  });
}

function copyFullJSON() {
  navigator.clipboard.writeText(JSON.stringify(RAW_DATABASE, null, 2)).then(() => {
    showToast("已成功复制完整 21 项机制 JSON 数据库");
  });
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(RAW_DATABASE, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "eu4_mechanisms_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("已触发 eu4_mechanisms_data.json 下载");
}

function showToast(text) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-text").innerText = text;
  toast.classList.remove("translate-y-20", "opacity-0");
  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
  }, 2500);
}

function renderMath() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false}
      ],
      throwOnError: false
    });
  }
}

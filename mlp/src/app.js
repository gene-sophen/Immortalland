import { ACCESSORIES, CARD_CATEGORIES, CARDS, DOMAINS, ELITES, ENEMIES, IDENTITIES, NODE_TYPES, PARTNERS } from './data.js';
import {
  addAccessory, addPartner, battleReward, cardOf, createBattle, createRun, currentIntent,
  gainXp, loadRun, pickUnique, playCard, rewardCards, rollQuality, round, sample, saveRun,
  shuffle, tickBattle, upgradeOrAdd
} from './engine.js';

const app = document.querySelector('#app');
const state = {
  screen: 'title', run: null, battle: null, reward: null, speed: 1, lastFrame: performance.now(),
  lastPaint: 0, nodeChoices: [], selection: [], pendingNode: null, toast: '', drag: null, loop: 1,
  shop: null, event: null, treasure: null
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const pct = (value, max) => `${Math.max(0, Math.min(100, max ? value / max * 100 : 0))}%`;
const identity = () => IDENTITIES.find((item) => item.id === state.run?.identityId);
const domain = () => DOMAINS.find((item) => item.id === state.run?.currentDomainId);
const qualityClass = (quality = '普通') => quality === '传说' ? 'legend' : quality === '稀有' ? 'rare' : 'common';

function persist() {
  if (state.run) saveRun(state.run);
}

function notify(message) {
  state.toast = message;
  render();
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => { state.toast = ''; render(); }, 2200);
}

function shell(content, { title = '三乂川', subtitle = '治川试行', footer = true, battle = false } = {}) {
  const run = state.run;
  const meta = run ? `
    <div class="status-ribbon">
      <span><i class="dot hp"></i>${run.maxHp}</span><span><i class="dot coin"></i>${run.coins}</span>
      <span><i class="dot xp"></i>Lv.${run.level}</span><span><i class="dot stone"></i>${run.stones}/9</span>
    </div>` : '';
  return `
    <main class="desktop-stage ${battle ? 'is-battle' : ''}">
      <aside class="lore-rail" aria-hidden="true">
        <div class="brand-seal">三<br>乂<br>川</div>
        <p>潮律已至</p><span>V 0.10 · MLP</span>
      </aside>
      <section class="phone-shell">
        <header class="topbar">
          <button class="icon-button" data-action="home" aria-label="返回主界面">乂</button>
          <div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(subtitle)}</small></div>
          <button class="icon-button" data-action="codex" aria-label="查看行囊">籍</button>
        </header>
        ${meta}
        <div class="screen ${battle ? 'battle-screen' : ''}">${content}</div>
        ${footer && run ? `<nav class="bottom-nav"><button data-action="route">潮路</button><button data-action="deck">牌组 <b>${run.deck.length}</b></button><button data-action="inventory">饰品 <b>${run.accessories.length}</b></button></nav>` : ''}
        ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ''}
      </section>
      <aside class="side-note" aria-hidden="true"><b>${domain()?.sigil || '川'}</b><p>${domain()?.tide || '潮律'}</p></aside>
    </main>`;
}

function renderTitle() {
  const saved = loadRun();
  app.innerHTML = shell(`
    <section class="title-scene">
      <div class="river-mark"><span></span><span></span><span></span></div>
      <p class="eyebrow">A TIDE-BORN DECK ADVENTURE</p>
      <h1>三乂川</h1>
      <p class="title-copy">九石为命，三域为路。<br>在48次冒险中写下你的潮律。</p>
      <div class="title-actions">
        <button class="primary ink" data-action="new-run">启程</button>
        ${saved && !saved.completed ? '<button class="secondary" data-action="continue-run">续潮</button>' : ''}
      </div>
      <button class="text-button" data-action="about">可玩原型说明</button>
    </section>`, { footer: false, subtitle: '治川试行' });
}

function renderIdentity() {
  app.innerHTML = shell(`
    <section class="page-head">
      <p class="eyebrow">01 / 身份</p><h2>谁来握住命纹？</h2>
      <p>身份改变初始卡组与饰品，不锁定后续构筑。</p>
      <div class="segmented"><button class="${state.loop === 1 ? 'active' : ''}" data-action="loop" data-value="1">一轮回</button><button class="${state.loop === 9 ? 'active' : ''}" data-action="loop" data-value="9">九轮回试行</button></div>
    </section>
    <div class="identity-grid">${IDENTITIES.map((item) => `
      <button class="identity-card" data-action="choose-identity" data-id="${item.id}">
        <span class="identity-sigil">${item.sigil}</span><span><b>${item.name}</b><small>${item.relic}</small><em>${item.text}</em></span>
      </button>`).join('')}</div>`, { title: '选择身份', subtitle: '一次启程，一个答案', footer: false });
}

function startDomainChoice() {
  const remaining = DOMAINS.filter((item) => !state.run.domainsDone.includes(item.id));
  state.selection = pickUnique(remaining, 3);
  state.screen = 'domain';
  render();
}

function renderDomain() {
  app.innerHTML = shell(`
    <section class="page-head"><p class="eyebrow">${state.run.domainsDone.length + 1} / 3 领域</p><h2>三张潮图，只选一张</h2><p>领域潮律对敌我双方公平生效。</p></section>
    <div class="domain-stack">${state.selection.map((item) => `
      <button class="domain-card" style="--domain:${item.accent};--wash:${item.hue}" data-action="choose-domain" data-id="${item.id}">
        <span class="domain-sigil">${item.sigil}</span><span class="domain-copy"><small>${item.stone} · ${item.boss}</small><b>${item.name}</b><em>${item.tide}</em><p>${item.rule}</p></span><i>入域</i>
      </button>`).join('')}</div>`, { title: '九域择三', subtitle: '潮路不会回头' });
}

function renderPartner() {
  app.innerHTML = shell(`
    <section class="page-head"><p class="eyebrow">冒险 ${state.run.stageIndex + 1} / 3</p><h2>此域谁来同行？</h2><p>三人中选一人。专属技能牌入组，专属饰品占用栏位。</p></section>
    <div class="partner-list">${state.selection.map((item) => `
      <button class="partner-card" data-action="choose-partner" data-id="${item.id}">
        <span class="portrait-glyph">${item.sigil}</span><span><small>${item.stone}</small><b>${item.name}</b><p>${item.line}</p><em>${item.card.name} · ${item.card.cost}费</em></span>
      </button>`).join('')}</div>`, { title: domain()?.name || '同行者', subtitle: domain()?.tide || '伙伴选择' });
}

const stepLabel = (step) => step === 4 || step === 9 ? '精英' : step === 14 ? '领域之主' : '节点探索';
function renderRouteDots() {
  const step = state.run.domainStep || 0;
  return `<div class="route-line">${Array.from({ length: 15 }, (_, index) => `<i class="${index < step ? 'done' : index === step ? 'now' : ''} ${index === 4 || index === 9 ? 'elite-dot' : index === 14 ? 'boss-dot' : ''}"></i>`).join('')}</div>`;
}

function ensureNodeChoices() {
  if (!state.nodeChoices.length) state.nodeChoices = pickUnique(NODE_TYPES, 3).map((node) => ({ ...node, quality: rollQuality(state.run) }));
}

function renderAdventure() {
  const step = state.run.domainStep || 0;
  if (step === 4 || step === 9) return renderEliteGate();
  if (step === 14) return renderBossGate();
  ensureNodeChoices();
  const choices = state.nodeChoices;
  app.innerHTML = shell(`
    <section class="route-head"><div><p class="eyebrow">${stepLabel(step)} · ${step + 1}/15</p><h2>${domain().name}</h2></div><span class="tide-chip">${domain().tide}</span></section>
    ${renderRouteDots()}
    <div class="tide-rule"><span>${domain().sigil}</span><p><b>全场潮律</b>${domain().rule}</p></div>
    <p class="section-label">从六类节点中随机呈现三个</p>
    <div class="node-fan">${choices.map((node) => `
      <button class="node-card ${qualityClass(node.quality)}" data-action="choose-node" data-id="${node.id}">
        <small>${node.quality}</small><span>${node.sigil}</span><b>${node.name}</b><p>${node.line}</p>
      </button>`).join('')}</div>
    <div class="journey-note">本域已行 ${step} / 15 · 进入下一领域时获得3经验</div>`, { title: `${domain().sigil} · ${domain().name}`, subtitle: `${domain().boss}正在潮路尽头` });
}

function renderEliteGate() {
  if (!state.selection.length || !state.selection[0]?.actions) state.selection = pickUnique(ELITES, 3).map((enemy) => ({ ...enemy, quality: rollQuality(state.run) }));
  app.innerHTML = shell(`
    <section class="page-head"><p class="eyebrow">精英拦路 · ${(state.run.eliteIndex || 0) + 1}/2</p><h2>三道敌意，选择你的克题</h2><p>战前可见其行动特征。品质越高，数值与奖励同步上升。</p></section>
    <div class="enemy-choice-list">${state.selection.map((enemy) => `
      <button class="enemy-choice ${qualityClass(enemy.quality)}" data-action="choose-elite" data-id="${enemy.id}">
        <span>${enemy.sigil}</span><b>${enemy.name}</b><small>${enemy.quality}</small><p>${enemy.actions.map((a) => a.name).join(' / ')}</p>
      </button>`).join('')}</div>`, { title: '精英择敌', subtitle: domain().name });
}

function renderBossGate() {
  app.innerHTML = shell(`
    <section class="boss-gate" style="--domain:${domain().accent}">
      <p class="eyebrow">领域尽头</p><span class="boss-sigil">${domain().sigil}</span><h2>${domain().boss}</h2>
      <p>${domain().rule}</p><div class="boss-warning">失败将碎裂 ${state.run.stageIndex + 1} 枚命源石</div>
      <button class="primary" data-action="start-boss">推开潮门</button>
    </section>`, { title: '领域 Boss', subtitle: `${domain().name} · ${domain().tide}` });
}

function startBattle(options) {
  state.battle = createBattle(state.run, { ...options, domainId: state.run.currentDomainId });
  state.speed = 1;
  state.screen = 'battle';
  state.lastFrame = performance.now();
  render();
}

function statusChips(entity) {
  const chips = [];
  if (entity.shield) chips.push(`盾 ${round(entity.shield)}`);
  if (entity.poison) chips.push(`毒 ${round(entity.poison)}`);
  if (entity.fire) chips.push(`火 ${round(entity.fire)}`);
  if (entity.weak) chips.push(`弱 ${Math.ceil(entity.weak)}s`);
  if (entity.vulnerable) chips.push(`伤 ${Math.ceil(entity.vulnerable)}s`);
  if (entity.inspire) chips.push(`鼓 ${Math.ceil(entity.inspire)}s`);
  return chips.map((chip) => `<i>${chip}</i>`).join('');
}

function renderBattle() {
  const battle = state.battle;
  const intent = currentIntent(battle);
  const storm = battle.time >= 60 ? '超时风暴' : battle.time >= 30 ? '诅咒风暴' : '安全期';
  const result = battle.result ? `
    <div class="result-sheet"><span>${battle.result === 'victory' ? '胜' : '败'}</span><h2>${battle.result === 'victory' ? '潮律已断' : '命纹回响'}</h2>
    <p>${battle.result === 'victory' ? `以 ${battle.time.toFixed(1)} 秒结束战斗。` : battle.kind === 'final' ? '48兵战败即本轮回失败。' : '结算命源石后，继续向前。'}</p>
    <button class="primary" data-action="battle-result">结算</button></div>` : '';
  const cards = battle.hand.map((instance, index) => {
    const card = cardOf(instance);
    const disabled = battle.player.energy + 1e-6 < card.cost || card.tags?.includes('负面');
    return `<button class="battle-card cat-${CARD_CATEGORIES.indexOf(card.category)} ${disabled ? 'disabled' : ''}" data-action="play-card" data-id="${instance.uid}" style="--i:${index}">
      <span class="cost">${card.cost}</span><small>${card.category} · ${card.level ? `${card.level}级` : '特殊'}</small><b>${card.name}</b><p>${card.desc}</p><em>${(card.tags || []).join(' · ') || '无词条'}</em>
    </button>`;
  }).join('');
  app.innerHTML = shell(`
    <div class="battle-hud">
      <div class="speed-control"><button data-action="pause">${battle.paused ? '继续' : '暂停'}</button>${[.5, 1, 2].map((speed) => `<button class="${state.speed === speed ? 'active' : ''}" data-action="speed" data-value="${speed}">${speed}×</button>`).join('')}</div>
      <div class="battle-clock ${battle.time >= 30 ? 'danger' : ''}"><b>${battle.time.toFixed(1)}</b><small>${storm}</small></div>
    </div>
    <section class="enemy-field">
      <div class="intent-card"><div><small>下一行动</small><b>${intent.name}</b></div><span>${Math.ceil((1 - battle.enemy.progress) * intent.time)}s</span><div class="intent-bar"><i style="width:${pct(battle.enemy.progress, 1)}"></i></div><em>${intent.interruptible ? '可打断' : '不可打断'}</em></div>
      <div class="enemy-figure"><div class="enemy-shadow"></div><span>${battle.enemy.sigil}</span></div>
      <div class="unit-name"><small>${battle.quality} · ${battle.kind === 'boss' ? '领域之主' : battle.kind === 'elite' ? '精英' : battle.kind === 'final' ? '最终之敌' : '敌人'}</small><b>${battle.enemy.name}</b></div>
      <div class="healthbar enemy-hp"><i style="width:${pct(battle.enemy.hp, battle.enemy.maxHp)}"></i><span>${round(battle.enemy.hp)} / ${battle.enemy.maxHp}</span></div>
      <div class="status-row">${statusChips(battle.enemy)}</div>
    </section>
    <section class="player-field">
      <div class="team-line">${[identity(), ...state.run.partners.map((id) => PARTNERS.find((p) => p.id === id))].map((unit, index) => `<span class="${index === 0 ? 'lead' : ''}">${unit?.sigil || '伴'}</span>`).join('')}</div>
      <div class="healthbar"><i style="width:${pct(battle.player.hp, battle.player.maxHp)}"></i><span>${round(battle.player.hp)} / ${battle.player.maxHp}</span></div>
      <div class="status-row">${statusChips(battle.player)}</div>
      <div class="energy-meter"><div>${[1, 2, 3].map((n) => `<i class="${battle.player.energy >= n ? 'filled' : ''}"></i>`).join('')}</div><span>命潮 ${battle.player.energy}/3</span><em style="--charge:${pct(battle.player.charge, 1)}"></em></div>
    </section>
    <div class="hand-zone"><p>点击或上拖打出 · 出牌后弃其余两张</p><div class="card-hand">${cards || '<div class="empty-hand">命潮正在重组手牌……</div>'}</div></div>
    <div class="battle-log">${battle.log.slice(0, 3).map((line) => `<p>${escapeHtml(line)}</p>`).join('')}</div>
    ${result}`, { title: domain()?.name || '48兵', subtitle: domain()?.tide || '最终潮律', footer: false, battle: true });
}

function finishCurrentStep() {
  state.run.domainStep = (state.run.domainStep || 0) + 1;
  state.nodeChoices = [];
  state.selection = [];
  state.reward = null;
  state.battle = null;
  state.screen = 'adventure';
  persist();
  render();
}

function finishBoss() {
  state.run.domainsDone.push(state.run.currentDomainId);
  state.run.currentDomainId = null;
  state.run.domainStep = 0;
  state.run.stageIndex = state.run.domainsDone.length;
  state.selection = [];
  state.reward = null;
  state.battle = null;
  if (state.run.completed === 'failed') return finishRun(false, '命源石已在失败结算中超过承受上限。');
  if (state.run.domainsDone.length >= 3) {
    state.screen = 'final-gate';
  } else startDomainChoice();
  persist();
  render();
}

function finishRun(victory, text) {
  state.run.completed = victory ? 'victory' : 'failed';
  state.run.ending = text;
  state.screen = 'run-end';
  persist();
  render();
}

function renderFinalGate() {
  const lost = state.run.stoneDamage;
  app.innerHTML = shell(`
    <section class="final-gate">
      <p class="eyebrow">48 / 48</p><div class="forty-eight">卌</div><h2>48兵</h2>
      <p>三域之律已在此合流。失去的命源石越多，它越强。</p>
      <div class="final-stats"><span>碎裂 ${lost}</span><span>余石 ${state.run.stones}</span><span>轮回 ${state.run.loop}</span></div>
      <button class="primary" data-action="start-final">问兵</button>
    </section>`, { title: '最终战', subtitle: '随机而不随意' });
}

function renderReward() {
  const reward = state.reward;
  const cards = reward.cards || [];
  app.innerHTML = shell(`
    <section class="page-head"><p class="eyebrow">战斗结算</p><h2>${reward.won ? '把胜利收入行囊' : '收起碎石，继续前行'}</h2><p>获得 ${reward.coins} 纽币${reward.stoneLoss ? ` · 命源石 -${reward.stoneLoss}` : ''}</p></section>
    ${reward.accessory ? `<section class="reward-accessory"><span>饰</span><div><small>${reward.accessory.tier}级饰品</small><b>${reward.accessory.name}</b><p>${reward.accessory.text}</p></div><button data-action="take-accessory">收下</button></section>` : ''}
    ${cards.length ? `<p class="section-label">选择一张卡，加入或用同名卡升级</p><div class="reward-cards">${cards.map((card) => `
      <article class="reward-card"><span>${card.cost}</span><small>${card.category} · ${card.level}级</small><b>${card.name}</b><p>${card.desc}</p>
      <div><button data-action="reward-add" data-id="${card.id}">加入</button><button data-action="reward-upgrade" data-id="${card.id}">同名升级</button></div></article>`).join('')}</div>` : ''}
    <button class="secondary wide" data-action="skip-reward">${cards.length ? '跳过卡牌' : '继续'}</button>`, { title: '战利品', subtitle: `纽币 +${reward.coins}` });
}

function completeNode(xp = 1) {
  gainXp(state.run, xp);
  finishCurrentStep();
}

function openShop() {
  state.shop = { cards: rewardCards(state.run).slice(0, 2), accessory: sample(ACCESSORIES), refreshed: 0 };
  state.screen = 'shop'; render();
}

function renderShop() {
  const prices = [45, 75, 120];
  app.innerHTML = shell(`
    <section class="shop-sign"><span>不赊</span><div><small>${state.pendingNode?.quality || '普通'}商店</small><h2>潮间小铺</h2><p>购物、删卡、回收，价码都写在明面。</p></div></section>
    <div class="shop-shelf">${state.shop.cards.map((card, index) => `<article><span>${card.cost}</span><b>${card.name}</b><p>${card.desc}</p><button data-action="buy-card" data-index="${index}">${card.level === 2 ? 72 : 46} 纽币</button></article>`).join('')}
      ${state.shop.accessory ? `<article class="shop-relic"><span>饰</span><b>${state.shop.accessory.name}</b><p>${state.shop.accessory.text}</p><button data-action="buy-accessory">${prices[state.shop.accessory.tier - 1]} 纽币</button></article>` : ''}</div>
    <div class="service-row"><button data-action="shop-remove">删卡 <small>55</small></button><button data-action="shop-recycle">回收 <small>+35</small></button><button data-action="shop-refresh">刷新 <small>${25 + state.shop.refreshed * 15}</small></button></div>
    <button class="primary wide" data-action="leave-node">离开商店</button>`, { title: '商店', subtitle: `余 ${state.run.coins} 纽币` });
}

function renderCamp() {
  app.innerHTML = shell(`
    <section class="camp-scene"><div class="tent"><i></i></div><p class="eyebrow">火只亮一夜</p><h2>三件事，只做一件</h2></section>
    <div class="camp-actions">
      <button data-action="camp-dig"><span>挖</span><b>挖掘</b><p>获得饰品或纽币，高等级提高高品质概率。</p></button>
      <button data-action="camp-hammer"><span>锤</span><b>锤子</b><p>非三级牌变为同等级随机类别；三级重选分支。</p></button>
      <button data-action="camp-warm"><span>温</span><b>温存</b><p>本节点总计获得3点经验。</p></button>
    </div>`, { title: '营地', subtitle: '火光不替你做选择' });
}

function makeEvent() {
  const events = [
    { title: '倒生的树', body: '根系悬在天上，枝叶却扎向地心。树皮上有三道刚长出的门。', options: ['剥下一块树皮', '把卡塞入树心', '掷骰跟随叶脉'] },
    { title: '潮声拍卖', body: '没有拍卖师，只有潮水一遍遍报价。最后一件货物是你下一次犹豫。', options: ['以纽币落槌', '以一张牌落槌', '掷骰抢拍'] },
    { title: '没有昨日的亭', body: '亭中人只记得今天。他说：“你可以放下一件东西，也可以带走一件从未拥有的东西。”', options: ['放下疲惫', '记住一张牌', '掷骰向明天借钱'] }
  ];
  return sample(events);
}

function renderEvent() {
  const event = state.event;
  app.innerHTML = shell(`
    <section class="event-scene"><span>事</span><p class="eyebrow">潮路支线</p><h2>${event.title}</h2><p>${event.body}</p></section>
    <div class="event-options">${event.options.map((option, index) => `<button data-action="event-option" data-index="${index}"><span>${index === 2 ? '骰' : ['壹', '贰'][index]}</span><b>${option}</b><small>${index === 0 ? '稳定收益' : index === 1 ? '转化选择' : '骰点影响收益档位'}</small></button>`).join('')}</div>`, { title: '事件', subtitle: state.pendingNode?.quality || '普通' });
}

function renderTreasure() {
  app.innerHTML = shell(`
    <section class="treasure-head"><span>藏</span><p class="eyebrow">所有价码已公开</p><h2>三匣选一</h2><p>每个选项都包含纽币，但只有一个能跟你走。</p></section>
    <div class="treasure-grid">${state.treasure.map((item, index) => `<button data-action="take-treasure" data-index="${index}"><span>${item.sigil}</span><b>${item.title}</b><small>${item.detail}</small><em>+${item.coins} 纽币</em></button>`).join('')}</div>`, { title: '宝藏', subtitle: '看清收益再选' });
}

function renderCollection(kind) {
  const isDeck = kind === 'deck';
  const list = isDeck ? state.run.deck.map(cardOf) : state.run.accessories;
  app.innerHTML = shell(`
    <section class="page-head"><p class="eyebrow">${isDeck ? '构筑快照' : '队伍被动'}</p><h2>${isDeck ? `${state.run.deck.length} 张牌` : `${state.run.accessories.length} 件饰品`}</h2><p>${isDeck ? '类别限定基础语言，但允许跨类联动。' : '主角与伙伴分栏位携带，全队共享有效加成。'}</p></section>
    <div class="collection-list">${list.map((item) => `<article><span>${isDeck ? item.cost : item.tier || '特'}</span><div><small>${isDeck ? `${item.category} · ${item.level || '特殊'}级` : `${item.tier || '特殊'}级饰品`}</small><b>${item.name}</b><p>${isDeck ? item.desc : item.text}</p></div></article>`).join('')}</div>
    <button class="primary wide" data-action="back-adventure">返回潮路</button>`, { title: isDeck ? '牌组' : '饰品', subtitle: identity()?.name || '行囊' });
}

function renderRunEnd() {
  const victory = state.run.completed === 'victory';
  app.innerHTML = shell(`
    <section class="ending-scene"><span>${victory ? '川' : '碎'}</span><p class="eyebrow">${victory ? '轮回完成' : '潮路中断'}</p><h2>${victory ? '你走过了三乂川' : '命纹没有回头'}</h2><p>${state.run.ending || ''}</p>
      <div class="ending-stats"><i>Lv.${state.run.level}</i><i>${state.run.battleWins}胜</i><i>${state.run.coins}纽币</i><i>${state.run.deck.length}牌</i></div>
      <button class="primary" data-action="new-run">再启一潮</button><button class="text-button" data-action="home">返回主界面</button></section>`, { title: victory ? '通关' : '失败', subtitle: '记录会留下，潮水会退去', footer: false });
}

function renderAbout() {
  app.innerHTML = shell(`
    <section class="page-head"><p class="eyebrow">MINIMUM LOVABLE PRODUCT</p><h2>这不是静态概念页</h2><p>它是一个可以完成三域、48次冒险与最终战的纵切原型。</p></section>
    <div class="about-list"><article><b>战斗</b><p>实时回能、抽三打一弃二、敌方意图、打断与减速、毒火、护盾与30/60秒风暴。</p></article><article><b>冒险</b><p>身份、伙伴、三域、六类节点、精英三选一、Boss与48兵。</p></article><article><b>构筑</b><p>27张公共卡代表数据、伙伴牌、饰品、同名升级与锤子转化。</p></article></div>
    <button class="primary wide" data-action="home">明白了</button>`, { title: '原型说明', subtitle: 'v0.10 数据验证载体', footer: false });
}

function render() {
  if (state.screen === 'title') renderTitle();
  else if (state.screen === 'identity') renderIdentity();
  else if (state.screen === 'domain') renderDomain();
  else if (state.screen === 'partner') renderPartner();
  else if (state.screen === 'adventure') renderAdventure();
  else if (state.screen === 'battle') renderBattle();
  else if (state.screen === 'reward') renderReward();
  else if (state.screen === 'shop') renderShop();
  else if (state.screen === 'camp') renderCamp();
  else if (state.screen === 'event') renderEvent();
  else if (state.screen === 'treasure') renderTreasure();
  else if (state.screen === 'deck' || state.screen === 'inventory') renderCollection(state.screen);
  else if (state.screen === 'final-gate') renderFinalGate();
  else if (state.screen === 'run-end') renderRunEnd();
  else if (state.screen === 'about') renderAbout();
}

function proceedAfterReward() {
  const context = state.reward.context;
  if (context === 'boss') finishBoss();
  else finishCurrentStep();
}

function resolveBattleResult() {
  const battle = state.battle;
  if (battle.kind === 'final') {
    if (battle.result === 'victory') finishRun(true, '三域之律已被你重新写定。48兵不再是答案，而是一道证明。');
    else finishRun(false, '48兵战败直接结束本轮回。');
    return;
  }
  const beforeStones = state.run.stones;
  const result = battleReward(state.run, battle);
  const won = battle.result === 'victory';
  state.reward = {
    ...result, won, stoneLoss: Math.max(0, beforeStones - state.run.stones),
    context: battle.kind === 'boss' ? 'boss' : 'step',
    cards: won && battle.kind !== 'boss' ? result.cards : [],
    accessory: won && (battle.kind === 'elite' || battle.kind === 'boss') ? result.accessory : null
  };
  state.screen = 'reward';
  persist(); render();
}

function chooseNode(id) {
  let node = state.nodeChoices.find((item) => item.id === id);
  if (!node) return;
  if (id === 'random') {
    const rolled = sample(NODE_TYPES.filter((item) => item.id !== 'random'));
    node = { ...rolled, quality: rollQuality(state.run, 1) };
    notify(`随机节点显形为“${node.name}”，品质上调。`);
  }
  state.pendingNode = node;
  if (node.id === 'battle') startBattle({ kind: 'normal', quality: node.quality, enemyId: sample(ENEMIES).id });
  else if (node.id === 'shop') openShop();
  else if (node.id === 'camp') { state.screen = 'camp'; render(); }
  else if (node.id === 'event') { state.event = makeEvent(); state.screen = 'event'; render(); }
  else if (node.id === 'treasure') {
    const accessory = sample(ACCESSORIES);
    const card = sample(rewardCards(state.run));
    state.treasure = [
      { sigil: '饰', title: accessory.name, detail: accessory.text, coins: 30, accessory },
      { sigil: '牌', title: card.name, detail: card.desc, coins: 45, card },
      { sigil: '币', title: '满匣纽币', detail: '没有附加条件', coins: 100 }
    ];
    state.screen = 'treasure'; render();
  }
}

function buy(cost, action) {
  if (state.run.coins < cost) return notify('纽币不足。');
  const accepted = action();
  if (accepted === false) return notify('当前角色饰品栏位已满，请先在商店回收。');
  state.run.coins -= cost; persist(); render();
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id, value } = button.dataset;
  if (action === 'home') { state.screen = 'title'; state.battle = null; render(); }
  else if (action === 'about') { state.screen = 'about'; render(); }
  else if (action === 'new-run') { state.run = null; state.screen = 'identity'; render(); }
  else if (action === 'continue-run') {
    state.run = loadRun();
    state.screen = state.run.currentDomainId ? 'adventure' : state.run.domainsDone.length >= 3 ? 'final-gate' : 'domain';
    if (state.screen === 'domain') startDomainChoice(); else render();
  }
  else if (action === 'loop') { state.loop = Number(value); render(); }
  else if (action === 'choose-identity') {
    state.run = createRun(id); state.run.loop = state.loop; startDomainChoice(); persist();
  }
  else if (action === 'choose-domain') {
    state.run.currentDomainId = id; state.run.domainStep = 0; gainXp(state.run, 3);
    state.selection = pickUnique(PARTNERS.filter((item) => !state.run.partners.includes(item.id)), 3); state.screen = 'partner'; persist(); render();
  }
  else if (action === 'choose-partner') { addPartner(state.run, id); state.selection = []; state.screen = 'adventure'; persist(); render(); }
  else if (action === 'choose-node') chooseNode(id);
  else if (action === 'choose-elite') { const enemy = state.selection.find((item) => item.id === id); startBattle({ kind: 'elite', quality: enemy.quality, enemyId: id }); }
  else if (action === 'start-boss') startBattle({ kind: 'boss', quality: '传说' });
  else if (action === 'start-final') startBattle({ kind: 'final', quality: '传说' });
  else if (action === 'speed') { state.speed = Number(value); render(); }
  else if (action === 'pause') { state.battle.paused = !state.battle.paused; render(); }
  else if (action === 'play-card') {
    const result = playCard(state.battle, id); if (!result.ok) notify(result.reason); else render();
  }
  else if (action === 'battle-result') resolveBattleResult();
  else if (action === 'take-accessory') { if (addAccessory(state.run, state.reward.accessory)) { state.reward.accessory = null; notify('饰品已入队伍栏位。'); } else notify('饰品栏位已满。'); persist(); }
  else if (action === 'reward-add') { upgradeOrAdd(state.run, id, 'add'); persist(); proceedAfterReward(); }
  else if (action === 'reward-upgrade') { if (upgradeOrAdd(state.run, id, 'upgrade')) { persist(); proceedAfterReward(); } else notify('没有可与新卡合成的同名同级卡。'); }
  else if (action === 'skip-reward') proceedAfterReward();
  else if (action === 'buy-card') {
    const card = state.shop.cards[Number(button.dataset.index)]; const cost = card.level === 2 ? 72 : 46;
    buy(cost, () => { upgradeOrAdd(state.run, card.id); state.shop.cards.splice(Number(button.dataset.index), 1); });
  }
  else if (action === 'buy-accessory') {
    const acc = state.shop.accessory; const cost = [45, 75, 120][acc.tier - 1];
    buy(cost, () => { if (!addAccessory(state.run, acc)) return false; state.shop.accessory = null; return true; });
  }
  else if (action === 'shop-remove') buy(55, () => {
    const removable = state.run.deck.findIndex((card) => !cardOf(card)?.tags?.includes('永恒') && !cardOf(card)?.partner);
    if (removable >= 0) state.run.deck.splice(removable, 1);
  });
  else if (action === 'shop-recycle') {
    const index = state.run.accessories.findIndex((acc) => !acc.owner && !acc.id.startsWith('identity-'));
    if (index < 0) notify('没有可回收的常规饰品。'); else { state.run.accessories.splice(index, 1); state.run.coins += 35; persist(); render(); }
  }
  else if (action === 'shop-refresh') {
    const cost = 25 + state.shop.refreshed * 15; buy(cost, () => { state.shop.cards = rewardCards(state.run).slice(0, 2); state.shop.accessory = sample(ACCESSORIES); state.shop.refreshed += 1; });
  }
  else if (action === 'leave-node') completeNode(1);
  else if (action === 'camp-dig') { const acc = sample(ACCESSORIES); if (!addAccessory(state.run, acc)) state.run.coins += 65; completeNode(2); }
  else if (action === 'camp-warm') completeNode(3);
  else if (action === 'camp-hammer') {
    const candidates = state.run.deck.filter((instance) => cardOf(instance)?.level > 0 && !cardOf(instance)?.partner);
    const target = sample(candidates);
    if (target) {
      const card = cardOf(target); const stems = ['strike', 'heavy', 'guard', 'weak', 'inspire', 'vulnerable', 'energy', 'prepare', 'forge'];
      target.cardId = `${sample(stems)}-${card.level}`; delete target.card; notify(`锤声落下，${card.name}已重铸。`);
    }
    completeNode(2);
  }
  else if (action === 'event-option') {
    const index = Number(button.dataset.index);
    if (index === 0) state.run.coins += 45 + state.run.stageIndex * 20;
    else if (index === 1) { state.run.maxHp += 8; state.run.coins += 20; }
    else { const die = Math.min(6, 1 + Math.floor(Math.random() * 6) + (state.run.identityId === 'plank' ? 1 : 0)); state.run.coins += die * 15; notify(`骰子落为 ${die} 点。`); }
    completeNode(1);
  }
  else if (action === 'take-treasure') {
    const item = state.treasure[Number(button.dataset.index)]; state.run.coins += item.coins;
    if (item.accessory) addAccessory(state.run, item.accessory); if (item.card) upgradeOrAdd(state.run, item.card.id); completeNode(1);
  }
  else if (action === 'deck' || action === 'inventory') { state.screen = action; render(); }
  else if (action === 'route' || action === 'back-adventure') { state.screen = state.run.domainsDone.length >= 3 && !state.run.currentDomainId ? 'final-gate' : 'adventure'; render(); }
  else if (action === 'codex') { state.screen = 'inventory'; render(); }
});

app.addEventListener('pointerdown', (event) => {
  const card = event.target.closest('.battle-card');
  if (!card || state.screen !== 'battle') return;
  state.drag = { element: card, id: card.dataset.id, x: event.clientX, y: event.clientY };
  card.setPointerCapture?.(event.pointerId); card.classList.add('dragging');
});

app.addEventListener('pointermove', (event) => {
  if (!state.drag) return;
  const dx = event.clientX - state.drag.x; const dy = Math.min(15, event.clientY - state.drag.y);
  state.drag.element.style.transform = `translate(${dx * .2}px, ${dy}px) rotate(${dx * .025}deg)`;
});

app.addEventListener('pointerup', (event) => {
  if (!state.drag) return;
  const drag = state.drag; state.drag = null;
  drag.element.classList.remove('dragging'); drag.element.style.transform = '';
  if (event.clientY - drag.y < -55) { event.preventDefault(); const result = playCard(state.battle, drag.id); if (!result.ok) notify(result.reason); else render(); }
});

function frame(now) {
  const elapsed = Math.min(.25, (now - state.lastFrame) / 1000); state.lastFrame = now;
  if (state.screen === 'battle' && state.battle && !state.battle.result && !state.battle.paused) {
    let remaining = elapsed * state.speed * (state.drag ? .25 : 1);
    while (remaining > 0) { const step = Math.min(.1, remaining); tickBattle(state.battle, step); remaining -= step; }
    if (now - state.lastPaint > 60 || state.battle.result) { state.lastPaint = now; renderBattle(); }
  }
  requestAnimationFrame(frame);
}

render();
requestAnimationFrame(frame);

import { ACCESSORIES, BASE_ATTACK, CARDS, DOMAINS, ELITES, ENEMIES, IDENTITIES, PARTNERS } from './data.js';

let uidCounter = 1;
export const uid = () => `u${Date.now().toString(36)}${uidCounter++}`;
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const round = (n) => Math.max(0, Math.round(n));
export const sample = (items) => items[Math.floor(Math.random() * items.length)];

export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickUnique(items, count) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

export function makeCard(cardId, overrides = {}) {
  return { uid: uid(), cardId, ...overrides };
}

export function cardOf(instance) {
  return instance.card || CARDS[instance.cardId];
}

export function createRun(identityId = 'atek') {
  const identity = IDENTITIES.find((item) => item.id === identityId) || IDENTITIES[0];
  let maxHp = identity.passive === 'balance' ? 100 : 100;
  const run = {
    identityId: identity.id,
    coins: 80 + (identity.coins || 0),
    xp: 0,
    level: 0,
    maxHp,
    stones: 9,
    stoneDamage: 0,
    desperation: false,
    deck: identity.deck.map((id) => makeCard(id)),
    partners: [],
    accessories: identity.relic === '空槽' ? [] : [{ id: `identity-${identity.id}`, name: identity.relic, tier: 1, special: true, owner: 'main', text: identity.text }],
    domainsDone: [],
    stageIndex: 0,
    explorationIndex: 0,
    eliteIndex: 0,
    battleWins: 0,
    history: [],
    completed: false,
    loop: 1
  };
  if (identity.passive === 'balance') {
    run.deck = run.deck.map((c) => ({ ...c, balance: true }));
  }
  return run;
}

export function gainXp(run, amount) {
  const before = run.level;
  run.xp += amount;
  run.level = Math.floor(run.xp / 3);
  const gained = run.level - before;
  if (gained > 0) {
    const belt = run.accessories.some((a) => a.id === 'belt');
    const hpGain = round(gained * 4 * (belt ? 1.25 : 1));
    run.maxHp += hpGain;
    for (let level = before + 1; level <= run.level; level++) {
      if (level % 3 === 0) run.coins += 30 + 10 * (level / 3);
    }
  }
  return gained;
}

export function addPartner(run, partnerId) {
  if (run.partners.includes(partnerId)) return;
  const partner = PARTNERS.find((p) => p.id === partnerId);
  if (!partner) return;
  run.partners.push(partnerId);
  run.deck.push(makeCard(`partner-${partner.id}`, { card: { ...partner.card, id: `partner-${partner.id}`, category: '伙伴', level: 0, desc: describeEffects(partner.card.effects) } }));
  run.accessories.push({ id: `partner-${partner.id}`, name: `${partner.name}的专属饰品`, tier: 2, special: true, owner: partner.id, text: `${partner.name}的战斗被动。` });
}

export function describeEffects(effects = []) {
  return effects.map((effect) => {
    if (effect.type === 'damage') return `造成${effect.hits || 1}×${effect.value}伤害`;
    if (effect.type === 'shield') return `获得${effect.value}护盾`;
    if (effect.type === 'heal') return `恢复${effect.value}生命`;
    if (effect.type === 'poison') return `施加${effect.value}毒伤`;
    if (effect.type === 'fire') return `施加${effect.value}火伤`;
    if (effect.type === 'slow') return `施加${effect.value}层减速`;
    if (effect.type === 'interrupt') return '打断当前行动';
    if (effect.type === 'cleanse') return '净化1种状态';
    if (effect.type === 'charge') return `推进${effect.value * 100}%充能`;
    return effect.type;
  }).join('，');
}

export function addAccessory(run, accessory) {
  if (!accessory) return false;
  const units = ['main', ...run.partners];
  const owner = accessory.owner || units.find((unit) => run.accessories.filter((item) => item.owner === unit).length < 3);
  if (!owner || run.accessories.filter((item) => item.owner === owner).length >= 3) return false;
  if (run.accessories.some((item) => item.owner === owner && item.id === accessory.id)) return false;
  run.accessories.push({ ...accessory, owner });
  if (accessory.id === 'pear') run.maxHp += 20;
  if (accessory.id === 'belt') run.maxHp = round(run.maxHp * 1.25);
  return true;
}

export function stormCumulative(maxHp, time) {
  const u = clamp(time - 30, 0, 30);
  return maxHp * u * u / 900;
}

export function qualityConfig(quality = '普通') {
  if (quality === '传说') return { hp: 1.35, damage: 1.2, speed: 1.08, reward: 1.8 };
  if (quality === '稀有') return { hp: 1.18, damage: 1.1, speed: 1.04, reward: 1.35 };
  return { hp: 1, damage: 1, speed: 1, reward: 1 };
}

const BOSS_HP = {
  mirror: [590, 1060, 1650], ridge: [700, 1260, 1960], ember: [650, 1170, 1820], pian: [575, 1035, 1610],
  pine: [680, 1225, 1905], white: [610, 1098, 1708], books: [640, 1152, 1792], tide: [660, 1188, 1848], heian: [620, 1116, 1736]
};

function bossActions(domain) {
  const common = [{ name: '显律', time: 5.5, damage: [.72, .72, .72] }];
  const map = {
    mirror: [{ name: '镀镜', time: 5, shield: [35, 64, 100], interruptible: true }, { name: '照骨', time: 7, damage: [1.15, 1.15, 1.15], interruptible: true }],
    ridge: [{ name: '直拳', time: 6, damage: [.9, .9, .9] }, { name: '断岭', time: 8, damage: [1.7, 1.7, 1.7], fire: [3, 5, 7], interruptible: true }],
    ember: [{ name: '转场', time: 6, damage: [.55, .55, .55], fire: [4, 6, 8] }, { name: '终幕', time: 9, damage: [1.7, 1.7, 1.7], interruptible: true }],
    pian: [{ name: '关闸', time: 5, shield: [40, 75, 115], chargeDown: .5, interruptible: true }, { name: '过载束', time: 8, damage: [1.45, 1.45, 1.45], interruptible: true }],
    pine: [{ name: '尝味', time: 5, damage: [.6, .6, .6] }, { name: '饕宴', time: 8, damage: [.52, .52, .52], hits: 3, interruptible: true }],
    white: [{ name: '白蚀', time: 6, damage: [.7, .7, .7], poison: [2, 2, 3] }, { name: '彻底洗白', time: 9, heal: [55, 100, 155], interruptible: true }],
    books: [{ name: '戒尺', time: 6, damage: [.85, .85, .85] }, { name: '定论', time: 8, damage: [1.6, 1.6, 1.6], interruptible: true }],
    tide: [{ name: '潮音', time: 6, damage: [.8, .8, .8], slow: 1 }, { name: '万声归潮', time: 8, damage: [1.5, 1.5, 1.5], interruptible: true }],
    heian: [{ name: '昼斩', time: 6, damage: [1, 1, 1] }, { name: '明暗一刀', time: 8, damage: [1.65, 1.65, 1.65], interruptible: true }]
  };
  return [...common, ...(map[domain.id] || map.mirror)];
}

function finalEnemy(stones) {
  const lost = 9 - stones;
  const tier = lost >= 9 ? 3 : lost >= 6 ? 2 : lost >= 3 ? 1 : 0;
  const hp = [3720, 4020, 4320, 4650][tier];
  const attack = [116, 125, 135, 145][tier];
  return {
    id: 'forty-eight', name: '48兵', sigil: '卌', hp: [hp, hp, hp], baseAttack: attack,
    actions: [
      { name: '问', time: 5, damage: [.55, .55, .55] },
      { name: '承', time: 6, shield: [260, 260, 260] },
      { name: '证', time: 6, damage: [.85, .85, .85], fire: [4, 4, 4] },
      { name: '决', time: 8, damage: [1.45, 1.45, 1.45], interruptible: true }
    ]
  };
}

export function createBattle(run, { kind = 'normal', quality = '普通', domainId, enemyId } = {}) {
  const stage = clamp(run.stageIndex, 0, 2);
  const domain = DOMAINS.find((d) => d.id === domainId) || DOMAINS[0];
  let template;
  if (kind === 'boss') {
    template = { id: `boss-${domain.id}`, name: domain.boss, sigil: domain.sigil, hp: BOSS_HP[domain.id], actions: bossActions(domain) };
  } else if (kind === 'final') {
    template = finalEnemy(run.stones);
  } else {
    const pool = kind === 'elite' ? ELITES : ENEMIES;
    template = pool.find((e) => e.id === enemyId) || sample(pool);
  }
  const q = qualityConfig(quality);
  const maxHp = round(template.hp[stage] * (kind === 'boss' || kind === 'final' ? 1 : q.hp));
  const baseAttack = template.baseAttack || BASE_ATTACK[kind === 'boss' ? 'boss' : kind === 'elite' ? 'elite' : kind === 'final' ? 'final' : 'normal'][stage];
  const deck = shuffle(run.deck.map((c) => ({ ...c, uid: uid() })));
  const solid = deck.filter((c) => cardOf(c)?.tags?.includes('固有'));
  const rest = deck.filter((c) => !cardOf(c)?.tags?.includes('固有'));
  const battle = {
    kind, quality, domain, stage, time: 0, result: null, paused: false,
    player: { maxHp: run.maxHp, hp: run.maxHp, shield: 0, energy: 0, charge: 0, strength: 0, inspire: 0, poison: 0, fire: 0, healPenalty: 0 },
    enemy: {
      id: template.id, name: template.name, sigil: template.sigil, maxHp, hp: maxHp,
      shield: round((template.startShield?.[stage] || 0) * q.hp), poison: 0, fire: 0, vulnerable: 0, weak: 0, slow: 0,
      actions: template.actions, actionIndex: 0, progress: 0, actionCount: 0, baseAttack, damageMultiplier: q.damage, speedMultiplier: q.speed, scaleBonus: 0
    },
    drawPile: [...solid, ...shuffle(rest)], discardPile: [], exhaustPile: [], hand: [],
    poisonClock: 0, fireClock: 0, potClock: 0, lastDamagedAt: 0, stormAppliedPlayer: 0, stormAppliedEnemy: 0,
    log: [`进入${domain.name}，${domain.tide}生效。`, `${template.name}显露意图。`],
    partnerCharge: Object.fromEntries(run.partners.map((id) => [id, 0])),
    cardsPlayed: 0, sameCategory: null, sameCategoryCount: 0, lastHitAt: -99,
    tailReady: run.accessories.some((a) => a.id === 'tail') && !run.tailUsed, stormShellReady: run.accessories.some((a) => a.id === 'storm'),
    finalRevived: false, pearReady: run.accessories.some((a) => a.id === 'pear'), lanternReady: run.accessories.some((a) => a.id === 'lantern'),
    run
  };
  if (run.desperation) {
    battle.player.energy = 1;
  }
  if (run.accessories.some((a) => a.id === 'anchor')) battle.player.shield += 35;
  if (run.accessories.some((a) => a.id === 'lantern')) battle.player.energy += 1;
  if (run.accessories.some((a) => a.id === 'mask')) battle.enemy.weak = 4;
  if (run.accessories.some((a) => a.id === 'funnel')) battle.enemy.poison = 3;
  drawCards(battle, 3);
  return battle;
}

export function currentIntent(battle) {
  return battle.enemy.actions[battle.enemy.actionIndex % battle.enemy.actions.length];
}

export function drawCards(battle, count) {
  for (let i = 0; i < count; i++) {
    if (!battle.drawPile.length && battle.discardPile.length) {
      battle.drawPile = shuffle(battle.discardPile);
      battle.discardPile = [];
    }
    const next = battle.drawPile.shift();
    if (next) battle.hand.push(next);
  }
}

export function calculateDirectDamage(base, hits, battle, source = 'player', effectMultiplier = 1) {
  const isPlayer = source === 'player';
  const strength = isPlayer ? battle.player.strength : 0;
  const selfBuff = isPlayer && battle.player.inspire > 0 ? 1.25 : 1;
  const targetBuff = isPlayer && battle.enemy.vulnerable > 0 ? 1.25 : 1;
  const weak = !isPlayer && battle.enemy.weak > 0 ? .75 : 1;
  const desperation = isPlayer && battle.run.desperation ? 1.5 : 1;
  const day = battle.domain.id === 'heian' && Math.floor(battle.time / 10) % 2 === 0 ? 1.15 : 1;
  const totalPerHit = round((base + strength) * selfBuff * targetBuff * weak * desperation * day * effectMultiplier);
  return { perHit: totalPerHit, total: totalPerHit * (hits || 1) };
}

export function applyIncoming(target, amount, { pierce = false } = {}) {
  let remaining = round(amount);
  let blocked = 0;
  if (!pierce && target.shield > 0) {
    blocked = Math.min(target.shield, remaining);
    target.shield -= blocked;
    remaining -= blocked;
  }
  target.hp = Math.max(0, target.hp - remaining);
  return { blocked, hpLoss: remaining };
}

function pushLog(battle, text) {
  battle.log.unshift(text);
  battle.log = battle.log.slice(0, 5);
}

function discardCard(battle, instance) {
  const c = cardOf(instance);
  if (c?.tags?.includes('负面')) {
    battle.player.charge = Math.max(0, battle.player.charge - .5);
    pushLog(battle, `${c.name}被弃置，命潮倒退。`);
  }
  if (c?.tags?.includes('虚无') || c?.tags?.includes('消耗')) battle.exhaustPile.push(instance);
  else battle.discardPile.push(instance);
}

function ultimateFor(partnerId) {
  const partner = PARTNERS.find((p) => p.id === partnerId);
  const effects = partnerId === 'zarya'
    ? [{ type: 'interrupt', value: 1 }, { type: 'slow', value: 2 }]
    : partnerId === 'orisa'
      ? [{ type: 'damage', value: 120 }]
      : partnerId === 'nahida'
        ? [{ type: 'poison', value: 5 }, { type: 'catalyst', value: 1 }, { type: 'heal', value: 24 }]
        : [{ type: 'damage', value: 100 }, { type: 'inspire', value: 4 }];
  return makeCard(`ultimate-${partnerId}`, { card: { id: `ultimate-${partnerId}`, name: `${partner?.sigil || '绝'}·绝技`, category: '伙伴绝技', level: 0, cost: 1, desc: describeEffects(effects), effects, tags: ['永恒', '固有', '消耗', '绝技'], ultimate: partnerId } });
}

function effectMultiplierForTide(battle, card) {
  let multiplier = 1;
  battle.cardsPlayed += 1;
  if (battle.domain.id === 'ember' && battle.cardsPlayed % 3 === 0) multiplier *= 1.25;
  if (battle.domain.id === 'books') {
    if (battle.sameCategory === card.category) battle.sameCategoryCount += 1;
    else { battle.sameCategory = card.category; battle.sameCategoryCount = 1; }
    if (battle.sameCategoryCount === 3) { multiplier *= 1.25; battle.sameCategoryCount = 0; }
  }
  return multiplier;
}

export function playCard(battle, instanceId) {
  if (battle.result || battle.paused) return { ok: false, reason: '战斗未处于可操作状态' };
  const index = battle.hand.findIndex((c) => c.uid === instanceId);
  if (index < 0) return { ok: false, reason: '卡牌不在手牌中' };
  const instance = battle.hand[index];
  const card = cardOf(instance);
  if (!card || card.tags?.includes('负面')) return { ok: false, reason: '该牌不能主动打出' };
  if (battle.player.energy + 1e-6 < card.cost) return { ok: false, reason: '命潮不足' };
  const playedFromFullEnergy = battle.player.energy >= 3;
  battle.player.energy -= card.cost;
  const mult = effectMultiplierForTide(battle, card) * (instance.balance && ['打击', '防御'].includes(card.category) ? 1.25 : 1);
  for (const effect of card.effects || []) {
    const value = round((effect.value || 0) * mult);
    if (effect.type === 'damage') {
      const bonus = effect.type === 'intentBonus' && battle.enemy.progress > .5 ? effect.value : 0;
      const damage = calculateDirectDamage((effect.value || 0) + bonus, effect.hits || 1, battle, 'player', mult);
      const beforeShield = battle.enemy.shield;
      const dealt = applyIncoming(battle.enemy, damage.total);
      if (beforeShield > 0 && battle.enemy.shield === 0 && battle.domain.id === 'mirror') battle.player.inspire = Math.max(battle.player.inspire, 4);
      pushLog(battle, `${card.name}造成${damage.total}伤害${dealt.blocked ? `（格挡${dealt.blocked}）` : ''}。`);
    } else if (effect.type === 'intentBonus' && battle.enemy.progress > .5) {
      const damage = calculateDirectDamage(value, 1, battle, 'player', 1);
      applyIncoming(battle.enemy, damage.total);
      pushLog(battle, `${card.name}追击意图，追加${damage.total}伤害。`);
    } else if (effect.type === 'shield') {
      const night = battle.domain.id === 'heian' && Math.floor(battle.time / 10) % 2 === 1 ? 1.15 : 1;
      battle.player.shield += round(value * night);
    } else if (effect.type === 'heal') {
      const night = battle.domain.id === 'heian' && Math.floor(battle.time / 10) % 2 === 1 ? 1.15 : 1;
      const healing = round(value * night * (battle.player.healPenalty ? .5 : 1));
      const missing = battle.player.maxHp - battle.player.hp;
      battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + healing);
      if (healing > missing && battle.pearReady) { battle.player.shield += 20; battle.pearReady = false; }
    } else if (effect.type === 'weak') battle.enemy.weak += value;
    else if (effect.type === 'vulnerable') battle.enemy.vulnerable += value;
    else if (effect.type === 'inspire') battle.player.inspire += value;
    else if (effect.type === 'strength') battle.player.strength += value;
    else if (effect.type === 'slow') battle.enemy.slow += value * 4;
    else if (effect.type === 'poison') battle.enemy.poison = clamp(battle.enemy.poison + value, 0, 9);
    else if (effect.type === 'fire') battle.enemy.fire += value;
    else if (effect.type === 'energy') battle.player.energy = Math.min(3, battle.player.energy + value);
    else if (effect.type === 'charge') battle.player.charge = clamp(battle.player.charge + effect.value, 0, 1);
    else if (effect.type === 'interrupt') {
      const intent = currentIntent(battle);
      if (intent.interruptible) { battle.enemy.progress = 0; battle.enemy.actionIndex += 1; pushLog(battle, `${intent.name}被打断。`); }
    } else if (effect.type === 'cleanse') {
      if (battle.player.poison) battle.player.poison = 0;
      else if (battle.player.fire) battle.player.fire = 0;
      else battle.player.healPenalty = 0;
    } else if (effect.type === 'generate') battle.drawPile.unshift(makeCard(effect.card));
    else if (effect.type === 'catalyst' && battle.enemy.poison) {
      applyIncoming(battle.enemy, battle.enemy.poison * 5, { pierce: true });
      battle.enemy.poison = Math.max(0, battle.enemy.poison - 1);
    } else if (effect.type === 'refresh') {
      for (const other of battle.hand.filter((c) => c.uid !== instance.uid)) discardCard(battle, other);
      battle.hand = [instance];
    } else if (effect.type === 'restart') {
      battle.drawPile = shuffle([...battle.drawPile, ...battle.discardPile, ...battle.hand.filter((c) => c.uid !== instance.uid)]);
      battle.discardPile = [];
      battle.hand = [instance];
    }
  }

  if (card.partner) {
    const partnerId = instance.cardId.replace('partner-', '');
    battle.partnerCharge[partnerId] = (battle.partnerCharge[partnerId] || 0) + 1;
    if (battle.partnerCharge[partnerId] >= 3) {
      battle.partnerCharge[partnerId] = 0;
      battle.drawPile.unshift(ultimateFor(partnerId));
      pushLog(battle, `${PARTNERS.find((p) => p.id === partnerId)?.name}绝技已置顶。`);
    }
  }

  if (card.ultimate) battle.partnerCharge[card.ultimate] = 0;
  if (playedFromFullEnergy && battle.lanternReady) {
    battle.player.charge = clamp(battle.player.charge + .5, 0, 1);
    battle.lanternReady = false;
    pushLog(battle, '引潮灯照亮，下一点命潮获得推进。');
  }
  const lightweight = card.tags?.includes('轻盈');
  const others = battle.hand.filter((c) => c.uid !== instance.uid);
  battle.hand = [];
  if (!lightweight) others.forEach((c) => discardCard(battle, c));
  else battle.hand.push(...others);
  const consumeTag = card.tags?.find((tag) => tag.startsWith('消耗'));
  const consumeLimit = consumeTag ? Number(consumeTag.replace('消耗', '')) || 1 : 0;
  const remainingUses = instance.remainingUses ?? consumeLimit;
  if (consumeTag && remainingUses <= 1) battle.exhaustPile.push(instance);
  else {
    if (consumeTag) instance.remainingUses = remainingUses - 1;
    battle.discardPile.push(instance);
  }
  drawCards(battle, lightweight ? 1 : 3);
  checkBattleEnd(battle);
  return { ok: true };
}

function resolveEnemyAction(battle) {
  const enemy = battle.enemy;
  const action = currentIntent(battle);
  const stage = battle.stage;
  enemy.actionCount += 1;
  let tideMult = battle.domain.id === 'ember' && enemy.actionCount % 3 === 0 ? 1.25 : 1;
  if (action.damage) {
    const coefficient = action.damage[stage] + (action.scaling ? enemy.scaleBonus : 0);
    const raw = enemy.baseAttack * coefficient * enemy.damageMultiplier;
    const damage = calculateDirectDamage(raw, action.hits || 1, battle, 'enemy', tideMult);
    const result = applyIncoming(battle.player, damage.total);
    if (result.hpLoss > 0) { battle.lastDamagedAt = battle.time; battle.potClock = 0; }
    pushLog(battle, `${enemy.name}·${action.name}造成${damage.total}伤害${result.blocked ? `（护盾承受${result.blocked}）` : ''}。`);
    if (action.scaling) enemy.scaleBonus = Math.min(.6, enemy.scaleBonus + action.scaling);
  }
  if (action.shield) {
    enemy.shield += round(action.shield[stage] * tideMult);
    if (battle.run.accessories.some((item) => item.id === 'funnel')) enemy.poison = clamp(enemy.poison + 1, 0, 9);
  }
  if (action.heal) enemy.hp = Math.min(enemy.maxHp, enemy.hp + round(action.heal[stage] * (enemy.fire > 0 ? .5 : 1) * tideMult));
  if (action.poison) battle.player.poison = clamp(battle.player.poison + action.poison[stage], 0, 9);
  if (action.fire) { battle.player.fire += action.fire[stage]; battle.player.healPenalty = Math.max(battle.player.healPenalty, action.fire[stage] * 2); }
  if (action.slow) battle.player.charge = Math.max(0, battle.player.charge - .25 * action.slow);
  if (action.weak) battle.player.inspire = Math.max(0, battle.player.inspire - action.weak);
  if (action.chargeDown) battle.player.charge = Math.max(0, battle.player.charge - action.chargeDown);
  if (action.wound && battle.drawPile.filter((c) => c.cardId === action.wound).length < 2) battle.discardPile.push(makeCard(action.wound));
  if (enemy.actionCount === 1 && battle.run.accessories.some((item) => item.id === 'anchor') && battle.player.shield > 0) battle.player.shield += 15;
  if (enemy.actionCount === 1 && battle.run.accessories.some((item) => item.id === 'mask') && enemy.weak > 0) enemy.slow += 4;
  enemy.actionIndex = (enemy.actionIndex + 1) % enemy.actions.length;
  enemy.progress = 0;
}

function applyTimedDamage(battle, dt) {
  battle.poisonClock += dt;
  battle.fireClock += dt;
  if (battle.poisonClock >= 3) {
    battle.poisonClock -= 3;
    if (battle.enemy.poison > 0) { applyIncoming(battle.enemy, battle.enemy.poison * 5, { pierce: true }); battle.enemy.poison -= 1; }
    if (battle.player.poison > 0) { const result = applyIncoming(battle.player, battle.player.poison * 5, { pierce: true }); if (result.hpLoss > 0) { battle.lastDamagedAt = battle.time; battle.potClock = 0; } battle.player.poison -= 1; }
  }
  if (battle.fireClock >= 2) {
    battle.fireClock -= 2;
    if (battle.enemy.fire > 0) { applyIncoming(battle.enemy, battle.enemy.fire * 5); battle.enemy.fire = Math.floor(battle.enemy.fire / 2); }
    if (battle.player.fire > 0) { const result = applyIncoming(battle.player, battle.player.fire * 5); if (result.hpLoss > 0) { battle.lastDamagedAt = battle.time; battle.potClock = 0; } battle.player.fire = Math.floor(battle.player.fire / 2); }
  }
}

function applyStorm(battle) {
  if (battle.time < 30) return;
  if (battle.time < 60 && battle.stormShellReady) {
    battle.player.shield += round(battle.player.maxHp * .5);
    battle.stormShellReady = false;
    pushLog(battle, '风暴壳展开，获得大量护盾。');
  }
  const playerTotal = Math.floor(stormCumulative(battle.player.maxHp, battle.time));
  const enemyTotal = Math.floor(stormCumulative(battle.enemy.maxHp, battle.time));
  const pd = Math.max(0, playerTotal - battle.stormAppliedPlayer);
  const ed = Math.max(0, enemyTotal - battle.stormAppliedEnemy);
  if (pd > 0) { const result = applyIncoming(battle.player, pd); if (result.hpLoss > 0) { battle.lastDamagedAt = battle.time; battle.potClock = 0; } }
  if (ed > 0) applyIncoming(battle.enemy, ed);
  battle.stormAppliedPlayer = playerTotal;
  battle.stormAppliedEnemy = enemyTotal;
  if (battle.time >= 60) {
    battle.player.healPenalty = 1;
    const segment = Math.floor((battle.time - 60) / 5);
    const rate = .10 + .05 * segment;
    const stormReduction = battle.time < 65 && battle.run.accessories.some((item) => item.id === 'storm') ? .5 : 1;
    const result = applyIncoming(battle.player, battle.player.maxHp * rate * .1 * stormReduction, { pierce: true });
    if (result.hpLoss > 0) { battle.lastDamagedAt = battle.time; battle.potClock = 0; }
    applyIncoming(battle.enemy, battle.enemy.maxHp * rate * .1, { pierce: true });
  }
}

function checkBattleEnd(battle) {
  if (battle.enemy.hp <= 0 && battle.kind === 'final' && battle.run.loop >= 9 && !battle.finalRevived) {
    battle.finalRevived = true;
    battle.enemy.hp = round(battle.enemy.maxHp * .5);
    battle.enemy.shield = 0;
    battle.enemy.poison = 0;
    battle.enemy.fire = 0;
    battle.enemy.progress = 0;
    battle.enemy.speedMultiplier *= 1.2;
    pushLog(battle, '太阳升起。48兵忘掉昨日，以半数生命复归。');
  } else if (battle.enemy.hp <= 0 && battle.player.hp <= 0) battle.result = 'victory';
  else if (battle.enemy.hp <= 0) battle.result = 'victory';
  else if (battle.player.hp <= 0) {
    if (battle.tailReady) {
      battle.tailReady = false;
      battle.run.tailUsed = true;
      battle.player.hp = round(battle.player.maxHp * .35);
      battle.player.poison = 0; battle.player.fire = 0; battle.player.healPenalty = 0;
      if (currentIntent(battle).interruptible) { battle.enemy.progress = 0; battle.enemy.actionIndex = (battle.enemy.actionIndex + 1) % battle.enemy.actions.length; }
      pushLog(battle, '蜥蜴断尾断裂，你从致死伤中复归。');
    } else battle.result = 'defeat';
  }
}

export function tickBattle(battle, dt) {
  if (battle.result || battle.paused || dt <= 0) return battle;
  const safeDt = Math.min(dt, .1);
  battle.time += safeDt;
  const chargeSpeed = battle.time >= 60 ? 2 : battle.time >= 30 ? 1.5 : 1;
  const desperation = battle.run.desperation ? 1.5 : 1;
  battle.player.charge += safeDt / 2 * chargeSpeed * desperation;
  while (battle.player.charge >= 1 && battle.player.energy < 3) {
    battle.player.charge -= 1;
    battle.player.energy += 1;
  }
  if (battle.player.energy >= 3) battle.player.charge = 0;
  battle.player.inspire = Math.max(0, battle.player.inspire - safeDt);
  battle.player.healPenalty = Math.max(0, battle.player.healPenalty - safeDt);
  battle.enemy.vulnerable = Math.max(0, battle.enemy.vulnerable - safeDt);
  battle.enemy.weak = Math.max(0, battle.enemy.weak - safeDt);
  battle.enemy.slow = Math.max(0, battle.enemy.slow - safeDt);
  const speed = battle.enemy.speedMultiplier * (battle.enemy.slow > 0 ? .7 : 1);
  battle.enemy.progress += safeDt * speed / currentIntent(battle).time;
  if (battle.enemy.progress >= 1) resolveEnemyAction(battle);
  if (battle.run.accessories.some((item) => item.id === 'pot') && battle.time - battle.lastDamagedAt >= 6) {
    battle.potClock += safeDt;
    while (battle.potClock >= 2) {
      battle.potClock -= 2;
      battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + (battle.player.healPenalty ? 3 : 6));
    }
  }
  applyTimedDamage(battle, safeDt);
  applyStorm(battle);
  checkBattleEnd(battle);
  return battle;
}

export function rollQuality(run, bonus = 0) {
  let roll = 1 + Math.floor(Math.random() * 6);
  if (run.level >= 9) roll += 1;
  if (run.level >= 18) roll += 1;
  if (run.identityId === 'plank') roll += 1;
  roll = clamp(roll + bonus, 1, 6);
  return roll >= 6 ? '传说' : roll >= 4 ? '稀有' : '普通';
}

export function battleReward(run, battle) {
  const stageCoins = battle.kind === 'boss' ? [90, 140, 210] : battle.kind === 'elite' ? [55, 85, 120] : [28, 44, 62];
  const q = qualityConfig(battle.quality);
  const won = battle.result === 'victory';
  const coins = round(stageCoins[battle.stage] * q.reward * (won ? 1 : battle.kind === 'normal' ? .4 : .5));
  run.coins += coins;
  gainXp(run, 1);
  if (won) { run.battleWins += 1; return { coins, cards: rewardCards(run), accessory: battle.kind !== 'normal' ? sample(ACCESSORIES) : null }; }
  if (battle.kind === 'elite' || battle.kind === 'boss') {
    const damage = battle.stage + 1;
    run.stoneDamage += damage;
    if (run.stoneDamage === 9) { run.stones = 0; run.desperation = true; }
    else if (run.stoneDamage > 9) run.completed = 'failed';
    else run.stones = 9 - run.stoneDamage;
  }
  return { coins, cards: [], accessory: null };
}

export function rewardCards(run) {
  const stageChance = [.2, .4, .6][clamp(run.stageIndex, 0, 2)];
  const categoryStem = { '打击': 'strike', '重击': 'heavy', '防御': 'guard', '虚弱': 'weak', '鼓舞': 'inspire', '易伤': 'vulnerable', '能量': 'energy', '整备': 'prepare', '锻造': 'forge' };
  return pickUnique(Object.keys(categoryStem), 3).map((category) => {
    const level = Math.random() < stageChance ? 2 : 1;
    return CARDS[`${categoryStem[category]}-${level}`];
  });
}

export function upgradeOrAdd(run, cardId, mode = 'add') {
  const card = CARDS[cardId];
  if (!card) return false;
  if (mode === 'upgrade') {
    const candidate = run.deck.find((c) => cardOf(c)?.category === card.category && cardOf(c)?.level === card.level && card.level < 3);
    if (candidate) {
      const stem = candidate.cardId.replace(/-\d$/, '');
      candidate.cardId = `${stem}-${Math.min(3, card.level + 1)}`;
      delete candidate.card;
      return true;
    }
  }
  run.deck.push(makeCard(cardId));
  return true;
}

export function saveRun(run) {
  localStorage.setItem('sanyichuan-run', JSON.stringify(run));
}

export function loadRun() {
  try { return JSON.parse(localStorage.getItem('sanyichuan-run') || 'null'); } catch { return null; }
}

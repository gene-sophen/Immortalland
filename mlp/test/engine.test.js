import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSORIES, CARDS } from '../src/data.js';
import {
  addAccessory, createBattle, createRun, gainXp, makeCard, playCard, rewardCards,
  stormCumulative, tickBattle
} from '../src/engine.js';

test('初始身份生成正确的牌组与资源', () => {
  const run = createRun('atek');
  assert.equal(run.deck.length, 10);
  assert.equal(run.maxHp, 100);
  assert.equal(run.stones, 9);
  assert.equal(run.coins, 80);
});

test('等级每3经验提升，并增加生命上限', () => {
  const run = createRun();
  gainXp(run, 2);
  assert.equal(run.level, 0);
  gainXp(run, 1);
  assert.equal(run.level, 1);
  assert.equal(run.maxHp, 104);
});

test('诅咒风暴30到60秒累计为100%最大生命', () => {
  assert.equal(stormCumulative(100, 30), 0);
  assert.equal(stormCumulative(100, 45), 25);
  assert.equal(stormCumulative(100, 60), 100);
  assert.equal(stormCumulative(100, 90), 100);
});

test('轻盈牌打出时保留其余两张并补一张', () => {
  const run = createRun();
  const battle = createBattle(run, { enemyId: 'raider' });
  battle.hand = [makeCard('energy-3'), makeCard('strike-1'), makeCard('guard-1')];
  battle.drawPile = [makeCard('strike-2')];
  battle.player.energy = 0;
  const result = playCard(battle, battle.hand[0].uid);
  assert.equal(result.ok, true);
  assert.equal(battle.hand.length, 3);
  assert.equal(battle.exhaustPile.length, 1);
  assert.equal(battle.player.charge, 1);
});

test('消耗2允许使用两次后才移出本场战斗', () => {
  const run = createRun();
  const battle = createBattle(run, { enemyId: 'raider' });
  const card = makeCard('guard-3');
  battle.hand = [card];
  battle.player.energy = 3;
  playCard(battle, card.uid);
  assert.equal(battle.exhaustPile.length, 0);
  assert.equal(battle.discardPile.some((item) => item.uid === card.uid), true);
  battle.hand = [battle.discardPile.pop()];
  battle.player.energy = 3;
  playCard(battle, card.uid);
  assert.equal(battle.exhaustPile.some((item) => item.uid === card.uid), true);
});

test('同时死亡判定为我方胜利', () => {
  const battle = createBattle(createRun(), { enemyId: 'raider' });
  battle.enemy.hp = 0;
  battle.player.hp = 0;
  tickBattle(battle, .1);
  assert.equal(battle.result, 'victory');
});

test('第九轮回48兵首次死亡以半血复活', () => {
  const run = createRun();
  run.loop = 9;
  const battle = createBattle(run, { kind: 'final' });
  battle.enemy.hp = 0;
  tickBattle(battle, .1);
  assert.equal(battle.result, null);
  assert.equal(battle.finalRevived, true);
  assert.equal(battle.enemy.hp, Math.round(battle.enemy.maxHp * .5));
  battle.enemy.hp = 0;
  tickBattle(battle, .1);
  assert.equal(battle.result, 'victory');
});

test('卡牌奖励三张类别不重复且不直接出现三级牌', () => {
  const cards = rewardCards(createRun());
  assert.equal(cards.length, 3);
  assert.equal(new Set(cards.map((card) => card.category)).size, 3);
  assert.equal(cards.every((card) => card.level === 1 || card.level === 2), true);
});

test('同一携带者不能携带重复饰品', () => {
  const run = createRun('atek');
  const anchor = ACCESSORIES.find((item) => item.id === 'anchor');
  assert.equal(addAccessory(run, anchor), true);
  assert.equal(addAccessory(run, anchor), false);
  assert.equal(run.accessories.filter((item) => item.id === 'anchor').length, 1);
  assert.equal(CARDS['strike-1'].effects[0].value, 30);
});

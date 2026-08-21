export const DOMAINS = [
  { id: 'mirror', name: '镜晶境', stone: '金刚石', boss: '欧金金', sigil: '镜', hue: '#dcecf1', accent: '#75c7d5', tide: '破镜', rule: '护盾被完全击破时，击破者获得4秒裂光。' },
  { id: 'ridge', name: '荒脊岭', stone: '大理石', boss: '沃夫冈', sigil: '脊', hue: '#b34b3f', accent: '#e87b57', tide: '血火秤', rule: '每累计失去20%最大生命，下一次直接伤害强化并附火。' },
  { id: 'ember', name: '火尽山', stone: '戏命石', boss: '异画师', sigil: '幕', hue: '#9b302c', accent: '#ef6b42', tide: '终幕拍', rule: '玩家第3张牌、敌人第3次行动的主效果提高25%。' },
  { id: 'pian', name: '皮安城', stone: '海克石', boss: '维克托', sigil: '械', hue: '#4f9fbd', accent: '#8ed6df', tide: '过载律', rule: '累计恢复3命潮或完成3次行动后，下一主效果强化。' },
  { id: 'pine', name: '松三原', stone: '陶玉石', boss: '食欲饕', sigil: '流', hue: '#b76d48', accent: '#84b8a7', tide: '流势', rule: '3秒内连续伤害从第2段起递增，最高25%。' },
  { id: 'white', name: '过明氹', stone: '降解石', boss: '张学良', sigil: '净', hue: '#d8d5c8', accent: '#c8a955', tide: '净蚀', rule: '主动净化自身状态时，向对方施加1层毒。' },
  { id: 'books', name: '啼亡堆', stone: '科目石', boss: '板蓝根', sigil: '科', hue: '#416b88', accent: '#d2ad62', tide: '进阶', rule: '连续3次同类别牌或同标签行动时，第3次强化25%。' },
  { id: 'tide', name: '潮王原', stone: '卡厄石', boss: '赵元任', sigil: '变', hue: '#745080', accent: '#db7047', tide: '异变潮', rule: '首次同时具有3种状态时，下一行动获得公开异变。' },
  { id: 'heian', name: '平安京', stone: '阴阳石', boss: '妖刀姬', sigil: '阴', hue: '#e9e1ce', accent: '#3b3a44', tide: '昼夜轮', rule: '每10秒昼夜交替；昼强化伤害，夜强化护盾与治疗。' }
];

export const PARTNERS = [
  { id: 'zarya', name: '查莉娅', stone: '大理石', sigil: '岩', line: '承受过的重量，都会变成自己的重量。', card: { name: '岩蓄障', cost: 1, effects: [{ type: 'shield', value: 32 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'orisa', name: '奥丽莎', stone: '金刚石', sigil: '珀', line: '这一次，是我自己的指令。', card: { name: '琥珀身', cost: 1, effects: [{ type: 'heal', value: 24 }, { type: 'cleanse', value: 1 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'leblanc', name: '乐芙兰', stone: '科目石', sigil: '幻', line: '答题超时，与答错同罪。', card: { name: '幻锁链', cost: 1, effects: [{ type: 'damage', value: 24 }, { type: 'slow', value: 1 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'lux', name: '拉克丝', stone: '陶玉石', sigil: '辉', line: '先护住该护的，再让光落下。', card: { name: '辉光障', cost: 1, effects: [{ type: 'shield', value: 24 }, { type: 'slow', value: 1 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'larune', name: '拉露恩', stone: '卡厄石', sigil: '月', line: '潮起用刀，潮落用环。', card: { name: '月武换', cost: 1, effects: [{ type: 'damage', value: 34 }, { type: 'heal', value: 8 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'nyx', name: '倪克斯', stone: '阴阳石', sigil: '夜', line: '白昼同行，黑夜也算。', card: { name: '昼夜生', cost: 1, effects: [{ type: 'damage', value: 18, hits: 2 }, { type: 'heal', value: 12 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'jupiter', name: '朱庇特', stone: '戏命石', sigil: '烬', line: '演出可以落幕，演员不能怯场。', card: { name: '焚幕火', cost: 1, effects: [{ type: 'fire', value: 5 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'furina', name: '芙宁娜', stone: '海克石', sigil: '潮', line: '让潮水照自己的节拍涨落。', card: { name: '潮律曲', cost: 1, effects: [{ type: 'charge', value: 0.5 }, { type: 'heal', value: 16 }], partner: true, tags: ['永恒', '技能'] } },
  { id: 'nahida', name: '纳西妲', stone: '降解石', sigil: '芽', line: '忘记不是净化，生灭才是。', card: { name: '净土芽', cost: 1, effects: [{ type: 'poison', value: 4 }, { type: 'heal', value: 8 }], partner: true, tags: ['永恒', '技能'] } }
];

const deck = (...ids) => ids.flatMap(([id, count]) => Array.from({ length: count }, () => id));

export const IDENTITIES = [
  { id: 'atek', name: '阿泰克', sigil: '攻', relic: '空槽', text: '激进启程', deck: deck(['strike-1', 5], ['heavy-1', 1], ['guard-1', 4]) },
  { id: 'tivand', name: '蒂范德', sigil: '守', relic: '空槽', text: '稳健启程', deck: deck(['guard-1', 5], ['weak-1', 1], ['strike-1', 4]) },
  { id: 'balance', name: '拜冷斯', sigil: '衡', relic: '平衡球', text: '基础打击与防御提高25%', deck: deck(['strike-1', 5], ['guard-1', 5]), passive: 'balance' },
  { id: 'jax', name: '贾克斯', sigil: '兰', relic: '多兰三件', text: '以三个槽位换三张特殊牌', deck: deck(['strike-1', 5], ['guard-1', 5], ['strike-2', 1], ['guard-2', 1], ['energy-2', 1]) },
  { id: 'tf', name: '崔斯特', sigil: '牌', relic: '命运牌匣', text: '额外整备与能量', deck: deck(['strike-1', 5], ['guard-1', 5], ['prepare-1', 1], ['energy-1', 1]) },
  { id: 'mihoyo', name: '咪哈呦', sigil: '鸣', relic: '共鸣晶', text: '源神石数值提高25%', deck: deck(['strike-1', 5], ['guard-1', 5]) },
  { id: 'grandet', name: '葛朗台', sigil: '财', relic: '聚宝契据', text: '+220纽币，但携带贪婪', deck: deck(['strike-1', 5], ['guard-1', 5], ['greed', 1]), coins: 220 },
  { id: 'plank', name: '普朗克', sigil: '骰', relic: '铅骰子', text: '骰点最终+1', deck: deck(['strike-1', 5], ['guard-1', 5]), passive: 'loaded-die' },
  { id: 'admin', name: '艾德明', sigil: '钥', relic: '管理员的钥匙', text: '没有效果，只占一个槽位', deck: deck(['strike-1', 5], ['guard-1', 5]) }
];

const card = (id, name, category, level, cost, desc, effects, tags = []) => ({ id, name, category, level, cost, desc, effects, tags });

export const CARDS = {
  'strike-1': card('strike-1', '打击', '打击', 1, 1, '造成30伤害。', [{ type: 'damage', value: 30 }]),
  'strike-2': card('strike-2', '打击', '打击', 2, 1, '造成45伤害。', [{ type: 'damage', value: 45 }]),
  'strike-3': card('strike-3', '双流击', '打击', 3, 1, '连续造成2次20伤害。', [{ type: 'damage', value: 20, hits: 2 }], ['多段']),
  'heavy-1': card('heavy-1', '重击', '重击', 1, 2, '造成70伤害。', [{ type: 'damage', value: 70 }]),
  'heavy-2': card('heavy-2', '重击', '重击', 2, 2, '造成105伤害。', [{ type: 'damage', value: 105 }]),
  'heavy-3': card('heavy-3', '碎岳锤', '重击', 3, 2, '造成115伤害；敌方行动过半时额外造成25。', [{ type: 'damage', value: 115 }, { type: 'intentBonus', value: 25 }]),
  'guard-1': card('guard-1', '防御', '防御', 1, 1, '获得25护盾。', [{ type: 'shield', value: 25 }]),
  'guard-2': card('guard-2', '防御', '防御', 2, 1, '获得38护盾。', [{ type: 'shield', value: 38 }]),
  'guard-3': card('guard-3', '瞬凝障', '防御', 3, 1, '获得50护盾，本场可消耗2次。', [{ type: 'shield', value: 50 }], ['消耗2']),
  'weak-1': card('weak-1', '虚弱', '虚弱', 1, 1, '施加4秒虚弱。', [{ type: 'weak', value: 4 }]),
  'weak-2': card('weak-2', '虚弱', '虚弱', 2, 1, '施加8秒虚弱。', [{ type: 'weak', value: 8 }]),
  'weak-3': card('weak-3', '断幕令', '虚弱', 3, 1, '施加4秒虚弱并打断当前行动。', [{ type: 'weak', value: 4 }, { type: 'interrupt', value: 1 }]),
  'inspire-1': card('inspire-1', '鼓舞', '鼓舞', 1, 1, '获得4秒鼓舞。', [{ type: 'inspire', value: 4 }]),
  'inspire-2': card('inspire-2', '鼓舞', '鼓舞', 2, 1, '获得8秒鼓舞。', [{ type: 'inspire', value: 8 }]),
  'inspire-3': card('inspire-3', '岩心力', '鼓舞', 3, 1, '永久获得5力量。', [{ type: 'strength', value: 5 }]),
  'vulnerable-1': card('vulnerable-1', '易伤', '易伤', 1, 1, '施加4秒易伤。', [{ type: 'vulnerable', value: 4 }]),
  'vulnerable-2': card('vulnerable-2', '易伤', '易伤', 2, 1, '施加8秒易伤。', [{ type: 'vulnerable', value: 8 }]),
  'vulnerable-3': card('vulnerable-3', '破析击', '易伤', 3, 1, '造成30伤害并施加4秒易伤。', [{ type: 'damage', value: 30 }, { type: 'vulnerable', value: 4 }]),
  'energy-1': card('energy-1', '能量', '能量', 1, 0, '下一点命潮充能推进50%。', [{ type: 'charge', value: 0.5 }], ['消耗']),
  'energy-2': card('energy-2', '能量', '能量', 2, 0, '获得1点命潮。', [{ type: 'energy', value: 1 }], ['消耗']),
  'energy-3': card('energy-3', '燃料', '能量', 3, 0, '轻盈。下一点命潮充能推进100%。', [{ type: 'charge', value: 1 }], ['轻盈', '消耗']),
  'prepare-1': card('prepare-1', '整备', '整备', 1, 0, '刷新本轮手牌。', [{ type: 'refresh', value: 1 }], ['消耗']),
  'prepare-2': card('prepare-2', '整备', '整备', 2, 0, '刷新手牌，本场可使用2次。', [{ type: 'refresh', value: 1 }], ['消耗2']),
  'prepare-3': card('prepare-3', '重启动', '整备', 3, 0, '所有非消耗牌洗回抽牌堆并重新抽取。', [{ type: 'restart', value: 1 }], ['消耗']),
  'forge-1': card('forge-1', '锻造', '锻造', 1, 1, '在抽牌堆生成1张匕首。', [{ type: 'generate', card: 'dagger' }]),
  'forge-2': card('forge-2', '锻造', '锻造', 2, 1, '获得一柄成长利剑。', [{ type: 'generate', card: 'sword' }]),
  'forge-3': card('forge-3', '熔火刃', '锻造', 3, 1, '在抽牌堆生成1张火焰匕首。', [{ type: 'generate', card: 'fire-dagger' }]),
  dagger: card('dagger', '匕首', '衍生', 0, 0, '轻盈。造成10伤害。', [{ type: 'damage', value: 10 }], ['轻盈', '消耗']),
  sword: card('sword', '利剑', '衍生', 0, 1, '固有。造成55伤害。', [{ type: 'damage', value: 55 }], ['固有']),
  'fire-dagger': card('fire-dagger', '火焰匕首', '衍生', 0, 0, '造成10伤害并施加2火伤。', [{ type: 'damage', value: 10 }, { type: 'fire', value: 2 }], ['消耗']),
  greed: card('greed', '贪婪', '负面', 0, 0, '不能打出；弃置时充能进度-50%。', [], ['永恒', '负面'])
};

export const CARD_CATEGORIES = ['打击', '重击', '防御', '虚弱', '鼓舞', '易伤', '能量', '整备', '锻造'];

export const ENEMIES = [
  { id: 'raider', name: '路劫客', sigil: '劫', hp: [210, 420, 660], actions: [{ name: '横刀', time: 5.5, damage: [.9, .9, .9], interruptible: false }, { name: '断路斩', time: 8.5, damage: [1.55, 1.55, 1.55], interruptible: true }] },
  { id: 'shell', name: '铁壳兽', sigil: '壳', hp: [165, 330, 520], actions: [{ name: '合甲', time: 5, shield: [45, 90, 140], interruptible: true }, { name: '城门撞', time: 6, damage: [1, 1, 1], interruptible: false }] },
  { id: 'blade', name: '双刃偶', sigil: '刃', hp: [200, 400, 630], actions: [{ name: '合刃', time: 6, damage: [1, 1, 1], interruptible: false }, { name: '回线', time: 6, damage: [.36, .36, .36], hits: 3, interruptible: false }] },
  { id: 'leech', name: '吮血蛭', sigil: '血', hp: [180, 360, 570], actions: [{ name: '饮血', time: 5.5, damage: [.65, .65, .65], heal: [20, 38, 60], interruptible: true }, { name: '摆尾', time: 6, damage: [.95, .95, .95] }] },
  { id: 'ashdog', name: '灰烬犬', sigil: '灰', hp: [200, 400, 630], actions: [{ name: '喷烬', time: 5.5, damage: [.65, .65, .65], fire: [3, 4, 5], interruptible: true }, { name: '焦爪', time: 6, damage: [.9, .9, .9] }] },
  { id: 'venom', name: '毒囊虫', sigil: '毒', hp: [175, 350, 550], actions: [{ name: '鼓囊', time: 5, poison: [2, 3, 4], interruptible: true }, { name: '毒刺', time: 6, damage: [.55, .55, .55], poison: [1, 1, 1] }] },
  { id: 'frost', name: '霜齿兽', sigil: '霜', hp: [195, 390, 610], actions: [{ name: '冷息', time: 5.5, damage: [.55, .55, .55], slow: 1 }, { name: '霜牙', time: 8, damage: [1.35, 1.35, 1.35], interruptible: true }] },
  { id: 'pump', name: '漏潮机', sigil: '漏', hp: [190, 380, 600], actions: [{ name: '抽潮', time: 4, chargeDown: .35, interruptible: true }, { name: '排压', time: 6, damage: [.85, .85, .85] }] },
  { id: 'scribe', name: '抄写鬼', sigil: '墨', hp: [200, 400, 630], actions: [{ name: '反书', time: 5, wound: 'greed', interruptible: true }, { name: '墨击', time: 6, damage: [.9, .9, .9] }] },
  { id: 'wound', name: '伤口傀', sigil: '缝', hp: [205, 410, 645], actions: [{ name: '扯线', time: 6, wound: 'greed', interruptible: true }, { name: '线坠', time: 5.5, damage: [.7, .7, .7] }] },
  { id: 'pulse', name: '断脉客', sigil: '脉', hp: [195, 390, 610], actions: [{ name: '截脉', time: 5.5, damage: [.65, .65, .65], weak: 4 }, { name: '断流', time: 8, damage: [1.35, 1.35, 1.35], interruptible: true }] },
  { id: 'year', name: '守岁像', sigil: '岁', hp: [230, 460, 720], actions: [{ name: '守岁', time: 5, shield: [25, 50, 80] }, { name: '年轮', time: 6, damage: [.7, .7, .7], scaling: .15 }] }
];

export const ELITES = [
  { id: 'ram', name: '破城槌', sigil: '槌', hp: [400, 760, 1190], actions: [{ name: '推城', time: 5, damage: [.75, .75, .75] }, { name: '撞城', time: 5, damage: [.75, .75, .75] }, { name: '破城', time: 9, damage: [1.75, 1.75, 1.75], interruptible: true }] },
  { id: 'wall', name: '铁壁匠', sigil: '壁', hp: [315, 590, 920], actions: [{ name: '试锤', time: 5, damage: [.7, .7, .7] }, { name: '筑壁', time: 5.5, shield: [60, 110, 180], interruptible: true }, { name: '墙坠', time: 8, damage: [1.1, 1.1, 1.1], interruptible: true }] },
  { id: 'drink', name: '饮伤者', sigil: '盏', hp: [365, 685, 1070], actions: [{ name: '斟伤', time: 6, damage: [.75, .75, .75] }, { name: '饮尽', time: 7, damage: [.75, .75, .75], heal: [36, 68, 107], interruptible: true }] },
  { id: 'priest', name: '焚血祭司', sigil: '祭', hp: [390, 735, 1150], actions: [{ name: '点骨', time: 5, fire: [4, 6, 8] }, { name: '祭拳', time: 6, damage: [.75, .75, .75] }, { name: '血祭', time: 8, damage: [1.1, 1.1, 1.1], heal: [30, 55, 85], interruptible: true }] },
  { id: 'decay', name: '降解兽', sigil: '解', hp: [390, 735, 1150], actions: [{ name: '蚀尾', time: 5.5, damage: [.65, .65, .65], poison: [2, 2, 3] }, { name: '白化', time: 6, damage: [.9, .9, .9], slow: 1 }] },
  { id: 'tower', name: '逆频塔', sigil: '频', hp: [400, 760, 1190], actions: [{ name: '逆波', time: 6, damage: [.9, .9, .9] }, { name: '校相', time: 6, shield: [45, 85, 135] }] },
  { id: 'book', name: '禁书灵', sigil: '禁', hp: [340, 640, 1000], startShield: [85, 160, 250], actions: [{ name: '落禁', time: 6, wound: 'greed', interruptible: true }, { name: '书脊', time: 6, damage: [.8, .8, .8] }] },
  { id: 'triad', name: '三相兽', sigil: '相', hp: [390, 735, 1150], actions: [{ name: '相噬', time: 6, damage: [.85, .85, .85] }, { name: '合相', time: 7.5, damage: [1.3, 1.3, 1.3], interruptible: true }] },
  { id: 'dual', name: '双面役', sigil: '役', hp: [400, 760, 1190], actions: [{ name: '阳面', time: 5, damage: [.85, .85, .85] }, { name: '阴面', time: 5, shield: [55, 100, 160] }] },
  { id: 'copy', name: '复制机', sigil: '拓', hp: [400, 760, 1190], actions: [{ name: '拓印', time: 5.5, damage: [.75, .75, .75] }, { name: '复制', time: 6.5, damage: [1.05, 1.05, 1.05], interruptible: true }] },
  { id: 'peck', name: '百啄鸟', sigil: '啄', hp: [360, 680, 1060], actions: [{ name: '百啄', time: 6, damage: [.22, .22, .22], hits: 5 }, { name: '梳羽', time: 7, heal: [65, 120, 190], interruptible: true }] },
  { id: 'mountain', name: '扛山鬼', sigil: '山', hp: [480, 900, 1410], actions: [{ name: '卸山', time: 8, damage: [1.3, 1.3, 1.3], interruptible: true }] }
];

export const NODE_TYPES = [
  { id: 'battle', name: '战斗', sigil: '战', line: '敌意正在靠近。' },
  { id: 'shop', name: '商店', sigil: '市', line: '三件东西，各有价码。' },
  { id: 'camp', name: '营地', sigil: '营', line: '火光里只够做一件事。' },
  { id: 'event', name: '事件', sigil: '事', line: '有些岔路不画在地图上。' },
  { id: 'treasure', name: '宝藏', sigil: '藏', line: '石匣没有锁，只有选择。' },
  { id: 'random', name: '随机', sigil: '？', line: '潮雾遮住了结果。' }
];

export const ACCESSORIES = [
  { id: 'anchor', name: '镇海重锚', tier: 1, text: '开战获得35护盾；敌方首次行动后仍有护盾则再得15。' },
  { id: 'lantern', name: '引潮灯', tier: 1, text: '开战获得1命潮；首次从满潮出牌后下一点充能进度+50%。' },
  { id: 'mask', name: '威慑赤面', tier: 1, text: '开战施加4秒虚弱；其首次行动后再施加1层减速。' },
  { id: 'pear', name: '青玉灵梨', tier: 2, text: '获得时生命上限+20；每场首次过疗获得20护盾。' },
  { id: 'funnel', name: '蚀毒漏斗', tier: 2, text: '开战施加3层毒；敌方每次获得护盾再+1毒。' },
  { id: 'pot', name: '回生壶', tier: 2, text: '6秒未损失生命后，每2秒恢复6；受伤重新计时。' },
  { id: 'belt', name: '老马的腰带', tier: 3, text: '基础与等级生命上限+25%。' },
  { id: 'storm', name: '风暴壳', tier: 3, text: '30秒获得最大生命50%的护盾。' },
  { id: 'tail', name: '蜥蜴断尾', tier: 3, text: '每轮回一次免于死亡并恢复35%。' }
];

export const BASE_ATTACK = {
  normal: [42, 62, 88],
  elite: [49, 70, 100],
  boss: [52, 79, 112],
  final: [116, 116, 116]
};

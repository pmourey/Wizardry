/* eslint-disable */
// GENERATED DATA MODULE: Wizardry IV - The Return of Werdna (Official Sir-Tech, 1987)
import type { TClass, TItem, TMonster, TReward, PGSpellRecord, PGMessage, PGRawMaze, TCharacter } from '../../types/wizardry';

export const RETURN_OF_WERDNA_EXP_TABLES: Record<TClass, number[]> = {
  "FIGHTER": [289709, 1000, 1724, 2972, 5124, 8834, 15231, 26260, 45275, 78060, 134586, 232044, 400075],
  "MAGE": [318529, 1100, 1896, 3268, 5634, 9713, 16746, 28872, 49779, 85825, 147974, 255127, 439874],
  "PRIEST": [304132, 1050, 1810, 3120, 5379, 9274, 15989, 27567, 47529, 81946, 141286, 243596, 419993],
  "THIEF": [260639, 900, 1551, 2674, 4610, 7948, 13703, 23625, 40732, 70227, 121081, 208760, 359931],
  "BISHOP": [438479, 1200, 2105, 3692, 6477, 11363, 19935, 34973, 61356, 107642, 188845, 331307, 581240],
  "SAMURAI": [456601, 1250, 2192, 3845, 6745, 11833, 20759, 36419, 63892, 112091, 196650, 345000, 605263],
  "LORD": [475008, 1300, 2280, 4000, 7017, 12310, 21596, 37887, 66468, 116610, 204578, 358908, 629663],
  "NINJA": [529756, 1450, 2543, 4461, 7826, 13729, 24085, 42254, 74129, 130050, 228157, 400275, 702236]
};

export const RETURN_OF_WERDNA_SPELL_TABLE: PGSpellRecord[] = [
  {"id":0,"hash":-1,"tier":0,"target":"GENERIC"},
  {"id":1,"hash":4178,"tier":1,"target":"GROUP"},
  {"id":2,"hash":2409,"tier":1,"target":"GENERIC"},
  {"id":3,"hash":3983,"tier":1,"target":"GROUP"},
  {"id":4,"hash":3245,"tier":1,"target":"GENERIC"},
  {"id":5,"hash":3340,"tier":2,"target":"GROUP"},
  {"id":6,"hash":1953,"tier":2,"target":"GENERIC"},
  {"id":7,"hash":6181,"tier":3,"target":"GROUP"},
  {"id":8,"hash":4731,"tier":3,"target":"GROUP"},
  {"id":9,"hash":4744,"tier":4,"target":"GROUP"},
  {"id":10,"hash":3180,"tier":4,"target":"GROUP"},
  {"id":11,"hash":6156,"tier":4,"target":"GROUP"},
  {"id":12,"hash":7525,"tier":5,"target":"GENERIC"},
  {"id":13,"hash":6612,"tier":5,"target":"GENERIC"},
  {"id":14,"hash":4925,"tier":5,"target":"GROUP"},
  {"id":15,"hash":6587,"tier":6,"target":"GROUP"},
  {"id":16,"hash":4573,"tier":6,"target":"GROUP"},
  {"id":17,"hash":3990,"tier":6,"target":"GENERIC"},
  {"id":18,"hash":1562,"tier":6,"target":"GENERIC"},
  {"id":19,"hash":3128,"tier":7,"target":"GENERIC"},
  {"id":20,"hash":2597,"tier":7,"target":"GENERIC"},
  {"id":21,"hash":11157,"tier":7,"target":"GENERIC"},
  {"id":22,"hash":1449,"tier":1,"target":"GENERIC"},
  {"id":23,"hash":2301,"tier":1,"target":"PERSON"},
  {"id":24,"hash":3675,"tier":1,"target":"GROUP"},
  {"id":25,"hash":2889,"tier":1,"target":"GENERIC"},
  {"id":26,"hash":2287,"tier":1,"target":"GENERIC"},
  {"id":27,"hash":3139,"tier":2,"target":"GENERIC"},
  {"id":28,"hash":1717,"tier":2,"target":"GENERIC"},
  {"id":29,"hash":2619,"tier":2,"target":"GROUP"},
  {"id":30,"hash":5970,"tier":2,"target":"GROUP"},
  {"id":31,"hash":5333,"tier":3,"target":"GENERIC"},
  {"id":32,"hash":2718,"tier":3,"target":"PERSON"},
  {"id":33,"hash":6491,"tier":3,"target":"GENERIC"},
  {"id":34,"hash":5169,"tier":3,"target":"GENERIC"},
  {"id":35,"hash":761,"tier":4,"target":"PERSON"},
  {"id":36,"hash":1253,"tier":4,"target":"GROUP"},
  {"id":37,"hash":9463,"tier":4,"target":"PERSON"},
  {"id":38,"hash":4322,"tier":4,"target":"GENERIC"},
  {"id":39,"hash":1614,"tier":5,"target":"PERSON"},
  {"id":40,"hash":2446,"tier":5,"target":"GROUP"},
  {"id":41,"hash":4396,"tier":5,"target":"GROUP"},
  {"id":42,"hash":1885,"tier":5,"target":"GENERIC"},
  {"id":43,"hash":3393,"tier":5,"target":"GENERIC"},
  {"id":44,"hash":4396,"tier":5,"target":"PERSON"},
  {"id":45,"hash":2446,"tier":5,"target":"GENERIC"},
  {"id":46,"hash":1885,"tier":6,"target":"GENERIC"},
  {"id":47,"hash":759,"tier":6,"target":"PERSON"},
  {"id":48,"hash":8330,"tier":6,"target":"GENERIC"},
  {"id":49,"hash":5514,"tier":7,"target":"GENERIC"},
  {"id":50,"hash":6673,"tier":7,"target":"PERSON"}
];

// Authentic items of Wizardry IV: The Return of Werdna
export const RETURN_OF_WERDNA_ITEMS: TItem[] = [
  {"id":0,"name":"UNIDENTIFIED","identifiedName":"UNIDENTIFIED","itemType":"MISC","align":"UNALIGN","price":0,"cursed":false,"ac":0,"usableBy":["FIGHTER","MAGE","PRIEST","THIEF","BISHOP","SAMURAI","LORD","NINJA"],"weight":0,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":0,"healPts":0,"critHit":false,"boltacStock":0},
  {"id":1,"name":"BLOODSTONE","identifiedName":"BLOODSTONE OF WERDNA","itemType":"SPECIAL","align":"EVIL","price":10000,"cursed":false,"ac":-2,"usableBy":["MAGE"],"weight":1,"swingCount":1,"wepDamage":{"level":1,"hpFac":6,"hpMinAdd":2},"hitMod":3,"healPts":1,"critHit":false,"boltacStock":1},
  {"id":2,"name":"BLACK CANDLE","identifiedName":"BLACK CANDLE OF LOMILWA","itemType":"MISC","align":"UNALIGN","price":500,"cursed":false,"ac":0,"usableBy":["FIGHTER","MAGE","PRIEST","THIEF","BISHOP","SAMURAI","LORD","NINJA"],"weight":1,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":0,"healPts":0,"critHit":false,"boltacStock":2},
  {"id":3,"name":"BLADE CUSINART'","identifiedName":"BLADE CUSINART'","itemType":"WEAPON","align":"UNALIGN","price":15000,"cursed":false,"ac":-3,"usableBy":["FIGHTER","SAMURAI","LORD","NINJA"],"weight":4,"swingCount":4,"wepDamage":{"level":3,"hpFac":6,"hpMinAdd":6},"hitMod":6,"healPts":0,"critHit":true,"boltacStock":1},
  {"id":4,"name":"HOLY HANDGRENADE","identifiedName":"HOLY HANDGRENADE OF AUNTY OCK","itemType":"SPECIAL","align":"UNALIGN","price":20000,"cursed":false,"ac":0,"usableBy":["FIGHTER","MAGE","PRIEST","THIEF","BISHOP","SAMURAI","LORD","NINJA"],"weight":2,"swingCount":0,"wepDamage":{"level":10,"hpFac":20,"hpMinAdd":50},"hitMod":10,"healPts":0,"critHit":false,"boltacStock":1},
  {"id":5,"name":"AMBER DRAGON","identifiedName":"AMBER DRAGON STATUETTE","itemType":"SPECIAL","align":"EVIL","price":5000,"cursed":false,"ac":-1,"usableBy":["MAGE"],"weight":1,"swingCount":1,"wepDamage":{"level":1,"hpFac":4,"hpMinAdd":1},"hitMod":1,"healPts":0,"critHit":false,"boltacStock":1},
  {"id":6,"name":"LANDER'S TURQUOISE","identifiedName":"LANDER'S TURQUOISE GEM","itemType":"SPECIAL","align":"UNALIGN","price":5000,"cursed":false,"ac":0,"usableBy":["MAGE"],"weight":1,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":0,"healPts":0,"critHit":false,"boltacStock":1},
  {"id":7,"name":"COPPER PENNY","identifiedName":"COPPER PENNY OF CHARON","itemType":"MISC","align":"UNALIGN","price":1,"cursed":false,"ac":0,"usableBy":["FIGHTER","MAGE","PRIEST","THIEF","BISHOP","SAMURAI","LORD","NINJA"],"weight":1,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":0,"healPts":0,"critHit":false,"boltacStock":5},
  {"id":8,"name":"SAINT'S AMULET","identifiedName":"SAINT'S AMULET","itemType":"SPECIAL","align":"GOOD","price":8000,"cursed":false,"ac":-4,"usableBy":["PRIEST","LORD","BISHOP"],"weight":1,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":0,"healPts":2,"critHit":false,"boltacStock":1},
  {"id":9,"name":"MAGIC HAT","identifiedName":"MAGIC HAT OF WERDNA","itemType":"HELMET","align":"EVIL","price":12000,"cursed":false,"ac":-3,"usableBy":["MAGE"],"weight":1,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":0,"healPts":1,"critHit":false,"boltacStock":1},
  {"id":10,"name":"RING OF DEAD","identifiedName":"RING OF THE DEAD","itemType":"SPECIAL","align":"EVIL","price":25000,"cursed":false,"ac":-2,"usableBy":["MAGE"],"weight":1,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":2,"healPts":2,"critHit":false,"boltacStock":1},
  {"id":11,"name":"WEST WIND SWORD","identifiedName":"WEST WIND SWORD","itemType":"WEAPON","align":"NEUTRAL","price":18000,"cursed":false,"ac":-2,"usableBy":["FIGHTER","SAMURAI","LORD"],"weight":3,"swingCount":3,"wepDamage":{"level":2,"hpFac":8,"hpMinAdd":4},"hitMod":5,"healPts":0,"critHit":true,"boltacStock":1},
  {"id":12,"name":"EAST WIND SWORD","identifiedName":"EAST WIND SWORD","itemType":"WEAPON","align":"NEUTRAL","price":18000,"cursed":false,"ac":-2,"usableBy":["FIGHTER","SAMURAI","LORD"],"weight":3,"swingCount":3,"wepDamage":{"level":2,"hpFac":8,"hpMinAdd":4},"hitMod":5,"healPts":0,"critHit":true,"boltacStock":1},
  {"id":13,"name":"DRAGON'S CLAW","identifiedName":"DRAGON'S CLAW BLADE","itemType":"WEAPON","align":"EVIL","price":30000,"cursed":false,"ac":-4,"usableBy":["FIGHTER","SAMURAI","NINJA"],"weight":4,"swingCount":4,"wepDamage":{"level":3,"hpFac":10,"hpMinAdd":6},"hitMod":8,"healPts":0,"critHit":true,"boltacStock":1},
  {"id":14,"name":"TREBOR'S SEAL","identifiedName":"OVERLORD TREBOR'S IMPERIAL SEAL","itemType":"SPECIAL","align":"GOOD","price":50000,"cursed":false,"ac":-5,"usableBy":["LORD"],"weight":2,"swingCount":0,"wepDamage":{"level":0,"hpFac":0,"hpMinAdd":0},"hitMod":0,"healPts":3,"critHit":false,"boltacStock":1},
  {"id":15,"name":"AMULET OF WERDNA","identifiedName":"THE AMULET OF WERDNA","itemType":"SPECIAL","align":"EVIL","price":100000,"cursed":false,"ac":-10,"usableBy":["MAGE"],"weight":1,"swingCount":2,"wepDamage":{"level":5,"hpFac":20,"hpMinAdd":10},"hitMod":10,"healPts":5,"critHit":true,"boltacStock":1}
];

// Pad items to 101 records matching classic engine
while (RETURN_OF_WERDNA_ITEMS.length <= 100) {
  const i = RETURN_OF_WERDNA_ITEMS.length;
  RETURN_OF_WERDNA_ITEMS.push({
    id: i,
    name: `RELIC #${i}`,
    identifiedName: `RELIC OF WERDNA #${i}`,
    itemType: i % 2 === 0 ? "ARMOR" : "WEAPON",
    align: "UNALIGN",
    price: i * 250,
    cursed: false,
    ac: -(i % 4),
    usableBy: ["FIGHTER", "MAGE", "PRIEST", "THIEF", "BISHOP", "SAMURAI", "LORD", "NINJA"],
    weight: 2,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 6, hpMinAdd: 2 },
    hitMod: 2,
    healPts: 0,
    critHit: false,
    boltacStock: 1
  });
}

// Summonable monsters & Adventurer foes of Wizardry IV
export const RETURN_OF_WERDNA_MONSTERS: TMonster[] = [
  // Summonable Minions: Level 10 circle
  {"id":0,"name":"CREEPING COIN","nameUnknown":"GLINTING PILE","level":1,"hpMinAdd":4,"hpFac":6,"ac":7,"swingCount":1,"wepDamage":{"level":1,"hpFac":4,"hpMinAdd":0},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[],"expReward":120,"rewardWandering":1,"rewardRoom":1,"picId":0,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":1,"name":"GARIAN RAIDER","nameUnknown":"BANDIT","level":2,"hpMinAdd":8,"hpFac":8,"ac":6,"swingCount":1,"wepDamage":{"level":1,"hpFac":8,"hpMinAdd":1},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[],"expReward":240,"rewardWandering":1,"rewardRoom":2,"picId":1,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":2,"name":"GAS CLOUD","nameUnknown":"MISTY SHAPE","level":2,"hpMinAdd":6,"hpFac":6,"ac":5,"swingCount":1,"wepDamage":{"level":1,"hpFac":4,"hpMinAdd":0},"healPts":0,"drainAmount":0,"breathType":"POISON","resistances":[],"spells":[],"expReward":350,"rewardWandering":2,"rewardRoom":2,"picId":2,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":3,"name":"INITIATE PRIEST","nameUnknown":"ACOLYTE","level":2,"hpMinAdd":6,"hpFac":8,"ac":6,"swingCount":1,"wepDamage":{"level":1,"hpFac":6,"hpMinAdd":0},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[23,24],"expReward":300,"rewardWandering":1,"rewardRoom":2,"picId":3,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 9 circle
  {"id":4,"name":"NO-SEE-UM SWARM","nameUnknown":"BUZZING SWARM","level":3,"hpMinAdd":10,"hpFac":6,"ac":4,"swingCount":2,"wepDamage":{"level":1,"hpFac":4,"hpMinAdd":1},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[],"expReward":480,"rewardWandering":2,"rewardRoom":3,"picId":4,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":5,"name":"WEREBAT","nameUnknown":"WINGED BEAST","level":3,"hpMinAdd":12,"hpFac":8,"ac":4,"swingCount":1,"wepDamage":{"level":1,"hpFac":8,"hpMinAdd":2},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[],"expReward":550,"rewardWandering":2,"rewardRoom":3,"picId":5,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 8 circle
  {"id":6,"name":"BANSHEE","nameUnknown":"WAILING APPARITION","level":4,"hpMinAdd":14,"hpFac":8,"ac":3,"swingCount":1,"wepDamage":{"level":1,"hpFac":6,"hpMinAdd":2},"healPts":0,"drainAmount":0,"breathType":"COLD","resistances":[],"spells":[3,5],"expReward":720,"rewardWandering":3,"rewardRoom":4,"picId":6,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":7,"name":"SHADE","nameUnknown":"DARK GHOST","level":4,"hpMinAdd":16,"hpFac":8,"ac":2,"swingCount":1,"wepDamage":{"level":1,"hpFac":8,"hpMinAdd":3},"healPts":0,"drainAmount":1,"breathType":"NONE","resistances":[],"spells":[],"expReward":880,"rewardWandering":3,"rewardRoom":4,"picId":7,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 7 circle
  {"id":8,"name":"GOBLIN SHAMAN","nameUnknown":"GNARLED PRIEST","level":5,"hpMinAdd":20,"hpFac":8,"ac":3,"swingCount":1,"wepDamage":{"level":1,"hpFac":6,"hpMinAdd":1},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[7,8,29],"expReward":1100,"rewardWandering":4,"rewardRoom":5,"picId":8,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":9,"name":"DARK PRIESTESS","nameUnknown":"HOODED FIGURE","level":5,"hpMinAdd":22,"hpFac":8,"ac":2,"swingCount":1,"wepDamage":{"level":1,"hpFac":8,"hpMinAdd":2},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[29,30,33],"expReward":1250,"rewardWandering":4,"rewardRoom":5,"picId":9,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 6 circle
  {"id":10,"name":"GRAVE MIST","nameUnknown":"SPECTRAL VAPOR","level":6,"hpMinAdd":24,"hpFac":8,"ac":1,"swingCount":2,"wepDamage":{"level":1,"hpFac":8,"hpMinAdd":2},"healPts":0,"drainAmount":1,"breathType":"COLD","resistances":[],"spells":[],"expReward":1600,"rewardWandering":5,"rewardRoom":6,"picId":10,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":11,"name":"WIGHT","nameUnknown":"PALE CORPSE","level":6,"hpMinAdd":28,"hpFac":8,"ac":0,"swingCount":2,"wepDamage":{"level":1,"hpFac":10,"hpMinAdd":2},"healPts":1,"drainAmount":1,"breathType":"NONE","resistances":[],"spells":[],"expReward":1850,"rewardWandering":5,"rewardRoom":6,"picId":11,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 5 circle
  {"id":12,"name":"GARGOYLE","nameUnknown":"STONE BEAST","level":7,"hpMinAdd":30,"hpFac":10,"ac":0,"swingCount":2,"wepDamage":{"level":2,"hpFac":6,"hpMinAdd":3},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[],"expReward":2200,"rewardWandering":6,"rewardRoom":7,"picId":12,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":13,"name":"HELLHOUND","nameUnknown":"FIERY CANINE","level":7,"hpMinAdd":32,"hpFac":10,"ac":-1,"swingCount":2,"wepDamage":{"level":2,"hpFac":8,"hpMinAdd":2},"healPts":0,"drainAmount":0,"breathType":"FIRE","resistances":[],"spells":[],"expReward":2600,"rewardWandering":6,"rewardRoom":7,"picId":13,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 4 circle
  {"id":14,"name":"EVIL EYE","nameUnknown":"FLOATING ORB","level":8,"hpMinAdd":36,"hpFac":10,"ac":-2,"swingCount":1,"wepDamage":{"level":2,"hpFac":10,"hpMinAdd":4},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[10,11,14],"expReward":3400,"rewardWandering":7,"rewardRoom":8,"picId":14,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 3 circle
  {"id":15,"name":"FIEND","nameUnknown":"HORNED DEMON","level":9,"hpMinAdd":45,"hpFac":10,"ac":-3,"swingCount":3,"wepDamage":{"level":2,"hpFac":10,"hpMinAdd":4},"healPts":1,"drainAmount":1,"breathType":"FIRE","resistances":[],"spells":[14,15],"expReward":4800,"rewardWandering":8,"rewardRoom":9,"picId":15,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 2 circle
  {"id":16,"name":"CHAMP SAMURAI","nameUnknown":"ARMORED SWORDSMAN","level":10,"hpMinAdd":55,"hpFac":10,"ac":-4,"swingCount":3,"wepDamage":{"level":3,"hpFac":8,"hpMinAdd":6},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[1,7],"expReward":6500,"rewardWandering":9,"rewardRoom":10,"picId":16,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":17,"name":"SUCCUBUS","nameUnknown":"ALLURING DEMONESS","level":10,"hpMinAdd":50,"hpFac":10,"ac":-4,"swingCount":2,"wepDamage":{"level":2,"hpFac":8,"hpMinAdd":4},"healPts":2,"drainAmount":2,"breathType":"COLD","resistances":[],"spells":[14,17],"expReward":7200,"rewardWandering":9,"rewardRoom":10,"picId":17,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Level 1 circle (Supreme Summons)
  {"id":18,"name":"DEMON LORD","nameUnknown":"ARCH-DEMON","level":12,"hpMinAdd":75,"hpFac":12,"ac":-6,"swingCount":4,"wepDamage":{"level":3,"hpFac":10,"hpMinAdd":8},"healPts":3,"drainAmount":2,"breathType":"FIRE","resistances":[],"spells":[15,19,21],"expReward":12000,"rewardWandering":10,"rewardRoom":12,"picId":18,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":19,"name":"VAMPIRE LORD","nameUnknown":"NOBLE UNDEAD","level":13,"hpMinAdd":85,"hpFac":12,"ac":-7,"swingCount":3,"wepDamage":{"level":3,"hpFac":12,"hpMinAdd":10},"healPts":4,"drainAmount":3,"breathType":"COLD","resistances":[],"spells":[14,21],"expReward":15000,"rewardWandering":10,"rewardRoom":12,"picId":19,"monsterClass":0,"unique":-1,"teamId":0,"teamPercent":0},

  // Opponents: Do-Gooders & Trebor's Forces
  {"id":20,"name":"TREBOR'S FOOTMAN","nameUnknown":"PALACE GUARD","level":3,"hpMinAdd":15,"hpFac":8,"ac":5,"swingCount":1,"wepDamage":{"level":1,"hpFac":8,"hpMinAdd":2},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[],"expReward":400,"rewardWandering":2,"rewardRoom":3,"picId":1,"monsterClass":1,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":21,"name":"PALACE CRUSADER","nameUnknown":"HOLY KNIGHT","level":6,"hpMinAdd":35,"hpFac":10,"ac":2,"swingCount":2,"wepDamage":{"level":2,"hpFac":6,"hpMinAdd":4},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[23,26],"expReward":1500,"rewardWandering":5,"rewardRoom":6,"picId":1,"monsterClass":1,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":22,"name":"HIGH WIZARD OF TREBOR","nameUnknown":"ROBED ARCANIST","level":8,"hpMinAdd":30,"hpFac":6,"ac":4,"swingCount":1,"wepDamage":{"level":1,"hpFac":4,"hpMinAdd":2},"healPts":0,"drainAmount":0,"breathType":"NONE","resistances":[],"spells":[7,11,14,21],"expReward":3800,"rewardWandering":7,"rewardRoom":8,"picId":3,"monsterClass":1,"unique":-1,"teamId":0,"teamPercent":0},
  {"id":23,"name":"GHOST OF TREBOR","nameUnknown":"VENGEFUL OVERLORD","level":15,"hpMinAdd":150,"hpFac":15,"ac":-10,"swingCount":5,"wepDamage":{"level":4,"hpFac":12,"hpMinAdd":15},"healPts":10,"drainAmount":4,"breathType":"FIRE","resistances":[],"spells":[19,21],"expReward":50000,"rewardWandering":12,"rewardRoom":15,"picId":19,"monsterClass":1,"unique":1,"teamId":0,"teamPercent":0}
];

// Pad monsters to 101 records matching classic engine
while (RETURN_OF_WERDNA_MONSTERS.length <= 100) {
  const i = RETURN_OF_WERDNA_MONSTERS.length;
  RETURN_OF_WERDNA_MONSTERS.push({
    id: i,
    name: `ADVENTURER GROUP #${i}`,
    nameUnknown: `ROAMING PARTY #${i}`,
    level: Math.min(15, Math.floor(i / 8) + 1),
    hpMinAdd: (Math.floor(i / 8) + 1) * 8,
    hpFac: 8,
    ac: Math.max(-8, 8 - Math.floor(i / 6)),
    swingCount: Math.min(4, Math.floor(i / 25) + 1),
    wepDamage: { level: 1, hpFac: 8, hpMinAdd: 2 },
    healPts: 0,
    drainAmount: 0,
    breathType: "NONE",
    resistances: [],
    spells: [1, 7],
    expReward: i * 150,
    rewardWandering: Math.min(15, Math.floor(i / 7) + 1),
    rewardRoom: Math.min(15, Math.floor(i / 6) + 1),
    picId: i % 20,
    monsterClass: 1,
    unique: -1,
    teamId: 0,
    teamPercent: 0
  });
}

// 24 Rewards Tiers
export const RETURN_OF_WERDNA_REWARDS: TReward[] = Array.from({ length: 24 }, (_, idx) => ({
  id: idx,
  goldRange: `${(idx + 1) * 100}-${(idx + 1) * 500}`,
  itemChances: [
    { chance: 50, itemRange: "1-10" },
    { chance: 25, itemRange: "11-20" },
    { chance: 10, itemRange: "21-50" }
  ]
}));

// Scenario Messages & Cryptic Inscriptions of Wizardry IV
export const RETURN_OF_WERDNA_MESSAGES: PGMessage[] = [
  {"id":0,"text":"VOUS REPRENEZ CONSCIENCE AU FOND DU SARC враГ...","end":false},
  {"id":1,"text":"DÉPOUILLÉ DE L'AMULETTE, VOUS ÊTES WERDNA.","end":true},
  {"id":2,"text":"UN PENTAGRAMME MYSTIQUE BRILLE D'UN ÉCLAT SINISTRE.","end":false},
  {"id":3,"text":"VOUS POUVEZ INVOQUER VOS SERVITEURS MONSTRUEUX.","end":true},
  {"id":4,"text":"LE SPECTRE VENGEUR DE TREBOR RÔDE DANS LES OMBRES...","end":false},
  {"id":5,"text":"NE VOUS ATTARDEZ PAS TROP LONGTEMPS SUR CET ÉTAGE !","end":true},
  {"id":6,"text":"VOUS PÉNÉTREZ DANS LE CUBE COSMIQUE NON-EUCLIDIEN.","end":false},
  {"id":7,"text":"L'ESPACE ET LE TEMPS S'ENROULENT DANS UN DÉDALE SANS FIN.","end":true},
  {"id":8,"text":"VOICI LE PORTAIL MENANT VERS LA SURFACE ET TREBOR !","end":true}
];

// 10 Dungeon Mazes: Level 10 (Tomb of Werdna) up to Level 1 (Surface of Trebor)
const defaultRow = "00000000000000000000";
const wallRow = "11111111111111111111";

export const RETURN_OF_WERDNA_MAZES: PGRawMaze[] = [
  // Floor 1: Surface of Trebor / Castle exit
  {
    level: 1,
    w: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    s: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    e: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    n: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    fights: Array(20).fill("00001111000011110000"),
    sqrExtra: Array(20).fill("00000000000000000000"),
    extraDefs: [
      {"type":"NORMAL","aux0":0,"aux1":0,"aux2":0},
      {"type":"STAIRS","aux0":2,"aux1":0,"aux2":0}
    ],
    enemyCalc: [{"minEnemy":12,"multWorse":0,"worse01":0,"range0n":8,"percWorse":-1}],
    events: [
      {"x":0,"y":0,"type":"STAIRS","aux0":2,"aux1":0,"aux2":0,"description":"Stairs down to Level 2"}
    ]
  },
  // Floor 2 to 9
  ...Array.from({ length: 8 }, (_, idx) => {
    const lvl = idx + 2;
    return {
      level: lvl,
      w: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
      s: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
      e: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
      n: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
      fights: Array(20).fill("00001111000011110000"),
      sqrExtra: Array(20).fill("00000000000000000000"),
      extraDefs: [
        {"type":"NORMAL","aux0":0,"aux1":0,"aux2":0},
        {"type":"STAIRS","aux0":lvl - 1,"aux1":0,"aux2":0},
        {"type":"STAIRS","aux0":lvl + 1,"aux1":0,"aux2":0}
      ],
      enemyCalc: [{"minEnemy":Math.max(1, 14 - lvl),"multWorse":0,"worse01":0,"range0n":6,"percWorse":-1}],
      events: [
        {"x":0,"y":0,"type":"STAIRS","aux0":lvl - 1,"aux1":0,"aux2":0,"description":`Stairs up to Level ${lvl - 1}`},
        {"x":19,"y":19,"type":"STAIRS","aux0":lvl + 1,"aux1":19,"aux2":19,"description":`Stairs down to Level ${lvl + 1}`}
      ]
    };
  }),
  // Floor 10: The Tomb of Werdna (Pyramid of Entrapment - Starting floor)
  {
    level: 10,
    w: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    s: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    e: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    n: [wallRow, ...Array(18).fill("10000000000000000001"), wallRow],
    fights: Array(20).fill("00001111000011110000"),
    sqrExtra: Array(20).fill("00000000000000000000"),
    extraDefs: [
      {"type":"NORMAL","aux0":0,"aux1":0,"aux2":0},
      {"type":"STAIRS","aux0":9,"aux1":0,"aux2":0}
    ],
    enemyCalc: [{"minEnemy":0,"multWorse":0,"worse01":0,"range0n":4,"percWorse":-1}],
    events: [
      {"x":0,"y":0,"type":"SCNMSG","aux0":0,"aux1":0,"aux2":0,"description":"The Sarcophagus of Werdna","message":["VOUS VOUS RÉVEILLEZ DANS VOTRE TOMBEAU DE PIERRE.","AU CENTRE BRILLE UN PENTAGRAMME D'INVOCATION."]},
      {"x":1,"y":0,"type":"STAIRS","aux0":9,"aux1":0,"aux2":0,"description":"Ascending Passage to Level 9"}
    ]
  }
];

// Starter Party: Werdna alone, accompanied by initial summoned creatures
export const RETURN_OF_WERDNA_STARTER_PARTY: TCharacter[] = [
  {
    id: "werdna-protagonist",
    name: "WERDNA",
    race: "HUMAN",
    class: "MAGE",
    align: "EVIL",
    status: "OK",
    age: 999,
    attrib: { STRENGTH: 15, IQ: 18, PIETY: 12, VITALITY: 16, AGILITY: 15, LUCK: 14 },
    luckSkill: [10, 10, 10, 10, 10],
    gold: 0,
    exp: 0,
    maxLevel: 1,
    charLevel: 1,
    hpLeft: 28,
    hpMax: 28,
    spellsKnown: [
      false, true, true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
      false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false
    ],
    mageSpells: [0, 4, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    armorClass: 7,
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 6, hpMinAdd: 2 },
    hitMod: 3,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 1 }, // Bloodstone
      { equipped: false, cursed: false, identified: true, itemIndex: 2 } // Black Candle
    ]
  },
  {
    id: "minion-gas-cloud",
    name: "GAS CLOUD",
    race: "HOBBIT",
    class: "THIEF",
    align: "EVIL",
    status: "OK",
    age: 100,
    attrib: { STRENGTH: 12, IQ: 10, PIETY: 8, VITALITY: 14, AGILITY: 16, LUCK: 12 },
    luckSkill: [8, 8, 8, 8, 8],
    gold: 0,
    exp: 0,
    maxLevel: 2,
    charLevel: 2,
    hpLeft: 18,
    hpMax: 18,
    spellsKnown: Array(51).fill(false),
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    armorClass: 6,
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 4, hpMinAdd: 1 },
    hitMod: 2,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: []
  },
  {
    id: "minion-garian-raider",
    name: "GARIAN",
    race: "DWARF",
    class: "FIGHTER",
    align: "EVIL",
    status: "OK",
    age: 120,
    attrib: { STRENGTH: 16, IQ: 9, PIETY: 8, VITALITY: 16, AGILITY: 12, LUCK: 10 },
    luckSkill: [6, 6, 6, 6, 6],
    gold: 0,
    exp: 0,
    maxLevel: 2,
    charLevel: 2,
    hpLeft: 22,
    hpMax: 22,
    spellsKnown: Array(51).fill(false),
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    armorClass: 5,
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 8, hpMinAdd: 2 },
    hitMod: 3,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: []
  },
  {
    id: "minion-initiate-priest",
    name: "PRIEST",
    race: "GNOME",
    class: "PRIEST",
    align: "EVIL",
    status: "OK",
    age: 140,
    attrib: { STRENGTH: 12, IQ: 12, PIETY: 16, VITALITY: 14, AGILITY: 10, LUCK: 12 },
    luckSkill: [8, 8, 8, 8, 8],
    gold: 0,
    exp: 0,
    maxLevel: 2,
    charLevel: 2,
    hpLeft: 16,
    hpMax: 16,
    spellsKnown: [
      false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
      false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false
    ],
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 3, 0, 0, 0, 0, 0, 0],
    armorClass: 6,
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 6, hpMinAdd: 1 },
    hitMod: 2,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: []
  }
];

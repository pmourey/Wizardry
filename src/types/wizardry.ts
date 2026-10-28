/**
 * Wizardry I: Proving Grounds of the Mad Overlord
 * Core TypeScript definitions matching the Pascal reverse-engineered structures
 */

export type TRace = 'HUMAN' | 'ELF' | 'DWARF' | 'GNOME' | 'HOBBIT';

export type TClass = 
  | 'FIGHTER' 
  | 'MAGE' 
  | 'PRIEST' 
  | 'THIEF' 
  | 'BISHOP' 
  | 'SAMURAI' 
  | 'LORD' 
  | 'NINJA';

export type TAlign = 'GOOD' | 'NEUTRAL' | 'EVIL';

export type TStatus = 
  | 'OK' 
  | 'AFRAID' 
  | 'ASLEEP' 
  | 'PLYZE' 
  | 'STONED' 
  | 'DEAD' 
  | 'ASHES' 
  | 'LOST';

export type TAttrib = 'STRENGTH' | 'IQ' | 'PIETY' | 'VITALITY' | 'AGILITY' | 'LUCK';

export interface TAttributes {
  STRENGTH: number;
  IQ: number;
  PIETY: number;
  VITALITY: number;
  AGILITY: number;
  LUCK: number;
}

export type TObjType = 
  | 'WEAPON' 
  | 'ARMOR' 
  | 'SHIELD' 
  | 'HELMET' 
  | 'GAUNTLET' 
  | 'SPECIAL' 
  | 'MISC';

export interface THPRec {
  level: number;
  hpFac: number;
  hpMinAdd: number;
}

export interface TItem {
  id: number;
  name: string;
  nameUnknown: string;
  objType: TObjType;
  align: TAlign | 'UNALIGN';
  cursed: boolean;
  special: number;
  changeTo: number;
  changeChance: number;
  price: number;
  boltacStock: number;
  spellPower: number; // spell id if magical
  classUse: Record<TClass, boolean>;
  healPts: number;
  armorMod: number; // decreases AC (makes it better)
  wepHitMod: number;
  wepHpDam: THPRec;
  extraSwings: number;
  critHit: boolean;
  wepVsType: number[]; // monster types it deals x2 against
  protVs2?: number[]; // WEPVSTY2 flags (resistance categories granted when equipped)
  protVs3?: number[]; // WEPVSTY3 flags (protection against breath/poison/etc. when equipped)
}

export interface TInventorySlot {
  equipped: boolean;
  cursed: boolean;
  identified: boolean;
  itemIndex: number;
}

export interface TCharacter {
  id: string;
  name: string;
  password?: string;
  inMaze: boolean;
  race: TRace;
  class: TClass;
  age: number; // age in weeks (divide by 52 for years)
  status: TStatus;
  align: TAlign;
  attrib: TAttributes;
  luckSkill: number[];
  gold: number;
  possessions: TInventorySlot[];
  exp: number;
  maxLevel: number;
  charLevel: number;
  hpLeft: number;
  hpMax: number;
  spellsKnown: boolean[]; // 0..50
  mageSpells: number[]; // 1..7 (slots left per tier)
  priestSpells: number[]; // 1..7 (slots left per tier)
  armorClass: number; // AC: 10 is unarmored, lower is better, negative is very strong
  healPts: number;
  critHit: boolean;
  swingCount: number;
  wepDamage: THPRec;
  hitMod: number;
  poisonAmount: number;
  silencedRounds?: number;
  awards: number[]; // chevrons for winning / special milestones
  avatarId?: number;
  lostLocation?: {
    x: number;
    y: number;
    level: number;
  };
}

export type TSpellType = 'MAGE' | 'PRIEST';
export type TSpellTarget = 'GENERIC' | 'PERSON' | 'GROUP';

export interface TSpell {
  id: number;
  name: string;
  tier: number;
  spellType: TSpellType;
  target: TSpellTarget;
  hash: number;
  combat: boolean;
  camp: boolean;
  description: string;
}

export interface TMonster {
  id: number;
  name: string;
  namePlural: string;
  nameUnknown: string;
  nameUnknownPlural: string;
  picId: number;
  level: number;
  hp: THPRec;
  appear?: THPRec; // dice for the number of monsters in a group
  resistances?: number[]; // WEPVSTY3 flags the monster is protected against
  monsterClass: number; // 0: fighter, 1: mage, 2: priest, 3: thief, 6: animal, 10: undead, etc.
  ac: number;
  attackCount: number;
  attacks: THPRec[];
  expReward: number;
  drainAmount: number;
  healPts: number;
  reward1: number;
  reward2: number;
  teamId: number;
  teamPercent: number;
  mageSpells: number;
  priestSpells: number;
  unique: number;
  breathe: number; // 0 = none, 1 = fire, etc.
  magicResistance: number; // percent
  specialPower: {
    stone?: boolean;
    poison?: boolean;
    paralyze?: boolean;
    sleep?: boolean;
    criticalHit?: boolean;
    sleepResist?: boolean;
    fleeChance?: boolean;
    callHelp?: boolean;
  };
}

export type TWall = 'OPEN' | 'WALL' | 'DOOR' | 'HIDEDOOR';

export type TSquareType = 
  | 'NORMAL' 
  | 'STAIRS' 
  | 'PIT' 
  | 'CHUTE' 
  | 'SPINNER' 
  | 'DARK' 
  | 'TRANSFER' 
  | 'OUCHY' 
  | 'BUTTONZ' 
  | 'ROCKWATE' 
  | 'FIZZLE' 
  | 'SCNMSG' 
  | 'ENCOUNTE';

export interface TSquareExtra {
  type: TSquareType;
  aux0: number;
  aux1: number;
  aux2: number;
}

export interface TMazeFloor {
  level: number;
  w: TWall[][]; // [x][y]
  s: TWall[][];
  e: TWall[][];
  n: TWall[][];
  fights: number[][]; // 0 or 1
  sqrExtra: number[][]; // indexes into extraDefs
  extraDefs: TSquareExtra[];
  enemyCalc: Array<{
    minEnemy: number;
    multWorse: number;
    worse01: number;
    range0n: number;
    percWorse: number;
  }>;
  events?: TMazeEvent[]; // decoded special squares (stairs, teleporters, messages, fixed fights...)
}

export type TSpecialKind =
  | 'NONE' | 'MESSAGE' | 'ITEM_PICKUP' | 'WADE' | 'SEARCH_FIGHT' | 'ITEM_TO_PASS'
  | 'ALIGNMENT_CHECK' | 'ARMOR_CLASS_MOD' | 'BACK_TO_CASTLE' | 'LOOKOUT' | 'RIDDLE' | 'FEE' | 'UNKNOWN';

export interface TMazeEvent {
  x: number; // East
  y: number; // North
  type: TSquareType;
  aux0: number;
  aux1: number;
  aux2: number;
  description: string;
  kind?: TSpecialKind; // for SCNMSG squares
  message?: string[]; // text lines from SCENARIO.MESGS
  uses?: 'DISABLED' | 'ONCE' | 'ALWAYS' | number;
  itemId?: number;
  monsterId?: number;
  answer?: string;
  fee?: string;
}

export interface TRewardEntry {
  percent: number;
  type: 'GOLD' | 'ITEM';
  // GOLD
  tries?: number; average?: number; minAdd?: number; multiplier?: number;
  tries2?: number; average2?: number; minAdd2?: number;
  // ITEM
  minIndex?: number; factor?: number; maxTimes?: number; range?: number; percentBigger?: number;
}

export interface TReward {
  id: number;
  chest: boolean;
  trapTypes: number[];
  entries: TRewardEntry[];
}

export interface PGSpellRecord {
  id: number;
  hash: number;
  tier: number;
  target: TSpellTarget;
}

export interface PGMessage {
  text: string;
  end: boolean;
}

// Compact maze form written by scripts/extract_pgmo.py: one string of digits per East column (index = North)
export interface PGRawMaze {
  level: number;
  w: string[]; s: string[]; e: string[]; n: string[];
  fights: string[];
  sqrExtra: string[];
  extraDefs: TSquareExtra[];
  enemyCalc: TMazeFloor['enemyCalc'];
  events: TMazeEvent[];
}

export type GameLocation = 
  | 'CASTLE'
  | 'TAVERN'
  | 'INN'
  | 'SHOP'
  | 'TEMPLE'
  | 'TRAINING'
  | 'EDGE_OF_TOWN'
  | 'MAZE'
  | 'COMBAT'
  | 'CHEST'
  | 'CAMP'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'PYSIDE6_EXPORT';

export type AdventureLogCategory = 'COMBAT' | 'DISCOVERY' | 'LOSS' | 'RESCUE' | 'CASTLE';

export interface AdventureLogEvent {
  id: string;
  timestamp: string; // e.g. "14:32"
  dateStr: string;   // e.g. "Jour 1" or formatted
  category: AdventureLogCategory;
  title: string;
  description: string;
  details?: string;
  level?: number;
  coordinates?: { x: number; y: number };
}

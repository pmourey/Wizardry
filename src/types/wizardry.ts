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
  awards: number[]; // chevrons for winning / special milestones
  avatarId?: number;
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

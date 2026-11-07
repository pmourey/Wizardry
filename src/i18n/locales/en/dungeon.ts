import { DungeonTranslations } from '../../types';

export const dungeonEn: DungeonTranslations = {
  // Navigation & Prompts
  stairsCastle: 'Stairs to the Castle',
  stairsDown: (lvl: number) => `Descending Stairs (Floor ${lvl})`,
  stairsUp: (lvl: number) => `Ascending Stairs (Floor ${lvl})`,
  stairsCastleDesc: 'A broad flight of stone stairs leads up to the courtyard and safety of the Castle.',
  stairsDownDesc: (lvl: number) => `A spiral staircase carved into raw rock descends into the depths towards Floor ${lvl}.`,
  stairsUpDesc: (lvl: number) => `A carved stone staircase leads up to the corridors of Floor ${lvl}.`,
  stairsCastleAction: 'Return to Castle (Y)',
  stairsDescendAction: (lvl: number) => `Descend to Floor ${lvl} (Y)`,
  stairsAscendAction: (lvl: number) => `Ascend to Floor ${lvl} (Y)`,
  cancelBtn: 'Stay on Current Floor (N)',
  elevatorTitle: (min: number, max: number) => `Gnomish Elevator Shaft (Floors ${min} - ${max})`,
  elevatorSelectPrompt: (current: number) => `Choose destination floor (current floor: Floor ${current}):`,
  elevatorCurrentFloor: '(here)',
  elevatorOperateAction: (min: number, max: number) => `Operate Elevator (Floors ${min} to ${max})`,
  elevatorBlueRibbonRequired: '⚠️ The elevator mechanism is locked by Trebor\'s ward. An officer\'s badge (Blue Ribbon) is required to operate it!',
  elevatorArrivalNotice: (lvl: number) => `The elevator clanks and hums, coming to a stop at Floor ${lvl}.`,

  // HUD & Buttons
  campBtn: 'Set Camp (C)',
  inspectAreaBtn: 'Inspect Area (I)',
  inspectAreaNothing: 'You carefully search the area, but find nothing of interest.',
  inspectAreaFound: 'You search the area and uncover a hidden passage!',
  lightSpellActive: (rounds: number) => `Magical light illuminates the corridors (${rounds} steps remaining).`,
  shieldSpellActive: 'Maporfic divine shield active (+2 Armor Class party defense).',
  darknessZoneWarning: '⚠️ Pitch black darkness! Torches and light spells cannot penetrate this magical gloom.',

  // Fallen Hero Discovery in Dungeon
  fallenHeroFoundTitle: (name: string) => `Fallen Adventurer Discovered: ${name}!`,
  fallenHeroFoundDesc: (name: string, lvl: number, x: number, y: number) =>
    `The rescue expedition discovered the mortal remains of ${name} lying at Floor ${lvl}, coordinates (${x}, ${y})!`,
  fallenHeroRecoverBtn: (name: string) => `Retrieve ${name}'s Body`,
  fallenHeroRosterFull: 'Your active expedition party is full (6/6). Dismiss or remove a hero at the tavern first.',
  fallenHeroRecoverSuccess: (name: string, count: number) =>
    `💀 ${name}'s body has been recovered and secured by your party (${count}/6 heroes). Return to the Castle Temple of Cant to invoke resurrection!`,

  // Camp Modal
  campTitle: 'Camp in the Maze',
  campInventoryTab: 'Inventory & Equipment',
  campFormationTab: 'Party Formation',
  campCloseBtn: 'Break Camp (Leave)',
  campHealthLabel: (hp: number, maxHp: number) => `Hit Points: ${hp}/${maxHp} HP`,
  campSpellsAvailable: 'Available Camp Spells:',
  campNoSpellsAvailable: 'No camp spells known or no spell points remaining.',
  campCastBtn: 'Cast Spell',
  campTargetLabel: 'Target:',
  campSilenceWarningTitle: 'Magical Silence Active (MONTINO)',
  campSilenceWarningBody: (rounds: number) =>
    `The adventurer's voice is mystically suppressed for another ${rounds} round(s). No incantations can be uttered.`,
  campSlotsRemaining: (slots: number) => `${slots} spell point${slots > 1 ? 's' : ''}`,

  // Camp Formation
  frontRow: 'Front Row (Ranks 1 to 3 · Melee Attackers)',
  backRow: 'Back Row (Ranks 4 to 6 · Spells & Support)',
  formationHint: 'Drag and drop or use swap buttons to position your warriors in front and fragile spellcasters behind.',
  moveForwardBtn: 'Move Forward',
  moveBackwardBtn: 'Move Backward',
  swapPositionSuccess: (heroA: string, posA: number, heroB: string, posB: number) =>
    `🔄 Position swapped: #${posA} ${heroA} ⇄ #${posB} ${heroB}!`,
  movedPositionSuccess: (hero: string, pos: number, row: string) =>
    `🔄 ${hero} is now in rank #${pos} (${row}).`,

  // Camp Inventory Actions
  backpackLabel: (count: number) => `Equipment & Backpack (${count}/8 slots):`,
  backpackFullNotice: 'Inventory full (8/8 items max)!',
  emptyBackpack: 'Empty inventory.',
  equipBtn: 'Equip',
  unequipBtn: 'Unequip',
  useBtn: 'Use',
  giveBtn: 'Give',
  dropBtn: 'Drop',
  identifyBishopBtn: (bishop: string) => `Identify (${bishop})`,
  giveTargetSelectPrompt: 'Give item to which companion?',
  giveSuccess: (item: string, target: string) => `📦 ${item} transferred to ${target}.`,
  giveTargetFull: (target: string) => `${target}'s backpack is already full (maximum 8 items)!`,
  giveCursedFail: (item: string) => `The item ${item} is CURSED and bound to your flesh! It cannot be given away.`,
  dropCursedFail: (item: string) => `💀 Impossible to drop ${item}: this cursed item is permanently bound to your body!`,
  dropSuccess: (item: string) => `🗑️ ${item} was discarded into the dungeon corridors.`,
  itemConsumed: (item: string) => `The item ${item} has been completely consumed.`,
  itemTransformed: (item: string) => `The item transformed into ${item}.`,
  notProficientNotice: (hero: string, cls: string, allowed: string) =>
    `${hero} (${cls}) cannot equip this item. Allowed classes: ${allowed}.`,

  // Camp Spell Results
  spellNoEffect: (spell: string, target: string) => `${spell} has no effect on ${target}.`,
  spellHealSuccess: (spell: string, target: string, hp: number, currentHp: number, maxHp: number) =>
    `${spell}: ${target} recovers ${hp} HP (${currentHp}/${maxHp} HP).`,
  spellCurePoisonSuccess: (target: string) => `The poison coursing through ${target} has been entirely neutralized!`,
  spellCureParalysisSuccess: (target: string) => `The holy light restored movement to ${target}. Paralysis cured!`,
  spellCureStonedSuccess: (target: string) => `The petrification has been lifted from ${target}. Flesh returns to life!`,
  spellResurrectSuccess: (target: string) => `✨ EXCELSIOR! ${target} has been resurrected from the dead!`,
  spellResurrectAshes: (target: string) => `💀 The resurrection failed! ${target}'s body turned to ASHES!`,
  spellResurrectLost: (target: string) => `⚰️ The ashes blew away... ${target} is LOST FOREVER in the void!`,
  spellNeedKadorto: (target: string) => `"KADORTO" is required to resurrect ${target} from ashes.`,
  spellAlreadyAlive: (target: string) => `${target} is already among the living.`,
  spellDumapicResult: (level: number, north: number, east: number) =>
    `DUMAPIC divination: Floor ${level} · North: ${north} · East: ${east}.`,
  spellMalorPrompt: 'MALOR Teleportation: specify coordinate offsets (Level, North, East):',
  spellMalorSuccess: (level: number, x: number, y: number) =>
    `✨ MALOR: party teleported to Floor ${level}, (${x}, ${y})!`,
  spellMalorRockDeath: '💀 INTO SOLID ROCK! The entire party materialized inside solid stone!',
  spellMalorInvalid: 'MALOR: invalid coordinates, the spell fizzled into nothingness.',
  spellMaporficShield: '🛡️ MAPORFIC: protective magical wards envelop the entire party (+2 AC).',
  spellLatumapicIdentified: '👁️ LATUMAPIC: true identities of all dungeon monsters revealed.',
};

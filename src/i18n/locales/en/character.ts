import { CharacterTranslations } from '../../types';

export const characterEn: CharacterTranslations = {
  attributesTab: 'Attributes',
  inventoryTab: 'Inventory',
  spellsTab: 'Grimoire',
  prevHeroTooltip: 'Previous companion (Left Arrow)',
  nextHeroTooltip: 'Next companion (Right Arrow)',
  closeTooltip: 'Close sheet (Escape)',

  // Attributes
  attributes: {
    strength: {
      label: 'Strength',
      abbr: 'STR',
      desc: 'Determines melee weapon damage bonus, attack roll accuracy, and ability to wield heavy arms.',
      effect: 'Melee damage & hit bonus',
    },
    iq: {
      label: 'Intelligence (I.Q.)',
      abbr: 'INT',
      desc: 'Measures intellectual prowess and learning rate for powerful Mage spells.',
      effect: 'Mage spells & deciphering',
    },
    piety: {
      label: 'Piety',
      abbr: 'PIE',
      desc: 'Divine devotion bestowing blessings and mastery of Priest miracles.',
      effect: 'Priest divine miracles',
    },
    vitality: {
      label: 'Vitality',
      abbr: 'VIT',
      desc: 'Physical constitution governing hit points gained per level and resurrection survival chances.',
      effect: '+HP per level & fortitude',
    },
    agility: {
      label: 'Agility',
      abbr: 'AGI',
      desc: 'Reflex speed, combat turn initiative, and nimbleness for picking dungeon chest traps.',
      effect: 'Combat initiative & evasion',
    },
    luck: {
      label: 'Luck',
      abbr: 'LUK',
      desc: 'Mystical fortune protecting against dragon breath, poison, instant-death magic, and nasty traps.',
      effect: 'Saving throws & trap resistance',
    },
  },

  // Statuses
  statuses: {
    ok: 'HEALTHY',
    afraid: 'AFRAID',
    asleep: 'ASLEEP',
    paralyzed: 'PARALYZED',
    petrified: 'PETRIFIED',
    dead: 'DEAD',
    ashes: 'ASHES',
    lost: 'LOST IN THE VOID',
  },

  // Alignments
  alignments: {
    good: 'Good',
    neutral: 'Neutral',
    evil: 'Evil',
  },

  // Races
  races: {
    human: 'Human',
    elf: 'Elf',
    dwarf: 'Dwarf',
    gnome: 'Gnome',
    hobbit: 'Hobbit',
  },

  // Classes
  classes: {
    fighter: 'Fighter',
    mage: 'Mage',
    priest: 'Priest',
    thief: 'Thief',
    bishop: 'Bishop',
    samurai: 'Samurai',
    lord: 'Lord',
    ninja: 'Ninja',
  },

  // Combat Stats
  armorClass: 'Armor Class',
  hitPoints: 'Hit Points',
  damage: 'Damage',
  attacks: 'Attacks',
  gold: 'Gold',
  experience: 'Experience',
  nextLevel: 'Next Level',
  level: 'Level',
  age: 'Age',
  years: 'yrs',
  hpShort: 'HP',
  acShort: 'AC',
  goldShort: 'GP',
  lvlShort: 'Lvl.',

  // Inventory actions & messages
  equipBtn: 'Equip',
  unequipBtn: 'Unequip',
  useBtn: 'Use',
  dropBtn: 'Drop',
  bishopIdentifyBtn: 'Identify (Bishop)',
  cursedCannotRemove: (name: string) =>
    `The item ${name} is CURSED! It cannot be removed without a blessing from Boltac's Trading Post.`,
  equippedNotice: (name: string, ac: number, dmg: string) =>
    `${name} equipped successfully (AC: ${ac} · Damage: ${dmg}).`,
  unequippedNotice: (name: string, ac: number, dmg: string) =>
    `${name} unequipped (AC: ${ac} · Damage: ${dmg}).`,
  bishopSuccess: (bishop: string, item: string) =>
    `✨ Success! ${bishop} identifies the item: it is "${item}"!`,
  bishopCurseFumble: (bishop: string, item: string) =>
    `💀 CURSED! ${bishop} fumbles the appraisal and the cursed item (${item}) binds to its bearer!`,
  bishopFail: (bishop: string) =>
    `❌ Identification failed: ${bishop} cannot decipher this item's secrets.`,
  dropConfirm: (item: string) => `Discard ${item} forever? It will be lost in the dungeon dust.`,
  dropSuccess: (item: string) => `${item} was discarded.`,
  consumableNotice: (item: string) => `${item} is a consumable or special item and cannot be equipped as armor/weapon.`,
  notQualifiedNotice: (hero: string, cls: string, allowed: string) =>
    `${hero} (${cls}) cannot wield this item. Allowed classes: ${allowed}.`,

  // Spells
  mageSpellsTitle: 'Mage Spells',
  priestSpellsTitle: 'Priest Miracles',
  spellLevel: (lvl: number) => `Tier ${lvl}`,
  spellPoints: 'Spell Points',
  noSpellsKnown: 'No spells learned in this tier.',

  // Awards
  honorGuardTitle: "Overlord Trebor's Honor Guard Chevron",
  honorGuardDesc:
    'Awarded for retrieving the sacred Amulet of Werdna and saving the kingdom of Trebor.',
  scenarioCompleted: (scenario: string) => `Scenario "${scenario}" completed.`,
};

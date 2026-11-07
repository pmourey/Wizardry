import { CastleTranslations } from '../../types';

export const castleEn: CastleTranslations = {
  // Navigation & Header
  courtyard: 'Castle Courtyard',
  inn: "Adventurer's Inn",
  tavern: "Gilgamesh's Tavern",
  boltac: "Boltac's Trading Post",
  temple: 'Temple of Cant',
  training: 'Training Grounds',
  journal: 'Journal',
  heroLabel: 'Hero:',
  sheetBtn: 'Sheet',
  poolGoldBtn: 'Pool Party Gold',
  poolGoldShort: 'Pool Gold',
  poolGoldTooltip: (gold: number, hero: string) =>
    `Gather all party gold (${gold.toLocaleString()} GP) onto ${hero}`,
  poolGoldSuccess: (gold: number, hero: string) =>
    `All party gold (${gold.toLocaleString()} GP) pooled onto ${hero}!`,
  shareGoldBtn: 'Share Gold Evenly',
  shareGoldShort: 'Share Gold',
  shareGoldTooltip: 'Distribute party gold evenly among all adventurers',
  shareGoldSuccess: (share: number) =>
    `Party gold distributed evenly (${share.toLocaleString()} GP per adventurer)!`,

  // Courtyard
  welcomeFallback: 'Welcome to the Royal Castle',
  descFallback: 'From the courtyard, enter the royal shops, assemble your party, or head to the dungeon maze.',
  innShortDesc: 'Rest and level advancement.',
  boltacShortDesc: 'Weapons, armor & potions.',
  templeShortDesc: 'Resurrection and divine cures.',
  journalShortDesc: '10 most recent chronicles.',
  partyCompositionTitle: (count: number) => `Party Roster (${count}/6)`,
  partyClickHint: 'Click a hero to inspect or transact in shops',
  enterMazeBtn: 'Enter the Maze',
  enterMazeDesc: 'Venture into the perilous depths of the dungeon.',
  emptyPartyWarning: '⚠️ You must recruit at least 1 adventurer at the tavern before entering the maze!',

  // Tavern
  tavernTitle: "Gilgamesh's Tavern",
  tavernSubtitle: 'Recruit or dismiss adventurers to form a party of 1 to 6 companions.',
  recruitBtn: 'Add to Party',
  removeBtn: 'Remove',
  partyFullNotice: 'Your party is already full (maximum 6 adventurers).',
  lostInDungeonBadge: 'Lost in Maze',
  lostCoordinatesDesc: (level: number, x: number, y: number) =>
    `Lies at Floor ${level}, coordinates (${x}, ${y}) · Send a rescue party!`,
  lostBodyNotice: 'Fallen body',
  templeDeceasedBtn: (status: string) => `Temple (${status === 'DEAD' ? 'Dead' : 'Ashes'})`,

  // Inn
  innTitle: "The Adventurer's Inn",
  innSubtitle: 'Rest to restore spell points, recover hit points, and advance character levels.',
  sleepBtn: 'Rest',
  rooms: {
    stables: { name: 'The Stables', desc: 'Free. Restores all spell points, but 0 HP healed.' },
    cots: { name: 'The Cots', desc: '10 GP / week. Heals 1 HP per week & restores spells.' },
    economy: { name: 'Economy Rooms', desc: '50 GP / week. Faster healing (3 HP/week) & spells.' },
    merchant: { name: 'Merchant Suites', desc: '200 GP / week. High comfort (7 HP/week) & spells.' },
    royal: { name: 'Royal Suites', desc: '500 GP / week. Utmost nobility (10 HP/week) & spells.' },
  },
  restNeedRest: 'Resting at the Inn is required to reflect on your deeds and gain levels.',
  restNoExpNeeded: 'Not enough experience points for the next level.',
  restLevelUpSuccess: (name: string, newLevel: number, hpGained: number) =>
    `🎉 Level Up! ${name} advances to Level ${newLevel}! (+${hpGained} Max HP)`,
  restStatIncreased: (stat: string) => `+1 ${stat}!`,
  restStatDecreased: (stat: string) => `-1 ${stat}!`,
  restAgedYears: (name: string, years: number) => `${name} aged by ${years} year(s).`,
  restFinished: (name: string) => `${name} has finished resting. All spell points restored.`,
  restInsufficientGold: 'Not enough gold to pay for this room.',

  // Boltac
  boltacTitle: "Boltac's Trading Post",
  boltacSubtitle: 'Weapons, armor, item identification (I) and uncursing equipment (U)NCURSE.',
  poolAllGoldBtn: (hero: string) => `Pool all gold onto ${hero}`,
  cursedWarningTitle: (hero: string) => `Cursed equipment bound to ${hero}!`,
  cursedWarningBody:
    'Under authentic Wizardry rules, you cannot remove cursed gear yourself. Boltac alone can break the curse using the authentic (U)NCURSE option (for the purchase price of the item).',
  catalogTitle: 'Items for Sale',
  heroInventoryTitle: (hero: string) => `${hero}'s Inventory (Sell, Identify & Uncurse)`,
  emptyInventory: 'No items in inventory.',
  buyBtn: 'Buy',
  sellBtn: 'Sell',
  identifyBtn: (fee: number) => `Identify (${fee.toLocaleString()} GP)`,
  uncurseBtn: (fee: number) => `Uncurse (${fee.toLocaleString()} GP)`,
  uncurseTooltip: (fee: number) =>
    `Have Boltac break the curse and unequip this item for ${fee.toLocaleString()} GP (authentic U)NCURSE)`,
  identifyTooltip: (fee: number) =>
    `Have Boltac appraise and identify this item for ${fee.toLocaleString()} GP`,
  unidentBadge: '[Unidentified]',
  equippedBadge: '[Equipped]',
  cursedBadge: '[Cursed]',
  unusableBadge: 'Unusable',
  incompatibleBadge: '[Incompatible]',
  buySuccess: (item: string, price: number) => `Purchased ${item} for ${price.toLocaleString()} GP.`,
  buyFailGold: 'Not enough gold to purchase this item.',
  buyFailInventory: 'Inventory is full (maximum 8 items).',
  sellSuccess: (item: string, price: number) => `Sold ${item} for ${price.toLocaleString()} GP.`,
  identifySuccess: (item: string) => `Boltac identified the item: it is ${item}!`,
  uncurseSuccess: (item: string) => `The curse on ${item} has been broken and removed!`,
  uncurseFailGold: 'Not enough gold to pay Boltac for uncursing.',
  identifyFailGold: 'Not enough gold to pay Boltac for identification.',

  // Temple of Cant
  templeTitle: 'The Radiant Temple of Cant',
  templeSubtitle:
    'The priests invoke divine miracles to resurrect the fallen, cure petrification, and heal paralysis (poison is automatically neutralized upon returning to the castle).',
  peacefulTitle: 'The Temple is peaceful.',
  peacefulDesc: 'None of your adventurers are dead, petrified, or paralyzed.',
  depositedAtTemple: 'At Temple',
  healthLabel: (hp: number, maxHp: number) => `Health: ${hp}/${maxHp} HP`,
  goldLabel: (gold: number) => `Gold: ${gold.toLocaleString()} GP`,
  resurrectBtn: (fee: number) => `Resurrect (${fee.toLocaleString()} GP)`,
  cureParalysisBtn: (fee: number) => `Cure Paralysis (${fee.toLocaleString()} GP)`,
  cureStonedBtn: (fee: number) => `Cure Petrified (${fee.toLocaleString()} GP)`,
  fullHealthNotice: 'In full health',
  resurrectSuccess: (name: string) => `✨ Miracle! ${name} has been resurrected from the dead!`,
  resurrectFailedAshes: (name: string) =>
    `💀 The resurrection ritual failed! ${name}'s mortal remains have turned to ASHES!`,
  resurrectFailedLost: (name: string) =>
    `⚰️ The ashes scattered into the wind! ${name} is LOST FOREVER in the void!`,
  cureParalysisSuccess: (name: string) => `The holy light restored movement to ${name}. Paralysis cured!`,
  cureStonedSuccess: (name: string) => `The petrification has been lifted from ${name}.`,
  templeFailGold: 'Not enough gold to pay the temple tithes.',

  // Training Grounds
  trainingTitle: 'Training Grounds',
  trainingSubtitle: 'Create new adventurers, roll bonus points, and assign them to your desired class.',
  modeCreateHero: 'Create New Hero',
  modeRespecStats: 'Reallocate Attributes (Existing Hero)',
  nameInputLabel: 'Hero Name',
  namePlaceholder: 'E.g.: ARTHUR',
  raceLabel: 'Race',
  alignLabel: 'Alignment',
  rollStatsBtn: 'Roll Attribute Dice',
  reserveLabel: 'Reserve:',
  pointsRemaining: (remaining: number, total: number) =>
    `${remaining} point${remaining > 1 ? 's' : ''} remaining out of ${total}`,
  rerollBtn: 'Reroll Dice',
  rerollTooltip: 'Reroll random bonus points (e.g. 18-29 for Samurai / Ninja)',
  resetAllocationBtn: 'Reset Allocation',
  resetAllocationTooltip: 'Reset attributes to racial base and return all points to reserve',
  createHeroBtn: 'Enter Adventurer into Guild Roster',
  createHeroSuccess: (name: string, cls: string) =>
    `✓ ${name} the ${cls} has been registered into the Royal Guild Roster!`,
  deleteHeroBtn: 'Delete Adventurer',
  deleteConfirm: (name: string) => `Permanently delete ${name} from the guild? This cannot be undone.`,
  cannotDeleteInParty: 'Cannot delete a hero currently in the active party. Remove them at the tavern first.',
};

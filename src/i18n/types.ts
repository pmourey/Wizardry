export type AppLanguage = 'en' | 'fr';

export interface CommonTranslations {
  scenarios: string;
  backToGame: string;
  gameShort: string;
  locationLabel: string;
  adventurersLabel: string;
  mainMenu: string;
  dungeonFloorPrefix: string;
  keyboardLayoutTitle: (layout: string) => string;
  musicActive: (title: string) => string;
  musicInactive: string;
  music: string;
  mute: string;
  sfxMute: string;
  sfxUnmute: string;
  exportPySide6: string;
  manualsBtn: string;
  manualsTooltip: string;
  oracleBtn: string;
  oracleTooltip: string;
  cheatNavBtn: string;
  cheatNavTooltip: string;
  scenarioMenuTooltip: string;
  langSwitchFrTooltip: string;
  langSwitchEnTooltip: string;
  continueBtn: string;
  cancelBtn: string;
  closeBtn: string;
  confirmBtn: string;

  // ScenarioMenuView
  badgeAnthology: (count: number) => string;
  chooseScenario: string;
  heroDescription: string;
  storageLabel: string;
  exportSaves: string;
  exportSavesTooltip: string;
  importJson: string;

  // Filters
  filterAll: (count: number) => string;
  filterLvl1: (count: number) => string;
  filterHigh: (count: number) => string;
  filterOriental: (count: number) => string;
  filterGothic: (count: number) => string;
  filterScifi: (count: number) => string;

  // Scenario Cards
  scenarioTag: string;
  engineTag: string;
  noLocalSave: string;
  heroSaveSummary: (heroes: number, maxLvl: number) => string;
  floorsCount: (floors: number) => string;

  // Inspector
  byAuthorYear: (author: string, year: string) => string;
  recommendedLevel: string;
  depth: string;
  floorsLabel: (floors: number) => string;
  sourceDisk: string;
  zimlabNotes: string;
  localSessionStatus: (id: string) => string;
  activeParty: string;
  rosterGuild: string;
  heroes: string;
  registered: string;
  newGame: string;
  exploringMaze: (lvl: number, x: number, y: number) => string;
  graveyard: (lvl: number) => string;
  atCastle: (name: string) => string;

  // Transfer
  transferHeader: string;
  transferSelectOption: (num: number, title: string, count: number) => string;
  transferBtn: string;
  transferDiffPrompt: string;
  transferNoHeroes: string;
  transferAllPresent: string;
  transferSuccess: (count: number, title: string) => string;
  transferError: string;
  importSuccess: string;
  importInvalid: string;

  // Launch
  resumeBtn: (title: string) => string;
  launchBtn: (title: string) => string;

  // Castle
  welcomeToCastle: (name: string) => string;
  welcomeFallback: (title: string) => string;

  // Dungeon 3D / WebGL View & HUD
  dungeonRenderModeLabel: string;
  dungeonRenderWireframe: string;
  dungeonRenderStone: string;
  dungeonRenderShortWireframe: string;
  dungeonRenderShortStone: string;
  dungeonRenderTooltip: string;
  dungeonShieldMaporfic: string;
  dungeonShieldTooltip: string;
  dungeonMapBtn: string;
  dungeonMapActive: string;
  dungeonMapTooltip: string;
  dungeonFallenFoundTitle: string;
  dungeonFallenFoundDesc: string;
  dungeonRecoverBodyBtn: string;
  dungeonPartyFullBtn: string;
  dungeonPartyFullWarning: string;
  dungeonRecoverSuccess: string;
  dungeonCampBtn: string;
  dungeonSearchBtn: string;
  dungeonStairsTag: string;
  dungeonLightTag: string;
  dungeonDarkZoneTag: string;
  dungeonDarkZoneTooltip: string;
  dungeonLomilwaTag: string;
  dungeonMilwaTag: string;
  dungeonForward: string;
  dungeonBackward: string;
  dungeonTurnLeft: string;
  dungeonTurnRight: string;
  dungeonKickDoor: string;
}

export interface JournalTranslations {
  title: string;
  recentCountBadge: string;
  subtitle: string;
  clearBtn: string;
  clearConfirm: string;
  filterLabel: string;
  categories: {
    all: string;
    combat: string;
    discovery: string;
    loss: string;
    rescue: string;
    castle: string;
  };
  emptyTitle: string;
  emptyDesc: string;
  enterMazeBtn: string;
  levelBadge: (level: number) => string;

  // Event templates
  royalDecreeDate: string;
  royalDecreeTitle: string;
  royalDecreeDesc: string;
  royalDecreeDetails: string;

  preparationsDate: string;
  preparationsTitle: string;
  preparationsDesc: string;
  preparationsDetails: string;

  chronicleDate: string;
  questBeginsTitle: (title: string) => string;
  questBeginsDesc: (castle: string) => string;

  wipeoutCombatTitle: string;
  wipeoutCombatDesc: string;
  wipeoutPoisonTitle: string;
  wipeoutPoisonDesc: string;
  wipeoutRockTitle: string;
  wipeoutRockDesc: string;
  wipeoutVictimsDetails: (heroes: string[], level: number, x: number, y: number) => string;

  fleeCombatTitle: string;
  fleeCombatDesc: string;

  combatVictoryTitle: (monsters: string, exp: number) => string;
  combatVictoryDesc: (survivorCount: number, exp: number) => string;
  combatVictoryDetails: (monsters: string, totalExp: number, perSurvivor: number) => string;

  alarmTriggeredTitle: string;
  alarmTriggeredDesc: string;

  werdnaDefeatedTitle: string;
  werdnaDefeatedDesc: (heroName: string, itemName: string) => string;
  werdnaDefeatedDetails: (itemName: string, heroName: string) => string;

  chestOpenedTitle: (gold: number) => string;
  chestOpenedDesc: string;
  chestOpenedDetails: (gold: number, itemDesc: string) => string;
  noEquipment: string;

  chestLeftTitle: string;
  chestLeftDesc: string;
  chestLeftDetails: string;

  victorySupremeTitle: string;
  victorySupremeDesc: string;
  victorySupremeDetails: (heroes: string[]) => string;

  castleReturnTitle: string;
  castleReturnWerdnaTitle: string;
  castleReturnWithFallenDesc: (fallen: string[]) => string;
  castleReturnDesc: string;
  castleReturnWerdnaDesc: string;
  castleTempleTransferredDetails: (fallen: string[]) => string;
}

export interface GameOverTranslations {
  skullRockTitle: string;
  skullCombatTitle: string;
  skullWerdnaTitle: string;

  rockWarningBanner: string;
  rockDescription: string;
  rockTombLocation: (level: number, x: number, y: number) => string;
  rockHeroesCrushed: (heroes: string[]) => string;

  lastCoordinatesTitle: (level: number, x: number, y: number) => string;
  fallenHeroesList: (heroes: string[]) => string;
  partyDecimatedNotice: string;

  werdnaGameOverTitle: string;
  werdnaGameOverDesc: string;

  formRescuePartyBtn: string;
  formRescuePartyTooltip: string;
  emergencyRetrievalBtn: string;
  emergencyRetrievalTooltip: string;

  reviveWerdnaTombBtn: string;
  reviveWerdnaFloorBtn: (floor: number) => string;
}

export interface VictoryTranslations {
  bannerTitle: string;
  bannerSubtitle: string;
  proclamationAmuletSafe: string;
  proclamationBoon: (expBonus: number) => string;
  proclamationGuardHonor: string;
  proclamationVaultNote: string;
  honorGuardRosterTitle: string;
  expAwardedBadge: (exp: number) => string;
  chevronBadge: string;
  celebrateAtCastleBtn: string;
  screenTitle: string;
  screenBody: string;
}

export interface CastleTranslations {
  // Navigation & Header
  courtyard: string;
  inn: string;
  tavern: string;
  boltac: string;
  temple: string;
  training: string;
  journal: string;
  heroLabel: string;
  sheetBtn: string;
  poolGoldBtn: string;
  poolGoldShort: string;
  poolGoldTooltip: (gold: number, hero: string) => string;
  poolGoldSuccess: (gold: number, hero: string) => string;
  shareGoldBtn: string;
  shareGoldShort: string;
  shareGoldTooltip: string;
  shareGoldSuccess: (share: number) => string;

  // Courtyard
  welcomeFallback: string;
  descFallback: string;
  innShortDesc: string;
  boltacShortDesc: string;
  templeShortDesc: string;
  journalShortDesc: string;
  partyCompositionTitle: (count: number) => string;
  partyClickHint: string;
  enterMazeBtn: string;
  enterMazeDesc: string;
  emptyPartyWarning: string;

  // Tavern
  tavernTitle: string;
  tavernSubtitle: string;
  recruitBtn: string;
  removeBtn: string;
  partyFullNotice: string;
  lostInDungeonBadge: string;
  lostCoordinatesDesc: (level: number, x: number, y: number) => string;
  lostBodyNotice: string;
  templeDeceasedBtn: (status: string) => string;

  // Inn
  innTitle: string;
  innSubtitle: string;
  sleepBtn: string;
  rooms: {
    stables: { name: string; desc: string };
    cots: { name: string; desc: string };
    economy: { name: string; desc: string };
    merchant: { name: string; desc: string };
    royal: { name: string; desc: string };
  };
  restNeedRest: string;
  restNoExpNeeded: string;
  restLevelUpSuccess: (name: string, newLevel: number, hpGained: number) => string;
  restStatIncreased: (stat: string) => string;
  restStatDecreased: (stat: string) => string;
  restAgedYears: (name: string, years: number) => string;
  restFinished: (name: string) => string;
  restInsufficientGold: string;

  // Boltac
  boltacTitle: string;
  boltacSubtitle: string;
  poolAllGoldBtn: (hero: string) => string;
  cursedWarningTitle: (hero: string) => string;
  cursedWarningBody: string;
  catalogTitle: string;
  heroInventoryTitle: (hero: string) => string;
  emptyInventory: string;
  buyBtn: string;
  sellBtn: string;
  identifyBtn: (fee: number) => string;
  uncurseBtn: (fee: number) => string;
  uncurseTooltip: (fee: number) => string;
  identifyTooltip: (fee: number) => string;
  unidentBadge: string;
  equippedBadge: string;
  cursedBadge: string;
  unusableBadge: string;
  incompatibleBadge: string;
  buySuccess: (item: string, price: number) => string;
  buyFailGold: string;
  buyFailInventory: string;
  sellSuccess: (item: string, price: number) => string;
  identifySuccess: (item: string) => string;
  uncurseSuccess: (item: string) => string;
  uncurseFailGold: string;
  identifyFailGold: string;

  // Temple of Cant
  templeTitle: string;
  templeSubtitle: string;
  peacefulTitle: string;
  peacefulDesc: string;
  depositedAtTemple: string;
  healthLabel: (hp: number, maxHp: number) => string;
  goldLabel: (gold: number) => string;
  resurrectBtn: (fee: number) => string;
  cureParalysisBtn: (fee: number) => string;
  cureStonedBtn: (fee: number) => string;
  fullHealthNotice: string;
  resurrectSuccess: (name: string) => string;
  resurrectFailedAshes: (name: string) => string;
  resurrectFailedLost: (name: string) => string;
  cureParalysisSuccess: (name: string) => string;
  cureStonedSuccess: (name: string) => string;
  templeFailGold: string;

  // Training Grounds
  trainingTitle: string;
  trainingSubtitle: string;
  modeCreateHero: string;
  modeRespecStats: string;
  nameInputLabel: string;
  namePlaceholder: string;
  raceLabel: string;
  alignLabel: string;
  rollStatsBtn: string;
  reserveLabel: string;
  pointsRemaining: (remaining: number, total: number) => string;
  rerollBtn: string;
  rerollTooltip: string;
  resetAllocationBtn: string;
  resetAllocationTooltip: string;
  createHeroBtn: string;
  createHeroSuccess: (name: string, cls: string) => string;
  deleteHeroBtn: string;
  deleteConfirm: (name: string) => string;
  cannotDeleteInParty: string;
}

export interface CharacterTranslations {
  attributesTab: string;
  inventoryTab: string;
  spellsTab: string;
  prevHeroTooltip: string;
  nextHeroTooltip: string;
  closeTooltip: string;

  // Attributes
  attributes: {
    strength: { label: string; abbr: string; desc: string; effect: string };
    iq: { label: string; abbr: string; desc: string; effect: string };
    piety: { label: string; abbr: string; desc: string; effect: string };
    vitality: { label: string; abbr: string; desc: string; effect: string };
    agility: { label: string; abbr: string; desc: string; effect: string };
    luck: { label: string; abbr: string; desc: string; effect: string };
  };

  // Statuses
  statuses: {
    ok: string;
    afraid: string;
    asleep: string;
    paralyzed: string;
    petrified: string;
    dead: string;
    ashes: string;
    lost: string;
  };

  // Alignments
  alignments: {
    good: string;
    neutral: string;
    evil: string;
  };

  // Races
  races: {
    human: string;
    elf: string;
    dwarf: string;
    gnome: string;
    hobbit: string;
  };

  // Classes
  classes: {
    fighter: string;
    mage: string;
    priest: string;
    thief: string;
    bishop: string;
    samurai: string;
    lord: string;
    ninja: string;
  };

  // Combat Stats
  armorClass: string;
  hitPoints: string;
  damage: string;
  attacks: string;
  gold: string;
  experience: string;
  nextLevel: string;
  level: string;
  age: string;
  years: string;
  hpShort: string;
  acShort: string;
  goldShort: string;
  lvlShort: string;

  // Inventory actions & messages
  equipBtn: string;
  unequipBtn: string;
  useBtn: string;
  dropBtn: string;
  bishopIdentifyBtn: string;
  cursedCannotRemove: (name: string) => string;
  equippedNotice: (name: string, ac: number, dmg: string) => string;
  unequippedNotice: (name: string, ac: number, dmg: string) => string;
  bishopSuccess: (bishop: string, item: string) => string;
  bishopCurseFumble: (bishop: string, item: string) => string;
  bishopFail: (bishop: string) => string;
  dropConfirm: (item: string) => string;
  dropSuccess: (item: string) => string;
  consumableNotice: (item: string) => string;
  notQualifiedNotice: (hero: string, cls: string, allowed: string) => string;

  // Spells
  mageSpellsTitle: string;
  priestSpellsTitle: string;
  spellLevel: (lvl: number) => string;
  spellPoints: string;
  noSpellsKnown: string;

  // Awards
  honorGuardTitle: string;
  honorGuardDesc: string;
  scenarioCompleted: (scenario: string) => string;
}

export interface DungeonTranslations {
  // Navigation & Prompts
  stairsCastle: string;
  stairsDown: (lvl: number) => string;
  stairsUp: (lvl: number) => string;
  stairsCastleDesc: string;
  stairsDownDesc: (lvl: number) => string;
  stairsUpDesc: (lvl: number) => string;
  stairsCastleAction: string;
  stairsDescendAction: (lvl: number) => string;
  stairsAscendAction: (lvl: number) => string;
  cancelBtn: string;
  elevatorTitle: (min: number, max: number) => string;
  elevatorSelectPrompt: (current: number) => string;
  elevatorCurrentFloor: string;
  elevatorOperateAction: (min: number, max: number) => string;
  elevatorBlueRibbonRequired: string;
  elevatorArrivalNotice: (lvl: number) => string;

  // HUD & Buttons
  campBtn: string;
  inspectAreaBtn: string;
  inspectAreaNothing: string;
  inspectAreaFound: string;
  lightSpellActive: (rounds: number) => string;
  shieldSpellActive: string;
  darknessZoneWarning: string;

  // Fallen Hero Discovery in Dungeon
  fallenHeroFoundTitle: (name: string) => string;
  fallenHeroFoundDesc: (name: string, lvl: number, x: number, y: number) => string;
  fallenHeroRecoverBtn: (name: string) => string;
  fallenHeroRosterFull: string;
  fallenHeroRecoverSuccess: (name: string, count: number) => string;

  // Camp Modal
  campTitle: string;
  campInventoryTab: string;
  campFormationTab: string;
  campCloseBtn: string;
  campHealthLabel: (hp: number, maxHp: number) => string;
  campSpellsAvailable: string;
  campNoSpellsAvailable: string;
  campCastBtn: string;
  campTargetLabel: string;
  campSilenceWarningTitle: string;
  campSilenceWarningBody: (rounds: number) => string;
  campSlotsRemaining: (slots: number) => string;

  // Camp Formation
  frontRow: string;
  backRow: string;
  formationHint: string;
  moveForwardBtn: string;
  moveBackwardBtn: string;
  swapPositionSuccess: (heroA: string, posA: number, heroB: string, posB: number) => string;
  movedPositionSuccess: (hero: string, pos: number, row: string) => string;

  // Camp Inventory Actions
  backpackLabel: (count: number) => string;
  backpackFullNotice: string;
  emptyBackpack: string;
  equipBtn: string;
  unequipBtn: string;
  useBtn: string;
  giveBtn: string;
  dropBtn: string;
  identifyBishopBtn: (bishop: string) => string;
  giveTargetSelectPrompt: string;
  giveSuccess: (item: string, target: string) => string;
  giveTargetFull: (target: string) => string;
  giveCursedFail: (item: string) => string;
  dropCursedFail: (item: string) => string;
  dropSuccess: (item: string) => string;
  itemConsumed: (item: string) => string;
  itemTransformed: (item: string) => string;
  notProficientNotice: (hero: string, cls: string, allowed: string) => string;

  // Camp Spell Results
  spellNoEffect: (spell: string, target: string) => string;
  spellHealSuccess: (spell: string, target: string, hp: number, currentHp: number, maxHp: number) => string;
  spellCurePoisonSuccess: (target: string) => string;
  spellCureParalysisSuccess: (target: string) => string;
  spellCureStonedSuccess: (target: string) => string;
  spellResurrectSuccess: (target: string) => string;
  spellResurrectAshes: (target: string) => string;
  spellResurrectLost: (target: string) => string;
  spellNeedKadorto: (target: string) => string;
  spellAlreadyAlive: (target: string) => string;
  spellDumapicResult: (level: number, north: number, east: number) => string;
  spellMalorPrompt: string;
  spellMalorSuccess: (level: number, x: number, y: number) => string;
  spellMalorRockDeath: string;
  spellMalorInvalid: string;
  spellMaporficShield: string;
  spellLatumapicIdentified: string;
}

export interface MiniMapTranslations {
  levelTitle: (lvl: number) => string;
  radarModeBtn: string;
  fullModeBtn: string;
  radarModeTooltip: string;
  fullModeTooltip: string;
  revealAllBtn: string;
  hideUndiscoveredBtn: string;
  revealAllTooltip: string;
  legendToggleBtn: string;
  closeBtn: string;
  closeMinimapBtn: string;
  expandModalBtn: string;
  viewMapBtn: string;
  coordinates: (x: number, y: number) => string;

  // Tooltips
  tooltipPlayer: (x: number, y: number, dir: string) => string;
  tooltipWall: (x: number, y: number) => string;
  tooltipDoor: (x: number, y: number) => string;
  tooltipSecretDoor: (x: number, y: number) => string;
  tooltipOneWayDoor: (x: number, y: number) => string;
  tooltipStairsCastle: (x: number, y: number) => string;
  tooltipStairsUp: (lvl: number, x: number, y: number) => string;
  tooltipStairsDown: (lvl: number, x: number, y: number) => string;
  tooltipTeleporter: (x: number, y: number) => string;
  tooltipPit: (x: number, y: number) => string;
  tooltipFallenHero: (name: string, x: number, y: number) => string;
  tooltipDarkness: (x: number, y: number) => string;

  // Legend
  legendTitle: string;
  legendPlayer: string;
  legendVisited: string;
  legendWall: string;
  legendDoor: string;
  legendSecretDoor: string;
  legendOneWayDoor: string;
  legendStairsUp: string;
  legendStairsDown: string;
  legendTeleporter: string;
  legendPit: string;
  legendDarkness: string;
  legendFallenBody: string;

  // Shortcuts & Touch
  shortcutsFooter: (fwdKey: string) => string;
  closeMapShortcut: string;
  openMapShortcut: string;
  cardinalNorth: string;
  cardinalEast: string;
  cardinalSouth: string;
  cardinalWest: string;
}

export interface CombatTranslations {
  combatTitle: string;
  surprisePartySubtitle: string;
  surpriseMonstersSubtitle: string;
  surpriseNoneSubtitle: string;
  surprisePartyBadge: string;
  surpriseMonstersBadge: string;
  groupHeader: (idx: number) => string;
  partyOverviewTitle: (standing: number, total: number) => string;
  partyOverviewSubtitle: string;
  ambushTitle: string;
  ambushDesc: string;
  ambushBtn: string;
  allHelplessTitle: string;
  allHelplessDescAsleep: string;
  allHelplessDescParalyzed: string;
  resolveMonstersTurnBtn: string;
  surrenderBtn: string;
  friendlyTitle: string;
  friendlySubtitle: (monster: string) => string;
  friendlyDesc: string;
  friendlyLeaveBtn: string;
  friendlyFightBtn: string;
  friendlyFightTooltip: string;
  friendlyCorruptedAlert: (names: string) => string;
  monstersDefeatedTitle: string;
  monstersDefeatedDesc: string;
  continueRewardsBtn: string;
  heroOrderHeader: (current: number, total: number) => string;
  vanguardRankBadge: (rank: number) => string;
  rearguardRankBadge: (rank: number) => string;
  undoBtn: string;
  targetGroupLabel: string;
  silenceAlert: (hero: string, rounds: number) => string;
  selectSpellPrompt: string;
  selectItemPrompt: string;
  selectSpellTargetPrompt: (spell: string) => string;
  selectItemAllyPrompt: (item: string, spell?: string) => string;
  selectItemEnemyPrompt: (item: string, spell?: string) => string;
  fightBtn: string;
  fightTooltipFront: (grp: number) => string;
  fightTooltipBack: string;
  backRankLabel: string;
  spellsBtn: (count: number) => string;
  itemsBtn: (count: number) => string;
  parryBtn: string;
  dispellBtn: string;
  runBtn: string;
  runTooltip: string;
  combatLogTitle: string;
  fleeSuccessLog: string;
  fleeFailedLog: string;
  identifiedLog: (name: string) => string;
}

export interface ChestTranslations {
  chestTitle: string;
  chestSubtitle: string;
  disarmedSafeBadge: string;
  explodedSafeBadge: string;
  calfoBadge: (trap: string) => string;
  armedBadge: string;
  operatorLabel: string;
  inspectBtn: string;
  calfoBtn: string;
  leaveBtn: string;
  disarmBtn: string;
  suspectedTrapLabel: string;
  openSafeBtn: string;
  openNeutralizedBtn: string;
  openLootBtn: string;
  resumeExplorationBtn: string;
  expAwardMsg: (perSurvivor: number, total: number) => string;
  chestFoundMsg: string;
  inspectSuccessLog: (hero: string, trap: string) => string;
  inspectSprungLog: (hero: string, trap: string) => string;
  calfoRevealLog: (priest: string, trap: string) => string;
  noPriestCalfo: string;
  disarmSuccessLog: (hero: string, trap: string) => string;
  disarmSprungLog: (hero: string, trap: string) => string;
  disarmFailLog: (hero: string) => string;
  openPriedSprungLog: (trap: string) => string;
  openSafeLog: string;
  openNoTrapLog: string;
  goldFoundLog: (total: number, share: number) => string;
  itemFoundLog: (item: string, hero: string) => string;
  backpacksFullLog: string;
  leaveChestLog: string;
  partyWipeoutChest: string;
  traps: Record<string, string>;
}

export interface CheatTranslations {
  modalTitle: string;
  tabExp: string;
  tabGold: string;
  tabKeys: string;
  tabRestore: string;
  targetHeroLabel: string;
  allPartyOption: string;
  targetLevelLabel: string;
  setLevelBtn: (lvl: number) => string;
  maxStatsBtn: string;
  giveGoldBtn: (amount: number) => string;
  giveSilverKeyBtn: string;
  giveBronzeKeyBtn: string;
  giveGoldKeyBtn: string;
  giveBlueRibbonBtn: string;
  giveAmuletBtn: string;
  giveAllKeysBtn: string;
  restoreAllHpBtn: string;
  restoreAllSpellSlotsBtn: string;
  resurrectAllDeadBtn: string;
  cureAllPoisonBtn: string;
  respawnWerdnaBtn: string;
  werdnaRespawnedSuccess: string;
  restoreSuccess: string;
  keysGivenSuccess: string;
  goldGivenSuccess: (amount: number) => string;
  levelSetSuccess: (lvl: number) => string;
}

export interface ManualsTranslations {
  modalTitle: string;
  searchPlaceholder: string;
  categoryAll: string;
  categoryOfficial: string;
  categoryFanScenario: string;
  categoryGrimoire: string;
  categoryModding: string;
  filterLangAll: string;
  filterLangFr: string;
  filterLangEn: string;
  pagesCount: (pages: number) => string;
  openPdfBtn: string;
  externalArchiveBtn: string;
  noResults: string;
}

export interface LocaleSchema {
  common: CommonTranslations;
  journal: JournalTranslations;
  gameOver: GameOverTranslations;
  victory: VictoryTranslations;
  castle: CastleTranslations;
  character: CharacterTranslations;
  dungeon: DungeonTranslations;
  miniMap: MiniMapTranslations;
  combat: CombatTranslations;
  chest: ChestTranslations;
  cheat: CheatTranslations;
  manuals: ManualsTranslations;
}

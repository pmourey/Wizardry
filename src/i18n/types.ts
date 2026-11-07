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

export interface LocaleSchema {
  common: CommonTranslations;
  journal: JournalTranslations;
  gameOver: GameOverTranslations;
  victory: VictoryTranslations;
}

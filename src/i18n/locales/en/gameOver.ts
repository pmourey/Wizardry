import { GameOverTranslations } from '../../types';

export const gameOverEn: GameOverTranslations = {
  skullRockTitle: "*** YOU HAVE TELEPORTED INTO SOLID ROCK! ***",
  skullCombatTitle: "Party Decimated in the Maze",
  skullWerdnaTitle: "The Arch-Mage Werdna has Fallen!",

  rockWarningBanner: "*** YOU HAVE TELEPORTED INTO SOLID ROCK! (OOPS!) ***",
  rockDescription:
    "The party materialized inside solid stone. All your adventurers were instantly crushed and reduced to ashes within the rock.",
  rockTombLocation: (level: number, x: number, y: number) =>
    `Stone Tomb: Floor ${level}, position (${x}, ${y})`,
  rockHeroesCrushed: (heroes: string[]) => `Annihilated Heroes: ${heroes.join(', ')}`,

  lastCoordinatesTitle: (level: number, x: number, y: number) =>
    `Last Known Coordinates: Floor ${level}, position (${x}, ${y})`,
  fallenHeroesList: (heroes: string[]) => `Fallen Heroes: ${heroes.join(', ')}`,
  partyDecimatedNotice:
    "According to the original Wizardry code, an annihilated party cannot move, fight, or return to the Castle. Their bodies remain in the dungeon unless a rescue party comes to recover them (each body occupies one party slot).",

  werdnaGameOverTitle: "End of the Quest for Vengeance",
  werdnaGameOverDesc:
    "The adventuring parties dispatched by Overlord Trebor pierced your defenses and destroyed your mortal form. In Wizardry IV, you are the master of the dungeon: no royal garrison from Trebor will come to your rescue!",

  formRescuePartyBtn: "Assemble a Rescue Party",
  formRescuePartyTooltip: "Form a rescue party at Gilgamesh's Tavern and venture into the maze",
  emergencyRetrievalBtn: "Recover Bodies via Royal Guard",
  emergencyRetrievalTooltip: "Emergency extraction of fallen heroes back to the Temple of Cant",

  reviveWerdnaTombBtn: "Resurrect at Tomb of Werdna (Fl. 10)",
  reviveWerdnaFloorBtn: (floor: number) => `Resurrect at entrance of Floor ${floor}`,
};

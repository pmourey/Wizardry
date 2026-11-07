import { JournalTranslations } from '../../types';

export const journalEn: JournalTranslations = {
  title: "Adventure Journal",
  recentCountBadge: "Last 10 Chronicles",
  subtitle: "Official chronicles of heroic deeds, combat victories, uncovered treasures, and tragedies faced by your guild in Trebor's Proving Grounds.",
  clearBtn: "Clear",
  clearConfirm: "Reset the adventure journal?",
  filterLabel: "Filters:",
  categories: {
    all: "All",
    combat: "Combat",
    discovery: "Discovery",
    loss: "Loss",
    rescue: "Rescue",
    castle: "Castle",
  },
  emptyTitle: "No chronicles in this category",
  emptyDesc: "Your adventurers have not recorded any matching events yet. Venture into the maze!",
  enterMazeBtn: "Enter the Dungeon",
  levelBadge: (level: number) => `Fl. ${level}`,

  royalDecreeDate: "Royal Decree",
  royalDecreeTitle: "Overlord Trebor's Proclamation",
  royalDecreeDesc: "By royal decree, the charter of your adventuring guild is ratified. You are granted access to the Proving Grounds to vanquish Werdna.",
  royalDecreeDetails: "Supreme objective: Retrieve the Amulet on floor 10",

  preparationsDate: "Preparations",
  preparationsTitle: "Party Assembly & Arming",
  preparationsDesc: "Your adventurers gathered at Gilgamesh's Tavern and equipped their weapons at Boltac's before entering the iron gate.",
  preparationsDetails: "6 adventurers ready to face the maze traps and monsters",

  chronicleDate: "Chronicle",
  questBeginsTitle: (title: string) => `Quest Begins: ${title}`,
  questBeginsDesc: (castle: string) => `Your party's arrival has been recorded at ${castle}. Your mission begins in this scenario.`,

  wipeoutCombatTitle: "Complete Party Decimation in Combat",
  wipeoutCombatDesc: "All your adventurers have fallen. Their lifeless bodies lie in the dark depths of the dungeon.",
  wipeoutPoisonTitle: "Party Succumbed to Poison",
  wipeoutPoisonDesc: "The venom has drained the remaining strength of the party. All your heroes collapsed.",
  wipeoutRockTitle: "*** YOU HAVE TELEPORTED INTO SOLID ROCK! ***",
  wipeoutRockDesc: "YOU HAVE TELEPORTED INTO SOLID ROCK! The entire party has materialized into solid rock. There are no survivors! (OOPS!)",
  wipeoutVictimsDetails: (heroes: string[], level: number, x: number, y: number) =>
    `Fallen: ${heroes.join(', ')} · Location: Floor ${level}, position (${x}, ${y})`,

  fleeCombatTitle: "Strategic Retreat from Battle",
  fleeCombatDesc: "Facing perilous dungeon horrors, your party prudently fled combat to fight another day.",

  combatVictoryTitle: (monsters: string, exp: number) =>
    `Victory over ${monsters || 'monsters'} (+${exp.toLocaleString()} EXP)`,
  combatVictoryDesc: (survivorCount: number, exp: number) =>
    `Your brave warriors defeated the enemy in fierce hand-to-hand combat. Each of the ${survivorCount} survivor(s) (OK status) receives +${exp.toLocaleString()} EXP.`,
  combatVictoryDetails: (monsters: string, totalExp: number, perSurvivor: number) =>
    `Defeated: ${monsters || 'Dungeon creatures'} · Total EXP: ${totalExp.toLocaleString()} (+${perSurvivor.toLocaleString()} EXP / survivor)`,

  alarmTriggeredTitle: "Dungeon Alarm Triggered!",
  alarmTriggeredDesc: "A piercing shriek alerted another pack of bloodthirsty creatures, lunging to attack!",

  werdnaDefeatedTitle: "Supreme Victory over Werdna! Amulet Recovered!",
  werdnaDefeatedDesc: (heroName: string, itemName: string) =>
    `The Arch-Mage Werdna is vanquished! ${heroName} recovers the legendary Amulet of Werdna (${itemName})! Return it to Trebor's Castle to complete your quest!`,
  werdnaDefeatedDetails: (itemName: string, heroName: string) =>
    `Legendary Artifact: ${itemName} (${heroName}'s inventory)`,

  chestOpenedTitle: (gold: number) => `Monster Chest Opened (+${gold.toLocaleString()} GP)`,
  chestOpenedDesc: "Your party carefully inspected and searched the chest left behind by the monsters.",
  chestOpenedDetails: (gold: number, itemDesc: string) => `Treasure: +${gold.toLocaleString()} GP · ${itemDesc}`,
  noEquipment: "No equipment",

  chestLeftTitle: "Treasure Chest Left Sealed",
  chestLeftDesc: "Lacking a skilled thief or a Calfo spell, your party prudently left the chest undisturbed (Pascal rule L)EAVE).",
  chestLeftDetails: "Trap un-triggered · Exploration resumed",

  victorySupremeTitle: "👑 SUPREME VICTORY: Werdna's Amulet Returned to Trebor!",
  victorySupremeDesc: "You have completed your quest! The Amulet is restored to your beneficent ruler, Lord Trebor. In return, he grants a royal boon of 250,000 EXP each and initiates your heroes into the Overlord's Honor Guard, with the perpetual Chevron (>)!",
  victorySupremeDetails: (heroes: string[]) =>
    `Honored Heroes: ${heroes.join(', ')} · +250,000 EXP each · Honor Chevron [ > ] awarded!`,

  castleReturnTitle: "Return to Castle of Trebor",
  castleReturnWerdnaTitle: "Arrival at Trebor's Castle (Surface)",
  castleReturnWithFallenDesc: (fallen: string[]) =>
    `The party returns to the castle. The remains of ${fallen.join(', ')} have been transferred from the party to the Temple of Cant.`,
  castleReturnDesc: "The party ascends the stairs back to the safety of the Castle.",
  castleReturnWerdnaDesc: "Werdna and his monster hordes breached the dungeon and tread upon Trebor's Castle!",
  castleTempleTransferredDetails: (fallen: string[]) => `Transferred to Temple of Cant: ${fallen.join(', ')}`,
};

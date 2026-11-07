import { JournalTranslations } from '../../types';

export const journalFr: JournalTranslations = {
  title: "Journal d'Aventures",
  recentCountBadge: "10 Derniers Récits",
  subtitle: "Chroniques officielles des hauts faits, victoires au combat, butins déterrés et drames essuyés par votre guilde dans les profondeurs de Trebor.",
  clearBtn: "Effacer",
  clearConfirm: "Réinitialiser le journal d'aventures ?",
  filterLabel: "Filtres :",
  categories: {
    all: "Tous",
    combat: "Combats",
    discovery: "Découvertes",
    loss: "Pertes",
    rescue: "Secours",
    castle: "Château",
  },
  emptyTitle: "Aucun récit dans cette catégorie",
  emptyDesc: "Vos aventuriers n'ont pas encore consigné d'événement correspondant. Aventurez-vous dans le labyrinthe !",
  enterMazeBtn: "Entrer dans le Donjon",
  levelBadge: (level: number) => `Niv. ${level}`,

  royalDecreeDate: "Décret Royal",
  royalDecreeTitle: "Proclamation de l'Overlord Trebor",
  royalDecreeDesc: "Par décret souverain, la création de votre guilde d'aventuriers a été ratifiée. L'accès aux Proving Grounds vous est accordé pour terrasser le sorcier Werdna.",
  royalDecreeDetails: "Objectif suprême : Récupérer l'Amulette au 10e sous-sol",

  preparationsDate: "Préparatifs",
  preparationsTitle: "Constitution de l'Escouade & Fourbissage",
  preparationsDesc: "Vos héros se sont rassemblés à la Taverne de Gilgamesh et ont acquis leurs premières armes chez Boltac avant de franchir la grille de fer.",
  preparationsDetails: "6 aventuriers prêts à braver les pièges et les bêtes du dédale",

  chronicleDate: "Chronique",
  questBeginsTitle: (title: string) => `Départ de la Quête : ${title}`,
  questBeginsDesc: (castle: string) => `L'enregistrement de votre escouade a été consigné au ${castle}. Votre mission débute au cœur de ce scénario.`,

  wipeoutCombatTitle: "Décimation complète de l'escouade au combat",
  wipeoutCombatDesc: "Tous vos aventuriers ont succombé. Leurs corps sans vie gisent dans les ténèbres du donjon.",
  wipeoutPoisonTitle: "Hécatombe causée par le poison",
  wipeoutPoisonDesc: "Le venin a insidieusement drainé les dernières forces de l'escouade. Tous vos héros se sont effondrés.",
  wipeoutRockTitle: "VOUS VOUS ÊTES TÉLÉPORTÉ DANS LA ROCHE SOLIDE !",
  wipeoutRockDesc: "YOU HAVE TELEPORTED INTO SOLID ROCK! L'escouade entière a été instantanément broyée et anéantie dans la pierre compacte. Il n'y a aucun survivant ! (OOPS!)",
  wipeoutVictimsDetails: (heroes: string[], level: number, x: number, y: number) =>
    `Victimes : ${heroes.join(', ')} · Lieu : Niveau ${level}, position (${x}, ${y})`,

  fleeCombatTitle: "Repli stratégique devant les monstres",
  fleeCombatDesc: "Face aux périls du donjon, votre escouade a prudemment fui l'affrontement pour préserver sa survie.",

  combatVictoryTitle: (monsters: string, exp: number) =>
    `Victoire contre ${monsters || 'des monstres'} (+${exp.toLocaleString()} XP)`,
  combatVictoryDesc: (survivorCount: number, exp: number) =>
    `Vos braves ont terrassé l'ennemi au terme d'un rude corps-à-corps dans les couloirs de pierre. Chacun des ${survivorCount} survivant(s) (statut OK) reçoit +${exp.toLocaleString()} XP.`,
  combatVictoryDetails: (monsters: string, totalExp: number, perSurvivor: number) =>
    `Monstres éliminés : ${monsters || 'Créatures du donjon'} · Total XP : ${totalExp.toLocaleString()} (+${perSurvivor.toLocaleString()} XP / survivant)`,

  alarmTriggeredTitle: "Alarme du donjon déclenchée !",
  alarmTriggeredDesc: "Un cri strident a alerté une nouvelle meute de créatures prêtes à bondir !",

  werdnaDefeatedTitle: "Victoire Suprême sur Werdna ! L'Amulette récupérée !",
  werdnaDefeatedDesc: (heroName: string, itemName: string) =>
    `L'archimage Werdna est vaincu ! ${heroName} ramasse la légendaire Amulette de Werdna (${itemName}) ! Rapportez-la au Château de Trebor pour achever votre quête !`,
  werdnaDefeatedDetails: (itemName: string, heroName: string) =>
    `Objet légendaire obtenu : ${itemName} (sac de ${heroName})`,

  chestOpenedTitle: (gold: number) => `Coffre de monstre ouvert (+${gold.toLocaleString()} PO)`,
  chestOpenedDesc: "Votre escouade a inspecté et fouillé le coffre abandonné par les monstres.",
  chestOpenedDetails: (gold: number, itemDesc: string) => `Trésor : +${gold.toLocaleString()} PO · ${itemDesc}`,
  noEquipment: "Aucun équipement",

  chestLeftTitle: "Coffre aux trésors laissé scellé",
  chestLeftDesc: "Faute de voleur qualifié ou de sort Calfo, votre escouade a prudemment laissé le coffre intact (Règle Pascal L)EAVE).",
  chestLeftDetails: "Piège non déclenché · Exploration poursuivie",

  victorySupremeTitle: "👑 VICTOIRE SUPRÊME : L'Amulette de Werdna est restituée à Trebor !",
  victorySupremeDesc: "Vous avez accompli votre quête ! L'Amulette est rendue à votre bienveillant suzerain, le Seigneur Trebor. En récompense, il octroie un don royal de 250 000 XP à chaque héros et les initie dans la prestigieuse Garde d'Honneur du Suzerain, avec le Chevron (>) perpétuel !",
  victorySupremeDetails: (heroes: string[]) =>
    `Héros honorés : ${heroes.join(', ')} · +250 000 XP chacun · Chevron d'honneur [ > ] décerné !`,

  castleReturnTitle: "Retour au Château de Trebor",
  castleReturnWerdnaTitle: "Arrivée au Château de Trebor (Surface)",
  castleReturnWithFallenDesc: (fallen: string[]) =>
    `L'escouade regagne le château. Les dépouilles de ${fallen.join(', ')} ont été retirées du groupe et confiées au Temple de Cant.`,
  castleReturnDesc: "L'escouade a gravi les marches pour regagner la sécurité du château.",
  castleReturnWerdnaDesc: "Werdna et ses hordes ont percé le donjon et foulent la surface du Château de Trebor !",
  castleTempleTransferredDetails: (fallen: string[]) => `Transférés au Temple de Cant : ${fallen.join(', ')}`,
};

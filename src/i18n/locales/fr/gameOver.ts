import { GameOverTranslations } from '../../types';

export const gameOverFr: GameOverTranslations = {
  skullRockTitle: "VOUS VOUS ÊTES TÉLÉPORTÉ DANS LA ROCHE SOLIDE !",
  skullCombatTitle: "Escouade Décimée dans le Dédale",
  skullWerdnaTitle: "L'Archi-Mage Werdna a été Terrassé !",

  rockWarningBanner: "*** VOUS VOUS ÊTES TÉLÉPORTÉ DANS LA ROCHE SOLIDE ! (OOPS!) ***",
  rockDescription:
    "L'escouade s'est matérialisée dans la masse minérale compacte. Tous vos aventuriers ont été instantanément broyés et réduits en cendres dans la roche.",
  rockTombLocation: (level: number, x: number, y: number) =>
    `Tombeau de pierre : Niveau ${level}, position (${x}, ${y})`,
  rockHeroesCrushed: (heroes: string[]) => `Héros anéantis : ${heroes.join(', ')}`,

  lastCoordinatesTitle: (level: number, x: number, y: number) =>
    `Dernières coordonnées connues : Niveau ${level}, position (${x}, ${y})`,
  fallenHeroesList: (heroes: string[]) => `Héros tombés : ${heroes.join(', ')}`,
  partyDecimatedNotice:
    "Selon le code originel de Wizardry, un groupe d'aventuriers anéanti ne peut plus se déplacer, combattre ni regagner le château. Leurs corps restent étendus dans le donjon à moins qu'une escouade de secours ne vienne les récupérer (chaque dépouille occupe un emplacement du groupe).",

  werdnaGameOverTitle: "Fin de la Quête de Vengeance",
  werdnaGameOverDesc:
    "Les groupes d'aventuriers envoyés par l'Overlord Trebor ont percé vos défenses et détruit votre enveloppe charnelle. Dans Wizardry IV, vous êtes le maître du donjon : aucune garnison royale de Trebor ne viendra vous secourir !",

  formRescuePartyBtn: "Former une escouade de secours",
  formRescuePartyTooltip: "Former une escouade de secours à la taverne et s'aventurer dans le donjon",
  emergencyRetrievalBtn: "Rapatrier par les gardes de Trebor",
  emergencyRetrievalTooltip: "Rapatrier les corps au château pour les ressusciter au Temple de Cant",

  reviveWerdnaTombBtn: "Ressusciter au Tombeau de Werdna (Niv. 10)",
  reviveWerdnaFloorBtn: (floor: number) => `Ressusciter au début du Niveau ${floor}`,
};

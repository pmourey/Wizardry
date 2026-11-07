import { VictoryTranslations } from '../../types';

export const victoryFr: VictoryTranslations = {
  bannerTitle: "*** FÉLICITATIONS ***",
  bannerSubtitle: "LA QUÊTE EST ACCOMPLIE · LE SEIGNEUR TREBOR EXULTE",
  proclamationAmuletSafe:
    "VOUS AVEZ ACCOMPLI VOTRE QUÊTE ET L'AMULETTE DE WERDNA EST DÉSORMAIS RESTITUÉE ENTRE LES MAINS DE VOTRE SUZERAIN BIENVEILLANT, LE SEIGNEUR TREBOR.",
  proclamationBoon: (expBonus: number) =>
    `EN RÉCOMPENSE DE CET IMMENSE EXPLOIT, IL VOUS ACCORDE UN DON ROYAL DE +${expBonus.toLocaleString()} POINTS D'EXPÉRIENCE CHACUN !`,
  proclamationGuardHonor:
    "DE PLUS, VOUS ÊTES INITIÉS AU SEIN DE LA PRESTIGIEUSE GARDE D'HONNEUR DU SUZERAIN ET PORTEREZ DÉSORMAIS LE CHEVRON (>) DE CE RANG POUR TOUJOURS.",
  proclamationVaultNote:
    "Trebor dépose l'Amulette dans la chambre forte du Trésor Royal, et vous accorde le privilège d'élite de conserver l'ensemble de votre équipement !",
  honorGuardRosterTitle: "Membres de la Garde d'Honneur de Trebor :",
  expAwardedBadge: (exp: number) => `+${exp.toLocaleString()} XP`,
  chevronBadge: "CHEVRON D'HONNEUR [ > ]",
  celebrateAtCastleBtn: "Retourner au Château célébrer la victoire",
  screenTitle: "*** FÉLICITATIONS ***",
  screenBody:
    "Vous avez terrassé le sorcier Werdna et rapporté l'Amulette sacrée à l'Overlord Trebor ! Chaque survivant reçoit 250 000 Points d'Expérience et l'insigne d'honneur (>) de la garde suprême.",
};

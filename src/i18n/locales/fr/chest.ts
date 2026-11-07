import { ChestTranslations } from '../../types';

export const chestFr: ChestTranslations = {
  chestTitle: 'Coffre aux Trésors Découvert',
  chestSubtitle: 'Inspectez, désamorcez ou forcez le coffre avec précaution.',
  disarmedSafeBadge: 'Désamorcé (Inoffensif)',
  explodedSafeBadge: 'Piège Déclenché (Neutralisé)',
  calfoBadge: (trap: string) => `Calfo : ${trap}`,
  armedBadge: 'Piège Armé (Non désamorcé)',
  operatorLabel: 'Aventurier à l\'action :',
  inspectBtn: '(I) Inspecter',
  calfoBtn: '(C) Sort CALFO',
  leaveBtn: '(L) Laisser le coffre',
  disarmBtn: '(D) Désarmer',
  suspectedTrapLabel: 'Piège supposé :',
  openSafeBtn: '(O) Ouvrir le coffre sécurisé et collecter le butin',
  openNeutralizedBtn: '(O) Ouvrir le coffre neutralisé (aucun danger restant)',
  openLootBtn: '(O) Ouvrir le coffre et piller le trésor',
  resumeExplorationBtn: 'Reprendre l\'exploration du Labyrinthe',
  expAwardMsg: (perSurvivor: number, total: number) =>
    `🏆 POUR AVOIR VAINCU LES MONSTRES, CHAQUE SURVIVANT (STATUT OK) REÇOIT +${perSurvivor.toLocaleString()} POINTS D'EXPÉRIENCE (${total.toLocaleString()} XP au total) !`,
  chestFoundMsg: 'Les monstres ont laissé un coffre au trésor bardé de ferrements !',
  inspectSuccessLog: (hero: string, trap: string) =>
    `${hero} examine minutieusement la serrure et soupçonne : ${trap}`,
  inspectSprungLog: (hero: string, trap: string) =>
    `💥 Catastrophe ! ${hero} a déclenché le piège (${trap}) en inspectant la serrure !`,
  calfoRevealLog: (priest: string, trap: string) =>
    `✨ ${priest} incante CALFO. La vérité mystique se révèle : ce coffre est piégé par "${trap}" !`,
  noPriestCalfo: 'Aucun prêtre en état ne dispose du sort CALFO (Tier 2).',
  disarmSuccessLog: (hero: string, trap: string) =>
    `🛠️ ${hero} désamorce adroitement le mécanisme de piège (${trap}) ! Le coffre est sécurisé.`,
  disarmSprungLog: (hero: string, trap: string) =>
    `💥 ÉCHEC CRITIQUE ! Le mécanisme de désamorçage se coince et le piège (${trap}) se déclenche !`,
  disarmFailLog: (hero: string) =>
    `${hero} n'arrive pas à crocheter le verrou, mais ne déclenche pas le piège.`,
  openPriedSprungLog: (trap: string) =>
    `💥 Vous forcez le couvercle sans désarmer... Le piège (${trap}) explose !`,
  openSafeLog: '🔓 Le piège ayant été désamorcé, le coffre s\'ouvre sans encombre.',
  openNoTrapLog: '🔓 Le coffre ne comportait aucun piège et s\'ouvre facilement.',
  goldFoundLog: (total: number, share: number) =>
    `💰 Butin : ${total} Pièces d'Or partagées (${share} PO par survivant).`,
  itemFoundLog: (item: string, hero: string) =>
    `🎁 Objet trouvé : ${item} placé dans le sac de ${hero} !`,
  backpacksFullLog: 'Les sacs des survivants sont pleins, l\'objet trouvé est abandonné.',
  leaveChestLog: '🚪 Vous choisissez de laisser le coffre sur place sans l\'ouvrir (Option Pascal L)EAVE). L\'escouade s\'éloigne prudemment.',
  partyWipeoutChest: '💀 L\'escouade entière a été décimée par les ravages du coffre !',
  traps: {
    TRAPLESS: 'COFFRE SANS PIÈGE',
    POISON_NEEDLE: 'AIGUILLE EMPOISONNÉE',
    GAS_BOMB: 'BOMBE À GAZ',
    CROSSBOW_BOLT: 'CARREAU D’ARBALÈTE',
    EXPLODING_BOX: 'BOÎTE EXPLOSIVE',
    SPLINTERS: 'ÉCLATS MEURTRIERS',
    BLADES: 'LAMES TRANCHANTES',
    STUNNER: 'ÉTOURDISSEUR',
    TELEPORTER: 'TÉLÉPORTEUR DÉBILE',
    ANTI_MAGE: 'DÉCHARGE ANTI-MAGE',
    ANTI_PRIEST: 'DÉCHARGE ANTI-PRÊTRE',
    ALARM: 'ALARME D’ALERTE'
  }
};

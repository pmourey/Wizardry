import { ChestTranslations } from '../../types';

export const chestEn: ChestTranslations = {
  chestTitle: 'Treasure Chest Discovered',
  chestSubtitle: 'Carefully inspect, disarm, or pry open the chest.',
  disarmedSafeBadge: 'Disarmed (Safe)',
  explodedSafeBadge: 'Trap Triggered (Neutralized)',
  calfoBadge: (trap: string) => `Calfo: ${trap}`,
  armedBadge: 'Trap Armed (Not disarmed)',
  operatorLabel: 'Active adventurer:',
  inspectBtn: '(I) Inspect',
  calfoBtn: '(C) CALFO Spell',
  leaveBtn: '(L) Leave Chest',
  disarmBtn: '(D) Disarm',
  suspectedTrapLabel: 'Suspected trap:',
  openSafeBtn: '(O) Open safe chest & collect loot',
  openNeutralizedBtn: '(O) Open neutralized chest (no danger remaining)',
  openLootBtn: '(O) Open chest and take the treasure',
  resumeExplorationBtn: 'Resume Dungeon Exploration',
  expAwardMsg: (perSurvivor: number, total: number) =>
    `🏆 FOR DEFEATING THE MONSTERS, EACH SURVIVOR (OK STATUS) RECEIVES +${perSurvivor.toLocaleString()} EXPERIENCE POINTS (${total.toLocaleString()} XP total)!`,
  chestFoundMsg: 'The monsters left behind an iron-bound treasure chest!',
  inspectSuccessLog: (hero: string, trap: string) =>
    `${hero} inspects the lock closely and suspects: ${trap}`,
  inspectSprungLog: (hero: string, trap: string) =>
    `💥 Catastrophe! ${hero} sprung the trap (${trap}) while inspecting the lock!`,
  calfoRevealLog: (priest: string, trap: string) =>
    `✨ ${priest} casts CALFO. The mystical truth is revealed: this chest is trapped with "${trap}"!`,
  noPriestCalfo: 'No conscious priest possesses the CALFO spell (Tier 2).',
  disarmSuccessLog: (hero: string, trap: string) =>
    `🛠️ ${hero} deftly disarms the trap mechanism (${trap})! The chest is safe.`,
  disarmSprungLog: (hero: string, trap: string) =>
    `💥 CRITICAL FAILURE! The disarm mechanism jams and the trap (${trap}) triggers!`,
  disarmFailLog: (hero: string) =>
    `${hero} fails to pick the lock mechanism, but does not spring the trap.`,
  openPriedSprungLog: (trap: string) =>
    `💥 You pry the lid without disarming... The trap (${trap}) explodes!`,
  openSafeLog: '🔓 Having been disarmed, the chest opens smoothly.',
  openNoTrapLog: '🔓 The chest had no trap and opens easily.',
  goldFoundLog: (total: number, share: number) =>
    `💰 Loot: ${total} Gold Pieces shared (${share} GP per survivor).`,
  itemFoundLog: (item: string, hero: string) =>
    `🎁 Item found: ${item} placed in ${hero}'s backpack!`,
  backpacksFullLog: "Survivors' backpacks are full, the found item was left behind.",
  leaveChestLog: '🚪 You decide to leave the chest undisturbed (Pascal L)EAVE option). The party moves away cautiously.',
  partyWipeoutChest: '💀 The entire party was wiped out by the chest trap!',
  traps: {
    TRAPLESS: 'OPEN / NO TRAP',
    POISON_NEEDLE: 'POISON NEEDLE',
    GAS_BOMB: 'GAS BOMB',
    CROSSBOW_BOLT: 'CROSSBOW BOLT',
    EXPLODING_BOX: 'EXPLODING BOX',
    SPLINTERS: 'SPLINTERS',
    BLADES: 'BLADES',
    STUNNER: 'STUNNER',
    TELEPORTER: 'TELEPORTER',
    ANTI_MAGE: 'MAGE BLASTER',
    ANTI_PRIEST: 'PRIEST BLASTER',
    ALARM: 'ALARM'
  }
};

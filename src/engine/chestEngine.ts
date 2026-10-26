/**
 * Wizardry I Chest & Trap Engine matching Pascal reverse engineering
 */
import { TCharacter, TItem } from '../types/wizardry';
import { ITEMS_DATABASE } from '../data/wizardryData';

export type TTrapType =
  | 'TRAPLESS'
  | 'POISON_NEEDLE'
  | 'GAS_BOMB'
  | 'CROSSBOW_BOLT'
  | 'EXPLODING_BOX'
  | 'SPLINTERS'
  | 'BLADES'
  | 'STUNNER'
  | 'TELEPORTER'
  | 'ANTI_MAGE'
  | 'ANTI_PRIEST'
  | 'ALARM';

export const TRAP_NAMES: Record<TTrapType, string> = {
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
};

export interface ChestReward {
  trapType: TTrapType;
  goldFound: number;
  itemFound: TItem | null;
  inspectedTrapGuess: TTrapType | null;
  calfoRevealed: boolean;
  disarmed: boolean;
  exploded: boolean;
}

export function generateChestReward(level: number): ChestReward {
  const trapList: TTrapType[] = [
    'TRAPLESS',
    'POISON_NEEDLE',
    'GAS_BOMB',
    'CROSSBOW_BOLT',
    'EXPLODING_BOX',
    'SPLINTERS',
    'BLADES',
    'STUNNER',
    'TELEPORTER',
    'ANTI_MAGE',
    'ANTI_PRIEST',
    'ALARM'
  ];

  // Random trap weighted by dungeon level
  const trapIndex = Math.min(trapList.length - 1, Math.floor(Math.random() * (4 + level)));
  const trapType = trapList[trapIndex] || 'POISON_NEEDLE';

  // Gold reward
  const gold = Math.floor(Math.random() * (level * 60 + 50)) + 40;

  // Item reward (chance to get a drop)
  let itemFound: TItem | null = null;
  if (Math.random() * 100 < 65) {
    // Pick appropriate tier item
    const eligibleItems = ITEMS_DATABASE.filter(it => it.id > 0 && it.id !== 94 && it.price <= (level * 800 + 100));
    if (eligibleItems.length > 0) {
      itemFound = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
    }
  }

  return {
    trapType,
    goldFound: gold,
    itemFound,
    inspectedTrapGuess: null,
    calfoRevealed: false,
    disarmed: false,
    exploded: false
  };
}

export function inspectChest(
  chest: ChestReward,
  inspector: TCharacter
): { guess: TTrapType; sprung: boolean } {
  // Thief has 6x agility, Ninja 4x, others 1x
  let chance = inspector.attrib.AGILITY;
  if (inspector.class === 'THIEF') chance *= 6;
  else if (inspector.class === 'NINJA') chance *= 4;
  chance = Math.min(95, Math.max(5, chance));

  if (Math.random() * 100 < chance) {
    chest.inspectedTrapGuess = chest.trapType;
    return { guess: chest.trapType, sprung: false };
  } else {
    // Failure might spring trap or give random bogus guess
    if (Math.random() * 20 > inspector.attrib.AGILITY) {
      chest.exploded = true;
      return { guess: chest.trapType, sprung: true };
    }
    const fakeTrapList: TTrapType[] = ['POISON_NEEDLE', 'GAS_BOMB', 'CROSSBOW_BOLT', 'SPLINTERS', 'TELEPORTER'];
    const fake = fakeTrapList[Math.floor(Math.random() * fakeTrapList.length)];
    chest.inspectedTrapGuess = fake;
    return { guess: fake, sprung: false };
  }
}

export function disarmChest(
  chest: ChestReward,
  disarmer: TCharacter,
  trapGuess: TTrapType
): { success: boolean; exploded: boolean } {
  if (trapGuess !== chest.trapType && chest.trapType !== 'TRAPLESS') {
    chest.exploded = true;
    return { success: false, exploded: true };
  }

  // Disarm chance
  const bonus = (disarmer.class === 'THIEF' || disarmer.class === 'NINJA') ? 50 : 0;
  const disarmChance = Math.min(95, Math.max(10, disarmer.charLevel * 4 + bonus));

  if (Math.random() * 100 < disarmChance) {
    chest.disarmed = true;
    return { success: true, exploded: false };
  } else {
    // Critical failure triggers it
    if (Math.random() * 20 >= disarmer.attrib.AGILITY) {
      chest.exploded = true;
      return { success: false, exploded: true };
    }
    return { success: false, exploded: false };
  }
}

export function applyTrapEffects(
  trap: TTrapType,
  party: TCharacter[],
  openerIndex: number,
  level: number
): string[] {
  const log: string[] = [];
  const opener = party[openerIndex] || party[0];

  switch (trap) {
    case 'POISON_NEEDLE':
      opener.poisonAmount = (opener.poisonAmount || 0) + 1;
      log.push(`Une aiguille empoisonnée surgit de la serrure et pique ${opener.name} !`);
      break;
    case 'GAS_BOMB':
      party.forEach(h => {
        if (h.status === 'OK' && Math.random() * 100 < 50) {
          h.poisonAmount = (h.poisonAmount || 0) + 1;
          log.push(`${h.name} inhale le gaz délétère et est empoisonné !`);
        }
      });
      break;
    case 'CROSSBOW_BOLT':
    case 'SPLINTERS':
    case 'EXPLODING_BOX': {
      const dmg = Math.floor(Math.random() * (level * 8 + 6)) + 4;
      if (trap === 'CROSSBOW_BOLT') {
        opener.hpLeft -= dmg;
        log.push(`Un carreau d’arbalète transperce ${opener.name} pour ${dmg} dégâts !`);
        if (opener.hpLeft <= 0) {
          opener.hpLeft = 0;
          opener.status = 'DEAD';
          log.push(`💀 ${opener.name} succombe sur le coup !`);
        }
      } else {
        party.forEach(h => {
          if (h.status === 'OK') {
            const hDmg = Math.floor(dmg / 2) + Math.floor(Math.random() * 4);
            h.hpLeft -= hDmg;
            log.push(`${h.name} est touché par l’explosion pour ${hDmg} dégâts.`);
            if (h.hpLeft <= 0) {
              h.hpLeft = 0;
              h.status = 'DEAD';
              log.push(`💀 ${h.name} meurt dans l’explosion !`);
            }
          }
        });
      }
      break;
    }
    case 'STUNNER':
      if (opener.status === 'OK') {
        opener.status = 'PLYZE';
        log.push(`Une décharge étourdissante paralyse complètement ${opener.name} !`);
      }
      break;
    case 'ANTI_MAGE':
      party.forEach(h => {
        if (h.class === 'MAGE' || h.class === 'SAMURAI' || h.class === 'BISHOP') {
          if (h.status === 'OK') {
            h.status = 'PLYZE';
            log.push(`Une onde anti-magique frappe ${h.name} de paralysie !`);
          }
        }
      });
      break;
    case 'ANTI_PRIEST':
      party.forEach(h => {
        if (h.class === 'PRIEST' || h.class === 'LORD' || h.class === 'BISHOP') {
          if (h.status === 'OK') {
            h.status = 'STONED';
            log.push(`Le fluide impie pétrifie ${h.name} en statue de pierre !`);
          }
        }
      });
      break;
    case 'ALARM':
      log.push(`🚨 UNE ALARME STRIDENTE RÉSONNE DANS TOUT LE DONJON !`);
      break;
    default:
      log.push(`Rien de fâcheux ne se produit.`);
      break;
  }

  return log;
}

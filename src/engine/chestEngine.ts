/**
 * Wizardry I Chest & Trap Engine matching Pascal reverse engineering
 */
import { TCharacter, TItem } from '../types/wizardry';
import { ITEMS_DATABASE } from '../data/provingGroundsData';

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

export const TRAP_NAMES_FR: Record<TTrapType, string> = {
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

export const TRAP_NAMES_EN: Record<TTrapType, string> = {
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
};

export const TRAP_NAMES: Record<TTrapType, string> = TRAP_NAMES_FR;

export function getTrapName(trap: TTrapType, lang: 'en' | 'fr' = 'fr'): string {
  return lang === 'en' ? TRAP_NAMES_EN[trap] : TRAP_NAMES_FR[trap];
}

export interface ChestReward {
  trapType: TTrapType;
  goldFound: number;
  itemFound: TItem | null;
  inspectedTrapGuess: TTrapType | null;
  calfoRevealed: boolean;
  disarmed: boolean;
  exploded: boolean;
  expGainedPerSurvivor?: number;
  totalExpGained?: number;
}

/**
 * Checks whether an item is a scenario quest item, passage-unlocking key,
 * relic, or special token that should NEVER drop randomly in treasure chests.
 */
export function isSpecialOrQuestItem(it: TItem, eventItemIds?: Set<number>): boolean {
  if (!it || it.id <= 0) return true;
  const name = (it.name || '').toUpperCase().trim();
  const unknownName = (it.nameUnknown || '').toUpperCase().trim();

  // 1. Dummies, placeholders, broken items
  if (
    name === 'BROKEN ITEM' ||
    name === 'DUMMY' ||
    name === 'UNIDENTIFIED' ||
    name.startsWith('RELIC') ||
    unknownName.startsWith('RELIC')
  ) {
    return true;
  }

  // 2. Specific scenario event items (keys, statuettes, puzzle items)
  if (eventItemIds && eventItemIds.has(it.id)) {
    return true;
  }

  // 3. Price is zero or negative: all quest keys, statuettes, ribbons, scenario relics cannot be bought/sold at Boltac (price = 0)
  if (!it.price || it.price <= 0) {
    return true;
  }

  // 4. Legendary final quest items with astronomical prices (Amulet of Werdna, Black Stone, etc.)
  if (it.price >= 100000000) {
    return true;
  }

  // 5. Named quest relics, keys, statuettes, and ribbons across all scenarios
  if (
    name.includes('KEY') ||
    unknownName.includes('KEY') ||
    name.includes('STATUETTE') ||
    unknownName.includes('STATUETTE') ||
    name.includes('RIBBON') ||
    unknownName.includes('RIBBON') ||
    name.includes('WERDNA') ||
    name.startsWith("KOD'S") ||
    name === 'STAFF OF GNILDA' ||
    name === 'HRATHNIR' ||
    name.includes('CRYSTAL OF') ||
    name === 'NEUTRAL CRYSTAL' ||
    name === 'ORB OF EARITHIN' ||
    name === 'ORB OF MHUUZFES' ||
    name === 'SHIP IN BOTTLE'
  ) {
    return true;
  }

  return false;
}

export function generateChestReward(
  level: number,
  itemsPool?: TItem[],
  eventItemIds?: Set<number>
): ChestReward {
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
    const sourcePool = itemsPool && itemsPool.length > 0 ? itemsPool : ITEMS_DATABASE;
    // Strictly filter out special/quest items, keys, statuettes, ribbons, and zero-price artifacts
    const droppableItems = sourcePool.filter(it => !isSpecialOrQuestItem(it, eventItemIds));

    if (droppableItems.length > 0) {
      const eligibleItems = droppableItems.filter(it => it.price <= (level * 800 + 100));
      if (eligibleItems.length > 0) {
        itemFound = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
      } else {
        itemFound = droppableItems[Math.floor(Math.random() * droppableItems.length)];
      }
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
  // If already disarmed or exploded, trap cannot spring again
  if (chest.disarmed || chest.exploded || chest.trapType === 'TRAPLESS') {
    return { guess: chest.trapType, sprung: false };
  }

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
  // If already disarmed or exploded, trap cannot trigger again
  if (chest.disarmed || chest.exploded || chest.trapType === 'TRAPLESS') {
    return { success: true, exploded: false };
  }

  if (trapGuess !== chest.trapType) {
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
  level: number,
  lang: 'en' | 'fr' = 'fr'
): string[] {
  const log: string[] = [];
  const opener = party[openerIndex] || party[0];
  const isEn = lang === 'en';

  switch (trap) {
    case 'POISON_NEEDLE':
      opener.poisonAmount = (opener.poisonAmount || 0) + 1;
      log.push(isEn 
        ? `A poison needle shoots out from the lock and pricks ${opener.name}!` 
        : `Une aiguille empoisonnée surgit de la serrure et pique ${opener.name} !`);
      break;
    case 'GAS_BOMB':
      party.forEach(h => {
        if (h.status === 'OK' && Math.random() * 100 < 50) {
          h.poisonAmount = (h.poisonAmount || 0) + 1;
          log.push(isEn 
            ? `${h.name} inhales noxious gas and is poisoned!` 
            : `${h.name} inhale le gaz délétère et est empoisonné !`);
        }
      });
      break;
    case 'CROSSBOW_BOLT':
    case 'SPLINTERS':
    case 'EXPLODING_BOX': {
      const dmg = Math.floor(Math.random() * (level * 8 + 6)) + 4;
      if (trap === 'CROSSBOW_BOLT') {
        opener.hpLeft -= dmg;
        log.push(isEn 
          ? `A crossbow bolt strikes ${opener.name} for ${dmg} damage!` 
          : `Un carreau d’arbalète transperce ${opener.name} pour ${dmg} dégâts !`);
        if (opener.hpLeft <= 0) {
          opener.hpLeft = 0;
          opener.status = 'DEAD';
          log.push(isEn ? `💀 ${opener.name} was killed instantly!` : `💀 ${opener.name} succombe sur le coup !`);
        }
      } else {
        party.forEach(h => {
          if (h.status === 'OK') {
            const hDmg = Math.floor(dmg / 2) + Math.floor(Math.random() * 4);
            h.hpLeft -= hDmg;
            log.push(isEn 
              ? `${h.name} is hit by the explosion for ${hDmg} damage.` 
              : `${h.name} est touché par l’explosion pour ${hDmg} dégâts.`);
            if (h.hpLeft <= 0) {
              h.hpLeft = 0;
              h.status = 'DEAD';
              log.push(isEn ? `💀 ${h.name} perished in the explosion!` : `💀 ${h.name} meurt dans l’explosion !`);
            }
          }
        });
      }
      break;
    }
    case 'STUNNER':
      if (opener.status === 'OK') {
        opener.status = 'PLYZE';
        log.push(isEn 
          ? `A stunning flash completely paralyzes ${opener.name}!` 
          : `Une décharge étourdissante paralyse complètement ${opener.name} !`);
      }
      break;
    case 'ANTI_MAGE':
      party.forEach(h => {
        if (h.class === 'MAGE' || h.class === 'SAMURAI' || h.class === 'BISHOP') {
          if (h.status === 'OK') {
            h.status = 'PLYZE';
            log.push(isEn 
              ? `An anti-mage wave strikes ${h.name} with paralysis!` 
              : `Une onde anti-magique frappe ${h.name} de paralysie !`);
          }
        }
      });
      break;
    case 'ANTI_PRIEST':
      party.forEach(h => {
        if (h.class === 'PRIEST' || h.class === 'LORD' || h.class === 'BISHOP') {
          if (h.status === 'OK') {
            h.status = 'STONED';
            log.push(isEn 
              ? `Unholy fluid petrifies ${h.name} into stone!` 
              : `Le fluide impie pétrifie ${h.name} en statue de pierre !`);
          }
        }
      });
      break;
    case 'ALARM':
      log.push(isEn 
        ? `🚨 A SHRILL ALARM RINGS OUT ECHOING THROUGH THE ENTIRE DUNGEON!` 
        : `🚨 UNE ALARME STRIDENTE RÉSONNE DANS TOUT LE DONJON !`);
      break;
    default:
      log.push(isEn ? `Nothing untoward happens.` : `Rien de fâcheux ne se produit.`);
      break;
  }

  return log;
}

/**
 * Combat spell resolution, ported from the original Pascal (COMBAT4 / CASTASPE).
 */
import type { TCharacter, TSpell } from '../types/wizardry';
import type { CombatGroup, CombatMonsterInstance, PlayerCombatAction } from './combatEngine';

export interface CombatEffects {
  lightAdd: number;
  lightMax?: boolean;
  acModifier?: number;
  malor?: { x: number; y: number; level: number };
  loktofeit?: boolean;
}

export interface SpellContext {
  mazeLevel: number;
  acModifier: number;
  lang?: 'en' | 'fr';
}

const FRIENDLY_SPELLS = new Set(['DIOS', 'DIAL', 'DIALMA', 'MADI', 'DIALKO', 'LATUMOFI', 'LATUMOFIS', 'DI', 'KADORTO']);
export const isFriendlySingleSpell = (name: string) => FRIENDLY_SPELLS.has(name);

const rand = (n: number) => Math.floor(Math.random() * n);
const roll = (n: number, s: number) => {
  let t = 0;
  for (let i = 0; i < n; i++) t += rand(s) + 1;
  return t;
};

const isAlive = (i: CombatMonsterInstance) => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0;
const nameOf = (g: CombatGroup) => (
  g.identified
    ? (g.aliveCount > 1 ? (g.monster.namePlural || g.monster.name) : g.monster.name)
    : (g.aliveCount > 1 ? (g.monster.nameUnknownPlural || g.monster.nameUnknown) : g.monster.nameUnknown)
);

function kill(g: CombatGroup, inst: CombatMonsterInstance) {
  inst.status = 'DEAD';
  inst.hpLeft = 0;
  g.aliveCount = g.instances.filter(isAlive).length;
}

// DOHITS: magic resistance may nullify the damage
function hitMonster(g: CombatGroup, inst: CombatMonsterInstance, n: number, s: number, log: string[], isEn: boolean = false) {
  if (!isAlive(inst)) return;
  if (rand(100) < g.monster.magicResistance) {
    log.push(isEn ? `${nameOf(g)} resisted the spell!` : `${nameOf(g)} résiste au sort !`);
    return;
  }
  const dmg = roll(n, s);
  inst.hpLeft -= dmg;
  if (inst.status === 'ASLEEP') inst.status = 'OK';
  if (inst.hpLeft <= 0) {
    kill(g, inst);
    log.push(isEn ? `${nameOf(g)} takes ${dmg} damage and collapses!` : `${nameOf(g)} subit ${dmg} dégâts et s'effondre !`);
  } else {
    log.push(isEn ? `${nameOf(g)} takes ${dmg} damage.` : `${nameOf(g)} subit ${dmg} dégâts.`);
  }
}

// HITGROUP: damage halved (dice count) when the monster is protected against that damage type
function hitGroup(g: CombatGroup | undefined, n: number, s: number, type: number, log: string[], isEn: boolean = false) {
  if (!g) return;
  const dice = g.monster.resistances?.includes(type) ? Math.floor(n / 2) + 1 : n;
  const before = g.aliveCount;
  g.instances.filter(isAlive).forEach(inst => hitMonster(g, inst, dice, s, log, isEn));
  log.push(isEn ? `${nameOf(g)}: ${before - g.aliveCount} defeated.` : `${nameOf(g)} : ${before - g.aliveCount} terrassé(s).`);
}

function allAlive(groups: CombatGroup[]) {
  return groups.filter(g => g.aliveCount > 0);
}

function partyAlive(party: TCharacter[]) {
  return party.filter(p => p.status !== 'DEAD' && p.status !== 'ASHES' && p.status !== 'LOST');
}

export function castCombatSpell(
  hero: TCharacter,
  spell: TSpell,
  action: PlayerCombatAction,
  groups: CombatGroup[],
  party: TCharacter[],
  log: string[],
  ctx: SpellContext,
  effects: CombatEffects
) {
  const isEn = ctx.lang === 'en';
  if (action.actionType === 'SPELL') {
    if (hero.silencedRounds && hero.silencedRounds > 0) {
      log.push(isEn ? `🔇 ${hero.name} is silenced and cannot cast!` : `🔇 ${hero.name} est réduit au silence et ne peut incanter !`);
      return;
    }

    if (spell.spellType === 'MAGE') {
      hero.mageSpells[spell.tier] = Math.max(0, (hero.mageSpells[spell.tier] || 0) - 1);
    } else {
      hero.priestSpells[spell.tier] = Math.max(0, (hero.priestSpells[spell.tier] || 0) - 1);
    }
  }

  const group = groups[action.targetGroupIndex ?? 0];
  const living = group ? group.instances.filter(isAlive) : [];
  const single = living.length > 0 ? living[rand(living.length)] : undefined;
  const target = party[action.targetCharIndex ?? party.indexOf(hero)] || hero;
  const addAc = (heroes: TCharacter[], n: number) => heroes.forEach(h => { h.combatAcMod = (h.combatAcMod || 0) + n; });
  const monsterAc = (g: CombatGroup, n: number) => g.instances.filter(isAlive).forEach(i => { i.acMod += n; });

  switch (spell.name) {
    case 'HALITO':
      if (group && single) hitMonster(group, single, 1, 8, log, isEn);
      break;
    case 'BADIOS':
      if (group && single) hitMonster(group, single, 1, 8, log, isEn);
      break;
    case 'BADIAL':
      if (group && single) hitMonster(group, single, 2, 8, log, isEn);
      break;
    case 'BADIALMA':
      if (group && single) hitMonster(group, single, 3, 8, log, isEn);
      break;
    case 'ZILWAN':
      if (group && single) {
        if (group.monster.monsterClass === 10) hitMonster(group, single, 10, 200, log, isEn);
        else log.push(isEn ? `ZILWAN has no effect on ${nameOf(group)}.` : `ZILWAN reste sans effet sur ${nameOf(group)}.`);
      }
      break;
    case 'BADI':
      if (group && single) {
        if (rand(100) < 10 * group.monster.level) log.push(isEn ? `${nameOf(group)} resisted BADI!` : `${nameOf(group)} résiste à BADI !`);
        else { kill(group, single); log.push(isEn ? `BADI strikes down ${nameOf(group)}!` : `BADI foudroie ${nameOf(group)} !`); }
      }
      break;
    case 'MABADI':
      if (group && single) {
        single.hpLeft = 1 + rand(8);
        log.push(isEn ? `MABADI strikes ${nameOf(group)}: only ${single.hpLeft} HP remains!` : `MABADI frappe ${nameOf(group)} : il ne lui reste que ${single.hpLeft} PV !`);
      }
      break;
    case 'MAHALITO': hitGroup(group, 4, 6, 1, log, isEn); break;
    case 'MOLITO': hitGroup(group, 3, 6, 0, log, isEn); break;
    case 'LAHALITO': hitGroup(group, 6, 6, 1, log, isEn); break;
    case 'DALTO': hitGroup(group, 6, 6, 2, log, isEn); break;
    case 'MADALTO': hitGroup(group, 8, 8, 2, log, isEn); break;
    case 'LITOKAN': hitGroup(group, 3, 8, 1, log, isEn); break;
    case 'LORTO': hitGroup(group, 6, 6, 0, log, isEn); break;
    case 'MALIKTO': allAlive(groups).forEach(g => hitGroup(g, 12, 6, 0, log, isEn)); break;
    case 'TILTOWAI': allAlive(groups).forEach(g => hitGroup(g, 10, 15, 0, log, isEn)); break;
    case 'KATINO':
      if (group) {
        let n = 0;
        if (!group.monster.specialPower.sleepResist && rand(100) >= (group.monster.magicResistance || 0)) {
          group.instances.filter(i => i.status === 'OK' && isAlive(i)).forEach(i => {
            if (rand(100) >= 20 * group.monster.level) { i.status = 'ASLEEP'; n++; }
          });
        }
        log.push(isEn ? `💤 KATINO puts ${n} ${nameOf(group)} to sleep.` : `💤 KATINO endort ${n} ${nameOf(group)}.`);
      }
      break;
    case 'MANIFO':
      if (group) {
        let n = 0;
        if (rand(100) >= (group.monster.magicResistance || 0)) {
          group.instances.filter(i => i.status === 'OK' && isAlive(i)).forEach(i => {
            if (rand(100) >= 50 + 5 * group.monster.level) { i.status = 'PLYZE'; n++; }
          });
        }
        log.push(isEn ? `⚡ MANIFO paralyzes ${n} ${nameOf(group)}.` : `⚡ MANIFO paralyse ${n} ${nameOf(group)}.`);
      }
      break;
    case 'MONTINO':
      if (group) {
        let n = 0;
        if (rand(100) >= (group.monster.magicResistance || 0)) {
          group.instances.filter(isAlive).forEach(i => {
            if (rand(100) >= 10 * group.monster.level) { i.silencedRounds = rand(4) + 2; n++; }
          });
        }
        log.push(isEn ? `🔇 MONTINO silences ${n} ${nameOf(group)}.` : `🔇 MONTINO réduit ${n} ${nameOf(group)} au silence.`);
      }
      break;
    case 'LAKANITO':
      if (group) {
        let n = 0;
        if (rand(100) >= (group.monster.magicResistance || 0)) {
          group.instances.filter(isAlive).forEach(i => {
            if (rand(100) >= 6 * group.monster.level) { kill(group, i); n++; }
          });
        }
        log.push(isEn ? `LAKANITO suffocates ${n} ${nameOf(group)}.` : `LAKANITO étouffe ${n} ${nameOf(group)}.`);
      }
      break;
    case 'MAKANITO': {
      let n = 0;
      allAlive(groups).forEach(g => {
        if (g.monster.monsterClass !== 10 && g.monster.level <= 7) {
          g.instances.filter(isAlive).forEach(i => { kill(g, i); n++; });
        }
      });
      log.push(isEn ? `☠️ MAKANITO: ${n} creature(s) suffocate!` : `☠️ MAKANITO : ${n} créature(s) suffoquent !`);
      break;
    }
    case 'DILTO': if (group) { monsterAc(group, 2); log.push(isEn ? `DILTO clouds the vision of ${nameOf(group)} (+2 AC).` : `DILTO obscurcit la vue de ${nameOf(group)} (+2 CA).`); } break;
    case 'MORLIS': if (group) { monsterAc(group, 3); log.push(isEn ? `MORLIS terrifies ${nameOf(group)} (+3 AC).` : `MORLIS effraie ${nameOf(group)} (+3 CA).`); } break;
    case 'MAMORLIS': groups.forEach(g => monsterAc(g, 3)); log.push(isEn ? 'MAMORLIS weakens the defense of all monsters (+3 AC).' : 'MAMORLIS affaiblit la défense de tous les monstres (+3 CA).'); break;
    case 'MOGREF': addAc([hero], 2); log.push(isEn ? `${hero.name} gains 2 points of AC.` : `${hero.name} gagne 2 points de CA.`); break;
    case 'SOPIC':
    case 'PORFIC': addAc([hero], 4); log.push(isEn ? `${hero.name} gains 4 points of AC.` : `${hero.name} gagne 4 points de CA.`); break;
    case 'KALKI': addAc(party, 1); log.push(isEn ? 'The party gains 1 point of AC.' : 'Le groupe gagne 1 point de CA.'); break;
    case 'MATU': addAc(party, 2); log.push(isEn ? 'The party gains 2 points of AC.' : 'Le groupe gagne 2 points de CA.'); break;
    case 'BAMATU':
    case 'MASOPIC': addAc(party, 4); log.push(isEn ? 'The party gains 4 points of AC.' : 'Le groupe gagne 4 points de CA.'); break;
    case 'MAPORFIC':
      addAc(party, 2);
      effects.acModifier = 2;
      log.push(isEn ? 'A divine shield protects the party for the entire expedition (+2 AC).' : 'Un bouclier magique protège le groupe pour toute l’expédition (+2 CA).');
      break;
    case 'MILWA':
      effects.lightAdd += 15 + rand(15);
      log.push(isEn ? 'Magical light illuminates the corridors.' : 'Une lueur magique éclaire le dédale.');
      break;
    case 'LOMILWA':
      effects.lightMax = true;
      log.push(isEn ? 'A radiant light floods the maze.' : 'Une lumière éclatante emplit le dédale.');
      break;
    case 'LATUMAPI':
    case 'LATUMAPIC': {
      let newlyIdentified = 0;
      groups.forEach(g => {
        if (!g.identified) {
          g.identified = true;
          newlyIdentified++;
        }
      });
      log.push(isEn ? '✨ LATUMAPIC dispels all illusions: all monsters present are identified!' : '✨ LATUMAPIC dissipe les illusions : tous les monstres présents sont formellement identifiés !');
      break;
    }
    case 'DIOS':
    case 'DIAL':
    case 'DIALMA': {
      const dice = spell.name === 'DIOS' ? 1 : spell.name === 'DIAL' ? 2 : 3;
      if (target.status === 'DEAD' || target.status === 'ASHES' || target.status === 'LOST') {
        log.push(isEn ? `${target.name} is beyond help.` : `${target.name} n'est pas aidé.`);
        break;
      }
      const amt = roll(dice, 8);
      target.hpLeft = Math.min(target.hpMax, target.hpLeft + amt);
      log.push(isEn ? `${target.name} recovers ${amt} HP (${target.hpLeft}/${target.hpMax}).` : `${target.name} récupère ${amt} PV (${target.hpLeft}/${target.hpMax}).`);
      break;
    }
    case 'MADI':
      if (target.status === 'DEAD' || target.status === 'ASHES' || target.status === 'LOST') {
        log.push(isEn ? `${target.name} is beyond help.` : `${target.name} n'est pas aidé.`);
        break;
      }
      target.hpLeft = target.hpMax;
      target.poisonAmount = 0;
      target.silencedRounds = 0;
      target.status = 'OK';
      log.push(isEn ? `MADI completely restores ${target.name}!` : `MADI restaure entièrement ${target.name} !`);
      break;
    case 'DIALKO':
      if (target.status === 'PLYZE' || target.status === 'ASLEEP') {
        target.status = 'OK';
        log.push(isEn ? `${target.name} is cured!` : `${target.name} est guéri !`);
      } else {
        log.push(isEn ? `${target.name} is not helped.` : `${target.name} n'est pas aidé.`);
      }
      break;
    case 'LATUMOFI':
      target.poisonAmount = 0;
      log.push(isEn ? `The poison has been cleansed from ${target.name}!` : `${target.name} est débarrassé du poison !`);
      break;
    case 'HAMAN':
    case 'MAHAMAN': {
      const flag = spell.name === 'HAMAN' ? 6 : 8;
      if (hero.charLevel < 13) {
        log.push(isEn ? `${spell.name} is chanted and... FAILS!` : `${spell.name} est prononcé et... ÉCHOUE !`);
        break;
      }
      hero.charLevel -= 1;
      log.push(isEn ? `${spell.name} is chanted and ${hero.name} loses a level...` : `${spell.name} est prononcé et ${hero.name} perd un niveau...`);
      const r = rand(3 * flag);
      const healAll = (full: boolean) => partyAlive(party).forEach(p => {
        if (p.status === 'DEAD' || p.status === 'ASHES') return;
        p.status = 'OK';
        p.silencedRounds = 0;
        p.hpLeft = full ? p.hpMax : Math.min(p.hpMax, p.hpLeft + roll(9, 8));
      });
      if (r <= 5) { healAll(false); log.push(isEn ? 'The party is healed (DIALKO x3)!' : 'Le groupe est soigné (DIALKO ×3) !'); }
      else if (r >= 7 && r <= 11) {
        groups.forEach(g => g.instances.forEach(i => { i.silencedRounds = 5 + rand(5); }));
        log.push(isEn ? 'The monsters are silenced!' : 'Les monstres sont réduits au silence !');
      } else if ([12, 13, 22, 23].includes(r)) {
        groups.forEach(g => { g.monster = { ...g.monster, magicResistance: 0 }; });
        log.push(isEn ? 'Monsters magic resistance is destroyed!' : 'La résistance magique des monstres est anéantie !');
      } else if ([14, 20, 21].includes(r)) {
        groups.forEach(g => g.instances.filter(isAlive).forEach(i => kill(g, i)));
        log.push(isEn ? 'The monsters are destroyed!' : 'Les monstres sont détruits !');
      } else if ([6, 15, 19].includes(r)) { healAll(true); log.push(isEn ? 'The party is fully healed!' : 'Le groupe est entièrement soigné !'); }
      else if (r === 17) {
        party.forEach(p => { if (p.armorClass + (p.combatAcMod || 0) > -10) p.combatAcMod = (p.combatAcMod || 0) + (p.armorClass + 10); });
        log.push(isEn ? 'The party is shielded (AC -10)!' : 'Le groupe est protégé (CA -10) !');
      } else {
        party.forEach(p => { if (p.status !== 'LOST') { p.status = 'OK'; p.hpLeft = p.hpMax; p.silencedRounds = 0; } });
        log.push(isEn ? 'The party is resurrected and restored!' : 'Le groupe est ressuscité et soigné !');
      }
      if (rand(100) < 50) {
        log.push(isEn ? `But ${hero.name}'s spellbook is damaged!` : `Mais le grimoire de ${hero.name} est abîmé !`);
        hero.spellsKnown = hero.spellsKnown.map(k => (rand(100) > 50 ? false : k));
      }
      break;
    }
    case 'MALOR': {
      let lvl = ctx.mazeLevel;
      while (rand(100) < 30) lvl--;
      while (rand(100) < 10) lvl--;
      effects.malor = { x: rand(20), y: rand(20), level: Math.max(0, lvl) };
      log.push(isEn ? `${hero.name} casts MALOR: the party is randomly teleported!` : `${hero.name} lance MALOR : le groupe est téléporté au hasard !`);
      break;
    }
    case 'LOKTOFEI':
      if (rand(100) > 2 * hero.charLevel) {
        log.push(isEn ? 'LOKTOFEIT FAILS!' : 'LOKTOFEIT ÉCHOUE !');
      } else {
        effects.loktofeit = true;
        log.push(isEn ? 'LOKTOFEIT: the party flees back to the castle, stripped of equipment!' : 'LOKTOFEIT : le groupe est ramené au château, dépouillé de ses biens !');
      }
      break;
    case 'KANDI':
    case 'DI':
    case 'KADORTO':
      log.push(isEn ? 'The spell is disrupted.' : 'Le sort est perturbé.');
      break;
    default:
      log.push(isEn ? `${spell.name} has no effect in the heat of battle.` : `${spell.name} n'a aucun effet dans le feu du combat.`);
  }
}

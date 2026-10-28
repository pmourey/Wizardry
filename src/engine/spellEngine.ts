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
}

const FRIENDLY_SPELLS = new Set(['DIOS', 'DIAL', 'DIALMA', 'MADI', 'DIALKO', 'LATUMOFI']);
export const isFriendlySingleSpell = (name: string) => FRIENDLY_SPELLS.has(name);

const rand = (n: number) => Math.floor(Math.random() * n);
const roll = (n: number, s: number) => {
  let t = 0;
  for (let i = 0; i < n; i++) t += rand(s) + 1;
  return t;
};

const isAlive = (i: CombatMonsterInstance) => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0;
const nameOf = (g: CombatGroup) => (g.identified ? g.monster.name : g.monster.nameUnknown);

function kill(g: CombatGroup, inst: CombatMonsterInstance) {
  inst.status = 'DEAD';
  inst.hpLeft = 0;
  g.aliveCount = g.instances.filter(isAlive).length;
}

// DOHITS: magic resistance may nullify the damage
function hitMonster(g: CombatGroup, inst: CombatMonsterInstance, n: number, s: number, log: string[]) {
  if (!isAlive(inst)) return;
  if (rand(100) < g.monster.magicResistance) {
    log.push(`${nameOf(g)} résiste au sort !`);
    return;
  }
  const dmg = roll(n, s);
  inst.hpLeft -= dmg;
  if (inst.status === 'ASLEEP') inst.status = 'OK';
  if (inst.hpLeft <= 0) {
    kill(g, inst);
    log.push(`${nameOf(g)} subit ${dmg} dégâts et s'effondre !`);
  } else {
    log.push(`${nameOf(g)} subit ${dmg} dégâts.`);
  }
}

// HITGROUP: damage halved (dice count) when the monster is protected against that damage type
function hitGroup(g: CombatGroup | undefined, n: number, s: number, type: number, log: string[]) {
  if (!g) return;
  const dice = g.monster.resistances?.includes(type) ? Math.floor(n / 2) + 1 : n;
  const before = g.aliveCount;
  g.instances.filter(isAlive).forEach(inst => hitMonster(g, inst, dice, s, log));
  log.push(`${nameOf(g)} : ${before - g.aliveCount} terrassé(s).`);
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
  if (hero.silencedRounds && hero.silencedRounds > 0) {
    log.push(`🔇 ${hero.name} est réduit au silence et ne peut incanter !`);
    return;
  }

  if (spell.spellType === 'MAGE') {
    hero.mageSpells[spell.tier] = Math.max(0, (hero.mageSpells[spell.tier] || 0) - 1);
  } else {
    hero.priestSpells[spell.tier] = Math.max(0, (hero.priestSpells[spell.tier] || 0) - 1);
  }

  const group = groups[action.targetGroupIndex ?? 0];
  const living = group ? group.instances.filter(isAlive) : [];
  const single = living.length > 0 ? living[rand(living.length)] : undefined;
  const target = party[action.targetCharIndex ?? party.indexOf(hero)] || hero;
  const addAc = (heroes: TCharacter[], n: number) => heroes.forEach(h => { h.combatAcMod = (h.combatAcMod || 0) + n; });
  const monsterAc = (g: CombatGroup, n: number) => g.instances.filter(isAlive).forEach(i => { i.acMod += n; });

  switch (spell.name) {
    case 'HALITO':
      if (group && single) hitMonster(group, single, 1, 8, log);
      break;
    case 'BADIOS':
      if (group && single) hitMonster(group, single, 1, 8, log);
      break;
    case 'BADIAL':
      if (group && single) hitMonster(group, single, 2, 8, log);
      break;
    case 'BADIALMA':
      if (group && single) hitMonster(group, single, 3, 8, log);
      break;
    case 'ZILWAN':
      if (group && single) {
        if (group.monster.monsterClass === 10) hitMonster(group, single, 10, 200, log);
        else log.push(`ZILWAN reste sans effet sur ${nameOf(group)}.`);
      }
      break;
    case 'BADI':
      if (group && single) {
        if (rand(100) < 10 * group.monster.level) log.push(`${nameOf(group)} résiste à BADI !`);
        else { kill(group, single); log.push(`BADI foudroie ${nameOf(group)} !`); }
      }
      break;
    case 'MABADI':
      if (group && single) {
        single.hpLeft = 1 + rand(8);
        log.push(`MABADI frappe ${nameOf(group)} : il ne lui reste que ${single.hpLeft} PV !`);
      }
      break;
    case 'MAHALITO': hitGroup(group, 4, 6, 1, log); break;
    case 'MOLITO': hitGroup(group, 3, 6, 0, log); break;
    case 'LAHALITO': hitGroup(group, 6, 6, 1, log); break;
    case 'DALTO': hitGroup(group, 6, 6, 2, log); break;
    case 'MADALTO': hitGroup(group, 8, 8, 2, log); break;
    case 'LITOKAN': hitGroup(group, 3, 8, 1, log); break;
    case 'LORTO': hitGroup(group, 6, 6, 0, log); break;
    case 'MALIKTO': allAlive(groups).forEach(g => hitGroup(g, 12, 6, 0, log)); break;
    case 'TILTOWAI': allAlive(groups).forEach(g => hitGroup(g, 10, 15, 0, log)); break;
    case 'KATINO':
      if (group) {
        let n = 0;
        if (group.monster.specialPower.sleepResist) {
          group.instances.filter(i => i.status === 'OK' && isAlive(i)).forEach(i => {
            if (rand(100) >= 20 * group.monster.level) { i.status = 'ASLEEP'; n++; }
          });
        }
        log.push(`💤 KATINO endort ${n} ${nameOf(group)}.`);
      }
      break;
    case 'MANIFO':
      if (group) {
        let n = 0;
        group.instances.filter(i => i.status === 'OK' && isAlive(i)).forEach(i => {
          if (rand(100) >= 50 + 5 * group.monster.level) { i.status = 'PLYZE'; n++; }
        });
        log.push(`⚡ MANIFO paralyse ${n} ${nameOf(group)}.`);
      }
      break;
    case 'MONTINO':
      if (group) {
        let n = 0;
        group.instances.filter(isAlive).forEach(i => {
          if (rand(100) >= 10 * group.monster.level) { i.silencedRounds = rand(4) + 2; n++; }
        });
        log.push(`🔇 MONTINO réduit ${n} ${nameOf(group)} au silence.`);
      }
      break;
    case 'LAKANITO':
      if (group) {
        let n = 0;
        group.instances.filter(isAlive).forEach(i => {
          if (rand(100) >= 6 * group.monster.level) { kill(group, i); n++; }
        });
        log.push(`LAKANITO étouffe ${n} ${nameOf(group)}.`);
      }
      break;
    case 'MAKANITO': {
      let n = 0;
      allAlive(groups).forEach(g => {
        if (g.monster.monsterClass !== 10 && g.monster.level <= 7) {
          g.instances.filter(isAlive).forEach(i => { kill(g, i); n++; });
        }
      });
      log.push(`☠️ MAKANITO : ${n} créature(s) suffoquent !`);
      break;
    }
    case 'DILTO': if (group) { monsterAc(group, 2); log.push(`DILTO obscurcit la vue de ${nameOf(group)} (+2 CA).`); } break;
    case 'MORLIS': if (group) { monsterAc(group, 3); log.push(`MORLIS effraie ${nameOf(group)} (+3 CA).`); } break;
    case 'MAMORLIS': groups.forEach(g => monsterAc(g, 3)); log.push('MAMORLIS affaiblit la défense de tous les monstres (+3 CA).'); break;
    case 'MOGREF': addAc([hero], 2); log.push(`${hero.name} gagne 2 points de CA.`); break;
    case 'SOPIC':
    case 'PORFIC': addAc([hero], 4); log.push(`${hero.name} gagne 4 points de CA.`); break;
    case 'KALKI': addAc(party, 1); log.push('Le groupe gagne 1 point de CA.'); break;
    case 'MATU': addAc(party, 2); log.push('Le groupe gagne 2 points de CA.'); break;
    case 'BAMATU':
    case 'MASOPIC': addAc(party, 4); log.push('Le groupe gagne 4 points de CA.'); break;
    case 'MAPORFIC':
      effects.acModifier = 2;
      log.push('Un bouclier magique protège le groupe pour toute l’expédition (+2 CA).');
      break;
    case 'MILWA':
      effects.lightAdd += 15 + rand(15);
      log.push('Une lueur magique éclaire le dédale.');
      break;
    case 'LOMILWA':
      effects.lightMax = true;
      log.push('Une lumière éclatante emplit le dédale.');
      break;
    case 'DIOS':
    case 'DIAL':
    case 'DIALMA': {
      const dice = spell.name === 'DIOS' ? 1 : spell.name === 'DIAL' ? 2 : 3;
      if (target.status === 'DEAD' || target.status === 'ASHES' || target.status === 'LOST') {
        log.push(`${target.name} n'est pas aidé.`);
        break;
      }
      const amt = roll(dice, 8);
      target.hpLeft = Math.min(target.hpMax, target.hpLeft + amt);
      log.push(`${target.name} récupère ${amt} PV (${target.hpLeft}/${target.hpMax}).`);
      break;
    }
    case 'MADI':
      if (target.status === 'DEAD' || target.status === 'ASHES' || target.status === 'LOST') {
        log.push(`${target.name} n'est pas aidé.`);
        break;
      }
      target.hpLeft = target.hpMax;
      target.poisonAmount = 0;
      target.silencedRounds = 0;
      target.status = 'OK';
      log.push(`MADI restaure entièrement ${target.name} !`);
      break;
    case 'DIALKO':
      if (target.status === 'PLYZE' || target.status === 'ASLEEP') {
        target.status = 'OK';
        log.push(`${target.name} est guéri !`);
      } else {
        log.push(`${target.name} n'est pas aidé.`);
      }
      break;
    case 'LATUMOFI':
      target.poisonAmount = 0;
      log.push(`${target.name} est débarrassé du poison !`);
      break;
    case 'LATUMAPI':
      groups.forEach(g => { g.identified = true; });
      log.push('Les monstres sont identifiés !');
      break;
    case 'HAMAN':
    case 'MAHAMAN': {
      const flag = spell.name === 'HAMAN' ? 6 : 8;
      if (hero.charLevel < 13) {
        log.push(`${spell.name} est prononcé et... ÉCHOUE !`);
        break;
      }
      hero.charLevel -= 1;
      log.push(`${spell.name} est prononcé et ${hero.name} perd un niveau...`);
      const r = rand(3 * flag);
      const healAll = (full: boolean) => partyAlive(party).forEach(p => {
        if (p.status === 'DEAD' || p.status === 'ASHES') return;
        p.status = 'OK';
        p.silencedRounds = 0;
        p.hpLeft = full ? p.hpMax : Math.min(p.hpMax, p.hpLeft + roll(9, 8));
      });
      if (r <= 5) { healAll(false); log.push('Le groupe est soigné (DIALKO ×3) !'); }
      else if (r >= 7 && r <= 11) {
        groups.forEach(g => g.instances.forEach(i => { i.silencedRounds = 5 + rand(5); }));
        log.push('Les monstres sont réduits au silence !');
      } else if ([12, 13, 22, 23].includes(r)) {
        groups.forEach(g => { g.monster = { ...g.monster, magicResistance: 0 }; });
        log.push('La résistance magique des monstres est anéantie !');
      } else if ([14, 20, 21].includes(r)) {
        groups.forEach(g => g.instances.filter(isAlive).forEach(i => kill(g, i)));
        log.push('Les monstres sont détruits !');
      } else if ([6, 15, 19].includes(r)) { healAll(true); log.push('Le groupe est entièrement soigné !'); }
      else if (r === 17) {
        party.forEach(p => { if (p.armorClass + (p.combatAcMod || 0) > -10) p.combatAcMod = (p.combatAcMod || 0) + (p.armorClass + 10); });
        log.push('Le groupe est protégé (CA -10) !');
      } else {
        party.forEach(p => { if (p.status !== 'LOST') { p.status = 'OK'; p.hpLeft = p.hpMax; p.silencedRounds = 0; } });
        log.push('Le groupe est ressuscité et soigné !');
      }
      if (rand(100) < 50) {
        log.push(`Mais le grimoire de ${hero.name} est abîmé !`);
        hero.spellsKnown = hero.spellsKnown.map(k => (rand(100) > 50 ? false : k));
      }
      break;
    }
    case 'MALOR': {
      let lvl = ctx.mazeLevel;
      while (rand(100) < 30) lvl--;
      while (rand(100) < 10) lvl--;
      effects.malor = { x: rand(20), y: rand(20), level: Math.max(0, lvl) };
      log.push(`${hero.name} lance MALOR : le groupe est téléporté au hasard !`);
      break;
    }
    case 'LOKTOFEI':
      if (rand(100) > 2 * hero.charLevel) {
        log.push('LOKTOFEIT ÉCHOUE !');
      } else {
        effects.loktofeit = true;
        log.push('LOKTOFEIT : le groupe est ramené au château, dépouillé de ses biens !');
      }
      break;
    case 'KANDI':
    case 'DI':
    case 'KADORTO':
      log.push('Le sort est perturbé.');
      break;
    default:
      log.push(`${spell.name} n'a aucun effet dans le feu du combat.`);
  }
}

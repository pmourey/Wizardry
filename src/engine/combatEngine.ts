/**
 * Faithful Wizardry I Combat Engine matching Pascal reverse engineering
 */
import { TCharacter, TMonster, TSpell, TStatus } from '../types/wizardry';
import { MONSTERS_DATABASE, SPELLS } from '../data/wizardryData';

export interface CombatMonsterInstance {
  monsterId: number;
  hpLeft: number;
  maxHp: number;
  status: TStatus;
  acMod: number;
  silencedRounds: number;
}

export interface CombatGroup {
  monster: TMonster;
  identified: boolean;
  count: number;
  aliveCount: number;
  instances: CombatMonsterInstance[];
}

export interface PlayerCombatAction {
  charIndex: number;
  actionType: 'FIGHT' | 'SPELL' | 'PARRY' | 'RUN' | 'USE_ITEM' | 'DISPELL';
  targetGroupIndex?: number;
  targetCharIndex?: number;
  spellId?: number;
  inventorySlotIndex?: number;
}

export interface CombatRoundResult {
  combatLog: string[];
  partyAlive: boolean;
  monstersAlive: boolean;
  fled: boolean;
  alarmTriggered: boolean;
}

export interface EncounterOptions {
  enemyCalc?: { minEnemy: number; multWorse: number; worse01: number; range0n: number; percWorse: number }[];
  fixedMonsterIds?: number[];
}

const rollDice = (d: { level: number; hpFac: number; hpMinAdd: number }): number => {
  let total = d.hpMinAdd;
  for (let i = 0; i < d.level; i++) total += Math.floor(Math.random() * d.hpFac) + 1;
  return total;
};

const makeGroup = (monster: TMonster, forcedCount?: number): CombatGroup => {
  const count = Math.max(1, Math.min(9, forcedCount ?? rollDice(monster.appear || { level: 1, hpFac: 1, hpMinAdd: 0 })));
  const instances: CombatMonsterInstance[] = [];
  for (let i = 0; i < count; i++) {
    const hp = Math.max(1, rollDice(monster.hp));
    instances.push({ monsterId: monster.id, hpLeft: hp, maxHp: hp, status: 'OK', acMod: 0, silencedRounds: 0 });
  }
  return { monster, identified: false, count, aliveCount: count, instances };
};

// Authentic random monster pick (maze ENEMYCALC): encounter type 1..3, then "worse" upgrades
function pickRandomMonsterId(level: number, calc?: EncounterOptions['enemyCalc']): number {
  if (!calc || calc.length === 0) {
    return Math.min(MONSTERS_DATABASE.length - 1, Math.floor(Math.random() * (level + 2)));
  }
  let type = 0;
  while (type < 2 && Math.random() < 0.25) type++;
  const c = calc[type];
  let worse = 0;
  if (c.percWorse > 0) {
    while (worse < c.worse01 && Math.random() * 100 < c.percWorse) worse++;
  }
  const id = c.minEnemy + Math.floor(Math.random() * (c.range0n + 1)) + c.multWorse * worse;
  return Math.min(MONSTERS_DATABASE.length - 1, Math.max(0, id));
}

export function initCombatEncounter(level: number, specialEnemyId?: number, options: EncounterOptions = {}): {
  groups: CombatGroup[];
  surprise: 'PARTY' | 'MONSTERS' | 'NONE';
  friendly: boolean;
} {
  const groups: CombatGroup[] = [];

  const baseMonsterId = specialEnemyId !== undefined
    ? specialEnemyId
    : pickRandomMonsterId(level, options.enemyCalc);
  const primaryMonster = MONSTERS_DATABASE[baseMonsterId] || MONSTERS_DATABASE[0];
  groups.push(makeGroup(primaryMonster, primaryMonster.unique >= 0 && specialEnemyId !== undefined ? 1 : undefined));

  // Companion groups chain through teamId (up to 4 groups, no repeats)
  let current = primaryMonster;
  const seen = new Set<number>([primaryMonster.id]);
  while (groups.length < 4 && current.teamId > 0 && Math.random() * 100 < current.teamPercent) {
    const next = MONSTERS_DATABASE[current.teamId];
    if (!next || seen.has(next.id)) break;
    seen.add(next.id);
    groups.push(makeGroup(next));
    current = next;
  }

  // Surprise roll (Pascal 80% thresholds)
  let surprise: 'PARTY' | 'MONSTERS' | 'NONE' = 'NONE';
  const surpriseRoll = Math.random() * 100;
  if (surpriseRoll < 15) surprise = 'PARTY';
  else if (surpriseRoll > 85) surprise = 'MONSTERS';

  // Friendly encounter roll
  const friendly = Math.random() * 100 < 10 && primaryMonster.monsterClass === 0;

  return { groups, surprise, friendly };
}

export function executeCombatRound(
  party: TCharacter[],
  groups: CombatGroup[],
  actions: PlayerCombatAction[],
  surprise: 'PARTY' | 'MONSTERS' | 'NONE'
): CombatRoundResult {
  const log: string[] = [];
  let fled = false;
  let alarmTriggered = false;

  // 1. Gather all action turns with agility initiative (1-10 + agility roll)
  interface InitiativeUnit {
    isPlayer: boolean;
    charIndex: number;
    groupIndex: number;
    instanceIndex: number;
    speed: number;
  }

  const turnQueue: InitiativeUnit[] = [];

  // Add party actions if not surprised
  if (surprise !== 'MONSTERS') {
    actions.forEach(act => {
      const hero = party[act.charIndex];
      if (hero && hero.status === 'OK') {
        const agi = hero.attrib.AGILITY;
        const speed = Math.max(1, 10 - Math.floor(agi / 2) + Math.floor(Math.random() * 6));
        turnQueue.push({
          isPlayer: true,
          charIndex: act.charIndex,
          groupIndex: 0,
          instanceIndex: 0,
          speed
        });
      }
    });
  }

  // Add monsters actions if not surprised
  if (surprise !== 'PARTY') {
    groups.forEach((grp, gIdx) => {
      grp.instances.forEach((inst, iIdx) => {
        if (inst.status === 'OK' && inst.hpLeft > 0) {
          const speed = Math.max(1, Math.floor(Math.random() * 8) + 2);
          turnQueue.push({
            isPlayer: false,
            charIndex: 0,
            groupIndex: gIdx,
            instanceIndex: iIdx,
            speed
          });
        }
      });
    });
  }

  // Sort by fastest speed (lower speed initiates first in Wizardry)
  turnQueue.sort((a, b) => a.speed - b.speed);

  // 2. Process actions in turn
  for (const unit of turnQueue) {
    // Check if battle still ongoing
    const partyHasConscious = party.some(p => p.status === 'OK' && p.hpLeft > 0);
    const monstersRemaining = groups.some(g => g.aliveCount > 0);
    if (!partyHasConscious || !monstersRemaining || fled) break;

    if (unit.isPlayer) {
      const hero = party[unit.charIndex];
      if (!hero || hero.status !== 'OK' || hero.hpLeft <= 0) continue;

      const action = actions.find(a => a.charIndex === unit.charIndex);
      if (!action) continue;

      if (action.actionType === 'RUN') {
        // Runaway calculation from Pascal: 38 - 3 * level + party size modifier
        const runChance = Math.min(85, Math.max(10, 45 + hero.attrib.AGILITY * 2));
        if (Math.random() * 100 < runChance) {
          log.push(`${hero.name} s’échappe avec le groupe ! Fuite réussie.`);
          fled = true;
          break;
        } else {
          log.push(`${hero.name} tente de fuir mais les monstres bloquent le passage !`);
        }
      } else if (action.actionType === 'PARRY') {
        hero.armorClass -= 2;
        log.push(`${hero.name} se met en garde défensive (-2 CA).`);
      } else if (action.actionType === 'DISPELL') {
        // Dispell undead ability for Priest, Bishop, Lord
        const targetGroup = groups[action.targetGroupIndex ?? 0];
        if (targetGroup && targetGroup.aliveCount > 0) {
          log.push(`${hero.name} brandit son symbole sacré et exorcise ${targetGroup.monster.nameUnknownPlural} !`);
          if (targetGroup.monster.monsterClass === 10) { // Undead
            let dispelledCount = 0;
            targetGroup.instances.forEach(inst => {
              if (inst.status === 'OK' && Math.random() * 100 < (50 + hero.charLevel * 5 - targetGroup.monster.level * 8)) {
                inst.status = 'DEAD';
                inst.hpLeft = 0;
                dispelledCount++;
              }
            });
            targetGroup.aliveCount -= dispelledCount;
            log.push(dispelledCount > 0 ? `${dispelledCount} mort(s)-vivant(s) se désintègrent en poussière !` : `L’exorcisme n’a aucun effet.`);
          } else {
            log.push(`Ces créatures ne sont pas des morts-vivants.`);
          }
        }
      } else if (action.actionType === 'SPELL') {
        const spell = SPELLS.find(s => s.id === action.spellId);
        if (spell) {
          log.push(`${hero.name} entonne le sort ${spell.name} !`);
          executePlayerSpell(hero, spell, action, groups, party, log);
        }
      } else if (action.actionType === 'FIGHT') {
        // According to Pascal Wizardry 1 (line 4446: IF MYCHARX < 3 THEN FIGHT):
        // Only the first 3 characters (front rank) can execute a melee attack
        if (action.charIndex >= 3) {
          log.push(`${hero.name} est en arrière-garde (rang ${action.charIndex + 1}) et ne peut pas frapper en mêlée.`);
          continue;
        }

        // Melee attack: target designated group or automatically fall back to the first living group
        const isGroupAlive = (g?: CombatGroup) => 
          !!g && g.instances.some(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0);

        let targetGrpIdx = action.targetGroupIndex ?? 0;
        let targetGroup: CombatGroup | undefined = groups[targetGrpIdx];
        if (!isGroupAlive(targetGroup)) {
          // Retarget next available living group
          targetGroup = groups.find(g => isGroupAlive(g));
        }

        if (targetGroup) {
          // Target any living monster in the group (OK, ASLEEP, or PLYZE)
          const livingTarget = targetGroup.instances.find(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0);
          if (livingTarget) {
            executeHeroAttack(hero, livingTarget, targetGroup, log);
          }
        }
      }
    } else {
      // Monster Turn
      const group = groups[unit.groupIndex];
      if (!group || group.aliveCount <= 0) continue;
      const monsterInst = group.instances[unit.instanceIndex];
      if (!monsterInst || monsterInst.status !== 'OK' || monsterInst.hpLeft <= 0) continue;

      executeMonsterTurn(group, monsterInst, party, log, () => { alarmTriggered = true; });
    }
  }

  // 3. End-of-round status effect resolutions
  party.forEach(h => {
    // A. Poison damage tick
    if (h.poisonAmount && h.poisonAmount > 0 && h.status !== 'DEAD' && h.status !== 'ASHES') {
      const pDmg = h.poisonAmount;
      h.hpLeft = Math.max(0, h.hpLeft - pDmg);
      log.push(`☣️ Le poison ronge ${h.name} pour ${pDmg} dégât(s) (${h.hpLeft}/${h.hpMax} PV) !`);
      if (h.hpLeft <= 0) {
        h.status = 'DEAD';
        h.hpLeft = 0;
        log.push(`💀 ${h.name} a succombé aux effets du poison !`);
      }
    }

    // B. Decrement magical silence duration
    if (h.silencedRounds && h.silencedRounds > 0) {
      h.silencedRounds--;
      if (h.silencedRounds === 0) {
        log.push(`✨ Le silence magique (MONTINO) entourant ${h.name} s'est dissipé.`);
      }
    }

    // C. Natural wake-up roll from sleep (30% chance per round)
    if (h.status === 'ASLEEP' && Math.random() * 100 < 30) {
      h.status = 'OK';
      log.push(`☀️ ${h.name} se réveille de son sommeil !`);
    }
  });

  // Monsters end-of-round status checks
  groups.forEach(grp => {
    grp.instances.forEach(inst => {
      if (inst.silencedRounds > 0) {
        inst.silencedRounds--;
      }
      if (inst.status === 'ASLEEP' && Math.random() * 100 < 30) {
        inst.status = 'OK';
      }
    });
  });

  // Clean dead monsters in groups
  groups.forEach(g => {
    g.aliveCount = g.instances.filter(i => i.status !== 'DEAD' && i.hpLeft > 0).length;
  });

  const partyAlive = party.some(p => p.status !== 'DEAD' && p.status !== 'ASHES' && p.hpLeft > 0);
  const monstersAlive = groups.some(g => g.aliveCount > 0);

  return {
    combatLog: log,
    partyAlive,
    monstersAlive,
    fled,
    alarmTriggered
  };
}

function executeHeroAttack(
  hero: TCharacter,
  target: CombatMonsterInstance,
  group: CombatGroup,
  log: string[]
) {
  const monster = group.monster;
  const isHelpless = target.status === 'ASLEEP' || target.status === 'PLYZE';
  // Hit roll calculation based on Pascal: 21 - Monster AC - Hero Hit Mod + Armor Mod
  // Helpless (asleep/paralyzed) monsters have defenseless AC (AC 10) and are vastly easier to hit
  const targetAC = isHelpless ? 10 : monster.ac + target.acMod;
  const toHitThreshold = isHelpless ? 1 : Math.max(1, Math.min(19, 21 - targetAC - hero.hitMod));

  let totalDamage = 0;
  let hitsLanded = 0;
  let criticalHit = false;

  for (let s = 0; s < Math.max(1, hero.swingCount); s++) {
    const roll = Math.floor(Math.random() * 20) + 1;
    if (roll >= toHitThreshold) {
      hitsLanded++;
      const dam = hero.wepDamage.hpMinAdd + Math.floor(Math.random() * hero.wepDamage.hpFac * hero.wepDamage.level) + 1;
      // 1.5x bonus damage against helpless target
      totalDamage += isHelpless ? Math.floor(dam * 1.5) : dam;

      // Ninja critical hit decapitation check
      if (hero.critHit && (Math.random() * 100 < hero.charLevel * 3)) {
        criticalHit = true;
      }
    }
  }

  const targetName = group.identified ? monster.name : monster.nameUnknown;

  if (hitsLanded === 0) {
    log.push(`${hero.name} attaque ${targetName} mais manque son coup.`);
  } else {
    // Wake up if sleeping and took damage
    if (target.status === 'ASLEEP') {
      target.status = 'OK';
      log.push(`⚡ Le coup réveille ${targetName} de son sommeil !`);
    }

    if (criticalHit) {
      target.hpLeft = 0;
      target.status = 'DEAD';
      group.aliveCount = group.instances.filter(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0).length;
      log.push(`⚡ COUP CRITIQUE ! ${hero.name} décapite net ${targetName} d’un coup magistral !`);
    } else {
      target.hpLeft = Math.max(0, target.hpLeft - totalDamage);
      log.push(`${hero.name} frappe ${targetName} ${hitsLanded} fois pour ${totalDamage} points de dégâts !`);
      if (target.hpLeft <= 0) {
        target.status = 'DEAD';
        target.hpLeft = 0;
        group.aliveCount = group.instances.filter(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0).length;
        log.push(`${targetName} s’effondre sans vie !`);
      }
    }
  }
}

function executePlayerSpell(
  hero: TCharacter,
  spell: TSpell,
  action: PlayerCombatAction,
  groups: CombatGroup[],
  party: TCharacter[],
  log: string[]
) {
  // Check if hero is silenced
  if (hero.silencedRounds && hero.silencedRounds > 0) {
    log.push(`🔇 ${hero.name} est sous l'effet du silence magique (MONTINO) et ne peut prononcer aucune incantation !`);
    return;
  }

  // Deduct spell slot
  if (spell.spellType === 'MAGE') {
    hero.mageSpells[spell.tier] = Math.max(0, (hero.mageSpells[spell.tier] || 0) - 1);
  } else {
    hero.priestSpells[spell.tier] = Math.max(0, (hero.priestSpells[spell.tier] || 0) - 1);
  }

  // Execute spell effect
  switch (spell.name) {
    case 'HALITO': {
      const group = groups[action.targetGroupIndex ?? 0];
      const target = group?.instances.find(i => i.status !== 'DEAD' && i.hpLeft > 0);
      if (target) {
        const dmg = Math.floor(Math.random() * 8) + 1;
        target.hpLeft -= dmg;
        if (target.status === 'ASLEEP') target.status = 'OK';
        log.push(`Une boule de feu s’abat sur ${group.identified ? group.monster.name : group.monster.nameUnknown} pour ${dmg} dégâts !`);
        if (target.hpLeft <= 0) {
          target.status = 'DEAD';
          group.aliveCount = Math.max(0, group.aliveCount - 1);
          log.push(`L'ennemi est consumé par les flammes !`);
        }
      }
      break;
    }
    case 'KATINO': {
      const group = groups[action.targetGroupIndex ?? 0];
      if (group) {
        let count = 0;
        group.instances.forEach(inst => {
          if (inst.status === 'OK' && Math.random() * 100 < 65) {
            inst.status = 'ASLEEP';
            count++;
          }
        });
        log.push(`💤 KATINO plonge ${count} monstre(s) dans un profond sommeil magique.`);
      }
      break;
    }
    case 'MANIFO': {
      const group = groups[action.targetGroupIndex ?? 0];
      if (group) {
        let count = 0;
        group.instances.forEach(inst => {
          if (inst.status === 'OK' && Math.random() * 100 < 55) {
            inst.status = 'PLYZE';
            count++;
          }
        });
        log.push(`⚡ MANIFO paralyse et immobilise ${count} monstre(s) !`);
      }
      break;
    }
    case 'MONTINO': {
      const group = groups[action.targetGroupIndex ?? 0];
      if (group) {
        let count = 0;
        group.instances.forEach(inst => {
          if (inst.status !== 'DEAD' && Math.random() * 100 < 70) {
            inst.silencedRounds = 3;
            count++;
          }
        });
        log.push(`🔇 MONTINO étouffe la parole magique de ${count} monstre(s) pour 3 tours !`);
      }
      break;
    }
    case 'LATUMOFI': {
      const targetHero = party[action.targetCharIndex ?? 0] || hero;
      if (targetHero.poisonAmount > 0) {
        targetHero.poisonAmount = 0;
        log.push(`🌿 Le sort LATUMOFI neutralise totalement le poison dans le sang de ${targetHero.name} !`);
      } else {
        log.push(`${targetHero.name} n'était pas empoisonné.`);
      }
      break;
    }
    case 'DIALKO': {
      const targetHero = party[action.targetCharIndex ?? 0] || hero;
      let cured = false;
      if (targetHero.status === 'PLYZE') {
        targetHero.status = 'OK';
        cured = true;
        log.push(`✨ Le sort DIALKO dissipe la paralysie de ${targetHero.name} !`);
      }
      if (targetHero.status === 'ASLEEP') {
        targetHero.status = 'OK';
        cured = true;
        log.push(`☀️ Le sort DIALKO réveille ${targetHero.name} de son sommeil magique !`);
      }
      if (!cured) {
        log.push(`${targetHero.name} n'était ni paralysé ni endormi.`);
      }
      break;
    }
    case 'MAHALITO':
    case 'MOLITO':
    case 'LAHALITO':
    case 'MADALTO':
    case 'LITOKAN':
    case 'LORTO': {
      const group = groups[action.targetGroupIndex ?? 0];
      if (group) {
        const diceCount = spell.name === 'MAHALITO' ? 4 : spell.name === 'MADALTO' ? 8 : 6;
        const diceSides = spell.name === 'MADALTO' ? 8 : 6;
        let groupDmg = 0;
        for (let d = 0; d < diceCount; d++) groupDmg += Math.floor(Math.random() * diceSides) + 1;
        
        let defeated = 0;
        group.instances.forEach(inst => {
          if (inst.status !== 'DEAD' && inst.hpLeft > 0) {
            inst.hpLeft -= groupDmg;
            if (inst.status === 'ASLEEP') inst.status = 'OK';
            if (inst.hpLeft <= 0) {
              inst.status = 'DEAD';
              defeated++;
            }
          }
        });
        group.aliveCount = Math.max(0, group.aliveCount - defeated);
        log.push(`Le sort dévaste le groupe pour ${groupDmg} dégâts chacun ! (${defeated} terrassé(s))`);
      }
      break;
    }
    case 'TILTOWAI':
    case 'MALIKTO': {
      // Nuclear blast hitting all monsters in all groups
      log.push(`💥 UNE EXPLOSION TITANESQUE RAYE LE CHAMP DE BATAILLE !`);
      groups.forEach(grp => {
        let def = 0;
        grp.instances.forEach(inst => {
          if (inst.status !== 'DEAD' && inst.hpLeft > 0) {
            let dmg = 0;
            for (let d = 0; d < 10; d++) dmg += Math.floor(Math.random() * 15) + 1;
            inst.hpLeft -= dmg;
            if (inst.status === 'ASLEEP') inst.status = 'OK';
            if (inst.hpLeft <= 0) {
              inst.status = 'DEAD';
              def++;
            }
          }
        });
        grp.aliveCount = Math.max(0, grp.aliveCount - def);
      });
      break;
    }
    case 'MAKANITO': {
      // Chokes enemies under level 8
      let killed = 0;
      groups.forEach(grp => {
        if (grp.monster.level <= 7) {
          grp.instances.forEach(inst => {
            if (inst.status !== 'DEAD') {
              inst.status = 'DEAD';
              inst.hpLeft = 0;
              killed++;
            }
          });
          grp.aliveCount = 0;
        }
      });
      log.push(`Un gaz asphyxiant étouffe instantanément ${killed} créature(s) de faible niveau !`);
      break;
    }
    case 'DIOS':
    case 'DIAL':
    case 'DIALMA':
    case 'MADI': {
      const targetHero = party[action.targetCharIndex ?? 0] || hero;
      const healAmt = spell.name === 'DIOS' ? Math.floor(Math.random() * 8) + 1 :
                      spell.name === 'DIAL' ? Math.floor(Math.random() * 16) + 2 :
                      spell.name === 'DIALMA' ? Math.floor(Math.random() * 24) + 3 :
                      targetHero.hpMax;
      targetHero.hpLeft = Math.min(targetHero.hpMax, targetHero.hpLeft + healAmt);
      if (spell.name === 'MADI') {
        targetHero.poisonAmount = 0;
        targetHero.silencedRounds = 0;
        if (targetHero.status === 'PLYZE' || targetHero.status === 'ASLEEP' || targetHero.status === 'AFRAID') {
          targetHero.status = 'OK';
        }
      }
      log.push(`${targetHero.name} reçoit la grâce divine et récupère ${healAmt} PV (${targetHero.hpLeft}/${targetHero.hpMax}) !`);
      break;
    }
    case 'LATUMAPI': {
      groups.forEach(g => { g.identified = true; });
      log.push(`Une illumination divine révèle l’identité exacte de tous les monstres !`);
      break;
    }
    default: {
      log.push(`L'énergie mystique crépite.`);
      break;
    }
  }
}

function executeMonsterTurn(
  group: CombatGroup,
  inst: CombatMonsterInstance,
  party: TCharacter[],
  log: string[],
  onAlarm: () => void
) {
  const monster = group.monster;
  const monsterName = group.identified ? monster.name : monster.nameUnknown;

  // Conscious living heroes
  const livingHeroes = party
    .map((h, idx) => ({ hero: h, index: idx }))
    .filter(item => item.hero.status !== 'DEAD' && item.hero.status !== 'ASHES' && item.hero.hpLeft > 0);

  if (livingHeroes.length === 0) return;

  // 1. Dragon breath weapon check
  if (monster.breathe > 0 && Math.random() * 100 < 50) {
    const breathDmg = Math.floor(inst.hpLeft / 2);
    log.push(`🔥 ${monsterName} souffle un cône de feu incandescent !`);
    livingHeroes.forEach(({ hero }) => {
      // Save vs breath using Luck
      const saved = Math.random() * 20 < hero.luckSkill[3];
      const actualDmg = saved ? Math.floor(breathDmg / 2) : breathDmg;
      hero.hpLeft -= actualDmg;
      log.push(`${hero.name} subit ${actualDmg} dégâts de souffle${saved ? ' (jet de sauvegarde réussi)' : ''} !`);
      if (hero.hpLeft <= 0) {
        hero.status = 'DEAD';
        hero.hpLeft = 0;
        log.push(`💀 ${hero.name} succombe aux flammes du dragon !`);
      }
    });
    return;
  }

  // 2. Monster Spellcasting check (Blocked if monster is silenced)
  if ((monster.mageSpells > 0 || monster.priestSpells > 0) && Math.random() * 100 < 60 && inst.silencedRounds === 0) {
    const spellRoll = Math.random() * 100;
    const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)].hero;

    // Monster Silence spell (MONTINO)
    if (spellRoll < 25 && (!target.silencedRounds || target.silencedRounds <= 0)) {
      target.silencedRounds = 3;
      log.push(`🔇 ${monsterName} invoque MONTINO ! ${target.name} est frappé de mutisme magique (Silence 3 tours) !`);
      return;
    }
    
    // Monster Sleep spell (KATINO)
    if (spellRoll < 50 && target.status === 'OK') {
      target.status = 'ASLEEP';
      log.push(`💤 ${monsterName} souffle la brume de KATINO ! ${target.name} sombre dans un profond sommeil !`);
      return;
    }

    // Monster Paralyze spell (MANIFO)
    if (spellRoll < 70 && target.status === 'OK') {
      target.status = 'PLYZE';
      log.push(`⚡ ${monsterName} projette des rets de MANIFO ! ${target.name} est pétrifié de paralysie !`);
      return;
    }

    // Direct damage spell
    log.push(`⚡ ${monsterName} incante un trait ténébreux !`);
    const spellDmg = Math.floor(Math.random() * 12) + 4;
    target.hpLeft -= spellDmg;
    log.push(`${target.name} est frappé pour ${spellDmg} dégâts (${target.hpLeft}/${target.hpMax} PV) !`);
    if (target.hpLeft <= 0) {
      target.status = 'DEAD';
      target.hpLeft = 0;
      log.push(`💀 ${target.name} est terrassé !`);
    }
    return;
  }

  // 3. Physical Melee Attack against hero
  // According to Pascal Wizardry 1 (line 4840: CHARX := CHARX MOD 3):
  // Only the first 3 characters (front rank) can be attacked in physical melee.
  // If all front rank characters are dead or fallen, the front line collapses and remaining living heroes are reached.
  const frontRankCandidates = livingHeroes.filter(item => item.index < 3);
  const eligibleMeleeTargets = frontRankCandidates.length > 0 ? frontRankCandidates : livingHeroes;
  const chosenTarget = eligibleMeleeTargets[Math.floor(Math.random() * eligibleMeleeTargets.length)].hero;

  const targetAC = chosenTarget.armorClass;
  const toHitThreshold = Math.max(1, Math.min(19, 20 - targetAC - monster.level));

  let totalDmg = 0;
  let hits = 0;

  for (let a = 0; a < monster.attackCount; a++) {
    const roll = Math.floor(Math.random() * 20) + 1;
    if (roll >= toHitThreshold) {
      hits++;
      const attackSpec = monster.attacks[a] || { level: 1, hpFac: 6, hpMinAdd: 1 };
      const dam = attackSpec.hpMinAdd + Math.floor(Math.random() * attackSpec.hpFac * attackSpec.level) + 1;
      totalDmg += dam;
    }
  }

  if (hits === 0) {
    log.push(`${monsterName} tente d'attaquer ${chosenTarget.name} mais manque.`);
  } else {
    chosenTarget.hpLeft -= totalDmg;
    log.push(`${monsterName} frappe ${chosenTarget.name} pour ${totalDmg} dégâts (${chosenTarget.hpLeft}/${chosenTarget.hpMax} PV) !`);

    // Waking up if sleeping and took damage
    if (chosenTarget.status === 'ASLEEP' && chosenTarget.hpLeft > 0) {
      chosenTarget.status = 'OK';
      log.push(`⚡ La douleur du coup réveille brutalement ${chosenTarget.name} !`);
    }

    // Special status effects (Drain Level, Poison, Paralyze, Sleep)
    if (monster.drainAmount > 0) {
      chosenTarget.charLevel = Math.max(1, chosenTarget.charLevel - monster.drainAmount);
      log.push(`⚠️ ATTENTION ! ${chosenTarget.name} se fait aspirer son énergie vitale (-${monster.drainAmount} NIVEAU) !`);
    }

    if (monster.specialPower.poison && Math.random() * 100 < 45) {
      chosenTarget.poisonAmount = (chosenTarget.poisonAmount || 0) + 1;
      log.push(`☣️ ${chosenTarget.name} a été empoisonné (Toxine Niv. ${chosenTarget.poisonAmount}) !`);
    }

    if (monster.specialPower.paralyze && Math.random() * 100 < 35 && chosenTarget.status === 'OK') {
      chosenTarget.status = 'PLYZE';
      log.push(`⚡ ${chosenTarget.name} est paralysé de stupeur !`);
    }

    if (monster.specialPower.sleep && Math.random() * 100 < 35 && chosenTarget.status === 'OK') {
      chosenTarget.status = 'ASLEEP';
      log.push(`💤 Le coup de ${monsterName} plonge ${chosenTarget.name} dans un sommeil magique !`);
    }

    if (chosenTarget.hpLeft <= 0) {
      chosenTarget.status = 'DEAD';
      chosenTarget.hpLeft = 0;
      log.push(`💀 ${chosenTarget.name} s’écroule, mort au combat !`);
    }
  }
}

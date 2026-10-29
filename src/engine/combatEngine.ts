/**
 * Faithful Wizardry I Combat Engine matching Pascal reverse engineering
 */
import { TCharacter, TMonster, TSpell, TStatus } from '../types/wizardry';
import { MONSTERS_DATABASE, SPELLS } from '../data/wizardryData';
import { castCombatSpell, CombatEffects, SpellContext } from './spellEngine';

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
  effects: CombatEffects;
  expGainedPerSurvivor?: number;
}

/**
 * Authentic Pascal GIVEEXP / CALC1EXP / TOTALEXP / CNTALIVE calculation
 * (pascal_source/Wiz1C/REWARDS2.TEXT.pas, l. 807-1015):
 * Total XP is the sum over all defeated monster groups of (monster.expReward * group.count),
 * divided equally (integer division) among surviving party members whose status is 'OK'.
 */
export function calculateVictoryExp(
  party: TCharacter[],
  groups: CombatGroup[]
): { totalExp: number; survivorCount: number; expPerSurvivor: number } {
  const survivorCount = party.filter(h => h.status === 'OK' && h.hpLeft > 0).length;
  const totalExp = groups.reduce((acc, grp) => {
    const unitExp = grp.monster.expReward || 0;
    return acc + unitExp * grp.count;
  }, 0);
  const expPerSurvivor = survivorCount > 0 ? Math.floor(totalExp / survivorCount) : 0;
  return { totalExp, survivorCount, expPerSurvivor };
}

/**
 * Authentic Pascal PROCEDURE RUNAWAY (pascal_source/Wiz1B/COMBAT2.TEXT.pas, l. 279-313):
 * Run is a party-wide action. If it succeeds, the entire party escapes immediately.
 * If it fails (RUNFAILD), the entire party forfeits its turn (AGILITY := -1) and monsters attack.
 */
export function attemptPartyRun(
  party: TCharacter[],
  groups: CombatGroup[],
  mazeLevel: number
): boolean {
  const partyCnt = party.length;
  let temp = 38 - 3 * mazeLevel;
  if (partyCnt < 4) {
    temp += 20 - 5 * partyCnt;
  }
  const myStreng = party
    .filter(h => h.status === 'OK' && h.hpLeft > 0)
    .reduce((sum, h) => sum + h.charLevel, 0);
  const enStreng = groups.reduce((sum, g) => {
    const aliveInGroup = g.instances.filter(i => i.status === 'OK' && i.hpLeft > 0).length;
    return sum + aliveInGroup * (g.monster.level || 1);
  }, 0);
  if (myStreng > enStreng) {
    temp += 20;
  }
  if (mazeLevel === 10) {
    temp = -1;
  }
  return Math.floor(Math.random() * 100) <= temp;
}

export interface EncounterOptions {
  enemyCalc?: { minEnemy: number; multWorse: number; worse01: number; range0n: number; percWorse: number }[];
  fixedMonsterIds?: number[];
}

/**
 * According to Pascal Wizardry 1 rules:
 * Dead and ashed characters are automatically moved to the rear (last positions) of the formation,
 * allowing living characters to step forward to fill their place and maintain the front rank (slots 1 to 3).
 */
export function shiftDeadHeroesToEnd(party: TCharacter[]): { changed: boolean; movedNames: string[] } {
  const living = party.filter(h => h.status !== 'DEAD' && h.status !== 'ASHES');
  const dead = party.filter(h => h.status === 'DEAD' || h.status === 'ASHES');

  if (dead.length === 0 || living.length === 0) {
    return { changed: false, movedNames: [] };
  }

  // Check if any dead character is located before any living character
  const firstDeadIdx = party.findIndex(h => h.status === 'DEAD' || h.status === 'ASHES');
  const lastLivingIdx = party.map(h => h.status !== 'DEAD' && h.status !== 'ASHES').lastIndexOf(true);

  if (firstDeadIdx === -1 || lastLivingIdx === -1 || firstDeadIdx >= lastLivingIdx) {
    return { changed: false, movedNames: [] };
  }

  const movedNames = dead.map(d => d.name);
  const reordered = [...living, ...dead];
  party.splice(0, party.length, ...reordered);
  return { changed: true, movedNames };
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
  surprise: 'PARTY' | 'MONSTERS' | 'NONE',
  ctx: SpellContext = { mazeLevel: 1, acModifier: 0 }
): CombatRoundResult {
  const log: string[] = [];
  const effects: CombatEffects = { lightAdd: 0 };
  let fled = false;
  let alarmTriggered = false;

  // Per Pascal Wizardry 1 (SPELLHSH = 0 in COMBAT2.TEXT / COMBAT3.TEXT):
  // PARRY grants a -2 AC bonus ONLY for the current combat round and never stacks across rounds.
  const parryingHeroIds = new Set<string>();
  actions.forEach(act => {
    if (act.actionType === 'PARRY') {
      const h = party[act.charIndex];
      if (h && h.status === 'OK' && h.hpLeft > 0) {
        parryingHeroIds.add(h.id);
      }
    }
  });

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
    if (!partyHasConscious || !monstersRemaining || fled || effects.malor || effects.loktofeit) break;

    if (unit.isPlayer) {
      const hero = party[unit.charIndex];
      if (!hero || hero.status !== 'OK' || hero.hpLeft <= 0) continue;

      const action = actions.find(a => a.charIndex === unit.charIndex);
      if (!action) continue;

      if (action.actionType === 'RUN') {
        if (attemptPartyRun(party, groups, ctx.mazeLevel)) {
          log.push(`🏃 L'escouade parvient à décrocher et s'enfuit du combat !`);
          fled = true;
          break;
        } else {
          log.push(`⚠️ La tentative de fuite du groupe échoue ! Les monstres bloquent toute retraite !`);
        }
      } else if (action.actionType === 'PARRY') {
        parryingHeroIds.add(hero.id);
        log.push(`🛡️ ${hero.name} se met en garde défensive (-2 CA pour ce tour uniquement).`);
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
          castCombatSpell(hero, spell, action, groups, party, log, ctx, effects);
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

      executeMonsterTurn(
        group,
        monsterInst,
        party,
        log,
        () => { alarmTriggered = true; },
        ctx.acModifier + (effects.acModifier ?? 0),
        parryingHeroIds
      );
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

  // Shift any fallen heroes to the rear of the party so living heroes step up to the front rank
  const shiftResult = shiftDeadHeroesToEnd(party);
  if (shiftResult.changed) {
    log.push(`🔄 Les héros tombés (${shiftResult.movedNames.join(', ')}) sont placés en queue de groupe ; les survivants avancent en première ligne.`);
  }

  const partyAlive = party.some(p => p.status !== 'DEAD' && p.status !== 'ASHES' && p.hpLeft > 0);
  const monstersAlive = groups.some(g => g.aliveCount > 0);

  let expGainedPerSurvivor = 0;
  if (!monstersAlive && partyAlive && !fled && !effects.malor && !effects.loktofeit) {
    const { totalExp, survivorCount, expPerSurvivor } = calculateVictoryExp(party, groups);
    expGainedPerSurvivor = expPerSurvivor;
    if (survivorCount > 0 && expPerSurvivor > 0) {
      log.push(`🏆 VICTOIRE ! Pour avoir éliminé les monstres (${totalExp.toLocaleString()} XP au total), chacun des ${survivorCount} survivant(s) (statut OK) reçoit +${expPerSurvivor.toLocaleString()} XP !`);
    }
  }

  return {
    combatLog: log,
    partyAlive,
    monstersAlive,
    fled,
    alarmTriggered,
    effects,
    expGainedPerSurvivor
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
      const dam = Math.max(1, rollDice(hero.wepDamage));
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

function executeMonsterTurn(
  group: CombatGroup,
  inst: CombatMonsterInstance,
  party: TCharacter[],
  log: string[],
  onAlarm: () => void,
  acModifier = 0,
  parryingHeroIds: Set<string> = new Set()
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

  const parryBonus = parryingHeroIds.has(chosenTarget.id) ? 2 : 0;
  const toHitThreshold = Math.max(1, Math.min(19, 20 - chosenTarget.armorClass - monster.level + (chosenTarget.combatAcMod || 0) + parryBonus + acModifier));

  let totalDmg = 0;
  let hits = 0;

  for (let a = 0; a < monster.attackCount; a++) {
    const roll = Math.floor(Math.random() * 20) + 1;
    if (roll >= toHitThreshold) {
      hits++;
      const attackSpec = monster.attacks[a] || { level: 1, hpFac: 6, hpMinAdd: 1 };
      const dam = Math.max(1, rollDice(attackSpec));
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

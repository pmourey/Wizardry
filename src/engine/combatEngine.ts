/**
 * Faithful Wizardry I Combat Engine matching Pascal reverse engineering
 */
import { TCharacter, TMazeFloor, TMonster, TSpell, TStatus } from '../types/wizardry';
import { MONSTERS_DATABASE, SPELLS, ITEMS_DATABASE, recalculateCharacterCombatStats, canClassUseItem } from '../data/provingGroundsData';
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

/**
 * Authentic Pascal monster identification in combat
 * (pascal_source/Wizardry1_UCSD_Pascal.pas, l. 5268-5274):
 * At turn preparation / party status display (DSPPARTY) in each combat round,
 * every conscious living party member (status OK or AFRAID) rolls:
 *   (RANDOM MOD 99) < (IQ + PIETY + CHARLEV)
 * On success, an enemy group slot ((RANDOM MOD 4) + 1) has its true identity revealed.
 */
export function checkMonsterIdentification(
  party: TCharacter[],
  groups: CombatGroup[],
  log?: string[]
): { newlyIdentifiedCount: number } {
  let newlyIdentifiedCount = 0;

  // Living conscious heroes who can observe the battlefield
  const activeHeroes = party.filter(
    h => (h.status === 'OK' || h.status === 'AFRAID') && h.hpLeft > 0
  );

  for (const hero of activeHeroes) {
    const iq = hero.attrib?.IQ ?? 10;
    const piety = hero.attrib?.PIETY ?? 10;
    const lev = hero.charLevel ?? 1;
    const chance = iq + piety + lev;
    const roll = Math.floor(Math.random() * 99);

    if (roll < chance) {
      // Pick a group slot (0..3 matching (RANDOM MOD 4) + 1 in Pascal)
      const targetSlot = Math.floor(Math.random() * Math.max(4, groups.length));
      if (targetSlot < groups.length) {
        const targetGroup = groups[targetSlot];
        if (targetGroup && !targetGroup.identified && targetGroup.aliveCount > 0) {
          targetGroup.identified = true;
          newlyIdentifiedCount++;
          const trueName = targetGroup.aliveCount > 1 
            ? (targetGroup.monster.namePlural || targetGroup.monster.name) 
            : targetGroup.monster.name;
          if (log) {
            log.push(`🔍 ${hero.name} observe attentivement l'ennemi et identifie : ${trueName} !`);
          }
        }
      }
    }
  }

  return { newlyIdentifiedCount };
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

const rollDice = (d?: { level?: number; hpFac?: number; hpMinAdd?: number }): number => {
  if (!d) return 1;
  const count = d.level ?? 1;
  const fac = d.hpFac ?? 1;
  let total = d.hpMinAdd ?? 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * Math.max(1, fac)) + 1;
  return Math.max(1, total);
};

const makeMonsterInstance = (monster: TMonster): CombatMonsterInstance => {
  const hpRec = monster.hp || {
    level: monster.level || 1,
    hpFac: (monster as any).hpFac || 8,
    hpMinAdd: (monster as any).hpMinAdd || 4
  };
  const hp = Math.max(1, rollDice(hpRec));
  return { monsterId: monster.id, hpLeft: hp, maxHp: hp, status: 'OK', acMod: 0, silencedRounds: 0 };
};

const makeGroup = (monster: TMonster, forcedCount?: number): CombatGroup => {
  const count = Math.max(1, Math.min(9, forcedCount ?? (monster.appear ? rollDice(monster.appear) : 1)));
  const instances: CombatMonsterInstance[] = [];
  for (let i = 0; i < count; i++) {
    instances.push(makeMonsterInstance(monster));
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

export function initCombatEncounter(
  level: number, 
  specialEnemyId?: number, 
  options: EncounterOptions = {},
  party?: TCharacter[]
): {
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

  // Authentic Pascal FRIENDLY procedure (pascal_source/Wizardry1_UCSD_Pascal.pas l. 4077-4132):
  // 1. Must have at least one GOOD character in the active party:
  const hasGoodHero = party ? party.some(h => h.align === 'GOOD' && h.status !== 'DEAD' && h.status !== 'ASHES') : false;
  let friendly = false;
  if (hasGoodHero) {
    const zero99 = Math.floor(Math.random() * 100);
    let threshold = 50;
    switch (primaryMonster.monsterClass) {
      case 0: threshold = 60; break; // Fighter: 10%
      case 1: threshold = 55; break; // Mage: 5%
      case 2: threshold = 65; break; // Priest: 15%
      case 3: threshold = 53; break; // Thief: 3%
      case 4: threshold = 80; break; // Bishop / Little Old Man (Dink): 30%
      case 7: threshold = 75; break; // Dragon: 25%
      default: threshold = 50; break; // Other classes (Undead, Giant, Demon, etc.): 0%
    }
    if (zero99 >= 50 && zero99 < threshold) {
      friendly = true;
      surprise = 'NONE'; // Friendly monsters never trigger surprise attacks
    }
  }

  // Pascal FRIENDLY encounter (pascal_source/Wizardry1_UCSD_Pascal.pas l. 4109):
  // When an encounter is friendly, all groups are immediately identified.
  if (friendly) {
    groups.forEach(g => { g.identified = true; });
  } else if (party && party.length > 0) {
    // Initial round 1 turn preparation identification check (pascal_source l. 5268-5274)
    checkMonsterIdentification(party, groups);
  }

  return { groups, surprise, friendly };
}

/**
 * Authentic Pascal FIGHTS procedure (pascal_source/Wizardry1_UCSD_Pascal.pas l. 1077-1092):
 * When entering or generating a maze level, up to 9 rooms with fights === 1 are populated.
 * Any tile connected through OPEN doorways within that room is marked with true in FIGHTMAP.
 */
export function generateFightMap(mazeFloor: TMazeFloor): boolean[][] {
  const map: boolean[][] = Array.from({ length: 20 }, () => Array(20).fill(false));
  if (!mazeFloor || !mazeFloor.fights) return map;

  const candidateRooms: { x: number; y: number }[] = [];
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
      if (mazeFloor.fights[x] && mazeFloor.fights[x][y] === 1) {
        candidateRooms.push({ x, y });
      }
    }
  }

  if (candidateRooms.length === 0) return map;

  const fillRoom = (startX: number, startY: number) => {
    const queue = [{ x: startX, y: startY }];
    map[startX][startY] = true;
    while (queue.length > 0) {
      const { x, y } = queue.pop()!;
      if (mazeFloor.n && mazeFloor.n[x] && mazeFloor.n[x][y] === 'OPEN') {
        const ny = (y + 1) % 20;
        if (mazeFloor.fights[x]?.[ny] === 1 && !map[x][ny]) {
          map[x][ny] = true;
          queue.push({ x, y: ny });
        }
      }
      if (mazeFloor.e && mazeFloor.e[x] && mazeFloor.e[x][y] === 'OPEN') {
        const nx = (x + 1) % 20;
        if (mazeFloor.fights[nx]?.[y] === 1 && !map[nx][y]) {
          map[nx][y] = true;
          queue.push({ x: nx, y });
        }
      }
      if (mazeFloor.s && mazeFloor.s[x] && mazeFloor.s[x][y] === 'OPEN') {
        const ny = (y - 1 + 20) % 20;
        if (mazeFloor.fights[x]?.[ny] === 1 && !map[x][ny]) {
          map[x][ny] = true;
          queue.push({ x, y: ny });
        }
      }
      if (mazeFloor.w && mazeFloor.w[x] && mazeFloor.w[x][y] === 'OPEN') {
        const nx = (x - 1 + 20) % 20;
        if (mazeFloor.fights[nx]?.[y] === 1 && !map[nx][y]) {
          map[nx][y] = true;
          queue.push({ x: nx, y });
        }
      }
    }
  };

  const pool = [...candidateRooms];
  let roomsChosen = 0;
  while (pool.length > 0 && roomsChosen < 9) {
    const idx = Math.floor(Math.random() * pool.length);
    const spot = pool.splice(idx, 1)[0];
    if (!map[spot.x][spot.y]) {
      fillRoom(spot.x, spot.y);
      roomsChosen++;
    }
  }

  return map;
}

/**
 * Authentic Pascal CLROOMFG procedure (pascal_source/Wizardry1_UCSD_Pascal.pas l. 11450-11470):
 * When an encounter inside a room is defeated, clears the entire room's fight flag.
 * Defeated rooms do NOT respawn as long as the party remains on that floor.
 */
export function clearRoomFights(fightMap: boolean[][], mazeFloor: TMazeFloor, startX: number, startY: number): boolean[][] {
  const nextMap = fightMap.map(row => [...row]);
  if (!nextMap[startX] || !nextMap[startX][startY]) return nextMap;

  const queue = [{ x: startX, y: startY }];
  nextMap[startX][startY] = false;

  while (queue.length > 0) {
    const { x, y } = queue.pop()!;
    if (mazeFloor.n && mazeFloor.n[x] && mazeFloor.n[x][y] === 'OPEN') {
      const ny = (y + 1) % 20;
      if (nextMap[x]?.[ny]) {
        nextMap[x][ny] = false;
        queue.push({ x, y: ny });
      }
    }
    if (mazeFloor.e && mazeFloor.e[x] && mazeFloor.e[x][y] === 'OPEN') {
      const nx = (x + 1) % 20;
      if (nextMap[nx]?.[y]) {
        nextMap[nx][y] = false;
        queue.push({ x: nx, y });
      }
    }
    if (mazeFloor.s && mazeFloor.s[x] && mazeFloor.s[x][y] === 'OPEN') {
      const ny = (y - 1 + 20) % 20;
      if (nextMap[x]?.[ny]) {
        nextMap[x][ny] = false;
        queue.push({ x, y: ny });
      }
    }
    if (mazeFloor.w && mazeFloor.w[x] && mazeFloor.w[x][y] === 'OPEN') {
      const nx = (x - 1 + 20) % 20;
      if (nextMap[nx]?.[y]) {
        nextMap[nx][y] = false;
        queue.push({ x: nx, y });
      }
    }
  }

  return nextMap;
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
    // Check if battle still ongoing (any party member alive to be targeted)
    const partyHasLiving = party.some(p => p.status !== 'DEAD' && p.status !== 'ASHES' && p.hpLeft > 0);
    const monstersRemaining = groups.some(g => g.aliveCount > 0);
    if (!partyHasLiving || !monstersRemaining || fled || effects.malor || effects.loktofeit) break;

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
          const groupName = targetGroup.identified
            ? (targetGroup.aliveCount > 1 ? (targetGroup.monster.namePlural || targetGroup.monster.name) : targetGroup.monster.name)
            : (targetGroup.aliveCount > 1 ? (targetGroup.monster.nameUnknownPlural || targetGroup.monster.nameUnknown) : targetGroup.monster.nameUnknown);
          log.push(`${hero.name} brandit son symbole sacré et exorcise ${groupName} !`);
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
      } else if (action.actionType === 'USE_ITEM') {
        const slotIdx = action.inventorySlotIndex ?? -1;
        const slot = hero.possessions[slotIdx];
        if (!slot) {
          log.push(`${hero.name} cherche un objet dans son inventaire mais ne trouve rien.`);
          continue;
        }
        const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
        if (!itm) {
          log.push(`${hero.name} ne parvient pas à utiliser l'objet.`);
          continue;
        }

        if (!canClassUseItem(hero.class, itm)) {
          log.push(`${hero.name} tente d'utiliser ${itm.name}, mais sa classe (${hero.class}) ne maîtrise pas cet objet !`);
          continue;
        }

        log.push(`✨ ${hero.name} utilise ${itm.name} !`);

        if (itm.spellPower && itm.spellPower > 0) {
          const spell = SPELLS.find(s => s.id === itm.spellPower);
          if (spell) {
            log.push(`Le pouvoir magique de ${spell.name} jaillit de l'objet !`);
            castCombatSpell(hero, spell, action, groups, party, log, ctx, effects);
          }
        } else if (itm.healPts && itm.healPts > 0) {
          const target = party[action.targetCharIndex ?? unit.charIndex] || hero;
          if (target.status === 'OK' || target.status === 'AFRAID' || target.status === 'ASLEEP') {
            const healAmt = itm.healPts * 6 + Math.floor(Math.random() * 8);
            target.hpLeft = Math.min(target.hpMax, target.hpLeft + healAmt);
            log.push(`💚 ${target.name} récupère ${healAmt} PV (${target.hpLeft}/${target.hpMax}).`);
          }
        } else if (itm.name.toUpperCase().includes('LATUMOFIS') || itm.name.toUpperCase().includes('POISON')) {
          const target = party[action.targetCharIndex ?? unit.charIndex] || hero;
          target.poisonAmount = 0;
          log.push(`💚 Le poison dans les veines de ${target.name} est neutralisé.`);
        }

        // Consumption or degradation
        if (itm.changeChance > 0 && Math.random() * 100 < itm.changeChance) {
          if (!itm.changeTo || itm.changeTo === 0) {
            hero.possessions.splice(slotIdx, 1);
            log.push(`L'objet ${itm.name} a été entièrement consommé.`);
          } else {
            slot.itemIndex = itm.changeTo;
            const newItem = ITEMS_DATABASE.find(i => i.id === itm.changeTo);
            log.push(`L'objet s'est transformé en ${newItem?.name || 'objet inerte'}.`);
          }
          recalculateCharacterCombatStats(hero);
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

  // Turn preparation / Monster identification check for next round (pascal_source DSPPARTY l. 5268-5274)
  if (partyAlive && monstersAlive && !fled) {
    checkMonsterIdentification(party, groups, log);
  }

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
  const monsterName = group.identified 
    ? (group.aliveCount > 1 ? (monster.namePlural || monster.name) : monster.name)
    : (group.aliveCount > 1 ? (monster.nameUnknownPlural || monster.nameUnknown) : monster.nameUnknown);

  // 0. Passive HP Regeneration (HEALPTS, Pascal COMBAT3.TEXT l. 53)
  if (monster.healPts > 0 && inst.hpLeft > 0 && inst.hpLeft < inst.maxHp) {
    const healed = Math.min(monster.healPts, inst.maxHp - inst.hpLeft);
    inst.hpLeft += healed;
    log.push(`💚 ${monsterName} régénère ses chairs blessées (+${healed} PV) !`);
  }

  // Conscious living heroes
  const livingHeroes = party
    .map((h, idx) => ({ hero: h, index: idx }))
    .filter(item => item.hero.status !== 'DEAD' && item.hero.status !== 'ASHES' && item.hero.hpLeft > 0);

  if (livingHeroes.length === 0) return;

  // 1. Monster Spellcasting check (ENEMYSPL, Pascal COMBAT2.TEXT l. 605)
  if ((monster.mageSpells > 0 || monster.priestSpells > 0) && Math.random() * 100 < 75 && inst.silencedRounds === 0) {
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

    // Direct damage spell (tier-based)
    const spellTier = Math.max(monster.mageSpells, monster.priestSpells);
    let spellDmg = Math.floor(Math.random() * 12) + 4;
    let spellName = 'HALITO';
    if (spellTier >= 7) {
      spellName = 'TILTOWAI';
      spellDmg = rollDice({ level: 10, hpFac: 15, hpMinAdd: 0 });
      log.push(`💥 ${monsterName} déchaîne l'apocalypse de TILTOWAI sur toute l'escouade !`);
      livingHeroes.forEach(({ hero: h }) => {
        const saved = Math.random() * 20 < (h.luckSkill?.[3] ?? 10);
        const actualDmg = saved ? Math.floor(spellDmg / 2) : spellDmg;
        h.hpLeft -= actualDmg;
        log.push(`${h.name} subit ${actualDmg} dégâts dévastateurs (${h.hpLeft}/${h.hpMax} PV) !`);
        if (h.hpLeft <= 0) { h.status = 'DEAD'; h.hpLeft = 0; log.push(`💀 ${h.name} est désintégré !`); }
      });
      return;
    } else if (spellTier >= 5) {
      spellName = 'MADALTO';
      spellDmg = rollDice({ level: 8, hpFac: 8, hpMinAdd: 0 });
    } else if (spellTier >= 3) {
      spellName = 'MAHALITO';
      spellDmg = rollDice({ level: 4, hpFac: 6, hpMinAdd: 0 });
    }

    log.push(`⚡ ${monsterName} incante ${spellName} !`);
    target.hpLeft -= spellDmg;
    log.push(`${target.name} est frappé de plein fouet pour ${spellDmg} dégâts (${target.hpLeft}/${target.hpMax} PV) !`);
    if (target.hpLeft <= 0) {
      target.status = 'DEAD';
      target.hpLeft = 0;
      log.push(`💀 ${target.name} est terrassé !`);
    }
    return;
  }

  // 2. Dragon breath weapon check (BREATHES, Pascal COMBAT2.TEXT l. 633)
  if (monster.breathe > 0 && Math.random() * 100 < 60) {
    const breathDmg = Math.max(1, Math.floor(inst.hpLeft / 2));
    log.push(`🔥 ${monsterName} souffle un cône d'énergie destructrice !`);
    livingHeroes.forEach(({ hero }) => {
      // Save vs breath using Luck
      const saved = Math.random() * 20 < (hero.luckSkill?.[3] ?? 10);
      const actualDmg = saved ? Math.floor(breathDmg / 2) : breathDmg;
      hero.hpLeft -= actualDmg;
      log.push(`${hero.name} subit ${actualDmg} dégâts${saved ? ' (jet de sauvegarde réussi)' : ''} !`);
      if (hero.hpLeft <= 0) {
        hero.status = 'DEAD';
        hero.hpLeft = 0;
        log.push(`💀 ${hero.name} succombe au souffle mortel !`);
      }
    });
    return;
  }

  // 3. Call for help check (YELLHELP, Pascal COMBAT2.TEXT l. 612 & COMBAT5.TEXT l. 441)
  if (monster.specialPower?.callHelp) {
    if (group.aliveCount < 9) {
      // Pascal condition: (RANDOM MOD 200) <= 10 * LEVEL
      // For level 100 (FUZZBALL), 10 * 100 = 1000 >= 200 -> 100% success rate!
      const callRoll = Math.floor(Math.random() * 200);
      if (callRoll <= 10 * (monster.level || 1)) {
        group.instances.push(makeMonsterInstance(monster));
        group.aliveCount = group.instances.filter(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0).length;
        group.count = group.instances.length;
        log.push(`📢 ${monsterName} pousse un cri strident d'appel à l'aide... et des renforts surgissent (+1 ${monsterName}) !`);
        return;
      } else {
        log.push(`📢 ${monsterName} appelle désespérément à l'aide, mais aucun renfort ne répond !`);
        return;
      }
    }
  }

  // 4. Monster flee check (RUNENMY, Pascal COMBAT2.TEXT l. 622 & COMBAT5.TEXT l. 464)
  if (monster.specialPower?.fleeChance) {
    // For DINK (or cowardly monsters), high chance to flee
    if (Math.random() * 100 < 65) {
      inst.status = 'DEAD';
      inst.hpLeft = 0;
      group.aliveCount = group.instances.filter(i => i.status !== 'DEAD' && i.status !== 'ASHES' && i.hpLeft > 0).length;
      log.push(`💨 Pris de panique, ${monsterName} prend ses jambes à son cou et s'enfuit du donjon !`);
      return;
    }
  }

  // 5. Physical Melee Attack against hero (DOFIGHT)
  // If monster has 0 attacks (e.g. FUZZBALL), it cannot execute melee attacks
  const attackCount = monster.attackCount ?? 0;
  if (attackCount === 0 || !monster.attacks || monster.attacks.length === 0) {
    log.push(`${monsterName} frétille sur place mais ne dispose d'aucune attaque physique.`);
    return;
  }

  const frontRankCandidates = livingHeroes.filter(item => item.index < 3);
  const eligibleMeleeTargets = frontRankCandidates.length > 0 ? frontRankCandidates : livingHeroes;
  const chosenTarget = eligibleMeleeTargets[Math.floor(Math.random() * eligibleMeleeTargets.length)].hero;

  const isHelpless = chosenTarget.status === 'ASLEEP' || chosenTarget.status === 'PLYZE';
  const helplessPenalty = isHelpless ? 6 : 0;
  const parryBonus = parryingHeroIds.has(chosenTarget.id) ? 2 : 0;
  const toHitThreshold = Math.max(1, Math.min(19, 20 - chosenTarget.armorClass - monster.level + (chosenTarget.combatAcMod || 0) + parryBonus + acModifier - helplessPenalty));

  let totalDmg = 0;
  let hits = 0;

  for (let a = 0; a < attackCount; a++) {
    const roll = Math.floor(Math.random() * 20) + 1;
    if (roll >= toHitThreshold) {
      hits++;
      const attackSpec = monster.attacks[a] || monster.attacks[0];
      const dam = Math.max(1, rollDice(attackSpec));
      totalDmg += dam;
    }
  }

  if (hits === 0) {
    log.push(`${monsterName} tente d'attaquer ${chosenTarget.name} mais manque.`);
  } else {
    chosenTarget.hpLeft -= totalDmg;
    log.push(`${monsterName} frappe ${chosenTarget.name} ${hits > 1 ? `(${hits} coups)` : ''} pour ${totalDmg} dégâts (${chosenTarget.hpLeft}/${chosenTarget.hpMax} PV) !`);

    // Waking up if sleeping and took damage
    if (chosenTarget.status === 'ASLEEP' && chosenTarget.hpLeft > 0) {
      chosenTarget.status = 'OK';
      log.push(`⚡ La douleur du coup réveille brutalement ${chosenTarget.name} !`);
    }

    // Authentic Pascal Special Attack Status Effects (CASEDAMG, Pascal COMBAT5.TEXT l. 220-235)
    // A. Drain Energy Levels
    if (monster.drainAmount > 0) {
      chosenTarget.charLevel = Math.max(1, chosenTarget.charLevel - monster.drainAmount);
      log.push(`⚠️ ATTENTION ! ${chosenTarget.name} se fait aspirer son énergie vitale (-${monster.drainAmount} NIVEAU) !`);
    }

    // B. Critical Hit (Decapitation)
    if (monster.specialPower?.criticalHit && chosenTarget.status !== 'DEAD' && chosenTarget.status !== 'ASHES') {
      const critChance = Math.min(50, monster.level * 2);
      if (Math.random() * 100 < critChance) {
        chosenTarget.status = 'DEAD';
        chosenTarget.hpLeft = 0;
        log.push(`⚡ COUP CRITIQUE MORTEL ! ${monsterName} décapite ${chosenTarget.name} d'un coup impitoyable !`);
        return;
      }
    }

    // C. Petrification (STONE)
    if (monster.specialPower?.stone && chosenTarget.status === 'OK') {
      const luckSave = Math.random() * 20 < (chosenTarget.luckSkill?.[2] ?? 10);
      if (!luckSave) {
        chosenTarget.status = 'STONED';
        log.push(`🗿 PÉTRIFICATION ! Le contact de ${monsterName} pétrifie ${chosenTarget.name} en pierre froide !`);
      }
    }

    // D. Paralysis
    if (monster.specialPower?.paralyze && chosenTarget.status === 'OK') {
      const luckSave = Math.random() * 20 < (chosenTarget.luckSkill?.[1] ?? 10);
      if (!luckSave) {
        chosenTarget.status = 'PLYZE';
        log.push(`⚡ ${chosenTarget.name} est frappé de paralysie par ${monsterName} !`);
      }
    }

    // E. Poison
    if (monster.specialPower?.poison) {
      const luckSave = Math.random() * 20 < (chosenTarget.luckSkill?.[0] ?? 10);
      if (!luckSave) {
        chosenTarget.poisonAmount = (chosenTarget.poisonAmount || 0) + 1;
        log.push(`☣️ ${chosenTarget.name} a été empoisonné (Toxine Niv. ${chosenTarget.poisonAmount}) !`);
      }
    }

    // F. Sleep attack
    if (monster.specialPower?.sleep && chosenTarget.status === 'OK') {
      chosenTarget.status = 'ASLEEP';
      log.push(`💤 Le coup de ${monsterName} plonge ${chosenTarget.name} dans un sommeil catatonique !`);
    }

    if (chosenTarget.hpLeft <= 0) {
      chosenTarget.status = 'DEAD';
      chosenTarget.hpLeft = 0;
      log.push(`💀 ${chosenTarget.name} succombe aux blessures et s'effondre sans vie !`);
    }
  }
}

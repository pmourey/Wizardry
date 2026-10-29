/**
 * Authentic Wizardry I Data Tables matching Pascal reverse engineering
 */
import { TItem, TMonster, TRace, TClass, TAlign, TAttrib, TSpell, TCharacter, TMazeFloor, TReward, PGMessage, TWall } from '../types/wizardry';
import { PG_EXP_TABLES, PG_ITEMS, PG_MONSTERS, PG_REWARDS, PG_MESSAGES, PG_MAZES, PG_SPELL_TABLE } from './provingGroundsData';

export const RACE_BASE_ATTRIBUTES: Record<TRace, Record<string, number>> = {
  HUMAN:  { STRENGTH: 8,  IQ: 8,  PIETY: 5,  VITALITY: 8,  AGILITY: 8,  LUCK: 9 },
  ELF:    { STRENGTH: 7,  IQ: 10, PIETY: 10, VITALITY: 6,  AGILITY: 9,  LUCK: 6 },
  DWARF:  { STRENGTH: 10, IQ: 7,  PIETY: 10, VITALITY: 10, AGILITY: 5,  LUCK: 6 },
  GNOME:  { STRENGTH: 7,  IQ: 7,  PIETY: 10, VITALITY: 8,  AGILITY: 10, LUCK: 7 },
  HOBBIT: { STRENGTH: 5,  IQ: 7,  PIETY: 7,  VITALITY: 6,  AGILITY: 10, LUCK: 15 },
};

// Authentic Experience point thresholds (ZEXP record from SCENARIO.DATA).
// Index 0 = XP increment per level above 13; indices 1..12 = cumulative XP required for levels 2..13.
export const EXP_TABLES: Record<TClass, number[]> = PG_EXP_TABLES;

/**
 * Authentic Pascal CHNEWLEV formula (pascal_source/Wiz1C/CASTLE2.TEXT.pas, l. 694-720):
 * Returns the cumulative XP required to advance from `charLevel` to `charLevel + 1`.
 * When `charLevel <= 0`, returns 0 (baseline XP for level 1).
 */
export function getExpForNextLevel(charClass: TClass, charLevel: number): number {
  if (charLevel <= 0) return 0;
  const table = EXP_TABLES[charClass] || EXP_TABLES.FIGHTER;
  if (charLevel <= 12) {
    return table[charLevel];
  }
  let expNext = table[12];
  for (let bigLev = 13; bigLev <= charLevel; bigLev++) {
    expNext += table[0];
  }
  return expNext;
}

// Spell index ranges per circle 1..7 from MINMAG & MINPRI (pascal_source/Wiz1C/CASTLE2.TEXT.pas, l. 424-453)
export const MAGE_CIRCLE_RANGES: ReadonlyArray< readonly [number, number] > = [
  [1, 4],   // Circle 1
  [5, 6],   // Circle 2
  [7, 8],   // Circle 3
  [9, 11],  // Circle 4
  [12, 14], // Circle 5
  [15, 18], // Circle 6
  [19, 21], // Circle 7
];

export const PRIEST_CIRCLE_RANGES: ReadonlyArray< readonly [number, number] > = [
  [22, 26], // Circle 1
  [27, 30], // Circle 2
  [31, 34], // Circle 3
  [35, 38], // Circle 4
  [39, 44], // Circle 5
  [45, 48], // Circle 6
  [49, 50], // Circle 7
];

/**
 * Authentic Pascal SPLPERLV helper (pascal_source/Wiz1C/CASTLE2.TEXT.pas, l. 363-387)
 */
function splPerLv(spelGrps: number[], charLev: number, levelMod: number, levMod2: number): void {
  let spellCnt = charLev - levelMod;
  if (spellCnt <= 0) return;
  let spGrpI = 1;
  while (spGrpI >= 1 && spGrpI <= 7 && spellCnt > 0) {
    if (spellCnt > spelGrps[spGrpI]) {
      spelGrps[spGrpI] = spellCnt;
    }
    spGrpI += 1;
    spellCnt -= levMod2;
  }
  for (let i = 1; i <= 7; i++) {
    if (spelGrps[i] > 9) {
      spelGrps[i] = 9;
    }
  }
}

/**
 * Computes the authentic maximum spell slots per circle (1..7) for a character
 * according to PROCEDURE SETSPELS (pascal_source/Wiz1C/CASTLE2.TEXT.pas, l. 360-469).
 */
export function getMaxCharacterSpells(
  hero: Pick<TCharacter, 'class' | 'charLevel' | 'spellsKnown'>
): { mageSpells: number[]; priestSpells: number[] } {
  const mageSpells = [0, 0, 0, 0, 0, 0, 0, 0];
  const priestSpells = [0, 0, 0, 0, 0, 0, 0, 0];

  // MINMAG: count known Mage spells in each circle 1..7
  MAGE_CIRCLE_RANGES.forEach(([low, high], idx) => {
    let known = 0;
    for (let s = low; s <= high; s++) {
      if (hero.spellsKnown?.[s]) known++;
    }
    mageSpells[idx + 1] = known;
  });

  // MINPRI: count known Priest spells in each circle 1..7
  PRIEST_CIRCLE_RANGES.forEach(([low, high], idx) => {
    let known = 0;
    for (let s = low; s <= high; s++) {
      if (hero.spellsKnown?.[s]) known++;
    }
    priestSpells[idx + 1] = known;
  });

  // Apply class & level progression (SPLPERLV)
  switch (hero.class) {
    case 'PRIEST':
      splPerLv(priestSpells, hero.charLevel, 0, 2);
      break;
    case 'MAGE':
      splPerLv(mageSpells, hero.charLevel, 0, 2);
      break;
    case 'BISHOP':
      splPerLv(priestSpells, hero.charLevel, 3, 4);
      splPerLv(mageSpells, hero.charLevel, 0, 4);
      break;
    case 'LORD':
      splPerLv(priestSpells, hero.charLevel, 3, 2);
      break;
    case 'SAMURAI':
      splPerLv(mageSpells, hero.charLevel, 3, 3);
      break;
    default:
      break;
  }

  return { mageSpells, priestSpells };
}

/**
 * Restores a character's spell slots (`mageSpells` and `priestSpells`) to their
 * authentic maximums for their class, level, and known spells (`SETSPELS`).
 */
export function setCharacterSpells(hero: TCharacter): void {
  const { mageSpells, priestSpells } = getMaxCharacterSpells(hero);
  hero.mageSpells = mageSpells;
  hero.priestSpells = priestSpells;
}

/**
 * Initializes a newly created Level 1 character's known spells and spell slots
 * according to PROCEDURE KEEPCHYN in pascal_source/Wiz1C/ROLLER.TEXT.pas (l. 1298-1309).
 */
export function initLevel1CharacterSpells(hero: TCharacter): void {
  hero.spellsKnown = new Array(51).fill(false);
  hero.mageSpells = [0, 0, 0, 0, 0, 0, 0, 0];
  hero.priestSpells = [0, 0, 0, 0, 0, 0, 0, 0];

  if (hero.class === 'MAGE' || hero.class === 'BISHOP') {
    hero.spellsKnown[1] = true; // HALITO
    hero.spellsKnown[3] = true; // KATINO
    hero.mageSpells[1] = 2;
  } else if (hero.class === 'PRIEST') {
    hero.spellsKnown[23] = true; // DIOS
    hero.spellsKnown[24] = true; // BADIOS
    hero.priestSpells[1] = 2;
  }
  setCharacterSpells(hero);
}

/**
 * Authentic Pascal PROCEDURE TRYLEARN (pascal_source/Wiz1C/CASTLE2.TEXT.pas, l. 517-603).
 * Attempts to learn unknown spells in every circle where the character has >0 spell points,
 * then recomputes SETSPELS. Returns the list of newly learned spell names.
 */
export function tryLearnSpells(hero: TCharacter): string[] {
  setCharacterSpells(hero);
  const learned: string[] = [];

  const try2Lrn = (low: number, high: number, statVal: number) => {
    let splKnown = false;
    for (let s = low; s <= high; s++) {
      if (hero.spellsKnown[s]) splKnown = true;
    }
    for (let s = low; s <= high; s++) {
      if (!hero.spellsKnown[s]) {
        if (Math.floor(Math.random() * 30) < statVal || !splKnown) {
          hero.spellsKnown[s] = true;
          splKnown = true;
          learned.push(SPELLS[s]?.name || `SORT #${s}`);
        }
      }
    }
  };

  // TRYMAGE (uses IQ)
  MAGE_CIRCLE_RANGES.forEach(([low, high], idx) => {
    if ((hero.mageSpells[idx + 1] || 0) > 0) {
      try2Lrn(low, high, hero.attrib.IQ);
    }
  });

  // TRYPRI (uses PIETY)
  PRIEST_CIRCLE_RANGES.forEach(([low, high], idx) => {
    if ((hero.priestSpells[idx + 1] || 0) > 0) {
      try2Lrn(low, high, hero.attrib.PIETY);
    }
  });

  setCharacterSpells(hero);
  return learned;
}

/**
 * Authentic Pascal PROCEDURE MADELEV (pascal_source/Wiz1C/CASTLE2.TEXT.pas, l. 481-691):
 * Increments character level, updates spell slots & learns new spells (SETSPELS + TRYLEARN),
 * rolls attribute changes (GAINLOST), and rolls new HPMAX (MOREHP).
 */
export function levelUpCharacter(hero: TCharacter): {
  hpGain: number;
  learnedSpells: string[];
  statChanges: string[];
} {
  hero.charLevel += 1;
  if (hero.charLevel > (hero.maxLevel || 1)) {
    hero.maxLevel = hero.charLevel;
  }

  // SETSPELS & TRYLEARN
  setCharacterSpells(hero);
  const learnedSpells = tryLearnSpells(hero);

  // GAINLOST (attribute changes on level up)
  const statChanges: string[] = [];
  const attrLabels: Record<TAttrib, string> = {
    STRENGTH: 'FOR',
    IQ: 'INT',
    PIETY: 'PIE',
    VITALITY: 'VIT',
    AGILITY: 'AGI',
    LUCK: 'CHA',
  };
  const ageYears = Math.floor((hero.age || 18 * 52) / 52);
  (Object.keys(attrLabels) as TAttrib[]).forEach(attr => {
    if (Math.floor(Math.random() * 4) !== 0) {
      let val = hero.attrib[attr];
      if (Math.floor(Math.random() * 130) < ageYears) {
        if (val === 18 && Math.floor(Math.random() * 6) !== 4) {
          // 5/6 chance to keep 18
        } else if (val > 3) {
          val -= 1;
          statChanges.push(`-1 ${attrLabels[attr]}`);
        }
      } else if (val < 18) {
        val += 1;
        statChanges.push(`+1 ${attrLabels[attr]}`);
      }
      hero.attrib[attr] = val;
    }
  });

  // MOREHP (re-rolls cumulative HP for CHARLEV dice, min +1 HP)
  const moreHp = (): number => {
    let die = 4;
    switch (hero.class) {
      case 'FIGHTER':
      case 'LORD':
        die = 10;
        break;
      case 'PRIEST':
      case 'SAMURAI':
        die = 8;
        break;
      case 'THIEF':
      case 'BISHOP':
      case 'NINJA':
        die = 6;
        break;
      case 'MAGE':
        die = 4;
        break;
    }
    let hitPts = Math.floor(Math.random() * die) + 1;
    const vit = hero.attrib.VITALITY;
    if (vit === 3) hitPts -= 2;
    else if (vit === 4 || vit === 5) hitPts -= 1;
    else if (vit === 16) hitPts += 1;
    else if (vit === 17) hitPts += 2;
    else if (vit >= 18) hitPts += 3;
    return Math.max(1, hitPts);
  };

  let newHpMax = 0;
  for (let lv = 1; lv <= hero.charLevel; lv++) {
    newHpMax += moreHp();
  }
  if (hero.class === 'SAMURAI') {
    newHpMax += moreHp();
  }
  if (newHpMax <= hero.hpMax) {
    newHpMax = hero.hpMax + 1;
  }
  const hpGain = newHpMax - hero.hpMax;
  hero.hpMax = newHpMax;

  // Update base combat hitMod & swingCount from level & strength (EQUIPCHR in Wiz1B/UTILITIE2.TEXT.pas)
  if (hero.class === 'FIGHTER' || hero.class === 'PRIEST' || hero.class === 'SAMURAI' || hero.class === 'LORD' || hero.class === 'NINJA') {
    hero.hitMod = 2 + Math.floor(hero.charLevel / 3);
  } else {
    hero.hitMod = Math.floor(hero.charLevel / 5);
  }
  if (hero.attrib.STRENGTH > 15) {
    hero.hitMod += hero.attrib.STRENGTH - 15;
  } else if (hero.attrib.STRENGTH < 6) {
    hero.hitMod += hero.attrib.STRENGTH - 6;
  }
  if (hero.class === 'FIGHTER' || hero.class === 'SAMURAI' || hero.class === 'LORD' || hero.class === 'NINJA') {
    hero.swingCount = Math.min(10, Math.max(hero.swingCount || 1, 1 + Math.floor(hero.charLevel / 5) + (hero.class === 'NINJA' ? 1 : 0)));
  }

  return { hpGain, learnedSpells, statChanges };
}

// All 50 Spells from Pascal source (0..50)
const SPELL_TEXTS: TSpell[] = [
  // Dummy / 0
  { id: 0, name: 'NONE', tier: 0, spellType: 'MAGE', target: 'GENERIC', hash: 0, combat: false, camp: false, description: '' },
  // Mage Spells Tier 1 (1..4)
  { id: 1, name: 'HALITO', tier: 1, spellType: 'MAGE', target: 'PERSON', hash: 4178, combat: true, camp: false, description: 'Boule de feu miniature (1-8 dégâts sur un ennemi).' },
  { id: 2, name: 'MOGREF', tier: 1, spellType: 'MAGE', target: 'GENERIC', hash: 2409, combat: true, camp: false, description: 'Réduit la CA du lanceur de 2 points pour le combat.' },
  { id: 3, name: 'KATINO', tier: 1, spellType: 'MAGE', target: 'GROUP', hash: 3983, combat: true, camp: false, description: 'Endort un groupe d’adversaires.' },
  { id: 4, name: 'DUMAPIC', tier: 1, spellType: 'MAGE', target: 'GENERIC', hash: 3245, combat: false, camp: true, description: 'Indique l’orientation et la position exacte dans le dédale.' },
  // Mage Spells Tier 2 (5..6)
  { id: 5, name: 'DILTO', tier: 2, spellType: 'MAGE', target: 'GROUP', hash: 3340, combat: true, camp: false, description: 'Augmente la CA d’un groupe ennemi (+2 AC) réduisant leur défense.' },
  { id: 6, name: 'SOPIC', tier: 2, spellType: 'MAGE', target: 'GENERIC', hash: 1953, combat: true, camp: false, description: 'Rend le lanceur transparent (-4 AC).' },
  // Mage Spells Tier 3 (7..8)
  { id: 7, name: 'MAHALITO', tier: 3, spellType: 'MAGE', target: 'GROUP', hash: 6181, combat: true, camp: false, description: 'Tempête de feu infligeant 4d6 dégâts à un groupe.' },
  { id: 8, name: 'MOLITO', tier: 3, spellType: 'MAGE', target: 'GROUP', hash: 4731, combat: true, camp: false, description: 'Choc de pierre infligeant 3d6 dégâts à un groupe.' },
  // Mage Spells Tier 4 (9..11)
  { id: 9, name: 'MORLIS', tier: 4, spellType: 'MAGE', target: 'GROUP', hash: 4744, combat: true, camp: false, description: 'Effraie et désoriente un groupe (+3 AC).' },
  { id: 10, name: 'DALTO', tier: 4, spellType: 'MAGE', target: 'GROUP', hash: 3180, combat: true, camp: false, description: 'Vague de givre infligeant 6d6 dégâts polaires à un groupe.' },
  { id: 11, name: 'LAHALITO', tier: 4, spellType: 'MAGE', target: 'GROUP', hash: 6156, combat: true, camp: false, description: 'Fournaise intense infligeant 6d6 dégâts de feu à un groupe.' },
  // Mage Spells Tier 5 (12..14)
  { id: 12, name: 'MAMORLIS', tier: 5, spellType: 'MAGE', target: 'GENERIC', hash: 7525, combat: true, camp: false, description: 'Dégrade la CA de tous les monstres présents de 3 points.' },
  { id: 13, name: 'MAKANITO', tier: 5, spellType: 'MAGE', target: 'GENERIC', hash: 6612, combat: true, camp: false, description: 'Étouffe et tue instantanément tous les ennemis de niveau <= 7.' },
  { id: 14, name: 'MADALTO', tier: 5, spellType: 'MAGE', target: 'GROUP', hash: 4925, combat: true, camp: false, description: 'Blizzard mortel infligeant 8d8 dégâts à un groupe.' },
  // Mage Spells Tier 6 (15..18)
  { id: 15, name: 'LAKANITO', tier: 6, spellType: 'MAGE', target: 'GROUP', hash: 6587, combat: true, camp: false, description: 'Vide l’air autour d’un groupe, causant la mort par suffocation.' },
  { id: 16, name: 'ZILWAN', tier: 6, spellType: 'MAGE', target: 'PERSON', hash: 4573, combat: true, camp: false, description: 'Détruit les morts-vivants (10d200 dégâts sacrés).' },
  { id: 17, name: 'MASOPIC', tier: 6, spellType: 'MAGE', target: 'GENERIC', hash: 3990, combat: true, camp: false, description: 'Diminue la CA de tous les membres de l’équipe de 4.' },
  { id: 18, name: 'HAMAN', tier: 6, spellType: 'MAGE', target: 'GENERIC', hash: 1562, combat: true, camp: false, description: 'Requête aux dieux pour un miracle aléatoire (coûte 1 niveau).' },
  // Mage Spells Tier 7 (19..21)
  { id: 19, name: 'MALOR', tier: 7, spellType: 'MAGE', target: 'GENERIC', hash: 3128, combat: true, camp: true, description: 'Téléportation précise dans le labyrinthe ou aléatoire en combat.' },
  { id: 20, name: 'MAHAMAN', tier: 7, spellType: 'MAGE', target: 'GENERIC', hash: 2597, combat: true, camp: false, description: 'Grand miracle suprême aux effets prodigieux (coûte 1 niveau).' },
  { id: 21, name: 'TILTOWAI', tier: 7, spellType: 'MAGE', target: 'GENERIC', hash: 11157, combat: true, camp: false, description: 'L’explosion nucléaire mythique infligeant 10d15 à tous les monstres.' },
  
  // Priest Spells Tier 1 (22..26)
  { id: 22, name: 'KALKI', tier: 1, spellType: 'PRIEST', target: 'GENERIC', hash: 1449, combat: true, camp: false, description: 'Bénit l’équipe en améliorant leur CA de 1.' },
  { id: 23, name: 'DIOS', tier: 1, spellType: 'PRIEST', target: 'PERSON', hash: 2301, combat: true, camp: true, description: 'Soigne 1-8 points de vie sur un héros.' },
  { id: 24, name: 'BADIOS', tier: 1, spellType: 'PRIEST', target: 'PERSON', hash: 3675, combat: true, camp: false, description: 'Inflige 1-8 points de dégâts spirituels à un ennemi.' },
  { id: 25, name: 'MILWA', tier: 1, spellType: 'PRIEST', target: 'GENERIC', hash: 2889, combat: true, camp: true, description: 'Illumine les couloirs du donjon (15 à 29 pas).' },
  { id: 26, name: 'PORFIC', tier: 1, spellType: 'PRIEST', target: 'GENERIC', hash: 2287, combat: true, camp: false, description: 'Créé un bouclier divin pour le prêtre (-4 AC).' },
  // Priest Spells Tier 2 (27..30)
  { id: 27, name: 'MATU', tier: 2, spellType: 'PRIEST', target: 'GENERIC', hash: 3139, combat: true, camp: false, description: 'Bénédiction majeure réduisant la CA de l’équipe de 2.' },
  { id: 28, name: 'CALFO', tier: 2, spellType: 'PRIEST', target: 'GENERIC', hash: 0, combat: false, camp: false, description: 'Révèle avec certitude la nature du piège sur un coffre.' },
  { id: 29, name: 'MANIFO', tier: 2, spellType: 'PRIEST', target: 'GROUP', hash: 2619, combat: true, camp: false, description: 'Paralyse et immobilise un groupe de créatures.' },
  { id: 30, name: 'MONTINO', tier: 2, spellType: 'PRIEST', target: 'GROUP', hash: 5970, combat: true, camp: false, description: 'Réduit un groupe ennemi au silence magique.' },
  // Priest Spells Tier 3 (31..34)
  { id: 31, name: 'LOMILWA', tier: 3, spellType: 'PRIEST', target: 'GENERIC', hash: 5333, combat: true, camp: true, description: 'Lumière divine permanente révélant le donjon pour toute l’expédition.' },
  { id: 32, name: 'DIALKO', tier: 3, spellType: 'PRIEST', target: 'PERSON', hash: 2718, combat: true, camp: true, description: 'Guérit la paralysie et réveille du sommeil.' },
  { id: 33, name: 'LATUMAPI', tier: 3, spellType: 'PRIEST', target: 'GENERIC', hash: 6491, combat: true, camp: false, description: 'Identifie tous les monstres en combat et révèle leurs vrais noms.' },
  { id: 34, name: 'BAMATU', tier: 3, spellType: 'PRIEST', target: 'GENERIC', hash: 5169, combat: true, camp: false, description: 'Prière de guerre diminuant la CA de l’équipe de 4.' },
  // Priest Spells Tier 4 (35..38)
  { id: 35, name: 'DIAL', tier: 4, spellType: 'PRIEST', target: 'PERSON', hash: 761, combat: true, camp: true, description: 'Restaure 2-16 points de vie.' },
  { id: 36, name: 'BADIAL', tier: 4, spellType: 'PRIEST', target: 'PERSON', hash: 1253, combat: true, camp: false, description: 'Frappe un adversaire pour 2-16 points de dégâts.' },
  { id: 37, name: 'LATUMOFI', tier: 4, spellType: 'PRIEST', target: 'PERSON', hash: 9463, combat: true, camp: true, description: 'Neutralise le poison d’un aventurier.' },
  { id: 38, name: 'MAPORFIC', tier: 4, spellType: 'PRIEST', target: 'GENERIC', hash: 4322, combat: true, camp: true, description: 'Protection divine globale (-2 AC permanent pendant l’exploration).' },
  // Priest Spells Tier 5 (39..44)
  { id: 39, name: 'DIALMA', tier: 5, spellType: 'PRIEST', target: 'PERSON', hash: 1614, combat: true, camp: true, description: 'Soins majeurs restaurant 3-24 points de vie.' },
  { id: 40, name: 'BADIALMA', tier: 5, spellType: 'PRIEST', target: 'PERSON', hash: 2446, combat: true, camp: false, description: 'Blessure grave infligeant 3-24 points de dégâts.' },
  { id: 41, name: 'LITOKAN', tier: 5, spellType: 'PRIEST', target: 'GROUP', hash: 4396, combat: true, camp: false, description: 'Pilier de feu sacré infligeant 3d8 dégâts à un groupe.' },
  { id: 42, name: 'KANDI', tier: 5, spellType: 'PRIEST', target: 'GENERIC', hash: 1185, combat: false, camp: true, description: 'Localise l’âme et les corps perdus dans le dédale.' },
  { id: 43, name: 'DI', tier: 5, spellType: 'PRIEST', target: 'PERSON', hash: 180, combat: false, camp: true, description: 'Ressuscite un mort (risque de cendres en cas d’échec).' },
  { id: 44, name: 'BADI', tier: 5, spellType: 'PRIEST', target: 'PERSON', hash: 382, combat: true, camp: false, description: 'Invocation de mort subite terrassant un ennemi.' },
  // Priest Spells Tier 6 (45..48)
  { id: 45, name: 'LORTO', tier: 6, spellType: 'PRIEST', target: 'GROUP', hash: 4296, combat: true, camp: false, description: 'Lames saintes infligeant 6d6 dégâts à un groupe.' },
  { id: 46, name: 'MADI', tier: 6, spellType: 'PRIEST', target: 'PERSON', hash: 547, combat: true, camp: true, description: 'Guérison totale (rend tous les PV et guérit toutes les afflictions).' },
  { id: 47, name: 'MABADI', tier: 6, spellType: 'PRIEST', target: 'PERSON', hash: 759, combat: true, camp: false, description: 'Réduit un monstre au seuil de la mort (ne lui laisse que 1-8 PV).' },
  { id: 48, name: 'LOKTOFEI', tier: 6, spellType: 'PRIEST', target: 'GENERIC', hash: 8330, combat: true, camp: false, description: 'Téléporte d’urgence toute l’équipe au château (perd tout l’or et équipement).' },
  // Priest Spells Tier 7 (49..50)
  { id: 49, name: 'MALIKTO', tier: 7, spellType: 'PRIEST', target: 'GENERIC', hash: 5514, combat: true, camp: false, description: 'Colère des cieux infligeant 12d6 dégâts à tous les monstres.' },
  { id: 50, name: 'KADORTO', tier: 7, spellType: 'PRIEST', target: 'PERSON', hash: 6673, combat: false, camp: true, description: 'Ressuscitation suprême d’un corps ou de cendres avec PV max.' }
];

// Tier, target and hash come from the scenario database; names/descriptions are kept above
export const SPELLS: TSpell[] = SPELL_TEXTS.map(sp => {
  const rec = PG_SPELL_TABLE[sp.id];
  return sp.id > 0 && rec ? { ...sp, hash: rec.hash, tier: rec.tier, target: rec.target } : sp;
});

// Official scenario data (SCENARIO.DATA of Wizardry I v3.2), see scripts/extract_pgmo.py
export const ITEMS_DATABASE: TItem[] = PG_ITEMS;

export const MONSTERS_DATABASE: TMonster[] = PG_MONSTERS;

/** Treasure tables referenced by monster reward1/reward2 */
export const REWARDS_DATABASE: TReward[] = PG_REWARDS;

/** Raw scenario message lines (SCENARIO.MESGS) */
export const SCENARIO_MESSAGES: PGMessage[] = PG_MESSAGES;

/** Returns the lines of the (multi-line) scenario message starting at index */
export function getScenarioMessage(index: number): string[] {
  const lines: string[] = [];
  for (let i = index; i >= 0 && i < PG_MESSAGES.length; i++) {
    lines.push(PG_MESSAGES[i].text);
    if (PG_MESSAGES[i].end) break;
  }
  return lines;
}

// Balanced Pre-built Level 1 Starter Party
export const DEFAULT_PARTY: TCharacter[] = [
  {
    id: 'char-1',
    name: 'ROLAND',
    race: 'HUMAN',
    class: 'FIGHTER',
    align: 'GOOD',
    status: 'OK',
    age: 18 * 52,
    attrib: { STRENGTH: 14, IQ: 8, PIETY: 6, VITALITY: 15, AGILITY: 12, LUCK: 10 },
    luckSkill: [16, 16, 16, 16, 16],
    gold: 150,
    exp: 0,
    maxLevel: 1,
    charLevel: 1,
    hpLeft: 12,
    hpMax: 12,
    spellsKnown: new Array(51).fill(false),
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    armorClass: 5, // Chain Mail + small shield
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 8, hpMinAdd: 1 },
    hitMod: 1,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 1 }, // Long Sword
      { equipped: true, cursed: false, identified: true, itemIndex: 11 }, // Chain Mail
      { equipped: true, cursed: false, identified: true, itemIndex: 7 } // Small Shield
    ]
  },
  {
    id: 'char-2',
    name: 'MUSASHI',
    race: 'HUMAN',
    class: 'SAMURAI',
    align: 'GOOD',
    status: 'OK',
    age: 19 * 52,
    attrib: { STRENGTH: 15, IQ: 11, PIETY: 10, VITALITY: 14, AGILITY: 11, LUCK: 9 },
    luckSkill: [15, 15, 15, 15, 15],
    gold: 120,
    exp: 0,
    maxLevel: 1,
    charLevel: 1,
    hpLeft: 14,
    hpMax: 14,
    spellsKnown: new Array(51).fill(false),
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    armorClass: 6,
    healPts: 0,
    critHit: true,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 8, hpMinAdd: 1 },
    hitMod: 1,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 1 }, // Long Sword
      { equipped: true, cursed: false, identified: true, itemIndex: 11 }  // Chain Mail
    ]
  },
  {
    id: 'char-3',
    name: 'THORIN',
    race: 'DWARF',
    class: 'PRIEST',
    align: 'GOOD',
    status: 'OK',
    age: 25 * 52,
    attrib: { STRENGTH: 11, IQ: 7, PIETY: 14, VITALITY: 12, AGILITY: 7, LUCK: 8 },
    luckSkill: [14, 14, 14, 14, 14],
    gold: 90,
    exp: 0,
    maxLevel: 1,
    charLevel: 1,
    hpLeft: 10,
    hpMax: 10,
    spellsKnown: (() => {
      const sp = new Array(51).fill(false);
      sp[23] = true; // Dios
      sp[24] = true; // Badios
      return sp;
    })(),
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 2, 0, 0, 0, 0, 0, 0], // 2 casts of Tier 1 per KEEPCHYN / SETSPELS
    armorClass: 6,
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 2, hpFac: 3, hpMinAdd: 1 },
    hitMod: 0,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 3 }, // Anointed Mace
      { equipped: true, cursed: false, identified: true, itemIndex: 11 }, // Chain Mail
      { equipped: true, cursed: false, identified: true, itemIndex: 7 } // Small Shield
    ]
  },
  {
    id: 'char-4',
    name: 'SHADOW',
    race: 'HOBBIT',
    class: 'THIEF',
    align: 'NEUTRAL',
    status: 'OK',
    age: 20 * 52,
    attrib: { STRENGTH: 7, IQ: 8, PIETY: 7, VITALITY: 8, AGILITY: 15, LUCK: 16 },
    luckSkill: [12, 12, 12, 12, 12],
    gold: 140,
    exp: 0,
    maxLevel: 1,
    charLevel: 1,
    hpLeft: 8,
    hpMax: 8,
    spellsKnown: new Array(51).fill(false),
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    armorClass: 7, // Leather Armor + Small shield
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 6, hpMinAdd: 1 },
    hitMod: 0,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 2 }, // Short sword
      { equipped: true, cursed: false, identified: true, itemIndex: 10 }, // Leather Armor
      { equipped: true, cursed: false, identified: true, itemIndex: 7 } // Small Shield
    ]
  },
  {
    id: 'char-5',
    name: 'ALISTAIR',
    race: 'ELF',
    class: 'MAGE',
    align: 'NEUTRAL',
    status: 'OK',
    age: 22 * 52,
    attrib: { STRENGTH: 7, IQ: 15, PIETY: 10, VITALITY: 7, AGILITY: 11, LUCK: 8 },
    luckSkill: [16, 16, 16, 16, 16],
    gold: 110,
    exp: 0,
    maxLevel: 1,
    charLevel: 1,
    hpLeft: 6,
    hpMax: 6,
    spellsKnown: (() => {
      const sp = new Array(51).fill(false);
      sp[1] = true; // Halito
      sp[3] = true; // Katino
      return sp;
    })(),
    mageSpells: [0, 2, 0, 0, 0, 0, 0, 0], // 2 casts of Tier 1 per KEEPCHYN / SETSPELS
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    armorClass: 9, // Robes
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 4, hpMinAdd: 1 },
    hitMod: 0,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 6 }, // Dagger
      { equipped: true, cursed: false, identified: true, itemIndex: 9 }  // Robes
    ]
  },
  {
    id: 'char-6',
    name: 'CEDRIC',
    race: 'GNOME',
    class: 'BISHOP',
    align: 'GOOD',
    status: 'OK',
    age: 24 * 52,
    attrib: { STRENGTH: 9, IQ: 13, PIETY: 13, VITALITY: 10, AGILITY: 10, LUCK: 9 },
    luckSkill: [15, 15, 15, 15, 15],
    gold: 95,
    exp: 0,
    maxLevel: 1,
    charLevel: 1,
    hpLeft: 8,
    hpMax: 8,
    spellsKnown: (() => {
      const sp = new Array(51).fill(false);
      sp[1] = true;  // Halito
      sp[3] = true;  // Katino
      return sp;
    })(),
    mageSpells: [0, 2, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 0, 0, 0, 0, 0, 0, 0], // Bishop unlocks Priest spells at level 4 (NWPRIEST(3, 4))
    armorClass: 8,
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 5, hpMinAdd: 0 },
    hitMod: 0,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 5 }, // Staff
      { equipped: true, cursed: false, identified: true, itemIndex: 10 }  // Leather Armor
    ]
  }
];

const WALL_CODES: TWall[] = ['OPEN', 'WALL', 'DOOR', 'HIDEDOOR'];

/**
 * Builds a maze floor (1..10) from the official scenario data.
 * Grids are indexed [x][y] where x is East and y is North (0..19).
 */
export function getMazeForFloor(level: number): TMazeFloor {
  const raw = PG_MAZES[Math.min(PG_MAZES.length, Math.max(1, level)) - 1];
  const walls = (cols: string[]): TWall[][] => cols.map(c => Array.from(c, ch => WALL_CODES[Number(ch)]));
  return {
    level: raw.level,
    w: walls(raw.w),
    s: walls(raw.s),
    e: walls(raw.e),
    n: walls(raw.n),
    fights: raw.fights.map(c => Array.from(c, Number)),
    sqrExtra: raw.sqrExtra.map(c => Array.from(c, ch => parseInt(ch, 16))),
    extraDefs: raw.extraDefs.map(d => ({ ...d })),
    enemyCalc: raw.enemyCalc.map(c => ({ ...c })),
    events: raw.events.map(ev => ({ ...ev }))
  };
}

export function generateLevel1Maze(): TMazeFloor {
  return getMazeForFloor(1);
}

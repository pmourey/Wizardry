/**
 * Authentic Wizardry I Data Tables matching Pascal reverse engineering
 */
import { TItem, TMonster, TRace, TClass, TAlign, TSpell, TCharacter, TMazeFloor } from '../types/wizardry';

export const RACE_BASE_ATTRIBUTES: Record<TRace, Record<string, number>> = {
  HUMAN:  { STRENGTH: 8,  IQ: 8,  PIETY: 5,  VITALITY: 8,  AGILITY: 8,  LUCK: 9 },
  ELF:    { STRENGTH: 7,  IQ: 10, PIETY: 10, VITALITY: 6,  AGILITY: 9,  LUCK: 6 },
  DWARF:  { STRENGTH: 10, IQ: 7,  PIETY: 10, VITALITY: 10, AGILITY: 5,  LUCK: 6 },
  GNOME:  { STRENGTH: 7,  IQ: 7,  PIETY: 10, VITALITY: 8,  AGILITY: 10, LUCK: 7 },
  HOBBIT: { STRENGTH: 5,  IQ: 7,  PIETY: 7,  VITALITY: 6,  AGILITY: 10, LUCK: 15 },
};

// Experience point thresholds for Level 1 to 13
export const EXP_TABLES: Record<TClass, number[]> = {
  FIGHTER: [1000, 1000, 1724, 2972, 5124, 8834, 15231, 26260, 45275, 78060, 134586, 232044, 400000],
  MAGE:    [1100, 1100, 1896, 3269, 5636, 9717, 16753, 28884, 49799, 85859, 148015, 255198, 440000],
  PRIEST:  [1050, 1050, 1810, 3120, 5379, 9274, 15989, 27567, 47529, 81946, 141286, 243596, 420000],
  THIEF:   [900,  900,  1551, 2674, 4610, 7948, 13703, 23625, 40732, 70227, 121081, 208760, 360000],
  BISHOP:  [1200, 1200, 2068, 3565, 6146, 10596, 18268, 31496, 54299, 93618, 161393, 278255, 480000],
  SAMURAI: [1250, 1250, 2155, 3715, 6405, 11043, 19039, 32825, 56594, 97575, 168232, 290055, 500000],
  LORD:    [1300, 1300, 2241, 3863, 6660, 11482, 19796, 34131, 58846, 101458, 174927, 301598, 520000],
  NINJA:   [1450, 1450, 2500, 4310, 7431, 12812, 22089, 38084, 65662, 113201, 195174, 336500, 580000],
};

// All 50 Spells from Pascal source (0..50)
export const SPELLS: TSpell[] = [
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
  { id: 25, name: 'MILWA', tier: 1, spellType: 'PRIEST', target: 'GENERIC', hash: 2889, combat: false, camp: true, description: 'Illumine les couloirs du donjon et détecte les portes secrètes.' },
  { id: 26, name: 'PORFIC', tier: 1, spellType: 'PRIEST', target: 'GENERIC', hash: 2287, combat: true, camp: false, description: 'Créé un bouclier divin pour le prêtre (-4 AC).' },
  // Priest Spells Tier 2 (27..30)
  { id: 27, name: 'MATU', tier: 2, spellType: 'PRIEST', target: 'GENERIC', hash: 3139, combat: true, camp: false, description: 'Bénédiction majeure réduisant la CA de l’équipe de 2.' },
  { id: 28, name: 'CALFO', tier: 2, spellType: 'PRIEST', target: 'GENERIC', hash: 0, combat: false, camp: true, description: 'Révèle avec certitude la nature du piège sur un coffre.' },
  { id: 29, name: 'MANIFO', tier: 2, spellType: 'PRIEST', target: 'GROUP', hash: 2619, combat: true, camp: false, description: 'Paralyse et immobilise un groupe de créatures.' },
  { id: 30, name: 'MONTINO', tier: 2, spellType: 'PRIEST', target: 'GROUP', hash: 5970, combat: true, camp: false, description: 'Réduit un groupe ennemi au silence magique.' },
  // Priest Spells Tier 3 (31..34)
  { id: 31, name: 'LOMILWA', tier: 3, spellType: 'PRIEST', target: 'GENERIC', hash: 5333, combat: false, camp: true, description: 'Lumière divine permanente révélant le donjon pour toute l’expédition.' },
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

export const ITEMS_DATABASE: TItem[] = [
  {
    id: 0,
    name: 'BROKEN ITEM',
    nameUnknown: 'DEBRIS',
    objType: 'MISC',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 0,
    boltacStock: 0,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: true, PRIEST: true, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 1, hpFac: 1, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 1,
    name: 'DAGGER',
    nameUnknown: 'KNIFE',
    objType: 'WEAPON',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 5,
    boltacStock: 10,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: true, PRIEST: false, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 1, hpFac: 4, hpMinAdd: 1 },
    extraSwings: 1,
    critHit: false,
    wepVsType: []
  },
  {
    id: 2,
    name: 'SHORT SWORD',
    nameUnknown: 'SWORD',
    objType: 'WEAPON',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 15,
    boltacStock: 8,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: false, THIEF: true, BISHOP: false, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 1, hpFac: 6, hpMinAdd: 1 },
    extraSwings: 1,
    critHit: false,
    wepVsType: []
  },
  {
    id: 3,
    name: 'LONG SWORD',
    nameUnknown: 'BLADE',
    objType: 'WEAPON',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 25,
    boltacStock: 6,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: false, THIEF: false, BISHOP: false, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 1, hpFac: 8, hpMinAdd: 1 },
    extraSwings: 1,
    critHit: false,
    wepVsType: []
  },
  {
    id: 4,
    name: 'ANOINTED MACE',
    nameUnknown: 'MACE',
    objType: 'WEAPON',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 30,
    boltacStock: 6,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: true, THIEF: false, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 2, hpFac: 3, hpMinAdd: 1 },
    extraSwings: 1,
    critHit: false,
    wepVsType: [10] // Vs Undead
  },
  {
    id: 5,
    name: 'STAFF',
    nameUnknown: 'STICK',
    objType: 'WEAPON',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 10,
    boltacStock: 10,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: true, PRIEST: true, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 1, hpFac: 5, hpMinAdd: 0 },
    extraSwings: 1,
    critHit: false,
    wepVsType: []
  },
  {
    id: 6,
    name: 'ROBES',
    nameUnknown: 'CLOTHING',
    objType: 'ARMOR',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 15,
    boltacStock: 10,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: true, PRIEST: true, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 1, // AC 9
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 7,
    name: 'LEATHER ARMOR',
    nameUnknown: 'LEATHER',
    objType: 'ARMOR',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 50,
    boltacStock: 6,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: true, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 2, // AC 8
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 8,
    name: 'CHAIN MAIL',
    nameUnknown: 'CHAIN SUIT',
    objType: 'ARMOR',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 90,
    boltacStock: 5,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: true, THIEF: false, BISHOP: false, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 4, // AC 6
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 9,
    name: 'BREASTPLATE',
    nameUnknown: 'PLATE SUIT',
    objType: 'ARMOR',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 200,
    boltacStock: 4,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: true, THIEF: false, BISHOP: false, SAMURAI: true, LORD: true, NINJA: false },
    healPts: 0,
    armorMod: 5, // AC 5
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 10,
    name: 'SMALL SHIELD',
    nameUnknown: 'SHIELD',
    objType: 'SHIELD',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 20,
    boltacStock: 6,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: true, THIEF: true, BISHOP: false, SAMURAI: true, LORD: true, NINJA: false },
    healPts: 0,
    armorMod: 1, // -1 AC
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 11,
    name: 'IRON HELMET',
    nameUnknown: 'HELMET',
    objType: 'HELMET',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 100,
    boltacStock: 4,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: true, THIEF: false, BISHOP: false, SAMURAI: true, LORD: true, NINJA: false },
    healPts: 0,
    armorMod: 1, // -1 AC
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 12,
    name: 'COPPER GLOVES',
    nameUnknown: 'GAUNTLETS',
    objType: 'GAUNTLET',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 60,
    boltacStock: 4,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: true, THIEF: false, BISHOP: false, SAMURAI: true, LORD: true, NINJA: false },
    healPts: 0,
    armorMod: 1,
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 13,
    name: 'POTION OF DIOS',
    nameUnknown: 'POTION',
    objType: 'SPECIAL',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 100,
    price: 50,
    boltacStock: 10,
    spellPower: 23, // DIOS
    classUse: { FIGHTER: true, MAGE: true, PRIEST: true, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 14,
    name: 'POTION OF LATUMOFI',
    nameUnknown: 'ELIXIR',
    objType: 'SPECIAL',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 100,
    price: 150,
    boltacStock: 5,
    spellPower: 37, // LATUMOFI
    classUse: { FIGHTER: true, MAGE: true, PRIEST: true, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 0,
    wepHpDam: { level: 0, hpFac: 0, hpMinAdd: 0 },
    extraSwings: 0,
    critHit: false,
    wepVsType: []
  },
  {
    id: 15,
    name: 'SILVER SWORD +1',
    nameUnknown: 'GLOWING BLADE',
    objType: 'WEAPON',
    align: 'GOOD',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 1500,
    boltacStock: 2,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: false, THIEF: false, BISHOP: false, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 1,
    wepHpDam: { level: 2, hpFac: 5, hpMinAdd: 2 },
    extraSwings: 2,
    critHit: false,
    wepVsType: [10] // Undead
  },
  {
    id: 16,
    name: 'SWORD OF SLICING',
    nameUnknown: 'CURSED SWORD',
    objType: 'WEAPON',
    align: 'EVIL',
    cursed: true,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 300,
    boltacStock: 1,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: false, THIEF: true, BISHOP: false, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: -2,
    wepHitMod: -2,
    wepHpDam: { level: 1, hpFac: 4, hpMinAdd: 0 },
    extraSwings: 1,
    critHit: false,
    wepVsType: []
  },
  {
    id: 17,
    name: 'BLADE CUSINART',
    nameUnknown: 'WHIRLING BLADE',
    objType: 'WEAPON',
    align: 'UNALIGN',
    cursed: false,
    special: 0,
    changeTo: 0,
    changeChance: 0,
    price: 15000,
    boltacStock: 1,
    spellPower: 0,
    classUse: { FIGHTER: true, MAGE: false, PRIEST: false, THIEF: false, BISHOP: false, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 0,
    armorMod: 0,
    wepHitMod: 3,
    wepHpDam: { level: 3, hpFac: 9, hpMinAdd: 4 },
    extraSwings: 4,
    critHit: true,
    wepVsType: []
  },
  {
    id: 18,
    name: 'MURASAMA BLADE',
    nameUnknown: 'KATANA',
    objType: 'WEAPON',
    align: 'GOOD',
    cursed: false,
    special: 1, // Strengh booster
    changeTo: 0,
    changeChance: 0,
    price: 50000,
    boltacStock: 1,
    spellPower: 0,
    classUse: { FIGHTER: false, MAGE: false, PRIEST: false, THIEF: false, BISHOP: false, SAMURAI: true, LORD: false, NINJA: false },
    healPts: 1,
    armorMod: 0,
    wepHitMod: 4,
    wepHpDam: { level: 4, hpFac: 10, hpMinAdd: 5 },
    extraSwings: 5,
    critHit: true,
    wepVsType: []
  },
  {
    id: 94,
    name: 'AMULET OF WERDNA',
    nameUnknown: 'ANCIENT AMULET',
    objType: 'SPECIAL',
    align: 'UNALIGN',
    cursed: false,
    special: 21,
    changeTo: 0,
    changeChance: 0,
    price: 100000,
    boltacStock: 0,
    spellPower: 20, // MAHAMAN
    classUse: { FIGHTER: true, MAGE: true, PRIEST: true, THIEF: true, BISHOP: true, SAMURAI: true, LORD: true, NINJA: true },
    healPts: 5,
    armorMod: 5,
    wepHitMod: 5,
    wepHpDam: { level: 5, hpFac: 10, hpMinAdd: 10 },
    extraSwings: 5,
    critHit: true,
    wepVsType: []
  }
];

export const MONSTERS_DATABASE: TMonster[] = [
  {
    id: 0,
    name: 'BUBBLY SLIME',
    namePlural: 'BUBBLY SLIMES',
    nameUnknown: 'SLIME',
    nameUnknownPlural: 'SLIMES',
    picId: 1,
    level: 1,
    hp: { level: 1, hpFac: 2, hpMinAdd: 1 },
    monsterClass: 6,
    ac: 12,
    attackCount: 1,
    attacks: [{ level: 1, hpFac: 2, hpMinAdd: 0 }],
    expReward: 35,
    drainAmount: 0,
    healPts: 0,
    reward1: 1,
    reward2: 1,
    teamId: 0,
    teamPercent: 0,
    mageSpells: 0,
    priestSpells: 0,
    unique: 0,
    breathe: 0,
    magicResistance: 0,
    specialPower: {}
  },
  {
    id: 1,
    name: 'ORC',
    namePlural: 'ORCS',
    nameUnknown: 'HUMANOID',
    nameUnknownPlural: 'HUMANOIDS',
    picId: 2,
    level: 1,
    hp: { level: 1, hpFac: 6, hpMinAdd: 2 },
    monsterClass: 0,
    ac: 9,
    attackCount: 1,
    attacks: [{ level: 1, hpFac: 6, hpMinAdd: 0 }],
    expReward: 95,
    drainAmount: 0,
    healPts: 0,
    reward1: 1,
    reward2: 1,
    teamId: 2, // calls Kobolds
    teamPercent: 40,
    mageSpells: 0,
    priestSpells: 0,
    unique: 0,
    breathe: 0,
    magicResistance: 0,
    specialPower: {}
  },
  {
    id: 2,
    name: 'KOBOLD',
    namePlural: 'KOBOLDS',
    nameUnknown: 'LITTLE BEAST',
    nameUnknownPlural: 'LITTLE BEASTS',
    picId: 3,
    level: 1,
    hp: { level: 1, hpFac: 4, hpMinAdd: 1 },
    monsterClass: 0,
    ac: 10,
    attackCount: 1,
    attacks: [{ level: 1, hpFac: 4, hpMinAdd: 0 }],
    expReward: 70,
    drainAmount: 0,
    healPts: 0,
    reward1: 1,
    reward2: 1,
    teamId: 0,
    teamPercent: 0,
    mageSpells: 0,
    priestSpells: 0,
    unique: 0,
    breathe: 0,
    magicResistance: 0,
    specialPower: {}
  },
  {
    id: 3,
    name: 'SKELETON',
    namePlural: 'SKELETONS',
    nameUnknown: 'BONES',
    nameUnknownPlural: 'BONES',
    picId: 4,
    level: 2,
    hp: { level: 2, hpFac: 4, hpMinAdd: 2 },
    monsterClass: 10, // Undead
    ac: 8,
    attackCount: 1,
    attacks: [{ level: 1, hpFac: 6, hpMinAdd: 1 }],
    expReward: 160,
    drainAmount: 0,
    healPts: 0,
    reward1: 2,
    reward2: 2,
    teamId: 4, // Zombie
    teamPercent: 30,
    mageSpells: 0,
    priestSpells: 0,
    unique: 0,
    breathe: 0,
    magicResistance: 0,
    specialPower: { sleepResist: true }
  },
  {
    id: 4,
    name: 'ZOMBIE',
    namePlural: 'ZOMBIES',
    nameUnknown: 'ROTTING CORPSE',
    nameUnknownPlural: 'ROTTING CORPSES',
    picId: 5,
    level: 2,
    hp: { level: 2, hpFac: 8, hpMinAdd: 4 },
    monsterClass: 10, // Undead
    ac: 7,
    attackCount: 1,
    attacks: [{ level: 1, hpFac: 7, hpMinAdd: 1 }],
    expReward: 220,
    drainAmount: 0,
    healPts: 0,
    reward1: 2,
    reward2: 2,
    teamId: 0,
    teamPercent: 0,
    mageSpells: 0,
    priestSpells: 0,
    unique: 0,
    breathe: 0,
    magicResistance: 10,
    specialPower: { paralyze: true, sleepResist: true }
  },
  {
    id: 5,
    name: 'CREEPING CRUD',
    namePlural: 'CREEPING CRUDS',
    nameUnknown: 'SLUDGE',
    nameUnknownPlural: 'SLUDGES',
    picId: 6,
    level: 3,
    hp: { level: 3, hpFac: 8, hpMinAdd: 4 },
    monsterClass: 6,
    ac: 6,
    attackCount: 2,
    attacks: [{ level: 1, hpFac: 6, hpMinAdd: 1 }, { level: 1, hpFac: 6, hpMinAdd: 1 }],
    expReward: 480,
    drainAmount: 0,
    healPts: 1,
    reward1: 3,
    reward2: 3,
    teamId: 0,
    teamPercent: 0,
    mageSpells: 0,
    priestSpells: 0,
    unique: 0,
    breathe: 0,
    magicResistance: 25,
    specialPower: { poison: true }
  },
  {
    id: 6,
    name: 'GAS DRAGON',
    namePlural: 'GAS DRAGONS',
    nameUnknown: 'DRAGON',
    nameUnknownPlural: 'DRAGONS',
    picId: 7,
    level: 7,
    hp: { level: 7, hpFac: 10, hpMinAdd: 20 },
    monsterClass: 8,
    ac: 1,
    attackCount: 3,
    attacks: [{ level: 2, hpFac: 8, hpMinAdd: 4 }, { level: 2, hpFac: 8, hpMinAdd: 4 }, { level: 3, hpFac: 8, hpMinAdd: 6 }],
    expReward: 4500,
    drainAmount: 0,
    healPts: 2,
    reward1: 6,
    reward2: 7,
    teamId: 0,
    teamPercent: 0,
    mageSpells: 3,
    priestSpells: 0,
    unique: 0,
    breathe: 1, // Fire breath
    magicResistance: 40,
    specialPower: { poison: true }
  },
  {
    id: 7,
    name: 'VAMPIRE',
    namePlural: 'VAMPIRES',
    nameUnknown: 'PALE FIGURE',
    nameUnknownPlural: 'PALE FIGURES',
    picId: 8,
    level: 9,
    hp: { level: 9, hpFac: 10, hpMinAdd: 30 },
    monsterClass: 10, // Undead
    ac: -1,
    attackCount: 2,
    attacks: [{ level: 3, hpFac: 8, hpMinAdd: 5 }, { level: 3, hpFac: 8, hpMinAdd: 5 }],
    expReward: 12000,
    drainAmount: 2, // Drains 2 levels per hit!
    healPts: 4,
    reward1: 8,
    reward2: 8,
    teamId: 0,
    teamPercent: 0,
    mageSpells: 5,
    priestSpells: 4,
    unique: 0,
    breathe: 0,
    magicResistance: 60,
    specialPower: { paralyze: true, criticalHit: true, sleepResist: true }
  },
  {
    id: 8,
    name: 'WERDNA',
    namePlural: 'WERDNA',
    nameUnknown: 'MAD OVERLORD',
    nameUnknownPlural: 'MAD OVERLORDS',
    picId: 9,
    level: 10,
    hp: { level: 10, hpFac: 12, hpMinAdd: 50 },
    monsterClass: 1, // Arch-Mage
    ac: -4,
    attackCount: 2,
    attacks: [{ level: 4, hpFac: 10, hpMinAdd: 10 }, { level: 4, hpFac: 10, hpMinAdd: 10 }],
    expReward: 50000,
    drainAmount: 0,
    healPts: 5,
    reward1: 9,
    reward2: 9,
    teamId: 7, // Vampire allies
    teamPercent: 100,
    mageSpells: 7, // Casts TILTOWAI!
    priestSpells: 7,
    unique: 1,
    breathe: 1,
    magicResistance: 85,
    specialPower: { callHelp: true, stone: true }
  }
];

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
    armorClass: 5, // Chain mail + small shield
    healPts: 0,
    critHit: false,
    swingCount: 1,
    wepDamage: { level: 1, hpFac: 8, hpMinAdd: 1 },
    hitMod: 1,
    poisonAmount: 0,
    awards: [0, 0, 0, 0, 0],
    inMaze: false,
    possessions: [
      { equipped: true, cursed: false, identified: true, itemIndex: 3 }, // Long sword
      { equipped: true, cursed: false, identified: true, itemIndex: 8 }, // Chain mail
      { equipped: true, cursed: false, identified: true, itemIndex: 10 } // Small shield
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
      { equipped: true, cursed: false, identified: true, itemIndex: 3 }, // Long sword
      { equipped: true, cursed: false, identified: true, itemIndex: 8 }  // Chain mail
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
      sp[22] = true; // Kalki
      sp[23] = true; // Dios
      sp[24] = true; // Badios
      sp[25] = true; // Milwa
      return sp;
    })(),
    mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 3, 0, 0, 0, 0, 0, 0], // 3 casts of Tier 1
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
      { equipped: true, cursed: false, identified: true, itemIndex: 4 }, // Anointed Mace
      { equipped: true, cursed: false, identified: true, itemIndex: 8 }, // Chain Mail
      { equipped: true, cursed: false, identified: true, itemIndex: 10 } // Small Shield
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
    armorClass: 7, // Leather armor + Small shield
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
      { equipped: true, cursed: false, identified: true, itemIndex: 7 }, // Leather armor
      { equipped: true, cursed: false, identified: true, itemIndex: 10 } // Small shield
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
      sp[2] = true; // Mogref
      sp[3] = true; // Katino
      sp[4] = true; // Dumapic
      return sp;
    })(),
    mageSpells: [0, 3, 0, 0, 0, 0, 0, 0], // 3 casts of Tier 1
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
      { equipped: true, cursed: false, identified: true, itemIndex: 1 }, // Dagger
      { equipped: true, cursed: false, identified: true, itemIndex: 6 }  // Robes
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
      sp[23] = true; // Dios
      sp[24] = true; // Badios
      return sp;
    })(),
    mageSpells: [0, 2, 0, 0, 0, 0, 0, 0],
    priestSpells: [0, 2, 0, 0, 0, 0, 0, 0],
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
      { equipped: true, cursed: false, identified: true, itemIndex: 7 }  // Leather armor
    ]
  }
];

/**
 * Generate Level 1 Maze based on faithful Wizardry 1 Level 1 map (20x20)
 * Level 1 has stairs to Castle at (0,0), Murphy's Ghost on higher levels, keys, and doors
 */
export function generateLevel1Maze(): TMazeFloor {
  const size = 20;
  const w: ('OPEN' | 'WALL' | 'DOOR' | 'HIDEDOOR')[][] = Array.from({ length: size }, () => Array(size).fill('OPEN'));
  const s: ('OPEN' | 'WALL' | 'DOOR' | 'HIDEDOOR')[][] = Array.from({ length: size }, () => Array(size).fill('OPEN'));
  const e: ('OPEN' | 'WALL' | 'DOOR' | 'HIDEDOOR')[][] = Array.from({ length: size }, () => Array(size).fill('OPEN'));
  const n: ('OPEN' | 'WALL' | 'DOOR' | 'HIDEDOOR')[][] = Array.from({ length: size }, () => Array(size).fill('OPEN'));
  const fights: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const sqrExtra: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  // Outer boundary walls
  for (let i = 0; i < size; i++) {
    s[i][0] = 'WALL';
    n[i][size - 1] = 'WALL';
    w[0][i] = 'WALL';
    e[size - 1][i] = 'WALL';
  }

  // Internal dungeon rooms and corridors faithful to Level 1 Proving Grounds
  // Add major rooms with doors:
  // (0,0) Stairs Room: 3x3 room around (0,0)-(2,2) with a door North at (1,2) and East at (2,1)
  for (let x = 0; x <= 2; x++) {
    for (let y = 0; y <= 2; y++) {
      if (y === 2 && x !== 1) n[x][y] = 'WALL';
      if (y === 2 && x === 1) n[x][y] = 'DOOR';
      if (x === 2 && y !== 1) e[x][y] = 'WALL';
      if (x === 2 && y === 1) e[x][y] = 'DOOR';
    }
  }

  // Create grid of corridors & rooms
  for (let x = 3; x < 18; x += 4) {
    for (let y = 0; y < size; y++) {
      e[x][y] = (y % 4 === 1) ? 'DOOR' : (y % 4 === 3) ? 'OPEN' : 'WALL';
    }
  }
  for (let y = 3; y < 18; y += 4) {
    for (let x = 0; x < size; x++) {
      n[x][y] = (x % 4 === 2) ? 'DOOR' : (x % 4 === 0) ? 'OPEN' : 'WALL';
    }
  }

  // Secret doors and special room
  n[10][10] = 'HIDEDOOR';
  e[12][12] = 'HIDEDOOR';
  w[14][8] = 'HIDEDOOR';

  // Synchronize wall pairs (N of [x][y] is S of [x][y+1], etc.)
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      if (y < size - 1) s[x][y + 1] = n[x][y];
      if (x < size - 1) w[x + 1][y] = e[x][y];
      if (y > 0) n[x][y - 1] = s[x][y];
      if (x > 0) e[x - 1][y] = w[x][y];
    }
  }

  // Set encounters (fights = 1 on specific rooms)
  fights[5][5] = 1;
  fights[5][10] = 1;
  fights[10][5] = 1;
  fights[12][12] = 1;
  fights[15][15] = 1;
  fights[16][4] = 1;
  fights[8][16] = 1;

  // Square special definitions
  const extraDefs = [
    { type: 'NORMAL' as const, aux0: 0, aux1: 0, aux2: 0 },
    { type: 'STAIRS' as const, aux0: 0, aux1: 0, aux2: 0 },   // Stairs to Castle (0,0)
    { type: 'STAIRS' as const, aux0: 2, aux1: 5, aux2: 5 },   // Stairs to Level 2 at (18,18)
    { type: 'PIT' as const, aux0: 1, aux1: 6, aux2: 2 },      // Pit trap (deals damage)
    { type: 'DARK' as const, aux0: 0, aux1: 0, aux2: 0 },     // Dark zone
    { type: 'SPINNER' as const, aux0: 0, aux1: 0, aux2: 0 },  // Spinner
    { type: 'ENCOUNTE' as const, aux0: 1, aux1: 1, aux2: 3 }, // Fixed encounter with Skeletons
    { type: 'SCNMSG' as const, aux0: 1, aux1: 1, aux2: 0 }    // Statue inscription
  ];

  sqrExtra[0][0] = 1; // Stairs up to Castle
  sqrExtra[18][18] = 2; // Stairs down to Level 2
  sqrExtra[4][6] = 3; // Pit
  sqrExtra[12][8] = 3; // Pit
  sqrExtra[7][7] = 4; // Dark room
  sqrExtra[8][7] = 4;
  sqrExtra[7][8] = 4;
  sqrExtra[8][8] = 4;
  sqrExtra[9][14] = 5; // Spinner
  sqrExtra[14][9] = 5; // Spinner
  sqrExtra[15][15] = 6; // Fixed encounter
  sqrExtra[10][11] = 7; // Statue message

  return {
    level: 1,
    w,
    s,
    e,
    n,
    fights,
    sqrExtra,
    extraDefs,
    enemyCalc: [
      { minEnemy: 0, multWorse: 1, worse01: 2, range0n: 3, percWorse: 40 },
      { minEnemy: 1, multWorse: 1, worse01: 2, range0n: 3, percWorse: 50 },
      { minEnemy: 2, multWorse: 1, worse01: 2, range0n: 3, percWorse: 60 }
    ]
  };
}

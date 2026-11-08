/* eslint-disable */
/**
 * SCENARIO & FLOOR STRATEGY GUIDES REGISTRY
 * Handcrafted & data-extracted tactical walkthroughs, bestiary counters,
 * puzzle solutions, and guidance levels for all 13 Wizardry scenarios.
 */

export type HintLevel = 'OFF' | 'SUBTLE' | 'STRATEGY' | 'EXHAUSTIVE';

export interface HintLevelMeta {
  level: HintLevel;
  titleFr: string;
  titleEn: string;
  badgeFr: string;
  badgeEn: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  colorClass: string;
}

export const HINT_LEVELS: Record<HintLevel, HintLevelMeta> = {
  OFF: {
    level: 'OFF',
    titleFr: 'Désactivé (Puriste)',
    titleEn: 'Disabled (Purist)',
    badgeFr: 'Hardcore 1981',
    badgeEn: 'Hardcore 1981',
    taglineFr: 'Aucune aide ou indice, immersion rétro brute.',
    taglineEn: 'No assistance or clues, raw 1981 retro challenge.',
    descriptionFr: 'Pour les vétérans souhaitant cartographier le labyrinthe à la main sans aucun conseil tactique ni alerte spontanée.',
    descriptionEn: 'For veteran dungeon crawlers who prefer manual grid-paper mapping without any spoilers, tactical alerts or hints.',
    colorClass: 'border-slate-700 bg-slate-900/60 text-slate-300'
  },
  SUBTLE: {
    level: 'SUBTLE',
    titleFr: 'Subtil & Ambiance',
    titleEn: 'Subtle & Atmospheric',
    badgeFr: 'Indices Discrets',
    badgeEn: 'Subtle Clues',
    taglineFr: 'Murmures prophétiques et avertissements de danger.',
    taglineEn: 'Prophetic whispers and major hazard warnings.',
    descriptionFr: "L'Oracle vous souffle de courts indices mystiques lors de l'arrivée à un nouvel étage et vous prévient à l'approche des fosses ou téléporteurs mortels.",
    descriptionEn: 'The Oracle whispers cryptic environmental clues upon entering each floor and subtly warns of lethal pits or teleporters.',
    colorClass: 'border-sky-600/50 bg-sky-950/40 text-sky-300'
  },
  STRATEGY: {
    level: 'STRATEGY',
    titleFr: 'Stratégique (Recommandé)',
    titleEn: 'Strategic (Recommended)',
    badgeFr: 'Tactique Recommandée',
    badgeEn: 'Tactical (Default)',
    taglineFr: "Objectifs d'étage, faiblesses des monstres et sorts clés.",
    taglineEn: 'Floor missions, bestiary counters, and key spell advice.',
    descriptionFr: "Idéal pour progresser sans frustration : aperçu des points cardinaux de l'étage, sorts de contre prioritaires (Montino, Katino...) et conseils d'entraînement.",
    descriptionEn: 'Optimal balance of mystery and strategy: floor objectives, monster counter-tactics, key spell preparations, and squad composition advice.',
    colorClass: 'border-amber-500/70 bg-amber-950/40 text-amber-300'
  },
  EXHAUSTIVE: {
    level: 'EXHAUSTIVE',
    titleFr: 'Guide Complet (Oracle)',
    titleEn: 'Exhaustive (Oracle)',
    badgeFr: 'Soluce Intégrale',
    badgeEn: 'Full Walkthrough',
    taglineFr: "Coordonnées exactes, solutions d'énigmes et coffres.",
    taglineEn: 'Exact coordinates, puzzle steps, and chest locations.',
    descriptionFr: "Accès exhaustif aux coordonnées des escaliers, ascenseurs, clés secrètes, téléporteurs et déclencheurs d'événements pour ne jamais rester bloqué.",
    descriptionEn: 'Unlocks exact coordinates for all stairs, elevators, hidden doors, event triggers, and complete step-by-step puzzle solutions.',
    colorClass: 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300'
  }
};

export interface FloorKeyLocation {
  x: number;
  y: number;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  type: 'STAIRS' | 'ELEVATOR' | 'KEY_ITEM' | 'BOSS' | 'TELEPORTER' | 'FOUNTAIN' | 'SECRET' | 'SAFE_ZONE' | 'WARNING';
}

export interface FloorHazard {
  nameFr: string;
  nameEn: string;
  warningFr: string;
  warningEn: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FloorMonsterTip {
  monsterName: string;
  threatFr: string;
  threatEn: string;
  counterStrategyFr: string;
  counterStrategyEn: string;
}

export interface FloorGuide {
  floor: number;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  recommendedLevelFr: string;
  recommendedLevelEn: string;
  summaryFr: string;
  summaryEn: string;
  subtleClueFr: string;
  subtleClueEn: string;
  objectivesFr: string[];
  objectivesEn: string[];
  strategicTipsFr: string[];
  strategicTipsEn: string[];
  hazards: FloorHazard[];
  keyLocations: FloorKeyLocation[];
  monsterTips?: FloorMonsterTip[];
  spellRecommendationsFr?: string[];
  spellRecommendationsEn?: string[];
}

export interface ScenarioGuide {
  scenarioId: string;
  scenarioTitle: string;
  generalStrategyFr: string[];
  generalStrategyEn: string[];
  floors: Record<number, FloorGuide>;
}

// ============================================================================
// --- SCENARIO 1 : PROVING GROUNDS OF THE MAD OVERLORD ---
// ============================================================================
const PROVING_GROUNDS_GUIDES: Record<number, FloorGuide> = {
  1: {
    floor: 1,
    titleFr: 'Sous-sol 1 : Vestibule du Labyrinthe & Épreuve des Clés',
    titleEn: 'Floor 1: Maze Antechamber & Key Trials',
    subtitleFr: "Zone d'entraînement, statue de Murphy et accès à l'ascenseur",
    subtitleEn: "Training grounds, Murphy's Ghost statue and elevator access",
    recommendedLevelFr: 'Niveau 1 à 3',
    recommendedLevelEn: 'Level 1 to 3',
    summaryFr: "Le premier niveau sert de banc d'essai pour votre escouade. Votre mission est de localiser la Clé de Bronze et la Clé d'Argent, tout en débloquant l'ascenseur reliant les 4 premiers étages.",
    summaryEn: 'The first floor serves as a proving ground for new adventurers. Your goal is to secure the Bronze and Silver Keys while unlocking the 4-floor elevator shaft.',
    subtleClueFr: 'Deux clés de métal scellent la voie des profondeurs... Écoutez le chant spectral près des dalles de marbre.',
    subtleClueEn: 'Two metal keys seal the passage downwards... Listen closely for ghostly whispers by the marble statues.',
    objectivesFr: [
      "Explorer prudemment le secteur nord-ouest et s'entraîner sur les Kobolds et Orques.",
      "Trouver la Clé de Bronze dans la chambre de la statue d'onyx en (13, 3).",
      "Trouver la Clé d'Argent dans la chambre de la statue de sanglier en (13, 18).",
      "Découvrir la cage d'ascenseur 1-4 en (10, 8) pour faciliter les allers-retours vers le Château.",
      "S'entraîner contre le Fantôme de Murphy en (13, 5) pour engranger de l'XP rapide."
    ],
    objectivesEn: [
      'Cautiously explore the northwest sector, gaining XP on Kobolds and Orcs.',
      'Acquire the Bronze Key in the onyx cat-chicken chamber at (13, 3).',
      'Acquire the Silver Key in the horned boar chamber at (13, 18).',
      'Discover the 4-floor elevator at (10, 8) to secure quick trips to the Castle.',
      "Farm Murphy's Ghost at (13, 5) for safe, massive early-game experience."
    ],
    strategicTipsFr: [
      "Ne vous aventurez pas dans le secteur est avant d'avoir atteint le niveau 2 ou 3 avec au moins 15-20 PV par combattant.",
      "Le Fantôme de Murphy (13, 5) ne lance aucun sort offensif ! Il ne fait que frapper au corps-à-corps et a une CA basse. Endormez-le avec Katino ou usez-le au corps-à-corps pour obtenir ~4500 XP par combat.",
      "Le sort Dumapic (Mage niv. 1) vous donne vos coordonnées exactes : utilisez-le systématiquement si vous perdez le nord.",
      "Les couloirs sans issue mènent parfois à des portes dérobées dissimulées dans les murs en brique."
    ],
    strategicTipsEn: [
      'Do not venture into the eastern wing until your party reaches Level 2-3 with at least 15-20 HP per warrior.',
      "Murphy's Ghost (13, 5) casts no offensive spells! He only relies on physical attacks and has high defense. Use Katino (Sleep) and wear him down for ~4,500 XP per fight.",
      'Dumapic (Mage Tier 1) displays your exact coordinates: cast it anytime you feel disoriented.',
      'Dead ends often conceal secret doors hidden in the stone masonry.'
    ],
    hazards: [
      {
        nameFr: "Chambre d'expulsion magique (9, 19)",
        nameEn: 'Repulsion chamber (9, 19)',
        warningFr: "Un magicien de Trebor crie MAPIRO MAHAMA DIROMAT et renvoie instantanément l'escouade au Château.",
        warningEn: "Trebor's wizard casts Mapiro Mahama Diromat, instantly teleporting the party back to the Castle.",
        severity: 'LOW'
      },
      {
        nameFr: 'Corridor des Ténèbres (Col. 9-10)',
        nameEn: 'Darkness Corridors (Col. 9-10)',
        warningFr: "Zones d'obscurité totale où la torche Milwa et la mini-carte s'éteignent.",
        warningEn: 'Total darkness zones where Milwa torches and mini-map guidance are extinguished.',
        severity: 'MEDIUM'
      }
    ],
    keyLocations: [
      { x: 0, y: 0, nameFr: 'Escalier vers le Château', nameEn: 'Stairs to Castle', descriptionFr: 'Sortie de secours immédiate vers la ville et la taverne.', descriptionEn: 'Immediate exit back to the surface town and inn.', type: 'STAIRS' },
      { x: 0, y: 10, nameFr: 'Escalier vers le Sous-sol 2', nameEn: 'Stairs down to Floor 2', descriptionFr: 'Descente directe vers les galeries du 2e étage.', descriptionEn: 'Direct passage down to the second level.', type: 'STAIRS' },
      { x: 10, y: 8, nameFr: 'Ascenseur Principal (Étages 1 à 4)', nameEn: 'Main Elevator (Floors 1-4)', descriptionFr: 'Boutons 1 à 4 permettant de sauter directement les étages.', descriptionEn: 'Buttons 1 to 4 allowing fast travel across the upper maze.', type: 'ELEVATOR' },
      { x: 13, y: 3, nameFr: 'Statue de Bronze (Clé de Bronze)', nameEn: 'Bronze Statue (Bronze Key)', descriptionFr: 'Coffret renfermant la Clé de Bronze (#97).', descriptionEn: 'Chamber holding the Bronze Key (#97).', type: 'KEY_ITEM' },
      { x: 13, y: 18, nameFr: "Statue d'Argent (Clé d'Argent)", nameEn: 'Silver Statue (Silver Key)', descriptionFr: "Coffret renfermant la Clé d'Argent (#98).", descriptionEn: 'Chamber holding the Silver Key (#98).', type: 'KEY_ITEM' },
      { x: 13, y: 5, nameFr: 'Autel du Fantôme de Murphy', nameEn: "Murphy's Ghost Altar", descriptionFr: "Encounter farmable à l'infini pour monter rapidement en niveau.", descriptionEn: 'Infinitely repeatable encounter for rapid level grinding.', type: 'BOSS' },
      { x: 5, y: 9, nameFr: 'Téléporteur de détresse', nameEn: 'Emergency Teleporter', descriptionFr: "Téléporte l'escouade en (15, 4).", descriptionEn: 'Teleports party to (15, 4).', type: 'TELEPORTER' }
    ],
    monsterTips: [
      {
        monsterName: "Murphy's Ghost (#77)",
        threatFr: 'CA très basse, beaucoup de PV, mais ne lance aucun sort destructeur.',
        threatEn: 'Very low AC and hefty HP, but lacks dangerous spells.',
        counterStrategyFr: 'Endormez-le avec Katino ou frappez sans relâche. Sorts Manofo et Dilto recommandés.',
        counterStrategyEn: 'Put him to sleep with Katino or strike relentlessly. Dilto and Manofo lower his evasion.'
      },
      {
        monsterName: 'Buring Bush & Gasping Dragon',
        threatFr: 'Attaques de souffle de feu touchant toute la ligne de front.',
        threatEn: 'Fire breath attacks hitting the whole front row.',
        counterStrategyFr: 'Éliminez-les en priorité absolue dès le premier tour avec Halito ou attaques groupées.',
        counterStrategyEn: 'Focus fire immediately on round 1 using Halito and heavy frontliner swings.'
      }
    ],
    spellRecommendationsFr: ['Dumapic (Localisation)', 'Katino (Sommeil)', 'Dios (Soins légers)', 'Milwa (Lumière)'],
    spellRecommendationsEn: ['Dumapic (Coordinates)', 'Katino (Sleep)', 'Dios (Light heal)', 'Milwa (Light torch)']
  },
  2: {
    floor: 2,
    titleFr: 'Sous-sol 2 : Portes Verrouillées & Statuettes Animales',
    titleEn: 'Floor 2: Locked Portals & Animal Statuettes',
    subtitleFr: "Épreuves de la Grenouille, de l'Ours et recherche de la Clé d'Or",
    subtitleEn: 'Frog & Bear trials, Gold Key retrieval and creeping traps',
    recommendedLevelFr: 'Niveau 3 à 5',
    recommendedLevelEn: 'Level 3 to 5',
    summaryFr: "Ce niveau exige l'usage des clés de bronze et d'argent obtenues à l'étage 1 pour franchir des brumes enchantées. Vous devez y récupérer les statuettes de l'Ours et de la Grenouille, ainsi que la précieuse Clé d'Or.",
    summaryEn: 'This level requires the bronze and silver keys from Floor 1 to pass enchanted barrier mists. You must retrieve the Bear and Frog statuettes, as well as the coveted Gold Key.',
    subtleClueFr: "Deux bêtes d'airain et de bronze gardent le secret des portes dorées... Méfiez-vous des pièces d'or qui grouillent sous les dalles.",
    subtleClueEn: 'Two brass beasts guard the secret to the golden doors... Beware the creeping coins that skitter across the stone.',
    objectivesFr: [
      'Utiliser la Clé de Bronze en (8, 7) pour dissiper la fumée de bronze.',
      "Utiliser la Clé d'Argent en (8, 12) pour dissiper le brouillard démoniaque.",
      "Obtenir la Statuette de l'Ours en (9, 18).",
      'Obtenir la Statuette de la Grenouille en (12, 4).',
      "Obtenir la Clé d'Or en (4, 16) au fond des corridors ténébreux.",
      "Éviter la fosse piégée en (12, 11) et trouver l'escalier vers le Sous-sol 3 en (16, 15)."
    ],
    objectivesEn: [
      'Use the Bronze Key at (8, 7) to dispel the bronze smoke.',
      'Use the Silver Key at (8, 12) to dispel the terrifying fog.',
      'Acquire the Bear Statuette at (9, 18).',
      'Acquire the Frog Statuette at (12, 4).',
      'Acquire the Gold Key at (4, 16) deep in the dark maze.',
      'Avoid the pit trap at (12, 11) and reach the stairs to Floor 3 at (16, 15).'
    ],
    strategicTipsFr: [
      'Attention aux Creeping Coins (Pièces Rampantes) ! Leurs souffles peuvent décimer un groupe de niveau 3 en un seul tour. Lancez Katino (Sommeil) immédiatement : elles ont une vulnérabilité totale au sommeil.',
      "Les Statuettes et la Clé d'Or sont indispensables pour débloquer les niveaux 3 et 4.",
      "Gardez toujours la Clé de Bronze et la Clé d'Argent dans l'inventaire d'un aventurier vivant."
    ],
    strategicTipsEn: [
      'Beware Creeping Coins! Their breath attacks can wipe a level 3 party in one round. Cast Katino (Sleep) immediately; they have virtually no resistance to sleep.',
      'The statuettes and Gold Key are vital quest items required to advance on Floors 3 and 4.',
      'Keep quest keys in the inventory of your hardiest living adventurer.'
    ],
    hazards: [
      {
        nameFr: 'Fosse piégée (12, 11)',
        nameEn: 'Pit trap (12, 11)',
        warningFr: "Inflige 2d8 dégâts physiques à toute l'escouade en cas de faux pas.",
        warningEn: 'Deals 2d8 physical damage across the party when stepped on.',
        severity: 'HIGH'
      },
      {
        nameFr: "Vaste zone d'obscurité (secteur ouest)",
        nameEn: 'Darkness sector (west quadrant)',
        warningFr: "Le sort Milwa s'annule. Repérez vos pas à l'aide de Dumapic.",
        warningEn: 'Milwa light spell is snuffed out. Use Dumapic to track coordinates.',
        severity: 'MEDIUM'
      }
    ],
    keyLocations: [
      { x: 12, y: 7, nameFr: 'Escalier vers le Sous-sol 1', nameEn: 'Stairs up to Floor 1', descriptionFr: 'Remontée vers le premier niveau.', descriptionEn: 'Ascent back to Floor 1.', type: 'STAIRS' },
      { x: 16, y: 15, nameFr: 'Escalier vers le Sous-sol 3', nameEn: 'Stairs down to Floor 3', descriptionFr: 'Descente vers le dédale du 3e niveau.', descriptionEn: 'Descent to Floor 3.', type: 'STAIRS' },
      { x: 10, y: 8, nameFr: 'Ascenseur Principal (Étages 1 à 4)', nameEn: 'Main Elevator (Floors 1-4)', descriptionFr: "Arrêt de l'ascenseur au 2e étage.", descriptionEn: 'Elevator stop on Floor 2.', type: 'ELEVATOR' },
      { x: 8, y: 7, nameFr: 'Porte de Fumée de Bronze', nameEn: 'Bronze Smoke Door', descriptionFr: 'Exige la Clé de Bronze (#97) pour passer.', descriptionEn: 'Requires Bronze Key (#97) to pass.', type: 'WARNING' },
      { x: 8, y: 12, nameFr: "Porte de Brouillard d'Argent", nameEn: 'Silver Fog Door', descriptionFr: "Exige la Clé d'Argent (#98) pour passer.", descriptionEn: 'Requires Silver Key (#98) to pass.', type: 'WARNING' },
      { x: 9, y: 18, nameFr: "Piédestal de l'Ours (Statuette Ours)", nameEn: 'Bear Pedestal (Bear Statuette)', descriptionFr: 'Objet de quête Statuette/Ours (#95).', descriptionEn: 'Bear Statuette quest item (#95).', type: 'KEY_ITEM' },
      { x: 12, y: 4, nameFr: 'Disque de la Grenouille (Statuette Grenouille)', nameEn: 'Frog Disk (Frog Statuette)', descriptionFr: 'Objet de quête Statuette/Grenouille (#96).', descriptionEn: 'Frog Statuette quest item (#96).', type: 'KEY_ITEM' },
      { x: 4, y: 16, nameFr: "Chambre de la Clé d'Or", nameEn: 'Gold Key Chamber', descriptionFr: "Objet de quête Clé d'Or (#99).", descriptionEn: 'Gold Key quest item (#99).', type: 'KEY_ITEM' }
    ],
    monsterTips: [
      {
        monsterName: 'Creeping Coin (#8)',
        threatFr: 'Souffle collectif de flammes dévastateur pour les héros débutants.',
        threatEn: 'Collective flame breath capable of wiping low-level parties.',
        counterStrategyFr: 'Lancez Katino (Sommeil) immédiatement.',
        counterStrategyEn: 'Cast Katino (Sleep) right away.'
      },
      {
        monsterName: 'Zombie & Ghoul (#12..14)',
        threatFr: 'Coups paralysants qui clouent vos héros au sol.',
        threatEn: 'Paralysis-inducing claws that incapacitate your frontliners.',
        counterStrategyFr: 'Exorcisez-les avec le pouvoir de Renvoi des Prêtres (Banish/Dispel) ou sort Badios.',
        counterStrategyEn: 'Use Priest Dispel/Turn Undead or cast Badios/Mahalito.'
      }
    ],
    spellRecommendationsFr: ['Katino (Sommeil absolu)', 'Mahalito (Boule de feu)', 'Dial (Soins moyens)', 'Latumofis (Guérison poison)'],
    spellRecommendationsEn: ['Katino (Crucial sleep)', 'Mahalito (Fireball)', 'Dial (Mid heal)', 'Latumofis (Cure poison)']
  },
  3: {
    floor: 3,
    titleFr: 'Sous-sol 3 : Dédale des Tourbillons & Couloirs Illusoires',
    titleEn: 'Floor 3: Spinners Maze & Deceptive Corridors',
    subtitleFr: 'Fosses sournoises, mages de niveau 5 et désorientation',
    subtitleEn: 'Subtle pits, level 5 enemy mages and disorienting tiles',
    recommendedLevelFr: 'Niveau 5 à 7',
    recommendedLevelEn: 'Level 5 to 7',
    summaryFr: 'Le 3e niveau est célèbre pour ses plaques de rotation (Spinners) qui désorientent le groupe sans avertissement visuel, et ses fosses causant 3d8 dégâts. Progressez avec vigilance.',
    summaryEn: 'Floor 3 is notorious for its silent spinners that scramble your heading without warning, coupled with multiple 3d8 pit traps. Tread carefully.',
    subtleClueFr: 'Le sol tourne sous vos bottes sans bruit... Les murs vous mentent, vérifiez toujours les étoiles par la magie de Dumapic.',
    subtleClueEn: 'The cobblestones pivot soundlessly beneath your tread... Cast Dumapic often to dispel the illusions.',
    objectivesFr: [
      "Rejoindre l'ascenseur en (10, 8) pour sécuriser un accès rapide.",
      'Contrecarrer les plaques tournantes (0, 3), (0, 19), (10, 19), (15, 3).',
      'Éviter les 4 fosses piégées infligeant 3d8 dégâts.',
      'Vaincre les Mages de Niveau 5 en (13, 17).',
      "Atteindre l'escalier vers le Sous-sol 4 en (1, 8)."
    ],
    objectivesEn: [
      'Reach the elevator at (10, 8) to maintain fast castle access.',
      'Counter the hidden spinners at (0, 3), (0, 19), (10, 19), (15, 3).',
      'Sidestep the 4 pit traps dealing 3d8 damage each.',
      'Defeat the hostile Level 5 Mages at (13, 17).',
      'Locate the stairs down to Floor 4 at (1, 8).'
    ],
    strategicTipsFr: [
      "Après avoir franchi une plaque tournante, la boussole est faussée ! Lancez toujours Dumapic pour rétablir votre cap avant d'avancer.",
      'Les Mages ennemis utilisent Mahalito (feu de groupe). Utilisez Montino pour les réduire au silence au tour 1.',
      'Pensez à faire soigner vos héros blessés avant de franchir des portes menant à des combats fixes.'
    ],
    strategicTipsEn: [
      'After crossing a spinner tile, your facing direction is randomized! Always cast Dumapic to reorient before moving.',
      'Enemy Mages cast Mahalito. Prioritize Montino (Silence) on round 1 to neutralize their spellcasting.',
      'Heal up wounded heroes before opening doors with mandatory encounter squares.'
    ],
    hazards: [
      {
        nameFr: 'Tourbillons invisibles (Spinners)',
        nameEn: 'Invisible Spinners',
        warningFr: "Plaques pivotant aléatoirement la direction de l'escouade en (0,3), (0,19), (10,19), (15,3).",
        warningEn: 'Tiles randomizing party facing direction at (0,3), (0,19), (10,19), (15,3).',
        severity: 'MEDIUM'
      },
      {
        nameFr: 'Fosses multiples (3d8 dégâts)',
        nameEn: 'Multiple Pits (3d8 damage)',
        warningFr: 'Fosses situées en (0,7), (0,11), (5,11), (5,19), (15,19).',
        warningEn: 'Pit traps situated at (0,7), (0,11), (5,11), (5,19), (15,19).',
        severity: 'HIGH'
      }
    ],
    keyLocations: [
      { x: 15, y: 11, nameFr: 'Escalier vers le Sous-sol 2', nameEn: 'Stairs up to Floor 2', descriptionFr: 'Remontée vers le 2e niveau.', descriptionEn: 'Ascent to Floor 2.', type: 'STAIRS' },
      { x: 1, y: 8, nameFr: 'Escalier vers le Sous-sol 4', nameEn: 'Stairs down to Floor 4', descriptionFr: 'Descente vers le Centre de Contrôle.', descriptionEn: 'Descent to Control Center on Floor 4.', type: 'STAIRS' },
      { x: 10, y: 8, nameFr: 'Ascenseur Principal (Étages 1 à 4)', nameEn: 'Main Elevator (Floors 1-4)', descriptionFr: 'Arrêt ascenseur 3e étage.', descriptionEn: 'Floor 3 elevator stop.', type: 'ELEVATOR' },
      { x: 13, y: 17, nameFr: 'Garnison des Mages de Niveau 5', nameEn: 'Level 5 Mages Barracks', descriptionFr: 'Combat obligatoire contre des magiciens hostiles.', descriptionEn: 'Mandatory combat against hostile mages.', type: 'BOSS' }
    ],
    monsterTips: [
      {
        monsterName: 'Level 5 Mage (#40)',
        threatFr: "Mahalito et Molito capables de carboniser l'arrière-garde.",
        threatEn: 'Mahalito and Molito flame spells targeting your back row.',
        counterStrategyFr: "Montino (Silence) est votre meilleure arme. Frapper vite au premier tour.",
        counterStrategyEn: 'Montino (Silence) shuts them down completely. Take them out swiftly.'
      }
    ],
    spellRecommendationsFr: ['Dumapic (Orientation)', 'Montino (Silence de zone)', 'Mahalito', 'Dialko (Anti-paralysie)'],
    spellRecommendationsEn: ['Dumapic (Reorientation)', 'Montino (Area silence)', 'Mahalito', 'Dialko (Cure paralysis)']
  },
  4: {
    floor: 4,
    titleFr: 'Sous-sol 4 : Centre de Contrôle & Le Ruban Bleu',
    titleEn: 'Floor 4: Testing Grounds Control Center & The Blue Ribbon',
    subtitleFr: "Centre d'attribution des monstres et clé d'accès au grand ascenseur 4-9",
    subtitleEn: 'Monster Allocation Center and access key to the deep elevator 4-9',
    recommendedLevelFr: 'Niveau 7 à 9',
    recommendedLevelEn: 'Level 7 to 9',
    summaryFr: "Étage charnière du jeu ! Vous devez y infiltrer le Centre d'Attribution des Monstres, vaincre les Guerriers de Niveau 7 et obtenir le précieux Ruban Bleu qui déverrouille l'ascenseur privé des niveaux 4 à 9.",
    summaryEn: 'Crucial mid-game milestone! You must penetrate the Monster Allocation Center, vanquish the Level 7 Fighters, and claim the Blue Ribbon to access the private 4-9 elevator.',
    subtleClueFr: "Une cloche d'alarme retentit dans les profondeurs... Seuls les porteurs du ruban d'azur pourront commander la machinerie des abysses.",
    subtleClueEn: 'An alarm bell clangs across the lower corridors... Only bearers of the azure ribbon may operate the deep elevator machinery.',
    objectivesFr: [
      "Utiliser la Clé d'Or en (3, 10) pour accéder au quartier du Trésor.",
      'Pénétrer dans le Centre de Contrôle en (10, 14).',
      "Déclencher l'alarme en (10, 15) et repousser les patrouilles.",
      "Nettoyer le Centre d'Attribution des Monstres et vaincre les Guerriers de Niveau 7 en (11, 12)-(12, 14).",
      'Récupérer le RUBAN BLEU en (11, 10) auprès de la voix de Trebor.',
      "Accéder à l'Ascenseur Privé (Étages 4 à 9) en (10, 0) grâce au Ruban Bleu."
    ],
    objectivesEn: [
      'Use the Gold Key at (3, 10) to access the treasure wing.',
      'Breach the Testing Grounds Control Center at (10, 14).',
      'Trigger the security alarm at (10, 15) and survive monster waves.',
      'Clear the Monster Allocation Center and defeat Level 7 Fighters at (11, 12)-(12, 14).',
      "Claim the BLUE RIBBON at (11, 10) from Trebor's disembodied voice.",
      'Access the Deep Private Elevator (Floors 4-9) at (10, 0) using the Blue Ribbon.'
    ],
    strategicTipsFr: [
      "Sans le Ruban Bleu, tenter d'entrer dans l'ascenseur privé en (10, 1) assommera tout votre groupe et vous renverra en arrière !",
      "Les Guerriers de Niveau 7 frappent fort au corps-à-corps. Baissez votre CA avec Porfic et Bamborc, et employez Dalto ou Lahalito.",
      "Une fois le Ruban Bleu acquis, vous pouvez descendre directement au Sous-sol 9 via l'ascenseur privé en (10, 0) !"
    ],
    strategicTipsEn: [
      'Without the Blue Ribbon, approaching the private elevator door at (10, 1) knocks out the entire party!',
      'Level 7 Fighters deliver heavy physical hits. Boost your defenses with Porfic/Bamborc and blast them with Lahalito or Dalto.',
      'With the Blue Ribbon secured, you can take the private elevator at (10, 0) straight down to Floor 9!'
    ],
    hazards: [
      {
        nameFr: 'Porte de sécurité assommante (10, 1)',
        nameEn: 'Security lockout door (10, 1)',
        warningFr: "Assomme tout le groupe et inflige des dégâts si vous n'avez pas le Ruban Bleu.",
        warningEn: 'Knocks out the entire party if you attempt to enter without the Blue Ribbon.',
        severity: 'CRITICAL'
      },
      {
        nameFr: "Alarme d'intrusion (10, 15)",
        nameEn: 'Intrusion alarm bell (10, 15)',
        warningFr: "Fait retentir une cloche d'alarme attirant de dangereux gardiens.",
        warningEn: 'Rings a piercing alarm bell summoning aggressive dungeon guardians.',
        severity: 'HIGH'
      }
    ],
    keyLocations: [
      { x: 10, y: 18, nameFr: 'Escalier vers le Sous-sol 3', nameEn: 'Stairs up to Floor 3', descriptionFr: 'Remontée vers le 3e niveau.', descriptionEn: 'Ascent to Floor 3.', type: 'STAIRS' },
      { x: 17, y: 7, nameFr: 'Escalier vers le Sous-sol 5', nameEn: 'Stairs down to Floor 5', descriptionFr: 'Descente pédestre vers le 5e niveau.', descriptionEn: 'Walking stairs to Floor 5.', type: 'STAIRS' },
      { x: 10, y: 8, nameFr: 'Ascenseur Principal (Étages 1 à 4)', nameEn: 'Main Elevator (Floors 1-4)', descriptionFr: "Terminus de l'ascenseur supérieur.", descriptionEn: 'Terminus of the upper elevator.', type: 'ELEVATOR' },
      { x: 10, y: 0, nameFr: 'Ascenseur Privé (Étages 4 à 9)', nameEn: 'Private Deep Elevator (Floors 4-9)', descriptionFr: 'Ascenseur express vers les abysses (Ruban Bleu requis).', descriptionEn: 'Express elevator to the deep floors (Blue Ribbon required).', type: 'ELEVATOR' },
      { x: 3, y: 10, nameFr: "Porte Verrouillée d'Or", nameEn: 'Gold Locked Door', descriptionFr: "Exige la Clé d'Or (#99).", descriptionEn: 'Requires Gold Key (#99).', type: 'WARNING' },
      { x: 11, y: 10, nameFr: "Chambre d'Audience de Trebor (Ruban Bleu)", nameEn: "Trebor's Audience Room (Blue Ribbon)", descriptionFr: 'Délivre le précieux Ruban Bleu (#100).', descriptionEn: 'Awards quest item Blue Ribbon (#100).', type: 'KEY_ITEM' }
    ],
    monsterTips: [
      {
        monsterName: 'Level 7 Fighter (#100)',
        threatFr: 'Attaques multiples à gros dégâts physiques et grande résistance.',
        threatEn: 'Multiple heavy-hitting physical strikes and high fortitude.',
        counterStrategyFr: 'Baissez votre CA avec Porfic et Matu. Frapper avec Lahalito, Dalto ou Badios.',
        counterStrategyEn: 'Lower your AC with Porfic and Matu. Strike them down with Lahalito, Dalto or Badios.'
      }
    ],
    spellRecommendationsFr: ['Lahalito (Tempête de flammes)', 'Dalto (Blizzard)', 'Bamborc / Porfic (Bouclier CA)', 'Madi (Soin total)'],
    spellRecommendationsEn: ['Lahalito (Flame storm)', 'Dalto (Blizzard)', 'Bamborc / Porfic (AC shields)', 'Madi (Full heal)']
  },
  5: {
    floor: 5,
    titleFr: 'Sous-sol 5 : Le Grand Vide Anti-Magie',
    titleEn: 'Floor 5: The Great Anti-Magic Void',
    subtitleFr: "Zone d'extinction des sorts, ténèbres et couloirs piégés",
    subtitleEn: 'Spell fizzle void, darkness grid and trapped corridors',
    recommendedLevelFr: 'Niveau 9 à 11',
    recommendedLevelEn: 'Level 9 to 11',
    summaryFr: "Le 5e niveau abrite une immense zone d'extinction magique (Fizzle Zone). À l'intérieur de cette zone, AUCUN sort ne peut être lancé ! Vos guerriers doivent mener le combat seuls.",
    summaryEn: 'Floor 5 features a vast Anti-Magic Fizzle Zone. Inside this zone, NO spells may be cast! Your warriors and physical fighters must carry the battle.',
    subtleClueFr: "Le silence magique engloutit vos incantations... Confiez votre survie à l'acier de vos lames.",
    subtleClueEn: 'Magical silence swallows your incantations... Entrust your survival to cold tempered steel.',
    objectivesFr: [
      "Rejoindre l'Ascenseur Privé 4-9 en (10, 0).",
      'Reconnaître les limites de la Zone Anti-Magie centrale (Colonnes 10 à 16, Lignes 7 à 12).',
      "Ne jamais s'engager dans la zone anti-magie avec des héros blessés ou empoisonnés.",
      "Atteindre l'escalier vers le Sous-sol 6 en (8, 8)."
    ],
    objectivesEn: [
      'Access the Private Elevator 4-9 at (10, 0).',
      'Identify boundaries of the central Anti-Magic Zone (Cols 10-16, Rows 7-12).',
      'Never enter the anti-magic void while heroes are poisoned or critical.',
      'Reach the stairs down to Floor 6 at (8, 8).'
    ],
    strategicTipsFr: [
      'Dans la zone Fizzle, vous ne pouvez pas vous soigner avec Dios/Madi ni vous repérer avec Dumapic !',
      "Équipez vos combattants des meilleures armes trouvées chez Boltac ou dans les coffres (Épée Longue +2, Cimeterre d'Argent).",
      'Sortez immédiatement de la zone si un héros est empoisonné pour lancer Latumofis à l’extérieur.'
    ],
    strategicTipsEn: [
      'Inside the Fizzle zone, healing (Dios/Madi) and reorientation (Dumapic) are blocked!',
      'Ensure your frontliners wield your best enchanted weapons (Long Sword +2, Silver Scimitar).',
      'Step outside the void immediately if an ally gets poisoned to cast Latumofis.'
    ],
    hazards: [
      {
        nameFr: 'Zone Anti-Magie Majeure (10..16, 7..12)',
        nameEn: 'Major Anti-Magic Void (10..16, 7..12)',
        warningFr: "Extinction totale de la magie. Aucun sort de soin ou d'attaque possible.",
        warningEn: 'Complete spell cancellation. No healing or offensive spells function.',
        severity: 'CRITICAL'
      }
    ],
    keyLocations: [
      { x: 0, y: 0, nameFr: 'Escalier vers le Sous-sol 4', nameEn: 'Stairs up to Floor 4', descriptionFr: 'Remontée vers le 4e niveau.', descriptionEn: 'Ascent to Floor 4.', type: 'STAIRS' },
      { x: 8, y: 8, nameFr: 'Escalier vers le Sous-sol 6', nameEn: 'Stairs down to Floor 6', descriptionFr: 'Descente vers le 6e niveau.', descriptionEn: 'Descent to Floor 6.', type: 'STAIRS' },
      { x: 10, y: 0, nameFr: 'Ascenseur Privé (Étages 4 à 9)', nameEn: 'Private Deep Elevator (Floors 4-9)', descriptionFr: "Arrêt de l'ascenseur rapide.", descriptionEn: 'Rapid elevator stop.', type: 'ELEVATOR' }
    ],
    monsterTips: [
      {
        monsterName: 'Gargoyle & Frost Giant',
        threatFr: 'Gros sacs de PV insensibles aux coups faibles.',
        threatEn: 'High HP tanks resilient against weak melee strikes.',
        counterStrategyFr: 'Concentrez toutes les attaques physiques sur un ennemi à la fois.',
        counterStrategyEn: 'Focus all physical swings on one target at a time.'
      }
    ],
    spellRecommendationsFr: ['Latumofis (Poison)', 'Madi (Soin total)', 'Dialko', 'Lahalito'],
    spellRecommendationsEn: ['Latumofis (Poison)', 'Madi (Full heal)', 'Dialko', 'Lahalito']
  },
  6: {
    floor: 6,
    titleFr: 'Sous-sol 6 : Crypte des Âmes Perdues',
    titleEn: 'Floor 6: Crypt of Lost Souls',
    subtitleFr: 'Tourbillons multiples, spectres et fosses profondes',
    subtitleEn: 'Twin spinners, wraiths and deep stone pitfalls',
    recommendedLevelFr: 'Niveau 10 à 12',
    recommendedLevelEn: 'Level 10 to 12',
    summaryFr: 'Le 6e niveau est une crypte sombre où errent spectres et démons mineurs. Les tourbillons et fosses exigent une attention constante.',
    summaryEn: 'Floor 6 is a gloom-ridden crypt populated by wraiths and lesser demons. Spinners and pits require constant positional vigilance.',
    subtleClueFr: "Le froissement des ailes de pierre résonne au loin... Prenez garde aux fosses béantes cachées dans l'ombre.",
    subtleClueEn: 'The rustle of stone wings echoes in the dark... Beware yawning pits hidden in the shadows.',
    objectivesFr: [
      'Maintenir la localisation par Dumapic après chaque tourbillon.',
      'Contrecarrer les attaques drainantes des Spectres avec le Renvoi des Prêtres.',
      "Atteindre l'escalier vers le Sous-sol 7 en (19, 0)."
    ],
    objectivesEn: [
      'Maintain coordinates via Dumapic after every spinner tile.',
      'Counter draining spectres using Priest Turn Undead.',
      'Reach the stairs to Floor 7 at (19, 0).'
    ],
    hazards: [
      {
        nameFr: 'Fosse abyssale en (8, 18)',
        nameEn: 'Abyssal pit at (8, 18)',
        warningFr: 'Inflige 6d8 dégâts.',
        warningEn: 'Deals 6d8 damage.',
        severity: 'HIGH'
      }
    ],
    keyLocations: [
      { x: 8, y: 8, nameFr: 'Escalier vers le Sous-sol 5', nameEn: 'Stairs up to Floor 5', descriptionFr: 'Remontée vers le 5e niveau.', descriptionEn: 'Ascent to Floor 5.', type: 'STAIRS' },
      { x: 19, y: 0, nameFr: 'Escalier vers le Sous-sol 7', nameEn: 'Stairs down to Floor 7', descriptionFr: 'Descente vers le 7e niveau.', descriptionEn: 'Descent to Floor 7.', type: 'STAIRS' },
      { x: 0, y: 10, nameFr: 'Ascenseur Privé (Étages 4 à 9)', nameEn: 'Private Elevator (Floors 4-9)', descriptionFr: "Arrêt de l'ascenseur rapide.", descriptionEn: 'Elevator access point.', type: 'ELEVATOR' }
    ],
    monsterTips: [
      {
        monsterName: 'Wraith & Shade',
        threatFr: 'Drain de niveau permanent en cas de coup réussi !',
        threatEn: 'Permanent level drain upon a successful hit!',
        counterStrategyFr: 'Renvoi des morts-vivants (Dispel) par le Prêtre/Évêque ou Tiltowait/Zilwan.',
        counterStrategyEn: 'Use Priest/Bishop Dispel or cast Tiltowait/Zilwan immediately.'
      }
    ],
    spellRecommendationsFr: ['Zilwan (Destruction mort-vivant)', 'Madi', 'Tiltowait', 'Montino'],
    spellRecommendationsEn: ['Zilwan (Destroy undead)', 'Madi', 'Tiltowait', 'Montino']
  },
  7: {
    floor: 7,
    titleFr: 'Sous-sol 7 : Labyrinthe Téléporteur des Mages',
    titleEn: "Floor 7: Mages' Teleportation Gauntlet",
    subtitleFr: 'Grilles de téléportation croisées et monstres de feu',
    subtitleEn: 'Interconnected teleportation matrix and fire elementals',
    recommendedLevelFr: 'Niveau 11 à 13',
    recommendedLevelEn: 'Level 11 to 13',
    summaryFr: 'Ce niveau est truffé de téléporteurs instantanés vous déplaçant à travers les quadrants. La cartographie précise est la seule issue.',
    summaryEn: 'This floor is riddled with instant teleport traps jumping your party across quadrants. Precise coordinate tracking is essential.',
    subtleClueFr: "L'espace se déchire à chaque carrefour... Ne croyez pas vos yeux, croyez vos coordonnées.",
    subtleClueEn: 'Space bends at every crossroads... Trust not your eyes, trust only your coordinates.',
    objectivesFr: [
      'Noter les téléporteurs un par un pour ne pas tourner en rond.',
      "Utiliser l'ascenseur 4-9 pour sécuriser le ravitaillement.",
      "Localiser l'escalier menant au Sous-sol 8."
    ],
    objectivesEn: [
      'Map each teleporter carefully to prevent endless looping.',
      'Use elevator 4-9 for regular supply runs.',
      'Locate the stairs leading down to Floor 8.'
    ],
    hazards: [
      {
        nameFr: 'Téléporteurs en boucle',
        nameEn: 'Looping teleporters',
        warningFr: 'Plusieurs dalles renvoient au point de départ.',
        warningEn: 'Several tiles loop back to the origin point.',
        severity: 'MEDIUM'
      }
    ],
    keyLocations: [
      { x: 0, y: 10, nameFr: 'Ascenseur Privé (Étages 4 à 9)', nameEn: 'Private Elevator (Floors 4-9)', descriptionFr: 'Accès ascenseur.', descriptionEn: 'Elevator access.', type: 'ELEVATOR' }
    ],
    monsterTips: [
      {
        monsterName: 'Fire Giant & Chimera',
        threatFr: 'Dégâts de zone massifs et forte résistance magique.',
        threatEn: 'Massive area damage and high magic resistance.',
        counterStrategyFr: 'Dalto (Blizzard) et frappes ciblées des Guerriers/Samouraïs.',
        counterStrategyEn: 'Cast Dalto (Ice blizzard) and focus heavy weapon strikes.'
      }
    ],
    spellRecommendationsFr: ['Dumapic', 'Dalto', 'Madi', 'Badios'],
    spellRecommendationsEn: ['Dumapic', 'Dalto', 'Madi', 'Badios']
  },
  8: {
    floor: 8,
    titleFr: "Sous-sol 8 : L'Enclave des Démons Majeurs",
    titleEn: 'Floor 8: Greater Demon Enclave',
    subtitleFr: 'Combats brutaux, résistance magique et préparation finale',
    subtitleEn: 'High-level fiends, magic resistance and endgame gear prep',
    recommendedLevelFr: 'Niveau 12 à 14',
    recommendedLevelEn: 'Level 12 to 14',
    summaryFr: "Avant-dernier palier de l'ascenseur, le Sous-sol 8 abrite des adversaires redoutables. C'est la zone idéale pour équiper vos héros avec le butin des coffres de haut rang (Muramasa Blade, Shuriken, Lord's Garb).",
    summaryEn: "Penultimate elevator stop, Floor 8 houses lethal fiends. This is the prime farming floor for high-tier loot (Muramasa Blade, Shuriken, Lord's Garb).",
    subtleClueFr: "L'odeur du soufre s'intensifie... Les trésors les plus légendaires dorment dans ces couloirs sanglants.",
    subtleClueEn: 'The stench of brimstone grows thick... Legendary artifacts rest in these bloodstained corridors.',
    objectivesFr: [
      'S’équiper en armes magiques de niveau 7+ dans les coffres.',
      'Faire monter le Mage au niveau 13 pour débloquer Tiltowait (sort suprême).',
      'Faire monter le Prêtre au niveau 13 pour débloquer Madi et Malikto.',
      'Se préparer à la descente finale vers les Sous-sols 9 et 10.'
    ],
    objectivesEn: [
      'Equip tier 7+ magical weapons from chest drops.',
      'Level Mage to 13 to unlock Tiltowait (ultimate damage spell).',
      'Level Priest to 13 to unlock Madi and Malikto.',
      'Prepare for the final descent into Floors 9 and 10.'
    ],
    hazards: [
      {
        nameFr: 'Démons majeurs invocateurs',
        nameEn: 'Summoning Greater Demons',
        warningFr: "Les démons peuvent invoquer d'autres démons en boucle.",
        warningEn: 'Greater Demons can summon reinforcements in an endless chain.',
        severity: 'HIGH'
      }
    ],
    keyLocations: [
      { x: 0, y: 10, nameFr: 'Ascenseur Privé (Étages 4 à 9)', nameEn: 'Private Elevator (Floors 4-9)', descriptionFr: 'Accès ascenseur 8e étage.', descriptionEn: 'Floor 8 elevator access.', type: 'ELEVATOR' }
    ],
    monsterTips: [
      {
        monsterName: 'Greater Demon (#93)',
        threatFr: 'Sorts de feu, paralysie, et invocation de renforts continus.',
        threatEn: 'Fire spells, paralysis strikes, and continuous summoning.',
        counterStrategyFr: 'Montino immédiat pour bloquer ses sorts, puis Tiltowait ou Malikto.',
        counterStrategyEn: 'Montino round 1 to silence spells, followed by Tiltowait or Malikto.'
      }
    ],
    spellRecommendationsFr: ['Tiltowait (Nucléaire)', 'Malikto', 'Madi (Soin total)', 'Montino'],
    spellRecommendationsEn: ['Tiltowait (Nuclear burst)', 'Malikto', 'Madi (Full heal)', 'Montino']
  },
  9: {
    floor: 9,
    titleFr: 'Sous-sol 9 : Antichambre du Destin & La Chute Finale',
    titleEn: 'Floor 9: Antechamber of Fate & The Final Chute',
    subtitleFr: "Terminus de l'ascenseur et toboggan sans retour vers l'étage 10",
    subtitleEn: 'Elevator terminus and one-way chute down to Floor 10',
    recommendedLevelFr: 'Niveau 13 à 15',
    recommendedLevelEn: 'Level 13 to 15',
    summaryFr: "Le 9e étage est le terminus de l'ascenseur privé 4-9. Il ne possède aucun escalier classique descendant : le seul moyen d'atteindre le Sous-sol 10 est de franchir une goulotte de chute sans retour en (0, 13) !",
    summaryEn: 'Floor 9 is the terminus of private elevator 4-9. It features no standard stairs down: the only way to reach Floor 10 is by jumping into the one-way chute at (0, 13)!',
    subtleClueFr: "Le plancher s'effondre dans le néant... Une fois la chute amorcée, seule la magie de Malor vous ramènera chez les vivants.",
    subtleClueEn: 'The stone floor falls away into the abyss... Once you jump, only Malor teleportation can return you to the surface.',
    objectivesFr: [
      "Atteindre le terminus de l'ascenseur en (10, 0).",
      'S’assurer que votre Mage possède le sort Malor (Téléportation, Niv. 7).',
      'Vérifier que tous les héros ont leurs PV au maximum et du matériel identifié.',
      'Emprunter la goulotte de chute en (0, 13) pour atterrir au Sous-sol 10.'
    ],
    objectivesEn: [
      'Reach the elevator terminus at (10, 0).',
      'Ensure your Mage has memorized Malor (Teleportation, Tier 7).',
      'Verify all heroes are at full HP with identified high-end gear.',
      'Step into the chute at (0, 13) to plunge into Floor 10.'
    ],
    hazards: [
      {
        nameFr: "Chute sans retour vers l'étage 10 (0, 13)",
        nameEn: 'One-way chute to Floor 10 (0, 13)',
        warningFr: "Précipite le groupe directement au sous-sol 10. Aucun escalier ne remonte !",
        warningEn: 'Dumps the party straight down to Floor 10. No stairs lead back up!',
        severity: 'CRITICAL'
      }
    ],
    keyLocations: [
      { x: 10, y: 0, nameFr: 'Ascenseur Privé (Étages 4 à 9)', nameEn: 'Private Elevator (Floors 4-9)', descriptionFr: "Dernier arrêt de l'ascenseur rapide.", descriptionEn: 'Last stop of the express elevator.', type: 'ELEVATOR' },
      { x: 0, y: 13, nameFr: 'Goulotte de Chute vers le Sous-sol 10', nameEn: 'Chute to Floor 10', descriptionFr: "Chute directe dans l'antre de Werdna.", descriptionEn: "Direct drop into Werdna's lair.", type: 'WARNING' }
    ],
    monsterTips: [
      {
        monsterName: 'Poison Giant & Will-o-Wisp',
        threatFr: 'Poison mortel et CA presque intouchable (-8).',
        threatEn: 'Lethal poison and untouchable armor class (-8).',
        counterStrategyFr: 'Utilisez Dilto et Lakkanito. Évitez les affrontements prolongés.',
        counterStrategyEn: 'Use Dilto and Lakkanito. Avoid prolonged skirmishes.'
      }
    ],
    spellRecommendationsFr: ['Malor (Indispensable pour remonter)', 'Tiltowait', 'Madi', 'Latumofis'],
    spellRecommendationsEn: ['Malor (Essential to escape)', 'Tiltowait', 'Madi', 'Latumofis']
  },
  10: {
    floor: 10,
    titleFr: "Sous-sol 10 : L'Antre de Werdna & L'Amulette Sacrée",
    titleEn: "Floor 10: Werdna's Lair & The Sacred Amulet",
    subtitleFr: 'Labyrinthe final de Trebor, gardiens ultimes et confrontation finale',
    subtitleEn: "Trebor's final gauntlet, ultimate guardians and final showdown",
    recommendedLevelFr: 'Niveau 13 à 16+',
    recommendedLevelEn: 'Level 13 to 16+',
    summaryFr: "Le niveau final de Wizardry I ! Un dédale labyrinthique semé de portes à sens unique, de téléporteurs croisés et de zones d'extinction magique. Au centre repose Werdna, le sorcier renégat, gardant l'Amulette convoitée.",
    summaryEn: "The ultimate climax of Wizardry I! A treacherous maze of one-way doors, teleporters and anti-magic zones. At the center lies Werdna the renegade wizard guarding the coveted Amulet.",
    subtleClueFr: "Le silence de mort règne sur l'antre du maître des arcanes... Réduisez-le au silence avant que son Tiltowait ne pulvérise votre lignée.",
    subtleClueEn: "Deadly silence blankets the master wizard's den... Silence him instantly before his Tiltowait pulverizes your party.",
    objectivesFr: [
      'Naviguer à travers les portes à sens unique et le dédale de téléporteurs.',
      "Éviter de lancer Malor à l'aveuglette (risque de finir dans la roche solide).",
      "Pénétrer dans le sanctuaire de Werdna en (0, 0).",
      'Vaincre WERDNA (#101), ses Vampires accompagnateurs et ses Démons Majeurs.',
      "Ramasser l'AMULETTE DE WERDNA (#94).",
      'Lancer le sort MALOR (haut de 10 étages ou coordonnées précises) pour regagner le Château et célébrer le triomphe !'
    ],
    objectivesEn: [
      'Navigate one-way secret doors and crisscrossing teleporters.',
      'Do not cast Malor blindly (rock solid instant death risk).',
      "Infiltrate Werdna's lair at (0, 0).",
      'Defeat WERDNA (#101), his Vampire bodyguards and Greater Demons.',
      'Retrieve the AMULET OF WERDNA (#94).',
      'Cast MALOR to teleport straight up 10 levels to the Castle and claim victory!'
    ],
    strategicTipsFr: [
      'STRATÉGIE DE COMBAT CONTRE WERDNA :',
      '1. TOUR 1 : Lancez MONTINO sur Werdna avec vos Prêtres/Évêques ! S’il n’est pas réduit au silence, il lancera TILTOWAIT et infligera 50 à 150 points de dégâts à toute l’escouade.',
      '2. TOUR 1 : Concentrez vos attaquants de mêlée sur les VAMPIRES ! Leurs attaques drainent 2 NIVEAUX par coup réussi, détruisant des heures de progression.',
      '3. TOUR 1 : Votre Mage doit lancer TILTOWAIT ou MALIKTO pour anéantir les serviteurs d’un coup.',
      "4. Une fois Werdna vaincu, l’Amulette est placée dans l’inventaire. Ne marchez pas jusqu’à la sortie : lancez immédiatement MALOR (Haut 10, Sud 0, Est 0) pour retourner au Château !"
    ],
    strategicTipsEn: [
      'WERDNA COMBAT STRATEGY :',
      '1. ROUND 1 : Cast MONTINO (Silence) on Werdna with Priests/Bishops! If unsilenced, he casts TILTOWAIT dealing 50-150 damage across your entire party.',
      '2. ROUND 1 : Focus melee warriors on the VAMPIRES! Each vampire claw hit permanently drains 2 EXPERIENCE LEVELS.',
      '3. ROUND 1 : Mage must launch TILTOWAIT or MALIKTO to obliterate the guardian cohort.',
      '4. Once Werdna falls, grab the Amulet of Werdna (#94). Do NOT walk: immediately cast MALOR (Up 10, South 0, East 0) to return safely to the Castle!'
    ],
    hazards: [
      {
        nameFr: "L'Antre de Werdna (0, 0)",
        nameEn: "Werdna's Lair (0, 0)",
        warningFr: 'Werdna lance Tiltowait et ses Vampires drainent 2 niveaux par coup.',
        warningEn: 'Werdna casts Tiltowait and his Vampire guards drain 2 levels per hit.',
        severity: 'CRITICAL'
      },
      {
        nameFr: 'Zones de roche solide mortelles',
        nameEn: 'Lethal solid rock tiles',
        warningFr: "Téléportation erronée via Malor = mort instantanée de tout le groupe dans la roche.",
        warningEn: 'Errant Malor coordinates = instantaneous party wipe in solid rock.',
        severity: 'CRITICAL'
      }
    ],
    keyLocations: [
      { x: 0, y: 0, nameFr: "L'Antre Suprême de Werdna", nameEn: "Werdna's Sanctum", descriptionFr: "Combat de boss final pour l'Amulette (#94).", descriptionEn: 'Final boss confrontation for the Amulet (#94).', type: 'BOSS' },
      { x: 13, y: 10, nameFr: "Téléporteur d'entrée de boucle", nameEn: 'Loop teleporter entrance', descriptionFr: 'Envoie vers les couloirs externes.', descriptionEn: 'Warps to external perimeter.', type: 'TELEPORTER' }
    ],
    monsterTips: [
      {
        monsterName: 'Werdna (#101)',
        threatFr: 'Archimage suprême lançant Tiltowait, Malikto et Lakanito.',
        threatEn: 'Supreme archmage casting Tiltowait, Malikto and Lakanito.',
        counterStrategyFr: "Montino au tour 1 pour le réduire au silence. Enchaîner les frappes d'armes lourdes.",
        counterStrategyEn: 'Cast Montino on round 1 to silence him, then strike with high-tier melee.'
      },
      {
        monsterName: 'Vampire (#88)',
        threatFr: "Draine 2 niveaux d'expérience par coup réussi (permanent !).",
        threatEn: 'Permanently drains 2 experience levels per successful hit!',
        counterStrategyFr: 'Éliminer en priorité absolue au tour 1. Utiliser Zilwan et attaques de front.',
        counterStrategyEn: 'Target with absolute priority round 1 using Zilwan and frontliner attacks.'
      }
    ],
    spellRecommendationsFr: ['Montino (Urgence absolue round 1)', 'Tiltowait', 'Malor (Retour au château)', 'Madi', 'Zilwan'],
    spellRecommendationsEn: ['Montino (Absolute round 1 urgency)', 'Tiltowait', 'Malor (Castle return)', 'Madi', 'Zilwan']
  }
};

// ============================================================================
// --- SCENARIO 2 : THE KNIGHT OF DIAMONDS ---
// ============================================================================
const KNIGHT_OF_DIAMONDS_GUIDES: Record<number, FloorGuide> = {
  1: {
    floor: 1,
    titleFr: "Sous-sol 1 : Les Gantelets du Chevalier de Diamant",
    titleEn: 'Floor 1: Gauntlets of the Diamond Knight',
    subtitleFr: 'La cité de Llylgamyn assiégée et la première relique',
    subtitleEn: 'The city of Llylgamyn under siege and the first relic',
    recommendedLevelFr: 'Niveau 9 à 11',
    recommendedLevelEn: 'Level 9 to 11',
    summaryFr: "Llylgamyn est assiégée. Pour restaurer le Bâton de Gnilda, vous devez retrouver les 5 pièces de l'armure du Chevalier de Diamant. Le premier étage abrite les Gantelets de Diamant.",
    summaryEn: 'Llylgamyn is surrounded by evil armies. To restore the Staff of Gnilda, you must gather all 5 pieces of the Diamond Knight armor. Floor 1 holds the Gauntlets of Diamonds.',
    subtleClueFr: "L'acier béni de Gnilda sommeille sous le sceau des gardiens... N'avancez pas sans une escouade aguerrie.",
    subtleClueEn: "Gnilda's blessed steel sleeps behind the guardian seals... Advance only with a battle-hardened squad.",
    objectivesFr: [
      'Entraîner vos héros transférés face aux monstres de niveau 9+.',
      'Résoudre l’énigme du gardien et vaincre le champion protecteur.',
      'Obtenir les Gantelets de Diamant.'
    ],
    objectivesEn: [
      'Train your imported veterans against tier 9+ foes.',
      'Solve the guardian riddle and defeat the relic champion.',
      'Claim the Gauntlets of Diamonds.'
    ],
    strategicTipsFr: [
      'Ce scénario est conçu pour des personnages débutant au moins au niveau 9 ! Ne commencez pas avec des novices.',
      'Les reliques de diamant ne peuvent être équipées que par un guerrier ou un lord d’alignement Bon.'
    ],
    strategicTipsEn: [
      'This scenario is calibrated for characters starting at level 9 or higher! Do not start with level 1 recruits.',
      'Diamond relics can only be safely donned by a Good-aligned warrior or Lord.'
    ],
    hazards: [
      {
        nameFr: 'Gardiens d’élite de Llylgamyn',
        nameEn: 'Elite guardians',
        warningFr: 'Combats ardus dès les premières salles.',
        warningEn: 'Tough encounters from the very first chambers.',
        severity: 'MEDIUM'
      }
    ],
    keyLocations: [
      { x: 0, y: 0, nameFr: 'Escalier vers le Château', nameEn: 'Stairs to Castle', descriptionFr: 'Sortie vers la cité sacrée.', descriptionEn: 'Exit to the sacred city.', type: 'STAIRS' }
    ],
    spellRecommendationsFr: ['Mahalito', 'Madi', 'Montino', 'Lahalito'],
    spellRecommendationsEn: ['Mahalito', 'Madi', 'Montino', 'Lahalito']
  },
  2: {
    floor: 2,
    titleFr: "Sous-sol 2 : La Cuirasse du Chevalier de Diamant",
    titleEn: 'Floor 2: Armor of the Diamond Knight',
    subtitleFr: 'Couloirs obscurs et la deuxième pièce sacrée',
    subtitleEn: 'Darkness halls and the second sacred relic',
    recommendedLevelFr: 'Niveau 10 à 12',
    recommendedLevelEn: 'Level 10 to 12',
    summaryFr: 'Ce dédale ténébreux exige une orientation rigoureuse pour débusquer la Cuirasse de Diamant (Knight’s Armor).',
    summaryEn: 'This dark labyrinth demands strict navigation to locate the Knight’s Armor of Diamonds.',
    subtleClueFr: "Le plastron impénétrable repousse les ténèbres de l'abîme.",
    subtleClueEn: 'The impenetrable breastplate repels the gloom of the deep.',
    objectivesFr: ['Traverser le labyrinthe ténébreux.', 'Vaincre le gardien de la Cuirasse.'],
    objectivesEn: ['Cross the dark labyrinth.', 'Defeat the Armor guardian.'],
    strategicTipsFr: ['Utilisez Milwa ou Lomilwa en permanence.', 'Méfiez-vous des voleurs ennemis qui peuvent voler votre or.'],
    strategicTipsEn: ['Keep Milwa or Lomilwa active at all times.', 'Beware hostile thieves attempting to pilfer gold.'],
    hazards: [{ nameFr: 'Zones d’obscurité', nameEn: 'Darkness zones', warningFr: 'Vision coupée.', warningEn: 'Vision impaired.', severity: 'MEDIUM' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Escalier vers le niveau 1', nameEn: 'Stairs to Level 1', descriptionFr: 'Remontée.', descriptionEn: 'Ascent.', type: 'STAIRS' }],
    spellRecommendationsFr: ['Lomilwa', 'Madi', 'Dalto'],
    spellRecommendationsEn: ['Lomilwa', 'Madi', 'Dalto']
  },
  3: {
    floor: 3,
    titleFr: "Sous-sol 3 : Le Bouclier de Diamant",
    titleEn: 'Floor 3: Shield of Diamonds',
    subtitleFr: 'Téléporteurs croisés et épreuve de protection',
    subtitleEn: 'Teleporter grid and protective trial',
    recommendedLevelFr: 'Niveau 11 à 13',
    recommendedLevelEn: 'Level 11 to 13',
    summaryFr: 'Le Bouclier de Diamant confère une résistance magique exceptionnelle. Récupérez-le après avoir surmonté un maillage de téléporteurs.',
    summaryEn: 'The Shield of Diamonds grants extraordinary resistance. Retrieve it past a teleporter grid.',
    subtleClueFr: 'Le bouclier miroite au-delà des failles spatiales...',
    subtleClueEn: 'The shield glimmers across fractured spatial rifts...',
    objectivesFr: ['Cartographier les téléporteurs.', 'Obtenir le Bouclier de Diamant.'],
    objectivesEn: ['Map the teleporters.', 'Retrieve the Shield of Diamonds.'],
    strategicTipsFr: ['Dumapic est crucial ici.'],
    strategicTipsEn: ['Dumapic is crucial here.'],
    hazards: [{ nameFr: 'Téléporteurs croisés', nameEn: 'Crossing teleporters', warningFr: 'Désorientation fréquente.', warningEn: 'Frequent disorientation.', severity: 'MEDIUM' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Escalier', nameEn: 'Stairs', descriptionFr: 'Passage.', descriptionEn: 'Passage.', type: 'STAIRS' }]
  },
  4: {
    floor: 4,
    titleFr: "Sous-sol 4 : Le Heaume de Malor",
    titleEn: 'Floor 4: Helm of Malor',
    subtitleFr: 'La relique conférant le pouvoir de téléportation infinie',
    subtitleEn: 'Relic granting boundless teleportation powers',
    recommendedLevelFr: 'Niveau 12 à 14',
    recommendedLevelEn: 'Level 12 to 14',
    summaryFr: 'Le Heaume de Malor est l’une des reliques les plus puissantes de l’histoire de Wizardry. Utilisé comme objet, il permet de lancer Malor sans dépenser de points de magie !',
    summaryEn: 'The Helm of Malor is one of the most iconic artifacts in Wizardry. Used as an item, it allows casting Malor without expending spell points!',
    subtleClueFr: 'Le heaume d’argent ouvre les portes de tous les horizons...',
    subtleClueEn: 'The silver helm opens portals across every horizon...',
    objectivesFr: ['Localiser la chambre scellée du Heaume.', 'Vaincre ses gardiens et équiper le Heaume.'],
    objectivesEn: ['Locate the sealed Helm chamber.', 'Defeat its guardians and equip the Helm.'],
    strategicTipsFr: ['Gardez le Heaume dans votre inventaire pour des téléportations d’urgence sécurisées.'],
    strategicTipsEn: ['Keep the Helm in inventory for emergency teleports.'],
    hazards: [{ nameFr: 'Extinctions magiques', nameEn: 'Fizzle pockets', warningFr: 'Zones sans magie.', warningEn: 'No magic tiles.', severity: 'HIGH' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Escalier', nameEn: 'Stairs', descriptionFr: 'Passage.', descriptionEn: 'Passage.', type: 'STAIRS' }]
  },
  5: {
    floor: 5,
    titleFr: "Sous-sol 5 : L'Épée de Gnilda (HRH Blade)",
    titleEn: 'Floor 5: Sword of Gnilda (HRH Blade)',
    subtitleFr: 'L’arme ultime capable de trancher les démons majeurs',
    subtitleEn: 'The ultimate blade capable of cleaving high demons',
    recommendedLevelFr: 'Niveau 13 à 15',
    recommendedLevelEn: 'Level 13 to 15',
    summaryFr: 'L’Épée sacrée de Gnilda complète la panoplie complète du Chevalier de Diamant. Elle inflige des dégâts phénoménaux et dissipe le mal.',
    summaryEn: 'The sacred Sword of Gnilda completes the full Knight of Diamonds regalia, dealing colossal damage.',
    subtleClueFr: 'L’acier sacré attend le champion digne de porter le nom de Gnilda.',
    subtleClueEn: 'Sacred steel awaits the champion worthy of Gnilda’s name.',
    objectivesFr: ['Vaincre le Démon Supérieur gardien de la lame.', 'Rassembler les 5 pièces sur votre champion.'],
    objectivesEn: ['Vanquish the Arch-Fiend guarding the blade.', 'Unite all 5 pieces on your champion.'],
    strategicTipsFr: ['Tous les morceaux d’armure doivent être réunis pour le rituel final.'],
    strategicTipsEn: ['All five armor pieces must be assembled for the final rite.'],
    hazards: [{ nameFr: 'Démons abyssaux', nameEn: 'Abyssal fiends', warningFr: 'Dégâts extrêmes.', warningEn: 'Extreme damage.', severity: 'CRITICAL' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Escalier', nameEn: 'Stairs', descriptionFr: 'Passage.', descriptionEn: 'Passage.', type: 'STAIRS' }]
  },
  6: {
    floor: 6,
    titleFr: "Sous-sol 6 : Le Sanctuaire de Gnilda & La Libération de Llylgamyn",
    titleEn: 'Floor 6: Shrine of Gnilda & Liberation of Llylgamyn',
    subtitleFr: 'Le rituel de consécration et le retour du Bâton sacré',
    subtitleEn: 'The consecration rite and restoration of the sacred Staff',
    recommendedLevelFr: 'Niveau 14 à 16+',
    recommendedLevelEn: 'Level 14 to 16+',
    summaryFr: 'Revêtu des 5 reliques de diamant, votre champion peut entrer dans le saint des saints, prononcer le nom sacré de Gnilda et restaurer le Bâton mystique qui sauvera Llylgamyn.',
    summaryEn: 'Donning all 5 diamond relics, your champion can step into the inner sanctum, invoke Gnilda’s holy name, and restore the mystical Staff to save Llylgamyn.',
    subtleClueFr: 'Prononcez le nom de la déesse protectrice pour sceller la victoire...',
    subtleClueEn: 'Speak the name of the patron goddess to seal eternal victory...',
    objectivesFr: [
      'Atteindre le Sanctuaire au centre du dédale.',
      'Avoir votre champion revêtu de l’ensemble complet du Chevalier de Diamant.',
      'Prononcer la réponse rituelle GNILDA devant l’autel divin.'
    ],
    objectivesEn: [
      'Reach the Shrine at the heart of the labyrinth.',
      'Have your champion clad in the complete Diamond Knight regalia.',
      'Speak the ritual response GNILDA before the divine altar.'
    ],
    strategicTipsFr: ['Ne vendez ni ne jetez aucune pièce de diamant sous peine de bloquer la victoire !'],
    strategicTipsEn: ['Never sell or drop any diamond piece or victory becomes unattainable!'],
    hazards: [{ nameFr: 'Épreuve divine', nameEn: 'Divine trial', warningFr: 'Refus si le chevalier est incomplet.', warningEn: 'Rejection if incomplete.', severity: 'HIGH' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Autel de Gnilda', nameEn: "Gnilda's Altar", descriptionFr: 'Lieu du triomphe final.', descriptionEn: 'Site of final triumph.', type: 'BOSS' }]
  }
};

// ============================================================================
// --- SCENARIO 3 : LEGACY OF LLYLGAMYN ---
// ============================================================================
const LEGACY_OF_LLYLGAMYN_GUIDES: Record<number, FloorGuide> = {
  1: {
    floor: 1,
    titleFr: "Étage 1 : Le Pied du Volcan & Terres Neutres",
    titleEn: 'Floor 1: Foot of the Volcano & Neutral Grounds',
    subtitleFr: 'Départ de l’ascension et embranchement des alignements',
    subtitleEn: 'Beginning of the mountain ascent and alignment fork',
    recommendedLevelFr: 'Niveau 1 à 3',
    recommendedLevelEn: 'Level 1 to 3',
    summaryFr: 'Un cataclysme menace Llylgamyn. Vous devez gravir la Montagne de Feu pour trouver l’Orbe d’Erynlyn gardé par le grand dragon L’Kbreth. Cet étage sépare la voie du Bien et la voie du Mal.',
    summaryEn: 'Natural cataclysms threaten Llylgamyn. You must ascend the Mountain of Fire to retrieve the Orb of Erynlyn guarded by the great dragon L’Kbreth.',
    subtleClueFr: 'Deux sentiers s’ouvrent : l’un baigné de lumière, l’autre d’ombres cruelles.',
    subtleClueEn: 'Two paths diverge: one bathed in light, the other in cruel shadow.',
    objectivesFr: ['Choisir la route selon l’alignement de vos aventuriers.', 'Prendre garde aux élémentaires de lave.'],
    objectivesEn: ['Choose route based on party alignment.', 'Watch out for lava elementals.'],
    strategicTipsFr: ['Wizardry III introduit des restrictions strictes d’alignement : les héros Bons et Mauvais ne peuvent emprunter les mêmes portes !'],
    strategicTipsEn: ['Wizardry III features strict alignment segregation: Good and Evil adventurers cannot pass the same portals!'],
    hazards: [{ nameFr: 'Chaleur volcanique', nameEn: 'Volcanic heat', warningFr: 'Dégâts de feu continus.', warningEn: 'Ongoing fire damage.', severity: 'MEDIUM' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Entrée du volcan', nameEn: 'Volcano entrance', descriptionFr: 'Point de départ.', descriptionEn: 'Starting point.', type: 'STAIRS' }]
  },
  2: {
    floor: 2,
    titleFr: "Étage 2 : Le Sentier des Justes (Alignement Bon)",
    titleEn: 'Floor 2: Path of the Righteous (Good Alignment)',
    subtitleFr: 'Épreuves sacrées et prêtres de la Lumière',
    subtitleEn: 'Sacred trials and Priests of the Light',
    recommendedLevelFr: 'Niveau 3 à 6',
    recommendedLevelEn: 'Level 3 to 6',
    summaryFr: 'Ce palier ne s’ouvre qu’aux aventuriers d’alignement Bon ou Neutre. Il renferme des fontaines régénératrices et des bénédictions sacrées.',
    summaryEn: 'This tier admits only Good or Neutral adventurers, featuring restorative fountains and holy blessings.',
    subtleClueFr: 'La colombe d’argent guide ceux au cœur pur.',
    subtleClueEn: 'The silver dove guides those pure of heart.',
    objectivesFr: ['Obtenir la bénédiction de la Lumière.', 'Accéder aux galeries supérieures.'],
    objectivesEn: ['Earn the blessing of Light.', 'Reach upper terraces.'],
    strategicTipsFr: ['Profitez des fontaines de guérison pour économiser vos sorts.'],
    strategicTipsEn: ['Use healing fountains to conserve spell slots.'],
    hazards: [{ nameFr: 'Porte d’alignement', nameEn: 'Alignment gate', warningFr: 'Repousse les héros mauvais.', warningEn: 'Repels evil heroes.', severity: 'MEDIUM' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Escalier', nameEn: 'Stairs', descriptionFr: 'Montée.', descriptionEn: 'Ascent.', type: 'STAIRS' }]
  },
  3: {
    floor: 3,
    titleFr: "Étage 3 : Le Labyrinthe des Ombres (Alignement Mauvais)",
    titleEn: 'Floor 3: Labyrinth of Shadows (Evil Alignment)',
    subtitleFr: 'Catacombes ténébreuses et pactes sanglants',
    subtitleEn: 'Dark catacombs and blood covenants',
    recommendedLevelFr: 'Niveau 3 à 6',
    recommendedLevelEn: 'Level 3 to 6',
    summaryFr: 'Le sentier ténébreux réservé aux escouades Mauvaises et Neutres. Les pièges y sont sournois mais les trésors prodigieux.',
    summaryEn: 'The shadowy path for Evil and Neutral squads. Treacherous traps guard formidable wealth.',
    subtleClueFr: 'La nuit étouffe les cris des imprudents.',
    subtleClueEn: 'Night smothers the cries of the unwary.',
    objectivesFr: ['Piller les reliques des ombres.', 'Gravir vers le lac de lave.'],
    objectivesEn: ['Loot shadow relics.', 'Ascend toward the lava lake.'],
    strategicTipsFr: ['Utilisez des Ninjas et des Voleurs pour désamorcer les coffres piégés.'],
    strategicTipsEn: ['Use Ninjas and Thieves to safely disarm trapped chests.'],
    hazards: [{ nameFr: 'Poison et paralysie', nameEn: 'Poison and paralysis', warningFr: 'Grave menace.', warningEn: 'Severe threat.', severity: 'HIGH' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Escalier', nameEn: 'Stairs', descriptionFr: 'Montée.', descriptionEn: 'Ascent.', type: 'STAIRS' }]
  },
  4: {
    floor: 4,
    titleFr: "Étage 4 : Le Navire des Damnés & Le Lac de Lave",
    titleEn: 'Floor 4: Ship of the Damned & Lake of Fire',
    subtitleFr: 'La traversée de la mer de braises',
    subtitleEn: 'Crossing the sea of burning embers',
    recommendedLevelFr: 'Niveau 7 à 10',
    recommendedLevelEn: 'Level 7 to 10',
    summaryFr: 'Un immense galion spectral flotte sur un lac de magma en fusion. Vous devez y dénicher le cristal de traversée pour voguer vers les cimes.',
    summaryEn: 'A spectral galleon sails across a molten magma lake. Secure the transit crystal to voyage upward.',
    subtleClueFr: 'Le bois pétrifié résiste à la fournaise... Trouvez le gouvernail des anciens.',
    subtleClueEn: 'Petrified timber braves the furnace... Locate the ancient helm.',
    objectivesFr: ['Monter à bord du navire.', 'Activer le cristal magique de navigation.'],
    objectivesEn: ['Board the galleon.', 'Activate the magical navigation crystal.'],
    strategicTipsFr: ['Protégez-vous du feu avec le sort Afanc ou des anneaux ignifuges.'],
    strategicTipsEn: ['Protect against fire with fire warding equipment.'],
    hazards: [{ nameFr: 'Magma bouillonnant', nameEn: 'Boiling magma', warningFr: 'Dégâts mortels en cas de chute.', warningEn: 'Lethal damage if fallen into.', severity: 'CRITICAL' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Pont du navire', nameEn: "Ship's deck", descriptionFr: 'Gouvernail.', descriptionEn: 'Rudder.', type: 'KEY_ITEM' }]
  },
  5: {
    floor: 5,
    titleFr: "Étage 5 : La Caverne de Cristal & Le Bassin de Clarté",
    titleEn: 'Floor 5: Crystal Caverns & Pool of Radiance',
    subtitleFr: 'L’eau bénite purificatrice et l’antre précurseur',
    subtitleEn: 'Purifying holy waters and pre-boss sanctuary',
    recommendedLevelFr: 'Niveau 10 à 13',
    recommendedLevelEn: 'Level 10 to 13',
    summaryFr: 'Un havre scintillant de cristaux et de sources pures au milieu du volcan. Vous devez y purifier vos héros avant d’affronter le dragon suprême.',
    summaryEn: 'A glittering haven of crystals and pure springs inside the volcano. Purify your heroes before meeting the great dragon.',
    subtleClueFr: 'Seuls ceux lavés par la clarté cristalline pourront regarder le dragon sans brûler.',
    subtleClueEn: 'Only those cleansed in crystalline waters may behold the dragon unburned.',
    objectivesFr: ['Purifier l’escouade au Bassin de Clarté.', 'Préparer les sorts ultimes pour le sommet.'],
    objectivesEn: ['Cleanse party at the Pool of Radiance.', 'Prepare ultimate spells for the apex.'],
    strategicTipsFr: ['La purification est obligatoire pour parler pacifiquement à L’Kbreth !'],
    strategicTipsEn: ['Purification is mandatory for a peaceful dialogue with L’Kbreth!'],
    hazards: [{ nameFr: 'Cristaux coupants', nameEn: 'Razor crystals', warningFr: 'Pièges au sol.', warningEn: 'Ground hazards.', severity: 'MEDIUM' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Bassin de Clarté', nameEn: 'Pool of Radiance', descriptionFr: 'Source sacrée.', descriptionEn: 'Sacred spring.', type: 'FOUNTAIN' }]
  },
  6: {
    floor: 6,
    titleFr: "Étage 6 : Le Nid de L'Kbreth & L'Orbe d'Erynlyn",
    titleEn: "Floor 6: L'Kbreth's Eyrie & The Orb of Erynlyn",
    subtitleFr: 'La rencontre avec le grand dragon ancestral et la conclusion de la trilogie',
    subtitleEn: "Showdown with the ancestral great dragon and climax of the trilogy",
    recommendedLevelFr: 'Niveau 12 à 15+',
    recommendedLevelEn: 'Level 12 to 15+',
    summaryFr: "Le zénith de la Montagne de Feu. L'Kbreth, le dragon gardien millénaire, vous met à l'épreuve. Si vous avez respecté la voie sacrée, il vous remettra l'Orbe sans effusion de sang.",
    summaryEn: "The summit of the Mountain of Fire. L'Kbreth, the thousand-year dragon, tests your resolve. If purified, you may claim the Orb peacefully.",
    subtleClueFr: "L'œil du grand reptile scrute votre âme... La violence n'est pas la seule réponse des sages.",
    subtleClueEn: "The great wyrm's eye probes your soul... Violence is not the only answer of the wise.",
    objectivesFr: [
      "Rencontrer L'Kbreth au zénith du volcan.",
      "Présenter les reliques de purification pour recevoir l'ORBE D'ERYNLYN.",
      "Sauver Llylgamyn des séismes destructeurs."
    ],
    objectivesEn: [
      "Meet L'Kbreth at the volcano peak.",
      "Present purification artifacts to receive the ORB OF ERYNLYN.",
      "Save Llylgamyn from the catastrophic quakes."
    ],
    strategicTipsFr: [
      "Si vous combattez L'Kbreth, préparez-vous au souffle de feu le plus destructeur de la trilogie ! Montino est inefficace contre son souffle physique."
    ],
    strategicTipsEn: [
      "If you choose to fight L'Kbreth, prepare for the most ferocious breath attack in the trilogy! Montino will not silence physical breath."
    ],
    hazards: [{ nameFr: "Souffle de L'Kbreth", nameEn: "L'Kbreth's breath", warningFr: "Dégâts cataclysmiques.", warningEn: "Cataclysmic damage.", severity: 'CRITICAL' }],
    keyLocations: [{ x: 0, y: 0, nameFr: "Trône de L'Kbreth", nameEn: "L'Kbreth's Perch", descriptionFr: "Le gardien de l'Orbe.", descriptionEn: 'Guardian of the Orb.', type: 'BOSS' }]
  }
};

// ============================================================================
// --- SCENARIO 4 : THE RETURN OF WERDNA ---
// ============================================================================
const RETURN_OF_WERDNA_GUIDES: Record<number, FloorGuide> = {
  10: {
    floor: 10,
    titleFr: "Sous-sol 10 : Le Tombeau au Fond des Abysses",
    titleEn: 'Floor 10: Tomb at the Bottom of the Abyss',
    subtitleFr: 'Le réveil de Werdna et la première invocation au Pentagramme',
    subtitleEn: 'Werdna awakening and the first Pentagram summon',
    recommendedLevelFr: 'Werdna Niv. 1',
    recommendedLevelEn: 'Werdna Lvl 1',
    summaryFr: "Dans ce chef-d'œuvre inversé, vous incarnez WERDNA ! Privé de vos pouvoirs, vous devez invoquer des monstres aux pentagrammes pour gravir les 10 étages jusqu'à la surface.",
    summaryEn: 'In this inverted classic, you play as WERDNA! Deprived of powers, you must summon monsters at pentagrams to claw your way up 10 floors to daylight.',
    subtleClueFr: 'Le sang des runes réveille les démons assoupis... Tracez le cercle de召唤.',
    subtleClueEn: 'Blood on the runes rouses slumbering fiends... Draw the summoning circle.',
    objectivesFr: [
      'Localiser le premier Pentagramme d’invocation.',
      'Invoquer des monstres serviteurs pour former votre escouade protectrice.',
      'Échapper aux premiers aventuriers humains qui patrouillent.',
      'Trouver l’escalier qui monte vers le Sous-sol 9.'
    ],
    objectivesEn: [
      'Locate the first summoning Pentagram.',
      'Conjure monster minions to serve as your meat shield.',
      'Evade early human adventurer scouting parties.',
      'Find the stairs ascending to Floor 9.'
    ],
    strategicTipsFr: [
      'Werdna est vulnérable au départ ! Placez toujours des monstres résistants en première ligne (Ogres, Zombies, Démons).',
      'Les aventuriers humains que vous croisez sont des répliques des vraies escouades de joueurs de Wizardry I !'
    ],
    strategicTipsEn: [
      'Werdna is frail at start! Always position sturdy tanks in front (Ogres, Zombies, Fiends).',
      'The human adventurer parties you face are replicas of actual player characters from Wizardry I!'
    ],
    hazards: [{ nameFr: 'Groupes d’aventuriers humains', nameEn: 'Human adventurer parties', warningFr: 'Frappes mortelles.', warningEn: 'Lethal strikes.', severity: 'HIGH' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Pentagramme d’Invocation', nameEn: 'Summoning Pentagram', descriptionFr: 'Cercle de magie noire.', descriptionEn: 'Dark summoning circle.', type: 'FOUNTAIN' }]
  },
  6: {
    floor: 6,
    titleFr: "Sous-sol 6 : Le Cube Cosmique (The Cosmic Cube)",
    titleEn: 'Floor 6: The Cosmic Cube',
    subtitleFr: 'L’un des labyrinthes 3D les plus complexes de l’histoire du jeu vidéo',
    subtitleEn: 'One of the most intricate 3D mazes in gaming history',
    recommendedLevelFr: 'Werdna Niv. 5+',
    recommendedLevelEn: 'Werdna Lvl 5+',
    summaryFr: 'Le Cube Cosmique est une matrice cubique tridimensionnelle interconnectée par des chutes et des téléporteurs sur plusieurs sous-niveaux. Une boussole et une patience d’acier sont requises.',
    summaryEn: 'The Cosmic Cube is a multi-tier 3D matrix linked by chutes and pits. Rigorous mapping is required to survive.',
    subtleClueFr: 'Haut, bas, nord et sud s’entremêlent dans la géométrie sacrée du Cube.',
    subtleClueEn: 'Up, down, north and south intertwine in the Cube’s sacred geometry.',
    objectivesFr: ['Déchiffrer les connexions verticales du cube.', 'Éviter les boucles infinies de téléportation.'],
    objectivesEn: ['Decipher vertical connections of the cube.', 'Escape endless teleport loops.'],
    strategicTipsFr: ['Ne sautez jamais dans une fosse du Cube sans avoir noté vos coordonnées exactes avec Dumapic.'],
    strategicTipsEn: ['Never jump into a pit inside the Cube without recording exact coordinates.'],
    hazards: [{ nameFr: 'Chutes multidimensionnelles', nameEn: 'Multidimensional chutes', warningFr: 'Perte de repères.', warningEn: 'Extreme disorientation.', severity: 'CRITICAL' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Noyau du Cube', nameEn: 'Cube Core', descriptionFr: 'Nexus spatial.', descriptionEn: 'Spatial nexus.', type: 'TELEPORTER' }]
  },
  1: {
    floor: 1,
    titleFr: "Sous-sol 1 : La Sortie vers le Monde Extérieur",
    titleEn: 'Floor 1: Exit to the Surface World',
    subtitleFr: 'La dernière garnison de Trebor et la conquête du grand jour',
    subtitleEn: "Trebor's final garrison and reaching the sunlit surface",
    recommendedLevelFr: 'Werdna Niv. 10+',
    recommendedLevelEn: 'Werdna Lvl 10+',
    summaryFr: "Le dénouement du Retour de Werdna ! Vous devez anéantir les derniers paladins d'élite de Trebor, franchir le seuil du donjon et contempler la lumière du soleil.",
    summaryEn: "The climax of The Return of Werdna! Vanquish Trebor's elite paladins, cross the dungeon threshold, and step into the daylight.",
    subtleClueFr: "Le vent de la surface caresse enfin vos joues... terrassez les derniers gardiens du trône.",
    subtleClueEn: "Surface winds finally brush your cheek... crush the last defenders of the throne.",
    objectivesFr: [
      'Invoquer vos démons les plus destructeurs.',
      "Vaincre l'escouade d'élite de Trebor.",
      "Regagner la liberté et achever la vengeance de Werdna."
    ],
    objectivesEn: [
      'Summon your most destructive demon lords.',
      "Defeat Trebor's royal champion squad.",
      "Reclaim freedom and complete Werdna's vengeance."
    ],
    strategicTipsFr: ['Utilisez Tiltowait et Malikto sans retenue lors des derniers affrontements.'],
    strategicTipsEn: ['Unleash Tiltowait and Malikto relentlessly in the final clashes.'],
    hazards: [{ nameFr: 'Paladins suprêmes', nameEn: 'Supreme paladins', warningFr: 'Dégâts massifs et soins divins.', warningEn: 'Massive damage and divine healing.', severity: 'CRITICAL' }],
    keyLocations: [{ x: 0, y: 0, nameFr: 'Portail de Surface', nameEn: 'Surface Portal', descriptionFr: 'Victoire finale.', descriptionEn: 'Ultimate victory.', type: 'BOSS' }]
  }
};

// ============================================================================
// --- GENERIC / FALLBACK FLOOR GUIDE GENERATOR FOR ANTHOLOGY SCENARIOS ---
// ============================================================================
export function generateGenericFloorGuide(scenarioId: string, floor: number): FloorGuide {
  const isDeep = floor >= 7;
  const isMid = floor >= 4 && floor < 7;
  
  const themeMap: Record<string, { themeFr: string; themeEn: string; bossFr: string; bossEn: string; hazardFr: string; hazardEn: string }> = {
    'black-stone': {
      themeFr: "Crypte de la Pierre Noire",
      themeEn: "Crypt of the Black Stone",
      bossFr: "Seigneur d'Obsidienne & Nécromanciens",
      bossEn: "Obsidian Lord & Necromancers",
      hazardFr: "Dalles maudites et spectres drainants",
      hazardEn: "Cursed tiles and draining spectres"
    },
    'catacombs-of-vlad': {
      themeFr: "Catacombes Gothiques de Vlad",
      themeEn: "Vlad's Gothic Catacombs",
      bossFr: "Comte Vlad & Gargouilles de Sang",
      bossEn: "Count Vlad & Blood Gargoyles",
      hazardFr: "Morsures de vampires et brumes sanglantes",
      hazardEn: "Vampiric bites and crimson mists"
    },
    'dragonquest': {
      themeFr: "Cavernes du Dragon des Sommets",
      themeEn: "Peak Wyrm Caverns",
      bossFr: "Dragon Ancien & Léviathans de Feu",
      bossEn: "Ancient Wyrm & Fire Leviathans",
      hazardFr: "Souffles de feu destructeurs et rivières de lave",
      hazardEn: "Devastating flame breaths and lava flows"
    },
    'knight-of-the-grave': {
      themeFr: "Mausolée du Chevalier de la Tombe",
      themeEn: "Mausoleum of the Grave Knight",
      bossFr: "Chevalier Maudit & Sentinelles d'Os",
      bossEn: "Cursed Knight & Bone Sentinels",
      hazardFr: "Malédictions nécrotiques et fosses piégées",
      hazardEn: "Necrotic curses and concealed pit traps"
    },
    'scarlet-brotherhood': {
      themeFr: "Bastion de la Fraternité Écarlate",
      themeEn: "Scarlet Brotherhood Stronghold",
      bossFr: "Grand Maître Assassin & Fanatiques",
      bossEn: "Grandmaster Assassin & Zealots",
      hazardFr: "Fléchettes empoisonnées et embuscades furtives",
      hazardEn: "Poisoned darts and stealth ambushes"
    },
    'nihonbashi': {
      themeFr: "Dédale Oriental de Nihonbashi",
      themeEn: "Nihonbashi Oriental Labyrinth",
      bossFr: "Shogun Déchu & Maîtres Ninjas",
      bossEn: "Fallen Shogun & Master Ninjas",
      hazardFr: "Lames décapitantes et esprits Yokai",
      hazardEn: "Decapitating blades and Yokai spirits"
    },
    'oconnors-mine': {
      themeFr: "Mines Abandonnées d'O'Connor",
      themeEn: "O'Connor's Abandoned Mine",
      bossFr: "Contremaître Gobelin & Golem de Pierre",
      bossEn: "Goblin Overseer & Stone Golem",
      hazardFr: "Éboulements de galeries et fosses minières",
      hazardEn: "Cave-ins and deep mine shaft pits"
    },
    'emperors-seal': {
      themeFr: "Tombeau Impérial du Sceau Céleste",
      themeEn: "Imperial Tomb of the Celestial Seal",
      bossFr: "Garde de Terre Cuite & Général Céleste",
      bossEn: "Terracotta Guard & Celestial General",
      hazardFr: "Énigmes dynastiques et dalles tournantes",
      hazardEn: "Dynastic riddles and rotating stone plates"
    },
    'atomic-wasteland-2098': {
      themeFr: "Bunker Nucléaire Post-Apocalyptique 2098",
      themeEn: "Nuclear Wasteland Vault 2098",
      bossFr: "Cœur Mutant & IA de Défense Alpha",
      bossEn: "Mutant Core & Alpha Defense AI",
      hazardFr: "Radiations mortelles et portes à cartes magnétiques",
      hazardEn: "Deadly radiation zones and keycard lockouts"
    }
  };

  const meta = themeMap[scenarioId] || {
    themeFr: `Labyrinthe Ancien (Scénario ${scenarioId})`,
    themeEn: `Ancient Labyrinth (Scenario ${scenarioId})`,
    bossFr: "Gardiens des Abysses",
    bossEn: "Abyssal Guardians",
    hazardFr: "Fosses et créatures hostiles",
    hazardEn: "Pits and hostile creatures"
  };

  const minLvl = isDeep ? 12 : (isMid ? 6 : 1);
  const maxLvl = isDeep ? 16 : (isMid ? 11 : 5);

  return {
    floor,
    titleFr: `Étage ${floor} : ${meta.themeFr}`,
    titleEn: `Floor ${floor}: ${meta.themeEn}`,
    subtitleFr: isDeep ? `Zone abyssale finale — ${meta.bossFr}` : (isMid ? `Secteur intermédiaire et pièges avancés` : `Entrée et premières épreuves`),
    subtitleEn: isDeep ? `Final abyss sector — ${meta.bossEn}` : (isMid ? `Mid-tier trials and advanced hazard grid` : `Entrance and initial trials`),
    recommendedLevelFr: `Niveau ${minLvl} à ${maxLvl}`,
    recommendedLevelEn: `Level ${minLvl} to ${maxLvl}`,
    summaryFr: `L'exploration du niveau ${floor} confronte l'escouade à des périls croissants. Vous devez sécuriser les escaliers de liaison, éliminer les patrouilles d'élite et collecter le butin des coffres pour renforcer vos lignes.`,
    summaryEn: `Exploring level ${floor} pits your squad against escalating dangers. Secure connecting stairwells, clear hostile patrols, and claim high-tier chest rewards to bolster your lines.`,
    subtleClueFr: `Les pierres murmurent des avertissements oubliés... Méfiez-vous de : ${meta.hazardFr}.`,
    subtleClueEn: `The cold masonry whispers forgotten warnings... Beware: ${meta.hazardEn}.`,
    objectivesFr: [
      `Explorer les couloirs du niveau ${floor} et cartographier les passages secrets.`,
      `Neutraliser les créatures hostiles et surveiller les effets de poison ou paralysie.`,
      isDeep ? `Vaincre les commandants suprêmes (${meta.bossFr}).` : `Localiser l'escalier vers l'étage ${floor + 1}.`
    ],
    objectivesEn: [
      `Explore level ${floor} corridors and map hidden doorways.`,
      `Neutralize hostile patrols and counter poison/paralysis threats.`,
      isDeep ? `Vanquish the supreme leaders (${meta.bossEn}).` : `Locate the stairwell leading to floor ${floor + 1}.`
    ],
    strategicTipsFr: [
      `Lancez Dumapic fréquemment pour vérifier votre positionnement exact.`,
      `Face aux groupes de créatures nombreuses, privilégiez les sorts de zone (Mahalito, Dalto, Lahalito).`,
      `Ne descendez jamais au palier suivant sans avoir soigné tous vos aventuriers au maximum.`
    ],
    strategicTipsEn: [
      `Cast Dumapic regularly to confirm your coordinates.`,
      `Against clustered enemy packs, prioritize group spells (Mahalito, Dalto, Lahalito).`,
      `Never descend to the next tier without healing all party members to full HP.`
    ],
    hazards: [
      {
        nameFr: meta.hazardFr,
        nameEn: meta.hazardEn,
        warningFr: `Danger majeur identifié sur ce palier.`,
        warningEn: `Major hazard identified across this floor.`,
        severity: isDeep ? 'CRITICAL' : 'HIGH'
      }
    ],
    keyLocations: [
      { x: 0, y: 0, nameFr: `Escalier de liaison`, nameEn: `Connecting stairs`, descriptionFr: `Accès inter-étages.`, descriptionEn: `Inter-floor access.`, type: 'STAIRS' }
    ],
    spellRecommendationsFr: ['Dumapic', 'Katino / Montino', 'Madi', isDeep ? 'Tiltowait' : 'Mahalito'],
    spellRecommendationsEn: ['Dumapic', 'Katino / Montino', 'Madi', isDeep ? 'Tiltowait' : 'Mahalito']
  };
}

// ============================================================================
// --- MASTER RETRIEVAL HELPERS ---
// ============================================================================
export function getFloorGuide(scenarioId: string, floor: number): FloorGuide {
  if (scenarioId === 'proving-grounds' || scenarioId === 'wizardry-1') {
    if (PROVING_GROUNDS_GUIDES[floor]) return PROVING_GROUNDS_GUIDES[floor];
  } else if (scenarioId === 'knight-of-diamonds') {
    if (KNIGHT_OF_DIAMONDS_GUIDES[floor]) return KNIGHT_OF_DIAMONDS_GUIDES[floor];
  } else if (scenarioId === 'legacy-of-llylgamyn') {
    if (LEGACY_OF_LLYLGAMYN_GUIDES[floor]) return LEGACY_OF_LLYLGAMYN_GUIDES[floor];
  } else if (scenarioId === 'return-of-werdna') {
    if (RETURN_OF_WERDNA_GUIDES[floor]) return RETURN_OF_WERDNA_GUIDES[floor];
  }

  return generateGenericFloorGuide(scenarioId, floor);
}

export function getLocalizedFloorGuide(guide: FloorGuide, lang: 'fr' | 'en') {
  return {
    floor: guide.floor,
    title: lang === 'fr' ? guide.titleFr : guide.titleEn,
    subtitle: lang === 'fr' ? guide.subtitleFr : guide.subtitleEn,
    recommendedLevel: lang === 'fr' ? guide.recommendedLevelFr : guide.recommendedLevelEn,
    summary: lang === 'fr' ? guide.summaryFr : guide.summaryEn,
    subtleClue: lang === 'fr' ? guide.subtleClueFr : guide.subtleClueEn,
    objectives: lang === 'fr' ? guide.objectivesFr : guide.objectivesEn,
    strategicTips: lang === 'fr' ? guide.strategicTipsFr : guide.strategicTipsEn,
    spellRecommendations: lang === 'fr' ? guide.spellRecommendationsFr : guide.spellRecommendationsEn,
    hazards: guide.hazards.map(h => ({
      name: lang === 'fr' ? h.nameFr : h.nameEn,
      warning: lang === 'fr' ? h.warningFr : h.warningEn,
      severity: h.severity
    })),
    keyLocations: guide.keyLocations.map(k => ({
      x: k.x,
      y: k.y,
      name: lang === 'fr' ? k.nameFr : k.nameEn,
      description: lang === 'fr' ? k.descriptionFr : k.descriptionEn,
      type: k.type
    })),
    monsterTips: guide.monsterTips?.map(m => ({
      monsterName: m.monsterName,
      threat: lang === 'fr' ? m.threatFr : m.threatEn,
      counterStrategy: lang === 'fr' ? m.counterStrategyFr : m.counterStrategyEn
    }))
  };
}

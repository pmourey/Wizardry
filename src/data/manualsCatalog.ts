export interface ManualItem {
  id: string;
  scenarioId?: string;
  category: 'OFFICIAL' | 'FAN_SCENARIO' | 'SPELLS_GRIMOIRE' | 'TOOLS_MODDING';
  title: string;
  subtitle: string;
  author: string;
  year: string;
  format: 'PDF' | 'HTML' | 'ZIP' | 'WEB';
  pages?: number | string;
  language: 'EN' | 'FR' | 'MULTI';
  descriptionFr: string;
  descriptionEn: string;
  primaryUrl: string;
  primaryLabelFr: string;
  primaryLabelEn: string;
  secondaryUrl?: string;
  secondaryLabelFr?: string;
  secondaryLabelEn?: string;
  badge?: string;
}

export const MANUALS_CATALOG: ManualItem[] = [
  // --- OPUS 1 : PROVING GROUNDS OF THE MAD OVERLORD ---
  {
    id: 'wiz1-manual-pdf',
    scenarioId: 'proving-grounds',
    category: 'OFFICIAL',
    title: 'Wizardry I: Proving Grounds of the Mad Overlord — Manuel Officiel',
    subtitle: 'Règles de jeu, création de personnage, exploration & combat',
    author: 'Andrew Greenberg & Robert Woodhead (Sir-Tech)',
    year: '1981',
    format: 'PDF',
    pages: '48 pages',
    language: 'EN',
    descriptionFr: 'Le manuel original officiel complet de Wizardry I. Décrit en détail les 8 classes, les caractéristiques (STR, I.Q., PIE, VIT, AGI, LUC), les règles de repos à l’Auberge, le combat au tour par tour et la survie dans le labyrinthe de Trebor.',
    descriptionEn: 'The original complete official manual for Wizardry I. Covers all 8 classes, primary attributes, inn resting, turn-based combat, and survival rules in Trebor’s 10-floor proving grounds.',
    primaryUrl: 'https://www.mocagh.org/sirtech/wiz1-manual.pdf',
    primaryLabelFr: 'Télécharger le Manuel PDF (Mocagh)',
    primaryLabelEn: 'Download Manual PDF (Mocagh)',
    secondaryUrl: 'https://archive.org/details/Wizardry_I_Manual',
    secondaryLabelFr: 'Consulter sur Internet Archive',
    secondaryLabelEn: 'View on Internet Archive',
    badge: 'Classique 1981'
  },
  {
    id: 'wiz1-refcard',
    scenarioId: 'proving-grounds',
    category: 'OFFICIAL',
    title: 'Wizardry I — Carte de Référence Rapide & Grimoire',
    subtitle: 'Tables des sorts mages & prêtres, raccourcis et commandes clavier',
    author: 'Sir-Tech Software',
    year: '1981',
    format: 'PDF',
    pages: '4 pages',
    language: 'EN',
    descriptionFr: 'La fiche cartonnée d’aide-mémoire fournie dans la boîte originale du jeu avec le résumé de tous les sorts magiques (Halito, Mahalito, Tiltowait, Dios, Dialko, etc.) et les commandes du clavier.',
    descriptionEn: 'The original quick reference card shipped in the game box featuring all mage and priest spells, keyboard controls, and combat commands.',
    primaryUrl: 'https://www.mocagh.org/sirtech/wiz1-refcard.pdf',
    primaryLabelFr: 'Télécharger la Fiche de Réf. (PDF)',
    primaryLabelEn: 'Download Reference Card (PDF)',
    secondaryUrl: 'https://www.zimlab.com/wizardry/recovered/flips/w1chart.htm',
    secondaryLabelFr: 'Table des Sorts en Ligne (Zimlab)',
    secondaryLabelEn: 'Online Spell Chart (Zimlab)'
  },
  {
    id: 'wiz1-cluebook',
    scenarioId: 'proving-grounds',
    category: 'OFFICIAL',
    title: 'Wizardry I — Livre d’Indices & Guide Stratégique',
    subtitle: 'Solution du donjon, plans des 10 étages et localisation de Werdna',
    author: 'Sir-Tech / Snafaru',
    year: '1982',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Guide d’exploration complet des 10 niveaux souterrains, énigmes des ascenseurs, clés d’argent et de bronze, localisation de la statue de grenouille et confrontation finale avec l’Archimage Werdna.',
    descriptionEn: 'Complete 10-floor walkthrough, elevator puzzle guides, silver & bronze keys, frog statuette, and the final confrontation with Werdna.',
    primaryUrl: 'https://www.zimlab.com/wizardry/wiz1clue.htm',
    primaryLabelFr: 'Consulter le Guide d’Indices (Zimlab)',
    primaryLabelEn: 'View Clue Book (Zimlab)'
  },

  // --- OPUS 2 : THE KNIGHT OF DIAMONDS ---
  {
    id: 'wiz2-manual-pdf',
    scenarioId: 'knight-of-diamonds',
    category: 'OFFICIAL',
    title: 'Wizardry II: The Knight of Diamonds — Manuel Officiel',
    subtitle: 'Règles du Scénario 2, armures magiques de Gnilda et importation de héros',
    author: 'Andrew Greenberg & Robert Woodhead (Sir-Tech)',
    year: '1982',
    format: 'PDF',
    pages: '32 pages',
    language: 'EN',
    descriptionFr: 'Le manuel officiel du Chevalier de Diamant. Explique le transfert de personnages de niveau 13+ depuis le Scénario I, les cinq pièces de l’armure légendaire (Épée Hrathnir, Cuirasse, Bouclier, Casque, Gantelets) et le bâton de Gnilda.',
    descriptionEn: 'Official Knight of Diamonds manual. Details hero importing (level 13+), the 5 pieces of the legendary Diamond armor (Hrathnir, Mail, Shield, Helm, Gauntlets), and the sacred staff of Gnilda.',
    primaryUrl: 'https://www.mocagh.org/sirtech/wiz2-manual.pdf',
    primaryLabelFr: 'Télécharger le Manuel PDF (Mocagh)',
    primaryLabelEn: 'Download Manual PDF (Mocagh)',
    secondaryUrl: 'https://archive.org/details/Wizardry_II_Knight_of_Diamonds_Manual',
    secondaryLabelFr: 'Consulter sur Internet Archive',
    secondaryLabelEn: 'View on Internet Archive',
    badge: 'Scénario II'
  },
  {
    id: 'wiz2-cluebook',
    scenarioId: 'knight-of-diamonds',
    category: 'OFFICIAL',
    title: 'Wizardry II — Livre d’Indices & Quête de Gnilda',
    subtitle: 'Guide des 6 étages, énigmes de la cité sacrée et gardiens des reliques',
    author: 'Snafaru Wizardry Archives',
    year: '1982',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Guide pas à pas des 6 niveaux du donjon de Llylgamyn pour retrouver les cinq reliques du Chevalier et franchir le labyrinthe de la déesse.',
    descriptionEn: 'Step-by-step walkthrough across the 6 dungeon levels to recover the Knight’s 5 relics and overcome the trials of Gnilda.',
    primaryUrl: 'https://www.zimlab.com/wizardry/recovered/flips/w2clue.htm',
    primaryLabelFr: 'Consulter le Guide des Reliques (Zimlab)',
    primaryLabelEn: 'View Knight Relics Guide (Zimlab)'
  },

  // --- OPUS 3 : LEGACY OF LLYLGAMYN ---
  {
    id: 'wiz3-manual-pdf',
    scenarioId: 'legacy-of-llylgamyn',
    category: 'OFFICIAL',
    title: 'Wizardry III: Legacy of Llylgamyn — Manuel Officiel',
    subtitle: 'Règles de descendance dynastique, dualité Bien / Mal et l’Orbe d’Erythran',
    author: 'Andrew Greenberg & Robert Woodhead (Sir-Tech)',
    year: '1983',
    format: 'PDF',
    pages: '36 pages',
    language: 'EN',
    descriptionFr: 'Le manuel officiel du Scénario 3. Présente la mécanique unique des descendants (nouveaux héros niveau 1 héritiers de leurs ancêtres), les restrictions d’alignement (les niveaux pairs pour le Mal, les impairs pour le Bien) et le dragon L’Kbreth.',
    descriptionEn: 'Official manual for Legacy of Llylgamyn. Introduces the lineage mechanics (level 1 descendants inheriting ancestral glory), alignment-restricted dungeon paths, and L’Kbreth the golden dragon.',
    primaryUrl: 'https://www.mocagh.org/sirtech/wiz3-manual.pdf',
    primaryLabelFr: 'Télécharger le Manuel PDF (Mocagh)',
    primaryLabelEn: 'Download Manual PDF (Mocagh)',
    secondaryUrl: 'https://archive.org/details/Wizardry_III_Legacy_of_Llylgamyn_Manual',
    secondaryLabelFr: 'Consulter sur Internet Archive',
    secondaryLabelEn: 'View on Internet Archive',
    badge: 'Scénario III'
  },
  {
    id: 'wiz3-cluebook',
    scenarioId: 'legacy-of-llylgamyn',
    category: 'OFFICIAL',
    title: 'Wizardry III — Livre d’Indices & Énigmes d’Erythran',
    subtitle: 'Guide des 6 niveaux ascensionnels de la montagne sacrée',
    author: 'Snafaru Wizardry Archives',
    year: '1983',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Solution détaillée des énigmes de la montagne magique : passage du navire pirate, énigme des miroirs, portails d’alignement et obtention de l’Orbe de Clarté.',
    descriptionEn: 'Complete guide to the mountain climb: pirate ship passage, mirror puzzles, alignment gates, and claiming the Orb of Clairvoyance.',
    primaryUrl: 'https://www.zimlab.com/wizardry/recovered/flips/w3clue.htm',
    primaryLabelFr: 'Consulter le Guide d’Erythran (Zimlab)',
    primaryLabelEn: 'View Clue Book (Zimlab)'
  },

  // --- OPUS 4 : THE RETURN OF WERDNA ---
  {
    id: 'wiz4-manual-pdf',
    scenarioId: 'return-of-werdna',
    category: 'OFFICIAL',
    title: 'Wizardry IV: The Return of Werdna — Manuel Officiel',
    subtitle: 'Incarnez l’Archimage Déchu, invoquez des monstres et échappez-vous vers la surface',
    author: 'Roe R. Adams III & Robert Woodhead (Sir-Tech)',
    year: '1987',
    format: 'PDF',
    pages: '44 pages',
    language: 'EN',
    descriptionFr: 'Le manuel mythique du jeu de rôle le plus diabolique de l’histoire. Vous y jouez le sorcier Werdna au fond de son propre donjon (Niveau 10) et devez remonter vers la lumière en affrontant des escouades de héros envoyés par Trebor !',
    descriptionEn: 'The official manual for the most notoriously challenging RPG ever made. Play as the evil wizard Werdna at the bottom of his dungeon (Level 10) and summon monsters to break out to the surface.',
    primaryUrl: 'https://www.mocagh.org/sirtech/wiz4-manual.pdf',
    primaryLabelFr: 'Télécharger le Manuel PDF (Mocagh)',
    primaryLabelEn: 'Download Manual PDF (Mocagh)',
    secondaryUrl: 'https://archive.org/details/wizardry-iv-manual',
    secondaryLabelFr: 'Consulter sur Internet Archive',
    secondaryLabelEn: 'View on Internet Archive',
    badge: 'Expert / Werdna'
  },
  {
    id: 'wiz4-cluebook',
    scenarioId: 'return-of-werdna',
    category: 'OFFICIAL',
    title: 'Wizardry IV — The Return of Werdna Clue Book & Bestiaire',
    subtitle: 'Liste des cercles d’invocation, monstres serviteurs et énigmes du donjon inversé',
    author: 'Sir-Tech / Snafaru',
    year: '1987',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Guide essentiel pour survivre dans Le Retour de Werdna : pentagrammes de régénération, composition optimale des groupes de monstres et solution des champs de mines et labyrinthes cosmiques.',
    descriptionEn: 'Essential survival guide: pentagram summoning, monster group composition, cosmic maze solutions, and defeating the paladin and archmages.',
    primaryUrl: 'https://www.zimlab.com/wizardry/recovered/flips/w4clue.htm',
    primaryLabelFr: 'Consulter le Guide de Werdna (Zimlab)',
    primaryLabelEn: 'View Werdna Clue Book (Zimlab)'
  },

  // --- COMPENDIUM & GRIMOIRES DES SORTS ---
  {
    id: 'wiz-archives-compendium',
    category: 'SPELLS_GRIMOIRE',
    title: 'The Ultimate Wizardry Archives — Le Grand Manuel Réuni (142 pages)',
    subtitle: 'Manuel de référence officiel complet couvrant Wizardry I, II, III, IV et V',
    author: 'Sir-Tech Software / Interplay',
    year: '1998',
    format: 'PDF',
    pages: '142 pages',
    language: 'EN',
    descriptionFr: 'Le document de référence absolu publié pour l’anthologie Ultimate Wizardry Archives. Contient les règles détaillées de toute la saga classique, les formules d’XP, les chances de coup critique, les sorts et les tables d’objets.',
    descriptionEn: 'The definitive 142-page reference rulebook published with the Ultimate Wizardry Archives. Includes comprehensive rules, XP formulas, critical hit rates, spellbooks, and item tables across Wizardry 1 through 5.',
    primaryUrl: 'http://www.wizardryarchives.com/downloads/archivesmanual.pdf',
    primaryLabelFr: 'Télécharger le Compendium PDF (142 p.)',
    primaryLabelEn: 'Download Compendium PDF (142 p.)',
    secondaryUrl: 'https://archive.org/details/wizardry-compendium',
    secondaryLabelFr: 'Consulter sur Internet Archive',
    secondaryLabelEn: 'View on Internet Archive',
    badge: 'Référence Totale'
  },
  {
    id: 'wiz-spells-encyclopedia',
    category: 'SPELLS_GRIMOIRE',
    title: 'Grimoire Universel des 50 Sorts de Wizardry 1 à 5',
    subtitle: 'Description de chaque sort magique et sacerdotal (Niveau 1 à 7), dégâts et effets',
    author: 'Snafaru Wizardry Archives',
    year: '2000',
    format: 'WEB',
    language: 'MULTI',
    descriptionFr: 'Encyclopédie de référence décrivant tous les 50 sorts du jeu : dégâts exacts, zones d’effet (1 monstre, un groupe ou tous les monstres), effets de statut (sommeil, paralysie, mort, silence) et formules de résistance.',
    descriptionEn: 'Reference compendium detailing all 50 spells across 7 levels: exact dice damage, targets (single, group, all groups), status effects (sleep, paralysis, silence, stone), and saving throw mechanics.',
    primaryUrl: 'https://www.zimlab.com/wizardry/walk/wiz15spells.htm',
    primaryLabelFr: 'Consulter l’Encyclopédie des Sorts (Zimlab)',
    primaryLabelEn: 'View Spells Encyclopedia (Zimlab)',
    secondaryUrl: 'https://www.zimlab.com/wizardry/recovered/flips/w1chart.htm',
    secondaryLabelFr: 'Table Synthétique des Sorts',
    secondaryLabelEn: 'Compact Spell Chart'
  },

  // --- SCÉNARIOS DE FANS & ZIMLAB ARCHIVES ---
  {
    id: 'zimlab-portal',
    category: 'FAN_SCENARIO',
    title: 'Zimlab Wizardry Portal — Le Sanctuaire Mondial de Snafaru',
    subtitle: 'Le portail historique de référence pour tous les joueurs et moddeurs de Wizardry',
    author: 'Snafaru (Fondateur de Zimlab)',
    year: '1999-2026',
    format: 'WEB',
    language: 'MULTI',
    descriptionFr: 'Le site d’archives le plus complet au monde dédié à Wizardry. Héberge les guides de tous les opus, les cartes dessinées à la main, les scénarios de fans, les utilitaires Apple II / DOS et les secrets de programmation Pascal.',
    descriptionEn: 'The definitive global fan repository created by Snafaru. Houses walkthroughs, dungeon maps, community scenarios, modding toolkits, and Apple II / DOS engine documentation.',
    primaryUrl: 'https://www.zimlab.com/wizardry/',
    primaryLabelFr: 'Visiter le Portail Zimlab (Snafaru)',
    primaryLabelEn: 'Visit Zimlab Portal (Snafaru)',
    secondaryUrl: 'https://www.zimlab.com/wizardry/scenarios.htm',
    secondaryLabelFr: 'Liste des Scénarios de Fan',
    secondaryLabelEn: 'Fan Scenarios Archive',
    badge: 'Zimlab / Snafaru'
  },
  {
    id: 'zimlab-fan-scenarios-hub',
    category: 'FAN_SCENARIO',
    title: 'Archives des Scénarios Alternatifs & Scénarios de la Communauté',
    subtitle: 'DragonQuest, Catacombs of Vlad, The Black Stone, Knight of the Grave, Scarlet Brotherhood...',
    author: 'Communauté Zimlab & Auteurs Indépendants',
    year: '1982-2024',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Catalogue officiel des scénarios custom créés par la communauté passionnée de Wizardry : Atomic Wasteland 2098, DragonQuest par Eric Labelle, The Black Stone, Catacombs of Vlad, O’Connor’s Mine et Scarlet Brotherhood.',
    descriptionEn: 'Central catalog of community-authored Wizardry adventures: Atomic Wasteland 2098, Eric Labelle’s DragonQuest, The Black Stone, Catacombs of Vlad, O’Connor’s Mine, and Scarlet Brotherhood.',
    primaryUrl: 'https://www.zimlab.com/wizardry/scenarios.htm',
    primaryLabelFr: 'Explorer les Scénarios de Fan (Zimlab)',
    primaryLabelEn: 'Explore Fan Scenarios (Zimlab)'
  },
  {
    id: 'fan-black-stone-guide',
    scenarioId: 'black-stone',
    category: 'FAN_SCENARIO',
    title: 'The Black Stone — Guide & Cartes de la Pierre Noire',
    subtitle: 'Solution du donjon aux 8 niveaux de pièges et monstres mystiques',
    author: 'Zimlab Archives',
    year: '1999',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Cartes complètes et guide de survie pour The Black Stone, l’une des créations les plus célèbres de la communauté Wizardry, proposant 8 niveaux d’énigmes corsées.',
    descriptionEn: 'Complete maps and hints for The Black Stone, one of the most celebrated fan scenarios featuring 8 challenging labyrinth levels.',
    primaryUrl: 'https://www.zimlab.com/wizardry/walk/wstone.htm',
    primaryLabelFr: 'Guide & Cartes The Black Stone',
    primaryLabelEn: 'Guide & Maps The Black Stone'
  },
  {
    id: 'fan-dragonquest-guide',
    scenarioId: 'dragonquest',
    category: 'FAN_SCENARIO',
    title: 'DragonQuest — Guide de la Quête d’Eric Labelle',
    subtitle: 'L’exploration du repaire des dragons et de l’antre de la bête suprême',
    author: 'Eric Labelle (Zimlab)',
    year: '1985',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Solution et guide d’aventure pour DragonQuest, la campagne culte mettant en scène des clans de dragons, des artefacts sacrés et des donjons vertigineux.',
    descriptionEn: 'Walkthrough and tips for Eric Labelle’s DragonQuest, featuring dragon clans, sacred relics, and grueling subterranean chambers.',
    primaryUrl: 'https://www.zimlab.com/wizardry/walk/wdrag.htm',
    primaryLabelFr: 'Guide DragonQuest (Zimlab)',
    primaryLabelEn: 'DragonQuest Guide (Zimlab)'
  },
  {
    id: 'fan-oconnor-guide',
    scenarioId: 'oconnors-mine',
    category: 'FAN_SCENARIO',
    title: 'O’Connor’s Mine — Guide des Mines Maudites',
    subtitle: 'Cartes des galeries minières, pièges d’éboulement et trésors des profondeurs',
    author: 'Zimlab Archives',
    year: '1998',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'Plans des galeries souterraines et secrets des mines perdues d’O’Connor créées pour les aventuriers expérimentés.',
    descriptionEn: 'Dungeon maps and secrets of the abandoned O’Connor mines designed for seasoned dungeon crawlers.',
    primaryUrl: 'https://www.zimlab.com/wizardry/walk/wocon.htm',
    primaryLabelFr: 'Guide O’Connor’s Mine (Zimlab)',
    primaryLabelEn: 'O’Connor’s Mine Guide (Zimlab)'
  },

  // --- OUTILS & MODDING ---
  {
    id: 'zimlab-modding-tools',
    category: 'TOOLS_MODDING',
    title: 'Boîte à Outils de Modding & Utilitaires Wizardry',
    subtitle: 'WizEdit, WIZ5MAP, éditeurs de disquettes Pascal, cartographes et désassembleurs',
    author: 'Zimlab Toolmakers',
    year: '2000-2025',
    format: 'WEB',
    language: 'EN',
    descriptionFr: 'La collection ultime d’outils pour explorer, modifier et créer des scénarios Wizardry : éditeurs de personnages WizEdit, extracteurs de disquettes Apple II / DOS, visualisateurs de labyrinthes et outils Pascal.',
    descriptionEn: 'The premier modding toolkit collection for Wizardry enthusiasts: WizEdit character editors, Apple II & DOS disk extractors, maze visualizers, and UCSD Pascal reverse-engineering tools.',
    primaryUrl: 'https://www.zimlab.com/wizardry/utilities.htm',
    primaryLabelFr: 'Accéder aux Utilitaires & Éditeurs (Zimlab)',
    primaryLabelEn: 'Access Modding Tools (Zimlab)',
    badge: 'Modding & Code'
  }
];

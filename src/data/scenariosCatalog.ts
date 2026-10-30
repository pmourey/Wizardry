export interface WizardryScenarioMeta {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  subtitleEn?: string;
  author: string;
  year: string;
  engineVersion: string;
  recommendedLevel: string;
  recommendedLevelEn?: string;
  minLevel: number;
  floors: number;
  theme: 'FANTASY' | 'ORIENTAL' | 'GOTHIC' | 'SCIFI';
  difficulty: 'CLASSIQUE' | 'INTERMÉDIAIRE' | 'DIFFICILE' | 'EXPERT';
  difficultyEn?: 'CLASSIC' | 'INTERMEDIATE' | 'DIFFICULT' | 'EXPERT';
  diskFileName: string;
  description: string;
  descriptionEn?: string;
  tips: string[];
  tipsEn?: string[];
  sequelTo?: string;
  dataExtracted: boolean;
  castleName?: string;
  castleNameEn?: string;
  castleSubtitle?: string;
  castleSubtitleEn?: string;
  castleWelcome?: string;
  castleWelcomeEn?: string;
  castleDescription?: string;
  castleDescriptionEn?: string;
  trainingGroundsName?: string;
  trainingGroundsNameEn?: string;
}

export function getLocalizedScenario(scen: WizardryScenarioMeta, lang: 'fr' | 'en'): WizardryScenarioMeta {
  if (lang === 'en') {
    return {
      ...scen,
      subtitle: scen.subtitleEn || scen.subtitle,
      recommendedLevel: scen.recommendedLevelEn || scen.recommendedLevel,
      difficulty: (scen.difficultyEn as any) || scen.difficulty,
      description: scen.descriptionEn || scen.description,
      tips: scen.tipsEn || scen.tips,
      castleName: scen.castleNameEn || scen.castleName,
      castleSubtitle: scen.castleSubtitleEn || scen.castleSubtitle,
      castleWelcome: scen.castleWelcomeEn || scen.castleWelcome,
      castleDescription: scen.castleDescriptionEn || scen.castleDescription,
      trainingGroundsName: scen.trainingGroundsNameEn || scen.trainingGroundsName,
    };
  }
  return scen;
}

export const WIZARDRY_SCENARIOS: WizardryScenarioMeta[] = [
  {
    id: 'proving-grounds',
    number: 1,
    title: 'Proving Grounds of the Mad Overlord',
    subtitle: 'Wizardry I officiel fondateur (Sir-Tech, 1981)',
    subtitleEn: 'Official Founding Wizardry I (Sir-Tech, 1981)',
    author: 'Andrew Greenberg & Robert Woodhead (v3.2 Snafaru)',
    year: '1981 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'CLASSIQUE',
    difficultyEn: 'CLASSIC',
    diskFileName: 'proving-grounds.dsk',
    description:
      "Par décret de l'Overlord Trebor, descendez dans les 10 niveaux du labyrinthe souterrain pour affronter le sorcier renégat Werdna et reconquérir l'Amulette sacrée.",
    descriptionEn:
      "By decree of the Mad Overlord Trebor, delve into the 10 levels of the subterranean maze to vanquish the renegade wizard Werdna and retrieve the sacred Amulet.",
    tips: [
      'Scénario original complet (10 étages, 101 monstres, 101 objets).',
      'Idéal pour créer et entraîner une nouvelle escouade de niveau 1.'
    ],
    tipsEn: [
      'Original complete scenario (10 floors, 101 monsters, 101 items).',
      'Ideal for creating and training a fresh 1st-level party.'
    ],
    castleName: "Château de Trebor",
    castleNameEn: "Castle of Trebor",
    castleSubtitle: "Cité de garnison surplombant le Labyrinthe de Werdna",
    castleSubtitleEn: "Garrison city overlooking Werdna's Proving Grounds",
    castleWelcome: "Bienvenue dans les Terres de l'Overlord Trebor",
    castleWelcomeEn: "Welcome to the Lands of the Overlord Trebor",
    castleDescription: "Le tyran et mage maléfique Werdna s'est emparé de la sainte amulette et s'est retranché au dixième sous-sol du labyrinthe magique. Composez votre escouade, équipez-vous chez Boltac, bénissez vos héros au Temple de Cant et plongez dans le dédale.",
    castleDescriptionEn: "The evil wizard Werdna has stolen the sacred amulet and retreated to the tenth floor of the magical proving grounds. Assemble your party, gear up at Boltac's, seek blessings at the Temple of Cant, and venture into the maze.",
    trainingGroundsName: "Terrain d'Entraînement de Trebor",
    trainingGroundsNameEn: "Trebor's Training Grounds",
    dataExtracted: true
  },
  {
    id: 'knight-of-diamonds',
    number: 2,
    title: 'The Knight of Diamonds',
    subtitle: 'Wizardry II officiel (Sir-Tech, 1982)',
    subtitleEn: 'Official Wizardry II (Sir-Tech, 1982)',
    author: 'Andrew Greenberg & Robert Woodhead',
    year: '1982',
    engineVersion: 'v2.0 / Apple II',
    recommendedLevel: 'Niveau 9+',
    recommendedLevelEn: 'Level 9+',
    minLevel: 9,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    difficultyEn: 'DIFFICULT',
    diskFileName: 'knight-of-diamonds.dsk',
    description:
      'Le légendaire deuxième volet officiel de Wizardry ! La cité sainte de Llylgamyn est menacée : retrouvez les pièces de l’Armure de Diamant du Chevalier et le Bâton Sacré de Gnilda pour restaurer la bénédiction divine.',
    descriptionEn:
      "The legendary second official chapter of Wizardry! The holy city of Llylgamyn is besieged: recover the pieces of the Knight's Diamond Armor and the Staff of Gnilda to restore the divine aegis.",
    tips: [
      'Scénario officiel Sir-Tech d’origine (130 objets, 78 monstres, 30 portraits de monstres Apple II).',
      'Fourni avec une escouade de départ niveau 9-10 équipée de reliques de diamant et d’armes +1.',
      'Les sorts et combats y sont redoutables dès le premier sous-sol.'
    ],
    tipsEn: [
      'Original Sir-Tech scenario (130 items, 78 monsters, 30 authentic Apple II portraits).',
      'Includes a pre-rolled Level 9-10 starter party equipped with diamond relics and +1 weaponry.',
      'Spells and encounters are lethal starting on the very first floor.'
    ],
    sequelTo: 'proving-grounds',
    castleName: "Cité Sainte de Llylgamyn",
    castleNameEn: "Holy City of Llylgamyn",
    castleSubtitle: "Sanctuaire sacré sous la bénédiction de Gnilda",
    castleSubtitleEn: "Sacred sanctuary under the aegis of Gnilda",
    castleWelcome: "Bienvenue dans la Cité assiégée de Llylgamyn",
    castleWelcomeEn: "Welcome to the Besieged City of Llylgamyn",
    castleDescription: "Les armées du mal menacent la cité sainte. Retrouvez les 5 pièces légendaires de l'Armure du Chevalier de Diamant et le Bâton Sacré de Gnilda pour rétablir la barrière divine protectrice.",
    castleDescriptionEn: "The armies of evil threaten the holy city. Recover the 5 legendary pieces of the Diamond Knight's armor and the Sacred Staff of Gnilda to re-establish the divine protective barrier.",
    trainingGroundsName: "Garnison des Chevaliers de Gnilda",
    trainingGroundsNameEn: "Knights of Gnilda Garrison",
    dataExtracted: true
  },
  {
    id: 'legacy-of-llylgamyn',
    number: 3,
    title: 'The Legacy of Llylgamyn',
    subtitle: 'Wizardry III officiel (Sir-Tech, 1983)',
    subtitleEn: 'Official Wizardry III (Sir-Tech, 1983)',
    author: 'Andrew Greenberg & Robert Woodhead',
    year: '1983',
    engineVersion: 'v3.0 / Apple II',
    recommendedLevel: 'Niveau 1+ (Descendants)',
    recommendedLevelEn: 'Level 1+ (Descendants)',
    minLevel: 1,
    floors: 6,
    theme: 'FANTASY',
    difficulty: 'EXPERT',
    difficultyEn: 'EXPERT',
    diskFileName: 'legacy-of-llylgamyn.dsk',
    description:
      "Le troisième volet de la trilogie classique ! Des séismes et des éruptions volcaniques menacent Llylgamyn. Les descendants des héros doivent gravir les 6 niveaux de la montagne sacrée pour reconquérir l'Orbe magique gardé par le grand dragon céleste L'Kbreth.",
    descriptionEn:
      "The third chapter of the classic trilogy! Earthquakes and volcanic eruptions threaten to swallow Llylgamyn. Descendants of the legendary heroes must ascend the 6 floors of the sacred mountain to claim the Orb of Eregion guarded by the celestial dragon L'Kbreth.",
    tips: [
      "Scénario officiel Sir-Tech d'origine (104 objets, 78 monstres, 30 portraits originaux Apple II, 6 niveaux de montagne sacrée).",
      "Donjon vertical ascendant avec énigmes sacrées et zones scellées par l'alignement (Bien / Mal).",
      "Fourni avec une escouade de descendants préparée pour l'ascension de la montagne sacrée."
    ],
    tipsEn: [
      "Original Sir-Tech scenario (104 items, 78 monsters, 30 Apple II portraits, 6 mountain floors).",
      "Ascending vertical dungeon with sacred puzzles and alignment-restricted floors (Good / Evil).",
      "Includes an equipped descendant party ready for the sacred mountain ascent."
    ],
    sequelTo: 'knight-of-diamonds',
    castleName: "Sanctuaire de Llylgamyn",
    castleNameEn: "Sanctuary of Llylgamyn",
    castleSubtitle: "Au pied du Volcan et de la Montagne Sacrée de L'Kbreth",
    castleSubtitleEn: "At the foot of the Volcano and L'Kbreth's Sacred Mountain",
    castleWelcome: "Bienvenue au Sanctuaire des Descendants de Llylgamyn",
    castleWelcomeEn: "Welcome to the Sanctuary of Llylgamyn's Descendants",
    castleDescription: "Des tremblements de terre et l'éveil du volcan menacent d'engloutir la cité. Les descendants des champions de Gnilda doivent gravir la montagne sacrée de 6 niveaux et braver les épreuves d'alignement pour rapporter l'Orbe de L'Kbreth.",
    castleDescriptionEn: "Earthquakes and volcanic fury threaten to destroy the city. The descendants of Gnilda's champions must climb the 6-tier sacred mountain and brave the trials of alignment to recover the Orb of L'Kbreth.",
    trainingGroundsName: "Sanctuaire d'Entraînement des Descendants",
    trainingGroundsNameEn: "Training Grounds of the Descendants",
    dataExtracted: true
  },
  {
    id: 'return-of-werdna',
    number: 4,
    title: 'The Return of Werdna',
    subtitle: 'Wizardry IV officiel (Sir-Tech, 1987) - La Revanche de Werdna',
    subtitleEn: 'Official Wizardry IV (Sir-Tech, 1987) - The Revenge of Werdna',
    author: 'Roe R. Adams III, Robert Woodhead & Andrew Greenberg',
    year: '1987',
    engineVersion: 'v4.0 (Inverted Engine)',
    recommendedLevel: 'Werdna Niv. 1 (Gravir du B10 au B1)',
    recommendedLevelEn: 'Werdna Lvl 1 (Climb from B10 to B1)',
    minLevel: 1,
    floors: 10,
    theme: 'GOTHIC',
    difficulty: 'EXPERT',
    difficultyEn: 'EXPERT',
    diskFileName: 'return-of-werdna.dsk',
    description:
      "Le chef-d'œuvre le plus retors de la saga ! L'Overlord Trebor vous a terrassé et scellé au sous-sol 10 de votre propre dédale. Dépouillé de vos pouvoirs et de l'Amulette, vous incarnez le mage Werdna. Invoquez des légions de monstres aux pentagrammes, triomphez des groupes d'aventuriers do-gooders à vos trousses, défiez le spectre vengeur de Trebor et remontez les 10 niveaux jusqu'à la surface !",
    descriptionEn:
      "The most devious masterpiece of the series! The Mad Overlord Trebor has defeated and sealed you in Basement 10 of your own maze. Stripped of your powers and the Amulet, you play as the evil wizard Werdna. Summon monster legions at mystical pentagrams, crush invading do-gooder adventurer parties, elude the vengeful Ghost of Trebor, and ascend all 10 levels back to the surface!",
    tips: [
      'Gameplay inversé mythique : vous contrôlez le grand sorcier Werdna et invoquez des serviteurs monstrueux.',
      'Les ennemis sont des escouades de héros complets équipés de sorts dévastateurs.',
      'Ne flânez pas trop longtemps sur un étage sous peine de réveiller le spectre mortel de Trebor.',
      'Résolvez le légendaire Cube Cosmique et récupérez la Bloodstone pour reconquérir votre domaine.'
    ],
    tipsEn: [
      'Legendary inverted gameplay: control the arch-mage Werdna and summon monstrous minions.',
      'Enemies are full parties of do-gooder adventurers wielding lethal spells.',
      'Do not linger too long on any floor or the deadly Ghost of Trebor will hunt you down.',
      'Navigate the infamous Cosmic Cube and harness the Bloodstone to reclaim your empire.'
    ],
    sequelTo: 'proving-grounds',
    castleName: "Tombeau de Werdna (Sous-sol 10)",
    castleNameEn: "Werdna's Tomb (Basement 10)",
    castleSubtitle: "L'Antre de pierre scellé par l'Overlord Trebor",
    castleSubtitleEn: "Stone lair sealed by the Mad Overlord Trebor",
    castleWelcome: "Éveil de Werdna dans les ténèbres du tombeau",
    castleWelcomeEn: "Awakening of Werdna in the dark tomb",
    castleDescription: "Trahi et dépouillé de votre Amulette sacrée, vous sortez d'un millénaire de sommeil au plus profond du dédale. Les groupes d'aventuriers de Trebor ont envahi vos couloirs. Invoquez vos serviteurs ténébreux aux pentagrammes, gravissez les 10 niveaux et punissez les intrus jusqu'à la surface !",
    castleDescriptionEn: "Betrayed and stripped of your sacred Amulet, you awaken from a millennium of slumber at the lowest depths of the labyrinth. Trebor's adventurer parties have invaded your halls. Summon your dark minions at pentagrams, ascend the 10 levels, and exact vengeance upon the surface!",
    trainingGroundsName: "Cercle d'Invocation de Werdna",
    trainingGroundsNameEn: "Werdna's Summoning Circle",
    dataExtracted: true
  },
  {
    id: 'black-stone',
    number: 5,
    title: 'The Black Stone',
    subtitle: 'La Pierre Noire aux 8 niveaux de pièges et d’énigmes',
    subtitleEn: 'The Black Stone: 8 levels of traps and puzzles',
    author: 'Steve Evans (v3.2 Snafaru)',
    year: '1985 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 8,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    difficultyEn: 'DIFFICULT',
    diskFileName: 'black-stone.dsk',
    description:
      'Créé en 1985, ce scénario de 8 étages introduit des monstres, objets, pièges et énigmes inédits. Plus exigeant que Proving Grounds, il mêle humour britannique et casse-têtes retors.',
    descriptionEn:
      'Authored in 1985, this 8-floor campaign introduces brand-new monsters, items, traps, and puzzles. More demanding than Proving Grounds, it blends clever British wit with devious brainteasers.',
    tips: [
      'Commencez avec des guerriers ayant 18 en Force et une haute Agilité.',
      'Importation de personnages possible (sans équipement).'
    ],
    tipsEn: [
      'Begin with warriors boasting 18 Strength and high Agility.',
      'Character transfer from other scenarios available (without equipment).'
    ],
    castleName: "Citadelle de la Pierre Noire",
    castleNameEn: "Citadel of the Black Stone",
    castleSubtitle: "Avant-poste fortifié aux portes du monolithe d'ébène",
    castleSubtitleEn: "Fortified outpost before the ebony monolith",
    castleWelcome: "Bienvenue dans le Fief de la Pierre Noire",
    castleWelcomeEn: "Welcome to the Stronghold of the Black Stone",
    castleDescription: "Une puissance tellurique et corruptrice émane de la Pierre Noire, dissimulée au huitième sous-sol. Équipez vos aventuriers et préparez-vous à affronter des énigmes complexes et des monstres retors.",
    castleDescriptionEn: "A corrupting telluric power radiates from the Black Stone, hidden on the eighth basement level. Equip your adventurers and brace for complex riddles and cunning monsters.",
    trainingGroundsName: "Casernement de la Pierre Noire",
    trainingGroundsNameEn: "Black Stone Barracks",
    dataExtracted: true
  },
  {
    id: 'catacombs-of-vlad',
    number: 6,
    title: 'Catacombs of Vlad',
    subtitle: 'Les Catacombes vampiriques du Comte Vlad',
    subtitleEn: "Count Vlad's Vampiric Catacombs",
    author: 'Joel Fenton (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'GOTHIC',
    difficulty: 'INTERMÉDIAIRE',
    difficultyEn: 'INTERMEDIATE',
    diskFileName: 'catacombs-of-vlad.dsk',
    description:
      'Explorez des cryptes gothiques infestées de morts-vivants et de créatures nocturnes jusqu’au repaire de Vlad. L’architecture du labyrinthe récompense une cartographie méthodique.',
    descriptionEn:
      "Explore gothic crypts crawling with undead and nightmarish fiends down to Count Vlad's lair. The maze's clever layout rewards disciplined mapping.",
    tips: [
      'Achetez beaucoup d’Ail (Garlic) chez Boltac avant de descendre !',
      'Prévoyez au moins un Prêtre ou un Bishop pour dissiper les morts-vivants.'
    ],
    tipsEn: [
      "Stock up on Garlic at Boltac's before heading into the crypts!",
      'Bring at least one Priest or Bishop to dispel undead packs.'
    ],
    castleName: "Domaine de Vlad",
    castleNameEn: "Domain of Vlad",
    castleSubtitle: "Forteresse gothique bordant la forêt des brumes",
    castleSubtitleEn: "Gothic fortress bordering the misty forest",
    castleWelcome: "Bienvenue au Domaine Oublié de Vlad",
    castleWelcomeEn: "Welcome to Vlad's Forgotten Domain",
    castleDescription: "Les cryptes millénaires du Comte Vlad s'enfoncent sous la pierre. Des vampires, spectres et créatures nocturnes rôdent dans l'ombre. Munissez-vous d'ail et d'eau bénite au Temple avant de descendre.",
    castleDescriptionEn: "Count Vlad's ancient crypts descend beneath cold stone. Vampires, spectres, and night-stalkers prowl the shadows. Arm yourselves with garlic and holy blessings before descending.",
    trainingGroundsName: "Crypte d'Entraînement Nocturne",
    trainingGroundsNameEn: "Nocturnal Training Crypt",
    dataExtracted: true
  },
  {
    id: 'dragonquest',
    number: 7,
    title: 'DragonQuest',
    subtitle: 'La Quête draconique d’Eric Labelle',
    subtitleEn: "Eric Labelle's Draconic Quest",
    author: 'Eric Labelle / Snafaru',
    year: '2024 / 2026',
    engineVersion: 'v3.2 (v1.4)',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'INTERMÉDIAIRE',
    difficultyEn: 'INTERMEDIATE',
    diskFileName: 'dragonquest.dsk',
    description:
      'Inspiré de l’univers heroic fantasy classique : affrontez des dragons ancestraux, découvrez des artefacts oubliés et parcourez un dédale aux secrets multiples.',
    descriptionEn:
      'Inspired by classic heroic fantasy: battle ancient dragons, uncover forgotten relics, and navigate a sprawling labyrinth filled with hidden secrets.',
    tips: [
      'Les souffles de dragon sont mortels : montez vite en niveau pour les PV.',
      'Un Ninja bien entraîné devient redoutable dans les derniers sous-sols.'
    ],
    tipsEn: [
      'Dragon breath attacks are deadly: level up early to build your HP pool.',
      'A seasoned Ninja becomes devastating in the deeper sublevels.'
    ],
    castleName: "Bastion Draconique",
    castleNameEn: "Dragon's Bastion",
    castleSubtitle: "Campement avancé aux frontières de l'antre des wyrms",
    castleSubtitleEn: "Forward encampment at the border of the wyrm dens",
    castleWelcome: "Bienvenue au Camp de la Quête du Dragon",
    castleWelcomeEn: "Welcome to the DragonQuest Encampment",
    castleDescription: "Des wyrms antiques et des bêtes draconiques gardent un trésor légendaire enfoui dans les profondeurs. Formez une escouade valeureuse et prenez garde aux souffles élémentaires dévastateurs.",
    castleDescriptionEn: "Ancient wyrms and draconic beasts guard legendary treasures in the deep. Assemble a stalwart party and beware devastating elemental breath attacks.",
    trainingGroundsName: "Cour d'Entraînement des Tueurs de Dragons",
    trainingGroundsNameEn: "Dragonslayer Training Yard",
    dataExtracted: true
  },
  {
    id: 'knight-of-the-grave',
    number: 8,
    title: 'Knight of the Grave',
    subtitle: 'Le Chevalier de la Tombe & les Rois Squelettes',
    subtitleEn: 'The Knight of the Grave & the Skeleton Kings',
    author: 'K.O.G. Team (v3.2 Snafaru)',
    year: '1987 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'GOTHIC',
    difficulty: 'DIFFICILE',
    difficultyEn: 'DIFFICULT',
    diskFileName: 'knight-of-the-grave.dsk',
    description:
      'Un donjon ténébreux où reposent les dépouilles maudites d’une ancienne dynastie de chevaliers noirs. Les sorts de dissipation et de soins seront vos meilleurs alliés.',
    descriptionEn:
      'A grim dungeon where the cursed remains of an ancient dynasty of black knights rest. Dispel spells and healing will be your greatest allies.',
    tips: [
      'Les malédictions d’équipement y sont fréquentes : identifiez avec soin.',
      'Évitez de vous précipiter dans les salles sans cartographier.'
    ],
    tipsEn: [
      'Cursed gear is commonplace: identify everything with extreme caution.',
      'Never rush into dark chambers without keeping an accurate map.'
    ],
    castleName: "Mausolée des Rois Enfouis",
    castleNameEn: "Mausoleum of Buried Kings",
    castleSubtitle: "Portail fortifié surplombant la Nécropole Maudite",
    castleSubtitleEn: "Fortified gateway overlooking the Cursed Necropolis",
    castleWelcome: "Bienvenue au Seuil de la Tombe Éternelle",
    castleWelcomeEn: "Welcome to the Threshold of the Eternal Grave",
    castleDescription: "Le Chevalier de la Tombe et ses suzerains squelettes hantent les catacombes royales. Rompez le pacte ténébreux et libérez les âmes en peine captives du sous-sol.",
    castleDescriptionEn: "The Knight of the Grave and his skeletal overlords haunt the royal catacombs. Break the unholy covenant and liberate the captive souls below.",
    trainingGroundsName: "Lice des Paladins Purificateurs",
    trainingGroundsNameEn: "Purifying Paladins' Yard",
    dataExtracted: true
  },
  {
    id: 'scarlet-brotherhood',
    number: 9,
    title: 'Scarlet Brotherhood of Hsi-So',
    subtitle: 'La Confrérie Écarlate et ses Moines Assassins',
    subtitleEn: 'The Scarlet Brotherhood & its Assassin Monks',
    author: 'Hsi-So Masters (v3.2 Snafaru)',
    year: '1985 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'ORIENTAL',
    difficulty: 'DIFFICILE',
    difficultyEn: 'DIFFICULT',
    diskFileName: 'scarlet-brotherhood.dsk',
    description:
      'Une secte martiale impitoyable garde les passages de son monastère secret. Arts martiaux mortels, poisons exotiques et pièges sournois vous attendent.',
    descriptionEn:
      'A ruthless martial order guards the passages of their clandestine monastery. Deadly martial arts, exotic venoms, and deceitful traps await.',
    tips: [
      'Les voleurs et ninjas ennemis infligent des coups critiques létaux.',
      'Gardez toujours le sort LATUMOFI mémorisé pour neutraliser les poisons.'
    ],
    tipsEn: [
      'Enemy rogues and ninjas execute lethal critical strikes.',
      'Always keep LATUMOFI ready to cure sudden poisonings.'
    ],
    castleName: "Monastère de Hsi-So",
    castleNameEn: "Monastery of Hsi-So",
    castleSubtitle: "Forteresse orientale de la Confrérie Écarlate",
    castleSubtitleEn: "Eastern fortress of the Scarlet Brotherhood",
    castleWelcome: "Bienvenue aux Abords du Monastère de Hsi-So",
    castleWelcomeEn: "Welcome to the Grounds of Hsi-So Monastery",
    castleDescription: "Les disciples fanatiques de la Confrérie Écarlate gardent jalousement leurs parchemins secrets. Leurs poisons foudroyants et leurs coups critiques exigeront une prudence absolue.",
    castleDescriptionEn: "Fanatical disciples of the Scarlet Brotherhood guard secret scrolls. Their virulent poisons and decapitating strikes demand total vigilance.",
    trainingGroundsName: "Dojo d'Exercice Martial",
    trainingGroundsNameEn: "Martial Training Dojo",
    dataExtracted: true
  },
  {
    id: 'nihonbashi',
    number: 10,
    title: 'Nihonbashi (日本橋)',
    subtitle: 'Le Pont du Levant et les Ombres d’Edo',
    subtitleEn: 'Bridge of the Rising Sun & Shadows of Edo',
    author: 'Auteurs Japonais / Snafaru',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'ORIENTAL',
    difficulty: 'INTERMÉDIAIRE',
    difficultyEn: 'INTERMEDIATE',
    diskFileName: 'nihonbashi.dsk',
    description:
      'Plongez dans un univers inspiré du folklore nippon médiéval : katanas légendaires, démons oni, esprits yokai et samouraïs déchus peuplent ces 10 niveaux.',
    descriptionEn:
      'Immerse yourself in feudal Japanese lore: legendary katanas, oni fiends, yokai spirits, and fallen samurai inhabit these 10 atmospheric levels.',
    tips: [
      'Scénario très équilibré mettant en valeur les classes Samouraï et Ninja.',
      'Les armes orientales trouvées dans le dédale possèdent des bonus puissants.'
    ],
    tipsEn: [
      'Well-balanced scenario highlighting Samurai and Ninja classes.',
      'Eastern weapons discovered in the depths provide potent combat enhancements.'
    ],
    castleName: "Quartier de Nihonbashi (日本橋)",
    castleNameEn: "Nihonbashi District (日本橋)",
    castleSubtitle: "Le Pont Impérial aux confins d'Edo",
    castleSubtitleEn: "The Imperial Bridge at the edge of Edo",
    castleWelcome: "Bienvenue à Nihonbashi, Cité des Samouraïs",
    castleWelcomeEn: "Welcome to Nihonbashi, City of Samurai",
    castleDescription: "Le quartier historique de Nihonbashi est le théâtre d'affrontements entre clans guerriers et esprits yokai. Honorez la voie du guerrier, affûtez vos lames et purifiez le temple ancestral.",
    castleDescriptionEn: "Historic Nihonbashi has become a battleground between warrior clans and yokai spirits. Honor the warrior code, hone your blades, and cleanse the ancestral temple.",
    trainingGroundsName: "Dojo Central de Nihonbashi",
    trainingGroundsNameEn: "Central Nihonbashi Dojo",
    dataExtracted: true
  },
  {
    id: 'oconnors-mine',
    number: 11,
    title: "O'Connor's Mine",
    subtitle: 'Les Galeries Minières Oubliées',
    subtitleEn: 'The Forgotten Mining Galleries',
    author: 'O’Connor & Associates (v3.2 Snafaru)',
    year: '1985 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'INTERMÉDIAIRE',
    difficultyEn: 'INTERMEDIATE',
    diskFileName: 'oconnors-mine.dsk',
    description:
      'Une mine naine abandonnée après le percement d’une brèche vers les abysses. Faux tunnels, éboulements et créatures souterraines barrent la route vers les filons précieux.',
    descriptionEn:
      'A dwarven mine abandoned after a breach into the abyssal underworld. Cave-ins, blind shafts, and subterranean beasts block access to rich veins.',
    tips: [
      'Attention aux culs-de-sac et zones d’obscurité totale (utilisez LOMILWA).',
      'Le nain et le gnome profitent de bonus d’équipement intéressants ici.'
    ],
    tipsEn: [
      'Watch out for dead ends and magical dark zones (cast LOMILWA).',
      'Dwarves and Gnomes benefit from advantageous racial gear here.'
    ],
    castleName: "Comptoir Minier d'O'Connor",
    castleNameEn: "O'Connor's Mining Outpost",
    castleSubtitle: "Campement de mineurs à l'entrée des puits souterrains",
    castleSubtitleEn: "Miners' camp at the entrance of the subterranean shafts",
    castleWelcome: "Bienvenue aux Mines Oubliées d'O'Connor",
    castleWelcomeEn: "Welcome to O'Connor's Forgotten Mines",
    castleDescription: "Les riches filons de mithril et d'or ont été délaissés après l'effondrement des galeries inférieures. Déblayez les éboulis, affrontez les bêtes des cavernes et pillez les filons anciens.",
    castleDescriptionEn: "Rich veins of gold and mithril were abandoned after lower tunnels collapsed. Clear the rubble, face cavern beasts, and reclaim the ancestral ores.",
    trainingGroundsName: "Fonderie & Caserne des Mineurs",
    trainingGroundsNameEn: "Miners' Foundry & Barracks",
    dataExtracted: true
  },
  {
    id: 'emperors-seal',
    number: 12,
    title: "The Emperor's Seal",
    subtitle: 'La Quête du Sceau Impérial Dérobé',
    subtitleEn: 'Quest for the Stolen Imperial Seal',
    author: 'Imperial Guild (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    difficultyEn: 'DIFFICULT',
    diskFileName: 'emperors-seal.dsk',
    description:
      'L’insigne suprême de l’Empire a été volé par une confrérie de sorciers rebelles. Seule une escouade d’élite saura franchir les dédales magiques pour le rapporter.',
    descriptionEn:
      'The supreme insignia of the Empire has been stolen by rebel sorcerers. Only an elite band of heroes can penetrate the arcane maze to reclaim it.',
    tips: [
      'Comprend de nombreux téléporteurs et zones de rotation (spinners).',
      'Le sort DUMAPIC est indispensable pour ne pas perdre le nord.'
    ],
    tipsEn: [
      'Filled with deceptive teleporters and spinner squares.',
      'The DUMAPIC direction spell is vital to maintain your bearings.'
    ],
    castleName: "Palais de la Garde Impériale",
    castleNameEn: "Imperial Guard Palace",
    castleSubtitle: "Citadelle souveraine en état d'alerte maximale",
    castleSubtitleEn: "Sovereign citadel on high alert",
    castleWelcome: "Bienvenue au Palais Impérial",
    castleWelcomeEn: "Welcome to the Imperial Palace",
    castleDescription: "Le Sceau de l'Empereur a été dérobé et enfoui dans un dédale sous haute protection magique. Rétablissez l'autorité impériale en franchissant les téléporteurs et défenses arcaniques.",
    castleDescriptionEn: "The Emperor's Seal was stolen and sealed deep beneath heavy magical protection. Restore imperial authority by overcoming teleporters and arcane wards.",
    trainingGroundsName: "Académie d'Élite de la Garde Impériale",
    trainingGroundsNameEn: "Imperial Guard Elite Academy",
    dataExtracted: true
  },
  {
    id: 'atomic-wasteland-2098',
    number: 13,
    title: 'Atomic Wasteland 2098',
    subtitle: 'Post-apocalyptique & Science-Fiction sur moteur Wizardry',
    subtitleEn: 'Post-Apocalyptic & Sci-Fi on Wizardry Engine',
    author: 'Dan Gartung (v1.4 / v3.2 Snafaru)',
    year: '1987 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    recommendedLevelEn: 'Level 1+',
    minLevel: 1,
    floors: 10,
    theme: 'SCIFI',
    difficulty: 'DIFFICILE',
    difficultyEn: 'DIFFICULT',
    diskFileName: 'atomic-wasteland-2098.dsk',
    description:
      'Une reconversion totale du moteur de Wizardry en l’an 2098 : bunkers irradiés, mutants cybernétiques et armement futuriste remplacent les donjons médiévaux.',
    descriptionEn:
      'A total overhaul of the Wizardry engine set in 2098: irradiated bunkers, cybernetic mutants, and high-tech weaponry replace medieval dungeons.',
    tips: [
      'Univers post-apocalyptique/futuriste pour personnages de niveau 1+.',
      'Les tables d’armes, d’armures et de classes y sont totalement repensées.'
    ],
    tipsEn: [
      'Post-apocalyptic sci-fi setting designed for level 1+ characters.',
      'Weapon, armor, and class tables are completely reimagined.'
    ],
    castleName: "Bunker de Commandement 2098",
    castleNameEn: "Command Bunker 2098",
    castleSubtitle: "Complexe souterrain fortifié contre les radiations",
    castleSubtitleEn: "Underground complex shielded against fallout",
    castleWelcome: "Bienvenue dans l'Enclave 2098",
    castleWelcomeEn: "Welcome to Enclave 2098",
    castleDescription: "Les retombées atomiques ont ravagé la surface. Des androïdes défaillants, des pillards cybernétiques et des abominations mutantes hantent les coursives radioactives. Armez vos lasers et activez vos boucliers.",
    castleDescriptionEn: "Atomic fallout has devastated the surface. Rogue androids, cyber-raiders, and mutant horrors prowl irradiated corridors. Ready your lasers and charge your shields.",
    trainingGroundsName: "Simulateur Militaire & Centre Cybernétique",
    trainingGroundsNameEn: "Military Simulator & Cyber Center",
    dataExtracted: true
  }
];

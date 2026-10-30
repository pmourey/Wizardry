export interface WizardryScenarioMeta {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  author: string;
  year: string;
  engineVersion: string;
  recommendedLevel: string;
  minLevel: number;
  floors: number;
  theme: 'FANTASY' | 'ORIENTAL' | 'GOTHIC' | 'SCIFI';
  difficulty: 'CLASSIQUE' | 'INTERMÉDIAIRE' | 'DIFFICILE' | 'EXPERT';
  diskFileName: string;
  description: string;
  tips: string[];
  sequelTo?: string;
  dataExtracted: boolean;
  castleName?: string;
  castleSubtitle?: string;
  castleWelcome?: string;
  castleDescription?: string;
  trainingGroundsName?: string;
}

export const WIZARDRY_SCENARIOS: WizardryScenarioMeta[] = [
  {
    id: 'proving-grounds',
    number: 1,
    title: 'Proving Grounds of the Mad Overlord',
    subtitle: 'Wizardry I officiel fondateur (Sir-Tech, 1981)',
    author: 'Andrew Greenberg & Robert Woodhead (v3.2 Snafaru)',
    year: '1981 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'CLASSIQUE',
    diskFileName: 'proving-grounds.dsk',
    description:
      "Par décret de l'Overlord Trebor, descendez dans les 10 niveaux du labyrinthe souterrain pour affronter le sorcier renégat Werdna et reconquérir l'Amulette sacrée.",
    tips: [
      'Scénario original complet (10 étages, 101 monstres, 101 objets).',
      'Idéal pour créer et entraîner une nouvelle escouade de niveau 1.'
    ],
    castleName: "Château de Trebor",
    castleSubtitle: "Cité de garnison surplombant le Labyrinthe de Werdna",
    castleWelcome: "Bienvenue dans les Terres de l'Overlord Trebor",
    castleDescription: "Le tyran et mage maléfique Werdna s'est emparé de la sainte amulette et s'est retranché au dixième sous-sol du labyrinthe magique. Composez votre escouade, équipez-vous chez Boltac, bénissez vos héros au Temple de Cant et plongez dans le dédale.",
    trainingGroundsName: "Terrain d'Entraînement de Trebor",
    dataExtracted: true
  },
  {
    id: 'knight-of-diamonds',
    number: 2,
    title: 'The Knight of Diamonds',
    subtitle: 'Wizardry II officiel (Sir-Tech, 1982)',
    author: 'Andrew Greenberg & Robert Woodhead',
    year: '1982',
    engineVersion: 'v2.0 / Apple II',
    recommendedLevel: 'Niveau 9+',
    minLevel: 9,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    diskFileName: 'knight-of-diamonds.dsk',
    description:
      'Le légendaire deuxième volet officiel de Wizardry ! La cité sainte de Llylgamyn est menacée : retrouvez les pièces de l’Armure de Diamant du Chevalier et le Bâton Sacré de Gnilda pour restaurer la bénédiction divine.',
    tips: [
      'Scénario officiel Sir-Tech d’origine (130 objets, 78 monstres, 30 portraits de monstres Apple II).',
      'Fourni avec une escouade de départ niveau 9-10 équipée de reliques de diamant et d’armes +1.',
      'Les sorts et combats y sont redoutables dès le premier sous-sol.'
    ],
    sequelTo: 'proving-grounds',
    castleName: "Cité Sainte de Llylgamyn",
    castleSubtitle: "Sanctuaire sacré sous la bénédiction de Gnilda",
    castleWelcome: "Bienvenue dans la Cité assiégée de Llylgamyn",
    castleDescription: "Les armées du mal menacent la cité sainte. Retrouvez les 5 pièces légendaires de l'Armure du Chevalier de Diamant et le Bâton Sacré de Gnilda pour rétablir la barrière divine protectrice.",
    trainingGroundsName: "Garnison des Chevaliers de Gnilda",
    dataExtracted: true
  },
  {
    id: 'legacy-of-llylgamyn',
    number: 3,
    title: 'The Legacy of Llylgamyn',
    subtitle: 'Wizardry III officiel (Sir-Tech, 1983)',
    author: 'Andrew Greenberg & Robert Woodhead',
    year: '1983',
    engineVersion: 'v3.0 / Apple II',
    recommendedLevel: 'Niveau 1+ (Descendants)',
    minLevel: 1,
    floors: 6,
    theme: 'FANTASY',
    difficulty: 'EXPERT',
    diskFileName: 'legacy-of-llylgamyn.dsk',
    description:
      "Le troisième volet de la trilogie classique ! Des séismes et des éruptions volcaniques menacent Llylgamyn. Les descendants des héros doivent gravir les 6 niveaux de la montagne sacrée pour reconquérir l'Orbe magique gardé par le grand dragon céleste L'Kbreth.",
    tips: [
      "Scénario officiel Sir-Tech d'origine (104 objets, 78 monstres, 30 portraits originaux Apple II, 6 niveaux de montagne sacrée).",
      "Donjon vertical ascendant avec énigmes sacrées et zones scellées par l'alignement (Bien / Mal).",
      "Fourni avec une escouade de descendants préparée pour l'ascension de la montagne sacrée."
    ],
    sequelTo: 'knight-of-diamonds',
    castleName: "Sanctuaire de Llylgamyn",
    castleSubtitle: "Au pied du Volcan et de la Montagne Sacrée de L'Kbreth",
    castleWelcome: "Bienvenue au Sanctuaire des Descendants de Llylgamyn",
    castleDescription: "Des tremblements de terre et l'éveil du volcan menacent d'engloutir la cité. Les descendants des champions de Gnilda doivent gravir la montagne sacrée de 6 niveaux et braver les épreuves d'alignement pour rapporter l'Orbe de L'Kbreth.",
    trainingGroundsName: "Sanctuaire d'Entraînement des Descendants",
    dataExtracted: true
  },
  {
    id: 'black-stone',
    number: 4,
    title: 'The Black Stone',
    subtitle: 'La Pierre Noire aux 8 niveaux de pièges et d’énigmes',
    author: 'Steve Evans (v3.2 Snafaru)',
    year: '1985 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 8,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    diskFileName: 'black-stone.dsk',
    description:
      'Créé en 1985, ce scénario de 8 étages introduit des monstres, objets, pièges et énigmes inédits. Plus exigeant que Proving Grounds, il mêle humour britannique et casse-têtes retors.',
    tips: [
      'Commencez avec des guerriers ayant 18 en Force et une haute Agilité.',
      'Importation de personnages possible (sans équipement).'
    ],
    castleName: "Citadelle de la Pierre Noire",
    castleSubtitle: "Avant-poste fortifié aux portes du monolithe d'ébène",
    castleWelcome: "Bienvenue dans le Fief de la Pierre Noire",
    castleDescription: "Une puissance tellurique et corruptrice émane de la Pierre Noire, dissimulée au huitième sous-sol. Équipez vos aventuriers et préparez-vous à affronter des énigmes complexes et des monstres retors.",
    trainingGroundsName: "Casernement de la Pierre Noire",
    dataExtracted: true
  },
  {
    id: 'catacombs-of-vlad',
    number: 5,
    title: 'Catacombs of Vlad',
    subtitle: 'Les Catacombes vampiriques du Comte Vlad',
    author: 'Joel Fenton (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'GOTHIC',
    difficulty: 'INTERMÉDIAIRE',
    diskFileName: 'catacombs-of-vlad.dsk',
    description:
      'Explorez des cryptes gothiques infestées de morts-vivants et de créatures nocturnes jusqu’au repaire de Vlad. L’architecture du labyrinthe récompense une cartographie méthodique.',
    tips: [
      'Achetez beaucoup d’Ail (Garlic) chez Boltac avant de descendre !',
      'Prévoyez au moins un Prêtre ou un Bishop pour dissiper les morts-vivants.'
    ],
    castleName: "Domaine de Vlad",
    castleSubtitle: "Forteresse gothique bordant la forêt des brumes",
    castleWelcome: "Bienvenue au Domaine Oublié de Vlad",
    castleDescription: "Les cryptes millénaires du Comte Vlad s'enfoncent sous la pierre. Des vampires, spectres et créatures nocturnes rôdent dans l'ombre. Munissez-vous d'ail et d'eau bénite au Temple avant de descendre.",
    trainingGroundsName: "Crypte d'Entraînement Nocturne",
    dataExtracted: true
  },
  {
    id: 'dragonquest',
    number: 6,
    title: 'DragonQuest',
    subtitle: 'La Quête draconique d’Eric Labelle',
    author: 'Eric Labelle / Snafaru',
    year: '2024 / 2026',
    engineVersion: 'v3.2 (v1.4)',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'INTERMÉDIAIRE',
    diskFileName: 'dragonquest.dsk',
    description:
      'Inspiré de l’univers heroic fantasy classique : affrontez des dragons ancestraux, découvrez des artefacts oubliés et parcourez un dédale aux secrets multiples.',
    tips: [
      'Les souffles de dragon sont mortels : montez vite en niveau pour les PV.',
      'Un Ninja bien entraîné devient redoutable dans les derniers sous-sols.'
    ],
    castleName: "Bastion Draconique",
    castleSubtitle: "Campement avancé aux frontières de l'antre des wyrms",
    castleWelcome: "Bienvenue au Camp de la Quête du Dragon",
    castleDescription: "Des wyrms antiques et des bêtes draconiques gardent un trésor légendaire enfoui dans les profondeurs. Formez une escouade valeureuse et prenez garde aux souffles élémentaires dévastateurs.",
    trainingGroundsName: "Cour d'Entraînement des Tueurs de Dragons",
    dataExtracted: true
  },
  {
    id: 'knight-of-the-grave',
    number: 7,
    title: 'Knight of the Grave',
    subtitle: 'Le Chevalier de la Tombe & les Rois Squelettes',
    author: 'K.O.G. Team (v3.2 Snafaru)',
    year: '1987 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'GOTHIC',
    difficulty: 'DIFFICILE',
    diskFileName: 'knight-of-the-grave.dsk',
    description:
      'Un donjon ténébreux où reposent les dépouilles maudites d’une ancienne dynastie de chevaliers noirs. Les sorts de dissipation et de soins seront vos meilleurs alliés.',
    tips: [
      'Les malédictions d’équipement y sont fréquentes : identifiez avec soin.',
      'Évitez de vous précipiter dans les salles sans cartographier.'
    ],
    castleName: "Mausolée des Rois Enfouis",
    castleSubtitle: "Portail fortifié surplombant la Nécropole Maudite",
    castleWelcome: "Bienvenue au Seuil de la Tombe Éternelle",
    castleDescription: "Le Chevalier de la Tombe et ses suzerains squelettes hantent les catacombes royales. Rompez le pacte ténébreux et libérez les âmes en peine captives du sous-sol.",
    trainingGroundsName: "Lice des Paladins Purificateurs",
    dataExtracted: true
  },
  {
    id: 'scarlet-brotherhood',
    number: 8,
    title: 'Scarlet Brotherhood of Hsi-So',
    subtitle: 'La Confrérie Écarlate et ses Moines Assassins',
    author: 'Hsi-So Masters (v3.2 Snafaru)',
    year: '1985 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'ORIENTAL',
    difficulty: 'DIFFICILE',
    diskFileName: 'scarlet-brotherhood.dsk',
    description:
      'Une secte martiale impitoyable garde les passages de son monastère secret. Arts martiaux mortels, poisons exotiques et pièges sournois vous attendent.',
    tips: [
      'Les voleurs et ninjas ennemis infligent des coups critiques létaux.',
      'Gardez toujours le sort LATUMOFI mémorisé pour neutraliser les poisons.'
    ],
    castleName: "Monastère de Hsi-So",
    castleSubtitle: "Forteresse orientale de la Confrérie Écarlate",
    castleWelcome: "Bienvenue aux Abords du Monastère de Hsi-So",
    castleDescription: "Les disciples fanatiques de la Confrérie Écarlate gardent jalousement leurs parchemins secrets. Leurs poisons foudroyants et leurs coups critiques exigeront une prudence absolue.",
    trainingGroundsName: "Dojo d'Exercice Martial",
    dataExtracted: true
  },
  {
    id: 'nihonbashi',
    number: 9,
    title: 'Nihonbashi (日本橋)',
    subtitle: 'Le Pont du Levant et les Ombres d’Edo',
    author: 'Auteurs Japonais / Snafaru',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'ORIENTAL',
    difficulty: 'INTERMÉDIAIRE',
    diskFileName: 'nihonbashi.dsk',
    description:
      'Plongez dans un univers inspiré du folklore nippon médiéval : katanas légendaires, démons oni, esprits yokai et samouraïs déchus peuplent ces 10 niveaux.',
    tips: [
      'Scénario très équilibré mettant en valeur les classes Samouraï et Ninja.',
      'Les armes orientales trouvées dans le dédale possèdent des bonus puissants.'
    ],
    castleName: "Quartier de Nihonbashi (日本橋)",
    castleSubtitle: "Le Pont Impérial aux confins d'Edo",
    castleWelcome: "Bienvenue à Nihonbashi, Cité des Samouraïs",
    castleDescription: "Le quartier historique de Nihonbashi est le théâtre d'affrontements entre clans guerriers et esprits yokai. Honorez la voie du guerrier, affûtez vos lames et purifiez le temple ancestral.",
    trainingGroundsName: "Dojo Central de Nihonbashi",
    dataExtracted: true
  },
  {
    id: 'oconnors-mine',
    number: 10,
    title: "O'Connor's Mine",
    subtitle: 'Les Galeries Minières Oubliées',
    author: 'O’Connor & Associates (v3.2 Snafaru)',
    year: '1985 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'INTERMÉDIAIRE',
    diskFileName: 'oconnors-mine.dsk',
    description:
      'Une mine naine abandonnée après le percement d’une brèche vers les abysses. Faux tunnels, éboulements et créatures souterraines barrent la route vers les filons précieux.',
    tips: [
      'Attention aux culs-de-sac et zones d’obscurité totale (utilisez LOMILWA).',
      'Le nain et le gnome profitent de bonus d’équipement intéressants ici.'
    ],
    castleName: "Comptoir Minier d'O'Connor",
    castleSubtitle: "Campement de mineurs à l'entrée des puits souterrains",
    castleWelcome: "Bienvenue aux Mines Oubliées d'O'Connor",
    castleDescription: "Les riches filons de mithril et d'or ont été délaissés après l'effondrement des galeries inférieures. Déblayez les éboulis, affrontez les bêtes des cavernes et pillez les filons anciens.",
    trainingGroundsName: "Fonderie & Caserne des Mineurs",
    dataExtracted: true
  },
  {
    id: 'emperors-seal',
    number: 11,
    title: "The Emperor's Seal",
    subtitle: 'La Quête du Sceau Impérial Dérobé',
    author: 'Imperial Guild (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    diskFileName: 'emperors-seal.dsk',
    description:
      'L’insigne suprême de l’Empire a été volé par une confrérie de sorciers rebelles. Seule une escouade d’élite saura franchir les dédales magiques pour le rapporter.',
    tips: [
      'Comprend de nombreux téléporteurs et zones de rotation (spinners).',
      'Le sort DUMAPIC est indispensable pour ne pas perdre le nord.'
    ],
    castleName: "Palais de la Garde Impériale",
    castleSubtitle: "Citadelle souveraine en état d'alerte maximale",
    castleWelcome: "Bienvenue au Palais Impérial",
    castleDescription: "Le Sceau de l'Empereur a été dérobé et enfoui dans un dédale sous haute protection magique. Rétablissez l'autorité impériale en franchissant les téléporteurs et défenses arcaniques.",
    trainingGroundsName: "Académie d'Élite de la Garde Impériale",
    dataExtracted: true
  },
  {
    id: 'atomic-wasteland-2098',
    number: 12,
    title: 'Atomic Wasteland 2098',
    subtitle: 'Post-apocalyptique & Science-Fiction sur moteur Wizardry',
    author: 'Dan Gartung (v1.4 / v3.2 Snafaru)',
    year: '1987 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'SCIFI',
    difficulty: 'DIFFICILE',
    diskFileName: 'atomic-wasteland-2098.dsk',
    description:
      'Une reconversion totale du moteur de Wizardry en l’an 2098 : bunkers irradiés, mutants cybernétiques et armement futuriste remplacent les donjons médiévaux.',
    tips: [
      'Univers post-apocalyptique/futuriste pour personnages de niveau 1+.',
      'Les tables d’armes, d’armures et de classes y sont totalement repensées.'
    ],
    castleName: "Bunker de Commandement 2098",
    castleSubtitle: "Complexe souterrain fortifié contre les radiations",
    castleWelcome: "Bienvenue dans l'Enclave 2098",
    castleDescription: "Les retombées atomiques ont ravagé la surface. Des androïdes défaillants, des pillards cybernétiques et des abominations mutantes hantent les coursives radioactives. Armez vos lasers et activez vos boucliers.",
    trainingGroundsName: "Simulateur Militaire & Centre Cybernétique",
    dataExtracted: true
  }
];

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
}

export const WIZARDRY_SCENARIOS: WizardryScenarioMeta[] = [
  {
    id: 'proving-grounds',
    number: 1,
    title: 'Proving Grounds of the Mad Overlord',
    subtitle: 'Scénario officiel fondateur (Sir-Tech, 1981)',
    author: 'Andrew Greenberg & Robert Woodhead (v3.2 Snafaru)',
    year: '1981 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'CLASSIQUE',
    diskFileName: 'Wiz1E.DSK',
    description:
      "Par décret de l'Overlord Trebor, descendez dans les 10 niveaux du labyrinthe souterrain pour affronter le sorcier renégat Werdna et reconquérir l'Amulette sacrée.",
    tips: [
      'Scénario original complet (10 étages, 101 monstres, 101 objets).',
      'Idéal pour créer et entraîner une nouvelle escouade de niveau 1.'
    ],
    dataExtracted: true
  },
  {
    id: 'black-stone',
    number: 2,
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
    diskFileName: 'Wizardry-Black-Stone-v3.2-Scenario.dsk',
    description:
      'Créé en 1985, ce scénario de 8 étages introduit des monstres, objets, pièges et énigmes inédits. Plus exigeant que Proving Grounds, il mêle humour britannique et casse-têtes retors.',
    tips: [
      'Commencez avec des guerriers ayant 18 en Force et une haute Agilité.',
      'Importation de personnages possible (sans équipement).'
    ],
    dataExtracted: true
  },
  {
    id: 'catacombs-of-vlad',
    number: 3,
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
    diskFileName: 'Wizardry-Catacombs-of-Vlad-v3.2-Scenario.dsk',
    description:
      'Explorez des cryptes gothiques infestées de morts-vivants et de créatures nocturnes jusqu’au repaire de Vlad. L’architecture du labyrinthe récompense une cartographie méthodique.',
    tips: [
      'Achetez beaucoup d’Ail (Garlic) chez Boltac avant de descendre !',
      'Prévoyez au moins un Prêtre ou un Bishop pour dissiper les morts-vivants.'
    ],
    dataExtracted: true
  },
  {
    id: 'dragonquest',
    number: 4,
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
    diskFileName: 'Wizardry-DragonQuest-v1.4-v3.2engine-Scenario.dsk',
    description:
      'Une campagne de haute fantaisie conçue spécifiquement autour des améliorations du moteur Wizardry v3.2, peuplée de dragons anciens et de reliques élémentaires.',
    tips: [
      'Conçu pour des héros de niveau 1 et plus.',
      'Équilibrez votre groupe entre puissance physique et protection magique.'
    ],
    dataExtracted: true
  },
  {
    id: 'knight-of-the-grave',
    number: 5,
    title: 'Knight of the Grave',
    subtitle: 'Le Chevalier du Tombeau',
    author: 'Kris Kistner & Dan Gartung (v3.2 Snafaru)',
    year: '1985 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'GOTHIC',
    difficulty: 'CLASSIQUE',
    diskFileName: 'Wizardry-Knight-of-the-Grave-v3.2-Scenario.dsk',
    description:
      'Un scénario classique très accessible côté cartographie, idéal après Proving Grounds pour affronter le Chevalier du Tombeau et sa légion sépulcrale.',
    tips: [
      'Cartographie plus accessible que la moyenne des scénarios alternatifs.',
      'Recommandé pour des personnages de niveau 1 et plus.'
    ],
    dataExtracted: true
  },
  {
    id: 'scarlet-brotherhood',
    number: 6,
    title: 'Scarlet Brotherhood of Hsi-So',
    subtitle: 'La Confrérie Écarlate de Hsi-So',
    author: 'Joel Fenton (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'ORIENTAL',
    difficulty: 'DIFFICILE',
    diskFileName: 'Wizardry-Scarlet-Brotherhood-of-Hsi-So-v3.2-Scenario.dsk',
    description:
      'Infiltrez la forteresse secrète de la Confrérie Écarlate de Hsi-So. Les maîtres d’arts martiaux et sorciers orientaux mettront vos réflexes à rude épreuve.',
    tips: [
      'Au niveau 10 du donjon, avoir 18 en Agilité sur vos lanceurs de sorts est décisif.',
      'Importation de personnages sans équipement supportée.'
    ],
    dataExtracted: true
  },
  {
    id: 'nihonbashi',
    number: 7,
    title: 'Nihonbashi',
    subtitle: 'Chroniques du Pont du Japon (Préquelle de The Emperor’s Seal)',
    author: 'Joel Fenton (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'ORIENTAL',
    difficulty: 'INTERMÉDIAIRE',
    diskFileName: 'Wizardry-Nihonbashi-v3.2-Scenario.dsk',
    description:
      'Premier volet du diptyque japonais de Joel Fenton. Formez vos Samouraïs et Ninjas dans les sous-sols de Nihonbashi avant de les transférer vers The Emperor’s Seal.',
    tips: [
      'Préquelle directe de The Emperor’s Seal.',
      'Entraînez vos personnages jusqu’au niveau 13+ pour préparer la suite.'
    ],
    dataExtracted: true
  },
  {
    id: 'oconnors-mine',
    number: 8,
    title: "O'Connor's Mine",
    subtitle: "Les profondeurs périlleuses de la Mine d'O'Connor",
    author: 'Joel Fenton (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 7+',
    minLevel: 7,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    diskFileName: 'Wizardry-OConnors-Mine-v3.2-Scenario.dsk',
    description:
      "Conçu pour des vétérans de niveau 7 minimum. Dans la mine d'O'Connor, presque aucun monstre n'est sensible au sort KATINO (hormis les Cave Bats).",
    tips: [
      'Niveau 7+ requis au 1er étage, Niveau 9+ au 2e, Niveau 11+ au 3e.',
      'Emmenez deux Mages pour cumuler MASOPIC et sécuriser le retour via MALOR.'
    ],
    dataExtracted: true
  },
  {
    id: 'emperors-seal',
    number: 9,
    title: "The Emperor's Seal",
    subtitle: "Le Sceau de l'Empereur (Suite de Nihonbashi)",
    author: 'Joel Fenton (v3.2 Snafaru)',
    year: '1986 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 13+',
    minLevel: 13,
    floors: 10,
    theme: 'ORIENTAL',
    difficulty: 'EXPERT',
    diskFileName: 'Wizardry-The-Emperors-Seal-v3.2-Scenario.dsk',
    description:
      'Suite directe de Nihonbashi destinée aux groupes de haute volée (niveau 13 et plus). Retrouvez le Sceau Impérial dérobé au cœur d’un sanctuaire hautement mortel.',
    tips: [
      'Campagne de haut niveau (Niveau 13+ recommandé).',
      'Transférez vos vétérans de Nihonbashi ou Proving Grounds avec de l’or.'
    ],
    sequelTo: 'nihonbashi',
    dataExtracted: true
  },
  {
    id: 'atomic-wasteland-2098',
    number: 10,
    title: 'Atomic Wasteland 2098',
    subtitle: 'Post-apocalyptique & साइ-Fi sur moteur Wizardry v3.2',
    author: 'Dan Gartung (v1.4 / v3.2 Snafaru)',
    year: '1987 / 2026',
    engineVersion: 'v3.2',
    recommendedLevel: 'Niveau 1+',
    minLevel: 1,
    floors: 10,
    theme: 'SCIFI',
    difficulty: 'DIFFICILE',
    diskFileName: 'Wizardry-Atomic-Wasteland-2098-v1.2-with-Engine-v3.2-Scenario.dsk',
    description:
      'Une reconversion totale du moteur de Wizardry en l’an 2098 : bunkers irradiés, mutants cybernétiques et armement futuriste remplacent les donjons médiévaux.',
    tips: [
      'Univers post-apocalyptique/futuriste pour personnages de niveau 1+.',
      'Les tables d’armes, d’armures et de classes y sont totalement repensées.'
    ],
    dataExtracted: true
  },
  {
    id: 'knight-of-diamonds',
    number: 11,
    title: 'The Knight of Diamonds',
    subtitle: 'Wizardry Scenario #2 officiel (Sir-Tech, 1982)',
    author: 'Andrew Greenberg & Robert Woodhead',
    year: '1982',
    engineVersion: 'v2.0 / Apple II',
    recommendedLevel: 'Niveau 9+',
    minLevel: 9,
    floors: 10,
    theme: 'FANTASY',
    difficulty: 'DIFFICILE',
    diskFileName: 'Wizardry-II-Knight-of-Diamonds-Scenario.dsk',
    description:
      'Le légendaire deuxième scénario officiel de Wizardry ! La cité sainte de Llylgamyn est menacée : retrouvez les pièces de l’Armure de Diamant du Chevalier et le Bâton Sacré de Gnilda pour restaurer la bénédiction de la cité.',
    tips: [
      'Scénario officiel Sir-Tech d’origine (130 objets, 78 monstres, 30 portraits de monstres Apple II).',
      'Fourni avec une escouade de départ niveau 9-10 équipée de reliques de diamant et d’armes +1.',
      'Les sorts et combats y sont redoutables dès le premier sous-sol.'
    ],
    sequelTo: 'proving-grounds',
    dataExtracted: true
  },
  {
    id: 'legacy-of-llylgamyn',
    number: 12,
    title: 'The Legacy of Llylgamyn',
    subtitle: 'Wizardry Scenario #3 officiel (Sir-Tech, 1983)',
    author: 'Andrew Greenberg & Robert Woodhead',
    year: '1983',
    engineVersion: 'v3.0 / Apple II',
    recommendedLevel: 'Niveau 1+ (Descendants de Llylgamyn)',
    minLevel: 1,
    floors: 6,
    theme: 'FANTASY',
    difficulty: 'EXPERT',
    diskFileName: 'Wizardry3-Scenario.dsk',
    description:
      "Le troisième volet de la trilogie classique ! Des séismes et des éruptions volcaniques menacent Llylgamyn. Les descendants des héros doivent gravir les 6 niveaux de la montagne sacrée pour reconquérir l'Orbe magique gardé par le grand dragon céleste L'Kbreth.",
    tips: [
      "Scénario officiel Sir-Tech d'origine (104 objets, 78 monstres, 30 portraits originaux Apple II, 6 niveaux de montagne sacrée).",
      "Donjon vertical ascendant avec énigmes sacrées et zones scellées par l'alignement (Bien / Mal).",
      "Fourni avec une escouade de descendants préparée pour l'ascension de la montagne sacrée."
    ],
    sequelTo: 'knight-of-diamonds',
    dataExtracted: true
  }
];

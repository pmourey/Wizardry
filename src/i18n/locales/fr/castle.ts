import { CastleTranslations } from '../../types';

export const castleFr: CastleTranslations = {
  // Navigation & Header
  courtyard: 'Grande Cour',
  inn: 'Auberge',
  tavern: 'Taverne',
  boltac: 'Comptoir de Boltac',
  temple: 'Temple de Cant',
  training: "Terrains d'Entraînement",
  journal: 'Journal',
  heroLabel: 'Héros :',
  sheetBtn: 'Fiche',
  poolGoldBtn: "Mettre l'or en commun",
  poolGoldShort: "Grouper l'or",
  poolGoldTooltip: (gold: number, hero: string) =>
    `Rassembler tout l'or du groupe (${gold.toLocaleString()} PO) sur ${hero}`,
  poolGoldSuccess: (gold: number, hero: string) =>
    `Tout l'or du groupe (${gold.toLocaleString()} PO) a été rassemblé sur ${hero} !`,
  shareGoldBtn: "Diviser l'or",
  shareGoldShort: 'Partager',
  shareGoldTooltip: 'Diviser équitablement la fortune du groupe entre tous les héros',
  shareGoldSuccess: (share: number) =>
    `Or partagé équitablement (${share.toLocaleString()} PO par héros) !`,

  // Courtyard
  welcomeFallback: 'Bienvenue au Château Royal',
  descFallback: 'Depuis la cour intérieure, accédez aux échoppes, rassemblez vos compagnons ou franchissez la grille vers le labyrinthe.',
  innShortDesc: 'Soins et montées de niveau.',
  boltacShortDesc: 'Armes, armures et potions.',
  templeShortDesc: 'Résurrection et guérisons.',
  journalShortDesc: '10 derniers événements.',
  partyCompositionTitle: (count: number) => `Composition de l'Escouade (${count}/6)`,
  partyClickHint: 'Cliquez sur un héros pour interagir dans les boutiques',
  enterMazeBtn: 'Entrer dans le Donjon',
  enterMazeDesc: 'Braver les périls et les ténèbres du labyrinthe de Trebor.',
  emptyPartyWarning: "⚠️ Vous devez recruter au moins 1 aventurier à la taverne avant d'entrer dans le labyrinthe !",

  // Tavern
  tavernTitle: 'Taverne de Gilgamesh',
  tavernSubtitle: 'Recrutez ou libérez des aventuriers pour former une équipe de 1 à 6 membres.',
  recruitBtn: 'Recruter',
  removeBtn: 'Retirer',
  partyFullNotice: 'Le groupe est déjà au maximum de 6 aventuriers.',
  lostInDungeonBadge: 'Perdu dans le Donjon',
  lostCoordinatesDesc: (level: number, x: number, y: number) =>
    `Gît au Niveau ${level}, coordonnées (${x}, ${y}) · Envoyez des secours !`,
  lostBodyNotice: 'Corps perdu',
  templeDeceasedBtn: (status: string) => `Temple (${status === 'DEAD' ? 'Mort' : 'Cendres'})`,

  // Inn
  innTitle: "L'Auberge de l'Aventurier",
  innSubtitle: 'Reposez-vous pour restaurer vos forces et accumuler vos montées de niveau.',
  sleepBtn: 'Dormir',
  rooms: {
    stables: { name: 'Les Écuries', desc: 'Gratuit. Restaure tous les sorts, aucun soin de PV.' },
    cots: { name: 'Les Paillasses', desc: '10 PO / sem. Rend 1 PV par semaine et restaure les sorts.' },
    economy: { name: 'Chambres Économiques', desc: '50 PO / sem. Soins rapides (3 PV/semaine) et sorts.' },
    merchant: { name: 'Suites Marchandes', desc: '200 PO / sem. Confort royal (7 PV/semaine) et sorts.' },
    royal: { name: 'Suites Royales', desc: '500 PO / sem. Le summum de la noblesse (10 PV/semaine) et sorts.' },
  },
  restNeedRest: "Un séjour à l'Auberge est requis pour méditer et monter en niveau.",
  restNoExpNeeded: "Pas assez de points d'expérience pour le prochain niveau.",
  restLevelUpSuccess: (name: string, newLevel: number, hpGained: number) =>
    `🎉 Niveau supérieur ! ${name} passe au Niveau ${newLevel} ! (+${hpGained} PV Max)`,
  restStatIncreased: (stat: string) => `+1 ${stat} !`,
  restStatDecreased: (stat: string) => `-1 ${stat} !`,
  restAgedYears: (name: string, years: number) => `${name} a vieilli de ${years} an(s).`,
  restFinished: (name: string) => `${name} a fini de se reposer. Tous les sorts sont restaurés.`,
  restInsufficientGold: "Pas assez d'or pour régler la chambre.",

  // Boltac
  boltacTitle: 'Comptoir de Boltac',
  boltacSubtitle: "Armes, protections, identification (I) et désenvoûtement d'équipements maudits (U)NCURSE.",
  poolAllGoldBtn: (hero: string) => `Mettre tout l'or sur ${hero}`,
  cursedWarningTitle: (hero: string) => `Équipement maudit scellé sur ${hero} !`,
  cursedWarningBody:
    "Le moteur original de Wizardry interdit de retirer soi-même un équipement maudit. Seul Boltac peut briser le sortilège et enlever l'objet grâce à l'option originale U)NCURSE (pour le prix d'achat de l'objet).",
  catalogTitle: 'Articles en vente',
  heroInventoryTitle: (hero: string) => `Inventaire de ${hero} (Vendre, Identifier & Désenvoûter)`,
  emptyInventory: "Aucun objet dans l'inventaire.",
  buyBtn: 'Acheter',
  sellBtn: 'Vendre',
  identifyBtn: (fee: number) => `Identifier (${fee.toLocaleString()} PO)`,
  uncurseBtn: (fee: number) => `Enlever (${fee.toLocaleString()} PO)`,
  uncurseTooltip: (fee: number) =>
    `Faire briser la malédiction et enlever cet objet par Boltac pour ${fee.toLocaleString()} PO (Option originale U)NCURSE)`,
  identifyTooltip: (fee: number) =>
    `Faire expertiser et identifier cet objet par Boltac pour ${fee.toLocaleString()} PO`,
  unidentBadge: '[Non identifié]',
  equippedBadge: '[Équipé]',
  cursedBadge: '[Maudit]',
  unusableBadge: 'Inutilisable',
  incompatibleBadge: '[Incompatible]',
  buySuccess: (item: string, price: number) => `${item} acheté pour ${price.toLocaleString()} PO.`,
  buyFailGold: "Pas assez d'or pour acheter cet objet.",
  buyFailInventory: "L'inventaire est plein (8 objets maximum).",
  sellSuccess: (item: string, price: number) => `${item} vendu pour ${price.toLocaleString()} PO.`,
  identifySuccess: (item: string) => `Boltac identifie l'objet : il s'agit de "${item}" !`,
  uncurseSuccess: (item: string) => `La malédiction de ${item} a été brisée et l'objet retiré !`,
  uncurseFailGold: "Pas assez d'or pour payer le désenvoûtement.",
  identifyFailGold: "Pas assez d'or pour payer l'identification.",

  // Temple of Cant
  templeTitle: 'Le Temple Radiant de Cant',
  templeSubtitle:
    'Les prêtres invoquent les miracles divins pour relever les héros morts, lever la pétrification et guérir la paralysie (le poison est automatiquement neutralisé dès le retour au château).',
  peacefulTitle: 'Le Temple est paisible.',
  peacefulDesc: "Aucun aventurier de votre garnison n'est mort ou affligé de pétrification.",
  depositedAtTemple: 'Déposé au Temple',
  healthLabel: (hp: number, maxHp: number) => `Santé : ${hp}/${maxHp} PV`,
  goldLabel: (gold: number) => `Or : ${gold.toLocaleString()} PO`,
  resurrectBtn: (fee: number) => `Ressusciter (${fee.toLocaleString()} PO)`,
  cureParalysisBtn: (fee: number) => `Guérir Paralysie (${fee.toLocaleString()} PO)`,
  cureStonedBtn: (fee: number) => `Lever Pétrification (${fee.toLocaleString()} PO)`,
  fullHealthNotice: 'En pleine santé',
  resurrectSuccess: (name: string) => `✨ Miracle ! ${name} a été ressuscité d'entre les morts !`,
  resurrectFailedAshes: (name: string) =>
    `💀 Le rituel de résurrection a échoué ! La dépouille de ${name} a été réduite en CENDRES !`,
  resurrectFailedLost: (name: string) =>
    `⚰️ Les cendres se sont éparpillées dans le vent ! ${name} est PERDU DANS LE NÉANT À JAMAIS !`,
  cureParalysisSuccess: (name: string) => `La lumière sacrée rend le mouvement à ${name}. Paralysie guérie !`,
  cureStonedSuccess: (name: string) => `La pétrification a été levée sur ${name}.`,
  templeFailGold: "Pas assez d'or pour payer les offrandes au Temple.",

  // Training Grounds
  trainingTitle: "Terrains d'Entraînement",
  trainingSubtitle: 'Générez un nouvel aventurier, tirez les points bonus et répartissez-les selon votre classe désirée.',
  modeCreateHero: 'Créer un Nouveau Héros',
  modeRespecStats: 'Réattribuer les Caractéristiques (Héros Existant)',
  nameInputLabel: 'Nom du Héros',
  namePlaceholder: 'Ex: ARTHUR',
  raceLabel: 'Race',
  alignLabel: 'Alignement',
  rollStatsBtn: 'Tirer les dés de Caractéristiques',
  reserveLabel: 'Réserve :',
  pointsRemaining: (remaining: number, total: number) =>
    `${remaining} point${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''} sur ${total}`,
  rerollBtn: 'Relancer le Tirage (Dés)',
  rerollTooltip: 'Relancer le tirage aléatoire des dés pour obtenir un nouveau score bonus (ex: 18-29 pour Samurai/Ninja)',
  resetAllocationBtn: 'Réinitialiser la Répartition',
  resetAllocationTooltip: 'Remettre les caractéristiques aux valeurs de base et replacer tous les points dans la réserve',
  createHeroBtn: "Inscrire l'Aventurier au Registre de la Guilde",
  createHeroSuccess: (name: string, cls: string) =>
    `✓ ${name} le ${cls} a été inscrit au Registre de la Guilde !`,
  deleteHeroBtn: "Supprimer l'Aventurier",
  deleteConfirm: (name: string) => `Supprimer définitivement ${name} de la guilde ? Cette action est irréversible.`,
  cannotDeleteInParty: 'Impossible de supprimer un héros faisant partie du groupe actif. Retirez-le à la taverne d’abord.',
};

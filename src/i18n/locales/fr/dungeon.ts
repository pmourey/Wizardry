import { DungeonTranslations } from '../../types';

export const dungeonFr: DungeonTranslations = {
  // Navigation & Prompts
  stairsCastle: 'Escalier vers le Château',
  stairsDown: (lvl: number) => `Escalier Descendant (Niveau ${lvl})`,
  stairsUp: (lvl: number) => `Escalier Montant (Niveau ${lvl})`,
  stairsCastleDesc: 'Une large volée de marches de pierre remonte vers la cour et la sécurité du Château.',
  stairsDownDesc: (lvl: number) => `Un escalier en colimaçon taillé dans la roche brute descend dans les profondeurs vers le Niveau ${lvl}.`,
  stairsUpDesc: (lvl: number) => `Un escalier de pierre taillée remonte vers les couloirs du Niveau ${lvl}.`,
  stairsCastleAction: 'Remonter au Château (Y)',
  stairsDescendAction: (lvl: number) => `Descendre au Niveau ${lvl} (Y)`,
  stairsAscendAction: (lvl: number) => `Monter au Niveau ${lvl} (Y)`,
  cancelBtn: 'Rester à cet étage (N)',
  elevatorTitle: (min: number, max: number) => `Ascenseur Mécanique Gome (Niveaux ${min} à ${max})`,
  elevatorSelectPrompt: (current: number) => `Choisissez l'étage de destination (étage actuel : Niveau ${current}) :`,
  elevatorCurrentFloor: '(ici)',
  elevatorOperateAction: (min: number, max: number) => `Actionner l'Ascenseur (Niveaux ${min} à ${max})`,
  elevatorBlueRibbonRequired: "⚠️ Le mécanisme de l'ascenseur est verrouillé par le sceau de Trebor. Le ruban bleu (Blue Ribbon) d'officier est nécessaire !",
  elevatorArrivalNotice: (lvl: number) => `L'ascenseur s'ébranle dans un cliquetis métallique et s'arrête au Niveau ${lvl}.`,

  // HUD & Buttons
  campBtn: 'Monter le Camp (C)',
  inspectAreaBtn: 'Inspecter les lieux (I)',
  inspectAreaNothing: 'Vous inspectez minutieusement les parages, mais ne trouvez rien de particulier.',
  inspectAreaFound: 'Vous inspectez les murs et découvrez un passage dérobé !',
  lightSpellActive: (rounds: number) => `La lumière magique éclaire les couloirs (${rounds} pas restants).`,
  shieldSpellActive: "Bouclier protecteur divin de Maporfic actif (+2 Classe d'Armure pour l'escouade).",
  darknessZoneWarning: "⚠️ Obscurité totale ! Les torches et la magie lumineuse ne peuvent percer ces ténèbres magiques.",

  // Fallen Hero Discovery in Dungeon
  fallenHeroFoundTitle: (name: string) => `Aventurier tombé localisé : ${name} !`,
  fallenHeroFoundDesc: (name: string, lvl: number, x: number, y: number) =>
    `L'escouade de secours a localisé la dépouille mortelle de ${name} au Niveau ${lvl}, coordonnées (${x}, ${y}) !`,
  fallenHeroRecoverBtn: (name: string) => `Hisser la dépouille de ${name}`,
  fallenHeroRosterFull: 'Votre escouade est au complet (6/6). Libérez une place à la taverne d’abord.',
  fallenHeroRecoverSuccess: (name: string, count: number) =>
    `💀 Le corps de ${name} a été recueilli par votre escouade (${count}/6 héros). Rapportez-le au Temple de Cant au château pour invoquer une résurrection !`,

  // Camp Modal
  campTitle: 'Campement dans le Labyrinthe',
  campInventoryTab: 'Équipement & Inventaire',
  campFormationTab: 'Formation du Groupe',
  campCloseBtn: 'Lever le Camp (Quitter)',
  campHealthLabel: (hp: number, maxHp: number) => `Points de Vie : ${hp}/${maxHp} PV`,
  campSpellsAvailable: 'Sorts Disponibles :',
  campNoSpellsAvailable: "Aucun sort de camp connu ou plus d'emplacements disponibles.",
  campCastBtn: 'Lancer le Sort',
  campTargetLabel: 'Cible :',
  campSilenceWarningTitle: 'Silence Magique Actif (MONTINO)',
  campSilenceWarningBody: (rounds: number) =>
    `La voix du héros est étouffée pour encore ${rounds} tour(s). Aucune incantation ne peut être prononcée.`,
  campSlotsRemaining: (slots: number) => `${slots} emplacement${slots > 1 ? 's' : ''}`,

  // Camp Formation
  frontRow: 'Avant-garde (Rangs 1 à 3 · Attaquants au corps-à-corps)',
  backRow: 'Arrière-garde (Rangs 4 à 6 · Sorts et soutien)',
  formationHint: 'Glissez-déposez ou utilisez les flèches pour placer vos combattants en première ligne et vos mages en retrait.',
  moveForwardBtn: 'Avancer au rang précédent',
  moveBackwardBtn: 'Reculer au rang suivant',
  swapPositionSuccess: (heroA: string, posA: number, heroB: string, posB: number) =>
    `🔄 Échange de position : #${posA} ${heroA} ⇄ #${posB} ${heroB} !`,
  movedPositionSuccess: (hero: string, pos: number, row: string) =>
    `🔄 ${hero} est maintenant en position #${pos} (${row}).`,

  // Camp Inventory Actions
  backpackLabel: (count: number) => `Équipement & Sac (${count}/8 emplacements) :`,
  backpackFullNotice: 'Inventaire plein (8/8 objets maximum) !',
  emptyBackpack: 'Sac vide.',
  equipBtn: 'Équiper',
  unequipBtn: 'Retirer',
  useBtn: 'Utiliser',
  giveBtn: 'Donner',
  dropBtn: 'Jeter',
  identifyBishopBtn: (bishop: string) => `Identifier (${bishop})`,
  giveTargetSelectPrompt: 'À quel compagnon donner cet objet ?',
  giveSuccess: (item: string, target: string) => `📦 ${item} a été donné à ${target}.`,
  giveTargetFull: (target: string) => `Le sac de ${target} est plein (8/8 objets maximum) !`,
  giveCursedFail: (item: string) => `L'objet ${item} est MAUDIT et scellé sur votre chair ! Impossible de le transférer.`,
  dropCursedFail: (item: string) => `💀 Impossible de jeter ${item} : cet objet maudit est scellé sur votre corps !`,
  dropSuccess: (item: string) => `🗑️ ${item} a été jeté dans le dédale.`,
  itemConsumed: (item: string) => `L'objet ${item} a été entièrement consommé.`,
  itemTransformed: (item: string) => `L'objet s'est transformé en ${item}.`,
  notProficientNotice: (hero: string, cls: string, allowed: string) =>
    `${hero} (${cls}) ne peut pas équiper cet objet. Classes autorisées : ${allowed}.`,

  // Camp Spell Results
  spellNoEffect: (spell: string, target: string) => `${spell} n'a aucun effet sur ${target}.`,
  spellHealSuccess: (spell: string, target: string, hp: number, currentHp: number, maxHp: number) =>
    `${spell} : ${target} récupère ${hp} PV (${currentHp}/${maxHp} PV).`,
  spellCurePoisonSuccess: (target: string) => `Le poison dans les veines de ${target} a été totalement neutralisé !`,
  spellCureParalysisSuccess: (target: string) => `La lumière sacrée a libéré ${target} de sa paralysie !`,
  spellCureStonedSuccess: (target: string) => `La pétrification de ${target} est levée. La chair reprend vie !`,
  spellResurrectSuccess: (target: string) => `✨ EXCELSIOR ! ${target} est ressuscité d'entre les morts !`,
  spellResurrectAshes: (target: string) => `💀 Le rituel échoue : le corps de ${target} est réduit en CENDRES !`,
  spellResurrectLost: (target: string) => `⚰️ Les cendres se dispersent... ${target} est PERDU À JAMAIS dans le néant !`,
  spellNeedKadorto: (target: string) => `"KADORTO" est nécessaire pour ressusciter ${target} depuis les cendres.`,
  spellAlreadyAlive: (target: string) => `${target} est déjà en pleine vie.`,
  spellDumapicResult: (level: number, north: number, east: number) =>
    `Divination de DUMAPIC : Niveau ${level} · Nord : ${north} · Est : ${east}.`,
  spellMalorPrompt: 'Téléportation MALOR : indiquez les coordonnées (Niveau, Nord, Est) :',
  spellMalorSuccess: (level: number, x: number, y: number) =>
    `✨ MALOR : escouade téléportée au Niveau ${level}, (${x}, ${y}) !`,
  spellMalorRockDeath: '💀 DANS LA PIERRE SOLIDE ! Le groupe s’est matérialisé au cœur du roc massif !',
  spellMalorInvalid: 'MALOR : destination invalide, le sort s’est évanoui dans le néant.',
  spellMaporficShield: "🛡️ MAPORFIC : un champ de force mystique protège l'ensemble du groupe (+2 CA).",
  spellLatumapicIdentified: '👁️ LATUMAPIC : la véritable nature de tous les monstres du dédale est révélée.',
};

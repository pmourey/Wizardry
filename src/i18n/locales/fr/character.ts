import { CharacterTranslations } from '../../types';

export const characterFr: CharacterTranslations = {
  attributesTab: 'Caractéristiques',
  inventoryTab: 'Inventaire',
  spellsTab: 'Grimoire',
  prevHeroTooltip: 'Compagnon précédent (Flèche Gauche)',
  nextHeroTooltip: 'Compagnon suivant (Flèche Droite)',
  closeTooltip: 'Fermer la fiche (Échap)',

  // Attributes
  attributes: {
    strength: {
      label: 'Force',
      abbr: 'FOR',
      desc: "Détermine la puissance des coups au corps-à-corps, le nombre d'attaques par tour et les armes lourdes maniables.",
      effect: 'Bonus dégâts & toucher',
    },
    iq: {
      label: 'Intelligence (I.Q.)',
      abbr: 'INT',
      desc: "Mesure la capacité intellectuelle et la vitesse d'apprentissage des puissants sorts de Mage.",
      effect: 'Sorts de Mage & décryptage',
    },
    piety: {
      label: 'Piété',
      abbr: 'PIE',
      desc: "Dévotion divine accordant la bénédiction des dieux et l'apprentissage des miracles de Prêtre.",
      effect: 'Miracles divins de Prêtre',
    },
    vitality: {
      label: 'Vitalité',
      abbr: 'VIT',
      desc: 'Constitution physique régissant les points de vie gagnés à chaque niveau et les chances de survie à la résurrection.',
      effect: '+PV par niveau & robustesse',
    },
    agility: {
      label: 'Agilité',
      abbr: 'AGI',
      desc: "Vitesse de réflexes, rapidité d'initiative au combat et habileté manuelle pour crocheter les coffres piégés.",
      effect: 'Initiative combat & esquive',
    },
    luck: {
      label: 'Chance',
      abbr: 'CHA',
      desc: 'Facteur mystique protégeant des souffles de monstres, du poison, des sorts de mort subite et des pièges pernicieux.',
      effect: 'Résistance aux souffles & poisons',
    },
  },

  // Statuses
  statuses: {
    ok: 'EN FORME',
    afraid: 'EFFRAYÉ',
    asleep: 'ENDORMI',
    paralyzed: 'PARALYSÉ',
    petrified: 'PÉTRIFIÉ',
    dead: 'MORT',
    ashes: 'CENDRES',
    lost: 'PERDU DANS LE NÉANT',
  },

  // Alignments
  alignments: {
    good: 'Bon',
    neutral: 'Neutre',
    evil: 'Mauvais',
  },

  // Races
  races: {
    human: 'Humain',
    elf: 'Elfe',
    dwarf: 'Nain',
    gnome: 'Gnome',
    hobbit: 'Hobbit',
  },

  // Classes
  classes: {
    fighter: 'Guerrier',
    mage: 'Mage',
    priest: 'Prêtre',
    thief: 'Voleur',
    bishop: 'Évêque',
    samurai: 'Samouraï',
    lord: 'Seigneur',
    ninja: 'Ninja',
  },

  // Combat Stats
  armorClass: "Classe d'Armure",
  hitPoints: 'Points de Vie',
  damage: 'Dégâts',
  attacks: 'Attaques',
  gold: 'Or',
  experience: 'Expérience',
  nextLevel: 'Prochain Niveau',
  level: 'Niveau',
  age: 'Âge',
  years: 'ans',
  hpShort: 'PV',
  acShort: 'CA',
  goldShort: 'PO',
  lvlShort: 'Niv.',

  // Inventory actions & messages
  equipBtn: 'Équiper',
  unequipBtn: 'Retirer',
  useBtn: 'Utiliser',
  dropBtn: 'Jeter',
  bishopIdentifyBtn: 'Identifier (Évêque)',
  cursedCannotRemove: (name: string) =>
    `L'objet ${name} est MAUDIT ! Impossible de le retirer sans bénédiction de Boltac.`,
  equippedNotice: (name: string, ac: number, dmg: string) =>
    `${name} équipé avec succès (CA : ${ac} · Dégâts : ${dmg}).`,
  unequippedNotice: (name: string, ac: number, dmg: string) =>
    `${name} retiré (CA : ${ac} · Dégâts : ${dmg}).`,
  bishopSuccess: (bishop: string, item: string) =>
    `✨ Succès ! ${bishop} identifie l'objet : il s'agit de "${item}" !`,
  bishopCurseFumble: (bishop: string, item: string) =>
    `💀 MALÉDICTION ! ${bishop} commet une erreur d'analyse et l'objet maudit (${item}) se verrouille sur son porteur !`,
  bishopFail: (bishop: string) =>
    `❌ Échec de l'identification : ${bishop} n'arrive pas à percer le secret de cet objet.`,
  dropConfirm: (item: string) => `Jeter définitivement ${item} ? L'objet sera perdu dans le donjon.`,
  dropSuccess: (item: string) => `${item} a été jeté.`,
  consumableNotice: (item: string) => `${item} est un objet consommable ou spécial qui ne peut pas être équipé comme une arme ou armure.`,
  notQualifiedNotice: (hero: string, cls: string, allowed: string) =>
    `${hero} (${cls}) n'est pas qualifié pour manier cet objet. Classes autorisées : ${allowed}.`,

  // Spells
  mageSpellsTitle: 'Sorts de Mage',
  priestSpellsTitle: 'Miracles de Prêtre',
  spellLevel: (lvl: number) => `Cercle ${lvl}`,
  spellPoints: 'Points de Sort',
  noSpellsKnown: 'Aucun sort appris à ce niveau.',

  // Awards
  honorGuardTitle: "Chevron de la Garde d'Honneur de Trebor",
  honorGuardDesc:
    "Décerné pour avoir rapporté l'Amulette sacrée de Werdna et sauvé le royaume de Trebor.",
  scenarioCompleted: (scenario: string) => `Scénario "${scenario}" accompli.`,
};

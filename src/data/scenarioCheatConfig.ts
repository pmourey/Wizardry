import { SCENARIO_BUNDLES, getActiveScenarioEventItemIds } from './provingGroundsData';
import { TItem } from '../types/wizardry';

export interface ScenarioQuestItemDef {
  id: number;
  name: string;
  descFr: string;
  descEn: string;
  isKey?: boolean;
  isRelic?: boolean;
}

export interface ScenarioBossDef {
  id: string;
  nameFr: string;
  nameEn: string;
  floor: number;
  coordsText: string;
  eventKeys: string[];
  descriptionFr: string;
  descriptionEn: string;
}

export interface ScenarioCheatConfig {
  scenarioId: string;
  titleFr: string;
  titleEn: string;
  questLoreFr: string;
  questLoreEn: string;
  primaryBundleNameFr: string;
  primaryBundleNameEn: string;
  primaryBundleItemIds: number[];
  allQuestItemIds: number[];
  questItems: ScenarioQuestItemDef[];
  bosses: ScenarioBossDef[];
}

/**
 * Handcrafted authentic configs for the core canonical scenarios
 */
const CANONICAL_CHEAT_CONFIGS: Record<string, ScenarioCheatConfig> = {
  'proving-grounds': {
    scenarioId: 'proving-grounds',
    titleFr: 'Wizardry I : Proving Grounds of the Mad Overlord',
    titleEn: 'Wizardry I: Proving Grounds of the Mad Overlord',
    questLoreFr:
      "Dans le Labyrinthe de Trebor, les ascenseurs nécessitent des objets spécifiques : les clés de bronze et d'argent pour l'ascenseur des Niveaux 1 à 4, et le Ruban Bleu d'officier au 4e sous-sol pour l'ascenseur express (Niveaux 4 à 9/10). Les statuettes d'ours et de grenouille ouvrent les portes blindées du Niveau 4, et l'Amulette de Werdna au Niveau 10 est la relique ultime de victoire.",
    questLoreEn:
      "In Trebor's Labyrinth, elevators require specific credentials: the Bronze and Silver Keys unlock the upper elevator (Floors 1-4), while Trebor's Blue Ribbon on Floor 4 operates the express elevator (Floors 4-9/10). The Bear and Frog statuettes bypass fortified barriers on Floor 4, and the Amulet of Werdna on Floor 10 is the ultimate victory relic.",
    primaryBundleNameFr: "Pack Ascenseurs : Clé Bronze + Clé Argent + Ruban Bleu",
    primaryBundleNameEn: "Elevator Bundle: Bronze Key + Silver Key + Blue Ribbon",
    primaryBundleItemIds: [97, 98, 100],
    allQuestItemIds: [94, 95, 96, 97, 98, 99, 100],
    questItems: [
      {
        id: 94,
        name: "WERDNA'S AMULET",
        descFr: "Amulette de Werdna (#94) — Relique finale sacrée de victoire",
        descEn: "Werdna's Amulet (#94) — Final sacred relic of victory",
        isRelic: true
      },
      {
        id: 97,
        name: 'BRONZE KEY',
        descFr: "Clé de Bronze (#97) — Déverrouille l'ascenseur (Niveaux 1 à 4)",
        descEn: "Bronze Key (#97) — Unlocks elevator (Floors 1 to 4)",
        isKey: true
      },
      {
        id: 98,
        name: 'SILVER KEY',
        descFr: "Clé d'Argent (#98) — Déverrouille l'ascenseur (Niveaux 1 à 4)",
        descEn: "Silver Key (#98) — Unlocks elevator (Floors 1 to 4)",
        isKey: true
      },
      {
        id: 100,
        name: 'BLUE RIBBON',
        descFr: "Ruban Bleu (#100) — Insigne de Trebor pour l'ascenseur express (Niveaux 4 à 9)",
        descEn: "Blue Ribbon (#100) — Trebor's officer badge for express elevator (Floors 4 to 9)",
        isKey: true
      },
      {
        id: 99,
        name: 'GOLD KEY',
        descFr: "Clé d'Or (#99) — Salle d'armurerie protégée (Sous-sol 2)",
        descEn: "Gold Key (#99) — Secured armory chamber (Floor 2)",
        isKey: true
      },
      {
        id: 95,
        name: 'STATUETTE/BEAR',
        descFr: "Statuette d'Ours (#95) — Ouvre le sas blindé de l'ours (Sous-sol 4)",
        descEn: "Bear Statuette (#95) — Opens the fortified Bear doorway (Floor 4)",
        isRelic: true
      },
      {
        id: 96,
        name: 'STATUETTE/FROG',
        descFr: "Statuette de Grenouille (#96) — Ouvre le sas blindé de la grenouille (Sous-sol 4)",
        descEn: "Frog Statuette (#96) — Opens the fortified Frog doorway (Floor 4)",
        isRelic: true
      }
    ],
    bosses: [
      {
        id: 'werdna',
        nameFr: "Archimage Werdna & Garde Vampire (Sous-sol 10)",
        nameEn: "Archmage Werdna & Vampire Guard (Floor 10)",
        floor: 10,
        coordsText: "(17, 3) & (17, 4)",
        eventKeys: ['10:17:3', '10:17:4', '10:0:0'],
        descriptionFr: "Fait réapparaître le combat final contre Werdna, son Vampire et ses Démons Majeurs en case (17, 3) du 10e sous-sol sans réinitialiser votre progression.",
        descriptionEn: "Respawns the ultimate confrontation with Werdna, his Vampire bodyguard, and Greater Demons on Floor 10 (17, 3) without resetting campaign progress."
      },
      {
        id: 'murphy',
        nameFr: "Fantôme de Murphy (Sous-sol 1)",
        nameEn: "Murphy's Ghost (Floor 1)",
        floor: 1,
        coordsText: "(13, 5)",
        eventKeys: ['1:13:5'],
        descriptionFr: "Réactive la statue d'encens et l'affrontement légendaire d'entraînement contre le Fantôme de Murphy (#77) au 1er sous-sol.",
        descriptionEn: "Re-arms the iconic incense altar and legendary training fight with Murphy's Ghost (#77) on Floor 1."
      }
    ]
  },

  'knight-of-diamonds': {
    scenarioId: 'knight-of-diamonds',
    titleFr: 'Wizardry II : The Knight of Diamonds',
    titleEn: 'Wizardry II: The Knight of Diamonds',
    questLoreFr:
      "Pour lever la malédiction pesant sur Llylgamyn et restaurer le sanctuaire de Gnilda, les héros doivent retrouver les cinq reliques sacrées de l'Armure du Chevalier de Diamant dispersées à travers les cinq premiers niveaux, puis reconquérir le Bâton sacré de Gnilda au 6e étage.",
    questLoreEn:
      "To break the doom overshadowing Llylgamyn and re-establish Gnilda's divine blessing, adventurers must reclaim all five relics of the Knight of Diamonds sacred armor across the first five floors, then recover the sacred Staff of Gnilda on Floor 6.",
    primaryBundleNameFr: "Pack Sacré : Armure Complète du Chevalier + Hrathnir + Bâton de Gnilda",
    primaryBundleNameEn: "Sacred Relic Set: Knight of Diamonds Armor + Hrathnir + Staff of Gnilda",
    primaryBundleItemIds: [124, 125, 126, 127, 128, 129],
    allQuestItemIds: [124, 125, 126, 127, 128, 129, 114, 115, 119, 120],
    questItems: [
      {
        id: 124,
        name: 'STAFF OF GNILDA',
        descFr: "Bâton de Gnilda (#124) — Relique sacrée suprême rendant sa gloire à Llylgamyn",
        descEn: "Staff of Gnilda (#124) — Supreme holy relic restoring divine peace to Llylgamyn",
        isRelic: true
      },
      {
        id: 125,
        name: 'HRATHNIR',
        descFr: "Hrathnir (#125) — L'Épée légendaire du Chevalier de Diamant (Broad Sword)",
        descEn: "Hrathnir (#125) — The legendary Broad Sword of the Diamond Knight",
        isRelic: true
      },
      {
        id: 126,
        name: "KOD'S HELMET",
        descFr: "Heaume de Diamant (#126) — Protection de tête sanctifiée (Étage 4)",
        descEn: "KOD's Helmet (#126) — Sanctified headpiece (Floor 4)",
        isRelic: true
      },
      {
        id: 127,
        name: "KOD'S SHIELD",
        descFr: "Bouclier de Diamant (#127) — Écu mystique impénétrable (Étage 2)",
        descEn: "KOD's Shield (#127) — Impenetrable mystic shield (Floor 2)",
        isRelic: true
      },
      {
        id: 128,
        name: "KOD'S GAUNTLETS",
        descFr: "Gantelets de Diamant (#128) — Gantelets de force bénie (Étage 5)",
        descEn: "KOD's Gauntlets (#128) — Gauntlets of blessed might (Floor 5)",
        isRelic: true
      },
      {
        id: 129,
        name: "KOD'S ARMOR",
        descFr: "Armure de Diamant (#129) — Cuirasse intégrale légendaire du Chevalier (Étage 3)",
        descEn: "KOD's Armor (#129) — Full plate legendary armor of the Knight (Floor 3)",
        isRelic: true
      },
      {
        id: 115,
        name: 'COIN OF POWER',
        descFr: "Pièce de Pouvoir (#115) — Artefact d'élévation arcanique",
        descEn: "Coin of Power (#115) — Arcane elevation artifact",
        isRelic: true
      },
      {
        id: 114,
        name: 'GREAT MAGE WAND',
        descFr: "Sceptre du Grand Mage (#114) — Canaliseur arcanique majeur",
        descEn: "Great Mage Wand (#114) — Major arcane channeling wand",
        isRelic: true
      },
      {
        id: 119,
        name: 'BLARNEY STONE',
        descFr: "Pierre d'Éloquence (#119) — Talisman d'influence",
        descEn: "Blarney Stone (#119) — Talisman of mystical influence",
        isRelic: true
      },
      {
        id: 120,
        name: 'AMULET OF SKILL',
        descFr: "Amulette d'Habileté (#120) — Joyau de perfection martiale",
        descEn: "Amulet of Skill (#120) — Jewel of martial perfection",
        isRelic: true
      }
    ],
    bosses: [
      {
        id: 'kod_guardians',
        nameFr: "Gardiens des Reliques KOD (Étages 2 à 5)",
        nameEn: "KOD Relic Guardians (Floors 2 to 5)",
        floor: 2,
        coordsText: "Étages 2 à 5",
        eventKeys: ['2:2:6', '3:14:13', '4:10:4', '5:10:9'],
        descriptionFr: "Fait réapparaître le Bouclier Magique (L2), l'Épée Magique (L3), le Heaume Magique (L4) et les Gantelets Magiques (L5).",
        descriptionEn: "Respawns the Magic Shield (L2), Magic Sword (L3), Magic Helmet (L4), and Magic Gauntlets (L5)."
      },
      {
        id: 'gnilda_priests',
        nameFr: "Grands Prêtres du Sanctuaire de Gnilda (Étage 6)",
        nameEn: "High Priests of Gnilda's Sanctum (Floor 6)",
        floor: 6,
        coordsText: "(5, 15), (18, 18)...",
        eventKeys: ['6:5:15', '6:5:16', '6:18:18', '6:18:19', '6:19:19'],
        descriptionFr: "Réactive les combats rituels contre les Grands Prêtres gardant le sanctuaire final au 6e étage.",
        descriptionEn: "Resets the trial battles against the High Priests guarding the innermost sanctuary on Floor 6."
      }
    ]
  },

  'legacy-of-llylgamyn': {
    scenarioId: 'legacy-of-llylgamyn',
    titleFr: 'Wizardry III : Legacy of Llylgamyn',
    titleEn: 'Wizardry III: Legacy of Llylgamyn',
    questLoreFr:
      "Des séismes et éruptions menacent d'anéantir Llylgamyn. Seul l'Orbe de Clarté (Orb of Earithin), confié au grand dragon L'Kbreth au sommet de la Montagne de Feu (Étage 6), peut dévoiler le secret de la survie. Les héros doivent traverser les épreuves des alignements Bon et Mauvais, franchir le lac de lave grâce au Vaisseau en Bouteille (Étage 4) et réunir les Cristaux élémentaires.",
    questLoreEn:
      "Earthquakes and volcanic fury threaten to destroy Llylgamyn. Only the Orb of Clarity (Orb of Earithin), guarded by dragon L'Kbreth at the summit of the Mountain of Fire (Floor 6), can reveal salvation. Heroes must conquer trials of Good and Evil, navigate the volcanic lake using the Ship in a Bottle (Floor 4), and unite the elemental Crystals.",
    primaryBundleNameFr: "Pack Épopée : Vaisseau en Bouteille + Cristaux + Orbe d'Earithin",
    primaryBundleNameEn: "Epic Bundle: Ship in a Bottle + Crystals + Orb of Earithin",
    primaryBundleItemIds: [1, 5, 2, 4, 3, 10],
    allQuestItemIds: [1, 5, 2, 4, 3, 10, 6, 7, 8, 9],
    questItems: [
      {
        id: 1,
        name: 'ORB OF EARITHIN',
        descFr: "Orbe d'Earithin (#1) — L'Orbe de Clarté sacré, relique ultime de victoire",
        descEn: "Orb of Earithin (#1) — The sacred Orb of Clarity, ultimate victory relic",
        isRelic: true
      },
      {
        id: 5,
        name: 'SHIP IN BOTTLE',
        descFr: "Vaisseau en Bouteille (#5) — Permet de naviguer sur le lac de lave sans périr (Étage 4)",
        descEn: "Ship in a Bottle (#5) — Allows sailing across the volcanic lake safely (Floor 4)",
        isRelic: true
      },
      {
        id: 2,
        name: 'NEUTRAL CRYSTAL',
        descFr: "Cristal Neutre (#2) — Sceau d'initiation du premier niveau",
        descEn: "Neutral Crystal (#2) — Initiation seal of the first level",
        isRelic: true
      },
      {
        id: 4,
        name: 'CRYSTAL OF GOOD',
        descFr: "Cristal du Bien (#4) — Sanctifié dans les terrasses des héros Bons (Étage 2)",
        descEn: "Crystal of Good (#4) — Sanctified in the sanctuary of Good (Floor 2)",
        isRelic: true
      },
      {
        id: 3,
        name: 'CRYSTAL OF EVIL',
        descFr: "Cristal du Mal (#3) — Extrait des profondeurs des héros Mauvais (Étage 3)",
        descEn: "Crystal of Evil (#3) — Forged in the domain of Evil (Floor 3)",
        isRelic: true
      },
      {
        id: 10,
        name: 'GOLD MEDALLION',
        descFr: "Médaillon d'Or (#10) — Sceau honorifique des protecteurs de Llylgamyn",
        descEn: "Gold Medallion (#10) — Honorary medallion of the defenders of Llylgamyn",
        isRelic: true
      },
      {
        id: 6,
        name: 'STAFF OF EARTH',
        descFr: "Bâton de la Terre (#6) — Relique élémentaire tellurique",
        descEn: "Staff of Earth (#6) — Telluric elemental staff",
        isRelic: true
      },
      {
        id: 7,
        name: 'AMULET OF AIR',
        descFr: "Amulette de l'Air (#7) — Relique des courants aériens",
        descEn: "Amulet of Air (#7) — Aerial current amulet",
        isRelic: true
      },
      {
        id: 8,
        name: 'HOLY WATER',
        descFr: "Eau Bénite (#8) — Fiole de purification suprême",
        descEn: "Holy Water (#8) — Vial of supreme purification",
        isRelic: true
      },
      {
        id: 9,
        name: 'ROD OF FIRE',
        descFr: "Baguette de Feu (#9) — Sceptre igné des profondeurs volcaniques",
        descEn: "Rod of Fire (#9) — Igneous sceptre of volcanic depths",
        isRelic: true
      }
    ],
    bosses: [
      {
        id: 'lkbreth',
        nameFr: "Grand Dragon L'Kbreth (Sommet / Étage 6)",
        nameEn: "Great Dragon L'Kbreth (Summit / Floor 6)",
        floor: 6,
        coordsText: "(9, 4), (10, 5)",
        eventKeys: ['6:9:4', '6:9:5', '6:10:4', '6:10:5'],
        descriptionFr: "Fait réapparaître le duel au sommet contre le dragon légendaire L'Kbreth (#77) gardant l'Orbe de Clarté.",
        descriptionEn: "Respawns the mountain-peak showdown against the legendary dragon L'Kbreth (#77) defending the Orb of Clarity."
      },
      {
        id: 'intermediate_bosses',
        nameFr: "Gardiens Intermédiaires (Po'Le, Fiend & Xeno)",
        nameEn: "Intermediate Bosses (Po'Le, Fiend & Xeno)",
        floor: 2,
        coordsText: "Étages 2 & 6",
        eventKeys: ['2:11:19', '2:3:1', '6:4:4'],
        descriptionFr: "Réactive les rencontres majeures contre Po'Le (#76), le Démon Fiend (#60) et le Xeno (#70).",
        descriptionEn: "Re-arms key guardian encounters against Po'Le (#76), Fiend (#60), and Xeno (#70)."
      }
    ]
  },

  'return-of-werdna': {
    scenarioId: 'return-of-werdna',
    titleFr: 'Wizardry IV : The Return of Werdna',
    titleEn: 'Wizardry IV: The Return of Werdna',
    questLoreFr:
      "Dans cette aventure inversée, vous incarnez Werdna déchu au 10e sous-sol de son propre tombeau. Vous devez reconquérir vos artefacts occultes, invoquer des hordes de monstres aux pentagrammes sacrés et remonter vers la surface pour briser le Sceau de Trebor.",
    questLoreEn:
      "In this inverted dungeon crawl, you command Werdna, stripped of his power at the bottom of his tomb (Floor 10). Reclaim your occult artifacts, summon monster packs at mystical pentagrams, and ascend to the surface to shatter Trebor's Seal.",
    primaryBundleNameFr: "Pack Occulte de Werdna : Sceau de Trebor + Pierre de Sang + Bougie Noire",
    primaryBundleNameEn: "Werdna's Occult Bundle: Trebor's Seal + Bloodstone + Black Candle",
    primaryBundleItemIds: [14, 1, 2, 3, 4, 47],
    allQuestItemIds: [14, 1, 2, 3, 4, 47, 43, 49],
    questItems: [
      {
        id: 14,
        name: "TREBOR'S SEAL",
        descFr: "Sceau de Trebor (#14) — Sceau de l'Overlord bloquant l'accès au trône",
        descEn: "Trebor's Seal (#14) — Overlord seal barring surface access",
        isRelic: true
      },
      {
        id: 1,
        name: 'BLOODSTONE',
        descFr: "Pierre de Sang (#1) — Relique de canalisation occulte",
        descEn: "Bloodstone (#1) — Occult channeling stone",
        isRelic: true
      },
      {
        id: 2,
        name: 'BLACK CANDLE',
        descFr: "Bougie Noire (#2) — Médium d'invocation ténébreuse",
        descEn: "Black Candle (#2) — Dark summoning medium",
        isRelic: true
      },
      {
        id: 3,
        name: 'JEWELED AMULET',
        descFr: "Amulette Sertie (#3) — Protection contre les arcanes cléricaux",
        descEn: "Jeweled Amulet (#3) — Ward against clerical magic",
        isRelic: true
      },
      {
        id: 4,
        name: 'HOLY HANDGRENADE',
        descFr: "Grenade Sainte (#4) — Arme de destruction explosive massive",
        descEn: "Holy Handgrenade (#4) — Massive explosive weapon",
        isRelic: true
      },
      {
        id: 47,
        name: 'HEAVY FLOPPY DISK',
        descFr: "Disquette Vintage (#47) — Relique rétro des créateurs",
        descEn: "Heavy Floppy Disk (#47) — Retro creators relic",
        isRelic: true
      },
      {
        id: 43,
        name: 'STAFF OF GNILDA',
        descFr: "Bâton de Gnilda (#43) — Ancien bâton sacré",
        descEn: "Staff of Gnilda (#43) — Ancient sacred staff",
        isRelic: true
      },
      {
        id: 49,
        name: 'CRYSTAL BALL',
        descFr: "Boule de Cristal (#49) — Révélateur de secrets",
        descEn: "Crystal Ball (#49) — Scrying oracle of dungeon secrets",
        isRelic: true
      }
    ],
    bosses: [
      {
        id: 'adventurers',
        nameFr: "Groupes d'Aventuriers & Héros de Llylgamyn",
        nameEn: "Adventurer Parties & Llylgamyn Heroes",
        floor: 10,
        coordsText: "Niveaux 1 à 10",
        eventKeys: ['10:10:6', '10:3:9', '10:10:15', '10:10:17', '9:4:4', '9:16:4'],
        descriptionFr: "Réinitialise les affrontements contre les escouades d'aventuriers du Bien qui traquent Werdna dans les couloirs.",
        descriptionEn: "Resets combats against the high-level Good adventuring parties patrolling the tomb."
      }
    ]
  }
};

/**
 * Builds a dynamic cheat configuration for custom or community scenarios
 */
function buildDynamicScenarioCheatConfig(scenarioId: string): ScenarioCheatConfig {
  const bundle = SCENARIO_BUNDLES[scenarioId] || SCENARIO_BUNDLES['proving-grounds'];
  const eventItemIds = Array.from(getActiveScenarioEventItemIds(scenarioId));

  // Find candidate quest items from database:
  // 1. Items referenced in maze events (highest priority)
  // 2. Items of type 'SPECIAL' or 'MISC' with price === 0 or special keywords
  const candidateItems: TItem[] = [];
  const addedIds = new Set<number>();

  for (const id of eventItemIds) {
    const it = bundle.items.find(i => i.id === id);
    if (it && !addedIds.has(it.id)) {
      candidateItems.push(it);
      addedIds.add(it.id);
    }
  }

  for (const it of bundle.items) {
    if (addedIds.has(it.id) || it.id === 0) continue;
    const isSpecial = it.objType === 'SPECIAL' || it.objType === 'MISC';
    const isQuestName = /KEY|RIBBON|ORB|AMULET|CRYSTAL|SEAL|STAFF|STATUETTE|PASS|CARD|STONE|CROWN|RING|HOLY|BOOK|RELIC|TOKEN|MEDAL/i.test(it.name);
    if (isSpecial && (it.price === 0 || isQuestName || it.special > 0)) {
      candidateItems.push(it);
      addedIds.add(it.id);
    }
  }

  const questItems: ScenarioQuestItemDef[] = candidateItems.slice(0, 10).map(it => ({
    id: it.id,
    name: it.name,
    descFr: `${it.name} (#${it.id}) — Objet de quête ou clé du scénario`,
    descEn: `${it.name} (#${it.id}) — Scenario quest item or key`,
    isKey: /KEY|PASS|CARD|RIBBON/i.test(it.name),
    isRelic: !/KEY|PASS|CARD|RIBBON/i.test(it.name)
  }));

  const primaryBundleItemIds = questItems.slice(0, 5).map(q => q.id);

  // Collect all fixed encounter event coordinates from the mazes
  const encounterKeys: string[] = [];
  bundle.mazes.forEach(m => {
    m.events?.forEach(ev => {
      if (ev.type === 'ENCOUNTE' || ev.kind === 'SEARCH_FIGHT' || ev.monsterId !== undefined) {
        encounterKeys.push(`${m.level}:${ev.x}:${ev.y}`);
      }
    });
  });

  const bosses: ScenarioBossDef[] = [];
  if (encounterKeys.length > 0) {
    bosses.push({
      id: 'all_guardians',
      nameFr: "Tous les Gardiens & Boss du Donjon",
      nameEn: "All Dungeon Guardians & Bosses",
      floor: bundle.mazes.length,
      coordsText: `${encounterKeys.length} salles de combat`,
      eventKeys: encounterKeys,
      descriptionFr: "Réinitialise l'intégralité des gardiens et boss vaincus dans les salles du scénario actif.",
      descriptionEn: "Resets all defeated guardians and room bosses throughout the active scenario."
    });
  }

  return {
    scenarioId,
    titleFr: `Scénario #${scenarioId}`,
    titleEn: `Scenario #${scenarioId}`,
    questLoreFr: "Objets de quête, clés et reliques extraits directement de la cartographie et du grimoire d'objets de ce scénario.",
    questLoreEn: "Quest items, keys, and relics extracted directly from this scenario's dungeon topology and item database.",
    primaryBundleNameFr: "Pack Objets de Quête & Clés du Scénario",
    primaryBundleNameEn: "Scenario Quest Items & Keys Bundle",
    primaryBundleItemIds,
    allQuestItemIds: questItems.map(q => q.id),
    questItems,
    bosses
  };
}

/**
 * Gets the scenario-specific cheat configuration
 */
export function getScenarioCheatConfig(scenarioId: string): ScenarioCheatConfig {
  if (CANONICAL_CHEAT_CONFIGS[scenarioId]) {
    return CANONICAL_CHEAT_CONFIGS[scenarioId];
  }
  return buildDynamicScenarioCheatConfig(scenarioId);
}

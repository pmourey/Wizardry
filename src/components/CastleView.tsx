import React, { useState, useEffect } from 'react';
import { 
  TCharacter, 
  TRace, 
  TClass, 
  TAlign, 
  TItem 
} from '../types/wizardry';
import { 
  RACE_BASE_ATTRIBUTES, 
  ITEMS_DATABASE, 
  setCharacterSpells,
  initLevel1CharacterSpells,
  levelUpCharacter,
  getExpForNextLevel,
  formatDamageDice,
  recalculateCharacterCombatStats,
  canClassUseItem,
  getUsableClassesList
} from '../data/provingGroundsData';
import { CharacterSheetModal } from './CharacterSheetModal';
import { sounds } from '../utils/soundEffects';
import { music } from '../utils/musicManager';
import { getCharacterChevrons } from '../utils/awards';
import { 
  Shield, 
  Sparkles, 
  HeartHandshake, 
  Store, 
  DoorOpen, 
  UserPlus, 
  Cross, 
  Coins, 
  FileCode,
  Flame,
  User,
  Skull,
  Zap,
  CheckCircle2,
  Plus,
  Minus,
  RotateCcw,
  Undo2,
  Sliders,
  BookOpen
} from 'lucide-react';
import { getActiveStatusEffects } from '../engine/statusSystem';
import { AdventureJournal } from './AdventureJournal';
import { AdventureLogEvent, AdventureLogCategory } from '../types/wizardry';
import { WIZARDRY_SCENARIOS, getLocalizedScenario } from '../data/scenariosCatalog';
import { useI18n } from '../i18n';

interface CastleViewProps {
  activeScenarioId?: string;
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  allCharacters: TCharacter[];
  setAllCharacters: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  adventureEvents?: AdventureLogEvent[];
  onClearAdventureEvents?: () => void;
  onAddAdventureEvent?: (
    category: AdventureLogCategory,
    title: string,
    description: string,
    details?: string,
    level?: number,
    coordinates?: { x: number; y: number }
  ) => void;
  onEnterMaze: () => void;
  onOpenPySide6Export?: () => void;
}

type CastleTab = 'COURTYARD' | 'TAVERN' | 'INN' | 'BOLTAC' | 'TEMPLE' | 'TRAINING' | 'JOURNAL';

export const CastleView: React.FC<CastleViewProps> = ({
  activeScenarioId = 'proving-grounds',
  party,
  setParty,
  allCharacters,
  setAllCharacters,
  adventureEvents = [],
  onClearAdventureEvents,
  onAddAdventureEvent,
  onEnterMaze,
  onOpenPySide6Export
}) => {
  const { t, lang } = useI18n();

  const rawMeta = WIZARDRY_SCENARIOS.find(s => s.id === activeScenarioId) || WIZARDRY_SCENARIOS[0];
  const scenarioMeta = getLocalizedScenario(rawMeta, lang);
  const castleName = scenarioMeta.castleName || (lang === 'fr' ? 'Château de Trebor' : 'Castle of Trebor');
  const castleSubtitle = scenarioMeta.castleSubtitle || (lang === 'fr' ? 'Cité de garnison surplombant le Labyrinthe' : 'Garrison city overlooking the Maze');
  const castleWelcome = scenarioMeta.castleWelcome || t.castle.welcomeFallback;
  const castleDescription = scenarioMeta.castleDescription || scenarioMeta.description;
  const trainingGroundsName = scenarioMeta.trainingGroundsName || t.castle.training;

  const [currentTab, setCurrentTab] = useState<CastleTab>('COURTYARD');
  const [message, setMessage] = useState<string>(() => t.common.welcomeToCastle(castleName));

  useEffect(() => {
    setMessage(t.common.welcomeToCastle(castleName));
  }, [castleName, lang, t]);

  useEffect(() => {
    switch (currentTab) {
      case 'TAVERN':
        music.playTrack('03-gilgamesh-s-tavern');
        break;
      case 'INN':
        music.playTrack('04-adventurer-s-inn');
        break;
      case 'BOLTAC':
        music.playTrack('05-boltac-s-trading-post');
        break;
      case 'TEMPLE':
        music.playTrack('06-temple-of-cant');
        break;
      case 'TRAINING':
        music.playTrack('07-edge-of-town');
        break;
      default:
        music.playTrack('02-castle');
        break;
    }
  }, [currentTab]);

  const [selectedCharIndex, setSelectedCharIndex] = useState<number>(0);
  const [inspectingPartyIndex, setInspectingPartyIndex] = useState<number | null>(null);
  const [inspectingRosterHero, setInspectingRosterHero] = useState<TCharacter | null>(null);

  // Character Creation state in Training Grounds
  const [trainingMode, setTrainingMode] = useState<'CREATE' | 'RESPEC'>('CREATE');
  const [newCharName, setNewCharName] = useState('');
  const [newCharRace, setNewCharRace] = useState<TRace>('HUMAN');
  const [newCharAlign, setNewCharAlign] = useState<TAlign>('GOOD');
  const [totalBonusRolled, setTotalBonusRolled] = useState<number>(10);
  const [bonusPoints, setBonusPoints] = useState<number>(10);
  const [allocatedStats, setAllocatedStats] = useState({
    STRENGTH: 8,
    IQ: 8,
    PIETY: 5,
    VITALITY: 8,
    AGILITY: 8,
    LUCK: 9
  });
  const [isRollingStats, setIsRollingStats] = useState(false);

  // Respec state for existing characters
  const [respecCharId, setRespecCharId] = useState<string>('');
  const [respecStats, setRespecStats] = useState<Record<string, number>>({
    STRENGTH: 8,
    IQ: 8,
    PIETY: 5,
    VITALITY: 8,
    AGILITY: 8,
    LUCK: 9
  });
  const [respecBonusAvailable, setRespecBonusAvailable] = useState<number>(0);
  const [respecTotalPoints, setRespecTotalPoints] = useState<number>(0);

  const selectedHero = party[selectedCharIndex] || party[0];

  // Helper to translate class name
  const getHeroClassName = (cls: TClass): string => {
    const key = cls.toLowerCase() as keyof typeof t.character.classes;
    return t.character.classes[key] || cls;
  };

  // Helper to translate race name
  const getHeroRaceName = (race: TRace): string => {
    const key = race.toLowerCase() as keyof typeof t.character.races;
    return t.character.races[key] || race;
  };

  // Helper to translate alignment
  const getHeroAlignName = (align: TAlign): string => {
    const key = align.toLowerCase() as keyof typeof t.character.alignments;
    return t.character.alignments[key] || align;
  };

  // Per authentic Pascal Wizardry 1: Poison only exists in the maze (POISNAMT).
  // Characters entering the castle are automatically and immediately cured of poison!
  useEffect(() => {
    let changed = false;
    party.forEach(h => {
      if (h.poisonAmount > 0) {
        h.poisonAmount = 0;
        changed = true;
      }
      if (h.silencedRounds && h.silencedRounds > 0) {
        h.silencedRounds = 0;
        changed = true;
      }
    });
    if (changed) {
      setParty([...party]);
    }
  }, [party, setParty]);

  // ==========================================
  // INN LOGIC (HEALING & LEVEL UP — CASTLE2.TEXT: ADVNTINN / TAKENAP / CHNEWLEV / SETSPELS)
  // ==========================================
  const handleRestAtInn = (roomType: 'STABLES' | 'COTS' | 'ECONOMY' | 'MERCHANT' | 'ROYAL') => {
    if (!selectedHero) return;
    sounds.playGold();
    const roomSpecs = {
      STABLES:  { hpAdd: 0,  cost: 0 },
      COTS:     { hpAdd: 1,  cost: 10 },
      ECONOMY:  { hpAdd: 3,  cost: 50 },
      MERCHANT: { hpAdd: 7,  cost: 200 },
      ROYAL:    { hpAdd: 10, cost: 500 }
    };
    const { hpAdd, cost } = roomSpecs[roomType];

    if (cost > 0 && selectedHero.gold < cost && selectedHero.hpLeft < selectedHero.hpMax) {
      setMessage(
        lang === 'fr'
          ? `Fonds insuffisants ! ${selectedHero.name} n'a pas assez d'or (${cost} PO/sem.).`
          : `Insufficient funds! ${selectedHero.name} does not have enough gold (${cost} GP/wk).`
      );
      return;
    }

    // Authentic TAKENAP loop (CASTLE2.TEXT l. 765-774):
    // In Stables (cost = 0), no HP is healed ("IS NAPPING").
    // In paid rooms (cost > 0), heals hpAdd per week while gold >= cost and hpLeft < hpMax.
    let weeksRested = 0;
    let totalGoldSpent = 0;
    const hpBefore = selectedHero.hpLeft;
    if (cost > 0) {
      while (selectedHero.gold >= cost && selectedHero.hpLeft < selectedHero.hpMax) {
        selectedHero.hpLeft = Math.min(selectedHero.hpMax, selectedHero.hpLeft + hpAdd);
        selectedHero.gold -= cost;
        selectedHero.age = (selectedHero.age || 18 * 52) + 1;
        weeksRested += 1;
        totalGoldSpent += cost;
      }
    }
    const hpHealed = selectedHero.hpLeft - hpBefore;

    // Authentic CHNEWLEV check (CASTLE2.TEXT l. 694-720)
    const expNeeded = getExpForNextLevel(selectedHero.class, selectedHero.charLevel);
    let levelUpMsg = '';
    if (selectedHero.exp >= expNeeded) {
      const { hpGain, learnedSpells, statChanges } = levelUpCharacter(selectedHero);
      const spellsNote = learnedSpells.length > 0
        ? (lang === 'fr' ? ` · Nouveaux sorts appris : ${learnedSpells.join(', ')} !` : ` · New spells learned: ${learnedSpells.join(', ')}!`)
        : '';
      const statsNote = statChanges.length > 0
        ? ` (${statChanges.join(', ')})`
        : '';
      levelUpMsg = lang === 'fr'
        ? ` 🌟 NIVEAU SUPÉRIEUR ! ${selectedHero.name} passe au Niveau ${selectedHero.charLevel} (+${hpGain} PV Max${statsNote})${spellsNote}`
        : ` 🌟 LEVEL UP! ${selectedHero.name} advances to Level ${selectedHero.charLevel} (+${hpGain} Max HP${statsNote})${spellsNote}`;
      sounds.playFanfare();
      onAddAdventureEvent?.(
        'CASTLE',
        lang === 'fr' 
          ? `Montée de Niveau : ${selectedHero.name} (Niveau ${selectedHero.charLevel})`
          : `Level Up: ${selectedHero.name} (Level ${selectedHero.charLevel})`,
        lang === 'fr'
          ? `Après son séjour à l'Auberge de l'Aventurier, ${selectedHero.name} passe au Niveau ${selectedHero.charLevel} (+${hpGain} PV Max${statsNote}).${spellsNote}`
          : `After resting at the Adventurer's Inn, ${selectedHero.name} advances to Level ${selectedHero.charLevel} (+${hpGain} Max HP${statsNote}).${spellsNote}`,
        lang === 'fr'
          ? `Niveau : ${selectedHero.charLevel} · PV : ${selectedHero.hpLeft}/${selectedHero.hpMax}${learnedSpells.length > 0 ? ` · Sorts : ${learnedSpells.join(', ')}` : ''}`
          : `Level: ${selectedHero.charLevel} · HP: ${selectedHero.hpLeft}/${selectedHero.hpMax}${learnedSpells.length > 0 ? ` · Spells: ${learnedSpells.join(', ')}` : ''}`
      );
    } else {
      const expMissing = expNeeded - selectedHero.exp;
      levelUpMsg = lang === 'fr'
        ? ` (Il manque ${expMissing.toLocaleString()} XP pour le Niveau ${selectedHero.charLevel + 1}).`
        : ` (Needs ${expMissing.toLocaleString()} XP for Level ${selectedHero.charLevel + 1}).`;
    }

    // Authentic SETSPELS (CASTLE2.TEXT l. 783): recharge spell slots according to class, level & known spells
    setCharacterSpells(selectedHero);

    setParty([...party]);
    setAllCharacters(prev => prev.map(c => c.id === selectedHero.id ? { ...selectedHero } : c));

    const healNote = roomType === 'STABLES'
      ? (lang === 'fr'
          ? `a dormi aux Écuries (sorts restaurés, PV : ${selectedHero.hpLeft}/${selectedHero.hpMax}).`
          : `rested at the Stables (spells restored, HP: ${selectedHero.hpLeft}/${selectedHero.hpMax}).`)
      : weeksRested > 0
      ? (lang === 'fr'
          ? `s'est reposé ${weeksRested} sem. (-${totalGoldSpent} PO, +${hpHealed} PV, PV : ${selectedHero.hpLeft}/${selectedHero.hpMax}) et a restauré ses sorts.`
          : `rested ${weeksRested} wk(s) (-${totalGoldSpent} GP, +${hpHealed} HP, HP: ${selectedHero.hpLeft}/${selectedHero.hpMax}) and restored spells.`)
      : (lang === 'fr'
          ? `a restauré ses sorts (PV : ${selectedHero.hpLeft}/${selectedHero.hpMax}).`
          : `restored spell points (HP: ${selectedHero.hpLeft}/${selectedHero.hpMax}).`);

    setMessage(`${selectedHero.name} ${healNote}${levelUpMsg}`);
  };

  // ==========================================
  // BOLTAC TRADING POST (BUY / SELL / IDENTIFY / POOL)
  // ==========================================
  const handleBuyItem = (item: TItem) => {
    if (selectedHero.gold < item.price) {
      setMessage(t.castle.buyFailGold);
      return;
    }
    if (selectedHero.possessions.length >= 8) {
      setMessage(t.castle.buyFailInventory);
      return;
    }

    // Authentic Pascal SHOPS.TEXT l. 323-333:
    // IF NOT (OBJECT.CLASSUSE[CHARACTR[CHARI].CLASS]) THEN UNUSABLE ITEM - CONFIRM BUY (Y/N) ?
    if (!canClassUseItem(selectedHero.class, item)) {
      const allowed = getUsableClassesList(item, false, lang).join(', ') || (lang === 'fr' ? 'Aucune' : 'None');
      const heroClassName = getHeroClassName(selectedHero.class);
      const promptText = lang === 'fr'
        ? `OBJET INUTILISABLE (UNUSABLE)\n\n${item.name} ne peut pas être équipé par ${selectedHero.name} (${heroClassName}).\nClasses autorisées : ${allowed}.\n\nConfirmer l'achat quand même ?`
        : `UNUSABLE ITEM\n\n${item.name} cannot be equipped by ${selectedHero.name} (${heroClassName}).\nAllowed classes: ${allowed}.\n\nConfirm purchase anyway?`;
      const confirmBuy = window.confirm(promptText);
      if (!confirmBuy) {
        sounds.playBump();
        setMessage(lang === 'fr' ? 'Achat annulé : tout le monde fait des erreurs ! (WE ALL MAKE MISTAKES)' : 'Purchase cancelled: we all make mistakes! (WE ALL MAKE MISTAKES)');
        return;
      }
    }

    sounds.playGold();
    selectedHero.gold -= item.price;
    selectedHero.possessions.push({
      equipped: false,
      cursed: item.cursed,
      identified: true,
      itemIndex: item.id
    });

    setParty([...party]);
    setMessage(t.castle.buySuccess(item.name, item.price));
  };

  const handleBoltacIdentify = (slotIdx: number) => {
    const slot = selectedHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (slot.identified) {
      setMessage(lang === 'fr' ? `L'objet ${itm.name} est déjà identifié.` : `The item ${itm.name} is already identified.`);
      return;
    }

    const fee = Math.max(10, Math.floor(itm.price / 2));
    if (selectedHero.gold < fee) {
      sounds.playBump();
      setMessage(t.castle.identifyFailGold);
      return;
    }

    sounds.playFanfare();
    selectedHero.gold -= fee;
    slot.identified = true;
    setParty([...party]);
    setMessage(t.castle.identifySuccess(itm.name));
  };

  const handleBoltacUncurse = (slotIdx: number) => {
    const slot = selectedHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (!slot.cursed) {
      setMessage(lang === 'fr' ? "Cet objet n'est pas maudit." : "This item is not cursed.");
      return;
    }

    // Authentic Pascal Wizardry (SHOPS.TEXT l. 498): fee is full item purchase price
    const fee = Math.max(20, itm.price);
    if (selectedHero.gold < fee) {
      sounds.playBump();
      setMessage(t.castle.uncurseFailGold);
      return;
    }

    const isEquipped = slot.equipped;
    const confirmText = lang === 'fr'
      ? (isEquipped
          ? `Boltac demande ${fee} PO pour briser le sortilège et enlever définitivement "${itm.name}" scellé sur ${selectedHero.name}.\nL'objet maudit sera retiré (règle originale UCSD Pascal U)NCURSE).\n\nConfirmer le désenvoûtement ?`
          : `Boltac demande ${fee} PO pour purifier et détruire l'objet maudit "${itm.name}".\n\nConfirmer ?`)
      : (isEquipped
          ? `Boltac charges ${fee} GP to break the curse and permanently remove "${itm.name}" bound to ${selectedHero.name}.\nThe cursed item will be removed (authentic UCSD Pascal U)NCURSE rule).\n\nConfirm uncursing?`
          : `Boltac charges ${fee} GP to purify and discard the cursed item "${itm.name}".\n\nConfirm?`);

    if (!window.confirm(confirmText)) return;

    sounds.playSpellCast();
    selectedHero.gold -= fee;
    // Authentic Pascal Wizardry (SHOPS.TEXT l. 504-511): Boltac takes and removes the cursed item completely
    selectedHero.possessions.splice(slotIdx, 1);
    recalculateCharacterCombatStats(selectedHero);
    setParty([...party]);
    setAllCharacters(prev => prev.map(c => c.id === selectedHero.id ? { ...selectedHero } : c));
    setMessage(t.castle.uncurseSuccess(itm.name));
  };

  const handleSellItem = (slotIdx: number) => {
    const slot = selectedHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    // Authentic Pascal Wizardry (SHOPS.TEXT l. 478): "WE DONT BUY CURSED ITEMS"
    if (slot.cursed) {
      sounds.playBump();
      setMessage(lang === 'fr' 
        ? "Boltac refuse d'acheter un objet maudit ! Utilisez l'option Enlever pour le faire désenvoûter (Option originale U)NCURSE)."
        : "Boltac refuses to buy cursed items! Use the Uncurse option to remove it (authentic U)NCURSE).");
      return;
    }

    sounds.playGold();
    // Authentic Pascal Wizardry (SHOPS.TEXT l. 435-441): Unidentified items sell for 1 GP
    const sellPrice = slot.identified ? Math.max(1, Math.floor(itm.price / 2)) : 1;
    selectedHero.gold += sellPrice;
    selectedHero.possessions.splice(slotIdx, 1);
    setParty([...party]);
    const soldName = slot.identified ? itm.name : (itm.nameUnknown || (lang === 'fr' ? 'Objet inconnu' : 'Unknown Item'));
    setMessage(t.castle.sellSuccess(soldName, sellPrice));
  };

  const handlePoolGold = () => {
    if (!selectedHero) return;
    sounds.playGold();
    let total = 0;
    party.forEach(h => {
      total += h.gold;
      h.gold = 0;
    });
    selectedHero.gold = total;
    setParty([...party]);
    setAllCharacters(prev => prev.map(c => {
      const inParty = party.find(p => p.id === c.id);
      return inParty ? { ...inParty } : c;
    }));
    setMessage(t.castle.poolGoldSuccess(total, selectedHero.name));
  };

  const handleShareGold = () => {
    const count = party.length;
    if (count === 0) return;
    sounds.playGold();
    let total = 0;
    party.forEach(h => {
      total += h.gold;
    });
    const share = Math.floor(total / count);
    const remainder = total % count;
    party.forEach((h, idx) => {
      h.gold = share + (idx === 0 ? remainder : 0);
    });
    setParty([...party]);
    setAllCharacters(prev => prev.map(c => {
      const inParty = party.find(p => p.id === c.id);
      return inParty ? { ...inParty } : c;
    }));
    setMessage(t.castle.shareGoldSuccess(share));
  };

  // ==========================================
  // TEMPLE OF CANT (RESURRECT / CURE)
  // ==========================================
  const handleResurrect = (targetHero: TCharacter) => {
    sounds.playSpellCast();
    const cost = targetHero.status === 'DEAD' ? targetHero.charLevel * 250 : targetHero.charLevel * 500;
    
    // Determine payment source (selected hero, target hero, or any character with gold)
    let payer = (selectedHero && selectedHero.gold >= cost) ? selectedHero : null;
    if (!payer && targetHero.gold >= cost) {
      payer = targetHero;
    }
    if (!payer) {
      payer = party.find(p => p.gold >= cost) || allCharacters.find(c => c.gold >= cost) || null;
    }

    if (!payer) {
      setMessage(t.castle.templeFailGold);
      return;
    }

    payer.gold -= cost;
    // Resurrection chance based on vitality
    const successChance = Math.min(95, targetHero.attrib.VITALITY * 5 + 30);
    if (Math.random() * 100 < successChance) {
      targetHero.status = 'OK';
      targetHero.hpLeft = 1;
      sounds.playFanfare();
      setMessage(t.castle.resurrectSuccess(targetHero.name));
      onAddAdventureEvent?.(
        'RESCUE',
        lang === 'fr' ? `Miracle au Temple de Cant : ${targetHero.name} ressuscité !` : `Miracle at Temple of Cant: ${targetHero.name} resurrected!`,
        lang === 'fr' 
          ? `Le rituel sacré et les prières des clercs ont arraché ${targetHero.name} aux mânes de la mort. Il se relève, prêt à combattre de nouveau.`
          : `Sacred rituals and clerical hymns pulled ${targetHero.name} back from death's threshold. Ready to fight anew!`,
        lang === 'fr'
          ? `Offrande payée par ${payer.name} : ${cost} PO · PV actuels : 1/${targetHero.hpMax}`
          : `Tithes paid by ${payer.name}: ${cost} GP · Current HP: 1/${targetHero.hpMax}`
      );
    } else {
      if (targetHero.status === 'DEAD') {
        targetHero.status = 'ASHES';
        setMessage(t.castle.resurrectFailedAshes(targetHero.name));
        onAddAdventureEvent?.(
          'LOSS',
          lang === 'fr' ? `Échec du rituel divin : ${targetHero.name} réduit en Cendres` : `Divine ritual failed: ${targetHero.name} turned to Ashes`,
          lang === 'fr'
            ? `Les prières n'ont pu retenir l'âme de ${targetHero.name}. Sa chair a été consumée en cendres sous la puissance de l'incantation.`
            : `Prayers could not bind the departing soul of ${targetHero.name}. The mortal body dissolved into ASHES.`,
          lang === 'fr' ? `Statut : CENDRES (un nouveau rituel reste possible)` : `Status: ASHES (a second resurrection ritual is possible)`
        );
      } else {
        targetHero.status = 'LOST';
        setMessage(t.castle.resurrectFailedLost(targetHero.name));
        onAddAdventureEvent?.(
          'LOSS',
          lang === 'fr' ? `Drame irréversible : ${targetHero.name} perdu dans le Néant` : `Irreversible tragedy: ${targetHero.name} lost forever in the void`,
          lang === 'fr'
            ? `Les cendres se sont évanouies dans l'éther céleste. ${targetHero.name} ne foulera plus jamais les pavés du donjon.`
            : `The ashes scattered into the astral winds. ${targetHero.name} is lost forever to the void.`,
          lang === 'fr' ? `Statut : PERDU À JAMAIS` : `Status: LOST FOREVER`
        );
      }
    }

    // Sync changes to both party and allCharacters roster
    setParty(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    setAllCharacters(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
  };

  const handleCureParalysis = (targetHero: TCharacter) => {
    sounds.playSpellCast();
    const cost = 100;
    let payer = (selectedHero && selectedHero.gold >= cost) ? selectedHero : (targetHero.gold >= cost ? targetHero : (party.find(p => p.gold >= cost) || allCharacters.find(c => c.gold >= cost) || null));
    if (!payer) {
      setMessage(t.castle.templeFailGold);
      return;
    }
    payer.gold -= cost;
    targetHero.status = 'OK';
    setParty(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    setAllCharacters(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    sounds.playFanfare();
    setMessage(t.castle.cureParalysisSuccess(targetHero.name));
  };

  const handleCureStoned = (targetHero: TCharacter) => {
    sounds.playSpellCast();
    const cost = 200;
    let payer = (selectedHero && selectedHero.gold >= cost) ? selectedHero : (targetHero.gold >= cost ? targetHero : (party.find(p => p.gold >= cost) || allCharacters.find(c => c.gold >= cost) || null));
    if (!payer) {
      setMessage(t.castle.templeFailGold);
      return;
    }
    payer.gold -= cost;
    targetHero.status = 'OK';
    setParty(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    setAllCharacters(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    sounds.playFanfare();
    setMessage(t.castle.cureStonedSuccess(targetHero.name));
  };

  // ==========================================
  // TRAINING GROUNDS (CREATE & RESPEC HEROES)
  // ==========================================
  const rollBonusDice = () => {
    let bonus = 5 + Math.floor(Math.random() * 6);
    if (Math.random() < 0.14) {
      bonus += 10;
      if (Math.random() < 0.20) {
        bonus += 9;
      }
    }
    return bonus;
  };

  const startRollStats = () => {
    sounds.playTurn();
    const base = RACE_BASE_ATTRIBUTES[newCharRace];
    const bonus = rollBonusDice();
    setTotalBonusRolled(bonus);
    setBonusPoints(bonus);
    setAllocatedStats({ ...base } as any);
    setIsRollingStats(true);
    setMessage(
      lang === 'fr'
        ? `🎲 Tirage des dés : ${bonus} points bonus obtenus ! Répartissez-les sur vos caractéristiques.`
        : `🎲 Dice rolled: ${bonus} bonus points obtained! Distribute them across your attributes.`
    );
  };

  const handleRerollBonusPoints = () => {
    sounds.playTurn();
    const base = RACE_BASE_ATTRIBUTES[newCharRace];
    const bonus = rollBonusDice();
    setTotalBonusRolled(bonus);
    setBonusPoints(bonus);
    setAllocatedStats({ ...base } as any);
    setMessage(
      lang === 'fr'
        ? `🎲 Relance effectuée : ${bonus} points bonus obtenus ! Répartition réinitialisée aux bases de la race.`
        : `🎲 Rerolled: ${bonus} bonus points obtained! Allocation reset to racial base values.`
    );
  };

  const handleResetAttributeAllocation = () => {
    sounds.playTurn();
    const base = RACE_BASE_ATTRIBUTES[newCharRace];
    setAllocatedStats({ ...base } as any);
    setBonusPoints(totalBonusRolled);
    setMessage(
      lang === 'fr'
        ? `Réinitialisation effectuée : les ${totalBonusRolled} points bonus sont à nouveau disponibles.`
        : `Reset complete: all ${totalBonusRolled} bonus points are back in reserve.`
    );
  };

  const handleAddStat = (stat: keyof typeof allocatedStats) => {
    if (bonusPoints <= 0 || allocatedStats[stat] >= 18) return;
    sounds.playTurn();
    setAllocatedStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
    setBonusPoints(prev => prev - 1);
  };

  const handleRemoveStat = (stat: keyof typeof allocatedStats) => {
    const baseMin = RACE_BASE_ATTRIBUTES[newCharRace][stat] || 3;
    if (allocatedStats[stat] <= baseMin) return;
    sounds.playTurn();
    setAllocatedStats(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
    setBonusPoints(prev => prev + 1);
  };

  const handleRaceChange = (race: TRace) => {
    setNewCharRace(race);
    const base = RACE_BASE_ATTRIBUTES[race];
    setAllocatedStats({ ...base } as any);
    if (isRollingStats) {
      setBonusPoints(totalBonusRolled);
      const raceName = getHeroRaceName(race);
      setMessage(
        lang === 'fr'
          ? `Race modifiée en ${raceName} : caractéristiques de base appliquées, ${totalBonusRolled} points bonus prêts.`
          : `Race changed to ${raceName}: base attributes applied, ${totalBonusRolled} bonus points ready.`
      );
    }
  };

  // Respec logic for existing characters
  const handleSelectCharForRespec = (heroId: string) => {
    const hero = allCharacters.find(c => c.id === heroId) || party.find(c => c.id === heroId);
    if (!hero) return;
    setRespecCharId(hero.id);
    const raceBase = RACE_BASE_ATTRIBUTES[hero.race];
    
    const stats: Record<string, number> = { ...hero.attrib };
    let invested = 0;
    for (const [key, baseVal] of Object.entries(raceBase)) {
      const currentVal = stats[key] ?? baseVal;
      if (currentVal > baseVal) {
        invested += (currentVal - baseVal);
      }
    }
    const totalPool = Math.max(10, invested);
    const spare = totalPool - invested;
    setRespecStats(stats);
    setRespecBonusAvailable(Math.max(0, spare));
    setRespecTotalPoints(totalPool);
    sounds.playTurn();
    setMessage(
      lang === 'fr'
        ? `Sélection de ${hero.name} (${getHeroRaceName(hero.race)} ${getHeroClassName(hero.class)}) : ${totalPool} points disponibles.`
        : `Selected ${hero.name} (${getHeroRaceName(hero.race)} ${getHeroClassName(hero.class)}): ${totalPool} attribute points available.`
    );
  };

  const handleRespecAddStat = (stat: string) => {
    if (respecBonusAvailable <= 0 || (respecStats[stat] ?? 0) >= 18) return;
    sounds.playTurn();
    setRespecStats(prev => ({ ...prev, [stat]: (prev[stat] ?? 0) + 1 }));
    setRespecBonusAvailable(prev => prev - 1);
  };

  const handleRespecRemoveStat = (stat: string) => {
    const hero = allCharacters.find(c => c.id === respecCharId) || party.find(c => c.id === respecCharId);
    if (!hero) return;
    const baseMin = RACE_BASE_ATTRIBUTES[hero.race][stat] || 3;
    if ((respecStats[stat] ?? 0) <= baseMin) return;
    sounds.playTurn();
    setRespecStats(prev => ({ ...prev, [stat]: (prev[stat] ?? 0) - 1 }));
    setRespecBonusAvailable(prev => prev + 1);
  };

  const handleRespecResetToBase = () => {
    const hero = allCharacters.find(c => c.id === respecCharId) || party.find(c => c.id === respecCharId);
    if (!hero) return;
    sounds.playTurn();
    const raceBase = RACE_BASE_ATTRIBUTES[hero.race];
    setRespecStats({ ...raceBase });
    setRespecBonusAvailable(respecTotalPoints);
    setMessage(
      lang === 'fr'
        ? `Réinitialisation : tous les ${respecTotalPoints} points sont replacés dans la réserve.`
        : `Reset complete: all ${respecTotalPoints} points returned to reserve.`
    );
  };

  const handleRespecReroll = () => {
    const hero = allCharacters.find(c => c.id === respecCharId) || party.find(c => c.id === respecCharId);
    if (!hero) return;
    sounds.playTurn();
    const newBonus = rollBonusDice() + Math.max(0, hero.charLevel - 1);
    const raceBase = RACE_BASE_ATTRIBUTES[hero.race];
    setRespecStats({ ...raceBase });
    setRespecBonusAvailable(newBonus);
    setRespecTotalPoints(newBonus);
    setMessage(
      lang === 'fr'
        ? `🎲 Nouveau tirage pour ${hero.name} : ${newBonus} points bonus obtenus !`
        : `🎲 Rerolled for ${hero.name}: ${newBonus} bonus points rolled!`
    );
  };

  const handleSaveRespec = () => {
    if (!respecCharId) return;
    const updateHero = (h: TCharacter): TCharacter => {
      if (h.id === respecCharId) {
        return {
          ...h,
          attrib: {
            STRENGTH: respecStats.STRENGTH ?? h.attrib.STRENGTH,
            IQ: respecStats.IQ ?? h.attrib.IQ,
            PIETY: respecStats.PIETY ?? h.attrib.PIETY,
            VITALITY: respecStats.VITALITY ?? h.attrib.VITALITY,
            AGILITY: respecStats.AGILITY ?? h.attrib.AGILITY,
            LUCK: respecStats.LUCK ?? h.attrib.LUCK
          }
        };
      }
      return h;
    };

    setParty(prev => prev.map(updateHero));
    setAllCharacters(prev => prev.map(updateHero));
    sounds.playFanfare();
    setMessage(lang === 'fr' ? 'Caractéristiques mises à jour avec succès pour l\'aventurier !' : 'Attributes successfully updated for this adventurer!');
  };

  const handleCreateNewHero = (chosenClass: TClass) => {
    if (!newCharName.trim()) {
      setMessage(lang === 'fr' ? 'Veuillez entrer un nom pour votre héros.' : 'Please enter a name for your adventurer.');
      return;
    }
    sounds.playFanfare();

    // Authentic KEEPCHYN Level 1 HP calculation (pascal_source/Wiz1C/ROLLER.TEXT.pas, l. 1310-1334)
    let clsHpMod = 6;
    switch (chosenClass) {
      case 'FIGHTER':
      case 'LORD':
        clsHpMod = 10;
        break;
      case 'PRIEST':
        clsHpMod = 8;
        break;
      case 'THIEF':
      case 'BISHOP':
      case 'NINJA':
        clsHpMod = 6;
        break;
      case 'MAGE':
        clsHpMod = 4;
        break;
      case 'SAMURAI':
        clsHpMod = 16;
        break;
    }
    let vitHpMod = 0;
    const vit = allocatedStats.VITALITY;
    if (vit === 3) vitHpMod = -2;
    else if (vit === 4 || vit === 5) vitHpMod = -1;
    else if (vit === 16) vitHpMod = 1;
    else if (vit === 17) vitHpMod = 2;
    else if (vit >= 18) vitHpMod = 3;

    clsHpMod += vitHpMod;
    for (let i = 0; i < 2; i++) {
      if (Math.floor(Math.random() * 2) === 1) {
        clsHpMod = Math.floor((9 * clsHpMod) / 10);
      }
    }
    if (clsHpMod < 2) clsHpMod = 2;

    const newHero: TCharacter = {
      id: `hero-${Date.now()}`,
      name: newCharName.toUpperCase().trim(),
      race: newCharRace,
      class: chosenClass,
      align: newCharAlign,
      status: 'OK',
      age: (18 * 52) + Math.floor(Math.random() * 300),
      attrib: { ...allocatedStats },
      luckSkill: [16, 16, 16, 16, 16],
      gold: 90 + Math.floor(Math.random() * 100),
      exp: 0,
      maxLevel: 1,
      charLevel: 1,
      hpLeft: clsHpMod,
      hpMax: clsHpMod,
      spellsKnown: new Array(51).fill(false),
      mageSpells: [0, 0, 0, 0, 0, 0, 0, 0],
      priestSpells: [0, 0, 0, 0, 0, 0, 0, 0],
      armorClass: 10,
      healPts: 0,
      critHit: chosenClass === 'NINJA',
      swingCount: chosenClass === 'NINJA' ? 2 : 1,
      wepDamage: { level: 1, hpFac: 6, hpMinAdd: 1 },
      hitMod: (chosenClass === 'FIGHTER' || chosenClass === 'PRIEST' || chosenClass === 'SAMURAI' || chosenClass === 'LORD' || chosenClass === 'NINJA') ? 2 : 0,
      poisonAmount: 0,
      awards: [0, 0, 0, 0, 0],
      inMaze: false,
      possessions: [
        { equipped: true, cursed: false, identified: true, itemIndex: 6 } // Dagger
      ]
    };

    initLevel1CharacterSpells(newHero);
    recalculateCharacterCombatStats(newHero);

    setAllCharacters(prev => [...prev, newHero]);
    if (party.length < 6) {
      setParty(prev => [...prev, newHero]);
    }
    setNewCharName('');
    setIsRollingStats(false);
    setMessage(t.castle.createHeroSuccess(newHero.name, getHeroClassName(chosenClass)));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-900 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400 font-bold font-serif shadow-sm shrink-0">
            {`W${scenarioMeta.number}`}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
              {castleName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
              {castleSubtitle}
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => {
              setInspectingPartyIndex(selectedCharIndex);
              sounds.playTurn();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition shadow-sm active:scale-95"
            title={lang === 'fr' ? "Inspecter les caractéristiques et l'équipement" : "Inspect character sheet and equipment"}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Fiche Personnage' : 'Character Sheet'}</span>
            <span className="sm:hidden">{t.castle.sheetBtn}</span>
          </button>
          {onOpenPySide6Export && (
            <button
              onClick={onOpenPySide6Export}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              Code PySide6 (.py)
            </button>
          )}
          {(() => {
            const hasLivingHeroes = party.some(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.hpLeft > 0);
            return (
              <button
                onClick={() => {
                  if (!hasLivingHeroes) {
                    sounds.playBump();
                    setMessage(t.castle.emptyPartyWarning);
                    return;
                  }
                  onEnterMaze();
                }}
                disabled={!hasLivingHeroes}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-md ${
                  hasLivingHeroes
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/30 active:scale-95'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                }`}
                title={hasLivingHeroes ? t.castle.enterMazeDesc : t.castle.emptyPartyWarning}
              >
                <DoorOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t.castle.enterMazeBtn}</span>
                <span className="sm:hidden">{lang === 'fr' ? 'Donjon' : 'Maze'}</span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Main Town Navigation Tabs */}
      <div className="flex items-center gap-1 px-3 sm:px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto text-xs whitespace-nowrap no-scrollbar">
        <button
          onClick={() => { setCurrentTab('COURTYARD'); sounds.playTurn(); }}
          className={`px-3 py-1.5 min-h-[36px] rounded-md font-medium transition shrink-0 ${currentTab === 'COURTYARD' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          {t.castle.courtyard}
        </button>
        <button
          onClick={() => { setCurrentTab('INN'); sounds.playTurn(); }}
          className={`px-3 py-1.5 min-h-[36px] rounded-md font-medium transition shrink-0 ${currentTab === 'INN' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          {t.castle.inn}
        </button>
        <button
          onClick={() => { setCurrentTab('TAVERN'); sounds.playTurn(); }}
          className={`px-3 py-1.5 min-h-[36px] rounded-md font-medium transition shrink-0 ${currentTab === 'TAVERN' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          {t.castle.tavern}
        </button>
        <button
          onClick={() => { setCurrentTab('BOLTAC'); sounds.playTurn(); }}
          className={`px-3 py-1.5 min-h-[36px] rounded-md font-medium transition shrink-0 ${currentTab === 'BOLTAC' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          {t.castle.boltac}
        </button>
        <button
          onClick={() => { setCurrentTab('TEMPLE'); sounds.playTurn(); }}
          className={`px-3 py-1.5 min-h-[36px] rounded-md font-medium transition shrink-0 ${currentTab === 'TEMPLE' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          {t.castle.temple}
        </button>
        <button
          onClick={() => { setCurrentTab('TRAINING'); sounds.playTurn(); }}
          className={`px-3 py-1.5 min-h-[36px] rounded-md font-medium transition shrink-0 ${currentTab === 'TRAINING' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          {t.castle.training}
        </button>
        <button
          onClick={() => { setCurrentTab('JOURNAL'); sounds.playTurn(); }}
          className={`px-3 py-1.5 min-h-[36px] rounded-md font-medium transition shrink-0 flex items-center gap-1.5 ${currentTab === 'JOURNAL' ? 'bg-amber-600 text-white shadow-md' : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/60'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t.castle.journal}</span>
          {adventureEvents.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${currentTab === 'JOURNAL' ? 'bg-amber-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
              {Math.min(10, adventureEvents.length)}
            </span>
          )}
        </button>
      </div>

      {/* Information Banner & Universal Party Selector / Gold Actions */}
      <div className="px-3 sm:px-6 py-2 bg-slate-900/70 border-b border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-300 font-medium truncate">{message}</span>
        </div>

        {/* Global Party Switcher & Gold Actions in Castle */}
        <div className="flex flex-wrap items-center gap-2">
          {party.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-700/80 shadow-sm max-w-full">
              <label htmlFor="active-hero-select" className="text-[11px] font-bold text-amber-400 whitespace-nowrap flex items-center gap-1 cursor-pointer shrink-0">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.castle.heroLabel}</span>
              </label>
              <select
                id="active-hero-select"
                value={selectedCharIndex}
                onChange={e => {
                  const idx = Number(e.target.value);
                  setSelectedCharIndex(idx);
                  sounds.playTurn();
                }}
                className="bg-slate-900 border border-slate-700 hover:border-amber-500/60 text-white font-semibold text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer transition shadow-inner truncate max-w-[200px] sm:max-w-none"
              >
                {party.map((hero, idx) => {
                  const chevrons = getCharacterChevrons(hero);
                  const clsName = getHeroClassName(hero.class);
                  return (
                    <option key={hero.id} value={idx}>
                      #{idx + 1} {chevrons ? `"${chevrons}" ` : ''}{hero.name} ({clsName} {t.character.lvlShort}{hero.charLevel} · {hero.hpLeft}/{hero.hpMax} {t.character.hpShort} · {hero.gold.toLocaleString()} {t.character.goldShort})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Gold Actions: Pool & Share */}
          {party.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePoolGold}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                title={t.castle.poolGoldTooltip(party.reduce((sum, h) => sum + h.gold, 0), selectedHero?.name || '')}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.castle.poolGoldBtn}</span>
                <span className="sm:hidden">{t.castle.poolGoldShort}</span>
              </button>

              <button
                onClick={handleShareGold}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                title={t.castle.shareGoldTooltip}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t.castle.shareGoldBtn}</span>
                <span className="sm:hidden">{t.castle.shareGoldShort}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setInspectingPartyIndex(selectedCharIndex);
              sounds.playTurn();
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-lg text-xs font-semibold transition flex items-center gap-1 active:scale-95"
          >
            <User className="w-3 h-3" />
            <span>{t.castle.sheetBtn}</span>
          </button>
        </div>
      </div>

      {/* Town Views Content Area */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto safe-left safe-right safe-bottom">
        {currentTab === 'COURTYARD' && (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-xl space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
                {castleWelcome}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {castleDescription}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-2 sm:pt-4">
                <button
                  onClick={() => setCurrentTab('INN')}
                  className="p-3 sm:p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1 active:scale-95"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4" />
                    {t.castle.inn}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400">{t.castle.innShortDesc}</p>
                </button>

                <button
                  onClick={() => setCurrentTab('BOLTAC')}
                  className="p-3 sm:p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1 active:scale-95"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2 text-xs sm:text-sm">
                    <Store className="w-4 h-4" />
                    {t.castle.boltac}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400">{t.castle.boltacShortDesc}</p>
                </button>

                <button
                  onClick={() => setCurrentTab('TEMPLE')}
                  className="p-3 sm:p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1 active:scale-95"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2 text-xs sm:text-sm">
                    <HeartHandshake className="w-4 h-4" />
                    {t.castle.temple}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400">{t.castle.templeShortDesc}</p>
                </button>

                <button
                  onClick={() => setCurrentTab('JOURNAL')}
                  className="p-3 sm:p-4 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-600/40 rounded-xl text-left transition space-y-1 active:scale-95"
                >
                  <div className="text-amber-300 font-bold flex items-center gap-2 text-xs sm:text-sm">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    {t.castle.journal}
                  </div>
                  <p className="text-[11px] sm:text-xs text-amber-200/70">{t.castle.journalShortDesc}</p>
                </button>
              </div>
            </div>

            {/* Ready Party Summary Strip */}
            <div className="bg-slate-900/60 border border-slate-800 p-3 sm:p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                  {t.castle.partyCompositionTitle(party.length)}
                </h3>
                <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">{t.castle.partyClickHint}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2.5">
                {party.map((hero, idx) => (
                  <div
                    key={hero.id}
                    onClick={() => { setSelectedCharIndex(idx); sounds.playTurn(); }}
                    className={`p-2 sm:p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col justify-between ${selectedCharIndex === idx ? 'bg-amber-950/40 border-amber-500/60 shadow-sm' : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600'}`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="truncate">
                          {getCharacterChevrons(hero) ? (
                            <span className="font-mono text-amber-400 mr-1">"{getCharacterChevrons(hero)}"</span>
                          ) : null}
                          {hero.name}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-amber-400">{t.character.lvlShort}{hero.charLevel}</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">{getHeroClassName(hero.class)}</div>
                    </div>
                    <div className="pt-1.5 sm:pt-2">
                      <div className="flex justify-between text-[10px] sm:text-[11px]">
                        <span className="text-slate-400">{t.character.hpShort}:</span>
                        <span className={hero.hpLeft < hero.hpMax / 2 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {hero.hpLeft}/{hero.hpMax}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400">
                        <span>{t.character.acShort}: {hero.armorClass}</span>
                        <span className="text-amber-400">{hero.gold} {t.character.goldShort}</span>
                      </div>
                      {/* Active Status Badges */}
                      <div className="flex flex-wrap gap-0.5 sm:gap-1 pt-1 min-h-[16px] sm:min-h-[18px]">
                        {getActiveStatusEffects(hero, lang).map(eff => (
                          <span 
                            key={eff.id}
                            className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded border ${eff.bgColor} ${eff.borderColor} ${eff.color}`}
                          >
                            {eff.badge}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCharIndex(idx);
                          setInspectingPartyIndex(idx);
                          sounds.playTurn();
                        }}
                        className="mt-1.5 sm:mt-2 w-full py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded text-[9px] sm:text-[10px] font-bold transition flex items-center justify-center gap-1 active:scale-95"
                        title={lang === 'fr' ? 'Voir la fiche complète' : 'View full character sheet'}
                      >
                        <User className="w-3 h-3" />
                        {t.castle.sheetBtn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INN VIEW */}
        {currentTab === 'INN' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">{t.castle.innTitle}</h2>
              <p className="text-xs text-slate-400">{t.castle.innSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'STABLES' as const, name: t.castle.rooms.stables.name, desc: t.castle.rooms.stables.desc },
                { type: 'COTS' as const, name: t.castle.rooms.cots.name, desc: t.castle.rooms.cots.desc },
                { type: 'ECONOMY' as const, name: t.castle.rooms.economy.name, desc: t.castle.rooms.economy.desc },
                { type: 'MERCHANT' as const, name: t.castle.rooms.merchant.name, desc: t.castle.rooms.merchant.desc },
                { type: 'ROYAL' as const, name: t.castle.rooms.royal.name, desc: t.castle.rooms.royal.desc }
              ].map(r => (
                <div key={r.type} className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-amber-300">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.desc}</div>
                  </div>
                  <button
                    onClick={() => handleRestAtInn(r.type)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition shrink-0 ml-3"
                  >
                    {t.castle.sleepBtn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOLTAC SHOP */}
        {currentTab === 'BOLTAC' && (
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl">
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-white">{t.castle.boltacTitle}</h2>
                <p className="text-[11px] sm:text-xs text-slate-400">{t.castle.boltacSubtitle}</p>
              </div>
              <button
                onClick={handlePoolGold}
                className="px-3 py-1.5 min-h-[36px] bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{t.castle.poolAllGoldBtn(selectedHero?.name || '')}</span>
              </button>
            </div>

            {/* Authentic U)NCURSE Notice if cursed item is equipped on selected hero */}
            {selectedHero?.possessions.some(p => p.cursed && p.equipped) && (
              <div className="bg-red-950/80 border-2 border-red-600/80 rounded-xl p-3 sm:p-4 text-xs space-y-2 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-red-200">
                  <Skull className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                  <span className="tracking-wide uppercase">
                    {t.castle.cursedWarningTitle(selectedHero.name)}
                  </span>
                </div>
                <p className="text-red-200/90 text-[11px] leading-relaxed">
                  {t.castle.cursedWarningBody}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Buy catalog */}
              <div className="bg-slate-900/60 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">{t.castle.catalogTitle}</h3>
                <div className="space-y-2 max-h-[340px] sm:max-h-[380px] overflow-y-auto pr-1">
                  {ITEMS_DATABASE.filter(it => it.price > 0 && it.boltacStock !== 0 && !it.cursed).map(item => {
                    const usableByHero = !selectedHero || canClassUseItem(selectedHero.class, item);
                    return (
                      <div key={item.id} className="p-2 sm:p-2.5 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate flex items-center gap-1.5 flex-wrap">
                            <span>{item.name}</span>
                            {!usableByHero && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 uppercase">
                                {t.castle.unusableBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                            {item.objType} {item.objType === 'WEAPON' && item.wepHpDam?.level ? `· ${lang === 'fr' ? 'Dégâts' : 'Damage'} ${formatDamageDice(item.wepHpDam)}` : ''} {item.armorMod ? `· ${t.character.acShort} -${item.armorMod}` : ''} · {item.price} {t.character.goldShort}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {lang === 'fr' ? 'Classes :' : 'Classes:'} <span className={usableByHero ? "text-slate-400" : "text-rose-400 font-semibold"}>{getUsableClassesList(item, true, lang).join(', ') || (lang === 'fr' ? 'Aucune' : 'None')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyItem(item)}
                          className={`px-3 py-1.5 min-h-[32px] ${
                            usableByHero 
                              ? 'bg-amber-600 hover:bg-amber-500' 
                              : 'bg-slate-700 hover:bg-rose-900/60 text-slate-300 hover:text-white border border-slate-600'
                          } text-white rounded text-xs font-bold transition shrink-0 active:scale-95`}
                          title={!usableByHero ? `${t.castle.unusableBadge} (${getHeroClassName(selectedHero.class)})` : undefined}
                        >
                          {t.castle.buyBtn}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Player Inventory (Sell, Identify, Uncurse) */}
              <div className="bg-slate-900/60 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {t.castle.heroInventoryTitle(selectedHero?.name || '')}
                </h3>
                <div className="space-y-2 max-h-[340px] sm:max-h-[380px] overflow-y-auto pr-1">
                  {selectedHero?.possessions.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-6 text-center">{t.castle.emptyInventory}</p>
                  )}
                  {selectedHero?.possessions.map((slot, sIdx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;
                    const isProficient = canClassUseItem(selectedHero.class, itm);
                    const displayName = slot.identified ? itm.name : (itm.nameUnknown || (lang === 'fr' ? 'OBJET INCONNU' : 'UNKNOWN ITEM'));
                    const sellPrice = slot.identified ? Math.max(1, Math.floor(itm.price / 2)) : 1;
                    const identifyFee = Math.max(10, Math.floor(itm.price / 2));
                    const uncurseFee = Math.max(20, itm.price);

                    return (
                      <div key={sIdx} className="p-2 sm:p-2.5 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{displayName}</span>
                            {!slot.identified && (
                              <span className="text-[9px] sm:text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/40 font-bold shrink-0">
                                {t.castle.unidentBadge}
                              </span>
                            )}
                            {slot.equipped && <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold shrink-0">{t.castle.equippedBadge}</span>}
                            {slot.cursed && <span className="text-[9px] sm:text-[10px] text-red-400 font-bold shrink-0">{t.castle.cursedBadge}</span>}
                            {slot.identified && !isProficient && <span className="text-[9px] sm:text-[10px] text-rose-400 font-bold shrink-0">{t.castle.incompatibleBadge}</span>}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400">
                            {slot.cursed 
                              ? (lang === 'fr' ? `Maudit · Coût désenvoûtement : ${uncurseFee} PO` : `Cursed · Uncurse cost: ${uncurseFee} GP`)
                              : (lang === 'fr' ? `Revente : ${sellPrice} PO ${!slot.identified ? '(non identifié : 1 PO)' : ''}` : `Sell value: ${sellPrice} GP ${!slot.identified ? '(unidentified: 1 GP)' : ''}`)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!slot.identified && (
                            <button
                              onClick={() => handleBoltacIdentify(sIdx)}
                              className="px-2.5 py-1.5 min-h-[32px] bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-semibold transition active:scale-95 flex items-center gap-1 shadow-sm"
                              title={t.castle.identifyTooltip(identifyFee)}
                            >
                              <span>{t.castle.buyBtn ? (lang === 'fr' ? 'Identifier' : 'Identify') : 'Identify'}</span>
                              <span className="text-[10px] text-purple-200 font-mono">({identifyFee} {t.character.goldShort})</span>
                            </button>
                          )}
                          {slot.cursed ? (
                            <button
                              onClick={() => handleBoltacUncurse(sIdx)}
                              className="px-2.5 py-1.5 min-h-[32px] bg-red-800 hover:bg-red-700 text-white rounded text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow-sm border border-red-500/60"
                              title={t.castle.uncurseTooltip(uncurseFee)}
                            >
                              <Skull className="w-3.5 h-3.5 text-red-200 shrink-0" />
                              <span>{t.castle.uncurseBtn(uncurseFee)}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSellItem(sIdx)}
                              className="px-3 py-1.5 min-h-[32px] bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold transition shrink-0 active:scale-95"
                            >
                              {t.castle.sellBtn}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEMPLE OF CANT */}
        {currentTab === 'TEMPLE' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">{t.castle.templeTitle}</h2>
              <p className="text-xs text-slate-400">{t.castle.templeSubtitle}</p>
            </div>

            <div className="space-y-3">
              {(() => {
                const deceasedOrAfflictedRoster = allCharacters.filter(c => 
                  !party.some(p => p.id === c.id) && 
                  (c.status === 'DEAD' || c.status === 'ASHES' || c.status === 'PLYZE' || c.status === 'STONED')
                );
                const patients = [...party, ...deceasedOrAfflictedRoster];

                if (patients.length === 0) {
                  return (
                    <div className="p-8 bg-slate-800/40 border border-slate-700/40 rounded-xl text-center space-y-2">
                      <p className="text-emerald-400 font-bold text-sm">{t.castle.peacefulTitle}</p>
                      <p className="text-xs text-slate-400">{t.castle.peacefulDesc}</p>
                    </div>
                  );
                }

                return patients.map(h => {
                  const effs = getActiveStatusEffects(h, lang);
                  const hasAilment = effs.length > 0;
                  const isDeceasedRoster = !party.some(p => p.id === h.id);

                  return (
                    <div key={h.id} className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{h.name} ({getHeroClassName(h.class)})</span>
                          {isDeceasedRoster && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                              {t.castle.depositedAtTemple}
                            </span>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {effs.map(e => (
                              <span key={e.id} className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${e.bgColor} ${e.borderColor} ${e.color}`}>
                                {e.badge}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-slate-400 pt-0.5">
                          {t.castle.healthLabel(h.hpLeft, h.hpMax)} · {t.castle.goldLabel(h.gold)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dead or Ashes: Resurrection */}
                        {(h.status === 'DEAD' || h.status === 'ASHES') && (
                          <button
                            onClick={() => handleResurrect(h)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition"
                          >
                            {t.castle.resurrectBtn(h.charLevel * (h.status === 'DEAD' ? 250 : 500))}
                          </button>
                        )}

                        {/* Paralyzed: Cure Paralysis */}
                        {h.status === 'PLYZE' && (
                          <button
                            onClick={() => handleCureParalysis(h)}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            {t.castle.cureParalysisBtn(100)}
                          </button>
                        )}

                        {/* Stoned: Cure Petrified */}
                        {h.status === 'STONED' && (
                          <button
                            onClick={() => handleCureStoned(h)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {t.castle.cureStonedBtn(200)}
                          </button>
                        )}

                        {!hasAilment && (
                          <span className="text-emerald-400 flex items-center gap-1 italic text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {t.castle.fullHealthNotice}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* TRAINING GROUNDS */}
        {currentTab === 'TRAINING' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
              <button
                onClick={() => { setTrainingMode('CREATE'); sounds.playTurn(); }}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  trainingMode === 'CREATE'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.castle.modeCreateHero}</span>
              </button>
              <button
                onClick={() => {
                  setTrainingMode('RESPEC');
                  sounds.playTurn();
                  if (!respecCharId && (party[0] || allCharacters[0])) {
                    handleSelectCharForRespec((party[0] || allCharacters[0]).id);
                  }
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  trainingMode === 'RESPEC'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{t.castle.modeRespecStats}</span>
              </button>
            </div>

            {/* MODE 1: CREATE NEW HERO */}
            {trainingMode === 'CREATE' && (
              <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-white">{trainingGroundsName}</h2>
                    <p className="text-xs text-slate-400">{t.castle.trainingSubtitle}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">{t.castle.nameInputLabel}</label>
                    <input
                      type="text"
                      value={newCharName}
                      onChange={e => setNewCharName(e.target.value)}
                      placeholder={t.castle.namePlaceholder}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">{t.castle.raceLabel}</label>
                    <select
                      value={newCharRace}
                      onChange={e => handleRaceChange(e.target.value as TRace)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="HUMAN">{t.character.races.human} (8/8/5/8/8/9)</option>
                      <option value="ELF">{t.character.races.elf} (7/10/10/6/9/6)</option>
                      <option value="DWARF">{t.character.races.dwarf} (10/7/10/10/5/6)</option>
                      <option value="GNOME">{t.character.races.gnome} (7/7/10/8/10/7)</option>
                      <option value="HOBBIT">{t.character.races.hobbit} (5/7/7/6/10/15)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">{t.castle.alignLabel}</label>
                    <select
                      value={newCharAlign}
                      onChange={e => setNewCharAlign(e.target.value as TAlign)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="GOOD">{t.character.alignments.good}</option>
                      <option value="NEUTRAL">{t.character.alignments.neutral}</option>
                      <option value="EVIL">{t.character.alignments.evil}</option>
                    </select>
                  </div>
                </div>

                {!isRollingStats ? (
                  <div className="pt-2">
                    <button
                      onClick={startRollStats}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg hover:shadow-amber-600/20"
                    >
                      <Flame className="w-4 h-4" />
                      <span>{t.castle.rollStatsBtn}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    {/* Toolbar for Bonus Points Redistribution & Reroll */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{t.castle.reserveLabel}</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                          bonusPoints > 0 
                            ? 'bg-amber-950/70 border-amber-600/60 text-amber-300 animate-pulse' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          {t.castle.pointsRemaining(bonusPoints, totalBonusRolled)}
                        </span>
                      </div>

                      {/* Actions: Reroll Dice & Reset Distribution */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRerollBonusPoints}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-amber-500"
                          title={t.castle.rerollTooltip}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.castle.rerollBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetAttributeAllocation}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-slate-500"
                          title={t.castle.resetAllocationTooltip}
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>{t.castle.resetAllocationBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* Characteristic Allocation Grid with + and - buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {Object.entries(allocatedStats).map(([st, val]) => {
                        const baseVal = RACE_BASE_ATTRIBUTES[newCharRace][st] || 8;
                        const added = val - baseVal;
                        const key = st === 'IQ' ? 'iq' : st.toLowerCase() as keyof typeof t.character.attributes;
                        const info = t.character.attributes[key] || { label: st, abbr: st.slice(0, 3) };

                        return (
                          <div key={st} className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-center flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{info.label}</div>
                              <div className="text-[10px] text-slate-500 font-mono">({info.abbr})</div>
                            </div>

                            <div className="py-2">
                              <div className="text-xl font-black text-white font-mono">{val}</div>
                              <div className="text-[10px] flex items-center justify-center gap-1 font-semibold">
                                {added > 0 ? (
                                  <span className="text-amber-400 font-bold">+{added} bonus</span>
                                ) : (
                                  <span className="text-slate-500">Base ({baseVal})</span>
                                )}
                              </div>
                            </div>

                            {/* Decrement and Increment Buttons */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleRemoveStat(st as any)}
                                disabled={val <= baseVal}
                                className="py-1.5 px-2 min-h-[36px] bg-slate-700/70 hover:bg-slate-600 active:scale-95 text-slate-200 rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-slate-600/50 flex items-center justify-center"
                                title={`-1 ${info.label}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddStat(st as any)}
                                disabled={bonusPoints <= 0 || val >= 18}
                                className="py-1.5 px-2 min-h-[36px] bg-amber-600/80 hover:bg-amber-500 active:scale-95 text-white rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-amber-500/50 flex items-center justify-center shadow-sm"
                                title={`+1 ${info.label}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Classes Eligibility Selection */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                          {lang === 'fr' ? 'Classes Éligibles selon les Caractéristiques :' : 'Eligible Classes for Attribute Allocation:'}
                        </label>
                        {bonusPoints > 0 && (
                          <span className="text-[11px] text-amber-400 font-medium italic">
                            {lang === 'fr' ? 'Astuce : dépensez tous vos points bonus pour maximiser votre héros !' : 'Tip: spend all bonus points to maximize your adventurer!'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { cls: 'FIGHTER' as const, name: t.character.classes.fighter, req: allocatedStats.STRENGTH >= 11, desc: `${t.character.attributes.strength.abbr} 11+` },
                          { cls: 'MAGE' as const, name: t.character.classes.mage, req: allocatedStats.IQ >= 11, desc: `${t.character.attributes.iq.abbr} 11+` },
                          { cls: 'PRIEST' as const, name: t.character.classes.priest, req: allocatedStats.PIETY >= 11 && newCharAlign !== 'NEUTRAL', desc: `${t.character.attributes.piety.abbr} 11+, !Neut` },
                          { cls: 'THIEF' as const, name: t.character.classes.thief, req: allocatedStats.AGILITY >= 11 && newCharAlign !== 'GOOD', desc: `${t.character.attributes.agility.abbr} 11+, !Good` },
                          { cls: 'BISHOP' as const, name: t.character.classes.bishop, req: allocatedStats.IQ >= 12 && allocatedStats.PIETY >= 12, desc: `${t.character.attributes.iq.abbr} 12+, ${t.character.attributes.piety.abbr} 12+` },
                          { cls: 'SAMURAI' as const, name: t.character.classes.samurai, req: allocatedStats.STRENGTH >= 15 && allocatedStats.VITALITY >= 14, desc: `${t.character.attributes.strength.abbr} 15+, ${t.character.attributes.vitality.abbr} 14+` },
                          { cls: 'LORD' as const, name: t.character.classes.lord, req: allocatedStats.STRENGTH >= 15 && allocatedStats.PIETY >= 12 && newCharAlign === 'GOOD', desc: `${t.character.attributes.strength.abbr} 15+, ${t.character.attributes.piety.abbr} 12+, Good` },
                          { cls: 'NINJA' as const, name: t.character.classes.ninja, req: allocatedStats.STRENGTH >= 17 && allocatedStats.AGILITY >= 17 && newCharAlign === 'EVIL', desc: `${t.character.attributes.strength.abbr} 17+, ${t.character.attributes.agility.abbr} 17+, Evil` }
                        ].map(item => (
                          <button
                            key={item.cls}
                            disabled={!item.req}
                            onClick={() => handleCreateNewHero(item.cls)}
                            className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                              item.req
                                ? 'bg-slate-800 hover:bg-amber-600/90 text-white border-amber-600/40 hover:border-amber-400 cursor-pointer shadow-sm hover:scale-[1.02]'
                                : 'bg-slate-900/60 text-slate-500 border-slate-800 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <div className="font-bold text-xs flex items-center justify-between">
                              <span>{item.name}</span>
                              <span className="text-[10px] font-mono uppercase text-slate-400">{item.cls}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: RESPEC EXISTING HERO */}
            {trainingMode === 'RESPEC' && (
              <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-5">
                <div>
                  <h2 className="text-lg font-serif font-bold text-white">{t.castle.modeRespecStats}</h2>
                  <p className="text-xs text-slate-400">{lang === 'fr' ? 'Modifiez la distribution des points ou relancez le tirage pour optimiser un membre existant de votre guilde.' : 'Reallocate attribute points or reroll bonus dice to optimize an existing guild member.'}</p>
                </div>

                {/* Hero Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">{lang === 'fr' ? "Choisir l'aventurier à réentraîner :" : 'Choose adventurer to respec:'}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {allCharacters.map(h => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleSelectCharForRespec(h.id)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          respecCharId === h.id
                            ? 'bg-amber-950/60 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{h.name}</div>
                        <div className="text-[10px] text-slate-400">{getHeroRaceName(h.race)} · {getHeroClassName(h.class)}</div>
                        <div className="text-[9px] text-amber-400 font-mono">{t.character.lvlShort} {h.charLevel}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {respecCharId && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    {/* Action Bar for Respec */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{lang === 'fr' ? 'Points disponibles :' : 'Points available:'}</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                          respecBonusAvailable > 0
                            ? 'bg-amber-950/70 border-amber-600/60 text-amber-300 animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          {respecBonusAvailable} {lang === 'fr' ? `point${respecBonusAvailable > 1 ? 's' : ''} restant${respecBonusAvailable > 1 ? 's' : ''}` : `point${respecBonusAvailable > 1 ? 's' : ''} remaining`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRespecReroll}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-amber-500"
                          title={t.castle.rerollTooltip}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.castle.rerollBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRespecResetToBase}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-slate-500"
                          title={t.castle.resetAllocationTooltip}
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>{t.castle.resetAllocationBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveRespec}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'fr' ? 'Enregistrer' : 'Save'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Respec Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {Object.keys(respecStats).map(st => {
                        const val = respecStats[st] ?? 8;
                        const hero = allCharacters.find(c => c.id === respecCharId) || party.find(c => c.id === respecCharId);
                        const raceBase = hero ? (RACE_BASE_ATTRIBUTES[hero.race][st] || 8) : 8;
                        const added = val - raceBase;
                        const key = st === 'IQ' ? 'iq' : st.toLowerCase() as keyof typeof t.character.attributes;
                        const info = t.character.attributes[key] || { label: st, abbr: st.slice(0, 3) };

                        return (
                          <div key={st} className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-center flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{info.label}</div>
                              <div className="text-[10px] text-slate-500 font-mono">({info.abbr})</div>
                            </div>

                            <div className="py-2">
                              <div className="text-xl font-black text-white font-mono">{val}</div>
                              <div className="text-[10px] flex items-center justify-center gap-1 font-semibold">
                                {added > 0 ? (
                                  <span className="text-amber-400 font-bold">+{added} bonus</span>
                                ) : (
                                  <span className="text-slate-500">Base ({raceBase})</span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleRespecRemoveStat(st)}
                                disabled={val <= raceBase}
                                className="py-1.5 px-2 min-h-[36px] bg-slate-700/70 hover:bg-slate-600 active:scale-95 text-slate-200 rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-slate-600/50 flex items-center justify-center"
                                title={`-1 ${info.label}`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRespecAddStat(st)}
                                disabled={respecBonusAvailable <= 0 || val >= 18}
                                className="py-1.5 px-2 min-h-[36px] bg-amber-600/80 hover:bg-amber-500 active:scale-95 text-white rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-amber-500/50 flex items-center justify-center shadow-sm"
                                title={`+1 ${info.label}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAVERN VIEW */}
        {currentTab === 'TAVERN' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">{t.castle.tavernTitle}</h2>
              <p className="text-xs text-slate-400">{t.castle.tavernSubtitle}</p>
            </div>

            <div className="space-y-3">
              {allCharacters.map(h => {
                const isInActiveParty = party.some(p => p.id === h.id);
                const isLostInDungeon = h.lostLocation && h.lostLocation.level > 0;

                return (
                  <div key={h.id} className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs gap-3">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {getCharacterChevrons(h) && (
                          <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-1 py-0.5 rounded border border-amber-500/40 text-[11px] shrink-0">
                            "{getCharacterChevrons(h)}"
                          </span>
                        )}
                        <span>{h.name} · {getHeroRaceName(h.race)} {getHeroClassName(h.class)} ({t.character.lvlShort}{h.charLevel})</span>
                        {isLostInDungeon && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/90 text-red-300 border border-red-700/60 flex items-center gap-1">
                            <Skull className="w-3 h-3 text-red-400" />
                            {t.castle.lostInDungeonBadge}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">
                        {isLostInDungeon ? (
                          <span className="text-red-400/90 font-medium">
                            {t.castle.lostCoordinatesDesc(h.lostLocation?.level || 1, h.lostLocation?.x || 0, h.lostLocation?.y || 0)}
                          </span>
                        ) : (
                          <span>{t.castle.alignLabel} : {getHeroAlignName(h.align)} · {t.character.hpShort}: {h.hpLeft}/{h.hpMax} · {h.gold} {t.character.goldShort}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setInspectingRosterHero(h);
                          sounds.playTurn();
                        }}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 hover:text-white rounded text-xs font-semibold transition flex items-center gap-1 border border-slate-600"
                        title={lang === 'fr' ? 'Voir la fiche complète' : 'View full character sheet'}
                      >
                        <User className="w-3 h-3" />
                        {t.castle.sheetBtn}
                      </button>

                      {isLostInDungeon ? (
                        <div 
                          className="px-2.5 py-1 bg-red-950/40 border border-red-900/60 rounded text-[11px] text-red-400 font-semibold cursor-help"
                          title={lang === 'fr' ? 'Ce héros est tombé au combat. Envoyez une escouade le secourir !' : 'This hero fell in battle. Send a rescue squad to retrieve them!'}
                        >
                          {t.castle.lostBodyNotice}
                        </div>
                      ) : isInActiveParty ? (
                        <button
                          onClick={() => {
                            setParty(party.filter(p => p.id !== h.id));
                            sounds.playTurn();
                          }}
                          className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/50 rounded text-xs transition font-semibold"
                        >
                          {t.castle.removeBtn}
                        </button>
                      ) : (h.status === 'DEAD' || h.status === 'ASHES') ? (
                        <button
                          onClick={() => {
                            setCurrentTab('TEMPLE');
                            sounds.playTurn();
                          }}
                          className="px-3 py-1 bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-600/50 rounded text-xs font-semibold flex items-center gap-1 transition"
                          title={lang === 'fr' ? 'Rendez-vous au Temple de Cant pour ressusciter ce héros.' : 'Go to the Temple of Cant to resurrect this hero.'}
                        >
                          <Cross className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.castle.templeDeceasedBtn(h.status)}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (party.length >= 6) {
                              setMessage(t.castle.partyFullNotice);
                              return;
                            }
                            setParty([...party, h]);
                            sounds.playTurn();
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs transition"
                        >
                          {t.castle.recruitBtn}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* JOURNAL D'AVENTURES */}
        {currentTab === 'JOURNAL' && (
          <AdventureJournal
            events={adventureEvents}
            onClearEvents={onClearAdventureEvents}
            onEnterMaze={onEnterMaze}
          />
        )}
      </div>

      {/* Detailed Character Sheet Modal for Party Members */}
      {inspectingPartyIndex !== null && party[inspectingPartyIndex] && (
        <CharacterSheetModal
          character={party[inspectingPartyIndex]}
          party={party}
          currentIndex={inspectingPartyIndex}
          onSelectCharacter={(idx) => {
            setInspectingPartyIndex(idx);
            setSelectedCharIndex(idx);
          }}
          onUpdateCharacter={(updated) => {
            const nextParty = [...party];
            nextParty[inspectingPartyIndex] = updated;
            setParty(nextParty);
            const nextAll = allCharacters.map(c => c.id === updated.id ? updated : c);
            setAllCharacters(nextAll);
          }}
          onClose={() => setInspectingPartyIndex(null)}
        />
      )}

      {/* Detailed Character Sheet Modal for Tavern/Roster Heroes */}
      {inspectingRosterHero && (
        <CharacterSheetModal
          character={inspectingRosterHero}
          party={allCharacters}
          currentIndex={allCharacters.findIndex(c => c.id === inspectingRosterHero.id)}
          onSelectCharacter={(idx) => setInspectingRosterHero(allCharacters[idx])}
          onUpdateCharacter={(updated) => {
            const nextAll = allCharacters.map(c => c.id === updated.id ? updated : c);
            setAllCharacters(nextAll);
            const pIdx = party.findIndex(p => p.id === updated.id);
            if (pIdx !== -1) {
              const nextParty = [...party];
              nextParty[pIdx] = updated;
              setParty(nextParty);
            }
          }}
          onClose={() => setInspectingRosterHero(null)}
        />
      )}
    </div>
  );
};

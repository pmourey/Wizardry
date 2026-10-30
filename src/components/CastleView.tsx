import React, { useState, useEffect } from 'react';
import { 
  TCharacter, 
  GameLocation, 
  TRace, 
  TClass, 
  TAlign, 
  TItem 
} from '../types/wizardry';
import { 
  RACE_BASE_ATTRIBUTES, 
  ITEMS_DATABASE, 
  EXP_TABLES, 
  SPELLS,
  getExpForNextLevel,
  setCharacterSpells,
  initLevel1CharacterSpells,
  levelUpCharacter,
  formatDamageDice,
  recalculateCharacterCombatStats
} from '../data/provingGroundsData';
import { CharacterSheetModal } from './CharacterSheetModal';
import { sounds } from '../utils/soundEffects';
import { music } from '../utils/musicManager';
import { 
  Shield, 
  Sparkles, 
  HeartHandshake, 
  Store, 
  DoorOpen, 
  UserPlus, 
  Cross, 
  Coins, 
  ChevronRight, 
  Layers, 
  FileCode,
  Flame,
  User,
  ArrowRight,
  Biohazard,
  Moon,
  MicOff,
  Skull,
  Zap,
  CheckCircle2,
  Plus,
  Minus,
  RotateCcw,
  Undo2,
  Sliders,
  BookOpen,
  ScrollText
} from 'lucide-react';
import { getActiveStatusEffects } from '../engine/statusSystem';
import { AdventureJournal } from './AdventureJournal';
import { AdventureLogEvent, AdventureLogCategory } from '../types/wizardry';
import { WIZARDRY_SCENARIOS } from '../data/scenariosCatalog';

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
  onCheatRestoreParty?: () => void;
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
  onOpenPySide6Export,
  onCheatRestoreParty
}) => {
  const scenarioMeta = WIZARDRY_SCENARIOS.find(s => s.id === activeScenarioId) || WIZARDRY_SCENARIOS[0];
  const castleName = scenarioMeta.castleName || 'Château de Trebor';
  const castleSubtitle = scenarioMeta.castleSubtitle || 'Cité de garnison surplombant le Labyrinthe';
  const castleWelcome = scenarioMeta.castleWelcome || `Bienvenue dans les Terres de ${scenarioMeta.title}`;
  const castleDescription = scenarioMeta.castleDescription || scenarioMeta.description;
  const trainingGroundsName = scenarioMeta.trainingGroundsName || "Terrain d'Entraînement";

  const [currentTab, setCurrentTab] = useState<CastleTab>('COURTYARD');
  const [message, setMessage] = useState<string>(`Bienvenue à : ${castleName}. Choisissez votre destination.`);

  useEffect(() => {
    setMessage(`Bienvenue à : ${castleName}. Choisissez votre destination.`);
  }, [castleName]);

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

  // Per authentic Pascal Wizardry 1: Poison only exists in the maze (POISNAMT).
  // Characters entering the castle are automatically and immediately cured of poison!
  React.useEffect(() => {
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
      setMessage(`Fonds insuffisants ! ${selectedHero.name} n'a pas assez d'or (${cost} PO/sem.).`);
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
        ? ` · Nouveaux sorts appris : ${learnedSpells.join(', ')} !`
        : '';
      const statsNote = statChanges.length > 0
        ? ` (${statChanges.join(', ')})`
        : '';
      levelUpMsg = ` 🌟 NIVEAU SUPÉRIEUR ! ${selectedHero.name} atteint le Niveau ${selectedHero.charLevel} (+${hpGain} PV Max${statsNote})${spellsNote}`;
      sounds.playFanfare();
      onAddAdventureEvent?.(
        'CASTLE',
        `Montée de Niveau : ${selectedHero.name} (Niveau ${selectedHero.charLevel})`,
        `Après son séjour à l'Auberge de l'Aventurier, ${selectedHero.name} passe au Niveau ${selectedHero.charLevel} (+${hpGain} PV Max${statsNote}).${spellsNote}`,
        `Niveau : ${selectedHero.charLevel} · PV Max : ${selectedHero.hpMax}${learnedSpells.length > 0 ? ` · Sorts : ${learnedSpells.join(', ')}` : ''}`
      );
    } else {
      const expMissing = expNeeded - selectedHero.exp;
      levelUpMsg = ` (Il manque ${expMissing.toLocaleString()} XP pour le Niveau ${selectedHero.charLevel + 1}).`;
    }

    // Authentic SETSPELS (CASTLE2.TEXT l. 783): recharge spell slots according to class, level & known spells
    setCharacterSpells(selectedHero);

    setParty([...party]);
    setAllCharacters(prev => prev.map(c => c.id === selectedHero.id ? { ...selectedHero } : c));

    const healNote = roomType === 'STABLES'
      ? `a dormi aux Écuries (sorts restaurés, PV inchangés : ${selectedHero.hpLeft}/${selectedHero.hpMax}).`
      : weeksRested > 0
      ? `s'est reposé ${weeksRested} sem. (-${totalGoldSpent} PO, +${hpHealed} PV, PV : ${selectedHero.hpLeft}/${selectedHero.hpMax}) et a restauré ses sorts.`
      : `a restauré ses sorts (PV déjà au maximum : ${selectedHero.hpLeft}/${selectedHero.hpMax}).`;

    setMessage(`${selectedHero.name} ${healNote}${levelUpMsg}`);
  };

  // ==========================================
  // BOLTAC TRADING POST (BUY / SELL / IDENTIFY / POOL)
  // ==========================================
  const handleBuyItem = (item: TItem) => {
    if (selectedHero.gold < item.price) {
      setMessage(`Vous n'avez pas assez d'or pour acheter ${item.name} (${item.price} PO).`);
      return;
    }
    if (selectedHero.possessions.length >= 8) {
      setMessage(`L'inventaire de ${selectedHero.name} est plein (max 8 objets).`);
      return;
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
    setMessage(`Achat réussi : ${item.name} pour ${item.price} PO.`);
  };

  const handleSellItem = (slotIdx: number) => {
    const slot = selectedHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (slot.cursed && slot.equipped) {
      setMessage(`Impossible de vendre un objet maudit actuellement équipé ! Faites-le désenvoûter.`);
      return;
    }

    sounds.playGold();
    const sellPrice = Math.max(1, Math.floor(itm.price / 2));
    selectedHero.gold += sellPrice;
    selectedHero.possessions.splice(slotIdx, 1);
    setParty([...party]);
    setMessage(`Objet vendu : ${itm.name} pour ${sellPrice} PO.`);
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
    setMessage(`Tout l'or du groupe (${total.toLocaleString()} PO) a été rassemblé sur ${selectedHero.name}.`);
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
    setMessage(`L'or du groupe (${total.toLocaleString()} PO) a été divisé équitablement entre les ${count} membres (${share.toLocaleString()} PO chacun).`);
  };

  // ==========================================
  // TEMPLE OF CANT (RESURRECT / CURE)
  // ==========================================
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
      setMessage(`Dons insuffisants ! Le Temple exige ${cost} PO (Fonds indisponibles).`);
      return;
    }

    payer.gold -= cost;
    // Resurrection chance based on vitality
    const successChance = Math.min(95, targetHero.attrib.VITALITY * 5 + 30);
    if (Math.random() * 100 < successChance) {
      targetHero.status = 'OK';
      targetHero.hpLeft = 1;
      sounds.playFanfare();
      setMessage(`« CHANT - PRIÈRE - MIRACLE ! » ${targetHero.name} revient parmi les vivants avec 1 PV !`);
      onAddAdventureEvent?.(
        'RESCUE',
        `Miracle au Temple de Cant : ${targetHero.name} ressuscité !`,
        `Le rituel sacré et les prières des clercs ont arraché ${targetHero.name} aux mânes de la mort. Il se relève, prêt à combattre de nouveau.`,
        `Offrande payée par ${payer.name} : ${cost} PO · PV actuels : 1/${targetHero.hpMax}`
      );
    } else {
      if (targetHero.status === 'DEAD') {
        targetHero.status = 'ASHES';
        setMessage(`« MALHEUR ! » Le rituel échoue, le corps de ${targetHero.name} est réduit en CENDRES !`);
        onAddAdventureEvent?.(
          'LOSS',
          `Échec du rituel divin : ${targetHero.name} réduit en Cendres`,
          `Les prières n'ont pu retenir l'âme de ${targetHero.name}. Sa chair a été consumée en cendres sous la puissance de l'incantation.`,
          `Statut : CENDRES (un nouveau rituel plus coûteux reste possible)`
        );
      } else {
        targetHero.status = 'LOST';
        setMessage(`« HÉLAS ! » Les cendres se dispersent... ${targetHero.name} est PERDU À JAMAIS !`);
        onAddAdventureEvent?.(
          'LOSS',
          `Drame irréversible : ${targetHero.name} perdu dans le Néant`,
          `Les cendres se sont évanouies dans l'éther céleste. ${targetHero.name} ne foulera plus jamais les pavés du donjon.`,
          `Statut : PERDU À JAMAIS`
        );
      }
    }

    // Sync changes to both party and allCharacters roster
    setParty(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    setAllCharacters(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
  };

  const handleCurePoison = (targetHero: TCharacter) => {
    sounds.playSpellCast();
    const cost = 50;
    let payer = (selectedHero && selectedHero.gold >= cost) ? selectedHero : (party.find(p => p.gold >= cost) || null);
    if (!payer) {
      setMessage(`Fonds insuffisants ! Le Temple exige ${cost} PO pour purifier le poison.`);
      return;
    }
    payer.gold -= cost;
    targetHero.poisonAmount = 0;
    setParty(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    setAllCharacters(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    sounds.playFanfare();
    setMessage(`Le poison a été totalement extrait du corps de ${targetHero.name}.`);
  };

  const handleCureParalysis = (targetHero: TCharacter) => {
    sounds.playSpellCast();
    const cost = 100;
    let payer = (selectedHero && selectedHero.gold >= cost) ? selectedHero : (targetHero.gold >= cost ? targetHero : (party.find(p => p.gold >= cost) || allCharacters.find(c => c.gold >= cost) || null));
    if (!payer) {
      setMessage(`Fonds insuffisants ! Le Temple exige ${cost} PO pour lever la paralysie.`);
      return;
    }
    payer.gold -= cost;
    targetHero.status = 'OK';
    setParty(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    setAllCharacters(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    sounds.playFanfare();
    setMessage(`L'onction sacrée a délié les membres de ${targetHero.name}. La paralysie est guérie !`);
  };

  const handleCureStoned = (targetHero: TCharacter) => {
    sounds.playSpellCast();
    const cost = 200;
    let payer = (selectedHero && selectedHero.gold >= cost) ? selectedHero : (targetHero.gold >= cost ? targetHero : (party.find(p => p.gold >= cost) || allCharacters.find(c => c.gold >= cost) || null));
    if (!payer) {
      setMessage(`Fonds insuffisants ! Le Temple exige ${cost} PO pour inverser la pétrification.`);
      return;
    }
    payer.gold -= cost;
    targetHero.status = 'OK';
    setParty(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    setAllCharacters(prev => prev.map(c => c.id === targetHero.id ? { ...targetHero } : c));
    sounds.playFanfare();
    setMessage(`La pierre redevient chair vivante ! ${targetHero.name} est libéré de la pétrification !`);
  };

  // ==========================================
  // TRAINING GROUNDS (CREATE & RESPEC HEROES)
  // ==========================================
  const rollBonusDice = () => {
    // Authentic Wizardry Pascal dice logic:
    // Base 5 to 10 points
    let bonus = 5 + Math.floor(Math.random() * 6);
    // 14% chance to get +10 points (allowing Samurai, Lord, Bishop)
    if (Math.random() < 0.14) {
      bonus += 10;
      // If already high, 20% chance for legendary roll (Ninja: 24..29)
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
    setMessage(`🎲 Tirage des dés : ${bonus} points bonus obtenus ! Répartissez-les sur vos caractéristiques.`);
  };

  const handleRerollBonusPoints = () => {
    sounds.playTurn();
    const base = RACE_BASE_ATTRIBUTES[newCharRace];
    const bonus = rollBonusDice();
    setTotalBonusRolled(bonus);
    setBonusPoints(bonus);
    setAllocatedStats({ ...base } as any);
    setMessage(`🎲 Relance effectuée : ${bonus} points bonus obtenus ! Répartition réinitialisée aux bases de la race.`);
  };

  const handleResetAttributeAllocation = () => {
    sounds.playTurn();
    const base = RACE_BASE_ATTRIBUTES[newCharRace];
    setAllocatedStats({ ...base } as any);
    setBonusPoints(totalBonusRolled);
    setMessage(`Réinitialisation effectuée : les ${totalBonusRolled} points bonus sont à nouveau disponibles.`);
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
      setMessage(`Race modifiée en ${race} : caractéristiques de base appliquées, ${totalBonusRolled} points bonus prêts.`);
    }
  };

  // Respec logic for existing characters
  const handleSelectCharForRespec = (heroId: string) => {
    const hero = allCharacters.find(c => c.id === heroId) || party.find(c => c.id === heroId);
    if (!hero) return;
    setRespecCharId(hero.id);
    const raceBase = RACE_BASE_ATTRIBUTES[hero.race];
    
    // Calculate total points currently invested beyond race base
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
    setMessage(`Sélection de ${hero.name} (${hero.race} ${hero.class}) : ${totalPool} points de caractéristiques disponibles.`);
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
    setMessage(`Réinitialisation : tous les ${respecTotalPoints} points sont replacés dans la réserve.`);
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
    setMessage(`🎲 Nouveau tirage pour ${hero.name} : ${newBonus} points bonus obtenus !`);
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
    setMessage(`Caractéristiques mises à jour avec succès pour l'aventurier !`);
  };

  const handleCreateNewHero = (chosenClass: TClass) => {
    if (!newCharName.trim()) {
      setMessage('Veuillez entrer un nom pour votre héros.');
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

    // Authentic KEEPCHYN Level 1 spells & spell points (MAGE/BISHOP: Halito & Katino [2 pts]; PRIEST: Dios & Badios [2 pts])
    initLevel1CharacterSpells(newHero);
    recalculateCharacterCombatStats(newHero);

    setAllCharacters(prev => [...prev, newHero]);
    if (party.length < 6) {
      setParty(prev => [...prev, newHero]);
    }
    setNewCharName('');
    setIsRollingStats(false);
    setMessage(`Le héros ${newHero.name} (${newHero.race} ${newHero.class}) a été créé et inscrit au registre !`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400 font-bold font-serif shadow-sm">
            {`W${scenarioMeta.number}`}
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              {castleName}
            </h1>
            <p className="text-xs text-slate-400">
              {castleSubtitle}
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInspectingPartyIndex(selectedCharIndex);
              sounds.playTurn();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition shadow-sm"
            title="Inspecter les caractéristiques (FOR, INT, PIE, VIT, AGI, CHA) et l'équipement"
          >
            <User className="w-3.5 h-3.5" />
            Fiche Personnage
          </button>
          {onOpenPySide6Export && (
            <button
              onClick={onOpenPySide6Export}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              Code PySide6 (.py)
            </button>
          )}
          {onCheatRestoreParty && (
            <button
              onClick={() => {
                if (window.confirm('Triche : soigner et ressusciter tous les personnages ?')) {
                  onCheatRestoreParty();
                  setMessage('Triche : tous les personnages sont soignés et ressuscités.');
                  sounds.playFanfare();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
              title="Menu de triche : restaurer le groupe"
            >
              Triche : restaurer le groupe
            </button>
          )}
          <button
            onClick={onEnterMaze}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-amber-950/30"
          >
            <DoorOpen className="w-4 h-4" />
            Entrer dans le Donjon
          </button>
        </div>
      </div>

      {/* Main Town Navigation Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto text-xs">
        <button
          onClick={() => { setCurrentTab('COURTYARD'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'COURTYARD' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Grande Cour
        </button>
        <button
          onClick={() => { setCurrentTab('INN'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'INN' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Auberge de l'Aventurier
        </button>
        <button
          onClick={() => { setCurrentTab('TAVERN'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'TAVERN' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Taverne de Gilgamesh
        </button>
        <button
          onClick={() => { setCurrentTab('BOLTAC'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'BOLTAC' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Comptoir de Boltac
        </button>
        <button
          onClick={() => { setCurrentTab('TEMPLE'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'TEMPLE' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Temple de Cant
        </button>
        <button
          onClick={() => { setCurrentTab('TRAINING'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition ${currentTab === 'TRAINING' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          Terrains d'Entraînement
        </button>
        <button
          onClick={() => { setCurrentTab('JOURNAL'); sounds.playTurn(); }}
          className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${currentTab === 'JOURNAL' ? 'bg-amber-600 text-white shadow-md' : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/60'}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Journal d'Aventures</span>
          {adventureEvents.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${currentTab === 'JOURNAL' ? 'bg-amber-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
              {Math.min(10, adventureEvents.length)}
            </span>
          )}
        </button>
      </div>

      {/* Information Banner & Universal Party Selector / Gold Actions */}
      <div className="px-6 py-2.5 bg-slate-900/70 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-300 font-medium">{message}</span>
        </div>

        {/* Global Party Switcher & Gold Actions in Castle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Party Hero Selection Pills */}
          {party.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-1 hidden md:inline">Héros actif :</span>
              {party.map((hero, idx) => {
                const isSelected = idx === selectedCharIndex;
                return (
                  <button
                    key={hero.id}
                    onClick={() => {
                      setSelectedCharIndex(idx);
                      sounds.playTurn();
                    }}
                    className={`px-2 py-1 rounded text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-600 text-white font-bold ring-1 ring-amber-400 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                    }`}
                    title={`Sélectionner ${hero.name} (${hero.race} ${hero.class} Niv.${hero.charLevel} · ${hero.gold} PO)`}
                  >
                    <span>{hero.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      ({hero.gold} PO)
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Gold Actions: Pool & Share */}
          {party.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePoolGold}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                title={`Rassembler tout l'or du groupe (${party.reduce((sum, h) => sum + h.gold, 0)} PO) sur ${selectedHero?.name}`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Mettre l'or en commun</span>
              </button>

              <button
                onClick={handleShareGold}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                title="Diviser équitablement la fortune du groupe entre tous les héros"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Diviser l'or</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setInspectingPartyIndex(selectedCharIndex);
              sounds.playTurn();
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <User className="w-3 h-3" />
            Voir Fiche
          </button>
        </div>
      </div>

      {/* Town Views Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {currentTab === 'COURTYARD' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl space-y-4">
              <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                {castleWelcome}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {castleDescription}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <button
                  onClick={() => setCurrentTab('INN')}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1.5"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Auberge
                  </div>
                  <p className="text-xs text-slate-400">Soignez les blessures et gagnez des niveaux.</p>
                </button>

                <button
                  onClick={() => setCurrentTab('BOLTAC')}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1.5"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Comptoir
                  </div>
                  <p className="text-xs text-slate-400">Achetez armes, armures et potions.</p>
                </button>

                <button
                  onClick={() => setCurrentTab('TEMPLE')}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition space-y-1.5"
                >
                  <div className="text-amber-400 font-bold flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4" />
                    Temple
                  </div>
                  <p className="text-xs text-slate-400">Ressuscitez les défunts et soignez pétrifications et paralysies.</p>
                </button>

                <button
                  onClick={() => setCurrentTab('JOURNAL')}
                  className="p-4 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-600/40 rounded-xl text-left transition space-y-1.5"
                >
                  <div className="text-amber-300 font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Journal d'Aventures
                  </div>
                  <p className="text-xs text-amber-200/70">Consultez les 10 derniers événements du dédale.</p>
                </button>
              </div>
            </div>

            {/* Ready Party Summary Strip */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">
                  Composition Actuelle de l'Escouade ({party.length}/6)
                </h3>
                <span className="text-xs text-slate-400">Cliquez sur un héros pour interagir dans les boutiques</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
                {party.map((hero, idx) => (
                  <div
                    key={hero.id}
                    onClick={() => { setSelectedCharIndex(idx); sounds.playTurn(); }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col justify-between ${selectedCharIndex === idx ? 'bg-amber-950/40 border-amber-500/60 shadow-sm' : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600'}`}
                  >
                    <div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{hero.name}</span>
                        <span className="text-[10px] text-amber-400">Niv.{hero.charLevel}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{hero.class}</div>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">PV:</span>
                        <span className={hero.hpLeft < hero.hpMax / 2 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                          {hero.hpLeft}/{hero.hpMax}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>CA: {hero.armorClass}</span>
                        <span className="text-amber-400">{hero.gold} PO</span>
                      </div>
                      {/* Active Status Badges */}
                      <div className="flex flex-wrap gap-1 pt-1 min-h-[18px]">
                        {getActiveStatusEffects(hero).map(eff => (
                          <span 
                            key={eff.id}
                            className={`text-[9px] font-bold px-1 py-0.2 rounded border ${eff.bgColor} ${eff.borderColor} ${eff.color}`}
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
                        className="mt-2 w-full py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                        title="Voir les caractéristiques FOR, INT, PIE, VIT, AGI, CHA"
                      >
                        <User className="w-3 h-3" />
                        Fiche de stats
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
              <h2 className="text-lg font-serif font-bold text-white">L'Auberge de l'Aventurier</h2>
              <p className="text-xs text-slate-400">Reposez-vous pour restaurer vos forces et accumuler vos montées de niveau.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { type: 'STABLES' as const, name: 'Les Écuries', cost: 0, desc: 'Gratuit. Restaure tous les sorts, aucun soin de PV.' },
                { type: 'COTS' as const, name: 'Les Paillasses', cost: 10, desc: '10 PO / sem. Rend tous les PV et sorts.' },
                { type: 'ECONOMY' as const, name: 'Chambres Économiques', cost: 50, desc: '50 PO / sem. Soins rapides et sorts.' },
                { type: 'MERCHANT' as const, name: 'Suites Marchandes', cost: 200, desc: '200 PO / sem. Confort royal et soins.' },
                { type: 'ROYAL' as const, name: 'Suites Royales', cost: 500, desc: '500 PO / sem. Le summum de la noblesse.' }
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
                    Dormir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOLTAC SHOP */}
        {currentTab === 'BOLTAC' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Comptoir de Boltac</h2>
                <p className="text-xs text-slate-400">Armes, protections et artefacts magiques.</p>
              </div>
              <button
                onClick={handlePoolGold}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                Mettre tout l'or en commun sur {selectedHero?.name}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buy catalog */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Articles en vente</h3>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {ITEMS_DATABASE.filter(it => it.price > 0 && it.boltacStock !== 0 && !it.cursed).map(item => (
                    <div key={item.id} className="p-2.5 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {item.objType} {item.objType === 'WEAPON' && item.wepHpDam?.level ? `· Dégâts ${formatDamageDice(item.wepHpDam)}` : ''} {item.armorMod ? `· CA -${item.armorMod}` : ''} · {item.price} PO
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition"
                      >
                        Acheter
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Inventory (Sell) */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Inventaire de {selectedHero?.name} (Vendre)
                </h3>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {selectedHero?.possessions.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-6 text-center">Aucun objet dans l'inventaire.</p>
                  )}
                  {selectedHero?.possessions.map((slot, sIdx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;
                    return (
                      <div key={sIdx} className="p-2.5 bg-slate-800/50 border border-slate-700/40 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{itm.name}</span>
                            {slot.equipped && <span className="text-[10px] text-emerald-400 font-bold">[Équipé]</span>}
                            {slot.cursed && <span className="text-[10px] text-red-400 font-bold">[Maudit]</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">Valeur de vente : {Math.floor(itm.price / 2)} PO</div>
                        </div>
                        <button
                          onClick={() => handleSellItem(sIdx)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold transition"
                        >
                          Vendre
                        </button>
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
              <h2 className="text-lg font-serif font-bold text-white">Le Temple Radiant de Cant</h2>
              <p className="text-xs text-slate-400">Les prêtres invoquent les miracles divins pour relever les héros morts, lever la pétrification et guérir la paralysie (le poison est automatiquement neutralisé dès le retour au château).</p>
            </div>

            <div className="space-y-3">
              {(() => {
                // Authentic Wizardry: All heroes needing resurrection or healing are treated at the Temple of Cant,
                // including deceased heroes removed from the exploration party upon return to the castle!
                const deceasedOrAfflictedRoster = allCharacters.filter(c => 
                  !party.some(p => p.id === c.id) && 
                  (c.status === 'DEAD' || c.status === 'ASHES' || c.status === 'PLYZE' || c.status === 'STONED')
                );
                const patients = [...party, ...deceasedOrAfflictedRoster];

                if (patients.length === 0) {
                  return (
                    <div className="p-8 bg-slate-800/40 border border-slate-700/40 rounded-xl text-center space-y-2">
                      <p className="text-emerald-400 font-bold text-sm">Le Temple est paisible.</p>
                      <p className="text-xs text-slate-400">Aucun aventurier de votre garnison n'est mort ou affligé de pétrification.</p>
                    </div>
                  );
                }

                return patients.map(h => {
                  const effs = getActiveStatusEffects(h);
                  const hasAilment = effs.length > 0;
                  const isDeceasedRoster = !party.some(p => p.id === h.id);

                  return (
                    <div key={h.id} className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{h.name} ({h.class})</span>
                          {isDeceasedRoster && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                              Déposé au Temple
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
                          Santé : <strong className={h.hpLeft < h.hpMax / 2 ? 'text-red-400' : 'text-emerald-400'}>{h.hpLeft}/{h.hpMax} PV</strong> · Or : {h.gold} PO
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Dead or Ashes: Resurrection */}
                        {(h.status === 'DEAD' || h.status === 'ASHES') && (
                          <button
                            onClick={() => handleResurrect(h)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition"
                          >
                            Ressusciter ({h.charLevel * (h.status === 'DEAD' ? 250 : 500)} PO)
                          </button>
                        )}

                        {/* Paralyzed: Cure Paralysis */}
                        {h.status === 'PLYZE' && (
                          <button
                            onClick={() => handleCureParalysis(h)}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Guérir Paralysie (100 PO)
                          </button>
                        )}

                        {/* Stoned: Cure Petrified */}
                        {h.status === 'STONED' && (
                          <button
                            onClick={() => handleCureStoned(h)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition flex items-center gap-1"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Lever Pétrification (200 PO)
                          </button>
                        )}

                        {!hasAilment && (
                          <span className="text-emerald-400 flex items-center gap-1 italic text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> En pleine santé
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
                <span>Créer un Nouveau Héros</span>
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
                <span>Réattribuer les Caractéristiques (Héros Existant)</span>
              </button>
            </div>

            {/* MODE 1: CREATE NEW HERO */}
            {trainingMode === 'CREATE' && (
              <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-xl space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-white">{trainingGroundsName}</h2>
                    <p className="text-xs text-slate-400">Générez un nouvel aventurier, tirez les points bonus et répartissez-les selon votre classe désirée.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nom du Héros</label>
                    <input
                      type="text"
                      value={newCharName}
                      onChange={e => setNewCharName(e.target.value)}
                      placeholder="Ex: ARTHUR"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Race</label>
                    <select
                      value={newCharRace}
                      onChange={e => handleRaceChange(e.target.value as TRace)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="HUMAN">Humain (Équilibré · Base 8/8/5/8/8/9)</option>
                      <option value="ELF">Elfe (I.Q. & Piété · Base 7/10/10/6/9/6)</option>
                      <option value="DWARF">Nain (Force & Vitalité · Base 10/7/10/10/5/6)</option>
                      <option value="GNOME">Gnome (Piété & Agilité · Base 7/7/10/8/10/7)</option>
                      <option value="HOBBIT">Hobbit (Chance extrême · Base 5/7/7/6/10/15)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Alignement</label>
                    <select
                      value={newCharAlign}
                      onChange={e => setNewCharAlign(e.target.value as TAlign)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="GOOD">Bon (Requis pour Seigneur / Lord)</option>
                      <option value="NEUTRAL">Neutre (Idéal pour Guerrier / Voleur)</option>
                      <option value="EVIL">Mauvais (Requis pour Ninja)</option>
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
                      <span>Tirer les dés de Caractéristiques</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    {/* Toolbar for Bonus Points Redistribution & Reroll */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Réserve :</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                          bonusPoints > 0 
                            ? 'bg-amber-950/70 border-amber-600/60 text-amber-300 animate-pulse' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          {bonusPoints} point{bonusPoints > 1 ? 's' : ''} restant{bonusPoints > 1 ? 's' : ''} sur {totalBonusRolled}
                        </span>
                      </div>

                      {/* Actions: Reroll Dice & Reset Distribution */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRerollBonusPoints}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-amber-500"
                          title="Relancer le tirage aléatoire des dés pour obtenir un nouveau score bonus (ex: 18-29 pour Samurai/Ninja)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Relancer le Tirage (Dés)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetAttributeAllocation}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-slate-500"
                          title="Remettre les caractéristiques aux valeurs de base et replacer tous les points dans la réserve"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Réinitialiser la Répartition</span>
                        </button>
                      </div>
                    </div>

                    {/* Characteristic Allocation Grid with + and - buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {Object.entries(allocatedStats).map(([st, val]) => {
                        const baseVal = RACE_BASE_ATTRIBUTES[newCharRace][st] || 8;
                        const added = val - baseVal;
                        const statLabels: Record<string, { label: string; abbr: string }> = {
                          STRENGTH: { label: 'Force', abbr: 'FOR' },
                          IQ: { label: 'Intelligence', abbr: 'INT' },
                          PIETY: { label: 'Piété', abbr: 'PIE' },
                          VITALITY: { label: 'Vitalité', abbr: 'VIT' },
                          AGILITY: { label: 'Agilité', abbr: 'AGI' },
                          LUCK: { label: 'Chance', abbr: 'CHA' }
                        };
                        const info = statLabels[st] || { label: st, abbr: st.slice(0, 3) };

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
                                className="py-1 px-2 bg-slate-700/70 hover:bg-slate-600 text-slate-200 rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-slate-600/50 flex items-center justify-center"
                                title={`Diminuer ${info.label} (-1) et récupérer 1 point bonus`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddStat(st as any)}
                                disabled={bonusPoints <= 0 || val >= 18}
                                className="py-1 px-2 bg-amber-600/80 hover:bg-amber-500 text-white rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-amber-500/50 flex items-center justify-center shadow-sm"
                                title={`Augmenter ${info.label} (+1) en dépensant 1 point bonus`}
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
                          Classes Éligibles selon les Caractéristiques Allouées :
                        </label>
                        {bonusPoints > 0 && (
                          <span className="text-[11px] text-amber-400 font-medium italic">
                            Astuce : dépensez tous vos points bonus pour maximiser votre héros !
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { cls: 'FIGHTER' as const, name: 'Guerrier', req: allocatedStats.STRENGTH >= 11, desc: 'FOR 11+' },
                          { cls: 'MAGE' as const, name: 'Mage', req: allocatedStats.IQ >= 11, desc: 'INT 11+' },
                          { cls: 'PRIEST' as const, name: 'Prêtre', req: allocatedStats.PIETY >= 11 && newCharAlign !== 'NEUTRAL', desc: 'PIE 11+, Pas Neutre' },
                          { cls: 'THIEF' as const, name: 'Voleur', req: allocatedStats.AGILITY >= 11 && newCharAlign !== 'GOOD', desc: 'AGI 11+, Pas Bon' },
                          { cls: 'BISHOP' as const, name: 'Évêque', req: allocatedStats.IQ >= 12 && allocatedStats.PIETY >= 12, desc: 'INT 12+, PIE 12+' },
                          { cls: 'SAMURAI' as const, name: 'Samouraï', req: allocatedStats.STRENGTH >= 15 && allocatedStats.VITALITY >= 14, desc: 'FOR 15+, VIT 14+' },
                          { cls: 'LORD' as const, req: allocatedStats.STRENGTH >= 15 && allocatedStats.PIETY >= 12 && newCharAlign === 'GOOD', name: 'Seigneur', desc: 'FOR 15+, PIE 12+, Bon' },
                          { cls: 'NINJA' as const, req: allocatedStats.STRENGTH >= 17 && allocatedStats.AGILITY >= 17 && newCharAlign === 'EVIL', name: 'Ninja', desc: 'FOR 17+, AGI 17+, Mauvais' }
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
                  <h2 className="text-lg font-serif font-bold text-white">Réattribution des Caractéristiques d'un Héros</h2>
                  <p className="text-xs text-slate-400">Modifiez la distribution des points ou relancez le tirage pour optimiser un membre existant de votre guilde.</p>
                </div>

                {/* Hero Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Choisir l'aventurier à réentraîner :</label>
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
                        <div className="text-[10px] text-slate-400">{h.race} · {h.class}</div>
                        <div className="text-[9px] text-amber-400 font-mono">Niv. {h.charLevel}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {respecCharId && (
                  <div className="space-y-4 pt-3 border-t border-slate-800">
                    {/* Action Bar for Respec */}
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Points disponibles :</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                          respecBonusAvailable > 0
                            ? 'bg-amber-950/70 border-amber-600/60 text-amber-300 animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          {respecBonusAvailable} point{respecBonusAvailable > 1 ? 's' : ''} restant{respecBonusAvailable > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRespecReroll}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-amber-500"
                          title="Tirer de nouveaux dés bonus pour ce héros"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Relancer le Tirage</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRespecResetToBase}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 hover:border-slate-500"
                          title="Remettre aux bases de la race et replacer tous les points dans la réserve"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Remettre à Zéro</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveRespec}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enregistrer</span>
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
                        const statLabels: Record<string, { label: string; abbr: string }> = {
                          STRENGTH: { label: 'Force', abbr: 'FOR' },
                          IQ: { label: 'Intelligence', abbr: 'INT' },
                          PIETY: { label: 'Piété', abbr: 'PIE' },
                          VITALITY: { label: 'Vitalité', abbr: 'VIT' },
                          AGILITY: { label: 'Agilité', abbr: 'AGI' },
                          LUCK: { label: 'Chance', abbr: 'CHA' }
                        };
                        const info = statLabels[st] || { label: st, abbr: st.slice(0, 3) };

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
                                className="py-1 px-2 bg-slate-700/70 hover:bg-slate-600 text-slate-200 rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-slate-600/50 flex items-center justify-center"
                                title={`Diminuer ${info.label} (-1) et récupérer 1 point`}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRespecAddStat(st)}
                                disabled={respecBonusAvailable <= 0 || val >= 18}
                                className="py-1 px-2 bg-amber-600/80 hover:bg-amber-500 text-white rounded text-xs font-black disabled:opacity-20 disabled:pointer-events-none transition border border-amber-500/50 flex items-center justify-center shadow-sm"
                                title={`Augmenter ${info.label} (+1) en dépensant 1 point`}
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
              <h2 className="text-lg font-serif font-bold text-white">Taverne de Gilgamesh</h2>
              <p className="text-xs text-slate-400">Recrutez ou libérez des aventuriers pour former une équipe de 1 à 6 membres.</p>
            </div>

            <div className="space-y-3">
              {allCharacters.map(h => {
                const isInActiveParty = party.some(p => p.id === h.id);
                const isLostInDungeon = h.lostLocation && h.lostLocation.level > 0;

                return (
                  <div key={h.id} className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-between text-xs gap-3">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{h.name} · {h.race} {h.class} (Niv.{h.charLevel})</span>
                        {isLostInDungeon && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/90 text-red-300 border border-red-700/60 flex items-center gap-1">
                            <Skull className="w-3 h-3 text-red-400" />
                            Perdu dans le Donjon
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">
                        {isLostInDungeon ? (
                          <span className="text-red-400/90 font-medium">
                            Gît au Niveau {h.lostLocation?.level}, coordonnées ({h.lostLocation?.x}, {h.lostLocation?.y}) · Envoyez des secours !
                          </span>
                        ) : (
                          <span>Alignement : {h.align} · PV: {h.hpLeft}/{h.hpMax} · {h.gold} PO</span>
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
                        title="Voir les caractéristiques FOR, INT, PIE, VIT, AGI, CHA"
                      >
                        <User className="w-3 h-3" />
                        Fiche
                      </button>

                      {isLostInDungeon ? (
                        <div 
                          className="px-2.5 py-1 bg-red-950/40 border border-red-900/60 rounded text-[11px] text-red-400 font-semibold cursor-help"
                          title="Ce héros est tombé au combat dans le dédale. Formez une escouade de secours pour rapporter sa dépouille !"
                        >
                          Corps perdu
                        </div>
                      ) : isInActiveParty ? (
                        <button
                          onClick={() => {
                            setParty(party.filter(p => p.id !== h.id));
                            sounds.playTurn();
                          }}
                          className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/50 rounded text-xs transition font-semibold"
                        >
                          Retirer
                        </button>
                      ) : (h.status === 'DEAD' || h.status === 'ASHES') ? (
                        <button
                          onClick={() => {
                            setCurrentTab('TEMPLE');
                            sounds.playTurn();
                          }}
                          className="px-3 py-1 bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-600/50 rounded text-xs font-semibold flex items-center gap-1 transition"
                          title="Ce héros a péri. Rendez-vous au Temple de Cant pour invoquer une résurrection avant de pouvoir le recruter dans l'escouade !"
                        >
                          <Cross className="w-3.5 h-3.5 text-amber-400" />
                          <span>Temple ({h.status === 'DEAD' ? 'Mort' : 'Cendres'})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (party.length >= 6) {
                              setMessage('Le groupe est déjà au maximum de 6 aventuriers.');
                              return;
                            }
                            setParty([...party, h]);
                            sounds.playTurn();
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs transition"
                        >
                          Recruter
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

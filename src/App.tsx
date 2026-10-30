/**
 * Wizardry I: Proving Grounds of the Mad Overlord
 * Main Application Component
 */
import { CombatEffects } from './engine/spellEngine';
import React, { useState, useEffect, useRef } from 'react';
import { 
  TCharacter, 
  GameLocation, 
  TMazeFloor,
  AdventureLogEvent, TMazeEvent,
  AdventureLogCategory
} from './types/wizardry';
import { 
  DEFAULT_PARTY, 
  generateLevel1Maze, 
  getMazeForFloor,
  MONSTERS_DATABASE,
  ITEMS_DATABASE,
  getMaxCharacterSpells,
  setActiveScenarioData,
  getStarterPartyForScenario,
  recalculateCharacterCombatStats
} from './data/provingGroundsData';
import { CastleView } from './components/CastleView';
import { DungeonView } from './components/DungeonView';
import { CombatView } from './components/CombatView';
import { ChestView } from './components/ChestView';
import { PySide6Exporter } from './components/PySide6Exporter';
import { ScenarioMenuView } from './components/ScenarioMenuView';
import { WIZARDRY_SCENARIOS } from './data/scenariosCatalog';
import { 
  initCombatEncounter, 
  CombatGroup,
  calculateVictoryExp
} from './engine/combatEngine';
import { 
  generateChestReward, 
  ChestReward 
} from './engine/chestEngine';
import { sounds } from './utils/soundEffects';
import { music } from './utils/musicManager';
import { applyPoisonDamage } from './engine/statusSystem';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  Trophy, 
  RotateCcw, 
  FileCode, 
  Compass, 
  Volume2, 
  VolumeX,
  Music,
  Skull,
  Users,
  Library,
  Keyboard
} from 'lucide-react';

export function getStorageKeysForScenario(scenarioId: string) {
  if (!scenarioId || scenarioId === 'proving-grounds') {
    return {
      party: 'wiz1_party',
      roster: 'wiz1_roster',
      session: 'wiz1_dungeon_session',
      journal: 'wiz1_adventure_journal',
      visited: 'wiz1_visited_tiles_all',
      usedEvents: 'wiz1_event_uses'
    };
  }
  const prefix = `wiz_${scenarioId}`;
  return {
    party: `${prefix}_party`,
    roster: `${prefix}_roster`,
    session: `${prefix}_dungeon_session`,
    journal: `${prefix}_adventure_journal`,
    visited: `${prefix}_visited_tiles_all`,
    usedEvents: `${prefix}_event_uses`
  };
}

// Persistent Dungeon & Exploration Session Type
interface TDungeonSession {
  location: GameLocation;
  dungeonLevel: number;
  posX: number;
  posY: number;
  direction: number;
  lightLevel: number;
  acModifier: number;
  combatGroups?: CombatGroup[];
  combatSurprise?: 'PARTY' | 'MONSTERS' | 'NONE';
  chestReward?: ChestReward | null;
  lastWipeoutInfo?: { x: number; y: number; level: number; heroes: string[] } | null;
}

export default function App() {
  // Clamp any legacy saved character spell slots to their authentic Pascal maximum (SETSPELS)
  // and recompute combat stats (wepDamage, armorClass, hitMod) per Pascal EQUIPCHR + ARM4CHAR
  const sanitizeCharacterSpells = (chars: TCharacter[]): TCharacter[] =>
    chars.map(h => {
      const maxSp = getMaxCharacterSpells(h);
      const copy: TCharacter = {
        ...h,
        mageSpells: (h.mageSpells || [0, 0, 0, 0, 0, 0, 0, 0]).map((v, i) => Math.min(v, maxSp.mageSpells[i] || 0)),
        priestSpells: (h.priestSpells || [0, 0, 0, 0, 0, 0, 0, 0]).map((v, i) => Math.min(v, maxSp.priestSpells[i] || 0)),
      };
      recalculateCharacterCombatStats(copy);
      return copy;
    });

  // Keyboard Layout (AZERTY [Z/Q/D] vs QWERTY [W/A/D], persisted in localStorage)
  const [keyboardLayout, setKeyboardLayout] = useState<'AZERTY' | 'QWERTY'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wiz_keyboard_layout');
      if (saved === 'AZERTY' || saved === 'QWERTY') return saved;
    }
    return 'AZERTY';
  });

  const toggleKeyboardLayout = () => {
    setKeyboardLayout(prev => {
      const next = prev === 'AZERTY' ? 'QWERTY' : 'AZERTY';
      if (typeof window !== 'undefined') {
        localStorage.setItem('wiz_keyboard_layout', next);
      }
      return next;
    });
  };

  // Active Scenario ID (persisted in localStorage)
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('wiz_active_scenario_id') || 'proving-grounds';
    }
    return 'proving-grounds';
  });

  const activeScenario = WIZARDRY_SCENARIOS.find(s => s.id === activeScenarioId) || WIZARDRY_SCENARIOS[0];
  const storageKeys = getStorageKeysForScenario(activeScenarioId);

  // Stored dungeon outing & exploration session state
  const savedSession: Partial<TDungeonSession> | null = (() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeys.session);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return null;
  })();

  // Show Scenario Selection Menu at site startup unless refreshing mid-dungeon or already launched in this tab
  const [showScenarioMenu, setShowScenarioMenu] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (
        savedSession?.location === 'MAZE' ||
        savedSession?.location === 'COMBAT' ||
        savedSession?.location === 'CHEST'
      ) {
        return false;
      }
      if (sessionStorage.getItem('wiz_scenario_launched') === '1') {
        return false;
      }
    }
    return true;
  });

  // Persistence in localStorage (isolated per scenario)
  const [party, setParty] = useState<TCharacter[]>(() => {
    setActiveScenarioData(activeScenarioId);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeys.party);
      if (saved) {
        try { return sanitizeCharacterSpells(JSON.parse(saved)); } catch (e) { /* ignore */ }
      }
    }
    return getStarterPartyForScenario(activeScenarioId).slice(0, 6);
  });

  const [allCharacters, setAllCharacters] = useState<TCharacter[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeys.roster);
      if (saved) {
        try { return sanitizeCharacterSpells(JSON.parse(saved)); } catch (e) { /* ignore */ }
      }
    }
    return getStarterPartyForScenario(activeScenarioId);
  });

  // Location & Navigation State (restores exact place in dungeon on page refresh)
  const [location, setLocation] = useState<GameLocation>(() => savedSession?.location || 'CASTLE');
  const [dungeonLevel, setDungeonLevel] = useState<number>(() => savedSession?.dungeonLevel || 1);
  const [maze, setMaze] = useState<TMazeFloor>(() => getMazeForFloor(savedSession?.dungeonLevel || 1));
  const [posX, setPosX] = useState<number>(() => savedSession?.posX ?? 0);
  const [posY, setPosY] = useState<number>(() => savedSession?.posY ?? 0);
  const [direction, setDirection] = useState<number>(() => savedSession?.direction ?? 0); // 0: N, 1: E, 2: S, 3: W
  const [lightLevel, setLightLevel] = useState<number>(() => savedSession?.lightLevel ?? 0);
  const [acModifier, setAcModifier] = useState<number>(() => savedSession?.acModifier ?? 0);

  // Combat & Chest State
  const [combatGroups, setCombatGroups] = useState<CombatGroup[]>(() => savedSession?.combatGroups || []);
  const [combatSurprise, setCombatSurprise] = useState<'PARTY' | 'MONSTERS' | 'NONE'>(() => savedSession?.combatSurprise || 'NONE');
  const [chestReward, setChestReward] = useState<ChestReward | null>(() => savedSession?.chestReward || null);

  // Modals & Sound
  const isItchioBuild =
    import.meta.env.VITE_ITCHIO === 'true' ||
    (typeof window !== 'undefined' &&
      (window.location.hostname.includes('itch.zone') || window.location.hostname.includes('itch.io')));
  const [showPySide6Export, setShowPySide6Export] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(() => music.isEnabled());
  const [lastWipeoutInfo, setLastWipeoutInfo] = useState<{ x: number; y: number; level: number; heroes: string[] } | null>(
    () => savedSession?.lastWipeoutInfo || null
  );

  // Adventure Journal Events (persisted in localStorage per scenario)
  const [adventureEvents, setAdventureEvents] = useState<AdventureLogEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeys.journal);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return [
      {
        id: 'init-1',
        timestamp: '08:00',
        dateStr: 'Décret Royal',
        category: 'CASTLE',
        title: "Proclamation de l'Overlord Trebor",
        description: "Par décret souverain, la création de votre guilde d'aventuriers a été ratifiée. L'accès aux Proving Grounds vous est accordé pour terrasser le sorcier Werdna.",
        details: "Objectif suprême : Récupérer l'Amulette au 10e sous-sol"
      },
      {
        id: 'init-2',
        timestamp: '08:15',
        dateStr: 'Préparatifs',
        category: 'DISCOVERY',
        title: "Constitution de l'Escouade & Fourbissage",
        description: "Vos héros se sont rassemblés à la Taverne de Gilgamesh et ont acquis leurs premières armes chez Boltac avant de franchir la grille de fer.",
        details: "6 aventuriers prêts à braver les pièges et les bêtes du dédale"
      }
    ];
  });

  const addAdventureEvent = (
    category: AdventureLogCategory,
    title: string,
    description: string,
    details?: string,
    level?: number,
    coordinates?: { x: number; y: number }
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEvent: AdventureLogEvent = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: timeStr,
      dateStr: "Aujourd'hui",
      category,
      title,
      description,
      details,
      level,
      coordinates
    };

    setAdventureEvents(prev => [newEvent, ...prev].slice(0, 50));
  };

  // Persistent explored map tiles per floor
  const [visitedTilesByLevel, setVisitedTilesByLevel] = useState<Record<number, boolean[][]>>(() => {
    const initialByLevel: Record<number, boolean[][]> = {};
    if (typeof window !== 'undefined') {
      const savedAll = localStorage.getItem(storageKeys.visited);
      if (savedAll) {
        try { Object.assign(initialByLevel, JSON.parse(savedAll)); } catch (e) { /* ignore */ }
      } else if (activeScenarioId === 'proving-grounds') {
        const savedL1 = localStorage.getItem('wiz1_visited_level1');
        if (savedL1) {
          try { initialByLevel[1] = JSON.parse(savedL1); } catch (e) { /* ignore */ }
        }
      }
    }
    const curLvl = savedSession?.dungeonLevel || 1;
    if (!initialByLevel[curLvl]) {
      const l = Array.from({ length: 20 }, () => Array(20).fill(false));
      const curX = savedSession?.posX ?? 0;
      const curY = savedSession?.posY ?? 0;
      if (l[curX]) l[curX][curY] = true;
      initialByLevel[curLvl] = l;
    }
    return initialByLevel;
  });

  const [visitedTiles, setVisitedTiles] = useState<boolean[][]>(() => {
    const curLvl = savedSession?.dungeonLevel || 1;
    if (visitedTilesByLevel[curLvl]) return visitedTilesByLevel[curLvl];
    const fresh = Array.from({ length: 20 }, () => Array(20).fill(false));
    const curX = savedSession?.posX ?? 0;
    const curY = savedSession?.posY ?? 0;
    if (fresh[curX]) fresh[curX][curY] = true;
    return fresh;
  });

  // Switch Scenario & Load its isolated localStorage state
  const handleSelectScenario = (scenarioId: string) => {
    setActiveScenarioData(scenarioId);
    const keys = getStorageKeysForScenario(scenarioId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wiz_active_scenario_id', scenarioId);
      sessionStorage.setItem('wiz_scenario_launched', '1');
    }
    setActiveScenarioId(scenarioId);

    const starter = getStarterPartyForScenario(scenarioId);
    let nextParty = starter.slice(0, 6);
    let nextRoster = starter;
    let nextSession: Partial<TDungeonSession> | null = null;
    let nextVisited: Record<number, boolean[][]> = {};
    let nextJournal: AdventureLogEvent[] = [];

    if (typeof window !== 'undefined') {
      try {
        const rawP = localStorage.getItem(keys.party);
        if (rawP) nextParty = sanitizeCharacterSpells(JSON.parse(rawP));
      } catch { /* ignore */ }
      try {
        const rawR = localStorage.getItem(keys.roster);
        if (rawR) nextRoster = sanitizeCharacterSpells(JSON.parse(rawR));
      } catch { /* ignore */ }
      try {
        const rawS = localStorage.getItem(keys.session);
        if (rawS) nextSession = JSON.parse(rawS);
      } catch { /* ignore */ }
      try {
        const rawV = localStorage.getItem(keys.visited);
        if (rawV) nextVisited = JSON.parse(rawV);
      } catch { /* ignore */ }
      try {
        const rawJ = localStorage.getItem(keys.journal);
        if (rawJ) nextJournal = JSON.parse(rawJ);
      } catch { /* ignore */ }
      try {
        eventUsesRef.current = JSON.parse(localStorage.getItem(keys.usedEvents) || '{}');
      } catch {
        eventUsesRef.current = {};
      }
    }

    const lvl = nextSession?.dungeonLevel || 1;
    const px = nextSession?.posX ?? 0;
    const py = nextSession?.posY ?? 0;
    if (!nextVisited[lvl]) {
      const fresh = Array.from({ length: 20 }, () => Array(20).fill(false));
      if (fresh[px]) fresh[px][py] = true;
      nextVisited[lvl] = fresh;
    }

    setParty(nextParty);
    setAllCharacters(nextRoster);
    setLocation(nextSession?.location || 'CASTLE');
    setDungeonLevel(lvl);
    setMaze(getMazeForFloor(lvl));
    setPosX(px);
    setPosY(py);
    setDirection(nextSession?.direction ?? 0);
    setLightLevel(nextSession?.lightLevel ?? 0);
    setAcModifier(nextSession?.acModifier ?? 0);
    setCombatGroups(nextSession?.combatGroups || []);
    setCombatSurprise(nextSession?.combatSurprise || 'NONE');
    setChestReward(nextSession?.chestReward || null);
    setLastWipeoutInfo(nextSession?.lastWipeoutInfo || null);
    setVisitedTilesByLevel(nextVisited);
    setVisitedTiles(nextVisited[lvl]);
    if (nextJournal.length > 0) setAdventureEvents(nextJournal);
    setShowScenarioMenu(false);
  };

  // Save all game and dungeon session state to localStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const keys = getStorageKeysForScenario(activeScenarioId);
      localStorage.setItem(keys.party, JSON.stringify(party));
      localStorage.setItem(keys.roster, JSON.stringify(allCharacters));
      if (activeScenarioId === 'proving-grounds') {
        localStorage.setItem('wiz1_visited_level1', JSON.stringify(visitedTilesByLevel[1] || visitedTiles));
      }
      localStorage.setItem(keys.visited, JSON.stringify(visitedTilesByLevel));
      localStorage.setItem(keys.journal, JSON.stringify(adventureEvents));

      const sessionData: TDungeonSession = {
        location,
        dungeonLevel,
        posX,
        posY,
        direction,
        lightLevel,
        acModifier,
        combatGroups: location === 'COMBAT' ? combatGroups : [],
        combatSurprise: location === 'COMBAT' ? combatSurprise : 'NONE',
        chestReward: location === 'CHEST' ? chestReward : null,
        lastWipeoutInfo
      };
      localStorage.setItem(keys.session, JSON.stringify(sessionData));
    }
  }, [
    activeScenarioId,
    party, 
    allCharacters, 
    visitedTiles, 
    visitedTilesByLevel, 
    adventureEvents,
    location,
    dungeonLevel,
    posX,
    posY,
    direction,
    lightLevel,
    acModifier,
    combatGroups,
    combatSurprise,
    chestReward,
    lastWipeoutInfo
  ]);

  // Per Pascal Wizardry 1: Poison only exists while in the maze (POISNAMT in LOSTXYL).
  // Characters returning to the castle are automatically and immediately cured of all poison!
  useEffect(() => {
    if (location === 'CASTLE') {
      const curedNames: string[] = [];

      setParty(prevParty => {
        let changed = false;
        const updated = prevParty.map(hero => {
          if (hero.poisonAmount > 0) {
            changed = true;
            curedNames.push(hero.name);
            return { ...hero, poisonAmount: 0, silencedRounds: 0 };
          }
          return hero;
        });
        return changed ? updated : prevParty;
      });

      setAllCharacters(prevRoster => {
        let changed = false;
        const updated = prevRoster.map(hero => {
          if (hero.poisonAmount > 0) {
            changed = true;
            return { ...hero, poisonAmount: 0, silencedRounds: 0 };
          }
          return hero;
        });
        return changed ? updated : prevRoster;
      });

      if (curedNames.length > 0) {
        sounds.playSpellCast();
        addAdventureEvent(
          'CASTLE',
          'Guérison automatique du Poison au Château',
          `Conformément aux règles authentiques de Wizardry, le poison qui affligeait vos aventuriers a été automatiquement et totalement dissipé dès leur retour dans l'enceinte du Château.`,
          `Aventuriers purifiés : ${curedNames.join(', ')}`,
          1
        );
      }
    }
  }, [location]);

  // Check victory condition: Amulet of Werdna (id 94) in inventory at Castle
  useEffect(() => {
    if (location === 'CASTLE') {
      const hasAmulet = party.some(p => p.possessions.some(slot => slot.itemIndex === 94));
      if (hasAmulet) {
        setLocation('VICTORY');
        confetti({ particleCount: 150, spread: 80 });
        sounds.playFanfare();
        addAdventureEvent(
          'DISCOVERY',
          "Victoire Suprême : L'Amulette de Werdna est nôtre !",
          "Le sorcier maléfique Werdna a été vaincu ! Votre escouade triomphante rapporte l'Amulette sacrée à l'Overlord Trebor. Le royaume est sauvé !",
          "Récompense royale : 250 000 XP et insigne suprême de la couronne"
        );
      }
    }
  }, [location, party]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sounds.setEnabled(next);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    music.setEnabled(next);
  };

  // Switch background music track automatically based on game state
  useEffect(() => {
    if (showScenarioMenu) {
      music.playTrack('01-opening');
      return;
    }
    if (location === 'MAZE') {
      music.playTrack('08-dungeon');
    } else if (location === 'CHEST') {
      music.playTrack('09-camp');
    } else if (location === 'COMBAT') {
      const isBossFight =
        dungeonLevel >= 10 ||
        combatGroups.some(g => g.monster.name.toUpperCase().includes('WERDNA'));
      music.playTrack(isBossFight ? '12-werdna' : '10-fight');
    } else if (location === 'GAMEOVER') {
      music.playTrack('11-exterminated');
    } else if (location === 'VICTORY') {
      music.playTrack('13-complete');
    } else if (location === 'CASTLE') {
      music.playTrack('02-castle');
    }
  }, [showScenarioMenu, location, dungeonLevel, combatGroups]);

  // Per-square usage counters for scenario events (key: level:x:y)
  const [scenarioMessage, setScenarioMessage] = useState<{ title: string; lines: string[]; details?: string } | null>(null);

  // Shows a scenario message on screen and keeps a trace in the adventure journal
  const announce = (title: string, lines: string[], details: string | undefined, x: number, y: number) => {
    setScenarioMessage({ title, lines, details });
    addAdventureEvent('DISCOVERY', title, lines.join(' ').replace(/\s+/g, ' ').trim(), details, dungeonLevel, { x, y });
  };

  const eventUsesRef = useRef<Record<string, number>>(
    (() => {
      try {
        return JSON.parse(localStorage.getItem(storageKeys.usedEvents) || '{}');
      } catch {
        return {};
      }
    })()
  );
  const markEventUsed = (key: string, count: number) => {
    eventUsesRef.current[key] = count;
    const keys = getStorageKeysForScenario(activeScenarioId);
    localStorage.setItem(keys.usedEvents, JSON.stringify(eventUsesRef.current));
  };

  const giveItemToParty = (itemId: number): string | null => {
    const item = ITEMS_DATABASE.find(i => i.id === itemId);
    const hero = party.find(h => h.status !== 'DEAD' && h.status !== 'ASHES' && h.possessions.length < 8);
    if (!item || !hero) return null;
    hero.possessions.push({ equipped: false, cursed: false, identified: true, itemIndex: item.id });
    setParty([...party]);
    return `${hero.name} reçoit : ${item.name}`;
  };

  /** Handles a scenario special square. Returns true when a combat/transition started. */
  const handleSquareEvent = (ev: TMazeEvent, x: number, y: number, searching: boolean): boolean => {
    const key = `${dungeonLevel}:${x}:${y}`;
    const used = eventUsesRef.current[key] || 0;
    const text = ev.message?.join(' ').replace(/\s+/g, ' ').trim();

    if (ev.type === 'ENCOUNTE') {
      if (ev.aux0 >= 0 && used >= ev.aux0) return false;
      markEventUsed(key, used + 1);
      const id = ev.aux2 + Math.floor(Math.random() * Math.max(1, ev.aux1));
      triggerBattleEncounter(id);
      return true;
    }
    if (ev.type !== 'SCNMSG') return false;

    const onceOnly = ev.uses === 'ONCE';
    if (ev.uses === 'DISABLED') return false;

    switch (ev.kind) {
      case 'MESSAGE':
      case 'LOOKOUT':
      case 'ITEM_TO_PASS':
        if (onceOnly && used > 0) return false;
        markEventUsed(key, used + 1);
        if (ev.message?.length) announce('Inscription ou vision', ev.message, undefined, x, y);
        return false;
      case 'ITEM_PICKUP': {
        if (used > 0) return false;
        markEventUsed(key, used + 1);
        const got = ev.itemId !== undefined ? giveItemToParty(ev.itemId) : null;
        announce('Un objet est trouvé', ev.message?.length ? ev.message : ['Un objet gît ici.'], got || undefined, x, y);
        return false;
      }
      case 'BACK_TO_CASTLE':
        if (ev.message?.length) announce('Une lueur étrange', ev.message, undefined, x, y);
        handleTakeStairs(0, 0, 0);
        return true;
      case 'SEARCH_FIGHT': {
        if (!searching) {
          if (ev.message?.length) announce('Une salle singulière', ev.message, 'Fouillez (Inspecter) pour en savoir plus.', x, y);
          return false;
        }
        if (ev.monsterId !== undefined && used === 0) {
          markEventUsed(key, used + 1);
          triggerBattleEncounter(ev.monsterId);
          return true;
        }
        if (ev.itemId !== undefined && used === 0) {
          markEventUsed(key, used + 1);
          const got = giveItemToParty(ev.itemId);
          announce('Fouille fructueuse', ev.message || [], got || undefined, x, y);
        }
        return false;
      }
      default:
        if (ev.message?.length) announce('Message', ev.message, undefined, x, y);
        return false;
    }
  };

  // Movement handler in dungeon
  const handleMove = (dx: number, dy: number, isDoor: boolean) => {
    const newX = (posX + dx + 20) % 20;
    const newY = (posY + dy + 20) % 20;

    // Check special squares on target tile
    const sqrCode = maze.sqrExtra[newX][newY];
    const sqrDef = maze.extraDefs[sqrCode];

    // Squares that require an item to enter (doors, locked rooms, level transporter)
    const gate = maze.events?.find(ev => ev.x === newX && ev.y === newY && ev.kind === 'ITEM_TO_PASS');
    if (gate && gate.itemId !== undefined) {
      const hasItem = party.some(h => h.possessions.some(p => p.itemIndex === gate.itemId));
      if (!hasItem) {
        sounds.playBump();
        announce(
          'Passage bloqué',
          gate.message?.length ? gate.message : ['Il manque un objet pour passer.'],
          `Objet requis : ${ITEMS_DATABASE.find(i => i.id === gate.itemId)?.name ?? gate.itemId}`,
          newX,
          newY
        );
        return;
      }
    }

    if (sqrDef) {
      if (sqrDef.type === 'CHUTE') {
        sounds.playBump();
        addAdventureEvent('LOSS', 'Chute dans un puits !', `Le sol cède : l'escouade tombe au niveau ${sqrDef.aux0}.`, undefined, dungeonLevel, { x: newX, y: newY });
        handleTakeStairs(sqrDef.aux0, newX, newY);
        return;
      } else if (sqrDef.type === 'BUTTONZ') {
        // Elevator: aux2..aux1 are the reachable levels
        const answer = window.prompt(`Ascenseur : choisissez un niveau (${sqrDef.aux2} à ${sqrDef.aux1}), ou annulez pour sortir.`);
        const lvl = answer ? parseInt(answer, 10) : NaN;
        if (lvl >= sqrDef.aux2 && lvl <= sqrDef.aux1 && lvl !== dungeonLevel) {
          handleTakeStairs(lvl, newX, newY);
          return;
        }
      } else if (sqrDef.type === 'SPINNER') {
        // Randomize facing direction
        setDirection(Math.floor(Math.random() * 4));
        sounds.playBump();
      } else if (sqrDef.type === 'PIT') {
        // Pit trap: aux0 + aux2 d aux1 damage per hero
        let totalDamage = 0;
        party.forEach(h => {
          if (h.status === 'OK') {
            let dmg = sqrDef.aux0;
            for (let i = 0; i < Math.max(1, sqrDef.aux2); i++) dmg += Math.floor(Math.random() * Math.max(1, sqrDef.aux1)) + 1;
            h.hpLeft = Math.max(1, h.hpLeft - dmg);
            totalDamage += dmg;
          }
        });
        sounds.playBump();
        addAdventureEvent(
          'LOSS',
          'Chute dans une fosse piégée !',
          `Le sol s'est brusquement dérobé sous les pas de l'escouade. Vos héros subissent des dégâts de chute (${totalDamage} PV au total).`,
          undefined,
          dungeonLevel,
          { x: newX, y: newY }
        );
      } else if (sqrDef.type === 'TRANSFER') {
        sounds.playSpellCast();
        if (sqrDef.aux0 !== dungeonLevel && sqrDef.aux0 > 0) {
          handleTakeStairs(sqrDef.aux0, sqrDef.aux2, sqrDef.aux1);
          return;
        }
        setPosX(sqrDef.aux2);
        setPosY(sqrDef.aux1);
        addAdventureEvent(
          'DISCOVERY',
          'Téléportation magique mystique',
          `Un tourbillon arcanique a instantanément projeté l'escouade aux coordonnées (${sqrDef.aux2}, ${sqrDef.aux1}).`,
          undefined,
          dungeonLevel,
          { x: sqrDef.aux2, y: sqrDef.aux1 }
        );
        return;
      }
    }

    setPosX(newX);
    setPosY(newY);

    // Light consumption step
    if (lightLevel > 0) {
      setLightLevel(prev => Math.max(0, prev - 1));
    }

    // Authentic Wizardry poison step damage: each step drains HP for poisoned heroes
    let poisonDeaths = 0;
    const updatedParty = party.map(h => {
      if (h.poisonAmount > 0 && h.status !== 'DEAD' && h.status !== 'ASHES' && h.status !== 'STONED') {
        const { damage, died } = applyPoisonDamage(h);
        if (died) {
          poisonDeaths++;
        }
      }
      return h;
    });

    if (poisonDeaths > 0) {
      sounds.playHit();
      if (updatedParty.every(p => p.status === 'DEAD' || p.status === 'ASHES')) {
        addAdventureEvent(
          'LOSS',
          "Hécatombe causée par le poison",
          "Le venin a insidieusement drainé les dernières forces de l'escouade. Tous vos héros se sont effondrés.",
          `Lieu du drame : Niveau ${dungeonLevel}, position (${newX}, ${newY})`,
          dungeonLevel,
          { x: newX, y: newY }
        );
        handlePartyWipedOut(updatedParty, newX, newY, dungeonLevel);
        return;
      }
    }
    setParty([...updatedParty]);

    // Scenario special squares (messages, items, fixed fights)
    const event = maze.events?.find(ev => ev.x === newX && ev.y === newY);
    if (event && handleSquareEvent(event, newX, newY, false)) return;

    // Random encounters only happen on squares flagged as fight zones
    if (maze.fights[newX][newY] === 1 && Math.random() < 0.15) {
      triggerBattleEncounter();
    }
  };

  const handleRotate = (delta: number) => {
    sounds.playTurn();
    setDirection((direction + delta) % 4);
  };

  const handleKickDoor = () => {
    const wall = [maze.n, maze.e, maze.s, maze.w][direction][posX][posY];
    // Kicking only works on a door (visible or secret), never on a plain wall or open passage
    if (wall !== 'DOOR' && wall !== 'HIDEDOOR') {
      sounds.playBump();
      return;
    }
    sounds.playDoor();
    handleMove(
      direction === 1 ? 1 : direction === 3 ? -1 : 0,
      direction === 0 ? 1 : direction === 2 ? -1 : 0,
      true
    );
  };

  const triggerBattleEncounter = (specialMonsterId?: number) => {
    sounds.playHit();
    const encounter = initCombatEncounter(dungeonLevel, specialMonsterId, { enemyCalc: maze.enemyCalc });
    setCombatGroups(encounter.groups);
    setCombatSurprise(encounter.surprise);
    setLocation('COMBAT');
  };

  const handlePartyWipedOut = (fallenParty: TCharacter[], wipeX: number, wipeY: number, wipeLevel: number) => {
    sounds.playBell();
    const deadHeroes: TCharacter[] = fallenParty.map(h => ({
      ...h,
      status: (h.status === 'ASHES' ? 'ASHES' : 'DEAD') as 'DEAD' | 'ASHES',
      hpLeft: 0,
      lostLocation: { x: wipeX, y: wipeY, level: wipeLevel },
      inMaze: false
    }));

    // Update master roster with the lost coordinates
    setAllCharacters(prev => {
      const idMap = new Map(deadHeroes.map(h => [h.id, h]));
      return prev.map(c => idMap.get(c.id) || c);
    });

    setLastWipeoutInfo({
      x: wipeX,
      y: wipeY,
      level: wipeLevel,
      heroes: deadHeroes.map(h => h.name)
    });

    addAdventureEvent(
      'LOSS',
      "Décimation complète de l'escouade au combat",
      `Tous vos aventuriers ont succombé. Leurs corps sans vie gisent dans les ténèbres du donjon.`,
      `Victimes : ${deadHeroes.map(h => h.name).join(', ')} · Lieu : Niveau ${wipeLevel}, position (${wipeX}, ${wipeY})`,
      wipeLevel,
      { x: wipeX, y: wipeY }
    );

    // Per Pascal Wizardry 1: Decimated party cannot move or act; slot is cleared
    setParty([]);
    setLocation('GAME_OVER');
  };

  const handleCombatSpellEffects = (fx: CombatEffects) => {
    if (fx.lightAdd) setLightLevel(prev => prev + fx.lightAdd);
    if (fx.lightMax) setLightLevel(32000);
    if (fx.acModifier) setAcModifier(fx.acModifier);
  };

  const handleCombatEnd = (won: boolean, fled: boolean, alarmTriggered: boolean, fx?: CombatEffects) => {
    if (fx?.loktofeit) {
      setParty(prev => prev.map(h => ({ ...h, gold: 0, possessions: [] })));
      setAllCharacters(prev => prev.map(c => party.some(p => p.id === c.id) ? { ...c, gold: 0, possessions: [] } : c));
      handleTakeStairs(0, 0, 0);
      return;
    }
    if (fx?.malor) {
      handleTakeStairs(fx.malor.level, fx.malor.x, fx.malor.y);
      return;
    }
    if (fled) {
      addAdventureEvent(
        'COMBAT',
        'Repli stratégique devant les monstres',
        `Face aux périls du donjon, votre escouade a prudemment fui l'affrontement pour préserver sa survie.`,
        undefined,
        dungeonLevel,
        { x: posX, y: posY }
      );
      setLocation('MAZE');
      return;
    }

    if (!won) {
      // Party died -> Wipeout registered at current coordinates
      handlePartyWipedOut(party, posX, posY, dungeonLevel);
      return;
    }

    // Battle won! Award experience per Pascal GIVEEXP / CALC1EXP / TOTALEXP (REWARDS2.TEXT l. 807-1015)
    const { totalExp, survivorCount, expPerSurvivor } = calculateVictoryExp(party, combatGroups);
    if (expPerSurvivor > 0) {
      const updatedParty = party.map(h => {
        if (h.status === 'OK' && h.hpLeft > 0) {
          return { ...h, exp: (h.exp || 0) + expPerSurvivor };
        }
        return h;
      });
      setParty(updatedParty);
      setAllCharacters(prev =>
        prev.map(c => {
          const inParty = updatedParty.find(p => p.id === c.id);
          return inParty ? { ...inParty } : c;
        })
      );
    }

    const monstersDesc = combatGroups.map(g => `${g.count}x ${g.monster.name}`).join(', ');
    addAdventureEvent(
      'COMBAT',
      `Victoire contre ${monstersDesc || 'des monstres'} (+${expPerSurvivor.toLocaleString()} XP)`,
      `Vos braves ont terrassé l'ennemi au terme d'un rude corps-à-corps dans les couloirs de pierre. Chacun des ${survivorCount} survivant(s) (statut OK) reçoit +${expPerSurvivor.toLocaleString()} XP.`,
      `Monstres éliminés : ${monstersDesc || 'Créatures du donjon'} · Total XP : ${totalExp.toLocaleString()} (+${expPerSurvivor.toLocaleString()} XP / survivant)`,
      dungeonLevel,
      { x: posX, y: posY }
    );

    if (alarmTriggered) {
      // Alarm calls another fight immediately!
      addAdventureEvent(
        'COMBAT',
        "Alarme du donjon déclenchée !",
        "Un cri strident a alerté une nouvelle meute de créatures prêtes à bondir !",
        undefined,
        dungeonLevel,
        { x: posX, y: posY }
      );
      triggerBattleEncounter();
      return;
    }

    const chest = generateChestReward(dungeonLevel);
    chest.expGainedPerSurvivor = expPerSurvivor;
    chest.totalExpGained = totalExp;
    setChestReward(chest);
    setLocation('CHEST');
  };

  const handleFinishChest = (alarmTriggered: boolean, wasOpened: boolean = true) => {
    if (wasOpened && chestReward) {
      const itemDesc = chestReward.itemFound 
        ? `Objet : ${chestReward.itemFound.name}` 
        : 'Aucun équipement';
      addAdventureEvent(
        'DISCOVERY',
        `Coffre de monstre ouvert (+${chestReward.goldFound} PO)`,
        `Votre escouade a inspecté et fouillé le coffre abandonné par les monstres.`,
        `Trésor : +${chestReward.goldFound} PO · ${itemDesc}`,
        dungeonLevel,
        { x: posX, y: posY }
      );
    } else if (!wasOpened) {
      addAdventureEvent(
        'DISCOVERY',
        `Coffre aux trésors laissé scellé`,
        `Faute de voleur qualifié ou de sort Calfo, votre escouade a prudemment laissé le coffre intact (Règle Pascal L)EAVE).`,
        `Piège non déclenché · Exploration poursuivie`,
        dungeonLevel,
        { x: posX, y: posY }
      );
    }

    setChestReward(null);
    if (alarmTriggered) {
      triggerBattleEncounter();
    } else {
      setLocation('MAZE');
    }
  };

  // Authentic Pascal PROCEDURE CHK4WIN (pascal_source/Wiz1A/SHOPS2.TEXT.pas, l. 1341-1381):
  // Upon returning to the Castle, clear lostLocation, sync all party members to the roster,
  // and remove dead/ashed characters from the active party so they rest at the Temple of Cant.
  const handleReturnPartyToCastle = () => {
    sounds.playDoor();
    const cleanedParty = party.map(h => ({
      ...h,
      inMaze: false,
      lostLocation: undefined,
      poisonAmount: 0,
      silencedRounds: 0,
      combatAcMod: 0
    }));
    const fallenHeroes = cleanedParty.filter(h => h.status === 'DEAD' || h.status === 'ASHES');
    const survivingParty = cleanedParty.filter(h => h.status !== 'DEAD' && h.status !== 'ASHES');

    setAllCharacters(prev => {
      const updated = [...prev];
      cleanedParty.forEach(p => {
        const idx = updated.findIndex(c => c.id === p.id);
        if (idx >= 0) updated[idx] = { ...p };
        else updated.push({ ...p });
      });
      return updated;
    });
    setParty(survivingParty);
    setLocation('CASTLE');
    setDungeonLevel(1);
    setPosX(0);
    setPosY(0);
    setDirection(0);
    setLightLevel(0);
    setAcModifier(0);

    addAdventureEvent(
      'CASTLE',
      "Retour au Château de Trebor",
      fallenHeroes.length > 0
        ? `L'escouade regagne le château. Les dépouilles de ${fallenHeroes.map(f => f.name).join(', ')} ont été retirées du groupe et confiées au Temple de Cant.`
        : "L'escouade a gravi les marches pour regagner la sécurité du château.",
      fallenHeroes.length > 0 ? `Transférés au Temple de Cant : ${fallenHeroes.map(f => f.name).join(', ')}` : undefined,
      dungeonLevel,
      { x: posX, y: posY }
    );
  };

  const handleTakeStairs = (targetLevel: number, targetX: number, targetY: number) => {
    if (targetLevel === 0) {
      handleReturnPartyToCastle();
      return;
    }

    sounds.playFootstep();

    // Preserve visited tiles for current floor
    setVisitedTilesByLevel(prev => ({
      ...prev,
      [dungeonLevel]: visitedTiles
    }));

    const isDescending = targetLevel > dungeonLevel;
    const targetMaze = getMazeForFloor(targetLevel);

    setMaze(targetMaze);
    setDungeonLevel(targetLevel);
    setPosX(targetX);
    setPosY(targetY);

    // Load or initialize visited tiles for target floor
    setVisitedTiles(() => {
      const existing = visitedTilesByLevel[targetLevel];
      if (existing) {
        const next = existing.map(r => [...r]);
        if (next[targetX]) next[targetX][targetY] = true;
        return next;
      }
      const fresh = Array.from({ length: 20 }, () => Array(20).fill(false));
      if (fresh[targetX]) fresh[targetX][targetY] = true;
      return fresh;
    });

    addAdventureEvent(
      'DISCOVERY',
      isDescending ? `Descente dans les profondeurs : Niveau ${targetLevel}` : `Ascension vers le Niveau ${targetLevel}`,
      isDescending 
        ? `L'escouade a franchi l'escalier menant au ${targetLevel}e sous-sol du Labyrinthe. Les dangers s'intensifient.`
        : `L'escouade a gravi les marches pour remonter au ${targetLevel}e sous-sol.`,
      `Coordonnées d'arrivée : (${targetX}, ${targetY})`,
      targetLevel,
      { x: targetX, y: targetY }
    );
  };

  const handleInspectArea = () => {
    sounds.playTurn();
    const sqrCode = maze.sqrExtra[posX][posY];
    const sqrDef = maze.extraDefs[sqrCode];

    if (sqrDef?.type === 'STAIRS') {
      handleTakeStairs(sqrDef.aux0, sqrDef.aux2, sqrDef.aux1);
    } else if (sqrDef?.type === 'SCNMSG') {
      const ev = maze.events?.find(e => e.x === posX && e.y === posY);
      if (ev) handleSquareEvent(ev, posX, posY, true);
    } else {
      // Trigger encounter check on search
      if (Math.random() < 0.3) {
        triggerBattleEncounter();
      }
    }
  };

  const handleEmergencyGuardRetrieval = () => {
    // Trebor's elite palace guard retrieves the fallen bodies from the maze
    sounds.playFanfare();
    const retrieved: TCharacter[] = [];
    setAllCharacters(prev => prev.map(h => {
      if (h.lostLocation) {
        const cleared = { ...h, lostLocation: undefined, inMaze: false };
        retrieved.push(cleared);
        return cleared;
      }
      return h;
    }));

    // Put up to 6 retrieved bodies in party to bring to Temple of Cant
    if (retrieved.length > 0) {
      setParty(retrieved.slice(0, 6));
    }

    addAdventureEvent(
      'RESCUE',
      "Rapatriement royal par la garde de Trebor",
      `Les vétérans d'élite du château sont descendus dans les ténèbres pour remonter les dépouilles au Château.`,
      `Rapatriés : ${retrieved.map(r => r.name).join(', ') || 'Aventuriers'} · Prêts pour le Temple de Cant`,
      1,
      { x: 0, y: 0 }
    );

    setLocation('CASTLE');
    setPosX(0);
    setPosY(0);
    setDirection(0);
  };

  // Cheat (castle menu): heal and revive the whole roster without moving anyone in the maze
  const handleCheatRestoreParty = () => {
    const restore = (h: TCharacter): TCharacter => {
      const maxSp = getMaxCharacterSpells(h);
      return {
        ...h,
        status: 'OK',
        hpLeft: h.hpMax,
        mageSpells: maxSp.mageSpells,
        priestSpells: maxSp.priestSpells,
        poisonAmount: 0,
        lostLocation: undefined,
        inMaze: false
      };
    };
    setAllCharacters(prev => prev.map(restore));
    setParty(prev => prev.map(restore));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-slate-800 bg-slate-900/90 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-amber-400 font-serif font-black text-lg tracking-wider whitespace-nowrap shrink-0">
            WIZARDRY #{activeScenario.number}
          </div>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">
            {activeScenario.title}
          </span>
        </div>

        {/* Center Zone: Status tags */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
          <span>Lieu : <strong className="text-white">{showScenarioMenu ? 'Menu Principal' : location === 'MAZE' ? `Donjon N.${dungeonLevel}` : location}</strong></span>
          <span>Aventuriers : <strong className="text-emerald-400">{party.filter(p => p.status === 'OK').length}/{party.length}</strong></span>
        </div>

        {/* Right Zone: Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowScenarioMenu(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition border ${
              showScenarioMenu
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-600/30'
            }`}
            title="Ouvrir le menu principal de sélection des scénarios"
          >
            <Library className="w-3.5 h-3.5" />
            <span>{showScenarioMenu ? 'Retour au Jeu' : `Scénarios (${WIZARDRY_SCENARIOS.length})`}</span>
          </button>

          <button
            onClick={() => { toggleKeyboardLayout(); sounds.playTurn(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/30 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 transition"
            title={`Disposition clavier actuelle : ${keyboardLayout} (${keyboardLayout === 'AZERTY' ? 'Z=Avancer, Q=Gauche, D=Droite' : 'W=Avancer, A=Gauche, D=Droite'}). Cliquer pour basculer AZERTY / QWERTY.`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{keyboardLayout}</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
              musicOn
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-500 border-slate-800'
            }`}
            title={musicOn ? `Musique d'ambiance active (${music.getCurrentTrackTitle() || 'We Love Wizardry'}) — Cliquer pour couper` : "Activer la musique d'ambiance (We Love Wizardry)"}
          >
            <Music className={`w-3.5 h-3.5 ${musicOn ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="hidden lg:inline">{musicOn ? 'Musique' : 'Muet'}</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title={soundOn ? 'Couper les bruitages (SFX)' : 'Activer les bruitages (SFX)'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {!isItchioBuild && (
            <button
              onClick={() => setShowPySide6Export(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/30 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export PySide6</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area based on Location State Machine */}
      <main className="flex-1 relative overflow-hidden">
        {showScenarioMenu ? (
          <ScenarioMenuView
            activeScenarioId={activeScenarioId}
            onSelectScenario={handleSelectScenario}
            getStorageKeysForScenario={getStorageKeysForScenario}
          />
        ) : null}

        {!showScenarioMenu && location === 'CASTLE' && (
          <CastleView
            activeScenarioId={activeScenarioId}
            party={party}
            setParty={setParty}
            allCharacters={allCharacters}
            setAllCharacters={setAllCharacters}
            adventureEvents={adventureEvents}
            onClearAdventureEvents={() => setAdventureEvents([])}
            onAddAdventureEvent={addAdventureEvent}
            onEnterMaze={() => {
              // Original gameplay: the party always starts at the stairs of level 1
              setMaze(getMazeForFloor(1));
              setDungeonLevel(1);
              setPosX(0);
              setPosY(0);
              setDirection(0);
              setLocation('MAZE');
              sounds.playDoor();
            }}
            onOpenPySide6Export={isItchioBuild ? undefined : () => setShowPySide6Export(true)}
            onCheatRestoreParty={isItchioBuild ? undefined : handleCheatRestoreParty}
          />
        )}

        {!showScenarioMenu && location === 'MAZE' && (
          <DungeonView
            party={party}
            setParty={setParty}
            allCharacters={allCharacters}
            setAllCharacters={setAllCharacters}
            maze={maze}
            x={posX}
            y={posY}
            direction={direction}
            lightLevel={lightLevel}
            setLightLevel={setLightLevel}
            acModifier={acModifier}
            setAcModifier={setAcModifier}
            visitedTiles={visitedTiles}
            setVisitedTiles={setVisitedTiles}
            keyboardLayout={keyboardLayout}
            onToggleKeyboardLayout={toggleKeyboardLayout}
            onAddAdventureEvent={addAdventureEvent}
            onMove={handleMove}
            onRotate={handleRotate}
            onKickDoor={handleKickDoor}
            onInspectArea={handleInspectArea}
            onReturnToCastle={handleReturnPartyToCastle}
            onTakeStairs={handleTakeStairs}
            onTriggerEncounter={() => triggerBattleEncounter()}
          />
        )}

        {!showScenarioMenu && location === 'COMBAT' && (
          <CombatView
            party={party}
            setParty={setParty}
            groups={combatGroups}
            surprise={combatSurprise}
            mazeLevel={dungeonLevel}
            acModifier={acModifier}
            onSpellEffects={handleCombatSpellEffects}
            onCombatEnd={handleCombatEnd}
          />
        )}

        {!showScenarioMenu && location === 'CHEST' && chestReward && (
          <ChestView
            party={party}
            setParty={setParty}
            chest={chestReward}
            dungeonLevel={dungeonLevel}
            onFinishChest={handleFinishChest}
            onPartyWipedOut={() => handlePartyWipedOut(party, posX, posY, dungeonLevel)}
          />
        )}

        {/* GAME OVER CEMETERY SCREEN (WIZARDRY 1 AUTHENTIC BODY RECOVERY) */}
        {!showScenarioMenu && location === 'GAME_OVER' && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-5 bg-black overflow-y-auto">
            <div className="p-4 bg-red-950/80 border-2 border-red-700 rounded-full text-red-500 animate-pulse">
              <Skull className="w-14 h-14" />
            </div>
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl font-serif font-black text-white tracking-widest uppercase">
                Escouade Décimée dans le Dédale
              </h2>
              {lastWipeoutInfo ? (
                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 space-y-1">
                  <div className="font-bold text-red-200">
                    Dernières coordonnées connues : Niveau {lastWipeoutInfo.level}, position ({lastWipeoutInfo.x}, {lastWipeoutInfo.y})
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Héros tombés : {lastWipeoutInfo.heroes.join(', ')}
                  </div>
                </div>
              ) : null}
              <p className="text-xs text-slate-300 leading-relaxed">
                Selon le code originel de Wizardry, un groupe d'aventuriers anéanti ne peut plus se déplacer, combattre ni regagner le château.
                Leurs corps restent étendus dans le donjon à moins qu'une <strong>escouade de secours</strong> ne vienne les récupérer (chaque dépouille occupe un emplacement du groupe).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-lg w-full pt-2">
              <button
                onClick={() => {
                  setLocation('CASTLE');
                  setPosX(0);
                  setPosY(0);
                  setDirection(0);
                }}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                title="Former une escouade de secours à la taverne et s'aventurer dans le donjon"
              >
                <Users className="w-4 h-4" />
                <span>Former une escouade de secours</span>
              </button>

              <button
                onClick={handleEmergencyGuardRetrieval}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-600/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                title="Rapatrier les corps au château pour les ressusciter au Temple de Cant"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rapatrier par les gardes de Trebor</span>
              </button>
            </div>

          </div>
        )}

        {scenarioMessage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setScenarioMessage(null)}
          >
            <div
              className="max-w-xl w-full max-h-[80vh] overflow-y-auto bg-slate-900 border-2 border-amber-500/60 rounded-xl p-6 shadow-2xl space-y-3"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-amber-400 font-serif font-bold tracking-wider text-sm uppercase">{scenarioMessage.title}</h3>
              <div className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {scenarioMessage.lines.join('\n')}
              </div>
              {scenarioMessage.details && (
                <div className="text-xs text-amber-300 border-t border-slate-700 pt-2">{scenarioMessage.details}</div>
              )}
              <button
                autoFocus
                onClick={() => setScenarioMessage(null)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* VICTORY ENDGAME SCREEN */}
        {!showScenarioMenu && location === 'VICTORY' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-slate-950">
            <div className="p-4 bg-amber-950/80 border border-amber-500 rounded-full text-amber-400">
              <Trophy className="w-16 h-16 animate-bounce" />
            </div>
            <div className="space-y-3 max-w-lg">
              <h2 className="text-3xl font-serif font-black text-amber-300 tracking-wider">
                *** FÉLICITATIONS ***
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Vous avez terrassé le sorcier <strong>Werdna</strong> et rapporté l'Amulette sacrée à l'Overlord Trebor !
                Chaque survivant reçoit <strong>250 000 Points d'Expérience</strong> et l'insigne d'honneur (&gt;) de la garde suprême.
              </p>
            </div>
            <button
              onClick={() => setLocation('CASTLE')}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition"
            >
              Retourner au Château célébrer la victoire
            </button>
          </div>
        )}
      </main>

      {/* Standalone PySide6 Python Exporter Modal */}
      {!isItchioBuild && showPySide6Export && (
        <PySide6Exporter onClose={() => setShowPySide6Export(false)} />
      )}
    </div>
  );
}

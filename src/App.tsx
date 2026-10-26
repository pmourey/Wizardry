/**
 * Wizardry I: Proving Grounds of the Mad Overlord
 * Main Application Component
 */
import React, { useState, useEffect } from 'react';
import { 
  TCharacter, 
  GameLocation, 
  TMazeFloor 
} from './types/wizardry';
import { 
  DEFAULT_PARTY, 
  generateLevel1Maze, 
  MONSTERS_DATABASE 
} from './data/wizardryData';
import { CastleView } from './components/CastleView';
import { DungeonView } from './components/DungeonView';
import { CombatView } from './components/CombatView';
import { ChestView } from './components/ChestView';
import { PySide6Exporter } from './components/PySide6Exporter';
import { 
  initCombatEncounter, 
  CombatGroup 
} from './engine/combatEngine';
import { 
  generateChestReward, 
  ChestReward 
} from './engine/chestEngine';
import { sounds } from './utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  Trophy, 
  RotateCcw, 
  FileCode, 
  Compass, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

export default function App() {
  // Persistence in localStorage
  const [party, setParty] = useState<TCharacter[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wiz1_party');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return DEFAULT_PARTY;
  });

  const [allCharacters, setAllCharacters] = useState<TCharacter[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wiz1_roster');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* ignore */ }
      }
    }
    return DEFAULT_PARTY;
  });

  // Location & Navigation State
  const [location, setLocation] = useState<GameLocation>('CASTLE');
  const [dungeonLevel, setDungeonLevel] = useState<number>(1);
  const [maze, setMaze] = useState<TMazeFloor>(() => generateLevel1Maze());
  const [posX, setPosX] = useState<number>(0);
  const [posY, setPosY] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0); // 0: N, 1: E, 2: S, 3: W
  const [lightLevel, setLightLevel] = useState<number>(0);
  const [acModifier, setAcModifier] = useState<number>(0);

  // Combat & Chest State
  const [combatGroups, setCombatGroups] = useState<CombatGroup[]>([]);
  const [combatSurprise, setCombatSurprise] = useState<'PARTY' | 'MONSTERS' | 'NONE'>('NONE');
  const [chestReward, setChestReward] = useState<ChestReward | null>(null);

  // Modals & Sound
  const [showPySide6Export, setShowPySide6Export] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Save to localStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wiz1_party', JSON.stringify(party));
      localStorage.setItem('wiz1_roster', JSON.stringify(allCharacters));
    }
  }, [party, allCharacters]);

  // Check victory condition: Amulet of Werdna (id 94) in inventory at Castle
  useEffect(() => {
    if (location === 'CASTLE') {
      const hasAmulet = party.some(p => p.possessions.some(slot => slot.itemIndex === 94));
      if (hasAmulet) {
        setLocation('VICTORY');
        confetti({ particleCount: 150, spread: 80 });
        sounds.playFanfare();
      }
    }
  }, [location, party]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sounds.setEnabled(next);
  };

  // Movement handler in dungeon
  const handleMove = (dx: number, dy: number, isDoor: boolean) => {
    const newX = (posX + dx + 20) % 20;
    const newY = (posY + dy + 20) % 20;

    // Check special squares on target tile
    const sqrCode = maze.sqrExtra[newX][newY];
    const sqrDef = maze.extraDefs[sqrCode];

    if (sqrDef) {
      if (sqrDef.type === 'SPINNER') {
        // Randomize facing direction
        setDirection(Math.floor(Math.random() * 4));
        sounds.playBump();
      } else if (sqrDef.type === 'PIT') {
        // Pit trap damage
        party.forEach(h => {
          if (h.status === 'OK') {
            h.hpLeft = Math.max(1, h.hpLeft - (Math.floor(Math.random() * 6) + 1));
          }
        });
        sounds.playBump();
      } else if (sqrDef.type === 'TRANSFER') {
        setPosX(sqrDef.aux2);
        setPosY(sqrDef.aux1);
        sounds.playSpellCast();
        return;
      }
    }

    setPosX(newX);
    setPosY(newY);

    // Light consumption step
    if (lightLevel > 0) {
      setLightLevel(prev => Math.max(0, prev - 1));
    }

    // Encounter chance: 15% random step chance or fixed room encounter
    const isEncounterSquare = sqrDef?.type === 'ENCOUNTE' || maze.fights[newX][newY] === 1;
    if (isEncounterSquare || Math.random() < 0.12) {
      triggerBattleEncounter();
    }
  };

  const handleRotate = (delta: number) => {
    sounds.playTurn();
    setDirection((direction + delta) % 4);
  };

  const handleKickDoor = () => {
    sounds.playDoor();
    // Try opening door directly ahead
    handleMove(
      direction === 1 ? 1 : direction === 3 ? -1 : 0,
      direction === 0 ? 1 : direction === 2 ? -1 : 0,
      true
    );
  };

  const triggerBattleEncounter = (specialMonsterId?: number) => {
    sounds.playHit();
    const encounter = initCombatEncounter(dungeonLevel, specialMonsterId);
    setCombatGroups(encounter.groups);
    setCombatSurprise(encounter.surprise);
    setLocation('COMBAT');
  };

  const handleCombatEnd = (won: boolean, fled: boolean, alarmTriggered: boolean) => {
    if (fled) {
      setLocation('MAZE');
      return;
    }

    if (!won) {
      // Party died -> Cemetery
      sounds.playBell();
      setLocation('GAME_OVER');
      return;
    }

    // Battle won! Calculate chest chance
    if (alarmTriggered) {
      // Alarm calls another fight immediately!
      triggerBattleEncounter();
      return;
    }

    const chest = generateChestReward(dungeonLevel);
    setChestReward(chest);
    setLocation('CHEST');
  };

  const handleFinishChest = (alarmTriggered: boolean) => {
    if (alarmTriggered) {
      triggerBattleEncounter();
    } else {
      setLocation('MAZE');
    }
  };

  const handleInspectArea = () => {
    sounds.playTurn();
    const sqrCode = maze.sqrExtra[posX][posY];
    const sqrDef = maze.extraDefs[sqrCode];

    if (sqrDef?.type === 'STAIRS') {
      if (posX === 0 && posY === 0) {
        setLocation('CASTLE');
      } else {
        alert('Escalier vers les niveaux inférieurs du Labyrinthe.');
      }
    } else if (sqrDef?.type === 'SCNMSG') {
      alert('Une statue gravée d’une inscription de Trebor : « Seul le porteur de l’amulette verra la lumière céleste. »');
    } else {
      // Trigger encounter check on search
      if (Math.random() < 0.3) {
        triggerBattleEncounter();
      }
    }
  };

  const handleReviveAllParty = () => {
    // Revives party after game over for smooth continuing
    setParty(prev => prev.map(h => ({
      ...h,
      status: 'OK',
      hpLeft: h.hpMax
    })));
    setLocation('CASTLE');
    setPosX(0);
    setPosY(0);
    setDirection(0);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-800 bg-slate-900/90 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-amber-400 font-serif font-black text-lg tracking-wider whitespace-nowrap shrink-0">
            WIZARDRY I
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Proving Grounds of the Mad Overlord (1981)
          </span>
        </div>

        {/* Center Zone: Status tags */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
          <span>Lieu : <strong className="text-white">{location === 'MAZE' ? `Donjon N.${dungeonLevel}` : location}</strong></span>
          <span>Aventuriers : <strong className="text-emerald-400">{party.filter(p => p.status === 'OK').length}/{party.length}</strong></span>
        </div>

        {/* Right Zone: Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title={soundOn ? 'Couper le son' : 'Activer le son'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowPySide6Export(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/30 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export PySide6</span>
          </button>
        </div>
      </header>

      {/* Main Content Area based on Location State Machine */}
      <main className="flex-1 relative overflow-hidden">
        {location === 'CASTLE' && (
          <CastleView
            party={party}
            setParty={setParty}
            allCharacters={allCharacters}
            setAllCharacters={setAllCharacters}
            onEnterMaze={() => {
              setLocation('MAZE');
              sounds.playDoor();
            }}
            onOpenPySide6Export={() => setShowPySide6Export(true)}
          />
        )}

        {location === 'MAZE' && (
          <DungeonView
            party={party}
            setParty={setParty}
            maze={maze}
            x={posX}
            y={posY}
            direction={direction}
            lightLevel={lightLevel}
            acModifier={acModifier}
            onMove={handleMove}
            onRotate={handleRotate}
            onKickDoor={handleKickDoor}
            onInspectArea={handleInspectArea}
            onReturnToCastle={() => {
              setLocation('CASTLE');
              sounds.playDoor();
            }}
            onTriggerEncounter={() => triggerBattleEncounter()}
          />
        )}

        {location === 'COMBAT' && (
          <CombatView
            party={party}
            setParty={setParty}
            groups={combatGroups}
            surprise={combatSurprise}
            onCombatEnd={handleCombatEnd}
          />
        )}

        {location === 'CHEST' && chestReward && (
          <ChestView
            party={party}
            setParty={setParty}
            chest={chestReward}
            dungeonLevel={dungeonLevel}
            onFinishChest={handleFinishChest}
          />
        )}

        {/* GAME OVER CEMETERY SCREEN */}
        {location === 'GAME_OVER' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-black">
            <div className="p-4 bg-red-950/60 border border-red-700 rounded-full text-red-500 animate-pulse">
              <ShieldAlert className="w-16 h-16" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-white tracking-widest">
                LE CIMETIÈRE DE TREBOR
              </h2>
              <p className="text-sm text-red-400 max-w-md mx-auto">
                Tous vos aventuriers sont tombés dans les ténèbres du labyrinthe...
              </p>
            </div>
            <button
              onClick={handleReviveAllParty}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réanimer l'escouade au Château
            </button>
          </div>
        )}

        {/* VICTORY ENDGAME SCREEN */}
        {location === 'VICTORY' && (
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
      {showPySide6Export && (
        <PySide6Exporter onClose={() => setShowPySide6Export(false)} />
      )}
    </div>
  );
}

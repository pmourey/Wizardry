import React, { useState, useEffect, useCallback } from 'react';
import { 
  TCharacter, 
  TMazeFloor, 
  TItem 
} from '../types/wizardry';
import { DungeonRenderer3D } from '../engine/dungeonRenderer3D';
import { ITEMS_DATABASE, SPELLS } from '../data/wizardryData';
import { sounds } from '../utils/soundEffects';
import { 
  Compass, 
  Eye, 
  Tent, 
  Footprints, 
  RotateCcw, 
  RotateCw, 
  Map, 
  DoorClosed, 
  Layers, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  X,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Shield,
  Coins,
  Heart
} from 'lucide-react';

interface DungeonViewProps {
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  maze: TMazeFloor;
  x: number;
  y: number;
  direction: number; // 0: N, 1: E, 2: S, 3: W
  lightLevel: number;
  acModifier: number;
  onMove: (dx: number, dy: number, isDoor: boolean) => void;
  onRotate: (deltaDir: number) => void;
  onKickDoor: () => void;
  onInspectArea: () => void;
  onReturnToCastle: () => void;
  onTriggerEncounter: () => void;
}

export const DungeonView: React.FC<DungeonViewProps> = ({
  party,
  setParty,
  maze,
  x,
  y,
  direction,
  lightLevel,
  acModifier,
  onMove,
  onRotate,
  onKickDoor,
  onInspectArea,
  onReturnToCastle,
  onTriggerEncounter
}) => {
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [showCamp, setShowCamp] = useState<boolean>(false);
  const [campCharIdx, setCampCharIdx] = useState<number>(0);
  const [campMessage, setCampMessage] = useState<string>('');
  const [visitedTiles, setVisitedTiles] = useState<boolean[][]>(() => 
    Array.from({ length: 20 }, () => Array(20).fill(false))
  );

  // Mark current tile visited
  useEffect(() => {
    setVisitedTiles(prev => {
      if (prev[x][y]) return prev;
      const next = prev.map(row => [...row]);
      next[x][y] = true;
      return next;
    });
  }, [x, y]);

  // Check if current tile is dark
  const sqrType = maze.extraDefs[maze.sqrExtra[x][y]]?.type || 'NORMAL';
  const isDarkZone = sqrType === 'DARK';

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showCamp || showMinimap) return;

    if (e.key === 'w' || e.key === 'ArrowUp') {
      e.preventDefault();
      tryMoveForward(false);
    } else if (e.key === 'a' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onRotate(3); // Turn Left
    } else if (e.key === 'd' || e.key === 'ArrowRight') {
      e.preventDefault();
      onRotate(1); // Turn Right
    } else if (e.key === 'k') {
      e.preventDefault();
      onKickDoor();
    } else if (e.key === 'c') {
      e.preventDefault();
      setShowCamp(true);
      sounds.playTurn();
    } else if (e.key === 'm') {
      e.preventDefault();
      setShowMinimap(prev => !prev);
      sounds.playTurn();
    } else if (e.key === 'i') {
      e.preventDefault();
      onInspectArea();
    }
  }, [showCamp, showMinimap, x, y, direction, maze]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const tryMoveForward = (isKick: boolean) => {
    // Current facing wall
    let wall = 'OPEN';
    let dx = 0;
    let dy = 0;

    if (direction === 0) { wall = maze.n[x][y]; dy = 1; }
    else if (direction === 1) { wall = maze.e[x][y]; dx = 1; }
    else if (direction === 2) { wall = maze.s[x][y]; dy = -1; }
    else if (direction === 3) { wall = maze.w[x][y]; dx = -1; }

    if (wall === 'OPEN' || (isKick && wall === 'DOOR') || (wall === 'DOOR')) {
      sounds.playFootstep();
      onMove(dx, dy, wall === 'DOOR');
    } else {
      sounds.playBump();
    }
  };

  const activeCampHero = party[campCharIdx] || party[0];

  // ==========================================
  // CAMP ACTIONS (EQUIP / HEAL / CAST / IDENTIFY)
  // ==========================================
  const handleEquipSlot = (slotIdx: number) => {
    sounds.playTurn();
    const slot = activeCampHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (slot.equipped) {
      if (slot.cursed) {
        setCampMessage(`L'objet ${itm.name} est MAUDIT ! Impossible de le retirer.`);
        return;
      }
      slot.equipped = false;
      activeCampHero.armorClass += itm.armorMod;
      setCampMessage(`${itm.name} retiré.`);
    } else {
      slot.equipped = true;
      activeCampHero.armorClass -= itm.armorMod;
      if (itm.cursed) slot.cursed = true;
      setCampMessage(`${itm.name} équipé (CA : ${activeCampHero.armorClass}).`);
    }
    setParty([...party]);
  };

  const handleCampCastSpell = (spell: any, targetHero: TCharacter) => {
    sounds.playSpellCast();
    if (spell.spellType === 'PRIEST') {
      activeCampHero.priestSpells[spell.tier]--;
    } else {
      activeCampHero.mageSpells[spell.tier]--;
    }

    if (spell.name === 'DIOS') targetHero.hpLeft = Math.min(targetHero.hpMax, targetHero.hpLeft + Math.floor(Math.random() * 8) + 1);
    if (spell.name === 'DIAL') targetHero.hpLeft = Math.min(targetHero.hpMax, targetHero.hpLeft + Math.floor(Math.random() * 16) + 2);
    if (spell.name === 'DIALMA') targetHero.hpLeft = Math.min(targetHero.hpMax, targetHero.hpLeft + Math.floor(Math.random() * 24) + 3);
    if (spell.name === 'MADI') {
      targetHero.hpLeft = targetHero.hpMax;
      targetHero.poisonAmount = 0;
      if (targetHero.status === 'PLYZE' || targetHero.status === 'ASLEEP') targetHero.status = 'OK';
    }
    if (spell.name === 'LATUMOFI') targetHero.poisonAmount = 0;

    setParty([...party]);
    setCampMessage(`${spell.name} soigné sur ${targetHero.name} (${targetHero.hpLeft}/${targetHero.hpMax} PV) !`);
  };

  const handleBishopIdentify = (slotIdx: number) => {
    sounds.playSpellCast();
    const slot = activeCampHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    // Bishop identification check
    const chance = 10 + activeCampHero.charLevel * 5;
    if (Math.random() * 100 < chance) {
      slot.identified = true;
      setCampMessage(`Succès ! ${activeCampHero.name} identifie : ${itm.name} !`);
    } else {
      // Risk of cursing oneself
      if (Math.random() * 100 < 25 && itm.cursed) {
        slot.equipped = true;
        slot.cursed = true;
        setCampMessage(`ÉCHEC ! ${activeCampHero.name} échoue et l'objet maudit se fixe sur lui !`);
      } else {
        setCampMessage(`Échec de l'identification.`);
      }
    }
    setParty([...party]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top HUD Strip */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Compass className="w-4 h-4" />
            <span>Niveau {maze.level}</span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">
            Coord : ({x}, {y}) · Direction : <strong className="text-white">{['NORD', 'EST', 'SUD', 'OUEST'][direction]}</strong>
          </span>
          {sqrType === 'STAIRS' && (
            <span className="bg-amber-950/70 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded text-[11px] font-bold">
              Escalier Détecté
            </span>
          )}
        </div>

        {/* Buffs and View toggles */}
        <div className="flex items-center gap-3">
          {lightLevel > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold" title="Lumière magique Milwa/Lomilwa active">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>Lumière (+{lightLevel})</span>
            </div>
          )}
          {acModifier > 0 && (
            <div className="flex items-center gap-1 text-blue-400 font-bold" title="Protection Maporfic">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bouclier Divin</span>
            </div>
          )}

          <button
            onClick={() => { setWireframeMode(!wireframeMode); sounds.playTurn(); }}
            className={`px-2.5 py-1 rounded border text-[11px] font-bold transition ${wireframeMode ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}
          >
            {wireframeMode ? 'Mode Rétro Fil de Fer' : 'Mode 3D Pierre'}
          </button>
        </div>
      </div>

      {/* Center Zone: 3D Viewport & Side Control Pad */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D First Person Dungeon Viewport */}
        <div className="flex-1 relative bg-black">
          <DungeonRenderer3D
            maze={maze}
            x={x}
            y={y}
            direction={direction}
            lightLevel={lightLevel}
            isDarkZone={isDarkZone}
            wireframeMode={wireframeMode}
          />
        </div>

        {/* Tactical Control Pad */}
        <div className="w-64 bg-slate-900/90 border-l border-slate-800 p-4 flex flex-col justify-between shrink-0 space-y-4">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Commandes d'Exploration
            </div>
            
            {/* Directional D-Pad */}
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800/80 mb-4">
              <div />
              <button
                onClick={() => tryMoveForward(false)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition shadow-sm active:scale-95"
                title="Avancer (W / Flèche Haut)"
              >
                <ArrowUp className="w-5 h-5 text-amber-400" />
              </button>
              <div />

              <button
                onClick={() => onRotate(3)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition shadow-sm active:scale-95"
                title="Pivoter à Gauche (A / Flèche Gauche)"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => onKickDoor()}
                className="p-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95"
                title="Enfoncer / Ouvrir Porte (K)"
              >
                <DoorClosed className="w-3.5 h-3.5 mb-0.5" />
                Porte
              </button>
              <button
                onClick={() => onRotate(1)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition shadow-sm active:scale-95"
                title="Pivoter à Droite (D / Flèche Droite)"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => { setShowCamp(true); sounds.playTurn(); }}
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition"
              >
                <Tent className="w-4 h-4 text-emerald-400" />
                <span>Monter le Camp (C)</span>
              </button>

              <button
                onClick={() => { setShowMinimap(true); sounds.playTurn(); }}
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition"
              >
                <Map className="w-4 h-4 text-blue-400" />
                <span>Consulter la Carte (M)</span>
              </button>

              <button
                onClick={onInspectArea}
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Inspecter les lieux (I)</span>
              </button>
            </div>
          </div>

          {/* Stairs Up to Castle Button */}
          {x === 0 && y === 0 && (
            <button
              onClick={onReturnToCastle}
              className="w-full p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-950/40"
            >
              Remonter au Château
            </button>
          )}
        </div>
      </div>

      {/* Bottom Party Status Cards */}
      <div className="bg-slate-900 border-t border-slate-800 p-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {party.map((hero, idx) => (
            <div
              key={hero.id}
              onClick={() => {
                setCampCharIdx(idx);
                setShowCamp(true);
                sounds.playTurn();
              }}
              className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs hover:border-slate-700 cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{hero.name}</span>
                  <span className="text-[10px] text-amber-400">N.{hero.charLevel}</span>
                </div>
                <div className="text-[11px] text-slate-400">{hero.race} {hero.class}</div>
              </div>

              <div className="pt-2 space-y-1">
                {/* HP bar */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">PV:</span>
                  <span className={hero.hpLeft < hero.hpMax / 2 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {hero.hpLeft}/{hero.hpMax}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${hero.hpLeft < hero.hpMax / 3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, (hero.hpLeft / hero.hpMax) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>CA: {hero.armorClass}</span>
                  <span className={hero.status === 'OK' ? 'text-slate-400' : 'text-red-400 font-bold'}>
                    {hero.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAMP MODAL */}
      {showCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Tent className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Campement dans le Labyrinthe</h2>
              </div>
              <button
                onClick={() => setShowCamp(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hero selector tabs */}
            <div className="flex items-center gap-1 px-6 py-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
              {party.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => { setCampCharIdx(idx); sounds.playTurn(); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${campCharIdx === idx ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {h.name}
                </button>
              ))}
            </div>

            {campMessage && (
              <div className="px-6 py-2 bg-amber-950/30 border-b border-amber-900/30 text-xs text-amber-300">
                {campMessage}
              </div>
            )}

            <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Character Details & Spells */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-2">
                  <div className="font-bold text-sm text-white">{activeCampHero.name}</div>
                  <div className="text-slate-400">
                    {activeCampHero.race} {activeCampHero.class} (Niveau {activeCampHero.charLevel}) · CA {activeCampHero.armorClass}
                  </div>
                  <div className="text-slate-400">
                    Points de Vie : <strong className="text-emerald-400">{activeCampHero.hpLeft}/{activeCampHero.hpMax}</strong> · Or : <strong className="text-amber-400">{activeCampHero.gold} PO</strong>
                  </div>
                </div>

                {/* Spells available to cast in Camp */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Sorts Disponibles au Campement :
                  </div>
                  <div className="space-y-1.5">
                    {SPELLS.filter(sp => sp.camp && activeCampHero.spellsKnown[sp.id]).length === 0 && (
                      <p className="text-slate-500 italic">Aucun sort de soin ou utilitaire appris.</p>
                    )}
                    {SPELLS.filter(sp => sp.camp && activeCampHero.spellsKnown[sp.id]).map(sp => (
                      <div key={sp.id} className="p-2.5 bg-slate-800/70 border border-slate-700/50 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{sp.name} (T{sp.tier})</div>
                          <div className="text-[11px] text-slate-400">{sp.description}</div>
                        </div>
                        <button
                          onClick={() => handleCampCastSpell(sp, activeCampHero)}
                          disabled={sp.spellType === 'PRIEST' ? activeCampHero.priestSpells[sp.tier] <= 0 : activeCampHero.mageSpells[sp.tier] <= 0}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Lancer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inventory & Equipment */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Équipement & Sac ({activeCampHero.possessions.length}/8) :
                </div>
                <div className="space-y-1.5">
                  {activeCampHero.possessions.map((slot, sIdx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;
                    return (
                      <div key={sIdx} className="p-2.5 bg-slate-800/70 border border-slate-700/50 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{slot.identified ? itm.name : itm.nameUnknown}</span>
                            {slot.equipped && <span className="text-[10px] text-emerald-400 font-bold">[Équipé]</span>}
                            {slot.cursed && <span className="text-[10px] text-red-400 font-bold">[Maudit]</span>}
                          </div>
                          <div className="text-[11px] text-slate-400">{itm.objType} {itm.armorMod ? `· CA -${itm.armorMod}` : ''}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEquipSlot(sIdx)}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold transition"
                          >
                            {slot.equipped ? 'Retirer' : 'Équiper'}
                          </button>
                          {activeCampHero.class === 'BISHOP' && !slot.identified && (
                            <button
                              onClick={() => handleBishopIdentify(sIdx)}
                              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-semibold transition"
                            >
                              Identifier
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
        </div>
      )}

      {/* MINIMAP MODAL */}
      {showMinimap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl flex flex-col items-center space-y-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-base font-bold text-white">Carte du Labyrinthe (Étage {maze.level})</h3>
              <button onClick={() => setShowMinimap(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 20x20 Grid */}
            <div className="grid grid-cols-20 gap-0.5 bg-black p-2 rounded-lg border border-slate-800">
              {Array.from({ length: 20 }).map((_, rIdx) => {
                const py = 19 - rIdx; // Display North at top
                return Array.from({ length: 20 }).map((_, px) => {
                  const isPlayerHere = px === x && py === y;
                  const visited = visitedTiles[px][py];
                  return (
                    <div
                      key={`${px}-${py}`}
                      className={`w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold ${isPlayerHere ? 'bg-amber-500 text-black' : visited ? 'bg-slate-800 text-slate-500' : 'bg-slate-950'}`}
                      title={`(${px}, ${py})`}
                    >
                      {isPlayerHere ? ['↑', '→', '↓', '←'][direction] : ''}
                    </div>
                  );
                });
              })}
            </div>

            <div className="text-xs text-slate-400">
              Coordonnées actuelles : ({x}, {y}) · Direction : {['NORD', 'EST', 'SUD', 'OUEST'][direction]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TCharacter, 
  TMazeFloor, 
  TItem,
  AdventureLogCategory
} from '../types/wizardry';
import { DungeonRenderer3D } from '../engine/dungeonRenderer3D';
import { ITEMS_DATABASE, SPELLS, formatDamageDice, recalculateCharacterCombatStats, getActiveMaxFloors } from '../data/provingGroundsData';
import { sounds } from '../utils/soundEffects';
import { music } from '../utils/musicManager';
import { getActiveStatusEffects, canHeroCastSpells } from '../engine/statusSystem';
import { MiniMap, loadMiniMapPrefs, saveMiniMapPrefs } from './MiniMap';
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
  Heart,
  ArrowRightLeft,
  Skull,
  Package,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Users,
  Swords,
  Keyboard
} from 'lucide-react';

interface DungeonViewProps {
  party: TCharacter[];
  setParty: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  allCharacters?: TCharacter[];
  setAllCharacters?: React.Dispatch<React.SetStateAction<TCharacter[]>>;
  maze: TMazeFloor;
  x: number;
  y: number;
  direction: number; // 0: N, 1: E, 2: S, 3: W
  lightLevel: number;
  setLightLevel?: React.Dispatch<React.SetStateAction<number>>;
  acModifier: number;
  setAcModifier?: React.Dispatch<React.SetStateAction<number>>;
  visitedTiles?: boolean[][];
  setVisitedTiles?: React.Dispatch<React.SetStateAction<boolean[][]>>;
  keyboardLayout?: 'AZERTY' | 'QWERTY';
  onToggleKeyboardLayout?: () => void;
  onAddAdventureEvent?: (
    category: AdventureLogCategory,
    title: string,
    description: string,
    details?: string,
    level?: number,
    coordinates?: { x: number; y: number }
  ) => void;
  onMove: (dx: number, dy: number, isDoor: boolean) => void;
  onRotate: (deltaDir: number) => void;
  onKickDoor: () => void;
  onInspectArea: () => void;
  onReturnToCastle: () => void;
  onTakeStairs?: (targetLevel: number, targetX: number, targetY: number) => void;
  onTriggerEncounter: () => void;
}

export const DungeonView: React.FC<DungeonViewProps> = ({
  party,
  setParty,
  allCharacters = [],
  setAllCharacters,
  maze,
  x,
  y,
  direction,
  lightLevel,
  setLightLevel,
  acModifier,
  setAcModifier,
  visitedTiles: propVisitedTiles,
  setVisitedTiles: propSetVisitedTiles,
  keyboardLayout = 'AZERTY',
  onToggleKeyboardLayout,
  onAddAdventureEvent,
  onMove,
  onRotate,
  onKickDoor,
  onInspectArea,
  onReturnToCastle,
  onTakeStairs,
  onTriggerEncounter
}) => {
  const [wireframeMode, setWireframeMode] = useState<boolean>(() => loadMiniMapPrefs().wireframeMode);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [hudMinimapVisible, setHudMinimapVisible] = useState<boolean>(() => loadMiniMapPrefs().hudVisible);

  useEffect(() => {
    saveMiniMapPrefs({ hudVisible: hudMinimapVisible, wireframeMode });
  }, [hudMinimapVisible, wireframeMode]);
  const [showCamp, setShowCamp] = useState<boolean>(false);
  const [campCharIdx, setCampCharIdx] = useState<number>(0);
  const [campTargetIdx, setCampTargetIdx] = useState<number>(0);
  const [campMessage, setCampMessage] = useState<string>('');
  const [campTab, setCampTab] = useState<'INVENTORY' | 'FORMATION'>('INVENTORY');
  const [transferringSlotIdx, setTransferringSlotIdx] = useState<number | null>(null);
  const [localVisitedTiles, setLocalVisitedTiles] = useState<boolean[][]>(() => 
    Array.from({ length: 20 }, () => Array(20).fill(false))
  );

  const visitedTiles = propVisitedTiles || localVisitedTiles;
  const setVisitedTiles = propSetVisitedTiles || setLocalVisitedTiles;

  // Fallen heroes from any party wipeout lying at current coordinates
  const fallenHeroesHere = allCharacters.filter(c => 
    c.lostLocation && 
    c.lostLocation.level === maze.level && 
    c.lostLocation.x === x && 
    c.lostLocation.y === y &&
    !party.some(p => p.id === c.id)
  );

  const fallenMarkers = allCharacters
    .filter(c => c.lostLocation && c.lostLocation.level === maze.level && !party.some(p => p.id === c.id))
    .map(c => ({ x: c.lostLocation!.x, y: c.lostLocation!.y, name: c.name }));

  // Mark current tile visited
  useEffect(() => {
    setVisitedTiles(prev => {
      if (prev[x]?.[y]) return prev;
      const next = prev.map(row => [...row]);
      if (next[x]) next[x][y] = true;
      return next;
    });
  }, [x, y, setVisitedTiles]);

  // Check if current tile is special
  const currentEvent = maze.events?.find(e => e.x === x && e.y === y && e.type === 'STAIRS');
  const currentSqrDef = maze.extraDefs[maze.sqrExtra[x]?.[y]];
  const sqrType = currentEvent ? 'STAIRS' : (currentSqrDef?.type || 'NORMAL');
  const isDarkZone = sqrType === 'DARK';
  const isStairs = sqrType === 'STAIRS';
  const stairsTargetLvl = currentEvent ? currentEvent.aux0 : currentSqrDef?.aux0;

  const [showStairsPrompt, setShowStairsPrompt] = useState<boolean>(false);
  const lastPromptedPos = React.useRef<string>('');

  // Automatically prompt player when stepping onto a staircase (like Pascal STAIRSYN)
  useEffect(() => {
    const posKey = `${x},${y},${maze.level}`;
    if (isStairs && lastPromptedPos.current !== posKey) {
      lastPromptedPos.current = posKey;
      setShowStairsPrompt(true);
    }
  }, [x, y, maze.level, isStairs]);

  const handleExecuteTakeStairs = () => {
    setShowStairsPrompt(false);
    const targetLvl = currentEvent ? currentEvent.aux0 : currentSqrDef?.aux0;
    const targetX = currentEvent ? currentEvent.aux2 : currentSqrDef?.aux2;
    const targetY = currentEvent ? currentEvent.aux1 : currentSqrDef?.aux1;

    if (targetLvl === undefined) return;
    if (targetLvl === 0) {
      onReturnToCastle();
    } else {
      if (onTakeStairs) {
        onTakeStairs(targetLvl, targetX ?? x, targetY ?? y);
      } else {
        onReturnToCastle();
      }
    }
  };

  const forwardKeyLabel = keyboardLayout === 'AZERTY' ? 'Z' : 'W';
  const leftKeyLabel = keyboardLayout === 'AZERTY' ? 'Q' : 'A';
  const rightKeyLabel = 'D';

  useEffect(() => {
    music.playTrack(showCamp ? '09-camp' : '08-dungeon');
  }, [showCamp]);

  // Keyboard navigation shortcuts (adapts to AZERTY [Z/Q/D] or QWERTY [W/A/D] + Arrow keys)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showCamp || showMinimap) return;

    if (showStairsPrompt && isStairs) {
      if (e.key === 'y' || e.key === 'Y' || e.key === 'o' || e.key === 'O' || e.key === 'Enter') {
        e.preventDefault();
        handleExecuteTakeStairs();
        return;
      }
      if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
        e.preventDefault();
        setShowStairsPrompt(false);
        return;
      }
    }

    const key = e.key.toLowerCase();
    const forwardKey = keyboardLayout === 'AZERTY' ? 'z' : 'w';
    const leftKey = keyboardLayout === 'AZERTY' ? 'q' : 'a';

    if (key === forwardKey || key === 'f' || e.key === 'ArrowUp') {
      e.preventDefault();
      tryMoveForward(false);
    } else if (key === leftKey || key === 'l' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onRotate(3); // Turn Left
    } else if (key === 'd' || key === 'r' || e.key === 'ArrowRight') {
      e.preventDefault();
      onRotate(1); // Turn Right
    } else if (key === 'k') {
      e.preventDefault();
      onKickDoor();
    } else if (key === 'c') {
      e.preventDefault();
      setShowCamp(true);
      sounds.playTurn();
    } else if (key === 'm') {
      e.preventDefault();
      setShowMinimap(prev => !prev);
      sounds.playTurn();
    } else if (key === 'i') {
      e.preventDefault();
      if (isStairs) {
        setShowStairsPrompt(true);
      } else {
        onInspectArea();
      }
    }
  }, [showCamp, showMinimap, showStairsPrompt, isStairs, currentSqrDef, x, y, direction, maze, keyboardLayout]);

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

  // Mobile Touch & Swipe Gesture Handling on the 3D Canvas
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    if (dt > 600) return;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const minSwipe = 35;

    if (absX < minSwipe && absY < minSwipe) {
      // Short tap: kick door if in front of door, otherwise move forward
      const currentWall = [maze.n, maze.e, maze.s, maze.w][direction][x][y];
      if (currentWall === 'DOOR') {
        onKickDoor();
      } else {
        tryMoveForward(false);
      }
      return;
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch { /* ignore */ }
    }

    if (absX > absY) {
      if (dx > 0) {
        onRotate(1); // Swipe right -> turn right 90°
      } else {
        onRotate(3); // Swipe left -> turn left 90°
      }
    } else {
      if (dy < 0) {
        tryMoveForward(false); // Swipe up -> forward
      } else {
        onRotate(2); // Swipe down -> turn around 180°
      }
    }
  };

  const activeCampHero = party[campCharIdx] || party[0];

  // ==========================================
  // CAMP FORMATION REORDERING (PASCAL REORDER)
  // ==========================================
  const handleMoveHero = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= party.length || toIdx < 0 || toIdx >= party.length) return;
    sounds.playTurn();
    const newParty = [...party];
    const [moved] = newParty.splice(fromIdx, 1);
    newParty.splice(toIdx, 0, moved);
    setParty(newParty);
    setCampCharIdx(toIdx);
    setCampMessage(`🔄 ${moved.name} est maintenant en position #${toIdx + 1} (${toIdx < 3 ? 'Avant-garde (Mêlée)' : 'Arrière-garde (Distance/Magie)'}).`);
    onAddAdventureEvent?.(
      'DISCOVERY',
      'Modification de l\'Ordre du Groupe',
      `Formation réorganisée : ${moved.name} prend le rang #${toIdx + 1} (${toIdx < 3 ? 'Avant-garde' : 'Arrière-garde'}).`,
      `Ordre actuel : ${newParty.map((h, i) => `#${i + 1} ${h.name} (${i < 3 ? 'Avant' : 'Arrière'})`).join(', ')}`,
      maze.level,
      { x, y }
    );
  };

  const handleSwapHeroes = (idxA: number, idxB: number) => {
    if (idxA === idxB || idxA < 0 || idxA >= party.length || idxB < 0 || idxB >= party.length) return;
    sounds.playTurn();
    const newParty = [...party];
    const temp = newParty[idxA];
    newParty[idxA] = newParty[idxB];
    newParty[idxB] = temp;
    setParty(newParty);
    setCampCharIdx(idxB);
    setCampMessage(`🔄 Échange de position : #${idxA + 1} ${newParty[idxA].name} ⇄ #${idxB + 1} ${newParty[idxB].name}.`);
    onAddAdventureEvent?.(
      'DISCOVERY',
      'Modification de l\'Ordre du Groupe',
      `Échange de positions au camp : #${idxA + 1} ${newParty[idxA].name} et #${idxB + 1} ${newParty[idxB].name}.`,
      `Nouvel ordre : ${newParty.map((h, i) => `#${i + 1} ${h.name} (${i < 3 ? 'Avant' : 'Arrière'})`).join(', ')}`,
      maze.level,
      { x, y }
    );
  };

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
      recalculateCharacterCombatStats(activeCampHero);
      setCampMessage(`${itm.name} retiré (CA : ${activeCampHero.armorClass} · Dégâts : ${formatDamageDice(activeCampHero.wepDamage)}).`);
    } else {
      if (itm.objType !== 'SPECIAL' && itm.objType !== 'MISC') {
        activeCampHero.possessions.forEach((other, idx) => {
          if (idx !== slotIdx && other.equipped && !other.cursed) {
            const otherItm = ITEMS_DATABASE.find(i => i.id === other.itemIndex);
            if (otherItm && otherItm.objType === itm.objType) {
              other.equipped = false;
            }
          }
        });
      }
      slot.equipped = true;
      if (itm.cursed || (itm.align !== 'UNALIGN' && itm.align !== activeCampHero.align)) {
        slot.cursed = true;
      }
      recalculateCharacterCombatStats(activeCampHero);
      setCampMessage(`${itm.name} équipé (CA : ${activeCampHero.armorClass} · Dégâts : ${formatDamageDice(activeCampHero.wepDamage)}).`);
    }
    setParty([...party]);
  };

  const handleTransferItem = (slotIdx: number, targetHeroId: string) => {
    const slot = activeCampHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (slot.equipped && slot.cursed) {
      setCampMessage(`L'objet ${itm.name} est MAUDIT ! Impossible de le transférer.`);
      return;
    }

    const targetHero = party.find(p => p.id === targetHeroId);
    if (!targetHero) return;

    if (targetHero.possessions.length >= 8) {
      setCampMessage(`Le sac de ${targetHero.name} est plein (8/8 objets maximum) !`);
      return;
    }

    sounds.playTurn();

    // If equipped, unequip first
    if (slot.equipped) {
      slot.equipped = false;
      recalculateCharacterCombatStats(activeCampHero);
    }

    // Remove from activeCampHero
    activeCampHero.possessions.splice(slotIdx, 1);

    // Add to targetHero (unequipped)
    targetHero.possessions.push({
      equipped: false,
      cursed: slot.cursed,
      identified: slot.identified,
      itemIndex: slot.itemIndex
    });

    setTransferringSlotIdx(null);
    setParty([...party]);
    setCampMessage(`📦 ${slot.identified ? itm.name : itm.nameUnknown} a été donné à ${targetHero.name} (${targetHero.possessions.length}/8) !`);
  };

  const handleRecoverBody = (fallenId: string) => {
    if (party.length >= 6) {
      alert("Votre escouade est au complet (6/6) ! Vous devez avoir un emplacement libre pour transporter un corps.");
      return;
    }
    const fallen = allCharacters.find(c => c.id === fallenId);
    if (!fallen) return;

    sounds.playFanfare();
    const recovered: TCharacter = {
      ...fallen,
      lostLocation: undefined,
      inMaze: true
    };

    const nextParty = [...party, recovered];
    const nextAll = allCharacters.map(c => c.id === fallenId ? recovered : c);

    setParty(nextParty);
    if (setAllCharacters) {
      setAllCharacters(nextAll);
    }
    setCampMessage(`💀 Le corps de ${fallen.name} a été hissé dans votre escouade (${nextParty.length}/6). Ramenez-le au Temple de Cant au Château pour le ressusciter !`);
    onAddAdventureEvent?.(
      'RESCUE',
      `Dépouille de ${fallen.name} récupérée dans le dédale`,
      `L'escouade de secours a localisé le corps sans vie de ${fallen.name} au Niveau ${maze.level} (${x}, ${y}) et l'a hissé pour le ramener au sanctuaire de Cant.`,
      `Statut : Escouade à ${nextParty.length}/6 membres`,
      maze.level,
      { x, y }
    );
  };

  const handleCampCastSpell = (spell: any, targetHero: TCharacter) => {
    const castCheck = canHeroCastSpells(activeCampHero);
    if (!castCheck.canCast) {
      setCampMessage(`Impossible de lancer le sort : ${castCheck.reason}`);
      return;
    }

    sounds.playSpellCast();
    if (spell.spellType === 'PRIEST') {
      activeCampHero.priestSpells[spell.tier]--;
    } else {
      activeCampHero.mageSpells[spell.tier]--;
    }

    const rollDice = (n: number, sides: number) => {
      let t = 0;
      for (let i = 0; i < n; i++) t += Math.floor(Math.random() * sides) + 1;
      return t;
    };
    const isGone = (h: TCharacter) => h.status === 'DEAD' || h.status === 'ASHES' || h.status === 'LOST';

    if (spell.name === 'DIOS' || spell.name === 'DIAL' || spell.name === 'DIALMA') {
      if (isGone(targetHero)) {
        setParty([...party]);
        setCampMessage(`${spell.name} n'a aucun effet sur ${targetHero.name}.`);
        return;
      }
      const healed = rollDice(spell.name === 'DIOS' ? 1 : spell.name === 'DIAL' ? 2 : 3, 8);
      targetHero.hpLeft = Math.min(targetHero.hpMax, targetHero.hpLeft + healed);
      setParty([...party]);
      setCampMessage(`${spell.name} : ${targetHero.name} récupère ${healed} PV (${targetHero.hpLeft}/${targetHero.hpMax}).`);
      return;
    }
    if (spell.name === 'DIALKO') {
      if (targetHero.status === 'PLYZE' || targetHero.status === 'ASLEEP') targetHero.status = 'OK';
    }
    if (spell.name === 'LATUMOFI') targetHero.poisonAmount = 0;
    if (spell.name === 'MADI') {
      if (isGone(targetHero)) {
        setParty([...party]);
        setCampMessage(`MADI n'a aucun effet sur ${targetHero.name}.`);
        return;
      }
      targetHero.hpLeft = targetHero.hpMax;
      targetHero.poisonAmount = 0;
      targetHero.silencedRounds = 0;
      targetHero.status = 'OK';
    }

    if (spell.name === 'DI' || spell.name === 'KADORTO') {
      const isDi = spell.name === 'DI';
      const dead = targetHero.status === 'DEAD';
      const ashes = targetHero.status === 'ASHES';
      if (targetHero.status === 'LOST') {
        setCampMessage(`${targetHero.name} est perdu à jamais.`);
      } else if (!dead && !(ashes && !isDi)) {
        setCampMessage(ashes ? `"KADORTO" est nécessaire pour ${targetHero.name}.` : `${targetHero.name} n'est pas mort.`);
      } else if (Math.floor(Math.random() * 100) <= 4 * targetHero.attrib.VITALITY) {
        targetHero.hpLeft = isDi ? 1 : targetHero.hpMax;
        targetHero.status = 'OK';
        if (targetHero.attrib.VITALITY <= 3) targetHero.status = 'LOST';
        else targetHero.attrib.VITALITY -= 1;
        setCampMessage(targetHero.status === 'OK' ? `EXCELSIOR ! ${targetHero.name} est ressuscité.` : `${targetHero.name} est perdu à jamais.`);
      } else {
        targetHero.status = dead ? 'ASHES' : 'LOST';
        setCampMessage(`OUPS ! Le sort échoue : ${targetHero.name} est ${targetHero.status === 'ASHES' ? 'réduit en cendres' : 'perdu'}.`);
      }
      setParty([...party]);
      return;
    }

    if (spell.name === 'KANDI') {
      const lost = allCharacters.filter(c => c.lostLocation);
      setCampMessage(lost.length === 0
        ? 'KANDI ne détecte aucune âme perdue.'
        : 'KANDI : ' + lost.map(c => `${c.name} (niveau ${c.lostLocation!.level}, E${c.lostLocation!.x} N${c.lostLocation!.y})`).join(' ; '));
      setParty([...party]);
      return;
    }

    if (spell.name === 'MALOR') {
      const input = window.prompt('MALOR — déplacement : Nord(+)/Sud(-), Est(+)/Ouest(-), étages vers le bas(+)/haut(-)\nFormat : nord est étages  (ex. 3 -2 0)');
      const parts = (input || '').trim().split(/\s+/).map(Number);
      if (!input || parts.length !== 3 || parts.some(n => !Number.isInteger(n))) {
        setParty([...party]);
        setCampMessage('MALOR : destination invalide, le sort est perdu.');
        return;
      }
      const [dn, de, dl] = parts;
      const tx = x + de;
      const ty = y + dn;
      const tl = maze.level + dl;
      setParty([...party]);
      const maxL = getActiveMaxFloors();
      if (tl < 0 || tl > maxL || tx < 0 || tx > 19 || ty < 0 || ty > 19) {
        setCampMessage('MALOR : le sort échoue.');
        return;
      }
      setShowCamp(false);
      onTakeStairs?.(tl, tx, ty);
      return;
    }

    if (spell.name === 'DUMAPIC') {
      const dirNames = ['NORD', 'EST', 'SUD', 'OUEST'];
      setVisitedTiles(prev => {
        const next = prev.map(row => [...row]);
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            const tx = x + dx;
            const ty = y + dy;
            if (tx >= 0 && tx < 20 && ty >= 0 && ty < 20) {
              next[tx][ty] = true;
            }
          }
        }
        return next;
      });
      setParty([...party]);
      setCampMessage(`✨ DUMAPIC : Coordonnées (X=${x}, Y=${y}) · Orientation ${dirNames[direction]} · Étage ${maze.level} ! Les couloirs environnants sont révélés.`);
      return;
    }

    if (spell.name === 'MILWA') {
      const milwaSteps = 15 + Math.floor(Math.random() * 15);
      setLightLevel?.(milwaSteps);
      setParty([...party]);
      setCampMessage(`✨ MILWA : Une douce lueur magique emplit les couloirs (${milwaSteps} pas) !`);
      onAddAdventureEvent?.('DISCOVERY', 'Sortilège de Lumière', `${activeCampHero.name} lance MILWA, repoussant l'obscurité.`, 'Lumière temporaire', maze.level, { x, y });
      return;
    }

    if (spell.name === 'LOMILWA') {
      setLightLevel?.(32000);
      setParty([...party]);
      setCampMessage(`✨ LOMILWA : Une vive clarté magique inonde le donjon !`);
      onAddAdventureEvent?.('DISCOVERY', 'Sortilège de Clarté Éternelle', `${activeCampHero.name} lance LOMILWA, illuminant durablement le donjon.`, 'Lumière permanente', maze.level, { x, y });
      return;
    }

    if (spell.name === 'MAPORFIC') {
      setAcModifier?.(prev => prev + 2);
      setParty([...party]);
      setCampMessage(`🛡️ MAPORFIC : Un champ de protection mystique enveloppe les aventuriers (+2 CA) !`);
      onAddAdventureEvent?.('DISCOVERY', 'Bouclier Mystique', `${activeCampHero.name} lance MAPORFIC, améliorant l'armure du groupe.`, '+2 CA', maze.level, { x, y });
      return;
    }

    setParty([...party]);
    setCampMessage(`${spell.name} lancé sur ${targetHero.name} (${targetHero.hpLeft}/${targetHero.hpMax} PV) !`);
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
      <div className="flex items-center justify-between px-3 md:px-6 py-1.5 md:py-2.5 bg-slate-900 border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-1 font-bold text-amber-400 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Niv. {maze.level}</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-300 text-[11px] md:text-xs truncate">
            ({x},{y}) · <strong className="text-white">{['NORD', 'EST', 'SUD', 'OUEST'][direction]}</strong>
          </span>
          {sqrType === 'STAIRS' && (
            <span className="bg-amber-950/70 text-amber-300 border border-amber-600/40 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-[11px] font-bold shrink-0">
              Escalier
            </span>
          )}
        </div>

        {/* Buffs and View toggles */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          {lightLevel > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px] md:text-xs" title="Lumière magique Milwa/Lomilwa active">
              <Flame className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Lumière</span> <span>({lightLevel > 999 ? '∞' : lightLevel})</span>
            </div>
          )}
          {acModifier > 0 && (
            <div className="flex items-center gap-1 text-blue-400 font-bold text-[11px] md:text-xs" title="Protection Maporfic">
              <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="hidden sm:inline">Bouclier</span>
            </div>
          )}

          <button
            onClick={() => { setHudMinimapVisible(prev => !prev); sounds.playTurn(); }}
            className={`flex items-center gap-1 px-2 md:px-2.5 py-1 rounded border text-[11px] font-bold transition ${
              hudMinimapVisible 
                ? 'bg-amber-950 text-amber-300 border-amber-600/50' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Afficher/masquer la minicarte HUD (M)"
          >
            <Map className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">Carte {hudMinimapVisible ? 'Active' : ''}</span>
          </button>

          <button
            onClick={() => { setWireframeMode(!wireframeMode); sounds.playTurn(); }}
            className={`flex items-center gap-1 px-2 md:px-2.5 py-1 rounded border text-[11px] font-bold transition shadow-sm ${
              wireframeMode 
                ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/60 hover:bg-emerald-900/80' 
                : 'bg-amber-950/90 text-amber-300 border-amber-600/60 hover:bg-amber-900/80'
            }`}
            title="Basculer entre le rendu 3D Donjon Pierre et le Rétro Vectoriel Apple II"
          >
            <span className="sm:hidden text-[10px]">{wireframeMode ? 'Fil de Fer' : 'Pierre 3D'}</span>
            <span className="hidden sm:inline">Rendu : <strong>{wireframeMode ? 'Rétro Vectoriel (1981)' : '3D Donjon Pierre'}</strong></span>
          </button>
        </div>
      </div>

      {/* Center Zone: 3D Viewport & Side Control Pad */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* 3D First Person Dungeon Viewport with Touch/Swipe Gestures */}
        <div 
          className="flex-1 relative bg-black overflow-hidden min-h-[220px] md:min-h-0 touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <DungeonRenderer3D
            maze={maze}
            x={x}
            y={y}
            direction={direction}
            lightLevel={lightLevel}
            isDarkZone={isDarkZone}
            wireframeMode={wireframeMode}
          />

          {/* Fallen Heroes / Lost Bodies Recovery Box */}
          {fallenHeroesHere.length > 0 && (
            <div className="absolute top-4 left-4 z-20 max-w-sm bg-red-950/90 border-2 border-red-600/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-red-200">
                <Skull className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                <span className="tracking-wide uppercase">Corps d'aventuriers découverts !</span>
              </div>
              <p className="text-red-200/90 text-[11px] leading-relaxed">
                Les dépouilles de vos anciens compagnons gisent ici dans la poussière du donjon :
              </p>
              <div className="space-y-1.5">
                {fallenHeroesHere.map(fallen => (
                  <div key={fallen.id} className="flex items-center justify-between bg-black/60 border border-red-900/60 p-2 rounded-lg gap-2">
                    <div>
                      <span className="font-bold text-white">{fallen.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({fallen.race} {fallen.class} Niv.{fallen.charLevel})</span>
                    </div>
                    <button
                      onClick={() => handleRecoverBody(fallen.id)}
                      disabled={party.length >= 6}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:opacity-50 text-white font-bold rounded text-[11px] transition shrink-0"
                      title={party.length >= 6 ? 'Groupe complet (6/6)' : 'Prendre le corps dans le groupe'}
                    >
                      {party.length >= 6 ? 'Groupe 6/6' : 'Hisser le corps'}
                    </button>
                  </div>
                ))}
              </div>
              {party.length >= 6 ? (
                <div className="text-[10px] text-amber-400 italic">
                  ⚠️ Votre escouade est au complet (6/6). Vous devez avoir au moins 1 emplacement libre pour transporter une dépouille.
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400">
                  ✓ Hisser le corps occupe 1 emplacement dans votre escouade ({party.length}/6). Ramenez-le au Temple de Cant !
                </div>
              )}
            </div>
          )}

          {/* Persistent On-Screen Mini-Map HUD Overlay */}
          {hudMinimapVisible && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 pointer-events-auto max-w-[calc(100vw-1rem)] sm:max-w-[280px] drop-shadow-2xl">
              <MiniMap
                maze={maze}
                x={x}
                y={y}
                direction={direction}
                visitedTiles={visitedTiles}
                variant="hud"
                fallenMarkers={fallenMarkers}
                keyboardLayout={keyboardLayout}
                onClose={() => setHudMinimapVisible(false)}
                onExpand={() => setShowMinimap(true)}
              />
            </div>
          )}

          {/* Collapsed HUD Mini-Map button */}
          {!hudMinimapVisible && (
            <button
              onClick={() => { setHudMinimapVisible(true); sounds.playTurn(); }}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md transition active:scale-95"
              title="Ouvrir la minicarte (M)"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ouvrir Minicarte</span>
              <span className="sm:hidden">Carte</span>
            </button>
          )}
          {/* Stairs Detected Floating Banner */}
          {isStairs && stairsTargetLvl !== undefined && (
            <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-amber-500/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl backdrop-blur-md max-w-[calc(100vw-1rem)]">
              <Layers className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-amber-300">
                {stairsTargetLvl === 0 
                  ? 'Escalier montant vers le Château' 
                  : stairsTargetLvl > maze.level 
                    ? `Escalier descendant vers le Niveau ${stairsTargetLvl}` 
                    : `Escalier montant vers le Niveau ${stairsTargetLvl}`}
              </span>
              <button
                onClick={handleExecuteTakeStairs}
                className="ml-2 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full text-xs shadow transition active:scale-95 cursor-pointer"
              >
                Emprunter (Y)
              </button>
            </div>
          )}

          {/* Interactive Stairs Confirmation Modal */}
          {showStairsPrompt && isStairs && stairsTargetLvl !== undefined && (
            <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/60">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-amber-300 tracking-wide">
                  {stairsTargetLvl === 0 
                    ? "Escalier vers le Château" 
                    : stairsTargetLvl > maze.level 
                      ? `Escalier Descendant (Niveau ${stairsTargetLvl})` 
                      : `Escalier Montant (Niveau ${stairsTargetLvl})`}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {stairsTargetLvl === 0
                    ? "Un large perron de pierre remonte vers la cour et la sécurité du Château."
                    : stairsTargetLvl > maze.level
                      ? `Un escalier en colimaçon taillé dans la roche brute s'enfonce dans les profondeurs vers le Niveau ${stairsTargetLvl}. L'air y est plus froid, et les rugissements des créatures résonnent plus près.`
                      : `Un escalier de pierre taillée remonte vers les couloirs du Niveau ${stairsTargetLvl}.`}
                </p>
                <div className="text-amber-200/90 font-bold text-xs pt-1">
                  Voulez-vous emprunter cet escalier ?
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleExecuteTakeStairs}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-black shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    {stairsTargetLvl === 0 
                      ? 'Remonter au Château (Y)' 
                      : stairsTargetLvl > maze.level 
                        ? `Descendre au Niveau ${stairsTargetLvl} (Y)` 
                        : `Monter au Niveau ${stairsTargetLvl} (Y)`}
                  </button>
                  <button
                    onClick={() => setShowStairsPrompt(false)}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    Rester ici (N)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Tactical Control Bar (< md) */}
        <div className="md:hidden bg-slate-900/95 border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-3 shrink-0">
          {/* Mobile D-Pad */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 shrink-0">
            <div />
            <button
              onClick={() => { tryMoveForward(false); if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10); }}
              className="w-11 h-11 bg-slate-800 active:bg-amber-600 text-white rounded-lg flex flex-col items-center justify-center transition shadow active:scale-95 touch-manipulation"
              title={`Avancer (${forwardKeyLabel})`}
            >
              <ArrowUp className="w-5 h-5 text-amber-400" />
            </button>
            <div />

            <button
              onClick={() => { onRotate(3); if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10); }}
              className="w-11 h-11 bg-slate-800 active:bg-slate-700 text-white rounded-lg flex flex-col items-center justify-center transition shadow active:scale-95 touch-manipulation"
              title={`Gauche (${leftKeyLabel})`}
            >
              <ArrowLeft className="w-5 h-5 text-slate-200" />
            </button>
            <button
              onClick={() => { onKickDoor(); if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15); }}
              className="w-11 h-11 bg-amber-950/60 active:bg-amber-800 border border-amber-600/40 text-amber-300 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95 touch-manipulation"
              title="Porte (K)"
            >
              <DoorClosed className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onRotate(1); if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10); }}
              className="w-11 h-11 bg-slate-800 active:bg-slate-700 text-white rounded-lg flex flex-col items-center justify-center transition shadow active:scale-95 touch-manipulation"
              title={`Droite (${rightKeyLabel})`}
            >
              <ArrowRight className="w-5 h-5 text-slate-200" />
            </button>
          </div>

          {/* Mobile Quick Action Buttons & Stairs */}
          <div className="flex-1 flex flex-col justify-between gap-1.5 min-w-0">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => { setShowCamp(true); sounds.playTurn(); }}
                className="py-2 px-1 bg-slate-800 active:bg-slate-700 border border-slate-700/60 rounded-lg flex flex-col items-center justify-center text-slate-200 font-semibold transition active:scale-95"
              >
                <Tent className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] truncate mt-0.5">Camp (C)</span>
              </button>

              <button
                onClick={() => { setShowMinimap(true); sounds.playTurn(); }}
                className="py-2 px-1 bg-slate-800 active:bg-slate-700 border border-slate-700/60 rounded-lg flex flex-col items-center justify-center text-slate-200 font-semibold transition active:scale-95"
              >
                <Map className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] truncate mt-0.5">Carte (M)</span>
              </button>

              <button
                onClick={onInspectArea}
                className="py-2 px-1 bg-slate-800 active:bg-slate-700 border border-slate-700/60 rounded-lg flex flex-col items-center justify-center text-slate-200 font-semibold transition active:scale-95"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] truncate mt-0.5">Chercher</span>
              </button>
            </div>

            {/* Dynamic Stairs or 180 Turnaround button */}
            {isStairs && stairsTargetLvl !== undefined ? (
              <button
                onClick={handleExecuteTakeStairs}
                className="w-full py-2 px-2 bg-gradient-to-r from-amber-600 to-amber-500 active:from-amber-500 active:to-amber-400 text-white rounded-lg text-xs font-black transition shadow flex items-center justify-center gap-1.5 border border-amber-300/40 active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="truncate">
                  {stairsTargetLvl === 0 
                    ? 'Château (Y)' 
                    : stairsTargetLvl > maze.level 
                      ? `Niveau ${stairsTargetLvl} ↓` 
                      : `Niveau ${stairsTargetLvl} ↑`}
                </span>
              </button>
            ) : (
              <button
                onClick={() => { onRotate(2); if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10); }}
                className="w-full py-1.5 px-2 bg-slate-800/80 active:bg-slate-700 border border-slate-700/50 rounded-lg text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition"
                title="Faire demi-tour (180°)"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Demi-tour 180°</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Tactical Control Pad (>= md) */}
        <div className="hidden md:flex w-64 md:w-72 bg-slate-900/90 border-l border-slate-800 p-4 flex-col justify-between shrink-0 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Commandes d'Exploration
              </div>
              {onToggleKeyboardLayout && (
                <button
                  onClick={() => { onToggleKeyboardLayout(); sounds.playTurn(); }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 rounded text-[10px] font-mono font-bold text-amber-300 transition"
                  title="Changer la disposition du clavier pour les déplacements (AZERTY: Z/Q/D · QWERTY: W/A/D)"
                >
                  <Keyboard className="w-3 h-3" />
                  <span>{keyboardLayout}</span>
                </button>
              )}
            </div>
            
            {/* Directional D-Pad */}
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800/80 mb-4">
              <div />
              <button
                onClick={() => tryMoveForward(false)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex flex-col items-center justify-center transition shadow-sm active:scale-95"
                title={`Avancer (${forwardKeyLabel} / F / Flèche Haut)`}
              >
                <ArrowUp className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">{forwardKeyLabel}</span>
              </button>
              <div />

              <button
                onClick={() => onRotate(3)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex flex-col items-center justify-center transition shadow-sm active:scale-95"
                title={`Pivoter à Gauche (${leftKeyLabel} / L / Flèche Gauche)`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[9px] font-mono text-slate-300 font-bold mt-0.5">{leftKeyLabel}</span>
              </button>
              <button
                onClick={() => onKickDoor()}
                className="p-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95"
                title="Enfoncer / Ouvrir Porte (K)"
              >
                <DoorClosed className="w-3.5 h-3.5 mb-0.5" />
                Porte (K)
              </button>
              <button
                onClick={() => onRotate(1)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex flex-col items-center justify-center transition shadow-sm active:scale-95"
                title={`Pivoter à Droite (${rightKeyLabel} / R / Flèche Droite)`}
              >
                <ArrowRight className="w-4 h-4" />
                <span className="text-[9px] font-mono text-slate-300 font-bold mt-0.5">{rightKeyLabel}</span>
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

          {/* Dynamic Stairs Action Button */}
          {isStairs && stairsTargetLvl !== undefined && (
            <button
              onClick={handleExecuteTakeStairs}
              className="w-full p-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-black transition shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 border border-amber-300/40 active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>
                {stairsTargetLvl === 0 
                  ? 'Remonter au Château (Y)' 
                  : stairsTargetLvl > maze.level 
                    ? `Descendre au Niveau ${stairsTargetLvl} (Y)` 
                    : `Monter au Niveau ${stairsTargetLvl} (Y)`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Party Status Cards (Responsive: 3 cols on mobile = Front/Back row, 6 cols on tablet/desktop) */}
      <div className="bg-slate-900 border-t border-slate-800 p-1.5 md:p-3 safe-bottom shrink-0">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 md:gap-2">
          {party.map((hero, idx) => (
            <div
              key={hero.id}
              onClick={() => {
                setCampCharIdx(idx);
                setShowCamp(true);
                sounds.playTurn();
              }}
              className="p-1.5 md:p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs hover:border-slate-700 active:border-amber-500 cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="truncate text-[11px] md:text-xs">{hero.name}</span>
                  <span className="text-[9px] md:text-[10px] text-amber-400 font-mono">N.{hero.charLevel}</span>
                </div>
                <div className="text-[9px] md:text-[11px] text-slate-400 truncate">{hero.race} {hero.class}</div>
              </div>

              <div className="pt-1 md:pt-2 space-y-0.5 md:space-y-1">
                {/* HP bar */}
                <div className="flex items-center justify-between text-[9px] md:text-[11px]">
                  <span className="text-slate-400">PV:</span>
                  <span className={hero.hpLeft < hero.hpMax / 2 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {hero.hpLeft}/{hero.hpMax}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1 md:h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${hero.hpLeft < hero.hpMax / 3 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, (hero.hpLeft / hero.hpMax) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] md:text-[10px] text-slate-400 pt-0.5">
                  <span>CA: {hero.armorClass}</span>
                  <span className={hero.status === 'OK' ? 'text-slate-400' : 'text-red-400 font-bold'}>
                    {hero.status}
                  </span>
                </div>

                {/* Active Status Badges */}
                <div className="flex flex-wrap gap-0.5 md:gap-1 pt-0.5 min-h-[14px]">
                  {getActiveStatusEffects(hero).map(eff => (
                    <span 
                      key={eff.id}
                      className={`text-[8px] md:text-[9px] font-bold px-1 py-0.2 rounded border ${eff.bgColor} ${eff.borderColor} ${eff.color}`}
                      title={eff.description}
                    >
                      {eff.badge}
                    </span>
                  ))}
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
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-950/80 border border-emerald-600/50 rounded-lg text-emerald-400">
                  <Tent className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Campement dans le Labyrinthe</h2>
                  <p className="text-[10px] text-slate-400">Gestion de l'escouade, formation et inventaire</p>
                </div>
              </div>

              {/* Camp Mode Tabs: Inventory vs Formation */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setCampTab('INVENTORY'); sounds.playTurn(); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    campTab === 'INVENTORY' 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Équipement & Magie</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCampTab('FORMATION'); sounds.playTurn(); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    campTab === 'FORMATION' 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Ordre du Groupe (Formation)</span>
                </button>
              </div>

              <button
                onClick={() => setShowCamp(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hero selector tabs (for inventory mode) */}
            {campTab === 'INVENTORY' && (
              <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
                {party.map((h, idx) => {
                  const isFront = idx < 3;
                  const isSel = campCharIdx === idx;
                  return (
                    <button
                      key={h.id}
                      onClick={() => { setCampCharIdx(idx); sounds.playTurn(); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                        isSel 
                          ? 'bg-amber-600 text-white shadow' 
                          : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-80">#{idx + 1}</span>
                      <span>{h.name}</span>
                      <span className={`text-[9px] px-1 rounded font-bold ${
                        isFront 
                          ? isSel ? 'bg-amber-800 text-amber-200' : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : isSel ? 'bg-blue-800 text-blue-200' : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                      }`}>
                        {isFront ? 'Avant' : 'Arrière'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {campMessage && (
              <div className="px-6 py-2 bg-amber-950/30 border-b border-amber-900/30 text-xs text-amber-300">
                {campMessage}
              </div>
            )}

            {campTab === 'INVENTORY' ? (
              <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Character Details & Spells */}
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{activeCampHero.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            campCharIdx < 3 
                              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' 
                              : 'bg-blue-950/80 border-blue-500/60 text-blue-300'
                          }`}>
                            {campCharIdx < 3 ? `Avant-garde · Rang #${campCharIdx + 1}` : `Arrière-garde · Rang #${campCharIdx + 1}`}
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs">
                          {activeCampHero.race} {activeCampHero.class} (Niveau {activeCampHero.charLevel}) · CA {activeCampHero.armorClass}
                        </div>
                      </div>

                      {/* Quick reorder buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveHero(campCharIdx, campCharIdx - 1)}
                          disabled={campCharIdx === 0}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 rounded text-slate-300 hover:text-white transition"
                          title="Monter d'un rang dans le groupe"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveHero(campCharIdx, campCharIdx + 1)}
                          disabled={campCharIdx === party.length - 1}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 rounded text-slate-300 hover:text-white transition"
                          title="Descendre d'un rang dans le groupe"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCampTab('FORMATION')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] font-bold text-amber-300 flex items-center gap-1 transition"
                          title="Ouvrir le gestionnaire de formation complet"
                        >
                          <ArrowUpDown className="w-3 h-3" />
                          <span>Ordre</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      Points de Vie : <strong className="text-emerald-400">{activeCampHero.hpLeft}/{activeCampHero.hpMax}</strong> · Or : <strong className="text-amber-400">{activeCampHero.gold} PO</strong>
                    </div>
                  </div>

                {/* Spells available to cast in Camp */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      Sorts Disponibles :
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">Cible :</span>
                      <select
                        value={campTargetIdx}
                        onChange={e => setCampTargetIdx(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 text-amber-300 px-2 py-0.5 rounded text-xs focus:outline-none"
                      >
                        {party.map((p, idx) => (
                          <option key={p.id} value={idx}>
                            {p.name} ({p.hpLeft}/{p.hpMax} PV {p.status !== 'OK' ? `[${p.status}]` : ''}{p.poisonAmount > 0 ? ` [POISON x${p.poisonAmount}]` : ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Silenced / Afflicted check */}
                  {(() => {
                    const castCheck = canHeroCastSpells(activeCampHero);
                    if (!castCheck.canCast) {
                      return (
                        <div className="p-2 bg-red-950/60 border border-red-800/60 rounded text-red-300 text-xs flex items-center gap-2">
                          <span>⚠️ {castCheck.reason}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="space-y-1.5">
                    {SPELLS.filter(sp => sp.camp && activeCampHero.spellsKnown[sp.id]).length === 0 && (
                      <p className="text-slate-500 italic">Aucun sort de soin ou utilitaire appris.</p>
                    )}
                    {SPELLS.filter(sp => sp.camp && activeCampHero.spellsKnown[sp.id]).map(sp => {
                      const targetHero = party[campTargetIdx] || activeCampHero;
                      const hasSlots = sp.spellType === 'PRIEST' 
                        ? activeCampHero.priestSpells[sp.tier] > 0 
                        : activeCampHero.mageSpells[sp.tier] > 0;
                      const canCast = canHeroCastSpells(activeCampHero).canCast && hasSlots;

                      return (
                        <div key={sp.id} className="p-2.5 bg-slate-800/70 border border-slate-700/50 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{sp.name} (T{sp.tier})</span>
                              <span className="text-[10px] text-amber-400">
                                {sp.spellType === 'PRIEST' ? `${activeCampHero.priestSpells[sp.tier]} slots` : `${activeCampHero.mageSpells[sp.tier]} slots`}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">{sp.description}</div>
                          </div>
                          <button
                            onClick={() => handleCampCastSpell(sp, targetHero)}
                            disabled={!canCast}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition disabled:opacity-30 disabled:pointer-events-none"
                          >
                            Lancer
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inventory & Equipment */}
              <div className="space-y-2">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Équipement & Sac ({activeCampHero.possessions.length}/8) :
                </div>
                <div className="space-y-1.5">
                  {activeCampHero.possessions.length === 0 && (
                    <p className="text-slate-500 italic py-4 text-center">Sac vide.</p>
                  )}
                  {activeCampHero.possessions.map((slot, sIdx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;
                    const isTransferringThis = transferringSlotIdx === sIdx;
                    return (
                      <div key={sIdx} className="p-2.5 bg-slate-800/70 border border-slate-700/50 rounded-lg flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{slot.identified ? itm.name : itm.nameUnknown}</span>
                              {slot.equipped && <span className="text-[10px] text-emerald-400 font-bold">[Équipé]</span>}
                              {slot.cursed && <span className="text-[10px] text-red-400 font-bold">[Maudit]</span>}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {itm.objType} {itm.objType === 'WEAPON' && itm.wepHpDam?.level ? `· Dégâts ${formatDamageDice(itm.wepHpDam)}` : ''} {itm.armorMod ? `· CA -${itm.armorMod}` : ''}
                            </div>
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
                            {party.length > 1 && (
                              <button
                                onClick={() => setTransferringSlotIdx(isTransferringThis ? null : sIdx)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                                  isTransferringThis 
                                    ? 'bg-amber-600 text-white shadow-sm' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/30'
                                }`}
                                title="Donner cet objet à un autre compagnon"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Donner</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline transfer recipient selection */}
                        {isTransferringThis && (
                          <div className="pt-2 border-t border-slate-700/50 bg-slate-900/80 p-2.5 rounded-lg space-y-1.5 animate-fadeIn">
                            <div className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                              <span className="flex items-center gap-1 text-amber-400">
                                <Package className="w-3.5 h-3.5" />
                                Transférer à quel compagnon ?
                              </span>
                              <button 
                                onClick={() => setTransferringSlotIdx(null)}
                                className="text-slate-400 hover:text-white text-[10px] underline"
                              >
                                Annuler
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {party.filter(p => p.id !== activeCampHero.id).map(target => {
                                const isFull = target.possessions.length >= 8;
                                const isCursedEquipped = slot.equipped && slot.cursed;
                                return (
                                  <button
                                    key={target.id}
                                    onClick={() => handleTransferItem(sIdx, target.id)}
                                    disabled={isFull || isCursedEquipped}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-amber-600/90 disabled:opacity-40 disabled:pointer-events-none border border-slate-700 hover:border-amber-500 text-white rounded text-xs font-semibold transition flex items-center gap-1.5"
                                    title={isFull ? 'Inventaire de ce héros plein (8/8)' : isCursedEquipped ? 'Impossible de transférer un objet maudit équipé' : `Transférer à ${target.name}`}
                                  >
                                    <span>{target.name}</span>
                                    <span className={`text-[10px] font-mono ${isFull ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                      ({target.possessions.length}/8)
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
              <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
                {/* Rules description header */}
                <div className="p-4 bg-amber-950/30 border border-amber-600/40 rounded-xl space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-2 text-sm font-serif">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span>Règles Pascal de Wizardry I : Disposition Tactique du Groupe</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Seuls les <strong>3 premiers personnages (l'Avant-garde)</strong> peuvent porter des attaques physiques au corps-à-corps et subir les assauts physiques directs des monstres.
                    Les personnages <strong>4, 5 et 6 (l'Arrière-garde)</strong> sont protégés des coups de mêlée et combattent par leurs sorts, objets ou compétences.
                  </p>
                </div>

                {/* Two Column Battle Ranks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* FRONT RANK (AVANT-GARDE : Rangs 1, 2, 3) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-600/40">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-950/80 border border-amber-600/60 rounded-lg text-amber-400">
                          <Swords className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="font-bold text-sm text-amber-300">AVANT-GARDE (Ligne de Front)</div>
                          <div className="text-[11px] text-slate-400">Rangs #1 à #3 · Attaquent et encaissent en mêlée</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {Math.min(3, party.length)}/3
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {party.slice(0, 3).map((hero, idx) => {
                        const actualIdx = idx;
                        return (
                          <div 
                            key={hero.id}
                            className="p-3 bg-slate-800/80 border border-amber-500/40 rounded-xl space-y-2 hover:border-amber-500 transition shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-amber-600/20 border border-amber-500 text-amber-300 flex items-center justify-center font-bold font-mono text-xs">
                                  #{actualIdx + 1}
                                </span>
                                <div>
                                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                    <span>{hero.name}</span>
                                    <span className="text-[10px] text-amber-400 font-normal">({hero.class})</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Niv.{hero.charLevel} · CA {hero.armorClass} · {hero.hpLeft}/{hero.hpMax} PV
                                  </div>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, actualIdx - 1)}
                                  disabled={actualIdx === 0}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white rounded text-xs transition"
                                  title="Monter d'un rang"
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, actualIdx + 1)}
                                  disabled={actualIdx === party.length - 1}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white rounded text-xs transition"
                                  title="Descendre d'un rang"
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>
                                {party.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveHero(actualIdx, Math.min(party.length - 1, 3))}
                                    className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 rounded text-[11px] font-semibold transition"
                                    title="Placer en arrière-garde"
                                  >
                                    Arrière ⏩
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Swap selector */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[11px]">
                              <span className="text-slate-400">Échanger avec :</span>
                              <select
                                onChange={e => {
                                  const targetIdx = Number(e.target.value);
                                  if (!isNaN(targetIdx)) handleSwapHeroes(actualIdx, targetIdx);
                                }}
                                value=""
                                className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-0.5 text-xs focus:outline-none"
                              >
                                <option value="" disabled>Choisir un compagnon...</option>
                                {party.map((p, pIdx) => {
                                  if (pIdx === actualIdx) return null;
                                  return (
                                    <option key={p.id} value={pIdx}>
                                      #{pIdx + 1} {p.name} ({p.class} · {pIdx < 3 ? 'Avant' : 'Arrière'})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BACK RANK (ARRIÈRE-GARDE : Rangs 4, 5, 6) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-600/40">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-blue-950/80 border border-blue-600/60 rounded-lg text-blue-400">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="font-bold text-sm text-blue-300">ARRIÈRE-GARDE (Second Rang)</div>
                          <div className="text-[11px] text-slate-400">Rangs #4 à #6 · Protégés de la mêlée physique</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {Math.max(0, party.length - 3)}/3
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {party.length <= 3 && (
                        <div className="p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                          Aucun héros en arrière-garde. Tous vos aventuriers sont au front !
                        </div>
                      )}
                      {party.slice(3).map((hero, idx) => {
                        const actualIdx = idx + 3;
                        return (
                          <div 
                            key={hero.id}
                            className="p-3 bg-slate-800/80 border border-blue-500/40 rounded-xl space-y-2 hover:border-blue-500 transition shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500 text-blue-300 flex items-center justify-center font-bold font-mono text-xs">
                                  #{actualIdx + 1}
                                </span>
                                <div>
                                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                    <span>{hero.name}</span>
                                    <span className="text-[10px] text-blue-400 font-normal">({hero.class})</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Niv.{hero.charLevel} · CA {hero.armorClass} · {hero.hpLeft}/{hero.hpMax} PV
                                  </div>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, actualIdx - 1)}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition"
                                  title="Monter d'un rang"
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, actualIdx + 1)}
                                  disabled={actualIdx === party.length - 1}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white rounded text-xs transition"
                                  title="Descendre d'un rang"
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, 0)}
                                  className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 rounded text-[11px] font-semibold transition"
                                  title="Placer en tête de ligne (Avant-garde)"
                                >
                                  ⏪ Avant
                                </button>
                              </div>
                            </div>

                            {/* Swap selector */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[11px]">
                              <span className="text-slate-400">Échanger avec :</span>
                              <select
                                onChange={e => {
                                  const targetIdx = Number(e.target.value);
                                  if (!isNaN(targetIdx)) handleSwapHeroes(actualIdx, targetIdx);
                                }}
                                value=""
                                className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-0.5 text-xs focus:outline-none"
                              >
                                <option value="" disabled>Choisir un compagnon...</option>
                                {party.map((p, pIdx) => {
                                  if (pIdx === actualIdx) return null;
                                  return (
                                    <option key={p.id} value={pIdx}>
                                      #{pIdx + 1} {p.name} ({p.class} · {pIdx < 3 ? 'Avant' : 'Arrière'})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL TACTICAL CARTOGRAPHY MODAL */}
      {showMinimap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto safe-top safe-bottom safe-left safe-right animate-fadeIn">
          <MiniMap
            maze={maze}
            x={x}
            y={y}
            direction={direction}
            visitedTiles={visitedTiles}
            variant="modal"
            fallenMarkers={fallenMarkers}
            keyboardLayout={keyboardLayout}
            onClose={() => setShowMinimap(false)}
          />
        </div>
      )}
    </div>
  );
};

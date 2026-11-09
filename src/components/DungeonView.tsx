import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  TCharacter, 
  TMazeFloor, 
  TItem,
  TWall,
  AdventureLogCategory
} from '../types/wizardry';
import { DungeonRenderer3D } from '../engine/dungeonRenderer3D';
import { 
  ITEMS_DATABASE, 
  SPELLS, 
  formatDamageDice, 
  recalculateCharacterCombatStats, 
  getActiveMaxFloors, 
  isItemUsable,
  isItemEquippable,
  canHeroEquipItem,
  canClassUseItem,
  getUsableClassesList
} from '../data/provingGroundsData';
import { sounds } from '../utils/soundEffects';
import { music } from '../utils/musicManager';
import { getCharacterChevrons } from '../utils/awards';
import { useI18n } from '../i18n';
import { getActiveStatusEffects, canHeroCastSpells } from '../engine/statusSystem';
import { getSpellDescription } from '../engine/spellEngine';
import { MiniMap, loadMiniMapPrefs, saveMiniMapPrefs } from './MiniMap';
import { CharacterSheetModal } from './CharacterSheetModal';
import { MusicScreener } from './MusicScreener';
import { useGuidanceLevel } from '../utils/guidanceManager';
import { getFloorGuide, getLocalizedFloorGuide } from '../data/scenarioFloorGuides';
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
  EyeOff,
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
  Keyboard,
  FileText,
  FlaskConical,
  AlertTriangle,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BookOpen
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
  onRevealSecretDoor?: (x: number, y: number, dir: number) => void;
  onInspectArea: () => void;
  onReturnToCastle: () => void;
  onTakeStairs?: (targetLevel: number, targetX: number, targetY: number) => void;
  onTriggerEncounter: () => void;
  activeScenarioId?: string;
  onOpenGuide?: (scenarioId?: string, floor?: number) => void;
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
  onRevealSecretDoor,
  onInspectArea,
  onReturnToCastle,
  onTakeStairs,
  onTriggerEncounter,
  activeScenarioId = 'proving-grounds',
  onOpenGuide
}) => {
  const { t, lang } = useI18n();
  const [wireframeMode, setWireframeMode] = useState<boolean>(() => loadMiniMapPrefs().wireframeMode);
  const [showMinimap, setShowMinimap] = useState<boolean>(() => loadMiniMapPrefs().modalEnlarged ?? false);
  const [hudMinimapVisible, setHudMinimapVisible] = useState<boolean>(() => loadMiniMapPrefs().hudVisible);

  useEffect(() => {
    saveMiniMapPrefs({ hudVisible: hudMinimapVisible, wireframeMode, modalEnlarged: showMinimap });
  }, [hudMinimapVisible, wireframeMode, showMinimap]);
  const [showCamp, setShowCamp] = useState<boolean>(false);
  const [campCharIdx, setCampCharIdx] = useState<number>(0);
  const [campTargetIdx, setCampTargetIdx] = useState<number>(0);
  const [campMessage, setCampMessage] = useState<string>('');
  const [campTab, setCampTab] = useState<'INVENTORY' | 'FORMATION'>('INVENTORY');
  const [transferringSlotIdx, setTransferringSlotIdx] = useState<number | null>(null);
  const [showCharacterSheetModal, setShowCharacterSheetModal] = useState<boolean>(false);
  const [localVisitedTiles, setLocalVisitedTiles] = useState<boolean[][]>(() => 
    Array.from({ length: 20 }, () => Array(20).fill(false))
  );

  const visitedTiles = propVisitedTiles || localVisitedTiles;
  const setVisitedTiles = propSetVisitedTiles || setLocalVisitedTiles;

  // Guidance and Floor Strategy Oracle state
  const [guidanceLevel] = useGuidanceLevel();
  const [floorBannerDismissedForLevel, setFloorBannerDismissedForLevel] = useState<number | null>(null);
  const [isFloorBannerExpanded, setIsFloorBannerExpanded] = useState<boolean>(false);

  useEffect(() => {
    setIsFloorBannerExpanded(false);
  }, [maze.level]);

  const currentFloorGuide = useMemo(() => {
    if (!activeScenarioId) return null;
    const raw = getFloorGuide(activeScenarioId, maze.level);
    return getLocalizedFloorGuide(raw, lang);
  }, [activeScenarioId, maze.level, lang]);

  const showFloorBanner = guidanceLevel !== 'OFF' && floorBannerDismissedForLevel !== maze.level && !!currentFloorGuide;

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
  const isElevator = sqrType === 'BUTTONZ';
  const elevatorMinLvl = currentSqrDef?.aux2 ?? 1;
  const elevatorMaxLvl = currentSqrDef?.aux1 ?? 4;

  const [showStairsPrompt, setShowStairsPrompt] = useState<boolean>(false);
  const [showElevatorModal, setShowElevatorModal] = useState<boolean>(false);
  const lastPromptedPos = React.useRef<string>('');

  // Automatically prompt player when stepping onto a staircase (like Pascal STAIRSYN) or elevator
  useEffect(() => {
    const posKey = `${x},${y},${maze.level}`;
    if (isStairs && lastPromptedPos.current !== posKey) {
      lastPromptedPos.current = posKey;
      setShowStairsPrompt(true);
    } else if (isElevator && lastPromptedPos.current !== posKey) {
      lastPromptedPos.current = posKey;
      setShowElevatorModal(true);
    }
  }, [x, y, maze.level, isStairs, isElevator]);

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
        lastPromptedPos.current = `${targetX ?? x},${targetY ?? y},${targetLvl}`;
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
    if (showCamp || showCharacterSheetModal) return;

    // Close minimap modal on Escape
    if (e.key === 'Escape' && showMinimap) {
      e.preventDefault();
      setShowMinimap(false);
      return;
    }

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

    // Direct stairs trigger with 'Y' or 'O' when standing on a stairs tile
    if (isStairs && (e.key === 'y' || e.key === 'Y' || e.key === 'o' || e.key === 'O')) {
      e.preventDefault();
      handleExecuteTakeStairs();
      return;
    }

    // Elevator modal interaction: Escape/N to close, number keys to select destination floor
    if (showElevatorModal && isElevator) {
      if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowElevatorModal(false);
        return;
      }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= elevatorMinLvl && num <= elevatorMaxLvl && num !== maze.level) {
        e.preventDefault();
        setShowElevatorModal(false);
        lastPromptedPos.current = `${x},${y},${num}`;
        if (onTakeStairs) onTakeStairs(num, x, y);
        return;
      }
    }

    // Direct elevator trigger with 'E' or 'Enter' when standing on elevator tile (if modal is not open)
    if (isElevator && !showElevatorModal && (e.key === 'e' || e.key === 'E' || e.key === 'Enter')) {
      e.preventDefault();
      setShowElevatorModal(true);
      return;
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
    } else if (key === 's' || e.key === 'ArrowDown') {
      e.preventDefault();
      onRotate(2); // Turn around 180°
    } else if (key === 'k' || e.key === ' ') {
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
      onInspectArea();
    } else if (key === 'h') {
      e.preventDefault();
      onOpenGuide?.(activeScenarioId, maze.level);
      sounds.playTurn();
    }
  }, [showCamp, showCharacterSheetModal, showMinimap, showStairsPrompt, showElevatorModal, isStairs, isElevator, elevatorMinLvl, elevatorMaxLvl, onTakeStairs, currentSqrDef, x, y, direction, maze, keyboardLayout, onOpenGuide, activeScenarioId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const tryMoveForward = (isKick: boolean) => {
    // Current facing wall
    let wall: TWall = 'OPEN';
    let dx = 0;
    let dy = 0;

    if (direction === 0) { wall = maze.n[x][y]; dy = 1; }
    else if (direction === 1) { wall = maze.e[x][y]; dx = 1; }
    else if (direction === 2) { wall = maze.s[x][y]; dy = -1; }
    else if (direction === 3) { wall = maze.w[x][y]; dx = -1; }

    const nx = x + dx;
    const ny = y + dy;

    const canPass = wall === 'OPEN' || wall === 'DOOR' || (isKick && wall === 'HIDEDOOR');
    if (canPass) {
      if (wall === 'HIDEDOOR' && isKick && onRevealSecretDoor) {
        onRevealSecretDoor(x, y, direction);
      }
      if (wall === 'DOOR' || wall === 'HIDEDOOR') {
        sounds.playDoor();
      } else {
        sounds.playFootstep();
      }
      onMove(dx, dy, wall === 'DOOR' || wall === 'HIDEDOOR');
    } else {
      sounds.playBump();
      if (wall === 'HIDEDOOR') {
        if (onAddAdventureEvent) {
          onAddAdventureEvent(
            'DISCOVERY',
            'Passage secret détecté !',
            `Une porte dérobée est dissimulée dans la paroi en (${x}, ${y}) ! Appuyez sur [K] (Enfoncer) pour la franchir.`,
            undefined,
            maze.level,
            { x, y }
          );
        }
      }
      // If facing the blocked side of a one-way door or secret door
      const tx = (nx + 20) % 20;
      const ty = (ny + 20) % 20;
      if (wall === 'WALL') {
        const oppWall = [maze.s, maze.w, maze.n, maze.e][direction]?.[tx]?.[ty];
        if (oppWall === 'DOOR' || oppWall === 'HIDEDOOR') {
          if (onAddAdventureEvent) {
            onAddAdventureEvent(
              'DISCOVERY',
              'Passage à sens unique',
              `La paroi en (${x}, ${y}) est un mur plein : ce passage ne s'ouvre que depuis l'autre côté (${tx}, ${ty}).`,
              undefined,
              maze.level,
              { x, y }
            );
          }
        }
      }
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
      if (currentWall === 'DOOR' || currentWall === 'HIDEDOOR') {
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
    const rowName = toIdx < 3 ? (lang === 'fr' ? 'Avant-garde (Mêlée)' : 'Front Row (Melee)') : (lang === 'fr' ? 'Arrière-garde (Distance/Magie)' : 'Back Row (Ranged/Magic)');
    setCampMessage(t.dungeon.movedPositionSuccess(moved.name, toIdx + 1, rowName));
    onAddAdventureEvent?.(
      'DISCOVERY',
      lang === 'fr' ? "Modification de l'Ordre du Groupe" : 'Party Formation Reordered',
      lang === 'fr'
        ? `Formation réorganisée : ${moved.name} prend le rang #${toIdx + 1} (${toIdx < 3 ? 'Avant-garde' : 'Arrière-garde'}).`
        : `Formation reordered: ${moved.name} moves to rank #${toIdx + 1} (${toIdx < 3 ? 'Front Row' : 'Back Row'}).`,
      lang === 'fr'
        ? `Ordre actuel : ${newParty.map((h, i) => `#${i + 1} ${h.name} (${i < 3 ? 'Avant' : 'Arrière'})`).join(', ')}`
        : `Current order: ${newParty.map((h, i) => `#${i + 1} ${h.name} (${i < 3 ? 'Front' : 'Back'})`).join(', ')}`,
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
    setCampMessage(t.dungeon.swapPositionSuccess(newParty[idxA].name, idxA + 1, newParty[idxB].name, idxB + 1));
    onAddAdventureEvent?.(
      'DISCOVERY',
      lang === 'fr' ? "Modification de l'Ordre du Groupe" : 'Party Formation Swapped',
      lang === 'fr'
        ? `Échange de positions au camp : #${idxA + 1} ${newParty[idxA].name} et #${idxB + 1} ${newParty[idxB].name}.`
        : `Positions swapped in camp: #${idxA + 1} ${newParty[idxA].name} and #${idxB + 1} ${newParty[idxB].name}.`,
      lang === 'fr'
        ? `Nouvel ordre : ${newParty.map((h, i) => `#${i + 1} ${h.name} (${i < 3 ? 'Avant' : 'Arrière'})`).join(', ')}`
        : `New order: ${newParty.map((h, i) => `#${i + 1} ${h.name} (${i < 3 ? 'Front' : 'Back'})`).join(', ')}`,
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
        setCampMessage(t.character.cursedCannotRemove(itm.name));
        sounds.playBump();
        return;
      }
      slot.equipped = false;
      recalculateCharacterCombatStats(activeCampHero);
      setCampMessage(t.character.unequippedNotice(itm.name, activeCampHero.armorClass, formatDamageDice(activeCampHero.wepDamage)));
    } else {
      // Authentic Pascal Class Proficiency Check (UTILITIE2.TEXT l. 276)
      const check = canHeroEquipItem(activeCampHero, itm, lang);
      if (!check.canEquip) {
        setCampMessage(check.reason || (lang === 'fr' ? 'Objet impossible à équiper pour cette classe.' : 'Item cannot be equipped by this class.'));
        sounds.playBump();
        return;
      }

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
      setCampMessage(t.character.equippedNotice(itm.name, activeCampHero.armorClass, formatDamageDice(activeCampHero.wepDamage)));
    }
    setParty([...party]);
  };

  const handleCampUseItem = (slotIdx: number) => {
    const slot = activeCampHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (!canClassUseItem(activeCampHero.class, itm)) {
      const allowed = getUsableClassesList(itm, false, lang).join(', ') || (lang === 'fr' ? 'Aucune' : 'None');
      setCampMessage(t.dungeon.notProficientNotice(activeCampHero.name, activeCampHero.class, allowed));
      sounds.playBump();
      return;
    }

    sounds.playFanfare();
    const targetHero = party[campTargetIdx] || activeCampHero;
    let effectDone = false;

    if (itm.spellPower && itm.spellPower > 0) {
      const sp = SPELLS.find(s => s.id === itm.spellPower);
      if (sp) {
        handleCampCastSpell(sp, targetHero);
        effectDone = true;
      }
    }

    if (!effectDone) {
      if (itm.healPts && itm.healPts > 0) {
        const healAmt = itm.healPts * 6 + Math.floor(Math.random() * 8);
        targetHero.hpLeft = Math.min(targetHero.hpMax, targetHero.hpLeft + healAmt);
        setCampMessage(t.dungeon.spellHealSuccess(itm.name, targetHero.name, healAmt, targetHero.hpLeft, targetHero.hpMax));
        effectDone = true;
      } else if (itm.name.toUpperCase().includes('POISON') || itm.name.toUpperCase().includes('LATUMOFIS')) {
        targetHero.poisonAmount = 0;
        setCampMessage(t.dungeon.spellCurePoisonSuccess(targetHero.name));
        effectDone = true;
      } else {
        setCampMessage(lang === 'fr' ? `✨ ${activeCampHero.name} utilise ${itm.name}.` : `✨ ${activeCampHero.name} uses ${itm.name}.`);
        effectDone = true;
      }
    }

    // Degradation / consumption
    if (itm.changeChance > 0 && Math.random() * 100 < itm.changeChance) {
      if (!itm.changeTo || itm.changeTo === 0) {
        if (slot.equipped) slot.equipped = false;
        activeCampHero.possessions.splice(slotIdx, 1);
        setCampMessage(prev => `${prev} ${t.dungeon.itemConsumed(itm.name)}`);
      } else {
        slot.itemIndex = itm.changeTo;
        const newItem = ITEMS_DATABASE.find(i => i.id === itm.changeTo);
        setCampMessage(prev => `${prev} ${t.dungeon.itemTransformed(newItem?.name || (lang === 'fr' ? 'objet inerte' : 'inert item'))}`);
      }
      recalculateCharacterCombatStats(activeCampHero);
    }

    setParty([...party]);
  };

  const handleTransferItem = (slotIdx: number, targetHeroId: string) => {
    const slot = activeCampHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    if (slot.equipped && slot.cursed) {
      setCampMessage(t.dungeon.giveCursedFail(itm.name));
      return;
    }

    const targetHero = party.find(p => p.id === targetHeroId);
    if (!targetHero) return;

    if (targetHero.possessions.length >= 8) {
      setCampMessage(t.dungeon.giveTargetFull(targetHero.name));
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
    setCampMessage(t.dungeon.giveSuccess(slot.identified ? itm.name : (itm.nameUnknown || (lang === 'fr' ? 'Objet inconnu' : 'Unknown item')), targetHero.name));
  };

  const handleCampDropItem = (slotIdx: number) => {
    const slot = activeCampHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    const displayName = slot.identified ? (itm?.name || 'Objet') : (itm?.nameUnknown || (lang === 'fr' ? 'Objet non identifié' : 'Unidentified item'));

    if (slot.equipped && slot.cursed) {
      setCampMessage(t.dungeon.dropCursedFail(displayName));
      sounds.playBump();
      return;
    }

    if (!window.confirm(t.character.dropConfirm(displayName))) {
      return;
    }

    if (slot.equipped) {
      slot.equipped = false;
    }
    activeCampHero.possessions.splice(slotIdx, 1);
    recalculateCharacterCombatStats(activeCampHero);
    setParty([...party]);
    sounds.playTurn();
    setCampMessage(t.dungeon.dropSuccess(displayName));
  };

  const handleRecoverBody = (fallenId: string) => {
    if (party.length >= 6) {
      alert(t.dungeon.fallenHeroRosterFull);
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
    setCampMessage(t.dungeon.fallenHeroRecoverSuccess(fallen.name, nextParty.length));
    onAddAdventureEvent?.(
      'RESCUE',
      lang === 'fr' ? `Dépouille de ${fallen.name} récupérée dans le dédale` : `Remains of ${fallen.name} recovered in maze`,
      lang === 'fr'
        ? `L'escouade de secours a localisé le corps sans vie de ${fallen.name} au Niveau ${maze.level} (${x}, ${y}) et l'a hissé pour le ramener au sanctuaire de Cant.`
        : `The rescue expedition found ${fallen.name}'s remains on Floor ${maze.level} (${x}, ${y}) and secured them for the Temple of Cant.`,
      lang === 'fr' ? `Statut : Escouade à ${nextParty.length}/6 membres` : `Status: Party at ${nextParty.length}/6 companions`,
      maze.level,
      { x, y }
    );
  };

  const handleCampCastSpell = (spell: any, targetHero: TCharacter) => {
    const castCheck = canHeroCastSpells(activeCampHero, lang);
    if (!castCheck.canCast) {
      setCampMessage(lang === 'fr' ? `Impossible de lancer le sort : ${castCheck.reason}` : `Cannot cast spell: ${castCheck.reason}`);
      return;
    }

    sounds.playSpellCast();
    if (spell.spellType === 'PRIEST') {
      activeCampHero.priestSpells[spell.tier]--;
    } else {
      activeCampHero.mageSpells[spell.tier]--;
    }

    const rollDice = (n: number, sides: number) => {
      let total = 0;
      for (let i = 0; i < n; i++) total += Math.floor(Math.random() * sides) + 1;
      return total;
    };
    const isGone = (h: TCharacter) => h.status === 'DEAD' || h.status === 'ASHES' || h.status === 'LOST';

    if (spell.name === 'DIOS' || spell.name === 'DIAL' || spell.name === 'DIALMA') {
      if (isGone(targetHero)) {
        setParty([...party]);
        setCampMessage(t.dungeon.spellNoEffect(spell.name, targetHero.name));
        return;
      }
      const healed = rollDice(spell.name === 'DIOS' ? 1 : spell.name === 'DIAL' ? 2 : 3, 8);
      targetHero.hpLeft = Math.min(targetHero.hpMax, targetHero.hpLeft + healed);
      setParty([...party]);
      setCampMessage(t.dungeon.spellHealSuccess(spell.name, targetHero.name, healed, targetHero.hpLeft, targetHero.hpMax));
      return;
    }
    if (spell.name === 'DIALKO') {
      if (targetHero.status === 'PLYZE' || targetHero.status === 'ASLEEP') targetHero.status = 'OK';
    }
    if (spell.name === 'LATUMOFI') targetHero.poisonAmount = 0;
    if (spell.name === 'MADI') {
      if (isGone(targetHero)) {
        setParty([...party]);
        setCampMessage(t.dungeon.spellNoEffect('MADI', targetHero.name));
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
        setCampMessage(t.dungeon.spellResurrectLost(targetHero.name));
      } else if (!dead && !(ashes && !isDi)) {
        setCampMessage(ashes ? t.dungeon.spellNeedKadorto(targetHero.name) : t.dungeon.spellAlreadyAlive(targetHero.name));
      } else if (Math.floor(Math.random() * 100) <= 4 * targetHero.attrib.VITALITY) {
        targetHero.hpLeft = isDi ? 1 : targetHero.hpMax;
        targetHero.status = 'OK';
        if (targetHero.attrib.VITALITY <= 3) targetHero.status = 'LOST';
        else targetHero.attrib.VITALITY -= 1;
        setCampMessage(targetHero.status === 'OK' ? t.dungeon.spellResurrectSuccess(targetHero.name) : t.dungeon.spellResurrectLost(targetHero.name));
      } else {
        targetHero.status = dead ? 'ASHES' : 'LOST';
        setCampMessage(dead ? t.dungeon.spellResurrectAshes(targetHero.name) : t.dungeon.spellResurrectLost(targetHero.name));
      }
      setParty([...party]);
      return;
    }

    if (spell.name === 'KANDI') {
      const lost = allCharacters.filter(c => c.lostLocation);
      setCampMessage(lost.length === 0
        ? (lang === 'fr' ? 'KANDI ne détecte aucune âme perdue.' : 'KANDI senses no lost souls in the maze.')
        : 'KANDI : ' + lost.map(c => `${c.name} (${lang === 'fr' ? 'niveau' : 'floor'} ${c.lostLocation!.level}, E${c.lostLocation!.x} N${c.lostLocation!.y})`).join(' ; '));
      setParty([...party]);
      return;
    }

    if (spell.name === 'MALOR') {
      const malorPrompt = lang === 'fr' 
        ? 'MALOR — déplacement : Nord(+)/Sud(-), Est(+)/Ouest(-), étages vers le bas(+)/haut(-)\nFormat : nord est étages  (ex. 3 -2 0)'
        : 'MALOR Teleportation: North(+)/South(-), East(+)/West(-), Floors down(+)/up(-)\nFormat: north east floors (e.g. 3 -2 0)';
      const input = window.prompt(malorPrompt);
      const parts = (input || '').trim().split(/\s+/).map(Number);
      if (!input || parts.length !== 3 || parts.some(n => !Number.isInteger(n))) {
        setParty([...party]);
        setCampMessage(t.dungeon.spellMalorInvalid);
        return;
      }
      const [dn, de, dl] = parts;
      const tx = x + de;
      const ty = y + dn;
      const tl = maze.level + dl;
      setParty([...party]);
      setShowCamp(false);
      onTakeStairs?.(tl, tx, ty);
      return;
    }

    if (spell.name === 'DUMAPIC') {
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
      setCampMessage(t.dungeon.spellDumapicResult(maze.level, y, x));
      return;
    }

    if (spell.name === 'MILWA') {
      const milwaSteps = 15 + Math.floor(Math.random() * 15);
      setLightLevel?.(milwaSteps);
      setParty([...party]);
      setCampMessage(t.dungeon.lightSpellActive(milwaSteps));
      onAddAdventureEvent?.('DISCOVERY', lang === 'fr' ? 'Sortilège de Lumière' : 'Light Spell', `${activeCampHero.name} cast MILWA.`, 'Light', maze.level, { x, y });
      return;
    }

    if (spell.name === 'LOMILWA') {
      setLightLevel?.(32000);
      setParty([...party]);
      setCampMessage(lang === 'fr' ? `✨ LOMILWA : Une vive clarté magique inonde le donjon !` : `✨ LOMILWA: A radiant magical light floods the dungeon!`);
      onAddAdventureEvent?.('DISCOVERY', lang === 'fr' ? 'Sortilège de Clarté Éternelle' : 'Radiant Light Spell', `${activeCampHero.name} cast LOMILWA.`, 'Permanent Light', maze.level, { x, y });
      return;
    }

    if (spell.name === 'MAPORFIC') {
      setAcModifier?.(prev => prev + 2);
      setParty([...party]);
      setCampMessage(t.dungeon.spellMaporficShield);
      onAddAdventureEvent?.('DISCOVERY', lang === 'fr' ? 'Bouclier Mystique' : 'Mystic Shield', `${activeCampHero.name} cast MAPORFIC.`, '+2 AC', maze.level, { x, y });
      return;
    }

    setParty([...party]);
    setCampMessage(`${spell.name} (${targetHero.name}: ${targetHero.hpLeft}/${targetHero.hpMax} ${t.character.hpShort})!`);
  };

  const handleBishopIdentify = (slotIdx: number) => {
    sounds.playSpellCast();
    const slot = activeCampHero.possessions[slotIdx];
    if (!slot) return;
    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
    if (!itm) return;

    // Bishop performing the ritual: active hero if Bishop, or first living Bishop in party
    const bishop = activeCampHero.class === 'BISHOP'
      ? activeCampHero
      : party.find(h => h.class === 'BISHOP' && h.status === 'OK') || activeCampHero;

    // Authentic Pascal Bishop identification check (Wizardry1_UCSD_Pascal.pas l. 698):
    // (RANDOM MOD 100) < (10 + 5 * bishopLevel)
    const chance = Math.min(95, 10 + (bishop.charLevel || 1) * 5);
    if (Math.random() * 100 < chance) {
      slot.identified = true;
      sounds.playFanfare();
      setCampMessage(t.character.bishopSuccess(bishop.name, itm.name));
    } else {
      // Authentic Pascal curse fumble: (RANDOM MOD 100) < (35 - 3 * bishopLevel)
      const curseChance = Math.max(5, 35 - 3 * (bishop.charLevel || 1));
      if (itm.cursed && Math.random() * 100 < curseChance) {
        slot.identified = true;
        slot.cursed = true;
        slot.equipped = true;
        recalculateCharacterCombatStats(activeCampHero);
        sounds.playBump();
        setCampMessage(t.character.bishopCurseFumble(bishop.name, itm.name));
      } else {
        sounds.playBump();
        setCampMessage(t.character.bishopFail(bishop.name));
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
            <span>{lang === 'en' ? `Lvl ${maze.level}` : `Niv. ${maze.level}`}</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-300 text-[11px] md:text-xs truncate">
            ({x},{y}) · <strong className="text-white">{lang === 'en' ? ['NORTH', 'EAST', 'SOUTH', 'WEST'][direction] : ['NORD', 'EST', 'SUD', 'OUEST'][direction]}</strong>
          </span>
          {sqrType === 'STAIRS' && (
            <span className="bg-amber-950/70 text-amber-300 border border-amber-600/40 px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-[11px] font-bold shrink-0">
              {t.dungeonStairsTag}
            </span>
          )}
        </div>

        {/* Buffs and View toggles */}
        <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
          {isDarkZone ? (
            <div 
              className="flex items-center gap-1 text-purple-300 bg-purple-950/80 border border-purple-500/60 px-2 py-0.5 rounded text-[11px] md:text-xs font-bold animate-pulse" 
              title={t.dungeonDarkZoneTooltip}
            >
              <EyeOff className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span>{t.dungeonDarkZoneTag}</span>
            </div>
          ) : (
            lightLevel > 0 && (
              <div 
                className="flex items-center gap-1 text-amber-300 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded text-[11px] md:text-xs font-bold" 
                title={lightLevel > 25 
                  ? (lang === 'fr' ? "Clarté Divine (LOMILWA actif)" : "Divine Radiance (LOMILWA active)") 
                  : (lang === 'fr' ? "Lumière Magique (MILWA actif)" : "Magical Light (MILWA active)")}
              >
                <Flame className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse text-amber-400" />
                <span className="hidden sm:inline">{lightLevel > 25 ? t.dungeonLomilwaTag : t.dungeonMilwaTag}</span> 
                <span className="font-mono text-amber-200">({lightLevel > 999 ? '∞' : lightLevel})</span>
              </div>
            )
          )}
          {acModifier > 0 && (
            <div 
              className="flex items-center gap-1 text-blue-300 bg-blue-950/70 border border-blue-600/50 px-2 py-0.5 rounded text-[11px] md:text-xs font-bold" 
              title={t.dungeonShieldTooltip}
            >
              <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{t.dungeonShieldMaporfic}</span>
            </div>
          )}

          <button
            onClick={() => { setHudMinimapVisible(prev => !prev); sounds.playTurn(); }}
            className={`flex items-center gap-1 px-2 md:px-2.5 py-1 rounded border text-[11px] font-bold transition ${
              hudMinimapVisible 
                ? 'bg-amber-950 text-amber-300 border-amber-600/50' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title={t.dungeonMapTooltip}
          >
            <Map className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span className="hidden sm:inline">{t.dungeonMapBtn} {hudMinimapVisible ? t.dungeonMapActive : ''}</span>
          </button>

          <button
            onClick={() => { setWireframeMode(!wireframeMode); sounds.playTurn(); }}
            className={`flex items-center gap-1 px-2 md:px-2.5 py-1 rounded border text-[11px] font-bold transition shadow-sm ${
              wireframeMode 
                ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/60 hover:bg-emerald-900/80' 
                : 'bg-amber-950/90 text-amber-300 border-amber-600/60 hover:bg-amber-900/80'
            }`}
            title={t.dungeonRenderTooltip}
          >
            <span className="sm:hidden text-[10px]">{wireframeMode ? t.dungeonRenderShortWireframe : t.dungeonRenderShortStone}</span>
            <span className="hidden sm:inline">{t.dungeonRenderModeLabel} <strong>{wireframeMode ? t.dungeonRenderWireframe : t.dungeonRenderStone}</strong></span>
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
            lang={lang}
          />

          {/* Discreet Music Screener for Dungeon Exploration & Artist Attribution */}
          <MusicScreener lang={lang} />

          {/* Fallen Heroes / Lost Bodies Recovery Box */}
          {fallenHeroesHere.length > 0 && (
            <div className="fixed top-4 left-4 z-[55] max-w-sm bg-red-950/90 border-2 border-red-600/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-red-200">
                <Skull className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                <span className="tracking-wide uppercase">{t.dungeonFallenFoundTitle}</span>
              </div>
              <p className="text-red-200/90 text-[11px] leading-relaxed">
                {t.dungeonFallenFoundDesc}
              </p>
              <div className="space-y-1.5">
                {fallenHeroesHere.map(fallen => (
                  <div key={fallen.id} className="flex items-center justify-between bg-black/60 border border-red-900/60 p-2 rounded-lg gap-2">
                    <div>
                      <span className="font-bold text-white">{fallen.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({fallen.race} {fallen.class} {lang === 'en' ? `Lvl ${fallen.charLevel}` : `Niv.${fallen.charLevel}`})</span>
                    </div>
                    <button
                      onClick={() => handleRecoverBody(fallen.id)}
                      disabled={party.length >= 6}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:opacity-50 text-white font-bold rounded text-[11px] transition shrink-0"
                      title={party.length >= 6 ? t.dungeonPartyFullBtn : t.dungeonRecoverBodyBtn}
                    >
                      {party.length >= 6 ? t.dungeonPartyFullBtn : t.dungeonRecoverBodyBtn}
                    </button>
                  </div>
                ))}
              </div>
              {party.length >= 6 ? (
                <div className="text-[10px] text-amber-400 italic">
                  {t.dungeonPartyFullWarning}
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400">
                  {lang === 'en' 
                    ? `✓ Recovering body takes 1 party slot (${party.length}/6). Bring them to the Temple of Cant!`
                    : `✓ Hisser le corps occupe 1 emplacement dans votre escouade (${party.length}/6). Ramenez-le au Temple de Cant !`}
                </div>
              )}
            </div>
          )}

          {/* Interactive Contextual Floor Strategy Oracle Banner */}
          {showFloorBanner && currentFloorGuide && (
            !isFloorBannerExpanded ? (
              <div className="fixed top-2 sm:top-3 left-1/2 -translate-x-1/2 z-[52] max-w-lg w-[calc(100vw-1.5rem)] bg-slate-950/95 border border-amber-500/80 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-fadeIn flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide truncate">
                      {lang === 'en' ? `Floor ${maze.level} Oracle Guidance` : `Oracle de l'Étage ${maze.level}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsFloorBannerExpanded(true)}
                        className="text-amber-400 hover:text-amber-300 hover:bg-slate-800/80 p-1 rounded transition"
                        title={lang === 'en' ? 'Expand view' : 'Agrandir la fenêtre'}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFloorBannerDismissedForLevel(maze.level)}
                        className="text-slate-400 hover:text-white p-1 rounded transition"
                        title={lang === 'en' ? 'Dismiss' : 'Fermer'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-200 line-clamp-2 mt-1 leading-snug">
                    {guidanceLevel === 'SUBTLE' ? currentFloorGuide.subtleClue : currentFloorGuide.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {onOpenGuide && (
                      <button
                        onClick={() => {
                          onOpenGuide(activeScenarioId, maze.level);
                          setFloorBannerDismissedForLevel(maze.level);
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 text-[11px] font-bold rounded-md transition shadow flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Oracle Guide' : "Guide de l'Oracle"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setFloorBannerDismissedForLevel(maze.level)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-md transition"
                    >
                      {lang === 'en' ? 'Dismiss' : 'Compris'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-[60] max-w-xl sm:max-w-2xl w-[calc(100vw-1.5rem)] max-h-[82vh] bg-slate-950/98 border-2 border-amber-500/90 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-fadeIn">
                {/* Expanded Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/40 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                      <Compass className="w-4 h-4 animate-spin-slow" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide truncate">
                          {lang === 'en' ? `Floor ${maze.level} Oracle Guidance` : `Oracle de l'Étage ${maze.level}`}
                        </span>
                        {currentFloorGuide.recommendedLevel && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-amber-500/30 text-amber-300">
                            {currentFloorGuide.recommendedLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentFloorGuide.title} {currentFloorGuide.subtitle ? `— ${currentFloorGuide.subtitle}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setIsFloorBannerExpanded(false)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                      title={lang === 'en' ? 'Reduce window' : 'Réduire la fenêtre'}
                    >
                      <Minimize2 className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">{lang === 'en' ? 'Minimize' : 'Réduire'}</span>
                    </button>
                    <button
                      onClick={() => setFloorBannerDismissedForLevel(maze.level)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      title={lang === 'en' ? 'Close for this floor' : 'Fermer pour cet étage'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Scrollable Content */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-200 text-xs sm:text-sm leading-relaxed scrollbar-thin">
                  {/* Subtle Clue / Prophetic Whisper */}
                  {currentFloorGuide.subtleClue && (
                    <div className="p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Mystic Oracle Whisper' : 'Murmure Mystique de l\'Oracle'}</span>
                      </div>
                      <p className="italic text-amber-100 font-serif leading-snug">
                        « {currentFloorGuide.subtleClue} »
                      </p>
                    </div>
                  )}

                  {/* Floor Overview / Strategic Summary */}
                  {guidanceLevel !== 'SUBTLE' && currentFloorGuide.summary && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        {lang === 'en' ? 'Strategic Overview' : 'Aperçu & Enjeux de l\'Étage'}
                      </h4>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                        {currentFloorGuide.summary}
                      </p>
                    </div>
                  )}

                  {/* Key Objectives */}
                  {guidanceLevel !== 'SUBTLE' && currentFloorGuide.objectives && currentFloorGuide.objectives.length > 0 && (
                    <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'en' ? 'Floor Objectives' : 'Objectifs Clés'}</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {currentFloorGuide.objectives.map((obj, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 font-bold mt-0.5">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tactical Advice */}
                  {guidanceLevel !== 'SUBTLE' && currentFloorGuide.tacticalAdvice && currentFloorGuide.tacticalAdvice.length > 0 && (
                    <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-sky-400" />
                        <span>{lang === 'en' ? 'Tactical Advice' : 'Conseils Tactiques'}</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {currentFloorGuide.tacticalAdvice.map((tip, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-sky-400 font-bold mt-0.5">▸</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Expanded Footer Actions */}
                <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <button
                    onClick={() => setIsFloorBannerExpanded(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'en' ? 'Reduce' : 'Réduire la fenêtre'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {onOpenGuide && (
                      <button
                        onClick={() => {
                          onOpenGuide(activeScenarioId, maze.level);
                          setFloorBannerDismissedForLevel(maze.level);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition shadow-lg flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Full Strategy Guide' : 'Guide Stratégique de l\'Oracle'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setFloorBannerDismissedForLevel(maze.level)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition"
                    >
                      {lang === 'en' ? 'Dismiss' : 'Fermer'}
                    </button>
                  </div>
                </div>
              </div>
            )
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

          {/* Stairs Detected Floating Banner */}
          {isStairs && stairsTargetLvl !== undefined && (
            <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[55] flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-amber-500/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl backdrop-blur-md max-w-[calc(100vw-1rem)]">
              <Layers className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-amber-300">
                {stairsTargetLvl === 0 
                  ? (lang === 'en' ? 'Stairs leading up to Castle' : 'Escalier montant vers le Château')
                  : stairsTargetLvl > maze.level 
                    ? (lang === 'en' ? `Stairs leading down to Level ${stairsTargetLvl}` : `Escalier descendant vers le Niveau ${stairsTargetLvl}`) 
                    : (lang === 'en' ? `Stairs leading up to Level ${stairsTargetLvl}` : `Escalier montant vers le Niveau ${stairsTargetLvl}`)}
              </span>
              <button
                onClick={handleExecuteTakeStairs}
                className="ml-2 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full text-xs shadow transition active:scale-95 cursor-pointer"
              >
                {lang === 'en' ? 'Take (Y)' : 'Emprunter (Y)'}
              </button>
            </div>
          )}

          {/* Elevator Detected Floating Banner */}
          {isElevator && (
            <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[55] flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-sky-500/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl backdrop-blur-md max-w-[calc(100vw-1rem)]">
              <span className="text-base">🛗</span>
              <span className="text-xs font-bold text-sky-300">
                {lang === 'en' ? `Elevator (Levels ${elevatorMinLvl} - ${elevatorMaxLvl})` : `Ascenseur (Niveaux ${elevatorMinLvl} à ${elevatorMaxLvl})`}
              </span>
              <button
                onClick={() => setShowElevatorModal(true)}
                className="ml-2 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-full text-xs shadow transition active:scale-95 cursor-pointer"
              >
                {lang === 'en' ? 'Use (E)' : 'Actionner (E)'}
              </button>
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
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => { setShowCamp(true); sounds.playTurn(); }}
                className="py-2 px-1 bg-slate-800 active:bg-slate-700 border border-slate-700/60 rounded-lg flex flex-col items-center justify-center text-slate-200 font-semibold transition active:scale-95"
              >
                <Tent className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] truncate mt-0.5">{lang === 'en' ? 'Camp (C)' : 'Camp (C)'}</span>
              </button>

              <button
                onClick={() => { setShowMinimap(true); sounds.playTurn(); }}
                className="py-2 px-1 bg-slate-800 active:bg-slate-700 border border-slate-700/60 rounded-lg flex flex-col items-center justify-center text-slate-200 font-semibold transition active:scale-95"
              >
                <Map className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] truncate mt-0.5">{lang === 'en' ? 'Map (M)' : 'Carte (M)'}</span>
              </button>

              <button
                onClick={onInspectArea}
                className="py-2 px-1 bg-slate-800 active:bg-slate-700 border border-slate-700/60 rounded-lg flex flex-col items-center justify-center text-slate-200 font-semibold transition active:scale-95"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] truncate mt-0.5">{lang === 'en' ? 'Search' : 'Chercher'}</span>
              </button>

              {onOpenGuide && (
                <button
                  onClick={() => { onOpenGuide(activeScenarioId, maze.level); sounds.playTurn(); }}
                  className="py-2 px-1 bg-slate-800 active:bg-slate-700 border border-amber-600/50 rounded-lg flex flex-col items-center justify-center text-amber-300 font-semibold transition active:scale-95"
                  title={lang === 'en' ? 'Floor Guide (H)' : 'Guide / Oracle (H)'}
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] truncate mt-0.5">{lang === 'en' ? 'Guide (H)' : 'Oracle (H)'}</span>
                </button>
              )}
            </div>

            {/* Dynamic Stairs, Elevator or 180 Turnaround button */}
            {isStairs && stairsTargetLvl !== undefined ? (
              <button
                onClick={handleExecuteTakeStairs}
                className="w-full py-2 px-2 bg-gradient-to-r from-amber-600 to-amber-500 active:from-amber-500 active:to-amber-400 text-white rounded-lg text-xs font-black transition shadow flex items-center justify-center gap-1.5 border border-amber-300/40 active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="truncate">
                  {stairsTargetLvl === 0 
                    ? (lang === 'en' ? 'Castle (Y)' : 'Château (Y)') 
                    : stairsTargetLvl > maze.level 
                      ? (lang === 'en' ? `Level ${stairsTargetLvl} ↓` : `Niveau ${stairsTargetLvl} ↓`) 
                      : (lang === 'en' ? `Level ${stairsTargetLvl} ↑` : `Niveau ${stairsTargetLvl} ↑`)}
                </span>
              </button>
            ) : isElevator ? (
              <button
                onClick={() => setShowElevatorModal(true)}
                className="w-full py-2 px-2 bg-gradient-to-r from-sky-600 to-sky-500 active:from-sky-500 active:to-sky-400 text-white rounded-lg text-xs font-black transition shadow flex items-center justify-center gap-1.5 border border-sky-300/40 active:scale-95"
              >
                <span className="text-sm">🛗</span>
                <span className="truncate">
                  {lang === 'en' ? `Elevator (${elevatorMinLvl}-${elevatorMaxLvl})` : `Ascenseur (${elevatorMinLvl}-${elevatorMaxLvl})`}
                </span>
              </button>
            ) : (
              <button
                onClick={() => { onRotate(2); if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10); }}
                className="w-full py-1.5 px-2 bg-slate-800/80 active:bg-slate-700 border border-slate-700/50 rounded-lg text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition"
                title={lang === 'en' ? "Turn around (180°)" : "Faire demi-tour (180°)"}
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>{lang === 'en' ? 'Turnaround 180°' : 'Demi-tour 180°'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Tactical Control Pad (>= md) */}
        <div className="hidden md:flex w-64 md:w-72 bg-slate-900/90 border-l border-slate-800 p-4 flex-col justify-between shrink-0 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'en' ? 'Exploration Controls' : "Commandes d'Exploration"}
              </div>
              {onToggleKeyboardLayout && (
                <button
                  onClick={() => { onToggleKeyboardLayout(); sounds.playTurn(); }}
                  className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-amber-500/40 rounded-lg text-[10px] font-mono font-bold text-amber-300 transition"
                  title={lang === 'en' ? "Toggle movement keyboard layout (AZERTY: Z/Q/D · QWERTY: W/A/D)" : "Changer la disposition du clavier pour les déplacements (AZERTY: Z/Q/D · QWERTY: W/A/D)"}
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
                title={lang === 'en' ? `Move Forward (${forwardKeyLabel} / Up Arrow)` : `Avancer (${forwardKeyLabel} / F / Flèche Haut)`}
              >
                <ArrowUp className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-mono text-amber-300 font-bold mt-0.5">{forwardKeyLabel}</span>
              </button>
              <div />

              <button
                onClick={() => onRotate(3)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex flex-col items-center justify-center transition shadow-sm active:scale-95"
                title={lang === 'en' ? `Turn Left (${leftKeyLabel} / Left Arrow)` : `Pivoter à Gauche (${leftKeyLabel} / L / Flèche Gauche)`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[9px] font-mono text-slate-300 font-bold mt-0.5">{leftKeyLabel}</span>
              </button>
              <button
                onClick={() => onKickDoor()}
                className="p-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95"
                title={lang === 'en' ? "Kick / Open Door (K)" : "Enfoncer / Ouvrir Porte (K)"}
              >
                <DoorClosed className="w-3.5 h-3.5 mb-0.5" />
                {lang === 'en' ? 'Door (K)' : 'Porte (K)'}
              </button>
              <button
                onClick={() => onRotate(1)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex flex-col items-center justify-center transition shadow-sm active:scale-95"
                title={lang === 'en' ? `Turn Right (${rightKeyLabel} / Right Arrow)` : `Pivoter à Droite (${rightKeyLabel} / R / Flèche Droite)`}
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
                <span>{t.dungeon.campBtn}</span>
              </button>

              <button
                onClick={() => { setShowMinimap(true); sounds.playTurn(); }}
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition"
              >
                <Map className="w-4 h-4 text-blue-400" />
                <span>{t.miniMap.viewMapBtn}</span>
              </button>

              <button
                onClick={onInspectArea}
                className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-2 text-slate-200 font-semibold transition"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>{t.dungeon.inspectAreaBtn}</span>
              </button>

              {onOpenGuide && (
                <button
                  onClick={() => { onOpenGuide(activeScenarioId, maze.level); sounds.playTurn(); }}
                  className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-amber-600/40 rounded-lg flex items-center gap-2 text-amber-300 font-semibold transition"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'en' ? 'Oracle Guide (H)' : "Guide de l'Oracle (H)"}</span>
                </button>
              )}
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
                  ? t.dungeon.stairsCastleAction 
                  : stairsTargetLvl > maze.level 
                    ? t.dungeon.stairsDescendAction(stairsTargetLvl) 
                    : t.dungeon.stairsAscendAction(stairsTargetLvl)}
              </span>
            </button>
          )}

          {/* Dynamic Elevator Action Button */}
          {isElevator && (
            <button
              onClick={() => setShowElevatorModal(true)}
              className="w-full p-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white rounded-xl text-xs font-black transition shadow-lg shadow-sky-950/40 flex items-center justify-center gap-2 border border-sky-300/40 active:scale-95 cursor-pointer"
            >
              <span className="text-base">🛗</span>
              <span>
                {t.dungeon.elevatorOperateAction(elevatorMinLvl, elevatorMaxLvl)}
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
                  <span className="truncate text-[11px] md:text-xs">
                    {getCharacterChevrons(hero) ? (
                      <span className="font-mono text-amber-400 font-bold mr-1">"{getCharacterChevrons(hero)}"</span>
                    ) : null}
                    {hero.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] md:text-[10px] text-amber-400 font-mono">N.{hero.charLevel}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCampCharIdx(idx);
                        setShowCharacterSheetModal(true);
                      }}
                      className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded"
                      title="Consulter la fiche complète"
                    >
                      <FileText className="w-3 h-3" />
                    </button>
                  </div>
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
                  {getActiveStatusEffects(hero, lang).map(eff => (
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
                  <h2 className="text-base font-bold text-white">{t.dungeon.campTitle}</h2>
                  <p className="text-[10px] text-slate-400">{lang === 'fr' ? "Gestion de l'escouade, formation et inventaire" : 'Expedition management, formation & inventory'}</p>
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
                  <span>{t.dungeon.campInventoryTab}</span>
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
                  <span>{t.dungeon.campFormationTab}</span>
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
                        {isFront ? (lang === 'fr' ? 'Avant' : 'Front') : (lang === 'fr' ? 'Arrière' : 'Back')}
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
                            {campCharIdx < 3 ? (lang === 'fr' ? `Avant-garde · Rang #${campCharIdx + 1}` : `Front Row · Rank #${campCharIdx + 1}`) : (lang === 'fr' ? `Arrière-garde · Rang #${campCharIdx + 1}` : `Back Row · Rank #${campCharIdx + 1}`)}
                          </span>
                        </div>
                        <div className="text-slate-400 text-xs">
                          {activeCampHero.race} {activeCampHero.class} ({t.character.lvlShort} {activeCampHero.charLevel}) · {t.character.acShort} {activeCampHero.armorClass}
                        </div>
                      </div>

                      {/* Quick reorder buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveHero(campCharIdx, campCharIdx - 1)}
                          disabled={campCharIdx === 0}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 rounded text-slate-300 hover:text-white transition"
                          title={lang === 'fr' ? "Monter d'un rang dans le groupe" : "Move up one rank"}
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveHero(campCharIdx, campCharIdx + 1)}
                          disabled={campCharIdx === party.length - 1}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 rounded text-slate-300 hover:text-white transition"
                          title={lang === 'fr' ? "Descendre d'un rang dans le groupe" : "Move down one rank"}
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCampTab('FORMATION')}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] font-bold text-amber-300 flex items-center gap-1 transition"
                          title={lang === 'fr' ? "Ouvrir le gestionnaire de formation complet" : "Open full formation editor"}
                        >
                          <ArrowUpDown className="w-3 h-3" />
                          <span>{lang === 'fr' ? 'Ordre' : 'Order'}</span>
                        </button>
                        <button
                          onClick={() => setShowCharacterSheetModal(true)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 rounded text-[11px] font-bold text-white flex items-center gap-1 transition shadow-sm"
                          title={lang === 'fr' ? "Consulter la fiche complète du personnage" : "View full character sheet"}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{t.castle.sheetBtn}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {t.castle.healthLabel(activeCampHero.hpLeft, activeCampHero.hpMax)} · {t.castle.goldLabel(activeCampHero.gold)}
                    </div>
                  </div>

                {/* Spells available to cast in Camp */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                      {t.dungeon.campSpellsAvailable}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">{t.dungeon.campTargetLabel}</span>
                      <select
                        value={campTargetIdx}
                        onChange={e => setCampTargetIdx(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 text-amber-300 px-2 py-0.5 rounded text-xs focus:outline-none"
                      >
                        {party.map((p, idx) => (
                          <option key={p.id} value={idx}>
                            {p.name} ({p.hpLeft}/{p.hpMax} HP {p.status !== 'OK' ? `[${p.status}]` : ''}{p.poisonAmount > 0 ? ` [POISON x${p.poisonAmount}]` : ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Silenced / Afflicted check */}
                  {(() => {
                    const castCheck = canHeroCastSpells(activeCampHero, lang);
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
                      <p className="text-slate-500 italic">{t.dungeon.campNoSpellsAvailable}</p>
                    )}
                    {SPELLS.filter(sp => sp.camp && activeCampHero.spellsKnown[sp.id]).map(sp => {
                      const targetHero = party[campTargetIdx] || activeCampHero;
                      const hasSlots = sp.spellType === 'PRIEST' 
                        ? activeCampHero.priestSpells[sp.tier] > 0 
                        : activeCampHero.mageSpells[sp.tier] > 0;
                      const canCast = canHeroCastSpells(activeCampHero, lang).canCast && hasSlots;
                      const slotsCount = sp.spellType === 'PRIEST' 
                        ? activeCampHero.priestSpells[sp.tier] 
                        : activeCampHero.mageSpells[sp.tier];

                      return (
                        <div key={sp.id} className="p-2.5 bg-slate-800/70 border border-slate-700/50 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{sp.name} (T{sp.tier})</span>
                              <span className="text-[10px] text-amber-400">
                                {t.dungeon.campSlotsRemaining(slotsCount)}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">{getSpellDescription(sp, lang)}</div>
                          </div>
                          <button
                            onClick={() => handleCampCastSpell(sp, targetHero)}
                            disabled={!canCast}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition disabled:opacity-30 disabled:pointer-events-none"
                          >
                            {t.dungeon.campCastBtn}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inventory & Equipment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    {t.dungeon.backpackLabel(activeCampHero.possessions.length)}
                  </div>
                  {activeCampHero.possessions.length >= 8 && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      {t.dungeon.backpackFullNotice}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {activeCampHero.possessions.length === 0 && (
                    <p className="text-slate-500 italic py-4 text-center">{t.dungeon.emptyBackpack}</p>
                  )}
                  {activeCampHero.possessions.map((slot, sIdx) => {
                    const itm = ITEMS_DATABASE.find(i => i.id === slot.itemIndex);
                    if (!itm) return null;
                    const isTransferringThis = transferringSlotIdx === sIdx;
                    const isProficient = canClassUseItem(activeCampHero.class, itm);
                    const equippable = isItemEquippable(itm);
                    return (
                      <div key={sIdx} className="p-2.5 bg-slate-800/70 border border-slate-700/50 rounded-lg flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                              <span>{slot.identified ? itm.name : itm.nameUnknown}</span>
                              {slot.equipped && <span className="text-[10px] text-emerald-400 font-bold">[{t.castle.equippedBadge}]</span>}
                              {slot.cursed && <span className="text-[10px] text-red-400 font-bold">[{t.castle.cursedBadge}]</span>}
                              {equippable && !isProficient && <span className="text-[10px] text-rose-400 font-bold">[{t.castle.incompatibleBadge}]</span>}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {itm.objType} {itm.objType === 'WEAPON' && itm.wepHpDam?.level ? `· ${lang === 'fr' ? 'Dégâts' : 'Damage'} ${formatDamageDice(itm.wepHpDam)}` : ''} {itm.armorMod ? `· AC -${itm.armorMod}` : ''}
                            </div>
                            {equippable && (
                              <div className="text-[10px] text-slate-500">
                                {t.castle.classesLabel} <span className={isProficient ? "text-slate-400" : "text-rose-400 font-semibold"}>{getUsableClassesList(itm, true).join(', ') || (lang === 'fr' ? 'Aucune' : 'None')}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {(equippable || slot.equipped) && (
                              <button
                                onClick={() => handleEquipSlot(sIdx)}
                                className={`px-2.5 py-1 ${
                                  slot.equipped
                                    ? 'bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-700/50'
                                    : !isProficient
                                      ? 'bg-slate-800 hover:bg-rose-950/70 text-slate-400 hover:text-rose-200 border border-slate-700'
                                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                                } rounded text-xs font-semibold transition`}
                                title={!slot.equipped && !isProficient ? (lang === 'fr' ? `Incompatible avec ${activeCampHero.class}. Autorisés : ${getUsableClassesList(itm).join(', ')}` : `Incompatible with ${activeCampHero.class}. Allowed: ${getUsableClassesList(itm).join(', ')}`) : undefined}
                              >
                                {slot.equipped ? t.dungeon.unequipBtn : t.dungeon.equipBtn}
                              </button>
                            )}
                            {isItemUsable(itm) && (
                              <button
                                onClick={() => handleCampUseItem(sIdx)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition flex items-center gap-1 shadow-sm"
                                title={lang === 'fr' ? "Utiliser / Boire / Invoquer cet objet" : "Use / Drink / Invoke this item"}
                              >
                                <FlaskConical className="w-3 h-3 text-emerald-200" />
                                <span>{t.dungeon.useBtn}</span>
                              </button>
                            )}
                            {(() => {
                              const bishopInParty = party.find(h => h.class === 'BISHOP' && h.status === 'OK');
                              if (!slot.identified && bishopInParty) {
                                return (
                                  <button
                                    onClick={() => handleBishopIdentify(sIdx)}
                                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-semibold transition flex items-center gap-1 shadow-sm active:scale-95"
                                    title={lang === 'fr' ? `Faire expertiser et identifier par ${bishopInParty.name} (${bishopInParty.class} Niv. ${bishopInParty.charLevel})` : `Have evaluated and identified by ${bishopInParty.name} (${bishopInParty.class} Lvl. ${bishopInParty.charLevel})`}
                                  >
                                    <Sparkles className="w-3 h-3 text-purple-200" />
                                    <span>{t.dungeon.identifyBishopBtn(activeCampHero.id !== bishopInParty.id ? bishopInParty.name : bishopInParty.class)}</span>
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            {party.length > 1 && (
                              <button
                                onClick={() => setTransferringSlotIdx(isTransferringThis ? null : sIdx)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                                  isTransferringThis 
                                    ? 'bg-amber-600 text-white shadow-sm' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/30'
                                }`}
                                title={lang === 'fr' ? "Donner cet objet à un autre compagnon" : "Give this item to a party member"}
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>{t.dungeon.giveBtn}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleCampDropItem(sIdx)}
                              className="px-2 py-1 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-700/50 rounded text-xs font-semibold transition flex items-center gap-1 shadow-sm active:scale-95"
                              title={lang === 'fr' ? "Jeter définitivement cet objet avec confirmation" : "Discard this item permanently with confirmation"}
                            >
                              <Trash2 className="w-3 h-3 text-slate-400" />
                              <span>{t.dungeon.dropBtn}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline transfer recipient selection */}
                        {isTransferringThis && (
                          <div className="pt-2 border-t border-slate-700/50 bg-slate-900/80 p-2.5 rounded-lg space-y-1.5 animate-fadeIn">
                            <div className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                              <span className="flex items-center gap-1 text-amber-400">
                                <Package className="w-3.5 h-3.5" />
                                {t.dungeon.giveTargetSelectPrompt}
                              </span>
                              <button 
                                onClick={() => setTransferringSlotIdx(null)}
                                className="text-slate-400 hover:text-white text-[10px] underline"
                              >
                                {t.common.cancel}
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
                                    title={isFull ? (lang === 'fr' ? 'Inventaire de ce héros plein (8/8)' : 'Hero inventory is full (8/8)') : isCursedEquipped ? (lang === 'fr' ? 'Impossible de transférer un objet maudit équipé' : 'Cannot give away an equipped cursed item') : `${t.dungeon.giveBtn} -> ${target.name}`}
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
                    <span>{lang === 'fr' ? "Règles Pascal de Wizardry I : Disposition Tactique du Groupe" : "Pascal Wizardry I Rules: Tactical Party Formation"}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lang === 'fr'
                      ? "Seuls les 3 premiers personnages (l'Avant-garde) peuvent porter des attaques physiques au corps-à-corps et subir les assauts physiques directs des monstres. Les personnages 4, 5 et 6 (l'Arrière-garde) sont protégés des coups de mêlée et combattent par leurs sorts, objets ou compétences."
                      : "Only the first 3 characters (Front Row) can make physical melee attacks and take direct melee hits from monsters. Characters 4, 5, and 6 (Back Row) are protected from melee attacks and fight with spells, items, or skills."}
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
                          <div className="font-bold text-sm text-amber-300">{lang === 'fr' ? "AVANT-GARDE (Ligne de Front)" : "FRONT ROW (Vanguard)"}</div>
                          <div className="text-[11px] text-slate-400">{lang === 'fr' ? "Rangs #1 à #3 · Attaquent et encaissent en mêlée" : "Ranks #1 to #3 · Attack and take melee hits"}</div>
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
                                    {lang === 'fr' ? `Niv.${hero.charLevel}` : `Lvl.${hero.charLevel}`} · AC {hero.armorClass} · {hero.hpLeft}/{hero.hpMax} HP
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
                                  title={lang === 'fr' ? "Monter d'un rang" : "Move up one rank"}
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, actualIdx + 1)}
                                  disabled={actualIdx === party.length - 1}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white rounded text-xs transition"
                                  title={lang === 'fr' ? "Descendre d'un rang" : "Move down one rank"}
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>
                                {party.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveHero(actualIdx, Math.min(party.length - 1, 3))}
                                    className="px-2 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 rounded text-[11px] font-semibold transition"
                                    title={lang === 'fr' ? "Placer en arrière-garde" : "Place in back row"}
                                  >
                                    {lang === 'fr' ? "Arrière ⏩" : "Rear ⏩"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Swap selector */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[11px]">
                              <span className="text-slate-400">{lang === 'fr' ? "Échanger avec :" : "Swap with:"}</span>
                              <select
                                onChange={e => {
                                  const targetIdx = Number(e.target.value);
                                  if (!isNaN(targetIdx)) handleSwapHeroes(actualIdx, targetIdx);
                                }}
                                value=""
                                className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-0.5 text-xs focus:outline-none"
                              >
                                <option value="" disabled>{lang === 'fr' ? "Choisir un compagnon..." : "Select companion..."}</option>
                                {party.map((p, pIdx) => {
                                  if (pIdx === actualIdx) return null;
                                  return (
                                    <option key={p.id} value={pIdx}>
                                      #{pIdx + 1} {p.name} ({p.class} · {pIdx < 3 ? (lang === 'fr' ? 'Avant' : 'Front') : (lang === 'fr' ? 'Arrière' : 'Rear')})
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
                          <div className="font-bold text-sm text-blue-300">{lang === 'fr' ? "ARRIÈRE-GARDE (Second Rang)" : "BACK ROW (Rearguard)"}</div>
                          <div className="text-[11px] text-slate-400">{lang === 'fr' ? "Rangs #4 à #6 · Protégés de la mêlée physique" : "Ranks #4 to #6 · Protected from melee hits"}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {Math.max(0, party.length - 3)}/3
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {party.length <= 3 && (
                        <div className="p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                          {lang === 'fr' ? "Aucun héros en arrière-garde. Tous vos aventuriers sont au front !" : "No adventurers in back row. All party members are at the front!"}
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
                                    {lang === 'fr' ? `Niv.${hero.charLevel}` : `Lvl.${hero.charLevel}`} · AC {hero.armorClass} · {hero.hpLeft}/{hero.hpMax} HP
                                  </div>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, actualIdx - 1)}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs transition"
                                  title={lang === 'fr' ? "Monter d'un rang" : "Move up one rank"}
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, actualIdx + 1)}
                                  disabled={actualIdx === party.length - 1}
                                  className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white rounded text-xs transition"
                                  title={lang === 'fr' ? "Descendre d'un rang" : "Move down one rank"}
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveHero(actualIdx, 0)}
                                  className="px-2 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 rounded text-[11px] font-semibold transition"
                                  title={lang === 'fr' ? "Placer en tête de ligne (Avant-garde)" : "Place at the front (Vanguard)"}
                                >
                                  {lang === 'fr' ? "⏪ Avant" : "⏪ Front"}
                                </button>
                              </div>
                            </div>

                            {/* Swap selector */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[11px]">
                              <span className="text-slate-400">{lang === 'fr' ? "Échanger avec :" : "Swap with:"}</span>
                              <select
                                onChange={e => {
                                  const targetIdx = Number(e.target.value);
                                  if (!isNaN(targetIdx)) handleSwapHeroes(actualIdx, targetIdx);
                                }}
                                value=""
                                className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-2 py-0.5 text-xs focus:outline-none"
                              >
                                <option value="" disabled>{lang === 'fr' ? "Choisir un compagnon..." : "Select companion..."}</option>
                                {party.map((p, pIdx) => {
                                  if (pIdx === actualIdx) return null;
                                  return (
                                    <option key={p.id} value={pIdx}>
                                      #{pIdx + 1} {p.name} ({p.class} · {pIdx < 3 ? (lang === 'fr' ? 'Avant' : 'Front') : (lang === 'fr' ? 'Arrière' : 'Rear')})
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
      {showMinimap && !showCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 sm:bg-black/90 backdrop-blur-md p-0 sm:p-3 md:p-6 overflow-y-auto safe-top safe-bottom safe-left safe-right animate-fadeIn">
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
            onMoveForward={() => tryMoveForward(false)}
            onTurnLeft={() => onRotate(3)}
            onTurnRight={() => onRotate(1)}
            onTurnAround={() => onRotate(2)}
            onKickDoor={onKickDoor}
            onInspectArea={onInspectArea}
          />
        </div>
      )}

      {/* ELEVATOR SELECTION MODAL (Always in foreground z-[65], above minimap and 3D view) */}
      {showElevatorModal && isElevator && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-sky-500/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-sky-950/80 border-2 border-sky-400 flex items-center justify-center text-sky-400 text-2xl shadow-lg shadow-sky-950/60">
              🛗
            </div>
            <h3 className="text-lg font-black text-sky-300 tracking-wide">
              {t.dungeon.elevatorTitle(elevatorMinLvl, elevatorMaxLvl)}
            </h3>
            <p className="text-xs text-slate-300">
              {t.dungeon.elevatorSelectPrompt(maze.level)}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {Array.from({ length: elevatorMaxLvl - elevatorMinLvl + 1 }, (_, i) => elevatorMinLvl + i).map(lvl => (
                <button
                  key={lvl}
                  disabled={lvl === maze.level}
                  onClick={() => {
                    setShowElevatorModal(false);
                    lastPromptedPos.current = `${x},${y},${lvl}`;
                    if (onTakeStairs) onTakeStairs(lvl, x, y);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer ${
                    lvl === maze.level
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/50 active:scale-95 shadow-md shadow-sky-950/50'
                  }`}
                >
                  {lang === 'en' ? `Floor ${lvl}` : `Niveau ${lvl}`} {lvl === maze.level ? t.dungeon.elevatorCurrentFloor : `[${lvl}]`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowElevatorModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer"
            >
              {t.dungeon.cancelBtn}
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE STAIRS CONFIRMATION MODAL (Always in foreground z-[65], above minimap and 3D view) */}
      {showStairsPrompt && isStairs && stairsTargetLvl !== undefined && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/60">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-amber-300 tracking-wide">
              {stairsTargetLvl === 0 
                ? t.dungeon.stairsCastle
                : stairsTargetLvl > maze.level 
                  ? t.dungeon.stairsDown(stairsTargetLvl)
                  : t.dungeon.stairsUp(stairsTargetLvl)}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {stairsTargetLvl === 0
                ? t.dungeon.stairsCastleDesc
                : stairsTargetLvl > maze.level
                  ? t.dungeon.stairsDownDesc(stairsTargetLvl)
                  : t.dungeon.stairsUpDesc(stairsTargetLvl)}
            </p>
            <div className="text-amber-200/90 font-bold text-xs pt-1">
              {lang === 'en' ? "Do you wish to take these stairs?" : "Voulez-vous emprunter cet escalier ?"}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleExecuteTakeStairs}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-black shadow-lg transition active:scale-95 cursor-pointer"
              >
                {stairsTargetLvl === 0 
                  ? t.dungeon.stairsCastleAction
                  : stairsTargetLvl > maze.level 
                    ? t.dungeon.stairsDescendAction(stairsTargetLvl) 
                    : t.dungeon.stairsAscendAction(stairsTargetLvl)}
              </button>
              <button
                onClick={() => setShowStairsPrompt(false)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                {t.dungeon.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL CHARACTER SHEET MODAL */}
      {showCharacterSheetModal && party[campCharIdx] && (
        <CharacterSheetModal
          character={party[campCharIdx]}
          party={party}
          currentIndex={campCharIdx}
          onSelectCharacter={idx => setCampCharIdx(idx)}
          onClose={() => setShowCharacterSheetModal(false)}
          onUpdateCharacter={updated => {
            setParty(prev => prev.map(p => p.id === updated.id ? updated : p));
          }}
        />
      )}
    </div>
  );
};

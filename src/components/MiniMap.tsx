import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TMazeFloor, TWall } from '../types/wizardry';
import { 
  Compass, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  HelpCircle, 
  MapPin, 
  Navigation,
  Layers,
  X
} from 'lucide-react';

export interface MiniMapPrefs {
  hudViewMode: 'radar' | 'full';
  modalViewMode: 'radar' | 'full';
  revealAll: boolean;
  hudShowLegend: boolean;
  modalShowLegend: boolean;
  hudVisible: boolean;
  wireframeMode: boolean;
  allowCheatMode: boolean;
  modalEnlarged: boolean;
}

const DEFAULT_MINIMAP_PREFS: MiniMapPrefs = {
  hudViewMode: 'radar',
  modalViewMode: 'full',
  revealAll: false,
  hudShowLegend: false,
  modalShowLegend: true,
  hudVisible: true,
  wireframeMode: false,
  allowCheatMode: true,
  modalEnlarged: false
};

export function loadMiniMapPrefs(): MiniMapPrefs {
  if (typeof window === 'undefined') return DEFAULT_MINIMAP_PREFS;
  try {
    const raw = localStorage.getItem('wiz_minimap_prefs');
    if (raw) {
      return { ...DEFAULT_MINIMAP_PREFS, ...JSON.parse(raw) };
    }
  } catch { /* ignore */ }
  return DEFAULT_MINIMAP_PREFS;
}

export function saveMiniMapPrefs(patch: Partial<MiniMapPrefs>): void {
  if (typeof window === 'undefined') return;
  try {
    const next = { ...loadMiniMapPrefs(), ...patch };
    localStorage.setItem('wiz_minimap_prefs', JSON.stringify(next));
  } catch { /* ignore */ }
}

export interface MiniMapProps {
  maze: TMazeFloor;
  x: number;
  y: number;
  direction: number; // 0: N, 1: E, 2: S, 3: W
  visitedTiles: boolean[][];
  variant?: 'hud' | 'modal' | 'sidebar';
  fallenMarkers?: Array<{ x: number; y: number; name: string }>;
  keyboardLayout?: 'AZERTY' | 'QWERTY';
  onClose?: () => void;
  onExpand?: () => void;
  onMoveForward?: () => void;
  onTurnLeft?: () => void;
  onTurnRight?: () => void;
  onTurnAround?: () => void;
  onKickDoor?: () => void;
  onInspectArea?: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  maze,
  x,
  y,
  direction,
  visitedTiles,
  variant = 'hud',
  fallenMarkers = [],
  keyboardLayout = 'AZERTY',
  onClose,
  onExpand,
  onMoveForward,
  onTurnLeft,
  onTurnRight,
  onTurnAround,
  onKickDoor,
  onInspectArea
}) => {
  // Persistent Mode: 'radar' (7x7 local area around player) or 'full' (20x20 floor grid)
  const [viewMode, setViewMode] = useState<'radar' | 'full'>(() => {
    const prefs = loadMiniMapPrefs();
    return variant === 'modal' ? prefs.modalViewMode : prefs.hudViewMode;
  });
  const [allowCheatMode, setAllowCheatMode] = useState<boolean>(() => loadMiniMapPrefs().allowCheatMode ?? true);
  const [revealAll, setRevealAll] = useState<boolean>(() => {
    const prefs = loadMiniMapPrefs();
    return (prefs.allowCheatMode ?? true) ? prefs.revealAll : false;
  });
  const [showLegend, setShowLegend] = useState<boolean>(() => {
    const prefs = loadMiniMapPrefs();
    return variant === 'modal' ? prefs.modalShowLegend : prefs.hudShowLegend;
  });

  useEffect(() => {
    if (variant === 'modal') {
      saveMiniMapPrefs({ modalViewMode: viewMode, revealAll, modalShowLegend: showLegend, allowCheatMode });
    } else {
      saveMiniMapPrefs({ hudViewMode: viewMode, revealAll, hudShowLegend: showLegend, allowCheatMode });
    }
  }, [variant, viewMode, revealAll, showLegend, allowCheatMode]);

  // Touch / swipe handling for direct exploration on mobile & touchscreens
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    const minSwipeDistance = 30;
    if (Math.abs(dx) > minSwipeDistance || Math.abs(dy) > minSwipeDistance) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          onTurnRight?.();
        } else {
          onTurnLeft?.();
        }
      } else {
        if (dy < 0) {
          onMoveForward?.();
        } else {
          onTurnAround?.();
        }
      }
    } else if (dt < 300 && Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      // Direct tap navigation on the map viewport
      const target = e.currentTarget.getBoundingClientRect();
      const relX = (touch.clientX - target.left) / target.width;
      const relY = (touch.clientY - target.top) / target.height;
      if (relY < 0.35) {
        onMoveForward?.();
      } else if (relX < 0.35) {
        onTurnLeft?.();
      } else if (relX > 0.65) {
        onTurnRight?.();
      } else {
        onTurnAround?.();
      }
    }
  };

  const dirNames = ['NORD', 'EST', 'SUD', 'OUEST'];
  const dirAngles = [0, 90, 180, 270];

  // Radar bounds (7x7 around player)
  const radarRadius = 3;
  const radarMinX = x - radarRadius;
  const radarMaxX = x + radarRadius;
  const radarMinY = y - radarRadius;
  const radarMaxY = y + radarRadius;

  // Determine size & dimensions based on variant & mode
  const { cellSize, svgWidth, svgHeight, startX, endX, startY, endY, cols, rows } = useMemo(() => {
    if (viewMode === 'radar') {
      const size = variant === 'modal' ? 36 : 30;
      const count = radarRadius * 2 + 1; // 7
      return {
        cellSize: size,
        svgWidth: count * size,
        svgHeight: count * size,
        startX: radarMinX,
        endX: radarMaxX,
        startY: radarMinY,
        endY: radarMaxY,
        cols: count,
        rows: count
      };
    } else {
      // Full 20x20
      const size = variant === 'modal' ? 18 : 11;
      return {
        cellSize: size,
        svgWidth: 20 * size,
        svgHeight: 20 * size,
        startX: 0,
        endX: 19,
        startY: 0,
        endY: 19,
        cols: 20,
        rows: 20
      };
    }
  }, [viewMode, variant, radarMinX, radarMaxX, radarMinY, radarMaxY]);

  // Helper to safely get wall/door state accounting for 20x20 boundaries
  const getCellData = (cx: number, cy: number) => {
    if (cx < 0 || cx >= 20 || cy < 0 || cy >= 20) {
      return {
        isValid: false,
        isVisited: false,
        north: 'WALL' as TWall,
        south: 'WALL' as TWall,
        east: 'WALL' as TWall,
        west: 'WALL' as TWall,
        oppNorth: 'WALL' as TWall,
        oppSouth: 'WALL' as TWall,
        oppEast: 'WALL' as TWall,
        oppWest: 'WALL' as TWall,
        specialType: 'NORMAL',
        description: '',
        aux0: undefined as number | undefined,
        aux1: undefined as number | undefined,
        aux2: undefined as number | undefined
      };
    }

    const isVisited = visitedTiles[cx]?.[cy] || revealAll;
    const isNorthVisited = visitedTiles[cx]?.[(cy + 1) % 20] || revealAll;
    const isSouthVisited = visitedTiles[cx]?.[(cy - 1 + 20) % 20] || revealAll;
    const isEastVisited = visitedTiles[(cx + 1) % 20]?.[cy] || revealAll;
    const isWestVisited = visitedTiles[(cx - 1 + 20) % 20]?.[cy] || revealAll;
    const sqrCode = maze.sqrExtra?.[cx]?.[cy] || 0;
    const specialDef = maze.extraDefs?.[sqrCode];
    const eventDef = maze.events?.find(ev => ev.x === cx && ev.y === cy);

    let specialType = specialDef?.type && specialDef.type !== 'NORMAL' ? specialDef.type : 'NORMAL';
    if (eventDef?.type && eventDef.type !== 'NORMAL') {
      specialType = eventDef.type;
    }
    const aux0 = eventDef?.aux0 ?? specialDef?.aux0;
    const aux1 = eventDef?.aux1 ?? specialDef?.aux1;
    const aux2 = eventDef?.aux2 ?? specialDef?.aux2;
    const description = eventDef?.description || '';

    return {
      isValid: true,
      isVisited,
      isNorthVisited,
      isSouthVisited,
      isEastVisited,
      isWestVisited,
      north: maze.n[cx][cy],
      south: maze.s[cx][cy],
      east: maze.e[cx][cy],
      west: maze.w[cx][cy],
      oppNorth: maze.s[cx]?.[(cy + 1) % 20] || ('WALL' as TWall),
      oppSouth: maze.n[cx]?.[(cy - 1 + 20) % 20] || ('WALL' as TWall),
      oppEast: maze.w[(cx + 1) % 20]?.[cy] || ('WALL' as TWall),
      oppWest: maze.e[(cx - 1 + 20) % 20]?.[cy] || ('WALL' as TWall),
      specialType,
      aux0,
      aux1,
      aux2,
      description
    };
  };

  // Build grid cells to render
  const gridCells = useMemo(() => {
    const list = [];
    for (let gy = rows - 1; gy >= 0; gy--) {
      // In Wizardry: cy is mapped so North (high Y) is on top
      const cy = viewMode === 'radar' ? radarMinY + gy : gy;
      const rowSvgY = (rows - 1 - gy) * cellSize;

      for (let gx = 0; gx < cols; gx++) {
        const cx = viewMode === 'radar' ? radarMinX + gx : gx;
        const colSvgX = gx * cellSize;
        const data = getCellData(cx, cy);
        const isPlayer = cx === x && cy === y;

        list.push({
          gx,
          gy,
          cx,
          cy,
          svgX: colSvgX,
          svgY: rowSvgY,
          isPlayer,
          ...data
        });
      }
    }
    return list;
  }, [rows, cols, cellSize, viewMode, radarMinX, radarMinY, x, y, visitedTiles, revealAll, maze]);

  // Center of player marker in SVG coords
  const playerSvgPos = useMemo(() => {
    if (viewMode === 'radar') {
      const gx = x - radarMinX;
      const gy = y - radarMinY;
      const svgX = gx * cellSize + cellSize / 2;
      const svgY = (rows - 1 - gy) * cellSize + cellSize / 2;
      return { svgX, svgY };
    } else {
      const svgX = x * cellSize + cellSize / 2;
      const svgY = (19 - y) * cellSize + cellSize / 2;
      return { svgX, svgY };
    }
  }, [viewMode, x, y, radarMinX, radarMinY, cellSize, rows]);

  // Gather all one-way directional arrows in a dedicated collection for top-layer rendering
  const oneWayArrows = useMemo(() => {
    const arrows: Array<{
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      headPoints: string;
    }> = [];

    const shaftLen = Math.max(3.2, cellSize * 0.32);
    const headLen = Math.max(2.4, cellSize * 0.20);
    const headHalfWidth = Math.max(1.8, cellSize * 0.15);

    for (const cell of gridCells) {
      if (!cell.isValid || !cell.isVisited) continue;
      const { 
        svgX, svgY, cx, cy, 
        north, south, east, west, 
        oppNorth, oppSouth, oppEast, oppWest, 
        isNorthVisited, isSouthVisited, isEastVisited, isWestVisited 
      } = cell;

      const isNorthSecretDiscovered = (north === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},0`]) && (isNorthVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},0`]);
      const isSouthSecretDiscovered = (south === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},2`]) && (isSouthVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},2`]);
      const isEastSecretDiscovered = (east === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},1`]) && (isEastVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},1`]);
      const isWestSecretDiscovered = (west === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},3`]) && (isWestVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},3`]);

      const xMid = svgX + cellSize / 2;
      const yMid = svgY + cellSize / 2;

      // North one-way door (traversing upward)
      if ((north === 'DOOR' || isNorthSecretDiscovered) && oppNorth === 'WALL') {
        const tipY = svgY - shaftLen * 0.8;
        const startY = svgY + shaftLen * 0.5;
        arrows.push({
          key: `arrow-n-${cx}-${cy}`,
          x1: xMid,
          y1: startY,
          x2: xMid,
          y2: tipY + headLen * 0.5,
          headPoints: `${xMid},${tipY} ${xMid - headHalfWidth},${tipY + headLen} ${xMid + headHalfWidth},${tipY + headLen}`
        });
      }

      // South one-way door (traversing downward)
      if ((south === 'DOOR' || isSouthSecretDiscovered) && oppSouth === 'WALL') {
        const tipY = svgY + cellSize + shaftLen * 0.8;
        const startY = svgY + cellSize - shaftLen * 0.5;
        arrows.push({
          key: `arrow-s-${cx}-${cy}`,
          x1: xMid,
          y1: startY,
          x2: xMid,
          y2: tipY - headLen * 0.5,
          headPoints: `${xMid},${tipY} ${xMid - headHalfWidth},${tipY - headLen} ${xMid + headHalfWidth},${tipY - headLen}`
        });
      }

      // East one-way door (traversing rightward)
      if ((east === 'DOOR' || isEastSecretDiscovered) && oppEast === 'WALL') {
        const tipX = svgX + cellSize + shaftLen * 0.8;
        const startX = svgX + cellSize - shaftLen * 0.5;
        arrows.push({
          key: `arrow-e-${cx}-${cy}`,
          x1: startX,
          y1: yMid,
          x2: tipX - headLen * 0.5,
          y2: yMid,
          headPoints: `${tipX},${yMid} ${tipX - headLen},${yMid - headHalfWidth} ${tipX - headLen},${yMid + headHalfWidth}`
        });
      }

      // West one-way door (traversing leftward)
      if ((west === 'DOOR' || isWestSecretDiscovered) && oppWest === 'WALL') {
        const tipX = svgX - shaftLen * 0.8;
        const startX = svgX + shaftLen * 0.5;
        arrows.push({
          key: `arrow-w-${cx}-${cy}`,
          x1: startX,
          y1: yMid,
          x2: tipX + headLen * 0.5,
          y2: yMid,
          headPoints: `${tipX},${yMid} ${tipX + headLen},${yMid - headHalfWidth} ${tipX + headLen},${yMid + headHalfWidth}`
        });
      }
    }

    return arrows;
  }, [gridCells, cellSize, maze, revealAll]);

  // ViewBox padding to prevent any edge clipping for toroidal perimeter doors and arrows
  const svgPad = viewMode === 'radar' ? (variant === 'modal' ? 10 : 8) : (variant === 'modal' ? 7 : 6);
  const totalSvgWidth = svgWidth + svgPad * 2;
  const totalSvgHeight = svgHeight + svgPad * 2;

  return (
    <div className={`select-none transition-all flex flex-col ${
      variant === 'modal' 
        ? 'bg-slate-900 border border-slate-700 rounded-xl sm:rounded-2xl shadow-2xl p-2.5 sm:p-5 max-w-lg w-full max-h-[92vh] overflow-y-auto safe-top safe-bottom' 
        : variant === 'sidebar'
        ? 'bg-slate-950/80 border border-slate-800 rounded-xl p-2 sm:p-3'
        : 'bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl p-2 sm:p-3 w-[260px] sm:w-[280px]'
    }`}>
      {/* Header bar: Level & Actions */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/50 font-mono shrink-0">
            Niveau {maze.level}
          </span>
          {revealAll && (
            <span className="text-[9px] text-purple-300 bg-purple-950/90 px-1.5 py-0.5 rounded border border-purple-500/80 font-mono font-bold shrink-0 tracking-wider" title="Mode Test / Triche actif : Carte complète dévoilée">
              TEST / TRICHE
            </span>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Radar / Full Floor Mode Toggle */}
          <button
            onClick={() => setViewMode(prev => prev === 'radar' ? 'full' : 'radar')}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-mono font-bold border border-slate-700 transition active:scale-95"
            title={viewMode === 'radar' ? 'Passer en vue globale (20×20)' : 'Passer en zoom radar (7×7)'}
          >
            {viewMode === 'radar' ? '20×20' : '7×7'}
          </button>

          {/* Test / Cheat Reveal mode toggle (for functional testing) */}
          {allowCheatMode && (
            <button
              onClick={() => setRevealAll(prev => !prev)}
              className={`p-1 rounded text-xs border transition active:scale-95 ${
                revealAll 
                  ? 'bg-purple-900/70 text-purple-200 border-purple-400 shadow-sm shadow-purple-950' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={revealAll 
                ? 'Désactiver le mode test (afficher uniquement les zones explorées)' 
                : 'Mode Test / Triche : Révéler toute la carte du niveau pour tests fonctionnels'}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Legend Toggle */}
          <button
            onClick={() => setShowLegend(prev => !prev)}
            className={`p-1 rounded text-xs border transition active:scale-95 ${
              showLegend 
                ? 'bg-amber-950/60 text-amber-400 border-amber-600/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Afficher/masquer la légende des symboles"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Expand to Modal */}
          {variant === 'hud' && onExpand && (
            <button
              onClick={onExpand}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition active:scale-95"
              title="Agrandir en plein écran (M)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition active:scale-95"
              title="Fermer la minicarte"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Position & Orientation Status Strip with Compass (Outside the map to never obstruct tiles or be truncated) */}
      <div className="flex items-center justify-between px-2 py-1 bg-slate-900/90 border border-slate-800/90 rounded-lg text-xs font-mono mb-1.5 shadow-inner">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Pos :</span>
          <span className="text-xs font-bold text-amber-300 font-mono bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
            ({x}, {y})
          </span>
          <span className="text-[11px] font-bold text-white font-mono truncate">
            {dirNames[direction]}
          </span>
        </div>

        {/* Orientation Compass Rose (N / O / E / S) */}
        <div className="bg-slate-950/90 border border-slate-800/90 px-1.5 py-0.5 rounded text-[8px] font-mono flex flex-col items-center leading-none select-none shrink-0" title={`Orientation : ${dirNames[direction]}`}>
          <span className={direction === 0 ? 'text-amber-400 font-bold' : 'text-slate-600'}>N</span>
          <div className="flex gap-2.5 my-0.5">
            <span className={direction === 3 ? 'text-amber-400 font-bold' : 'text-slate-600'}>O</span>
            <span className={direction === 1 ? 'text-amber-400 font-bold' : 'text-slate-600'}>E</span>
          </div>
          <span className={direction === 2 ? 'text-amber-400 font-bold' : 'text-slate-600'}>S</span>
        </div>
      </div>

      {/* Map Viewport Area */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex flex-col items-center justify-center overflow-hidden bg-slate-950 rounded-lg p-1.5 sm:p-2 border border-slate-800/80 relative w-full cursor-pointer select-none touch-manipulation"
        title={variant === 'modal' ? 'Glisser ou cliquer sur la carte pour explorer' : undefined}
      >
        <svg
          viewBox={`-${svgPad} -${svgPad} ${totalSvgWidth} ${totalSvgHeight}`}
          width={totalSvgWidth}
          height={totalSvgHeight}
          className="max-w-full h-auto aspect-square overflow-visible"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Defs: gradients & patterns */}
          <defs>
            {/* Sight Frustum / Field of View Cone Gradient */}
            <radialGradient id="viewFrustum" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </radialGradient>
            
            {/* Explored floor subtle grid */}
            <pattern id="gridPattern" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
              <rect width={cellSize} height={cellSize} fill="#0b1120" />
              <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect x={-svgPad} y={-svgPad} width={totalSvgWidth} height={totalSvgHeight} fill="url(#gridPattern)" />

          {/* 1. Cell Floor Fills & Special Symbols */}
          {gridCells.map((cell) => {
            const { svgX, svgY, isVisited, isValid, specialType, cx, cy, aux0, description } = cell;

            if (!isValid) {
              // Outside dungeon boundaries
              return (
                <rect
                  key={`out-${cx}-${cy}`}
                  x={svgX}
                  y={svgY}
                  width={cellSize}
                  height={cellSize}
                  fill="#030712"
                />
              );
            }

            if (!isVisited) {
              // Fog of War: Unexplored
              return (
                <rect
                  key={`fog-${cx}-${cy}`}
                  x={svgX}
                  y={svgY}
                  width={cellSize}
                  height={cellSize}
                  fill="#050811"
                  stroke="#0f172a"
                  strokeWidth="0.5"
                />
              );
            }

            // Explored tile
            let specialFill = '#0f172a';
            let tileBorder = '#1e293b';
            let tileBorderWidth = 0.5;
            let tooltip = '';

            if (specialType === 'TRANSFER') {
              specialFill = '#6b21a8';
              tileBorder = '#d8b4fe';
              tileBorderWidth = 1;
              tooltip = `⚡ Téléporteur (${cx}, ${cy})`;
            } else if (specialType === 'BUTTONZ') {
              specialFill = '#0369a1';
              tileBorder = '#7dd3fc';
              tileBorderWidth = 1;
              tooltip = `🛗 Ascenseur (${cx}, ${cy})`;
            } else if (specialType === 'CHUTE') {
              specialFill = '#b91c1c';
              tileBorder = '#fca5a5';
              tileBorderWidth = 1;
              tooltip = `⤓ Chute / Trappe (${cx}, ${cy})`;
            } else if (specialType === 'STAIRS') {
              const isUp = aux0 !== undefined && (aux0 < maze.level || aux0 === 0);
              specialFill = isUp ? '#065f46' : '#854d0e';
              tileBorder = isUp ? '#34d399' : '#fde047';
              tileBorderWidth = 1;
              tooltip = aux0 === 0 
                ? `▲ Escalier vers Château (${cx}, ${cy})` 
                : isUp 
                  ? `▲ Escalier montant vers Niveau ${aux0} (${cx}, ${cy})` 
                  : `▼ Escalier descendant vers Niveau ${aux0} (${cx}, ${cy})`;
            } else if (specialType === 'PIT') {
              specialFill = '#881337';
              tileBorder = '#f43f5e';
              tileBorderWidth = 1;
              tooltip = `☠ Fossepiège (${cx}, ${cy})`;
            } else if (specialType === 'SPINNER') {
              specialFill = '#0e7490';
              tileBorder = '#22d3ee';
              tooltip = `↻ Spinner (${cx}, ${cy})`;
            } else if (specialType === 'DARK') {
              specialFill = '#1e1b4b';
              tileBorder = '#6366f1';
              tooltip = `● Zone de Ténèbres (${cx}, ${cy})`;
            } else if (specialType === 'SCNMSG') {
              const desc = (description || '').toLowerCase();
              if (desc.includes('castle') || desc.includes('château')) {
                specialFill = '#15803d';
                tileBorder = '#86efac';
                tileBorderWidth = 1;
                tooltip = `🏰 Sortie Château (${cx}, ${cy})`;
              } else {
                specialFill = '#292524';
                tileBorder = '#a8a29e';
                tooltip = `§ Inscription / Panneau (${cx}, ${cy})`;
              }
            } else if (specialType === 'ENCOUNTE') {
              specialFill = '#7f1d1d';
              tileBorder = '#f87171';
              tooltip = `⚔ Gardiens fixes (${cx}, ${cy})`;
            }

            return (
              <g key={`cell-${cx}-${cy}`}>
                <rect
                  x={svgX}
                  y={svgY}
                  width={cellSize}
                  height={cellSize}
                  fill={specialFill}
                  stroke={tileBorder}
                  strokeWidth={tileBorderWidth}
                />
                {tooltip && <title>{tooltip}</title>}

                {/* 1.1 Vector Graphics for High-Visibility Special Traps & Staircases */}
                {specialType === 'TRANSFER' && (
                  <polygon
                    points={`${svgX + cellSize * 0.55},${svgY + cellSize * 0.12} ${svgX + cellSize * 0.22},${svgY + cellSize * 0.52} ${svgX + cellSize * 0.48},${svgY + cellSize * 0.52} ${svgX + cellSize * 0.42},${svgY + cellSize * 0.88} ${svgX + cellSize * 0.78},${svgY + cellSize * 0.48} ${svgX + cellSize * 0.52},${svgY + cellSize * 0.48}`}
                    fill="#ffffff"
                    stroke="#f0abfc"
                    strokeWidth={cellSize > 20 ? 0.8 : 0.4}
                  />
                )}

                {specialType === 'BUTTONZ' && (
                  <g>
                    <polygon
                      points={`${svgX + cellSize * 0.5},${svgY + cellSize * 0.18} ${svgX + cellSize * 0.25},${svgY + cellSize * 0.42} ${svgX + cellSize * 0.75},${svgY + cellSize * 0.42}`}
                      fill="#ffffff"
                    />
                    <polygon
                      points={`${svgX + cellSize * 0.5},${svgY + cellSize * 0.82} ${svgX + cellSize * 0.25},${svgY + cellSize * 0.58} ${svgX + cellSize * 0.75},${svgY + cellSize * 0.58}`}
                      fill="#ffffff"
                    />
                  </g>
                )}

                {specialType === 'CHUTE' && (
                  <g>
                    <line
                      x1={svgX + cellSize * 0.5}
                      y1={svgY + cellSize * 0.18}
                      x2={svgX + cellSize * 0.5}
                      y2={svgY + cellSize * 0.55}
                      stroke="#ffffff"
                      strokeWidth={cellSize > 20 ? 2 : 1.2}
                    />
                    <polygon
                      points={`${svgX + cellSize * 0.5},${svgY + cellSize * 0.85} ${svgX + cellSize * 0.22},${svgY + cellSize * 0.48} ${svgX + cellSize * 0.78},${svgY + cellSize * 0.48}`}
                      fill="#ffffff"
                    />
                  </g>
                )}

                {specialType === 'STAIRS' && (
                  <polygon
                    points={
                      (aux0 !== undefined && (aux0 < maze.level || aux0 === 0))
                        ? `${svgX + cellSize * 0.5},${svgY + cellSize * 0.18} ${svgX + cellSize * 0.2},${svgY + cellSize * 0.82} ${svgX + cellSize * 0.8},${svgY + cellSize * 0.82}`
                        : `${svgX + cellSize * 0.5},${svgY + cellSize * 0.82} ${svgX + cellSize * 0.2},${svgY + cellSize * 0.18} ${svgX + cellSize * 0.8},${svgY + cellSize * 0.18}`
                    }
                    fill="#ffffff"
                    stroke={aux0 !== undefined && (aux0 < maze.level || aux0 === 0) ? '#34d399' : '#fde047'}
                    strokeWidth={0.8}
                  />
                )}

                {specialType === 'PIT' && (
                  <text
                    x={svgX + cellSize / 2}
                    y={svgY + cellSize / 2 + (cellSize > 20 ? (variant === 'modal' ? 4.5 : 4) : 3)}
                    textAnchor="middle"
                    fontSize={cellSize > 20 ? (variant === 'modal' ? 14 : 12) : 9}
                    fontWeight="bold"
                    fill="#f43f5e"
                    stroke="#4c0519"
                    strokeWidth="0.3"
                    className="select-none pointer-events-none"
                  >
                    ☠
                  </text>
                )}

                {specialType === 'SPINNER' && (
                  <text
                    x={svgX + cellSize / 2}
                    y={svgY + cellSize / 2 + (cellSize > 20 ? 4 : 3)}
                    textAnchor="middle"
                    fontSize={cellSize > 20 ? 12 : 8}
                    fontWeight="bold"
                    fill="#22d3ee"
                  >
                    ↻
                  </text>
                )}

                {specialType === 'DARK' && (
                  <circle
                    cx={svgX + cellSize / 2}
                    cy={svgY + cellSize / 2}
                    r={cellSize > 20 ? 3.5 : 2}
                    fill="#818cf8"
                  />
                )}

                {specialType === 'SCNMSG' && (
                  <text
                    x={svgX + cellSize / 2}
                    y={svgY + cellSize / 2 + (cellSize > 20 ? 4 : 3)}
                    textAnchor="middle"
                    fontSize={cellSize > 20 ? 12 : 8}
                    fontWeight="bold"
                    fill={((description || '').toLowerCase().includes('castle') || (description || '').toLowerCase().includes('château')) ? '#86efac' : '#a8a29e'}
                  >
                    {((description || '').toLowerCase().includes('castle') || (description || '').toLowerCase().includes('château')) ? '🏰' : '§'}
                  </text>
                )}

                {specialType === 'ENCOUNTE' && (
                  <text
                    x={svgX + cellSize / 2}
                    y={svgY + cellSize / 2 + (cellSize > 20 ? 4 : 3)}
                    textAnchor="middle"
                    fontSize={cellSize > 20 ? 12 : 8}
                    fontWeight="bold"
                    fill="#f87171"
                  >
                    ⚔
                  </text>
                )}

                {/* Coordinates in Radar mode when space permits */}
                {viewMode === 'radar' && cellSize >= 32 && (
                  <text
                    x={svgX + 2}
                    y={svgY + 9}
                    fontSize={7}
                    fill="#475569"
                    fontFamily="monospace"
                  >
                    {cx},{cy}
                  </text>
                )}
              </g>
            );
          })}

          {/* 2. Walls and Doors */}
          {gridCells.map((cell) => {
            const { 
              svgX, svgY, cx, cy, isVisited, isValid, 
              north, south, east, west, 
              oppNorth, oppSouth, oppEast, oppWest,
              isNorthVisited, isSouthVisited, isEastVisited, isWestVisited 
            } = cell;
            if (!isValid || !isVisited) return null;

            const wallStroke = '#64748b';
            const wallWidth = viewMode === 'radar' ? (variant === 'modal' ? 1.1 : 0.9) : 1.3;
            const doorWidth = viewMode === 'radar' ? (variant === 'modal' ? 1.2 : 1.0) : 1.3;

            const isNorthSecretDiscovered = (north === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},0`]) && (isNorthVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},0`]);
            const isSouthSecretDiscovered = (south === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},2`]) && (isSouthVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},2`]);
            const isEastSecretDiscovered = (east === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},1`]) && (isEastVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},1`]);
            const isWestSecretDiscovered = (west === 'HIDEDOOR' || !!maze.discoveredSecrets?.[`${cx},${cy},3`]) && (isWestVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${cy},3`]);

            // Check if opposite side is a known door (so solid side of one-way door leaves doorway open)
            const isOppNorthKnownDoor = (oppNorth === 'DOOR' || (oppNorth === 'HIDEDOOR' && (isNorthVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${(cy + 1) % 20},2`])));
            const isOppSouthKnownDoor = (oppSouth === 'DOOR' || (oppSouth === 'HIDEDOOR' && (isSouthVisited || revealAll || !!maze.discoveredSecrets?.[`${cx},${(cy - 1 + 20) % 20},0`])));
            const isOppEastKnownDoor = (oppEast === 'DOOR' || (oppEast === 'HIDEDOOR' && (isEastVisited || revealAll || !!maze.discoveredSecrets?.[`${(cx + 1) % 20},${cy},3`])));
            const isOppWestKnownDoor = (oppWest === 'DOOR' || (oppWest === 'HIDEDOOR' && (isWestVisited || revealAll || !!maze.discoveredSecrets?.[`${(cx - 1 + 20) % 20},${cy},1`])));

            return (
              <g key={`walls-${cx}-${cy}`}>
                {/* North Wall / Door */}
                {(north === 'DOOR' || isNorthSecretDiscovered) ? (
                  <g>
                    {/* Door posts */}
                    <line x1={svgX} y1={svgY} x2={svgX + cellSize * 0.3} y2={svgY} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX + cellSize * 0.7} y1={svgY} x2={svgX + cellSize} y2={svgY} stroke={wallStroke} strokeWidth={wallWidth} />
                    {/* Fine Door bar */}
                    <line
                      x1={svgX + cellSize * 0.3}
                      y1={svgY}
                      x2={svgX + cellSize * 0.7}
                      y2={svgY}
                      stroke={isNorthSecretDiscovered ? '#c084fc' : '#f59e0b'}
                      strokeWidth={doorWidth}
                      strokeDasharray={isNorthSecretDiscovered ? '2,1.5' : undefined}
                      strokeLinecap="round"
                    />
                  </g>
                ) : (north === 'WALL' || north === 'HIDEDOOR') ? (
                  isOppNorthKnownDoor ? (
                    /* Leave doorway open on solid side of one-way door */
                    <g>
                      <line x1={svgX} y1={svgY} x2={svgX + cellSize * 0.3} y2={svgY} stroke={wallStroke} strokeWidth={wallWidth} />
                      <line x1={svgX + cellSize * 0.7} y1={svgY} x2={svgX + cellSize} y2={svgY} stroke={wallStroke} strokeWidth={wallWidth} />
                    </g>
                  ) : (
                    <line
                      x1={svgX}
                      y1={svgY}
                      x2={svgX + cellSize}
                      y2={svgY}
                      stroke={wallStroke}
                      strokeWidth={wallWidth}
                      strokeLinecap="square"
                    />
                  )
                ) : null}

                {/* South Wall / Door */}
                {(south === 'DOOR' || isSouthSecretDiscovered) ? (
                  <g>
                    <line x1={svgX} y1={svgY + cellSize} x2={svgX + cellSize * 0.3} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX + cellSize * 0.7} y1={svgY + cellSize} x2={svgX + cellSize} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line
                      x1={svgX + cellSize * 0.3}
                      y1={svgY + cellSize}
                      x2={svgX + cellSize * 0.7}
                      y2={svgY + cellSize}
                      stroke={isSouthSecretDiscovered ? '#c084fc' : '#f59e0b'}
                      strokeWidth={doorWidth}
                      strokeDasharray={isSouthSecretDiscovered ? '2,1.5' : undefined}
                      strokeLinecap="round"
                    />
                  </g>
                ) : (south === 'WALL' || south === 'HIDEDOOR') ? (
                  isOppSouthKnownDoor ? (
                    <g>
                      <line x1={svgX} y1={svgY + cellSize} x2={svgX + cellSize * 0.3} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                      <line x1={svgX + cellSize * 0.7} y1={svgY + cellSize} x2={svgX + cellSize} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    </g>
                  ) : (
                    <line
                      x1={svgX}
                      y1={svgY + cellSize}
                      x2={svgX + cellSize}
                      y2={svgY + cellSize}
                      stroke={wallStroke}
                      strokeWidth={wallWidth}
                      strokeLinecap="square"
                    />
                  )
                ) : null}

                {/* East Wall / Door */}
                {(east === 'DOOR' || isEastSecretDiscovered) ? (
                  <g>
                    <line x1={svgX + cellSize} y1={svgY} x2={svgX + cellSize} y2={svgY + cellSize * 0.3} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX + cellSize} y1={svgY + cellSize * 0.7} x2={svgX + cellSize} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line
                      x1={svgX + cellSize}
                      y1={svgY + cellSize * 0.3}
                      x2={svgX + cellSize}
                      y2={svgY + cellSize * 0.7}
                      stroke={isEastSecretDiscovered ? '#c084fc' : '#f59e0b'}
                      strokeWidth={doorWidth}
                      strokeDasharray={isEastSecretDiscovered ? '2,1.5' : undefined}
                      strokeLinecap="round"
                    />
                  </g>
                ) : (east === 'WALL' || east === 'HIDEDOOR') ? (
                  isOppEastKnownDoor ? (
                    <g>
                      <line x1={svgX + cellSize} y1={svgY} x2={svgX + cellSize} y2={svgY + cellSize * 0.3} stroke={wallStroke} strokeWidth={wallWidth} />
                      <line x1={svgX + cellSize} y1={svgY + cellSize * 0.7} x2={svgX + cellSize} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    </g>
                  ) : (
                    <line
                      x1={svgX + cellSize}
                      y1={svgY}
                      x2={svgX + cellSize}
                      y2={svgY + cellSize}
                      stroke={wallStroke}
                      strokeWidth={wallWidth}
                      strokeLinecap="square"
                    />
                  )
                ) : null}

                {/* West Wall / Door */}
                {(west === 'DOOR' || isWestSecretDiscovered) ? (
                  <g>
                    <line x1={svgX} y1={svgY} x2={svgX} y2={svgY + cellSize * 0.3} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX} y1={svgY + cellSize * 0.7} x2={svgX} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line
                      x1={svgX}
                      y1={svgY + cellSize * 0.3}
                      x2={svgX}
                      y2={svgY + cellSize * 0.7}
                      stroke={isWestSecretDiscovered ? '#c084fc' : '#f59e0b'}
                      strokeWidth={doorWidth}
                      strokeDasharray={isWestSecretDiscovered ? '2,1.5' : undefined}
                      strokeLinecap="round"
                    />
                  </g>
                ) : (west === 'WALL' || west === 'HIDEDOOR') ? (
                  isOppWestKnownDoor ? (
                    <g>
                      <line x1={svgX} y1={svgY} x2={svgX} y2={svgY + cellSize * 0.3} stroke={wallStroke} strokeWidth={wallWidth} />
                      <line x1={svgX} y1={svgY + cellSize * 0.7} x2={svgX} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    </g>
                  ) : (
                    <line
                      x1={svgX}
                      y1={svgY}
                      x2={svgX}
                      y2={svgY + cellSize}
                      stroke={wallStroke}
                      strokeWidth={wallWidth}
                      strokeLinecap="square"
                    />
                  )
                ) : null}
              </g>
            );
          })}

          {/* 3. Dedicated Top Layer: One-Way Directional Arrows (Never covered by walls or doors) */}
          <g id="minimap-one-way-arrows">
            {oneWayArrows.map((arrow) => (
              <g key={arrow.key}>
                <line
                  x1={arrow.x1}
                  y1={arrow.y1}
                  x2={arrow.x2}
                  y2={arrow.y2}
                  stroke="#38bdf8"
                  strokeWidth={viewMode === 'radar' ? (variant === 'modal' ? 1.4 : 1.2) : 1.0}
                  strokeLinecap="round"
                />
                <polygon
                  points={arrow.headPoints}
                  fill="#38bdf8"
                />
              </g>
            ))}
          </g>

          {/* 2.5 Fallen Heroes / Corpses on Floor */}
          {fallenMarkers.map((marker, idx) => {
            const cell = gridCells.find(c => c.cx === marker.x && c.cy === marker.y);
            if (!cell || (!cell.isVisited && !revealAll)) return null;
            const cxCenter = cell.svgX + cellSize / 2;
            const cyCenter = cell.svgY + cellSize / 2;

            return (
              <g key={`fallen-${marker.x}-${marker.y}-${idx}`} className="animate-pulse">
                <circle
                  cx={cxCenter}
                  cy={cyCenter}
                  r={cellSize * 0.42}
                  fill="#7f1d1d"
                  fillOpacity="0.85"
                  stroke="#ef4444"
                  strokeWidth="1.2"
                />
                <text
                  x={cxCenter}
                  y={cyCenter + (cellSize > 20 ? 4 : 3)}
                  textAnchor="middle"
                  fontSize={cellSize > 20 ? 12 : 8}
                  fill="#ffffff"
                  fontWeight="bold"
                >
                  💀
                </text>
                <title>{`Corps perdu : ${marker.name} (${marker.x}, ${marker.y})`}</title>
              </g>
            );
          })}

          {/* 3. Player Cone of Vision and Directional Marker */}
          {playerSvgPos && (
            <g transform={`translate(${playerSvgPos.svgX}, ${playerSvgPos.svgY})`}>
              {/* Field of View Cone */}
              <g transform={`rotate(${dirAngles[direction]})`}>
                <polygon
                  points={`0,0 -${cellSize * 1.6},-${cellSize * 2.5} ${cellSize * 1.6},-${cellSize * 2.5}`}
                  fill="url(#viewFrustum)"
                />
              </g>

              {/* Pulsing Beacon Circle */}
              <circle r={cellSize * 0.35} fill="#f59e0b" fillOpacity="0.25" className="animate-ping" />

              {/* Directional Chevron / Arrow */}
              <g transform={`rotate(${dirAngles[direction]})`}>
                <path
                  d="M 0 -8 L 5 6 L 0 3 L -5 6 Z"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </g>

              {/* Center Pivot Point */}
              <circle r="2" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>

      {/* Tactical Exploration Controls Bar in Modal Mode */}
      {variant === 'modal' && (onMoveForward || onTurnLeft || onTurnRight) && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/90 flex flex-col gap-2">
          {/* Controls title & quick status */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Mode Exploration Active
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Glissez ou touchez la carte, ou utilisez les touches / commandes ci-dessous
            </span>
          </div>

          {/* D-Pad Buttons */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-sm mx-auto w-full">
            {/* Top row: Turn Left, Forward, Turn Right */}
            <button
              type="button"
              onClick={onTurnLeft}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-amber-500/60 rounded-lg text-slate-200 hover:text-white font-mono text-xs font-bold transition shadow-sm active:scale-95 touch-manipulation cursor-pointer"
              title={`Pivoter à gauche de 90° (${keyboardLayout === 'AZERTY' ? 'Touche Q ou ←' : 'Touche A ou ←'})`}
            >
              <span>↺</span>
              <span>Gauche</span>
              <span className="text-[10px] text-slate-400 font-normal">[{keyboardLayout === 'AZERTY' ? 'Q' : 'A'}]</span>
            </button>

            <button
              type="button"
              onClick={onMoveForward}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-black font-mono text-xs font-bold rounded-lg border border-amber-400/80 transition shadow-md shadow-amber-950/40 active:scale-95 touch-manipulation cursor-pointer"
              title={`Avancer d'une case (${keyboardLayout === 'AZERTY' ? 'Touche Z ou ↑' : 'Touche W ou ↑'})`}
            >
              <span>▲</span>
              <span>Avancer</span>
              <span className="text-[10px] text-amber-950 font-semibold">[{keyboardLayout === 'AZERTY' ? 'Z' : 'W'}]</span>
            </button>

            <button
              type="button"
              onClick={onTurnRight}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 hover:border-amber-500/60 rounded-lg text-slate-200 hover:text-white font-mono text-xs font-bold transition shadow-sm active:scale-95 touch-manipulation cursor-pointer"
              title="Pivoter à droite de 90° (Touche D ou →)"
            >
              <span>Droite</span>
              <span>↻</span>
              <span className="text-[10px] text-slate-400 font-normal">[D]</span>
            </button>

            {/* Bottom row: Turn Around 180°, Kick Door, Inspect Area */}
            <button
              type="button"
              onClick={onTurnAround}
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-mono text-[11px] font-semibold transition active:scale-95 touch-manipulation cursor-pointer"
              title="Faire demi-tour à 180° (Touche S ou ↓)"
            >
              <span>↷ 180°</span>
              <span className="text-[9px] text-slate-400 font-normal">[S]</span>
            </button>

            {onKickDoor && (
              <button
                type="button"
                onClick={onKickDoor}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-950/70 hover:bg-amber-900/80 active:bg-amber-950 border border-amber-600/70 text-amber-300 hover:text-amber-200 font-mono text-[11px] font-semibold rounded-lg transition active:scale-95 touch-manipulation cursor-pointer"
                title="Enfoncer / ouvrir la porte en face (Touche K ou Espace)"
              >
                <span>🚪 Porte</span>
                <span className="text-[9px] text-amber-400/80 font-normal">[K]</span>
              </button>
            )}

            {onInspectArea && (
              <button
                type="button"
                onClick={onInspectArea}
                className="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-800/90 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-mono text-[11px] font-semibold transition active:scale-95 touch-manipulation cursor-pointer"
                title="Inspecter / fouiller la case courante (Touche I)"
              >
                <span>🔍 Fouiller</span>
                <span className="text-[9px] text-slate-400 font-normal">[I]</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Legend Drawer / Strip */}
      {showLegend && (
        <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-800 text-[10px] sm:text-[11px] grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-[1.5px] bg-slate-400 rounded-sm inline-block" />
            <span>Mur</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-[1.5px] bg-amber-400 rounded-sm inline-block shadow-sm" />
            <span>Porte</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-[1.5px] border-t-2 border-dashed border-purple-400 inline-block" />
            <span>Porte secrète</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="12" viewBox="0 0 16 12" className="inline-block shrink-0">
              <line x1="8" y1="1" x2="8" y2="11" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="2" y1="6" x2="11.5" y2="6" stroke="#38bdf8" strokeWidth="1.1" strokeLinecap="round" />
              <polygon points="14,6 10.5,3.8 10.5,8.2" fill="#38bdf8" />
            </svg>
            <span>Porte 1-sens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">▲</span>
            <span>Escalier Montant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">▼</span>
            <span>Escalier Descendant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-purple-400 font-bold">⚡</span>
            <span>Téléporteur</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sky-400 font-bold">🛗</span>
            <span>Ascenseur</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 font-bold">⤓</span>
            <span>Chute / Trappe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 font-bold">☠</span>
            <span>Fossepiège</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">↻</span>
            <span>Spinner</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-purple-400 font-bold">●</span>
            <span>Ténèbres</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">🏰</span>
            <span>Château</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-300 font-bold">
            <span>💀</span>
            <span>Dépouille</span>
          </div>

          <div className="col-span-2 sm:col-span-3 pt-1.5 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Zones explorées uniquement</span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-200" title="Activer ou masquer le bouton de révélation complète pour les tests">
              <input
                type="checkbox"
                checked={allowCheatMode}
                onChange={(e) => {
                  const val = e.target.checked;
                  setAllowCheatMode(val);
                  if (!val) setRevealAll(false);
                  saveMiniMapPrefs({ allowCheatMode: val, revealAll: val ? revealAll : false });
                }}
                className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-0 w-3 h-3 cursor-pointer"
              />
              <span className="font-mono text-[9px]">Outil Test / Triche</span>
            </label>
          </div>
        </div>
      )}

      {/* Footer Details */}
      <div className="mt-2 pt-1.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
        <span className="hidden sm:inline">
          Touches ({keyboardLayout}) : <strong>{keyboardLayout === 'AZERTY' ? 'Z' : 'W'}</strong> Avancer • <strong>{keyboardLayout === 'AZERTY' ? 'Q/D' : 'A/D'}</strong> Pivoter • <strong>S</strong> 180° • <strong>K/Espace</strong> Porte
        </span>
        <span className="sm:hidden text-slate-400">Niv. {maze.level}</span>
        <span>{variant === 'modal' ? 'Fermer : ' : 'Carte : '}<kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-[9px] sm:text-[10px]">{variant === 'modal' ? 'Échap / M' : 'M'}</kbd></span>
      </div>
    </div>
  );
};

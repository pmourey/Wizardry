import React, { useState, useMemo, useEffect } from 'react';
import { TMazeFloor } from '../types/wizardry';
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
}

const DEFAULT_MINIMAP_PREFS: MiniMapPrefs = {
  hudViewMode: 'radar',
  modalViewMode: 'full',
  revealAll: false,
  hudShowLegend: false,
  modalShowLegend: true,
  hudVisible: true,
  wireframeMode: false
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
  onExpand
}) => {
  // Persistent Mode: 'radar' (7x7 local area around player) or 'full' (20x20 floor grid)
  const [viewMode, setViewMode] = useState<'radar' | 'full'>(() => {
    const prefs = loadMiniMapPrefs();
    return variant === 'modal' ? prefs.modalViewMode : prefs.hudViewMode;
  });
  const [revealAll, setRevealAll] = useState<boolean>(() => loadMiniMapPrefs().revealAll);
  const [showLegend, setShowLegend] = useState<boolean>(() => {
    const prefs = loadMiniMapPrefs();
    return variant === 'modal' ? prefs.modalShowLegend : prefs.hudShowLegend;
  });

  useEffect(() => {
    if (variant === 'modal') {
      saveMiniMapPrefs({ modalViewMode: viewMode, revealAll, modalShowLegend: showLegend });
    } else {
      saveMiniMapPrefs({ hudViewMode: viewMode, revealAll, hudShowLegend: showLegend });
    }
  }, [variant, viewMode, revealAll, showLegend]);

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
      const size = variant === 'modal' ? 36 : 22;
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
      const size = variant === 'modal' ? 18 : 10;
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
        north: 'WALL',
        south: 'WALL',
        east: 'WALL',
        west: 'WALL',
        specialType: 'NORMAL'
      };
    }

    const isVisited = visitedTiles[cx]?.[cy] || revealAll;
    const sqrCode = maze.sqrExtra[cx]?.[cy] || 0;
    const specialDef = maze.extraDefs[sqrCode];

    return {
      isValid: true,
      isVisited,
      north: maze.n[cx][cy],
      south: maze.s[cx][cy],
      east: maze.e[cx][cy],
      west: maze.w[cx][cy],
      specialType: specialDef?.type || 'NORMAL',
      aux0: specialDef?.aux0,
      aux1: specialDef?.aux1,
      aux2: specialDef?.aux2
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

  return (
    <div className={`select-none transition-all flex flex-col ${
      variant === 'modal' 
        ? 'bg-slate-900 border border-slate-700 rounded-xl sm:rounded-2xl shadow-2xl p-2.5 sm:p-5 max-w-lg w-full max-h-[92vh] overflow-y-auto safe-top safe-bottom' 
        : variant === 'sidebar'
        ? 'bg-slate-950/80 border border-slate-800 rounded-xl p-2 sm:p-3'
        : 'bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl shadow-2xl p-2 sm:p-3 w-auto'
    }`}>
      {/* Header bar */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white min-w-0">
            <span className="text-[10px] text-amber-400 bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-600/30 font-mono shrink-0">
              Niv. {maze.level}
            </span>
            <span className="text-[11px] text-slate-300 font-mono truncate">
              ({x},{y}) <strong className="text-amber-300">{dirNames[direction]}</strong>
            </span>
          </div>
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

          {/* DUMAPIC clairvoyance reveal toggle */}
          <button
            onClick={() => setRevealAll(prev => !prev)}
            className={`p-1 rounded text-xs border transition active:scale-95 ${
              revealAll 
                ? 'bg-purple-900/60 text-purple-300 border-purple-500' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={revealAll ? 'Masquer le brouillard de guerre' : 'Sort DUMAPIC : Révéler la carte'}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

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

      {/* Map Viewport Area */}
      <div className="flex flex-col items-center justify-center overflow-hidden bg-slate-950 rounded-lg p-1.5 sm:p-2 border border-slate-800/80 relative w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width={svgWidth}
          height={svgHeight}
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
          <rect width={svgWidth} height={svgHeight} fill="url(#gridPattern)" />

          {/* 1. Cell Floor Fills & Special Symbols */}
          {gridCells.map((cell) => {
            const { svgX, svgY, isVisited, isValid, isPlayer, specialType, cx, cy } = cell;

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
            let iconText = '';
            let iconColor = '#94a3b8';

            if (specialType === 'STAIRS') {
              specialFill = '#3b2506';
              iconText = cx === 0 && cy === 0 ? '▲' : '▼';
              iconColor = '#fbbf24';
            } else if (specialType === 'PIT') {
              specialFill = '#3f0d12';
              iconText = '☠';
              iconColor = '#ef4444';
            } else if (specialType === 'SPINNER') {
              specialFill = '#083344';
              iconText = '↻';
              iconColor = '#06b6d4';
            } else if (specialType === 'DARK') {
              specialFill = '#1e1b4b';
              iconText = '●';
              iconColor = '#818cf8';
            } else if (specialType === 'SCNMSG') {
              specialFill = '#1c1917';
              iconText = '§';
              iconColor = '#a8a29e';
            } else if (specialType === 'ENCOUNTE') {
              specialFill = '#2d1515';
              iconText = '⚔';
              iconColor = '#f87171';
            }

            return (
              <g key={`cell-${cx}-${cy}`}>
                <rect
                  x={svgX}
                  y={svgY}
                  width={cellSize}
                  height={cellSize}
                  fill={specialFill}
                  stroke="#1e293b"
                  strokeWidth="0.5"
                />

                {/* Special Icon */}
                {iconText && (
                  <text
                    x={svgX + cellSize / 2}
                    y={svgY + cellSize / 2 + (cellSize > 20 ? 4 : 3)}
                    textAnchor="middle"
                    fontSize={cellSize > 20 ? 12 : 8}
                    fontWeight="bold"
                    fill={iconColor}
                  >
                    {iconText}
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
            const { svgX, svgY, isVisited, isValid, north, south, east, west } = cell;
            if (!isValid || !isVisited) return null;

            const wallStroke = '#64748b';
            const wallWidth = viewMode === 'radar' ? 2.5 : 1.5;

            return (
              <g key={`walls-${cell.cx}-${cell.cy}`}>
                {/* North Wall / Door */}
                {north === 'WALL' && (
                  <line
                    x1={svgX}
                    y1={svgY}
                    x2={svgX + cellSize}
                    y2={svgY}
                    stroke={wallStroke}
                    strokeWidth={wallWidth}
                    strokeLinecap="square"
                  />
                )}
                {(north === 'DOOR' || (north === 'HIDEDOOR' && revealAll)) && (
                  <g>
                    {/* Door posts */}
                    <line x1={svgX} y1={svgY} x2={svgX + cellSize * 0.25} y2={svgY} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX + cellSize * 0.75} y1={svgY} x2={svgX + cellSize} y2={svgY} stroke={wallStroke} strokeWidth={wallWidth} />
                    {/* Door center marker */}
                    <line
                      x1={svgX + cellSize * 0.25}
                      y1={svgY}
                      x2={svgX + cellSize * 0.75}
                      y2={svgY}
                      stroke={north === 'HIDEDOOR' ? '#c084fc' : '#f59e0b'}
                      strokeWidth={wallWidth + 1}
                      strokeDasharray={north === 'HIDEDOOR' ? '2,2' : undefined}
                    />
                  </g>
                )}

                {/* South Wall / Door */}
                {south === 'WALL' && (
                  <line
                    x1={svgX}
                    y1={svgY + cellSize}
                    x2={svgX + cellSize}
                    y2={svgY + cellSize}
                    stroke={wallStroke}
                    strokeWidth={wallWidth}
                    strokeLinecap="square"
                  />
                )}
                {(south === 'DOOR' || (south === 'HIDEDOOR' && revealAll)) && (
                  <g>
                    <line x1={svgX} y1={svgY + cellSize} x2={svgX + cellSize * 0.25} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX + cellSize * 0.75} y1={svgY + cellSize} x2={svgX + cellSize} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line
                      x1={svgX + cellSize * 0.25}
                      y1={svgY + cellSize}
                      x2={svgX + cellSize * 0.75}
                      y2={svgY + cellSize}
                      stroke={south === 'HIDEDOOR' ? '#c084fc' : '#f59e0b'}
                      strokeWidth={wallWidth + 1}
                      strokeDasharray={south === 'HIDEDOOR' ? '2,2' : undefined}
                    />
                  </g>
                )}

                {/* East Wall / Door */}
                {east === 'WALL' && (
                  <line
                    x1={svgX + cellSize}
                    y1={svgY}
                    x2={svgX + cellSize}
                    y2={svgY + cellSize}
                    stroke={wallStroke}
                    strokeWidth={wallWidth}
                    strokeLinecap="square"
                  />
                )}
                {(east === 'DOOR' || (east === 'HIDEDOOR' && revealAll)) && (
                  <g>
                    <line x1={svgX + cellSize} y1={svgY} x2={svgX + cellSize} y2={svgY + cellSize * 0.25} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX + cellSize} y1={svgY + cellSize * 0.75} x2={svgX + cellSize} y2={svgY + cellSize} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line
                      x1={svgX + cellSize}
                      y1={svgY + cellSize * 0.25}
                      x2={svgX + cellSize}
                      y2={svgY + cellSize * 0.75}
                      stroke={east === 'HIDEDOOR' ? '#c084fc' : '#f59e0b'}
                      strokeWidth={wallWidth + 1}
                      strokeDasharray={east === 'HIDEDOOR' ? '2,2' : undefined}
                    />
                  </g>
                )}

                {/* West Wall / Door */}
                {west === 'WALL' && (
                  <line
                    x1={svgX}
                    y1={svgY}
                    x2={svgX}
                    y2={svgY + cellSize}
                    stroke={wallStroke}
                    strokeWidth={wallWidth}
                    strokeLinecap="square"
                  />
                )}
                {(west === 'DOOR' || (west === 'HIDEDOOR' && revealAll)) && (
                  <g>
                    <line x1={svgX} y1={svgY} x2={svgX} y2={svgY + cellSize * 0.25} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line x1={svgX} y1={svgY + cellSize * 0.75} x2={svgX} y2={svgY + cellSize * 0.75} stroke={wallStroke} strokeWidth={wallWidth} />
                    <line
                      x1={svgX}
                      y1={svgY + cellSize * 0.25}
                      x2={svgX}
                      y2={svgY + cellSize * 0.75}
                      stroke={west === 'HIDEDOOR' ? '#c084fc' : '#f59e0b'}
                      strokeWidth={wallWidth + 1}
                      strokeDasharray={west === 'HIDEDOOR' ? '2,2' : undefined}
                    />
                  </g>
                )}
              </g>
            );
          })}

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

        {/* Orientation Compass Rose in top-right corner */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 p-1 rounded-md text-[9px] font-mono text-center flex flex-col items-center">
          <span className={direction === 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>N</span>
          <div className="flex gap-2">
            <span className={direction === 3 ? 'text-amber-400 font-bold' : 'text-slate-500'}>O</span>
            <span className={direction === 1 ? 'text-amber-400 font-bold' : 'text-slate-500'}>E</span>
          </div>
          <span className={direction === 2 ? 'text-amber-400 font-bold' : 'text-slate-500'}>S</span>
        </div>
      </div>

      {/* Legend Drawer / Strip */}
      {showLegend && (
        <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-800 text-[10px] sm:text-[11px] grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-slate-400 rounded-sm inline-block" />
            <span>Mur</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-sm inline-block" />
            <span>Porte</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">▲/▼</span>
            <span>Escalier</span>
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
          <div className="flex items-center gap-1.5 text-red-300 font-bold col-span-2 sm:col-span-1">
            <span>💀</span>
            <span>Dépouille</span>
          </div>
        </div>
      )}

      {/* Footer Details */}
      <div className="mt-2 pt-1.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
        <span className="hidden sm:inline">Touches ({keyboardLayout}) : <strong>{keyboardLayout === 'AZERTY' ? 'Z/Q/D' : 'W/A/D'}</strong></span>
        <span className="sm:hidden text-slate-400">Niv. {maze.level}</span>
        <span>Carte : <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono text-[9px] sm:text-[10px]">M</kbd></span>
      </div>
    </div>
  );
};

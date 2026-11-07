import { MiniMapTranslations } from '../../types';

export const miniMapEn: MiniMapTranslations = {
  levelTitle: (lvl: number) => `Floor ${lvl}`,
  radarModeBtn: 'Radar Mode',
  fullModeBtn: 'Full Floor Grid',
  radarModeTooltip: 'Switch to local 7x7 radar view',
  fullModeTooltip: 'Switch to complete 20x20 floor grid view',
  revealAllBtn: 'Reveal Entire Floor',
  hideUndiscoveredBtn: 'Fog of War',
  revealAllTooltip: 'Reveal all rooms and corridors (exploration aid)',
  legendToggleBtn: 'Toggle Legend',
  closeBtn: 'Close Map',
  coordinates: (x: number, y: number) => `(${x}, ${y})`,

  // Tooltips
  tooltipPlayer: (x: number, y: number, dir: string) => `🧙 You are here (${x}, ${y}) facing ${dir}`,
  tooltipWall: (x: number, y: number) => `Solid Stone Wall (${x}, ${y})`,
  tooltipDoor: (x: number, y: number) => `🚪 Door (${x}, ${y})`,
  tooltipSecretDoor: (x: number, y: number) => `🔍 Secret Door (${x}, ${y})`,
  tooltipOneWayDoor: (x: number, y: number) => `➜ One-Way Door (${x}, ${y})`,
  tooltipStairsCastle: (x: number, y: number) => `▲ Stairs to Castle (${x}, ${y})`,
  tooltipStairsUp: (lvl: number, x: number, y: number) => `▲ Ascending Stairs to Floor ${lvl} (${x}, ${y})`,
  tooltipStairsDown: (lvl: number, x: number, y: number) => `▼ Descending Stairs to Floor ${lvl} (${x}, ${y})`,
  tooltipTeleporter: (x: number, y: number) => `⚡ Teleporter (${x}, ${y})`,
  tooltipPit: (x: number, y: number) => `⤓ Chasm / Pitfall (${x}, ${y})`,
  tooltipFallenHero: (name: string, x: number, y: number) => `💀 Fallen Adventurer: ${name} (${x}, ${y})`,
  tooltipDarkness: (x: number, y: number) => `Darkness Zone (${x}, ${y})`,

  // Legend
  legendTitle: 'Map Legend',
  legendPlayer: 'Player Party',
  legendVisited: 'Explored Corridor',
  legendWall: 'Wall',
  legendDoor: 'Door',
  legendSecretDoor: 'Secret Door',
  legendOneWayDoor: 'One-Way Door',
  legendStairsUp: 'Stairs Up',
  legendStairsDown: 'Stairs Down',
  legendTeleporter: 'Teleporter',
  legendPit: 'Pit / Trap',
  legendDarkness: 'Darkness Zone',
  legendFallenBody: 'Fallen Hero',

  // Shortcuts & Touch
  shortcutsFooter: (fwdKey: string) => `Keys: ${fwdKey} Forward • Q/D Turn • S Turn Around • Space/E Open Door`,
  closeMapShortcut: 'Close Map: [M] or [Esc]',
  openMapShortcut: 'Map: [M]',
  cardinalNorth: 'North',
  cardinalEast: 'East',
  cardinalSouth: 'South',
  cardinalWest: 'West',
};

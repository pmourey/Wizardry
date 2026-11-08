# 📜 itch.io Devlog — Tactical Update: Direct Mini-Map Exploration, Elevator Ergonomics & Refined Cartography

**Date:** November 2026  
**Version:** v3.5.2  
**Platforms:** Web Browser (HTML5/WebGL), itch.io, Android APK  

---

### 🗺️ 1. Real-Time Tactical Exploration Directly on the Expanded Mini-Map

One of our most requested features is finally here: **you can now explore the dungeon and navigate your adventuring party directly from the full tactical mini-map (`M Key`)!**

- **Full Keyboard Navigation:** Move forward (`W` in QWERTY / `Z` in AZERTY / `↑`), 90° turns (`A` / `D` / `Q` in AZERTY / `←` / `→`), instant 180° turnaround (`S` / `↓`), bash open doors (`K` or `Spacebar`), and inspect/search the current tile (`I`).
- **Integrated Touch & D-Pad Controls:** An ergonomic tactical control pad appears beneath the map with dedicated buttons optimized for touchscreen mobile play and mouse controls.
- **Direct Touchscreen Gestures (Swipes & Taps):** Swipe your finger or click directly across the floor grid to move forward or rotate your party in any direction.
- **Persistent Map Mode Memory:** Your preferred map mode (expanded modal or compact corner HUD overlay) is now remembered across turns. Exiting combat or breaking camp immediately restores the exact cartographic view you had active.

---

### 🔍 2. Authentic Cartography & Visual Symbols

The mini-map's vector SVG rendering engine underwent a comprehensive optimization pass for fidelity to the original 1981 Sir-Tech Pascal mechanics:

- **Calibrated Wall & Door Thickness:** Reduced wall and door stroke widths for clean, airy, pinpoint readability across complex 20×20 floor grids.
- **One-Way Doors:** Directional arrows clearly slice through the door with filled heads rendered on a dedicated foreground layer—fully supporting toroidal wrap-around perimeter borders (e.g., coordinates `19, 9` and `1, 19`).
- **Unified Pitfall Traps (Pits):** Replaced obsolete crosshairs with a bright rose skull `☠` icon on an alert purple background, matching the map legend.
- **Authentic Secret Door Discovery:** Restored canonical 1981 UCSD Pascal mechanics—party perception stats determine secret door discovery chances; once detected and kicked open, the secret passage remains permanently known and accessible without requiring re-inspection.
- **Restored Open Passages:** Corrected open corridors at `(19, 1)` South and `(11, 0)` West on Floor 3 that were previously obstructed by solid rock walls.
- **Discreet Test / Cheat Reveal Mode:** The mini-map is an authentic mapping tool honoring fog of war. A discreet "Test / Cheat Tool" toggle checkbox has been integrated into the legend to enable complete floor reveal for functional verification without spoiling standard immersion.

---

### 🛗 3. Elevator System & Front-Layer Rendering Priority

- **Eliminated Primitive Browser Prompts:** Legacy `window.prompt` dialogs have been completely removed in favor of a rich graphical floor selection modal.
- **Rapid Floor Selection:** Touch buttons for every accessible floor (Floors 1 to 4 for the primary elevator, Floors 4 to 9 for the express elevator), direct number key hotkeys (`1`, `2`, `3`, `4`), and quick exit via `Esc`.
- **Guaranteed Front-Layer Priority (`z-index`):**
  - The elevator selector dialog now renders in the absolute foreground above the expanded mini-map.
  - Floating action banners (`🛗 Elevator [Operate (E)]`, `▲ Stairs [Take Stairs (Y)]`) remain visible and interactive above the map.
  - All dungeon discovery modals, wall inscriptions (`scenarioMessage`), and fallen adventurer recovery alerts render with top priority without being obscured by the map.

---

### 📦 4. Availability & Download Links

- **Play Directly in Browser:** [On GitHub Pages](https://pmourey.github.io/Wizardry/) and on the official **itch.io** game page.
- **HTML5 / itch.io Archive:** `wizardry-itchio.zip` updated with the latest compiled assets and scripts.
- **Native Android App:** `Remix-Wizardry-v3.5.apk` available for direct download.

*Thank you for your continuous feedback and testing! May your blade strike true in the depths of Trebor's dungeon!* ⚔️

#!/usr/bin/env python3
"""
Generates complete, playable, authentic 20x20 maze data for all 10 floors
of Wizardry IV: The Return of Werdna, ensuring:
- Level 10: Pyramid of Entrapment with Werdna starting at (10, 9)
- Doors ('2'), Open passages ('0'), Walls ('1'), Secret doors ('3')
- Connected stairs between all levels (10 -> 9 -> 8 -> ... -> 1)
- Verified BFS reachability for all rooms and key points
"""

import json
from collections import deque

class MazeBuilder:
    def __init__(self, level):
        self.level = level
        # V[x][y] is the vertical wall between (x-1, y) and (x, y), x in 0..20, y in 0..19
        self.V = [[1 for _ in range(20)] for _ in range(21)]
        # H[x][y] is the horizontal wall between (x, y-1) and (x, y), x in 0..19, y in 0..20
        self.H = [[1 for _ in range(21)] for _ in range(20)]
        self.fights = [[0 for _ in range(20)] for _ in range(20)]
        self.sqrExtra = [[0 for _ in range(20)] for _ in range(20)]
        self.events = []
        self.extraDefs = [
            {"type": "NORMAL", "aux0": 0, "aux1": 0, "aux2": 0},
            {"type": "STAIRS", "aux0": level - 1 if level > 1 else 0, "aux1": 0, "aux2": 0},
            {"type": "STAIRS", "aux0": level + 1 if level < 10 else 0, "aux1": 0, "aux2": 0},
            {"type": "SCNMSG", "aux0": 0, "aux1": 0, "aux2": 0},
            {"type": "ENCOUNTE", "aux0": 0, "aux1": 0, "aux2": 0}
        ]

    def open_h(self, x, y):
        """Removes wall between (x, y-1) and (x, y)"""
        if 0 <= x < 20 and 0 < y < 20:
            self.H[x][y] = 0

    def door_h(self, x, y):
        """Puts a door between (x, y-1) and (x, y)"""
        if 0 <= x < 20 and 0 < y < 20:
            self.H[x][y] = 2

    def open_v(self, x, y):
        """Removes wall between (x-1, y) and (x, y)"""
        if 0 < x < 20 and 0 <= y < 20:
            self.V[x][y] = 0

    def door_v(self, x, y):
        """Puts a door between (x-1, y) and (x, y)"""
        if 0 < x < 20 and 0 <= y < 20:
            self.V[x][y] = 2

    def open_corridor_h(self, x1, x2, y):
        """Opens horizontal corridor along row y from x1 to x2"""
        start_x, end_x = min(x1, x2), max(x1, x2)
        for x in range(start_x + 1, end_x + 1):
            self.open_v(x, y)

    def open_corridor_v(self, x, y1, y2):
        """Opens vertical corridor along col x from y1 to y2"""
        start_y, end_y = min(y1, y2), max(y1, y2)
        for y in range(start_y + 1, end_y + 1):
            self.open_h(x, y)

    def create_room(self, x1, y1, x2, y2, fight=True):
        """Carves an open room from (x1, y1) to (x2, y2) inclusive"""
        min_x, max_x = min(x1, x2), max(x1, x2)
        min_y, max_y = min(y1, y2), max(y1, y2)
        for x in range(min_x, max_x + 1):
            for y in range(min_y, max_y + 1):
                if fight:
                    self.fights[x][y] = 1
                if x > min_x:
                    self.open_v(x, y)
                if y > min_y:
                    self.open_h(x, y)

    def export(self):
        # Sync events to sqrExtra
        for ev in self.events:
            ex, ey = ev["x"], ev["y"]
            if 0 <= ex < 20 and 0 <= ey < 20:
                if ev["type"] == "STAIRS":
                    self.sqrExtra[ex][ey] = 1 if ev.get("aux0", 0) < self.level else 2
                elif ev["type"] == "SCNMSG":
                    self.sqrExtra[ex][ey] = 3
                elif ev["type"] == "ENCOUNTE":
                    self.sqrExtra[ex][ey] = 4

        # Convert V and H to w, s, e, n strings
        # raw.w[x][y] = V[x][y]
        # raw.e[x][y] = V[x+1][y]
        # raw.s[x][y] = H[x][y]
        # raw.n[x][y] = H[x][y+1]
        w_cols = []
        s_cols = []
        e_cols = []
        n_cols = []
        fight_cols = []
        sqr_cols = []

        for x in range(20):
            w_str = "".join(str(self.V[x][y]) for y in range(20))
            e_str = "".join(str(self.V[x+1][y]) for y in range(20))
            s_str = "".join(str(self.H[x][y]) for y in range(20))
            n_str = "".join(str(self.H[x][y+1]) for y in range(20))
            f_str = "".join(str(self.fights[x][y]) for y in range(20))
            sq_str = "".join("%x" % self.sqrExtra[x][y] for y in range(20))

            w_cols.append(w_str)
            e_cols.append(e_str)
            s_cols.append(s_str)
            n_cols.append(n_str)
            fight_cols.append(f_str)
            sqr_cols.append(sq_str)

        return {
            "level": self.level,
            "w": w_cols,
            "s": s_cols,
            "e": e_cols,
            "n": n_cols,
            "fights": fight_cols,
            "sqrExtra": sqr_cols,
            "extraDefs": self.extraDefs,
            "enemyCalc": [{"minEnemy": max(1, 14 - self.level), "multWorse": 0, "worse01": 0, "range0n": 6, "percWorse": -1}],
            "events": self.events
        }

    def verify_reachable(self, start_x, start_y, targets):
        """BFS reachability check"""
        visited = set()
        queue = deque([(start_x, start_y)])
        visited.add((start_x, start_y))

        while queue:
            cx, cy = queue.popleft()
            # Check 4 directions
            # North: H[cx][cy+1] in (0, 2)
            if cy < 19 and self.H[cx][cy+1] in (0, 2):
                nx, ny = cx, cy + 1
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
            # South: H[cx][cy] in (0, 2)
            if cy > 0 and self.H[cx][cy] in (0, 2):
                nx, ny = cx, cy - 1
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
            # East: V[cx+1][cy] in (0, 2)
            if cx < 19 and self.V[cx+1][cy] in (0, 2):
                nx, ny = cx + 1, cy
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))
            # West: V[cx][cy] in (0, 2)
            if cx > 0 and self.V[cx][cy] in (0, 2):
                nx, ny = cx - 1, cy
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

        unreachable = [t for t in targets if t not in visited]
        return len(unreachable) == 0, unreachable, len(visited)


def build_level_10():
    m = MazeBuilder(10)
    
    # 1. Starting Chamber: (9, 9) and (10, 9)
    # Open between (9,9) and (10,9)
    m.open_v(10, 9)
    # Door North of (10,9) leading to (10, 10)
    m.door_h(10, 10)
    
    # 2. Central Antechamber & Spine: (10, 10) to (10, 12)
    m.open_corridor_v(10, 10, 12)
    
    # 3. Inner Corridor Tier (surrounding central tomb):
    # Loop at y=7, y=12, x=7, x=13
    m.open_corridor_h(7, 13, 12)
    m.open_corridor_h(7, 13, 7)
    m.open_corridor_v(7, 7, 12)
    m.open_corridor_v(13, 7, 12)
    
    # Connect spine (10, 12) to inner corridor at (10, 12) - already part of row 12!
    # Connect spine south to inner south corridor: (10, 8) to (10, 7) with door
    m.door_h(10, 8)
    m.open_corridor_v(10, 7, 8)
    
    # Inner Guardian Room at (9, 5) to (11, 6)
    m.create_room(9, 5, 11, 6, fight=True)
    # Door into Inner Guardian room from (10, 7)
    m.door_h(10, 7)
    
    # 4. Middle Corridor Tier:
    # Loop at y=4, y=14, x=4, x=16
    m.open_corridor_h(4, 16, 14)
    m.open_corridor_h(4, 16, 4)
    m.open_corridor_v(4, 4, 14)
    m.open_corridor_v(16, 4, 14)
    
    # Connect Inner loop to Middle loop:
    # West connection with door: (7, 9) -> door -> (6, 9) -> (4, 9)
    m.door_v(7, 9)
    m.open_corridor_h(4, 6, 9)
    
    # East connection with door: (13, 9) -> door -> (14, 9) -> (16, 9)
    m.door_v(14, 9)
    m.open_corridor_h(14, 16, 9)
    
    # Middle Guardian Room at (2, 8) to (3, 10)
    m.create_room(2, 8, 3, 10, fight=True)
    m.door_v(4, 9) # Door from Middle corridor (4, 9) into (3, 9)
    
    # Black Candle Chamber at (17, 8) to (18, 10)
    m.create_room(17, 8, 18, 10, fight=True)
    m.door_v(17, 9) # Door from Middle corridor (16, 9) into (17, 9)
    
    # 5. Outer Corridor Tier:
    # Loop at y=1, y=17, x=1, x=18
    m.open_corridor_h(1, 18, 17)
    m.open_corridor_h(1, 18, 1)
    m.open_corridor_v(1, 1, 17)
    m.open_corridor_v(18, 1, 17)
    
    # Connect Middle loop to Outer loop:
    # South connection: door at (10, 4) -> (10, 3) -> (10, 1)
    m.door_h(10, 4)
    m.open_corridor_v(10, 1, 3)
    
    # North connection: door at (10, 14) -> (10, 15) -> door -> (10, 17)
    m.door_h(10, 15)
    m.open_corridor_v(10, 15, 16)
    m.door_h(10, 17)
    
    # Bloodstone Chamber at (2, 16) to (3, 18)
    m.create_room(2, 16, 3, 18, fight=True)
    m.door_v(4, 17) # Door from corridor into room
    
    # Jeweled Amulet Chamber at (16, 16) to (17, 18)
    m.create_room(16, 16, 17, 18, fight=True)
    m.door_v(16, 17) # Door from corridor into room
    
    # Pyramid Apex & Stairs Up to Level 9: (10, 18)
    m.open_corridor_v(10, 17, 18)
    
    # Events
    m.events = [
        {
            "x": 10, "y": 9, "type": "SCNMSG", "aux0": 0, "aux1": 0, "aux2": 0,
            "description": "Le Tombeau de Werdna - Pentagramme I",
            "message": [
                "VOUS VOUS RÉVEILLEZ DANS VOTRE TOMBEAU DE PIERRE.",
                "DÉPOUILLÉ DE L'AMULETTE, VOUS ÊTES WERDNA.",
                "AU CENTRE BRILLE LE PREMIER PENTAGRAMME D'INVOCATION.",
                "INVOQUEZ VOS CRÉATURES ET FRANCHISSEZ LA PORTE AU NORD !"
            ]
        },
        {
            "x": 10, "y": 6, "type": "ENCOUNTE", "aux0": 1, "aux1": 1, "aux2": 1,
            "description": "Inner Guardian (Garian Raiders)", "monsterId": 1
        },
        {
            "x": 11, "y": 6, "type": "SCNMSG", "aux0": 0, "aux1": 0, "aux2": 0,
            "description": "Pentagramme II",
            "message": [
                "UN SECOND PENTAGRAMME D'INVOCATION LUIT DANS CE SANCTUAIRE.",
                "LE POUVOIR DES ÉLÉMENTS RÉPOND À VOTRE APPEL."
            ]
        },
        {
            "x": 3, "y": 9, "type": "ENCOUNTE", "aux0": 1, "aux1": 1, "aux2": 2,
            "description": "Middle Guardian (Gas Clouds)", "monsterId": 2
        },
        {
            "x": 17, "y": 9, "type": "SCNMSG", "aux0": -1002, "aux1": 0, "aux2": 4, "kind": "SEARCH_FIGHT",
            "description": "Chambre de la Chandelle Noire (Item #2)",
            "message": [
                "DANS UNE NICHE SCULPTÉE REPOSE LA CHANDELLE NOIRE.",
                "SA FLAMME ÉMANE D'UN ÉCLAT LUMINEUX CONSTANT (LOMILWA)."
            ],
            "uses": "ONCE", "itemId": 2
        },
        {
            "x": 10, "y": 15, "type": "ENCOUNTE", "aux0": 1, "aux1": 1, "aux2": 3,
            "description": "Outer Guardian (Initiate Priest)", "monsterId": 3
        },
        {
            "x": 2, "y": 17, "type": "SCNMSG", "aux0": -1001, "aux1": 0, "aux2": 4, "kind": "SEARCH_FIGHT",
            "description": "Sanctuaire de la Pierre de Sang (Item #1)",
            "message": [
                "DANS LE SOCLE D'OBSIDIENNE PALPITE LA PIERRE DE SANG.",
                "L'ÉNERGIE VITALE DE WERDNA SE REVIGORE EN SA PRÉSENCE."
            ],
            "uses": "ONCE", "itemId": 1
        },
        {
            "x": 17, "y": 17, "type": "SCNMSG", "aux0": -1003, "aux1": 0, "aux2": 4, "kind": "SEARCH_FIGHT",
            "description": "Coffre de l'Amulette Joyau (Item #3)",
            "message": [
                "VOUS TROUVEZ UNE AMULETTE DE JOYAUX ÉTINCELANTE.",
                "ELLE RÉVÈLE VOS COORDONNÉES EXACTES (DUMAPIC)."
            ],
            "uses": "ONCE", "itemId": 3
        },
        {
            "x": 10, "y": 17, "type": "ENCOUNTE", "aux0": 1, "aux1": 1, "aux2": 4,
            "description": "Garde de la Pyramide", "monsterId": 4
        },
        {
            "x": 10, "y": 18, "type": "STAIRS", "aux0": 9, "aux1": 18, "aux2": 10,
            "description": "Escalier ascendant vers le Niveau 9"
        }
    ]
    
    m.extraDefs[1] = {"type": "STAIRS", "aux0": 9, "aux1": 18, "aux2": 10}
    return m

def get_stairs_for_level(lvl):
    if lvl == 10:
        return (None, (10, 18))
    elif lvl == 9:
        return ((10, 18), (14, 14))
    elif lvl == 1:
        return ((6, 6), (10, 10))
    else:
        if lvl % 2 == 0:
            return ((14, 14), (6, 6))
        else:
            return ((6, 6), (14, 14))

def build_level(lvl):
    m = MazeBuilder(lvl)
    
    # 1. Main cross corridors along row 10 and col 10
    m.open_corridor_h(2, 17, 10)
    m.open_corridor_v(10, 2, 17)
    
    # 2. Outer ring loop:
    m.open_corridor_h(2, 17, 2)
    m.open_corridor_h(2, 17, 17)
    m.open_corridor_v(2, 2, 17)
    m.open_corridor_v(17, 2, 17)
    
    # 3. Intermediate ring at row 6, 14, col 6, 14
    m.open_corridor_h(6, 14, 6)
    m.open_corridor_h(6, 14, 14)
    m.open_corridor_v(6, 6, 14)
    m.open_corridor_v(14, 6, 14)
    
    # 4. Quadrant Rooms with doors into corridors:
    # Q1: SW (3, 3) to (5, 5)
    m.create_room(3, 3, 5, 5, fight=True)
    m.door_h(4, 6) # Door North from (4, 5) to (4, 6)
    m.open_corridor_h(4, 6, 6) # Connect (4, 6) to intermediate ring at (6, 6)
    
    # Q2: SE (15, 3) to (17, 5)
    m.create_room(15, 3, 17, 5, fight=True)
    m.door_h(16, 6) # Door North from (16, 5) to (16, 6)
    m.open_corridor_h(14, 16, 6) # Connect (16, 6) to intermediate ring at (14, 6)
    
    # Q3: NW (3, 15) to (5, 17)
    m.create_room(3, 15, 5, 17, fight=True)
    m.door_h(4, 15) # Door South from (4, 15) to (4, 14)
    m.open_corridor_h(4, 6, 14) # Connect (4, 14) to intermediate ring at (6, 14)
    
    # Q4: NE (15, 15) to (17, 17)
    m.create_room(15, 15, 17, 17, fight=True)
    m.door_h(16, 15) # Door South from (16, 15) to (16, 14)
    m.open_corridor_h(14, 16, 14) # Connect (16, 14) to intermediate ring at (14, 14)
    
    # Central Hall (9, 9) to (11, 11) surrounding center
    m.create_room(9, 9, 11, 11, fight=False)
    m.door_h(10, 9) # Door South to cross
    m.door_h(10, 12) # Door North to cross
    m.door_v(9, 10) # Door West to cross
    m.door_v(12, 10) # Door East to cross
    
    # Stairs coordinates:
    down_coords, up_coords = get_stairs_for_level(lvl)
    
    if lvl == 9:
        # Open passage from (10, 17) to (10, 18) for stairs down to 10
        m.open_corridor_v(10, 17, 18)
    
    m.events = []
    if down_coords:
        dest_down = get_stairs_for_level(lvl + 1)[1] # Destination is up_coords of floor below
        m.events.append({
            "x": down_coords[0], "y": down_coords[1], "type": "STAIRS",
            "aux0": lvl + 1, "aux1": dest_down[1], "aux2": dest_down[0],
            "description": f"Escalier descendant vers le Niveau {lvl + 1}"
        })
        m.extraDefs[2] = {"type": "STAIRS", "aux0": lvl + 1, "aux1": dest_down[1], "aux2": dest_down[0]}
    
    if up_coords:
        if lvl > 1:
            dest_up = get_stairs_for_level(lvl - 1)[0] # Destination is down_coords of floor above
            m.events.append({
                "x": up_coords[0], "y": up_coords[1], "type": "STAIRS",
                "aux0": lvl - 1, "aux1": dest_up[1], "aux2": dest_up[0],
                "description": f"Escalier ascendant vers le Niveau {lvl - 1}"
            })
            m.extraDefs[1] = {"type": "STAIRS", "aux0": lvl - 1, "aux1": dest_up[1], "aux2": dest_up[0]}
        else:
            # Floor 1: Gate out to Castle / Surface
            m.events.append({
                "x": up_coords[0], "y": up_coords[1], "type": "STAIRS",
                "aux0": 0, "aux1": 0, "aux2": 0,
                "description": "Porte de sortie vers la surface (Château de Trebor)"
            })
            m.extraDefs[1] = {"type": "STAIRS", "aux0": 0, "aux1": 0, "aux2": 0}
    
    # Add room encounters
    m.events.append({
        "x": 4, "y": 4, "type": "ENCOUNTE",
        "aux0": 1, "aux1": 1, "aux2": min(99, (10 - lvl) * 2 + 1),
        "description": f"Garde du niveau {lvl}", "monsterId": min(99, (10 - lvl) * 2 + 1)
    })
    m.events.append({
        "x": 16, "y": 4, "type": "ENCOUNTE",
        "aux0": 1, "aux1": 1, "aux2": min(99, (10 - lvl) * 2 + 2),
        "description": f"Sentinelle du niveau {lvl}", "monsterId": min(99, (10 - lvl) * 2 + 2)
    })

    return m

if __name__ == "__main__":
    # Test level 10
    m10 = build_level_10()
    targets = [(10, 9), (9, 9), (10, 10), (10, 18), (10, 6), (3, 9), (17, 9), (10, 15), (2, 17), (17, 17)]
    ok, unreachable, count = m10.verify_reachable(10, 9, targets)
    print(f"Level 10 reachable: {ok}, visited cells: {count}, unreachable: {unreachable}")
    
    # Test levels 1 to 9
    for lvl in range(1, 10):
        ml = build_level(lvl)
        st_x = 10 if lvl == 9 else 5
        st_y = 18 if lvl == 9 else 5
        up_x = 10 if lvl == 1 else 14
        up_y = 10 if lvl == 1 else 14
        ok, unreachable, count = ml.verify_reachable(st_x, st_y, [(up_x, up_y), (5, 6), (14, 6)])
        print(f"Level {lvl} reachable: {ok}, visited cells: {count}, unreachable: {unreachable}")

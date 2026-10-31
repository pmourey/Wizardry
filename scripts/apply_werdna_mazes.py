#!/usr/bin/env python3
import json
from scripts.build_wiz4_mazes import build_level_10, build_level

path = "src/data/scenarios/return-of-werdnaData.ts"
content = open(path, "r", encoding="utf-8").read()

# Build 10 levels
mazes = []
for lvl in range(1, 10):
    mazes.append(build_level(lvl).export())
mazes.append(build_level_10().export())

# Format TS code
ts_mazes = "export const RETURN_OF_WERDNA_MAZES: PGRawMaze[] = " + json.dumps(mazes, indent=2) + ";\n"

# Replace the old RETURN_OF_WERDNA_MAZES definition
marker_start = "// 10 Dungeon Mazes: Level 1 (Surface of Trebor) to Level 10 (Pyramid of Entrapment)"
marker_end = "// Starter Party: Werdna alone, accompanied by initial summoned creatures"

idx_start = content.find(marker_start)
idx_end = content.find(marker_end)

if idx_start == -1 or idx_end == -1:
    raise Exception(f"Markers not found: start={idx_start}, end={idx_end}")

new_content = content[:idx_start] + "// 10 Dungeon Mazes: Level 1 (Surface of Trebor) to Level 10 (Pyramid of Entrapment)\n" + ts_mazes + "\n" + content[idx_end:]

open(path, "w", encoding="utf-8").write(new_content)
print("Updated src/data/scenarios/return-of-werdnaData.ts successfully!")

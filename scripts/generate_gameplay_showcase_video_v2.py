#!/usr/bin/env python3
"""
Generate the Updated 1080p Graphical Advancements Gameplay Video for Vimeo / Portfolio / LinkedIn.
Highlights:
- 13-Scenario Anthology & Campaign Selector
- Real-time Three.js 3D Viewport with dynamic torch shaders & distance fog
- 1981 Apple II Retro Wireframe 3D Mode toggle
- NEW FEATURE: Live Tactical Minimap Exploration with on-screen D-Pad & SVG vector cartography
- Enriched tactical combat with decoded NTSC monster portraits
- Kentaro Haneda Orchestral soundtrack
- Formatted for Vimeo (1080p, H.264 High Profile, AAC 256k stereo, duration: 51 seconds)
"""

import os
import sys
import subprocess
import tempfile

BASE_DIR = "/Users/display/VSCodeProjects/Wizardry"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

AUDIO_TRACK = os.path.join(BASE_DIR, "public/music/w1/01-opening.mp3")
COVER_IMG = os.path.join(BASE_DIR, "itchio-cover.png")

OUTPUT_MP4 = os.path.join(BASE_DIR, "wizardry-gameplay-v2-graphical-advances.mp4")
OUTPUT_PORTFOLIO_MP4 = "/Users/display/PycharmProjects/portfolio/wizardry-showcase.mp4"

SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
SHOT_SCENARIOS = os.path.join(SCREENSHOTS_DIR, "screenshot-scenarios.png")
SHOT_STONE = os.path.join(SCREENSHOTS_DIR, "screenshot-dungeon-stone.png")
SHOT_WIRE = os.path.join(SCREENSHOTS_DIR, "screenshot-dungeon-wireframe.png")
SHOT_MINIMAP = os.path.join(SCREENSHOTS_DIR, "screenshot-minimap-enlarged.png")
SHOT_COMBAT = os.path.join(SCREENSHOTS_DIR, "screenshot-combat.png")

def run(cmd):
    print(f">> Running:\n{cmd}\n")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error stdout: {res.stdout}", file=sys.stderr)
        print(f"Error stderr: {res.stderr}", file=sys.stderr)
        raise RuntimeError(f"Command failed: {cmd}")

def make_screenshot_scene(tmpdir, index, img_path, title_text, subtitle_text, duration=7, border_color="0x6366f1"):
    out = os.path.join(tmpdir, f"scene_{index}.mp4")
    
    title_file = os.path.join(tmpdir, f"title_{index}.txt")
    with open(title_file, "w", encoding="utf-8") as f:
        f.write(title_text)

    subtitle_file = os.path.join(tmpdir, f"sub_{index}.txt")
    with open(subtitle_file, "w", encoding="utf-8") as f:
        f.write(subtitle_text)

    # 1600x813 screenshot scaled to 1540 width (1540x782), placed at y=168
    filter_complex = (
        f"[1:v]scale=1540:-1[shot];"
        f"[shot]drawbox=x=0:y=0:w=iw:h=ih:color={border_color}:t=3[bordered];"
        f"[0:v][bordered]overlay=(W-w)/2:168[canvas];"
        f"[canvas]drawbox=x=0:y=0:w=1920:h=145:color=0x070b14@0.92:t=fill[hdr];"
        f"[hdr]drawtext=fontfile='{FONT_BLACK}':textfile='{title_file}':fontcolor=0xffd269:fontsize=44:x=(w-text_w)/2:y=45:shadowcolor=black:shadowx=3:shadowy=3[with_title];"
        f"[with_title]drawbox=x=0:y=960:w=1920:h=120:color=0x070b14@0.92:t=fill[with_footer];"
        f"[with_footer]drawtext=fontfile='{FONT_BOLD}':textfile='{subtitle_file}':fontcolor=0x38bdf8:fontsize=28:x=(w-text_w)/2:y=1005:shadowcolor=black:shadowx=2:shadowy=2,"
        f"fade=t=in:st=0:d=0.7,fade=t=out:st={duration-0.7}:d=0.7"
    )
    
    cmd = (
        f"ffmpeg -y -f lavfi -i color=c=0x070b14:s=1920x1080:d={duration} "
        f"-i \"{img_path}\" -filter_complex \"{filter_complex}\" "
        f"-c:v libx264 -pix_fmt yuv420p -r 30 \"{out}\""
    )
    run(cmd)
    return out

def main():
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Temporary build folder: {tmpdir}")

        # Scene 0: Title Intro (7s)
        s0 = os.path.join(tmpdir, "scene_0.mp4")
        t0_1 = os.path.join(tmpdir, "t0_1.txt")
        with open(t0_1, "w", encoding="utf-8") as f: f.write("W I Z A R D R Y")
        t0_2 = os.path.join(tmpdir, "t0_2.txt")
        with open(t0_2, "w", encoding="utf-8") as f: f.write("GRAPHICAL ADVANCEMENTS & MODERN WEBGL ENGINE")
        t0_3 = os.path.join(tmpdir, "t0_3.txt")
        with open(t0_3, "w", encoding="utf-8") as f: f.write("Classic Quadrilogy (I - IV) & 13 Apple II Scenarios")
        t0_4 = os.path.join(tmpdir, "t0_4.txt")
        with open(t0_4, "w", encoding="utf-8") as f: f.write("By Philippe Mourey • Three.js • React • TypeScript • Python")

        f0_complex = (
            f"[1:v]scale=-1:800[cov];"
            f"[0:v][cov]overlay=(W-w)/2:(H-h)/2-40[bg];"
            f"[bg]drawbox=x=0:y=0:w=1920:h=1080:color=black@0.45:t=fill[dark];"
            f"[dark]drawtext=fontfile='{FONT_BLACK}':textfile='{t0_1}':fontcolor=0xffd269:fontsize=88:x=(w-text_w)/2:y=150:shadowcolor=black:shadowx=4:shadowy=4[v1];"
            f"[v1]drawtext=fontfile='{FONT_BOLD}':textfile='{t0_2}':fontcolor=0xffffff:fontsize=36:x=(w-text_w)/2:y=255:shadowcolor=black:shadowx=3:shadowy=3[v2];"
            f"[v2]drawtext=fontfile='{FONT_BOLD}':textfile='{t0_3}':fontcolor=0x38bdf8:fontsize=32:x=(w-text_w)/2:y=850:shadowcolor=black:shadowx=2:shadowy=2[v3];"
            f"[v3]drawtext=fontfile='{FONT_BOLD}':textfile='{t0_4}':fontcolor=0xa5b4fc:fontsize=24:x=(w-text_w)/2:y=920,"
            f"fade=t=in:st=0:d=1.0,fade=t=out:st=6.0:d=1.0"
        )
        cmd_s0 = (
            f"ffmpeg -y -f lavfi -i color=c=0x070b14:s=1920x1080:d=7 "
            f"-i \"{COVER_IMG}\" -filter_complex \"{f0_complex}\" "
            f"-c:v libx264 -pix_fmt yuv420p -r 30 \"{s0}\""
        )
        run(cmd_s0)

        # Scene 1: 13-Scenario Anthology Selector (7s)
        s1 = make_screenshot_scene(
            tmpdir, 1, SHOT_SCENARIOS,
            "13-SCENARIO ANTHOLOGY & CAMPAIGN CATALOG",
            "Quadrilogy I–IV + 9 Community Scenarios • Isolated LocalStorage Save Banks & Campaign Switcher",
            duration=7, border_color="0xd97706"
        )

        # Scene 2: Real-time 3D Dungeon Stone Mode (7s)
        s2 = make_screenshot_scene(
            tmpdir, 2, SHOT_STONE,
            "THREE.JS REAL-TIME 3D VIEWPORT (STONE TEXTURES)",
            "Dynamic Torchlight Shaders • Distance Fog • Smooth Grid Navigation & HUD Minimap Radar",
            duration=7, border_color="0x2563eb"
        )

        # Scene 3: Vintage 1981 Wireframe Vector Mode (7s)
        s3 = make_screenshot_scene(
            tmpdir, 3, SHOT_WIRE,
            "AUTHENTIC 1981 APPLE II RETRO WIREFRAME 3D MODE",
            "Instant Graphical Mode Toggle • Pure Vector Depth Perspective • Zero-Latency WebGL Traversal",
            duration=7, border_color="0x22c55e"
        )

        # Scene 4: NEW - Live Tactical Minimap Exploration with D-Pad (8s)
        s4 = make_screenshot_scene(
            tmpdir, 4, SHOT_MINIMAP,
            "NEW: LIVE TACTICAL MINIMAP EXPLORATION (KEY M)",
            "Explore Directly on SVG Map • Tactile D-Pad & Gestures • Directional Doors & Skull Pit Traps",
            duration=8, border_color="0xa855f7"
        )

        # Scene 5: Tactical Combat & Decoded NTSC Portraits (7s)
        s5 = make_screenshot_scene(
            tmpdir, 5, SHOT_COMBAT,
            "TACTICAL TURN-BASED COMBAT & NTSC MONSTER ART",
            "Apple II Decoded Monster Portraits • Canonical Dice Formulas, AC Math & Lethal Spellbooks",
            duration=7, border_color="0xef4444"
        )

        # Scene 6: Outro & Call to Action (8s)
        s6 = os.path.join(tmpdir, "scene_6.mp4")
        t6_1 = os.path.join(tmpdir, "t6_1.txt")
        with open(t6_1, "w", encoding="utf-8") as f: f.write("PLAY FREE NOW IN YOUR BROWSER")
        t6_2 = os.path.join(tmpdir, "t6_2.txt")
        with open(t6_2, "w", encoding="utf-8") as f: f.write("https://pmourey.github.io/Wizardry/")
        t6_3 = os.path.join(tmpdir, "t6_3.txt")
        with open(t6_3, "w", encoding="utf-8") as f: f.write("Full-Stack Tech: React 18 • TypeScript • Three.js (WebGL) • Python Disk Parser")
        t6_4 = os.path.join(tmpdir, "t6_4.txt")
        with open(t6_4, "w", encoding="utf-8") as f: f.write("Web (GitHub Pages / Itch.io) & Native Android APK • Reverse-Engineered from Pascal/6502")

        f6_complex = (
            f"[1:v]scale=-1:560[cov];"
            f"[0:v][cov]overlay=(W-w)/2:120[bg];"
            f"[bg]drawbox=x=0:y=0:w=1920:h=1080:color=black@0.45:t=fill[dark];"
            f"[dark]drawtext=fontfile='{FONT_BLACK}':textfile='{t6_1}':fontcolor=0x22c55e:fontsize=64:x=(w-text_w)/2:y=720:shadowcolor=black:shadowx=3:shadowy=3[v1];"
            f"[v1]drawtext=fontfile='{FONT_BOLD}':textfile='{t6_2}':fontcolor=0xffd269:fontsize=38:x=(w-text_w)/2:y=805:shadowcolor=black:shadowx=2:shadowy=2[v2];"
            f"[v2]drawtext=fontfile='{FONT_BOLD}':textfile='{t6_3}':fontcolor=0xffffff:fontsize=28:x=(w-text_w)/2:y=875[v3];"
            f"[v3]drawtext=fontfile='{FONT_BOLD}':textfile='{t6_4}':fontcolor=0x38bdf8:fontsize=24:x=(w-text_w)/2:y=935,"
            f"fade=t=in:st=0:d=1.0,fade=t=out:st=6.8:d=1.2"
        )
        cmd_s6 = (
            f"ffmpeg -y -f lavfi -i color=c=0x06090e:s=1920x1080:d=8 "
            f"-i \"{COVER_IMG}\" -filter_complex \"{f6_complex}\" "
            f"-c:v libx264 -pix_fmt yuv420p -r 30 \"{s6}\""
        )
        run(cmd_s6)

        # Durations: 7 + 7 + 7 + 7 + 8 + 7 + 8 = 51 seconds
        total_duration = 51

        concat_txt = os.path.join(tmpdir, "concat.txt")
        with open(concat_txt, "w") as f:
            for i in range(7):
                f.write(f"file '{tmpdir}/scene_{i}.mp4'\n")

        print(">> Assembling final high-definition video and soundtrack...")
        final_cmd = (
            f"ffmpeg -y -f concat -safe 0 -i \"{concat_txt}\" -ss 0 -t {total_duration} -i \"{AUDIO_TRACK}\" "
            f"-filter_complex \"[1:a]afade=t=in:st=0:d=1.5,afade=t=out:st={total_duration-2.5}:d=2.5[aud]\" "
            f"-map 0:v -map \"[aud]\" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "
            f"-c:a aac -b:a 256k -shortest \"{OUTPUT_MP4}\""
        )
        run(final_cmd)
        
        subprocess.run(f"cp \"{OUTPUT_MP4}\" \"{OUTPUT_PORTFOLIO_MP4}\"", shell=True, check=True)
        print(f"\n>> SUCCESS! Updated video generated at:")
        print(f"   1. {OUTPUT_MP4}")
        print(f"   2. {OUTPUT_PORTFOLIO_MP4}")

if __name__ == "__main__":
    main()

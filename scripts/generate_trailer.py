#!/usr/bin/env python3
"""
Generate a professional 1080p Gameplay Trailer Video for Itch.io and YouTube/Vimeo.
Uses FFmpeg to produce a 35-second teaser featuring:
- Game art & monster illustrations
- Cinematic typography & titles
- Kentaro Haneda orchestral soundtrack
- Scene transitions & audio fade
"""

import os
import subprocess
import tempfile

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"

AUDIO_TRACK = "public/music/w1/01-opening.mp3"
COVER_IMG = "itchio-cover.png"
OUTPUT_MP4 = "wizardry-trailer.mp4"

MONSTER_DIR = "src/assets/monsters/proving-grounds"
WERDNA_PIC = f"{MONSTER_DIR}/pic19.png"
DRAGON_PIC = f"{MONSTER_DIR}/pic17.png"
KOBOLD_PIC = f"{MONSTER_DIR}/pic0.png"

def run(cmd):
    print(f">> Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main():
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"Working directory: {tmpdir}")

        # Scene 1: Epic Title Reveal (7 seconds)
        s1 = f"{tmpdir}/scene1.mp4"
        cmd_s1 = (
            f"ffmpeg -y -f lavfi -i color=c=0x070b14:s=1920x1080:d=7 -i {COVER_IMG} "
            f"-filter_complex \""
            f"[1:v]scale=-1:800[cov];"
            f"[0:v][cov]overlay=(W-w)/2:(H-h)/2-50[bg];"
            f"[bg]drawbox=x=0:y=0:w=1920:h=1080:color=black@0.45:t=fill[dark];"
            f"[dark]drawtext=fontfile='{FONT_BLACK}':text='W I Z A R D R Y':fontcolor=0xffd269:fontsize=84:x=(w-text_w)/2:y=180:shadowcolor=black:shadowx=4:shadowy=4,"
            f"drawtext=fontfile='{FONT_BOLD}':text='THE CLASSIC TRILOGY & 12-SCENARIO ANTHOLOGY':fontcolor=0xffffff:fontsize=36:x=(w-text_w)/2:y=280:shadowcolor=black:shadowx=3:shadowy=3,"
            f"drawtext=fontfile='{FONT_BOLD}':text='AUTHENTIC FIRST-PERSON 3D DUNGEON CRAWLER':fontcolor=0x38bdf8:fontsize=28:x=(w-text_w)/2:y=880:shadowcolor=black:shadowx=2:shadowy=2,"
            f"fade=t=in:st=0:d=1,fade=t=out:st=6:d=1"
            f"\" -c:v libx264 -pix_fmt yuv420p -r 30 {s1}"
        )
        run(cmd_s1)

        # Scene 2: The Classic Trilogy (7 seconds)
        s2 = f"{tmpdir}/scene2.mp4"
        cmd_s2 = (
            f"ffmpeg -y -f lavfi -i color=c=0x0a101d:s=1920x1080:d=7 "
            f"-filter_complex \""
            f"drawbox=x=120:y=100:w=1680:h=880:color=0x1e293b@0.85:t=fill,"
            f"drawbox=x=120:y=100:w=1680:h=880:color=0xd97706:t=4,"
            f"drawtext=fontfile='{FONT_BLACK}':text='THE COMPLETE CLASSIC TRILOGY':fontcolor=0xfbbf24:fontsize=56:x=(w-text_w)/2:y=160,"
            f"drawtext=fontfile='{FONT_BOLD}':text='3 HISTORICAL MASTERPIECES FAITHFULLY RESTORED':fontcolor=0x94a3b8:fontsize=26:x=(w-text_w)/2:y=240,"
            f"drawbox=x=200:y=320:w=1520:h=120:color=0x1e1b4b@0.9:t=fill,"
            f"drawbox=x=200:y=320:w=1520:h=120:color=0x818cf8:t=2,"
            f"drawtext=fontfile='{FONT_BOLD}':text='#1 • PROVING GROUNDS OF THE MAD OVERLORD (1981)':fontcolor=0xffffff:fontsize=34:x=240:y=360,"
            f"drawbox=x=200:y=470:w=1520:h=120:color=0x1e1b4b@0.9:t=fill,"
            f"drawbox=x=200:y=470:w=1520:h=120:color=0x818cf8:t=2,"
            f"drawtext=fontfile='{FONT_BOLD}':text='#2 • THE KNIGHT OF DIAMONDS (1982)':fontcolor=0xffffff:fontsize=34:x=240:y=510,"
            f"drawbox=x=200:y=620:w=1520:h=120:color=0x1e1b4b@0.9:t=fill,"
            f"drawbox=x=200:y=620:w=1520:h=120:color=0x818cf8:t=2,"
            f"drawtext=fontfile='{FONT_BOLD}':text='#3 • THE LEGACY OF LLYLGAMYN (1983)':fontcolor=0xffffff:fontsize=34:x=240:y=660,"
            f"drawtext=fontfile='{FONT_BOLD}':text='+ 9 Additional Fan Expansions from the Zimlab / Snafaru Anthology':fontcolor=0x38bdf8:fontsize=28:x=(w-text_w)/2:y=800,"
            f"fade=t=in:st=0:d=0.8,fade=t=out:st=6.2:d=0.8"
            f"\" -c:v libx264 -pix_fmt yuv420p -r 30 {s2}"
        )
        run(cmd_s2)

        # Scene 3: Monsters & 3D Dungeon Exploration (7 seconds)
        s3 = f"{tmpdir}/scene3.mp4"
        f3_path = f"{tmpdir}/filter3.txt"
        with open(f3_path, "w") as f:
            f.write(
                "[1:v]scale=280:280[m1];[2:v]scale=340:340[m2];[3:v]scale=300:300[m3];"
                "[0:v][m1]overlay=200:520[v1];"
                "[v1][m2]overlay=790:490[v2];"
                "[v2][m3]overlay=1420:510[bg];"
                f"[bg]drawtext=fontfile='{FONT_BLACK}':text='GRID-BASED 3D DUNGEONS & TACTICAL COMBAT':fontcolor=0xf59e0b:fontsize=52:x=(w-text_w)/2:y=120,"
                f"drawtext=fontfile='{FONT_BOLD}':text='Smooth Real-Time Three.js Viewport • True Apple II Rules & Dice Rolls':fontcolor=0xe2e8f0:fontsize=30:x=(w-text_w)/2:y=210,"
                f"drawtext=fontfile='{FONT_BOLD}':text='Create & level up a full party of 6 adventurers across 8 classes':fontcolor=0x94a3b8:fontsize=26:x=(w-text_w)/2:y=280,"
                f"drawtext=fontfile='{FONT_BOLD}':text='Master lethal spellbooks\\: KATINO\\, MAHALITO\\, TILTOWAIT':fontcolor=0xf87171:fontsize=28:x=(w-text_w)/2:y=370,"
                f"drawtext=fontfile='{FONT_BOLD}':text='Kobold':fontcolor=0x94a3b8:fontsize=24:x=300:y=830,"
                f"drawtext=fontfile='{FONT_BOLD}':text='Dragon':fontcolor=0x94a3b8:fontsize=24:x=910:y=850,"
                f"drawtext=fontfile='{FONT_BOLD}':text='Evil Wizard Werdna':fontcolor=0x94a3b8:fontsize=24:x=1440:y=830,"
                "fade=t=in:st=0:d=0.8,fade=t=out:st=6.2:d=0.8"
            )
        cmd_s3 = (
            f"ffmpeg -y -f lavfi -i color=c=0x06090e:s=1920x1080:d=7 "
            f"-i {KOBOLD_PIC} -i {DRAGON_PIC} -i {WERDNA_PIC} "
            f"-filter_complex_script {f3_path} -c:v libx264 -pix_fmt yuv420p -r 30 {s3}"
        )
        run(cmd_s3)

        # Scene 4: Orchestral Music & Modern Comfort (7 seconds)
        s4 = f"{tmpdir}/scene4.mp4"
        cmd_s4 = (
            f"ffmpeg -y -f lavfi -i color=c=0x0a101d:s=1920x1080:d=7 "
            f"-filter_complex \""
            f"drawbox=x=120:y=100:w=1680:h=880:color=0x0f172a@0.9:t=fill,"
            f"drawbox=x=120:y=100:w=1680:h=880:color=0x0284c7:t=4,"
            f"drawtext=fontfile='{FONT_BLACK}':text='MODERN ERGONOMICS & LEGENDARY SOUNDTRACK':fontcolor=0x38bdf8:fontsize=52:x=(w-text_w)/2:y=150,"
            f"drawtext=fontfile='{FONT_BOLD}':text='Full Kentaro Haneda Orchestral OST (13 Tracks)':fontcolor=0xfbbf24:fontsize=34:x=(w-text_w)/2:y=270,"
            f"drawtext=fontfile='{FONT_BOLD}':text='Active Hero Dropdown in Castle Shops & Services':fontcolor=0xffffff:fontsize=32:x=(w-text_w)/2:y=390,"
            f"drawtext=fontfile='{FONT_BOLD}':text='One-Click Gold Utilities (Pool & Share Equally)':fontcolor=0xffffff:fontsize=32:x=(w-text_w)/2:y=490,"
            f"drawtext=fontfile='{FONT_BOLD}':text='Cross-Scenario Hero Importer & Local Storage Isolation':fontcolor=0xffffff:fontsize=32:x=(w-text_w)/2:y=590,"
            f"drawtext=fontfile='{FONT_BOLD}':text='One-Click JSON Save Export & Backup':fontcolor=0xffffff:fontsize=32:x=(w-text_w)/2:y=690,"
            f"fade=t=in:st=0:d=0.8,fade=t=out:st=6.2:d=0.8"
            f"\" -c:v libx264 -pix_fmt yuv420p -r 30 {s4}"
        )
        run(cmd_s4)

        # Scene 5: Outro & Call to Action (7 seconds)
        s5 = f"{tmpdir}/scene5.mp4"
        cmd_s5 = (
            f"ffmpeg -y -f lavfi -i color=c=0x050811:s=1920x1080:d=7 -i {COVER_IMG} "
            f"-filter_complex \""
            f"[1:v]scale=-1:600[cov];"
            f"[0:v][cov]overlay=(W-w)/2:120[bg];"
            f"[bg]drawbox=x=0:y=0:w=1920:h=1080:color=black@0.4:t=fill[dark];"
            f"[dark]drawtext=fontfile='{FONT_BLACK}':text='PLAY NOW IN YOUR BROWSER':fontcolor=0x22c55e:fontsize=64:x=(w-text_w)/2:y=760:shadowcolor=black:shadowx=3:shadowy=3,"
            f"drawtext=fontfile='{FONT_BOLD}':text='100% Free • No Install Required • Zero Latency WebGL':fontcolor=0xffffff:fontsize=32:x=(w-text_w)/2:y=850:shadowcolor=black:shadowx=2:shadowy=2,"
            f"drawtext=fontfile='{FONT_BOLD}':text='Available on Itch.io & GitHub Pages':fontcolor=0xfbbf24:fontsize=28:x=(w-text_w)/2:y=930,"
            f"fade=t=in:st=0:d=0.8,fade=t=out:st=5.8:d=1.2"
            f"\" -c:v libx264 -pix_fmt yuv420p -r 30 {s5}"
        )
        run(cmd_s5)

        # Concatenate scenes and mix audio track
        concat_txt = f"{tmpdir}/concat.txt"
        with open(concat_txt, "w") as f:
            f.write(f"file '{s1}'\nfile '{s2}'\nfile '{s3}'\nfile '{s4}'\nfile '{s5}'\n")

        print(">> Assembling final video and audio track...")
        final_cmd = (
            f"ffmpeg -y -f concat -safe 0 -i {concat_txt} -ss 0 -t 35 -i {AUDIO_TRACK} "
            f"-filter_complex \"[1:a]afade=t=in:st=0:d=1,afade=t=out:st=33:d=2[aud]\" "
            f"-map 0:v -map \"[aud]\" -c:v copy -c:a aac -b:a 192k -shortest {OUTPUT_MP4}"
        )
        run(final_cmd)
        print(f"Trailer successfully created at: {OUTPUT_MP4}")

if __name__ == "__main__":
    main()

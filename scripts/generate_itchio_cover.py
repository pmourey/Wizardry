import subprocess

georgia_bold = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"

filter_complex = (
    "color=c=black:s=630x500[bg];"
    # Werdna on right
    "[1:v]scale=310:-1[werdna];"
    "[bg][werdna]overlay=305:95[bg1];"
    # Green dragon on left (scaled slightly to 232 wide so tail tip stays safely above SCENARIO I)
    "[2:v]scale=232:-1[dragon];"
    "[bg1][dragon]overlay=14:100[bg2];"
    # Red Wizardry sword logo
    "[0:v]crop=310:62:45:50,scale=450:90[logo];"
    "[bg2][logo]overlay=(W-w)/2:8[bg3];"
    # Gold subtitle bar for Quadrilogy
    f"[bg3]drawtext=fontfile='{georgia_bold}':text='THE ULTIMATE QUADRILOGY':fontcolor='#f6c544':fontsize=21:x=(w-text_w)/2:y=104:shadowcolor=black:shadowx=2:shadowy=2[bg4];"
    f"[bg4]drawtext=fontfile='{georgia_bold}':text='I  ·  II  ·  III  ·  IV':fontcolor='#fef08a':fontsize=16:x=(w-text_w)/2:y=129:shadowcolor=black:shadowx=2:shadowy=2[bg5];"
    
    # 4 scenario column headers (Scenario I, II, III, IV)
    f"[bg5]drawtext=fontfile='{georgia_bold}':text='SCENARIO I':fontcolor='#a1a1aa':fontsize=8.5:x=90-(text_w/2):y=297:shadowcolor=black:shadowx=1:shadowy=1[bg6];"
    f"[bg6]drawtext=fontfile='{georgia_bold}':text='SCENARIO II':fontcolor='#a1a1aa':fontsize=8.5:x=240-(text_w/2):y=297:shadowcolor=black:shadowx=1:shadowy=1[bg7];"
    f"[bg7]drawtext=fontfile='{georgia_bold}':text='SCENARIO III':fontcolor='#a1a1aa':fontsize=8.5:x=390-(text_w/2):y=297:shadowcolor=black:shadowx=1:shadowy=1[bg8];"
    f"[bg8]drawtext=fontfile='{georgia_bold}':text='SCENARIO IV':fontcolor='#a1a1aa':fontsize=8.5:x=540-(text_w/2):y=297:shadowcolor=black:shadowx=1:shadowy=1[bg9];"

    # 4 scenario titles centered under each column
    f"[bg9]drawtext=fontfile='{georgia_bold}':text='PROVING GROUNDS':fontcolor='#f1f5f9':fontsize=10:x=90-(text_w/2):y=311:shadowcolor=black:shadowx=1:shadowy=1[bg10];"
    f"[bg10]drawtext=fontfile='{georgia_bold}':text='KNIGHT OF DIAMONDS':fontcolor='#67e8f9':fontsize=10:x=240-(text_w/2):y=311:shadowcolor=black:shadowx=1:shadowy=1[bg11];"
    f"[bg11]drawtext=fontfile='{georgia_bold}':text='LEGACY OF LLYLGAMYN':fontcolor='#f472b6':fontsize=10:x=390-(text_w/2):y=311:shadowcolor=black:shadowx=1:shadowy=1[bg12];"
    f"[bg12]drawtext=fontfile='{georgia_bold}':text='RETURN OF WERDNA':fontcolor='#f87171':fontsize=10:x=540-(text_w/2):y=311:shadowcolor=black:shadowx=1:shadowy=1[bg13];"

    # Bottom banner
    f"[bg13]drawtext=fontfile='{georgia_bold}':text='+ 9 RETRO APPLE II EXPANSIONS  ·  13 COMPLETE SCENARIOS  ·  FULL 3D REMASTER':fontcolor='#e2e8f0':fontsize=11.5:x=(w-text_w)/2:y=336:shadowcolor=black:shadowx=2:shadowy=2[bg14];"

    # 4 canonical monster sprites along the bottom (Opus I, II, III, IV)
    # 0: Arch-Mage (Wiz 1)
    # 1: Knight of Diamonds (Wiz 2)
    # 2: L'Kbreth Dragon (Wiz 3)
    # 3: Demon Lord (Wiz 4)
    "[3:v]scale=120:86:flags=neighbor[m1];"
    "[4:v]scale=120:86:flags=neighbor[m2];"
    "[5:v]scale=120:86:flags=neighbor[m3];"
    "[6:v]scale=120:86:flags=neighbor[m4];"
    "[bg14][m1]overlay=30:375[bg15];"
    "[bg15][m2]overlay=180:375[bg16];"
    "[bg16][m3]overlay=330:375[bg17];"
    "[bg17][m4]overlay=480:375[bg18];"

    # Labels under each monster
    f"[bg18]drawtext=fontfile='{georgia_bold}':text='Arch-Mage':fontcolor='#94a3b8':fontsize=9:x=90-(text_w/2):y=474:shadowcolor=black:shadowx=1:shadowy=1[bg19];"
    f"[bg19]drawtext=fontfile='{georgia_bold}':text='Knight of Diamonds':fontcolor='#94a3b8':fontsize=9:x=240-(text_w/2):y=474:shadowcolor=black:shadowx=1:shadowy=1[bg20];"
    f"[bg20]drawtext=fontfile='{georgia_bold}':text='L’Kbreth Dragon':fontcolor='#94a3b8':fontsize=9:x=390-(text_w/2):y=474:shadowcolor=black:shadowx=1:shadowy=1[bg21];"
    f"[bg21]drawtext=fontfile='{georgia_bold}':text='Demon Lord':fontcolor='#94a3b8':fontsize=9:x=540-(text_w/2):y=474:shadowcolor=black:shadowx=1:shadowy=1[bg22];"

    # Gold frame border around image
    "[bg22]drawbox=x=0:y=0:w=630:h=500:color=#d97706@0.7:t=2[out]"
)

cmd = [
    "ffmpeg", "-y", "-loglevel", "error",
    "-i", "/tmp/wiz_pics/we-love-wizardry-front.jpg",
    "-i", "/tmp/wiz_pics/werdna6.jpg",
    "-i", "/tmp/wiz_pics/gdrago7.jpg",
    "-i", "src/assets/monsters/proving-grounds/pic8.png",
    "-i", "src/assets/monsters/knight-of-diamonds/pic4.png",
    "-i", "src/assets/monsters/legacy-of-llylgamyn/pic0.png",
    "-i", "src/assets/monsters/proving-grounds/pic17.png",
    "-filter_complex", filter_complex,
    "-map", "[out]",
    "-frames:v", "1",
    "/tmp/cover_final.png"
]
subprocess.run(cmd, check=True)
print("Generated /tmp/cover_final.png")

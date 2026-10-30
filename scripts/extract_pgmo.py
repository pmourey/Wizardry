#!/usr/bin/env python3
"""
Extracts the Wizardry I (Proving Grounds of the Mad Overlord) scenario database
(items, monsters, spell table, treasure tables, 10 maze levels, messages & events)
from an Apple II UCSD-Pascal scenario disk image (.dsk, DOS-ordered) and writes
src/data/provingGroundsData.ts.

Record layouts come from the reverse-engineered Pascal source (Wizardry.Code).

Also writes the 20 monster pictures (80x50, 1 bit/pixel, LSB first, SPCCHRS records)
as transparent PNGs into src/assets/monsters/pic<N>.png.

Usage: python3 scripts/extract_pgmo.py <scenario.dsk> [out.ts]
"""
import json
import os
import struct
import sys
import zlib

ALIGN = ['UNALIGN', 'GOOD', 'NEUTRAL', 'EVIL']
OBJT = ['WEAPON', 'ARMOR', 'SHIELD', 'HELMET', 'GAUNTLET', 'SPECIAL', 'MISC']
CLS = ['FIGHTER', 'MAGE', 'PRIEST', 'THIEF', 'BISHOP', 'SAMURAI', 'LORD', 'NINJA']
SQ = ['NORMAL', 'STAIRS', 'PIT', 'CHUTE', 'SPINNER', 'DARK', 'TRANSFER', 'OUCHY',
      'BUTTONZ', 'ROCKWATE', 'FIZZLE', 'SCNMSG', 'ENCOUNTE']
WALL = ['OPEN', 'WALL', 'DOOR', 'HIDEDOOR']
SPEC_KIND = {0: 'NONE', 1: 'MESSAGE', 2: 'ITEM_PICKUP', 3: 'WADE', 4: 'SEARCH_FIGHT', 5: 'ITEM_TO_PASS',
             6: 'ALIGNMENT_CHECK', 7: 'ARMOR_CLASS_MOD', 8: 'BACK_TO_CASTLE', 9: 'LOOKOUT',
             10: 'RIDDLE', 11: 'FEE'}
SPEC_TARGET = ['GENERIC', 'PERSON', 'GROUP']


def blocks(path):
    """DOS-ordered 140K image -> list of 512-byte UCSD blocks."""
    d = open(path, 'rb').read()
    s0 = [0, 13, 11, 9, 7, 5, 3, 1]
    s1 = [14, 12, 10, 8, 6, 4, 2, 15]
    out = []
    for b in range(len(d) // 512):
        t, k = divmod(b, 8)
        out.append(d[(t * 16 + s0[k]) * 256:(t * 16 + s0[k] + 1) * 256] +
                   d[(t * 16 + s1[k]) * 256:(t * 16 + s1[k] + 1) * 256])
    return out


def read_files(path):
    bl = blocks(path)
    dirb = b''.join(bl[2:6])
    n = struct.unpack('<H', dirb[16:18])[0]
    files = {}
    for i in range(1, n + 1):
        e = dirb[i * 26:(i + 1) * 26]
        fb, lb = struct.unpack('<HH', e[0:4])
        name = e[7:7 + e[6]].decode('latin1')
        files[name] = b''.join(bl[fb:lb])
    return files


def i16(b, o):
    return struct.unpack_from('<h', b, o)[0]


def pstr(b, o):
    return b[o + 1:o + 1 + b[o]].decode('latin1')


def wlong(b, o):
    lo, mid, hi = struct.unpack_from('<hhh', b, o)
    return lo + mid * 10000 + hi * 100000000


def packed(b, o, n, bw):
    per = 16 // bw
    return [(struct.unpack_from('<H', b, o + (i // per) * 2)[0] >> ((i % per) * bw)) & ((1 << bw) - 1)
            for i in range(n)]


def flags(b, o, n):
    return [i for i, v in enumerate(packed(b, o, n, 1)) if v]


def hp(b, o):
    return {'level': i16(b, o), 'hpFac': i16(b, o + 2), 'hpMinAdd': i16(b, o + 4)}


def monster_exp(m, sppc3):
    """Port of CALCKILL (REWARDS2.TEXT): experience per kill is computed, not stored."""
    def mult(times, amount):
        return 0 if times == 0 else amount * 2 ** (times - 1)
    h = m['hp']
    e = h['level'] * h['hpFac'] * (40 if m['breathe'] else 20)
    e += mult(m['mageSpells'], 35) + mult(m['priestSpells'], 35)
    e += mult(m['drainAmount'], 200) + mult(m['healPts'], 90)
    e += 40 * (11 - m['ac'])
    if m['attackCount'] > 1:
        e += mult(m['attackCount'], 30)
    if m['magicResistance'] > 0:
        e += mult(m['magicResistance'] // 10 + 1, 40)
    e += mult(len([x for x in m['resistances'] if 1 <= x <= 6]), 35)
    e += mult(len(m['sppc']), 40)
    return e


class Scenario:
    def __init__(self, path):
        files = read_files(path)
        self.d = files['SCENARIO.DATA']
        self.m = files['SCENARIO.MESGS']
        self.bloff = struct.unpack_from('<8h', self.d, 42 + 48)
        self.r2b = struct.unpack_from('<8h', self.d, 42)
        self.rdk = struct.unpack_from('<8h', self.d, 42 + 16)
        self.name = pstr(self.d, 0)

    def rec(self, t, i, size):
        blk = self.bloff[t] + 2 * (i // self.r2b[t])
        off = size * (i % self.r2b[t])
        return self.d[blk * 512 + off:blk * 512 + off + size]

    def spells(self):
        p = 42 + 64 + 60 + 80 + 72 + 40 + 8
        hashes = list(struct.unpack_from('<51h', self.d, p))
        p += 102
        grp = packed(self.d, p, 51, 3)
        p += ((51 + 4) // 5) * 2
        tgt = packed(self.d, p, 51, 2)
        return [{'id': i, 'hash': hashes[i], 'tier': grp[i], 'target': SPEC_TARGET[tgt[i]]} for i in range(51)]

    def exp_tables(self):
        """ZEXP record (type 7): TEXP = ARRAY[FIGHTER..NINJA] OF ARRAY[0..12] OF TWIZLONG.
        Index 0 is the per-level increment after level 13; indices 1..12 are cumulative XP for levels 2..13."""
        zexp_off = self.bloff[7] * 512
        return {
            c: [wlong(self.d, zexp_off + (ci * 13 + li) * 6) for li in range(13)]
            for ci, c in enumerate(CLS)
        }

    def items(self):
        out = []
        for i in range(self.rdk[4]):
            b = self.rec(4, i, 78)
            cu = packed(b, 54, 8, 1)
            out.append({
                'id': i, 'name': pstr(b, 0), 'nameUnknown': pstr(b, 16), 'objType': OBJT[i16(b, 32)],
                'align': ALIGN[i16(b, 34)], 'cursed': bool(i16(b, 36)), 'special': i16(b, 38),
                'changeTo': i16(b, 40), 'changeChance': i16(b, 42), 'price': wlong(b, 44),
                'boltacStock': i16(b, 50), 'spellPower': i16(b, 52),
                'classUse': {c: bool(cu[k]) for k, c in enumerate(CLS)}, 'healPts': i16(b, 56),
                'protVs2': flags(b, 58, 16), 'protVs3': flags(b, 60, 16),
                'armorMod': i16(b, 62), 'wepHitMod': i16(b, 64), 'wepHpDam': hp(b, 66),
                'extraSwings': i16(b, 72), 'critHit': bool(i16(b, 74)), 'wepVsType': flags(b, 76, 14)})
        return out

    def monsters(self):
        out = []
        for i in range(self.rdk[2]):
            b = self.rec(2, i, 158)
            n = i16(b, 82)
            sppc = flags(b, 156, 16)
            m = {
                'id': i, 'name': pstr(b, 32), 'namePlural': pstr(b, 48), 'nameUnknown': pstr(b, 0),
                'nameUnknownPlural': pstr(b, 16), 'picId': i16(b, 64), 'appear': hp(b, 66), 'level': i16(b, 72),
                'hp': hp(b, 72), 'monsterClass': i16(b, 78), 'ac': i16(b, 80), 'attackCount': n,
                'attacks': [hp(b, 84 + 6 * k) for k in range(n)], 'expReward': 0,
                'drainAmount': i16(b, 132), 'healPts': i16(b, 134), 'reward1': i16(b, 136),
                'reward2': i16(b, 138), 'teamId': i16(b, 140), 'teamPercent': i16(b, 142),
                'mageSpells': i16(b, 144), 'priestSpells': i16(b, 146), 'unique': i16(b, 148),
                'breathe': i16(b, 150), 'magicResistance': i16(b, 152),
                'resistances': flags(b, 154, 16), 'sppc': sppc}
            m['level'] = m['hp']['level']
            m['expReward'] = monster_exp(m, None)
            m['specialPower'] = {k: True for k, bit in
                                 [('stone', 0), ('poison', 1), ('paralyze', 2), ('criticalHit', 3),
                                  ('sleepResist', 4), ('fleeChance', 5), ('callHelp', 6)] if bit in sppc}
            del m['sppc']
            out.append(m)
        return out

    def rewards(self):
        out = []
        for i in range(self.rdk[3]):
            b = self.rec(3, i, 168)
            entries = []
            for k in range(i16(b, 4)):
                o = 6 + 18 * k
                v = list(struct.unpack_from('<7h', b, o + 4))
                if i16(b, o + 2):
                    e = {'percent': i16(b, o), 'type': 'ITEM', 'minIndex': v[0], 'factor': v[1],
                         'maxTimes': v[2], 'range': v[3], 'percentBigger': v[4]}
                else:
                    e = {'percent': i16(b, o), 'type': 'GOLD', 'tries': v[0], 'average': v[1], 'minAdd': v[2],
                         'multiplier': v[3], 'tries2': v[4], 'average2': v[5], 'minAdd2': v[6]}
                entries.append(e)
            out.append({'id': i, 'chest': bool(i16(b, 0)), 'trapTypes': flags(b, 2, 8), 'entries': entries})
        return out

    def characters(self, scenario_id='proving-grounds'):
        """Extract active ZCHAR records (TCHAR = 208 bytes) stored on the scenario disk."""
        status_names = ['OK', 'AFRAID', 'ASLEEP', 'PLYZE', 'STONED', 'DEAD', 'ASHES', 'LOST']
        race_names = ['NORACE', 'HUMAN', 'ELF', 'DWARF', 'GNOME', 'HOBBIT']
        attr_names = ['STRENGTH', 'IQ', 'PIETY', 'VITALITY', 'AGILITY', 'LUCK']
        out = []
        for i in range(self.rdk[5]):
            b = self.rec(5, i, 208)
            st_idx = i16(b, 40)
            status = status_names[st_idx] if 0 <= st_idx < 8 else 'LOST'
            name = pstr(b, 0).strip()
            if status in ('LOST', 'DEAD', 'ASHES') or not name:
                continue
            r_idx = i16(b, 34)
            c_idx = i16(b, 36)
            a_idx = i16(b, 42)
            race = race_names[r_idx] if 1 <= r_idx <= 5 else 'HUMAN'
            cls = CLS[c_idx] if 0 <= c_idx < 8 else 'FIGHTER'
            align = ALIGN[a_idx] if 1 <= a_idx <= 3 else 'NEUTRAL'
            attrs = packed(b, 44, 6, 5)
            luckskil = packed(b, 48, 5, 5)
            gold = wlong(b, 52)
            posscnt = i16(b, 58)
            poss = []
            for k in range(min(8, max(0, posscnt))):
                po = 60 + 8 * k
                poss.append({
                    'equipped': bool(i16(b, po)),
                    'cursed': bool(i16(b, po + 2)),
                    'identified': bool(i16(b, po + 4)),
                    'itemIndex': i16(b, po + 6)
                })
            exp = wlong(b, 124)
            maxlev = max(1, i16(b, 130))
            charlev = max(1, i16(b, 132))
            hpleft = max(1, i16(b, 134))
            hpmax = max(hpleft, i16(b, 136))
            spellskn = [bool(v) for v in packed(b, 138, 50, 1)] + [False]
            magesp = [0] + [max(0, i16(b, 146 + 2 * k)) for k in range(7)]
            priestsp = [0] + [max(0, i16(b, 160 + 2 * k)) for k in range(7)]
            hpcalcmd = i16(b, 174)
            armorcl = i16(b, 176)
            healpts = i16(b, 178)
            crithitm = bool(i16(b, 180))
            swingcnt = max(1, i16(b, 182))
            hpdamrc = hp(b, 184)
            out.append({
                'id': f'{scenario_id}-char-{len(out) + 1}',
                'name': name,
                'race': race,
                'class': cls,
                'align': align,
                'status': 'OK',
                'age': max(18 * 52, i16(b, 38)),
                'attrib': {attr_names[k]: max(3, min(18, attrs[k])) for k in range(6)},
                'luckSkill': luckskil,
                'gold': max(0, gold),
                'exp': max(0, exp),
                'maxLevel': maxlev,
                'charLevel': charlev,
                'hpLeft': hpleft,
                'hpMax': hpmax,
                'spellsKnown': spellskn,
                'mageSpells': magesp,
                'priestSpells': priestsp,
                'armorClass': armorcl,
                'healPts': healpts,
                'critHit': crithitm,
                'swingCount': swingcnt,
                'wepDamage': hpdamrc,
                'hitMod': hpcalcmd,
                'poisonAmount': 0,
                'awards': [0, 0, 0, 0, 0],
                'inMaze': False,
                'possessions': poss
            })
        return out

    def messages(self):
        out = []
        for i in range(len(self.m) // 512 * 12):
            r = self.m[(i // 12) * 512 + 42 * (i % 12):(i // 12) * 512 + 42 * (i % 12) + 42]
            out.append({'text': pstr(r, 0), 'end': bool(r[40] or r[41])})
        return out

    def message_text(self, msgs, idx):
        lines = []
        while 0 <= idx < len(msgs):
            lines.append(msgs[idx]['text'])
            if msgs[idx]['end']:
                break
            idx += 1
        return lines

    def mazes(self, items, monsters, msgs):
        out = []
        for lv in range(10):
            o = (self.bloff[1] + 2 * lv) * 512
            b = self.d[o:o + 1024]

            def walls(base):
                return [''.join(str(v) for v in packed(b[base + 6 * x:base + 6 * x + 6], 0, 20, 2)) for x in range(20)]
            fights = [''.join(str(v) for v in packed(b[480 + 4 * x:484 + 4 * x], 0, 20, 1)) for x in range(20)]
            extra = [packed(b[560 + 10 * x:570 + 10 * x], 0, 20, 4) for x in range(20)]
            types = packed(b[760:768], 0, 16, 4)
            a0 = list(struct.unpack_from('<16h', b, 768))
            a1 = list(struct.unpack_from('<16h', b, 800))
            a2 = list(struct.unpack_from('<16h', b, 832))
            calc = [{'minEnemy': i16(b, 864 + 10 * k), 'multWorse': i16(b, 866 + 10 * k),
                     'worse01': i16(b, 868 + 10 * k), 'range0n': i16(b, 870 + 10 * k),
                     'percWorse': i16(b, 872 + 10 * k)} for k in range(3)]
            events = []
            for x in range(20):
                for y in range(20):
                    s = extra[x][y]
                    if types[s] != 0:
                        events.append(self.event(lv + 1, x, y, SQ[types[s]], a0[s], a1[s], a2[s], items, monsters, msgs))
            out.append({
                'level': lv + 1,
                'w': walls(0), 's': walls(120), 'e': walls(240), 'n': walls(360), 'fights': fights,
                'sqrExtra': [''.join('%x' % v for v in row) for row in extra],
                'extraDefs': [{'type': SQ[types[i]], 'aux0': a0[i], 'aux1': a1[i], 'aux2': a2[i]} for i in range(16)],
                'enemyCalc': calc, 'events': events})
        return out

    def event(self, level, x, y, typ, a0, a1, a2, items, monsters, msgs):
        ev = {'x': x, 'y': y, 'type': typ, 'aux0': a0, 'aux1': a1, 'aux2': a2}
        if typ == 'STAIRS':
            ev['description'] = ('Stairs up to the castle' if a0 == 0 else
                                 'Stairs %s to level %d (E%d N%d)' % ('down' if a0 > level else 'up', a0, a2, a1))
        elif typ == 'TRANSFER':
            ev['description'] = 'Teleporter to level %d (E%d N%d)' % (a0, a2, a1)
        elif typ == 'PIT':
            ev['description'] = 'Pit: %d+%dd%d damage' % (a0, a2, a1)
        elif typ == 'OUCHY':
            ev['description'] = 'Ouch: %d+%dd%d damage' % (a0, a2, a1)
        elif typ == 'CHUTE':
            ev['description'] = 'Chute dropping to a lower level'
        elif typ == 'BUTTONZ':
            ev['description'] = 'Elevator: buttons for levels %d to %d' % (a2, a1)
        elif typ == 'ENCOUNTE':
            first = monsters[a2]['name'] if 0 <= a2 < len(monsters) else '?'
            ev['description'] = 'Fixed encounter: %s (monster #%d%s), %s' % (
                first, a2, '..%d' % (a2 + a1 - 1) if a1 > 1 else '',
                'repeats forever' if a0 < 0 else ('%d time(s)' % a0 if a0 else 'disabled'))
            ev['monsterId'] = a2
        elif typ == 'SCNMSG':
            kind = SPEC_KIND.get(a2, 'UNKNOWN')
            ev['kind'] = kind
            ev['description'] = kind.replace('_', ' ').capitalize()
            if a2 != 0 and a1 >= 0:
                ev['message'] = self.message_text(msgs, a1)
            # AUX0 for MESSAGE/SEARCH_FIGHT/BACK_TO_CASTLE: >0 n uses, 0 disabled, -1..-999 one use,
            # <=-1000 always available with payload -(AUX0+1000)
            payload = -(a0 + 1000) if a0 <= -1000 else abs(a0)
            if a2 in (1, 4, 8):
                ev['uses'] = 'DISABLED' if a0 == 0 else ('ALWAYS' if a0 <= -1000 else ('ONCE' if a0 < 0 else a0))
            if kind in ('ITEM_PICKUP', 'ITEM_TO_PASS') and 0 <= payload < len(items):
                ev['description'] += ': %s (#%d)' % (items[payload]['name'], payload)
                ev['itemId'] = payload
            elif kind == 'SEARCH_FIGHT' and a0 > 0:
                mname = monsters[a0]['name'] if 0 <= a0 < len(monsters) else '?'
                ev['description'] += ': fight with %s (#%d)' % (mname, a0)
                ev['monsterId'] = a0
            elif kind == 'SEARCH_FIGHT' and a0 < 0 and 0 <= payload < len(items):
                ev['description'] += ': item %s (#%d)' % (items[payload]['name'], payload)
                ev['itemId'] = payload
            elif kind == 'RIDDLE':
                ev['answer'] = ' '.join(self.message_text(msgs, a0))
            elif kind == 'FEE':
                ev['fee'] = ' '.join(self.message_text(msgs, a0))
            elif kind == 'ALIGNMENT_CHECK':
                ev['description'] += ' (mask %d)' % a0
        else:
            ev['description'] = typ.capitalize()
        return ev


# Apple II High-Resolution NTSC Artifact Color Palette (ENEMYPIC at screen column 1, X=7..76)
APPLE2_GREEN  = (67, 200, 0, 255)
APPLE2_PURPLE = (187, 54, 255, 255)
APPLE2_ORANGE = (249, 86, 29, 255)
APPLE2_BLUE   = (7, 168, 224, 255)
APPLE2_WHITE  = (255, 255, 255, 255)
APPLE2_BLACK  = (0, 0, 0, 255)


def png_rgba_color(rows_rgba):
    """Encode a 2D array of (R, G, B, A) tuples into a compressed PNG byte string."""
    h, w = len(rows_rgba), len(rows_rgba[0])
    raw = b''.join(b'\x00' + b''.join(bytes(px) for px in r) for r in rows_rgba)

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) +
            chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def decode_apple2_monster_bitmap(raw500: bytes, scale: int = 2):
    """Decode a 500-byte Apple II SPCCHRS record (50 rows x 10 bytes/row).
    Per ENEMYPIC (COMBAT.TEXT.pas) and WizardryApp (ImageGraphic.java):
    - Each byte encodes 7 horizontal pixels in bits 0..6 (LSB first) -> 10 * 7 = 70x50 pixels.
    - Bit 7 (MSB, 0x80) selects the NTSC color palette:
        hi=0 -> Green / Purple palette
        hi=1 -> Orange / Blue palette
    - Because ENEMYPIC draws starting at $2001 (byte offset 1, screen X = 7, which is odd):
        - Two or more adjacent 1 bits (C=1 and (L=1 or R=1)) render as WHITE.
        - An isolated 1 bit (L=0, C=1, R=0) renders as Green/Orange (even x) or Purple/Blue (odd x).
        - A 0 bit between two 1 bits (L=1, C=0, R=1) fills with the NTSC carrier color of its neighbors
          so solid color fills do not have vertical black stripes.
    """
    rows_rgba = []
    for y in range(50):
        row_bytes = raw500[y * 10:(y + 1) * 10]
        bits = []
        hibits = []
        for byte in row_bytes:
            hi = (byte >> 7) & 1
            for m in range(7):
                bits.append((byte >> m) & 1)
                hibits.append(hi)
        row_colors = []
        for x in range(70):
            L = bits[x - 1] if x > 0 else 0
            C = bits[x]
            R = bits[x + 1] if x < 69 else 0
            hi = hibits[x]
            if C == 1:
                if L == 1 or R == 1:
                    col = APPLE2_WHITE
                elif hi == 0:
                    col = APPLE2_GREEN if (x % 2 == 0) else APPLE2_PURPLE
                else:
                    col = APPLE2_ORANGE if (x % 2 == 0) else APPLE2_BLUE
            else:
                if L == 1 and R == 1:
                    if hi == 0:
                        col = APPLE2_PURPLE if (x % 2 == 0) else APPLE2_GREEN
                    else:
                        col = APPLE2_BLUE if (x % 2 == 0) else APPLE2_ORANGE
                else:
                    col = APPLE2_BLACK
            for _ in range(scale):
                row_colors.append(col)
        for _ in range(scale):
            rows_rgba.append(row_colors)
    return rows_rgba


def write_monster_pictures(sc, out_dir='src/assets/monsters/proving-grounds'):
    """SPCCHRS records (type 6): 512 bytes each, 2 per 1024-byte pair; 500 bytes = 70x50 Apple II HGR bitmap."""
    data = sc.d
    bloff = sc.bloff[6]
    os.makedirs(out_dir, exist_ok=True)
    for i in range(20):
        o = (bloff + 2 * (i // 2)) * 512 + 512 * (i % 2)
        rows_rgba = decode_apple2_monster_bitmap(data[o:o + 500], scale=2)
        with open(os.path.join(out_dir, 'pic%d.png' % i), 'wb') as f:
            f.write(png_rgba_color(rows_rgba))
    print('wrote 20 Apple II color monster pictures (140x100) to', out_dir)


def recolor_existing_80x50_pngs(monsters_root='src/assets/monsters'):
    """Losslessly recover the 500 raw SPCCHRS bytes from any 80x50 8-bit/byte PNGs
    and re-render them as authentic 140x100 Apple II NTSC color PNGs."""
    total = 0
    for scen_id in sorted(os.listdir(monsters_root)):
        scen_dir = os.path.join(monsters_root, scen_id)
        if not os.path.isdir(scen_dir):
            continue
        for i in range(20):
            p = os.path.join(scen_dir, f'pic{i}.png')
            if not os.path.exists(p):
                continue
            with open(p, 'rb') as f:
                png_bytes = f.read()
            w, h = struct.unpack('>II', png_bytes[16:24])
            if (w, h) != (80, 50):
                continue
            pos = 8
            idat = b''
            while pos < len(png_bytes):
                length = struct.unpack('>I', png_bytes[pos:pos + 4])[0]
                ctype = png_bytes[pos + 4:pos + 8]
                if ctype == b'IDAT':
                    idat += png_bytes[pos + 8:pos + 8 + length]
                pos += 12 + length
            raw = zlib.decompress(idat)
            stride = w * 4 + 1
            raw500 = bytearray()
            for y in range(50):
                row_raw = raw[y * stride + 1:(y + 1) * stride]
                for bx in range(10):
                    b = 0
                    for m in range(8):
                        if row_raw[(bx * 8 + m) * 4 + 3] > 0:
                            b |= (1 << m)
                    raw500.append(b)
            rows_rgba = decode_apple2_monster_bitmap(bytes(raw500), scale=2)
            with open(p, 'wb') as f:
                f.write(png_rgba_color(rows_rgba))
            total += 1
    print(f're-rendered {total} monster pictures in Apple II NTSC color (140x100)')


def decode_ucsd_text(raw: bytes) -> str:
    """Decode a UCSD-Pascal .TEXT file from a disk image.
    The first 1024 bytes (blocks 0..1) are the UCSD text editor header page.
    Each subsequent 1024-byte page contains CR-terminated lines preceded by an optional
    DLE (0x10) + indentation byte (indent = byte - 32 spaces) and padded with NUL (0x00).
    """
    lines = []
    for page_offset in range(1024, len(raw), 1024):
        page = raw[page_offset:page_offset + 1024]
        i = 0
        n = len(page)
        while i < n:
            b = page[i]
            if b == 0:
                break
            indent = 0
            if b == 0x10:
                i += 1
                if i < n:
                    indent = max(0, page[i] - 32)
                    i += 1
            line_bytes = bytearray()
            while i < n and page[i] != 0x0D and page[i] != 0:
                line_bytes.append(page[i])
                i += 1
            if i < n and page[i] == 0x0D:
                i += 1
            lines.append(' ' * indent + line_bytes.decode('ascii', errors='replace'))
    return '\n'.join(lines) + '\n'


def extract_pascal_source(disks_dir: str, out_dir: str = 'pascal_source'):
    """Extract all UCSD-Pascal .TEXT source files from Wiz1A.DSK..Wiz1E.DSK
    into out_dir/<Disk>/<Unit>.TEXT.pas and build a consolidated reference file
    out_dir/Wizardry1_UCSD_Pascal.pas following WIZ.TEXT compilation include order.
    """
    os.makedirs(out_dir, exist_ok=True)
    extracted = {}
    for dsk in ['Wiz1A.DSK', 'Wiz1B.DSK', 'Wiz1C.DSK', 'Wiz1D.DSK', 'Wiz1E.DSK']:
        dsk_path = os.path.join(disks_dir, dsk)
        if not os.path.exists(dsk_path):
            continue
        disk_tag = os.path.splitext(dsk)[0]
        disk_out = os.path.join(out_dir, disk_tag)
        os.makedirs(disk_out, exist_ok=True)
        files = read_files(dsk_path)
        extracted[disk_tag] = {}
        for name, raw in files.items():
            if name.endswith('.TEXT'):
                text = decode_ucsd_text(raw)
                extracted[disk_tag][name] = text
                unit_path = os.path.join(disk_out, name + '.pas')
                with open(unit_path, 'w', encoding='utf-8') as f:
                    f.write(f'(* === {dsk} : {name} === *)\n')
                    f.write(text)

    # Build consolidated Pascal source in exact WIZ.TEXT compilation order
    compile_order = [
        ('Wiz1A', 'WIZ.TEXT'),
        ('Wiz1C', 'UTILITIE.TEXT'),
        ('Wiz1B', 'UTILITIE2.TEXT'),
        ('Wiz1B', 'UTILITIE3.TEXT'),
        ('Wiz1B', 'SHOPS.TEXT'),
        ('Wiz1A', 'SHOPS2.TEXT'),
        ('Wiz1B', 'SPECIALS.TEXT'),
        ('Wiz1B', 'SPECIALS2.TEXT'),
        ('Wiz1B', 'COMBAT.TEXT'),
        ('Wiz1B', 'COMBAT2.TEXT'),
        ('Wiz1B', 'COMBAT3.TEXT'),
        ('Wiz1B', 'COMBAT4.TEXT'),
        ('Wiz1B', 'COMBAT5.TEXT'),
        ('Wiz1C', 'CASTLE.TEXT'),
        ('Wiz1C', 'CASTLE2.TEXT'),
        ('Wiz1C', 'ROLLER.TEXT'),
        ('Wiz1C', 'CAMP.TEXT'),
        ('Wiz1C', 'CAMP2.TEXT'),
        ('Wiz1C', 'REWARDS.TEXT'),
        ('Wiz1C', 'REWARDS2.TEXT'),
        ('Wiz1C', 'RUNNER.TEXT'),
        ('Wiz1C', 'RUNNER2.TEXT'),
        ('Wiz1A', 'WIZ2.TEXT'),
        # 6502 Assembler routines (Wiz1D)
        ('Wiz1D', 'CLRRECT.TEXT'),
        ('Wiz1D', 'MVCURSOR.TEXT'),
        ('Wiz1D', 'PRGRCHR.TEXT'),
        ('Wiz1D', 'DRAWLINE.TEXT'),
        ('Wiz1D', 'CLRPICT.TEXT'),
        ('Wiz1D', 'KEYAVAIL.TEXT'),
        ('Wiz1D', 'RANDOM.TEXT'),
        # Boot / Scenario Utilities (Wiz1E)
        ('Wiz1E', 'STARTUP.TEXT'),
        ('Wiz1E', 'WIZUTILB.TEXT'),
        ('Wiz1E', 'WIZUTILC.TEXT'),
        ('Wiz1E', 'TITLELOA.TEXT'),
        ('Wiz1E', 'OPTIONS.TEXT'),
        ('Wiz1E', 'LZDECOMP.TEXT'),
        ('Wiz1E', 'CHKSYNCH.TEXT'),
        ('Wiz1E', 'SCREENPT.TEXT'),
    ]
    combined_path = os.path.join(out_dir, 'Wizardry1_UCSD_Pascal.pas')
    total_units = 0
    with open(combined_path, 'w', encoding='utf-8') as f:
        f.write('(* ========================================================================== *)\n')
        f.write('(* WIZARDRY I: PROVING GROUNDS OF THE MAD OVERLORD — UCSD PASCAL SOURCE CODE  *)\n')
        f.write('(* Extracted directly from Apple II UCSD-Pascal disk images (Wiz1A..Wiz1E.DSK)*)\n')
        f.write('(* by scripts/extract_pgmo.py (UCSD block reader compatible with WizardryApp) *)\n')
        f.write('(* ========================================================================== *)\n\n')
        for disk_tag, unit_name in compile_order:
            txt = extracted.get(disk_tag, {}).get(unit_name)
            if txt:
                total_units += 1
                f.write('\n(* ========================================================================== *)\n')
                f.write(f'(* DISK: {disk_tag}.DSK | FILE: {unit_name:<43} *)\n')
                f.write('(* ========================================================================== *)\n\n')
                f.write(txt)
    print(f'extracted {total_units} UCSD-Pascal .TEXT units into {out_dir}/ and {combined_path}')


SCENARIO_DISKS = [
    ('proving-grounds', 'Wizardry-Proving-Grounds-v3.2-Scenario-18-Mar-2026.dsk', 'PROVING_GROUNDS'),
    ('black-stone', 'Wizardry-Black-Stone-v3.2-Scenario.dsk', 'BLACK_STONE'),
    ('catacombs-of-vlad', 'Wizardry-Catacombs-of-Vlad-v3.2-Scenario.dsk', 'CATACOMBS_OF_VLAD'),
    ('dragonquest', 'Wizardry-DragonQuest-v1.4-v3.2engine-Scenario.dsk', 'DRAGONQUEST'),
    ('knight-of-the-grave', 'Wizardry-Knight-of-the-Grave-v3.2-Scenario.dsk', 'KNIGHT_OF_THE_GRAVE'),
    ('scarlet-brotherhood', 'Wizardry-Scarlet-Brotherhood-of-Hsi-So-v3.2-Scenario.dsk', 'SCARLET_BROTHERHOOD'),
    ('nihonbashi', 'Wizardry-Nihonbashi-v3.2-Scenario.dsk', 'NIHONBASHI'),
    ('oconnors-mine', 'Wizardry-OConnors-Mine-v3.2-Scenario.dsk', 'OCONNORS_MINE'),
    ('emperors-seal', 'Wizardry-The-Emperors-Seal-v3.2-Scenario.dsk', 'EMPERORS_SEAL'),
    ('atomic-wasteland-2098', 'Wizardry-Atomic-Wasteland-2098-v1.2-with-Engine-v3.2-Scenario.dsk', 'ATOMIC_WASTELAND_2098'),
]


def extract_all_scenarios(dsk_dir: str, out_dir: str = 'src/data/scenarios'):
    """Extract all 9 alternate scenarios into src/data/scenarios/<id>Data.ts
    and monster pictures for all 10 scenarios into src/assets/monsters/<id>/pic0..19.png.
    """
    os.makedirs(out_dir, exist_ok=True)
    for scen_id, dsk_file, const_prefix in SCENARIO_DISKS:
        dsk_path = os.path.join(dsk_dir, dsk_file)
        if not os.path.exists(dsk_path):
            print('missing scenario disk:', dsk_path)
            continue
        sc = Scenario(dsk_path)
        # Write 20 monster pictures into src/assets/monsters/<scen_id>/pic0..19.png
        write_monster_pictures(sc, os.path.join('src/assets/monsters', scen_id))
        if scen_id == 'proving-grounds':
            continue

        items, monsters, msgs = sc.items(), sc.monsters(), sc.messages()
        exp_tables = sc.exp_tables()
        spells = sc.spells()
        rewards = sc.rewards()
        mazes = sc.mazes(items, monsters, msgs)
        chars = sc.characters(scen_id)

        out_ts = os.path.join(out_dir, f'{scen_id}Data.ts')
        with open(out_ts, 'w', encoding='utf-8') as f:
            f.write('/* eslint-disable */\n')
            f.write(f'// GENERATED by scripts/extract_pgmo.py from "{sc.name}" ({dsk_file}). Do not edit by hand.\n')
            f.write("import type { TClass, TItem, TMonster, TReward, PGSpellRecord, PGMessage, PGRawMaze, TCharacter } from '../../types/wizardry';\n\n")
            f.write(f'export const {const_prefix}_EXP_TABLES: Record<TClass, number[]> = ' + json.dumps(exp_tables, separators=(',', ':')) + ';\n\n')
            for k, typ, val in [
                (f'{const_prefix}_SPELL_TABLE', 'PGSpellRecord[]', spells),
                (f'{const_prefix}_ITEMS', 'TItem[]', items),
                (f'{const_prefix}_MONSTERS', 'TMonster[]', monsters),
                (f'{const_prefix}_REWARDS', 'TReward[]', rewards),
                (f'{const_prefix}_MESSAGES', 'PGMessage[]', msgs),
                (f'{const_prefix}_MAZES', 'PGRawMaze[]', mazes),
                (f'{const_prefix}_STARTER_PARTY', 'TCharacter[]', chars),
            ]:
                f.write(f'export const {k}: {typ} = [\n')
                for e in val:
                    f.write('  ' + json.dumps(e, separators=(',', ':')) + ',\n')
                f.write('];\n\n')
        print(f'wrote {out_ts} (items={len(items)}, monsters={len(monsters)}, mazes={len(mazes)}, chars={len(chars)})')


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    args = sys.argv[1:]
    if '--recolor-pngs' in args:
        recolor_existing_80x50_pngs('src/assets/monsters')
        return
    if '--all-scenarios' in args:
        idx = args.index('--all-scenarios')
        dsk_dir = args[idx + 1]
        extract_all_scenarios(dsk_dir)
        return
    pascal_dir = None
    if '--pascal-disks' in args:
        idx = args.index('--pascal-disks')
        pascal_dir = args[idx + 1]
        del args[idx:idx + 2]
    sc = Scenario(args[0])
    out = args[1] if len(args) > 1 else 'src/data/provingGroundsData.ts'
    items, monsters, msgs = sc.items(), sc.monsters(), sc.messages()
    exp_tables = sc.exp_tables()
    data = {
        'PG_SPELL_TABLE': sc.spells(), 'PG_ITEMS': items, 'PG_MONSTERS': monsters,
        'PG_REWARDS': sc.rewards(), 'PG_MESSAGES': msgs, 'PG_MAZES': sc.mazes(items, monsters, msgs)}
    types = {'PG_SPELL_TABLE': 'PGSpellRecord[]', 'PG_ITEMS': 'TItem[]', 'PG_MONSTERS': 'TMonster[]',
             'PG_REWARDS': 'TReward[]', 'PG_MESSAGES': 'PGMessage[]', 'PG_MAZES': 'PGRawMaze[]'}
    with open(out, 'w') as f:
        f.write('/* eslint-disable */\n// GENERATED by scripts/extract_pgmo.py from "%s". Do not edit by hand.\n' % sc.name)
        f.write("import type { TClass, TItem, TMonster, TReward, PGSpellRecord, PGMessage, PGRawMaze } from '../types/wizardry';\n\n")
        f.write('export const PG_EXP_TABLES: Record<TClass, number[]> = ' + json.dumps(exp_tables, separators=(',', ':')) + ';\n\n')
        for k, v in data.items():
            f.write('export const %s: %s = [\n' % (k, types[k]))
            for e in v:
                f.write('  ' + json.dumps(e, separators=(',', ':')) + ',\n')
            f.write('];\n\n')
    write_monster_pictures(sc, 'src/assets/monsters/proving-grounds')
    print('wrote', out, {k: len(v) for k, v in data.items()})
    if pascal_dir:
        extract_pascal_source(pascal_dir)


if __name__ == '__main__':
    main()

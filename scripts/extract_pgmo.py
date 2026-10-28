#!/usr/bin/env python3
"""
Extracts the Wizardry I (Proving Grounds of the Mad Overlord) scenario database
(items, monsters, spell table, treasure tables, 10 maze levels, messages & events)
from an Apple II UCSD-Pascal scenario disk image (.dsk, DOS-ordered) and writes
src/data/provingGroundsData.ts.

Record layouts come from the reverse-engineered Pascal source (Wizardry.Code).

Usage: python3 scripts/extract_pgmo.py <scenario.dsk> [out.ts]
"""
import json
import struct
import sys

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
                ev['description'] += ': fight with %s (#%d)' % (monsters[a0]['name'], a0)
                ev['monsterId'] = a0
            elif kind == 'SEARCH_FIGHT' and a0 < 0 and payload < len(items):
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


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    sc = Scenario(sys.argv[1])
    out = sys.argv[2] if len(sys.argv) > 2 else 'src/data/provingGroundsData.ts'
    items, monsters, msgs = sc.items(), sc.monsters(), sc.messages()
    data = {
        'PG_SPELL_TABLE': sc.spells(), 'PG_ITEMS': items, 'PG_MONSTERS': monsters,
        'PG_REWARDS': sc.rewards(), 'PG_MESSAGES': msgs, 'PG_MAZES': sc.mazes(items, monsters, msgs)}
    types = {'PG_SPELL_TABLE': 'PGSpellRecord[]', 'PG_ITEMS': 'TItem[]', 'PG_MONSTERS': 'TMonster[]',
             'PG_REWARDS': 'TReward[]', 'PG_MESSAGES': 'PGMessage[]', 'PG_MAZES': 'PGRawMaze[]'}
    with open(out, 'w') as f:
        f.write('/* eslint-disable */\n// GENERATED by scripts/extract_pgmo.py from "%s". Do not edit by hand.\n' % sc.name)
        f.write("import type { TItem, TMonster, TReward, PGSpellRecord, PGMessage, PGRawMaze } from '../types/wizardry';\n\n")
        for k, v in data.items():
            f.write('export const %s: %s = [\n' % (k, types[k]))
            for e in v:
                f.write('  ' + json.dumps(e, separators=(',', ':')) + ',\n')
            f.write('];\n\n')
    print('wrote', out, {k: len(v) for k, v in data.items()})


if __name__ == '__main__':
    main()

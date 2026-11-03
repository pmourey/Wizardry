import { TCharacter } from '../types/wizardry';

/**
 * Authentic UCSD Pascal chevrons table from CAMP2.TEXT.pas line 152:
 * COPY( '>!$#&*<?BCPKODG@', INDX + 1, 1)
 *
 * Index 0 (bit 0): '>' = Wizardry 1: Proving Grounds of the Mad Overlord (Overlord's Honor Guard)
 * Index 1 (bit 1): '!' = Wizardry 2: Knight of Diamonds (Staff of Gnilda)
 * Index 2 (bit 2): '$' = Wizardry 3: Legacy of Llylgamyn
 * Index 3 (bit 3): '#' = Wizardry 4: The Return of Werdna
 * Index 4 (bit 4): '&' = Wizardry 5: Heart of the Maelstrom
 */
export const CHEVRON_CHARS = ['>', '!', '$', '#', '&', '*', '<', '?', 'B', 'C', 'P', 'K', 'O', 'D', 'G', '@'];

/**
 * Returns the chevron characters string earned by the character (e.g. ">").
 */
export function getCharacterChevrons(hero: TCharacter | null | undefined): string {
  if (!hero || !hero.awards) return '';
  let res = '';

  // Pascal packed array was in LOSTXYL.AWARDS[4] (a 16-bit word).
  // In modern JSON characters, we also support awards[0] > 0 for Wiz 1, awards[1] > 0 for Wiz 2, etc.
  const bitmask =
    (hero.awards[4] || 0) |
    (hero.awards[0] ? 1 : 0) |
    (hero.awards[1] ? 2 : 0) |
    (hero.awards[2] ? 4 : 0) |
    (hero.awards[3] ? 8 : 0);

  for (let i = 0; i < CHEVRON_CHARS.length; i++) {
    if (bitmask & (1 << i)) {
      res += CHEVRON_CHARS[i];
    }
  }
  return res;
}

export function hasChevronAward(hero: TCharacter | null | undefined, symbol = '>'): boolean {
  return getCharacterChevrons(hero).includes(symbol);
}

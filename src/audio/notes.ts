const PITCH_CLASSES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Converts a note name such as "A4", "F#3" or "Bb2" to a frequency in Hz. */
export function noteToFrequency(note: string): number {
  const match = /^([A-G])([#b]?)(\d)$/.exec(note);
  if (!match) throw new Error(`Invalid note "${note}"`);
  const [, letter, accidental, octave] = match;
  const semitone = PITCH_CLASSES[letter] + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0);
  const midi = 12 * (Number(octave) + 1) + semitone;
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Parses a space separated note pattern; "." is a rest. */
export function parseNotes(pattern: string): (number | null)[] {
  return pattern
    .trim()
    .split(/\s+/)
    .map(token => (token === '.' ? null : noteToFrequency(token)));
}

/** Parses a drum pattern such as "x...x..."; "x" is a hit. */
export function parseHits(pattern: string): boolean[] {
  return [...pattern].map(ch => ch === 'x');
}

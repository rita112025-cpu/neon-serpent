import { TrackId } from '../types';

/**
 * Music is written as step patterns (one token = one 16th note).
 * Notes: "C4", "F#3", "Bb2"; "." is a rest. Drums: "x" = hit, "." = rest.
 * Each voice and drum loops on its own length, so patterns may differ in length.
 */
export interface VoiceDefinition {
  wave: OscillatorType;
  volume: number;
  /** Note length in steps. */
  length: number;
  notes: string;
  /** Repeats each note later and quieter. */
  echo?: { delaySteps: number; gain: number };
}

export interface TrackDefinition {
  name: string;
  bpm: number;
  voices: VoiceDefinition[];
  drums: { kick?: string; snare?: string; hat?: string };
}

export const TRACKS: Record<TrackId, TrackDefinition> = {
  meadow: {
    name: '晨光草原',
    bpm: 100,
    voices: [
      {
        wave: 'triangle',
        volume: 0.07,
        length: 3,
        notes: 'C3 . . . C3 . . . A2 . . . A2 . . . F2 . . . F2 . . . G2 . . . G2 . . .',
      },
      {
        wave: 'sine',
        volume: 0.05,
        length: 2,
        notes: 'E5 . G5 . A5 . G5 . E5 . D5 . C5 . . . D5 . E5 . G5 . E5 . D5 . . . . . . .',
      },
    ],
    drums: { kick: 'x.......x.......', hat: '....x.......x...' },
  },
  garden: {
    name: '花園跳躍',
    bpm: 112,
    voices: [
      { wave: 'triangle', volume: 0.07, length: 1, notes: 'G2 . G3 . D3 . G3 . C3 . C3 . D3 . D3 .' },
      {
        wave: 'square',
        volume: 0.025,
        length: 1,
        notes: 'B4 . D5 . G5 . D5 . E5 . G5 . A5 . F#5 . G5 . . . D5 . B4 . A4 . B4 . D5 . . .',
      },
    ],
    drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.' },
  },
  crossroads: {
    name: '十字街頭',
    bpm: 120,
    voices: [
      {
        wave: 'square',
        volume: 0.035,
        length: 1,
        notes: 'A2 . A2 A3 . A2 . . F2 . F2 F3 . F2 . . G2 . G2 G3 . G2 . . E2 . E2 E3 . E2 . .',
      },
      {
        wave: 'triangle',
        volume: 0.035,
        length: 1,
        notes:
          'A4 C5 E5 A5 E5 C5 A4 C5 F4 A4 C5 F5 C5 A4 F4 A4 G4 B4 D5 G5 D5 B4 G4 B4 E4 G#4 B4 E5 B4 G#4 E4 G#4',
      },
    ],
    drums: { kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  },
  portal: {
    name: '異次元',
    bpm: 90,
    voices: [
      {
        wave: 'sine',
        volume: 0.09,
        length: 12,
        notes:
          'E2 . . . . . . . . . . . . . . . C2 . . . . . . . . . . . . . . . D2 . . . . . . . . . . . . . . . B1 . . . . . . . . . . . . . . .',
      },
      {
        wave: 'sine',
        volume: 0.05,
        length: 4,
        notes: 'B4 . . F#5 . . E5 . . . . . G#5 . . . A5 . . G#5 . . E5 . . . . . B4 . . .',
        echo: { delaySteps: 3, gain: 0.4 },
      },
    ],
    drums: { kick: 'x...............', hat: '........x.......' },
  },
  wraparound: {
    name: '迴圈律動',
    bpm: 124,
    voices: [
      {
        wave: 'square',
        volume: 0.04,
        length: 1,
        notes: 'D2 . D3 . . D2 . C3 . D3 . A2 . C3 D3 . G2 . G3 . . G2 . F3 . G3 . D3 . F3 G3 .',
      },
      {
        wave: 'triangle',
        volume: 0.04,
        length: 1,
        notes: 'A4 . C5 D5 . . F5 . E5 . D5 . C5 . A4 . . . . . D5 . . . B4 . A4 . G4 . . .',
      },
    ],
    drums: { kick: 'x.....x...x.....', snare: '....x.......x..x', hat: 'x.xxx.x.x.xxx.x.' },
  },
  patrol: {
    name: '警戒巡邏',
    bpm: 132,
    voices: [
      {
        wave: 'sawtooth',
        volume: 0.025,
        length: 1,
        notes: 'F2 F2 F3 F2 F2 F2 F3 F2 Db2 Db2 Db3 Db2 Eb2 Eb2 Eb3 Eb2',
      },
      {
        wave: 'square',
        volume: 0.022,
        length: 2,
        notes: 'C5 . . . Ab4 . . . C5 . Db5 . C5 . . . F5 . . . Eb5 . . . Db5 . C5 . Ab4 . . .',
      },
    ],
    drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.' },
  },
  lava: {
    name: '熔岩奔流',
    bpm: 140,
    voices: [
      { wave: 'square', volume: 0.035, length: 1, notes: 'C2 . C3 . C2 . C3 . Ab1 . Ab2 . G1 . G2 .' },
      {
        wave: 'sawtooth',
        volume: 0.02,
        length: 1,
        notes: 'G5 . Ab5 . G5 . F5 . Eb5 . D5 . Eb5 . B4 . C5 . . . . . . . G4 . Ab4 . B4 . . .',
      },
    ],
    drums: { kick: 'x.x...x.x.x...x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  },
  finale: {
    name: '最終決戰',
    bpm: 150,
    voices: [
      {
        wave: 'sawtooth',
        volume: 0.025,
        length: 1,
        notes: 'B1 . B2 . B1 . B2 . G1 . G2 . G1 . G2 . D2 . D3 . D2 . D3 . A1 . A2 . A1 . A2 .',
      },
      {
        wave: 'triangle',
        volume: 0.025,
        length: 1,
        notes:
          'B4 D5 F#5 D5 B4 D5 F#5 D5 G4 B4 D5 B4 G4 B4 D5 B4 D5 F#5 A5 F#5 D5 F#5 A5 F#5 A4 C#5 E5 C#5 A4 C#5 E5 C#5',
      },
      {
        wave: 'square',
        volume: 0.022,
        length: 3,
        notes: 'F#5 . . . . . E5 . D5 . . . E5 . . . D5 . . . . . C#5 . B4 . . . C#5 . . .',
      },
    ],
    drums: { kick: 'x...x...x...x.x.', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  },
};

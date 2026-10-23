import { getAudio, playNoise, playTone, NoiseOptions, ToneOptions } from './core';

// Small helpers that schedule relative to "now" (delay in seconds).
function tone(freq: number, duration: number, opts: ToneOptions & { delay?: number } = {}) {
  const audio = getAudio();
  if (!audio) return;
  const { delay = 0, ...rest } = opts;
  playTone(freq, audio.ctx.currentTime + delay, duration, rest);
}

function noise(duration: number, opts: NoiseOptions & { delay?: number } = {}) {
  const audio = getAudio();
  if (!audio) return;
  const { delay = 0, ...rest } = opts;
  playNoise(audio.ctx.currentTime + delay, duration, rest);
}

function arpeggio(freqs: number[], gap: number, opts: ToneOptions & { delay?: number; last?: number } = {}) {
  const { delay = 0, last = 0.2, ...rest } = opts;
  freqs.forEach((f, i) => tone(f, i === freqs.length - 1 ? last : gap + 0.03, { ...rest, delay: delay + i * gap }));
}

export const Sfx = {
  /** Creates/resumes the AudioContext; call from a user gesture. */
  unlock() {
    getAudio();
  },
  click() {
    tone(600, 0.05, { type: 'triangle', volume: 0.07 });
  },
  turn() {
    tone(320, 0.035, { volume: 0.035 });
  },
  start() {
    arpeggio([523, 659, 784], 0.09, { type: 'triangle', volume: 0.1, last: 0.16 });
  },
  pause() {
    arpeggio([440, 330], 0.09, { volume: 0.09, last: 0.14 });
  },
  resume() {
    arpeggio([330, 440], 0.08, { volume: 0.1, last: 0.12 });
  },
  /** Pitch rises with the combo count. */
  eat(combo: number) {
    const base = 523 * (1 + Math.min(combo, 20) * 0.03);
    tone(base, 0.09, { type: 'square', volume: 0.07 });
    tone(base * 1.25, 0.1, { type: 'square', volume: 0.06, delay: 0.06 });
    tone(base * 1.5, 0.12, { volume: 0.09, delay: 0.11 });
    noise(0.06, { volume: 0.05, frequency: 2500 });
  },
  gold() {
    arpeggio([784, 988, 1175, 1568], 0.05, { type: 'triangle', volume: 0.09 });
    noise(0.15, { volume: 0.03, filter: 'highpass', frequency: 6000, delay: 0.1 });
  },
  ice() {
    arpeggio([1568, 1319, 1047, 880], 0.05, { volume: 0.08, last: 0.3 });
  },
  shrink() {
    tone(700, 0.25, { type: 'square', volume: 0.05, slideTo: 200 });
  },
  spawn() {
    tone(1319, 0.12, { volume: 0.04 });
  },
  portal() {
    tone(300, 0.18, { volume: 0.07, slideTo: 1200 });
    noise(0.15, { volume: 0.03, frequency: 3000 });
  },
  crash() {
    tone(400, 0.55, { type: 'sawtooth', volume: 0.1, slideTo: 55 });
    tone(160, 0.5, { type: 'triangle', volume: 0.09, delay: 0.05, slideTo: 40 });
    noise(0.3, { volume: 0.14, frequency: 700 });
  },
  gameOver() {
    tone(220, 0.18, { type: 'square', volume: 0.06, delay: 0.5 });
    tone(175, 0.3, { type: 'square', volume: 0.06, delay: 0.66 });
  },
  levelComplete() {
    arpeggio([659, 880, 1175, 1319], 0.1, { type: 'square', volume: 0.07, last: 0.3 });
  },
  victory() {
    arpeggio([523, 659, 784, 1047, 784, 1047, 1319], 0.13, { type: 'triangle', volume: 0.12, last: 0.5 });
  },
  newRecord() {
    arpeggio([523, 659, 784, 1046, 784, 1046], 0.13, { type: 'triangle', volume: 0.12, delay: 0.55, last: 0.35 });
  },
};

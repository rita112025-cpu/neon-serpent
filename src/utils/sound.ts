/**
 * Neon Serpent - Web Audio sound manager (no audio files needed)
 * Features: eat combo pitch, turn tick, bgm loop, volume persist.
 */

type ToneOpts = {
  type?: OscillatorType;
  volume?: number;
  delay?: number;
  slideTo?: number;
};

const ENABLE_KEY = 'neon-serpent-sound-enabled';
const VOLUME_KEY = 'neon-serpent-sound-volume';
const MUSIC_KEY = 'neon-serpent-music-enabled';

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let enabled = true;
let volume = 0.8;
let musicEnabled = true;
let musicTimer: number | null = null;
let musicStep = 0;

try {
  const se = localStorage.getItem(ENABLE_KEY);
  if (se !== null) enabled = se === '1';
  const sv = localStorage.getItem(VOLUME_KEY);
  if (sv !== null) {
    const v = parseFloat(sv);
    if (!Number.isNaN(v)) volume = Math.min(1, Math.max(0, v));
  }
  const sm = localStorage.getItem(MUSIC_KEY);
  if (sm !== null) musicEnabled = sm === '1';
} catch {
  /* ignore */
}

function getContext(): AudioContext | null {
  if (!enabled) return null;
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioContext = new AC();
    masterGain = audioContext.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function getMaster(): GainNode | null {
  const ctx = getContext();
  if (!ctx || !masterGain) return null;
  return masterGain;
}

function playTone(freq: number, duration: number, opts: ToneOpts = {}) {
  const ctx = getContext();
  const master = getMaster();
  if (!ctx || !master) return;
  const { type = 'sine', volume: vol = 0.15, delay = 0, slideTo } = opts;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
  }
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playNoise(duration: number, vol = 0.1, delay = 0, filterFreq = 1200) {
  const ctx = getContext();
  const master = getMaster();
  if (!ctx || !master) return;
  const now = ctx.currentTime + delay;
  const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(now);
}
const BASSLINE = [110, 0, 131, 0, 147, 0, 131, 98];

function musicTick() {
  if (!enabled || !musicEnabled) return;
  const note = BASSLINE[musicStep % BASSLINE.length];
  if (note > 0) {
    playTone(note, 0.18, { type: 'triangle', volume: 0.055 });
    playTone(note * 2, 0.1, { type: 'sine', volume: 0.02 });
  }
  if (musicStep % 2 === 0) playNoise(0.03, 0.012, 0, 6000);
  musicStep++;
}

function startMusicLoop() {
  stopMusicLoop();
  if (!enabled || !musicEnabled) return;
  getContext();
  musicStep = 0;
  musicTimer = window.setInterval(musicTick, 165);
}

function stopMusicLoop() {
  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

export const SoundManager = {
  unlock() {
    getContext();
  },
  setEnabled(v: boolean) {
    enabled = v;
    try {
      localStorage.setItem(ENABLE_KEY, v ? '1' : '0');
    } catch {}
    if (!v) stopMusicLoop();
    else getContext();
  },
  isEnabled() {
    return enabled;
  },
  setVolume(v: number) {
    volume = Math.min(1, Math.max(0, v));
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {}
    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.02);
    }
  },
  getVolume() {
    return volume;
  },
  setMusicEnabled(v: boolean) {
    musicEnabled = v;
    try {
      localStorage.setItem(MUSIC_KEY, v ? '1' : '0');
    } catch {}
    if (!v) stopMusicLoop();
  },
  isMusicEnabled() {
    return musicEnabled;
  },
  playEat(combo = 0) {
    const lift = 1 + Math.min(combo, 20) * 0.03;
    const base = 523 * lift;
    playTone(base, 0.09, { type: 'square', volume: 0.07 });
    playTone(base * 1.25, 0.1, { type: 'square', volume: 0.06, delay: 0.06 });
    playTone(base * 1.5, 0.12, { type: 'sine', volume: 0.09, delay: 0.11 });
    playNoise(0.06, 0.05, 0, 2500);
  },
  playTurn() {
    playTone(320, 0.035, { type: 'sine', volume: 0.035 });
  },
  playMove() {
    playTone(880, 0.03, { type: 'sine', volume: 0.02 });
  },
  playClick() {
    playTone(600, 0.05, { type: 'triangle', volume: 0.07 });
  },
  playStart() {
    playTone(523, 0.1, { type: 'triangle', volume: 0.1 });
    playTone(659, 0.1, { type: 'triangle', volume: 0.1, delay: 0.09 });
    playTone(784, 0.16, { type: 'triangle', volume: 0.12, delay: 0.18 });
    startMusicLoop();
  },
  playPause() {
    playTone(440, 0.1, { type: 'sine', volume: 0.09 });
    playTone(330, 0.14, { type: 'sine', volume: 0.09, delay: 0.09 });
    stopMusicLoop();
  },
  playResume() {
    playTone(330, 0.09, { type: 'sine', volume: 0.09 });
    playTone(440, 0.12, { type: 'sine', volume: 0.1, delay: 0.08 });
    startMusicLoop();
  },
  playDeath() {
    stopMusicLoop();
    playTone(400, 0.55, { type: 'sawtooth', volume: 0.1, slideTo: 55 });
    playTone(160, 0.5, { type: 'triangle', volume: 0.09, delay: 0.05, slideTo: 40 });
    playNoise(0.3, 0.14, 0, 700);
    playTone(220, 0.18, { type: 'square', volume: 0.06, delay: 0.5 });
    playTone(175, 0.3, { type: 'square', volume: 0.06, delay: 0.66 });
  },
  playLevelUp() {
    playTone(659, 0.1, { type: 'square', volume: 0.07 });
    playTone(880, 0.1, { type: 'square', volume: 0.07, delay: 0.09 });
    playTone(1174, 0.2, { type: 'square', volume: 0.08, delay: 0.18 });
  },
  playNewRecord() {
    const seq = [523, 659, 784, 1046, 784, 1046];
    seq.forEach((f, i) => {
      playTone(f, i === seq.length - 1 ? 0.35 : 0.13, {
        type: 'triangle',
        volume: 0.12,
        delay: 0.55 + i * 0.13,
      });
    });
  },
  stopMusic() {
    stopMusicLoop();
  },
};



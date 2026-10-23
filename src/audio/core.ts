import { readBoolean, readNumber, writeBoolean, writeString } from '../utils/storage';

// Storage keys kept from the previous sound manager so saved settings survive.
const KEYS = {
  enabled: 'neon-serpent-sound-enabled',
  volume: 'neon-serpent-sound-volume',
  music: 'neon-serpent-music-enabled',
};

const settings = {
  enabled: readBoolean(KEYS.enabled, true),
  volume: Math.min(1, Math.max(0, readNumber(KEYS.volume, 0.8))),
  music: readBoolean(KEYS.music, true),
};

let context: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

export interface AudioGraph {
  ctx: AudioContext;
  master: GainNode;
}

/** Returns the shared audio graph, or null when sound is off or unsupported. */
export function getAudio(): AudioGraph | null {
  if (!settings.enabled || typeof window === 'undefined') return null;
  if (!context) {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    context = new AudioCtor();
    master = context.createGain();
    master.gain.value = settings.volume;
    master.connect(context.destination);
  }
  if (context.state === 'suspended') {
    context.resume().catch(() => {
      // Resume needs a user gesture; the next interaction will retry.
    });
  }
  return master ? { ctx: context, master } : null;
}

export interface ToneOptions {
  type?: OscillatorType;
  volume?: number;
  slideTo?: number;
  destination?: AudioNode;
}

/** Plays a tone at an absolute AudioContext time. */
export function playTone(freq: number, startTime: number, duration: number, opts: ToneOptions = {}): void {
  const audio = getAudio();
  if (!audio) return;
  const { ctx } = audio;
  const { type = 'sine', volume = 0.1, slideTo, destination = audio.master } = opts;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), startTime + duration);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export interface NoiseOptions {
  volume?: number;
  filter?: BiquadFilterType;
  frequency?: number;
  destination?: AudioNode;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** Plays a filtered noise burst at an absolute AudioContext time. */
export function playNoise(startTime: number, duration: number, opts: NoiseOptions = {}): void {
  const audio = getAudio();
  if (!audio) return;
  const { ctx } = audio;
  const { volume = 0.05, filter = 'bandpass', frequency = 1200, destination = audio.master } = opts;

  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);
  const biquad = ctx.createBiquadFilter();
  biquad.type = filter;
  biquad.frequency.value = frequency;
  biquad.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  src.connect(biquad);
  biquad.connect(gain);
  gain.connect(destination);
  src.start(startTime, Math.random() * 0.5, duration + 0.05);
}

export const audioSettings = {
  isEnabled: () => settings.enabled,
  isMusicEnabled: () => settings.music,
  getVolume: () => settings.volume,
  setEnabled(value: boolean) {
    settings.enabled = value;
    writeBoolean(KEYS.enabled, value);
  },
  setMusicEnabled(value: boolean) {
    settings.music = value;
    writeBoolean(KEYS.music, value);
  },
  setVolume(value: number) {
    settings.volume = Math.min(1, Math.max(0, value));
    writeString(KEYS.volume, String(settings.volume));
    if (master && context) master.gain.setTargetAtTime(settings.volume, context.currentTime, 0.02);
  },
};

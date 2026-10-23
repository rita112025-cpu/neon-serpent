import { TrackId } from '../types';
import { getAudio, playNoise, playTone } from './core';
import { parseHits, parseNotes } from './notes';
import { TRACKS, TrackDefinition, VoiceDefinition } from './tracks';

const LOOKAHEAD_SECONDS = 0.12;
const SCHEDULER_INTERVAL_MS = 25;
const MUSIC_BUS_GAIN = 0.9;

interface ParsedVoice extends Omit<VoiceDefinition, 'notes'> {
  notes: (number | null)[];
}

interface ParsedTrack {
  bpm: number;
  voices: ParsedVoice[];
  kick: boolean[];
  snare: boolean[];
  hat: boolean[];
}

function parseTrack(track: TrackDefinition): ParsedTrack {
  return {
    bpm: track.bpm,
    voices: track.voices.map(v => ({ ...v, notes: parseNotes(v.notes) })),
    kick: parseHits(track.drums.kick ?? ''),
    snare: parseHits(track.drums.snare ?? ''),
    hat: parseHits(track.drums.hat ?? ''),
  };
}

// Parsed once at load so a typo in a pattern fails immediately.
const PARSED_TRACKS = Object.fromEntries(
  Object.entries(TRACKS).map(([id, track]) => [id, parseTrack(track)]),
) as Record<TrackId, ParsedTrack>;

const hitAt = (pattern: boolean[], step: number) => pattern.length > 0 && pattern[step % pattern.length];

function scheduleStep(track: ParsedTrack, step: number, time: number, stepSeconds: number, bus: GainNode) {
  for (const voice of track.voices) {
    const freq = voice.notes[step % voice.notes.length];
    if (freq === null) continue;
    const duration = stepSeconds * voice.length;
    playTone(freq, time, duration, { type: voice.wave, volume: voice.volume, destination: bus });
    if (voice.echo) {
      playTone(freq, time + voice.echo.delaySteps * stepSeconds, duration, {
        type: voice.wave,
        volume: voice.volume * voice.echo.gain,
        destination: bus,
      });
    }
  }
  if (hitAt(track.kick, step)) playTone(150, time, 0.14, { volume: 0.12, slideTo: 45, destination: bus });
  if (hitAt(track.snare, step)) playNoise(time, 0.12, { volume: 0.05, frequency: 1800, destination: bus });
  if (hitAt(track.hat, step)) playNoise(time, 0.03, { volume: 0.02, filter: 'highpass', frequency: 7000, destination: bus });
}

let current: { id: TrackId; bus: GainNode; timer: number } | null = null;

export const Music = {
  /** Starts a track; calling it again with the playing track does nothing. */
  play(id: TrackId) {
    if (current?.id === id) return;
    Music.stop();
    const audio = getAudio();
    if (!audio) return;

    const { ctx } = audio;
    const track = PARSED_TRACKS[id];
    const stepSeconds = 60 / track.bpm / 4;
    const bus = ctx.createGain();
    bus.gain.value = MUSIC_BUS_GAIN;
    bus.connect(audio.master);

    let step = 0;
    let nextTime = ctx.currentTime + 0.05;
    const schedule = () => {
      while (nextTime < ctx.currentTime + LOOKAHEAD_SECONDS) {
        scheduleStep(track, step, nextTime, stepSeconds, bus);
        nextTime += stepSeconds;
        step++;
      }
    };
    schedule();
    current = { id, bus, timer: window.setInterval(schedule, SCHEDULER_INTERVAL_MS) };
  },

  stop() {
    if (!current) return;
    const { bus, timer } = current;
    current = null;
    window.clearInterval(timer);
    // Fade out notes that were already scheduled, then detach the bus.
    bus.gain.setTargetAtTime(0, bus.context.currentTime, 0.03);
    window.setTimeout(() => bus.disconnect(), 400);
  },
};

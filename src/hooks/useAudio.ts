import { useEffect, useState } from 'react';
import { TrackId } from '../types';
import { audioSettings } from '../audio/core';
import { Music } from '../audio/music';
import { Sfx } from '../audio/sfx';

export function useAudioSettings() {
  const [soundEnabled, setSoundEnabled] = useState(audioSettings.isEnabled);
  const [musicEnabled, setMusicEnabled] = useState(audioSettings.isMusicEnabled);
  const [volume, setVolumeState] = useState(audioSettings.getVolume);

  // Browsers only allow audio after a user gesture.
  useEffect(() => {
    const unlock = () => Sfx.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return {
    soundEnabled,
    musicEnabled,
    volume,
    toggleSound() {
      const next = !soundEnabled;
      audioSettings.setEnabled(next);
      setSoundEnabled(next);
      Sfx.click();
    },
    toggleMusic() {
      const next = !musicEnabled;
      audioSettings.setMusicEnabled(next);
      setMusicEnabled(next);
      Sfx.click();
    },
    setVolume(value: number) {
      audioSettings.setVolume(value);
      setVolumeState(audioSettings.getVolume());
    },
  };
}

/** Plays the given track while `active` is true and stops it otherwise. */
export function useBackgroundMusic(trackId: TrackId, active: boolean): void {
  useEffect(() => {
    if (active) Music.play(trackId);
    else Music.stop();
  }, [trackId, active]);

  useEffect(() => () => Music.stop(), []);
}

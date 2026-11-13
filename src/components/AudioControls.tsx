interface AudioToggleProps {
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

const TOGGLE_CLASS =
  'glass px-2 py-1 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors';

export function AudioToggles({ soundEnabled, musicEnabled, onToggleSound, onToggleMusic }: AudioToggleProps) {
  return (
    <div className="flex gap-1.5">
      <button onClick={onToggleSound} className={TOGGLE_CLASS} title="切換音效">
        {soundEnabled ? '🔊' : '🔇'}
      </button>
      <button onClick={onToggleMusic} className={TOGGLE_CLASS} title="切換背景音樂">
        {musicEnabled ? '🎵' : '🚫'}
      </button>
    </div>
  );
}

interface VolumeSliderProps {
  volume: number;
  onChange: (value: number) => void;
}

export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  return (
    <label className="flex items-center gap-1.5 px-2 py-1.5 text-gray-400 text-[10px] md:text-xs" title="音量">
      🔊
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-20 md:w-24 accent-[var(--accent)] cursor-pointer"
      />
    </label>
  );
}

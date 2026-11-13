import { GameState } from '../types';
import { MAX_COMBO_MULTIPLIER } from '../game/config';
import { LEVELS } from '../game/levels';

interface HudProps {
  game: GameState;
  highScore: number;
}

interface StatProps {
  label: string;
  value: string | number;
  color: string;
  /** Use the display font (numbers only; it has no CJK glyphs). */
  mono?: boolean;
}

function Stat({ label, value, color, mono = false }: StatProps) {
  return (
    <div className="glass rounded-lg px-2.5 py-1 md:px-3 md:py-1.5">
      <div className="text-[10px] md:text-xs text-gray-400 tracking-wider">{label}</div>
      <div
        className={`text-base md:text-lg font-bold tabular-nums leading-tight neon-text ${mono ? 'font-display' : ''}`}
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

export function Hud({ game, highScore }: HudProps) {
  const { level, applesEaten, combo, slowTicks, lives, score } = game;
  const progress = Math.min(1, applesEaten / level.goal);
  const showCombo = game.status === 'playing' && combo >= 2;

  return (
    <div className="w-full max-w-md mb-2 md:mb-3 px-1">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 md:gap-2">
          <Stat label="分數" value={score} color="#34d399" mono />
          <Stat label="最高分" value={highScore} color="#fbbf24" mono />
          <Stat label="生命" value={'❤'.repeat(Math.max(0, lives)) || '—'} color="#f87171" />
        </div>
        <div className="text-right min-w-0">
          <div className="text-[10px] md:text-xs text-gray-400">
            第 {level.index + 1} / {LEVELS.length} 關
          </div>
          <div className="text-sm md:text-base font-bold truncate neon-text" style={{ color: level.theme.accent }}>
            {level.name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1.5 text-[10px] md:text-xs text-gray-400">
        <span className="tabular-nums shrink-0">
          🍎 {applesEaten}/{level.goal}
        </span>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden ring-1 ring-white/10">
          <div
            className="progress-shimmer relative h-full rounded-full overflow-hidden transition-[width] duration-300"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, color-mix(in srgb, ${level.theme.accent} 45%, transparent), ${level.theme.accent})`,
              boxShadow: `0 0 8px ${level.theme.accent}`,
            }}
          />
        </div>
        {slowTicks > 0 && <span className="text-cyan-300 shrink-0 neon-text">❄ 減速</span>}
        {showCombo && (
          <span className="text-amber-300 font-bold shrink-0 neon-text">x{Math.min(combo, MAX_COMBO_MULTIPLIER)} 連擊</span>
        )}
      </div>
    </div>
  );
}

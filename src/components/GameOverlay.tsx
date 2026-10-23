import type { ReactNode } from 'react';
import { Difficulty, GameState } from '../types';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '../game/config';
import { LEVELS } from '../game/levels';
import { TRACKS } from '../audio/tracks';

interface GameOverlayProps {
  game: GameState;
  unlockedLevel: number;
  isNewRecord: boolean;
  onPrimary: () => void;
  onMenu: () => void;
  onSelectLevel: (index: number) => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1.5 md:gap-2.5 p-3 text-center bg-black/75 backdrop-blur-sm rounded-xl animate-fade-in">
      {children}
    </div>
  );
}

function ActionButton({ onClick, children, primary = true }: { onClick: () => void; children: ReactNode; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 md:px-7 py-2 md:py-2.5 font-bold rounded-xl text-white text-sm md:text-base transition-transform hover:scale-105 active:scale-95 ${
        primary ? 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30' : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}

function Title({ icon, text, color = '#ffffff' }: { icon: string; text: string; color?: string }) {
  return (
    <>
      <div className="text-3xl md:text-5xl">{icon}</div>
      <h2 className="text-lg md:text-2xl font-bold" style={{ color }}>
        {text}
      </h2>
    </>
  );
}

function ReadyScreen({ game, unlockedLevel, onPrimary, onSelectLevel, onSelectDifficulty }: GameOverlayProps) {
  const { level, difficulty } = game;
  return (
    <Shell>
      <h2 className="text-base md:text-xl font-bold" style={{ color: level.theme.accent }}>
        第 {level.index + 1} 關 · {level.name}
      </h2>
      <p className="text-gray-300 text-[11px] md:text-sm leading-snug">{level.description}</p>
      <p className="text-gray-500 text-[10px] md:text-xs">♪ {TRACKS[level.music].name}</p>

      <div className="grid grid-cols-4 gap-1 md:gap-1.5 my-0.5">
        {LEVELS.map(l => {
          const locked = l.index > unlockedLevel;
          const selected = l.index === level.index;
          return (
            <button
              key={l.index}
              disabled={locked}
              onClick={() => onSelectLevel(l.index)}
              title={locked ? '尚未解鎖' : l.name}
              className={`w-9 h-7 md:w-11 md:h-9 rounded-lg text-xs md:text-sm font-bold border transition-colors disabled:cursor-not-allowed ${
                selected ? 'text-gray-900' : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-500'
              } ${locked ? 'opacity-40' : ''}`}
              style={selected ? { background: l.theme.accent, borderColor: l.theme.accent } : undefined}
            >
              {locked ? '🔒' : l.index + 1}
            </button>
          );
        })}
      </div>

      <div className="flex gap-1">
        {DIFFICULTY_ORDER.map(d => (
          <button
            key={d}
            onClick={() => onSelectDifficulty(d)}
            className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs border transition-colors ${
              d === difficulty
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-gray-200'
            }`}
          >
            {DIFFICULTIES[d].label} ❤×{DIFFICULTIES[d].lives}
          </button>
        ))}
      </div>

      <ActionButton onClick={onPrimary}>▶ 開始</ActionButton>
    </Shell>
  );
}

export function GameOverlay(props: GameOverlayProps) {
  const { game, isNewRecord, onPrimary, onMenu } = props;
  const { status, score, lives, level } = game;

  switch (status) {
    case 'playing':
      return null;

    case 'ready':
      return <ReadyScreen {...props} />;

    case 'paused':
      return (
        <Shell>
          <Title icon="⏸️" text="遊戲暫停" />
          <div className="flex gap-2 mt-2">
            <ActionButton onClick={onPrimary}>▶ 繼續</ActionButton>
            <ActionButton onClick={onMenu} primary={false}>
              選單
            </ActionButton>
          </div>
        </Shell>
      );

    case 'lifeLost':
      return (
        <Shell>
          <Title icon="💥" text="撞到了！" color="#fca5a5" />
          <p className="text-gray-300 text-sm">剩下 {'❤'.repeat(lives)}，進度會保留</p>
          <ActionButton onClick={onPrimary}>↻ 再試一次</ActionButton>
        </Shell>
      );

    case 'levelComplete': {
      const next = LEVELS[level.index + 1];
      return (
        <Shell>
          <Title icon="🎉" text={`第 ${level.index + 1} 關完成！`} color={level.theme.accent} />
          <p className="text-gray-300 text-sm">分數 {score}</p>
          <p className="text-gray-400 text-xs leading-snug">
            下一關：<span style={{ color: next.theme.accent }}>{next.name}</span>
            <br />
            {next.description}
          </p>
          <ActionButton onClick={onPrimary}>下一關 ▶</ActionButton>
        </Shell>
      );
    }

    case 'gameOver':
    case 'victory': {
      const won = status === 'victory';
      return (
        <Shell>
          <Title icon={won ? '👑' : '💀'} text={won ? '全部通關！' : '遊戲結束'} color={won ? '#fde68a' : '#f87171'} />
          <p className="text-gray-300 text-base">
            分數 <span className="text-emerald-400 font-bold">{score}</span>
          </p>
          {isNewRecord && <p className="text-amber-400 text-sm animate-pulse font-medium">🏆 新紀錄！</p>}
          <div className="flex gap-2 mt-2">
            <ActionButton onClick={onPrimary}>{won ? '回到選單' : `↻ 從第 ${level.index + 1} 關重來`}</ActionButton>
            {!won && (
              <ActionButton onClick={onMenu} primary={false}>
                選單
              </ActionButton>
            )}
          </div>
        </Shell>
      );
    }
  }
}

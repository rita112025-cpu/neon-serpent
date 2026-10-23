import type { CSSProperties } from 'react';
import { CompiledLevel, Food, FoodKind, Mover, Position } from '../types';
import { EXPIRY_WARNING_TICKS } from '../game/config';

interface GameBoardProps {
  level: CompiledLevel;
  snake: Position[];
  apple: Food;
  special: Food | null;
  movers: Mover[];
}

const FOOD_STYLES: Record<FoodKind, { color: string; glow: string; icon?: string }> = {
  apple: { color: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
  gold: { color: '#fbbf24', glow: 'rgba(251,191,36,0.8)', icon: '★' },
  ice: { color: '#67e8f9', glow: 'rgba(103,232,249,0.8)', icon: '❄' },
  shrink: { color: '#c084fc', glow: 'rgba(192,132,252,0.8)', icon: '−' },
};

const PORTAL_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#facc15'];
const MOVER_COLOR = '#f43f5e';
// Hazard stripes keep movers visually distinct from the round red apple.
const MOVER_BACKGROUND = `repeating-linear-gradient(45deg, ${MOVER_COLOR} 0 3px, #111827 3px 6px)`;

export function GameBoard({ level, snake, apple, special, movers }: GameBoardProps) {
  const { theme } = level;
  const cellW = 100 / level.width;
  const cellH = 100 / level.height;

  /** Absolute position for a cell, optionally shrunk around its center. */
  const cell = (p: Position, scale = 1): CSSProperties => ({
    left: `${(p.x + (1 - scale) / 2) * cellW}%`,
    top: `${(p.y + (1 - scale) / 2) * cellH}%`,
    width: `${cellW * scale}%`,
    height: `${cellH * scale}%`,
  });

  const renderFood = (food: Food) => {
    const style = FOOD_STYLES[food.kind];
    const expiring = food.ttl !== null && food.ttl <= EXPIRY_WARNING_TICKS;
    return (
      <div
        key={`${food.kind}-${food.pos.x}-${food.pos.y}`}
        className={`absolute rounded-full flex items-center justify-center text-[0.6rem] font-bold text-gray-900 animate-food-pulse ${
          expiring ? 'animate-blink' : ''
        }`}
        style={{ ...cell(food.pos, 0.8), background: style.color, boxShadow: `0 0 12px ${style.glow}` }}
      >
        {style.icon}
      </div>
    );
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border-2 border-white/10"
      style={{
        aspectRatio: `${level.width} / ${level.height}`,
        backgroundColor: theme.background,
        backgroundImage: `linear-gradient(to right, ${theme.grid} 1px, transparent 1px), linear-gradient(to bottom, ${theme.grid} 1px, transparent 1px)`,
        backgroundSize: `${cellW}% ${cellH}%`,
        boxShadow: `0 0 30px ${theme.wallGlow}`,
      }}
    >
      {level.walls.map(w => (
        <div
          key={`w-${w.x}-${w.y}`}
          className="absolute rounded-[3px]"
          style={{ ...cell(w, 0.94), background: theme.wall, boxShadow: `0 0 6px ${theme.wallGlow}` }}
        />
      ))}

      {level.portals.map(p => {
        const color = PORTAL_COLORS[(p.pair - 1) % PORTAL_COLORS.length];
        return (
          <div
            key={`p-${p.pos.x}-${p.pos.y}`}
            className="absolute rounded-full border-2 animate-portal"
            style={{ ...cell(p.pos, 0.9), borderColor: color, boxShadow: `0 0 10px ${color}, inset 0 0 6px ${color}` }}
          />
        );
      })}

      {renderFood(apple)}
      {special && renderFood(special)}

      {movers.map((m, i) => (
        <div
          key={`m-${i}`}
          className="absolute rotate-45 rounded-[2px] border"
          style={{
            ...cell(m.pos, 0.78),
            background: MOVER_BACKGROUND,
            borderColor: MOVER_COLOR,
            boxShadow: `0 0 10px ${MOVER_COLOR}`,
          }}
        />
      ))}

      {snake.map((segment, index) => {
        const isHead = index === 0;
        return (
          <div
            key={index}
            className={`absolute ${isHead ? 'rounded-md z-10 flex items-center justify-center gap-[15%]' : 'rounded-sm'}`}
            style={{
              ...cell(segment, isHead ? 0.92 : 0.82),
              background: isHead ? theme.snakeHead : theme.snakeBody,
              opacity: isHead ? 1 : Math.max(0.35, 1 - index * 0.025),
              boxShadow: isHead ? `0 0 10px ${theme.snakeHead}` : 'none',
            }}
          >
            {isHead && (
              <>
                <div className="w-[18%] h-[18%] rounded-full bg-gray-900 opacity-80" />
                <div className="w-[18%] h-[18%] rounded-full bg-gray-900 opacity-80" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

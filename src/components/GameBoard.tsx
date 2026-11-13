import type { CSSProperties } from 'react';
import { CompiledLevel, Direction, Food, Mover, Position } from '../types';
import { EXPIRY_WARNING_TICKS } from '../game/config';
import { FOOD_STYLES } from './foodStyles';
import { BoardEffect } from '../hooks/useBoardEffects';

interface GameBoardProps {
  level: CompiledLevel;
  snake: Position[];
  direction: Direction;
  apple: Food;
  special: Food | null;
  movers: Mover[];
  effects: BoardEffect[];
  /** Changes on every crash; remounting the frame replays the shake animation. */
  shakeKey: number;
}

const PORTAL_COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#facc15'];
const MOVER_COLOR = '#f43f5e';
// Hazard stripes keep movers visually distinct from the round red apple.
const MOVER_BACKGROUND = `repeating-linear-gradient(45deg, ${MOVER_COLOR} 0 3px, #111827 3px 6px)`;

const BODY_SCALE = 0.8;
const PARTICLE_COUNT = 10;

/** Eye centers (percent of the head) so the snake looks where it is going. */
const EYES: Record<Direction, [number, number][]> = {
  UP: [[30, 32], [70, 32]],
  DOWN: [[30, 68], [70, 68]],
  LEFT: [[32, 30], [32, 70]],
  RIGHT: [[68, 30], [68, 70]],
};

const mix = (a: string, b: string, aPercent: number) => `color-mix(in srgb, ${a} ${aPercent}%, ${b})`;
const fade = (color: string, percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;

export function GameBoard({ level, snake, direction, apple, special, movers, effects, shakeKey }: GameBoardProps) {
  const { theme } = level;
  const cellW = 100 / level.width;
  const cellH = 100 / level.height;

  /** Absolute box in cell units (x, y = top-left corner). */
  const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
    left: `${x * cellW}%`,
    top: `${y * cellH}%`,
    width: `${w * cellW}%`,
    height: `${h * cellH}%`,
  });

  /** A cell, optionally shrunk around its center. */
  const cell = (p: Position, scale = 1): CSSProperties =>
    box(p.x + (1 - scale) / 2, p.y + (1 - scale) / 2, scale, scale);

  /** Body color: brighter near the head, settling into the body color toward the tail. */
  const segmentColor = (index: number) => mix(theme.snakeHead, theme.snakeBody, Math.max(0, 55 - index * 7));
  const segmentOpacity = (index: number) => Math.max(0.45, 1 - index * 0.02);

  /** Fills the gap between two adjacent segments so the body reads as one tube. */
  const bridge = (a: Position, b: Position): CSSProperties | null => {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    if (dx + dy !== 1) return null; // wrapped or teleported: no visual link
    const half = BODY_SCALE / 2;
    const x = Math.min(a.x, b.x) + 0.5;
    const y = Math.min(a.y, b.y) + 0.5;
    return dx === 1 ? box(x, y - half, 1, BODY_SCALE) : box(x - half, y, BODY_SCALE, 1);
  };

  const renderFood = (food: Food) => {
    const style = FOOD_STYLES[food.kind];
    const expiring = food.ttl !== null && food.ttl <= EXPIRY_WARNING_TICKS;
    return (
      <div key={`${food.kind}-${food.pos.x}-${food.pos.y}`} className="absolute" style={cell(food.pos, 0.82)}>
        <div className="food-ring absolute inset-0 rounded-full" style={{ borderColor: style.color }} />
        <div
          className={`absolute inset-0 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-gray-900 animate-food-pulse ${
            expiring ? 'animate-blink' : ''
          }`}
          style={{
            background: `radial-gradient(circle at 35% 30%, #ffffff 0 10%, ${style.color} 45%, ${mix(style.color, '#000000', 55)} 100%)`,
            boxShadow: `0 0 10px ${style.glow}, 0 0 22px ${style.glow}`,
          }}
        >
          {style.icon}
        </div>
      </div>
    );
  };

  const renderEffect = (effect: BoardEffect) => {
    switch (effect.kind) {
      case 'burst':
        return (
          <div key={effect.id} className="absolute pointer-events-none z-30" style={cell(effect.pos)}>
            <div className="effect-shock absolute inset-0 rounded-full border-2" style={{ borderColor: effect.color }} />
            {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
              const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
              const distance = 260 + (i % 3) * 60;
              return (
                <span
                  key={i}
                  className="effect-particle"
                  style={
                    {
                      background: effect.color,
                      boxShadow: `0 0 6px ${effect.color}`,
                      '--dx': `${Math.cos(angle) * distance}%`,
                      '--dy': `${Math.sin(angle) * distance}%`,
                    } as CSSProperties
                  }
                />
              );
            })}
            <span className="effect-float font-display" style={{ color: effect.color, textShadow: `0 0 8px ${effect.color}` }}>
              {effect.text}
            </span>
          </div>
        );
      case 'crash':
        return (
          <div key={effect.id} className="absolute pointer-events-none z-30" style={cell(effect.pos)}>
            <div className="effect-shock absolute inset-0 rounded-full border-2 border-red-400" />
            <div className="effect-shock effect-delay absolute inset-0 rounded-full border border-orange-300" />
          </div>
        );
      case 'flash':
        return (
          <div
            key={effect.id}
            className="effect-flash absolute inset-0 pointer-events-none z-30"
            style={{ background: `radial-gradient(circle, ${fade(effect.color, 60)}, transparent 70%)` }}
          />
        );
    }
  };

  const crashed = effects.some(e => e.kind === 'crash');

  return (
    <div key={shakeKey} className={shakeKey > 0 ? 'animate-shake' : undefined}>
      <div
        className="relative w-full rounded-xl overflow-hidden transition-[box-shadow,border-color] duration-500"
        style={{
          aspectRatio: `${level.width} / ${level.height}`,
          backgroundColor: theme.background,
          backgroundImage: `radial-gradient(ellipse at 50% 40%, ${fade(theme.accent, 10)}, transparent 70%), linear-gradient(to right, ${theme.grid} 1px, transparent 1px), linear-gradient(to bottom, ${theme.grid} 1px, transparent 1px)`,
          backgroundSize: `100% 100%, ${cellW}% ${cellH}%, ${cellW}% ${cellH}%`,
          border: `1px solid ${fade(theme.accent, 45)}`,
          boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 24px ${theme.wallGlow}, 0 0 60px ${fade(theme.accent, 18)}, inset 0 0 40px rgba(0,0,0,0.55)`,
        }}
      >
        {level.walls.map(w => (
          <div
            key={`w-${w.x}-${w.y}`}
            className="absolute rounded-[3px]"
            style={{
              ...cell(w, 0.92),
              background: `linear-gradient(145deg, ${mix(theme.wall, '#ffffff', 75)}, ${theme.wall} 55%, ${mix(theme.wall, '#000000', 70)})`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 0 8px ${theme.wallGlow}`,
            }}
          />
        ))}

        {level.portals.map(p => {
          const color = PORTAL_COLORS[(p.pair - 1) % PORTAL_COLORS.length];
          return (
            <div key={`p-${p.pos.x}-${p.pos.y}`} className="absolute" style={cell(p.pos, 0.9)}>
              <div
                className="absolute inset-[18%] rounded-full"
                style={{ background: `radial-gradient(circle, #ffffff 0 12%, ${color} 40%, transparent 72%)` }}
              />
              <div
                className="absolute inset-0 rounded-full border-2 animate-portal"
                style={{ borderColor: color, boxShadow: `0 0 10px ${color}, inset 0 0 6px ${color}` }}
              />
            </div>
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

        {snake.slice(1).map((segment, i) => {
          const style = bridge(snake[i], segment);
          if (!style) return null;
          const index = i + 1;
          return (
            <div
              key={`b-${index}`}
              className="absolute"
              style={{ ...style, background: segmentColor(index), opacity: segmentOpacity(index) }}
            />
          );
        })}

        {snake.map((segment, index) => {
          if (index === 0) return null;
          const isTail = index === snake.length - 1;
          const color = segmentColor(index);
          return (
            <div
              key={index}
              className="absolute rounded-[35%]"
              style={{
                ...cell(segment, isTail ? 0.66 : BODY_SCALE),
                background: color,
                opacity: segmentOpacity(index),
                boxShadow: `0 0 8px ${fade(theme.snakeBody, 55)}`,
              }}
            />
          );
        })}

        {snake[0] && (
          <div
            className={`absolute z-10 rounded-[38%] ${crashed ? 'animate-blink' : ''}`}
            style={{
              ...cell(snake[0], 0.96),
              background: `radial-gradient(circle at 50% 35%, #ffffff 0 6%, ${theme.snakeHead} 45%, ${theme.snakeBody} 100%)`,
              boxShadow: `0 0 10px ${theme.snakeHead}, 0 0 22px ${fade(theme.snakeHead, 55)}`,
            }}
          >
            {EYES[direction].map(([x, y]) => (
              <div
                key={`${x}-${y}`}
                className="absolute w-[24%] h-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-950"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="absolute w-[40%] h-[40%] left-[20%] top-[15%] rounded-full bg-white/90" />
              </div>
            ))}
          </div>
        )}

        {effects.map(renderEffect)}

        <div className="board-scanlines absolute inset-0 pointer-events-none z-20" />
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)' }}
        />
      </div>
    </div>
  );
}

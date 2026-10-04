import { Position } from '../types';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
}

export function GameBoard({ snake, food, gridSize }: GameBoardProps) {
  const cellSize = 100 / gridSize;

  return (
    <div className="relative w-full aspect-square bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        {Array.from({ length: gridSize + 1 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t border-gray-500"
            style={{ top: `${(i / gridSize) * 100}%` }}
          />
        ))}
        {Array.from({ length: gridSize + 1 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full border-l border-gray-500"
            style={{ left: `${(i / gridSize) * 100}%` }}
          />
        ))}
      </div>

      {/* Food */}
      <div
        className="absolute animate-food-pulse rounded-full"
        style={{
          width: `${cellSize * 0.8}%`,
          height: `${cellSize * 0.8}%`,
          left: `${food.x * cellSize + cellSize * 0.1}%`,
          top: `${food.y * cellSize + cellSize * 0.1}%`,
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
      </div>

      {/* Snake body */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        const opacity = isHead ? 1 : Math.max(0.35, 1 - index * 0.025);
        const size = isHead ? cellSize * 0.92 : cellSize * 0.82;
        const offset = (cellSize - size) / 2;

        return (
          <div
            key={index}
            className={`absolute transition-all duration-[60ms] ease-linear ${
              isHead
                ? 'bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-md z-10'
                : 'bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-sm'
            }`}
            style={{
              width: `${size}%`,
              height: `${size}%`,
              left: `${segment.x * cellSize + offset}%`,
              top: `${segment.y * cellSize + offset}%`,
              opacity,
              boxShadow: isHead ? '0 0 10px rgba(52,211,153,0.5)' : 'none',
            }}
          >
            {isHead && (
              <div className="w-full h-full flex items-center justify-center gap-[15%]">
                <div className="w-[18%] h-[18%] rounded-full bg-gray-900 opacity-80" />
                <div className="w-[18%] h-[18%] rounded-full bg-gray-900 opacity-80" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, useCallback, useRef, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { useSnakeGame } from './hooks/useSnakeGame';
import { Direction, Difficulty } from './types';
import { SoundManager } from './utils/sound';

function App() {
  const {
    snake,
    food,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize,
    setDifficulty,
    startGame,
    togglePause,
    resetGame,
    changeDirection,
  } = useSnakeGame();

  const [soundEnabled, setSoundEnabled] = useState(() => SoundManager.isEnabled());
  const [soundVolume, setSoundVolume] = useState(() => SoundManager.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(() => SoundManager.isMusicEnabled());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        if (gameState === 'playing') {
          changeDirection(keyMap[e.key]);
        } else if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        }
      }

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        } else {
          togglePause();
        }
      }

      if (e.key === 'r' || e.key === 'R') {
        resetGame();
      }
    },
    [gameState, changeDirection, startGame, togglePause, resetGame]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    SoundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    SoundManager.setVolume(soundVolume);
  }, [soundVolume]);

  useEffect(() => {
    SoundManager.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  // Unlock audio on first user gesture (browser autoplay policy)
  useEffect(() => {
    const unlock = () => SoundManager.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Touch controls - swipe on game board
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 20;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (gameState === 'playing') {
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        changeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  const difficultyLabels: Record<Difficulty, string> = {
    easy: '簡單',
    medium: '中等',
    hard: '困難',
  };

  const difficultyColors: Record<Difficulty, string> = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    hard: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <div
      className="min-h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-3 md:p-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Header */}
      <div className="w-full max-w-md mb-3 md:mb-5 animate-slide-up">
        <h1 className="text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
          🐍 貪吃蛇
        </h1>
        <p className="text-gray-500 text-center text-xs md:text-sm mt-1">
          Snake Game
        </p>
      </div>

      {/* Score Board */}
      <div className="w-full max-w-md flex justify-between items-center mb-3 md:mb-4 px-1 animate-slide-up">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 md:px-4 md:py-2 border border-gray-700/50 backdrop-blur-sm">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">分數</div>
            <div className="text-lg md:text-xl font-bold text-emerald-400 tabular-nums">{score}</div>
          </div>
          <div className="bg-gray-800/80 rounded-lg px-3 py-1.5 md:px-4 md:py-2 border border-gray-700/50 backdrop-blur-sm">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">最高分</div>
            <div className="text-lg md:text-xl font-bold text-amber-400 tabular-nums">{highScore}</div>
          </div>
        </div>

        {/* Difficulty Selector & Sound */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  if (gameState !== 'playing') {
                    setDifficulty(d);
                  }
                }}
                disabled={gameState === 'playing'}
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium border transition-all duration-200 ${
                  difficulty === d
                    ? difficultyColors[d] + ' scale-105'
                    : 'bg-gray-800/50 text-gray-500 border-gray-700/30 hover:text-gray-300 hover:border-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {difficultyLabels[d]}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setSoundEnabled(v => !v);
              SoundManager.playClick();
            }}
            className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium border bg-gray-800/50 text-gray-300 border-gray-700/30 hover:text-white hover:border-gray-600 transition-all"
            title="切換音效"
          >
            {soundEnabled ? '🔊 音效' : '🔇 靜音'}
          </button>
          <button
            onClick={() => {
              setMusicEnabled(v => !v);
              SoundManager.playClick();
            }}
            className="px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium border bg-gray-800/50 text-gray-300 border-gray-700/30 hover:text-white hover:border-gray-600 transition-all"
            title="切換背景音樂"
          >
            {musicEnabled ? '🎵 音樂' : '🚫 音樂'}
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="w-full max-w-[min(28rem,46svh)] md:max-w-md relative animate-fade-in touch-none">
        <GameBoard snake={snake} food={food} gridSize={gridSize} />

        {/* Overlay States */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl animate-fade-in">
            <div className="text-5xl md:text-6xl mb-3 md:mb-4 animate-bounce">🐍</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">準備開始</h2>
            <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">按下方按鈕或空格鍵開始</p>
            <button
              onClick={startGame}
              className="px-6 md:px-8 py-2.5 md:py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
            >
              ▶ 開始遊戲
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl animate-fade-in">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">⏸️</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">遊戲暫停</h2>
            <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">按空格鍵或點擊繼續</p>
            <button
              onClick={togglePause}
              className="px-6 md:px-8 py-2.5 md:py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
            >
              ▶ 繼續遊戲
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl animate-fade-in">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">💀</div>
            <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">遊戲結束</h2>
            <p className="text-gray-300 text-base md:text-lg mb-1">
              分數: <span className="text-emerald-400 font-bold">{score}</span>
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-amber-400 text-sm mb-3 animate-pulse font-medium">🏆 新紀錄！</p>
            )}
            <div className="flex gap-3 mt-3 md:mt-4">
              <button
                onClick={startGame}
                className="px-5 md:px-6 py-2.5 md:py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
              >
                🔄 再玩一次
              </button>
              <button
                onClick={resetGame}
                className="px-5 md:px-6 py-2.5 md:py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                ↺ 重置
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mt-3 md:mt-5 flex flex-col items-center gap-2 md:gap-3">
        {/* Action Buttons */}
        <div className="flex gap-2 md:gap-3 items-center">
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 rounded-lg transition-all text-xs md:text-sm font-medium border border-gray-700/50"
            >
              ⏸ 暫停
            </button>
          )}
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 rounded-lg transition-all text-xs md:text-sm font-medium border border-gray-700/50"
            >
              🔄 重新開始
            </button>
          )}
          {/* Volume slider */}
          <label className="flex items-center gap-1.5 px-2 py-1.5 text-gray-400 text-[10px] md:text-xs" title="音量">
            🔊
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-20 md:w-24 accent-emerald-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Mobile D-Pad */}
        <div className="md:hidden grid grid-cols-3 gap-1.5 w-32 mt-1">
          <div />
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              if (gameState === 'playing') changeDirection('UP');
            }}
            className="aspect-square bg-gray-800 active:bg-emerald-600 touch-manipulation rounded-xl flex items-center justify-center text-gray-300 text-lg transition-all border border-gray-700/50"
          >
            ▲
          </button>
          <div />
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              if (gameState === 'playing') changeDirection('LEFT');
            }}
            className="aspect-square bg-gray-800 active:bg-emerald-600 touch-manipulation rounded-xl flex items-center justify-center text-gray-300 text-lg transition-all border border-gray-700/50"
          >
            ◀
          </button>
          <div className="aspect-square bg-gray-900/80 rounded-xl border border-gray-800 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
          </div>
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              if (gameState === 'playing') changeDirection('RIGHT');
            }}
            className="aspect-square bg-gray-800 active:bg-emerald-600 touch-manipulation rounded-xl flex items-center justify-center text-gray-300 text-lg transition-all border border-gray-700/50"
          >
            ▶
          </button>
          <div />
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              if (gameState === 'playing') changeDirection('DOWN');
            }}
            className="aspect-square bg-gray-800 active:bg-emerald-600 touch-manipulation rounded-xl flex items-center justify-center text-gray-300 text-lg transition-all border border-gray-700/50"
          >
            ▼
          </button>
          <div />
        </div>

        {/* Keyboard hints (desktop) */}
        <div className="hidden md:flex gap-4 text-xs text-gray-500 mt-2">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 text-[10px]">↑↓←→</kbd>
            {' / '}
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 text-[10px]">WASD</kbd>
            {' 移動'}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 text-[10px]">Space</kbd>
            {' 暫停'}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400 text-[10px]">R</kbd>
            {' 重置'}
          </span>
        </div>

        {/* Mobile swipe hint */}
        <p className="md:hidden text-[10px] text-gray-600 mt-0.5">
          滑動遊戲區域或使用方向鍵控制蛇的移動
        </p>
      </div>
    </div>
  );
}

export default App;

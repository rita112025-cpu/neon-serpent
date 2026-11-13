import type { CSSProperties } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameOverlay } from './components/GameOverlay';
import { Hud } from './components/Hud';
import { DPad } from './components/DPad';
import { AudioToggles, VolumeSlider } from './components/AudioControls';
import { useSnakeGame } from './hooks/useSnakeGame';
import { useKeyboardControls, useSwipe } from './hooks/useControls';
import { useAudioSettings, useBackgroundMusic } from './hooks/useAudio';
import { useBoardEffects } from './hooks/useBoardEffects';

const SMALL_BUTTON =
  'glass px-4 py-2 text-gray-200 hover:text-white active:scale-95 transition rounded-lg text-xs md:text-sm font-medium';

function App() {
  const { effects, shakeKey, handleEvents } = useBoardEffects();
  const { game, highScore, unlockedLevel, isNewRecord, turn, primaryAction, pause, goToMenu, selectLevel, setDifficulty } =
    useSnakeGame(handleEvents);
  const audio = useAudioSettings();
  const swipe = useSwipe(turn);

  useKeyboardControls({ onTurn: turn, onPrimary: primaryAction, onPause: pause, onMenu: goToMenu });
  useBackgroundMusic(game.level.music, game.status === 'playing' && audio.soundEnabled && audio.musicEnabled);

  const isRunning = game.status === 'playing' || game.status === 'paused';

  return (
    <div
      className="relative isolate min-h-full bg-[#05070d] flex flex-col items-center justify-center p-3 md:p-6 select-none overflow-hidden"
      style={{ '--accent': game.level.theme.accent } as CSSProperties}
      {...swipe}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(217,70,239,0.14), transparent 70%), radial-gradient(ellipse 60% 40% at 10% 90%, rgba(34,211,238,0.12), transparent 70%)',
          }}
        />
        <div className="neon-floor absolute left-[-50%] right-[-50%] bottom-0 h-[45%]" />
      </div>

      <header className="w-full max-w-md flex items-center justify-between mb-2 md:mb-4 px-1">
        <h1 className="leading-none">
          <span className="block text-xl md:text-3xl font-black tracking-wide text-[var(--accent)] neon-text transition-colors duration-500">
            貪吃蛇
          </span>
          <span className="block font-display text-[9px] md:text-[11px] tracking-[0.35em] text-fuchsia-300/80 mt-1">
            NEON SERPENT
          </span>
        </h1>
        <AudioToggles
          soundEnabled={audio.soundEnabled}
          musicEnabled={audio.musicEnabled}
          onToggleSound={audio.toggleSound}
          onToggleMusic={audio.toggleMusic}
        />
      </header>

      <Hud game={game} highScore={highScore} />

      <div className="w-full max-w-[min(28rem,44svh)] md:max-w-md relative animate-fade-in touch-none">
        <GameBoard
          level={game.level}
          snake={game.snake}
          direction={game.direction}
          apple={game.apple}
          special={game.special}
          movers={game.movers}
          effects={effects}
          shakeKey={shakeKey}
        />
        <GameOverlay
          game={game}
          unlockedLevel={unlockedLevel}
          isNewRecord={isNewRecord}
          onPrimary={primaryAction}
          onMenu={goToMenu}
          onSelectLevel={selectLevel}
          onSelectDifficulty={setDifficulty}
        />
      </div>

      <div className="w-full max-w-md mt-2 md:mt-4 flex flex-col items-center gap-1.5 md:gap-3">
        <div className="flex gap-2 md:gap-3 items-center">
          {game.status === 'playing' && (
            <button onClick={pause} className={SMALL_BUTTON}>
              ⏸ 暫停
            </button>
          )}
          {isRunning && (
            <button onClick={goToMenu} className={SMALL_BUTTON}>
              ☰ 選單
            </button>
          )}
          <VolumeSlider volume={audio.volume} onChange={audio.setVolume} />
        </div>

        <DPad onTurn={turn} />

        <div className="hidden md:flex gap-4 text-xs text-gray-500 mt-1">
          <span>↑↓←→ / WASD 移動</span>
          <span>Space 開始／暫停</span>
          <span>R 回選單</span>
        </div>
      </div>
    </div>
  );
}

export default App;

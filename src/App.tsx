import { GameBoard } from './components/GameBoard';
import { GameOverlay } from './components/GameOverlay';
import { Hud } from './components/Hud';
import { DPad } from './components/DPad';
import { AudioToggles, VolumeSlider } from './components/AudioControls';
import { useSnakeGame } from './hooks/useSnakeGame';
import { useKeyboardControls, useSwipe } from './hooks/useControls';
import { useAudioSettings, useBackgroundMusic } from './hooks/useAudio';

const SMALL_BUTTON =
  'px-4 py-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 rounded-lg text-xs md:text-sm font-medium border border-gray-700/50';

function App() {
  const { game, highScore, unlockedLevel, isNewRecord, turn, primaryAction, pause, goToMenu, selectLevel, setDifficulty } =
    useSnakeGame();
  const audio = useAudioSettings();
  const swipe = useSwipe(turn);

  useKeyboardControls({ onTurn: turn, onPrimary: primaryAction, onPause: pause, onMenu: goToMenu });
  useBackgroundMusic(game.level.music, game.status === 'playing' && audio.soundEnabled && audio.musicEnabled);

  const isRunning = game.status === 'playing' || game.status === 'paused';

  return (
    <div
      className="min-h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-3 md:p-6 select-none"
      {...swipe}
    >
      <header className="w-full max-w-md flex items-center justify-between mb-2 md:mb-4 px-1">
        <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-400 bg-clip-text text-transparent">
          🐍 貪吃蛇
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
        <GameBoard level={game.level} snake={game.snake} apple={game.apple} special={game.special} movers={game.movers} />
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { Difficulty, Direction, FoodKind, GameEvent, GameState } from '../types';
import { Sfx } from '../audio/sfx';
import { DIFFICULTIES } from '../game/config';
import { LEVELS } from '../game/levels';
import {
  createGame,
  getTickInterval,
  nextLevel,
  queueDirection,
  retryLevel,
  startPlaying,
  step,
  togglePause,
} from '../game/engine';
import { readNumber, readString, writeString } from '../utils/storage';

const STORAGE = {
  highScore: 'snake-high-score',
  unlockedLevel: 'neon-serpent-unlocked-level',
  difficulty: 'neon-serpent-difficulty',
};

const SPECIAL_SOUNDS: Record<Exclude<FoodKind, 'apple'>, () => void> = {
  gold: Sfx.gold,
  ice: Sfx.ice,
  shrink: Sfx.shrink,
};

function playEventSound(event: GameEvent) {
  switch (event.type) {
    case 'eat':
      if (event.food === 'apple') Sfx.eat(event.combo);
      else SPECIAL_SOUNDS[event.food]();
      break;
    case 'specialSpawned':
      Sfx.spawn();
      break;
    case 'portal':
      Sfx.portal();
      break;
    case 'crash':
      Sfx.crash();
      break;
    case 'levelComplete':
      Sfx.levelComplete();
      break;
    case 'victory':
      Sfx.victory();
      break;
    case 'specialExpired':
      break;
  }
}

function loadDifficulty(): Difficulty {
  const saved = readString(STORAGE.difficulty);
  return saved && saved in DIFFICULTIES ? (saved as Difficulty) : 'medium';
}

function clampLevel(index: number): number {
  return Math.min(LEVELS.length - 1, Math.max(0, Math.floor(index)));
}

export function useSnakeGame() {
  const [game, setGame] = useState<GameState>(() => createGame(0, loadDifficulty()));
  const [highScore, setHighScore] = useState(() => readNumber(STORAGE.highScore, 0));
  const [unlockedLevel, setUnlockedLevel] = useState(() => clampLevel(readNumber(STORAGE.unlockedLevel, 0)));

  const gameRef = useRef(game);
  const highScoreRef = useRef(highScore);
  // High score at the start of the run, used to detect a new record.
  const runBestRef = useRef(highScore);

  const recordScore = useCallback((score: number) => {
    if (score <= highScoreRef.current) return;
    highScoreRef.current = score;
    writeString(STORAGE.highScore, String(score));
    setHighScore(score);
  }, []);

  const unlockLevel = useCallback((index: number) => {
    setUnlockedLevel(prev => {
      const next = Math.max(prev, clampLevel(index));
      if (next !== prev) writeString(STORAGE.unlockedLevel, String(next));
      return next;
    });
  }, []);

  const commit = useCallback(
    (next: GameState, events: GameEvent[] = []) => {
      gameRef.current = next;
      setGame(next);
      events.forEach(playEventSound);

      if (next.status === 'levelComplete') unlockLevel(next.level.index + 1);
      if (next.status === 'levelComplete' || next.status === 'gameOver' || next.status === 'victory') {
        recordScore(next.score);
      }
      if ((next.status === 'gameOver' || next.status === 'victory') && next.score > runBestRef.current) {
        Sfx.newRecord();
      } else if (next.status === 'gameOver') {
        Sfx.gameOver();
      }
    },
    [recordScore, unlockLevel],
  );

  const beginRun = useCallback(
    (state: GameState) => {
      runBestRef.current = highScoreRef.current;
      Sfx.start();
      commit(startPlaying(state));
    },
    [commit],
  );

  // Game loop: one timeout per tick so the speed can change every tick.
  useEffect(() => {
    if (game.status !== 'playing') return;
    let timer: number;
    const tick = () => {
      const { state, events } = step(gameRef.current);
      commit(state, events);
      if (state.status === 'playing') timer = window.setTimeout(tick, getTickInterval(state));
    };
    timer = window.setTimeout(tick, getTickInterval(gameRef.current));
    return () => window.clearTimeout(timer);
  }, [game.status, commit]);

  // Pause automatically when the tab is hidden or the phone is locked.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && gameRef.current.status === 'playing') {
        commit(togglePause(gameRef.current));
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [commit]);

  const turn = useCallback(
    (dir: Direction) => {
      const { state, accepted } = queueDirection(gameRef.current, dir);
      if (!accepted) return;
      Sfx.turn();
      commit(state);
    },
    [commit],
  );

  /** The main button / Space key: does whatever the current screen offers. */
  const primaryAction = useCallback(() => {
    const current = gameRef.current;
    switch (current.status) {
      case 'ready':
        beginRun(current);
        break;
      case 'playing':
        Sfx.pause();
        commit(togglePause(current));
        break;
      case 'paused':
        Sfx.resume();
        commit(togglePause(current));
        break;
      case 'lifeLost':
        Sfx.start();
        commit(retryLevel(current));
        break;
      case 'levelComplete':
        Sfx.start();
        commit(nextLevel(current));
        break;
      case 'gameOver':
        beginRun(createGame(current.level.index, current.difficulty));
        break;
      case 'victory':
        Sfx.click();
        commit(createGame(0, current.difficulty));
        break;
    }
  }, [beginRun, commit]);

  const pause = useCallback(() => {
    const current = gameRef.current;
    if (current.status === 'playing' || current.status === 'paused') primaryAction();
  }, [primaryAction]);

  const goToMenu = useCallback(() => {
    const current = gameRef.current;
    Sfx.click();
    commit(createGame(current.level.index, current.difficulty));
  }, [commit]);

  const selectLevel = useCallback(
    (index: number) => {
      const current = gameRef.current;
      if (current.status !== 'ready' || index > unlockedLevel) return;
      Sfx.click();
      commit(createGame(clampLevel(index), current.difficulty));
    },
    [commit, unlockedLevel],
  );

  const setDifficulty = useCallback(
    (difficulty: Difficulty) => {
      const current = gameRef.current;
      if (current.status !== 'ready') return;
      Sfx.click();
      writeString(STORAGE.difficulty, difficulty);
      commit(createGame(current.level.index, difficulty));
    },
    [commit],
  );

  return {
    game,
    highScore,
    unlockedLevel,
    isNewRecord: game.score > 0 && game.score > runBestRef.current,
    turn,
    primaryAction,
    pause,
    goToMenu,
    selectLevel,
    setDifficulty,
  };
}

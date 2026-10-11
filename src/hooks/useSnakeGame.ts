import { useState, useEffect, useCallback, useRef } from 'react';
import { Direction, Position, Difficulty, GameState } from '../types';
import { SoundManager } from '../utils/sound';

const GRID_SIZE = 20;
const SPEED_MAP: Record<Difficulty, number> = {
  easy: 180,
  medium: 120,
  hard: 70,
};

function getRandomPosition(snake: Position[]): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export function useSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const directionRef = useRef<Direction>(direction);
  const gameStateRef = useRef<GameState>(gameState);
  const snakeRef = useRef<Position[]>(snake);
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef<number>(score);
  const eatCountRef = useRef<number>(0);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(getRandomPosition(INITIAL_SNAKE));
    setDirection('RIGHT');
    setScore(0);
    setGameState('idle');
    eatCountRef.current = 0;
    SoundManager.playClick();
    SoundManager.stopMusic();
  }, []);

  const startGame = useCallback(() => {
    if (gameState === 'gameover' || gameState === 'idle') {
      setSnake(INITIAL_SNAKE);
      setFood(getRandomPosition(INITIAL_SNAKE));
      setDirection('RIGHT');
      setScore(0);
      eatCountRef.current = 0;
    }
    SoundManager.unlock();
    setGameState('playing');
    SoundManager.playStart();
  }, [gameState]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      SoundManager.playPause();
    } else if (gameState === 'paused') {
      setGameState('playing');
      SoundManager.playResume();
    }
  }, [gameState]);

  const changeDirection = useCallback((newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    if (opposites[newDir] !== directionRef.current) {
      if (newDir !== directionRef.current) {
        SoundManager.playTurn();
      }
      setDirection(newDir);
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };
      const dir = directionRef.current;

      switch (dir) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('gameover');
        SoundManager.playDeath();
        const currentScore = scoreRef.current;
        const savedHigh = parseInt(localStorage.getItem('snake-high-score') || '0', 10);
        if (currentScore > savedHigh) {
          localStorage.setItem('snake-high-score', currentScore.toString());
          setHighScore(currentScore);
          if (currentScore > 0) SoundManager.playNewRecord();
        }
        return;
      }

      const newSnake = [head, ...currentSnake];
      const currentFood = foodRef.current;

      // Self collision (exclude tail when it will move away)
      const willEat = head.x === currentFood.x && head.y === currentFood.y;
      const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
      if (bodyToCheck.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameState('gameover');
        SoundManager.playDeath();
        const currentScore = scoreRef.current;
        const savedHigh = parseInt(localStorage.getItem('snake-high-score') || '0', 10);
        if (currentScore > savedHigh) {
          localStorage.setItem('snake-high-score', currentScore.toString());
          setHighScore(currentScore);
          if (currentScore > 0) SoundManager.playNewRecord();
        }
        return;
      }

      // Eat food
      if (willEat) {
        const newScore = scoreRef.current + 10;
        setScore(newScore);
        setFood(getRandomPosition(newSnake));
        eatCountRef.current += 1;
        SoundManager.playEat(eatCountRef.current);
        if (newScore % 100 === 0) {
          SoundManager.playLevelUp();
        }
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }, SPEED_MAP[difficulty]);

    return () => clearInterval(interval);
  }, [gameState, difficulty]);

  return {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    difficulty,
    gridSize: GRID_SIZE,
    setDifficulty,
    startGame,
    togglePause,
    resetGame,
    changeDirection,
  };
}

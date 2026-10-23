import { Difficulty, Direction, Food, FoodKind, GameEvent, GameState, Mover, Position } from '../types';
import {
  COMBO_WINDOW_TICKS,
  DIFFICULTIES,
  FOODS,
  INITIAL_LENGTH,
  LEVEL_CLEAR_BONUS,
  MAX_COMBO_MULTIPLIER,
  SHRINK_AMOUNT,
  SLOW_DURATION_TICKS,
  SLOW_FACTOR,
} from './config';
import { OPPOSITE, inBounds, samePos, stepPos, toKey, wrapPos } from './grid';
import { LEVELS } from './levels';

export type Rng = () => number;

export interface StepResult {
  state: GameState;
  events: GameEvent[];
}

const MAX_QUEUED_TURNS = 2;

function randomFreeCell(state: Pick<GameState, 'level'>, occupied: Set<string>, rng: Rng): Position | null {
  const { level } = state;
  const free: Position[] = [];
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const key = toKey({ x, y });
      if (!level.wallKeys.has(key) && !level.portalExits.has(key) && !occupied.has(key)) free.push({ x, y });
    }
  }
  return free.length ? free[Math.floor(rng() * free.length)] : null;
}

function occupiedKeys(snake: Position[], movers: Mover[], foods: (Food | null)[]): Set<string> {
  const keys = new Set(snake.map(toKey));
  movers.forEach(m => keys.add(toKey(m.pos)));
  foods.forEach(f => f && keys.add(toKey(f.pos)));
  return keys;
}

function spawnFood(state: Pick<GameState, 'level'>, kind: FoodKind, occupied: Set<string>, rng: Rng): Food | null {
  const pos = randomFreeCell(state, occupied, rng);
  return pos ? { kind, pos, ttl: FOODS[kind].ttl } : null;
}

/** Places the snake, movers and first apple for a level, keeping run-wide values. */
function enterLevel(
  levelIndex: number,
  difficulty: Difficulty,
  carry: Pick<GameState, 'score' | 'lives' | 'applesEaten'>,
  status: GameState['status'],
  rng: Rng,
): GameState {
  const level = LEVELS[levelIndex];
  const snake = Array.from({ length: INITIAL_LENGTH }, (_, i) => ({ x: level.start.x - i, y: level.start.y }));
  const movers = level.movers.map(m => ({ ...m, pos: { ...m.pos } }));
  const apple = spawnFood({ level }, 'apple', occupiedKeys(snake, movers, []), rng);
  if (!apple) throw new Error(`Level ${levelIndex + 1} has no free cell for food`);

  return {
    status,
    difficulty,
    level,
    snake,
    direction: 'RIGHT',
    queuedDirections: [],
    apple,
    special: null,
    movers,
    score: carry.score,
    lives: carry.lives,
    applesEaten: carry.applesEaten,
    combo: 0,
    ticksSinceEat: 0,
    slowTicks: 0,
    tick: 0,
  };
}

export function createGame(levelIndex: number, difficulty: Difficulty, rng: Rng = Math.random): GameState {
  const lives = DIFFICULTIES[difficulty].lives;
  return enterLevel(levelIndex, difficulty, { score: 0, lives, applesEaten: 0 }, 'ready', rng);
}

/** Restart the current level after losing a life; apple progress is kept. */
export function retryLevel(state: GameState, rng: Rng = Math.random): GameState {
  return enterLevel(state.level.index, state.difficulty, state, 'playing', rng);
}

export function nextLevel(state: GameState, rng: Rng = Math.random): GameState {
  const carry = { score: state.score, lives: state.lives, applesEaten: 0 };
  return enterLevel(state.level.index + 1, state.difficulty, carry, 'playing', rng);
}

export function startPlaying(state: GameState): GameState {
  return state.status === 'ready' ? { ...state, status: 'playing' } : state;
}

export function togglePause(state: GameState): GameState {
  if (state.status === 'playing') return { ...state, status: 'paused' };
  if (state.status === 'paused') return { ...state, status: 'playing' };
  return state;
}

export function queueDirection(state: GameState, dir: Direction): { state: GameState; accepted: boolean } {
  if (state.status !== 'playing' || state.queuedDirections.length >= MAX_QUEUED_TURNS) {
    return { state, accepted: false };
  }
  const last = state.queuedDirections[state.queuedDirections.length - 1] ?? state.direction;
  if (dir === last || dir === OPPOSITE[last]) return { state, accepted: false };
  return { state: { ...state, queuedDirections: [...state.queuedDirections, dir] }, accepted: true };
}

export function getTickInterval(state: GameState): number {
  const { level } = state;
  const base = Math.max(level.minInterval, level.baseInterval - level.speedUpPerApple * state.applesEaten);
  const slow = state.slowTicks > 0 ? SLOW_FACTOR : 1;
  return Math.round(base * DIFFICULTIES[state.difficulty].speedFactor * slow);
}

function crash(state: GameState, events: GameEvent[]): StepResult {
  const lives = state.lives - 1;
  events.push({ type: 'crash' });
  return {
    state: { ...state, lives, status: lives > 0 ? 'lifeLost' : 'gameOver', queuedDirections: [] },
    events,
  };
}

function moveMovers(state: GameState, blocked: Set<string>): Mover[] {
  const { level } = state;
  const taken = new Set(state.movers.map(m => toKey(m.pos)));
  const isFree = (p: Position) => {
    const key = toKey(p);
    return (
      inBounds(p, level.width, level.height) &&
      !level.wallKeys.has(key) &&
      !level.portalExits.has(key) &&
      !blocked.has(key) &&
      !taken.has(key)
    );
  };

  return state.movers.map(m => {
    taken.delete(toKey(m.pos));
    let dir = m.dir;
    let next = stepPos(m.pos, dir);
    if (!isFree(next)) {
      dir = OPPOSITE[dir];
      next = stepPos(m.pos, dir);
    }
    const moved = isFree(next) ? { pos: next, dir } : { pos: m.pos, dir };
    taken.add(toKey(moved.pos));
    return moved;
  });
}

/** Advances the game by one tick. Pure: same input and rng give the same result. */
export function step(state: GameState, rng: Rng = Math.random): StepResult {
  if (state.status !== 'playing') return { state, events: [] };

  const events: GameEvent[] = [];
  const { level } = state;
  const [queued, ...queuedDirections] = state.queuedDirections;
  const direction = queued ?? state.direction;
  const tick = state.tick + 1;

  let head = stepPos(state.snake[0], direction);
  if (level.wrap) head = wrapPos(head, level.width, level.height);
  else if (!inBounds(head, level.width, level.height)) return crash(state, events);

  const portalExit = level.portalExits.get(toKey(head));
  if (portalExit) {
    head = portalExit;
    events.push({ type: 'portal' });
  }

  const eaten = samePos(head, state.apple.pos)
    ? state.apple
    : state.special && samePos(head, state.special.pos)
      ? state.special
      : null;

  // The tail moves out of the way this tick unless the snake grows.
  const body = eaten ? state.snake : state.snake.slice(0, -1);
  const hitsSomething =
    level.wallKeys.has(toKey(head)) ||
    state.movers.some(m => samePos(m.pos, head)) ||
    body.some(s => samePos(s, head));
  if (hitsSomething) return crash(state, events);

  let snake = [head, ...body];
  let { score, applesEaten, combo, apple, special } = state;
  let ticksSinceEat = state.ticksSinceEat + 1;
  let slowTicks = Math.max(0, state.slowTicks - 1);
  let status: GameState['status'] = 'playing';

  if (special && special !== eaten && special.ttl !== null) {
    special = special.ttl <= 1 ? null : { ...special, ttl: special.ttl - 1 };
    if (!special) events.push({ type: 'specialExpired' });
  }

  if (eaten) {
    combo = ticksSinceEat <= COMBO_WINDOW_TICKS ? combo + 1 : 1;
    const points = FOODS[eaten.kind].points * Math.min(combo, MAX_COMBO_MULTIPLIER);
    score += points;
    ticksSinceEat = 0;
    events.push({ type: 'eat', food: eaten.kind, combo, points });

    if (eaten.kind === 'ice') slowTicks = SLOW_DURATION_TICKS;
    if (eaten.kind === 'shrink') snake = snake.slice(0, Math.max(INITIAL_LENGTH, snake.length - SHRINK_AMOUNT));

    if (eaten.kind === 'apple') {
      applesEaten += 1;
      const nextApple =
        applesEaten < level.goal ? spawnFood(state, 'apple', occupiedKeys(snake, state.movers, [special]), rng) : null;

      if (!nextApple) {
        const isLast = level.index === LEVELS.length - 1;
        const bonus = LEVEL_CLEAR_BONUS * (level.index + 1);
        score += bonus;
        status = isLast ? 'victory' : 'levelComplete';
        events.push(isLast ? { type: 'victory' } : { type: 'levelComplete', bonus });
      } else {
        apple = nextApple;
        if (!special && level.specialFoods.length > 0 && rng() < level.specialChance) {
          const kind = level.specialFoods[Math.floor(rng() * level.specialFoods.length)];
          special = spawnFood(state, kind, occupiedKeys(snake, state.movers, [apple]), rng);
          if (special) events.push({ type: 'specialSpawned', food: kind });
        }
      }
    } else {
      special = null;
    }
  }

  const movers =
    level.movers.length > 0 && tick % level.moverEvery === 0
      ? moveMovers(state, occupiedKeys(snake, [], [apple, special]))
      : state.movers;

  return {
    state: {
      ...state,
      status,
      snake,
      direction,
      queuedDirections,
      apple,
      special,
      movers,
      score,
      applesEaten,
      combo,
      ticksSinceEat,
      slowTicks,
      tick,
    },
    events,
  };
}

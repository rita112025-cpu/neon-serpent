export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus =
  | 'ready' // level select / waiting to start
  | 'playing'
  | 'paused'
  | 'lifeLost' // crashed, but lives remain
  | 'levelComplete'
  | 'gameOver'
  | 'victory'; // cleared the final level

export type FoodKind = 'apple' | 'gold' | 'ice' | 'shrink';

export interface Food {
  kind: FoodKind;
  pos: Position;
  /** Ticks left before the food disappears; null means it never expires. */
  ttl: number | null;
}

export interface Mover {
  pos: Position;
  dir: Direction;
}

export interface Portal {
  pos: Position;
  pair: number;
}

export type TrackId =
  | 'meadow'
  | 'garden'
  | 'crossroads'
  | 'portal'
  | 'wraparound'
  | 'patrol'
  | 'lava'
  | 'finale';

export interface LevelTheme {
  background: string;
  grid: string;
  wall: string;
  wallGlow: string;
  snakeHead: string;
  snakeBody: string;
  accent: string;
}

export interface LevelDefinition {
  name: string;
  description: string;
  /** ASCII map; see compileLevel for the legend. */
  map: string[];
  /** Apples needed to clear the level. */
  goal: number;
  /** Milliseconds per tick at medium difficulty. */
  baseInterval: number;
  minInterval: number;
  /** Milliseconds removed from the interval per apple eaten. */
  speedUpPerApple: number;
  /** Edges wrap around instead of killing the snake. */
  wrap: boolean;
  /** Special foods that may spawn in this level. */
  specialFoods: FoodKind[];
  /** Chance (0-1) to spawn a special food after an apple is eaten. */
  specialChance: number;
  /** Movers advance once every N ticks. */
  moverEvery: number;
  theme: LevelTheme;
  music: TrackId;
}

export interface CompiledLevel extends Omit<LevelDefinition, 'map'> {
  index: number;
  width: number;
  height: number;
  walls: Position[];
  wallKeys: ReadonlySet<string>;
  portals: Portal[];
  /** Maps a portal cell key to the position of its partner. */
  portalExits: ReadonlyMap<string, Position>;
  start: Position;
  movers: Mover[];
}

export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  level: CompiledLevel;
  snake: Position[];
  direction: Direction;
  /** Buffered turns, applied one per tick so quick double-taps are not lost. */
  queuedDirections: Direction[];
  apple: Food;
  special: Food | null;
  movers: Mover[];
  score: number;
  lives: number;
  applesEaten: number;
  combo: number;
  ticksSinceEat: number;
  slowTicks: number;
  tick: number;
}

export type GameEvent =
  | { type: 'eat'; food: FoodKind; combo: number; points: number }
  | { type: 'specialSpawned'; food: FoodKind }
  | { type: 'specialExpired' }
  | { type: 'portal' }
  | { type: 'crash' }
  | { type: 'levelComplete'; bonus: number }
  | { type: 'victory' };

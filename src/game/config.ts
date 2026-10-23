import { Difficulty, FoodKind } from '../types';

export interface DifficultySettings {
  label: string;
  /** Multiplies the tick interval: higher is slower. */
  speedFactor: number;
  lives: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultySettings> = {
  easy: { label: '簡單', speedFactor: 1.3, lives: 5 },
  medium: { label: '中等', speedFactor: 1, lives: 3 },
  hard: { label: '困難', speedFactor: 0.75, lives: 2 },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

export interface FoodSettings {
  label: string;
  points: number;
  /** Ticks before it disappears; null means permanent. */
  ttl: number | null;
}

export const FOODS: Record<FoodKind, FoodSettings> = {
  apple: { label: '蘋果', points: 10, ttl: null },
  gold: { label: '金蘋果', points: 50, ttl: 45 },
  ice: { label: '冰晶（減速）', points: 10, ttl: 45 },
  shrink: { label: '縮小藥（尾巴變短）', points: 20, ttl: 45 },
};

export const INITIAL_LENGTH = 3;

/** Eating again within this many ticks raises the combo multiplier. */
export const COMBO_WINDOW_TICKS = 30;
export const MAX_COMBO_MULTIPLIER = 5;

export const SLOW_DURATION_TICKS = 40;
/** Interval multiplier while slowed by ice. */
export const SLOW_FACTOR = 1.5;

export const SHRINK_AMOUNT = 3;

/** Clear bonus = this × level number. */
export const LEVEL_CLEAR_BONUS = 50;

/** Special foods start blinking when this many ticks remain. */
export const EXPIRY_WARNING_TICKS = 12;

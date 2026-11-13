import { FoodKind } from '../types';

export interface FoodStyle {
  color: string;
  glow: string;
  icon?: string;
}

export const FOOD_STYLES: Record<FoodKind, FoodStyle> = {
  apple: { color: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
  gold: { color: '#fbbf24', glow: 'rgba(251,191,36,0.8)', icon: '★' },
  ice: { color: '#67e8f9', glow: 'rgba(103,232,249,0.8)', icon: '❄' },
  shrink: { color: '#c084fc', glow: 'rgba(192,132,252,0.8)', icon: '−' },
};

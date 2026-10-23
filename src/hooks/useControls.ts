import { useEffect, useRef } from 'react';
import type { TouchEvent } from 'react';
import { Direction } from '../types';

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
};

interface KeyboardHandlers {
  onTurn: (dir: Direction) => void;
  onPrimary: () => void;
  onPause: () => void;
  onMenu: () => void;
}

export function useKeyboardControls({ onTurn, onPrimary, onPause, onMenu }: KeyboardHandlers): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const dir = KEY_DIRECTIONS[key];
      if (dir) {
        e.preventDefault();
        onTurn(dir);
      } else if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        onPrimary();
      } else if (key === 'Escape' || key === 'p') {
        onPause();
      } else if (key === 'r') {
        onMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onTurn, onPrimary, onPause, onMenu]);
}

const MIN_SWIPE_PX = 20;

/** Returns touch handlers that turn a swipe into a direction. */
export function useSwipe(onSwipe: (dir: Direction) => void) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e: TouchEvent) => {
      const touch = e.touches[0];
      startRef.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd: (e: TouchEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) < MIN_SWIPE_PX && Math.abs(dy) < MIN_SWIPE_PX) return;
      if (Math.abs(dx) > Math.abs(dy)) onSwipe(dx > 0 ? 'RIGHT' : 'LEFT');
      else onSwipe(dy > 0 ? 'DOWN' : 'UP');
    },
    onTouchCancel: () => {
      startRef.current = null;
    },
  };
}

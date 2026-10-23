import { Direction, Position } from '../types';

export const DIRECTION_VECTORS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const OPPOSITE: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export function toKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function samePos(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function stepPos(pos: Position, dir: Direction): Position {
  const v = DIRECTION_VECTORS[dir];
  return { x: pos.x + v.x, y: pos.y + v.y };
}

export function inBounds(pos: Position, width: number, height: number): boolean {
  return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
}

export function wrapPos(pos: Position, width: number, height: number): Position {
  return {
    x: ((pos.x % width) + width) % width,
    y: ((pos.y % height) + height) % height,
  };
}

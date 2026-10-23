import { CompiledLevel, LevelDefinition, Mover, Portal, Position } from '../types';
import { INITIAL_LENGTH } from './config';
import { toKey } from './grid';

/**
 * Turns an ASCII level map into runtime data. Map legend:
 *
 *   .    empty
 *   #    wall
 *   S    snake head start (faces right; the body extends to the left)
 *   1-9  portal: exactly two cells per digit, linked to each other
 *   H    mover patrolling horizontally (starts moving right)
 *   V    mover patrolling vertically (starts moving down)
 *
 * Invalid maps throw at load time so level mistakes show up immediately.
 */
export function compileLevel(def: LevelDefinition, index: number): CompiledLevel {
  const { map, ...settings } = def;
  const fail = (message: string): never => {
    throw new Error(`Level ${index + 1} "${def.name}": ${message}`);
  };

  const height = map.length;
  const width = map[0]?.length ?? 0;
  if (height === 0 || width === 0) fail('map is empty');

  const walls: Position[] = [];
  const movers: Mover[] = [];
  const portalCells = new Map<string, Position[]>();
  let start: Position | null = null;

  for (let y = 0; y < height; y++) {
    const row = map[y];
    if (row.length !== width) fail(`row ${y} has ${row.length} columns, expected ${width}`);

    for (let x = 0; x < width; x++) {
      const cell = row[x];
      const pos = { x, y };
      if (cell === '.') continue;
      if (cell === '#') walls.push(pos);
      else if (cell === 'H') movers.push({ pos, dir: 'RIGHT' });
      else if (cell === 'V') movers.push({ pos, dir: 'DOWN' });
      else if (cell === 'S') {
        if (start) fail('has more than one start (S)');
        start = pos;
      } else if (/[1-9]/.test(cell)) {
        portalCells.set(cell, [...(portalCells.get(cell) ?? []), pos]);
      } else {
        fail(`unknown map character "${cell}" at ${x},${y}`);
      }
    }
  }

  const startPos = start ?? fail('has no start (S)');

  const portals: Portal[] = [];
  const portalExits = new Map<string, Position>();
  portalCells.forEach((cells, digit) => {
    if (cells.length !== 2) fail(`portal ${digit} needs exactly 2 cells, found ${cells.length}`);
    const [a, b] = cells;
    portalExits.set(toKey(a), b);
    portalExits.set(toKey(b), a);
    portals.push({ pos: a, pair: Number(digit) }, { pos: b, pair: Number(digit) });
  });

  for (let i = 1; i < INITIAL_LENGTH; i++) {
    const x = startPos.x - i;
    if (x < 0 || map[startPos.y][x] !== '.') fail(`the starting body cell ${x},${startPos.y} must be empty`);
  }

  return {
    ...settings,
    index,
    width,
    height,
    walls,
    wallKeys: new Set(walls.map(toKey)),
    portals,
    portalExits,
    start: startPos,
    movers,
  };
}

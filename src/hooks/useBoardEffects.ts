import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEvent, GameState, Position } from '../types';
import { FOOD_STYLES } from '../components/foodStyles';

export type BoardEffect =
  | { id: number; kind: 'burst'; pos: Position; color: string; text: string }
  | { id: number; kind: 'crash'; pos: Position }
  | { id: number; kind: 'flash'; color: string };

/** How long an effect stays mounted; must cover the longest effect animation. */
const EFFECT_LIFETIME_MS = 900;

/** BoardEffect without its id; distributes over the union so each variant keeps its own fields. */
type WithoutId<T> = T extends unknown ? Omit<T, 'id'> : never;
type NewEffect = WithoutId<BoardEffect>;

function effectsFor(event: GameEvent, state: GameState): NewEffect[] {
  const head = state.snake[0];
  switch (event.type) {
    case 'eat':
      return head ? [{ kind: 'burst', pos: head, color: FOOD_STYLES[event.food].color, text: `+${event.points}` }] : [];
    case 'crash':
      return head ? [{ kind: 'crash', pos: head }] : [];
    case 'levelComplete':
    case 'victory':
      return [{ kind: 'flash', color: state.level.theme.accent }];
    default:
      return [];
  }
}

/** Short-lived visual effects (particles, shock rings, flashes) driven by game events. */
export function useBoardEffects() {
  const [effects, setEffects] = useState<BoardEffect[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  const nextId = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(t => window.clearTimeout(t));
  }, []);

  const handleEvents = useCallback((events: GameEvent[], state: GameState) => {
    const added: BoardEffect[] = events
      .flatMap(event => effectsFor(event, state))
      .map(effect => ({ ...effect, id: nextId.current++ }) as BoardEffect);
    if (events.some(e => e.type === 'crash')) setShakeKey(k => k + 1);
    if (added.length === 0) return;

    setEffects(prev => [...prev, ...added]);
    const ids = new Set(added.map(e => e.id));
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      setEffects(prev => prev.filter(e => !ids.has(e.id)));
    }, EFFECT_LIFETIME_MS);
    timers.current.add(timer);
  }, []);

  return { effects, shakeKey, handleEvents };
}

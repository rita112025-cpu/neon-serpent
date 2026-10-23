import { Direction } from '../types';

interface DPadProps {
  onTurn: (dir: Direction) => void;
}

const BUTTONS: { dir: Direction; label: string; area: string }[] = [
  { dir: 'UP', label: '▲', area: 'col-start-2 row-start-1' },
  { dir: 'LEFT', label: '◀', area: 'col-start-1 row-start-2' },
  { dir: 'RIGHT', label: '▶', area: 'col-start-3 row-start-2' },
  { dir: 'DOWN', label: '▼', area: 'col-start-2 row-start-3' },
];

/** On-screen arrows for phones; hidden on desktop. */
export function DPad({ onTurn }: DPadProps) {
  return (
    <div className="md:hidden grid grid-cols-3 grid-rows-3 gap-1.5 w-32 mt-1">
      {BUTTONS.map(({ dir, label, area }) => (
        <button
          key={dir}
          aria-label={dir}
          onTouchStart={e => {
            e.stopPropagation();
            onTurn(dir);
          }}
          className={`${area} aspect-square bg-gray-800 active:bg-emerald-600 touch-manipulation rounded-xl flex items-center justify-center text-gray-300 text-lg border border-gray-700/50`}
        >
          {label}
        </button>
      ))}
      <div className="col-start-2 row-start-2 aspect-square bg-gray-900/80 rounded-xl border border-gray-800 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
      </div>
    </div>
  );
}

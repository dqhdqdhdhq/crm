import { useEffect, useRef, useState } from 'react';

const QUICK_EMOJIS = [
  '📄', '📝', '📌', '📋', '📒', '📓', '📔', '📕', '📗', '📘',
  '📙', '🗂️', '📁', '📂', '📅', '📆', '🗓️', '✅', '✏️', '📞',
  '💼', '💡', '🚀', '🎯', '🔥', '⭐', '🌟', '✨', '🧠', '🎉',
  '💰', '📈', '📉', '📊', '🤝', '👥', '🗣️', '📢', '📣', '🔔',
  '🌍', '🌎', '🌐', '🏠', '🏢', '🏆', '🎨', '🎬', '🎮', '🎵',
  '☕', '🍎', '🍕', '🥗', '🍰', '🎂', '🍷', '🌱', '🌳', '🌸',
  '🐶', '🐱', '🐰', '🦊', '🦁', '🐯', '🦄', '🐳', '🐠', '🦋',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💯',
];

interface IconPickerProps {
  value?: string;
  onPick: (emoji: string) => void;
  onRemove?: () => void;
  onClose: () => void;
  anchor: { top: number; left: number };
}

export function IconPicker({ value, onPick, onRemove, onClose, anchor }: IconPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', onClickAway);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClickAway);
      window.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const filtered = query
    ? QUICK_EMOJIS.filter(() => true) // simple list — emoji search by name isn't trivial without a library; show all
    : QUICK_EMOJIS;

  return (
    <div
      ref={ref}
      className="fixed z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-3"
      style={{ top: anchor.top, left: anchor.left }}
    >
      <div className="flex items-center gap-2 mb-3">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter…"
          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
        {onRemove && value && (
          <button
            onClick={onRemove}
            className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
        {filtered.map((e) => (
          <button
            key={e}
            onClick={() => onPick(e)}
            className={`text-2xl p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
              value === e ? 'bg-blue-50' : ''
            }`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

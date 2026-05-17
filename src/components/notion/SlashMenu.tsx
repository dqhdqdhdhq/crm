import { useEffect, useMemo, useRef } from 'react';
import { filterSlashItems, SlashItem, SlashItemKind } from './blocks';

interface SlashMenuProps {
  query: string;
  selectedIndex: number;
  onIndexChange: (i: number) => void;
  onPick: (kind: SlashItemKind) => void;
  onClose: () => void;
  anchor: { top: number; left: number } | null;
}

export function SlashMenu({ query, selectedIndex, onIndexChange, onPick, onClose, anchor }: SlashMenuProps) {
  const items = useMemo(() => filterSlashItems(query), [query]);
  const listRef = useRef<HTMLDivElement>(null);
  const clampedIndex = items.length === 0 ? 0 : Math.min(selectedIndex, items.length - 1);

  // Scroll selected into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-slash-index="${clampedIndex}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [clampedIndex]);

  // Click-outside / Esc handled by parent through keydown intercept; we just render.
  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target && !target.closest('.slash-menu')) onClose();
    };
    window.addEventListener('mousedown', onClickAway);
    return () => window.removeEventListener('mousedown', onClickAway);
  }, [onClose]);

  if (!anchor) return null;

  const groups: Record<string, SlashItem[]> = {};
  items.forEach((item) => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  return (
    <div
      className="slash-menu fixed z-50 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl py-2"
      style={{ top: anchor.top, left: anchor.left }}
    >
      {items.length === 0 ? (
        <div className="px-4 py-6 text-sm text-gray-500 text-center">
          No blocks match "{query}"
        </div>
      ) : (
        <div ref={listRef}>
          {Object.entries(groups).map(([groupName, groupItems]) => (
            <div key={groupName} className="mb-1 last:mb-0">
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {groupName}
              </div>
              {groupItems.map((item) => {
                const globalIndex = items.indexOf(item);
                const active = globalIndex === clampedIndex;
                return (
                  <button
                    key={item.kind}
                    data-slash-index={globalIndex}
                    onMouseEnter={() => onIndexChange(globalIndex)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onPick(item.kind);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      active ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        active ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <item.icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

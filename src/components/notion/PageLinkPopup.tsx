import { useEffect, useMemo, useRef } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Page } from '../../types';

interface PageLinkPopupProps {
  query: string;
  pages: Page[];
  selectedIndex: number;
  onIndexChange: (i: number) => void;
  onPick: (pageId: string, title: string) => void;
  onCreateAndPick: (title: string) => void;
  onClose: () => void;
  anchor: { top: number; left: number } | null;
}

export function PageLinkPopup({
  query,
  pages,
  selectedIndex,
  onIndexChange,
  onPick,
  onCreateAndPick,
  onClose,
  anchor,
}: PageLinkPopupProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages.slice(0, 8);
    return pages
      .filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [pages, query]);

  // Synthetic "create new" entry appears last if the query is non-empty.
  const hasCreateOption = query.trim().length > 0;
  const total = filtered.length + (hasCreateOption ? 1 : 0);
  const clamped = total === 0 ? 0 : Math.min(selectedIndex, total - 1);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-link-index="${clamped}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [clamped]);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target && !target.closest('.page-link-popup')) onClose();
    };
    window.addEventListener('mousedown', onClickAway);
    return () => window.removeEventListener('mousedown', onClickAway);
  }, [onClose]);

  if (!anchor) return null;

  return (
    <div
      className="page-link-popup fixed z-50 w-72 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl py-2"
      style={{ top: anchor.top, left: anchor.left }}
    >
      <div className="px-3 pt-1 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        Link to page
      </div>
      <div ref={listRef}>
        {filtered.map((p, i) => {
          const active = i === clamped;
          return (
            <button
              key={p.id}
              data-link-index={i}
              onMouseEnter={() => onIndexChange(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(p.id, p.title);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                active ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-base w-6 text-center">{p.emoji || '📄'}</span>
              <span className="flex-1 min-w-0 truncate text-sm text-gray-900">{p.title || 'Untitled'}</span>
            </button>
          );
        })}
        {hasCreateOption && (
          <button
            data-link-index={filtered.length}
            onMouseEnter={() => onIndexChange(filtered.length)}
            onMouseDown={(e) => {
              e.preventDefault();
              onCreateAndPick(query.trim());
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-t border-gray-100 ${
              clamped === filtered.length ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="flex-1 min-w-0 truncate text-sm">
              Create <span className="font-semibold text-blue-700">"{query.trim()}"</span>
            </span>
            <FileText className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
        {filtered.length === 0 && !hasCreateOption && (
          <div className="px-4 py-4 text-sm text-gray-500 text-center">No pages</div>
        )}
      </div>
    </div>
  );
}

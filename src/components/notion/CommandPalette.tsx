import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, FileText, Plus, ArrowUpRight } from 'lucide-react';
import { Page } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  pages: Page[];
  onClose: () => void;
  onSelectPage: (id: string) => void;
  onCreatePage: (title?: string) => void;
}

export function CommandPalette({ isOpen, pages, onClose, onSelectPage, onCreatePage }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return pages
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 12);
    }
    return pages
      .filter((p) => p.title.toLowerCase().includes(q) || pageMatchesContent(p, q))
      .slice(0, 12);
  }, [pages, query]);

  const hasCreate = query.trim().length > 0;
  const total = results.length + (hasCreate ? 1 : 0);
  const clamped = total === 0 ? 0 : Math.min(index, total - 1);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex(Math.min(total - 1, clamped + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex(Math.max(0, clamped - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (clamped < results.length) {
                  onSelectPage(results[clamped].id);
                  onClose();
                } else if (hasCreate) {
                  onCreatePage(query.trim());
                  onClose();
                }
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="Search pages, jump to anything…"
            className="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder-gray-400"
          />
          <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">esc</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto py-2">
          {results.length === 0 && !hasCreate && (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">No matches</div>
          )}
          {results.map((p, i) => (
            <button
              key={p.id}
              onMouseEnter={() => setIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectPage(p.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                i === clamped ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-base w-6 text-center">{p.emoji || '📄'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{p.title || 'Untitled'}</div>
                <div className="text-xs text-gray-500">
                  Updated {new Date(p.updatedAt).toLocaleDateString()} · {p.blocks.length} blocks
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-300" />
            </button>
          ))}
          {hasCreate && (
            <button
              onMouseEnter={() => setIndex(results.length)}
              onMouseDown={(e) => {
                e.preventDefault();
                onCreatePage(query.trim());
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left border-t border-gray-100 transition-colors ${
                clamped === results.length ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="flex-1 text-sm">
                Create new page <span className="font-semibold text-blue-700">"{query.trim()}"</span>
              </span>
            </button>
          )}
        </div>
        <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><kbd className="border border-gray-200 rounded px-1 py-0.5">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="border border-gray-200 rounded px-1 py-0.5">↵</kbd> open</span>
          <span className="ml-auto">⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}

function pageMatchesContent(page: Page, q: string): boolean {
  return page.blocks.some((b) => {
    if (!('content' in b)) return false;
    const c = (b as any).content;
    if (typeof c !== 'string') return false;
    // strip HTML quickly for searching
    return c.replace(/<[^>]*>/g, '').toLowerCase().includes(q);
  });
}

import { ChevronRight, Link2 } from 'lucide-react';
import { Page } from '../../types';

interface BacklinksProps {
  currentPageId: string;
  allPages: Page[];
  onSelect: (pageId: string) => void;
}

/**
 * Find every page whose content references the current page via a
 * <a data-page-id="..."> mention.
 */
export function findBacklinks(currentPageId: string, allPages: Page[]): Page[] {
  return allPages.filter((page) => {
    if (page.id === currentPageId) return false;
    return page.blocks.some((b) => {
      const content = 'content' in b ? (b as any).content : '';
      if (typeof content !== 'string') return false;
      return content.includes(`data-page-id="${currentPageId}"`);
    });
  });
}

export function Backlinks({ currentPageId, allPages, onSelect }: BacklinksProps) {
  const links = findBacklinks(currentPageId, allPages);
  if (links.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <Link2 className="w-3.5 h-3.5" />
        <span>{links.length} {links.length === 1 ? 'page links' : 'pages link'} here</span>
      </div>
      <div className="space-y-1">
        {links.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="w-full flex items-center gap-3 p-2 text-left rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <span className="text-lg">{p.emoji || '📄'}</span>
            <span className="flex-1 min-w-0 truncate text-sm text-gray-800 group-hover:text-gray-900 font-medium">
              {p.title || 'Untitled'}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

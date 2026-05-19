import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Trash2,
  Star,
  Clock,
  FileText,
  Filter,
  Command,
} from 'lucide-react';
import { Page, PageTemplate, PageCategory } from '../types';

interface PagesOverviewProps {
  pages: Page[];
  categories?: any[];
  templates: PageTemplate[];
  pageCategories?: PageCategory[];
  onSelectPage: (pageId: string) => void;
  onCreatePage: (templateId?: string) => void;
  onUpdateTemplates?: (templates: PageTemplate[]) => void;
  onUpdatePageCategories?: (categories: PageCategory[]) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePage: (page: Page) => void;
  onOpenCommandPalette?: () => void;
}

type SortMode = 'updated' | 'created' | 'title';
type ViewMode = 'grid' | 'list';
type Filter = 'all' | 'favorites' | 'root';

export function PagesOverview({
  pages,
  templates,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onUpdatePage,
  onOpenCommandPalette,
}: PagesOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortMode>('updated');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pages
      .filter((p) => {
        if (filter === 'favorites' && !p.favorite) return false;
        if (filter === 'root' && p.parentId) return false;
        if (!q) return true;
        if (p.title.toLowerCase().includes(q)) return true;
        return p.blocks.some((b) => {
          if (!('content' in b)) return false;
          const c = (b as any).content;
          return typeof c === 'string' && c.replace(/<[^>]*>/g, '').toLowerCase().includes(q);
        });
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return (a.title || '').localeCompare(b.title || '');
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });
  }, [pages, searchQuery, sortBy, filter]);

  const recent = useMemo(
    () =>
      pages
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4),
    [pages],
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
              <p className="text-sm text-gray-500">Everything you write, connected.</p>
            </div>
            <div className="flex items-center gap-2">
              {onOpenCommandPalette && (
                <button
                  onClick={onOpenCommandPalette}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Quick search (⌘K)"
                >
                  <Command className="w-3.5 h-3.5" />
                  <span>Quick switch</span>
                  <kbd className="text-[10px] border border-gray-200 rounded px-1 py-0.5 bg-gray-50">⌘K</kbd>
                </button>
              )}
              <button
                onClick={() => onCreatePage()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New page</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title or content…"
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
              {(['all', 'favorites', 'root'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'favorites' ? 'Favorites' : 'Top-level'}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortMode)}
              className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="updated">Last updated</option>
              <option value="created">Created</option>
              <option value="title">Title A–Z</option>
            </select>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Quick start */}
        {!searchQuery && filter === 'all' && templates.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Start from a template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => onCreatePage()}
                className="group p-4 bg-white border border-gray-200 border-dashed rounded-xl hover:border-blue-300 hover:bg-blue-50/30 text-left transition-colors"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">Blank page</div>
                <div className="text-xs text-gray-500">Start with an empty canvas</div>
              </button>
              {templates.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  onClick={() => onCreatePage(t.id)}
                  className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm text-left transition-all"
                >
                  <div className="text-2xl mb-2">{t.emoji}</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">{t.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{t.description}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        {!searchQuery && filter === 'all' && recent.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Recently edited</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {recent.map((p) => (
                <PageCard key={p.id} page={p} onSelect={onSelectPage} onUpdate={onUpdatePage} onDelete={onDeletePage} dense />
              ))}
            </div>
          </section>
        )}

        {/* All */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            {searchQuery ? `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}` : 'All pages'}
          </h2>
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {searchQuery ? 'No matches' : 'No pages yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {searchQuery ? 'Try a different search term.' : 'Create your first page to get started.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => onCreatePage()}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                >
                  Create page
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <PageCard key={p.id} page={p} onSelect={onSelectPage} onUpdate={onUpdatePage} onDelete={onDeletePage} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {filtered.map((p, i) => (
                <PageRow
                  key={p.id}
                  page={p}
                  onSelect={onSelectPage}
                  onUpdate={onUpdatePage}
                  onDelete={onDeletePage}
                  isLast={i === filtered.length - 1}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface CardProps {
  page: Page;
  onSelect: (id: string) => void;
  onUpdate: (p: Page) => void;
  onDelete: (id: string) => void;
  dense?: boolean;
}

function PageCard({ page, onSelect, onUpdate, onDelete, dense }: CardProps) {
  const preview = useMemo(() => extractPreview(page), [page]);
  return (
    <div
      onClick={() => onSelect(page.id)}
      className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {page.cover ? (
        <div className="h-20 bg-cover bg-center" style={{ backgroundImage: `url(${page.cover})` }} />
      ) : (
        <div className="h-20 bg-gradient-to-br from-gray-50 to-gray-100" />
      )}
      <div className="p-4 -mt-6">
        <div className="text-3xl mb-2 drop-shadow-sm">{page.emoji || '📄'}</div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">
            {page.title || 'Untitled'}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ ...page, favorite: !page.favorite });
            }}
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 -mr-1 ${
              page.favorite ? 'text-amber-500 opacity-100' : 'text-gray-300 hover:text-amber-500'
            }`}
          >
            <Star className="w-4 h-4" fill={page.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        {!dense && preview && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{preview}</p>
        )}
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${page.title || 'Untitled'}"?`)) onDelete(page.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PageRow({ page, onSelect, onUpdate, onDelete, isLast }: CardProps & { isLast: boolean }) {
  return (
    <div
      onClick={() => onSelect(page.id)}
      className={`group flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
    >
      <span className="text-lg">{page.emoji || '📄'}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{page.title || 'Untitled'}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>{new Date(page.updatedAt).toLocaleString()}</span>
          <span>·</span>
          <span>{page.blocks.length} blocks</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdate({ ...page, favorite: !page.favorite });
        }}
        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-gray-100 ${
          page.favorite ? 'text-amber-500 opacity-100' : 'text-gray-400'
        }`}
      >
        <Star className="w-4 h-4" fill={page.favorite ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Delete "${page.title || 'Untitled'}"?`)) onDelete(page.id);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 text-gray-400"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function extractPreview(page: Page): string {
  for (const b of page.blocks) {
    if (!('content' in b)) continue;
    const c = (b as any).content;
    if (typeof c !== 'string' || !c.trim()) continue;
    const text = c.replace(/<[^>]*>/g, '').trim();
    if (text) return text;
  }
  return '';
}

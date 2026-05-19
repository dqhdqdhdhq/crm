import { useState, useMemo } from 'react';
import { ChevronRight, Plus, MoreHorizontal, Trash2, Star, FilePlus } from 'lucide-react';
import { Page } from '../../types';

interface PageTreeProps {
  pages: Page[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onCreatePage: (opts?: { parentId?: string }) => void;
  onDeletePage: (id: string) => void;
  onUpdatePage: (page: Page) => void;
}

export function PageTree({
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onUpdatePage,
}: PageTreeProps) {
  const roots = useMemo(() => pages.filter((p) => !p.parentId), [pages]);
  const favorites = useMemo(() => pages.filter((p) => p.favorite), [pages]);

  return (
    <div className="space-y-4 text-sm">
      {favorites.length > 0 && (
        <Section title="Favorites">
          {favorites.map((p) => (
            <PageNode
              key={p.id}
              page={p}
              allPages={pages}
              level={0}
              activePageId={activePageId}
              onSelect={onSelectPage}
              onCreateChild={(parentId) => onCreatePage({ parentId })}
              onDelete={onDeletePage}
              onUpdate={onUpdatePage}
              expandedAll
            />
          ))}
        </Section>
      )}

      <Section
        title="Workspace"
        action={
          <button
            onClick={() => onCreatePage()}
            className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            title="New page"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        }
      >
        {roots.length === 0 ? (
          <button
            onClick={() => onCreatePage()}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span className="text-xs">Add a page</span>
          </button>
        ) : (
          roots.map((p) => (
            <PageNode
              key={p.id}
              page={p}
              allPages={pages}
              level={0}
              activePageId={activePageId}
              onSelect={onSelectPage}
              onCreateChild={(parentId) => onCreatePage({ parentId })}
              onDelete={onDeletePage}
              onUpdate={onUpdatePage}
            />
          ))
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-2 pb-1">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

interface PageNodeProps {
  page: Page;
  allPages: Page[];
  level: number;
  activePageId: string | null;
  onSelect: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (page: Page) => void;
  expandedAll?: boolean;
}

function PageNode({
  page,
  allPages,
  level,
  activePageId,
  onSelect,
  onCreateChild,
  onDelete,
  onUpdate,
  expandedAll,
}: PageNodeProps) {
  const children = useMemo(() => allPages.filter((p) => p.parentId === page.id), [allPages, page.id]);
  const [expanded, setExpanded] = useState(expandedAll ?? activePageId === page.id);
  const [showMenu, setShowMenu] = useState(false);
  const isActive = activePageId === page.id;
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-md transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-800'
        }`}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded(!expanded);
          }}
          className={`w-4 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 ${
            hasChildren ? '' : 'invisible'
          }`}
        >
          <ChevronRight
            className="w-3 h-3 transition-transform"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </button>
        <button
          onClick={() => onSelect(page.id)}
          className="flex-1 min-w-0 flex items-center gap-2 py-1 text-left"
        >
          <span className="text-base">{page.emoji || '📄'}</span>
          <span className={`text-sm truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
            {page.title || 'Untitled'}
          </span>
        </button>
        <div className={`flex items-center gap-0.5 pr-1 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
              title="More"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-30 py-1 min-w-[160px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onUpdate({ ...page, favorite: !page.favorite });
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50"
                >
                  <Star className={`w-3.5 h-3.5 ${page.favorite ? 'text-amber-500' : 'text-gray-400'}`} fill={page.favorite ? 'currentColor' : 'none'} />
                  {page.favorite ? 'Unfavorite' : 'Favorite'}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${page.title || 'Untitled'}"?`)) onDelete(page.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateChild(page.id);
              setExpanded(true);
            }}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
            title="Add sub-page"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {children.map((c) => (
            <PageNode
              key={c.id}
              page={c}
              allPages={allPages}
              level={level + 1}
              activePageId={activePageId}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

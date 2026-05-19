import { useEffect, useState } from 'react';
import {
  FileText,
  Calendar,
  Settings,
  User,
  Users,
  Clock,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Target,
  Command,
} from 'lucide-react';
import { Page } from '../types';
import { PageTree } from './notion/PageTree';

interface SidebarProps {
  activeSection: string;
  onSectionSelect: (section: string) => void;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (opts?: { parentId?: string }) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePage: (page: Page) => void;
  onOpenCommandPalette: () => void;
  pages: Page[];
  activePageId: string | null;
}

const navigationItems = [
  { id: 'command-centre', icon: Target, label: 'Command Centre' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'pages', icon: FileText, label: 'Pages' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'clients', icon: Users, label: 'Clients' },
  { id: 'subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { id: 'focus', icon: Clock, label: 'Focus Timer' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({
  activeSection,
  onSectionSelect,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onUpdatePage,
  onOpenCommandPalette,
  pages,
  activePageId,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const syncCollapsedState = () => {
      if (window.innerWidth < 768) setIsCollapsed(true);
    };
    syncCollapsedState();
    window.addEventListener('resize', syncCollapsedState);
    return () => window.removeEventListener('resize', syncCollapsedState);
  }, []);

  const isPagesSection = activeSection === 'pages' || activeSection === 'page';

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-72'
      } h-screen flex-shrink-0 bg-white/90 backdrop-blur-2xl border-r border-gray-200/30 flex flex-col shadow-xl overflow-hidden transition-[width] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)]`}
    >
      {/* Workspace header */}
      <div className="p-3 border-b border-gray-200/30 flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-100 flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div
          className={`flex-1 min-w-0 transition-opacity duration-150 ease-out ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-hidden={isCollapsed}
        >
          <h3 className="text-base font-bold text-gray-900 whitespace-nowrap">Workspace</h3>
          <p className="text-xs text-gray-600 font-medium whitespace-nowrap">Personal</p>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl bg-black/5 hover:bg-black/10 transition-opacity duration-150 flex-shrink-0 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          title="Collapse sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Expand affordance when collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mt-2 w-9 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center flex-shrink-0"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Static top: quick search + nav (never scrolls) */}
      <div className="flex-shrink-0">
        {!isCollapsed && (
          <div className="px-3 pt-3">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-lg text-left transition-colors"
            >
              <Command className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 flex-1">Quick switch</span>
              <kbd className="text-[10px] text-gray-400 border border-gray-200 rounded px-1 py-0.5 bg-white">⌘K</kbd>
            </button>
          </div>
        )}

        <nav className="p-3 space-y-0.5">
          {navigationItems.map((item) => {
            const active =
              activeSection === item.id ||
              (item.id === 'pages' && activeSection === 'page');
            return (
              <button
                key={item.id}
                onClick={() => onSectionSelect(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors min-w-0
                  ${active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                <span
                  className={`text-sm whitespace-nowrap transition-opacity duration-150 ease-out ${
                    isCollapsed ? 'opacity-0' : 'opacity-100'
                  }`}
                  aria-hidden={isCollapsed}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Scrollable page tree — hidden when collapsed */}
      {!isCollapsed && isPagesSection && (
        <div className="flex-1 min-h-0 border-t border-gray-100 px-3 pt-3 pb-4 overflow-y-auto overflow-x-hidden">
          <PageTree
            pages={pages}
            activePageId={activePageId}
            onSelectPage={onSelectPage}
            onCreatePage={onCreatePage}
            onDeletePage={onDeletePage}
            onUpdatePage={onUpdatePage}
          />
        </div>
      )}
    </aside>
  );
}

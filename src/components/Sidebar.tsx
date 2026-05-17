import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Settings,
  User,
  Users,
  Clock,
  Folder,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Target,
} from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  activeSection: string;
  onSectionSelect: (section: string) => void;
  onSelectPage: (pageId: string) => void;
  onCreatePage: () => void;
  pages: Page[];
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
  pages,
}: SidebarProps) {
  const [showRecentPages, setShowRecentPages] = useState(true);
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

  const getRecentPages = () =>
    pages
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen flex-shrink-0 bg-white/90 backdrop-blur-2xl border-r border-gray-200/30 flex flex-col shadow-xl overflow-hidden transition-[width] duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)]`}
    >
      {/* Workspace header — uses p-3 so the 40px avatar still fits at 64px sidebar width */}
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

      {/* Expand affordance when collapsed — small chevron directly under the avatar */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mt-2 w-9 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center flex-shrink-0"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Navigation */}
      <div className="flex-1 p-3 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-1 mb-6">
          {navigationItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionSelect(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl text-left font-semibold group hover:scale-[1.02] transition-[background-color,box-shadow,transform,color] duration-200 min-w-0
                  ${active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200/50 scale-[1.02]'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:text-gray-900 hover:shadow-lg'
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                  }`}
                />
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

        {/* Quick Actions — Pages section */}
        {!isCollapsed && activeSection === 'pages' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Quick Actions
              </h4>
            </div>
            <button
              onClick={() => onCreatePage()}
              className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-200/50 hover:scale-105 transition-all duration-300 font-semibold group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm">New Page</span>
            </button>
          </div>
        )}

        {/* Recent Pages */}
        {!isCollapsed && activeSection === 'pages' && pages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Recent Pages
              </h4>
              <button
                onClick={() => setShowRecentPages(!showRecentPages)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <Clock className="w-3 h-3" />
              </button>
            </div>

            {showRecentPages && (
              <div className="space-y-1">
                {getRecentPages().map((page) => (
                  <button
                    key={page.id}
                    onClick={() => onSelectPage(page.id)}
                    className="w-full flex items-center space-x-3 p-2 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:text-gray-900 rounded-lg transition-all duration-300 group hover:shadow-sm"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform duration-300">
                      {page.emoji || '📄'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-sm">{page.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}

                {pages.length > 5 && (
                  <button
                    onClick={() => onSectionSelect('pages')}
                    className="w-full flex items-center space-x-4 p-3 text-left text-sm text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:text-gray-800 rounded-xl transition-all duration-300 group hover:shadow-md font-medium"
                  >
                    <Folder className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                    <span>View all pages ({pages.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isCollapsed && activeSection === 'pages' && pages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base text-gray-600 mb-6 font-medium">No pages yet</p>
            <button
              onClick={() => onCreatePage()}
              className="text-sm text-blue-600 hover:text-blue-700 font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200"
            >
              Create your first page
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

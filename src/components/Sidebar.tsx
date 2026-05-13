import { useState } from 'react';
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
  Handshake,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  Target
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
  { id: 'prospects', icon: Users, label: 'Prospects' },
  { id: 'partners', icon: Handshake, label: 'Partners' },
  { id: 'subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { id: 'focus', icon: Clock, label: 'Focus Timer' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ 
  activeSection, 
  onSectionSelect, 
  onSelectPage,
  onCreatePage,
  pages
}: SidebarProps) {
  const [showRecentPages, setShowRecentPages] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getRecentPages = () => {
    return pages
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white/90 backdrop-blur-2xl border-r border-gray-200/30 flex flex-col shadow-xl transition-all duration-300`}>
      {/* User Profile */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-200/30`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
                          <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-100">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Workspace</h3>
                  <p className="text-xs text-gray-600 font-medium">Personal</p>
                </div>
              </div>
          )}
                      {isCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-blue-100 mx-auto">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className={`flex-1 ${isCollapsed ? 'p-3' : 'p-4'} overflow-y-auto`}>
        <nav className="space-y-1 mb-6">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionSelect(item.id)}
              className={`
                w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${isCollapsed ? 'p-3' : 'p-3'} rounded-xl transition-all duration-300 text-left font-semibold group hover:scale-[1.02]
                ${activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-200/50 scale-[1.02]' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/50 hover:text-gray-900 hover:shadow-lg'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 transition-all duration-300 ${activeSection === item.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Quick Actions - Only show for pages section */}
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

        {/* Recent Pages - Only show for pages section */}
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

        {/* Empty State - Only show for pages section */}
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
    </div>
  );
}
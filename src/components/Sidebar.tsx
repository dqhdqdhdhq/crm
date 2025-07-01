import React from 'react';
import { 
  FileText,
  Plus,
  Calendar,
  Settings,
  User,
  Users,
  Clock,
  Folder,
  CheckSquare
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
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'pages', icon: FileText, label: 'Pages' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'prospects', icon: Users, label: 'Prospects' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ 
  activeSection, 
  onSectionSelect, 
  onSelectPage,
  onCreatePage,
  pages
}: SidebarProps) {
  const [showRecentPages, setShowRecentPages] = React.useState(true);

  const getRecentPages = () => {
    return pages
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  return (
    <div className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col">
      {/* User Profile */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Workspace</h3>
            <p className="text-xs text-gray-500">Personal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1 mb-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionSelect(item.id)}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left text-sm font-medium
                ${activeSection === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h4>
          </div>
          
          <button
            onClick={() => onCreatePage()}
            className="w-full flex items-center space-x-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>

        {/* Recent Pages */}
        {pages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recent Pages
              </h4>
              <button
                onClick={() => setShowRecentPages(!showRecentPages)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    className="w-full flex items-center space-x-3 p-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 group"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">
                      {page.emoji || '📄'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{page.title}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
                
                {pages.length > 5 && (
                  <button
                    onClick={() => onSectionSelect('pages')}
                    className="w-full flex items-center space-x-3 p-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors"
                  >
                    <Folder className="w-4 h-4" />
                    <span>View all pages ({pages.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {pages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-4">No pages yet</p>
            <button
              onClick={() => onCreatePage()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
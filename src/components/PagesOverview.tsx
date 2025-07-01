import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Grid, 
  List as ListIcon,
  Calendar,
  Edit3,
  Trash2,
  Copy,
  Star,
  Clock,
  FileText,
  Settings,
  Filter,
  SortAsc,
  MoreHorizontal,
  Eye,
  Archive,
  Tag,
  Folder
} from 'lucide-react';
import { Page, PageTemplate, PageCategory } from '../types';

interface PagesOverviewProps {
  pages: Page[];
  categories: any[];
  templates: PageTemplate[];
  pageCategories: PageCategory[];
  onSelectPage: (pageId: string) => void;
  onCreatePage: (templateId?: string) => void;
  onUpdateTemplates: (templates: PageTemplate[]) => void;
  onUpdatePageCategories: (categories: PageCategory[]) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePage: (page: Page) => void;
}

export function PagesOverview({
  pages,
  categories,
  templates,
  pageCategories,
  onSelectPage,
  onCreatePage,
  onUpdateTemplates,
  onUpdatePageCategories,
  onDeletePage,
  onUpdatePage,
}: PagesOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      categories.some(cat => 
        cat.items.some((item: any) => item.id === page.id) && 
        cat.id === selectedCategory
      );
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const handleCreatePage = (templateId?: string) => {
    onCreatePage(templateId);
  };

  const handleSelectPage = (pageId: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      setSelectedPages(prev => 
        prev.includes(pageId) 
          ? prev.filter(id => id !== pageId)
          : [...prev, pageId]
      );
    } else {
      onSelectPage(pageId);
    }
  };

  const handleDeleteSelectedPages = () => {
    selectedPages.forEach(pageId => onDeletePage(pageId));
    setSelectedPages([]);
  };

  const getRecentPages = () => {
    return pages
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pages</h1>
              <p className="text-gray-600">Create, organize, and manage your documents</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Templates</span>
              </button>
              
              <button
                onClick={() => handleCreatePage()}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Page</span>
              </button>
            </div>
          </div>

          {/* Enhanced Search and Controls */}
          <div className="flex items-center justify-between space-x-6">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 placeholder-gray-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 font-medium"
                >
                  <option value="updated">Last Updated</option>
                  <option value="created">Date Created</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>

            <div className="flex items-center bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Quick Start Templates */}
        {searchQuery === '' && selectedCategory === 'all' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Quick Start</h2>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Manage Templates
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.slice(0, 4).map(template => (
                <button
                  key={template.id}
                  onClick={() => handleCreatePage(template.id)}
                  className="group p-6 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {template.emoji}
                  </div>
                  <div className="font-semibold text-gray-900 mb-2">{template.name}</div>
                  <div className="text-sm text-gray-600 leading-relaxed">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        {searchQuery === '' && selectedCategory === 'all' && pages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recently Updated</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getRecentPages().map(page => (
                <button
                  key={page.id}
                  onClick={() => onSelectPage(page.id)}
                  className="group p-6 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {page.emoji || '📄'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 mb-2 line-clamp-2">{page.title}</div>
                  <div className="text-sm text-gray-600">
                    {page.blocks.length} blocks
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Pages Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {searchQuery ? `Search Results (${filteredPages.length})` : 'All Pages'}
            </h2>
            {selectedPages.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedPages.length} selected</span>
                <button 
                  onClick={handleDeleteSelectedPages}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {filteredPages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No pages found' : 'No pages yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters' 
                  : 'Create your first page to get started with organizing your thoughts and ideas'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => handleCreatePage()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                  Create Your First Page
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-3'
            }>
              {filteredPages.map(page => (
                <PageCard
                  key={page.id}
                  page={page}
                  viewMode={viewMode}
                  isSelected={selectedPages.includes(page.id)}
                  onSelect={(isMultiSelect) => handleSelectPage(page.id, isMultiSelect)}
                  onDelete={() => onDeletePage(page.id)}
                  onUpdate={onUpdatePage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Management Modal */}
      {showTemplateModal && (
        <TemplateModal
          templates={templates}
          onUpdate={onUpdateTemplates}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}

interface PageCardProps {
  page: Page;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (isMultiSelect: boolean) => void;
  onDelete: () => void;
  onUpdate: (page: Page) => void;
}

function PageCard({ page, viewMode, isSelected, onSelect, onDelete, onUpdate }: PageCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditingEmoji, setIsEditingEmoji] = useState(false);
  const [editedEmoji, setEditedEmoji] = useState(page.emoji || '📄');

  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      onSelect(true);
    } else {
      onSelect(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this page?')) {
      onDelete();
    }
  };

  const handleEmojiClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the page selection
    setIsEditingEmoji(true);
  };

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedEmoji(e.target.value);
  };

  const handleEmojiSave = () => {
    if (editedEmoji !== page.emoji) {
      onUpdate({ ...page, emoji: editedEmoji });
    }
    setIsEditingEmoji(false);
  };

  const handleEmojiKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEmojiSave();
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`group relative p-4 bg-white/70 backdrop-blur-sm border rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'border-gray-200'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center space-x-4">
          {isEditingEmoji ? (
            <input
              type="text"
              value={editedEmoji}
              onChange={handleEmojiChange}
              onBlur={handleEmojiSave}
              onKeyDown={handleEmojiKeyDown}
              autoFocus
              className="text-2xl w-10 bg-transparent border-none focus:ring-0"
            />
          ) : (
            <span className="text-2xl cursor-pointer" onClick={handleEmojiClick}>
              {page.emoji || '📄'}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate mb-1">{page.title}</div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{page.blocks.length} blocks</span>
              <span>•</span>
              <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className={`flex items-center space-x-2 transition-opacity duration-200 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}>
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative p-6 bg-white/70 backdrop-blur-sm border rounded-2xl hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'border-gray-200'
      }`}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-4">
        {isEditingEmoji ? (
          <input
            type="text"
            value={editedEmoji}
            onChange={handleEmojiChange}
            onBlur={handleEmojiSave}
            onKeyDown={handleEmojiKeyDown}
            autoFocus
            className="text-3xl w-12 bg-transparent border-none focus:ring-0"
          />
        ) : (
          <div
            className="text-3xl group-hover:scale-110 transition-transform duration-200 cursor-pointer"
            onClick={handleEmojiClick}
          >
            {page.emoji || '📄'}
          </div>
        )}
        <div className={`flex items-center space-x-1 transition-opacity duration-200 ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}>
          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Star className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
          {page.title}
        </h3>
        <div className="text-sm text-gray-600 mb-3">
          {page.blocks.length} blocks
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(page.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}

interface TemplateModalProps {
  templates: PageTemplate[];
  onUpdate: (templates: PageTemplate[]) => void;
  onClose: () => void;
}

function TemplateModal({ templates, onUpdate, onClose }: TemplateModalProps) {
  const [editingTemplate, setEditingTemplate] = useState<PageTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveTemplate = (template: PageTemplate) => {
    if (isCreating) {
      onUpdate([...templates, { ...template, id: crypto.randomUUID() }]);
    } else {
      onUpdate(templates.map(t => t.id === template.id ? template : t));
    }
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    onUpdate(templates.filter(t => t.id !== templateId));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Manager</h2>
            <p className="text-gray-600 mt-1">Create and manage page templates</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="mb-8">
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingTemplate({
                  id: '',
                  name: '',
                  emoji: '📄',
                  description: '',
                  blocks: []
                });
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="group p-6 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{template.emoji}</div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-gray-900 mb-2">{template.name}</div>
                <div className="text-sm text-gray-600 mb-3 leading-relaxed">{template.description}</div>
                <div className="text-xs text-gray-500">{template.blocks.length} blocks</div>
              </div>
            ))}
          </div>

          {editingTemplate && (
            <TemplateEditor
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => {
                setEditingTemplate(null);
                setIsCreating(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

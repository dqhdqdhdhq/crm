import React, { useState, useEffect } from 'react';
import {
  Plus, Edit3, Trash2, X, Save, Clock, Tag, Calendar as CalendarIcon,
  Coffee, Briefcase, Users, Target, Heart, Dumbbell, UtensilsCrossed,
  Car, MoreHorizontal, Copy, Download, Upload, Search, Filter,
  ChevronDown, ChevronUp, Play, Pause, RotateCcw, Settings, FileText
} from 'lucide-react';
import { CalendarTemplate, TimeBlock, CalendarEvent } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CalendarTemplateManagerProps {
  onClose: () => void;
  onApplyTemplate: (template: CalendarTemplate, date: Date) => void;
  currentDate: Date;
  events: CalendarEvent[];
}

const timeBlockTypes = [
  { type: 'work' as const, icon: Briefcase, color: '#3B82F6', label: 'Work', gradient: 'from-blue-400 to-blue-600' },
  { type: 'break' as const, icon: Coffee, color: '#F59E0B', label: 'Break', gradient: 'from-amber-400 to-amber-600' },
  { type: 'meeting' as const, icon: Users, color: '#10B981', label: 'Meeting', gradient: 'from-emerald-400 to-emerald-600' },
  { type: 'focus' as const, icon: Target, color: '#06B6D4', label: 'Focus Time', gradient: 'from-cyan-400 to-cyan-600' },
  { type: 'personal' as const, icon: Heart, color: '#EF4444', label: 'Personal', gradient: 'from-red-400 to-red-600' },
  { type: 'exercise' as const, icon: Dumbbell, color: '#8B5CF6', label: 'Exercise', gradient: 'from-purple-400 to-purple-600' },
  { type: 'meal' as const, icon: UtensilsCrossed, color: '#F97316', label: 'Meal', gradient: 'from-orange-400 to-orange-600' },
  { type: 'commute' as const, icon: Car, color: '#6B7280', label: 'Commute', gradient: 'from-gray-400 to-gray-600' },
  { type: 'other' as const, icon: MoreHorizontal, color: '#EC4899', label: 'Other', gradient: 'from-pink-400 to-pink-600' }
];

const defaultTemplates: CalendarTemplate[] = [
  {
    id: 'coding-focused',
    name: 'Coding Focused Day',
    description: 'Deep work sessions with coding breaks',
    timeBlocks: [
      { id: '1', startTime: '09:00', endTime: '11:00', title: 'Deep Coding Session', type: 'focus', color: '#06B6D4' },
      { id: '2', startTime: '11:00', endTime: '11:15', title: 'Coffee Break', type: 'break', color: '#F59E0B' },
      { id: '3', startTime: '11:15', endTime: '13:00', title: 'Code Review & Planning', type: 'work', color: '#3B82F6' },
      { id: '4', startTime: '13:00', endTime: '14:00', title: 'Lunch', type: 'meal', color: '#F97316' },
      { id: '5', startTime: '14:00', endTime: '16:00', title: 'Feature Development', type: 'focus', color: '#06B6D4' },
      { id: '6', startTime: '16:00', endTime: '16:15', title: 'Quick Break', type: 'break', color: '#F59E0B' },
      { id: '7', startTime: '16:15', endTime: '18:00', title: 'Testing & Debugging', type: 'work', color: '#3B82F6' }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true,
    color: '#06B6D4'
  },
  {
    id: 'website-day',
    name: 'Website Day',
    description: 'Website development and design work',
    timeBlocks: [
      { id: '1', startTime: '09:00', endTime: '10:30', title: 'Design Review', type: 'work', color: '#3B82F6' },
      { id: '2', startTime: '10:30', endTime: '12:00', title: 'Frontend Development', type: 'focus', color: '#06B6D4' },
      { id: '3', startTime: '12:00', endTime: '13:00', title: 'Lunch & Research', type: 'meal', color: '#F97316' },
      { id: '4', startTime: '13:00', endTime: '14:30', title: 'Content Creation', type: 'work', color: '#3B82F6' },
      { id: '5', startTime: '14:30', endTime: '14:45', title: 'Break', type: 'break', color: '#F59E0B' },
      { id: '6', startTime: '14:45', endTime: '16:30', title: 'UI/UX Implementation', type: 'focus', color: '#06B6D4' },
      { id: '7', startTime: '16:30', endTime: '17:30', title: 'Testing & Optimization', type: 'work', color: '#3B82F6' }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true,
    color: '#3B82F6'
  },
  {
    id: 'business-day',
    name: 'Business Day',
    description: 'Meetings, calls, and business operations',
    timeBlocks: [
      { id: '1', startTime: '09:00', endTime: '10:00', title: 'Team Standup', type: 'meeting', color: '#10B981' },
      { id: '2', startTime: '10:00', endTime: '11:30', title: 'Client Calls', type: 'meeting', color: '#10B981' },
      { id: '3', startTime: '11:30', endTime: '11:45', title: 'Break', type: 'break', color: '#F59E0B' },
      { id: '4', startTime: '11:45', endTime: '13:00', title: 'Strategy Planning', type: 'work', color: '#3B82F6' },
      { id: '5', startTime: '13:00', endTime: '14:00', title: 'Business Lunch', type: 'meal', color: '#F97316' },
      { id: '6', startTime: '14:00', endTime: '15:30', title: 'Partner Meeting', type: 'meeting', color: '#10B981' },
      { id: '7', startTime: '15:30', endTime: '17:00', title: 'Admin & Follow-ups', type: 'work', color: '#3B82F6' }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true,
    color: '#10B981'
  }
];

export function CalendarTemplateManager({ onClose, onApplyTemplate, currentDate, events }: CalendarTemplateManagerProps) {
  const [templates, setTemplates] = useLocalStorage<CalendarTemplate[]>('calendar-templates', defaultTemplates);
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'edit'>('browse');
  const [selectedTemplate, setSelectedTemplate] = useState<CalendarTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<CalendarTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDate, setPreviewDate] = useState(currentDate);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || template.tags?.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  const handleCreateTemplate = () => {
    const newTemplate: CalendarTemplate = {
      id: crypto.randomUUID(),
      name: 'New Template',
      description: 'Template description',
      timeBlocks: [
        {
          id: crypto.randomUUID(),
          startTime: '09:00',
          endTime: '10:00',
          title: 'New Time Block',
          type: 'work',
          color: '#3B82F6'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      color: '#3B82F6'
    };
    setEditingTemplate(newTemplate);
    setActiveTab('create');
  };

  const handleEditTemplate = (template: CalendarTemplate) => {
    setEditingTemplate({ ...template });
    setActiveTab('edit');
  };

  const handleSaveTemplate = (template: CalendarTemplate) => {
    const updatedTemplate = { ...template, updatedAt: new Date() };
    
    if (activeTab === 'create') {
      setTemplates([...templates, updatedTemplate]);
    } else {
      setTemplates(templates.map(t => t.id === template.id ? updatedTemplate : t));
    }
    
    setActiveTab('browse');
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleApplyTemplate = (template: CalendarTemplate, date: Date) => {
    onApplyTemplate(template, date);
    onClose();
  };

  const handleDuplicateTemplate = (template: CalendarTemplate) => {
    const duplicatedTemplate: CalendarTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates([...templates, duplicatedTemplate]);
  };

  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'calendar-templates.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTemplates = JSON.parse(e.target?.result as string);
          setTemplates([...templates, ...importedTemplates]);
        } catch (error) {
          alert('Error importing templates. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getTypeInfo = (type: TimeBlock['type']) => {
    return timeBlockTypes.find(t => t.type === type) || timeBlockTypes[0];
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-white/40 to-white/20">
          <h2 className="text-2xl font-bold text-gray-900">Calendar Templates</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportTemplates}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-colors"
              title="Export Templates"
            >
              <Download className="w-5 h-5" />
            </button>
            <label className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-colors cursor-pointer" title="Import Templates">
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept=".json"
                onChange={importTemplates}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 bg-white/20">
          {[
            { id: 'browse', label: 'Browse Templates', icon: Search },
            { id: 'create', label: 'Create Template', icon: Plus },
            { id: 'edit', label: 'Edit Template', icon: Edit3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              disabled={id === 'edit' && !editingTemplate}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white/50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'browse' && (
            <div className="p-6">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                >
                  <option value="all">All Types</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="meeting">Meeting</option>
                </select>
                <button
                  onClick={handleCreateTemplate}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Template
                </button>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/60 transition-all duration-200 border border-white/20 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: template.color }}
                        />
                        <div>
                          <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                            {template.name}
                          </h3>
                          {template.description && (
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!template.isDefault && (
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Time Blocks Preview */}
                    <div className="space-y-2 mb-4">
                      {template.timeBlocks.slice(0, 3).map((block) => {
                        const typeInfo = getTypeInfo(block.type);
                        return (
                          <div
                            key={block.id}
                            className={`p-2 rounded-lg text-white text-xs bg-gradient-to-r ${typeInfo.gradient} shadow-sm`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{block.title}</span>
                              <span className="text-white/80">{block.startTime} - {block.endTime}</span>
                            </div>
                          </div>
                        );
                      })}
                      {template.timeBlocks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{template.timeBlocks.length - 3} more blocks
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApplyTemplate(template, currentDate)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm"
                      >
                        <Play className="w-3 h-3 inline mr-1" />
                        Apply Today
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowPreview(true);
                        }}
                        className="px-3 py-2 bg-white/70 text-gray-700 rounded-xl hover:bg-white transition-all duration-200 font-medium text-sm"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No templates found</p>
                  <button
                    onClick={handleCreateTemplate}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                  >
                    Create Your First Template
                  </button>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'create' || activeTab === 'edit') && editingTemplate && (
            <TemplateEditor
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => {
                setActiveTab('browse');
                setEditingTemplate(null);
              }}
              timeSlots={timeSlots}
              timeBlockTypes={timeBlockTypes}
              getTypeInfo={getTypeInfo}
            />
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Template Preview: {selectedTemplate.name}</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <TemplatePreview
                template={selectedTemplate}
                date={previewDate}
                onApply={(date) => handleApplyTemplate(selectedTemplate, date)}
                getTypeInfo={getTypeInfo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateEditorProps {
  template: CalendarTemplate;
  onSave: (template: CalendarTemplate) => void;
  onCancel: () => void;
  timeSlots: string[];
  timeBlockTypes: any[];
  getTypeInfo: (type: TimeBlock['type']) => any;
}

function TemplateEditor({ template, onSave, onCancel, timeSlots, timeBlockTypes, getTypeInfo }: TemplateEditorProps) {
  const [formData, setFormData] = useState(template);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleAddBlock = () => {
    const newBlock: TimeBlock = {
      id: crypto.randomUUID(),
      startTime: '09:00',
      endTime: '10:00',
      title: 'New Time Block',
      type: 'work',
      color: '#3B82F6'
    };
    
    setFormData({
      ...formData,
      timeBlocks: [...formData.timeBlocks, newBlock]
    });
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<TimeBlock>) => {
    setFormData({
      ...formData,
      timeBlocks: formData.timeBlocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setFormData({
      ...formData,
      timeBlocks: formData.timeBlocks.filter(block => block.id !== blockId)
    });
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleSave = () => {
    if (formData.name.trim() && formData.timeBlocks.length > 0) {
      onSave(formData);
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Template Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 resize-none"
              rows={3}
              placeholder="Template description"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Template Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color || '#3B82F6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 rounded-xl border-2 border-white/30 cursor-pointer"
              />
              <span className="text-sm text-gray-600">Choose a color for this template</span>
            </div>
          </div>

          {/* Time Blocks List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700">Time Blocks ({formData.timeBlocks.length})</label>
              <button
                onClick={handleAddBlock}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Block
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {formData.timeBlocks.map((block) => {
                const typeInfo = getTypeInfo(block.type);
                return (
                  <div
                    key={block.id}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedBlockId === block.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-white/30 bg-white/40 hover:bg-white/60'
                    }`}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <typeInfo.icon className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-800">{block.title}</div>
                          <div className="text-sm text-gray-600">{block.startTime} - {block.endTime}</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - Block Editor */}
        <div className="space-y-6">
          {selectedBlockId ? (
            <BlockEditor
              block={formData.timeBlocks.find(b => b.id === selectedBlockId)!}
              onUpdate={(updates) => handleUpdateBlock(selectedBlockId, updates)}
              timeSlots={timeSlots}
              timeBlockTypes={timeBlockTypes}
            />
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a time block to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/20 mt-8">
        <div className="text-sm text-gray-600">
          {formData.timeBlocks.length} time blocks • Total duration: {
            formData.timeBlocks.reduce((total, block) => {
              const start = new Date(`2000-01-01T${block.startTime}`);
              const end = new Date(`2000-01-01T${block.endTime}`);
              return total + (end.getTime() - start.getTime()) / (1000 * 60);
            }, 0)
          } minutes
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim() || formData.timeBlocks.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

interface BlockEditorProps {
  block: TimeBlock;
  onUpdate: (updates: Partial<TimeBlock>) => void;
  timeSlots: string[];
  timeBlockTypes: any[];
}

function BlockEditor({ block, onUpdate, timeSlots, timeBlockTypes }: BlockEditorProps) {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Edit Time Block</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
            placeholder="Block title"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
          <textarea
            value={block.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 resize-none"
            rows={2}
            placeholder="Block description (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
            <select
              value={block.startTime}
              onChange={(e) => onUpdate({ startTime: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
            <select
              value={block.endTime}
              onChange={(e) => onUpdate({ endTime: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Block Type</label>
          <div className="grid grid-cols-3 gap-2">
            {timeBlockTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => onUpdate({ type: type.type, color: type.color })}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  block.type === type.type
                    ? `border-purple-500 bg-gradient-to-r ${type.gradient} text-white shadow-lg`
                    : 'border-white/30 bg-white/40 hover:border-white/50 text-gray-700'
                }`}
              >
                <type.icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-bold">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
          <select
            value={block.priority || 'medium'}
            onChange={(e) => onUpdate({ priority: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}

interface TemplatePreviewProps {
  template: CalendarTemplate;
  date: Date;
  onApply: (date: Date) => void;
  getTypeInfo: (type: TimeBlock['type']) => any;
}

function TemplatePreview({ template, date, onApply, getTypeInfo }: TemplatePreviewProps) {
  const [previewDate, setPreviewDate] = useState(date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
          {template.description && (
            <p className="text-gray-600 mt-1">{template.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={previewDate.toISOString().split('T')[0]}
            onChange={(e) => setPreviewDate(new Date(e.target.value))}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
          />
          <button
            onClick={() => onApply(previewDate)}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
          >
            Apply to {previewDate.toLocaleDateString()}
          </button>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="space-y-3">
          {template.timeBlocks.map((block) => {
            const typeInfo = getTypeInfo(block.type);
            const duration = (() => {
              const start = new Date(`2000-01-01T${block.startTime}`);
              const end = new Date(`2000-01-01T${block.endTime}`);
              return (end.getTime() - start.getTime()) / (1000 * 60);
            })();

            return (
              <div
                key={block.id}
                className={`p-4 rounded-xl bg-gradient-to-r ${typeInfo.gradient} text-white shadow-lg`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <typeInfo.icon className="w-5 h-5" />
                    <span className="font-bold text-lg">{block.title}</span>
                  </div>
                  <span className="text-white/90 font-medium">
                    {block.startTime} - {block.endTime}
                  </span>
                </div>
                
                {block.description && (
                  <p className="text-white/90 text-sm mb-2">{block.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">
                    {duration} minutes • {typeInfo.label}
                  </span>
                  {block.priority && block.priority !== 'medium' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      block.priority === 'high' ? 'bg-red-400 text-red-900' : 'bg-yellow-400 text-yellow-900'
                    }`}>
                      {block.priority.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Command, History, Undo, FileText, X, ChevronRight,
  Edit, Save, Network
} from 'lucide-react';
import { FieldHistory, SearchResult, Command as CommandType, CalendarEvent, MarkdownContent } from '../types';

// Field History Component
export function FieldHistoryModal({ 
  isOpen, 
  onClose, 
  fieldHistory, 
  onRollback 
}: {
  isOpen: boolean;
  onClose: () => void;
  fieldHistory: FieldHistory;
  onRollback: (changeId: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Field History: {fieldHistory.fieldPath}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {fieldHistory.changes.map((change) => (
              <div key={change.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <History className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {change.userName || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {change.timestamp.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">From:</span>
                      <code className="bg-red-50 px-2 py-1 rounded text-red-800">
                        {JSON.stringify(change.oldValue)}
                      </code>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-green-600">To:</span>
                      <code className="bg-green-50 px-2 py-1 rounded text-green-800">
                        {JSON.stringify(change.newValue)}
                      </code>
                    </div>
                  </div>
                  
                  {change.reason && (
                    <p className="mt-2 text-sm text-gray-500 italic">
                      Reason: {change.reason}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => onRollback(change.id)}
                  className="flex-shrink-0 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Undo className="w-4 h-4 mr-1" />
                  Rollback
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Global Search Component
export function GlobalSearchModal({ 
  isOpen, 
  searchResults, 
  onSearch, 
  onResultClick 
}: {
  isOpen: boolean;
  onClose: () => void;
  searchResults: SearchResult[];
  onSearch: (query: string) => void;
  onResultClick: (result: SearchResult) => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search across all partners, notes, and documents..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => onResultClick(result)}
                  className="w-full p-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {result.entityName}
                        </span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {result.fieldPath}
                        </span>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {result.context}
                      </p>
                      
                      <div className="mt-1 flex items-center space-x-2">
                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Score: {result.relevanceScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Command Palette Component
export function CommandPalette({ 
  isOpen, 
  commands, 
  onExecute 
}: {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandType[];
  onExecute: (commandId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onExecute(filteredCommands[selectedIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onExecute]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Command className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[50vh]">
          {filteredCommands.length > 0 ? (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => onExecute(command.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Command className="w-4 h-4 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {command.name}
                        </span>
                        {command.shortcut && (
                          <div className="flex items-center space-x-1">
                            {command.shortcut.map((key, i) => (
                              <span key={i} className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {key}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {command.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Command className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No commands found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Relationship Network Viewer
export function RelationshipNetworkModal({ 
  isOpen, 
  onClose, 
  networkData 
}: {
  isOpen: boolean;
  onClose: () => void;
  networkData: { nodes: any[]; edges: any[] };
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Relationship Network</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Network className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Network Visualization</h3>
            <p className="text-gray-600 mb-4">
              Interactive network graph showing relationships between partners, prospects, and projects.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Nodes</h4>
                <p className="text-2xl font-bold text-blue-600">{networkData.nodes.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Connections</h4>
                <p className="text-2xl font-bold text-green-600">{networkData.edges.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Embedded Calendar Component
export function EmbeddedCalendar({ 
  events, 
  onEventClick, 
  onDateClick 
}: {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayEvents = date ? getEventsForDate(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              onClick={() => date && onDateClick(date)}
              className={`min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors ${
                date ? 'hover:bg-gray-50' : ''
              } ${isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate hover:bg-blue-200"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Markdown Editor Component
export function MarkdownEditor({ 
  content, 
  onChange, 
  onSave 
}: {
  content: MarkdownContent;
  onChange: (content: MarkdownContent) => void;
  onSave: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [markdown, setMarkdown] = useState(content.content);

  const handleSave = () => {
    onChange({
      ...content,
      content: markdown,
      lastEditedAt: new Date(),
      version: content.version + 1
    });
    setIsEditing(false);
    onSave();
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Notes</span>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 flex items-center"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Write your notes in Markdown..."
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            {content.content ? (
              <div dangerouslySetInnerHTML={{ __html: content.renderedHtml || content.content }} />
            ) : (
              <p className="text-gray-500 italic">No notes yet. Click Edit to add some.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Find and Replace Modal
export function FindReplaceModal({ 
  isOpen, 
  onClose, 
  onFindReplace 
}: {
  isOpen: boolean;
  onClose: () => void;
  onFindReplace: (searchPattern: string, replacePattern: string, options: any) => void;
}) {
  const [searchPattern, setSearchPattern] = useState('');
  const [replacePattern, setReplacePattern] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindReplace(searchPattern, replacePattern, { isRegex, isCaseSensitive });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Find & Replace</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Find
            </label>
            <input
              type="text"
              value={searchPattern}
              onChange={(e) => setSearchPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search pattern..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replace with
            </label>
            <input
              type="text"
              value={replacePattern}
              onChange={(e) => setReplacePattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Replacement text..."
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Regular Expression</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isCaseSensitive}
                onChange={(e) => setIsCaseSensitive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Case Sensitive</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!searchPattern}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Find & Replace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
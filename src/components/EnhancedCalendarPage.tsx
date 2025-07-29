import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Search, Bell,
  Phone, Coffee, Briefcase, Heart, Star, Edit3, Trash2, X, Copy,
  Filter, Calendar as CalendarIcon, Grid3X3, List, Columns,
  ChevronUp, ChevronDown, Eye, Settings, Download, Upload,
  Zap, Target, TrendingUp, Activity, BarChart3, PieChart,
  Moon, Sun, CloudRain, Sunrise, Sunset, AlertCircle,
  Timer, Play, Pause, Square, RotateCcw, Hash, FileText, Layers
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CalendarTemplateManager } from './CalendarTemplateManager';
import { CalendarTemplate, TemplateApplication } from '../types';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: string;
  type: 'meeting' | 'call' | 'break' | 'work' | 'personal' | 'important' | 'focus' | 'deadline' | 'birthday';
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  reminder?: number;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  attachments?: string[];
  notes?: string;
}

interface CalendarSettings {
  workingHours: { start: number; end: number };
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  timeFormat: '12h' | '24h';
  defaultView: 'month' | 'week' | 'day' | 'agenda';
  showWeekends: boolean;
  theme: 'light' | 'dark' | 'auto';
}

const eventTypes = [
  { type: 'meeting' as const, icon: Users, color: '#3B82F6', label: 'Meeting', gradient: 'from-blue-400 to-blue-600' },
  { type: 'call' as const, icon: Phone, color: '#10B981', label: 'Call', gradient: 'from-emerald-400 to-emerald-600' },
  { type: 'break' as const, icon: Coffee, color: '#F59E0B', label: 'Break', gradient: 'from-amber-400 to-amber-600' },
  { type: 'work' as const, icon: Briefcase, color: '#8B5CF6', label: 'Work', gradient: 'from-purple-400 to-purple-600' },
  { type: 'personal' as const, icon: Heart, color: '#EF4444', label: 'Personal', gradient: 'from-red-400 to-red-600' },
  { type: 'important' as const, icon: Star, color: '#F97316', label: 'Important', gradient: 'from-orange-400 to-orange-600' },
  { type: 'focus' as const, icon: Target, color: '#06B6D4', label: 'Focus Time', gradient: 'from-cyan-400 to-cyan-600' },
  { type: 'deadline' as const, icon: AlertCircle, color: '#DC2626', label: 'Deadline', gradient: 'from-red-500 to-red-700' },
  { type: 'birthday' as const, icon: Hash, color: '#EC4899', label: 'Birthday', gradient: 'from-pink-400 to-pink-600' }
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 border-gray-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300'
};

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  tentative: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700'
};

export function EnhancedCalendarPage() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('enhanced-calendar-events', []);
  const [settings, setSettings] = useLocalStorage<CalendarSettings>('calendar-settings', {
    workingHours: { start: 9, end: 17 },
    weekStartsOn: 1,
    timeFormat: '12h',
    defaultView: 'month',
    showWeekends: true,
    theme: 'light'
  });
  const [templateApplications, setTemplateApplications] = useLocalStorage<TemplateApplication[]>('template-applications', []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>(settings.defaultView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForModal, setSelectedEventForModal] = useState<CalendarEvent | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showMiniCalendar, setShowMiniCalendar] = useState(true);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  
  // Check for any pending meeting data from partners page
  useEffect(() => {
    const pendingMeeting = localStorage.getItem('pending-meeting-creation');
    if (pendingMeeting) {
      try {
        const meetingData = JSON.parse(pendingMeeting);
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1);

        setEditingEvent({
          id: '',
          title: meetingData.subject || `Meeting with ${meetingData.partnerName}`,
          description: meetingData.description || '',
          startTime,
          endTime,
          color: '#3B82F6',
          type: 'meeting',
          attendees: meetingData.contactEmail ? [meetingData.contactEmail] : [],
          location: 'TBD'
        });
        setShowEventModal(true);
        localStorage.removeItem('pending-meeting-creation');
      } catch (error) {
        console.error('Error processing pending meeting:', error);
      }
    }
  }, []);

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, month: Date) => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((firstDay.getDay() - settings.weekStartsOn + 7) % 7));
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const filtered = events.filter(event => {
      const eventDate = new Date(event.startTime);
      const matchesDate = eventDate.toDateString() === date.toDateString();
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = !filterType || event.type === filterType;
      
      return matchesDate && matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return filtered;
  };

  const getUpcomingEvents = (count: number = 5) => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, count);
  };

  const getEventStats = () => {
    const thisWeek = getWeekDays();
    const thisWeekEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return thisWeek.some(day => day.toDateString() === eventDate.toDateString());
    });

    const thisMonth = getMonthDays().filter(day => isSameMonth(day, currentDate));
    const thisMonthEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return thisMonth.some(day => day.toDateString() === eventDate.toDateString());
    });

    const todayEvents = getEventsForDate(today);
    const upcomingEvents = getUpcomingEvents();

    return {
      today: todayEvents.length,
      thisWeek: thisWeekEvents.length,
      thisMonth: thisMonthEvents.length,
      upcoming: upcomingEvents.length,
      totalEvents: events.length
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleCreateEvent = (date?: Date) => {
    const startTime = date || selectedDate || new Date();
    const hour = settings.workingHours.start;
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    setEditingEvent({
      id: '',
      title: '',
      description: '',
      startTime,
      endTime,
      color: '#3B82F6',
      type: 'meeting',
      status: 'confirmed',
      priority: 'medium'
    });
    setShowEventModal(true);
  };

  const handleQuickAdd = (input: string) => {
    if (!input.trim()) return;
    
    // Simple parser for quick add (e.g., "Meeting with John tomorrow at 2pm")
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 1); // Tomorrow as default
    startTime.setHours(14, 0, 0, 0); // 2 PM as default
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: input,
      startTime,
      endTime,
      color: '#3B82F6',
      type: 'meeting',
      status: 'confirmed',
      priority: 'medium'
    };

    setEvents([...events, newEvent]);
    setQuickAddInput('');
    setIsQuickAdding(false);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    if (event.id) {
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      setEvents([...events, { ...event, id: crypto.randomUUID() }]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    setShowEventModal(false);
    setEditingEvent(null);
    setSelectedEventForModal(null);
  };

  const handleApplyTemplate = (template: CalendarTemplate, date: Date) => {
    const appliedEvents: string[] = [];
    const newEvents: CalendarEvent[] = [];

    template.timeBlocks.forEach((block) => {
      const startTime = new Date(date);
      const [startHour, startMinute] = block.startTime.split(':').map(Number);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(date);
      const [endHour, endMinute] = block.endTime.split(':').map(Number);
      endTime.setHours(endHour, endMinute, 0, 0);

      const eventId = crypto.randomUUID();
      const newEvent: CalendarEvent = {
        id: eventId,
        title: block.title,
        description: block.description,
        startTime,
        endTime,
        color: block.color || getEventTypeColor(block.type),
        type: mapBlockTypeToEventType(block.type),
        status: 'confirmed',
        priority: block.priority || 'medium',
        tags: block.tags
      };

      newEvents.push(newEvent);
      appliedEvents.push(eventId);
    });

    setEvents(prevEvents => [...prevEvents, ...newEvents]);

    const templateApplication: TemplateApplication = {
      templateId: template.id,
      date,
      appliedEvents,
      appliedAt: new Date()
    };

    setTemplateApplications(prev => [...prev, templateApplication]);
  };

  const mapBlockTypeToEventType = (blockType: string): CalendarEvent['type'] => {
    const mapping: { [key: string]: CalendarEvent['type'] } = {
      'work': 'work',
      'meeting': 'meeting',
      'break': 'break',
      'focus': 'focus',
      'personal': 'personal',
      'exercise': 'personal',
      'meal': 'break',
      'commute': 'personal',
      'other': 'work'
    };
    return mapping[blockType] || 'work';
  };

  const getEventTypeColor = (blockType: string): string => {
    const colors: { [key: string]: string } = {
      'work': '#3B82F6',
      'meeting': '#10B981',
      'break': '#F59E0B',
      'focus': '#06B6D4',
      'personal': '#EF4444',
      'exercise': '#8B5CF6',
      'meal': '#F97316',
      'commute': '#6B7280',
      'other': '#EC4899'
    };
    return colors[blockType] || '#3B82F6';
  };

  const getAppliedTemplateForDate = (date: Date) => {
    const dateString = date.toDateString();
    return templateApplications.find(app => 
      new Date(app.date).toDateString() === dateString
    );
  };

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const timeDiff = date.getTime() - new Date(draggedEvent.startTime).setHours(0, 0, 0, 0);
    const newStartTime = new Date(draggedEvent.startTime.getTime() + timeDiff);
    const newEndTime = new Date(draggedEvent.endTime.getTime() + timeDiff);

    const updatedEvent = {
      ...draggedEvent,
      startTime: newStartTime,
      endTime: newEndTime
    };

    setEvents(events.map(e => e.id === draggedEvent.id ? updatedEvent : e));
    setDraggedEvent(null);
  };

  const formatTime = (date: Date) => {
    if (settings.timeFormat === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateRange = (start: Date, end: Date) => {
    const sameDay = start.toDateString() === end.toDateString();
    if (sameDay) {
      return `${start.toLocaleDateString()} ${formatTime(start)} - ${formatTime(end)}`;
    }
    return `${start.toLocaleDateString()} ${formatTime(start)} - ${end.toLocaleDateString()} ${formatTime(end)}`;
  };

  const getEventTypeInfo = (type: CalendarEvent['type']) => {
    return eventTypes.find(t => t.type === type) || eventTypes[0];
  };

  const monthDays = getMonthDays();
  const weekDays = getWeekDays();
  const upcomingEvents = getUpcomingEvents();
  const stats = getEventStats();

  const renderMonthView = () => (
    <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-white/40 to-white/20 border-b border-white/20">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={day} className={`p-4 text-center ${!settings.showWeekends && (index === 0 || index === 6) ? 'hidden' : ''}`}>
            <span className="text-sm font-bold text-gray-700">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7">
        {monthDays.map((day, index) => {
          if (!settings.showWeekends && (day.getDay() === 0 || day.getDay() === 6)) {
            return null;
          }

          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const appliedTemplate = getAppliedTemplateForDate(day);

          return (
            <div
              key={index}
              className={`min-h-[140px] p-3 border-r border-b border-white/10 transition-all duration-300 hover:bg-white/20 cursor-pointer group ${
                !isCurrentMonth ? 'bg-gray-50/20 text-gray-400' : ''
              } ${isWeekend ? 'bg-blue-50/20' : ''}`}
              onClick={() => {
                setSelectedDate(day);
                handleCreateEvent(day);
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(day, e)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-bold transition-all duration-200 ${
                      isTodayDate
                        ? 'w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg'
                        : isCurrentMonth
                        ? 'text-gray-800 group-hover:text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {appliedTemplate && (
                    <Layers className="w-3 h-3 text-indigo-600" title="Template Applied" />
                  )}
                </div>
                {dayEvents.length > 3 && (
                  <span className="text-xs text-gray-600 bg-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const typeInfo = getEventTypeInfo(event.type);
                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(event, e)}
                      className={`text-xs p-2 rounded-lg text-white font-medium truncate cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-r ${typeInfo.gradient} shadow-sm hover:shadow-md`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEventForModal(event);
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <typeInfo.icon className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.title}</span>
                        {event.priority === 'urgent' && <span className="text-yellow-300">!</span>}
                      </div>
                      <div className="text-white/80 text-[10px] mt-0.5">
                        {formatTime(new Date(event.startTime))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 bg-gradient-to-r from-white/40 to-white/20 border-b border-white/20">
        <div className="p-4"></div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="p-4 text-center">
            <div className="text-sm font-bold text-gray-700">{day.toLocaleDateString('en', { weekday: 'short' })}</div>
            <div className={`text-lg font-bold mt-1 ${isToday(day) ? 'text-blue-600' : 'text-gray-800'}`}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <div className="max-h-96 overflow-y-auto">
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-white/10">
            <div className="p-3 text-right text-sm text-gray-600 bg-white/10">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map((day) => {
              const dayEvents = getEventsForDate(day).filter(event => 
                new Date(event.startTime).getHours() === hour
              );
              
              return (
                <div
                  key={day.toISOString()}
                  className="p-2 min-h-[60px] hover:bg-white/20 transition-colors cursor-pointer"
                  onClick={() => {
                    const eventTime = new Date(day);
                    eventTime.setHours(hour, 0, 0, 0);
                    handleCreateEvent(eventTime);
                  }}
                >
                  {dayEvents.map((event) => {
                    const typeInfo = getEventTypeInfo(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`p-2 rounded-lg text-white text-xs font-medium mb-1 bg-gradient-to-r ${typeInfo.gradient} shadow-sm cursor-pointer hover:shadow-md transition-all duration-200`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForModal(event);
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <typeInfo.icon className="w-3 h-3" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        {/* Day Header */}
        <div className="p-6 bg-gradient-to-r from-white/40 to-white/20 border-b border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              {getAppliedTemplateForDate(currentDate) && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 rounded-full">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">Template Applied</span>
                </div>
              )}
            </div>
            <p className="text-gray-600">{dayEvents.length} events scheduled</p>
          </div>
        </div>

        {/* Time Slots */}
        <div className="max-h-96 overflow-y-auto">
          {Array.from({ length: 24 }, (_, hour) => {
            const hourEvents = dayEvents.filter(event => 
              new Date(event.startTime).getHours() === hour
            );
            
            return (
              <div key={hour} className="flex border-b border-white/10">
                <div className="w-20 p-4 text-right text-sm text-gray-600 bg-white/10">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div
                  className="flex-1 p-4 min-h-[80px] hover:bg-white/20 transition-colors cursor-pointer"
                  onClick={() => {
                    const eventTime = new Date(currentDate);
                    eventTime.setHours(hour, 0, 0, 0);
                    handleCreateEvent(eventTime);
                  }}
                >
                  {hourEvents.map((event) => {
                    const typeInfo = getEventTypeInfo(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`p-3 rounded-xl text-white font-medium mb-2 bg-gradient-to-r ${typeInfo.gradient} shadow-md cursor-pointer hover:shadow-lg transition-all duration-200`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForModal(event);
                        }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <typeInfo.icon className="w-4 h-4" />
                          <span className="font-semibold">{event.title}</span>
                          {event.priority === 'urgent' && (
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                              URGENT
                            </span>
                          )}
                        </div>
                        <div className="text-white/90 text-sm">
                          {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                        </div>
                        {event.location && (
                          <div className="text-white/80 text-xs mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            7-Day Agenda - {currentDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })} to {next7Days[6].toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </h2>
          <div className="space-y-6">
            {next7Days.map((date) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div key={date.toISOString()} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">
                      {date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                    <span className="text-sm text-gray-600">{dayEvents.length} events</span>
                  </div>
                  {dayEvents.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No events</p>
                  ) : (
                    <div className="space-y-2">
                      {dayEvents.map((event) => {
                        const typeInfo = getEventTypeInfo(event.type);
                        return (
                          <div
                            key={event.id}
                            className="flex items-center space-x-3 p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-colors cursor-pointer"
                            onClick={() => setSelectedEventForModal(event)}
                          >
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: event.color }} />
                            <typeInfo.icon className="w-4 h-4 text-gray-600" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{event.title}</div>
                              <div className="text-sm text-gray-600">
                                {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                                {event.location && ` • ${event.location}`}
                              </div>
                            </div>
                            {event.priority === 'urgent' && (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                                Urgent
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-8xl mx-auto p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Enhanced Calendar
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{stats.today} today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{stats.thisWeek} this week</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{stats.totalEvents} total events</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Quick Add */}
              {isQuickAdding ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={quickAddInput}
                    onChange={(e) => setQuickAddInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(quickAddInput);
                      if (e.key === 'Escape') setIsQuickAdding(false);
                    }}
                    onBlur={() => setIsQuickAdding(false)}
                    placeholder="Quick add event..."
                    className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsQuickAdding(true)}
                  className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/90 transition-all duration-200 text-gray-700 font-medium"
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Quick Add
                </button>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 min-w-[200px]"
                />
              </div>
              
              {/* Filter */}
              <div className="relative">
                <select
                  value={filterType || ''}
                  onChange={(e) => setFilterType(e.target.value || null)}
                  className="px-4 py-2.5 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  {eventTypes.map((type) => (
                    <option key={type.type} value={type.type}>{type.label}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowTemplateManager(true)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium shadow-lg"
              >
                <FileText className="w-4 h-4" />
                <span>Templates</span>
              </button>
              
              <button
                onClick={() => handleCreateEvent()}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>New Event</span>
              </button>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white/70 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 min-w-[280px] text-center">
                  {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  {viewMode === 'agenda' && `7-Day Agenda from ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </h2>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white/70 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-6 py-3 text-sm font-bold text-gray-700 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode Selector */}
              <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-1 shadow-lg">
                {[
                  { mode: 'month', icon: Grid3X3, label: 'Month' },
                  { mode: 'week', icon: Columns, label: 'Week' },
                  { mode: 'day', icon: CalendarIcon, label: 'Day' },
                  { mode: 'agenda', icon: List, label: 'Agenda' }
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      viewMode === mode
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSettings(true)}
                className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white/70 rounded-xl transition-all duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Calendar View */}
          <div className="xl:col-span-3">
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
            {viewMode === 'agenda' && renderAgendaView()}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white/40 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{stats.today}</div>
                  <div className="text-xs text-gray-600">Today</div>
                </div>
                <div className="text-center p-3 bg-white/40 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
                  <div className="text-xs text-gray-600">This Week</div>
                </div>
                <div className="text-center p-3 bg-white/40 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </div>
                <div className="text-center p-3 bg-white/40 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
                  <div className="text-xs text-gray-600">Upcoming</div>
                </div>
              </div>
            </div>

            {/* Today's Events */}
            <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Today's Events
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {getEventsForDate(today).length === 0 ? (
                  <div className="text-center py-6">
                    <Sun className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No events today</p>
                    <button
                      onClick={() => handleCreateEvent(today)}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Add one?
                    </button>
                  </div>
                ) : (
                  getEventsForDate(today).map((event) => {
                    const typeInfo = getEventTypeInfo(event.type);
                    return (
                      <div
                        key={event.id}
                        className="p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200 cursor-pointer group"
                        onClick={() => setSelectedEventForModal(event)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 bg-gradient-to-r ${typeInfo.gradient}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}</span>
                            </div>
                            {event.location && (
                              <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {event.priority === 'urgent' && (
                              <div className="mt-2">
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                                  URGENT
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-orange-600" />
                Upcoming Events
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <Sunrise className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming events</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const typeInfo = getEventTypeInfo(event.type);
                    const daysUntil = Math.ceil((new Date(event.startTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={event.id}
                        className="p-3 bg-white/40 rounded-xl hover:bg-white/60 transition-all duration-200 cursor-pointer group"
                        onClick={() => setSelectedEventForModal(event)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 bg-gradient-to-r ${typeInfo.gradient}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(event.startTime).toLocaleDateString()} at {formatTime(new Date(event.startTime))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Templates */}
            <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Quick Templates
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setShowTemplateManager(true)}
                  className="w-full p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 rounded-xl transition-all duration-200 text-white shadow-lg text-center group"
                >
                  <FileText className="w-5 h-5 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold">Browse & Apply Templates</div>
                </button>
                
                <div className="text-xs text-gray-600 text-center py-2">
                  {templateApplications.length > 0 ? 
                    `${templateApplications.length} templates applied` : 
                    'No templates applied yet'
                  }
                </div>
                
                {getAppliedTemplateForDate(today) && (
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-800">Template Active Today</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                Quick Create
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {eventTypes.slice(0, 6).map((type) => (
                  <button
                    key={type.type}
                    onClick={() => {
                      const startTime = new Date();
                      startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
                      const endTime = new Date(startTime);
                      endTime.setHours(endTime.getHours() + 1);

                      setEditingEvent({
                        id: '',
                        title: '',
                        startTime,
                        endTime,
                        color: type.color,
                        type: type.type,
                        status: 'confirmed',
                        priority: 'medium'
                      });
                      setShowEventModal(true);
                    }}
                    className={`p-3 bg-gradient-to-r ${type.gradient} hover:scale-105 rounded-xl transition-all duration-200 text-white shadow-lg text-center group`}
                  >
                    <type.icon className="w-5 h-5 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-bold">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEventForModal && (
        <EnhancedEventDetailModal
          event={selectedEventForModal}
          onClose={() => setSelectedEventForModal(null)}
          onEdit={(event) => {
            setEditingEvent(event);
            setShowEventModal(true);
            setSelectedEventForModal(null);
          }}
          onDelete={handleDeleteEvent}
          getEventTypeInfo={getEventTypeInfo}
          formatTime={formatTime}
          formatDateRange={formatDateRange}
        />
      )}

      {/* Event Modal */}
      {showEventModal && (
        <EnhancedEventModal
          event={editingEvent || {
            id: '',
            title: '',
            startTime: selectedDate || new Date(),
            endTime: new Date(new Date(selectedDate || new Date()).setHours((selectedDate || new Date()).getHours() + 1)),
            color: '#3B82F6',
            type: 'meeting',
            status: 'confirmed',
            priority: 'medium'
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          eventTypes={eventTypes}
          settings={settings}
        />
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <CalendarTemplateManager
          onClose={() => setShowTemplateManager(false)}
          onApplyTemplate={handleApplyTemplate}
          currentDate={currentDate}
          events={events}
        />
      )}
    </div>
  );
}

// Enhanced Event Detail Modal Component
interface EnhancedEventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  getEventTypeInfo: (type: CalendarEvent['type']) => any;
  formatTime: (date: Date) => string;
  formatDateRange: (start: Date, end: Date) => string;
}

function EnhancedEventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
  getEventTypeInfo,
  formatTime,
  formatDateRange
}: EnhancedEventDetailModalProps) {
  const typeInfo = getEventTypeInfo(event.type);
  const EventIcon = typeInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${typeInfo.gradient} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <EventIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-white/90">{typeInfo.label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {event.description && (
                <div className="bg-white/50 rounded-2xl p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-purple-600" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>
              )}

              {/* Time & Location */}
              <div className="bg-white/50 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  When & Where
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800">
                        {formatDateRange(new Date(event.startTime), new Date(event.endTime))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60))} minutes
                      </div>
                    </div>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <div className="bg-white/50 rounded-2xl p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    Attendees ({event.attendees.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.map((attendee, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {event.notes && (
                <div className="bg-white/50 rounded-2xl p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="space-y-4">
              {/* Status & Priority */}
              <div className="bg-white/50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">Status</h4>
                <div className="space-y-2">
                  {event.status && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[event.status]}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </div>
                  )}
                  {event.priority && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[event.priority]}`}>
                      {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                    </div>
                  )}
                </div>
              </div>

              {/* Reminder */}
              {event.reminder !== undefined && (
                <div className="bg-white/50 rounded-2xl p-4">
                  <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-yellow-600" />
                    Reminder
                  </h4>
                  <p className="text-gray-700">{event.reminder} minutes before</p>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="bg-white/50 rounded-2xl p-4">
                  <h4 className="font-bold text-gray-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white/50 rounded-2xl p-4">
                <h4 className="font-bold text-gray-800 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => onEdit(event)}
                    className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Event</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${event.title}\n${formatDateRange(new Date(event.startTime), new Date(event.endTime))}${event.location ? `\nLocation: ${event.location}` : ''}`);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Details</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this event?')) {
                        onDelete(event.id);
                      }
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Event</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Event Modal Component
interface EnhancedEventModalProps {
  event: CalendarEvent;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onClose: () => void;
  eventTypes: any[];
  settings: CalendarSettings;
}

function EnhancedEventModal({ event, onSave, onDelete, onClose, eventTypes, settings }: EnhancedEventModalProps) {
  const [formData, setFormData] = useState(event);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'advanced'>('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
    }
  };

  const handleDelete = () => {
    if (event.id && confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-gradient-to-r from-white/40 to-white/20">
          <h2 className="text-2xl font-bold text-gray-900">
            {event.id ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 bg-white/20">
          {[
            { id: 'basic', label: 'Basic Info', icon: Edit3 },
            { id: 'details', label: 'Details', icon: Settings },
            { id: 'advanced', label: 'Advanced', icon: Star }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white/50 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-6">
            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 text-lg"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 resize-none"
                    rows={4}
                    placeholder="Add description (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="datetime-local"
                      value={new Date(formData.startTime).toISOString().slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">End Time *</label>
                    <input
                      type="datetime-local"
                      value={new Date(formData.endTime).toISOString().slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Event Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {eventTypes.map((type) => (
                      <button
                        key={type.type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.type, color: type.color })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.type === type.type
                            ? `border-purple-500 bg-gradient-to-r ${type.gradient} text-white shadow-lg scale-105`
                            : 'border-white/30 bg-white/40 hover:border-white/50 text-gray-700'
                        }`}
                      >
                        <type.icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-bold">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    placeholder="Add location (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Attendees</label>
                  <input
                    type="text"
                    value={formData.attendees?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value ? e.target.value.split(', ') : [] })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    placeholder="Enter email addresses separated by commas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                    <select
                      value={formData.priority || 'medium'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status || 'confirmed'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="tentative">Tentative</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Reminder</label>
                  <select
                    value={formData.reminder || ''}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                  >
                    <option value="">No reminder</option>
                    <option value="5">5 minutes before</option>
                    <option value="10">10 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value ? e.target.value.split(', ') : [] })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 resize-none"
                    rows={4}
                    placeholder="Additional notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Recurrence</label>
                  <select
                    value={formData.recurrence || 'none'}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
                  >
                    <option value="none">No recurrence</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={formData.isAllDay || false}
                    onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                    All-day event
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/20 bg-white/20">
            <div className="flex items-center space-x-3">
              {event.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-6 py-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                {event.id ? 'Update' : 'Create'} Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
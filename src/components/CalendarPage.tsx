import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock,
  MapPin,
  Users,
  Search,
  Bell,
  Phone,
  Coffee,
  Briefcase,
  Heart,
  Star,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: string;
  type: 'meeting' | 'call' | 'break' | 'work' | 'personal' | 'important';
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  reminder?: number; // minutes before
}

const eventTypes = [
  { type: 'meeting' as const, icon: Users, color: '#3B82F6', label: 'Meeting' },
  { type: 'call' as const, icon: Phone, color: '#10B981', label: 'Call' },
  { type: 'break' as const, icon: Coffee, color: '#F59E0B', label: 'Break' },
  { type: 'work' as const, icon: Briefcase, color: '#8B5CF6', label: 'Work' },
  { type: 'personal' as const, icon: Heart, color: '#EF4444', label: 'Personal' },
  { type: 'important' as const, icon: Star, color: '#F97316', label: 'Important' },
];

const defaultEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team sync and planning',
    startTime: new Date(2025, 0, 29, 9, 0),
    endTime: new Date(2025, 0, 29, 9, 30),
    color: '#3B82F6',
    type: 'meeting',
    location: 'Conference Room A',
    attendees: ['john@company.com', 'sarah@company.com'],
    reminder: 15
  },
  {
    id: '2',
    title: 'Client Call',
    description: 'Quarterly review with ABC Corp',
    startTime: new Date(2025, 0, 29, 14, 0),
    endTime: new Date(2025, 0, 29, 15, 0),
    color: '#10B981',
    type: 'call',
    location: 'Zoom',
    reminder: 10
  },
  {
    id: '3',
    title: 'Lunch Break',
    startTime: new Date(2025, 0, 29, 12, 0),
    endTime: new Date(2025, 0, 29, 13, 0),
    color: '#F59E0B',
    type: 'break'
  },
  {
    id: '4',
    title: 'Project Planning',
    description: 'Q1 roadmap planning session',
    startTime: new Date(2025, 0, 30, 10, 0),
    endTime: new Date(2025, 0, 30, 12, 0),
    color: '#8B5CF6',
    type: 'work',
    location: 'Meeting Room B',
    reminder: 30
  }
];

export function CalendarPage() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendar-events', defaultEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventForModal, setSelectedEventForModal] = useState<CalendarEvent | null>(null);

  const today = new Date();
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
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleCreateEvent = (date?: Date) => {
    const startTime = date || selectedDate || new Date();
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(10, 0, 0, 0);

    setEditingEvent({
      id: '',
      title: '',
      description: '',
      startTime,
      endTime,
      color: '#3B82F6',
      type: 'meeting'
    });
    setShowEventModal(true);
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
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventTypeInfo = (type: CalendarEvent['type']) => {
    return eventTypes.find(t => t.type === type) || eventTypes[0];
  };

  const monthDays = getMonthDays();
  const upcomingEvents = getUpcomingEvents();

  const handleCloseEventDetailModal = () => {
    setSelectedEventForModal(null);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
              <p className="text-gray-600">Manage your schedule and events</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                />
              </div>
              
              <button
                onClick={() => handleCreateEvent()}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Event</span>
              </button>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/70 rounded-xl transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/70 rounded-xl transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                Today
              </button>
            </div>

            <div className="flex items-center bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
              {['month', 'week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl overflow-hidden">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-200/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-4 text-center">
                    <span className="text-sm font-semibold text-gray-600">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Body */}
              <div className="grid grid-cols-7">
                {monthDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border-r border-b border-gray-200/30 transition-all duration-200 hover:bg-blue-50/30 cursor-pointer ${
                        !isCurrentMonth ? 'bg-gray-50/30 text-gray-400' : ''
                      }`}
                      onClick={() => {
                        setSelectedDate(day);
                        handleCreateEvent(day);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            isTodayDate
                              ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center'
                              : isCurrentMonth
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 2 && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                            +{dayEvents.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const typeInfo = getEventTypeInfo(event.type);
                          return (
                            <div
                              key={event.id}
                              className="text-xs p-1.5 rounded-lg text-white font-medium truncate cursor-pointer hover:scale-105 transition-transform duration-200"
                              style={{ backgroundColor: event.color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEvent(event);
                                setShowEventModal(true);
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Today's Events</span>
              </h3>
              
              <div className="space-y-3">
                {getEventsForDate(today).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No events today</p>
                ) : (
                  getEventsForDate(today).map((event) => {
                    return (
                      <div
                        key={event.id}
                        className="p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setEditingEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className="w-3 h-3 rounded-full mt-1.5"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{event.title}</div>
                            <div className="text-sm text-gray-600">
                              {formatTime(new Date(event.startTime))} - {formatTime(new Date(event.endTime))}
                            </div>
                            {event.location && (
                              <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
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
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <span>Upcoming</span>
              </h3>
              
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                ) : (
                  upcomingEvents.map((event) => {
                    return (
                      <div
                        key={event.id}
                        className="p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setEditingEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className="w-3 h-3 rounded-full mt-1.5"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{event.title}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(event.startTime).toLocaleDateString()} at {formatTime(new Date(event.startTime))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {eventTypes.slice(0, 4).map((type) => (
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
                        type: type.type
                      });
                      setShowEventModal(true);
                    }}
                    className="p-3 bg-gray-50/50 hover:bg-gray-100/50 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-4 h-4" style={{ color: type.color }} />
                      <span className="text-sm font-medium text-gray-700">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modals */}
      {selectedEventForModal && (
        <CalendarEventDetailModal
          event={selectedEventForModal}
          onClose={handleCloseEventDetailModal}
          onEdit={(event) => {
            setEditingEvent(event);
            setShowEventModal(true);
            setSelectedEventForModal(null);
          }}
          onDelete={(eventId) => {
            handleDeleteEvent(eventId);
            setSelectedEventForModal(null);
          }}
          getEventTypeInfo={getEventTypeInfo}
        />
      )}

      {showEventModal && (
        <EventModal
          event={editingEvent || {
            id: '',
            title: '',
            startTime: selectedDate || new Date(),
            endTime: new Date(new Date(selectedDate || new Date()).setHours((selectedDate || new Date()).getHours() + 1)),
            color: '#3B82F6',
            type: 'meeting',
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

interface EventModalProps {
  event: CalendarEvent;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onClose: () => void;
}

function EventModal({ event, onSave, onDelete, onClose }: EventModalProps) {
  const [formData, setFormData] = useState(event);

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
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {event.id ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 resize-none"
              rows={3}
              placeholder="Add description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
              <input
                type="datetime-local"
                value={new Date(formData.startTime).toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
              <input
                type="datetime-local"
                value={new Date(formData.endTime).toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
            <div className="grid grid-cols-3 gap-3">
              {eventTypes.map((type) => (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.type, color: type.color })}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.type === type.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <type.icon className="w-5 h-5 mx-auto mb-1" style={{ color: type.color }} />
                  <div className="text-xs font-medium text-gray-700">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              placeholder="Add location (optional)"
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              {event.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
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
                className="px-6 py-3 text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
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

interface CalendarEventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  getEventTypeInfo: (type: CalendarEvent['type']) => { type: CalendarEvent['type']; icon: any; color: string; label: string };
}

function CalendarEventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
  getEventTypeInfo
}: CalendarEventDetailModalProps) {
  const EventIcon = getEventTypeInfo(event.type).icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <EventIcon className="w-6 h-6" style={{ color: getEventTypeInfo(event.type).color }} />
              <span>{event.title}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Start Time</h3>
              <p className="text-gray-900">{event.startTime.toLocaleString()}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">End Time</h3>
              <p className="text-gray-900">{event.endTime.toLocaleString()}</p>
            </div>

            {event.location && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-gray-900 flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{event.location}</span>
                </p>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Attendees</h3>
                <div className="flex flex-wrap gap-1">
                  {event.attendees.map((attendee, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {event.reminder !== undefined && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Reminder</h3>
                <p className="text-gray-900 flex items-center space-x-1">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span>{event.reminder} minutes before</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onEdit(event)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            
            <button
              onClick={() => onDelete(event.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
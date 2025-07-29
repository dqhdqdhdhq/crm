import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  Clock,
  Tag,
  CheckSquare,
  Square,
  Trash2,
  Edit3,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Target,
  TrendingUp,
  Award,
  Zap,
  List,
  Grid3X3,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  Building
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, Session, TaskTemplate } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultTaskTemplates: TaskTemplate[] = [
  {
    id: '1',
    name: 'Code Review',
    emoji: '👀',
    title: 'Review pull request',
    description: 'Review code changes and provide feedback',
    priority: 'medium',
    timeEstimate: 30,
    tags: ['development', 'review']
  },
  {
    id: '2',
    name: 'Bug Fix',
    emoji: '🐛',
    title: 'Fix reported bug',
    description: 'Investigate and resolve the reported issue',
    priority: 'high',
    timeEstimate: 60,
    tags: ['development', 'bug']
  },
  {
    id: '3',
    name: 'Meeting',
    emoji: '🤝',
    title: 'Team meeting',
    description: 'Weekly team sync and planning session',
    priority: 'medium',
    timeEstimate: 45,
    tags: ['meeting', 'team']
  },
  {
    id: '4',
    name: 'Documentation',
    emoji: '📝',
    title: 'Update documentation',
    description: 'Write or update project documentation',
    priority: 'low',
    timeEstimate: 90,
    tags: ['documentation', 'writing']
  }
];

const defaultTasks: Task[] = [
  // To Do
  {
    id: '1',
    title: 'Draft cold call script',
    completed: false,
    priority: 'high',
    status: 'todo',
    createdAt: new Date(),
    description: 'Create a new script for cold calling potential leads.',
    timeEstimate: 60,
    tags: ['sales', 'scripting']
  },
  {
    id: '2',
    title: 'Research 10 new prospects',
    completed: false,
    priority: 'medium',
    status: 'todo',
    createdAt: new Date(),
    description: 'Identify 10 new potential clients in the tech industry.',
    timeEstimate: 120,
    tags: ['research', 'prospecting']
  },
  {
    id: '3',
    title: 'Follow up with existing leads',
    completed: false,
    priority: 'high',
    status: 'todo',
    createdAt: new Date(),
    description: 'Send follow-up emails to all leads from last week.',
    timeEstimate: 45,
    tags: ['sales', 'communication']
  },
  {
    id: '4',
    title: 'Prepare for team meeting',
    completed: false,
    priority: 'medium',
    status: 'todo',
    createdAt: new Date(),
    description: 'Gather metrics and prepare slides for the weekly sales meeting.',
    timeEstimate: 30,
    tags: ['meeting', 'preparation']
  },
  {
    id: '5',
    title: 'Update CRM with new contacts',
    completed: false,
    priority: 'low',
    status: 'todo',
    createdAt: new Date(),
    description: 'Add all new contacts from the networking event to the CRM.',
    timeEstimate: 60,
    tags: ['crm', 'data entry']
  },
  {
    id: '6',
    title: 'Schedule product demo with client X',
    completed: false,
    priority: 'high',
    status: 'todo',
    createdAt: new Date(),
    description: 'Contact Client X and schedule a product demo for next week.',
    timeEstimate: 20,
    tags: ['sales', 'demo']
  },
  {
    id: '7',
    title: 'Review Q3 sales targets',
    completed: false,
    priority: 'medium',
    status: 'todo',
    createdAt: new Date(),
    description: 'Review the sales targets for the upcoming quarter.',
    timeEstimate: 45,
    tags: ['planning', 'strategy']
  },
  // In Progress
  {
    id: '8',
    title: 'Onboarding documentation for new hires',
    completed: false,
    priority: 'medium',
    status: 'in-progress',
    createdAt: new Date(),
    description: 'Creating a comprehensive onboarding guide for the sales team.',
    timeEstimate: 180,
    tags: ['documentation', 'team']
  },
  // Done
  {
    id: '9',
    title: 'Finalize Q2 sales report',
    completed: true,
    priority: 'high',
    status: 'done',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'Completed and submitted the sales report for the second quarter.',
    timeEstimate: 90,
    tags: ['reporting', 'sales']
  }
];

const statusColumns: { id: Task['status']; title: string; color: string; count: number }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 text-gray-700', count: 0 },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100 text-blue-700', count: 0 },
  { id: 'in-review', title: 'In Review', color: 'bg-purple-100 text-purple-700', count: 0 },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-100 text-red-700', count: 0 },
  { id: 'done', title: 'Done', color: 'bg-green-100 text-green-700', count: 0 }
];

export function TasksPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', defaultTasks);
  const [templates] = useLocalStorage<TaskTemplate[]>('task-templates', defaultTaskTemplates);
  const [sessions, setSessions] = useLocalStorage<Session[]>('timer-sessions', []);
  // const [timerHistory] = useLocalStorage<TimerHistoryEntry[]>('timer-history', []);
  
  // Get partners for linking tasks
  const [partners] = useLocalStorage<{ id: string; name: string }[]>('partners-simple', []);
  
  // Check for pending task creation from partner page
  useEffect(() => {
    const pendingTaskData = localStorage.getItem('pending-task-creation');
    if (pendingTaskData) {
      try {
        const taskData = JSON.parse(pendingTaskData);
        // Create a new task with the partner data
        const newTask: Task = {
          id: crypto.randomUUID(),
          title: taskData.title || '',
          completed: false,
          priority: taskData.priority || 'medium',
          status: taskData.status || 'todo',
          createdAt: new Date(),
          description: taskData.description || '',
          tags: taskData.tags || [],
          partnerId: taskData.partnerId,
          partnerName: taskData.partnerName
        };
        
        // Set the task for editing
        setEditingTask(newTask);
        setShowNewTaskModal(true);
        
        // Clear the pending task data
        localStorage.removeItem('pending-task-creation');
      } catch (error) {
        console.error('Error parsing pending task data:', error);
        localStorage.removeItem('pending-task-creation');
      }
    }
    
    // Check for task details to view from partner page
    const viewTaskData = localStorage.getItem('view-task-details');
    if (viewTaskData) {
      try {
        const taskData = JSON.parse(viewTaskData);
        // Find the actual task in our tasks array
        const actualTask = tasks.find(t => t.id === taskData.id);
        if (actualTask) {
          setSelectedTaskForModal(actualTask);
        }
        
        // Clear the view task data
        localStorage.removeItem('view-task-details');
      } catch (error) {
        console.error('Error parsing view task data:', error);
        localStorage.removeItem('view-task-details');
      }
    }
  }, [tasks]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'dueDate'>('created');
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTimer, setActiveTimer] = useState<Session | null>(null);
  const [timerTime, setTimerTime] = useState(0);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: any;
    
    if (activeTimer && activeTimer.status === 'running') {
      interval = setInterval(() => {
        setTimerTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'created':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length;
    
    return { total, completed, inProgress, overdue };
  };

  const getTasksByStatus = () => {
    const tasksByStatus: Record<Task['status'], Task[]> = statusColumns.reduce((acc, column) => {
      acc[column.id] = [];
      return acc;
    }, {} as Record<Task['status'], Task[]>);

    filteredTasks.forEach(task => {
      tasksByStatus[task.status].push(task);
    });
    return tasksByStatus;
  };

  const handleCreateTask = (template?: TaskTemplate) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: template ? template.title : '',
      completed: false,
      priority: template ? template.priority : 'medium',
      status: 'todo',
      createdAt: new Date(),
      description: template ? template.description : '',
      timeEstimate: template ? template.timeEstimate : undefined,
      tags: template ? template.tags : []
    };
    
    setEditingTask(newTask);
    setShowNewTaskModal(true);
  };

  const handleSaveTask = (task: Task) => {
    if (tasks.find(t => t.id === task.id)) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, task]);
    }
    setShowNewTaskModal(false);
    setEditingTask(null);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            status: !task.completed ? 'done' : 'todo'
          }
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleMoveTask = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus as Task['status'],
            completed: newStatus === 'done'
          }
        : task
    ));
  };

  const handleStartTimer = (task: Task) => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      taskId: task.id,
      startTime: new Date(),
      duration: 0,
      targetDuration: (task.timeEstimate || 25) * 60,
      status: 'running'
    };
    
    setActiveTimer(newSession);
    setTimerTime(0);
    setSessions([...sessions, newSession]);
  };

  const handlePauseTimer = () => {
    if (activeTimer) {
      const updatedSession = {
        ...activeTimer,
        status: 'paused' as const,
        duration: timerTime
      };
      setActiveTimer(updatedSession);
      setSessions(sessions.map(s => s.id === activeTimer.id ? updatedSession : s));
    }
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      const updatedSession = {
        ...activeTimer,
        status: 'completed' as const,
        endTime: new Date(),
        duration: timerTime
      };
      setSessions(sessions.map(s => s.id === activeTimer.id ? updatedSession : s));
      setActiveTimer(null);
      setTimerTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'text-gray-600 bg-gray-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'in-review': return 'text-purple-600 bg-purple-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      case 'done': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const stats = getTaskStats();
  const tasksByStatus = getTasksByStatus();

  const handleTaskClick = (task: Task) => {
    setSelectedTaskForModal(task);
  };

  const handleCloseTaskModal = () => {
    setSelectedTaskForModal(null);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const startColumnId = source.droppableId as Task['status'];
    const endColumnId = destination.droppableId as Task['status'];

    // Get current tasks grouped by status
    const currentTasksByStatus: Record<Task['status'], Task[]> = getTasksByStatus();

    const startTasks = Array.from(currentTasksByStatus[startColumnId]);
    const endTasks = Array.from(currentTasksByStatus[endColumnId]);

    const draggedTask = tasks.find(task => task.id === draggableId);
    if (!draggedTask) return;

    // Moving task within the same column
    if (startColumnId === endColumnId) {
      const [removed] = startTasks.splice(source.index, 1);
      startTasks.splice(destination.index, 0, removed as Task);

      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task =>
          task.status === startColumnId
            ? startTasks.find(t => t.id === task.id) || task
            : task
        );
        return newTasks.filter(task => task !== undefined) as Task[]; // Ensure no undefined tasks
      });
    } else { // Moving task to a different column
      startTasks.splice(source.index, 1);
      endTasks.splice(destination.index, 0, { ...draggedTask, status: endColumnId });

      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => {
          if (task.id === draggableId) {
            return { ...task, status: endColumnId };
          } else if (task.status === startColumnId) {
            return startTasks.find(t => t.id === task.id) || task;
          } else if (task.status === endColumnId) {
            return endTasks.find(t => t.id === task.id) || task;
          }
          return task;
        });
        return newTasks.filter(task => task !== undefined) as Task[]; // Ensure no undefined tasks
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/60 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3">Tasks</h1>
                <p className="text-lg text-gray-600 font-medium">Manage your tasks and track your productivity</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-1 shadow-lg">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('pipeline')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'pipeline' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={() => handleCreateTask()}
                  className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Task</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-2">Total Tasks</p>
                    <p className="text-4xl font-black text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckSquare className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-3xl p-8 hover:shadow-2xl hover:shadow-green-100/50 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-2">Completed</p>
                    <p className="text-4xl font-black text-green-600">{stats.completed}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-2">In Progress</p>
                    <p className="text-4xl font-black text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-3xl p-8 hover:shadow-2xl hover:shadow-red-100/50 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-2">Overdue</p>
                    <p className="text-4xl font-black text-red-600">{stats.overdue}</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center justify-between space-x-8">
              <div className="flex items-center space-x-6 flex-1">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-13 pr-6 py-4 bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 placeholder-gray-500 text-lg font-medium shadow-lg"
                  />
                </div>
                
                {viewMode === 'list' && (
                  <div className="flex items-center space-x-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-6 py-4 bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 font-bold text-gray-700 shadow-lg"
                    >
                      <option value="all">All Status</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as any)}
                      className="px-6 py-4 bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 font-bold text-gray-700 shadow-lg"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-6 py-4 bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 font-bold text-gray-700 shadow-lg"
                    >
                      <option value="created">Date Created</option>
                      <option value="priority">Priority</option>
                      <option value="dueDate">Due Date</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {viewMode === 'pipeline' ? (
                /* Pipeline View */
                <div className="relative">
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-6 min-w-max pb-4">
                      {statusColumns.map((column) => (
                        <Droppable droppableId={column.id} key={column.id}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="bg-white/95 backdrop-blur-2xl border border-gray-200/30 rounded-3xl shadow-2xl overflow-hidden w-80 flex-shrink-0 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300"
                            >
                              <div className="p-6 border-b border-gray-200/30">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-bold text-gray-900">{column.title}</h3>
                                  <span className={`px-3 py-2 text-sm font-bold rounded-xl ${column.color} shadow-sm`}>
                                    {tasksByStatus[column.id]?.length || 0}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="p-4 space-y-3 min-h-[500px] max-h-[600px] overflow-y-auto">
                                {tasksByStatus[column.id]?.map((task, index) => (
                                  <Draggable draggableId={task.id} index={index} key={task.id}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <PipelineTaskCard
                                          task={task}
                                          onEdit={() => {
                                            setEditingTask(task);
                                            setShowNewTaskModal(true);
                                          }}
                                          onDelete={() => handleDeleteTask(task.id)}
                                          onMove={handleMoveTask}
                                          onStartTimer={() => handleStartTimer(task)}
                                          onTaskClick={() => handleTaskClick(task)}
                                          isTimerActive={activeTimer?.taskId === task.id}
                                          getPriorityColor={getPriorityColor}
                                          availableStatuses={statusColumns.filter(col => col.id !== column.id)}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                
                                {column.id === 'todo' && (
                                  <button
                                    onClick={() => handleCreateTask()}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center space-x-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Task</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </div>
                  
                  {/* Navigation Arrows */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => {
                        const container = document.querySelector('.overflow-x-auto');
                        if (container) {
                          container.scrollBy({ left: -320, behavior: 'smooth' });
                        }
                      }}
                      className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-gray-900"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => {
                        const container = document.querySelector('.overflow-x-auto');
                        if (container) {
                          container.scrollBy({ left: 320, behavior: 'smooth' });
                        }
                      }}
                      className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-gray-900"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-gray-200/50">
                    <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200/50">
                    {filteredTasks.length === 0 ? (
                      <div className="p-12 text-center">
                        <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-6">Create your first task to get started</p>
                        <button
                          onClick={() => handleCreateTask()}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium"
                        >
                          Create Task
                        </button>
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={() => handleToggleTask(task.id)}
                          onEdit={() => {
                            setEditingTask(task);
                            setShowNewTaskModal(true);
                          }}
                          onDelete={() => handleDeleteTask(task.id)}
                          onStartTimer={() => handleStartTimer(task)}
                          isTimerActive={activeTimer?.taskId === task.id}
                          getPriorityColor={getPriorityColor}
                          getStatusColor={getStatusColor}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Active Timer */}
              {activeTimer && (
                <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Active Timer</span>
                  </h3>
                  
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {formatTime(timerTime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Target: {formatTime(activeTimer.targetDuration)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3">
                    {activeTimer.status === 'running' ? (
                      <button
                        onClick={handlePauseTimer}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTimer({ ...activeTimer, status: 'running' })}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>Resume</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleStopTimer}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Templates */}
              <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
                
                <div className="space-y-3">
                  {templates.slice(0, 4).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleCreateTask(template)}
                      className="w-full p-3 bg-gray-50/50 hover:bg-gray-100/50 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{template.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.timeEstimate}min</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Today's Progress */}
              <div className="bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Today's Progress</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Completion Rate</span>
                      <span className="text-sm font-bold text-gray-900">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                      <div className="text-xs text-gray-500">In Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Detail Modal */}
        {selectedTaskForModal && (
          <TaskDetailModal
            task={selectedTaskForModal}
            onClose={handleCloseTaskModal}
            onEdit={() => {
              setEditingTask(selectedTaskForModal);
              setShowNewTaskModal(true);
              setSelectedTaskForModal(null);
            }}
            onDelete={() => {
              handleDeleteTask(selectedTaskForModal.id);
              setSelectedTaskForModal(null);
            }}
            onStartTimer={() => {
              handleStartTimer(selectedTaskForModal);
              setSelectedTaskForModal(null);
            }}
            isTimerActive={activeTimer?.taskId === selectedTaskForModal.id}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        )}

        {/* New Task Modal */}
        {showNewTaskModal && (
          <TaskModal
            task={editingTask || {
              id: '',
              title: '',
              completed: false,
              priority: 'medium',
              status: 'todo',
              createdAt: new Date(),
              description: '',
              tags: []
            }}
            templates={templates}
            partners={partners}
            onSave={handleSaveTask}
            onClose={() => {
              setShowNewTaskModal(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </DragDropContext>
  );
}

interface PipelineTaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (taskId: string, newStatus: string) => void;
  onStartTimer: () => void;
  onTaskClick: () => void;
  isTimerActive: boolean;
  getPriorityColor: (priority: string) => string;
  availableStatuses: { id: string; title: string; color: string }[];
}

function PipelineTaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onMove, 
  onStartTimer, 
  onTaskClick,
  isTimerActive,
  getPriorityColor,
  availableStatuses 
}: PipelineTaskCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or menu
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onTaskClick();
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
          {task.title}
        </h4>
        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMoveMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
              {availableStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => {
                    onMove(task.id, status.id);
                    setShowMoveMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>{status.title}</span>
                </button>
              ))}
              <hr className="my-1" />
              <button
                onClick={() => {
                  onEdit();
                  setShowMoveMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMoveMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase()}
        </span>
        
        <div className="flex items-center space-x-2">
          {task.timeEstimate && (
            <span className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{task.timeEstimate}m</span>
            </span>
          )}
          
          {!task.completed && !isTimerActive && (
            <button
              onClick={onStartTimer}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Start timer"
            >
              <Play className="w-3 h-3" />
            </button>
          )}
          
          {isTimerActive && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
      
      {task.dueDate && (
        <div className={`flex items-center space-x-1 text-xs mt-2 ${
          isOverdue ? 'text-red-600' : 'text-gray-500'
        }`}>
          <Calendar className="w-3 h-3" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}
      
      {(task.tags && task.tags.length > 0) || (task.partnerId && task.partnerName) ? (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.partnerId && task.partnerName && (
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded flex items-center space-x-1 font-medium">
              <Building className="w-3 h-3" />
              <span>{task.partnerName}</span>
            </span>
          )}
          {task.tags && task.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {task.tags && task.tags.length > 2 && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartTimer: () => void;
  isTimerActive: boolean;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

function TaskCard({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete, 
  onStartTimer, 
  isTimerActive,
  getPriorityColor,
  getStatusColor 
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div 
      className="p-6 hover:bg-gray-50/50 transition-colors group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-4">
        <button
          onClick={onToggle}
          className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
        >
          {task.completed ? (
            <CheckSquare className="w-5 h-5 text-green-600" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-semibold text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
            <div className={`flex items-center space-x-2 transition-opacity duration-200 ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}>
              {!task.completed && !isTimerActive && (
                <button
                  onClick={onStartTimer}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Start timer"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{task.description}</p>
          )}
          
          <div className="flex items-center flex-wrap gap-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            
            {task.timeEstimate && (
              <span className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{task.timeEstimate}min</span>
              </span>
            )}
            
            {task.dueDate && (
              <span className={`flex items-center space-x-1 text-xs ${
                isOverdue ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            )}
            
            {isTimerActive && (
              <span className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span>Timer Active</span>
              </span>
            )}
          </div>
          
          {((task.tags && task.tags.length > 0) || (task.partnerId && task.partnerName)) && (
            <div className="flex items-center space-x-2 mt-3">
              {task.partnerId && task.partnerName && (
                <span className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-medium">
                  <Building className="w-3 h-3" />
                  <span>{task.partnerName}</span>
                </span>
              )}
              {task.tags && task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TaskModalProps {
  task: Task;
  templates: TaskTemplate[];
  onSave: (task: Task) => void;
  onClose: () => void;
  partners?: { id: string; name: string }[];
}

function TaskModal({ task, templates, onSave, onClose, partners }: TaskModalProps) {
  const [editedTask, setEditedTask] = useState(task);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditedTask({
        ...editedTask,
        title: template.title,
        description: template.description,
        priority: template.priority,
        timeEstimate: template.timeEstimate,
        tags: template.tags
      });
    }
    setSelectedTemplate(templateId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedTask.title.trim()) {
      onSave(editedTask);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {task.id ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!task.id && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Start</label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{template.emoji}</span>
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.timeEstimate}min</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 resize-none"
              rows={3}
              placeholder="Add description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedTask({ 
                  ...editedTask, 
                  dueDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time Estimate (minutes)</label>
              <input
                type="number"
                value={editedTask.timeEstimate || ''}
                onChange={(e) => setEditedTask({ 
                  ...editedTask, 
                  timeEstimate: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                placeholder="25"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={editedTask.tags?.join(', ') || ''}
              onChange={(e) => setEditedTask({ 
                ...editedTask, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
              })}
              className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              placeholder="development, urgent, review"
            />
          </div>

          {partners && partners.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Link to Partner</label>
              <select
                value={editedTask.partnerId || ''}
                onChange={(e) => {
                  const selectedPartnerId = e.target.value;
                  const selectedPartner = partners.find(p => p.id === selectedPartnerId);
                  setEditedTask({ 
                    ...editedTask, 
                    partnerId: selectedPartnerId || undefined,
                    partnerName: selectedPartner?.name || undefined
                  });
                }}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
              >
                <option value="">No partner selected</option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
              {editedTask.partnerId && (
                <p className="mt-2 text-sm text-gray-500">
                  This task will be linked to <span className="font-medium text-blue-600">{editedTask.partnerName}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
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
              {task.id ? 'Update' : 'Create'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartTimer: () => void;
  isTimerActive: boolean;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

function TaskDetailModal({
  task,
  onClose,
  onEdit,
  onDelete,
  onStartTimer,
  isTimerActive,
  getPriorityColor,
  getStatusColor
}: TaskDetailModalProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-lg ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-lg border ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()} PRIORITY
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="text-gray-900">{task.createdAt.toLocaleDateString()}</p>
            </div>
            
            {task.dueDate && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                <p className={`${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {task.dueDate.toLocaleDateString()}
                  {isOverdue && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">OVERDUE</span>}
                </p>
              </div>
            )}

            {task.timeEstimate && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Time Estimate</h3>
                <p className="text-gray-900">{task.timeEstimate} minutes</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="text-gray-900">{task.status.replace('-', ' ').toUpperCase()}</p>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!task.completed && !isTimerActive && (
                <button
                  onClick={onStartTimer}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Timer</span>
                </button>
              )}
              
              {isTimerActive && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Timer Running</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={onDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
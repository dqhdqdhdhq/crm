import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Square, Settings, Clock, Timer,
  Minus, X, RotateCcw, Zap, Coffee, Brain,
  Target, Flame, Star, TrendingUp, Calendar
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  type: 'focus' | 'break';
  completed: boolean;
  interrupted: boolean;
  mode: 'custom' | 'pomodoro' | 'deep-work';
}

interface FocusStats {
  totalSessions: number;
  totalFocusTime: number;
  longestSession: number;
  currentStreak: number;
  bestStreak: number;
  weeklyGoal: number;
  dailyGoal: number;
}

interface GlobalFocusTimerProps {
  isVisible: boolean;
  onClose: () => void;
}

const focusModes = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, icon: Timer, color: 'from-red-400 to-pink-500' },
  { id: 'deep-work', name: 'Deep Work', duration: 90 * 60, icon: Brain, color: 'from-purple-400 to-indigo-500' },
  { id: 'custom', name: 'Custom', duration: 25 * 60, icon: Settings, color: 'from-blue-400 to-cyan-500' }
];

export function GlobalFocusTimer({ isVisible, onClose }: GlobalFocusTimerProps) {
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focus-sessions', []);
  const [stats, setStats] = useLocalStorage<FocusStats>('focus-stats', {
    totalSessions: 0,
    totalFocusTime: 0,
    longestSession: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyGoal: 10 * 60 * 60,
    dailyGoal: 2 * 60 * 60
  });

  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [mode, setMode] = useState<'custom' | 'pomodoro' | 'deep-work'>('pomodoro');
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [customDuration, setCustomDuration] = useState(25);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to pause/play (only when focus timer is visible)
      if (e.code === 'Space' && isVisible && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        if (isActive && !isPaused) {
          handlePause();
        } else {
          handleStart();
        }
      }
      
      // Escape to stop
      if (e.code === 'Escape' && isVisible && isActive) {
        e.preventDefault();
        handleStop();
      }
      
      // F for focus timer toggle (global shortcut)
      if (e.code === 'KeyF' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        if (isVisible) {
          onClose();
        } else {
          // This would need to be handled by parent component
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isPaused, isVisible]);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLeft]);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleStart = () => {
    if (!isActive) {
      const newSession: FocusSession = {
        id: crypto.randomUUID(),
        startTime: new Date(),
        duration: 0,
        type: sessionType,
        completed: false,
        interrupted: false,
        mode: mode
      };
      setCurrentSession(newSession);
      startTimeRef.current = new Date();
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
      
      const completedSession: FocusSession = {
        ...currentSession,
        endTime,
        duration,
        interrupted: true,
        completed: false
      };
      
      setSessions([...sessions, completedSession]);
      updateStats(completedSession);
    }
    
    resetTimer();
  };

  const handleSessionComplete = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
      
      const completedSession: FocusSession = {
        ...currentSession,
        endTime,
        duration,
        completed: true,
        interrupted: false
      };
      
      setSessions([...sessions, completedSession]);
      updateStats(completedSession);
      
      // Auto-switch to break if in pomodoro mode
      if (mode === 'pomodoro' && sessionType === 'focus') {
        setSessionType('break');
        setTimeLeft(5 * 60);
      }
    }
    
    setIsActive(false);
    setIsPaused(false);
    setCurrentSession(null);
  };

  const updateStats = (session: FocusSession) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      
      if (session.type === 'focus' && session.completed) {
        newStats.totalSessions += 1;
        newStats.totalFocusTime += session.duration;
        newStats.longestSession = Math.max(newStats.longestSession, session.duration);
        newStats.currentStreak += 1;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
      } else if (session.interrupted) {
        newStats.currentStreak = 0;
      }
      
      return newStats;
    });
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentSession(null);
    const selectedMode = focusModes.find(m => m.id === mode);
    const duration = selectedMode?.duration || customDuration * 60;
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getProgressPercentage = () => {
    const selectedMode = focusModes.find(m => m.id === mode);
    const totalDuration = selectedMode?.duration || customDuration * 60;
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => 
      s.startTime && new Date(s.startTime).toDateString() === today && s.type === 'focus' && s.completed
    );
    
    const todayFocusTime = todaySessions.reduce((total, session) => total + session.duration, 0);
    return { sessions: todaySessions.length, focusTime: todayFocusTime };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.timer-controls')) return;
    
    const rect = timerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const todayStats = getTodayStats();

  if (!isVisible) return null;

  return (
    <div
      ref={timerRef}
      className="fixed z-50 select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      {/* Main Timer Container */}
      <div className="relative">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-2xl rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-3xl"></div>
        
        <div 
          className={`relative bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl transition-all duration-300 ${
            isCollapsed ? 'w-20 h-20' : 'w-80'
          }`}
          onMouseDown={handleMouseDown}
        >
          {isCollapsed ? (
            /* Collapsed View */
            <div className="w-20 h-20 flex items-center justify-center cursor-pointer" onClick={() => setIsCollapsed(false)}>
              <div className="text-center">
                <div className="text-sm font-mono text-gray-800 font-bold">{formatTime(timeLeft).split(':')[0]}</div>
                <div className="text-xs text-gray-600">
                  {isActive ? (isPaused ? 'Paused' : 'Active') : 'Ready'}
                </div>
              </div>
            </div>
          ) : (
            /* Expanded View */
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-800">Focus Timer</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  {/* Progress Circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-white/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#timerGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - getProgressPercentage() / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Timer Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-mono font-bold text-gray-800">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {sessionType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                {isActive && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
                    <span className="text-sm text-gray-600">
                      {isPaused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="timer-controls flex items-center justify-center space-x-3 mb-4">
                {!isActive || isPaused ? (
                  <button
                    onClick={handleStart}
                    className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={handleStop}
                  className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Square className="w-5 h-5" />
                </button>

                <button
                  onClick={resetTimer}
                  className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Mode Selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {focusModes.map((focusMode) => {
                  const IconComponent = focusMode.icon;
                  return (
                    <button
                      key={focusMode.id}
                      onClick={() => {
                        setMode(focusMode.id as any);
                        setTimeLeft(focusMode.id === 'custom' ? customDuration * 60 : focusMode.duration);
                        setSessionType('focus');
                      }}
                      className={`p-2 rounded-lg border transition-all duration-200 text-center ${
                        mode === focusMode.id
                          ? `bg-gradient-to-r ${focusMode.color} text-white border-opacity-30 shadow-lg`
                          : 'bg-white/50 hover:bg-white/70 border-white/30 text-gray-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs font-medium">{focusMode.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Duration */}
              {mode === 'custom' && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customDuration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value) || 25;
                      setCustomDuration(duration);
                      setTimeLeft(duration * 60);
                    }}
                    className="w-16 px-2 py-1 text-sm bg-white/70 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-center"
                  />
                  <span className="text-xs text-gray-600">min</span>
                </div>
              )}

              {/* Today's Stats */}
              <div className="bg-white/20 rounded-xl p-3 space-y-2">
                <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Today
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{todayStats.sessions}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{formatDuration(todayStats.focusTime)}</div>
                    <div className="text-xs text-gray-600">Focus Time</div>
                  </div>
                </div>
                
                {/* Streak */}
                <div className="flex items-center justify-center space-x-2 pt-2 border-t border-white/20">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-600">{stats.currentStreak} streak</span>
                </div>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="mt-3 text-center">
                <div className="text-xs text-gray-500">
                  <span className="bg-white/30 px-2 py-1 rounded">Space</span> to pause/play • 
                  <span className="bg-white/30 px-2 py-1 rounded ml-1">Esc</span> to stop
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
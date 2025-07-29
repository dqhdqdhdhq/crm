import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Square, Settings, BarChart3, 
  Target, Brain, Coffee, Music, Volume2,
  Calendar, Clock, Trophy, Flame, Star,
  Zap, Moon, Sun, TreePine, Waves,
  CheckCircle, RotateCcw, Timer, TrendingUp
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  type: 'focus' | 'break';
  completed: boolean;
  interrupted: boolean;
  mode: 'custom' | 'pomodoro' | 'deep-work';
  tags?: string[];
}

interface FocusStats {
  totalSessions: number;
  totalFocusTime: number; // in seconds
  longestSession: number;
  currentStreak: number;
  bestStreak: number;
  weeklyGoal: number;
  dailyGoal: number;
}

const motivationalQuotes = [
  "Deep work is rare, valuable, and meaningful.",
  "Focus is the ultimate superpower.",
  "Your mind is your most powerful tool.",
  "Every minute of focus builds your future.",
  "Distraction is the enemy of greatness.",
  "Flow state is where magic happens.",
  "Concentration is the secret of strength."
];

const ambientSounds = [
  { id: 'rain', name: 'Rain', icon: Waves, color: 'from-blue-400 to-blue-600' },
  { id: 'forest', name: 'Forest', icon: TreePine, color: 'from-green-400 to-green-600' },
  { id: 'coffee', name: 'Café', icon: Coffee, color: 'from-amber-400 to-amber-600' },
  { id: 'white-noise', name: 'White Noise', icon: Volume2, color: 'from-gray-400 to-gray-600' }
];

const focusModes = [
  { id: 'custom', name: 'Custom Timer', duration: 25 * 60, description: 'Set your own focus time' },
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, description: '25 min focus + 5 min break' },
  { id: 'deep-work', name: 'Deep Work', duration: 90 * 60, description: '90 min intense focus' }
];

export function FocusTimer() {
  const [sessions, setSessions] = useLocalStorage<FocusSession[]>('focus-sessions', []);
  const [stats, setStats] = useLocalStorage<FocusStats>('focus-stats', {
    totalSessions: 0,
    totalFocusTime: 0,
    longestSession: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyGoal: 10 * 60 * 60, // 10 hours
    dailyGoal: 2 * 60 * 60 // 2 hours
  });

  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<'custom' | 'pomodoro' | 'deep-work'>('pomodoro');
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [customDuration, setCustomDuration] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Update quote every 30 seconds during active session
  useEffect(() => {
    if (isActive && !isPaused) {
      const quoteInterval = setInterval(() => {
        setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      }, 30000);
      return () => clearInterval(quoteInterval);
    }
  }, [isActive, isPaused]);

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

  const handleStart = () => {
    if (!isActive) {
      // Start new session
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
        setTimeLeft(5 * 60); // 5 minute break
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
    const duration = focusModes.find(m => m.id === mode)?.duration || customDuration * 60;
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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
    const totalDuration = focusModes.find(m => m.id === mode)?.duration || customDuration * 60;
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

  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Deep Focus
          </h1>
          <p className="text-gray-600 text-lg">{currentQuote}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Timer Display */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                
                {/* Timer Circle */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-80 h-80">
                    {/* Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-white/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="50%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Timer Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-light text-gray-800 mb-2 font-mono">
                          {formatTime(timeLeft)}
                        </div>
                        <div className="text-lg text-gray-600 capitalize font-medium">
                          {sessionType} Session
                        </div>
                        {isActive && (
                          <div className="mt-2 flex items-center justify-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
                            <span className="text-sm text-gray-500">
                              {isPaused ? 'Paused' : 'Active'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  {!isActive || isPaused ? (
                    <button
                      onClick={handleStart}
                      className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Pause className="w-8 h-8" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleStop}
                    className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Square className="w-8 h-8" />
                  </button>

                  <button
                    onClick={resetTimer}
                    className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <RotateCcw className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Timer className="w-5 h-5 mr-2 text-purple-600" />
                  Focus Mode
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {focusModes.map((focusMode) => (
                    <button
                      key={focusMode.id}
                      onClick={() => {
                        setMode(focusMode.id as any);
                        setTimeLeft(focusMode.duration);
                        setSessionType('focus');
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                        mode === focusMode.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300 shadow-lg'
                          : 'bg-white/50 hover:bg-white/70 border-white/30 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{focusMode.name}</div>
                      <div className="text-sm opacity-80 mt-1">{focusMode.description}</div>
                      <div className="text-xs mt-2 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(focusMode.duration)}
                      </div>
                    </button>
                  ))}
                </div>
                
                {mode === 'custom' && (
                  <div className="mt-4 flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Custom Duration:</label>
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
                      className="w-20 px-3 py-2 bg-white/70 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ambient Sounds */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Music className="w-5 h-5 mr-2 text-purple-600" />
                  Ambient Sounds
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ambientSounds.map((sound) => {
                    const IconComponent = sound.icon;
                    return (
                      <button
                        key={sound.id}
                        onClick={() => setSelectedSound(selectedSound === sound.id ? null : sound.id)}
                        className={`p-4 rounded-xl border transition-all duration-200 text-center ${
                          selectedSound === sound.id
                            ? `bg-gradient-to-r ${sound.color} text-white border-opacity-30 shadow-lg`
                            : 'bg-white/50 hover:bg-white/70 border-white/30 text-gray-700'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{sound.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            
            {/* Today's Progress */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Today's Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sessions</span>
                    <span className="text-xl font-bold text-blue-600">{todayStats.sessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Focus Time</span>
                    <span className="text-xl font-bold text-green-600">{formatDuration(todayStats.focusTime)}</span>
                  </div>
                  
                  {/* Daily Goal Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Daily Goal</span>
                      <span className="text-sm text-gray-600">
                        {Math.round((todayStats.focusTime / stats.dailyGoal) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((todayStats.focusTime / stats.dailyGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  All Time Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">Total Sessions</span>
                    </div>
                    <span className="font-bold text-gray-800">{stats.totalSessions}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">Total Time</span>
                    </div>
                    <span className="font-bold text-gray-800">{formatDuration(stats.totalFocusTime)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">Longest Session</span>
                    </div>
                    <span className="font-bold text-gray-800">{formatDuration(stats.longestSession)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-600 text-sm">Current Streak</span>
                    </div>
                    <span className="font-bold text-orange-600">{stats.currentStreak}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600 text-sm">Best Streak</span>
                    </div>
                    <span className="font-bold text-yellow-600">{stats.bestStreak}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/30 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Quick Focus
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setMode('pomodoro');
                      setTimeLeft(25 * 60);
                      setSessionType('focus');
                      handleStart();
                    }}
                    className="w-full p-3 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Timer className="w-4 h-4" />
                    <span>Quick Pomodoro</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setMode('deep-work');
                      setTimeLeft(90 * 60);
                      setSessionType('focus');
                      handleStart();
                    }}
                    className="w-full p-3 bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Deep Work</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSessionType('break');
                      setTimeLeft(15 * 60);
                      handleStart();
                    }}
                    className="w-full p-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>15min Break</span>
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
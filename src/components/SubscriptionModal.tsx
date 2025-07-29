import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, CreditCard, Plus, Search, DollarSign, Calendar, Edit3, Bell, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  billingDate: number; // Day of month (1-31)
  nextBillingDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  notes?: string;
}

interface SubscriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const initialSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Claude',
    price: 20,
    billingCycle: 'monthly',
    billingDate: 4,
    nextBillingDate: new Date(2024, 11, 4),
    status: 'active',
    notes: 'AI assistant for productivity'
  },
  {
    id: '2',
    name: 'GPT',
    price: 20,
    billingCycle: 'monthly',
    billingDate: 19,
    nextBillingDate: new Date(2024, 11, 19),
    status: 'active',
    notes: 'OpenAI language model'
  },
  {
    id: '3',
    name: 'Genspark',
    price: 25,
    billingCycle: 'monthly',
    billingDate: 20,
    nextBillingDate: new Date(2024, 11, 20),
    status: 'active',
    notes: 'Code generation tool'
  },
  {
    id: '4',
    name: 'Higgsfield',
    price: 29,
    billingCycle: 'monthly',
    billingDate: 30,
    nextBillingDate: new Date(2024, 11, 30),
    status: 'active',
    notes: 'AI video generation'
  },
  {
    id: '5',
    name: 'Kling AI',
    price: 32,
    billingCycle: 'monthly',
    billingDate: 13,
    nextBillingDate: new Date(2024, 11, 13),
    status: 'active',
    notes: 'AI video creation'
  },
  {
    id: '6',
    name: 'Fitkit',
    price: 60,
    billingCycle: 'monthly',
    billingDate: 9,
    nextBillingDate: new Date(2024, 11, 9),
    status: 'active',
    notes: 'Fitness tracking'
  },
  {
    id: '7',
    name: 'Cursor',
    price: 20,
    billingCycle: 'monthly',
    billingDate: 28,
    nextBillingDate: new Date(2024, 11, 28),
    status: 'active',
    notes: 'AI code editor'
  },
  {
    id: '8',
    name: '11 Labs',
    price: 5,
    billingCycle: 'monthly',
    billingDate: 25,
    nextBillingDate: new Date(2024, 11, 25),
    status: 'active',
    notes: 'AI voice generation'
  },
  {
    id: '9',
    name: 'Framer',
    price: 40,
    billingCycle: 'monthly',
    billingDate: 3,
    nextBillingDate: new Date(2024, 11, 3),
    status: 'cancelled',
    notes: 'Web design tool - will cancel after this month'
  }
];

export function SubscriptionModal({ isVisible, onClose }: SubscriptionModalProps) {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', initialSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 520, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubscription, setNewSubscription] = useState<Partial<Subscription>>({
    name: '',
    price: 0,
    billingCycle: 'monthly',
    billingDate: 1,
    status: 'active',
    notes: ''
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 500, height: 680 });
  const [isResizing, setIsResizing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    const rect = modalRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleCollapse = () => {
    if (!isCollapsed) {
      setLastPosition(position);
      setPosition({ x: window.innerWidth - 80, y: 20 });
      setIsCollapsed(true);
    } else {
      setPosition(lastPosition);
      setIsCollapsed(false);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const clearAllSubscriptions = () => {
    setSubscriptions([]);
  };

  const resetToInitialData = () => {
    // Clear localStorage and reset to initial data
    localStorage.removeItem('subscriptions');
    setSubscriptions(initialSubscriptions);
  };

  useEffect(() => {
    if (!isVisible) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
      
      if (isResizing) {
        const rect = modalRef.current?.getBoundingClientRect();
        if (rect) {
          const newWidth = Math.max(400, Math.min(600, e.clientX - rect.left));
          const newHeight = Math.max(500, Math.min(800, e.clientY - rect.top));
          setSize({ width: newWidth, height: newHeight });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, size]);

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const totalMonthlySpend = activeSubscriptions.reduce((total, sub) => {
    const monthlyPrice = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
    return total + monthlyPrice;
  }, 0);
  const totalYearlySpend = totalMonthlySpend * 12;

  // Get upcoming charges in next 30 days
  const upcomingCharges = activeSubscriptions
    .filter(sub => {
      const daysUntilBilling = Math.ceil((sub.nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilBilling <= 30 && daysUntilBilling >= 0;
    })
    .sort((a, b) => a.nextBillingDate.getTime() - b.nextBillingDate.getTime());

  const upcomingTotal = upcomingCharges.reduce((total, sub) => total + sub.price, 0);

  const calculateNextBillingDate = (billingDate: number, billingCycle: 'monthly' | 'yearly') => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let nextBilling = new Date(currentYear, currentMonth, billingDate);
    
    // If the billing date has passed this month, move to next month
    if (nextBilling <= today) {
      if (billingCycle === 'monthly') {
        nextBilling = new Date(currentYear, currentMonth + 1, billingDate);
      } else {
        nextBilling = new Date(currentYear + 1, currentMonth, billingDate);
      }
    }
    
    return nextBilling;
  };

  const handleAddSubscription = () => {
    if (newSubscription.name && newSubscription.price && newSubscription.billingDate) {
      const nextBillingDate = calculateNextBillingDate(
        newSubscription.billingDate,
        newSubscription.billingCycle || 'monthly'
      );
      
      const subscription: Subscription = {
        id: crypto.randomUUID(),
        name: newSubscription.name,
        price: newSubscription.price,
        billingCycle: newSubscription.billingCycle || 'monthly',
        billingDate: newSubscription.billingDate,
        nextBillingDate,
        status: 'active',
        notes: newSubscription.notes || ''
      };
      
      setSubscriptions([...subscriptions, subscription]);
      setNewSubscription({
        name: '',
        price: 0,
        billingCycle: 'monthly',
        billingDate: 1,
        status: 'active',
        notes: ''
      });
      setShowAddForm(false);
    }
  };

  const handleEditSubscription = (id: string) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (subscription) {
      setNewSubscription(subscription);
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdateSubscription = () => {
    if (editingId && newSubscription.name && newSubscription.price && newSubscription.billingDate) {
      const nextBillingDate = calculateNextBillingDate(
        newSubscription.billingDate,
        newSubscription.billingCycle || 'monthly'
      );
      
      setSubscriptions(subscriptions.map(sub =>
        sub.id === editingId ? {
          ...sub,
          name: newSubscription.name!,
          price: newSubscription.price!,
          billingCycle: newSubscription.billingCycle || 'monthly',
          billingDate: newSubscription.billingDate!,
          nextBillingDate,
          notes: newSubscription.notes || ''
        } : sub
      ));
      
      setNewSubscription({
        name: '',
        price: 0,
        billingCycle: 'monthly',
        billingDate: 1,
        status: 'active',
        notes: ''
      });
      setEditingId(null);
      setShowAddForm(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id ? { ...sub, status: newStatus } : sub
    ));
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil <= 7) return `${daysUntil} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };



  if (!isVisible) return null;

  return (
    <div
      ref={modalRef}
      className="fixed select-none z-50 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: isCollapsed ? 60 : size.width,
        height: isCollapsed ? 60 : size.height,
        cursor: isDragging ? 'grabbing' : 'default',
        background: isCollapsed 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.6),
          0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
        `
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px'
        }}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-white text-lg font-medium">Subscriptions</h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCollapse}
            className="w-6 h-6 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors flex items-center justify-center"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <Minus className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors flex items-center justify-center"
            title="Close"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col h-[calc(100%-64px)] p-5">
          {/* Stats Dashboard */}
          <div className="mb-5 p-4 rounded-2xl" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-xs text-white/60 font-medium mb-1">Monthly</div>
                <div className="text-2xl font-bold text-white">${totalMonthlySpend.toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60 font-medium mb-1">Yearly</div>
                <div className="text-2xl font-bold text-white">${totalYearlySpend.toFixed(0)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{activeSubscriptions.length} active subscriptions</span>
              <span>Next 30 days: ${upcomingTotal}</span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              />
            </div>
          </div>

          {/* Add/Edit Form */}
                      {showAddForm && (
              <div className="mb-4 p-4 rounded-2xl" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Service name"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="$0"
                    value={newSubscription.price || ''}
                    onChange={(e) => setNewSubscription({ ...newSubscription, price: Number(e.target.value) })}
                    className="px-3 py-2 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  />
                  <select
                    value={newSubscription.billingCycle}
                    onChange={(e) => setNewSubscription({ ...newSubscription, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                    className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <select
                    value={newSubscription.billingDate || ''}
                    onChange={(e) => setNewSubscription({ ...newSubscription, billingDate: Number(e.target.value) })}
                    className="px-3 py-2 rounded-lg text-white text-sm focus:outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day} style={{ background: '#1f2937', color: 'white' }}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of every month
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  value={newSubscription.notes}
                  onChange={(e) => setNewSubscription({ ...newSubscription, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none resize-none"
                  rows={2}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={editingId ? handleUpdateSubscription : handleAddSubscription}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)'
                    }}
                  >
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setNewSubscription({
                        name: '',
                        price: 0,
                        billingCycle: 'monthly',
                        billingDate: 1,
                        status: 'active',
                        notes: ''
                      });
                    }}
                    className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!showAddForm && (
            <div className="mb-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium text-white transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Add Subscription</span>
              </button>
            </div>
          )}

          {/* Subscriptions List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-white text-sm">{subscription.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-white/60 mb-2">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>${subscription.price}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(subscription.nextBillingDate)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Bell className="w-3 h-3" />
                          <span>{subscription.billingDate}{subscription.billingDate === 1 ? 'st' : subscription.billingDate === 2 ? 'nd' : subscription.billingDate === 3 ? 'rd' : 'th'}</span>
                        </span>
                      </div>
                      {subscription.notes && (
                        <p className="text-xs text-white/50 mb-2">{subscription.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditSubscription(subscription.id)}
                        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                        title="Edit"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="p-1.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(subscription.id, 
                          subscription.status === 'active' ? 'paused' : 'active')}
                        className="px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 text-white"
                        style={{
                          background: subscription.status === 'active' 
                            ? 'rgba(251, 191, 36, 0.2)' 
                            : 'rgba(34, 197, 94, 0.2)',
                          border: subscription.status === 'active' 
                            ? '1px solid rgba(251, 191, 36, 0.3)' 
                            : '1px solid rgba(34, 197, 94, 0.3)'
                        }}
                      >
                        {subscription.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
          style={{
            background: 'linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.3) 70%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
} 
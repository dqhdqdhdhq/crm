import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Plus, BarChart3, Table, 
  Eye, MoreHorizontal, Edit, Trash2, Building2,
  CheckCircle, AlertTriangle, DollarSign, X, Save,
  Calendar, User, Mail, Phone, Clock, Target,
  TrendingUp, Activity, FileText, Tag, MapPin,
  AlertCircle, Star, ArrowRight, Maximize2
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Deal interface for partner-specific deals
interface Deal {
  id: string;
  title: string;
  value: number;
  probability: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  clientId: string;
  clientName: string;
  clientEmail: string;
  expectedCloseDate: Date;
  partnerId?: string;
  partnerName?: string;
  description: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity?: Date;
  nextFollowUp?: Date;
  customFields?: Record<string, any>;
  health?: {
    score: number;
    velocity: number;
    engagement: number;
    risk: 'low' | 'medium' | 'high';
  };
  activities?: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'task';
    description: string;
    date: Date;
    userId: string;
  }>;
}

interface PartnerDealsProps {
  partnerId: string;
  partnerName: string;
}

type ViewMode = 'table' | 'pipeline';

const dealStageColors = {
  lead: 'bg-gray-100 text-gray-800',
  qualified: 'bg-blue-100 text-blue-800',
  proposal: 'bg-yellow-100 text-yellow-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
};

const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

// Sample deals data for testing
const sampleDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software License - Q4 Major Deal',
    value: 750000,
    probability: 85,
    stage: 'negotiation',
    clientId: 'client-1',
    clientName: 'Acme Corporation',
    clientEmail: 'john.smith@acme.com',
    expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    partnerId: '1',
    partnerName: 'TechFlow Solutions',
    description: 'Large enterprise software licensing deal with implementation services, training, and 3-year support contract',
    tags: ['enterprise', 'software', 'high-value', 'strategic'],
    priority: 'urgent',
    source: 'Partner Referral',
    assignedTo: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    customFields: {
      'Implementation Timeline': '6 months',
      'Decision Committee Size': 8,
      'Budget Approved': true,
      'Technical Requirements Met': 95
    },
    health: {
      score: 85,
      velocity: 25,
      engagement: 90,
      risk: 'low'
    },
    activities: [
      {
        id: 'act-1',
        type: 'meeting',
        description: 'Executive stakeholder meeting - very positive reception',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        userId: 'user-1'
      }
    ]
  },
  {
    id: '2',
    title: 'Healthcare Platform Integration',
    value: 450000,
    probability: 70,
    stage: 'proposal',
    clientId: 'client-2',
    clientName: 'MedTech Solutions Inc.',
    clientEmail: 'sarah.williams@medtech.com',
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    partnerId: '2',
    partnerName: 'Global Innovations',
    description: 'Healthcare platform integration with custom modules for patient management and billing automation',
    tags: ['healthcare', 'integration', 'platform', 'compliance'],
    priority: 'high',
    source: 'Inbound Marketing',
    assignedTo: 'Michael Chen',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    customFields: {
      'HIPAA Compliance': 'Required',
      'Integration Complexity': 'High',
      'Pilot Program': 'Approved'
    },
    health: {
      score: 72,
      velocity: 35,
      engagement: 75,
      risk: 'medium'
    },
    activities: [
      {
        id: 'act-2',
        type: 'call',
        description: 'Technical deep-dive with IT team',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        userId: 'user-2'
      }
    ]
  },
  {
    id: '3',
    title: 'SaaS Platform Expansion',
    value: 280000,
    probability: 95,
    stage: 'qualified',
    clientId: 'client-3',
    clientName: 'StartupX Technologies',
    clientEmail: 'mike.davis@startupx.com',
    expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    partnerId: '1',
    partnerName: 'TechFlow Solutions',
    description: 'Multi-year SaaS platform expansion with additional modules and increased user capacity',
    tags: ['saas', 'expansion', 'multi-year', 'growth'],
    priority: 'medium',
    source: 'Existing Customer',
    assignedTo: 'Emily Rodriguez',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    customFields: {
      'Current Users': 150,
      'Target Users': 500,
      'Contract Length': '24 months'
    },
    health: {
      score: 95,
      velocity: 45,
      engagement: 95,
      risk: 'low'
    },
    activities: [
      {
        id: 'act-3',
        type: 'email',
        description: 'Contract terms discussion and pricing confirmation',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        userId: 'user-3'
      }
    ]
  }
];

export function PartnerDeals({ partnerId, partnerName }: PartnerDealsProps) {
  const [deals, setDeals] = useLocalStorage<Deal[]>('partner-deals', sampleDeals);
  const [currentView, setCurrentView] = useState<ViewMode>('table');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullPage, setIsFullPage] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Filter deals for this specific partner
  const partnerDeals = deals.filter(deal => deal.partnerId === partnerId);

  const handleDealSelect = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditingDeal(deal);
    setShowDetailModal(true);
    setIsEditing(false);
  };

  const handleEditDeal = () => {
    setIsEditing(true);
  };

  const handleSaveDeal = () => {
    if (editingDeal) {
      setDeals(deals.map(deal => 
        deal.id === editingDeal.id ? { ...editingDeal, updatedAt: new Date() } : deal
      ));
      setSelectedDeal(editingDeal);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingDeal(selectedDeal);
    setIsEditing(false);
  };

  const handleFullPageToggle = () => {
    setIsFullPage(!isFullPage);
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStage = destination.droppableId as Deal['stage'];
    
    setDeals(deals.map(deal => 
      deal.id === draggableId 
        ? { ...deal, stage: newStage, updatedAt: new Date() }
        : deal
    ));
  };

  const getDealsByStage = () => {
    const dealsByStage: Record<Deal['stage'], Deal[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: []
    };

    partnerDeals.forEach(deal => {
      dealsByStage[deal.stage].push(deal);
    });

    return dealsByStage;
  };

  const getStats = () => {
    const totalValue = partnerDeals.reduce((sum, deal) => sum + deal.value, 0);
    const weightedValue = partnerDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
    const wonDeals = partnerDeals.filter(deal => deal.stage === 'won');
    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
    const avgDealSize = partnerDeals.length > 0 ? totalValue / partnerDeals.length : 0;
    
    return { 
      totalValue, 
      weightedValue, 
      wonValue, 
      totalDeals: partnerDeals.length,
      avgDealSize
    };
  };

  const renderTableView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-200/30">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Deal</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Client</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Value</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Stage</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Health</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Close Date</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/30">
            {partnerDeals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                    <div className="text-sm text-gray-500">{deal.probability}% • {deal.priority}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{deal.clientName}</div>
                    <div className="text-sm text-gray-500">{deal.clientEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    ${deal.value.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-lg ${dealStageColors[deal.stage]}`}>
                    {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {deal.health && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        deal.health.score >= 80 ? 'bg-green-500' : 
                        deal.health.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-600">{deal.health.score}%</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {deal.expectedCloseDate.toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDealSelect(deal)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedDeal(deal);
                        setEditingDeal(deal);
                        setShowDetailModal(true);
                        setIsEditing(true);
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPipelineView = () => {
    const dealsByStage = getDealsByStage();

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 min-w-max pb-4">
            {stageOrder.map((stage) => (
              <div key={stage} className="bg-white/95 backdrop-blur-2xl border border-gray-200/30 rounded-2xl shadow-lg overflow-hidden w-72 flex-shrink-0">
                <div className="p-4 border-b border-gray-200/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 capitalize">{stage}</h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${dealStageColors[stage as Deal['stage']]} shadow-sm`}>
                      {dealsByStage[stage as Deal['stage']].length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 space-y-2 min-h-[300px] max-h-[400px] overflow-y-auto transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {dealsByStage[stage as Deal['stage']].map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                                snapshot.isDragging ? 'shadow-lg scale-105 rotate-3' : ''
                              }`}
                              onClick={(e) => {
                                if (!snapshot.isDragging) {
                                  handleDealSelect(deal);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
                                  {deal.title}
                                </h4>
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-lg font-bold text-green-600">
                                  ${deal.value.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600">{deal.clientName}</div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>{deal.probability}% • {deal.priority}</span>
                                  <span>{deal.expectedCloseDate.toLocaleDateString()}</span>
                                </div>
                                {deal.health && (
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      deal.health.score >= 80 ? 'bg-green-500' : 
                                      deal.health.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                                    <span className="text-xs text-gray-600">Health: {deal.health.score}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    );
  };

  const stats = getStats();

  if (partnerDeals.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Deals Yet</h3>
        <p className="text-gray-600 mb-6">Start tracking deals for {partnerName}</p>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold">
          <Plus className="w-4 h-4 inline mr-2" />
          Add First Deal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards - More Compact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-xl p-3 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Total Pipeline</p>
              <p className="text-xl font-black text-gray-900">${(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-xl p-3 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Weighted Value</p>
              <p className="text-xl font-black text-green-600">${(stats.weightedValue / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-xl p-3 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Won Deals</p>
              <p className="text-xl font-black text-purple-600">${(stats.wonValue / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-xl p-3 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 mb-1">Total Deals</p>
              <p className="text-xl font-black text-orange-600">{stats.totalDeals}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle - More Compact */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Deals Pipeline</h3>
        <div className="flex items-center bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setCurrentView('table')}
            className={`p-2 rounded-md transition-all duration-300 ${
              currentView === 'table' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentView('pipeline')}
            className={`p-2 rounded-md transition-all duration-300 ${
              currentView === 'pipeline' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content - More Compact */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200/30 rounded-xl p-4 shadow-lg">
        {currentView === 'table' ? renderTableView() : renderPipelineView()}
      </div>

      {/* Enhanced Deal Detail Modal */}
      {selectedDeal && editingDeal && showDetailModal && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 ${isFullPage ? '' : 'flex items-center justify-center p-4'}`}>
          <div className={`bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden ${
            isFullPage 
              ? 'w-full h-full' 
              : 'rounded-2xl w-full max-w-6xl max-h-[95vh]'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{editingDeal.title}</h2>
                  <p className="text-sm text-gray-600">{editingDeal.clientName} • {editingDeal.partnerName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFullPageToggle}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-colors"
                  title={isFullPage ? "Exit full screen" : "Full screen"}
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                {!isEditing ? (
                  <button
                    onClick={handleEditDeal}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDeal}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ height: isFullPage ? 'calc(100vh - 96px)' : 'calc(95vh - 96px)' }}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Key Metrics */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Key Metrics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editingDeal.value}
                                onChange={(e) => setEditingDeal({...editingDeal, value: parseInt(e.target.value) || 0})}
                                className="w-full text-center text-3xl font-bold text-green-600 bg-transparent border-b-2 border-green-300 focus:border-green-500 outline-none"
                              />
                            ) : (
                              `$${editingDeal.value.toLocaleString()}`
                            )}
                          </div>
                          <div className="text-sm text-gray-600">Deal Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editingDeal.probability}
                                onChange={(e) => setEditingDeal({...editingDeal, probability: parseInt(e.target.value) || 0})}
                                className="w-full text-center text-3xl font-bold text-blue-600 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none"
                              />
                            ) : (
                              `${editingDeal.probability}%`
                            )}
                          </div>
                          <div className="text-sm text-gray-600">Probability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            ${((editingDeal.value * editingDeal.probability) / 100).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Weighted Value</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-600">
                            {Math.ceil((editingDeal.expectedCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                          </div>
                          <div className="text-sm text-gray-600">Days to Close</div>
                        </div>
                      </div>
                    </div>

                    {/* Deal Information */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Deal Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingDeal.title}
                              onChange={(e) => setEditingDeal({...editingDeal, title: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          ) : (
                            <div className="text-lg font-medium text-gray-900 bg-gray-50 rounded-xl p-3">
                              {editingDeal.title}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          {isEditing ? (
                            <textarea
                              rows={4}
                              value={editingDeal.description}
                              onChange={(e) => setEditingDeal({...editingDeal, description: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            />
                          ) : (
                            <div className="text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">
                              {editingDeal.description}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                            {isEditing ? (
                              <select
                                value={editingDeal.priority}
                                onChange={(e) => setEditingDeal({...editingDeal, priority: e.target.value as Deal['priority']})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-4 py-2 text-sm font-medium rounded-xl ${
                                editingDeal.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                editingDeal.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                editingDeal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {editingDeal.priority.charAt(0).toUpperCase() + editingDeal.priority.slice(1)}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Stage</label>
                            {isEditing ? (
                              <select
                                value={editingDeal.stage}
                                onChange={(e) => setEditingDeal({...editingDeal, stage: e.target.value as Deal['stage']})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              >
                                <option value="lead">Lead</option>
                                <option value="qualified">Qualified</option>
                                <option value="proposal">Proposal</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-4 py-2 text-sm font-medium rounded-xl ${dealStageColors[editingDeal.stage]}`}>
                                {editingDeal.stage.charAt(0).toUpperCase() + editingDeal.stage.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Close Date</label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editingDeal.expectedCloseDate.toISOString().split('T')[0]}
                              onChange={(e) => setEditingDeal({...editingDeal, expectedCloseDate: new Date(e.target.value)})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3">
                              <Calendar className="w-5 h-5 text-gray-500" />
                              <span className="text-lg text-gray-900">
                                {editingDeal.expectedCloseDate.toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Custom Fields */}
                    {editingDeal.customFields && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-purple-600" />
                          Custom Fields
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(editingDeal.customFields).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 rounded-xl p-4">
                              <div className="text-sm font-semibold text-gray-700 mb-1">{key}</div>
                              <div className="text-lg text-gray-900">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right Column - Client & Health */}
                  <div className="space-y-6">
                    
                    {/* Client Information */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Client Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                          <div className="font-bold text-gray-900 text-lg">{editingDeal.clientName}</div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{editingDeal.clientEmail}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Client ID:</span>
                            <span className="font-mono text-gray-900">{editingDeal.clientId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Source:</span>
                            <span className="text-gray-900">{editingDeal.source}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Assigned To:</span>
                            <span className="text-gray-900">{editingDeal.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Deal Health */}
                    {editingDeal.health && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-green-600" />
                          Deal Health
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Overall Score</span>
                              <span className="text-2xl font-bold text-green-600">{editingDeal.health.score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${editingDeal.health.score}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-blue-50 rounded-xl">
                              <div className="text-xl font-bold text-blue-600">{editingDeal.health.velocity}</div>
                              <div className="text-xs text-gray-600">Velocity</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-xl">
                              <div className="text-xl font-bold text-purple-600">{editingDeal.health.engagement}%</div>
                              <div className="text-xs text-gray-600">Engagement</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
                            <AlertCircle className={`w-5 h-5 mr-2 ${
                              editingDeal.health.risk === 'low' ? 'text-green-500' :
                              editingDeal.health.risk === 'medium' ? 'text-yellow-500' :
                              'text-red-500'
                            }`} />
                            <span className="font-semibold text-gray-700">
                              {editingDeal.health.risk.charAt(0).toUpperCase() + editingDeal.health.risk.slice(1)} Risk
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-indigo-600" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {editingDeal.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-orange-600" />
                        Timeline
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">{editingDeal.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="text-gray-900">{editingDeal.updatedAt.toLocaleDateString()}</span>
                        </div>
                        {editingDeal.lastActivity && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Activity:</span>
                            <span className="text-gray-900">{editingDeal.lastActivity.toLocaleDateString()}</span>
                          </div>
                        )}
                        {editingDeal.nextFollowUp && (
                          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                            <span className="text-yellow-700 font-medium">Next Follow-up:</span>
                            <span className="text-yellow-800 font-semibold">{editingDeal.nextFollowUp.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Activities */}
                    {editingDeal.activities && editingDeal.activities.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <Activity className="w-5 h-5 mr-2 text-green-600" />
                          Recent Activities
                        </h3>
                        <div className="space-y-3">
                          {editingDeal.activities.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                                  activity.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                                  activity.type === 'call' ? 'bg-green-100 text-green-700' :
                                  activity.type === 'email' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {activity.type}
                                </span>
                                <span className="text-xs text-gray-500">{activity.date.toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-700">{activity.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
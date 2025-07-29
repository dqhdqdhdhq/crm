import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { 
  Plus, Search, Users, DollarSign, 
  Building, Mail, Phone, Calendar, 
  TrendingUp, Award, Handshake,
  ChevronRight, Heart, 
  ArrowLeft, Edit, Save, X,
  Star, Activity, BarChart3,
  Globe, CheckCircle,
  Target, FileText,
  Zap, Shield, MapPin,
  MessageSquare, Video, Download,
  Upload, Copy, ExternalLink,
  Trash2, Share2,
  MoreVertical,
  Timer, UserCheck,
  CheckSquare
} from 'lucide-react';
import { PartnerDeals } from './PartnerDeals';

interface Partner {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive' | 'trial' | 'paused' | 'terminated';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  industry: string;
  website?: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  partnershipType: 'revenue-share' | 'referral' | 'affiliate' | 'reseller' | 'technology' | 'strategic' | 'white-label';
  leadGeneration?: 'partner' | 'us' | 'shared' | 'both';
  supportLevel?: 'minimal' | 'standard' | 'priority' | 'dedicated' | 'white-glove';
  dealStructure: {
    type: 'percentage' | 'fixed' | 'tiered' | 'hybrid';
    value: number;
    currency: string;
    minimumCommitment?: number;
    paymentTerms: string;
    contractLength: number;
    autoRenew: boolean;
  };
  revenue: number;
  monthlyRecurring: number;
  growth: number;
  totalValue: number;
  commission: number;
  joinDate: Date;
  contractStart: Date;
  contractEnd: Date;
  lastContact: Date;
  nextReview: Date;
  lastActivity: Date;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    linkedin?: string;
    timezone: string;
  };
  metrics: {
    deals: number;
    conversion: number;
    satisfaction: number;
    responseTime: number;
    supportTickets: number;
    upsells: number;
    churnRate: number;
    nps: number;
  };
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: {
    paymentIssues: boolean;
    communicationGap: boolean;
    performanceDecline: boolean;
    contractExpiring: boolean;
    competitorThreat: boolean;
  };
  activityLog: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'deal' | 'payment' | 'support' | 'other';
    description: string;
    date: Date;
    outcome?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: 'contract' | 'nda' | 'sow' | 'invoice' | 'report' | 'other';
    url?: string;
    uploadDate: Date;
    expiryDate?: Date;
  }>;
  goals: Array<{
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    unit: string;
    deadline: Date;
    priority: 'low' | 'medium' | 'high';
    status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  }>;
  marketingMaterials: Array<{
    id: string;
    name: string;
    type: 'brochure' | 'presentation' | 'case-study' | 'demo' | 'video';
    url: string;
    lastUpdated: Date;
  }>;
  integration: {
    status: 'not-started' | 'in-progress' | 'completed' | 'issues';
    apiAccess: boolean;
    sandboxAccess: boolean;
    productionAccess: boolean;
    technicalContact?: string;
    lastSync?: Date;
  };
  territory: string[];
  targetMarkets: string[];
  exclusivity: boolean;
  tags: string[];
  description: string;
  notes: string;
  isBookmarked: boolean;
  createdBy: string;
  lastModified: Date;
}

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    status: 'active',
    tier: 'platinum',
    industry: 'Technology',
    website: 'https://techflow.com',
    companySize: 'enterprise',
    partnershipType: 'revenue-share',
    leadGeneration: 'shared',
    supportLevel: 'standard',
    dealStructure: {
      type: 'percentage',
      value: 30,
      currency: 'USD',
      minimumCommitment: 50000,
      paymentTerms: 'Net 30',
      contractLength: 24,
      autoRenew: true
    },
    revenue: 250000,
    monthlyRecurring: 25000,
    growth: 15.5,
    totalValue: 450000,
    commission: 75000,
    joinDate: new Date('2024-01-15'),
    contractStart: new Date('2024-01-15'),
    contractEnd: new Date('2026-01-15'),
    lastContact: new Date('2024-12-20'),
    nextReview: new Date('2025-01-15'),
    lastActivity: new Date('2024-12-18'),
    primaryContact: {
      name: 'Sarah Johnson',
      role: 'Partnership Director',
      email: 'sarah@techflow.com',
      phone: '+1 (555) 123-4567',
      linkedin: 'linkedin.com/in/sarahjohnson',
      timezone: 'EST'
    },
    metrics: {
      deals: 42,
      conversion: 78,
      satisfaction: 9.2,
      responseTime: 2.5,
      supportTickets: 8,
      upsells: 12,
      churnRate: 5,
      nps: 85
    },
    healthScore: 92,
    riskLevel: 'low',
    flags: {
      paymentIssues: false,
      communicationGap: false,
      performanceDecline: false,
      contractExpiring: false,
      competitorThreat: false
    },
    activityLog: [
      {
        id: 'a1',
        type: 'meeting',
        description: 'Q4 business review and 2025 planning',
        date: new Date('2024-12-20'),
        outcome: 'Positive - increased commitment for 2025'
      }
    ],
    documents: [
      {
        id: 'd1',
        name: 'Partnership Agreement 2024-2026',
        type: 'contract',
        uploadDate: new Date('2024-01-15'),
        expiryDate: new Date('2026-01-15')
      }
    ],
    goals: [
      {
        id: 'g1',
        title: 'Q1 2025 Revenue Target',
        description: 'Reach $30k monthly recurring revenue',
        target: 30000,
        current: 25000,
        unit: 'USD',
        deadline: new Date('2025-03-31'),
        priority: 'high',
        status: 'in-progress'
      }
    ],
    marketingMaterials: [
      {
        id: 'm1',
        name: 'TechFlow Partnership Deck',
        type: 'presentation',
        url: '/materials/techflow-deck.pdf',
        lastUpdated: new Date('2024-11-15')
      }
    ],
    integration: {
      status: 'completed',
      apiAccess: true,
      sandboxAccess: true,
      productionAccess: true,
      technicalContact: 'mike@techflow.com',
      lastSync: new Date('2024-12-20')
    },
    territory: ['North America', 'Europe'],
    targetMarkets: ['Enterprise', 'Mid-Market'],
    exclusivity: false,
    tags: ['High Value', 'Strategic', 'Enterprise'],
    description: 'Leading technology solutions provider specializing in enterprise software and cloud infrastructure.',
    notes: 'Excellent partner with strong performance. Looking to expand into new verticals in 2025.',
    isBookmarked: true,
    createdBy: 'admin',
    lastModified: new Date('2024-12-20')
  },
  {
    id: '2',
    name: 'Global Innovations',
    status: 'active',
    tier: 'gold',
    industry: 'Healthcare',
    website: 'https://global-innovations.com',
    companySize: 'large',
    partnershipType: 'technology',
    dealStructure: {
      type: 'tiered',
      value: 25,
      currency: 'USD',
      minimumCommitment: 25000,
      paymentTerms: 'Net 15',
      contractLength: 36,
      autoRenew: true
    },
    revenue: 180000,
    monthlyRecurring: 18000,
    growth: 12.3,
    totalValue: 350000,
    commission: 45000,
    joinDate: new Date('2024-03-10'),
    contractStart: new Date('2024-03-10'),
    contractEnd: new Date('2027-03-10'),
    lastContact: new Date('2024-12-18'),
    nextReview: new Date('2025-03-10'),
    lastActivity: new Date('2024-12-16'),
    primaryContact: {
      name: 'Michael Chen',
      role: 'VP of Partnerships',
      email: 'michael@global-innovations.com',
      phone: '+1 (555) 987-6543',
      linkedin: 'linkedin.com/in/michaelchen',
      timezone: 'PST'
    },
    metrics: {
      deals: 28,
      conversion: 82,
      satisfaction: 8.9,
      responseTime: 3.2,
      supportTickets: 12,
      upsells: 8,
      churnRate: 3,
      nps: 78
    },
    healthScore: 88,
    riskLevel: 'low',
    flags: {
      paymentIssues: false,
      communicationGap: false,
      performanceDecline: false,
      contractExpiring: false,
      competitorThreat: false
    },
    activityLog: [
      {
        id: 'a3',
        type: 'email',
        description: 'Quarterly business review scheduled',
        date: new Date('2024-12-18'),
        outcome: 'Meeting set for Q1 2025'
      }
    ],
    documents: [
      {
        id: 'd3',
        name: 'Technology Partnership Agreement',
        type: 'contract',
        uploadDate: new Date('2024-03-10'),
        expiryDate: new Date('2027-03-10')
      }
    ],
    goals: [
      {
        id: 'g2',
        title: 'Expand Healthcare Markets',
        description: 'Target 3 new healthcare verticals',
        target: 3,
        current: 1,
        unit: 'verticals',
        deadline: new Date('2025-06-30'),
        priority: 'medium',
        status: 'in-progress'
      }
    ],
    marketingMaterials: [
      {
        id: 'm2',
        name: 'Healthcare Solutions Brochure',
        type: 'brochure',
        url: '/materials/healthcare-brochure.pdf',
        lastUpdated: new Date('2024-10-15')
      }
    ],
    integration: {
      status: 'in-progress',
      apiAccess: true,
      sandboxAccess: true,
      productionAccess: false,
      technicalContact: 'tech@global-innovations.com',
      lastSync: new Date('2024-12-15')
    },
    territory: ['North America', 'Asia Pacific'],
    targetMarkets: ['Healthcare', 'Telemedicine'],
    exclusivity: false,
    tags: ['Healthcare', 'Growth', 'Innovation'],
    description: 'Innovative healthcare technology company focused on digital transformation and patient care solutions.',
    notes: 'Strong technology partner with excellent integration capabilities.',
    isBookmarked: false,
    createdBy: 'admin',
    lastModified: new Date('2024-12-18')
  }
];

const tierColors = {
  platinum: 'from-slate-400 to-slate-600',
  gold: 'from-yellow-400 to-amber-500',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-orange-400 to-red-500'
};

const statusColors = {
  active: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  inactive: 'bg-gray-50 text-gray-700',
  trial: 'bg-blue-50 text-blue-700',
  paused: 'bg-orange-50 text-orange-700',
  terminated: 'bg-red-50 text-red-700'
};

export function PartnersPage({ onNavigate }: { onNavigate?: (section: string) => void }) {
  const [partners, setPartners] = useLocalStorage<Partner[]>('partners', mockPartners);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [selectedTier, setSelectedTier] = useState<'all' | 'platinum' | 'gold' | 'silver' | 'bronze'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'growth' | 'joinDate'>('revenue');

  // Recovery function to restore lost partners from tasks data
  const recoverPartnersFromTasks = () => {
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const partnersSimple = JSON.parse(localStorage.getItem('partners-simple') || '[]');
      
      // Find partners mentioned in tasks that don't exist in current partners
      const existingPartnerIds = partners.map(p => p.id);
      const missingPartners: string[] = [];
      
      partnersSimple.forEach((simplePartner: { id: string; name: string }) => {
        if (!existingPartnerIds.includes(simplePartner.id)) {
          const partnerTasks = tasks.filter((task: any) => task.partnerId === simplePartner.id);
          
          if (partnerTasks.length > 0) {
            missingPartners.push(`${simplePartner.name} (${partnerTasks.length} tasks)`);
          }
        }
      });
      
      if (missingPartners.length > 0) {
        alert(`Found missing partners with tasks:\n${missingPartners.join('\n')}\n\nTo recover them, please manually add these partners back. Their tasks are still saved and will be linked automatically.`);
      } else {
        alert('No missing partners found to recover');
      }
    } catch (error) {
      console.error('Error recovering partners:', error);
      alert('Error recovering partners');
    }
  };
  const [currentView, setCurrentView] = useState<'dashboard' | 'details' | 'edit' | 'add'>('dashboard');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  
  // Sync simplified partner list for task linking
  const [, setPartnersSimple] = useState<{ id: string; name: string }[]>([]);
  
  // Update simplified partners list whenever partners change
  React.useEffect(() => {
    const simplePartners = partners.map(p => ({ id: p.id, name: p.name }));
    setPartnersSimple(simplePartners);
    localStorage.setItem('partners-simple', JSON.stringify(simplePartners));
  }, [partners, setPartnersSimple]);
  
  // Get tasks linked to partners
  const getPartnerTasks = (partnerId: string) => {
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      return tasks.filter((task: any) => task.partnerId === partnerId);
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  };

  // Form state - moved to top level to fix React hooks violation
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    status: 'active',
    tier: 'bronze',
    industry: '',
    website: '',
    companySize: 'medium',
    partnershipType: 'revenue-share',
    leadGeneration: 'shared',
    supportLevel: 'standard',
    dealStructure: {
      type: 'percentage',
      value: 10,
      currency: 'USD',
      minimumCommitment: 0,
      paymentTerms: 'Net 30',
      contractLength: 12,
      autoRenew: false
    },
    revenue: 0,
    monthlyRecurring: 0,
    growth: 0,
    totalValue: 0,
    commission: 0,
    joinDate: new Date(),
    contractStart: new Date(),
    contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    lastContact: new Date(),
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(),
    primaryContact: {
      name: '',
      role: '',
      email: '',
      phone: '',
      linkedin: '',
      timezone: 'UTC'
    },
    metrics: {
      deals: 0,
      conversion: 0,
      satisfaction: 0,
      responseTime: 0,
      supportTickets: 0,
      upsells: 0,
      churnRate: 0,
      nps: 0
    },
    healthScore: 85,
    riskLevel: 'low',
    flags: {
      paymentIssues: false,
      communicationGap: false,
      performanceDecline: false,
      contractExpiring: false,
      competitorThreat: false
    },
    activityLog: [],
    documents: [],
    goals: [],
    marketingMaterials: [],
    integration: {
      status: 'not-started',
      apiAccess: false,
      sandboxAccess: false,
      productionAccess: false,
      technicalContact: '',
      lastSync: undefined
    },
    territory: [],
    targetMarkets: [],
    exclusivity: false,
    tags: [],
    description: '',
    notes: '',
    isBookmarked: false,
    createdBy: 'current-user',
    lastModified: new Date()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.primaryContact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus;
    const matchesTier = selectedTier === 'all' || partner.tier === selectedTier;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const sortedPartners = [...filteredPartners].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'revenue':
        return b.revenue - a.revenue;
      case 'growth':
        return b.growth - a.growth;
      case 'joinDate':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      default:
        return 0;
    }
  });

  const getTotalRevenue = () => partners.reduce((sum, partner) => sum + partner.revenue, 0);
  const getAverageGrowth = () => partners.reduce((sum, partner) => sum + partner.growth, 0) / partners.length;
  const getActivePartnersCount = () => partners.filter(partner => partner.status === 'active').length;

  const handleEditPartner = (partner: Partner) => {
    setEditPartner(partner);
    setFormData(partner); // Populate form with partner data
    setCurrentView('edit');
  };

  const handleAddPartner = () => {
    setEditPartner(null);
    // Reset form to default values
    setFormData({
      name: '',
      status: 'active',
      tier: 'bronze',
      industry: '',
      website: '',
      companySize: 'medium',
      partnershipType: 'revenue-share',
      leadGeneration: 'shared',
      supportLevel: 'standard',
      dealStructure: {
        type: 'percentage',
        value: 10,
        currency: 'USD',
        minimumCommitment: 0,
        paymentTerms: 'Net 30',
        contractLength: 12,
        autoRenew: false
      },
      revenue: 0,
      monthlyRecurring: 0,
      growth: 0,
      totalValue: 0,
      commission: 0,
      joinDate: new Date(),
      contractStart: new Date(),
      contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      lastContact: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(),
      primaryContact: {
        name: '',
        role: '',
        email: '',
        phone: '',
        linkedin: '',
        timezone: 'UTC'
      },
      metrics: {
        deals: 0,
        conversion: 0,
        satisfaction: 0,
        responseTime: 0,
        supportTickets: 0,
        upsells: 0,
        churnRate: 0,
        nps: 0
      },
      healthScore: 85,
      riskLevel: 'low',
      flags: {
        paymentIssues: false,
        communicationGap: false,
        performanceDecline: false,
        contractExpiring: false,
        competitorThreat: false
      },
      activityLog: [],
      documents: [],
      goals: [],
      marketingMaterials: [],
      integration: {
        status: 'not-started',
        apiAccess: false,
        sandboxAccess: false,
        productionAccess: false,
        technicalContact: '',
        lastSync: undefined
      },
      territory: [],
      targetMarkets: [],
      exclusivity: false,
      tags: [],
      description: '',
      notes: '',
      isBookmarked: false,
      createdBy: 'current-user',
      lastModified: new Date()
    });
    setCurrentView('add');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Partner name is required';
    if (!formData.industry?.trim()) newErrors.industry = 'Industry is required';
    if (!formData.primaryContact?.name?.trim()) newErrors.primaryContactName = 'Primary contact name is required';
    if (!formData.primaryContact?.email?.trim()) newErrors.primaryContactEmail = 'Primary contact email is required';
    if (!formData.primaryContact?.phone?.trim()) newErrors.primaryContactPhone = 'Primary contact phone is required';
    
    if (formData.primaryContact?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContact.email)) {
      newErrors.primaryContactEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const partnerData: Partner = {
        ...(formData as Partner),
        id: currentView === 'edit' ? editPartner!.id : crypto.randomUUID(),
        lastModified: new Date()
      };
      
      if (currentView === 'edit') {
        setPartners(prev => prev.map(p => p.id === partnerData.id ? partnerData : p));
      } else {
        setPartners(prev => [...prev, partnerData]);
      }
      
      setCurrentView('dashboard');
      setEditPartner(null);
      
      // Show success message
      alert(`Partner ${currentView === 'edit' ? 'updated' : 'created'} successfully!`);
      
    } catch (error) {
      alert('Error saving partner. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        const [parent, child] = keys;
        return {
          ...prev,
          [parent]: {
            ...((prev as any)[parent] || {}),
            [child]: value
          }
        };
      }
    });
  };

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="h-full bg-white">
        <div className="w-full px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-light text-gray-900 mb-2">Partners</h1>
                <p className="text-lg text-gray-500">Manage your strategic partnerships</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={recoverPartnersFromTasks}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
                  title="Recover lost partners from tasks"
                >
                  <Timer className="w-5 h-5" />
                  <span>Recover</span>
                </button>
                <button
                  onClick={handleAddPartner}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Partner</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Partners</span>
                </div>
                <div className="text-2xl font-light text-gray-900">{partners.length}</div>
                <div className="text-xs text-green-600 font-medium">{getActivePartnersCount()} active</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-xl">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Revenue</span>
                </div>
                <div className="text-2xl font-light text-gray-900">${getTotalRevenue().toLocaleString()}</div>
                <div className="text-xs text-green-600 font-medium">+{getAverageGrowth().toFixed(1)}% growth</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Growth</span>
                </div>
                <div className="text-2xl font-light text-gray-900">{getAverageGrowth().toFixed(1)}%</div>
                <div className="text-xs text-purple-600 font-medium">This quarter</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Platinum</span>
                </div>
                <div className="text-2xl font-light text-gray-900">{partners.filter(p => p.tier === 'platinum').length}</div>
                <div className="text-xs text-amber-600 font-medium">Top tier</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg Deals</span>
                </div>
                <div className="text-2xl font-light text-gray-900">{Math.round(partners.reduce((sum, p) => sum + p.metrics.deals, 0) / partners.length)}</div>
                <div className="text-xs text-indigo-600 font-medium">Per partner</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-pink-50 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-pink-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Conversion</span>
                </div>
                <div className="text-2xl font-light text-gray-900">{Math.round(partners.reduce((sum, p) => sum + p.metrics.conversion, 0) / partners.length)}%</div>
                <div className="text-xs text-pink-600 font-medium">Average</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Tiers</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="revenue">Sort by Revenue</option>
                  <option value="name">Sort by Name</option>
                  <option value="growth">Sort by Growth</option>
                  <option value="joinDate">Sort by Join Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  setSelectedPartner(partner);
                  setCurrentView('details');
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${tierColors[partner.tier]} rounded-xl flex items-center justify-center shadow-sm`}>
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{partner.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{partner.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPartners(prev => prev.map(p => 
                          p.id === partner.id ? { ...p, isBookmarked: !p.isBookmarked } : p
                        ));
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        partner.isBookmarked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${partner.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${statusColors[partner.status]}`}>
                      {partner.status}
                    </span>
                  </div>
                </div>

                {/* Status and Tier */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-700 capitalize">{partner.tier}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Joined {partner.joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Revenue and Growth */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Revenue</span>
                    </div>
                    <div className="text-lg font-medium text-gray-900">${partner.revenue.toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Growth</span>
                    </div>
                    <div className="text-lg font-medium text-gray-900">+{partner.growth}%</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-gray-50 rounded-lg py-2">
                    <div className="text-lg font-medium text-gray-900">{partner.metrics.deals}</div>
                    <div className="text-xs text-gray-500 font-medium">Deals</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg py-2">
                    <div className="text-lg font-medium text-gray-900">{partner.metrics.conversion}%</div>
                    <div className="text-xs text-gray-500 font-medium">Convert</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg py-2">
                    <div className="text-lg font-medium text-gray-900">{partner.metrics.satisfaction}</div>
                    <div className="text-xs text-gray-500 font-medium">Rating</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {partner.primaryContact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{partner.primaryContact.name}</div>
                      <div className="text-xs text-gray-500">{partner.primaryContact.role}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{partner.primaryContact.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{partner.primaryContact.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {partner.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                  {partner.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                      +{partner.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Description Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {partner.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${partner.primaryContact.email}`;
                      }}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${partner.primaryContact.phone}`;
                      }}
                      className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Store meeting data for calendar page
                        const meetingData = {
                          partnerId: partner.id,
                          partnerName: partner.name,
                          contactName: partner.primaryContact.name,
                          contactEmail: partner.primaryContact.email,
                          subject: `Meeting with ${partner.name}`,
                          description: `Partnership meeting with ${partner.primaryContact.name} from ${partner.name}`
                        };
                        localStorage.setItem('pending-meeting-creation', JSON.stringify(meetingData));
                        
                        if (onNavigate) {
                          onNavigate('calendar');
                        }
                      }}
                      className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>

                {/* Last Contact */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last contact: {partner.lastContact.toLocaleDateString()}</span>
                    <span className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>{Math.floor((Date.now() - partner.lastContact.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Partner Details View
  if (currentView === 'details' && selectedPartner) {
    return (
      <div className="h-full bg-white overflow-y-auto">
        <div className="w-full px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${tierColors[selectedPartner.tier]} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h1 className="text-3xl font-light text-gray-900">{selectedPartner.name}</h1>
                    {selectedPartner.isBookmarked && <Heart className="w-6 h-6 text-red-500 fill-current" />}
                    <div className={`px-3 py-1 text-sm font-medium rounded-lg ${statusColors[selectedPartner.status]}`}>
                      {selectedPartner.status}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{selectedPartner.industry}</span>
                    {selectedPartner.website && (
                      <>
                        <span>•</span>
                        <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-blue-600">
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  // Create task linked to this partner
                  const taskData = {
                    partnerId: selectedPartner.id,
                    partnerName: selectedPartner.name,
                    title: `Task for ${selectedPartner.name}`,
                    description: `Task related to partnership with ${selectedPartner.name}`,
                    priority: 'medium' as const,
                    status: 'todo' as const,
                    tags: ['partnership', selectedPartner.industry.toLowerCase()]
                  };
                  
                  // Store task data for the Tasks page to pick up
                  localStorage.setItem('pending-task-creation', JSON.stringify(taskData));
                  
                  // Navigate to tasks page
                  if (onNavigate) {
                    onNavigate('tasks');
                  } else {
                    alert(`Task creation initiated for ${selectedPartner.name}. Go to Tasks page to complete the setup.`);
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
              <button
                onClick={() => handleEditPartner(selectedPartner)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Health Score & Risk Alerts */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Health Score</span>
                <div className={`w-3 h-3 rounded-full ${selectedPartner.healthScore >= 80 ? 'bg-green-500' : selectedPartner.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="text-2xl font-light text-gray-900">{selectedPartner.healthScore}/100</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Risk Level</span>
              </div>
              <div className={`text-lg font-medium capitalize ${
                selectedPartner.riskLevel === 'low' ? 'text-green-600' : 
                selectedPartner.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {selectedPartner.riskLevel}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Timer className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Contract</span>
              </div>
              <div className="text-sm text-gray-900">
                Expires {selectedPartner.contractEnd.toLocaleDateString()}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Last Contact</span>
              </div>
              <div className="text-sm text-gray-900">
                {Math.floor((Date.now() - selectedPartner.lastContact.getTime()) / (1000 * 60 * 60 * 24))} days ago
              </div>
            </div>
          </div>

          {/* Partnership Overview */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Financial Metrics */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Financial Overview</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Revenue</span>
                  <span className="text-lg font-medium text-gray-900">${selectedPartner.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Monthly Recurring</span>
                  <span className="text-lg font-medium text-gray-900">${selectedPartner.monthlyRecurring.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Value</span>
                  <span className="text-lg font-medium text-gray-900">${selectedPartner.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Commission Earned</span>
                  <span className="text-lg font-medium text-green-600">${selectedPartner.commission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Growth Rate</span>
                  <span className="text-lg font-medium text-blue-600">+{selectedPartner.growth}%</span>
                </div>
              </div>
            </div>

            {/* Partnership Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Handshake className="w-5 h-5 text-blue-600" />
                <span>Partnership Details</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Type</span>
                  <div className="text-sm font-medium text-gray-900 capitalize">{selectedPartner.partnershipType.replace('-', ' ')}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Deal Structure</span>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedPartner.dealStructure.value}% {selectedPartner.dealStructure.type}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment Terms</span>
                  <div className="text-sm font-medium text-gray-900">{selectedPartner.dealStructure.paymentTerms}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Contract Length</span>
                  <div className="text-sm font-medium text-gray-900">{selectedPartner.dealStructure.contractLength} months</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Auto-Renew</span>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedPartner.dealStructure.autoRenew ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span>Performance</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Deals</span>
                  <span className="text-lg font-medium text-gray-900">{selectedPartner.metrics.deals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Conversion Rate</span>
                  <span className="text-lg font-medium text-gray-900">{selectedPartner.metrics.conversion}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">NPS Score</span>
                  <span className="text-lg font-medium text-gray-900">{selectedPartner.metrics.nps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Response Time</span>
                  <span className="text-lg font-medium text-gray-900">{selectedPartner.metrics.responseTime}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Churn Rate</span>
                  <span className="text-lg font-medium text-gray-900">{selectedPartner.metrics.churnRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>Primary Contact</span>
              </h3>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-medium">
                    {selectedPartner.primaryContact.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-medium text-gray-900">{selectedPartner.primaryContact.name}</div>
                  <div className="text-xs text-gray-500 mb-3">{selectedPartner.primaryContact.role}</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email</span>
                      <div className="font-medium text-gray-900">{selectedPartner.primaryContact.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone</span>
                      <div className="font-medium text-gray-900">{selectedPartner.primaryContact.phone}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Timezone</span>
                      <div className="font-medium text-gray-900">{selectedPartner.primaryContact.timezone}</div>
                    </div>
                    {selectedPartner.primaryContact.linkedin && (
                      <div>
                        <span className="text-gray-500">LinkedIn</span>
                        <a href={`https://${selectedPartner.primaryContact.linkedin}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-700">
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Integration */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span>Technical Integration</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Integration Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    selectedPartner.integration.status === 'completed' ? 'bg-green-50 text-green-700' :
                    selectedPartner.integration.status === 'in-progress' ? 'bg-yellow-50 text-yellow-700' :
                    selectedPartner.integration.status === 'issues' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>
                    {selectedPartner.integration.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    {selectedPartner.integration.apiAccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">API Access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedPartner.integration.sandboxAccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">Sandbox</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedPartner.integration.productionAccess ? <CheckCircle className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                    <span className="text-sm">Production</span>
                  </div>
                  {selectedPartner.integration.lastSync && (
                    <div>
                      <span className="text-xs text-gray-500">Last Sync</span>
                      <div className="text-sm font-medium">{selectedPartner.integration.lastSync.toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Goals & Territory */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-600" />
                <span>Active Goals</span>
              </h3>
              <div className="space-y-4">
                {selectedPartner.goals.map((goal) => (
                  <div key={goal.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{goal.title}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        goal.status === 'completed' ? 'bg-green-50 text-green-700' :
                        goal.status === 'in-progress' ? 'bg-blue-50 text-blue-700' :
                        goal.status === 'overdue' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">{goal.description}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress: {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}</span>
                      <span className="text-gray-500">Due: {goal.deadline.toLocaleDateString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>Territory & Markets</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500 mb-2 block">Territories</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPartner.territory.map((territory, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">
                        {territory}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 mb-2 block">Target Markets</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPartner.targetMarkets.map((market, index) => (
                      <span key={index} className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-lg">
                        {market}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Exclusivity</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    selectedPartner.exclusivity ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-700'
                  }`}>
                    {selectedPartner.exclusivity ? 'Exclusive' : 'Non-exclusive'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 mb-2 block">Company Size</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{selectedPartner.companySize}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Documents */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {selectedPartner.activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'meeting' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'deal' ? 'bg-green-50 text-green-600' :
                      activity.type === 'email' ? 'bg-purple-50 text-purple-600' :
                      activity.type === 'call' ? 'bg-orange-50 text-orange-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {activity.type === 'meeting' && <Video className="w-4 h-4" />}
                      {activity.type === 'deal' && <DollarSign className="w-4 h-4" />}
                      {activity.type === 'email' && <Mail className="w-4 h-4" />}
                      {activity.type === 'call' && <Phone className="w-4 h-4" />}
                      {activity.type === 'other' && <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.description}</div>
                      {activity.outcome && (
                        <div className="text-sm text-gray-600 mt-1">{activity.outcome}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">{activity.date.toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Documents</span>
              </h3>
              <div className="space-y-3">
                {selectedPartner.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        doc.type === 'contract' ? 'bg-blue-50 text-blue-600' :
                        doc.type === 'report' ? 'bg-green-50 text-green-600' :
                        doc.type === 'invoice' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-xs text-gray-500">
                          {doc.type} • Uploaded {doc.uploadDate.toLocaleDateString()}
                          {doc.expiryDate && ` • Expires ${doc.expiryDate.toLocaleDateString()}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.doc,.docx,.txt,.jpg,.png';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        alert(`File "${file.name}" selected for upload. Upload functionality would be implemented here.`);
                      }
                    };
                    input.click();
                  }}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>
            </div>
          </div>

          {/* Related Tasks */}
          <div className="mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <span>Related Tasks</span>
              </h3>
              {(() => {
                const partnerTasks = getPartnerTasks(selectedPartner.id);
                return partnerTasks.length > 0 ? (
                  <div className="space-y-3">
                    {partnerTasks.map((task: any) => (
                                             <div 
                         key={task.id} 
                         className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                         onClick={() => {
                           // Store task details for viewing
                           localStorage.setItem('view-task-details', JSON.stringify(task));
                           if (onNavigate) {
                             onNavigate('tasks');
                           } else {
                             alert(`Opening details for "${task.title}". Go to Tasks page to see the task detail modal.`);
                           }
                         }}
                       >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'done' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-blue-500' :
                            task.status === 'blocked' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                            <div className="text-xs text-gray-500">
                              {task.priority} priority • {task.status.replace('-', ' ')}
                              {task.dueDate && ` • Due ${new Date(task.dueDate).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                                                     <button 
                             onClick={() => {
                               // Store task ID to highlight in Tasks page
                               localStorage.setItem('highlight-task-id', task.id);
                               if (onNavigate) {
                                 onNavigate('tasks');
                               } else {
                                 alert('Task details saved. Go to Tasks page to view this task.');
                               }
                             }}
                             className="p-1 hover:bg-gray-200 rounded transition-colors"
                           >
                             <ExternalLink className="w-4 h-4 text-gray-600" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No related tasks</h4>
                    <p className="text-gray-600 mb-4">Create tasks linked to this partner to track partnership activities.</p>
                    <button
                      onClick={() => {
                        // Create task linked to this partner
                        const taskData = {
                          partnerId: selectedPartner.id,
                          partnerName: selectedPartner.name,
                          title: `Task for ${selectedPartner.name}`,
                          description: `Task related to partnership with ${selectedPartner.name}`,
                          priority: 'medium' as const,
                          status: 'todo' as const,
                          tags: ['partnership', selectedPartner.industry.toLowerCase()]
                        };
                        
                        // Store task data for the Tasks page to pick up
                        localStorage.setItem('pending-task-creation', JSON.stringify(taskData));
                        
                        // Navigate to tasks page
                        if (onNavigate) {
                          onNavigate('tasks');
                        } else {
                          alert(`Task creation initiated for ${selectedPartner.name}. Go to Tasks page to complete the setup.`);
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create First Task</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Deals Section - Moved Higher */}
          <div className="mt-6 mb-6">
            <PartnerDeals 
              partnerId={selectedPartner.id} 
              partnerName={selectedPartner.name} 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between py-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = `mailto:${selectedPartner.primaryContact.email}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </button>
              <button
                onClick={() => window.location.href = `tel:${selectedPartner.primaryContact.phone}`}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
              <button 
                onClick={() => {
                  // Store meeting data for calendar page
                  const meetingData = {
                    partnerId: selectedPartner.id,
                    partnerName: selectedPartner.name,
                    contactName: selectedPartner.primaryContact.name,
                    contactEmail: selectedPartner.primaryContact.email,
                    subject: `Meeting with ${selectedPartner.name}`,
                    description: `Partnership meeting with ${selectedPartner.primaryContact.name} from ${selectedPartner.name}`
                  };
                  localStorage.setItem('pending-meeting-creation', JSON.stringify(meetingData));
                  
                  if (onNavigate) {
                    onNavigate('calendar');
                  } else {
                    // Fallback to email if navigation isn't available
                    const subject = `Meeting with ${selectedPartner.name}`;
                    const body = `Hi ${selectedPartner.primaryContact.name},\n\nI'd like to schedule a meeting to discuss our partnership.\n\nBest regards`;
                    const mailtoLink = `mailto:${selectedPartner.primaryContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(mailtoLink);
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Meeting</span>
              </button>
            </div>
            
            {/* Clone and Archive buttons moved here */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  const clonedPartner = {
                    ...selectedPartner,
                    id: crypto.randomUUID(),
                    name: `${selectedPartner.name} (Copy)`,
                    joinDate: new Date(),
                    contractStart: new Date(),
                    contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                    lastContact: new Date(),
                    lastActivity: new Date(),
                    createdBy: 'current-user',
                    lastModified: new Date()
                  };
                  
                  // In a real app, you'd save this to your backend
                  alert(`Partner "${clonedPartner.name}" has been cloned successfully!`);
                }}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Clone Partner</span>
              </button>
              <button 
                onClick={() => {
                  if (confirm(`Are you sure you want to archive ${selectedPartner.name}? This action can be undone later.`)) {
                    // In a real app, you'd update the partner status to 'archived'
                    alert(`${selectedPartner.name} has been archived successfully!`);
                    setCurrentView('dashboard');
                  }
                }}
                className="border border-red-200 hover:bg-red-50 text-red-700 px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Archive</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add/Edit forms
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="h-full bg-white overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setEditPartner(null);
                  setErrors({});
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-3xl font-light text-gray-900">
                {currentView === 'edit' ? 'Edit Partner' : 'Add Partner'}
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>Basic Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.name ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Enter partner name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.industry ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                  {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        value={formData.companySize === 'startup' ? 5 : 
                               formData.companySize === 'small' ? 25 : 
                               formData.companySize === 'medium' ? 100 : 
                               formData.companySize === 'large' ? 500 : 
                               formData.companySize === 'enterprise' ? 2000 : 50}
                        onChange={(e) => {
                          const size = Number(e.target.value);
                          let category;
                          if (size <= 10) category = 'startup';
                          else if (size <= 50) category = 'small';
                          else if (size <= 200) category = 'medium';
                          else if (size <= 1000) category = 'large';
                          else category = 'enterprise';
                          updateFormData('companySize', category);
                        }}
                        min="1"
                        max="10000"
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <span className="text-sm text-gray-600">employees</span>
                    </div>
                    <select
                      value={formData.companySize || 'medium'}
                      onChange={(e) => updateFormData('companySize', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="startup">Startup (1-10 employees)</option>
                      <option value="small">Small (11-50 employees)</option>
                      <option value="medium">Medium (51-200 employees)</option>
                      <option value="large">Large (201-1000 employees)</option>
                      <option value="enterprise">Enterprise (1000+ employees)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => updateFormData('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="trial">Trial</option>
                    <option value="paused">Paused</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tier
                  </label>
                  <select
                    value={formData.tier || 'bronze'}
                    onChange={(e) => updateFormData('tier', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Primary Contact */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>Primary Contact</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.primaryContact?.name || ''}
                    onChange={(e) => updateFormData('primaryContact.name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.primaryContactName ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Enter contact name"
                  />
                  {errors.primaryContactName && <p className="mt-1 text-sm text-red-600">{errors.primaryContactName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.primaryContact?.role || ''}
                    onChange={(e) => updateFormData('primaryContact.role', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., VP of Partnerships"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.primaryContact?.email || ''}
                    onChange={(e) => updateFormData('primaryContact.email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.primaryContactEmail ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="contact@example.com"
                  />
                  {errors.primaryContactEmail && <p className="mt-1 text-sm text-red-600">{errors.primaryContactEmail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.primaryContact?.phone || ''}
                    onChange={(e) => updateFormData('primaryContact.phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.primaryContactPhone ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.primaryContactPhone && <p className="mt-1 text-sm text-red-600">{errors.primaryContactPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.primaryContact?.linkedin || ''}
                    onChange={(e) => updateFormData('primaryContact.linkedin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.primaryContact?.timezone || 'UTC'}
                    onChange={(e) => updateFormData('primaryContact.timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="CST">CST (Central Standard Time)</option>
                    <option value="MST">MST (Mountain Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                    <option value="CET">CET (Central European Time)</option>
                    <option value="EET">EET (Eastern European Time)</option>
                    <option value="IST">IST (India Standard Time)</option>
                    <option value="JST">JST (Japan Standard Time)</option>
                    <option value="AEST">AEST (Australian Eastern Standard Time)</option>
                    <option value="AWST">AWST (Australian Western Standard Time)</option>
                    <option value="NZST">NZST (New Zealand Standard Time)</option>
                    <option value="HST">HST (Hawaii Standard Time)</option>
                    <option value="AKST">AKST (Alaska Standard Time)</option>
                    <option value="BRT">BRT (Brasilia Time)</option>
                    <option value="ART">ART (Argentina Time)</option>
                    <option value="CAT">CAT (Central Africa Time)</option>
                    <option value="EAT">EAT (East Africa Time)</option>
                    <option value="WAT">WAT (West Africa Time)</option>
                    <option value="MSK">MSK (Moscow Time)</option>
                    <option value="GST">GST (Gulf Standard Time)</option>
                    <option value="PKT">PKT (Pakistan Standard Time)</option>
                    <option value="WIB">WIB (Western Indonesian Time)</option>
                    <option value="ICT">ICT (Indochina Time)</option>
                    <option value="CST_CHINA">CST (China Standard Time)</option>
                    <option value="KST">KST (Korea Standard Time)</option>
                    <option value="SGT">SGT (Singapore Time)</option>
                    <option value="HKT">HKT (Hong Kong Time)</option>
                    <option value="PHT">PHT (Philippine Time)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Partnership Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                <Handshake className="w-5 h-5 text-blue-600" />
                <span>Partnership Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partnership Type
                  </label>
                  <select
                    value={formData.partnershipType || 'revenue-share'}
                    onChange={(e) => updateFormData('partnershipType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="revenue-share">Revenue Share</option>
                    <option value="referral">Referral</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="reseller">Reseller</option>
                    <option value="technology">Technology</option>
                    <option value="strategic">Strategic</option>
                    <option value="white-label">White Label</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Structure Type
                  </label>
                  <select
                    value={formData.dealStructure?.type || 'percentage'}
                    onChange={(e) => updateFormData('dealStructure.type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                    <option value="tiered">Tiered</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Value (%)
                  </label>
                  <input
                    type="number"
                    value={formData.dealStructure?.value || 0}
                    onChange={(e) => updateFormData('dealStructure.value', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                    <span className="text-xs text-gray-500 block mt-1">How quickly you'll be paid after invoicing</span>
                  </label>
                  <select
                    value={formData.dealStructure?.paymentTerms || 'Net 30'}
                    onChange={(e) => updateFormData('dealStructure.paymentTerms', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Immediate">Immediate (Payment on delivery)</option>
                    <option value="Net 15">Net 15 (Payment due in 15 days)</option>
                    <option value="Net 30">Net 30 (Payment due in 30 days)</option>
                    <option value="Net 45">Net 45 (Payment due in 45 days)</option>
                    <option value="Net 60">Net 60 (Payment due in 60 days)</option>
                    <option value="Net 90">Net 90 (Payment due in 90 days)</option>
                    <option value="2/10 Net 30">2/10 Net 30 (2% discount if paid in 10 days, otherwise 30 days)</option>
                    <option value="Monthly">Monthly (Payment at end of each month)</option>
                    <option value="Quarterly">Quarterly (Payment every 3 months)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Commitment ($)
                    <span className="text-xs text-gray-500 block mt-1">Minimum revenue/sales commitment required</span>
                  </label>
                  <input
                    type="number"
                    value={formData.dealStructure?.minimumCommitment || 0}
                    onChange={(e) => updateFormData('dealStructure.minimumCommitment', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partnership Priority Level
                  </label>
                  <select
                    value={formData.tier || 'bronze'}
                    onChange={(e) => updateFormData('tier', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="bronze">Bronze - Standard Partner</option>
                    <option value="silver">Silver - Preferred Partner</option>
                    <option value="gold">Gold - Strategic Partner</option>
                    <option value="platinum">Platinum - Premium Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Generation Responsibility
                  </label>
                  <select
                    value={formData.leadGeneration || 'shared'}
                    onChange={(e) => updateFormData('leadGeneration', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="partner">Partner generates leads</option>
                    <option value="us">We generate leads</option>
                    <option value="shared">Shared lead generation</option>
                    <option value="both">Both parties generate independently</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Level Required
                  </label>
                  <select
                    value={formData.supportLevel || 'standard'}
                    onChange={(e) => updateFormData('supportLevel', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="minimal">Minimal - Self-service only</option>
                    <option value="standard">Standard - Email support</option>
                    <option value="priority">Priority - Phone + email support</option>
                    <option value="dedicated">Dedicated - Assigned account manager</option>
                    <option value="white-glove">White-glove - Full service support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Length (months)
                  </label>
                  <input
                    type="number"
                    value={formData.dealStructure?.contractLength || 12}
                    onChange={(e) => updateFormData('dealStructure.contractLength', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="1"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={formData.dealStructure?.autoRenew || false}
                    onChange={(e) => updateFormData('dealStructure.autoRenew', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoRenew" className="text-sm font-medium text-gray-700">
                    Auto-renew contract
                  </label>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Financial Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={formData.revenue || 0}
                    onChange={(e) => updateFormData('revenue', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Recurring Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRecurring || 0}
                    onChange={(e) => updateFormData('monthlyRecurring', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.growth || 0}
                    onChange={(e) => updateFormData('growth', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Partnership Value ($)
                  </label>
                  <input
                    type="number"
                    value={formData.totalValue || 0}
                    onChange={(e) => updateFormData('totalValue', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Additional Information</span>
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                    <span className="text-xs text-gray-500 block mt-1">Add tags separated by commas (e.g., "High Value, Strategic, Enterprise")</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                      updateFormData('tags', tags);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="High Value, Strategic, Enterprise, Technology"
                  />
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = formData.tags?.filter((_, i) => i !== index) || [];
                              updateFormData('tags', newTags);
                            }}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Territory Coverage
                    <span className="text-xs text-gray-500 block mt-1">Geographic regions this partner covers</span>
                  </label>
                  <input
                    type="text"
                    value={formData.territory?.join(', ') || ''}
                    onChange={(e) => {
                      const territories = e.target.value.split(',').map(territory => territory.trim()).filter(territory => territory.length > 0);
                      updateFormData('territory', territories);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="North America, Europe, Asia Pacific"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Markets
                    <span className="text-xs text-gray-500 block mt-1">Industries or market segments they focus on</span>
                  </label>
                  <input
                    type="text"
                    value={formData.targetMarkets?.join(', ') || ''}
                    onChange={(e) => {
                      const markets = e.target.value.split(',').map(market => market.trim()).filter(market => market.length > 0);
                      updateFormData('targetMarkets', markets);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Healthcare, Finance, Technology, Manufacturing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Brief description of the partner and partnership"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Internal notes about the partner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="exclusivity"
                      checked={formData.exclusivity || false}
                      onChange={(e) => updateFormData('exclusivity', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="exclusivity" className="text-sm font-medium text-gray-700">
                      Exclusive partnership
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="bookmark"
                      checked={formData.isBookmarked || false}
                      onChange={(e) => updateFormData('isBookmarked', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="bookmark" className="text-sm font-medium text-gray-700">
                      Bookmark this partner
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <span>Documents & Files</span>
              </h3>
              
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium text-blue-600 hover:text-blue-700">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={(e) => {
                      // In a real app, you'd handle file upload here
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        alert(`${files.length} file(s) selected: ${files.map(f => f.name).join(', ')}\n\nIn a real app, these would be uploaded to your server.`);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Document Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Contract', 'NDA', 'SOW', 'Invoice', 'Report', 'Presentation', 'Other'].map((docType) => (
                      <label key={docType} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{docType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Partnership Agreement Template.pdf</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">NDA Template.docx</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between py-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('dashboard');
                  setEditPartner(null);
                  setErrors({});
                }}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{currentView === 'edit' ? 'Update Partner' : 'Create Partner'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
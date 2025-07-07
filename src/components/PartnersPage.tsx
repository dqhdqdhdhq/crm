import { useState } from 'react';
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
  Timer, UserCheck
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive' | 'trial' | 'paused' | 'terminated';
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  industry: string;
  website?: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  partnershipType: 'revenue-share' | 'referral' | 'affiliate' | 'reseller' | 'technology' | 'strategic' | 'white-label';
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

export function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [selectedTier, setSelectedTier] = useState<'all' | 'platinum' | 'gold' | 'silver' | 'bronze'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'revenue' | 'growth' | 'joinDate'>('revenue');
  const [currentView, setCurrentView] = useState<'dashboard' | 'details' | 'edit' | 'add'>('dashboard');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);

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
    setCurrentView('edit');
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
              <button
                onClick={() => setCurrentView('add')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Partner</span>
              </button>
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
                  <div className="text-sm text-gray-500 mb-3">{selectedPartner.primaryContact.role}</div>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between py-6 border-t border-gray-200">
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
                  const subject = `Meeting with ${selectedPartner.name}`;
                  const body = `Hi ${selectedPartner.primaryContact.name},\n\nI'd like to schedule a meeting to discuss our partnership.\n\nBest regards`;
                  const mailtoLink = `mailto:${selectedPartner.primaryContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  window.open(mailtoLink);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Meeting</span>
              </button>
            </div>
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
                onClick={() => setCurrentView('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-3xl font-light text-gray-900">
                {currentView === 'edit' ? 'Edit Partner' : 'Add Partner'}
              </h1>
            </div>
          </div>

          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Partner Form</h3>
            <p className="text-gray-600 mb-4">Partner creation/editing form coming soon!</p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
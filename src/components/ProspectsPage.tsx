import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Download, 
  Car, 
  UtensilsCrossed, 
  Dumbbell, 
  Home,
  Upload,
  X,
  Check,
  AlertCircle,
  Users,
  MessageSquare,
  TrendingUp,
  FileText,
  Trash2,
  Edit3,
  ExternalLink,
  StickyNote
} from 'lucide-react';
import { Industry, Prospect, Screenshot } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { NotesModal } from './NotesModal';

const defaultIndustries: Industry[] = [
  {
    id: 'car-detailing',
    name: 'Car Detailing',
    color: '#3B82F6',
    icon: 'Car',
    prospectsCount: 23,
    contactedCount: 15,
    responseRate: 33
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    color: '#10B981',
    icon: 'UtensilsCrossed',
    prospectsCount: 45,
    contactedCount: 32,
    responseRate: 28
  },
  {
    id: 'fitness',
    name: 'Fitness Centers',
    color: '#F59E0B',
    icon: 'Dumbbell',
    prospectsCount: 18,
    contactedCount: 12,
    responseRate: 42
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    color: '#8B5CF6',
    icon: 'Home',
    prospectsCount: 31,
    contactedCount: 20,
    responseRate: 35
  }
];

const defaultProspects: Prospect[] = [
  {
    id: '1',
    industryId: 'car-detailing',
    shopBusinessName: 'Premium Auto Detailing',
    ownerName: 'Mike Johnson',
    location: 'Downtown LA',
    googleMapsUrl: 'https://maps.google.com/...',
    reviews: 127,
    email: 'mike@premiumauto.com',
    answered: 'yes',
    notes: 'Very interested in our services',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    industryId: 'car-detailing',
    shopBusinessName: 'Elite Car Wash',
    ownerName: 'Sarah Chen',
    location: 'Beverly Hills',
    googleMapsUrl: 'https://maps.google.com/...',
    reviews: 89,
    email: 'sarah@elitecarwash.com',
    answered: 'no',
    notes: 'Needs follow up',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    industryId: 'car-detailing',
    shopBusinessName: '',
    ownerName: '',
    location: '',
    googleMapsUrl: '',
    reviews: 0,
    email: '',
    answered: 'no',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const defaultScreenshots: Screenshot[] = [
  {
    id: '1',
    industryId: 'car-detailing',
    businessName: 'Elite Car Wash',
    imageUrl: '',
    notes: '',
    sentMessage: 'Sent message via Instagram',
    createdAt: new Date()
  },
  {
    id: '2',
    industryId: 'car-detailing',
    businessName: 'Business 2',
    imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOUMzNEQ4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYW1wbGUgU2NyZWVuc2hvdDwvdGV4dD48L3N2Zz4=',
    notes: 'sadd',
    sentMessage: 'Sent message via Instagram',
    createdAt: new Date()
  }
];

export function ProspectsPage() {
  const [industries] = useLocalStorage<Industry[]>('industries', defaultIndustries);
  const [prospects, setProspects] = useLocalStorage<Prospect[]>('prospects', defaultProspects);
  const [screenshots, setScreenshots] = useLocalStorage<Screenshot[]>('screenshots', defaultScreenshots);
  
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'screenshots'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'answered' | 'not-answered' | 'interested'>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [notesModal, setNotesModal] = useState<{ isOpen: boolean; prospectId: string; notes: string; prospectName: string }>({
    isOpen: false,
    prospectId: '',
    notes: '',
    prospectName: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaving) {
      const timer = setTimeout(() => setAutoSaving(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoSaving]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleAddRow();
            break;
          case 'f':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('[placeholder*="Search"]')?.focus();
            break;
          case 's':
            e.preventDefault();
            setAutoSaving(true);
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setEditingCell(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons = {
      Car,
      UtensilsCrossed,
      Dumbbell,
      Home
    };
    return icons[iconName as keyof typeof icons] || Car;
  };

  const filteredProspects = prospects.filter(prospect => {
    if (prospect.industryId !== selectedIndustry?.id) return false;
    
    const matchesSearch = 
      prospect.shopBusinessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'answered' && prospect.answered === 'yes') ||
      (filterStatus === 'not-answered' && prospect.answered === 'no') ||
      (filterStatus === 'interested' && prospect.answered === 'interested');
    
    return matchesSearch && matchesFilter;
  });

  const filteredScreenshots = screenshots.filter(screenshot => {
    if (screenshot.industryId !== selectedIndustry?.id) return false;
    return screenshot.businessName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getProspectStats = () => {
    const industryProspects = prospects.filter(p => p.industryId === selectedIndustry?.id);
    const total = industryProspects.length;
    const answered = industryProspects.filter(p => p.answered === 'yes').length;
    const noResponse = industryProspects.filter(p => p.answered === 'no').length;
    const interested = industryProspects.filter(p => p.answered === 'interested').length;
    
    return { total, answered, noResponse, interested };
  };

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    setActiveTab('active');
  };

  const handleBack = () => {
    setSelectedIndustry(null);
    setSearchQuery('');
    setFilterStatus('all');
    setSelectedRows([]);
  };

  const handleAddRow = () => {
    if (!selectedIndustry) return;
    
    const newProspect: Prospect = {
      id: crypto.randomUUID(),
      industryId: selectedIndustry.id,
      shopBusinessName: '',
      ownerName: '',
      location: '',
      googleMapsUrl: '',
      reviews: 0,
      email: '',
      answered: 'no',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setProspects([...prospects, newProspect]);
    setAutoSaving(true);
  };

  const handleUpdateProspect = (id: string, field: string, value: string | number) => {
    setProspects(prospects.map(prospect => 
      prospect.id === id 
        ? { ...prospect, [field]: value, updatedAt: new Date() }
        : prospect
    ));
    setAutoSaving(true);
  };

  const handleDeleteSelected = () => {
    setProspects(prospects.filter(p => !selectedRows.includes(p.id)));
    setSelectedRows([]);
    setAutoSaving(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Shop/Business Name', 'Owner Name', 'Location', 'Google Maps URL', 'Reviews', 'Email', 'Answered', 'Notes'],
      ...filteredProspects.map(p => [
        p.shopBusinessName,
        p.ownerName,
        p.location,
        p.googleMapsUrl,
        p.reviews.toString(),
        p.email,
        p.answered,
        p.notes
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedIndustry?.name}-prospects.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedIndustry) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newScreenshot: Screenshot = {
          id: crypto.randomUUID(),
          industryId: selectedIndustry.id,
          businessName: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: e.target?.result as string,
          notes: '',
          sentMessage: '',
          createdAt: new Date()
        };
        setScreenshots([...screenshots, newScreenshot]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateScreenshot = (id: string, field: string, value: string) => {
    setScreenshots(screenshots.map(screenshot => 
      screenshot.id === id 
        ? { ...screenshot, [field]: value }
        : screenshot
    ));
  };

  const handleDeleteScreenshot = (id: string) => {
    setScreenshots(screenshots.filter(s => s.id !== id));
  };

  const handleOpenNotesModal = (prospectId: string) => {
    const prospect = prospects.find(p => p.id === prospectId);
    if (prospect) {
      setNotesModal({
        isOpen: true,
        prospectId,
        notes: prospect.notes,
        prospectName: prospect.shopBusinessName || prospect.ownerName || 'Unnamed Prospect'
      });
    }
  };

  const handleSaveNotes = (notes: string) => {
    handleUpdateProspect(notesModal.prospectId, 'notes', notes);
    setNotesModal({ isOpen: false, prospectId: '', notes: '', prospectName: '' });
  };

  const handleCloseNotesModal = () => {
    setNotesModal({ isOpen: false, prospectId: '', notes: '', prospectName: '' });
  };

  if (!selectedIndustry) {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Prospects</h1>
              <p className="text-gray-600">Manage your lead generation campaigns across different industries</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {industries.map((industry) => {
                const IconComponent = getIconComponent(industry.icon);
                
                return (
                  <button
                    key={industry.id}
                    onClick={() => handleIndustrySelect(industry)}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${industry.color}20` }}
                      >
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: industry.color }}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{industry.responseRate}%</div>
                        <div className="text-xs text-gray-500">Response Rate</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{industry.name}</h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{industry.prospectsCount} prospects</span>
                      <span>{industry.contactedCount} contacted</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: industry.color,
                          width: `${(industry.contactedCount / industry.prospectsCount) * 100}%`
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getProspectStats();

  return (
    <div className="flex-1 bg-white flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedIndustry.name}</h1>
                <p className="text-gray-600">Lead generation campaign</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{stats.total} prospects</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span>{stats.answered} contacted</span>
              </div>
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Prospect</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Active Prospects
            </button>
            <button
              onClick={() => setActiveTab('screenshots')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'screenshots'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              No Response (Screenshots)
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'active' ? (
            <div>
              {/* Prospects Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-600 mb-1">
                      {selectedIndustry.name.toLowerCase()}-{selectedIndustry.name.toLowerCase().replace(' ', '-')} Prospects
                    </h2>
                    <p className="text-gray-600">Streamlined lead management with smart features</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{selectedIndustry.responseRate}%</div>
                    <div className="text-sm text-gray-500">Response Rate</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(stats.answered / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search prospects... (Ctrl+F)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'answered', label: 'Answered' },
                      { key: 'not-answered', label: 'Not Answered' },
                      { key: 'interested', label: 'Interested' }
                    ].map(filter => (
                      <button
                        key={filter.key}
                        onClick={() => setFilterStatus(filter.key as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === filter.key
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {selectedRows.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected</span>
                    </button>
                  )}
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={handleAddRow}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Row (Ctrl+N)</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-green-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Quick Actions:</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Click cells to edit • <kbd className="bg-green-100 px-1 rounded">Tab</kbd> next cell • <kbd className="bg-green-100 px-1 rounded">Enter</kbd> save • <kbd className="bg-green-100 px-1 rounded">Ctrl+N</kbd> new row • <kbd className="bg-green-100 px-1 rounded">Ctrl+S</kbd> save all
                </div>
              </div>

              {/* Prospects Table Container - This is the key fix */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto" style={{ touchAction: 'pan-x' }}>
                  <table className="w-full" style={{ minWidth: '1200px' }}>
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="w-12 p-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.length === filteredProspects.length && filteredProspects.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows(filteredProspects.map(p => p.id));
                              } else {
                                setSelectedRows([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="text-left p-4 font-medium text-gray-900">#</th>
                        <th className="text-left p-4 font-medium text-gray-900">Shop/Business Name</th>
                        <th className="text-left p-4 font-medium text-gray-900">Owner Name</th>
                        <th className="text-left p-4 font-medium text-gray-900">Location</th>
                        <th className="text-left p-4 font-medium text-gray-900">Google Maps URL</th>
                        <th className="text-left p-4 font-medium text-gray-900">Reviews</th>
                        <th className="text-left p-4 font-medium text-gray-900">Email</th>
                        <th className="text-left p-4 font-medium text-gray-900">Answered</th>
                        <th className="text-left p-4 font-medium text-gray-900">Notes/Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProspects.map((prospect, index) => (
                        <ProspectRow
                          key={prospect.id}
                          prospect={prospect}
                          index={index + 1}
                          isSelected={selectedRows.includes(prospect.id)}
                          onSelect={(selected) => {
                            if (selected) {
                              setSelectedRows([...selectedRows, prospect.id]);
                            } else {
                              setSelectedRows(selectedRows.filter(id => id !== prospect.id));
                            }
                          }}
                          onUpdate={handleUpdateProspect}
                          editingCell={editingCell}
                          onEditCell={setEditingCell}
                          onOpenNotesModal={handleOpenNotesModal}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-500 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-blue-100">Total Prospects</div>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">{stats.answered}</div>
                  <div className="text-green-100">Answered</div>
                </div>
                <div className="bg-orange-500 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">{stats.noResponse}</div>
                  <div className="text-orange-100">No Response</div>
                </div>
                <div className="bg-purple-500 text-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">{stats.interested}</div>
                  <div className="text-purple-100">Interested</div>
                </div>
              </div>

              {autoSaving && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Auto-saved</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Screenshots Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Response Screenshots</h2>
                <p className="text-gray-600">Upload screenshots of businesses that didn't respond for quick reference</p>
              </div>

              {/* Search */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search screenshots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8 hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Screenshots</h3>
                <p className="text-gray-600 mb-4">Drag and drop screenshot files here, or click to browse</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Files</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Screenshots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScreenshots.map((screenshot) => (
                  <ScreenshotCard
                    key={screenshot.id}
                    screenshot={screenshot}
                    onUpdate={handleUpdateScreenshot}
                    onDelete={handleDeleteScreenshot}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={notesModal.isOpen}
        notes={notesModal.notes}
        prospectName={notesModal.prospectName}
        onSave={handleSaveNotes}
        onClose={handleCloseNotesModal}
      />
    </div>
  );
}

interface ProspectRowProps {
  prospect: Prospect;
  index: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onUpdate: (id: string, field: string, value: string | number) => void;
  editingCell: { rowId: string; field: string } | null;
  onEditCell: (cell: { rowId: string; field: string } | null) => void;
  onOpenNotesModal: (prospectId: string) => void;
}

function ProspectRow({ 
  prospect, 
  index, 
  isSelected, 
  onSelect, 
  onUpdate, 
  editingCell, 
  onEditCell,
  onOpenNotesModal
}: ProspectRowProps) {
  const isEditing = (field: string) => 
    editingCell?.rowId === prospect.id && editingCell?.field === field;

  const handleCellClick = (field: string) => {
    if (field === 'notes') {
      onOpenNotesModal(prospect.id);
    } else {
      onEditCell({ rowId: prospect.id, field });
    }
  };

  const handleCellBlur = () => {
    onEditCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      onEditCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Move to next cell logic could be implemented here
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="p-4 text-gray-900 font-medium">{index}</td>
      <td className="p-4">
        {isEditing('shopBusinessName') ? (
          <input
            type="text"
            value={prospect.shopBusinessName}
            onChange={(e) => onUpdate(prospect.id, 'shopBusinessName', e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, 'shopBusinessName')}
            className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => handleCellClick('shopBusinessName')}
            className="cursor-text hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] flex items-center"
          >
            {prospect.shopBusinessName || 'Click to edit'}
          </div>
        )}
      </td>
      <td className="p-4">
        {isEditing('ownerName') ? (
          <input
            type="text"
            value={prospect.ownerName}
            onChange={(e) => onUpdate(prospect.id, 'ownerName', e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, 'ownerName')}
            className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => handleCellClick('ownerName')}
            className="cursor-text hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] flex items-center"
          >
            {prospect.ownerName || 'Click to edit'}
          </div>
        )}
      </td>
      <td className="p-4">
        {isEditing('location') ? (
          <input
            type="text"
            value={prospect.location}
            onChange={(e) => onUpdate(prospect.id, 'location', e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, 'location')}
            className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => handleCellClick('location')}
            className="cursor-text hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] flex items-center"
          >
            {prospect.location || 'Click to edit'}
          </div>
        )}
      </td>
      <td className="p-4">
        {isEditing('googleMapsUrl') ? (
          <input
            type="text"
            value={prospect.googleMapsUrl}
            onChange={(e) => onUpdate(prospect.id, 'googleMapsUrl', e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, 'googleMapsUrl')}
            className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => handleCellClick('googleMapsUrl')}
            className="cursor-text hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] flex items-center"
          >
            {prospect.googleMapsUrl ? (
              <a
                href={prospect.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="truncate max-w-[150px]">{prospect.googleMapsUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              'Click to edit'
            )}
          </div>
        )}
      </td>
      <td className="p-4">
        {isEditing('reviews') ? (
          <input
            type="number"
            value={prospect.reviews}
            onChange={(e) => onUpdate(prospect.id, 'reviews', parseInt(e.target.value) || 0)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, 'reviews')}
            className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => handleCellClick('reviews')}
            className="cursor-text hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] flex items-center"
          >
            {prospect.reviews || 'Click to edit'}
          </div>
        )}
      </td>
      <td className="p-4">
        {isEditing('email') ? (
          <input
            type="email"
            value={prospect.email}
            onChange={(e) => onUpdate(prospect.id, 'email', e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, 'email')}
            className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => handleCellClick('email')}
            className="cursor-text hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] flex items-center"
          >
            {prospect.email || 'Click to edit'}
          </div>
        )}
      </td>
      <td className="p-4">
        <select
          value={prospect.answered}
          onChange={(e) => onUpdate(prospect.id, 'answered', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
          <option value="interested">Interested</option>
        </select>
      </td>
      <td className="p-4">
        <button
          onClick={() => handleCellClick('notes')}
          className="flex items-center space-x-2 w-full text-left hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] transition-colors"
        >
          <StickyNote className="w-4 h-4 text-gray-400" />
          <span className="truncate text-gray-600">
            {prospect.notes ? (
              prospect.notes.length > 30 ? `${prospect.notes.substring(0, 30)}...` : prospect.notes
            ) : (
              'Click to add notes'
            )}
          </span>
        </button>
      </td>
    </tr>
  );
}

interface ScreenshotCardProps {
  screenshot: Screenshot;
  onUpdate: (id: string, field: string, value: string) => void;
  onDelete: (id: string) => void;
}

function ScreenshotCard({ screenshot, onUpdate, onDelete }: ScreenshotCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <input
          type="text"
          value={screenshot.businessName}
          onChange={(e) => onUpdate(screenshot.id, 'businessName', e.target.value)}
          className="font-medium text-gray-900 bg-transparent border-none outline-none flex-1"
          placeholder="Business name"
        />
        <button
          onClick={() => onDelete(screenshot.id)}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {screenshot.imageUrl ? (
        <div className="aspect-video bg-gray-100">
          <img
            src={screenshot.imageUrl}
            alt={screenshot.businessName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={screenshot.notes}
            onChange={(e) => onUpdate(screenshot.id, 'notes', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Add notes..."
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Message Sent</label>
          <input
            type="text"
            value={screenshot.sentMessage}
            onChange={(e) => onUpdate(screenshot.id, 'sentMessage', e.target.value)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Sent message via Instagram"
          />
        </div>
      </div>
    </div>
  );
}
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
  StickyNote,
  Map,
  List,
  MapPin,
  Star,
  Navigation
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
    industry: 'Car Detailing',
    location: 'Downtown LA',
    googleMapsUrl: 'https://maps.google.com/...',
    latitude: 34.0522,
    longitude: -118.2437,
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
    industry: 'Car Detailing',
    location: 'Beverly Hills',
    googleMapsUrl: 'https://maps.google.com/...',
    latitude: 34.0736,
    longitude: -118.4004,
    reviews: 89,
    email: 'sarah@elitecarwash.com',
    answered: 'no',
    notes: 'Needs follow up',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    industryId: 'restaurants',
    shopBusinessName: 'The Golden Fork',
    industry: 'Restaurants',
    location: 'Santa Monica',
    googleMapsUrl: 'https://maps.google.com/...',
    latitude: 34.0195,
    longitude: -118.4912,
    reviews: 245,
    email: 'marco@goldenfork.com',
    answered: 'interested',
    notes: 'Wants to hear more about pricing',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    industryId: 'fitness',
    shopBusinessName: 'FitZone Gym',
    industry: 'Fitness Centers',
    location: 'West Hollywood',
    googleMapsUrl: 'https://maps.google.com/...',
    latitude: 34.0900,
    longitude: -118.3617,
    reviews: 98,
    email: 'jen@fitzonegym.com',
    answered: 'no',
    notes: 'Left voicemail',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    industryId: 'restaurants',
    shopBusinessName: 'Cafe Luna',
    industry: 'Restaurants',
    location: 'Venice Beach',
    googleMapsUrl: 'https://maps.google.com/...',
    latitude: 34.0118,
    longitude: -118.4951,
    reviews: 156,
    email: 'antonio@cafeluna.com',
    answered: 'yes',
    notes: 'Very enthusiastic, scheduled follow-up',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    industryId: 'car-detailing',
    shopBusinessName: '',
    industry: 'Car Detailing',
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
  
  const [activeTab, setActiveTab] = useState<'active' | 'screenshots'>('active');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>(['all']); // Multiple selection
  const [filterIndustry, setFilterIndustry] = useState<string[]>(['all']); // Industry filter
  const [sortBy, setSortBy] = useState<'name' | 'reviews' | 'distance' | 'industry'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [distanceFilter, setDistanceFilter] = useState<number>(999); // Max distance in km - default to no limit
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [radiusCenter, setRadiusCenter] = useState<{ lat: number; lon: number } | null>(null); // Custom radius center
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

  // Get user location on mount
  useEffect(() => {
    console.log('Getting user location...');
    getUserLocation()
      .then(location => {
        console.log('User location obtained:', location);
        setUserLocation(location);
      })
      .catch(error => {
        console.log('Location access denied or unavailable:', error);
        // Fallback to Downtown LA coordinates
        const fallbackLocation = { lat: 34.0522, lon: -118.2437 };
        console.log('Using fallback location:', fallbackLocation);
        setUserLocation(fallbackLocation);
      });
  }, []);

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

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Function to get user's current location (for distance sorting)
  const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => reject(error)
        );
      } else {
        reject(new Error('Geolocation is not supported'));
      }
    });
  };

  // Geographical clustering logic to group nearby businesses
  const clusterProspectsByProximity = (prospects: Prospect[], maxDistance: number = 2): Prospect[][] => {
    const clusters: Prospect[][] = [];
    const visited = new Set<string>();
    
    prospects.forEach(prospect => {
      if (visited.has(prospect.id) || !prospect.latitude || !prospect.longitude) return;
      
      const cluster = [prospect];
      visited.add(prospect.id);
      
      // Find all nearby prospects within maxDistance km
      prospects.forEach(otherProspect => {
        if (visited.has(otherProspect.id) || !otherProspect.latitude || !otherProspect.longitude) return;
        
        const distance = calculateDistance(
          prospect.latitude, prospect.longitude,
          otherProspect.latitude, otherProspect.longitude
        );
        
        if (distance <= maxDistance) {
          cluster.push(otherProspect);
          visited.add(otherProspect.id);
        }
      });
      
      clusters.push(cluster);
    });
    
    return clusters;
  };

  // Get optimized route through clustered prospects
  const getOptimizedRoute = (clusters: Prospect[][]): Prospect[] => {
    // Simple nearest-cluster-first algorithm
    // In a real implementation, this would use more sophisticated routing algorithms
    const route: Prospect[] = [];
    const centerLat = 34.0522; // Downtown LA as reference point
    const centerLon = -118.2437;
    
    // Sort clusters by distance from center point
    const sortedClusters = clusters.sort((a, b) => {
      const aCenter = a.reduce((acc, prospect) => ({
        lat: acc.lat + (prospect.latitude || 0),
        lon: acc.lon + (prospect.longitude || 0)
      }), { lat: 0, lon: 0 });
      aCenter.lat /= a.length;
      aCenter.lon /= a.length;
      
      const bCenter = b.reduce((acc, prospect) => ({
        lat: acc.lat + (prospect.latitude || 0),
        lon: acc.lon + (prospect.longitude || 0)
      }), { lat: 0, lon: 0 });
      bCenter.lat /= b.length;
      bCenter.lon /= b.length;
      
      const distA = calculateDistance(centerLat, centerLon, aCenter.lat, aCenter.lon);
      const distB = calculateDistance(centerLat, centerLon, bCenter.lat, bCenter.lon);
      
      return distA - distB;
    });
    
    // Add all prospects from sorted clusters
    sortedClusters.forEach(cluster => {
      // Sort prospects within cluster by reviews (highest first)
      const sortedCluster = cluster.sort((a, b) => b.reviews - a.reviews);
      route.push(...sortedCluster);
    });
    
    return route;
  };

  const filteredProspects = prospects
    .filter(prospect => {
      // Search filter
      const matchesSearch = 
        prospect.shopBusinessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter (multiple selection)
      const matchesStatus = 
        filterStatus.includes('all') ||
        (filterStatus.includes('answered') && prospect.answered === 'yes') ||
        (filterStatus.includes('not-answered') && prospect.answered === 'no') ||
        (filterStatus.includes('interested') && prospect.answered === 'interested');
      
      // Industry filter (multiple selection)
      const matchesIndustry = 
        filterIndustry.includes('all') ||
        filterIndustry.includes(prospect.industryId);
      
      // Distance filter - use radiusCenter if set, otherwise userLocation
      const centerPoint = radiusCenter || userLocation;
      let matchesDistance = true;
      
      if (centerPoint && prospect.latitude && prospect.longitude && distanceFilter !== 999) {
        const distance = calculateDistance(centerPoint.lat, centerPoint.lon, prospect.latitude, prospect.longitude);
        matchesDistance = distance <= distanceFilter;
        
        // Debug logging
        if (prospect.shopBusinessName) {
          console.log(`${prospect.shopBusinessName}: ${distance.toFixed(2)}km from center (${centerPoint.lat.toFixed(4)}, ${centerPoint.lon.toFixed(4)}) (limit: ${distanceFilter}km) - ${matchesDistance ? 'INCLUDED' : 'FILTERED OUT'}`);
        }
      } else {
        console.log(`Prospect ${prospect.shopBusinessName}: No filtering applied - centerPoint: ${!!centerPoint}, has coords: ${!!(prospect.latitude && prospect.longitude)}, filter: ${distanceFilter}`);
      }
      
      return matchesSearch && matchesStatus && matchesIndustry && matchesDistance;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.shopBusinessName.toLowerCase();
          bValue = b.shopBusinessName.toLowerCase();
          break;
        case 'reviews':
          aValue = a.reviews;
          bValue = b.reviews;
          break;
        case 'distance':
          const centerPoint = radiusCenter || userLocation;
          if (centerPoint) {
            aValue = (a.latitude && a.longitude) ? 
              calculateDistance(centerPoint.lat, centerPoint.lon, a.latitude, a.longitude) : 999;
            bValue = (b.latitude && b.longitude) ? 
              calculateDistance(centerPoint.lat, centerPoint.lon, b.latitude, b.longitude) : 999;
          } else {
            aValue = 999;
            bValue = 999;
          }
          break;
        case 'industry':
          const industryA = industries.find(i => i.id === a.industryId)?.name || '';
          const industryB = industries.find(i => i.id === b.industryId)?.name || '';
          aValue = industryA.toLowerCase();
          bValue = industryB.toLowerCase();
          break;
        default:
          aValue = a.shopBusinessName.toLowerCase();
          bValue = b.shopBusinessName.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const filteredScreenshots = screenshots.filter(screenshot => {
    const matchesIndustry = 
      filterIndustry.includes('all') ||
      filterIndustry.includes(screenshot.industryId);
    const matchesSearch = screenshot.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  const getProspectStats = () => {
    const total = filteredProspects.length;
    const answered = filteredProspects.filter(p => p.answered === 'yes').length;
    const noResponse = filteredProspects.filter(p => p.answered === 'no').length;
    const interested = filteredProspects.filter(p => p.answered === 'interested').length;
    
    return { total, answered, noResponse, interested };
  };

  const handleStartRadius = () => {
    console.log('handleStartRadius called, selectedRows:', selectedRows);
    if (selectedRows.length === 0) {
      console.log('No rows selected');
      return;
    }
    
    const selectedProspect = prospects.find(p => p.id === selectedRows[0]);
    console.log('Selected prospect:', selectedProspect);
    
    if (selectedProspect && selectedProspect.latitude && selectedProspect.longitude) {
      console.log('Setting radius center to:', selectedProspect.latitude, selectedProspect.longitude);
      setRadiusCenter({
        lat: selectedProspect.latitude,
        lon: selectedProspect.longitude
      });
      // Auto-sort by distance from selected prospect
      setSortBy('distance');
      setSortOrder('asc');
      // Set a reasonable distance filter
      setDistanceFilter(25);
      console.log('Radius center set successfully');
    } else {
      console.log('Selected prospect has no coordinates');
    }
  };

  const handleResetRadius = () => {
    setRadiusCenter(null);
    setDistanceFilter(999);
  };

  const handleAddRow = () => {
    const newProspect: Prospect = {
      id: crypto.randomUUID(),
      industryId: 'car-detailing', // Default industry
      shopBusinessName: '',
      industry: 'Car Detailing',
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
    
    // Auto-scroll to bottom after adding new row
    setTimeout(() => {
      const tableContainer = document.querySelector('.overflow-y-auto');
      if (tableContainer) {
        tableContainer.scrollTo({
          top: tableContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
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
      ['Shop/Business Name', 'Industry', 'Location', 'Google Maps URL', 'Reviews', 'Email', 'Answered', 'Notes'],
      ...filteredProspects.map(p => [
        p.shopBusinessName,
        p.industry,
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
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newScreenshot: Screenshot = {
          id: crypto.randomUUID(),
          industryId: 'car-detailing', // Default industry
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
        prospectName: prospect.shopBusinessName || prospect.industry || 'Unnamed Prospect'
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

  // Skip the industry selection screen - go directly to all prospects

  const stats = getProspectStats();

  return (
    <div className="flex-1 bg-white flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Prospects</h1>
                <p className="text-gray-600">
                  {radiusCenter ? 'Showing prospects near selected location' : 'Manage your lead generation campaigns'}
                  {radiusCenter && (
                    <button
                      onClick={handleResetRadius}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Reset radius
                    </button>
                  )}
                </p>
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
              {selectedRows.length > 0 && (
                <button
                  onClick={handleStartRadius}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Start Radius</span>
                </button>
              )}
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
                      All Prospects
                    </h2>
                    <p className="text-gray-600">Streamlined lead management with smart features</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{Math.round((stats.answered / stats.total) * 100) || 0}%</div>
                    <div className="text-sm text-gray-500">Response Rate</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${stats.total > 0 ? (stats.answered / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Search and Controls */}
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
                  
                  {/* View Mode Toggle */}
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'table'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span>Table</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'map'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Map className="w-4 h-4" />
                      <span>Map</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Main Sorting Controls */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'reviews' | 'distance' | 'industry')}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="reviews">Sort by Reviews</option>
                      <option value="distance">Sort by Distance</option>
                      <option value="industry">Sort by Industry</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      {sortOrder === 'asc' ? (
                        <Navigation className="w-4 h-4 rotate-180" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Quick Review Filters */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSortBy('reviews');
                        setSortOrder('desc');
                      }}
                      className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                        sortBy === 'reviews' && sortOrder === 'desc'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                      title="Sort by highest reviews first"
                    >
                      <Star className="w-4 h-4" />
                      <span>Best</span>
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('reviews');
                        setSortOrder('asc');
                      }}
                      className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                        sortBy === 'reviews' && sortOrder === 'asc'
                          ? 'bg-gray-200 text-gray-800 border border-gray-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                      title="Sort by lowest reviews first"
                    >
                      <Star className="w-4 h-4" />
                      <span>Worst</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {/* Status Filter Dropdown */}
                  <div className="relative">
                    <select
                      multiple
                      value={filterStatus}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        if (values.includes('all')) {
                          setFilterStatus(['all']);
                        } else {
                          setFilterStatus(values.length > 0 ? values : ['all']);
                        }
                      }}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
                    >
                      <option value="all">All Status</option>
                      <option value="answered">Answered</option>
                      <option value="not-answered">Not Answered</option>
                      <option value="interested">Interested</option>
                    </select>
                  </div>
                  
                  {/* Industry Filter Dropdown */}
                  <div className="relative">
                    <select
                      multiple
                      value={filterIndustry}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        if (values.includes('all')) {
                          setFilterIndustry(['all']);
                        } else {
                          setFilterIndustry(values.length > 0 ? values : ['all']);
                        }
                      }}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-32"
                    >
                      <option value="all">All Industries</option>
                      {industries.map(industry => (
                        <option key={industry.id} value={industry.id}>{industry.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Distance Filter */}
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <select
                      value={distanceFilter}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        console.log('Distance filter changed to:', newValue);
                        setDistanceFilter(newValue);
                      }}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>Within 5km</option>
                      <option value={10}>Within 10km</option>
                      <option value={25}>Within 25km</option>
                      <option value={50}>Within 50km</option>
                      <option value={100}>Within 100km</option>
                      <option value={999}>No distance limit</option>
                    </select>
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

              {/* Conditional View Rendering */}
              {viewMode === 'table' ? (
                /* Table View */
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
                          <th className="text-left p-4 font-medium text-gray-900">Industry</th>
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
              ) : (
                /* Map View */
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="h-96 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Geographic Map View</h3>
                      <p className="text-gray-600 mb-4">
                        This view will show all prospects organized geographically on a map with clustering for nearby businesses.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Click on clusters to zoom in and see individual businesses</p>
                        <p>• Filter by distance radius from your location</p>
                        <p>• Route optimization for visiting nearby prospects</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Geographic Clusters View */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Geographic Clusters</h4>
                      <span className="text-sm text-gray-500">
                        Grouped by proximity (within 2km)
                      </span>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {clusterProspectsByProximity(filteredProspects).map((cluster, clusterIndex) => (
                        <div key={clusterIndex} className="border border-gray-200 rounded-lg">
                          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    Cluster #{clusterIndex + 1}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {cluster.length} prospect{cluster.length !== 1 ? 's' : ''} • {cluster[0]?.location || 'Unknown area'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">
                                  Avg Reviews: {Math.round(cluster.reduce((sum, p) => sum + p.reviews, 0) / cluster.length)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {cluster.filter(p => p.answered === 'yes').length} contacted
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            {cluster.map((prospect, index) => (
                              <div key={prospect.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center border">
                                    <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {prospect.shopBusinessName || 'Unnamed Business'}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {industries.find(i => i.id === prospect.industryId)?.name}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className={`px-2 py-1 rounded-full text-xs ${
                                    prospect.answered === 'yes' ? 'bg-green-100 text-green-800' :
                                    prospect.answered === 'interested' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {prospect.answered === 'yes' ? 'Contacted' : 
                                     prospect.answered === 'interested' ? 'Interested' : 'Not contacted'}
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    <span>{prospect.reviews}</span>
                                  </div>
                                  {prospect.googleMapsUrl && (
                                    <a
                                      href={prospect.googleMapsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-blue-600 hover:text-blue-800"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Route Optimization Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          const clusters = clusterProspectsByProximity(filteredProspects);
                          const optimizedRoute = getOptimizedRoute(clusters);
                          console.log('Optimized route:', optimizedRoute);
                          // In a real implementation, this would update the view or export route
                          alert(`Optimized route created with ${optimizedRoute.length} prospects. Check console for details.`);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Generate Optimized Route</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
        {isEditing('industry') ? (
          <input
            type="text"
            value={prospect.industry}
            onChange={(e) => onUpdate(prospect.id, 'industry', e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => handleKeyDown(e, 'industry')}
            className="w-full border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            onClick={() => handleCellClick('industry')}
            className="cursor-text hover:bg-blue-50 rounded px-2 py-1 min-h-[28px] flex items-center"
          >
            {prospect.industry || 'Click to edit'}
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
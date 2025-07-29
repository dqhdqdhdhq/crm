import { useState } from 'react';
import { Deal, Client } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Search, MoreHorizontal, Edit, Trash2, Eye, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedDealsTableViewProps {
  deals: Deal[];
  clients: Client[];
}

export const EnhancedDealsTableView = ({ deals, clients }: EnhancedDealsTableViewProps) => {
  const { setSelectedDeal, updateDeal, deleteDeal } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Deal>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [editedDealData, setEditedDealData] = useState<Partial<Deal>>({});

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? (client.orgName || `${client.firstName} ${client.lastName}`) : 'Unknown';
  };

  const getStageColor = (stage: Deal['stage']) => {
    const colors = {
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-yellow-100 text-yellow-800',
      negotiation: 'bg-orange-100 text-orange-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[stage] || colors.lead;
  };

  const getHealthIndicator = (deal: Deal) => {
    const score = deal.health?.score || 50;
    if (score >= 80) return { icon: CheckCircle, color: 'text-green-600', label: 'Healthy' };
    if (score >= 60) return { icon: TrendingUp, color: 'text-yellow-600', label: 'At Risk' };
    return { icon: AlertTriangle, color: 'text-red-600', label: 'Critical' };
  };

  const getVelocityTrend = (deal: Deal) => {
    const velocity = deal.health?.velocity || 0;
    const avgVelocity = 30; // days per stage average
    if (velocity < avgVelocity * 0.8) return { icon: TrendingUp, color: 'text-green-600' };
    if (velocity > avgVelocity * 1.2) return { icon: TrendingDown, color: 'text-red-600' };
    return { icon: TrendingUp, color: 'text-gray-600' };
  };

  const calculateWeightedValue = (deal: Deal) => {
    return deal.value * (deal.probability / 100);
  };

  const filteredDeals = deals
    .filter(deal => 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(deal.clientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.tags && deal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });

  const handleSort = (field: keyof Deal) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleDealSelection = (dealId: string) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const selectAllDeals = () => {
    setSelectedDeals(filteredDeals.map(deal => deal.id));
  };

  const clearSelection = () => {
    setSelectedDeals([]);
  };

  const bulkUpdateStage = (newStage: Deal['stage']) => {
    selectedDeals.forEach(dealId => {
      updateDeal(dealId, { stage: newStage });
    });
    clearSelection();
  };

  const handleStartEdit = (deal: Deal) => {
    setEditingDealId(deal.id);
    setEditedDealData(deal);
  };

  const handleCancelEdit = () => {
    setEditingDealId(null);
    setEditedDealData({});
  };

  const handleSaveEdit = () => {
    if (editingDealId && editedDealData) {
      // Ensure value and probability are numbers
      const dataToUpdate = {
        ...editedDealData,
        value: Number(editedDealData.value) || 0,
        probability: Number(editedDealData.probability) || 0,
      };
      updateDeal(editingDealId, dataToUpdate);
    }
    handleCancelEdit();
  };

  const handleEditChange = (field: keyof Deal, value: any) => {
    setEditedDealData(prev => ({ ...prev, [field]: value }));
  };

  const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = filteredDeals.reduce((sum, deal) => sum + calculateWeightedValue(deal), 0);

  return (
    <>
      <div className="space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredDeals.length}</div>
              <div className="text-sm text-gray-600">Total Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
              </div>
              <div className="text-sm text-gray-600">Pipeline Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(weightedValue)}
              </div>
              <div className="text-sm text-gray-600">Weighted Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(filteredDeals.reduce((sum, deal) => sum + deal.probability, 0) / filteredDeals.length) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg. Probability</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Bulk Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search deals, clients, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          {selectedDeals.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{selectedDeals.length} selected</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => bulkUpdateStage('qualified')}>
                    Move to Qualified
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkUpdateStage('proposal')}>
                    Move to Proposal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => bulkUpdateStage('negotiation')}>
                    Move to Negotiation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={clearSelection}>
                    Clear Selection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedDeals.length === filteredDeals.length && filteredDeals.length > 0}
                    onChange={selectedDeals.length === filteredDeals.length ? clearSelection : selectAllDeals}
                    className="rounded"
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('title')}
                >
                  Deal Name
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('value')}
                >
                  Value
                </TableHead>
                <TableHead>Weighted Value</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Velocity</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('stage')}
                >
                  Stage
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('probability')}
                >
                  Probability
                </TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Stakeholders</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => {
                const healthIndicator = getHealthIndicator(deal);
                const velocityTrend = getVelocityTrend(deal);
                const HealthIcon = healthIndicator.icon;
                const VelocityIcon = velocityTrend.icon;
                const isEditing = deal.id === editingDealId;
                
                return (
                  <TableRow 
                    key={deal.id}
                    className={`${isEditing ? 'bg-blue-50' : 'cursor-pointer hover:bg-gray-50'}`}
                    onClick={() => !isEditing && setSelectedDeal(deal)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedDeals.includes(deal.id)}
                        onChange={() => toggleDealSelection(deal.id)}
                        className="rounded"
                        disabled={isEditing}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={editedDealData.title || ''}
                          onChange={(e) => handleEditChange('title', e.target.value)}
                          className="min-w-40"
                        />
                      ) : (
                        <div>
                          <div>{deal.title}</div>
                          {deal.tags && deal.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {deal.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {deal.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{deal.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getClientName(deal.clientId)}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedDealData.value || 0}
                          onChange={(e) => handleEditChange('value', e.target.value)}
                          className="w-28"
                        />
                      ) : (
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: deal.currency
                        }).format(deal.value)
                      )}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: deal.currency
                      }).format(calculateWeightedValue(isEditing ? (editedDealData as Deal) : deal))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <HealthIcon className={`w-4 h-4 ${healthIndicator.color}`} />
                        <span className="text-sm">{deal.health?.score || 50}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <VelocityIcon className={`w-4 h-4 ${velocityTrend.color}`} />
                        <span className="text-sm">{deal.health?.velocity || 0}d</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editedDealData.stage}
                          onValueChange={(value) => handleEditChange('stage', value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStageColor(deal.stage)}>
                          {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editedDealData.probability || 0}
                            onChange={(e) => handleEditChange('probability', e.target.value)}
                            className="w-20"
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Progress value={deal.probability} className="w-16 h-2" />
                          <span className="text-sm">{deal.probability}%</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {deal.expectedClose ? 
                        new Date(deal.expectedClose).toLocaleDateString() : 
                        'Not set'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {deal.stakeholders?.length || 0} stakeholders
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {formatDistanceToNow(deal.lastActivity, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDeal(deal);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(deal);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Deal
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDealToDelete(deal);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Deal
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No deals found matching your search.' : 'No deals yet. Create your first deal to get started.'}
          </div>
        )}
      </div>
      <AlertDialog open={!!dealToDelete} onOpenChange={(open) => !open && setDealToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal "{dealToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDealToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (dealToDelete) {
                  deleteDeal(dealToDelete.id);
                  setDealToDelete(null);
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


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
import { Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DealsTableViewProps {
  deals: Deal[];
  clients: Client[];
}

export const DealsTableView = ({ deals, clients }: DealsTableViewProps) => {
  const { setSelectedDeal, updateDeal, deleteDeal } = useCRMStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Deal>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

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

  const filteredDeals = deals
    .filter(deal => 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(deal.clientId).toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search deals and clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => (
                <TableRow 
                  key={deal.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <TableCell className="font-medium">{deal.title}</TableCell>
                  <TableCell>{getClientName(deal.clientId)}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: deal.currency
                    }).format(deal.value)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStageColor(deal.stage)}>
                      {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{deal.probability}%</TableCell>
                  <TableCell>
                    {deal.expectedClose ? 
                      new Date(deal.expectedClose).toLocaleDateString() : 
                      'Not set'
                    }
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDistanceToNow(deal.lastActivity, { addSuffix: true })}
                  </TableCell>
                  <TableCell>
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
                          // Edit functionality
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
                  </TableCell>
                </TableRow>
              ))}
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

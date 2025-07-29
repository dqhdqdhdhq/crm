import { useState } from 'react';
import { Deal } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../ui/dropdown-menu';
import { 
  ChevronDown, 
  Users, 
  Target, 
  Calendar, 
  Tag,
  Mail,
  Phone,
  AlertTriangle
} from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedDeals: string[];
  deals: Deal[];
  onClearSelection: () => void;
}

export const BulkActionsToolbar = ({ selectedDeals, deals, onClearSelection }: BulkActionsToolbarProps) => {
  const { updateDeal, scheduleFollowUp } = useCRMStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedDealObjects = deals.filter(deal => selectedDeals.includes(deal.id));
  
  const totalValue = selectedDealObjects.reduce((sum, deal) => sum + deal.value, 0);
  const avgProbability = Math.round(
    selectedDealObjects.reduce((sum, deal) => sum + deal.probability, 0) / selectedDealObjects.length
  );

  const handleBulkUpdate = async (updates: Partial<Deal>) => {
    setIsProcessing(true);
    try {
      selectedDeals.forEach(dealId => {
        updateDeal(dealId, updates);
      });
      onClearSelection();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkFollowUp = (type: 'call' | 'email') => {
    const followUpDate = new Date(Date.now() + (type === 'call' ? 24 : 2) * 60 * 60 * 1000);
    selectedDeals.forEach(dealId => {
      scheduleFollowUp(dealId, type, followUpDate);
    });
    onClearSelection();
  };

  const getStageRecommendations = () => {
    const stageDistribution = selectedDealObjects.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recommendations = [];
    
    // If all deals are in lead stage, recommend moving to qualified
    if (stageDistribution.lead === selectedDeals.length) {
      recommendations.push({ stage: 'qualified', reason: 'All selected deals are leads' });
    }
    
    // If deals have high probability but low stage, recommend advancement
    const highProbDeals = selectedDealObjects.filter(deal => deal.probability > 70).length;
    if (highProbDeals > selectedDeals.length * 0.5) {
      recommendations.push({ stage: 'negotiation', reason: 'High probability deals detected' });
    }

    return recommendations;
  };

  const recommendations = getStageRecommendations();

  if (selectedDeals.length === 0) return null;

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedDeals.length} selected
              </Badge>
              <span className="text-sm text-gray-600">
                Total: {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD' 
                }).format(totalValue)}
              </span>
              <span className="text-sm text-gray-600">
                Avg Probability: {avgProbability}%
              </span>
            </div>

            {recommendations.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-700">
                  {recommendations[0].reason}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Stage Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  <Target className="w-4 h-4 mr-2" />
                  Update Stage
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {recommendations.map((rec, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => handleBulkUpdate({ stage: rec.stage as Deal['stage'] })}
                    className="text-blue-600 font-medium"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Move to {rec.stage.charAt(0).toUpperCase() + rec.stage.slice(1)}
                  </DropdownMenuItem>
                ))}
                {recommendations.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => handleBulkUpdate({ stage: 'qualified' })}>
                  Move to Qualified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkUpdate({ stage: 'proposal' })}>
                  Move to Proposal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkUpdate({ stage: 'negotiation' })}>
                  Move to Negotiation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Follow-up Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Follow-up
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkFollowUp('call')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule Calls (Tomorrow)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkFollowUp('email')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Schedule Emails (2 hours)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Other Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  More Actions
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkUpdate({ tags: [...(selectedDealObjects[0]?.tags || []), 'bulk-updated'] })}>
                  <Tag className="w-4 h-4 mr-2" />
                  Add Tag
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkUpdate({ probability: Math.min(avgProbability + 10, 100) })}>
                  <Target className="w-4 h-4 mr-2" />
                  Increase Probability by 10%
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import { useState } from 'react';
import { Deal, Client } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';

interface DealsPipelineViewProps {
  deals: Deal[];
  clients: Client[];
  onAddDeal: () => void;
}

const PIPELINE_STAGES = [
  { key: 'lead', label: 'Lead', color: 'bg-gray-100' },
  { key: 'qualified', label: 'Qualified', color: 'bg-blue-100' },
  { key: 'proposal', label: 'Proposal', color: 'bg-yellow-100' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
  { key: 'won', label: 'Won', color: 'bg-green-100' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100' }
] as const;

export const DealsPipelineView = ({ deals, clients, onAddDeal }: DealsPipelineViewProps) => {
  const { updateDeal, setSelectedDeal } = useCRMStore();
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? (client.orgName || `${client.firstName} ${client.lastName}`) : 'Unknown';
  };

  const getDealsForStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getStageTotal = (stage: string) => {
    return getDealsForStage(stage).reduce((total, deal) => total + deal.value, 0);
  };

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== targetStage) {
      updateDeal(draggedDeal.id, { 
        stage: targetStage as Deal['stage'],
        lastActivity: new Date()
      });
    }
    setDraggedDeal(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageDeals = getDealsForStage(stage.key);
        const stageTotal = getStageTotal(stage.key);

        return (
          <div
            key={stage.key}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            <Card className="h-full">
              <CardHeader className={`${stage.color} border-b`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {stage.label}
                    <Badge variant="secondary" className="ml-2">
                      {stageDeals.length}
                    </Badge>
                  </CardTitle>
                </div>
                <div className="text-xs text-gray-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(stageTotal)}
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 min-h-96">
                {stageDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{deal.title}</h4>
                        <p className="text-xs text-gray-600">
                          {getClientName(deal.clientId)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: deal.currency
                            }).format(deal.value)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {deal.probability}%
                          </Badge>
                        </div>
                        {deal.expectedClose && (
                          <p className="text-xs text-gray-500">
                            Expected: {new Date(deal.expectedClose).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full border-dashed"
                  onClick={() => {
                    onAddDeal();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

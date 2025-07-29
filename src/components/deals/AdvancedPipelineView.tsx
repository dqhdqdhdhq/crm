
import { useState } from 'react';
import { Deal, Client } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';

interface AdvancedPipelineViewProps {
  deals: Deal[];
  clients: Client[];
}

const ADVANCED_STAGES = [
  { 
    key: 'lead', 
    label: 'Lead', 
    color: 'bg-gray-100',
    conversionRate: 25,
    avgDays: 7
  },
  { 
    key: 'qualified', 
    label: 'Qualified', 
    color: 'bg-blue-100',
    conversionRate: 45,
    avgDays: 14
  },
  { 
    key: 'proposal', 
    label: 'Proposal', 
    color: 'bg-yellow-100',
    conversionRate: 65,
    avgDays: 21
  },
  { 
    key: 'negotiation', 
    label: 'Negotiation', 
    color: 'bg-orange-100',
    conversionRate: 80,
    avgDays: 10
  },
  { 
    key: 'won', 
    label: 'Won', 
    color: 'bg-green-100',
    conversionRate: 100,
    avgDays: 0
  },
  { 
    key: 'lost', 
    label: 'Lost', 
    color: 'bg-red-100',
    conversionRate: 0,
    avgDays: 0
  }
] as const;

export const AdvancedPipelineView = ({ deals, clients }: AdvancedPipelineViewProps) => {
  const { updateDeal, setSelectedDeal, calculateAdvancedDealScore } = useCRMStore();
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [showMetrics, setShowMetrics] = useState(true);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? (client.orgName || `${client.firstName} ${client.lastName}`) : 'Unknown';
  };

  const getDealsForStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getStageMetrics = (stage: string) => {
    const stageDeals = getDealsForStage(stage);
    const total = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
    const avgScore = stageDeals.length > 0 
      ? stageDeals.reduce((sum, deal) => sum + calculateAdvancedDealScore(deal.id), 0) / stageDeals.length
      : 0;
    
    return { total, avgScore, count: stageDeals.length };
  };

  const getDealRisk = (deal: Deal) => {
    const score = calculateAdvancedDealScore(deal.id);
    if (score >= 80) return { level: 'low', color: 'text-green-600' };
    if (score >= 60) return { level: 'medium', color: 'text-yellow-600' };
    return { level: 'high', color: 'text-red-600' };
  };

  const getDaysInStage = (deal: Deal) => {
    return Math.floor((Date.now() - deal.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
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
    <div className="space-y-4">
      {/* Pipeline Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={showMetrics ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Show Metrics
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          Total Pipeline Value: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(deals.reduce((sum, deal) => sum + deal.value, 0))}
        </div>
      </div>

      {/* Advanced Pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ADVANCED_STAGES.map((stage) => {
          const stageDeals = getDealsForStage(stage.key);
          const metrics = getStageMetrics(stage.key);

          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <Card className="h-full">
                <CardHeader className={`${stage.color} border-b`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {stage.label}
                        <Badge variant="secondary" className="ml-2">
                          {metrics.count}
                        </Badge>
                      </CardTitle>
                      {stage.conversionRate > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {stage.conversionRate}%
                        </Badge>
                      )}
                    </div>
                    
                    {showMetrics && (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Value:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              notation: 'compact'
                            }).format(metrics.total)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg AI Score:</span>
                          <span className="font-medium">{Math.round(metrics.avgScore)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Days:</span>
                          <span className="font-medium">{stage.avgDays}d</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-3 space-y-3 min-h-96">
                  {stageDeals.map((deal) => {
                    const risk = getDealRisk(deal);
                    const daysInStage = getDaysInStage(deal);
                    const aiScore = calculateAdvancedDealScore(deal.id);
                    
                    return (
                      <Card
                        key={deal.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                        style={{ 
                          borderLeftColor: risk.level === 'high' ? '#ef4444' : 
                                         risk.level === 'medium' ? '#f59e0b' : '#10b981'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onClick={() => setSelectedDeal(deal)}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-3">
                            {/* Deal Header */}
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">{deal.title}</h4>
                              <div className="flex items-center gap-1">
                                {aiScore < 50 && <AlertCircle className="w-3 h-3 text-red-500" />}
                                {aiScore >= 80 && <Zap className="w-3 h-3 text-green-500" />}
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-600">
                              {getClientName(deal.clientId)}
                            </p>
                            
                            {/* Value and Probability */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: deal.currency,
                                  notation: 'compact'
                                }).format(deal.value)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {deal.probability}%
                              </Badge>
                            </div>
                            
                            {/* AI Score Progress */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>AI Score:</span>
                                <span className={risk.color}>{aiScore}%</span>
                              </div>
                              <Progress value={aiScore} className="h-2" />
                            </div>
                            
                            {/* Timeline Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{daysInStage}d in stage</span>
                              </div>
                              {deal.expectedClose && (
                                <span>
                                  Due: {new Date(deal.expectedClose).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            
                            {/* Risk Indicators */}
                            {(daysInStage > 30 || aiScore < 40) && (
                              <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                <AlertCircle className="w-3 h-3" />
                                <span>Needs attention</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed"
                    onClick={() => {
                      console.log(`Add deal to ${stage.key} stage`);
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
    </div>
  );
};

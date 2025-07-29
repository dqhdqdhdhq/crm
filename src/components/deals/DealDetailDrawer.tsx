import { useState } from 'react';
import { Deal, Client } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../ui/dialog';
import { 
  Calendar,
  DollarSign,
  User,
  Clock,
  TrendingUp,
  Activity,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DealScoringPanel } from './DealScoringPanel';
import { DealActivityTimeline } from './DealActivityTimeline';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { SmartFollowUpPanel } from './SmartFollowUpPanel';

interface DealDetailDrawerProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
}

export const DealDetailDrawer = ({ deal, isOpen, onClose, clients }: DealDetailDrawerProps) => {
  const { updateDeal, activities } = useCRMStore();
  const [activeTab, setActiveTab] = useState('overview');

  const client = clients.find(c => c.id === deal.clientId);
  const clientName = client ? (client.orgName || `${client.firstName} ${client.lastName}`) : 'Unknown Client';

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

  const dealActivities = activities.filter(activity => 
    activity.parentType === 'deal' && activity.parentId === deal.id
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ai-insights', label: 'AI Insights' },
    { id: 'follow-up', label: 'Follow-up' },
    { id: 'activity', label: 'Activity' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{deal.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Deal Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Deal Overview
                      <Badge className={getStageColor(deal.stage)}>
                        {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Client</p>
                          <p className="font-medium">{clientName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Value</p>
                          <p className="font-medium text-green-600">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: deal.currency
                            }).format(deal.value)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Probability</p>
                          <p className="font-medium">{deal.probability}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Expected Close</p>
                          <p className="font-medium">
                            {deal.expectedClose ? 
                              new Date(deal.expectedClose).toLocaleDateString() : 
                              'Not set'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {deal.lostReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Lost Reason</p>
                        <p className="text-sm text-red-600">{deal.lostReason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'ai-insights' && (
              <AIRecommendationsPanel deal={deal} client={client} />
            )}

            {activeTab === 'follow-up' && (
              <SmartFollowUpPanel deal={deal} />
            )}

            {activeTab === 'activity' && (
              <DealActivityTimeline deal={deal} activities={dealActivities} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Scoring Panel */}
            <DealScoringPanel deal={deal} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Edit Deal
                </Button>
                <Button className="w-full" variant="outline">
                  Add Note
                </Button>
                <Button className="w-full" variant="outline">
                  Schedule Follow-up
                </Button>
                <Button className="w-full" variant="outline">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* Deal Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">
                    {formatDistanceToNow(deal.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Activity</span>
                  <span className="text-sm font-medium">
                    {formatDistanceToNow(deal.lastActivity, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Activities</span>
                  <span className="text-sm font-medium">{dealActivities.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

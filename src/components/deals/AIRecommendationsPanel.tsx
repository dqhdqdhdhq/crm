
import { useState, useEffect } from 'react';
import { Deal, Client } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react';

interface AIRecommendationsPanelProps {
  deal: Deal;
  client?: Client;
}

export const AIRecommendationsPanel = ({ deal, client }: AIRecommendationsPanelProps) => {
  const { generateDealRecommendations, scheduleFollowUp, calculateAdvancedDealScore } = useCRMStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [aiScore, setAiScore] = useState(0);

  useEffect(() => {
    // Generate AI recommendations when component mounts
    generateDealRecommendations(deal.id);
    setAiScore(calculateAdvancedDealScore(deal.id));
    
    // Get recommendations from deal metadata
    if (deal.aiRecommendations) {
      setRecommendations(deal.aiRecommendations);
    }
  }, [deal.id, deal.aiRecommendations]);

  const handleExecuteRecommendation = (rec: any) => {
    switch (rec.action || rec.type) {
      case 'call':
        scheduleFollowUp(deal.id, 'call', new Date(Date.now() + 24 * 60 * 60 * 1000));
        break;
      case 'email':
        scheduleFollowUp(deal.id, 'email', new Date(Date.now() + 2 * 60 * 60 * 1000));
        break;
      case 'action':
        scheduleFollowUp(deal.id, 'call', new Date(Date.now() + 24 * 60 * 60 * 1000));
        break;
      default:
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'action': return <TrendingUp className="w-4 h-4" />;
      case 'insight': return <Brain className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Recommendations
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">AI Confidence Score:</span>
          <Badge variant="outline" className="text-purple-600">
            {aiScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getActionIcon(rec.type)}
                <h4 className="font-medium text-sm">{rec.title}</h4>
                <Badge 
                  variant={rec.priority === 'high' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {rec.priority}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">{rec.confidence}% confident</span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant={rec.priority === 'high' ? 'default' : 'outline'}
                onClick={() => handleExecuteRecommendation(rec)}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Execute
              </Button>
              <Button size="sm" variant="ghost">
                <X className="w-3 h-3 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Generating AI recommendations...</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => generateDealRecommendations(deal.id)}
              className="mt-2"
            >
              Generate Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

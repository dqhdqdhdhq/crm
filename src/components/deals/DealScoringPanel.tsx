
import { useState, useEffect } from 'react';
import { Deal } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users,
  RefreshCw 
} from 'lucide-react';

interface DealScoringPanelProps {
  deal: Deal;
}

export const DealScoringPanel = ({ deal }: DealScoringPanelProps) => {
  const { calculateAdvancedDealScore, clients } = useCRMStore();
  const [score, setScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const recalculateScore = async () => {
    setIsCalculating(true);
    // Simulate calculation delay
    setTimeout(() => {
      const newScore = calculateAdvancedDealScore(deal.id);
      setScore(newScore);
      setIsCalculating(false);
    }, 1000);
  };

  useEffect(() => {
    setScore(calculateAdvancedDealScore(deal.id));
  }, [deal.id]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Priority';
    if (score >= 60) return 'Medium Priority';
    return 'Low Priority';
  };

  // Get client for relationship scoring
  const client = clients.find(c => c.id === deal.clientId);
  const clientRelationshipScore = client?.relationships?.length > 0 ? 85 : 75;

  const scoreFactors = [
    {
      label: 'Base Probability',
      value: deal.probability,
      icon: <Target className="w-4 h-4" />
    },
    {
      label: 'Deal Value',
      value: deal.value > 50000 ? 95 : deal.value > 20000 ? 75 : 50,
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      label: 'Deal Stage',
      value: deal.stage === 'negotiation' ? 85 : deal.stage === 'proposal' ? 65 : 45,
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      label: 'Client Relationship',
      value: clientRelationshipScore,
      icon: <Users className="w-4 h-4" />
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Deal Score
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={recalculateScore}
            disabled={isCalculating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <Badge variant="outline" className={`mt-2 ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </Badge>
          <Progress value={score} className="mt-4" />
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Score Factors</h4>
          {scoreFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {factor.icon}
                <span className="text-sm text-gray-600">{factor.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={factor.value} className="w-16 h-2" />
                <span className="text-sm font-medium">{factor.value}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations based on score */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-1">Recommendation</h5>
          <p className="text-sm text-blue-700">
            {score >= 80 
              ? 'This deal has high potential. Focus on closing activities.'
              : score >= 60 
              ? 'Good opportunity. Consider increasing engagement.'
              : 'Low priority. Review qualification criteria.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

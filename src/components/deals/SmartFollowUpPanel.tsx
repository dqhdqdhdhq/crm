
import { useState } from 'react';
import { Deal } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare,
  Zap
} from 'lucide-react';

interface SmartFollowUpPanelProps {
  deal: Deal;
}

export const SmartFollowUpPanel = ({ deal }: SmartFollowUpPanelProps) => {
  const { scheduleFollowUp } = useCRMStore();
  const [selectedType, setSelectedType] = useState<string>('call');
  const [selectedTiming, setSelectedTiming] = useState<string>('1-day');

  const followUpTypes = [
    { value: 'call', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'meeting', label: 'Meeting', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const timingOptions = [
    { value: '2-hours', label: 'In 2 hours', date: new Date(Date.now() + 2 * 60 * 60 * 1000) },
    { value: '1-day', label: 'Tomorrow', date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { value: '3-days', label: 'In 3 days', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { value: '1-week', label: 'Next week', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  ];

  const handleScheduleFollowUp = () => {
    const timing = timingOptions.find(t => t.value === selectedTiming);
    if (timing) {
      scheduleFollowUp(deal.id, selectedType, timing.date);
    }
  };

  const getAIRecommendation = () => {
    const score = Math.random() * 100; // Simulate AI recommendation
    if (score > 80) {
      return { type: 'call', timing: '2-hours', confidence: 94 };
    } else if (score > 60) {
      return { type: 'email', timing: '1-day', confidence: 78 };
    } else {
      return { type: 'meeting', timing: '1-week', confidence: 62 };
    }
  };

  const aiRec = getAIRecommendation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-600" />
          Smart Follow-up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Recommendation */}
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-orange-900">AI Recommendation</span>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              {aiRec.confidence}% confident
            </Badge>
          </div>
          <p className="text-sm text-orange-700">
            Schedule a {aiRec.type} {timingOptions.find(t => t.value === aiRec.timing)?.label.toLowerCase()} 
            based on deal momentum and client engagement patterns.
          </p>
        </div>

        {/* Manual Scheduling */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Follow-up Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {followUpTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Timing</label>
            <Select value={selectedTiming} onValueChange={setSelectedTiming}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleScheduleFollowUp} className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Follow-up
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedType('call');
              setSelectedTiming('2-hours');
              handleScheduleFollowUp();
            }}
          >
            <Phone className="w-3 h-3 mr-1" />
            Call Now
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedType('email');
              setSelectedTiming('1-day');
              handleScheduleFollowUp();
            }}
          >
            <Mail className="w-3 h-3 mr-1" />
            Email Tomorrow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

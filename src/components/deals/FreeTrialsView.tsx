
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrialSheet } from './TrialSheet';
import { TrialIndustrySelector } from './TrialIndustrySelector';
import { useCRMStore } from '../../../stores/crmStore';
import { BarChart3, Clock, TrendingUp, DollarSign, Users, Target } from 'lucide-react';

export const FreeTrialsView = () => {
  const { freeTrials } = useCRMStore();
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const activeTrials = freeTrials.filter(t => t.status === 'active');
  const convertedTrials = freeTrials.filter(t => t.status === 'converted');
  const totalRevenue = freeTrials.reduce((sum, trial) => sum + trial.trialAmountPaid, 0);
  const conversionRate = freeTrials.length > 0 ? (convertedTrials.length / freeTrials.length) * 100 : 0;

  const trialStats = [
    {
      title: 'Active Trials',
      value: activeTrials.length,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Trials',
      value: freeTrials.length,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Trial Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {trialStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="trials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trials" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Trials Manager
          </TabsTrigger>
          <TabsTrigger value="industries" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Industry Insights
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trials" className="space-y-4">
          <TrialSheet />
        </TabsContent>

        <TabsContent value="industries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Performance Analysis</CardTitle>
              <p className="text-sm text-gray-500">
                Select an industry to see detailed conversion metrics and benchmarks
              </p>
            </CardHeader>
            <CardContent>
              <TrialIndustrySelector
                selectedIndustry={selectedIndustry}
                onSelectIndustry={setSelectedIndustry}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trial Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['active', 'completed', 'converted', 'expired'].map((status) => {
                    const count = freeTrials.filter(t => t.status === status).length;
                    const percentage = freeTrials.length > 0 ? (count / freeTrials.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                          <span className="text-sm text-gray-600">{count} trials</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-12">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Trial Value</span>
                    <span className="font-medium">
                      ${freeTrials.length > 0 ? (totalRevenue / freeTrials.length).toFixed(0) : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Duration</span>
                    <span className="font-medium">
                      {freeTrials.length > 0 ? 
                        Math.round(freeTrials.reduce((sum, t) => sum + t.trialDuration, 0) / freeTrials.length) 
                        : 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-medium text-green-600">
                      {conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trials This Month</span>
                    <span className="font-medium">
                      {freeTrials.filter(t => {
                        const trialDate = new Date(t.createdAt);
                        const now = new Date();
                        return trialDate.getMonth() === now.getMonth() && 
                               trialDate.getFullYear() === now.getFullYear();
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

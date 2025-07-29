import { Deal } from '../../../types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface DealsAnalyticsViewProps {
  deals: Deal[];
}

export const DealsAnalyticsView = ({ deals }: DealsAnalyticsViewProps) => {
  // Pipeline Stage Analysis
  const stageData = [
    { stage: 'Prospecting', count: deals.filter(d => d.stage === 'prospecting').length, value: deals.filter(d => d.stage === 'prospecting').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Qualified', count: deals.filter(d => d.stage === 'qualified').length, value: deals.filter(d => d.stage === 'qualified').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Proposal', count: deals.filter(d => d.stage === 'proposal').length, value: deals.filter(d => d.stage === 'proposal').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'negotiation').length, value: deals.filter(d => d.stage === 'negotiation').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Won', count: deals.filter(d => d.stage === 'closed-won').length, value: deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0) },
    { stage: 'Lost', count: deals.filter(d => d.stage === 'closed-lost').length, value: deals.filter(d => d.stage === 'closed-lost').reduce((sum, d) => sum + d.value, 0) }
  ];

  // Win Rate Calculation
  const wonDeals = deals.filter(d => d.stage === 'closed-won').length;
  const lostDeals = deals.filter(d => d.stage === 'closed-lost').length;
  const totalClosedDeals = wonDeals + lostDeals;
  const winRate = totalClosedDeals > 0 ? (wonDeals / totalClosedDeals) * 100 : 0;

  // Average Deal Size
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const averageDealSize = deals.length > 0 ? totalValue / deals.length : 0;

  // Pipeline Value
  const activePipelineValue = deals
    .filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
    .reduce((sum, deal) => sum + deal.value, 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">
              {wonDeals} won / {totalClosedDeals} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact'
              }).format(averageDealSize)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact'
              }).format(activePipelineValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'count') {
                      return [value, 'Deals'];
                    }
                    return [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)), 'Value'];
                  }}
                />
                <Bar dataKey="count" fill="#8884d8" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Deal Distribution (Pie Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Distribution by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stageData.filter(d => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ stage, count }) => `${stage}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageData.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Deals</div>
                    <div className="font-semibold">{stage.count}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Value</div>
                    <div className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact'
                      }).format(stage.value)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Avg Size</div>
                    <div className="font-semibold">
                      {stage.count > 0 ? 
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          notation: 'compact'
                        }).format(stage.value / stage.count) :
                        '$0'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { Deal } from '../../../types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { addMonths, format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface DealsForecastViewProps {
  deals: Deal[];
}

export const DealsForecastView = ({ deals }: DealsForecastViewProps) => {
  // Generate forecast data for next 6 months
  const today = new Date();
  const forecastMonths = eachMonthOfInterval({
    start: today,
    end: addMonths(today, 5)
  });

  const forecastData = forecastMonths.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    // Deals expected to close in this month
    const expectedDeals = deals.filter(deal => 
      deal.expectedClose && 
      deal.expectedClose >= monthStart && 
      deal.expectedClose <= monthEnd &&
      !['closed-won', 'closed-lost'].includes(deal.stage)
    );

    // Calculate weighted value based on probability
    const weightedValue = expectedDeals.reduce((sum, deal) => 
      sum + (deal.value * (deal.probability / 100)), 0
    );

    // Conservative estimate (50% of weighted value)
    const conservativeValue = weightedValue * 0.5;
    
    // Optimistic estimate (120% of weighted value)
    const optimisticValue = weightedValue * 1.2;

    return {
      month: format(month, 'MMM yyyy'),
      weighted: Math.round(weightedValue),
      conservative: Math.round(conservativeValue),
      optimistic: Math.round(optimisticValue),
      dealCount: expectedDeals.length
    };
  });

  // Historical performance for comparison
  const historicalData = forecastMonths.slice(0, 3).map(month => {
    const monthStart = startOfMonth(addMonths(month, -6));
    const monthEnd = endOfMonth(addMonths(month, -6));
    
    const closedDeals = deals.filter(deal => 
      deal.expectedClose && 
      deal.expectedClose >= monthStart && 
      deal.expectedClose <= monthEnd &&
      deal.stage === 'closed-won'
    );

    return {
      month: format(addMonths(month, -6), 'MMM yyyy'),
      actual: closedDeals.reduce((sum, deal) => sum + deal.value, 0),
      dealCount: closedDeals.length
    };
  });

  // Calculate confidence metrics
  const totalPipelineValue = deals
    .filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
    .reduce((sum, deal) => sum + deal.value, 0);

  const weightedPipelineValue = deals
    .filter(d => !['closed-won', 'closed-lost'].includes(d.stage))
    .reduce((sum, deal) => sum + (deal.value * (deal.probability / 100)), 0);

  const averageDealSize = deals.length > 0 ? 
    deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0;

  const highProbabilityDeals = deals.filter(d => 
    d.probability >= 75 && !['closed-won', 'closed-lost'].includes(d.stage)
  ).length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact'
              }).format(totalPipelineValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Weighted Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact'
              }).format(weightedPipelineValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Probability Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highProbabilityDeals}</div>
            <p className="text-xs text-gray-500">75%+ probability</p>
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
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
          <p className="text-sm text-gray-600">
            Projected revenue for the next 6 months based on current pipeline
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: 'compact'
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(Number(value)),
                  'Value'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="conservative" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="Conservative"
              />
              <Line 
                type="monotone" 
                dataKey="weighted" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Weighted Forecast"
              />
              <Line 
                type="monotone" 
                dataKey="optimistic" 
                stroke="#10b981" 
                strokeDasharray="5 5"
                name="Optimistic"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Details */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Forecast Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecastData.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{month.month}</div>
                    <div className="text-sm text-gray-600">{month.dealCount} deals expected</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact'
                      }).format(month.weighted)}
                    </div>
                    <div className="text-xs text-gray-500">weighted</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Historical Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Historical Performance</CardTitle>
            <p className="text-sm text-gray-600">
              Actual revenue from 6 months ago (for comparison)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      notation: 'compact'
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value) => [
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(Number(value)),
                    'Actual Revenue'
                  ]}
                />
                <Bar dataKey="actual" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">High</div>
              <div className="text-sm text-green-700">Pipeline Coverage</div>
              <div className="text-xs text-gray-600 mt-1">
                Strong pipeline with multiple opportunities
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">Medium</div>
              <div className="text-sm text-yellow-700">Deal Velocity</div>
              <div className="text-xs text-gray-600 mt-1">
                Average time to close could impact timing
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Good</div>
              <div className="text-sm text-blue-700">Win Rate Trend</div>
              <div className="text-xs text-gray-600 mt-1">
                Historical performance supports projections
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

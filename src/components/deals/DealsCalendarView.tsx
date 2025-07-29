
import { useState } from 'react';
import { Deal, Client } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Calendar } from '../../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface DealsCalendarViewProps {
  deals: Deal[];
  clients: Client[];
}

export const DealsCalendarView = ({ deals, clients }: DealsCalendarViewProps) => {
  const { setSelectedDeal } = useCRMStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? (client.orgName || `${client.firstName} ${client.lastName}`) : 'Unknown';
  };

  const getDealsForDate = (date: Date) => {
    return deals.filter(deal => 
      deal.expectedClose && isSameDay(new Date(deal.expectedClose), date)
    );
  };

  const getDealsForSelectedDate = () => {
    return getDealsForDate(selectedDate);
  };

  const getStageColor = (stage: Deal['stage']) => {
    const colors = {
      lead: 'bg-gray-500',
      qualified: 'bg-blue-500',
      proposal: 'bg-yellow-500',
      negotiation: 'bg-orange-500',
      won: 'bg-green-500',
      lost: 'bg-red-500'
    };
    return colors[stage] || colors.lead;
  };

  // Get all dates in the current month that have deals
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const datesWithDeals = daysInMonth.filter(date => 
    getDealsForDate(date).length > 0
  );

  const modifiers = {
    hasDeals: datesWithDeals
  };

  const modifiersStyles = {
    hasDeals: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '50%'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Deal Calendar</CardTitle>
            <p className="text-sm text-gray-600">
              View deals by expected close date
            </p>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={viewDate}
              onMonthChange={setViewDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {getDealsForSelectedDate().length} deal(s) expected to close
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {getDealsForSelectedDate().length === 0 ? (
              <p className="text-gray-500 text-sm">No deals scheduled for this date.</p>
            ) : (
              getDealsForSelectedDate().map((deal) => (
                <Card
                  key={deal.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{deal.title}</h4>
                        <div className={`w-3 h-3 rounded-full ${getStageColor(deal.stage)}`} />
                      </div>
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
                          {deal.stage}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Probability: {deal.probability}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Month Summary */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {format(viewDate, 'MMMM yyyy')} Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Deals:</span>
                <span className="font-medium">
                  {deals.filter(deal => 
                    deal.expectedClose && 
                    format(new Date(deal.expectedClose), 'yyyy-MM') === format(viewDate, 'yyyy-MM')
                  ).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-medium text-green-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(
                    deals
                      .filter(deal => 
                        deal.expectedClose && 
                        format(new Date(deal.expectedClose), 'yyyy-MM') === format(viewDate, 'yyyy-MM')
                      )
                      .reduce((sum, deal) => sum + deal.value, 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


import { useState } from 'react';
import { Deal, Client, Activity } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Calendar } from '../../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';
import { Phone, Mail, Calendar as CalendarIcon, Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface EnhancedDealsCalendarViewProps {
  deals: Deal[];
  clients: Client[];
}

export const EnhancedDealsCalendarView = ({ deals, clients }: EnhancedDealsCalendarViewProps) => {
  const { setSelectedDeal, activities, scheduleFollowUp } = useCRMStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'deals' | 'activities' | 'both'>('both');

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? (client.orgName || `${client.firstName} ${client.lastName}`) : 'Unknown';
  };

  const getDealsForDate = (date: Date) => {
    return deals.filter(deal => 
      deal.expectedClose && isSameDay(new Date(deal.expectedClose), date)
    );
  };

  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => 
      isSameDay(activity.ts, date) && activity.parentType === 'deal'
    );
  };

  const getDealsForSelectedDate = () => {
    return getDealsForDate(selectedDate);
  };

  const getActivitiesForSelectedDate = () => {
    return getActivitiesForDate(selectedDate);
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

  const getHealthIndicator = (deal: Deal) => {
    const score = deal.health?.score || 50;
    if (score >= 80) return { icon: CheckCircle, color: 'text-green-600' };
    if (score >= 60) return { icon: AlertTriangle, color: 'text-yellow-600' };
    return { icon: AlertTriangle, color: 'text-red-600' };
  };

  const getDealUrgency = (deal: Deal) => {
    if (!deal.expectedClose) return 'normal';
    const daysToClose = Math.floor((new Date(deal.expectedClose).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysToClose <= 3) return 'urgent';
    if (daysToClose <= 7) return 'soon';
    return 'normal';
  };

  const getActivityIcon = (kind: Activity['kind']) => {
    switch (kind) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meet': return Users;
      default: return CalendarIcon;
    }
  };

  // Get all dates in the current month that have deals or activities
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const datesWithContent = daysInMonth.filter(date => {
    const hasDeals = getDealsForDate(date).length > 0;
    const hasActivities = getActivitiesForDate(date).length > 0;
    
    if (viewMode === 'deals') return hasDeals;
    if (viewMode === 'activities') return hasActivities;
    return hasDeals || hasActivities;
  });

  const modifiers = {
    hasContent: datesWithContent
  };

  const modifiersStyles = {
    hasContent: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '50%'
    }
  };

  const scheduleQuickFollowUp = (dealId: string, type: 'call' | 'email') => {
    const followUpDate = addDays(new Date(), type === 'call' ? 1 : 0);
    scheduleFollowUp(dealId, type, followUpDate);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Deal Calendar</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'deals' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('deals')}
                >
                  Deals
                </Button>
                <Button
                  variant={viewMode === 'activities' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('activities')}
                >
                  Activities
                </Button>
                <Button
                  variant={viewMode === 'both' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('both')}
                >
                  Both
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              View deals and activities by date
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
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {getDealsForSelectedDate().length} deal(s), {getActivitiesForSelectedDate().length} activit(ies)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deals Section */}
            {(viewMode === 'deals' || viewMode === 'both') && (
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Expected Closes
                </h4>
                {getDealsForSelectedDate().length === 0 ? (
                  <p className="text-gray-500 text-sm">No deals closing today.</p>
                ) : (
                  <div className="space-y-2">
                    {getDealsForSelectedDate().map((deal) => {
                      const urgency = getDealUrgency(deal);
                      const healthIndicator = getHealthIndicator(deal);
                      const HealthIcon = healthIndicator.icon;
                      
                      return (
                        <Card
                          key={deal.id}
                          className={`cursor-pointer hover:shadow-md transition-shadow ${
                            urgency === 'urgent' ? 'border-red-200 bg-red-50' :
                            urgency === 'soon' ? 'border-yellow-200 bg-yellow-50' :
                            'border-gray-200'
                          }`}
                          onClick={() => setSelectedDeal(deal)}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{deal.title}</h4>
                                <div className="flex items-center gap-1">
                                  <HealthIcon className={`w-3 h-3 ${healthIndicator.color}`} />
                                  <div className={`w-3 h-3 rounded-full ${getStageColor(deal.stage)}`} />
                                </div>
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
                                  {deal.probability}%
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    scheduleQuickFollowUp(deal.id, 'call');
                                  }}
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  Call
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    scheduleQuickFollowUp(deal.id, 'email');
                                  }}
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Activities Section */}
            {(viewMode === 'activities' || viewMode === 'both') && (
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Activities
                </h4>
                {getActivitiesForSelectedDate().length === 0 ? (
                  <p className="text-gray-500 text-sm">No activities today.</p>
                ) : (
                  <div className="space-y-2">
                    {getActivitiesForSelectedDate().map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.kind);
                      const deal = deals.find(d => d.id === activity.parentId);
                      
                      return (
                        <div key={activity.id} className="p-2 border rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2 mb-1">
                            <ActivityIcon className="w-3 h-3" />
                            <span className="text-sm font-medium">{activity.title}</span>
                          </div>
                          {deal && (
                            <p className="text-xs text-gray-600">
                              Deal: {deal.title}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {format(activity.ts, 'HH:mm')} - {activity.user}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Month Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(viewDate, 'MMMM yyyy')} Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Closing Deals:</span>
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
              <div className="flex justify-between">
                <span>Weighted Value:</span>
                <span className="font-medium text-blue-600">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(
                    deals
                      .filter(deal => 
                        deal.expectedClose && 
                        format(new Date(deal.expectedClose), 'yyyy-MM') === format(viewDate, 'yyyy-MM')
                      )
                      .reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>At Risk Deals:</span>
                <span className="font-medium text-red-600">
                  {deals.filter(deal => 
                    deal.expectedClose && 
                    format(new Date(deal.expectedClose), 'yyyy-MM') === format(viewDate, 'yyyy-MM') &&
                    (deal.health?.score || 50) < 60
                  ).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


import { useState } from 'react';
import { Deal, Activity } from '../../../types/crm';
import { useCRMStore } from '../../../stores/crmStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { 
  Activity as ActivityIcon, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Plus,
  MessageCircle,
  Video,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DealActivityTimelineProps {
  deal: Deal;
  activities: Activity[];
}

export const DealActivityTimeline = ({ deal, activities }: DealActivityTimelineProps) => {
  const { addActivity } = useCRMStore();
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    kind: 'note' as Activity['kind'],
    title: '',
    body: ''
  });

  const getActivityIcon = (kind: Activity['kind']) => {
    switch (kind) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meet': return <Video className="w-4 h-4" />;
      case 'file': return <Calendar className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'status': return <DollarSign className="w-4 h-4" />;
      default: return <ActivityIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (kind: Activity['kind']) => {
    switch (kind) {
      case 'call': return 'bg-blue-100 text-blue-600';
      case 'email': return 'bg-green-100 text-green-600';
      case 'meet': return 'bg-purple-100 text-purple-600';
      case 'file': return 'bg-orange-100 text-orange-600';
      case 'note': return 'bg-gray-100 text-gray-600';
      case 'status': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAddActivity = () => {
    if (!newActivity.title.trim()) return;

    addActivity({
      parentType: 'deal',
      parentId: deal.id,
      kind: newActivity.kind,
      title: newActivity.title,
      body: newActivity.body || undefined,
      user: 'User'
    });

    setNewActivity({ kind: 'note', title: '', body: '' });
    setShowAddActivity(false);
  };

  const sortedActivities = [...activities].sort((a, b) => b.ts.getTime() - a.ts.getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowAddActivity(!showAddActivity)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddActivity && (
          <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Activity Type</label>
                <select 
                  value={newActivity.kind}
                  onChange={(e) => setNewActivity({ ...newActivity, kind: e.target.value as Activity['kind'] })}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meet">Meeting</option>
                  <option value="file">File/Document</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="Activity title..."
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={newActivity.body}
                onChange={(e) => setNewActivity({ ...newActivity, body: e.target.value })}
                placeholder="Additional details..."
                rows={3}
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddActivity}>
                Add Activity
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddActivity(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedActivities.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No activities recorded yet. Add the first activity above.
            </p>
          ) : (
            sortedActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.kind)}`}>
                    {getActivityIcon(activity.kind)}
                  </div>
                  {index < sortedActivities.length - 1 && (
                    <div className="w-px h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      {activity.body && (
                        <p className="text-sm text-gray-600 mt-1">{activity.body}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {activity.kind}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(activity.ts, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

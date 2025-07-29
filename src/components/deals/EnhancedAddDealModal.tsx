import { useState } from 'react';
import { useCRMStore } from '../../../stores/crmStore';
import { Client, DealStakeholder, DealCompetitor } from '../../../types/crm';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Plus, X, Users, Zap, Target } from 'lucide-react';

interface EnhancedAddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
}

export const EnhancedAddDealModal = ({ isOpen, onClose, clients }: EnhancedAddDealModalProps) => {
  const { addDeal } = useCRMStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    value: '',
    currency: 'USD',
    stage: 'prospecting',
    probability: '20',
    expectedClose: '',
    source: 'inbound',
    complexity: 'medium',
    tags: [] as string[],
    notes: ''
  });
  
  const [stakeholders, setStakeholders] = useState<Omit<DealStakeholder, 'id'>[]>([]);
  const [competitors, setCompetitors] = useState<Omit<DealCompetitor, 'id'>[]>([]);
  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    role: '',
    influence: 'medium',
    decisionMaker: false,
    champion: false,
    blocker: false,
    sentiment: 'neutral'
  });
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    threatLevel: 'medium',
    strengths: [] as string[],
    weaknesses: [] as string[],
    status: 'active'
  });

  const steps = [
    { title: 'Basic Info', icon: Target },
    { title: 'Stakeholders', icon: Users },
    { title: 'Competition', icon: Zap }
  ];

  const addStakeholder = () => {
    if (newStakeholder.name && newStakeholder.role) {
      setStakeholders([...stakeholders, { ...newStakeholder } as any]);
      setNewStakeholder({
        name: '',
        role: '',
        influence: 'medium',
        decisionMaker: false,
        champion: false,
        blocker: false,
        sentiment: 'neutral'
      });
    }
  };

  const addCompetitor = () => {
    if (newCompetitor.name) {
      setCompetitors([...competitors, {
        ...newCompetitor,
        lastUpdate: new Date()
      } as any]);
      setNewCompetitor({
        name: '',
        threatLevel: 'medium',
        strengths: [],
        weaknesses: [],
        status: 'active'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stakeholdersWithIds = stakeholders.map(s => ({
      ...s,
      id: Date.now().toString() + Math.random()
    }));
    
    const competitorsWithIds = competitors.map(c => ({
      ...c,
      id: Date.now().toString() + Math.random()
    }));

    addDeal({
      title: formData.title,
      description: formData.description,
      clientId: formData.clientId,
      value: parseFloat(formData.value) || 0,
      currency: formData.currency,
      stage: formData.stage as any,
      probability: parseInt(formData.probability) || 0,
      expectedClose: formData.expectedClose ? new Date(formData.expectedClose) : undefined,
      lastActivity: new Date(),
      source: formData.source as any,
      complexity: formData.complexity as any,
      stakeholders: stakeholdersWithIds,
      competitors: competitorsWithIds,
      health: {
        score: 50,
        velocity: 0,
        engagementLevel: 'medium',
        riskFactors: [],
        strengths: [],
        nextActions: [],
        lastCalculated: new Date()
      },
      tags: formData.tags,
      customFields: [],
      priority: 'medium',
      notes: formData.notes,
      assignedTo: 'user'
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      clientId: '',
      value: '',
      currency: 'USD',
      stage: 'prospecting',
      probability: '20',
      expectedClose: '',
      source: 'inbound',
      complexity: 'medium',
      tags: [],
      notes: ''
    });
    setStakeholders([]);
    setCompetitors([]);
    setCurrentStep(0);
    onClose();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    index === currentStep ? 'bg-blue-100 text-blue-700' :
                    index < currentStep ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {step.title}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-gray-300 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Deal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Enterprise Software License"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the opportunity"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="client">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.orgName || `${client.firstName} ${client.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Deal Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="complexity">Complexity</Label>
                  <Select value={formData.complexity} onValueChange={(value) => setFormData({ ...formData, complexity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expectedClose">Expected Close</Label>
                  <Input
                    id="expectedClose"
                    type="date"
                    value={formData.expectedClose}
                    onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Stakeholder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newStakeholder.name}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={newStakeholder.role}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                        placeholder="CTO"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Influence</Label>
                      <Select value={newStakeholder.influence} onValueChange={(value) => setNewStakeholder({ ...newStakeholder, influence: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sentiment</Label>
                      <Select value={newStakeholder.sentiment} onValueChange={(value) => setNewStakeholder({ ...newStakeholder, sentiment: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positive">Positive</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="button" onClick={addStakeholder} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stakeholder
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Current Stakeholders</Label>
                {stakeholders.map((stakeholder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{stakeholder.name}</div>
                      <div className="text-sm text-gray-600">{stakeholder.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stakeholder.influence} influence</Badge>
                      <Badge variant={stakeholder.sentiment === 'positive' ? 'default' : stakeholder.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                        {stakeholder.sentiment}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStakeholders(stakeholders.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Competitor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={newCompetitor.name}
                        onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                        placeholder="Competitor Inc."
                      />
                    </div>
                    <div>
                      <Label>Threat Level</Label>
                      <Select value={newCompetitor.threatLevel} onValueChange={(value) => setNewCompetitor({ ...newCompetitor, threatLevel: value as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="button" onClick={addCompetitor} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Competitor
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Current Competitors</Label>
                {competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="font-medium">{competitor.name}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={competitor.threatLevel === 'high' ? 'destructive' : competitor.threatLevel === 'medium' ? 'default' : 'secondary'}>
                        {competitor.threatLevel} threat
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompetitors(competitors.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Create Deal</Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import { useState } from 'react';
import { useCRMStore } from '../../../stores/crmStore';
import { Client } from '../../../types/crm';
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

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
}

export const AddDealModal = ({ isOpen, onClose, clients }: AddDealModalProps) => {
  const { addDeal } = useCRMStore();
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    value: '',
    currency: 'USD',
    stage: 'prospecting',
    probability: '20',
    expectedClose: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addDeal({
      title: formData.title,
      clientId: formData.clientId,
      value: parseFloat(formData.value) || 0,
      currency: formData.currency,
      stage: formData.stage as any,
      probability: parseInt(formData.probability) || 0,
      expectedClose: formData.expectedClose ? new Date(formData.expectedClose) : new Date(),
      description: '',
      tags: [],
      source: 'inbound',
      competitors: [],
      stakeholders: [],
      health: {
        score: 50,
        velocity: 0,
        engagementLevel: 'medium',
        riskFactors: [],
        strengths: [],
        nextActions: [],
        lastCalculated: new Date()
      },
      customFields: [],
      complexity: 'medium',
      lastActivity: new Date(),
      priority: 'medium',
      notes: formData.notes,
      assignedTo: 'user'
    });

    setFormData({
      title: '',
      clientId: '',
      value: '',
      currency: 'USD',
      stage: 'prospecting',
      probability: '20',
      expectedClose: '',
      notes: ''
    });
    
    onClose();
  };

  // Filter clients to ensure they have valid IDs and names
  const validClients = clients.filter(client => 
    client && 
    client.id && 
    typeof client.id === 'string' && 
    client.id.trim() !== '' &&
    (client.orgName || (client.firstName && client.lastName))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Website Redesign Project"
              required
            />
          </div>

          <div>
            <Label htmlFor="client">Client *</Label>
            <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {validClients.map((client) => (
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
                placeholder="5000"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Won</SelectItem>
                  <SelectItem value="closed-lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="probability">Probability %</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="expectedClose">Expected Close Date</Label>
            <Input
              id="expectedClose"
              type="date"
              value={formData.expectedClose}
              onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the deal"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Deal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'meeting-booked'
  | 'proposal-sent'
  | 'verbal-yes'
  | 'won'
  | 'lost';

export type LeadTemperature = 'cold' | 'warm' | 'hot';

export type NextActionType =
  | 'call'
  | 'whatsapp'
  | 'email'
  | 'send-proposal'
  | 'book-meeting'
  | 'ask-decision'
  | 'follow-up';

export type DeliveryStatus =
  | 'not-started'
  | 'in-progress'
  | 'live'
  | 'waiting-on-client';

export type ActivityType =
  | 'call'
  | 'email'
  | 'whatsapp'
  | 'meeting'
  | 'proposal-sent'
  | 'note'
  | 'stage-change'
  | 'won'
  | 'lost';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  offer: string;
  stage: LeadStage;
  temperature: LeadTemperature;
  probability: number;
  oneTimeValue: number;
  monthlyValue: number;
  commissionPotential?: number;
  nextAction: NextActionType | null;
  nextActionNote?: string;
  nextActionDueDate: Date | null;
  email?: string;
  phone?: string;
  notes?: string;
  activities: Activity[];
  createdAt: Date;
  updatedAt: Date;
  source?: string;
  isClient?: boolean;
  deliveryStatus?: DeliveryStatus;
  startDate?: Date;
  nextRenewalDate?: Date;
  upsellOpportunity?: string;
  referralPotential?: string;
}

export const STAGE_ORDER: LeadStage[] = [
  'new',
  'contacted',
  'interested',
  'meeting-booked',
  'proposal-sent',
  'verbal-yes',
  'won',
  'lost',
];

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  'meeting-booked': 'Meeting Booked',
  'proposal-sent': 'Proposal Sent',
  'verbal-yes': 'Verbal Yes',
  won: 'Won',
  lost: 'Lost',
};

export const STAGE_DEFAULT_PROBABILITY: Record<LeadStage, number> = {
  new: 5,
  contacted: 15,
  interested: 30,
  'meeting-booked': 50,
  'proposal-sent': 65,
  'verbal-yes': 85,
  won: 100,
  lost: 0,
};

export const STAGE_COLORS: Record<LeadStage, { bg: string; text: string; ring: string; bar: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', bar: 'bg-blue-500' },
  contacted: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', bar: 'bg-sky-500' },
  interested: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', bar: 'bg-indigo-500' },
  'meeting-booked': { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', bar: 'bg-violet-500' },
  'proposal-sent': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', bar: 'bg-amber-500' },
  'verbal-yes': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', bar: 'bg-emerald-500' },
  won: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200', bar: 'bg-green-500' },
  lost: { bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-200', bar: 'bg-rose-500' },
};

export const TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  cold: 'Cold',
  warm: 'Warm',
  hot: 'Hot',
};

export const TEMPERATURE_COLORS: Record<LeadTemperature, { bg: string; text: string; dot: string }> = {
  cold: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  warm: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  hot: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
};

export const NEXT_ACTION_LABELS: Record<NextActionType, string> = {
  call: 'Call',
  whatsapp: 'WhatsApp',
  email: 'Email',
  'send-proposal': 'Send Proposal',
  'book-meeting': 'Book Meeting',
  'ask-decision': 'Ask for Decision',
  'follow-up': 'Follow Up',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  live: 'Live',
  'waiting-on-client': 'Waiting on Client',
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, { bg: string; text: string }> = {
  'not-started': { bg: 'bg-slate-100', text: 'text-slate-700' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700' },
  live: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'waiting-on-client': { bg: 'bg-amber-100', text: 'text-amber-800' },
};

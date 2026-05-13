import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  Lead,
  ActivityType,
  LeadStage,
  STAGE_DEFAULT_PROBABILITY,
} from '../types/crm';

const today = () => {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  return d;
};

const daysFromNow = (days: number) => {
  const d = today();
  d.setDate(d.getDate() + days);
  return d;
};

const daysAgo = (days: number) => daysFromNow(-days);

const seedLeads = (): Lead[] => [
  {
    id: 'l-1',
    name: 'Mike Donovan',
    company: 'Donovan Auto Detailing',
    offer: 'Website + online booking system',
    stage: 'proposal-sent',
    temperature: 'hot',
    probability: 70,
    oneTimeValue: 1500,
    monthlyValue: 79,
    nextAction: 'ask-decision',
    nextActionNote: 'Follow up on proposal sent last Friday',
    nextActionDueDate: today(),
    email: 'mike@donovan-detail.com',
    phone: '+353 86 555 0143',
    source: 'Referral',
    notes: 'Owner-operated, ready to scale. Wants bookings on autopilot.',
    activities: [
      { id: 'a-1', type: 'call', description: 'Discovery call — 25 min', createdAt: daysAgo(8) },
      { id: 'a-2', type: 'meeting', description: 'Demo of booking flow', createdAt: daysAgo(5) },
      { id: 'a-3', type: 'proposal-sent', description: 'Sent proposal v1', createdAt: daysAgo(4) },
    ],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(4),
  },
  {
    id: 'l-2',
    name: 'Sofia Russo',
    company: 'Salon Bella',
    offer: 'Booking app + WhatsApp confirmations',
    stage: 'interested',
    temperature: 'warm',
    probability: 35,
    oneTimeValue: 900,
    monthlyValue: 49,
    nextAction: 'whatsapp',
    nextActionNote: 'Went quiet — gentle nudge',
    nextActionDueDate: today(),
    email: 'sofia@salonbella.ie',
    phone: '+353 87 555 0192',
    source: 'Instagram DM',
    notes: 'Three locations. Loved the demo but hasn’t replied since Tuesday.',
    activities: [
      { id: 'a-4', type: 'whatsapp', description: 'First message + voice note', createdAt: daysAgo(10) },
      { id: 'a-5', type: 'meeting', description: 'Quick video demo', createdAt: daysAgo(6) },
      { id: 'a-6', type: 'note', description: 'Asked for time to think', createdAt: daysAgo(3) },
    ],
    createdAt: daysAgo(12),
    updatedAt: daysAgo(3),
  },
  {
    id: 'l-3',
    name: 'Dr. Eoin Walsh',
    company: 'Nova Dental Clinic',
    offer: 'AI receptionist + missed-call recovery',
    stage: 'meeting-booked',
    temperature: 'hot',
    probability: 55,
    oneTimeValue: 1200,
    monthlyValue: 299,
    nextAction: 'book-meeting',
    nextActionNote: 'Confirm Thursday 4pm and send Zoom link',
    nextActionDueDate: daysFromNow(1),
    email: 'eoin@novadental.ie',
    phone: '+353 1 555 0220',
    source: 'Cold outreach',
    notes: 'Loses ~15 calls a week. Big upside on recurring.',
    activities: [
      { id: 'a-7', type: 'email', description: 'Cold email replied', createdAt: daysAgo(7) },
      { id: 'a-8', type: 'call', description: 'Qualifying call — pain confirmed', createdAt: daysAgo(2) },
    ],
    createdAt: daysAgo(9),
    updatedAt: daysAgo(2),
  },
  {
    id: 'l-4',
    name: 'Laura Byrne',
    company: 'Byrne Physiotherapy',
    offer: 'New site + Google reviews flow',
    stage: 'contacted',
    temperature: 'warm',
    probability: 20,
    oneTimeValue: 1100,
    monthlyValue: 0,
    nextAction: 'follow-up',
    nextActionNote: 'Share before/after of similar clinic',
    nextActionDueDate: daysAgo(2),
    email: 'laura@byrnephysio.ie',
    source: 'LinkedIn',
    notes: 'Replied politely, no urgency. Needs proof.',
    activities: [
      { id: 'a-9', type: 'email', description: 'Intro email', createdAt: daysAgo(11) },
      { id: 'a-10', type: 'email', description: 'Reply: send examples', createdAt: daysAgo(5) },
    ],
    createdAt: daysAgo(11),
    updatedAt: daysAgo(5),
  },
  {
    id: 'l-5',
    name: 'Tomás Kelly',
    company: 'Kelly Electrical',
    offer: 'Lead-capture site + Google Ads',
    stage: 'verbal-yes',
    temperature: 'hot',
    probability: 90,
    oneTimeValue: 2200,
    monthlyValue: 350,
    commissionPotential: 10,
    nextAction: 'send-proposal',
    nextActionNote: 'Send signed agreement + invoice',
    nextActionDueDate: today(),
    email: 'tomas@kellyelectrical.ie',
    phone: '+353 86 555 0177',
    source: 'Referral',
    notes: 'Verbally agreed on Friday. Wants to start next week.',
    activities: [
      { id: 'a-11', type: 'call', description: 'Verbal agreement on phone', createdAt: daysAgo(1) },
    ],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(1),
  },
  {
    id: 'l-6',
    name: 'Áine Murphy',
    company: 'Murphy Pilates Studio',
    offer: 'Booking + member portal',
    stage: 'new',
    temperature: 'cold',
    probability: 5,
    oneTimeValue: 850,
    monthlyValue: 39,
    nextAction: null,
    nextActionDueDate: null,
    email: 'hello@murphypilates.ie',
    source: 'Webform',
    notes: 'Filled in contact form. Hasn’t been called yet.',
    activities: [
      { id: 'a-12', type: 'note', description: 'Inbound form submission', createdAt: daysAgo(2) },
    ],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 'l-7',
    name: 'Conor Hayes',
    company: 'Hayes Roofing',
    offer: 'Site + missed-call text-back',
    stage: 'contacted',
    temperature: 'cold',
    probability: 15,
    oneTimeValue: 1300,
    monthlyValue: 99,
    nextAction: 'call',
    nextActionNote: 'Try late afternoon — busy in mornings',
    nextActionDueDate: daysAgo(4),
    phone: '+353 87 555 0033',
    source: 'Cold call',
    notes: 'Picked up but rushed. Asked to call back.',
    activities: [
      { id: 'a-13', type: 'call', description: 'Brief cold call', createdAt: daysAgo(6) },
    ],
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: 'c-1',
    name: 'James Turner',
    company: 'Turner & Co. Accountants',
    offer: 'Website + monthly maintenance',
    stage: 'won',
    temperature: 'hot',
    probability: 100,
    oneTimeValue: 1800,
    monthlyValue: 120,
    nextAction: 'follow-up',
    nextActionNote: 'Quarterly review — upsell automations',
    nextActionDueDate: daysFromNow(14),
    email: 'james@turnerco.ie',
    phone: '+353 1 555 0301',
    source: 'Referral',
    notes: 'Happy client. Mentioned needing a client portal in Q3.',
    activities: [
      { id: 'a-14', type: 'won', description: 'Deal closed', createdAt: daysAgo(45) },
    ],
    createdAt: daysAgo(80),
    updatedAt: daysAgo(2),
    isClient: true,
    deliveryStatus: 'live',
    startDate: daysAgo(40),
    nextRenewalDate: daysFromNow(28),
    upsellOpportunity: 'Client portal + document automation (~€2,500)',
    referralPotential: 'Knows 3 other accounting firms',
  },
  {
    id: 'c-2',
    name: 'Acme Industries',
    company: 'Acme Industries',
    offer: 'AI receptionist + CRM integration',
    stage: 'won',
    temperature: 'warm',
    probability: 100,
    oneTimeValue: 2500,
    monthlyValue: 299,
    nextAction: 'follow-up',
    nextActionNote: 'Check delivery blockers — waiting on logo',
    nextActionDueDate: today(),
    email: 'ops@acme.co',
    source: 'Cold outreach',
    notes: 'Slow to provide assets. Push for sign-off this week.',
    activities: [
      { id: 'a-15', type: 'won', description: 'Deal closed', createdAt: daysAgo(18) },
      { id: 'a-16', type: 'note', description: 'Kickoff call', createdAt: daysAgo(15) },
    ],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(3),
    isClient: true,
    deliveryStatus: 'waiting-on-client',
    startDate: daysAgo(15),
    nextRenewalDate: daysFromNow(60),
    upsellOpportunity: 'Outbound calling agent',
  },
  {
    id: 'c-3',
    name: 'Global Solutions Ltd',
    company: 'Global Solutions',
    offer: 'Lead-gen site + retainer',
    stage: 'won',
    temperature: 'warm',
    probability: 100,
    oneTimeValue: 3200,
    monthlyValue: 450,
    nextAction: 'follow-up',
    nextActionNote: 'Send April performance report',
    nextActionDueDate: daysFromNow(3),
    email: 'finance@globalsolutions.io',
    source: 'Referral',
    notes: 'Steady retainer client. Could 2x with ad-spend management.',
    activities: [
      { id: 'a-17', type: 'won', description: 'Deal closed', createdAt: daysAgo(120) },
    ],
    createdAt: daysAgo(150),
    updatedAt: daysAgo(7),
    isClient: true,
    deliveryStatus: 'live',
    startDate: daysAgo(110),
    nextRenewalDate: daysFromNow(7),
    upsellOpportunity: 'Paid ads management (~€800/mo)',
    referralPotential: 'Active referrer',
  },
  {
    id: 'l-8',
    name: 'Northway Partners',
    company: 'Northway Partners',
    offer: 'CRM migration + automations',
    stage: 'lost',
    temperature: 'cold',
    probability: 0,
    oneTimeValue: 2800,
    monthlyValue: 0,
    nextAction: null,
    nextActionDueDate: null,
    notes: 'Went with internal IT team.',
    activities: [
      { id: 'a-18', type: 'lost', description: 'Lost — internal build', createdAt: daysAgo(10) },
    ],
    createdAt: daysAgo(30),
    updatedAt: daysAgo(10),
  },
];

export interface CRMState {
  leads: Lead[];
  setLeads: (leads: Lead[] | ((prev: Lead[]) => Lead[])) => void;
  upsertLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  logActivity: (leadId: string, type: ActivityType, description: string) => void;
  updateStage: (leadId: string, stage: LeadStage) => void;
  markActionDone: (leadId: string) => void;
}

export function useCRM(): CRMState {
  const [leads, setLeads] = useLocalStorage<Lead[]>('crm-leads', seedLeads());

  const upsertLead = (lead: Lead) => {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === lead.id);
      const next = { ...lead, updatedAt: new Date() };
      return exists ? prev.map((l) => (l.id === lead.id ? next : l)) : [next, ...prev];
    });
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const logActivity = (leadId: string, type: ActivityType, description: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              activities: [
                { id: crypto.randomUUID(), type, description, createdAt: new Date() },
                ...l.activities,
              ],
              updatedAt: new Date(),
            }
          : l,
      ),
    );
  };

  const updateStage = (leadId: string, stage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const probability =
          stage === 'won' ? 100 : stage === 'lost' ? 0 : STAGE_DEFAULT_PROBABILITY[stage];
        const activityType: ActivityType =
          stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'stage-change';
        return {
          ...l,
          stage,
          probability,
          isClient: stage === 'won' ? true : l.isClient,
          deliveryStatus: stage === 'won' ? l.deliveryStatus ?? 'not-started' : l.deliveryStatus,
          startDate: stage === 'won' && !l.startDate ? new Date() : l.startDate,
          activities: [
            {
              id: crypto.randomUUID(),
              type: activityType,
              description: `Stage → ${stage}`,
              createdAt: new Date(),
            },
            ...l.activities,
          ],
          updatedAt: new Date(),
        };
      }),
    );
  };

  const markActionDone = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              activities: [
                {
                  id: crypto.randomUUID(),
                  type: 'note' as ActivityType,
                  description: l.nextActionNote
                    ? `Action done: ${l.nextActionNote}`
                    : 'Action done',
                  createdAt: new Date(),
                },
                ...l.activities,
              ],
              nextAction: null,
              nextActionDueDate: null,
              nextActionNote: '',
              updatedAt: new Date(),
            }
          : l,
      ),
    );
  };

  return { leads, setLeads, upsertLead, deleteLead, logActivity, updateStage, markActionDone };
}

export interface CRMMetrics {
  weightedPipeline: number;
  potentialCash: number;
  pipelineMRR: number;
  currentMRR: number;
  wonThisMonth: number;
  followUpsDueToday: Lead[];
  overdueFollowUps: Lead[];
  hotLeads: Lead[];
  unmanagedLeads: Lead[];
  openLeads: Lead[];
  clients: Lead[];
  byStage: Record<LeadStage, { leads: Lead[]; count: number; value: number; weighted: number }>;
}

export function useCRMMetrics(leads: Lead[]): CRMMetrics {
  return useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const isOpen = (l: Lead) => l.stage !== 'won' && l.stage !== 'lost';
    const openLeads = leads.filter(isOpen);
    const clients = leads.filter((l) => l.isClient && l.stage === 'won');

    const weightedPipeline = openLeads.reduce(
      (sum, l) => sum + (l.oneTimeValue * l.probability) / 100,
      0,
    );
    const potentialCash = openLeads.reduce((sum, l) => sum + l.oneTimeValue, 0);
    const pipelineMRR = openLeads.reduce(
      (sum, l) => sum + (l.monthlyValue * l.probability) / 100,
      0,
    );
    const currentMRR = clients.reduce((sum, l) => sum + l.monthlyValue, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const wonThisMonth = leads
      .filter((l) => l.stage === 'won')
      .filter((l) =>
        l.activities.some(
          (a) =>
            a.type === 'won' &&
            new Date(a.createdAt) >= startOfMonth,
        ),
      )
      .reduce((sum, l) => sum + l.oneTimeValue, 0);

    const followUpsDueToday = openLeads
      .filter(
        (l) =>
          l.nextActionDueDate &&
          new Date(l.nextActionDueDate) >= startOfDay &&
          new Date(l.nextActionDueDate) <= endOfDay,
      )
      .sort((a, b) => b.probability * b.oneTimeValue - a.probability * a.oneTimeValue);

    const overdueFollowUps = openLeads
      .filter((l) => l.nextActionDueDate && new Date(l.nextActionDueDate) < startOfDay)
      .sort(
        (a, b) =>
          new Date(a.nextActionDueDate!).getTime() - new Date(b.nextActionDueDate!).getTime(),
      );

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const hotLeads = openLeads
      .filter(
        (l) =>
          l.temperature === 'hot' ||
          (l.stage === 'interested' && new Date(l.updatedAt) < threeDaysAgo) ||
          l.stage === 'verbal-yes',
      )
      .sort((a, b) => b.probability * b.oneTimeValue - a.probability * a.oneTimeValue);

    const unmanagedLeads = openLeads.filter(
      (l) => !l.nextAction || !l.nextActionDueDate,
    );

    const byStage = {} as CRMMetrics['byStage'];
    (['new', 'contacted', 'interested', 'meeting-booked', 'proposal-sent', 'verbal-yes', 'won', 'lost'] as LeadStage[]).forEach(
      (stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage);
        byStage[stage] = {
          leads: stageLeads,
          count: stageLeads.length,
          value: stageLeads.reduce((s, l) => s + l.oneTimeValue, 0),
          weighted: stageLeads.reduce((s, l) => s + (l.oneTimeValue * l.probability) / 100, 0),
        };
      },
    );

    return {
      weightedPipeline,
      potentialCash,
      pipelineMRR,
      currentMRR,
      wonThisMonth,
      followUpsDueToday,
      overdueFollowUps,
      hotLeads,
      unmanagedLeads,
      openLeads,
      clients,
      byStage,
    };
  }, [leads]);
}

export const formatCurrency = (n: number) =>
  '€' + Math.round(n).toLocaleString('en-IE');

export const formatCurrencyShort = (n: number) => {
  if (n >= 1000) return '€' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return '€' + Math.round(n);
};

export const formatDate = (d: Date | null | undefined) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IE', { day: '2-digit', month: 'short' });
};

export const daysBetween = (a: Date, b: Date) =>
  Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

export const isToday = (d: Date | null | undefined) => {
  if (!d) return false;
  const t = new Date();
  const x = new Date(d);
  return t.getFullYear() === x.getFullYear() && t.getMonth() === x.getMonth() && t.getDate() === x.getDate();
};

export const isOverdue = (d: Date | null | undefined) => {
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(d) < today;
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { crmClient } from '../lib/crmClient';
import {
  Lead,
  LeadFile,
  ActivityType,
  ActivityOutcome,
  ACTIVITY_OUTCOME_LABELS,
  LeadStage,
  STAGE_DEFAULT_PROBABILITY,
  STAGE_ORDER,
  ProofAsset,
  StageHistoryEntry,
  CommercialDetails,
  DealType,
} from '../types/crm';

const NEXT_ACTION_ACTIVITY_LABEL = {
  call: 'Call',
  whatsapp: 'WhatsApp',
  email: 'Email',
  'send-proposal': 'Proposal',
  'book-meeting': 'Meeting',
  'ask-decision': 'Decision ask',
  'follow-up': 'Follow-up',
} as const;

const NEXT_ACTION_TO_ACTIVITY: Record<
  'call' | 'whatsapp' | 'email' | 'send-proposal' | 'book-meeting' | 'ask-decision' | 'follow-up',
  ActivityType
> = {
  call: 'call',
  whatsapp: 'whatsapp',
  email: 'email',
  'send-proposal': 'proposal-sent',
  'book-meeting': 'meeting',
  'ask-decision': 'note',
  'follow-up': 'note',
};

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

// ────────────────────────────────────────────────────────────────────────────
// Proof Assets library — Venlyn AI Commercial portfolio
// ────────────────────────────────────────────────────────────────────────────

export const seedProofAssets = (): ProofAsset[] => [
  {
    id: 'pa-lidl',
    name: 'Lidl — CPG grocery spec',
    vertical: 'CPG / Grocery',
    type: 'spec-commercial',
    publishedAt: daysAgo(120),
    notes: 'Cinematic CPG spec, retail-shelf storytelling',
  },
  {
    id: 'pa-vetpartners',
    name: 'VetPartners — Acquisition commercial',
    vertical: 'Veterinary',
    type: 'paid-client',
    publishedAt: daysAgo(80),
    notes: 'Paid acquisition commercial for veterinary group',
  },
  {
    id: 'pa-pekabesko',
    name: 'Pekabesko — Product commercial',
    vertical: 'CPG / Bakery',
    type: 'product-film',
    publishedAt: daysAgo(60),
    notes: 'Product hero spot, Macedonian bakery brand',
  },
  {
    id: 'pa-spizzicotto',
    name: 'Spizzicotto — Fantasy family commercial',
    vertical: 'Hospitality / F&B',
    type: 'paid-client',
    publishedAt: daysAgo(45),
    notes: 'Whimsical, family-led brand film',
  },
  {
    id: 'pa-automotive',
    name: 'Automotive spec (in development)',
    vertical: 'Automotive',
    type: 'spec-commercial',
    notes: 'Hero spec piece, performance vehicle aesthetic',
  },
  {
    id: 'pa-hospitality',
    name: 'Hospitality spec (in development)',
    vertical: 'Hospitality / Luxury',
    type: 'spec-commercial',
    notes: 'Luxury-hotel narrative spec, slow-cinema feel',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Lead seeds — keep the original Donovan/Salon/Dental etc. + add Venlyn AI Commercial leads
// ────────────────────────────────────────────────────────────────────────────

export const seedLeads = (): Lead[] => [
  // ── AI Commercial leads (Venlyn) ──────────────────────────────────────────
  {
    id: 'ac-1',
    name: 'Lucia Marchetti',
    company: 'Aurelia Hotels Group',
    offer: 'Cinematic brand film + campaign asset pack',
    stage: 'negotiation',
    temperature: 'hot',
    probability: 75,
    oneTimeValue: 7800,
    monthlyValue: 0,
    nextAction: 'ask-decision',
    nextActionNote: 'Confirm Madrid call Thursday — push for verbal yes',
    nextActionDueDate: daysFromNow(1),
    email: 'l.marchetti@aurelia-hotels.com',
    phone: '+34 612 555 0188',
    source: 'In-person networking',
    notes: 'Met at Hotel Santo Mauro bar, March. Saw the hospitality reel on phone — visibly impressed.',
    activities: [
      { id: 'aca-1', type: 'note', description: 'Met at Hotel Santo Mauro bar — showed hospitality spec', createdAt: daysAgo(38) },
      { id: 'aca-2', type: 'whatsapp', description: 'Sent reel + portfolio link', outcome: 'positive', createdAt: daysAgo(36) },
      { id: 'aca-3', type: 'meeting', description: 'Video call — concept alignment', outcome: 'positive', createdAt: daysAgo(20) },
      { id: 'aca-4', type: 'proposal-sent', description: 'Sent quote v1 (€7.8k)', outcome: 'proposal-requested', createdAt: daysAgo(7) },
      { id: 'aca-5', type: 'email', description: 'Negotiating asset pack scope', outcome: 'objection', createdAt: daysAgo(2) },
    ],
    createdAt: daysAgo(38),
    updatedAt: daysAgo(2),
    dealType: 'ai-commercial',
    country: 'Spain',
    industry: 'Hospitality / Luxury',
    stageHistory: [
      { id: 'sh-1', from: null, to: 'new', enteredAt: daysAgo(38) },
      { id: 'sh-2', from: 'new', to: 'qualifying', enteredAt: daysAgo(36), daysInPrevStage: 2 },
      { id: 'sh-3', from: 'qualifying', to: 'meeting-booked', enteredAt: daysAgo(25), daysInPrevStage: 11 },
      { id: 'sh-4', from: 'meeting-booked', to: 'proposal-sent', enteredAt: daysAgo(7), daysInPrevStage: 18 },
      { id: 'sh-5', from: 'proposal-sent', to: 'negotiation', enteredAt: daysAgo(2), daysInPrevStage: 5 },
    ],
    commercial: {
      firstAwarenessSource: 'in-person-networking',
      firstAwarenessDate: daysAgo(38),
      networking: {
        city: 'Madrid',
        venue: 'Hotel Santo Mauro — bar',
        metAt: daysAgo(38),
        environment: 'luxury-hotel',
        showedWorkInPerson: true,
        firstAssetShownId: 'pa-hospitality',
      },
      firstConversationSource: 'in-person',
      keyProofAssetId: 'pa-hospitality',
      closingTrigger: 'They want a launch piece for the new Marbella property in Q3',
      developmentNotes: 'Decision-maker = brand director. CFO in next loop.',
      firstAssetSeenId: 'pa-hospitality',
      assetShownId: 'pa-spizzicotto',
      assetThatConvincedId: 'pa-hospitality',
      buyerType: 'brand-manager',
      leadQuality: 'A',
      marketTier: 'europe',
      brandStrength: 'international-premium',
      desiredCommercialType: 'cinematic-hero',
      assetPackInterest: 'full-pack',
      budgetSignal: '7-5k-plus',
      urgency: 'this-month',
      initialQuotedPrice: 7800,
      priceTier: 'international-premium',
      packageType: 'commercial-asset-pack',
      addOnsQuoted: ['vertical-9-16', 'still-frames', 'multilingual'],
      depositPaid: false,
      instagram: '@aureliahotels',
      website: 'aurelia-hotels.com',
    },
  },
  {
    id: 'ac-2',
    name: 'Goran Petrov',
    company: 'Skopje Auto Imports',
    offer: 'Automotive hero commercial — local launch',
    stage: 'proposal-sent',
    temperature: 'warm',
    probability: 60,
    oneTimeValue: 3200,
    monthlyValue: 0,
    nextAction: 'follow-up',
    nextActionNote: 'Nudge on quote — sent 5 days ago',
    nextActionDueDate: today(),
    email: 'goran@skopjeauto.mk',
    phone: '+389 70 555 042',
    source: 'Referral',
    notes: 'Referred by Marko (Pekabesko). Wants to launch new dealership lineup in June.',
    activities: [
      { id: 'aca-6', type: 'call', description: 'Intro call from Marko', outcome: 'replied', createdAt: daysAgo(14) },
      { id: 'aca-7', type: 'meeting', description: 'Concept brief — 45 min', outcome: 'positive', createdAt: daysAgo(9) },
      { id: 'aca-8', type: 'proposal-sent', description: 'Quote sent (€3.2k)', outcome: 'proposal-requested', createdAt: daysAgo(5) },
    ],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(5),
    dealType: 'ai-commercial',
    country: 'North Macedonia',
    industry: 'Automotive',
    stageHistory: [
      { id: 'sh-6', from: null, to: 'new', enteredAt: daysAgo(14) },
      { id: 'sh-7', from: 'new', to: 'meeting-booked', enteredAt: daysAgo(10), daysInPrevStage: 4 },
      { id: 'sh-8', from: 'meeting-booked', to: 'proposal-sent', enteredAt: daysAgo(5), daysInPrevStage: 5 },
    ],
    commercial: {
      firstAwarenessSource: 'referral',
      firstAwarenessDate: daysAgo(14),
      referral: {
        referrerName: 'Marko Stojanov',
        referrerType: 'existing-client',
        referrerCompany: 'Pekabesko',
      },
      firstConversationSource: 'referral-intro',
      keyProofAssetId: 'pa-pekabesko',
      developmentNotes: 'Cold on AI at first, warmed up after seeing Pekabesko spot.',
      firstAssetSeenId: 'pa-pekabesko',
      assetShownId: 'pa-automotive',
      buyerType: 'founder',
      leadQuality: 'B',
      marketTier: 'macedonia',
      brandStrength: 'established-local',
      desiredCommercialType: 'cinematic-hero',
      assetPackInterest: 'vertical-cutdowns',
      budgetSignal: '2k-4k',
      urgency: 'this-month',
      initialQuotedPrice: 3200,
      priceTier: 'serious-brand',
      packageType: 'commercial-vertical',
      addOnsQuoted: ['vertical-9-16', 'short-cutdowns'],
      depositPaid: false,
    },
  },
  {
    id: 'ac-3',
    name: 'Amira El-Sayed',
    company: 'Noor Beauty Co.',
    offer: 'Product commercial + social campaign pack',
    stage: 'interested',
    temperature: 'warm',
    probability: 35,
    oneTimeValue: 4500,
    monthlyValue: 0,
    nextAction: 'send-proposal',
    nextActionNote: 'Send concept deck + indicative quote',
    nextActionDueDate: daysFromNow(2),
    email: 'amira@noorbeauty.ae',
    phone: '+971 50 555 0921',
    source: 'Instagram inbound',
    notes: 'DM\'d after seeing Pekabesko reel. Building a Dubai launch.',
    activities: [
      { id: 'aca-9', type: 'whatsapp', description: 'Replied to inbound DM', outcome: 'replied', createdAt: daysAgo(8) },
      { id: 'aca-10', type: 'call', description: 'Discovery — 30 min', outcome: 'positive', createdAt: daysAgo(4) },
    ],
    createdAt: daysAgo(8),
    updatedAt: daysAgo(4),
    dealType: 'ai-commercial',
    country: 'UAE',
    industry: 'Beauty / CPG',
    stageHistory: [
      { id: 'sh-9', from: null, to: 'new', enteredAt: daysAgo(8) },
      { id: 'sh-10', from: 'new', to: 'interested', enteredAt: daysAgo(4), daysInPrevStage: 4 },
    ],
    commercial: {
      firstAwarenessSource: 'instagram-inbound',
      firstAwarenessDate: daysAgo(8),
      social: {
        triggerAssetId: 'pa-pekabesko',
        inboundType: 'dm',
      },
      firstConversationSource: 'dm',
      keyProofAssetId: 'pa-pekabesko',
      firstAssetSeenId: 'pa-pekabesko',
      buyerType: 'founder',
      leadQuality: 'A',
      marketTier: 'uae-gulf',
      brandStrength: 'strong-regional',
      desiredCommercialType: 'product-commercial',
      assetPackInterest: 'full-pack',
      budgetSignal: '4k-7-5k',
      urgency: 'next-quarter',
      instagram: '@noorbeauty',
    },
  },
  {
    id: 'ac-4',
    name: 'Stefan Novak',
    company: 'Vinarija Stari Most',
    offer: 'Vineyard brand film',
    stage: 'won',
    temperature: 'hot',
    probability: 100,
    oneTimeValue: 2400,
    monthlyValue: 0,
    nextAction: 'follow-up',
    nextActionNote: 'Production kickoff next week',
    nextActionDueDate: daysFromNow(5),
    email: 'stefan@starimost-wine.mk',
    phone: '+389 75 555 0011',
    source: 'In-person networking',
    notes: 'Met at private tasting in Skopje. Loved the spec work. Paid deposit same week.',
    activities: [
      { id: 'aca-11', type: 'note', description: 'Met at private wine tasting', createdAt: daysAgo(25) },
      { id: 'aca-12', type: 'meeting', description: 'Concept walk-through', outcome: 'positive', createdAt: daysAgo(18) },
      { id: 'aca-13', type: 'proposal-sent', description: 'Sent proposal €2.4k', outcome: 'proposal-requested', createdAt: daysAgo(14) },
      { id: 'aca-14', type: 'won', description: 'Deposit paid, deal won', createdAt: daysAgo(10) },
    ],
    createdAt: daysAgo(25),
    updatedAt: daysAgo(10),
    isClient: true,
    deliveryStatus: 'in-progress',
    startDate: daysAgo(10),
    dealType: 'ai-commercial',
    country: 'North Macedonia',
    industry: 'Hospitality / F&B',
    stageHistory: [
      { id: 'sh-11', from: null, to: 'new', enteredAt: daysAgo(25) },
      { id: 'sh-12', from: 'new', to: 'meeting-booked', enteredAt: daysAgo(20), daysInPrevStage: 5 },
      { id: 'sh-13', from: 'meeting-booked', to: 'proposal-sent', enteredAt: daysAgo(14), daysInPrevStage: 6 },
      { id: 'sh-14', from: 'proposal-sent', to: 'won', enteredAt: daysAgo(10), daysInPrevStage: 4 },
    ],
    commercial: {
      firstAwarenessSource: 'in-person-networking',
      firstAwarenessDate: daysAgo(25),
      networking: {
        city: 'Skopje',
        venue: 'Private wine tasting',
        metAt: daysAgo(25),
        environment: 'private-gathering',
        showedWorkInPerson: true,
        firstAssetShownId: 'pa-spizzicotto',
      },
      firstConversationSource: 'in-person',
      keyProofAssetId: 'pa-spizzicotto',
      closingTrigger: 'Wants the film ready for the December export fair',
      firstAssetSeenId: 'pa-spizzicotto',
      assetShownId: 'pa-spizzicotto',
      assetThatConvincedId: 'pa-spizzicotto',
      buyerType: 'founder',
      leadQuality: 'A',
      marketTier: 'macedonia',
      brandStrength: 'established-local',
      desiredCommercialType: 'corporate-emotional',
      assetPackInterest: 'short-versions',
      budgetSignal: '2k-4k',
      urgency: 'this-month',
      initialQuotedPrice: 2400,
      finalAcceptedPrice: 2400,
      priceTier: 'serious-brand',
      packageType: 'commercial-only',
      addOnsQuoted: ['short-cutdowns'],
      addOnsPurchased: ['short-cutdowns'],
      depositPaid: true,
      depositDate: daysAgo(10),
      closeDate: daysAgo(10),
    },
  },
  {
    id: 'ac-5',
    name: 'David Hughes',
    company: 'Hughes & Knox Agency',
    offer: 'Spec for cosmetics client pitch',
    stage: 'lost',
    temperature: 'cold',
    probability: 0,
    oneTimeValue: 5000,
    monthlyValue: 0,
    nextAction: null,
    nextActionDueDate: null,
    email: 'david@hughesknox.co.uk',
    source: 'LinkedIn inbound',
    notes: 'Agency wanted a spec for free; could not align on commercials.',
    activities: [
      { id: 'aca-15', type: 'email', description: 'Inbound LinkedIn message', outcome: 'replied', createdAt: daysAgo(40) },
      { id: 'aca-16', type: 'meeting', description: 'Discovery call', outcome: 'objection', createdAt: daysAgo(34) },
      { id: 'aca-17', type: 'proposal-sent', description: 'Sent quote €5k', outcome: 'proposal-requested', createdAt: daysAgo(30) },
      { id: 'aca-18', type: 'lost', description: 'Lost — agency went elsewhere', createdAt: daysAgo(22) },
    ],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(22),
    dealType: 'ai-commercial',
    country: 'United Kingdom',
    industry: 'Agency / Beauty',
    stageHistory: [
      { id: 'sh-15', from: null, to: 'new', enteredAt: daysAgo(40) },
      { id: 'sh-16', from: 'new', to: 'meeting-booked', enteredAt: daysAgo(36), daysInPrevStage: 4 },
      { id: 'sh-17', from: 'meeting-booked', to: 'proposal-sent', enteredAt: daysAgo(30), daysInPrevStage: 6 },
      { id: 'sh-18', from: 'proposal-sent', to: 'lost', enteredAt: daysAgo(22), daysInPrevStage: 8 },
    ],
    commercial: {
      firstAwarenessSource: 'linkedin-inbound',
      firstAwarenessDate: daysAgo(40),
      social: {
        inboundType: 'dm',
      },
      firstConversationSource: 'dm',
      keyProofAssetId: 'pa-lidl',
      firstAssetSeenId: 'pa-lidl',
      assetShownId: 'pa-lidl',
      buyerType: 'agency',
      leadQuality: 'C',
      marketTier: 'uk',
      brandStrength: 'strong-regional',
      desiredCommercialType: 'product-commercial',
      assetPackInterest: 'multiple-hooks',
      budgetSignal: '4k-7-5k',
      urgency: 'exploratory',
      initialQuotedPrice: 5000,
      priceTier: 'international-premium',
      packageType: 'commercial-asset-pack',
      depositPaid: false,
      lostReason: 'chose-cheaper-ai',
      lostObjection: 'price',
      lostNotes: 'Agency margin too tight. Chose a junior creator at half price.',
      lostReactivatable: true,
      lostFollowupMonth: '2026-09',
    },
  },

  // ── Original non-commercial leads preserved ────────────────────────────────
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
    dealType: 'website',
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
    dealType: 'ai-automation',
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
    dealType: 'ai-automation',
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
    dealType: 'website',
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
    dealType: 'website',
  },
];

export interface CRMState {
  leads: Lead[];
  setLeads: (leads: Lead[] | ((prev: Lead[]) => Lead[])) => void;
  proofAssets: ProofAsset[];
  setProofAssets: (assets: ProofAsset[] | ((prev: ProofAsset[]) => ProofAsset[])) => void;
  upsertLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  logActivity: (
    leadId: string,
    type: ActivityType,
    description: string,
    outcome?: ActivityOutcome,
  ) => void;
  updateStage: (leadId: string, stage: LeadStage) => void;
  markActionDone: (leadId: string, outcome?: ActivityOutcome) => void;
  snoozeLead: (leadId: string, days: number) => void;
  updateCommercial: (leadId: string, patch: Partial<CommercialDetails>) => void;
  addTag: (leadId: string, tag: string) => void;
  removeTag: (leadId: string, tag: string) => void;
  addFiles: (leadId: string, files: Omit<LeadFile, 'id' | 'addedAt'>[]) => void;
  removeFile: (leadId: string, fileId: string) => void;
  upsertProofAsset: (asset: ProofAsset) => void;
  deleteProofAsset: (id: string) => void;
}

export function useCRM(): CRMState {
  const [leads, setLeadsState] = useState<Lead[]>([]);
  const [proofAssets, setProofAssets] = useLocalStorage<ProofAsset[]>(
    'crm-proof-assets',
    seedProofAssets(),
  );

  // Fire-and-forget persistence. Server response is authoritative for shape,
  // but we keep the optimistically-updated local state to avoid UI flicker.
  const persist = useCallback((lead: Lead) => {
    crmClient.upsertLead(lead).catch((err) => {
      console.error('crmClient.upsertLead failed', err);
    });
  }, []);

  const persistDelete = useCallback((id: string) => {
    crmClient.deleteLead(id).catch((err) => {
      console.error('crmClient.deleteLead failed', err);
    });
  }, []);

  // Initial load: pull leads from the server. On first ever boot the DB is
  // empty — seed it from the in-process seedLeads() so the UI has something
  // to show immediately.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await crmClient.listLeads();
        if (cancelled) return;
        if (remote.length === 0) {
          const seeds = seedLeads();
          setLeadsState(seeds);
          for (const s of seeds) persist(s);
        } else {
          setLeadsState(remote);
        }
      } catch (err) {
        console.error('crmClient.listLeads failed — falling back to seed data', err);
        if (!cancelled) setLeadsState(seedLeads());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persist]);

  // Public setLeads is kept for API compatibility but is local-state-only.
  // All real persistence flows through the named mutators below.
  const setLeads = useCallback((value: Lead[] | ((prev: Lead[]) => Lead[])) => {
    setLeadsState((prev) =>
      typeof value === 'function' ? (value as (p: Lead[]) => Lead[])(prev) : value,
    );
  }, []);

  // Single-lead mutator: updates local state and persists to the server.
  const writeLead = useCallback(
    (leadId: string, update: (l: Lead) => Lead | null) => {
      let next: Lead | null = null;
      setLeadsState((prev) =>
        prev.map((l) => {
          if (l.id !== leadId) return l;
          const candidate = update(l);
          if (candidate === null) return l;
          next = candidate;
          return candidate;
        }),
      );
      if (next) persist(next);
    },
    [persist],
  );

  const upsertLead = useCallback(
    (lead: Lead) => {
      const next = { ...lead, updatedAt: new Date() };
      setLeadsState((prev) => {
        const exists = prev.some((l) => l.id === lead.id);
        return exists ? prev.map((l) => (l.id === lead.id ? next : l)) : [next, ...prev];
      });
      persist(next);
    },
    [persist],
  );

  const deleteLead = useCallback(
    (id: string) => {
      setLeadsState((prev) => prev.filter((l) => l.id !== id));
      persistDelete(id);
    },
    [persistDelete],
  );

  const logActivity = useCallback(
    (leadId: string, type: ActivityType, description: string, outcome?: ActivityOutcome) => {
      writeLead(leadId, (l) => ({
        ...l,
        activities: [
          { id: crypto.randomUUID(), type, description, outcome, createdAt: new Date() },
          ...l.activities,
        ],
        updatedAt: new Date(),
      }));
    },
    [writeLead],
  );

  const updateStage = useCallback(
    (leadId: string, stage: LeadStage) => {
      writeLead(leadId, (l) => {
        if (l.stage === stage) return null;
        const probability =
          stage === 'won' ? 100 : stage === 'lost' ? 0 : STAGE_DEFAULT_PROBABILITY[stage];
        const activityType: ActivityType =
          stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'stage-change';

        const prevHistory = l.stageHistory ?? [];
        const lastEntry = prevHistory[prevHistory.length - 1];
        const lastTime = lastEntry
          ? new Date(lastEntry.enteredAt).getTime()
          : new Date(l.createdAt).getTime();
        const daysInPrev = Math.max(0, Math.round((Date.now() - lastTime) / 86400000));
        const newEntry: StageHistoryEntry = {
          id: crypto.randomUUID(),
          from: l.stage,
          to: stage,
          enteredAt: new Date(),
          daysInPrevStage: daysInPrev,
        };

        const closeDatePatch: Partial<CommercialDetails> | undefined =
          l.commercial && stage === 'won'
            ? { closeDate: new Date(), depositPaid: l.commercial.depositPaid ?? true }
            : undefined;

        return {
          ...l,
          stage,
          probability,
          isClient: stage === 'won' ? true : l.isClient,
          deliveryStatus: stage === 'won' ? l.deliveryStatus ?? 'not-started' : l.deliveryStatus,
          startDate: stage === 'won' && !l.startDate ? new Date() : l.startDate,
          stageHistory: [...prevHistory, newEntry],
          commercial:
            closeDatePatch && l.commercial ? { ...l.commercial, ...closeDatePatch } : l.commercial,
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
      });
    },
    [writeLead],
  );

  const markActionDone = useCallback(
    (leadId: string, outcome?: ActivityOutcome) => {
      writeLead(leadId, (l) => {
        const actionLabel = l.nextAction
          ? NEXT_ACTION_ACTIVITY_LABEL[l.nextAction]
          : 'Follow-up';
        const outcomeLabel = outcome ? ACTIVITY_OUTCOME_LABELS[outcome] : null;
        const description = outcomeLabel
          ? `${actionLabel} — ${outcomeLabel}${l.nextActionNote ? ` · ${l.nextActionNote}` : ''}`
          : l.nextActionNote
          ? `${actionLabel} — ${l.nextActionNote}`
          : `${actionLabel} done`;
        const activityType: ActivityType = l.nextAction
          ? NEXT_ACTION_TO_ACTIVITY[l.nextAction]
          : 'note';
        return {
          ...l,
          activities: [
            {
              id: crypto.randomUUID(),
              type: activityType,
              description,
              outcome,
              createdAt: new Date(),
            },
            ...l.activities,
          ],
          nextAction: null,
          nextActionDueDate: null,
          nextActionNote: '',
          updatedAt: new Date(),
        };
      });
    },
    [writeLead],
  );

  const snoozeLead = useCallback(
    (leadId: string, days: number) => {
      writeLead(leadId, (l) => {
        const base = new Date();
        base.setHours(9, 0, 0, 0);
        base.setDate(base.getDate() + days);
        return { ...l, nextActionDueDate: base, updatedAt: new Date() };
      });
    },
    [writeLead],
  );

  const updateCommercial = useCallback(
    (leadId: string, patch: Partial<CommercialDetails>) => {
      writeLead(leadId, (l) => {
        const next: CommercialDetails = {
          ...(l.commercial ?? {
            firstAwarenessSource: 'other',
            firstAwarenessDate: new Date(),
          }),
          ...patch,
        };
        return { ...l, commercial: next, updatedAt: new Date() };
      });
    },
    [writeLead],
  );

  const addTag = useCallback(
    (leadId: string, tag: string) => {
      const clean = tag.trim();
      if (!clean) return;
      writeLead(leadId, (l) => {
        const existing = l.tags ?? [];
        if (existing.some((t) => t.toLowerCase() === clean.toLowerCase())) return null;
        return { ...l, tags: [...existing, clean], updatedAt: new Date() };
      });
    },
    [writeLead],
  );

  const removeTag = useCallback(
    (leadId: string, tag: string) => {
      writeLead(leadId, (l) => {
        const existing = l.tags ?? [];
        const next = existing.filter((t) => t !== tag);
        if (next.length === existing.length) return null;
        return { ...l, tags: next, updatedAt: new Date() };
      });
    },
    [writeLead],
  );

  const addFiles = useCallback(
    (leadId: string, files: Omit<LeadFile, 'id' | 'addedAt'>[]) => {
      if (!files.length) return;
      const stamped: LeadFile[] = files.map((f) => ({
        ...f,
        id: crypto.randomUUID(),
        addedAt: new Date(),
      }));
      writeLead(leadId, (l) => ({
        ...l,
        files: [...stamped, ...(l.files ?? [])],
        updatedAt: new Date(),
      }));
    },
    [writeLead],
  );

  const removeFile = useCallback(
    (leadId: string, fileId: string) => {
      writeLead(leadId, (l) => ({
        ...l,
        files: (l.files ?? []).filter((f) => f.id !== fileId),
        updatedAt: new Date(),
      }));
    },
    [writeLead],
  );

  const upsertProofAsset = (asset: ProofAsset) => {
    setProofAssets((prev) => {
      const exists = prev.some((a) => a.id === asset.id);
      return exists ? prev.map((a) => (a.id === asset.id ? asset : a)) : [asset, ...prev];
    });
  };

  const deleteProofAsset = (id: string) => {
    setProofAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    leads,
    setLeads,
    proofAssets,
    setProofAssets,
    upsertLead,
    deleteLead,
    logActivity,
    updateStage,
    markActionDone,
    snoozeLead,
    updateCommercial,
    addTag,
    removeTag,
    addFiles,
    removeFile,
    upsertProofAsset,
    deleteProofAsset,
  };
}

export interface DealTypeStat {
  count: number;
  value: number;
  weighted: number;
  changeThisWeek: number;
}

export interface CRMMetrics {
  weightedPipeline: number;
  potentialCash: number;
  pipelineMRR: number;
  currentMRR: number;
  wonThisMonth: number;
  wonLastMonth: number;
  weightedPipeline7dAgo: number;
  cashBookedThisMonth: number;
  followUpsDueToday: Lead[];
  overdueFollowUps: Lead[];
  hotLeads: Lead[];
  unmanagedLeads: Lead[];
  openLeads: Lead[];
  clients: Lead[];
  byStage: Record<LeadStage, { leads: Lead[]; count: number; value: number; weighted: number }>;
  dealTypeBreakdown: Record<DealType, DealTypeStat>;
  medianDwellByStage: Record<LeadStage, number>;
  actionsCompletedToday: number;
  winsToday: Lead[];
  lossesToday: Lead[];
  nextBestAction: Lead | null;
}

const DEAL_TYPE_KEYS: DealType[] = ['ai-commercial', 'website', 'ai-automation', 'other'];

export function leadDealType(l: Lead): DealType {
  return l.dealType ?? 'website';
}

export function getDaysInCurrentStage(l: Lead): number {
  const history = l.stageHistory ?? [];
  const last = history[history.length - 1];
  const ref = last && last.to === l.stage ? new Date(last.enteredAt) : new Date(l.createdAt);
  return Math.max(0, Math.round((Date.now() - ref.getTime()) / 86400000));
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function nextBestActionScore(l: Lead): number {
  const weighted = (l.oneTimeValue * l.probability) / 100;
  const tempBoost = l.temperature === 'hot' ? 1.3 : l.temperature === 'warm' ? 1.1 : 1;
  if (!l.nextActionDueDate) return weighted * 0.3 * tempBoost;
  const due = new Date(l.nextActionDueDate);
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const dayDelta = Math.round((due.getTime() - todayMidnight.getTime()) / 86400000);
  let urgency: number;
  if (dayDelta < 0) urgency = 3 + Math.min(-dayDelta, 5);
  else if (dayDelta === 0) urgency = 1.6;
  else if (dayDelta <= 3) urgency = 1.2;
  else urgency = 1;
  return weighted * urgency * tempBoost;
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

    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const wonInRange = (from: Date, to: Date) =>
      leads
        .filter((l) => l.stage === 'won')
        .filter((l) =>
          l.activities.some(
            (a) =>
              a.type === 'won' &&
              new Date(a.createdAt) >= from &&
              new Date(a.createdAt) < to,
          ),
        )
        .reduce((sum, l) => sum + (l.commercial?.finalAcceptedPrice ?? l.oneTimeValue), 0);

    const monthEndCap = new Date(startOfMonth);
    monthEndCap.setMonth(monthEndCap.getMonth() + 1);
    const wonThisMonth = wonInRange(startOfMonth, monthEndCap);
    const wonLastMonth = wonInRange(startOfLastMonth, startOfMonth);

    // Cash booked this month: deposits paid + non-commercial won leads counted at oneTimeValue
    const cashBookedThisMonth = leads.reduce((sum, l) => {
      if (l.commercial?.depositPaid && l.commercial?.depositDate) {
        const d = new Date(l.commercial.depositDate);
        if (d >= startOfMonth && d < monthEndCap) {
          return sum + (l.commercial.finalAcceptedPrice ?? l.oneTimeValue);
        }
        return sum;
      }
      if (l.stage === 'won' && !l.commercial) {
        const wonActivity = l.activities.find(
          (a) => a.type === 'won' && new Date(a.createdAt) >= startOfMonth && new Date(a.createdAt) < monthEndCap,
        );
        return wonActivity ? sum + l.oneTimeValue : sum;
      }
      return sum;
    }, 0);

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
    STAGE_ORDER.forEach((stage) => {
      const stageLeads = leads.filter((l) => l.stage === stage);
      byStage[stage] = {
        leads: stageLeads,
        count: stageLeads.length,
        value: stageLeads.reduce((s, l) => s + l.oneTimeValue, 0),
        weighted: stageLeads.reduce((s, l) => s + (l.oneTimeValue * l.probability) / 100, 0),
      };
    });

    // ── Weighted pipeline ~7 days ago (approximation) ─────────────────────
    const sevenDaysAgoCut = new Date();
    sevenDaysAgoCut.setHours(0, 0, 0, 0);
    sevenDaysAgoCut.setDate(sevenDaysAgoCut.getDate() - 7);

    const weightedOf = (l: Lead, prob: number) => (l.oneTimeValue * prob) / 100;

    const weightedPipeline7dAgo =
      // Open leads that already existed 7 days ago
      openLeads
        .filter((l) => new Date(l.createdAt) < sevenDaysAgoCut)
        .reduce((s, l) => s + weightedOf(l, l.probability), 0) +
      // Leads that have since closed (won/lost) but were open 7 days ago
      leads
        .filter((l) => (l.stage === 'won' || l.stage === 'lost') && new Date(l.createdAt) < sevenDaysAgoCut)
        .reduce((s, l) => {
          const hist = l.stageHistory ?? [];
          const closing = [...hist].reverse().find((h) => h.to === 'won' || h.to === 'lost');
          if (!closing) return s;
          if (new Date(closing.enteredAt) < sevenDaysAgoCut) return s; // closed before the window — it wasn't open 7d ago either
          const prevProb = closing.from ? STAGE_DEFAULT_PROBABILITY[closing.from] : 30;
          return s + weightedOf(l, prevProb);
        }, 0);

    // ── Deal-type breakdown with change-this-week ─────────────────────────
    const dealTypeBreakdown = DEAL_TYPE_KEYS.reduce((acc, dt) => {
      const openOfType = openLeads.filter((l) => leadDealType(l) === dt);
      const value = openOfType.reduce((s, l) => s + l.oneTimeValue, 0);
      const weighted = openOfType.reduce((s, l) => s + (l.oneTimeValue * l.probability) / 100, 0);
      const newThisWeek = openOfType
        .filter((l) => new Date(l.createdAt) >= sevenDaysAgoCut)
        .reduce((s, l) => s + l.oneTimeValue, 0);
      const closedThisWeek = leads
        .filter((l) => leadDealType(l) === dt && (l.stage === 'won' || l.stage === 'lost'))
        .filter((l) => {
          const hist = l.stageHistory ?? [];
          const closing = [...hist].reverse().find((h) => h.to === 'won' || h.to === 'lost');
          if (closing) return new Date(closing.enteredAt) >= sevenDaysAgoCut;
          return l.activities.some(
            (a) => (a.type === 'won' || a.type === 'lost') && new Date(a.createdAt) >= sevenDaysAgoCut,
          );
        })
        .reduce((s, l) => s + l.oneTimeValue, 0);
      acc[dt] = { count: openOfType.length, value, weighted, changeThisWeek: newThisWeek - closedThisWeek };
      return acc;
    }, {} as Record<DealType, DealTypeStat>);

    // ── Median dwell time per stage (from historical transitions) ─────────
    const dwellMap = {} as Record<LeadStage, number[]>;
    STAGE_ORDER.forEach((s) => (dwellMap[s] = []));
    leads.forEach((l) => {
      (l.stageHistory ?? []).forEach((h) => {
        if (h.from && typeof h.daysInPrevStage === 'number') {
          dwellMap[h.from].push(h.daysInPrevStage);
        }
      });
    });
    const medianDwellByStage = STAGE_ORDER.reduce((acc, s) => {
      acc[s] = median(dwellMap[s]);
      return acc;
    }, {} as Record<LeadStage, number>);

    // ── Today retro: actions completed, wins, losses ──────────────────────
    const actionsCompletedToday = leads.reduce((sum, l) => {
      return (
        sum +
        l.activities.filter(
          (a) =>
            a.type !== 'stage-change' &&
            a.type !== 'won' &&
            a.type !== 'lost' &&
            new Date(a.createdAt) >= startOfDay &&
            new Date(a.createdAt) <= endOfDay,
        ).length
      );
    }, 0);

    const winsToday = leads.filter(
      (l) =>
        l.stage === 'won' &&
        l.activities.some(
          (a) =>
            a.type === 'won' &&
            new Date(a.createdAt) >= startOfDay &&
            new Date(a.createdAt) <= endOfDay,
        ),
    );
    const lossesToday = leads.filter(
      (l) =>
        l.stage === 'lost' &&
        l.activities.some(
          (a) =>
            a.type === 'lost' &&
            new Date(a.createdAt) >= startOfDay &&
            new Date(a.createdAt) <= endOfDay,
        ),
    );

    // ── Next best action ──────────────────────────────────────────────────
    const candidates = openLeads.filter((l) => !!l.nextActionDueDate);
    const sortedByScore = (candidates.length ? candidates : openLeads)
      .slice()
      .sort((a, b) => nextBestActionScore(b) - nextBestActionScore(a));
    const nextBestAction = sortedByScore[0] ?? null;

    return {
      weightedPipeline,
      potentialCash,
      pipelineMRR,
      currentMRR,
      wonThisMonth,
      wonLastMonth,
      weightedPipeline7dAgo,
      cashBookedThisMonth,
      followUpsDueToday,
      overdueFollowUps,
      hotLeads,
      unmanagedLeads,
      openLeads,
      clients,
      byStage,
      dealTypeBreakdown,
      medianDwellByStage,
      actionsCompletedToday,
      winsToday,
      lossesToday,
      nextBestAction,
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

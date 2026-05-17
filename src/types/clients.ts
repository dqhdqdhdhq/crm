// Unified Client model.
// Replaces the older split between `Prospect` (geographic outreach) and
// `Partner` (signed relationship). One entity, one lifecycle.

import type { DealType } from './crm';

export type ClientStage =
  | 'discovery'   // found on map, not yet contacted
  | 'outreach'    // first touch sent
  | 'engaged'     // replied / showed interest
  | 'active'      // paying / live client
  | 'partner'     // signed partner (revenue-share, strategic, etc.)
  | 'dormant'     // gone cold but not lost
  | 'churned';    // ended

export type ClientTier = 'lead' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type ClientRisk = 'healthy' | 'watch' | 'at-risk' | 'critical';

export interface ClientContact {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

export interface ClientTouch {
  id: string;
  type: 'note' | 'email' | 'call' | 'meeting' | 'whatsapp' | 'stage-change' | 'system';
  body: string;
  at: Date;
}

export interface Client {
  id: string;
  // Identity
  name: string;
  industry: string;
  website?: string;
  location?: string;          // human label, e.g. "Beverly Hills, LA"
  lat?: number;
  lng?: number;
  mapsUrl?: string;
  reviewCount?: number;       // Google review count (cold prospects)

  // Lifecycle
  stage: ClientStage;
  tier: ClientTier;
  risk: ClientRisk;
  healthScore: number;        // 0–100
  bookmarked: boolean;

  // Contact
  primaryContact: ClientContact;

  // Commercial
  mrr: number;                // monthly recurring revenue ($)
  totalValue: number;         // lifetime value ($)
  contractStart?: Date;
  contractEnd?: Date;

  // Tracking
  tags: string[];
  notes: string;
  touches: ClientTouch[];

  // Audit
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;

  // ── Bridge to DealDesk (set on lead-derived clients) ──────────────────────
  // When a DealDesk Lead transitions to `won`, useClients projects it into a
  // Client record. The two stay tied via `sourceLeadId === lead.id`.
  // dealType drives card shape (project vs subscription) and portfolio ranking.
  sourceLeadId?: string;
  dealType?: DealType;
}

export const STAGE_ORDER: ClientStage[] = [
  'discovery',
  'outreach',
  'engaged',
  'active',
  'partner',
  'dormant',
  'churned',
];

export const STAGE_META: Record<
  ClientStage,
  { label: string; hex: string; soft: string; text: string; dot: string }
> = {
  discovery: { label: 'Discovery', hex: '#94a3b8', soft: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  outreach:  { label: 'Outreach',  hex: '#3b82f6', soft: 'bg-blue-100',  text: 'text-blue-700',  dot: 'bg-blue-500' },
  engaged:   { label: 'Engaged',   hex: '#6366f1', soft: 'bg-indigo-100',text: 'text-indigo-700',dot: 'bg-indigo-500' },
  active:    { label: 'Active',    hex: '#10b981', soft: 'bg-emerald-100',text: 'text-emerald-700', dot: 'bg-emerald-500' },
  partner:   { label: 'Partner',   hex: '#a855f7', soft: 'bg-purple-100',text: 'text-purple-700',dot: 'bg-purple-500' },
  dormant:   { label: 'Dormant',   hex: '#f59e0b', soft: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  churned:   { label: 'Churned',   hex: '#ef4444', soft: 'bg-rose-100',  text: 'text-rose-700',  dot: 'bg-rose-500' },
};

export const TIER_META: Record<ClientTier, { label: string; ring: string; chip: string }> = {
  lead:     { label: 'Lead',     ring: 'ring-slate-200',  chip: 'bg-slate-100 text-slate-700' },
  bronze:   { label: 'Bronze',   ring: 'ring-orange-200', chip: 'bg-orange-100 text-orange-800' },
  silver:   { label: 'Silver',   ring: 'ring-zinc-200',   chip: 'bg-zinc-100 text-zinc-800' },
  gold:     { label: 'Gold',     ring: 'ring-amber-200',  chip: 'bg-amber-100 text-amber-800' },
  platinum: { label: 'Platinum', ring: 'ring-violet-200', chip: 'bg-violet-100 text-violet-800' },
};

export const RISK_META: Record<ClientRisk, { label: string; chip: string }> = {
  healthy:  { label: 'Healthy',  chip: 'bg-emerald-100 text-emerald-700' },
  watch:    { label: 'Watch',    chip: 'bg-amber-100 text-amber-800' },
  'at-risk':{ label: 'At Risk',  chip: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', chip: 'bg-rose-100 text-rose-700' },
};

export function riskFromHealth(h: number): ClientRisk {
  if (h >= 75) return 'healthy';
  if (h >= 55) return 'watch';
  if (h >= 35) return 'at-risk';
  return 'critical';
}

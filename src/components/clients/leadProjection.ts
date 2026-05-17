// Projects a won DealDesk Lead into the Client shape used by the standalone
// Clients page. The two systems share an id (sourceLeadId === lead.id).
// Edits to lead-derived clients flow back through an overlay; see useClients.

import {
  Lead,
  MARKET_TIER_LABELS,
  DEAL_TYPE_LABELS,
  ACTIVITY_OUTCOME_LABELS,
  ActivityType,
} from '../../types/crm';
import { Client, ClientStage, ClientTier, riskFromHealth, ClientTouch } from '../../types/clients';

const MS_PER_DAY = 86400000;

function deriveStage(lead: Lead): ClientStage {
  if (lead.stage !== 'won') return 'engaged';
  if (lead.deliveryStatus === 'live') return 'active';
  // not-started, in-progress, waiting-on-client → still considered an active relationship
  return 'active';
}

function deriveTier(lead: Lead): ClientTier {
  const pt = lead.commercial?.priceTier;
  if (pt === 'custom-high-concept' || pt === 'international-premium') return 'platinum';
  if (pt === 'serious-brand') return 'gold';
  if (pt === 'local-base') return 'silver';

  // Subscription leads: tier by MRR
  if (lead.monthlyValue >= 1000) return 'platinum';
  if (lead.monthlyValue >= 300) return 'gold';
  if (lead.monthlyValue >= 100) return 'silver';
  if (lead.monthlyValue > 0) return 'bronze';

  // One-shot projects without a price tier
  const v = lead.commercial?.finalAcceptedPrice ?? lead.oneTimeValue;
  if (v >= 7500) return 'platinum';
  if (v >= 3000) return 'gold';
  if (v >= 1000) return 'silver';
  return 'bronze';
}

function deriveHealth(lead: Lead): number {
  // Anchor at 80 the day a lead is won; decay slowly with time-since-update.
  // Subscription clients that go silent for a long time should drift toward "watch".
  const lastTouch = new Date(lead.updatedAt).getTime();
  const daysSince = Math.max(0, Math.round((Date.now() - lastTouch) / MS_PER_DAY));
  const base = 80;
  const decay = Math.min(40, Math.floor(daysSince / 14) * 5); // -5 every two weeks, capped
  return Math.max(20, base - decay);
}

function deriveLocation(lead: Lead): string | undefined {
  const tier = lead.commercial?.marketTier;
  const tierLabel = tier ? MARKET_TIER_LABELS[tier] : undefined;
  const city = lead.commercial?.networking?.city;
  const country = lead.country;
  const parts = [city, country].filter(Boolean) as string[];
  if (parts.length === 0 && tierLabel) return tierLabel;
  if (parts.length === 0) return undefined;
  return parts.join(', ');
}

function deriveTouches(lead: Lead): ClientTouch[] {
  return lead.activities.slice(0, 12).map((a) => ({
    id: `lead-touch-${a.id}`,
    type: mapTouchType(a.type),
    body: a.outcome ? `${a.description} · ${ACTIVITY_OUTCOME_LABELS[a.outcome]}` : a.description,
    at: new Date(a.createdAt),
  }));
}

function mapTouchType(t: ActivityType): ClientTouch['type'] {
  switch (t) {
    case 'call': return 'call';
    case 'email': return 'email';
    case 'whatsapp': return 'whatsapp';
    case 'meeting': return 'meeting';
    case 'stage-change':
    case 'won':
    case 'lost':
      return 'stage-change';
    default:
      return 'note';
  }
}

export function isWonClient(lead: Lead): boolean {
  return lead.stage === 'won' && lead.isClient !== false;
}

export interface OverlayClient {
  // Editable fields the user can change on a lead-derived client without
  // mutating the underlying Lead. Stored in a separate localStorage map.
  bookmarked?: boolean;
  healthScore?: number;
  tier?: ClientTier;
  tags?: string[];
  notes?: string;
  // Touches the user adds from the Clients page (not synced to lead.activities,
  // intentionally — those activities belong to the deal record).
  extraTouches?: ClientTouch[];
}

export type ClientOverlay = Record<string, OverlayClient>;

export function projectLeadToClient(lead: Lead, overlay?: OverlayClient): Client {
  const baseTier = deriveTier(lead);
  const baseHealth = deriveHealth(lead);
  const stage = deriveStage(lead);
  const totalValue = lead.commercial?.finalAcceptedPrice ?? (lead.oneTimeValue + lead.monthlyValue * 12);
  const contractStart = lead.commercial?.closeDate ?? lead.startDate ?? lead.updatedAt;
  const contractEnd = lead.nextRenewalDate;
  const touches = deriveTouches(lead);

  const baseTags = [
    lead.dealType ? DEAL_TYPE_LABELS[lead.dealType] : null,
    lead.industry || null,
  ].filter(Boolean) as string[];

  return {
    id: lead.id,
    name: lead.company || lead.name,
    industry: lead.industry || lead.offer || '—',
    website: lead.commercial?.website,
    location: deriveLocation(lead),
    stage,
    tier: overlay?.tier ?? baseTier,
    risk: riskFromHealth(overlay?.healthScore ?? baseHealth),
    healthScore: overlay?.healthScore ?? baseHealth,
    bookmarked: overlay?.bookmarked ?? false,
    primaryContact: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    },
    mrr: lead.monthlyValue,
    totalValue,
    contractStart: new Date(contractStart),
    contractEnd: contractEnd ? new Date(contractEnd) : undefined,
    tags: overlay?.tags ?? baseTags,
    notes: overlay?.notes ?? (lead.notes || ''),
    touches: overlay?.extraTouches
      ? [...overlay.extraTouches, ...touches]
      : touches,
    createdAt: new Date(lead.createdAt),
    updatedAt: new Date(lead.updatedAt),
    lastContactAt: new Date(lead.updatedAt),
    sourceLeadId: lead.id,
    dealType: lead.dealType,
  };
}

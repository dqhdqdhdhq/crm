export type LeadStage =
  | 'new'
  | 'qualifying'
  | 'contacted'
  | 'interested'
  | 'meeting-booked'
  | 'demo-done'
  | 'proposal-sent'
  | 'negotiation'
  | 'verbal-yes'
  | 'contract-sent'
  | 'won'
  | 'nurture'
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

export type ActivityOutcome =
  | 'no-reply'
  | 'replied'
  | 'positive'
  | 'objection'
  | 'meeting-booked'
  | 'proposal-requested'
  | 'follow-up-needed'
  | 'closed-next-step';

export const ACTIVITY_OUTCOME_LABELS: Record<ActivityOutcome, string> = {
  'no-reply': 'No reply',
  replied: 'Replied',
  positive: 'Positive',
  objection: 'Objection raised',
  'meeting-booked': 'Meeting booked',
  'proposal-requested': 'Proposal requested',
  'follow-up-needed': 'Follow-up needed',
  'closed-next-step': 'Closed next step',
};

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  createdAt: Date;
  outcome?: ActivityOutcome;
}

// ────────────────────────────────────────────────────────────────────────────
// AI Commercials — Acquisition intelligence types
// ────────────────────────────────────────────────────────────────────────────

export type DealType = 'ai-commercial' | 'website' | 'ai-automation' | 'other';

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  'ai-commercial': 'AI Commercial',
  website: 'Website',
  'ai-automation': 'AI Automation',
  other: 'Other',
};

export type AwarenessSource =
  | 'in-person-networking'
  | 'referral'
  | 'instagram-inbound'
  | 'linkedin-inbound'
  | 'x-inbound'
  | 'website-inbound'
  | 'cold-outreach'
  | 'friend-personal'
  | 'event-conference'
  | 'other';

export const AWARENESS_SOURCE_LABELS: Record<AwarenessSource, string> = {
  'in-person-networking': 'In-person networking',
  referral: 'Referral',
  'instagram-inbound': 'Instagram inbound',
  'linkedin-inbound': 'LinkedIn inbound',
  'x-inbound': 'X / Twitter inbound',
  'website-inbound': 'Website inbound',
  'cold-outreach': 'Cold outreach',
  'friend-personal': 'Friend / personal connection',
  'event-conference': 'Event / conference',
  other: 'Other',
};

export type FirstConversationSource =
  | 'in-person'
  | 'dm'
  | 'email'
  | 'whatsapp'
  | 'referral-intro'
  | 'website-form'
  | 'other';

export const FIRST_CONVERSATION_LABELS: Record<FirstConversationSource, string> = {
  'in-person': 'In-person',
  dm: 'DM',
  email: 'Email',
  whatsapp: 'WhatsApp',
  'referral-intro': 'Referral intro',
  'website-form': 'Website form',
  other: 'Other',
};

export type VenueEnvironment =
  | 'luxury-hotel'
  | 'restaurant-bar'
  | 'event'
  | 'private-gathering'
  | 'travel-encounter'
  | 'other';

export const VENUE_ENV_LABELS: Record<VenueEnvironment, string> = {
  'luxury-hotel': 'Luxury hotel',
  'restaurant-bar': 'Restaurant / bar',
  event: 'Event',
  'private-gathering': 'Private gathering',
  'travel-encounter': 'Travel encounter',
  other: 'Other',
};

export type ReferrerType =
  | 'existing-client'
  | 'friend'
  | 'business-contact'
  | 'family'
  | 'unknown';

export const REFERRER_TYPE_LABELS: Record<ReferrerType, string> = {
  'existing-client': 'Existing client',
  friend: 'Friend',
  'business-contact': 'Business contact',
  family: 'Family connection',
  unknown: 'Unknown / loose referral',
};

export type SocialInboundType = 'dm' | 'comment' | 'profile-click' | 'website-click';

export const SOCIAL_INBOUND_LABELS: Record<SocialInboundType, string> = {
  dm: 'DM',
  comment: 'Comment',
  'profile-click': 'Profile click',
  'website-click': 'Website click',
};

export type ColdOutreachChannel =
  | 'email'
  | 'dm'
  | 'whatsapp'
  | 'linkedin-message'
  | 'in-person-research';

export const COLD_CHANNEL_LABELS: Record<ColdOutreachChannel, string> = {
  email: 'Email',
  dm: 'DM',
  whatsapp: 'WhatsApp',
  'linkedin-message': 'LinkedIn message',
  'in-person-research': 'In-person introduction after research',
};

export type BuyerType =
  | 'founder'
  | 'marketing-director'
  | 'brand-manager'
  | 'agency'
  | 'investor-connector'
  | 'other';

export const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  founder: 'Founder / owner',
  'marketing-director': 'Marketing director',
  'brand-manager': 'Brand manager',
  agency: 'Agency',
  'investor-connector': 'Investor / connector',
  other: 'Other',
};

export type LeadQuality = 'A' | 'B' | 'C';

export const LEAD_QUALITY_LABELS: Record<LeadQuality, string> = {
  A: 'A — High-value, strong fit',
  B: 'B — Good fit, possible buyer',
  C: 'C — Curious / low priority',
};

export type MarketTier =
  | 'macedonia'
  | 'balkans'
  | 'europe'
  | 'uk'
  | 'us-canada'
  | 'uae-gulf'
  | 'other';

export const MARKET_TIER_LABELS: Record<MarketTier, string> = {
  macedonia: 'Local Macedonia',
  balkans: 'Regional Balkans',
  europe: 'Europe',
  uk: 'UK',
  'us-canada': 'US / Canada',
  'uae-gulf': 'UAE / Gulf',
  other: 'Other',
};

export type BrandStrength =
  | 'small-local'
  | 'established-local'
  | 'strong-regional'
  | 'international-premium';

export const BRAND_STRENGTH_LABELS: Record<BrandStrength, string> = {
  'small-local': 'Small local',
  'established-local': 'Established local',
  'strong-regional': 'Strong regional',
  'international-premium': 'International / premium',
};

export type DesiredCommercialType =
  | 'cinematic-hero'
  | 'product-commercial'
  | 'corporate-emotional'
  | 'social-campaign'
  | 'unsure';

export const DESIRED_COMMERCIAL_LABELS: Record<DesiredCommercialType, string> = {
  'cinematic-hero': 'Cinematic hero ad',
  'product-commercial': 'Product commercial',
  'corporate-emotional': 'Corporate / emotional story',
  'social-campaign': 'Social campaign ad',
  unsure: 'Unsure',
};

export type AssetPackInterest =
  | 'none'
  | 'vertical-cutdowns'
  | 'short-versions'
  | 'still-frames'
  | 'multiple-hooks'
  | 'localization'
  | 'full-pack';

export const ASSET_PACK_LABELS: Record<AssetPackInterest, string> = {
  none: 'None',
  'vertical-cutdowns': 'Vertical cutdowns',
  'short-versions': '6s / 15s versions',
  'still-frames': 'Still frames / posters',
  'multiple-hooks': 'Multiple hooks',
  localization: 'Language localization',
  'full-pack': 'Full campaign pack',
};

export type BudgetSignal =
  | 'none'
  | 'under-1k'
  | '1k-2k'
  | '2k-4k'
  | '4k-7-5k'
  | '7-5k-plus';

export const BUDGET_SIGNAL_LABELS: Record<BudgetSignal, string> = {
  none: 'No budget discussed',
  'under-1k': 'Under €1k',
  '1k-2k': '€1k–€2k',
  '2k-4k': '€2k–€4k',
  '4k-7-5k': '€4k–€7.5k',
  '7-5k-plus': '€7.5k+',
};

export type UrgencyLevel = 'immediate' | 'this-month' | 'next-quarter' | 'exploratory';

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  immediate: 'Immediate',
  'this-month': 'This month',
  'next-quarter': 'Next quarter',
  exploratory: 'Exploratory',
};

export type PriceTier =
  | 'local-base'
  | 'serious-brand'
  | 'international-premium'
  | 'custom-high-concept';

export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  'local-base': 'Local base',
  'serious-brand': 'Serious brand',
  'international-premium': 'International premium',
  'custom-high-concept': 'Custom high-concept',
};

export type PackageType =
  | 'commercial-only'
  | 'commercial-vertical'
  | 'commercial-asset-pack'
  | 'full-launch-pack';

export const PACKAGE_LABELS: Record<PackageType, string> = {
  'commercial-only': 'Commercial only',
  'commercial-vertical': 'Commercial + vertical',
  'commercial-asset-pack': 'Commercial + campaign asset pack',
  'full-launch-pack': 'Full launch creative pack',
};

export type AddOn =
  | 'vertical-9-16'
  | 'short-cutdowns'
  | 'alt-hooks'
  | 'still-frames'
  | 'multilingual'
  | 'other';

export const ADD_ON_LABELS: Record<AddOn, string> = {
  'vertical-9-16': '9:16 version',
  'short-cutdowns': 'Short cutdowns',
  'alt-hooks': 'Alternate hooks',
  'still-frames': 'Still frames',
  multilingual: 'Multilingual version',
  other: 'Other',
};

export type LostReason =
  | 'too-expensive'
  | 'not-ready'
  | 'internal-approval'
  | 'ghosted-pre-quote'
  | 'ghosted-post-quote'
  | 'chose-cheaper-ai'
  | 'chose-traditional-agency'
  | 'did-not-understand-value'
  | 'needed-different-service'
  | 'no-urgency'
  | 'other';

export const LOST_REASON_LABELS: Record<LostReason, string> = {
  'too-expensive': 'Too expensive',
  'not-ready': 'Not ready / bad timing',
  'internal-approval': 'Internal approval stalled',
  'ghosted-pre-quote': 'Ghosted before quote',
  'ghosted-post-quote': 'Ghosted after quote',
  'chose-cheaper-ai': 'Chose cheaper AI creator',
  'chose-traditional-agency': 'Chose traditional agency',
  'did-not-understand-value': 'Did not understand the value',
  'needed-different-service': 'Needed different service',
  'no-urgency': 'No urgency',
  other: 'Other',
};

export type LostObjection =
  | 'price'
  | 'ai-skepticism'
  | 'no-industry-example'
  | 'trust'
  | 'timing'
  | 'decision-maker'
  | 'other';

export const LOST_OBJECTION_LABELS: Record<LostObjection, string> = {
  price: 'Price',
  'ai-skepticism': 'AI skepticism',
  'no-industry-example': 'No relevant example in their industry',
  trust: 'Trust / credibility',
  timing: 'Timing',
  'decision-maker': 'Decision-maker absent',
  other: 'Other',
};

export type ProofAssetType =
  | 'spec-commercial'
  | 'paid-client'
  | 'website-reel'
  | 'product-film'
  | 'corporate-narrative';

export const PROOF_ASSET_TYPE_LABELS: Record<ProofAssetType, string> = {
  'spec-commercial': 'Spec commercial',
  'paid-client': 'Paid client commercial',
  'website-reel': 'Website reel',
  'product-film': 'Product film',
  'corporate-narrative': 'Corporate narrative film',
};

export interface ProofAssetLink {
  label: string;
  url: string;
}

export interface ProofAsset {
  id: string;
  name: string;
  vertical: string;
  type: ProofAssetType;
  publishedAt?: Date;
  links?: ProofAssetLink[];
  notes?: string;
}

export interface StageHistoryEntry {
  id: string;
  from: LeadStage | null;
  to: LeadStage;
  enteredAt: Date;
  daysInPrevStage?: number;
}

// Attached document/contract for a lead or client.
// dataUrl: base64 inline storage. Upgrade path: swap for a remote URL once we
// wire real file storage (e.g. Supabase) — keep id/name/mime/addedAt stable.
export interface LeadFile {
  id: string;
  name: string;
  mime: string;
  dataUrl: string;
  size?: number;
  addedAt: Date;
}

// Suggested tag values offered in the rail / palette. Free-form input is
// still allowed — these are starter chips, not an enum.
export const SUGGESTED_TAGS = [
  'VIP',
  'partner-referral',
  'waiting-on-me',
  'dormant',
  'champion',
  'decision-maker',
] as const;

export interface CommercialNetworking {
  city?: string;
  venue?: string;
  metAt?: Date;
  environment?: VenueEnvironment;
  showedWorkInPerson?: boolean;
  firstAssetShownId?: string;
}

export interface CommercialReferral {
  referrerName?: string;
  referrerType?: ReferrerType;
  referrerCompany?: string;
}

export interface CommercialSocial {
  triggerAssetId?: string;
  triggerUrl?: string;
  inboundType?: SocialInboundType;
}

export interface CommercialWebsiteInbound {
  howFound?: string;
  pageOrProject?: string;
}

export interface CommercialColdOutreach {
  channel?: ColdOutreachChannel;
  campaignName?: string;
  specSentId?: string;
  messageAngle?: string;
}

export interface CommercialDetails {
  // ── Required at capture ──────────────────────────────────────────────────
  firstAwarenessSource: AwarenessSource;
  firstAwarenessDate: Date;

  // Source-specific (conditional)
  networking?: CommercialNetworking;
  referral?: CommercialReferral;
  social?: CommercialSocial;
  websiteInbound?: CommercialWebsiteInbound;
  coldOutreach?: CommercialColdOutreach;

  // ── Acquisition Path (multi-touch) ──────────────────────────────────────
  firstConversationSource?: FirstConversationSource;
  keyProofAssetId?: string; // the asset that made them interested
  closingTrigger?: string;
  developmentNotes?: string;

  // ── Proof Asset attribution ─────────────────────────────────────────────
  firstAssetSeenId?: string;
  assetShownId?: string; // shown/sent during conversation
  assetThatConvincedId?: string;

  // ── Commercial Fit ──────────────────────────────────────────────────────
  buyerType?: BuyerType;
  leadQuality?: LeadQuality;
  marketTier?: MarketTier;
  brandStrength?: BrandStrength;
  desiredCommercialType?: DesiredCommercialType;
  assetPackInterest?: AssetPackInterest;
  budgetSignal?: BudgetSignal;
  urgency?: UrgencyLevel;

  // ── Commercial Proposal ─────────────────────────────────────────────────
  initialQuotedPrice?: number;
  finalAcceptedPrice?: number;
  priceTier?: PriceTier;
  packageType?: PackageType;
  addOnsQuoted?: AddOn[];
  addOnsPurchased?: AddOn[];
  depositPaid?: boolean;
  depositDate?: Date;
  closeDate?: Date;

  // ── Socials / Web ───────────────────────────────────────────────────────
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;

  // ── Lost analysis ───────────────────────────────────────────────────────
  lostReason?: LostReason;
  lostObjection?: LostObjection;
  lostNotes?: string;
  lostReactivatable?: boolean;
  lostFollowupMonth?: string;
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

  // ── AI Commercials extensions (optional / backwards-compatible) ─────────
  dealType?: DealType;
  country?: string;
  industry?: string;
  commercial?: CommercialDetails;
  stageHistory?: StageHistoryEntry[];

  // ── Workspace extensions ────────────────────────────────────────────────
  tags?: string[];
  files?: LeadFile[];
}

export const STAGE_ORDER: LeadStage[] = [
  'new',
  'qualifying',
  'contacted',
  'interested',
  'meeting-booked',
  'demo-done',
  'proposal-sent',
  'negotiation',
  'verbal-yes',
  'contract-sent',
  'won',
  'nurture',
  'lost',
];

// Active (open) stages — used by the pipeline board and funnel chart.
// Excludes won/lost (terminal) and nurture (parked / not actively worked).
export const ACTIVE_STAGES: LeadStage[] = [
  'new',
  'qualifying',
  'contacted',
  'interested',
  'meeting-booked',
  'demo-done',
  'proposal-sent',
  'negotiation',
  'verbal-yes',
  'contract-sent',
];

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New',
  qualifying: 'Qualifying',
  contacted: 'Contacted',
  interested: 'Interested',
  'meeting-booked': 'Meeting Booked',
  'demo-done': 'Demo Done',
  'proposal-sent': 'Proposal Sent',
  negotiation: 'Negotiating',
  'verbal-yes': 'Verbal Yes',
  'contract-sent': 'Contract Sent',
  won: 'Won',
  nurture: 'Nurture',
  lost: 'Lost',
};

// Commercial-specific stage labels (used in the AI Commercials Intelligence view).
// Same underlying stage IDs, alternate vocabulary for commercial production work.
export const COMMERCIAL_STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New / Captured',
  qualifying: 'Qualified',
  contacted: 'Active Conversation',
  interested: 'Brief / Concept',
  'meeting-booked': 'Meeting Booked',
  'demo-done': 'Concept Discussed',
  'proposal-sent': 'Quote Sent',
  negotiation: 'Negotiating',
  'verbal-yes': 'Verbal Yes',
  'contract-sent': 'Deposit Pending',
  won: 'Deposit Paid / Won',
  nurture: 'Nurture',
  lost: 'Lost',
};

export const STAGE_DEFAULT_PROBABILITY: Record<LeadStage, number> = {
  new: 5,
  qualifying: 10,
  contacted: 15,
  interested: 30,
  'meeting-booked': 45,
  'demo-done': 55,
  'proposal-sent': 65,
  negotiation: 75,
  'verbal-yes': 85,
  'contract-sent': 92,
  won: 100,
  nurture: 5,
  lost: 0,
};

export const STAGE_COLORS: Record<LeadStage, { bg: string; text: string; ring: string; bar: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', bar: 'bg-blue-500' },
  qualifying: { bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-200', bar: 'bg-cyan-500' },
  contacted: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', bar: 'bg-sky-500' },
  interested: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200', bar: 'bg-indigo-500' },
  'meeting-booked': { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200', bar: 'bg-violet-500' },
  'demo-done': { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200', bar: 'bg-purple-500' },
  'proposal-sent': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', bar: 'bg-amber-500' },
  negotiation: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', bar: 'bg-orange-500' },
  'verbal-yes': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', bar: 'bg-emerald-500' },
  'contract-sent': { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200', bar: 'bg-teal-500' },
  won: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200', bar: 'bg-green-500' },
  nurture: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200', bar: 'bg-slate-400' },
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

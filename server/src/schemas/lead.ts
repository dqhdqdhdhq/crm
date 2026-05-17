import { z } from 'zod';

// ── Enums (mirror of src/types/crm.ts) ──────────────────────────────────────

export const LeadStage = z.enum([
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
]);

export const LeadTemperature = z.enum(['cold', 'warm', 'hot']);

export const NextActionType = z.enum([
  'call',
  'whatsapp',
  'email',
  'send-proposal',
  'book-meeting',
  'ask-decision',
  'follow-up',
]);

export const DeliveryStatus = z.enum([
  'not-started',
  'in-progress',
  'live',
  'waiting-on-client',
]);

export const ActivityType = z.enum([
  'call',
  'email',
  'whatsapp',
  'meeting',
  'proposal-sent',
  'note',
  'stage-change',
  'won',
  'lost',
]);

export const ActivityOutcome = z.enum([
  'no-reply',
  'replied',
  'positive',
  'objection',
  'meeting-booked',
  'proposal-requested',
  'follow-up-needed',
  'closed-next-step',
]);

export const DealType = z.enum(['ai-commercial', 'website', 'ai-automation', 'other']);

export const AwarenessSource = z.enum([
  'in-person-networking',
  'referral',
  'instagram-inbound',
  'linkedin-inbound',
  'x-inbound',
  'website-inbound',
  'cold-outreach',
  'friend-personal',
  'event-conference',
  'other',
]);

export const FirstConversationSource = z.enum([
  'in-person',
  'dm',
  'email',
  'whatsapp',
  'referral-intro',
  'website-form',
  'other',
]);

export const VenueEnvironment = z.enum([
  'luxury-hotel',
  'restaurant-bar',
  'event',
  'private-gathering',
  'travel-encounter',
  'other',
]);

export const ReferrerType = z.enum([
  'existing-client',
  'friend',
  'business-contact',
  'family',
  'unknown',
]);

export const SocialInboundType = z.enum(['dm', 'comment', 'profile-click', 'website-click']);

export const ColdOutreachChannel = z.enum([
  'email',
  'dm',
  'whatsapp',
  'linkedin-message',
  'in-person-research',
]);

export const BuyerType = z.enum([
  'founder',
  'marketing-director',
  'brand-manager',
  'agency',
  'investor-connector',
  'other',
]);

export const LeadQuality = z.enum(['A', 'B', 'C']);

export const MarketTier = z.enum([
  'macedonia',
  'balkans',
  'europe',
  'uk',
  'us-canada',
  'uae-gulf',
  'other',
]);

export const BrandStrength = z.enum([
  'small-local',
  'established-local',
  'strong-regional',
  'international-premium',
]);

export const DesiredCommercialType = z.enum([
  'cinematic-hero',
  'product-commercial',
  'corporate-emotional',
  'social-campaign',
  'unsure',
]);

export const AssetPackInterest = z.enum([
  'none',
  'vertical-cutdowns',
  'short-versions',
  'still-frames',
  'multiple-hooks',
  'localization',
  'full-pack',
]);

export const BudgetSignal = z.enum([
  'none',
  'under-1k',
  '1k-2k',
  '2k-4k',
  '4k-7-5k',
  '7-5k-plus',
]);

export const UrgencyLevel = z.enum(['immediate', 'this-month', 'next-quarter', 'exploratory']);

export const PriceTier = z.enum([
  'local-base',
  'serious-brand',
  'international-premium',
  'custom-high-concept',
]);

export const PackageType = z.enum([
  'commercial-only',
  'commercial-vertical',
  'commercial-asset-pack',
  'full-launch-pack',
]);

export const AddOn = z.enum([
  'vertical-9-16',
  'short-cutdowns',
  'alt-hooks',
  'still-frames',
  'multilingual',
  'other',
]);

export const LostReason = z.enum([
  'too-expensive',
  'not-ready',
  'internal-approval',
  'ghosted-pre-quote',
  'ghosted-post-quote',
  'chose-cheaper-ai',
  'chose-traditional-agency',
  'did-not-understand-value',
  'needed-different-service',
  'no-urgency',
  'other',
]);

export const LostObjection = z.enum([
  'price',
  'ai-skepticism',
  'no-industry-example',
  'trust',
  'timing',
  'decision-maker',
  'other',
]);

// ── Helpers ─────────────────────────────────────────────────────────────────

// Coerces ISO strings (over the wire) or Date instances (in-process) into Date.
const DateLike = z.coerce.date();

// ── Nested ──────────────────────────────────────────────────────────────────

export const Activity = z.object({
  id: z.string(),
  type: ActivityType,
  description: z.string(),
  createdAt: DateLike,
  outcome: ActivityOutcome.optional(),
});

export const StageHistoryEntry = z.object({
  id: z.string(),
  from: LeadStage.nullable(),
  to: LeadStage,
  enteredAt: DateLike,
  daysInPrevStage: z.number().optional(),
});

export const LeadFile = z.object({
  id: z.string(),
  name: z.string(),
  mime: z.string(),
  dataUrl: z.string(),
  size: z.number().optional(),
  addedAt: DateLike,
});

export const CommercialNetworking = z.object({
  city: z.string().optional(),
  venue: z.string().optional(),
  metAt: DateLike.optional(),
  environment: VenueEnvironment.optional(),
  showedWorkInPerson: z.boolean().optional(),
  firstAssetShownId: z.string().optional(),
});

export const CommercialReferral = z.object({
  referrerName: z.string().optional(),
  referrerType: ReferrerType.optional(),
  referrerCompany: z.string().optional(),
});

export const CommercialSocial = z.object({
  triggerAssetId: z.string().optional(),
  triggerUrl: z.string().optional(),
  inboundType: SocialInboundType.optional(),
});

export const CommercialWebsiteInbound = z.object({
  howFound: z.string().optional(),
  pageOrProject: z.string().optional(),
});

export const CommercialColdOutreach = z.object({
  channel: ColdOutreachChannel.optional(),
  campaignName: z.string().optional(),
  specSentId: z.string().optional(),
  messageAngle: z.string().optional(),
});

export const CommercialDetails = z.object({
  firstAwarenessSource: AwarenessSource,
  firstAwarenessDate: DateLike,

  networking: CommercialNetworking.optional(),
  referral: CommercialReferral.optional(),
  social: CommercialSocial.optional(),
  websiteInbound: CommercialWebsiteInbound.optional(),
  coldOutreach: CommercialColdOutreach.optional(),

  firstConversationSource: FirstConversationSource.optional(),
  keyProofAssetId: z.string().optional(),
  closingTrigger: z.string().optional(),
  developmentNotes: z.string().optional(),

  firstAssetSeenId: z.string().optional(),
  assetShownId: z.string().optional(),
  assetThatConvincedId: z.string().optional(),

  buyerType: BuyerType.optional(),
  leadQuality: LeadQuality.optional(),
  marketTier: MarketTier.optional(),
  brandStrength: BrandStrength.optional(),
  desiredCommercialType: DesiredCommercialType.optional(),
  assetPackInterest: AssetPackInterest.optional(),
  budgetSignal: BudgetSignal.optional(),
  urgency: UrgencyLevel.optional(),

  initialQuotedPrice: z.number().optional(),
  finalAcceptedPrice: z.number().optional(),
  priceTier: PriceTier.optional(),
  packageType: PackageType.optional(),
  addOnsQuoted: z.array(AddOn).optional(),
  addOnsPurchased: z.array(AddOn).optional(),
  depositPaid: z.boolean().optional(),
  depositDate: DateLike.optional(),
  closeDate: DateLike.optional(),

  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),

  lostReason: LostReason.optional(),
  lostObjection: LostObjection.optional(),
  lostNotes: z.string().optional(),
  lostReactivatable: z.boolean().optional(),
  lostFollowupMonth: z.string().optional(),
});

// ── Lead ────────────────────────────────────────────────────────────────────

export const Lead = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
  offer: z.string(),
  stage: LeadStage,
  temperature: LeadTemperature,
  probability: z.number(),
  oneTimeValue: z.number(),
  monthlyValue: z.number(),
  commissionPotential: z.number().optional(),
  nextAction: NextActionType.nullable(),
  nextActionNote: z.string().optional(),
  nextActionDueDate: DateLike.nullable(),
  email: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  activities: z.array(Activity),
  createdAt: DateLike,
  updatedAt: DateLike,
  source: z.string().optional(),
  isClient: z.boolean().optional(),
  deliveryStatus: DeliveryStatus.optional(),
  startDate: DateLike.optional(),
  nextRenewalDate: DateLike.optional(),
  upsellOpportunity: z.string().optional(),
  referralPotential: z.string().optional(),

  dealType: DealType.optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  commercial: CommercialDetails.optional(),
  stageHistory: z.array(StageHistoryEntry).optional(),

  tags: z.array(z.string()).optional(),
  files: z.array(LeadFile).optional(),
});

export type Lead = z.infer<typeof Lead>;

// PATCH accepts any subset of the Lead fields.
export const LeadPatch = Lead.partial();
export type LeadPatch = z.infer<typeof LeadPatch>;

import { useMemo, useState } from 'react';
import {
  Plus, TrendingUp, Calendar, Sparkles, Repeat,
  Film, Package, Globe2, Check, Hourglass, Briefcase,
} from 'lucide-react';
import {
  Lead,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  DeliveryStatus,
  DealType,
  DEAL_TYPE_LABELS,
  MARKET_TIER_LABELS,
  ProofAsset,
} from '../../types/crm';
import { CRMMetrics, formatCurrency, formatDate, daysBetween } from '../../hooks/useCRM';

interface Props {
  metrics: CRMMetrics;
  proofAssets: ProofAsset[];
  onSelectLead: (lead: Lead) => void;
  onOpenAddClient: () => void;
}

type DealTypeFilter = DealType | 'all';

const DEAL_TYPE_FILTERS: { id: DealTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai-commercial', label: 'AI Commercial' },
  { id: 'website', label: 'Website' },
  { id: 'ai-automation', label: 'AI Automation' },
];

export function ClientsView({ metrics, proofAssets, onSelectLead, onOpenAddClient }: Props) {
  const { clients } = metrics;
  const [filter, setFilter] = useState<DealTypeFilter>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return clients;
    return clients.filter((c) => (c.dealType ?? 'website') === filter);
  }, [clients, filter]);

  const commercialClients = clients.filter((c) => c.dealType === 'ai-commercial');
  const upsellTotal = clients.reduce((s, c) => s + (c.upsellOpportunity ? 1 : 0), 0);
  const renewalsSoon = clients.filter((c) => {
    if (!c.nextRenewalDate) return false;
    return daysBetween(c.nextRenewalDate, new Date()) <= 30;
  });

  const proofAssetById = (id?: string) => (id ? proofAssets.find((a) => a.id === id) : undefined);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Delivery, renewals, and project handoffs — by deal type.
          </p>
        </div>
        <button
          onClick={onOpenAddClient}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={Repeat}
          label="Current MRR"
          value={formatCurrency(metrics.currentMRR) + '/mo'}
          accent="from-violet-500 to-violet-600"
        />
        <Stat
          icon={Film}
          label="Commercial Projects"
          value={String(commercialClients.length)}
          accent="from-indigo-500 to-fuchsia-600"
        />
        <Stat
          icon={Calendar}
          label="Renewals ≤30d"
          value={String(renewalsSoon.length)}
          accent="from-amber-500 to-orange-500"
        />
        <Stat
          icon={Sparkles}
          label="Upsell Opportunities"
          value={String(upsellTotal)}
          accent="from-emerald-500 to-emerald-600"
        />
      </div>

      <nav className="ios-segmented w-fit" role="tablist">
        {DEAL_TYPE_FILTERS.map((f) => {
          const active = filter === f.id;
          const count =
            f.id === 'all'
              ? clients.length
              : clients.filter((c) => (c.dealType ?? 'website') === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`ios-segment ${active ? 'ios-segment-active' : ''}`}
              role="tab"
              aria-selected={active}
            >
              {f.label}
              <span className="text-[10px] opacity-60 tabular-nums">{count}</span>
            </button>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-sm font-semibold text-gray-600">
              {filter === 'all' ? 'No clients yet.' : `No ${DEAL_TYPE_LABELS[filter]} clients yet.`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Mark a lead as Won, or add a client directly.
            </p>
          </div>
        )}
        {visible.map((c) =>
          c.dealType === 'ai-commercial' ? (
            <CommercialCard
              key={c.id}
              lead={c}
              proofAsset={proofAssetById(c.commercial?.assetThatConvincedId ?? c.commercial?.keyProofAssetId)}
              onClick={() => onSelectLead(c)}
            />
          ) : (
            <SubscriptionCard key={c.id} lead={c} onClick={() => onSelectLead(c)} />
          ),
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Subscription-shape card (website / ai-automation / legacy)
// ────────────────────────────────────────────────────────────────────────────

function SubscriptionCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const status: DeliveryStatus = lead.deliveryStatus ?? 'not-started';
  const sc = DELIVERY_STATUS_COLORS[status];
  const ltv12 = lead.monthlyValue * 12 + lead.oneTimeValue;
  const renewalDays = lead.nextRenewalDate ? daysBetween(lead.nextRenewalDate, new Date()) : null;

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-blue-200 transition"
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">{lead.company}</h3>
          <p className="text-xs text-gray-500 truncate">{lead.name}</p>
        </div>
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${sc.bg} ${sc.text}`}>
          {DELIVERY_STATUS_LABELS[status]}
        </span>
      </header>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{lead.offer}</p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Mini label="MRR" value={lead.monthlyValue ? formatCurrency(lead.monthlyValue) : '—'} />
        <Mini label="One-time" value={formatCurrency(lead.oneTimeValue)} />
        <Mini label="12mo LTV" value={formatCurrency(ltv12)} accent="text-emerald-700" />
      </div>

      <div className="space-y-1.5 text-xs">
        <Row label="Started" value={lead.startDate ? formatDate(lead.startDate) : '—'} />
        <Row
          label="Renewal"
          value={
            lead.nextRenewalDate
              ? `${formatDate(lead.nextRenewalDate)}${
                  renewalDays !== null && renewalDays >= 0 ? ` · ${renewalDays}d` : ''
                }`
              : '—'
          }
          highlight={renewalDays !== null && renewalDays <= 30 && renewalDays >= 0}
        />
        {lead.upsellOpportunity && (
          <div className="mt-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <div className="text-[10px] font-bold text-indigo-700 uppercase mb-0.5">Upsell</div>
            <div className="text-xs text-indigo-900 font-medium">{lead.upsellOpportunity}</div>
          </div>
        )}
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Project-shape card (ai-commercial)
// ────────────────────────────────────────────────────────────────────────────

function CommercialCard({
  lead,
  proofAsset,
  onClick,
}: {
  lead: Lead;
  proofAsset?: ProofAsset;
  onClick: () => void;
}) {
  const status: DeliveryStatus = lead.deliveryStatus ?? 'not-started';
  const sc = DELIVERY_STATUS_COLORS[status];
  const c = lead.commercial;

  const projectValue = c?.finalAcceptedPrice ?? lead.oneTimeValue;
  const depositPaid = c?.depositPaid ?? false;
  const booked = c?.closeDate ?? c?.depositDate ?? lead.startDate;
  const tier = c?.marketTier ? MARKET_TIER_LABELS[c.marketTier] : null;
  const country = lead.country;
  const industry = lead.industry;

  const nextDeliverableLabel =
    status === 'live'
      ? 'Wrap & handoff'
      : status === 'in-progress'
      ? 'Next deliverable'
      : status === 'waiting-on-client'
      ? 'Chasing client input'
      : 'Production handoff';

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-indigo-200 transition relative overflow-hidden"
    >
      <span className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />

      <header className="flex items-start justify-between gap-3 mb-3 mt-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Film className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              AI Commercial
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 truncate">{lead.company}</h3>
          <p className="text-xs text-gray-500 truncate">{lead.name}</p>
        </div>
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${sc.bg} ${sc.text}`}>
          {DELIVERY_STATUS_LABELS[status]}
        </span>
      </header>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{lead.offer}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <Mini label="Project value" value={projectValue ? formatCurrency(projectValue) : '—'} accent="text-indigo-700" />
        <DepositPill paid={depositPaid} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {industry && <Chip icon={Briefcase} label={industry} />}
        {country && <Chip icon={Globe2} label={country} />}
        {tier && <Chip label={tier} />}
      </div>

      <div className="space-y-1.5 text-xs">
        <Row label="Booked" value={booked ? formatDate(booked) : '—'} />
        {proofAsset && (
          <div className="mt-3 p-2.5 rounded-lg bg-fuchsia-50 border border-fuchsia-100">
            <div className="text-[10px] font-bold text-fuchsia-700 uppercase mb-0.5 inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Closed by
            </div>
            <div className="text-xs text-fuchsia-900 font-medium truncate">{proofAsset.name}</div>
          </div>
        )}
        <div className="mt-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
          <div className="text-[10px] font-bold text-indigo-700 uppercase mb-0.5 inline-flex items-center gap-1">
            <Package className="w-2.5 h-2.5" /> {nextDeliverableLabel}
          </div>
          <div className="text-xs text-indigo-900 font-medium">
            {lead.nextActionNote || 'Open the project to schedule the next step.'}
          </div>
        </div>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Shared bits
// ────────────────────────────────────────────────────────────────────────────

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} text-white flex items-center justify-center shadow`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900 leading-tight">{value}</div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-xs font-bold ${accent ?? 'text-gray-900'} mt-0.5`}>{value}</div>
    </div>
  );
}

function DepositPill({ paid }: { paid: boolean }) {
  return (
    <div
      className={`rounded-lg p-2 flex flex-col justify-center ${
        paid ? 'bg-emerald-50' : 'bg-amber-50'
      }`}
    >
      <div className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Deposit</div>
      <div
        className={`text-xs font-bold mt-0.5 inline-flex items-center gap-1 ${
          paid ? 'text-emerald-700' : 'text-amber-700'
        }`}
      >
        {paid ? <Check className="w-3 h-3" /> : <Hourglass className="w-3 h-3" />}
        {paid ? 'Paid' : 'Pending'}
      </div>
    </div>
  );
}

function Chip({ icon: Icon, label }: { icon?: typeof Briefcase; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-700">
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-amber-700' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
}

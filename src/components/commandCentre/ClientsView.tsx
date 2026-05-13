import { Plus, TrendingUp, Calendar, Sparkles, Repeat } from 'lucide-react';
import {
  Lead,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  DeliveryStatus,
} from '../../types/crm';
import { CRMMetrics, formatCurrency, formatDate, daysBetween } from '../../hooks/useCRM';

interface Props {
  metrics: CRMMetrics;
  onSelectLead: (lead: Lead) => void;
  onOpenAddClient: () => void;
}

export function ClientsView({ metrics, onSelectLead, onOpenAddClient }: Props) {
  const { clients } = metrics;

  const upsellTotal = clients.reduce((s, c) => s + (c.upsellOpportunity ? 1 : 0), 0);
  const renewalsSoon = clients.filter((c) => {
    if (!c.nextRenewalDate) return false;
    return daysBetween(c.nextRenewalDate, new Date()) <= 30;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Delivery status, renewals, and upsell opportunities at a glance.
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
          icon={TrendingUp}
          label="Active Clients"
          value={String(clients.length)}
          accent="from-emerald-500 to-emerald-600"
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
          accent="from-indigo-500 to-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <p className="text-sm font-semibold text-gray-600">No clients yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Mark a lead as Won, or add a client directly.
            </p>
          </div>
        )}
        {clients.map((c) => {
          const status: DeliveryStatus = c.deliveryStatus ?? 'not-started';
          const sc = DELIVERY_STATUS_COLORS[status];
          const ltv12 = c.monthlyValue * 12 + c.oneTimeValue;
          const renewalDays = c.nextRenewalDate ? daysBetween(c.nextRenewalDate, new Date()) : null;
          return (
            <article
              key={c.id}
              onClick={() => onSelectLead(c)}
              className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-blue-200 transition"
            >
              <header className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">{c.company}</h3>
                  <p className="text-xs text-gray-500 truncate">{c.name}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                  {DELIVERY_STATUS_LABELS[status]}
                </span>
              </header>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{c.offer}</p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <Mini label="MRR" value={c.monthlyValue ? formatCurrency(c.monthlyValue) : '—'} />
                <Mini label="One-time" value={formatCurrency(c.oneTimeValue)} />
                <Mini label="12mo LTV" value={formatCurrency(ltv12)} accent="text-emerald-700" />
              </div>

              <div className="space-y-1.5 text-xs">
                <Row
                  label="Started"
                  value={c.startDate ? formatDate(c.startDate) : '—'}
                />
                <Row
                  label="Renewal"
                  value={
                    c.nextRenewalDate
                      ? `${formatDate(c.nextRenewalDate)}${
                          renewalDays !== null && renewalDays >= 0
                            ? ` · ${renewalDays}d`
                            : ''
                        }`
                      : '—'
                  }
                  highlight={renewalDays !== null && renewalDays <= 30 && renewalDays >= 0}
                />
                {c.upsellOpportunity && (
                  <div className="mt-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase mb-0.5">
                      Upsell
                    </div>
                    <div className="text-xs text-indigo-900 font-medium">
                      {c.upsellOpportunity}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

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
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </div>
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

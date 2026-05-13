import { TrendingUp, Wallet, Repeat, Trophy } from 'lucide-react';
import { Lead, STAGE_LABELS, STAGE_COLORS } from '../../types/crm';
import { CRMMetrics, formatCurrency, formatCurrencyShort } from '../../hooks/useCRM';

interface Props {
  leads: Lead[];
  metrics: CRMMetrics;
}

export function RevenueView({ leads, metrics }: Props) {
  const months = monthsBack(6);
  const wonByMonth = months.map((m) => {
    const startOfMonth = new Date(m.year, m.month, 1);
    const endOfMonth = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999);
    const wonLeads = leads.filter(
      (l) =>
        l.stage === 'won' &&
        l.activities.some(
          (a) =>
            a.type === 'won' &&
            new Date(a.createdAt) >= startOfMonth &&
            new Date(a.createdAt) <= endOfMonth,
        ),
    );
    const oneTime = wonLeads.reduce((s, l) => s + l.oneTimeValue, 0);
    const mrrAdded = wonLeads.reduce((s, l) => s + l.monthlyValue, 0);
    return { ...m, oneTime, mrrAdded, count: wonLeads.length };
  });

  const maxMonth = Math.max(...wonByMonth.map((m) => m.oneTime + m.mrrAdded * 12), 1);

  const sources = leads.reduce<Record<string, { count: number; value: number }>>((acc, l) => {
    const src = l.source ?? 'Unknown';
    if (!acc[src]) acc[src] = { count: 0, value: 0 };
    acc[src].count += 1;
    acc[src].value += l.oneTimeValue;
    return acc;
  }, {});
  const sourceRows = Object.entries(sources).sort((a, b) => b[1].value - a[1].value);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Revenue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cash, MRR, and where it actually comes from.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={TrendingUp}
          label="Weighted Pipeline"
          value={formatCurrency(metrics.weightedPipeline)}
          accent="from-emerald-500 to-emerald-600"
        />
        <Stat
          icon={Wallet}
          label="Won This Month"
          value={formatCurrency(metrics.wonThisMonth)}
          accent="from-blue-500 to-blue-600"
        />
        <Stat
          icon={Repeat}
          label="Current MRR"
          value={formatCurrency(metrics.currentMRR) + '/mo'}
          accent="from-violet-500 to-violet-600"
        />
        <Stat
          icon={Trophy}
          label="MRR Potential"
          value={formatCurrency(metrics.pipelineMRR) + '/mo'}
          accent="from-indigo-500 to-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5">
          <header className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Won — Last 6 Months</h2>
            <span className="text-xs font-bold text-gray-400">Annualised value</span>
          </header>
          <div className="grid grid-cols-6 gap-3 items-end h-64">
            {wonByMonth.map((m) => {
              const annual = m.oneTime + m.mrrAdded * 12;
              const h = Math.max((annual / maxMonth) * 100, 2);
              return (
                <div key={`${m.year}-${m.month}`} className="flex flex-col items-center gap-2 h-full">
                  <div className="flex-1 w-full flex flex-col justify-end">
                    <div className="text-[10px] font-bold text-gray-700 text-center mb-1">
                      {annual > 0 ? formatCurrencyShort(annual) : ''}
                    </div>
                    <div
                      className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg w-full transition-all"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">
                    {monthLabel(m.month)}
                  </div>
                  <div className="text-[9px] text-gray-400">
                    {m.count} {m.count === 1 ? 'deal' : 'deals'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Pipeline by Stage</h2>
          <div className="space-y-3">
            {(['new', 'contacted', 'interested', 'meeting-booked', 'proposal-sent', 'verbal-yes'] as const).map(
              (s) => {
                const data = metrics.byStage[s];
                const c = STAGE_COLORS[s];
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-bold ${c.text}`}>{STAGE_LABELS[s]}</span>
                      <span className="text-gray-700 font-bold">
                        {formatCurrency(data.weighted)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {data.count} leads · {formatCurrency(data.value)} potential
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
        <header className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Revenue by Source</h2>
          <p className="text-xs text-gray-500 mt-0.5">Where leads come from + total potential.</p>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/70 border-b border-gray-100">
            <tr className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3 text-right">Leads</th>
              <th className="px-5 py-3 text-right">Total Value</th>
              <th className="px-5 py-3 text-right">Avg Deal</th>
            </tr>
          </thead>
          <tbody>
            {sourceRows.map(([src, data]) => (
              <tr key={src} className="border-b border-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-800">{src}</td>
                <td className="px-5 py-3 text-right text-gray-700">{data.count}</td>
                <td className="px-5 py-3 text-right font-bold text-gray-900">
                  {formatCurrency(data.value)}
                </td>
                <td className="px-5 py-3 text-right text-gray-600">
                  {formatCurrency(data.value / Math.max(data.count, 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
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
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} text-white flex items-center justify-center shadow`}
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

function monthsBack(n: number) {
  const out: { year: number; month: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return out;
}

function monthLabel(m: number) {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];
}

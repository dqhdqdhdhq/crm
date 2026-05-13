import {
  TrendingUp,
  Wallet,
  Repeat,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Lead, STAGE_LABELS, STAGE_COLORS, NEXT_ACTION_LABELS } from '../../types/crm';
import { CRMMetrics, formatCurrency, formatCurrencyShort, isOverdue } from '../../hooks/useCRM';
import { LeadTable } from './LeadTable';

interface Props {
  leads: Lead[];
  metrics: CRMMetrics;
  onSelectLead: (lead: Lead) => void;
  onMarkActionDone: (id: string) => void;
  onOpenAddLead: () => void;
}

export function DashboardView({
  leads,
  metrics,
  onSelectLead,
  onMarkActionDone,
  onOpenAddLead,
}: Props) {
  const todayQueue = [...metrics.followUpsDueToday, ...metrics.overdueFollowUps];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good morning, Alex <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's where the money is and what closes next.
          </p>
        </div>
        <button
          onClick={onOpenAddLead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Lead / Client
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI
          icon={TrendingUp}
          label="Weighted Pipeline"
          value={formatCurrency(metrics.weightedPipeline)}
          accent="from-emerald-500 to-emerald-600"
          subtitle={`${metrics.openLeads.length} open`}
        />
        <KPI
          icon={Wallet}
          label="If Everything Closes"
          value={formatCurrencyShort(metrics.potentialCash)}
          accent="from-blue-500 to-blue-600"
          subtitle="Potential cash"
        />
        <KPI
          icon={Repeat}
          label="MRR Potential"
          value={formatCurrency(metrics.pipelineMRR) + '/mo'}
          accent="from-indigo-500 to-indigo-600"
          subtitle="Weighted recurring"
        />
        <KPI
          icon={Trophy}
          label="Current MRR"
          value={formatCurrency(metrics.currentMRR) + '/mo'}
          accent="from-violet-500 to-violet-600"
          subtitle={`${metrics.clients.length} clients`}
        />
        <KPI
          icon={Flame}
          label="Follow-Ups Today"
          value={String(metrics.followUpsDueToday.length)}
          accent="from-amber-500 to-orange-500"
          subtitle={
            metrics.overdueFollowUps.length > 0
              ? `+${metrics.overdueFollowUps.length} overdue`
              : 'On track'
          }
          alert={metrics.overdueFollowUps.length > 0}
        />
        <KPI
          icon={Flame}
          label="Hot Leads"
          value={String(metrics.hotLeads.length)}
          accent="from-rose-500 to-rose-600"
          subtitle="Need attention"
        />
      </div>

      {metrics.unmanagedLeads.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-900">
                {metrics.unmanagedLeads.length} unmanaged{' '}
                {metrics.unmanagedLeads.length === 1 ? 'lead' : 'leads'}
              </div>
              <div className="text-xs text-rose-700">
                These open leads have no next step or due date — they'll go cold.
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {metrics.unmanagedLeads.slice(0, 4).map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLead(l)}
                className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                {l.name}
              </button>
            ))}
            {metrics.unmanagedLeads.length > 4 && (
              <span className="px-2.5 py-1 text-xs font-semibold text-rose-700">
                +{metrics.unmanagedLeads.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Today's Follow-Up Queue</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                One click to log progress and free up your headspace.
              </p>
            </div>
            <div className="text-xs font-bold text-gray-500">
              {todayQueue.length} {todayQueue.length === 1 ? 'item' : 'items'}
            </div>
          </header>

          <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
            {todayQueue.length === 0 && (
              <div className="p-10 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-800">Inbox zero on follow-ups.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Nothing due today. Go push pipeline forward.
                </p>
              </div>
            )}
            {todayQueue.map((l) => {
              const overdue = isOverdue(l.nextActionDueDate);
              const stageColor = STAGE_COLORS[l.stage];
              return (
                <div
                  key={l.id}
                  className={`p-4 hover:bg-gray-50/80 cursor-pointer transition flex items-start gap-3 ${
                    overdue ? 'bg-rose-50/30' : ''
                  }`}
                  onClick={() => onSelectLead(l)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkActionDone(l.id);
                    }}
                    className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 flex-shrink-0 mt-0.5 transition flex items-center justify-center group"
                    title="Mark action done"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">
                        {l.nextAction ? NEXT_ACTION_LABELS[l.nextAction] : 'Follow up'}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm font-semibold text-gray-700">{l.company}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${stageColor.bg} ${stageColor.text}`}
                      >
                        {STAGE_LABELS[l.stage]}
                      </span>
                      {overdue && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {l.nextActionNote || l.offer}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency((l.oneTimeValue * l.probability) / 100)} weighted
                      </span>
                      <span>·</span>
                      <span>{formatCurrency(l.oneTimeValue)} deal</span>
                      {l.monthlyValue > 0 && (
                        <>
                          <span>·</span>
                          <span>{formatCurrency(l.monthlyValue)}/mo</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Pipeline by Stage</h2>
              <span className="text-xs font-bold text-gray-400">€ weighted</span>
            </header>
            <PipelineFunnel metrics={metrics} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Hot Right Now</h2>
              <Flame className="w-4 h-4 text-rose-500" />
            </header>
            <div className="space-y-2">
              {metrics.hotLeads.slice(0, 5).map((l) => (
                <button
                  key={l.id}
                  onClick={() => onSelectLead(l)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-50/50 transition text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {l.company}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {STAGE_LABELS[l.stage]} · {l.nextActionNote || l.offer}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-700">
                    {formatCurrencyShort((l.oneTimeValue * l.probability) / 100)}
                  </div>
                </button>
              ))}
              {metrics.hotLeads.length === 0 && (
                <p className="text-xs text-gray-400 italic px-3">No hot leads yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <LeadTable leads={leads} onSelectLead={onSelectLead} />
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  subtitle,
  accent,
  alert,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  subtitle?: string;
  accent: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`relative bg-white rounded-2xl border ${
        alert ? 'border-amber-300' : 'border-gray-200/70'
      } shadow-sm p-4 overflow-hidden`}
    >
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${accent} opacity-10`} />
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent} text-white flex items-center justify-center shadow`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {subtitle && (
        <div
          className={`text-[11px] font-semibold mt-0.5 ${
            alert ? 'text-amber-600' : 'text-gray-500'
          } flex items-center gap-1`}
        >
          {alert && <Clock className="w-3 h-3" />}
          {subtitle}
        </div>
      )}
    </div>
  );
}

function PipelineFunnel({ metrics }: { metrics: CRMMetrics }) {
  const stages: ['new', 'contacted', 'interested', 'meeting-booked', 'proposal-sent', 'verbal-yes'] = [
    'new',
    'contacted',
    'interested',
    'meeting-booked',
    'proposal-sent',
    'verbal-yes',
  ];
  const maxValue = Math.max(...stages.map((s) => metrics.byStage[s].value), 1);

  return (
    <div className="space-y-2">
      {stages.map((s) => {
        const data = metrics.byStage[s];
        const c = STAGE_COLORS[s];
        const widthPct = (data.value / maxValue) * 100;
        return (
          <div key={s}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-bold ${c.text}`}>{STAGE_LABELS[s]}</span>
              <span className="text-gray-500 font-semibold">
                {data.count} · {formatCurrencyShort(data.value)}
              </span>
            </div>
            <div className="h-7 bg-gray-50 rounded-lg overflow-hidden relative">
              <div
                className={`h-full ${c.bar} transition-all`}
                style={{ width: `${Math.max(widthPct, 4)}%` }}
              />
              <span className="absolute inset-0 flex items-center px-3 text-[11px] font-bold text-white mix-blend-luminosity">
                {formatCurrencyShort(data.weighted)} weighted
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

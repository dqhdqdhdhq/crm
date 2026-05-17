import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Plus,
  ChevronRight,
  Sparkles,
  Globe,
  Repeat,
  ArrowRight,
} from 'lucide-react';
import {
  Lead,
  ActivityOutcome,
  STAGE_LABELS,
  STAGE_COLORS,
  NEXT_ACTION_LABELS,
  DealType,
  DEAL_TYPE_LABELS,
} from '../../types/crm';
import { CRMMetrics, formatCurrency, formatCurrencyShort, isOverdue } from '../../hooks/useCRM';

interface Props {
  metrics: CRMMetrics;
  onSelectLead: (lead: Lead) => void;
  onMarkActionDone: (id: string, outcome?: ActivityOutcome) => void;
  onOpenAddLead: () => void;
  onNavigateToPipeline: (dealType: DealType | 'all') => void;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const DEAL_TYPE_ICONS: Record<DealType, typeof Sparkles> = {
  'ai-commercial': Sparkles,
  website: Globe,
  'ai-automation': Repeat,
  other: Sparkles,
};

const DEAL_TYPE_TINTS: Record<DealType, { bg: string; fg: string; border: string }> = {
  'ai-commercial': { bg: 'bg-indigo-500/12', fg: 'text-indigo-600', border: 'border-indigo-200/70' },
  website: { bg: 'bg-blue-500/12', fg: 'text-blue-600', border: 'border-blue-200/70' },
  'ai-automation': { bg: 'bg-violet-500/12', fg: 'text-violet-600', border: 'border-violet-200/70' },
  other: { bg: 'bg-slate-500/12', fg: 'text-slate-600', border: 'border-slate-200/70' },
};

const DEAL_TYPE_ORDER: DealType[] = ['ai-commercial', 'website', 'ai-automation'];

export function DashboardView({
  metrics,
  onSelectLead,
  onMarkActionDone,
  onOpenAddLead,
  onNavigateToPipeline,
}: Props) {
  // Split follow-up queue: overdue (rose) + today (amber), each ranked by weighted value DESC
  const sortByWeighted = (a: Lead, b: Lead) =>
    (b.oneTimeValue * b.probability) / 100 - (a.oneTimeValue * a.probability) / 100;

  const overdueRanked = [...metrics.overdueFollowUps].sort(sortByWeighted);
  const todayRanked = [...metrics.followUpsDueToday].sort(sortByWeighted);

  const next = metrics.nextBestAction;
  const nextWeighted = next ? (next.oneTimeValue * next.probability) / 100 : 0;
  const nextOverdue = next ? isOverdue(next.nextActionDueDate) : false;

  const pipelineDelta = metrics.weightedPipeline - metrics.weightedPipeline7dAgo;
  const wonDelta = metrics.wonThisMonth - metrics.wonLastMonth;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="ios-subtitle">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="ios-large-title mt-1">{greeting()}</h1>
          <p className="ios-subtitle mt-1.5">
            One action away from the next deal. Pick it below.
          </p>
        </div>
        <button
          onClick={onOpenAddLead}
          className="flex items-center gap-1.5 pl-3 pr-4 py-2.5 rounded-full bg-blue-500 text-white text-[14px] font-semibold shadow-[0_4px_14px_rgba(59,130,246,0.45)] hover:bg-blue-600 ios-press"
        >
          <Plus className="w-4 h-4" /> Add Lead / Client
        </button>
      </div>

      {/* Do This Next */}
      {next && (
        <section className="ios-card-elev overflow-hidden border border-amber-200/60">
          <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="ios-section-title text-[10.5px]">Do this next</div>
                <div className="text-[20px] font-semibold text-gray-900 tracking-tight mt-0.5 truncate">
                  {next.nextAction ? NEXT_ACTION_LABELS[next.nextAction] : 'Reach out to'} {next.company}
                </div>
                <p className="text-[13px] text-gray-600 mt-1 line-clamp-2">
                  {next.nextActionNote || next.offer}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap text-[12px] tabular-nums">
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(nextWeighted)} weighted
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-600">{formatCurrency(next.oneTimeValue)} deal</span>
                  <span className="text-gray-300">·</span>
                  <span className={`ios-pill ${STAGE_COLORS[next.stage].bg} ${STAGE_COLORS[next.stage].text}`}>
                    {STAGE_LABELS[next.stage]}
                  </span>
                  {nextOverdue && (
                    <span className="ios-pill bg-rose-100 text-rose-700">OVERDUE</span>
                  )}
                  {next.temperature === 'hot' && !nextOverdue && (
                    <span className="ios-pill bg-rose-100 text-rose-700">HOT</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectLead(next)}
              className="flex items-center gap-1.5 pl-3 pr-4 py-2.5 rounded-full bg-gray-900 text-white text-[13px] font-semibold shadow ios-press flex-shrink-0"
            >
              Open lead <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 3 trend KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TrendKpi
          icon={Trophy}
          label="Won this month"
          value={formatCurrency(metrics.wonThisMonth)}
          subtitle={`vs ${formatCurrencyShort(metrics.wonLastMonth)} last mo`}
          delta={wonDelta}
          deltaFormat={(n) => (n === 0 ? '—' : formatCurrencyShort(Math.abs(n)))}
          tint="emerald"
          positiveIsGood
        />
        <TrendKpi
          icon={TrendingUp}
          label="Weighted pipeline"
          value={formatCurrency(metrics.weightedPipeline)}
          subtitle="vs 7 days ago"
          delta={pipelineDelta}
          deltaFormat={(n) => (n === 0 ? '—' : formatCurrencyShort(Math.abs(n)))}
          tint="blue"
          positiveIsGood
        />
        <TrendKpi
          icon={Wallet}
          label="Cash booked (mo)"
          value={formatCurrency(metrics.cashBookedThisMonth)}
          subtitle={`${metrics.openLeads.length} open · ${formatCurrencyShort(metrics.pipelineMRR)}/mo MRR pipeline`}
          tint="violet"
        />
      </div>

      {/* Unmanaged alert (kept — already a decision-making nudge) */}
      {metrics.unmanagedLeads.length > 0 && (
        <div className="ios-card p-4 flex items-center justify-between gap-4 flex-wrap border-rose-200/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/12 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-gray-900 tracking-tight">
                {metrics.unmanagedLeads.length} unmanaged{' '}
                {metrics.unmanagedLeads.length === 1 ? 'lead' : 'leads'}
              </div>
              <div className="text-[12px] text-gray-500">
                These open leads have no next step or due date — they'll go cold.
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {metrics.unmanagedLeads.slice(0, 4).map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLead(l)}
                className="px-2.5 py-1 rounded-full bg-white/80 border border-rose-200/70 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 ios-press"
              >
                {l.name}
              </button>
            ))}
            {metrics.unmanagedLeads.length > 4 && (
              <span className="px-2.5 py-1 text-[11px] font-semibold text-rose-600/80">
                +{metrics.unmanagedLeads.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Follow-up queue split into Overdue / Today */}
      <section className="ios-card overflow-hidden">
        <header className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">Follow-Up Queue</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Ranked by weighted value. One click clears the row.
            </p>
          </div>
          <div className="text-[11px] font-semibold text-gray-500 tabular-nums">
            {overdueRanked.length + todayRanked.length}{' '}
            {overdueRanked.length + todayRanked.length === 1 ? 'item' : 'items'}
          </div>
        </header>

        {overdueRanked.length + todayRanked.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 text-emerald-600 mx-auto mb-3 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-[14px] font-semibold text-gray-800 tracking-tight">Inbox zero on follow-ups.</p>
            <p className="text-[12px] text-gray-500 mt-1">Nothing due today. Go push pipeline forward.</p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            {overdueRanked.length > 0 && (
              <QueueGroup
                title="Overdue"
                tone="rose"
                leads={overdueRanked}
                onSelectLead={onSelectLead}
                onMarkActionDone={onMarkActionDone}
              />
            )}
            {todayRanked.length > 0 && (
              <QueueGroup
                title="Due Today"
                tone="amber"
                leads={todayRanked}
                onSelectLead={onSelectLead}
                onMarkActionDone={onMarkActionDone}
              />
            )}
          </div>
        )}
      </section>

      {/* Deal-type split */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">Pipeline by deal type</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Click any card to open Pipeline filtered to that line.
            </p>
          </div>
          <button
            onClick={() => onNavigateToPipeline('all')}
            className="text-[12px] font-semibold text-gray-500 hover:text-gray-900 ios-press"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEAL_TYPE_ORDER.map((dt) => {
            const stat = metrics.dealTypeBreakdown[dt];
            const Icon = DEAL_TYPE_ICONS[dt];
            const tint = DEAL_TYPE_TINTS[dt];
            const change = stat.changeThisWeek;
            return (
              <button
                key={dt}
                onClick={() => onNavigateToPipeline(dt)}
                className={`ios-card p-4 text-left hover:shadow-md transition ios-press`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-2xl ${tint.bg} ${tint.fg} flex items-center justify-center`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                <div className="ios-section-title text-[10.5px] mb-1">{DEAL_TYPE_LABELS[dt]}</div>
                <div className="text-[20px] font-semibold text-gray-900 tracking-tight tabular-nums leading-tight">
                  {formatCurrency(stat.value)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[12px] tabular-nums">
                  <span className="text-gray-500">{stat.count} open</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">{formatCurrencyShort(stat.weighted)} weighted</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11.5px] font-semibold tabular-nums">
                  <DeltaIcon delta={change} />
                  <span className={deltaColor(change, true)}>
                    {change === 0 ? '—' : `${change > 0 ? '+' : '−'}${formatCurrencyShort(Math.abs(change))} this week`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function QueueGroup({
  title,
  tone,
  leads,
  onSelectLead,
  onMarkActionDone,
}: {
  title: string;
  tone: 'rose' | 'amber';
  leads: Lead[];
  onSelectLead: (l: Lead) => void;
  onMarkActionDone: (id: string, outcome?: ActivityOutcome) => void;
}) {
  const tones = {
    rose: { dot: 'bg-rose-500', text: 'text-rose-700', tint: 'bg-rose-50/40' },
    amber: { dot: 'bg-amber-500', text: 'text-amber-700', tint: 'bg-amber-50/40' },
  } as const;
  const t = tones[tone];
  return (
    <div>
      <div className="px-5 py-2 flex items-center gap-2 border-b ios-divider bg-white/30 sticky top-0 backdrop-blur">
        <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${t.text}`}>{title}</span>
        <span className="text-[11px] text-gray-400 tabular-nums">{leads.length}</span>
      </div>
      <div className="divide-y ios-divider">
        {leads.map((l) => {
          const sc = STAGE_COLORS[l.stage];
          return (
            <div
              key={l.id}
              className={`px-5 py-3.5 hover:bg-black/[0.025] cursor-pointer flex items-start gap-3 ${t.tint}`}
              onClick={() => onSelectLead(l)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkActionDone(l.id);
                }}
                className="w-5 h-5 rounded-full border-[1.5px] border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 flex-shrink-0 mt-0.5 flex items-center justify-center group ios-press"
                title="Mark action done"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[14px] text-gray-900 tracking-tight">
                    {l.nextAction ? NEXT_ACTION_LABELS[l.nextAction] : 'Follow up'}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[14px] font-medium text-gray-700">{l.company}</span>
                  <span className={`ios-pill ${sc.bg} ${sc.text}`}>{STAGE_LABELS[l.stage]}</span>
                </div>
                <p className="text-[12.5px] text-gray-600 mt-1 line-clamp-2">
                  {l.nextActionNote || l.offer}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11.5px] text-gray-500 tabular-nums">
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
              <ChevronRight className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

type TrendTint = 'emerald' | 'blue' | 'violet';

const TREND_TINTS: Record<TrendTint, { bg: string; fg: string }> = {
  emerald: { bg: 'bg-emerald-500/12', fg: 'text-emerald-600' },
  blue: { bg: 'bg-blue-500/12', fg: 'text-blue-600' },
  violet: { bg: 'bg-violet-500/12', fg: 'text-violet-600' },
};

function TrendKpi({
  icon: Icon,
  label,
  value,
  subtitle,
  delta,
  deltaFormat,
  tint,
  positiveIsGood,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  subtitle: string;
  delta?: number;
  deltaFormat?: (n: number) => string;
  tint: TrendTint;
  positiveIsGood?: boolean;
}) {
  const t = TREND_TINTS[tint];
  return (
    <div className="ios-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-2xl ${t.bg} ${t.fg} flex items-center justify-center`}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        {delta !== undefined && deltaFormat && (
          <div className={`flex items-center gap-1 text-[12px] font-semibold tabular-nums ${deltaColor(delta, positiveIsGood)}`}>
            <DeltaIcon delta={delta} />
            {deltaFormat(delta)}
          </div>
        )}
      </div>
      <div className="ios-section-title text-[10.5px] mb-1">{label}</div>
      <div className="text-[26px] font-semibold text-gray-900 tracking-tight tabular-nums leading-tight">
        {value}
      </div>
      <div className="text-[11.5px] font-medium mt-1.5 text-gray-500">{subtitle}</div>
    </div>
  );
}

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5" />;
  if (delta < 0) return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
}

function deltaColor(delta: number, positiveIsGood?: boolean) {
  if (delta === 0) return 'text-gray-400';
  const good = positiveIsGood ? delta > 0 : delta < 0;
  return good ? 'text-emerald-600' : 'text-rose-600';
}

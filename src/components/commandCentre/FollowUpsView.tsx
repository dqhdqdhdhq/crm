import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Phone,
  MessageCircle,
  Mail,
  StickyNote,
  MoonStar,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  Lead,
  ActivityType,
  ActivityOutcome,
  STAGE_LABELS,
  STAGE_COLORS,
  NEXT_ACTION_LABELS,
  DealType,
  DEAL_TYPE_LABELS,
} from '../../types/crm';
import { CRMMetrics, formatCurrency, formatDate, leadDealType } from '../../hooks/useCRM';

interface Props {
  metrics: CRMMetrics;
  onSelectLead: (lead: Lead) => void;
  onMarkActionDone: (id: string, outcome?: ActivityOutcome) => void;
  onLogActivity: (
    leadId: string,
    type: ActivityType,
    description: string,
    outcome?: ActivityOutcome,
  ) => void;
  onSnooze: (id: string, days: number) => void;
}

const DEAL_TYPE_FILTERS: { id: 'all' | DealType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai-commercial', label: DEAL_TYPE_LABELS['ai-commercial'] },
  { id: 'website', label: DEAL_TYPE_LABELS.website },
  { id: 'ai-automation', label: DEAL_TYPE_LABELS['ai-automation'] },
];

const QUICK_OUTCOMES: { id: ActivityOutcome; label: string; tone: string }[] = [
  { id: 'replied', label: 'Replied', tone: 'bg-sky-100 text-sky-800 hover:bg-sky-200' },
  { id: 'no-reply', label: 'No reply', tone: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { id: 'meeting-booked', label: 'Meeting booked', tone: 'bg-violet-100 text-violet-800 hover:bg-violet-200' },
  { id: 'positive', label: 'Positive', tone: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
  { id: 'objection', label: 'Objection', tone: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
];

const SNOOZE_OPTIONS: { days: number; label: string }[] = [
  { days: 1, label: '+1d' },
  { days: 3, label: '+3d' },
  { days: 7, label: 'Next week' },
];

const sortByWeighted = (a: Lead, b: Lead) => {
  const wa = (a.oneTimeValue * a.probability) / 100;
  const wb = (b.oneTimeValue * b.probability) / 100;
  if (wb !== wa) return wb - wa;
  const da = a.nextActionDueDate ? new Date(a.nextActionDueDate).getTime() : Infinity;
  const db = b.nextActionDueDate ? new Date(b.nextActionDueDate).getTime() : Infinity;
  return da - db;
};

export function FollowUpsView({
  metrics,
  onSelectLead,
  onMarkActionDone,
  onLogActivity,
  onSnooze,
}: Props) {
  const [filter, setFilter] = useState<'all' | DealType>('all');
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);

  const filterLead = (l: Lead) => filter === 'all' || leadDealType(l) === filter;

  const overdue = useMemo(
    () => metrics.overdueFollowUps.filter(filterLead).sort(sortByWeighted),
    [metrics.overdueFollowUps, filter],
  );
  const today = useMemo(
    () => metrics.followUpsDueToday.filter(filterLead).sort(sortByWeighted),
    [metrics.followUpsDueToday, filter],
  );
  const unmanaged = useMemo(
    () => metrics.unmanagedLeads.filter(filterLead).sort(sortByWeighted),
    [metrics.unmanagedLeads, filter],
  );

  const upcomingAll = useMemo(() => {
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const horizon7 = new Date(todayEnd);
    horizon7.setDate(horizon7.getDate() + 7);
    const horizon14 = new Date(todayEnd);
    horizon14.setDate(horizon14.getDate() + 14);
    return metrics.openLeads
      .filter(filterLead)
      .filter((l) => l.nextActionDueDate)
      .filter((l) => new Date(l.nextActionDueDate!) > todayEnd)
      .filter((l) =>
        upcomingExpanded
          ? new Date(l.nextActionDueDate!) <= horizon14
          : new Date(l.nextActionDueDate!) <= horizon7,
      )
      .sort(sortByWeighted);
  }, [metrics.openLeads, filter, upcomingExpanded]);

  return (
    <div className="p-6 md:p-8 max-w-[1100px] mx-auto space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="ios-subtitle">Today's execution list — log calls and snooze without leaving the row.</div>
          <h1 className="ios-large-title mt-1">Follow-Ups</h1>
        </div>
      </header>

      {/* Today, so far — retro strip */}
      <section className="ios-card p-4">
        <div className="ios-section-title text-[10.5px] mb-3">Today, so far</div>
        <div className="grid grid-cols-3 gap-3">
          <RetroStat icon={Zap} label="Actions logged" value={metrics.actionsCompletedToday} tone="indigo" />
          <RetroStat icon={Trophy} label="Wins" value={metrics.winsToday.length} tone="emerald" />
          <RetroStat icon={XCircle} label="Losses" value={metrics.lossesToday.length} tone="rose" />
        </div>
      </section>

      {/* Triage stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Overdue" value={overdue.length} tone="rose" icon={AlertTriangle} />
        <Stat label="Due Today" value={today.length} tone="amber" icon={Clock} />
        <Stat label="Unmanaged" value={unmanaged.length} tone="violet" icon={AlertTriangle} />
      </div>

      {/* Deal-type filter */}
      <nav className="ios-segmented w-fit" role="tablist">
        {DEAL_TYPE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`ios-segment ${filter === f.id ? 'ios-segment-active' : ''}`}
            role="tab"
            aria-selected={filter === f.id}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <Section
        title="Overdue"
        empty="No overdue follow-ups. You're on top of it."
        tone="rose"
        leads={overdue}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        onLogActivity={onLogActivity}
        onSnooze={onSnooze}
      />

      <Section
        title="Due Today"
        empty="Nothing due today."
        tone="amber"
        leads={today}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        onLogActivity={onLogActivity}
        onSnooze={onSnooze}
      />

      <Section
        title="Unmanaged (no next step)"
        empty="Every lead has a plan. Good."
        tone="violet"
        leads={unmanaged}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        onLogActivity={onLogActivity}
        onSnooze={onSnooze}
        hideMarkDone
      />

      <Section
        title={upcomingExpanded ? 'Upcoming (next 14 days)' : 'Upcoming (next 7 days)'}
        empty="No upcoming follow-ups scheduled."
        tone="gray"
        leads={upcomingAll}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        onLogActivity={onLogActivity}
        onSnooze={onSnooze}
        footer={
          <button
            onClick={() => setUpcomingExpanded((v) => !v)}
            className="w-full px-5 py-2.5 text-[12px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-black/[0.025] ios-press"
          >
            {upcomingExpanded ? 'Collapse' : 'Show next 7'}
          </button>
        }
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: 'rose' | 'amber' | 'violet';
  icon: typeof AlertTriangle;
}) {
  const tones = {
    rose: { bg: 'bg-rose-500/12', fg: 'text-rose-600' },
    amber: { bg: 'bg-amber-500/15', fg: 'text-amber-600' },
    violet: { bg: 'bg-violet-500/12', fg: 'text-violet-600' },
  } as const;
  const t = tones[tone];
  return (
    <div className="ios-card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl ${t.bg} ${t.fg} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[22px] font-semibold text-gray-900 tracking-tight tabular-nums leading-none">
          {value}
        </div>
        <div className="ios-section-title text-[10.5px] mt-1">{label}</div>
      </div>
    </div>
  );
}

function RetroStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Zap;
  label: string;
  value: number;
  tone: 'indigo' | 'emerald' | 'rose';
}) {
  const tones = {
    indigo: { bg: 'bg-indigo-500/12', fg: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-500/12', fg: 'text-emerald-600' },
    rose: { bg: 'bg-rose-500/12', fg: 'text-rose-600' },
  } as const;
  const t = tones[tone];
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/40 border border-white/60">
      <div className={`w-9 h-9 rounded-2xl ${t.bg} ${t.fg} flex items-center justify-center`}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div>
        <div className="text-[18px] font-semibold text-gray-900 tabular-nums leading-none">
          {value}
        </div>
        <div className="ios-section-title text-[10.5px] mt-1">{label}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  leads,
  empty,
  tone,
  onSelectLead,
  onMarkActionDone,
  onLogActivity,
  onSnooze,
  hideMarkDone,
  footer,
}: {
  title: string;
  leads: Lead[];
  empty: string;
  tone: 'rose' | 'amber' | 'violet' | 'gray';
  onSelectLead: (l: Lead) => void;
  onMarkActionDone: (id: string, outcome?: ActivityOutcome) => void;
  onLogActivity: (
    leadId: string,
    type: ActivityType,
    description: string,
    outcome?: ActivityOutcome,
  ) => void;
  onSnooze: (id: string, days: number) => void;
  hideMarkDone?: boolean;
  footer?: React.ReactNode;
}) {
  const tones = {
    rose: 'bg-rose-50/30',
    amber: 'bg-amber-50/30',
    violet: 'bg-violet-50/30',
    gray: 'bg-transparent',
  } as const;
  return (
    <section className="ios-card overflow-hidden">
      <header className="px-5 py-3 border-b ios-divider flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">{title}</h2>
        <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{leads.length}</span>
      </header>
      <div className="divide-y ios-divider">
        {leads.length === 0 && (
          <div className="p-6 text-center text-[13px] text-gray-400 italic">{empty}</div>
        )}
        {leads.map((l) => (
          <Row
            key={l.id}
            lead={l}
            toneBg={tones[tone]}
            onSelectLead={onSelectLead}
            onMarkActionDone={onMarkActionDone}
            onLogActivity={onLogActivity}
            onSnooze={onSnooze}
            hideMarkDone={hideMarkDone}
          />
        ))}
      </div>
      {footer}
    </section>
  );
}

function Row({
  lead: l,
  toneBg,
  onSelectLead,
  onMarkActionDone,
  onLogActivity,
  onSnooze,
  hideMarkDone,
}: {
  lead: Lead;
  toneBg: string;
  onSelectLead: (l: Lead) => void;
  onMarkActionDone: (id: string, outcome?: ActivityOutcome) => void;
  onLogActivity: (
    leadId: string,
    type: ActivityType,
    description: string,
    outcome?: ActivityOutcome,
  ) => void;
  onSnooze: (id: string, days: number) => void;
  hideMarkDone?: boolean;
}) {
  const [showOutcomes, setShowOutcomes] = useState(false);
  const [logFor, setLogFor] = useState<ActivityType | null>(null);
  const sc = STAGE_COLORS[l.stage];

  const quickActions: { type: ActivityType; label: string; icon: typeof Phone; tone: string }[] = [
    { type: 'call', label: 'Call', icon: Phone, tone: 'hover:bg-blue-50 hover:text-blue-700' },
    { type: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, tone: 'hover:bg-emerald-50 hover:text-emerald-700' },
    { type: 'email', label: 'Email', icon: Mail, tone: 'hover:bg-violet-50 hover:text-violet-700' },
    { type: 'note', label: 'Note', icon: StickyNote, tone: 'hover:bg-amber-50 hover:text-amber-700' },
  ];

  const logQuick = (type: ActivityType, outcome: ActivityOutcome) => {
    const label = quickActions.find((q) => q.type === type)?.label ?? 'Action';
    const outcomeLabel = QUICK_OUTCOMES.find((o) => o.id === outcome)?.label ?? outcome;
    onLogActivity(l.id, type, `${label} — ${outcomeLabel}`, outcome);
    setLogFor(null);
  };

  return (
    <div className={`p-4 ${toneBg}`}>
      <div className="flex items-start gap-3">
        {!hideMarkDone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOutcomes((v) => !v);
            }}
            className="w-5 h-5 rounded-full border-[1.5px] border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 flex-shrink-0 mt-0.5 flex items-center justify-center group ios-press"
            title="Mark done with outcome"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100" />
          </button>
        )}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onSelectLead(l)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[14px] text-gray-900 tracking-tight">
              {l.nextAction ? NEXT_ACTION_LABELS[l.nextAction] : 'No action set'}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-[14px] font-medium text-gray-700">{l.company}</span>
            <span className={`ios-pill ${sc.bg} ${sc.text}`}>{STAGE_LABELS[l.stage]}</span>
          </div>
          {l.nextActionNote && (
            <p className="text-[12.5px] text-gray-600 mt-1">{l.nextActionNote}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-[11.5px] text-gray-500 tabular-nums">
            <span className="font-semibold text-emerald-700">
              {formatCurrency((l.oneTimeValue * l.probability) / 100)} weighted
            </span>
            <span>·</span>
            <span>{l.nextActionDueDate ? `Due ${formatDate(l.nextActionDueDate)}` : 'No due date'}</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
      </div>

      {/* Inline quick-action bar */}
      <div className="mt-3 flex items-center gap-1 flex-wrap">
        {quickActions.map((qa) => (
          <button
            key={qa.type}
            onClick={() => {
              setLogFor(logFor === qa.type ? null : qa.type);
              setShowOutcomes(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11.5px] font-semibold text-gray-600 transition ${qa.tone} ${
              logFor === qa.type ? 'bg-gray-900/[0.06] text-gray-900' : ''
            }`}
          >
            <qa.icon className="w-3 h-3" />
            {qa.label}
          </button>
        ))}

        <div className="flex-1" />

        {SNOOZE_OPTIONS.map((s) => (
          <button
            key={s.days}
            onClick={() => onSnooze(l.id, s.days)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11.5px] font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
            title={`Snooze ${s.label}`}
          >
            <MoonStar className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Outcome picker for Mark Done */}
      {showOutcomes && (
        <div className="mt-2 p-2 rounded-xl bg-black/[0.03] border border-white/60">
          <div className="ios-section-title text-[10px] mb-1.5 px-1">Outcome — clears step</div>
          <div className="flex flex-wrap gap-1">
            {QUICK_OUTCOMES.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  onMarkActionDone(l.id, o.id);
                  setShowOutcomes(false);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${o.tone} transition`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Outcome picker for inline log */}
      {logFor && (
        <div className="mt-2 p-2 rounded-xl bg-black/[0.03] border border-white/60">
          <div className="ios-section-title text-[10px] mb-1.5 px-1">
            Log {quickActions.find((q) => q.type === logFor)?.label.toLowerCase()} — outcome?
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_OUTCOMES.map((o) => (
              <button
                key={o.id}
                onClick={() => logQuick(logFor, o.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${o.tone} transition`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

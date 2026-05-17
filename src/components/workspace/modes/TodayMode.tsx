import {
  Flame,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  Zap,
  Trophy,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import {
  Lead,
  ActivityOutcome,
  STAGE_LABELS,
  STAGE_COLORS,
  NEXT_ACTION_LABELS,
} from '../../../types/crm';
import { CRMMetrics, formatCurrency, isOverdue } from '../../../hooks/useCRM';

interface Props {
  metrics: CRMMetrics;
  onSelectLead: (id: string) => void;
  onMarkActionDone: (id: string, outcome?: ActivityOutcome) => void;
  onOpenAddLead: () => void;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const sortByWeighted = (a: Lead, b: Lead) =>
  (b.oneTimeValue * b.probability) / 100 - (a.oneTimeValue * a.probability) / 100;

export function TodayMode({
  metrics,
  onSelectLead,
  onMarkActionDone,
  onOpenAddLead,
}: Props) {
  const next = metrics.nextBestAction;
  const nextWeighted = next ? (next.oneTimeValue * next.probability) / 100 : 0;
  const nextOverdue = next ? isOverdue(next.nextActionDueDate) : false;

  const overdueRanked = [...metrics.overdueFollowUps].sort(sortByWeighted);
  const todayRanked = [...metrics.followUpsDueToday].sort(sortByWeighted);

  // "Booked for today" — meeting-shape next-actions due today
  const meetingsToday = metrics.followUpsDueToday.filter(
    (l) => l.nextAction === 'book-meeting',
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="ios-subtitle text-[12.5px]">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <h1 className="ios-large-title mt-0.5 !text-[28px]">{greeting()}</h1>
        </div>
        <button
          onClick={onOpenAddLead}
          className="flex items-center gap-1.5 pl-2.5 pr-3.5 py-2 rounded-full bg-blue-500 text-white text-[12.5px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.4)] hover:bg-blue-600 ios-press"
        >
          + Add Lead
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
                <div className="text-[19px] font-semibold text-gray-900 tracking-tight mt-0.5 truncate">
                  {next.nextAction ? NEXT_ACTION_LABELS[next.nextAction] : 'Reach out to'}{' '}
                  {next.company}
                </div>
                <p className="text-[12.5px] text-gray-600 mt-1 line-clamp-2">
                  {next.nextActionNote || next.offer}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap text-[11.5px] tabular-nums">
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(nextWeighted)} weighted
                  </span>
                  <span className="text-gray-300">·</span>
                  <span
                    className={`ios-pill ${STAGE_COLORS[next.stage].bg} ${STAGE_COLORS[next.stage].text}`}
                  >
                    {STAGE_LABELS[next.stage]}
                  </span>
                  {nextOverdue && (
                    <span className="ios-pill bg-rose-100 text-rose-700">OVERDUE</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => onSelectLead(next.id)}
              className="flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full bg-gray-900 text-white text-[12.5px] font-semibold shadow ios-press flex-shrink-0"
            >
              Open <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* Today retro */}
      <section className="ios-card p-4">
        <div className="ios-section-title text-[10.5px] mb-3">Today, so far</div>
        <div className="grid grid-cols-3 gap-3">
          <RetroStat icon={Zap} label="Logged" value={metrics.actionsCompletedToday} tone="indigo" />
          <RetroStat icon={Trophy} label="Wins" value={metrics.winsToday.length} tone="emerald" />
          <RetroStat icon={XCircle} label="Losses" value={metrics.lossesToday.length} tone="rose" />
        </div>
      </section>

      {/* Today's booked meetings */}
      {meetingsToday.length > 0 && (
        <section className="ios-card overflow-hidden">
          <header className="px-4 py-3 border-b ios-divider flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-violet-600" />
            <h2 className="text-[14px] font-semibold text-gray-900 tracking-tight">
              Booked for today
            </h2>
            <span className="text-[11px] font-semibold text-gray-500 tabular-nums ml-auto">
              {meetingsToday.length}
            </span>
          </header>
          <div className="divide-y ios-divider">
            {meetingsToday.map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLead(l.id)}
                className="w-full px-4 py-3 text-left hover:bg-black/[0.025] flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-gray-900 truncate">
                    {l.company}
                  </div>
                  <div className="text-[11.5px] text-gray-500 truncate">
                    {l.name} · {l.nextActionNote || l.offer}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Unmanaged alert */}
      {metrics.unmanagedLeads.length > 0 && (
        <div className="ios-card p-3.5 flex items-center justify-between gap-3 flex-wrap border border-rose-200/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/12 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-gray-900 tracking-tight">
                {metrics.unmanagedLeads.length} unmanaged{' '}
                {metrics.unmanagedLeads.length === 1 ? 'lead' : 'leads'}
              </div>
              <div className="text-[11.5px] text-gray-500 truncate">
                No next step or due date — they'll go cold.
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {metrics.unmanagedLeads.slice(0, 3).map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLead(l.id)}
                className="px-2 py-1 rounded-full bg-white/80 border border-rose-200/70 text-[10.5px] font-semibold text-rose-700 hover:bg-rose-50 ios-press"
              >
                {l.name}
              </button>
            ))}
            {metrics.unmanagedLeads.length > 3 && (
              <span className="px-2 py-1 text-[10.5px] font-semibold text-rose-600/80">
                +{metrics.unmanagedLeads.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Follow-up queue */}
      <section className="ios-card overflow-hidden">
        <header className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">
              Follow-up queue
            </h2>
            <p className="text-[11.5px] text-gray-500 mt-0.5">
              Ranked by weighted value. One click clears the row.
            </p>
          </div>
          <div className="text-[11px] font-semibold text-gray-500 tabular-nums">
            {overdueRanked.length + todayRanked.length}{' '}
            {overdueRanked.length + todayRanked.length === 1 ? 'item' : 'items'}
          </div>
        </header>

        {overdueRanked.length + todayRanked.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/12 text-emerald-600 mx-auto mb-2 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-[13.5px] font-semibold text-gray-800 tracking-tight">
              Inbox zero on follow-ups.
            </p>
            <p className="text-[11.5px] text-gray-500 mt-1">
              Nothing due today.
            </p>
          </div>
        ) : (
          <div>
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
                title="Due today"
                tone="amber"
                leads={todayRanked}
                onSelectLead={onSelectLead}
                onMarkActionDone={onMarkActionDone}
              />
            )}
          </div>
        )}
      </section>
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
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/40 border border-white/60">
      <div className={`w-8 h-8 rounded-xl ${t.bg} ${t.fg} flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[16px] font-semibold text-gray-900 tabular-nums leading-none">
          {value}
        </div>
        <div className="ios-section-title text-[9.5px] mt-1">{label}</div>
      </div>
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
  onSelectLead: (id: string) => void;
  onMarkActionDone: (id: string, outcome?: ActivityOutcome) => void;
}) {
  const tones = {
    rose: { dot: 'bg-rose-500', text: 'text-rose-700', tint: 'bg-rose-50/40' },
    amber: { dot: 'bg-amber-500', text: 'text-amber-700', tint: 'bg-amber-50/40' },
  } as const;
  const t = tones[tone];
  return (
    <div>
      <div className="px-4 py-1.5 flex items-center gap-2 border-b ios-divider bg-white/30 sticky top-0 backdrop-blur">
        <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
        <span className={`text-[10.5px] font-bold uppercase tracking-wider ${t.text}`}>
          {title}
        </span>
        <span className="text-[10.5px] text-gray-400 tabular-nums">{leads.length}</span>
      </div>
      <div className="divide-y ios-divider">
        {leads.map((l) => {
          const sc = STAGE_COLORS[l.stage];
          return (
            <div
              key={l.id}
              className={`px-4 py-3 hover:bg-black/[0.025] cursor-pointer flex items-start gap-2.5 ${t.tint}`}
              onClick={() => onSelectLead(l.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkActionDone(l.id);
                }}
                className="w-5 h-5 rounded-full border-[1.5px] border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 flex-shrink-0 mt-0.5 flex items-center justify-center group ios-press"
                title="Mark done"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-[13px] text-gray-900 tracking-tight">
                    {l.nextAction ? NEXT_ACTION_LABELS[l.nextAction] : 'Follow up'}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[13px] font-medium text-gray-700">{l.company}</span>
                  <span className={`ios-pill ${sc.bg} ${sc.text}`}>{STAGE_LABELS[l.stage]}</span>
                </div>
                <p className="text-[11.5px] text-gray-600 mt-0.5 line-clamp-2">
                  {l.nextActionNote || l.offer}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10.5px] text-gray-500 tabular-nums">
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency((l.oneTimeValue * l.probability) / 100)} weighted
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 mt-1 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

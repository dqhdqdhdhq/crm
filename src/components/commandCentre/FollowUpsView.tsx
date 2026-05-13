import { CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { Lead, STAGE_LABELS, STAGE_COLORS, NEXT_ACTION_LABELS } from '../../types/crm';
import { CRMMetrics, formatCurrency, formatDate } from '../../hooks/useCRM';

interface Props {
  metrics: CRMMetrics;
  onSelectLead: (lead: Lead) => void;
  onMarkActionDone: (id: string) => void;
}

export function FollowUpsView({ metrics, onSelectLead, onMarkActionDone }: Props) {
  const upcoming = metrics.openLeads
    .filter((l) => {
      if (!l.nextActionDueDate) return false;
      const d = new Date(l.nextActionDueDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return d > today;
    })
    .sort(
      (a, b) =>
        new Date(a.nextActionDueDate!).getTime() - new Date(b.nextActionDueDate!).getTime(),
    );

  return (
    <div className="p-8 max-w-[1100px] mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Follow-Ups</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your daily execution list. Every open lead needs a next action — no exceptions.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Overdue"
          value={metrics.overdueFollowUps.length}
          tone="rose"
          icon={AlertTriangle}
        />
        <Stat
          label="Due Today"
          value={metrics.followUpsDueToday.length}
          tone="amber"
          icon={Clock}
        />
        <Stat
          label="Unmanaged"
          value={metrics.unmanagedLeads.length}
          tone="violet"
          icon={AlertTriangle}
        />
      </div>

      <Section
        title="Overdue"
        empty="No overdue follow-ups. You're on top of it."
        leads={metrics.overdueFollowUps}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        tone="rose"
      />

      <Section
        title="Due Today"
        empty="Nothing due today."
        leads={metrics.followUpsDueToday}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        tone="amber"
      />

      <Section
        title="Unmanaged (no next step)"
        empty="Every lead has a plan. Good."
        leads={metrics.unmanagedLeads}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        tone="violet"
        hideAction
      />

      <Section
        title="Upcoming"
        empty="No upcoming follow-ups scheduled."
        leads={upcoming}
        onSelectLead={onSelectLead}
        onMarkActionDone={onMarkActionDone}
        tone="gray"
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
    rose: 'from-rose-500 to-rose-600',
    amber: 'from-amber-500 to-orange-500',
    violet: 'from-violet-500 to-violet-600',
  } as const;
  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tones[tone]} text-white flex items-center justify-center shadow`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  leads,
  empty,
  onSelectLead,
  onMarkActionDone,
  tone,
  hideAction,
}: {
  title: string;
  leads: Lead[];
  empty: string;
  onSelectLead: (l: Lead) => void;
  onMarkActionDone: (id: string) => void;
  tone: 'rose' | 'amber' | 'violet' | 'gray';
  hideAction?: boolean;
}) {
  const tones = {
    rose: 'bg-rose-50/30',
    amber: 'bg-amber-50/30',
    violet: 'bg-violet-50/30',
    gray: 'bg-white',
  } as const;
  return (
    <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      <header className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <span className="text-xs font-bold text-gray-500">{leads.length}</span>
      </header>
      <div className="divide-y divide-gray-50">
        {leads.length === 0 && (
          <div className="p-6 text-center text-sm text-gray-400 italic">{empty}</div>
        )}
        {leads.map((l) => {
          const stageColor = STAGE_COLORS[l.stage];
          return (
            <div
              key={l.id}
              onClick={() => onSelectLead(l)}
              className={`p-4 cursor-pointer hover:bg-gray-50/80 flex items-start gap-3 transition ${tones[tone]}`}
            >
              {!hideAction && (
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
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900">
                    {l.nextAction ? NEXT_ACTION_LABELS[l.nextAction] : 'No action set'}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm font-semibold text-gray-700">{l.company}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${stageColor.bg} ${stageColor.text}`}
                  >
                    {STAGE_LABELS[l.stage]}
                  </span>
                </div>
                {l.nextActionNote && (
                  <p className="text-xs text-gray-600 mt-1">{l.nextActionNote}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency((l.oneTimeValue * l.probability) / 100)} weighted
                  </span>
                  <span>·</span>
                  <span>Due {formatDate(l.nextActionDueDate)}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

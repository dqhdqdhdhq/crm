import { useMemo } from 'react';
import {
  Phone,
  Mail,
  MessageCircle,
  CalendarCheck,
  FileText,
  StickyNote,
  CheckCircle2,
  XCircle,
  GitBranch,
} from 'lucide-react';
import {
  Lead,
  Activity,
  ActivityType,
  ACTIVITY_OUTCOME_LABELS,
} from '../../../types/crm';

interface Props {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}

interface FeedItem {
  activity: Activity;
  lead: Lead;
}

const TYPE_ICON: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: CalendarCheck,
  'proposal-sent': FileText,
  note: StickyNote,
  'stage-change': GitBranch,
  won: CheckCircle2,
  lost: XCircle,
};

const TYPE_TONE: Record<ActivityType, { bg: string; fg: string }> = {
  call: { bg: 'bg-blue-500/12', fg: 'text-blue-600' },
  email: { bg: 'bg-violet-500/12', fg: 'text-violet-600' },
  whatsapp: { bg: 'bg-emerald-500/12', fg: 'text-emerald-600' },
  meeting: { bg: 'bg-indigo-500/12', fg: 'text-indigo-600' },
  'proposal-sent': { bg: 'bg-amber-500/15', fg: 'text-amber-600' },
  note: { bg: 'bg-slate-500/12', fg: 'text-slate-600' },
  'stage-change': { bg: 'bg-cyan-500/12', fg: 'text-cyan-600' },
  won: { bg: 'bg-emerald-500/15', fg: 'text-emerald-700' },
  lost: { bg: 'bg-rose-500/12', fg: 'text-rose-600' },
};

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function dayLabel(d: Date) {
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const target = startOfDay(d);
  if (target.getTime() === today.getTime()) return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function ActivityMode({ leads, onSelectLead }: Props) {
  const grouped = useMemo(() => {
    const items: FeedItem[] = [];
    leads.forEach((l) =>
      l.activities.forEach((a) => items.push({ activity: a, lead: l })),
    );
    items.sort(
      (a, b) =>
        new Date(b.activity.createdAt).getTime() -
        new Date(a.activity.createdAt).getTime(),
    );
    const byDay = new Map<string, FeedItem[]>();
    items.forEach((i) => {
      const key = startOfDay(new Date(i.activity.createdAt)).toISOString();
      const arr = byDay.get(key) ?? [];
      arr.push(i);
      byDay.set(key, arr);
    });
    return Array.from(byDay.entries()).map(([key, arr]) => ({
      date: new Date(key),
      items: arr,
    }));
  }, [leads]);

  return (
    <div className="space-y-4">
      <div>
        <div className="ios-subtitle text-[12.5px]">Every touch, every lead</div>
        <h1 className="ios-large-title mt-0.5 !text-[26px]">Activity</h1>
      </div>

      {grouped.length === 0 ? (
        <div className="ios-card p-8 text-center text-[13px] text-gray-400 italic">
          No activity yet. Log a call or note from any lead.
        </div>
      ) : (
        grouped.map((g) => (
          <section key={g.date.toISOString()} className="ios-card overflow-hidden">
            <header className="px-4 py-2.5 border-b ios-divider flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur">
              <h2 className="text-[13px] font-semibold text-gray-900 tracking-tight">
                {dayLabel(g.date)}
              </h2>
              <span className="text-[10.5px] font-semibold text-gray-400 tabular-nums">
                {g.items.length}
              </span>
            </header>
            <div className="divide-y ios-divider">
              {g.items.map(({ activity, lead }) => {
                const Icon = TYPE_ICON[activity.type] ?? StickyNote;
                const tone = TYPE_TONE[activity.type] ?? TYPE_TONE.note;
                return (
                  <button
                    key={activity.id}
                    onClick={() => onSelectLead(lead.id)}
                    className="w-full px-4 py-3 text-left hover:bg-black/[0.025] flex items-start gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl ${tone.bg} ${tone.fg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-gray-900 truncate">
                          {lead.company}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[12px] text-gray-600 truncate">
                          {lead.name}
                        </span>
                        {activity.outcome && (
                          <span className="ios-pill bg-slate-100 text-slate-700">
                            {ACTIVITY_OUTCOME_LABELS[activity.outcome]}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-700 mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="text-[10.5px] text-gray-400 mt-1 tabular-nums">
                        {new Date(activity.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

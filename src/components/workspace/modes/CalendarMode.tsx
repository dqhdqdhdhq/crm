import { useMemo } from 'react';
import { Lead, STAGE_COLORS, NEXT_ACTION_LABELS } from '../../../types/crm';
import { formatCurrencyShort } from '../../../hooks/useCRM';

interface Props {
  leads: Lead[];
  onSelectLead: (id: string) => void;
}

interface DayBucket {
  date: Date;
  key: string;
  isToday: boolean;
  isWeekend: boolean;
  items: { lead: Lead; kind: 'due' | 'meeting' }[];
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function dayKey(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10);
}

// 2-week strip: today + 13 forward days, plus an "overflow" footer for items
// scheduled further out.
export function CalendarMode({ leads, onSelectLead }: Props) {
  const buckets = useMemo<{ days: DayBucket[]; overflow: Lead[] }>(() => {
    const start = startOfDay(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 14);

    const days: DayBucket[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        key: dayKey(d),
        isToday: i === 0,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        items: [],
      });
    }
    const dayByKey = new Map(days.map((b) => [b.key, b]));
    const overflow: Lead[] = [];

    leads.forEach((l) => {
      if (l.stage === 'won' || l.stage === 'lost') return;
      if (!l.nextActionDueDate) return;
      const due = startOfDay(new Date(l.nextActionDueDate));
      if (due < start) return; // overdue belongs to TodayMode
      if (due >= end) {
        overflow.push(l);
        return;
      }
      const bucket = dayByKey.get(dayKey(due));
      if (bucket) {
        const kind = l.nextAction === 'book-meeting' ? 'meeting' : 'due';
        bucket.items.push({ lead: l, kind });
      }
    });

    days.forEach((b) =>
      b.items.sort(
        (a, b2) =>
          (b2.lead.oneTimeValue * b2.lead.probability) / 100 -
          (a.lead.oneTimeValue * a.lead.probability) / 100,
      ),
    );

    return { days, overflow };
  }, [leads]);

  return (
    <div className="space-y-4">
      <div>
        <div className="ios-subtitle text-[12.5px]">Next 14 days</div>
        <h1 className="ios-large-title mt-0.5 !text-[26px]">Calendar</h1>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {buckets.days.map((b) => (
          <div
            key={b.key}
            className={`ios-card !rounded-2xl p-2.5 min-h-[140px] flex flex-col ${
              b.isToday ? 'ring-2 ring-blue-300' : b.isWeekend ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-baseline justify-between mb-1.5">
              <span
                className={`ios-section-title !text-[10px] ${
                  b.isToday ? 'text-blue-700' : ''
                }`}
              >
                {b.date.toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
              <span
                className={`text-[14px] font-semibold tabular-nums ${
                  b.isToday ? 'text-blue-700' : 'text-gray-700'
                }`}
              >
                {b.date.getDate()}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              {b.items.length === 0 ? (
                <div className="text-[10px] text-gray-300 italic mt-2">—</div>
              ) : (
                b.items.map(({ lead, kind }) => {
                  const sc = STAGE_COLORS[lead.stage];
                  return (
                    <button
                      key={lead.id}
                      onClick={() => onSelectLead(lead.id)}
                      className={`w-full text-left px-1.5 py-1 rounded-lg ${sc.bg} ${sc.text} hover:opacity-80 transition`}
                    >
                      <div className="text-[10.5px] font-semibold truncate">
                        {kind === 'meeting' ? '🗓 ' : ''}
                        {lead.company}
                      </div>
                      <div className="text-[9.5px] opacity-80 truncate">
                        {lead.nextAction ? NEXT_ACTION_LABELS[lead.nextAction] : '—'} ·{' '}
                        {formatCurrencyShort((lead.oneTimeValue * lead.probability) / 100)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {buckets.overflow.length > 0 && (
        <section className="ios-card overflow-hidden">
          <header className="px-4 py-2.5 border-b ios-divider flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-900 tracking-tight">
              Beyond 14 days
            </h2>
            <span className="text-[11px] font-semibold text-gray-500 tabular-nums">
              {buckets.overflow.length}
            </span>
          </header>
          <div className="divide-y ios-divider">
            {buckets.overflow
              .sort(
                (a, b) =>
                  new Date(a.nextActionDueDate!).getTime() -
                  new Date(b.nextActionDueDate!).getTime(),
              )
              .map((l) => (
                <button
                  key={l.id}
                  onClick={() => onSelectLead(l.id)}
                  className="w-full px-4 py-2.5 text-left hover:bg-black/[0.025] flex items-center gap-3"
                >
                  <div className="text-[11px] tabular-nums text-gray-500 w-16 flex-shrink-0">
                    {new Date(l.nextActionDueDate!).toLocaleDateString('en-IE', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">
                      {l.company}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {l.nextAction ? NEXT_ACTION_LABELS[l.nextAction] : 'No action'} ·{' '}
                      {l.nextActionNote || l.offer}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

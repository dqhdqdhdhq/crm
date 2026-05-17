import { Lead, STAGE_LABELS, STAGE_COLORS } from '../../types/crm';
import { formatCurrencyShort, isOverdue, isToday } from '../../hooks/useCRM';
import { ConnectivityActions } from './ConnectivityActions';

interface Props {
  lead: Lead;
  selected: boolean;
  onSelect: () => void;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// One row in the LeftRail. The row body selects the lead; the inline
// connectivity icons act without selecting (stopPropagation in ConnectivityActions).
export function PersonRow({ lead, selected, onSelect }: Props) {
  const sc = STAGE_COLORS[lead.stage];
  const weighted = (lead.oneTimeValue * lead.probability) / 100;
  const overdue = isOverdue(lead.nextActionDueDate);
  const due = isToday(lead.nextActionDueDate);
  const attentionDot = overdue
    ? 'bg-rose-500'
    : due
      ? 'bg-amber-500'
      : lead.temperature === 'hot'
        ? 'bg-rose-300'
        : 'bg-transparent';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group px-3 py-2.5 cursor-pointer transition border-l-2 ${
        selected
          ? 'bg-white/85 border-blue-500'
          : 'border-transparent hover:bg-white/60'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="relative flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-xl text-white text-[11px] font-semibold flex items-center justify-center ${
              lead.dealType === 'ai-commercial'
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                : lead.isClient && lead.stage === 'won'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-br from-slate-600 to-slate-800'
            }`}
          >
            {initials(lead.name)}
          </div>
          <span
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-[#f6f6f8] ${attentionDot}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-semibold text-gray-900 tracking-tight truncate">
              {lead.company || lead.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500 truncate">
            <span className="truncate">{lead.name}</span>
            <span className="text-gray-300">·</span>
            <span className={`ios-pill ${sc.bg} ${sc.text} !py-[1px] !px-1.5 !text-[10px]`}>
              {STAGE_LABELS[lead.stage]}
            </span>
          </div>

          {(lead.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {lead.tags!.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="ios-pill bg-slate-100 text-slate-700 !py-[1px] !px-1.5 !text-[9.5px]"
                >
                  {t}
                </span>
              ))}
              {lead.tags!.length > 4 && (
                <span className="text-[9.5px] text-gray-400">+{lead.tags!.length - 4}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-1.5 gap-2">
            <ConnectivityActions lead={lead} />
            <div className="text-right text-[10.5px] tabular-nums flex-shrink-0">
              <div className="font-semibold text-emerald-700">
                {formatCurrencyShort(weighted)}
              </div>
              {lead.nextActionDueDate && (
                <div className={overdue ? 'text-rose-600' : due ? 'text-amber-700' : 'text-gray-400'}>
                  {overdue
                    ? 'Overdue'
                    : due
                      ? 'Today'
                      : new Date(lead.nextActionDueDate).toLocaleDateString('en-IE', {
                          day: '2-digit',
                          month: 'short',
                        })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

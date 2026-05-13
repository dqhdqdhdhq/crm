import { useMemo, useState } from 'react';
import { Search, ArrowUpDown, AlertCircle } from 'lucide-react';
import {
  Lead,
  STAGE_LABELS,
  STAGE_COLORS,
  TEMPERATURE_COLORS,
  TEMPERATURE_LABELS,
  NEXT_ACTION_LABELS,
} from '../../types/crm';
import { formatCurrency, formatDate, isOverdue, isToday } from '../../hooks/useCRM';

interface Props {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  showFilters?: boolean;
  emptyMessage?: string;
}

type SortKey = 'priority' | 'value' | 'weighted' | 'due' | 'updated';

export function LeadTable({ leads, onSelectLead, showFilters = true, emptyMessage }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'leads' | 'clients' | 'hot' | 'overdue' | 'unmanaged'>(
    'all',
  );
  const [sort, setSort] = useState<SortKey>('priority');

  const filtered = useMemo(() => {
    let rows = leads;
    if (filter === 'leads') rows = rows.filter((l) => !l.isClient && l.stage !== 'lost');
    if (filter === 'clients') rows = rows.filter((l) => l.isClient);
    if (filter === 'hot') rows = rows.filter((l) => l.temperature === 'hot' && l.stage !== 'won' && l.stage !== 'lost');
    if (filter === 'overdue')
      rows = rows.filter((l) => l.stage !== 'won' && l.stage !== 'lost' && isOverdue(l.nextActionDueDate));
    if (filter === 'unmanaged')
      rows = rows.filter(
        (l) => l.stage !== 'won' && l.stage !== 'lost' && (!l.nextAction || !l.nextActionDueDate),
      );

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.offer.toLowerCase().includes(q),
      );
    }

    const sorted = [...rows];
    sorted.sort((a, b) => {
      if (sort === 'value') return b.oneTimeValue - a.oneTimeValue;
      if (sort === 'weighted')
        return (b.oneTimeValue * b.probability) / 100 - (a.oneTimeValue * a.probability) / 100;
      if (sort === 'due') {
        const at = a.nextActionDueDate ? new Date(a.nextActionDueDate).getTime() : Infinity;
        const bt = b.nextActionDueDate ? new Date(b.nextActionDueDate).getTime() : Infinity;
        return at - bt;
      }
      if (sort === 'updated')
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      const tempScore = (l: Lead) =>
        l.temperature === 'hot' ? 3 : l.temperature === 'warm' ? 2 : 1;
      const overdueScore = (l: Lead) => (isOverdue(l.nextActionDueDate) ? 2 : 0);
      const todayScore = (l: Lead) => (isToday(l.nextActionDueDate) ? 1 : 0);
      const score = (l: Lead) =>
        tempScore(l) * 1000 +
        overdueScore(l) * 800 +
        todayScore(l) * 400 +
        (l.oneTimeValue * l.probability) / 100;
      return score(b) - score(a);
    });
    return sorted;
  }, [leads, query, filter, sort]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex gap-1 flex-wrap">
            {(['all', 'leads', 'clients', 'hot', 'overdue', 'unmanaged'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  filter === k
                    ? 'bg-gray-900 text-white shadow'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700"
            >
              <option value="priority">Sort: Priority</option>
              <option value="weighted">Sort: Weighted Value</option>
              <option value="value">Sort: Deal Value</option>
              <option value="due">Sort: Due Date</option>
              <option value="updated">Sort: Recently Updated</option>
            </select>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs w-48"
              />
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/70 border-b border-gray-100">
            <tr className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-right">Weighted</th>
              <th className="px-4 py-3">Next Action</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3 text-center">Temp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                  {emptyMessage ?? 'No leads match these filters.'}
                </td>
              </tr>
            )}
            {filtered.map((l) => {
              const overdue = isOverdue(l.nextActionDueDate);
              const due = isToday(l.nextActionDueDate);
              const stageColor = STAGE_COLORS[l.stage];
              const tempColor = TEMPERATURE_COLORS[l.temperature];
              const weighted = (l.oneTimeValue * l.probability) / 100;
              const noAction =
                l.stage !== 'won' && l.stage !== 'lost' && (!l.nextAction || !l.nextActionDueDate);

              return (
                <tr
                  key={l.id}
                  onClick={() => onSelectLead(l)}
                  className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {l.name
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{l.company}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{l.offer}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold ${stageColor.bg} ${stageColor.text}`}
                    >
                      {STAGE_LABELS[l.stage]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(l.oneTimeValue)}
                    {l.monthlyValue > 0 && (
                      <div className="text-[10px] font-medium text-gray-400">
                        +{formatCurrency(l.monthlyValue)}/mo
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-700">
                    {formatCurrency(weighted)}
                    <div className="text-[10px] font-medium text-gray-400">{l.probability}%</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {noAction ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                        <AlertCircle className="w-3 h-3" /> No next step
                      </span>
                    ) : (
                      <div>
                        <div className="font-semibold text-gray-800">
                          {l.nextAction ? NEXT_ACTION_LABELS[l.nextAction] : '—'}
                        </div>
                        {l.nextActionNote && (
                          <div className="text-gray-400 truncate max-w-[180px]">
                            {l.nextActionNote}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {l.nextActionDueDate ? (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${
                          overdue
                            ? 'text-rose-600'
                            : due
                            ? 'text-amber-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {overdue && '⚠ '}
                        {due && '🔥 '}
                        {formatDate(l.nextActionDueDate)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${tempColor.bg} ${tempColor.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tempColor.dot}`} />
                      {TEMPERATURE_LABELS[l.temperature]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500 border-t border-gray-100 bg-gray-50/40">
        <span>
          Showing <span className="font-bold text-gray-800">{filtered.length}</span> of {leads.length}
        </span>
        <span className="flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3" /> Tap a row to open
        </span>
      </div>
    </div>
  );
}

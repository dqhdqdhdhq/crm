import { useMemo, useState } from 'react';
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Lead, SUGGESTED_TAGS } from '../../types/crm';
import { isOverdue, isToday } from '../../hooks/useCRM';
import { PersonRow } from './PersonRow';

type SortKey = 'attention' | 'value' | 'recent';

interface Props {
  leads: Lead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'attention', label: 'Needs attention' },
  { id: 'value', label: 'Value' },
  { id: 'recent', label: 'Recent' },
];

type SectionKey =
  | 'overdue'
  | 'today'
  | 'thisWeek'
  | 'active'
  | 'clients'
  | 'dormant'
  | 'closed';

const SECTION_ORDER: SectionKey[] = [
  'overdue',
  'today',
  'thisWeek',
  'active',
  'clients',
  'dormant',
  'closed',
];

const SECTION_LABELS: Record<SectionKey, string> = {
  overdue: 'Overdue',
  today: 'Today',
  thisWeek: 'This week',
  active: 'Active',
  clients: 'Clients',
  dormant: 'Dormant / Nurture',
  closed: 'Closed',
};

const SECTION_TONES: Record<SectionKey, string> = {
  overdue: 'text-rose-700',
  today: 'text-amber-700',
  thisWeek: 'text-blue-700',
  active: 'text-slate-700',
  clients: 'text-emerald-700',
  dormant: 'text-slate-500',
  closed: 'text-slate-400',
};

function inThisWeek(d: Date | null | undefined) {
  if (!d) return false;
  const due = new Date(d);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const horizon = new Date(start);
  horizon.setDate(horizon.getDate() + 7);
  return due >= start && due <= horizon;
}

function classify(lead: Lead): SectionKey {
  if (lead.stage === 'won' && lead.isClient) return 'clients';
  if (lead.stage === 'won' || lead.stage === 'lost') return 'closed';
  if (lead.stage === 'nurture') return 'dormant';
  if (isOverdue(lead.nextActionDueDate)) return 'overdue';
  if (isToday(lead.nextActionDueDate)) return 'today';
  if (inThisWeek(lead.nextActionDueDate)) return 'thisWeek';
  return 'active';
}

function attentionScore(l: Lead): number {
  const weighted = (l.oneTimeValue * l.probability) / 100;
  const temp = l.temperature === 'hot' ? 1.4 : l.temperature === 'warm' ? 1.1 : 1;
  let urgency = 1;
  if (l.nextActionDueDate) {
    const due = new Date(l.nextActionDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dd = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (dd < 0) urgency = 3 + Math.min(-dd, 5);
    else if (dd === 0) urgency = 1.8;
    else if (dd <= 3) urgency = 1.3;
  } else {
    urgency = 0.6;
  }
  return weighted * temp * urgency;
}

export function LeftRail({ leads, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('attention');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    overdue: false,
    today: false,
    thisWeek: false,
    active: false,
    clients: false,
    dormant: true,
    closed: true,
  });

  const allTags = useMemo(() => {
    const set = new Set<string>(SUGGESTED_TAGS);
    leads.forEach((l) => l.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (activeTags.length > 0) {
        const tags = l.tags ?? [];
        if (!activeTags.every((t) => tags.includes(t))) return false;
      }
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.offer.toLowerCase().includes(q) ||
        (l.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [leads, search, activeTags]);

  const sorted = useMemo(() => {
    const copy = filtered.slice();
    if (sort === 'attention') copy.sort((a, b) => attentionScore(b) - attentionScore(a));
    else if (sort === 'value')
      copy.sort(
        (a, b) =>
          (b.oneTimeValue * b.probability) / 100 - (a.oneTimeValue * a.probability) / 100,
      );
    else
      copy.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    return copy;
  }, [filtered, sort]);

  const sectioned = useMemo(() => {
    const buckets: Record<SectionKey, Lead[]> = {
      overdue: [],
      today: [],
      thisWeek: [],
      active: [],
      clients: [],
      dormant: [],
      closed: [],
    };
    sorted.forEach((l) => buckets[classify(l)].push(l));
    return buckets;
  }, [sorted]);

  const toggleTag = (t: string) =>
    setActiveTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const toggleSection = (k: SectionKey) =>
    setCollapsed((c) => ({ ...c, [k]: !c[k] }));

  return (
    <aside className="ios-card-elev !rounded-3xl w-[320px] flex-shrink-0 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b ios-divider">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people, tags…"
            className="w-full pl-8 pr-7 py-2 rounded-xl text-[13px] bg-black/[0.04] focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder:text-gray-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 mt-2 ios-segmented w-full">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`ios-segment flex-1 justify-center !px-2 !text-[11px] ${
                sort === s.id ? 'ios-segment-active' : ''
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {allTags.map((t) => {
            const on = activeTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold transition ${
                  on
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sectioned list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sorted.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12px] text-gray-400 italic">
            No matches.
          </div>
        ) : (
          SECTION_ORDER.map((key) => {
            const items = sectioned[key];
            if (items.length === 0) return null;
            const isCollapsed = collapsed[key];
            return (
              <div key={key} className="mb-1">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/[0.025]"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  )}
                  <span
                    className={`ios-section-title !text-[10px] ${SECTION_TONES[key]}`}
                  >
                    {SECTION_LABELS[key]}
                  </span>
                  <span className="text-[10px] text-gray-400 tabular-nums ml-auto">
                    {items.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="divide-y ios-divider">
                    {items.map((l) => (
                      <PersonRow
                        key={l.id}
                        lead={l}
                        selected={l.id === selectedId}
                        onSelect={() => onSelect(l.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-2 border-t ios-divider text-[10.5px] text-gray-500 flex items-center justify-between">
        <span>{leads.length} total</span>
        <span className="opacity-70">
          <kbd className="px-1 py-0.5 rounded bg-black/[0.06] text-[10px]">⌘K</kbd> to
          jump
        </span>
      </div>
    </aside>
  );
}

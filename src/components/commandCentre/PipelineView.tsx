import { useMemo, useState } from 'react';
import {
  Lead,
  LeadStage,
  LeadTemperature,
  STAGE_LABELS,
  STAGE_COLORS,
  STAGE_ORDER,
  ACTIVE_STAGES,
  DealType,
  DEAL_TYPE_LABELS,
} from '../../types/crm';
import {
  CRMMetrics,
  formatCurrency,
  formatCurrencyShort,
  getDaysInCurrentStage,
  leadDealType,
} from '../../hooks/useCRM';
import { AlertCircle, ArrowRight, Flame } from 'lucide-react';

interface Props {
  metrics: CRMMetrics;
  dealTypeFilter: DealType | 'all';
  onChangeDealTypeFilter: (f: DealType | 'all') => void;
  onSelectLead: (lead: Lead) => void;
  onUpdateStage: (id: string, stage: LeadStage) => void;
}

const TEMP_FILTERS: { id: 'all' | LeadTemperature; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hot', label: 'Hot' },
  { id: 'warm', label: 'Warm' },
  { id: 'cold', label: 'Cold' },
];

const DEAL_TYPE_FILTERS: { id: 'all' | DealType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai-commercial', label: DEAL_TYPE_LABELS['ai-commercial'] },
  { id: 'website', label: DEAL_TYPE_LABELS.website },
  { id: 'ai-automation', label: DEAL_TYPE_LABELS['ai-automation'] },
];

const VALUE_FILTERS: { id: number; label: string }[] = [
  { id: 0, label: 'Any' },
  { id: 1000, label: '€1k+' },
  { id: 3000, label: '€3k+' },
  { id: 5000, label: '€5k+' },
];

function nextStageOf(stage: LeadStage): LeadStage | null {
  const idx = STAGE_ORDER.indexOf(stage);
  if (idx === -1) return null;
  for (let i = idx + 1; i < STAGE_ORDER.length; i++) {
    const s = STAGE_ORDER[i];
    if (s === 'nurture' || s === 'lost') continue;
    return s;
  }
  return null;
}

export function PipelineView({
  metrics,
  dealTypeFilter,
  onChangeDealTypeFilter,
  onSelectLead,
  onUpdateStage,
}: Props) {
  const [tempFilter, setTempFilter] = useState<'all' | LeadTemperature>('all');
  const [minValue, setMinValue] = useState<number>(0);

  // Filter leads at the column level; respect deal type, temperature, value
  const matches = (l: Lead) => {
    if (dealTypeFilter !== 'all' && leadDealType(l) !== dealTypeFilter) return false;
    if (tempFilter !== 'all' && l.temperature !== tempFilter) return false;
    if (minValue > 0 && l.oneTimeValue < minValue) return false;
    return true;
  };

  const columns = useMemo(() => {
    return ACTIVE_STAGES.map((stage) => {
      const all = metrics.byStage[stage].leads.filter(matches);
      const value = all.reduce((s, l) => s + l.oneTimeValue, 0);
      const weighted = all.reduce((s, l) => s + (l.oneTimeValue * l.probability) / 100, 0);
      const dwellNums = all.map((l) => getDaysInCurrentStage(l));
      const avgDwell = dwellNums.length ? Math.round(dwellNums.reduce((a, b) => a + b, 0) / dwellNums.length) : 0;
      return { stage, leads: all, count: all.length, value, weighted, avgDwell };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics.byStage, dealTypeFilter, tempFilter, minValue]);

  const totalCount = columns.reduce((s, c) => s + c.count, 0);
  const totalWeighted = columns.reduce((s, c) => s + c.weighted, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="ios-subtitle">Drag a card, or use → Next Stage to advance.</div>
          <h1 className="ios-large-title mt-1">Pipeline</h1>
          <p className="ios-subtitle mt-1.5">
            <span className="tabular-nums font-semibold text-gray-700">{totalCount}</span> open ·{' '}
            <span className="tabular-nums font-semibold text-emerald-700">
              {formatCurrency(totalWeighted)}
            </span>{' '}
            weighted
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="ios-card p-3 flex items-center gap-3 flex-wrap">
        <span className="ios-section-title text-[10.5px] pl-1">Deal type</span>
        <nav className="ios-segmented" role="tablist">
          {DEAL_TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => onChangeDealTypeFilter(f.id)}
              className={`ios-segment ${dealTypeFilter === f.id ? 'ios-segment-active' : ''}`}
              role="tab"
              aria-selected={dealTypeFilter === f.id}
            >
              {f.label}
            </button>
          ))}
        </nav>

        <span className="ios-section-title text-[10.5px] pl-3">Temperature</span>
        <nav className="ios-segmented" role="tablist">
          {TEMP_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setTempFilter(f.id)}
              className={`ios-segment ${tempFilter === f.id ? 'ios-segment-active' : ''}`}
              role="tab"
              aria-selected={tempFilter === f.id}
            >
              {f.label}
            </button>
          ))}
        </nav>

        <span className="ios-section-title text-[10.5px] pl-3">Min value</span>
        <nav className="ios-segmented" role="tablist">
          {VALUE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setMinValue(f.id)}
              className={`ios-segment ${minValue === f.id ? 'ios-segment-active' : ''}`}
              role="tab"
              aria-selected={minValue === f.id}
            >
              {f.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Horizontal stage scroll */}
      <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
        <div className="flex gap-3 min-w-max pb-2">
          {columns.map((col) => {
            const medianDwell = metrics.medianDwellByStage[col.stage];
            // Empty stages collapse to a slim header card
            if (col.count === 0) {
              return (
                <EmptyColumn key={col.stage} stage={col.stage} onDrop={(id) => onUpdateStage(id, col.stage)} />
              );
            }
            return (
              <Column
                key={col.stage}
                stage={col.stage}
                leads={col.leads}
                count={col.count}
                weighted={col.weighted}
                avgDwell={col.avgDwell}
                medianDwell={medianDwell}
                onSelectLead={onSelectLead}
                onUpdateStage={onUpdateStage}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyColumn({ stage, onDrop }: { stage: LeadStage; onDrop: (id: string) => void }) {
  const c = STAGE_COLORS[stage];
  return (
    <div
      className="w-[180px] flex-shrink-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData('text/plain');
        if (id) onDrop(id);
      }}
    >
      <div className={`px-3 py-3 rounded-2xl ${c.bg} border border-white/60`}>
        <div className={`text-[11px] font-bold uppercase tracking-wider ${c.text}`}>
          {STAGE_LABELS[stage]}
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">Empty</div>
      </div>
    </div>
  );
}

function Column({
  stage,
  leads,
  count,
  weighted,
  avgDwell,
  medianDwell,
  onSelectLead,
  onUpdateStage,
}: {
  stage: LeadStage;
  leads: Lead[];
  count: number;
  weighted: number;
  avgDwell: number;
  medianDwell: number;
  onSelectLead: (l: Lead) => void;
  onUpdateStage: (id: string, stage: LeadStage) => void;
}) {
  const c = STAGE_COLORS[stage];
  return (
    <div
      className="w-[280px] flex-shrink-0 ios-card overflow-hidden flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const id = e.dataTransfer.getData('text/plain');
        if (id) onUpdateStage(id, stage);
      }}
    >
      <header className={`px-4 py-3 ${c.bg}`}>
        <div className="flex items-center justify-between">
          <div className={`text-[11px] font-bold uppercase tracking-wider ${c.text}`}>
            {STAGE_LABELS[stage]}
          </div>
          <div className="text-[12px] font-semibold text-gray-900 tabular-nums">{count}</div>
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px] text-gray-600 tabular-nums">
          <span className="font-semibold text-emerald-700">{formatCurrencyShort(weighted)}</span>
          <span>
            avg{' '}
            <span className={avgDwell > medianDwell * 1.5 && medianDwell > 0 ? 'text-rose-700 font-semibold' : 'font-semibold text-gray-700'}>
              {avgDwell}d
            </span>
          </span>
        </div>
      </header>

      <div className="p-2.5 space-y-2 flex-1 overflow-y-auto max-h-[68vh]">
        {leads.map((l) => (
          <CardRow
            key={l.id}
            lead={l}
            medianDwell={medianDwell}
            onSelectLead={onSelectLead}
            onUpdateStage={onUpdateStage}
          />
        ))}
      </div>
    </div>
  );
}

function CardRow({
  lead,
  medianDwell,
  onSelectLead,
  onUpdateStage,
}: {
  lead: Lead;
  medianDwell: number;
  onSelectLead: (l: Lead) => void;
  onUpdateStage: (id: string, stage: LeadStage) => void;
}) {
  const days = getDaysInCurrentStage(lead);
  const stuck = medianDwell > 0 && days > medianDwell * 2;
  const noAction = !lead.nextAction || !lead.nextActionDueDate;
  const next = nextStageOf(lead.stage);

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
      onClick={() => onSelectLead(lead)}
      className={`bg-white/85 rounded-xl p-3 border cursor-pointer transition hover:shadow-md ${
        stuck ? 'border-rose-300 ring-1 ring-rose-200' : 'border-gray-200/70 hover:border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-semibold text-gray-900 truncate tracking-tight">
            {lead.company}
          </div>
          <div className="text-[11px] text-gray-500 truncate">{lead.name}</div>
        </div>
        {lead.temperature === 'hot' && (
          <Flame className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
        )}
      </div>
      <p className="text-[11px] text-gray-600 mt-1.5 line-clamp-2">{lead.offer}</p>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100/70 gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-emerald-700 tabular-nums leading-none">
            {formatCurrencyShort((lead.oneTimeValue * lead.probability) / 100)}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
            {lead.probability}% · {formatCurrencyShort(lead.oneTimeValue)}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-[10.5px] font-semibold tabular-nums ${
              stuck ? 'text-rose-700' : 'text-gray-500'
            }`}
            title={medianDwell > 0 ? `Median for this stage: ${medianDwell}d` : ''}
          >
            {days}d in stage
          </div>
          {noAction ? (
            <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-rose-600 mt-0.5">
              <AlertCircle className="w-2.5 h-2.5" /> No step
            </span>
          ) : (
            <span className="text-[9.5px] text-gray-400 mt-0.5">
              {lead.nextActionDueDate
                ? new Date(lead.nextActionDueDate).toLocaleDateString('en-IE', {
                    day: '2-digit',
                    month: 'short',
                  })
                : ''}
            </span>
          )}
        </div>
      </div>

      {next && (
        <div className="mt-2 pt-2 border-t border-gray-100/70">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStage(lead.id, next);
            }}
            className="w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-gray-900/[0.04] hover:bg-gray-900/[0.08] text-[11px] font-semibold text-gray-700 ios-press"
            title={`Advance to ${STAGE_LABELS[next]}`}
          >
            <span className="truncate">→ {STAGE_LABELS[next]}</span>
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}


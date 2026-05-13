import { Lead, LeadStage, STAGE_LABELS, STAGE_COLORS } from '../../types/crm';
import { CRMMetrics, formatCurrency, formatCurrencyShort, isOverdue } from '../../hooks/useCRM';
import { AlertCircle, Flame } from 'lucide-react';

interface Props {
  metrics: CRMMetrics;
  onSelectLead: (lead: Lead) => void;
  onUpdateStage: (id: string, stage: LeadStage) => void;
}

const ACTIVE_STAGES: LeadStage[] = [
  'new',
  'contacted',
  'interested',
  'meeting-booked',
  'proposal-sent',
  'verbal-yes',
];

export function PipelineView({ metrics, onSelectLead, onUpdateStage }: Props) {
  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Drag-ready stage board. Click any card to open the full detail panel.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {ACTIVE_STAGES.map((stage) => {
          const data = metrics.byStage[stage];
          const c = STAGE_COLORS[stage];
          return (
            <div
              key={stage}
              className="bg-white rounded-2xl border border-gray-200/70 shadow-sm flex flex-col min-h-[300px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData('text/plain');
                if (id) onUpdateStage(id, stage);
              }}
            >
              <header className={`px-4 py-3 rounded-t-2xl ${c.bg} flex items-center justify-between`}>
                <div>
                  <div className={`text-xs font-bold ${c.text} uppercase tracking-wider`}>
                    {STAGE_LABELS[stage]}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">{data.count}</div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-bold ${c.text}`}>VALUE</div>
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrencyShort(data.value)}
                  </div>
                </div>
              </header>

              <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[60vh]">
                {data.leads.length === 0 && (
                  <p className="text-[11px] text-gray-300 italic text-center py-6">Empty</p>
                )}
                {data.leads.map((l) => {
                  const overdue = isOverdue(l.nextActionDueDate);
                  const noAction = !l.nextAction || !l.nextActionDueDate;
                  return (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', l.id)}
                      onClick={() => onSelectLead(l)}
                      className={`bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition ${
                        overdue ? 'ring-1 ring-rose-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">{l.company}</div>
                          <div className="text-[11px] text-gray-500 truncate">{l.name}</div>
                        </div>
                        {l.temperature === 'hot' && (
                          <Flame className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1.5 line-clamp-2">{l.offer}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <div>
                          <div className="text-xs font-bold text-emerald-700">
                            {formatCurrencyShort((l.oneTimeValue * l.probability) / 100)}
                          </div>
                          <div className="text-[9px] text-gray-400">
                            {l.probability}% · {formatCurrencyShort(l.oneTimeValue)}
                          </div>
                        </div>
                        {noAction ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-600">
                            <AlertCircle className="w-2.5 h-2.5" /> No step
                          </span>
                        ) : overdue ? (
                          <span className="text-[9px] font-bold text-rose-600">OVERDUE</span>
                        ) : (
                          <span className="text-[9px] font-medium text-gray-400">
                            {l.nextActionDueDate
                              ? new Date(l.nextActionDueDate).toLocaleDateString('en-IE', {
                                  day: '2-digit',
                                  month: 'short',
                                })
                              : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <footer className="px-4 py-2 border-t border-gray-100 bg-gray-50/40 rounded-b-2xl">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Weighted</div>
                <div className="text-sm font-bold text-emerald-700">
                  {formatCurrency(data.weighted)}
                </div>
              </footer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

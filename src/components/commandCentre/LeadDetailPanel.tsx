import { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  CalendarCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Flame,
  Snowflake,
  Sun,
  Building2,
  Trash2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  Lead,
  LeadStage,
  LeadTemperature,
  NextActionType,
  STAGE_ORDER,
  STAGE_LABELS,
  STAGE_COLORS,
  TEMPERATURE_LABELS,
  TEMPERATURE_COLORS,
  NEXT_ACTION_LABELS,
  STAGE_DEFAULT_PROBABILITY,
  ActivityType,
} from '../../types/crm';
import { formatCurrency, formatDate } from '../../hooks/useCRM';

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onLogActivity: (leadId: string, type: ActivityType, description: string) => void;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
  onMarkActionDone: (leadId: string) => void;
}

const QUICK_ACTIONS: { type: ActivityType; label: string; icon: typeof Phone; color: string }[] = [
  { type: 'call', label: 'Logged call', icon: Phone, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { type: 'whatsapp', label: 'WhatsApp sent', icon: MessageCircle, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { type: 'email', label: 'Email sent', icon: Mail, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { type: 'meeting', label: 'Meeting booked', icon: CalendarCheck, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
  { type: 'proposal-sent', label: 'Proposal sent', icon: FileText, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
];

const TEMP_OPTIONS: { value: LeadTemperature; icon: typeof Flame }[] = [
  { value: 'cold', icon: Snowflake },
  { value: 'warm', icon: Sun },
  { value: 'hot', icon: Flame },
];

export function LeadDetailPanel({
  lead,
  onClose,
  onSave,
  onDelete,
  onLogActivity,
  onUpdateStage,
  onMarkActionDone,
}: Props) {
  const [draft, setDraft] = useState<Lead | null>(lead);
  const [activityDraft, setActivityDraft] = useState('');

  useEffect(() => {
    setDraft(lead);
    setActivityDraft('');
    // Reset draft only when a different lead is selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  if (!lead || !draft) return null;

  const update = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    setDraft({ ...draft, [key]: value });
  };

  const commit = (next: Lead = draft) => onSave(next);

  const onStageChange = (stage: LeadStage) => {
    const probability =
      stage === 'won' ? 100 : stage === 'lost' ? 0 : STAGE_DEFAULT_PROBABILITY[stage];
    setDraft({ ...draft, stage, probability });
    onUpdateStage(draft.id, stage);
  };

  const stageColor = STAGE_COLORS[draft.stage];
  const weighted = (draft.oneTimeValue * draft.probability) / 100;
  const ltv12 = draft.monthlyValue * 12;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={() => commit()}
      />
      <aside className="fixed top-0 right-0 h-screen w-full max-w-[560px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-fade-in">
        <header className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold flex items-center justify-center shadow">
              {draft.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <input
                value={draft.name}
                onChange={(e) => update('name', e.target.value)}
                onBlur={() => commit()}
                className="text-lg font-bold text-gray-900 w-full bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 -mx-1"
              />
              <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-600">
                <Building2 className="w-3.5 h-3.5" />
                <input
                  value={draft.company}
                  onChange={(e) => update('company', e.target.value)}
                  onBlur={() => commit()}
                  className="flex-1 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 -mx-1"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => commit()}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Deal Value" value={formatCurrency(draft.oneTimeValue)} />
            <Stat label="Weighted" value={formatCurrency(weighted)} accent="text-emerald-600" />
            <Stat
              label="MRR"
              value={draft.monthlyValue ? formatCurrency(draft.monthlyValue) + '/mo' : '—'}
            />
          </div>

          <section>
            <SectionLabel>Quick Actions</SectionLabel>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.type}
                  onClick={() => onLogActivity(draft.id, qa.type, qa.label)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition ${qa.color}`}
                  title={qa.label}
                >
                  <qa.icon className="w-4 h-4" />
                  <span className="text-[10px]">{qa.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => onStageChange('won')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition shadow"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Won
              </button>
              <button
                onClick={() => onStageChange('lost')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition border border-rose-200"
              >
                <XCircle className="w-4 h-4" /> Mark Lost
              </button>
            </div>
          </section>

          <section>
            <SectionLabel>Stage</SectionLabel>
            <div className="grid grid-cols-4 gap-1.5">
              {STAGE_ORDER.filter((s) => s !== 'won' && s !== 'lost').map((s) => {
                const c = STAGE_COLORS[s];
                const active = draft.stage === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStageChange(s)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                      active
                        ? `${c.bg} ${c.text} ring-2 ${c.ring}`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {STAGE_LABELS[s]}
                  </button>
                );
              })}
            </div>
            <div className={`mt-3 flex items-center gap-3 p-3 rounded-xl ${stageColor.bg}`}>
              <TrendingUp className={`w-4 h-4 ${stageColor.text}`} />
              <span className={`text-sm font-semibold ${stageColor.text} flex-1`}>
                {draft.probability}% probability
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={draft.probability}
                onChange={(e) => update('probability', Number(e.target.value))}
                onMouseUp={() => commit()}
                onTouchEnd={() => commit()}
                className="w-32"
              />
            </div>
          </section>

          <section>
            <SectionLabel>Temperature</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {TEMP_OPTIONS.map((t) => {
                const c = TEMPERATURE_COLORS[t.value];
                const active = draft.temperature === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      const next = { ...draft, temperature: t.value };
                      setDraft(next);
                      commit(next);
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition ${
                      active ? `${c.bg} ${c.text} ring-2 ring-offset-1 ring-gray-300` : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {TEMPERATURE_LABELS[t.value]}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Next Action</SectionLabel>
              {draft.nextAction && (
                <button
                  onClick={() => onMarkActionDone(draft.id)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </button>
              )}
            </div>
            <div className="space-y-2">
              <select
                value={draft.nextAction ?? ''}
                onChange={(e) => {
                  const next = { ...draft, nextAction: (e.target.value || null) as NextActionType | null };
                  setDraft(next);
                  commit(next);
                }}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm font-medium text-gray-800"
              >
                <option value="">— No action set —</option>
                {(Object.keys(NEXT_ACTION_LABELS) as NextActionType[]).map((a) => (
                  <option key={a} value={a}>
                    {NEXT_ACTION_LABELS[a]}
                  </option>
                ))}
              </select>
              <input
                value={draft.nextActionNote ?? ''}
                onChange={(e) => update('nextActionNote', e.target.value)}
                onBlur={() => commit()}
                placeholder="What exactly needs to happen?"
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm"
              />
              <input
                type="date"
                value={
                  draft.nextActionDueDate
                    ? new Date(draft.nextActionDueDate).toISOString().slice(0, 10)
                    : ''
                }
                onChange={(e) => {
                  const next = {
                    ...draft,
                    nextActionDueDate: e.target.value ? new Date(e.target.value) : null,
                  };
                  setDraft(next);
                  commit(next);
                }}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm font-medium"
              />
              {(!draft.nextAction || !draft.nextActionDueDate) && (
                <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                  ⚠ Every open lead needs a next action and a due date.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionLabel>Deal Value</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="One-time (€)"
                type="number"
                value={draft.oneTimeValue}
                onChange={(v) => update('oneTimeValue', Number(v))}
                onCommit={() => commit()}
              />
              <Field
                label="Monthly (€)"
                type="number"
                value={draft.monthlyValue}
                onChange={(v) => update('monthlyValue', Number(v))}
                onCommit={() => commit()}
              />
              <Field
                label="Commission (%)"
                type="number"
                value={draft.commissionPotential ?? 0}
                onChange={(v) => update('commissionPotential', Number(v))}
                onCommit={() => commit()}
              />
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">LTV (12mo)</div>
                <div className="text-sm font-bold text-emerald-800 mt-0.5">
                  {formatCurrency(draft.oneTimeValue + ltv12)}
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionLabel>Offer & Contact</SectionLabel>
            <div className="space-y-2">
              <Field
                label="Offer"
                value={draft.offer}
                onChange={(v) => update('offer', String(v))}
                onCommit={() => commit()}
              />
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label="Email"
                  value={draft.email ?? ''}
                  onChange={(v) => update('email', String(v))}
                  onCommit={() => commit()}
                />
                <Field
                  label="Phone"
                  value={draft.phone ?? ''}
                  onChange={(v) => update('phone', String(v))}
                  onCommit={() => commit()}
                />
              </div>
              <Field
                label="Source"
                value={draft.source ?? ''}
                onChange={(v) => update('source', String(v))}
                onCommit={() => commit()}
              />
            </div>
          </section>

          {draft.isClient && (
            <section className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
              <SectionLabel>Client Delivery</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
                  <select
                    value={draft.deliveryStatus ?? 'not-started'}
                    onChange={(e) => {
                      const next = { ...draft, deliveryStatus: e.target.value as Lead['deliveryStatus'] };
                      setDraft(next);
                      commit(next);
                    }}
                    className="w-full mt-0.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="live">Live</option>
                    <option value="waiting-on-client">Waiting on Client</option>
                  </select>
                </div>
                <Field
                  label="Renewal"
                  type="date"
                  value={
                    draft.nextRenewalDate
                      ? new Date(draft.nextRenewalDate).toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(v) =>
                    update('nextRenewalDate', v ? new Date(String(v)) : undefined)
                  }
                  onCommit={() => commit()}
                />
              </div>
              <Field
                label="Upsell opportunity"
                value={draft.upsellOpportunity ?? ''}
                onChange={(v) => update('upsellOpportunity', String(v))}
                onCommit={() => commit()}
              />
            </section>
          )}

          <section>
            <SectionLabel>Notes</SectionLabel>
            <textarea
              value={draft.notes ?? ''}
              onChange={(e) => update('notes', e.target.value)}
              onBlur={() => commit()}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:border-blue-400"
              placeholder="What you know about them, pain points, hooks…"
            />
          </section>

          <section>
            <SectionLabel>Activity Timeline</SectionLabel>
            <div className="flex gap-2 mb-3">
              <input
                value={activityDraft}
                onChange={(e) => setActivityDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activityDraft.trim()) {
                    onLogActivity(draft.id, 'note', activityDraft.trim());
                    setActivityDraft('');
                  }
                }}
                placeholder="Log a note…"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
              <button
                disabled={!activityDraft.trim()}
                onClick={() => {
                  onLogActivity(draft.id, 'note', activityDraft.trim());
                  setActivityDraft('');
                }}
                className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-30"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {draft.activities.length === 0 && (
                <p className="text-xs text-gray-400 italic">No activity yet.</p>
              )}
              {draft.activities.map((a) => (
                <div key={a.id} className="flex gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium">{a.description}</div>
                    <div className="text-gray-400 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {formatDate(a.createdAt)}
                      <span>·</span>
                      <span className="capitalize">{a.type.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="border-t border-gray-100 p-4 flex justify-between bg-gray-50/60">
          <button
            onClick={() => {
              if (confirm(`Delete ${draft.name}? This can't be undone.`)) {
                onDelete(draft.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button
            onClick={() => commit()}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow"
          >
            Save & Close
          </button>
        </footer>
      </aside>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-base font-bold mt-1 ${accent ?? 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onCommit,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  onCommit: () => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        className="w-full mt-0.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
      />
    </div>
  );
}

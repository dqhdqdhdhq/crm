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
  Sparkles,
  MapPin,
  Film,
  Target,
  Compass,
  History,
  Wallet,
  Tag as TagIcon,
  Paperclip,
  Upload,
  Download,
  Plus,
} from 'lucide-react';
import { ConnectivityActions } from '../workspace/ConnectivityActions';
import { readFilesAsDataUrls, downloadDataUrl } from '../../lib/connect';
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
  ActivityOutcome,
  ACTIVITY_OUTCOME_LABELS,
  ProofAsset,
  CommercialDetails,
  AWARENESS_SOURCE_LABELS,
  FIRST_CONVERSATION_LABELS,
  FirstConversationSource,
  BuyerType,
  BUYER_TYPE_LABELS,
  LeadQuality,
  LEAD_QUALITY_LABELS,
  MarketTier,
  MARKET_TIER_LABELS,
  BrandStrength,
  BRAND_STRENGTH_LABELS,
  DesiredCommercialType,
  DESIRED_COMMERCIAL_LABELS,
  AssetPackInterest,
  ASSET_PACK_LABELS,
  BudgetSignal,
  BUDGET_SIGNAL_LABELS,
  UrgencyLevel,
  URGENCY_LABELS,
  PriceTier,
  PRICE_TIER_LABELS,
  PackageType,
  PACKAGE_LABELS,
  AddOn,
  ADD_ON_LABELS,
  LostReason,
  LOST_REASON_LABELS,
  LostObjection,
  LOST_OBJECTION_LABELS,
  DEAL_TYPE_LABELS,
  COMMERCIAL_STAGE_LABELS,
  SUGGESTED_TAGS,
} from '../../types/crm';
import { formatCurrency, formatDate } from '../../hooks/useCRM';

interface Props {
  lead: Lead | null;
  proofAssets: ProofAsset[];
  onClose: () => void;
  onSave: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onLogActivity: (
    leadId: string,
    type: ActivityType,
    description: string,
    outcome?: ActivityOutcome,
  ) => void;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
  onMarkActionDone: (leadId: string) => void;
  onUpdateCommercial: (leadId: string, patch: Partial<CommercialDetails>) => void;
  // Workspace extensions — optional so the existing drawer call sites keep working.
  variant?: 'drawer' | 'inline';
  onAddTag?: (leadId: string, tag: string) => void;
  onRemoveTag?: (leadId: string, tag: string) => void;
  onAddFiles?: (
    leadId: string,
    files: { name: string; mime: string; size: number; dataUrl: string }[],
  ) => void;
  onRemoveFile?: (leadId: string, fileId: string) => void;
  noteInputRef?: React.RefObject<HTMLInputElement>;
}

const QUICK_ACTIONS: { type: ActivityType; label: string; icon: typeof Phone; color: string }[] = [
  { type: 'call', label: 'Call', icon: Phone, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  },
  {
    type: 'meeting',
    label: 'Meeting',
    icon: CalendarCheck,
    color: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
  },
  {
    type: 'proposal-sent',
    label: 'Proposal',
    icon: FileText,
    color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  },
];

const TEMP_OPTIONS: { value: LeadTemperature; icon: typeof Flame }[] = [
  { value: 'cold', icon: Snowflake },
  { value: 'warm', icon: Sun },
  { value: 'hot', icon: Flame },
];

const OUTCOME_TONES: Record<ActivityOutcome, string> = {
  'no-reply': 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  replied: 'bg-sky-100 text-sky-800 hover:bg-sky-200',
  positive: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  objection: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'meeting-booked': 'bg-violet-100 text-violet-800 hover:bg-violet-200',
  'proposal-requested': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  'follow-up-needed': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'closed-next-step': 'bg-teal-100 text-teal-800 hover:bg-teal-200',
};

export function LeadDetailPanel({
  lead,
  proofAssets,
  onClose,
  onSave,
  onDelete,
  onLogActivity,
  onUpdateStage,
  onMarkActionDone,
  onUpdateCommercial,
  variant = 'drawer',
  onAddTag,
  onRemoveTag,
  onAddFiles,
  onRemoveFile,
  noteInputRef,
}: Props) {
  const isInline = variant === 'inline';
  const [draft, setDraft] = useState<Lead | null>(lead);
  const [activityDraft, setActivityDraft] = useState('');

  // Inline quick-log popover state
  const [logFor, setLogFor] = useState<ActivityType | null>(null);
  const [logNote, setLogNote] = useState('');
  const [logNextAction, setLogNextAction] = useState<NextActionType | ''>('');
  const [logNextDate, setLogNextDate] = useState<string>('');

  // Lost / Won inline confirm
  const [confirmLost, setConfirmLost] = useState(false);
  const [lostReason, setLostReason] = useState<LostReason>('too-expensive');
  const [lostObjection, setLostObjection] = useState<LostObjection | ''>('');
  const [lostNotes, setLostNotes] = useState('');
  const [lostReact, setLostReact] = useState(false);
  const [lostMonth, setLostMonth] = useState('');

  const [confirmWon, setConfirmWon] = useState(false);
  const [wonFinalPrice, setWonFinalPrice] = useState<number>(0);
  const [wonDepositPaid, setWonDepositPaid] = useState(true);
  const [wonDepositDate, setWonDepositDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  const [tagDraft, setTagDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setDraft(lead);
    setActivityDraft('');
    setLogFor(null);
    setConfirmLost(false);
    setConfirmWon(false);
    if (lead?.commercial?.initialQuotedPrice) {
      setWonFinalPrice(lead.commercial.initialQuotedPrice);
    } else {
      setWonFinalPrice(lead?.oneTimeValue ?? 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  useEffect(() => {
    if (!lead) return;
    setDraft((d) => (d ? { ...d, activities: lead.activities, stageHistory: lead.stageHistory } : d));
  }, [lead?.activities, lead?.stageHistory]);

  // Close on Escape — only in drawer mode. Inline mode lets the workspace
  // own the keyboard layer (the rail/centre keep working when a lead is open).
  useEffect(() => {
    if (!lead || isInline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (draft) onSave(draft);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lead, draft, onSave, onClose, isInline]);

  if (!lead || !draft) return null;

  const isCommercial = draft.dealType === 'ai-commercial';
  const c = draft.commercial;

  const update = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    setDraft({ ...draft, [key]: value });
  };

  const commit = (next: Lead = draft) => onSave(next);

  const closeAndCommit = () => {
    onSave(draft);
    onClose();
  };

  const patchCommercial = (patch: Partial<CommercialDetails>) => {
    onUpdateCommercial(draft.id, patch);
    setDraft({
      ...draft,
      commercial: {
        ...(draft.commercial ?? {
          firstAwarenessSource: 'other',
          firstAwarenessDate: new Date(),
        }),
        ...patch,
      },
    });
  };

  const onStageChange = (stage: LeadStage) => {
    if (stage === 'won' && isCommercial) {
      setConfirmWon(true);
      return;
    }
    if (stage === 'lost' && isCommercial) {
      setConfirmLost(true);
      return;
    }
    const probability =
      stage === 'won' ? 100 : stage === 'lost' ? 0 : STAGE_DEFAULT_PROBABILITY[stage];
    setDraft({ ...draft, stage, probability });
    onUpdateStage(draft.id, stage);
  };

  const openQuickLog = (type: ActivityType) => {
    setLogFor(type);
    setLogNote('');
    setLogNextAction('');
    setLogNextDate('');
  };

  const commitQuickLog = (outcome: ActivityOutcome) => {
    if (!logFor) return;
    const label =
      QUICK_ACTIONS.find((q) => q.type === logFor)?.label ?? logFor;
    const desc = logNote.trim()
      ? `${label} — ${logNote.trim()}`
      : `${label} (${ACTIVITY_OUTCOME_LABELS[outcome]})`;
    onLogActivity(draft.id, logFor, desc, outcome);
    if (logNextAction && logNextDate) {
      const next: Lead = {
        ...draft,
        nextAction: logNextAction as NextActionType,
        nextActionDueDate: new Date(logNextDate),
        nextActionNote: logNote.trim() || draft.nextActionNote,
      };
      setDraft(next);
      commit(next);
    }
    setLogFor(null);
  };

  const commitLost = () => {
    patchCommercial({
      lostReason,
      lostObjection: lostObjection || undefined,
      lostNotes: lostNotes.trim() || undefined,
      lostReactivatable: lostReact,
      lostFollowupMonth: lostReact ? lostMonth || undefined : undefined,
    });
    setDraft({ ...draft, stage: 'lost', probability: 0 });
    onUpdateStage(draft.id, 'lost');
    setConfirmLost(false);
  };

  const commitWon = () => {
    patchCommercial({
      finalAcceptedPrice: Number(wonFinalPrice) || draft.oneTimeValue,
      depositPaid: wonDepositPaid,
      depositDate: wonDepositPaid ? new Date(wonDepositDate) : undefined,
      closeDate: new Date(),
    });
    const next: Lead = {
      ...draft,
      stage: 'won',
      probability: 100,
      oneTimeValue: Number(wonFinalPrice) || draft.oneTimeValue,
    };
    setDraft(next);
    commit(next);
    onUpdateStage(draft.id, 'won');
    setConfirmWon(false);
  };

  const stageColor = STAGE_COLORS[draft.stage];
  const weighted = (draft.oneTimeValue * draft.probability) / 100;
  const ltv12 = draft.monthlyValue * 12;

  const assetById = (id?: string) => proofAssets.find((a) => a.id === id);
  const firstAwarenessDate = c?.firstAwarenessDate ? new Date(c.firstAwarenessDate) : null;
  const firstConvDate = (() => {
    if (!isCommercial) return null;
    const conv = [...draft.activities]
      .filter((a) => ['call', 'whatsapp', 'email', 'meeting'].includes(a.type))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    return conv ? new Date(conv.createdAt) : null;
  })();
  const closeDate = c?.closeDate ? new Date(c.closeDate) : null;
  const daysFirstToClose =
    firstAwarenessDate && closeDate
      ? Math.max(0, Math.round((closeDate.getTime() - firstAwarenessDate.getTime()) / 86400000))
      : null;
  const daysConvToClose =
    firstConvDate && closeDate
      ? Math.max(0, Math.round((closeDate.getTime() - firstConvDate.getTime()) / 86400000))
      : null;
  const touchesBeforeClose = isCommercial && closeDate
    ? draft.activities.filter((a) => new Date(a.createdAt) <= closeDate).length
    : null;

  const handleDropFiles = async (files: FileList | null) => {
    if (!files || !onAddFiles) return;
    const arr = Array.from(files);
    const read = await readFilesAsDataUrls(arr);
    onAddFiles(draft.id, read);
  };

  const body = (
    <>
        <header className={`flex items-start justify-between border-b border-gray-100 ${isInline ? 'p-4' : 'p-6'}`}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center shadow ${
                isCommercial
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
                  : 'bg-gradient-to-br from-slate-700 to-slate-900'
              }`}
            >
              {draft.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={draft.name}
                  onChange={(e) => update('name', e.target.value)}
                  onBlur={() => commit()}
                  className="text-lg font-bold text-gray-900 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 -mx-1"
                />
                {draft.dealType && (
                  <span
                    className={`ios-pill ${
                      isCommercial
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700'
                    } flex items-center gap-1`}
                  >
                    {isCommercial && <Sparkles className="w-3 h-3" />}
                    {DEAL_TYPE_LABELS[draft.dealType]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-sm text-gray-600">
                <Building2 className="w-3.5 h-3.5" />
                <input
                  value={draft.company}
                  onChange={(e) => update('company', e.target.value)}
                  onBlur={() => commit()}
                  className="flex-1 bg-transparent focus:outline-none focus:bg-gray-50 rounded px-1 -mx-1"
                />
              </div>
              {isCommercial && (draft.country || draft.industry) && (
                <div className="flex items-center gap-2 mt-1 text-[11.5px] text-gray-500">
                  {draft.country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {draft.country}
                    </span>
                  )}
                  {draft.country && draft.industry && <span>·</span>}
                  {draft.industry && <span>{draft.industry}</span>}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={closeAndCommit}
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
              label={isCommercial ? 'Stage' : 'MRR'}
              value={
                isCommercial
                  ? COMMERCIAL_STAGE_LABELS[draft.stage]
                  : draft.monthlyValue
                    ? formatCurrency(draft.monthlyValue) + '/mo'
                    : '—'
              }
            />
          </div>

          {/* ── One-click connectivity ── */}
          <section className="ios-card !rounded-2xl p-3 flex items-center justify-between gap-3 bg-white/60">
            <div>
              <SectionLabel>Connect</SectionLabel>
              <div className="text-[11px] text-gray-500">
                Phone, WhatsApp, email, calendar — opens externally.
              </div>
            </div>
            <ConnectivityActions lead={draft} size="md" bubble />
          </section>

          {/* ── Quick Actions ── */}
          <section>
            <SectionLabel>Log Activity</SectionLabel>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.type}
                  onClick={() => openQuickLog(qa.type)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition active:scale-95 ${qa.color} ${
                    logFor === qa.type ? 'ring-2 ring-blue-300' : ''
                  }`}
                  title={qa.label}
                >
                  <qa.icon className="w-4 h-4" />
                  <span className="text-[10px]">{qa.label}</span>
                </button>
              ))}
            </div>

            {logFor && (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                    Log {QUICK_ACTIONS.find((q) => q.type === logFor)?.label.toLowerCase()} — outcome?
                  </div>
                  <button
                    onClick={() => setLogFor(null)}
                    className="p-1 rounded hover:bg-blue-100"
                  >
                    <X className="w-3.5 h-3.5 text-blue-700" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(ACTIVITY_OUTCOME_LABELS) as ActivityOutcome[]).map((o) => (
                    <button
                      key={o}
                      onClick={() => commitQuickLog(o)}
                      className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold transition ${OUTCOME_TONES[o]}`}
                    >
                      {ACTIVITY_OUTCOME_LABELS[o]}
                    </button>
                  ))}
                </div>
                <input
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="Optional note (e.g. 'asked about asset pack pricing')"
                  className="w-full px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-[12.5px]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={logNextAction}
                    onChange={(e) =>
                      setLogNextAction(e.target.value as NextActionType | '')
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-blue-200 bg-white text-[12px]"
                  >
                    <option value="">Set next action…</option>
                    {(Object.keys(NEXT_ACTION_LABELS) as NextActionType[]).map((a) => (
                      <option key={a} value={a}>
                        {NEXT_ACTION_LABELS[a]}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={logNextDate}
                    onChange={(e) => setLogNextDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-blue-200 bg-white text-[12px]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => onStageChange('won')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCommercial ? 'Mark Won — Deposit Paid' : 'Mark Won'}
              </button>
              <button
                onClick={() => onStageChange('lost')}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition border border-rose-200"
              >
                <XCircle className="w-4 h-4" /> Mark Lost
              </button>
            </div>

            {/* Won confirm inline */}
            {confirmWon && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Confirm production booked
                  </div>
                  <button
                    onClick={() => setConfirmWon(false)}
                    className="p-1 rounded hover:bg-emerald-100"
                  >
                    <X className="w-3.5 h-3.5 text-emerald-700" />
                  </button>
                </div>
                <p className="text-[12px] text-emerald-900/80">
                  This deal isn't truly won until the deposit lands. Confirm final price and deposit status.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Mini label="Final accepted price (€)">
                    <input
                      type="number"
                      value={wonFinalPrice || ''}
                      onChange={(e) => setWonFinalPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-sm"
                    />
                  </Mini>
                  <Mini label="Deposit paid?">
                    <div className="grid grid-cols-2 gap-1">
                      {[true, false].map((b) => (
                        <button
                          key={String(b)}
                          onClick={() => setWonDepositPaid(b)}
                          className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition ${
                            wonDepositPaid === b
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-gray-600 border border-emerald-200'
                          }`}
                        >
                          {b ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </Mini>
                </div>
                {wonDepositPaid && (
                  <Mini label="Deposit date">
                    <input
                      type="date"
                      value={wonDepositDate}
                      onChange={(e) => setWonDepositDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-sm"
                    />
                  </Mini>
                )}
                <button
                  onClick={commitWon}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
                >
                  Confirm — Mark as Won
                </button>
              </div>
            )}

            {/* Lost inline */}
            {confirmLost && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
                    Why was this lost? *
                  </div>
                  <button
                    onClick={() => setConfirmLost(false)}
                    className="p-1 rounded hover:bg-rose-100"
                  >
                    <X className="w-3.5 h-3.5 text-rose-700" />
                  </button>
                </div>
                <Mini label="Lost reason">
                  <select
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value as LostReason)}
                    className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white text-sm"
                  >
                    {(Object.keys(LOST_REASON_LABELS) as LostReason[]).map((r) => (
                      <option key={r} value={r}>
                        {LOST_REASON_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Main objection (optional)">
                  <select
                    value={lostObjection}
                    onChange={(e) => setLostObjection(e.target.value as LostObjection | '')}
                    className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(LOST_OBJECTION_LABELS) as LostObjection[]).map((o) => (
                      <option key={o} value={o}>
                        {LOST_OBJECTION_LABELS[o]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="What you think went wrong">
                  <textarea
                    rows={2}
                    value={lostNotes}
                    onChange={(e) => setLostNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white text-sm resize-none"
                  />
                </Mini>
                <div className="grid grid-cols-2 gap-2">
                  <Mini label="Reactivate later?">
                    <div className="grid grid-cols-2 gap-1">
                      {[true, false].map((b) => (
                        <button
                          key={String(b)}
                          onClick={() => setLostReact(b)}
                          className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition ${
                            lostReact === b
                              ? 'bg-rose-600 text-white'
                              : 'bg-white text-gray-600 border border-rose-200'
                          }`}
                        >
                          {b ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </Mini>
                  {lostReact && (
                    <Mini label="Follow-up month">
                      <input
                        type="month"
                        value={lostMonth}
                        onChange={(e) => setLostMonth(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-rose-200 bg-white text-sm"
                      />
                    </Mini>
                  )}
                </div>
                <button
                  onClick={commitLost}
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700"
                >
                  Mark Lost
                </button>
              </div>
            )}
          </section>

          {/* ── Stage ── */}
          <section>
            <SectionLabel>Stage</SectionLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {STAGE_ORDER.filter((s) => s !== 'won' && s !== 'lost').map((s) => {
                const sc = STAGE_COLORS[s];
                const active = draft.stage === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStageChange(s)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition ${sc.bg} ${sc.text} ${
                      active ? `ring-2 ${sc.ring}` : 'opacity-55 hover:opacity-100'
                    }`}
                  >
                    {isCommercial ? COMMERCIAL_STAGE_LABELS[s] : STAGE_LABELS[s]}
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

          {/* ── Temperature ── */}
          <section>
            <SectionLabel>Temperature</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {TEMP_OPTIONS.map((t) => {
                const tc = TEMPERATURE_COLORS[t.value];
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
                      active
                        ? `${tc.bg} ${tc.text} ring-2 ring-offset-1 ring-gray-300`
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {TEMPERATURE_LABELS[t.value]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Tags ── */}
          {onAddTag && onRemoveTag && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <TagIcon className="w-4 h-4 text-gray-500" />
                <SectionLabel>Tags</SectionLabel>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(draft.tags ?? []).map((t) => (
                  <button
                    key={t}
                    onClick={() => onRemoveTag(draft.id, t)}
                    className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[11px] font-semibold hover:bg-blue-600"
                    title="Click to remove"
                  >
                    {t}
                    <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
                {SUGGESTED_TAGS.filter(
                  (s) => !(draft.tags ?? []).some((t) => t.toLowerCase() === s.toLowerCase()),
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => onAddTag(draft.id, s)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold hover:bg-slate-200"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    {s}
                  </button>
                ))}
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagDraft.trim()) {
                      onAddTag(draft.id, tagDraft.trim());
                      setTagDraft('');
                    }
                  }}
                  placeholder="Custom tag…"
                  className="px-2 py-0.5 rounded-full text-[11px] bg-transparent border border-dashed border-gray-300 w-24 focus:outline-none focus:border-blue-400"
                />
              </div>
            </section>
          )}

          {/* ── Next Action ── */}
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
                  const next = {
                    ...draft,
                    nextAction: (e.target.value || null) as NextActionType | null,
                  };
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

          {/* ── AI Commercial: Acquisition Path ── */}
          {isCommercial && c && (
            <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <SectionLabel>Acquisition Path</SectionLabel>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Mini label="First Awareness Source">
                  <div className="text-[12.5px] font-semibold text-gray-800 bg-white rounded-lg px-3 py-2 border border-indigo-100">
                    {AWARENESS_SOURCE_LABELS[c.firstAwarenessSource]}
                  </div>
                </Mini>
                <Mini label="First Awareness Date">
                  <div className="text-[12.5px] font-semibold text-gray-800 bg-white rounded-lg px-3 py-2 border border-indigo-100">
                    {formatDate(c.firstAwarenessDate)}
                  </div>
                </Mini>
                <Mini label="First real conversation">
                  <select
                    value={c.firstConversationSource ?? ''}
                    onChange={(e) =>
                      patchCommercial({
                        firstConversationSource: (e.target.value || undefined) as FirstConversationSource | undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(FIRST_CONVERSATION_LABELS) as FirstConversationSource[]).map((f) => (
                      <option key={f} value={f}>
                        {FIRST_CONVERSATION_LABELS[f]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Key proof asset">
                  <select
                    value={c.keyProofAssetId ?? ''}
                    onChange={(e) => patchCommercial({ keyProofAssetId: e.target.value || undefined })}
                    className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {proofAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </Mini>
              </div>
              <Mini label="Final closing trigger / why they moved">
                <input
                  value={c.closingTrigger ?? ''}
                  onChange={(e) => patchCommercial({ closingTrigger: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                  placeholder="e.g. Launch deadline for new Marbella property"
                />
              </Mini>
              <Mini label="Notes on how the lead developed">
                <textarea
                  rows={2}
                  value={c.developmentNotes ?? ''}
                  onChange={(e) => patchCommercial({ developmentNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm resize-none"
                />
              </Mini>
            </section>
          )}

          {/* ── AI Commercial: Proof Asset attribution ── */}
          {isCommercial && c && (
            <section className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-gray-500" />
                <SectionLabel>Proof Assets used</SectionLabel>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <AssetPicker
                  label="First asset they saw"
                  value={c.firstAssetSeenId}
                  proofAssets={proofAssets}
                  onChange={(v) => patchCommercial({ firstAssetSeenId: v })}
                />
                <AssetPicker
                  label="Asset I showed / sent in conversation"
                  value={c.assetShownId}
                  proofAssets={proofAssets}
                  onChange={(v) => patchCommercial({ assetShownId: v })}
                />
                <AssetPicker
                  label="Asset that seemed to convince them most"
                  value={c.assetThatConvincedId}
                  proofAssets={proofAssets}
                  onChange={(v) => patchCommercial({ assetThatConvincedId: v })}
                />
              </div>
              {(assetById(c.firstAssetSeenId) ||
                assetById(c.assetShownId) ||
                assetById(c.assetThatConvincedId)) && (
                <div className="text-[11px] text-gray-500">
                  Attribution: <strong>{assetById(c.assetThatConvincedId)?.name ?? '—'}</strong> closed.
                </div>
              )}
            </section>
          )}

          {/* ── AI Commercial: Commercial Fit ── */}
          {isCommercial && c && (
            <section className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <SectionLabel>Commercial Fit</SectionLabel>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Mini label="Buyer type">
                  <select
                    value={c.buyerType ?? ''}
                    onChange={(e) => patchCommercial({ buyerType: (e.target.value || undefined) as BuyerType | undefined })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(BUYER_TYPE_LABELS) as BuyerType[]).map((b) => (
                      <option key={b} value={b}>
                        {BUYER_TYPE_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Lead quality">
                  <div className="grid grid-cols-3 gap-1">
                    {(['A', 'B', 'C'] as LeadQuality[]).map((q) => {
                      const active = c.leadQuality === q;
                      const tone =
                        q === 'A'
                          ? active ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-200 text-emerald-700'
                          : q === 'B'
                            ? active ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-700'
                            : active ? 'bg-slate-600 text-white' : 'bg-white border border-slate-200 text-slate-700';
                      return (
                        <button
                          key={q}
                          onClick={() => patchCommercial({ leadQuality: q })}
                          className={`px-2 py-2 rounded-lg text-[12px] font-bold transition ${tone}`}
                          title={LEAD_QUALITY_LABELS[q]}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </Mini>
                <Mini label="Market tier">
                  <select
                    value={c.marketTier ?? ''}
                    onChange={(e) => patchCommercial({ marketTier: (e.target.value || undefined) as MarketTier | undefined })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(MARKET_TIER_LABELS) as MarketTier[]).map((m) => (
                      <option key={m} value={m}>
                        {MARKET_TIER_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Brand strength">
                  <select
                    value={c.brandStrength ?? ''}
                    onChange={(e) => patchCommercial({ brandStrength: (e.target.value || undefined) as BrandStrength | undefined })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(BRAND_STRENGTH_LABELS) as BrandStrength[]).map((b) => (
                      <option key={b} value={b}>
                        {BRAND_STRENGTH_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Desired commercial type">
                  <select
                    value={c.desiredCommercialType ?? ''}
                    onChange={(e) =>
                      patchCommercial({
                        desiredCommercialType: (e.target.value || undefined) as DesiredCommercialType | undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(DESIRED_COMMERCIAL_LABELS) as DesiredCommercialType[]).map((d) => (
                      <option key={d} value={d}>
                        {DESIRED_COMMERCIAL_LABELS[d]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Asset pack interest">
                  <select
                    value={c.assetPackInterest ?? ''}
                    onChange={(e) =>
                      patchCommercial({
                        assetPackInterest: (e.target.value || undefined) as AssetPackInterest | undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(ASSET_PACK_LABELS) as AssetPackInterest[]).map((a) => (
                      <option key={a} value={a}>
                        {ASSET_PACK_LABELS[a]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Budget signal">
                  <select
                    value={c.budgetSignal ?? ''}
                    onChange={(e) =>
                      patchCommercial({ budgetSignal: (e.target.value || undefined) as BudgetSignal | undefined })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(BUDGET_SIGNAL_LABELS) as BudgetSignal[]).map((b) => (
                      <option key={b} value={b}>
                        {BUDGET_SIGNAL_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Urgency">
                  <select
                    value={c.urgency ?? ''}
                    onChange={(e) => patchCommercial({ urgency: (e.target.value || undefined) as UrgencyLevel | undefined })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(URGENCY_LABELS) as UrgencyLevel[]).map((u) => (
                      <option key={u} value={u}>
                        {URGENCY_LABELS[u]}
                      </option>
                    ))}
                  </select>
                </Mini>
              </div>
            </section>
          )}

          {/* ── AI Commercial: Commercial Proposal ── */}
          {isCommercial && c && (
            <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <SectionLabel>Commercial Proposal</SectionLabel>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Mini label="Initial quoted (€)">
                  <input
                    type="number"
                    value={c.initialQuotedPrice ?? ''}
                    onChange={(e) =>
                      patchCommercial({ initialQuotedPrice: Number(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                  />
                </Mini>
                <Mini label="Final accepted (€)">
                  <input
                    type="number"
                    value={c.finalAcceptedPrice ?? ''}
                    onChange={(e) =>
                      patchCommercial({ finalAcceptedPrice: Number(e.target.value) || undefined })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                  />
                </Mini>
                <Mini label="Price tier">
                  <select
                    value={c.priceTier ?? ''}
                    onChange={(e) =>
                      patchCommercial({ priceTier: (e.target.value || undefined) as PriceTier | undefined })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(PRICE_TIER_LABELS) as PriceTier[]).map((p) => (
                      <option key={p} value={p}>
                        {PRICE_TIER_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </Mini>
                <Mini label="Package">
                  <select
                    value={c.packageType ?? ''}
                    onChange={(e) =>
                      patchCommercial({ packageType: (e.target.value || undefined) as PackageType | undefined })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(Object.keys(PACKAGE_LABELS) as PackageType[]).map((p) => (
                      <option key={p} value={p}>
                        {PACKAGE_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </Mini>
              </div>
              <Mini label="Add-ons quoted">
                <AddOnPicker
                  values={c.addOnsQuoted ?? []}
                  onChange={(v) => patchCommercial({ addOnsQuoted: v })}
                  tone="amber"
                />
              </Mini>
              <Mini label="Add-ons purchased">
                <AddOnPicker
                  values={c.addOnsPurchased ?? []}
                  onChange={(v) => patchCommercial({ addOnsPurchased: v })}
                  tone="emerald"
                />
              </Mini>
              <div className="grid grid-cols-3 gap-2.5">
                <Mini label="Deposit paid?">
                  <div className="grid grid-cols-2 gap-1">
                    {[true, false].map((b) => (
                      <button
                        key={String(b)}
                        onClick={() => patchCommercial({ depositPaid: b })}
                        className={`px-2 py-2 rounded-lg text-[12px] font-semibold transition ${
                          c.depositPaid === b
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-gray-600 border border-amber-200'
                        }`}
                      >
                        {b ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </Mini>
                <Mini label="Deposit date">
                  <input
                    type="date"
                    value={c.depositDate ? new Date(c.depositDate).toISOString().slice(0, 10) : ''}
                    onChange={(e) =>
                      patchCommercial({ depositDate: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                  />
                </Mini>
                <Mini label="Close date">
                  <input
                    type="date"
                    value={c.closeDate ? new Date(c.closeDate).toISOString().slice(0, 10) : ''}
                    onChange={(e) =>
                      patchCommercial({ closeDate: e.target.value ? new Date(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                  />
                </Mini>
              </div>

              {(daysFirstToClose !== null ||
                daysConvToClose !== null ||
                touchesBeforeClose !== null) && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {daysFirstToClose !== null && (
                    <Stat label="Awareness → Close" value={`${daysFirstToClose}d`} />
                  )}
                  {daysConvToClose !== null && (
                    <Stat label="Convo → Close" value={`${daysConvToClose}d`} />
                  )}
                  {touchesBeforeClose !== null && (
                    <Stat label="Touches" value={String(touchesBeforeClose)} />
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── AI Commercial: Lost analysis summary ── */}
          {isCommercial && c?.lostReason && draft.stage === 'lost' && (
            <section className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 space-y-1.5">
              <SectionLabel>Lost Analysis</SectionLabel>
              <div className="text-[12.5px] text-gray-800">
                <strong>Reason:</strong> {LOST_REASON_LABELS[c.lostReason]}
              </div>
              {c.lostObjection && (
                <div className="text-[12.5px] text-gray-800">
                  <strong>Objection:</strong> {LOST_OBJECTION_LABELS[c.lostObjection]}
                </div>
              )}
              {c.lostNotes && (
                <div className="text-[12px] text-gray-600 italic">"{c.lostNotes}"</div>
              )}
              {c.lostReactivatable && (
                <div className="text-[11.5px] text-rose-700 font-semibold">
                  Reactivate {c.lostFollowupMonth ?? 'later'}
                </div>
              )}
            </section>
          )}

          {/* ── Stage history ── */}
          {draft.stageHistory && draft.stageHistory.length > 1 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-gray-500" />
                <SectionLabel>Stage History</SectionLabel>
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {draft.stageHistory.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-2 text-[11.5px] bg-gray-50 rounded-lg px-2.5 py-1.5"
                  >
                    <span className="text-gray-500">
                      {h.from ? STAGE_LABELS[h.from] : 'Captured'}
                    </span>
                    <span className="text-gray-300">→</span>
                    <span className="font-semibold text-gray-900">{STAGE_LABELS[h.to]}</span>
                    <span className="flex-1" />
                    <span className="text-gray-400 tabular-nums">{formatDate(h.enteredAt)}</span>
                    {h.daysInPrevStage !== undefined && (
                      <span className="text-gray-400 tabular-nums">· {h.daysInPrevStage}d</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Deal value ── */}
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

          {/* ── Offer + contact ── */}
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
                  label={isCommercial ? 'Phone / WhatsApp' : 'Phone'}
                  value={draft.phone ?? ''}
                  onChange={(v) => update('phone', String(v))}
                  onCommit={() => commit()}
                />
              </div>
              {isCommercial && c && (
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label="Instagram"
                    value={c.instagram ?? ''}
                    onChange={(v) => patchCommercial({ instagram: String(v) || undefined })}
                    onCommit={() => {}}
                  />
                  <Field
                    label="LinkedIn"
                    value={c.linkedin ?? ''}
                    onChange={(v) => patchCommercial({ linkedin: String(v) || undefined })}
                    onCommit={() => {}}
                  />
                  <Field
                    label="Website"
                    value={c.website ?? ''}
                    onChange={(v) => patchCommercial({ website: String(v) || undefined })}
                    onCommit={() => {}}
                  />
                </div>
              )}
              {!isCommercial && (
                <Field
                  label="Source"
                  value={draft.source ?? ''}
                  onChange={(v) => update('source', String(v))}
                  onCommit={() => commit()}
                />
              )}
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
                      const next = {
                        ...draft,
                        deliveryStatus: e.target.value as Lead['deliveryStatus'],
                      };
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

          {/* ── Notes ── */}
          <section>
            <SectionLabel>Notes</SectionLabel>
            <textarea
              value={draft.notes ?? ''}
              onChange={(e) => update('notes', e.target.value)}
              onBlur={() => commit()}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:border-blue-400"
              placeholder={
                isCommercial
                  ? 'Pain points, hooks, what they responded to…'
                  : 'What you know about them, pain points, hooks…'
              }
            />
          </section>

          {/* ── Documents ── */}
          {onAddFiles && onRemoveFile && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <SectionLabel>Documents & Contracts</SectionLabel>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleDropFiles(e.dataTransfer.files);
                }}
                className={`rounded-xl border-2 border-dashed p-3 transition ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-gray-200 bg-white/40'
                }`}
              >
                {(draft.files ?? []).length === 0 ? (
                  <label className="flex flex-col items-center justify-center gap-1.5 py-3 cursor-pointer text-gray-500">
                    <Upload className="w-5 h-5" />
                    <span className="text-[12px] font-semibold">
                      Drop files or click to attach
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Stored locally — upgrade path: cloud storage
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleDropFiles(e.target.files)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-1.5">
                    {draft.files!.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/85 border border-gray-100"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-gray-900 truncate">
                            {f.name}
                          </div>
                          <div className="text-[10.5px] text-gray-400 tabular-nums">
                            {f.size ? `${Math.round(f.size / 1024)} KB · ` : ''}
                            {formatDate(f.addedAt)}
                          </div>
                        </div>
                        <button
                          onClick={() => downloadDataUrl(f.name, f.dataUrl)}
                          className="p-1 rounded hover:bg-black/[0.05]"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => onRemoveFile(draft.id, f.id)}
                          className="p-1 rounded hover:bg-rose-50 text-rose-500"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center gap-1.5 py-2 cursor-pointer text-[11.5px] font-semibold text-gray-500 hover:text-gray-800">
                      <Plus className="w-3.5 h-3.5" />
                      Add more files
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleDropFiles(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Activity timeline ── */}
          <section>
            <SectionLabel>Activity Timeline</SectionLabel>
            <div className="flex gap-2 mb-3">
              <input
                ref={noteInputRef}
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
                    <div className="text-gray-800 font-medium flex items-center gap-1.5 flex-wrap">
                      <span>{a.description}</span>
                      {a.outcome && (
                        <span className={`ios-pill ${OUTCOME_TONES[a.outcome]}`}>
                          {ACTIVITY_OUTCOME_LABELS[a.outcome]}
                        </span>
                      )}
                    </div>
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
            onClick={closeAndCommit}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow"
          >
            {isInline ? 'Save' : 'Save & Close'}
          </button>
        </footer>
    </>
  );

  if (isInline) {
    return (
      <div className="ios-card-elev !rounded-3xl flex flex-col h-full overflow-hidden bg-white/85">
        {body}
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={closeAndCommit}
      />
      <aside className="fixed top-0 right-0 h-screen w-full max-w-[600px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-fade-in">
        {body}
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

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-600 uppercase">{label}</label>
      <div className="mt-1">{children}</div>
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

function AssetPicker({
  label,
  value,
  proofAssets,
  onChange,
}: {
  label: string;
  value: string | undefined;
  proofAssets: ProofAsset[];
  onChange: (v: string | undefined) => void;
}) {
  return (
    <Mini label={label}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
      >
        <option value="">—</option>
        {proofAssets.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </Mini>
  );
}

function AddOnPicker({
  values,
  onChange,
  tone = 'amber',
}: {
  values: AddOn[];
  onChange: (v: AddOn[]) => void;
  tone?: 'amber' | 'emerald';
}) {
  const toggle = (a: AddOn) => {
    if (values.includes(a)) onChange(values.filter((v) => v !== a));
    else onChange([...values, a]);
  };
  const activeTone =
    tone === 'amber' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';
  const borderTone =
    tone === 'amber' ? 'border-amber-200' : 'border-emerald-200';
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(ADD_ON_LABELS) as AddOn[]).map((a) => {
        const active = values.includes(a);
        return (
          <button
            key={a}
            onClick={() => toggle(a)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
              active ? activeTone : `bg-white text-gray-600 border ${borderTone}`
            }`}
          >
            {ADD_ON_LABELS[a]}
          </button>
        );
      })}
    </div>
  );
}

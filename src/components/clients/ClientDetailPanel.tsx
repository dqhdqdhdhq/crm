import { useEffect, useState } from 'react';
import {
  Bookmark, Calendar, ChevronDown, ExternalLink, Film,
  Globe, Mail, MapPin, MessageSquare, Phone, Sparkles,
  Star, Trash2, X,
} from 'lucide-react';
import {
  Client, ClientTier, RISK_META, STAGE_META, STAGE_ORDER, TIER_META, riskFromHealth,
} from '../../types/clients';
import { Lead, ProofAsset, AWARENESS_SOURCE_LABELS } from '../../types/crm';

interface Props {
  client: Client | null;
  onClose: () => void;
  onSave: (c: Client) => void;
  onDelete: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  // Bridge to DealDesk: when the client was projected from a won Lead, the
  // panel surfaces "How they came in" attribution and a deep-link back.
  sourceLead?: Lead;
  keyProofAsset?: ProofAsset;
  onOpenInDealDesk?: (leadId: string) => void;
}

type Tab = 'overview' | 'activity' | 'commercial' | 'notes';

export function ClientDetailPanel({
  client,
  onClose,
  onSave,
  onDelete,
  onToggleBookmark,
  sourceLead,
  keyProofAsset,
  onOpenInDealDesk,
}: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [draft, setDraft] = useState<Client | null>(client);
  const [stageOpen, setStageOpen] = useState(false);

  // Lock body scroll while sheet is open + reset draft when target changes.
  useEffect(() => {
    setDraft(client);
    setTab('overview');
    if (client) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [client?.id]);

  if (!client || !draft) return null;
  const stageMeta = STAGE_META[draft.stage];
  const risk = RISK_META[riskFromHealth(draft.healthScore)];

  const update = <K extends keyof Client>(k: K, v: Client[K]) => setDraft({ ...draft, [k]: v });

  const commit = (patch: Partial<Client>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onSave(next);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <aside className="client-sheet fixed top-0 right-0 z-50 h-full w-full sm:max-w-[520px] flex flex-col">
        {/* Sticky header */}
        <header className="px-5 pt-5 pb-3 border-b border-black/[0.06]">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0 shadow-[0_4px_14px_rgba(15,23,42,0.18)]"
                style={{ background: `linear-gradient(135deg, ${stageMeta.hex}, ${stageMeta.hex}cc)` }}
              >
                {initials(draft.name)}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  value={draft.name}
                  onChange={(e) => update('name', e.target.value)}
                  onBlur={() => commit({ name: draft.name })}
                  className="block w-full text-[20px] font-semibold tracking-tight text-gray-900 bg-transparent outline-none focus:bg-blue-50/40 rounded-lg px-1 -mx-1"
                />
                <div className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                  {draft.industry}
                  {draft.location && (
                    <>
                      <span className="opacity-40">·</span>
                      <MapPin className="w-3 h-3" />
                      {draft.location}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setDraft({ ...draft, bookmarked: !draft.bookmarked });
                  onToggleBookmark(draft.id);
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center ios-press ${
                  draft.bookmarked ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-black/[0.04]'
                }`}
                title="Bookmark"
              >
                <Bookmark className={`w-4 h-4 ${draft.bookmarked ? 'fill-amber-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-black/[0.04] ios-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stage + tier badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setStageOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 ios-pill ios-press"
                style={{ color: stageMeta.hex, background: `${stageMeta.hex}1a` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: stageMeta.hex }} />
                {stageMeta.label}
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              {stageOpen && (
                <div className="absolute left-0 top-full mt-1 z-10 ios-card-elev p-1 min-w-[160px]">
                  {STAGE_ORDER.map((s) => {
                    const m = STAGE_META[s];
                    return (
                      <button
                        key={s}
                        onClick={() => { commit({ stage: s }); setStageOpen(false); }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] text-[12px] text-left"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.hex }} />
                        <span className="text-gray-800">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <TierSelect tier={draft.tier} onChange={(t) => commit({ tier: t })} />
            <span className={`ios-pill ${risk.chip}`}>{risk.label}</span>
            {draft.bookmarked && (
              <span className="ios-pill bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" /> Saved
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <QuickAction icon={Mail}            label="Email"    href={draft.primaryContact.email ? `mailto:${draft.primaryContact.email}` : undefined} />
            <QuickAction icon={Phone}           label="Call"     href={draft.primaryContact.phone ? `tel:${draft.primaryContact.phone}` : undefined} />
            <QuickAction icon={MessageSquare}   label="WhatsApp" href={draft.primaryContact.phone ? `https://wa.me/${draft.primaryContact.phone.replace(/[^0-9]/g, '')}` : undefined} />
            <QuickAction icon={Globe}           label="Maps"     href={draft.mapsUrl || (draft.lat && draft.lng ? `https://www.google.com/maps/search/?api=1&query=${draft.lat},${draft.lng}` : undefined)} />
          </div>
        </header>

        {/* Tabs */}
        <nav className="px-5 pt-3 pb-2 border-b border-black/[0.06] flex items-center gap-1">
          {(['overview', 'activity', 'commercial', 'notes'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg capitalize ios-press ${
                tab === t ? 'bg-black/[0.05] text-gray-900' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {tab === 'overview' && (
            <>
              {sourceLead && (
                <HowTheyCameIn
                  lead={sourceLead}
                  keyProofAsset={keyProofAsset}
                  onOpenInDealDesk={onOpenInDealDesk}
                />
              )}
              <OverviewTab draft={draft} update={update} commit={commit} />
            </>
          )}
          {tab === 'activity' && <ActivityTab draft={draft} commit={commit} />}
          {tab === 'commercial' && <CommercialTab draft={draft} update={update} commit={commit} />}
          {tab === 'notes' && <NotesTab draft={draft} update={update} commit={commit} />}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-black/[0.06] flex items-center justify-between bg-white/60 backdrop-blur-md">
          <button
            onClick={() => { if (confirm(`Delete ${draft.name}?`)) onDelete(draft.id); }}
            className="text-[12px] text-rose-600 hover:text-rose-700 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-rose-50 ios-press"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <span className="text-[11px] text-gray-400">
            Updated {new Date(draft.updatedAt).toLocaleDateString()}
          </span>
        </footer>
      </aside>
    </>
  );
}

function QuickAction({ icon: Icon, label, href }: { icon: any; label: string; href?: string }) {
  const disabled = !href;
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border ios-press ${
        disabled
          ? 'border-black/[0.05] text-gray-300 bg-transparent cursor-not-allowed'
          : 'border-black/[0.06] text-gray-700 bg-white/70 hover:bg-white hover:border-blue-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
  if (disabled) return <div>{content}</div>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  );
}

function TierSelect({ tier, onChange }: { tier: ClientTier; onChange: (t: ClientTier) => void }) {
  const [open, setOpen] = useState(false);
  const meta = TIER_META[tier];
  const tiers: ClientTier[] = ['lead', 'bronze', 'silver', 'gold', 'platinum'];
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className={`ios-pill ${meta.chip} inline-flex items-center gap-1 ios-press`}>
        {meta.label}
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-10 ios-card-elev p-1 min-w-[140px]">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] text-[12px] text-left text-gray-800"
            >
              {TIER_META[t].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OverviewTab({ draft, update, commit }: { draft: Client; update: any; commit: (p: Partial<Client>) => void }) {
  return (
    <>
      {/* Health */}
      <Section title="Health">
        <input
          type="range"
          min={0}
          max={100}
          value={draft.healthScore}
          onChange={(e) => update('healthScore', Number(e.target.value))}
          onMouseUp={() => commit({ healthScore: draft.healthScore })}
          onTouchEnd={() => commit({ healthScore: draft.healthScore })}
          className="w-full health-range"
        />
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span>0</span>
          <span className="tabular-nums font-semibold text-gray-800 text-[13px]">{draft.healthScore}</span>
          <span>100</span>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Primary contact">
        <Field
          label="Name"
          value={draft.primaryContact.name}
          onChange={(v) => update('primaryContact', { ...draft.primaryContact, name: v })}
          onBlur={() => commit({ primaryContact: draft.primaryContact })}
        />
        <Field
          label="Role"
          value={draft.primaryContact.role || ''}
          onChange={(v) => update('primaryContact', { ...draft.primaryContact, role: v })}
          onBlur={() => commit({ primaryContact: draft.primaryContact })}
        />
        <Field
          label="Email"
          value={draft.primaryContact.email || ''}
          onChange={(v) => update('primaryContact', { ...draft.primaryContact, email: v })}
          onBlur={() => commit({ primaryContact: draft.primaryContact })}
        />
        <Field
          label="Phone"
          value={draft.primaryContact.phone || ''}
          onChange={(v) => update('primaryContact', { ...draft.primaryContact, phone: v })}
          onBlur={() => commit({ primaryContact: draft.primaryContact })}
        />
      </Section>

      {/* Identity */}
      <Section title="Identity">
        <Field label="Industry" value={draft.industry} onChange={(v) => update('industry', v)} onBlur={() => commit({ industry: draft.industry })} />
        <Field label="Location" value={draft.location || ''} onChange={(v) => update('location', v)} onBlur={() => commit({ location: draft.location })} />
        <Field label="Website"  value={draft.website || ''}  onChange={(v) => update('website', v)}  onBlur={() => commit({ website: draft.website })} />
      </Section>

      {/* Tags */}
      <Section title="Tags">
        <div className="flex flex-wrap gap-1.5">
          {draft.tags.map((t) => (
            <button
              key={t}
              onClick={() => commit({ tags: draft.tags.filter((x) => x !== t) })}
              className="ios-pill bg-black/[0.05] text-gray-700 hover:bg-rose-50 hover:text-rose-700 ios-press"
            >
              {t} <span className="ml-1 opacity-50">×</span>
            </button>
          ))}
          <AddTag onAdd={(t) => commit({ tags: [...draft.tags, t] })} />
        </div>
      </Section>
    </>
  );
}

function ActivityTab({ draft, commit }: { draft: Client; commit: (p: Partial<Client>) => void }) {
  const [note, setNote] = useState('');
  const submit = () => {
    if (!note.trim()) return;
    commit({
      touches: [
        { id: crypto.randomUUID(), type: 'note', body: note.trim(), at: new Date() },
        ...draft.touches,
      ],
      lastContactAt: new Date(),
    });
    setNote('');
  };
  return (
    <>
      <Section title="Log a touch">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Called Marco — wants to see pricing tomorrow…"
          className="w-full text-[13px] rounded-xl bg-black/[0.03] border border-transparent focus:bg-white focus:border-blue-300 px-3 py-2 outline-none resize-none min-h-[64px]"
        />
        <button
          onClick={submit}
          disabled={!note.trim()}
          className="self-end px-3 py-1.5 rounded-lg bg-blue-500 text-white text-[12px] font-semibold disabled:opacity-40 ios-press"
        >
          Save touch
        </button>
      </Section>
      <Section title={`Timeline · ${draft.touches.length}`}>
        {draft.touches.length === 0 && (
          <div className="text-[12px] text-gray-400 italic">No activity logged yet.</div>
        )}
        <ol className="space-y-3">
          {draft.touches.map((t) => (
            <li key={t.id} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 ring-4 ring-blue-100" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{t.type}</div>
                <div className="text-[13px] text-gray-800 leading-snug">{t.body}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{new Date(t.at).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}

function CommercialTab({ draft, update, commit }: { draft: Client; update: any; commit: (p: Partial<Client>) => void }) {
  return (
    <>
      <Section title="Revenue">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="MRR ($)"   value={draft.mrr}        onChange={(v) => { update('mrr', v); }} onBlur={() => commit({ mrr: draft.mrr })} />
          <NumberField label="LTV ($)"   value={draft.totalValue} onChange={(v) => update('totalValue', v)} onBlur={() => commit({ totalValue: draft.totalValue })} />
        </div>
      </Section>
      <Section title="Contract">
        <DateField
          label="Start"
          value={draft.contractStart}
          onChange={(d) => commit({ contractStart: d })}
        />
        <DateField
          label="End"
          value={draft.contractEnd}
          onChange={(d) => commit({ contractEnd: d })}
        />
        {draft.contractEnd && (
          <div className="text-[12px] text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {(() => {
              const d = Math.round((new Date(draft.contractEnd).getTime() - Date.now()) / 86400000);
              if (d < 0) return `Expired ${-d}d ago`;
              if (d <= 90) return <span className="text-amber-700 font-semibold">Renews in {d}d</span>;
              return `${d}d until renewal`;
            })()}
          </div>
        )}
      </Section>
    </>
  );
}

function NotesTab({ draft, update, commit }: { draft: Client; update: any; commit: (p: Partial<Client>) => void }) {
  return (
    <Section title="Internal notes">
      <textarea
        value={draft.notes}
        onChange={(e) => update('notes', e.target.value)}
        onBlur={() => commit({ notes: draft.notes })}
        placeholder="Anything you want to remember about this client…"
        className="w-full min-h-[280px] text-[13px] rounded-2xl bg-black/[0.03] border border-transparent focus:bg-white focus:border-blue-300 px-3 py-2.5 outline-none resize-none"
      />
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="ios-section-title">{title}</div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, onBlur,
}: { label: string; value: string; onChange: (v: string) => void; onBlur: () => void }) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-[12px] text-gray-500 w-20 flex-shrink-0">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="flex-1 text-[13px] rounded-lg bg-black/[0.03] border border-transparent focus:bg-white focus:border-blue-300 px-2.5 py-1.5 outline-none"
      />
    </label>
  );
}

function NumberField({
  label, value, onChange, onBlur,
}: { label: string; value: number; onChange: (v: number) => void; onBlur: () => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
      <input
        type="number"
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
        className="text-[14px] tabular-nums font-semibold rounded-lg bg-black/[0.03] border border-transparent focus:bg-white focus:border-blue-300 px-2.5 py-1.5 outline-none"
      />
    </label>
  );
}

function DateField({
  label, value, onChange,
}: { label: string; value?: Date; onChange: (d: Date | undefined) => void }) {
  const iso = value ? new Date(value).toISOString().slice(0, 10) : '';
  return (
    <label className="flex items-center gap-3">
      <span className="text-[12px] text-gray-500 w-20 flex-shrink-0">{label}</span>
      <input
        type="date"
        value={iso}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
        className="flex-1 text-[13px] rounded-lg bg-black/[0.03] border border-transparent focus:bg-white focus:border-blue-300 px-2.5 py-1.5 outline-none"
      />
    </label>
  );
}

function AddTag({ onAdd }: { onAdd: (t: string) => void }) {
  const [val, setVal] = useState('');
  const [editing, setEditing] = useState(false);
  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="ios-pill bg-blue-50 text-blue-700 hover:bg-blue-100 ios-press">
        + Tag
      </button>
    );
  }
  return (
    <input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { if (val.trim()) onAdd(val.trim()); setVal(''); setEditing(false); }}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setVal(''); setEditing(false); } }}
      placeholder="new tag"
      className="ios-pill bg-white border border-blue-200 px-2 outline-none text-[11px] w-24"
    />
  );
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
}

function HowTheyCameIn({
  lead,
  keyProofAsset,
  onOpenInDealDesk,
}: {
  lead: Lead;
  keyProofAsset?: ProofAsset;
  onOpenInDealDesk?: (leadId: string) => void;
}) {
  const c = lead.commercial;
  if (!c) return null;

  const source = AWARENESS_SOURCE_LABELS[c.firstAwarenessSource];
  const aware = new Date(c.firstAwarenessDate).getTime();
  const close = c.closeDate ? new Date(c.closeDate).getTime() : new Date(lead.updatedAt).getTime();
  const daysToClose = Math.max(0, Math.round((close - aware) / 86400000));

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-fuchsia-50/60 p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> How they came in
        </div>
        {onOpenInDealDesk && (
          <button
            onClick={() => onOpenInDealDesk(lead.id)}
            className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 ios-press"
          >
            Open in DealDesk <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
      <ul className="space-y-1.5 text-[12px] text-gray-800">
        <li className="flex gap-2">
          <span className="text-gray-500 w-20 flex-shrink-0">First touch</span>
          <span className="font-semibold">{source}</span>
        </li>
        {keyProofAsset && (
          <li className="flex gap-2">
            <span className="text-gray-500 w-20 flex-shrink-0">Closed by</span>
            <span className="font-semibold inline-flex items-center gap-1.5">
              <Film className="w-3 h-3 text-fuchsia-600" />
              {keyProofAsset.name}
            </span>
          </li>
        )}
        <li className="flex gap-2">
          <span className="text-gray-500 w-20 flex-shrink-0">Time to close</span>
          <span className="font-semibold tabular-nums">{daysToClose}d</span>
        </li>
      </ul>
    </div>
  );
}

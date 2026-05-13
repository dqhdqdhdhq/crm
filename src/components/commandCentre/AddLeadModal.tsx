import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Lead,
  LeadStage,
  NextActionType,
  STAGE_DEFAULT_PROBABILITY,
  STAGE_LABELS,
  STAGE_ORDER,
  NEXT_ACTION_LABELS,
} from '../../types/crm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  defaultIsClient?: boolean;
}

export function AddLeadModal({ isOpen, onClose, onSave, defaultIsClient = false }: Props) {
  const [mode, setMode] = useState<'lead' | 'client'>(defaultIsClient ? 'client' : 'lead');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [offer, setOffer] = useState('');
  const [oneTimeValue, setOneTimeValue] = useState<number>(0);
  const [monthlyValue, setMonthlyValue] = useState<number>(0);
  const [stage, setStage] = useState<LeadStage>('new');
  const [nextAction, setNextAction] = useState<NextActionType | ''>('call');
  const [nextActionNote, setNextActionNote] = useState('');
  const [nextActionDueDate, setNextActionDueDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setName('');
    setCompany('');
    setOffer('');
    setOneTimeValue(0);
    setMonthlyValue(0);
    setStage(mode === 'client' ? 'won' : 'new');
    setNextAction('call');
    setNextActionNote('');
    setNextActionDueDate(new Date().toISOString().slice(0, 10));
    setEmail('');
    setPhone('');
    setNotes('');
  };

  const handleSave = () => {
    if (!name.trim() || !company.trim()) return;
    const isClient = mode === 'client';
    const finalStage: LeadStage = isClient ? 'won' : stage;
    const probability =
      finalStage === 'won' ? 100 : finalStage === 'lost' ? 0 : STAGE_DEFAULT_PROBABILITY[finalStage];
    const lead: Lead = {
      id: crypto.randomUUID(),
      name: name.trim(),
      company: company.trim(),
      offer: offer.trim() || 'Untitled offer',
      stage: finalStage,
      temperature: finalStage === 'verbal-yes' || finalStage === 'proposal-sent' ? 'hot' : 'warm',
      probability,
      oneTimeValue: Number(oneTimeValue) || 0,
      monthlyValue: Number(monthlyValue) || 0,
      nextAction: isClient ? 'follow-up' : (nextAction || null) as NextActionType | null,
      nextActionNote: nextActionNote.trim(),
      nextActionDueDate: nextActionDueDate ? new Date(nextActionDueDate) : null,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      activities: [
        {
          id: crypto.randomUUID(),
          type: 'note',
          description: isClient ? 'Client added' : 'Lead added',
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isClient,
      deliveryStatus: isClient ? 'not-started' : undefined,
      startDate: isClient ? new Date() : undefined,
    };
    onSave(lead);
    reset();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full max-w-[440px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-fade-in">
        <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Lead / Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        <div className="grid grid-cols-2 px-6 pt-4 gap-2 border-b border-gray-100">
          {(['lead', 'client'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === 'client') setStage('won');
                else setStage('new');
              }}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                mode === m
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'lead' ? 'Lead' : 'Client'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <FieldGroup label="Full Name *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
            />
          </FieldGroup>

          <FieldGroup label="Company *">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
            />
          </FieldGroup>

          <FieldGroup label="Offer / Service">
            <input
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. Website + booking system"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
            />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="One-Time (€)">
              <input
                type="number"
                value={oneTimeValue || ''}
                onChange={(e) => setOneTimeValue(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
            <FieldGroup label="Monthly (€)">
              <input
                type="number"
                value={monthlyValue || ''}
                onChange={(e) => setMonthlyValue(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
          </div>

          {mode === 'lead' && (
            <FieldGroup label="Stage *">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              >
                {STAGE_ORDER.filter((s) => s !== 'won' && s !== 'lost').map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </FieldGroup>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
            <FieldGroup label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+353…"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
          </div>

          {mode === 'lead' && (
            <>
              <FieldGroup label="Next Action">
                <select
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value as NextActionType)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                >
                  {(Object.keys(NEXT_ACTION_LABELS) as NextActionType[]).map((a) => (
                    <option key={a} value={a}>
                      {NEXT_ACTION_LABELS[a]}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="What needs to happen?">
                <input
                  value={nextActionNote}
                  onChange={(e) => setNextActionNote(e.target.value)}
                  placeholder="e.g. Send pricing options + book demo"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                />
              </FieldGroup>

              <FieldGroup label="Due Date">
                <input
                  type="date"
                  value={nextActionDueDate}
                  onChange={(e) => setNextActionDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                />
              </FieldGroup>
            </>
          )}

          <FieldGroup label="Notes">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth remembering…"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:border-blue-400 focus:outline-none"
            />
          </FieldGroup>
        </div>

        <footer className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end bg-gray-50/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !company.trim()}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save {mode === 'client' ? 'Client' : 'Lead'}
          </button>
        </footer>
      </aside>
    </>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-700 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

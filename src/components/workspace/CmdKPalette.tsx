import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  User,
  Plus,
  LayoutDashboard,
  GitBranch,
  Calendar,
  Activity as ActivityIcon,
  Phone,
  MessageCircle,
  Mail,
  CalendarPlus,
  Moon,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Lead, SUGGESTED_TAGS } from '../../types/crm';
import { telHref, waHref, mailtoHref, gcalHref } from '../../lib/connect';

export type CentreMode = 'today' | 'board' | 'calendar' | 'activity';

interface Props {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (id: string) => void;
  onSwitchMode: (mode: CentreMode) => void;
  onOpenAddLead: () => void;
  onToggleTagFilter?: (tag: string) => void;
  onSnoozeSelected?: (days: number) => void;
  onMarkSelectedDone?: () => void;
}

type Item =
  | { kind: 'lead'; lead: Lead }
  | {
      kind: 'action';
      id: string;
      label: string;
      hint?: string;
      icon: typeof Search;
      onRun: () => void;
    }
  | { kind: 'tag'; tag: string };

export function CmdKPalette({
  open,
  onClose,
  leads,
  selectedLead,
  onSelectLead,
  onSwitchMode,
  onOpenAddLead,
  onToggleTagFilter,
  onSnoozeSelected,
  onMarkSelectedDone,
}: Props) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items: Item[] = useMemo(() => {
    const query = q.trim().toLowerCase();
    const out: Item[] = [];

    // Tag filter mode — "#tag"
    if (query.startsWith('#')) {
      const tagQ = query.slice(1);
      const allTags = new Set<string>(SUGGESTED_TAGS);
      leads.forEach((l) => l.tags?.forEach((t) => allTags.add(t)));
      Array.from(allTags)
        .filter((t) => t.toLowerCase().includes(tagQ))
        .slice(0, 10)
        .forEach((t) => out.push({ kind: 'tag', tag: t }));
      return out;
    }

    // Actions on selected lead
    if (selectedLead) {
      const l = selectedLead;
      const tel = telHref(l.phone);
      const wa = waHref(l.phone);
      const mail = mailtoHref(l.email);
      const cal = gcalHref({ title: `${l.company} — call`, attendees: l.email ? [l.email] : undefined });
      if (tel)
        out.push({
          kind: 'action',
          id: 'call',
          label: `Call ${l.name}`,
          hint: l.phone,
          icon: Phone,
          onRun: () => window.location.assign(tel),
        });
      if (wa)
        out.push({
          kind: 'action',
          id: 'wa',
          label: `WhatsApp ${l.name}`,
          hint: l.phone,
          icon: MessageCircle,
          onRun: () => window.open(wa, '_blank', 'noopener,noreferrer'),
        });
      if (mail)
        out.push({
          kind: 'action',
          id: 'email',
          label: `Email ${l.name}`,
          hint: l.email,
          icon: Mail,
          onRun: () => window.location.assign(mail),
        });
      out.push({
        kind: 'action',
        id: 'meeting',
        label: `Schedule meeting with ${l.name}`,
        hint: 'Google Calendar',
        icon: CalendarPlus,
        onRun: () => window.open(cal, '_blank', 'noopener,noreferrer'),
      });
      if (onSnoozeSelected) {
        [1, 3, 7].forEach((d) =>
          out.push({
            kind: 'action',
            id: `snooze-${d}`,
            label: `Snooze ${d}d`,
            hint: l.company,
            icon: Moon,
            onRun: () => onSnoozeSelected(d),
          }),
        );
      }
      if (onMarkSelectedDone) {
        out.push({
          kind: 'action',
          id: 'done',
          label: 'Mark next action done',
          hint: l.company,
          icon: CheckCircle2,
          onRun: onMarkSelectedDone,
        });
      }
    }

    // People search
    leads
      .filter((l) => {
        if (!query) return true;
        return (
          l.name.toLowerCase().includes(query) ||
          l.company.toLowerCase().includes(query) ||
          l.offer.toLowerCase().includes(query) ||
          (l.tags ?? []).some((t) => t.toLowerCase().includes(query))
        );
      })
      .slice(0, 12)
      .forEach((l) => out.push({ kind: 'lead', lead: l }));

    // Global actions
    const globals: { id: string; label: string; icon: typeof Search; onRun: () => void }[] = [
      { id: 'add', label: 'Add lead / client', icon: Plus, onRun: onOpenAddLead },
      { id: 'today', label: 'Go to Today', icon: LayoutDashboard, onRun: () => onSwitchMode('today') },
      { id: 'board', label: 'Go to Board', icon: GitBranch, onRun: () => onSwitchMode('board') },
      { id: 'calendar', label: 'Go to Calendar', icon: Calendar, onRun: () => onSwitchMode('calendar') },
      { id: 'activity', label: 'Go to Activity', icon: ActivityIcon, onRun: () => onSwitchMode('activity') },
    ];
    globals
      .filter((g) => !query || g.label.toLowerCase().includes(query))
      .forEach((g) =>
        out.push({
          kind: 'action',
          id: g.id,
          label: g.label,
          icon: g.icon,
          onRun: g.onRun,
        }),
      );

    return out;
  }, [q, leads, selectedLead, onSwitchMode, onOpenAddLead, onSnoozeSelected, onMarkSelectedDone]);

  useEffect(() => {
    if (active >= items.length) setActive(0);
  }, [items.length, active]);

  if (!open) return null;

  const run = (i: Item) => {
    if (i.kind === 'lead') onSelectLead(i.lead.id);
    else if (i.kind === 'action') i.onRun();
    else if (i.kind === 'tag' && onToggleTagFilter) onToggleTagFilter(i.tag);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ios-card-elev w-full max-w-[620px] mx-4 overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b ios-divider">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(items.length - 1, a + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const i = items[active];
                if (i) run(i);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder={
              selectedLead
                ? `Search · actions on ${selectedLead.name} · #tag`
                : 'Search people, actions, #tag…'
            }
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-gray-500"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.06] text-gray-500">
            esc
          </kbd>
        </div>
        <div className="max-h-[420px] overflow-y-auto py-1">
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-[13px] text-gray-400 italic">
              No matches.
            </div>
          )}
          {items.map((i, idx) => (
            <ItemRow
              key={`${i.kind}-${idx}`}
              item={i}
              active={idx === active}
              onMouseEnter={() => setActive(idx)}
              onClick={() => run(i)}
            />
          ))}
        </div>
        <div className="px-4 py-2 border-t ios-divider text-[10.5px] text-gray-500 flex items-center justify-between">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">↑↓</kbd> navigate ·{' '}
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">↵</kbd> run
          </span>
          <span>
            Type <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">#</kbd> to filter by tag
          </span>
        </div>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  active,
  onMouseEnter,
  onClick,
}: {
  item: Item;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  if (item.kind === 'lead') {
    const l = item.lead;
    return (
      <button
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        className={`w-full text-left px-3 py-2 flex items-center gap-3 transition ${
          active ? 'bg-blue-500/10' : 'hover:bg-black/[0.03]'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-white text-[10.5px] font-semibold flex items-center justify-center">
          {l.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-gray-900 truncate">
            {l.company}
          </div>
          <div className="text-[11px] text-gray-500 truncate">
            {l.name} · {l.offer}
          </div>
        </div>
        <User className="w-3.5 h-3.5 text-gray-300" />
      </button>
    );
  }
  if (item.kind === 'tag') {
    return (
      <button
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        className={`w-full text-left px-3 py-2 flex items-center gap-3 transition ${
          active ? 'bg-blue-500/10' : 'hover:bg-black/[0.03]'
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
          <Tag className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-gray-900">Filter by #{item.tag}</div>
          <div className="text-[11px] text-gray-500">Toggle rail filter</div>
        </div>
      </button>
    );
  }
  const Icon = item.icon;
  return (
    <button
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`w-full text-left px-3 py-2 flex items-center gap-3 transition ${
        active ? 'bg-blue-500/10' : 'hover:bg-black/[0.03]'
      }`}
    >
      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-gray-900 truncate">{item.label}</div>
        {item.hint && (
          <div className="text-[11px] text-gray-500 truncate">{item.hint}</div>
        )}
      </div>
    </button>
  );
}


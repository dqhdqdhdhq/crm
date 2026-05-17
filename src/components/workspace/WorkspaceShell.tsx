import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutDashboard, GitBranch, Calendar, Activity, X } from 'lucide-react';
import { Lead } from '../../types/crm';
import { CRMState, CRMMetrics } from '../../hooks/useCRM';
import { telHref, waHref, mailtoHref, gcalHref } from '../../lib/connect';
import { LeftRail } from './LeftRail';
import { TodayMode } from './modes/TodayMode';
import { BoardMode } from './modes/BoardMode';
import { CalendarMode } from './modes/CalendarMode';
import { ActivityMode } from './modes/ActivityMode';
import { CmdKPalette, CentreMode } from './CmdKPalette';
import { LeadDetailPanel } from '../commandCentre/LeadDetailPanel';

interface Props {
  crm: CRMState;
  metrics: CRMMetrics;
  onOpenAddLead: () => void;
}

const MODES: { id: CentreMode; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'board', label: 'Board', icon: GitBranch },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export function WorkspaceShell({ crm, metrics, onOpenAddLead }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<CentreMode>('today');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);

  const selectedLead: Lead | null = selectedId
    ? crm.leads.find((l) => l.id === selectedId) ?? null
    : null;

  // Cross-app handoff (e.g. ClientsPage handing us a lead).
  useEffect(() => {
    try {
      const id = sessionStorage.getItem('dealdesk-focus-lead');
      if (id) {
        sessionStorage.removeItem('dealdesk-focus-lead');
        if (crm.leads.some((l) => l.id === id)) setSelectedId(id);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If selection vanishes (e.g. delete), bail to no-selection state.
  useEffect(() => {
    if (selectedId && !crm.leads.some((l) => l.id === selectedId)) {
      setSelectedId(null);
    }
  }, [crm.leads, selectedId]);

  // Open helpers for keyboard shortcuts on the focused lead.
  const fireContact = useCallback(
    (channel: 'call' | 'wa' | 'email' | 'meeting') => {
      const l = selectedLead;
      if (!l) return;
      if (channel === 'call') {
        const h = telHref(l.phone);
        if (h) window.location.assign(h);
      } else if (channel === 'wa') {
        const h = waHref(l.phone, `Hi ${l.name.split(' ')[0]} — `);
        if (h) window.open(h, '_blank', 'noopener,noreferrer');
      } else if (channel === 'email') {
        const h = mailtoHref(l.email, {
          subject: l.offer ? `${l.offer} — quick follow-up` : 'Following up',
        });
        if (h) window.location.assign(h);
      } else if (channel === 'meeting') {
        const h = gcalHref({
          title: `${l.company} — call`,
          details: l.offer || '',
          attendees: l.email ? [l.email] : undefined,
        });
        window.open(h, '_blank', 'noopener,noreferrer');
      }
    },
    [selectedLead],
  );

  // Global keyboard layer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K — palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((p) => !p);
        return;
      }
      // When the palette is open or no lead is selected, skip the per-lead shortcuts.
      if (paletteOpen || !selectedLead) return;
      // Don't fire shortcuts while typing into inputs.
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          fireContact('call');
          break;
        case 'w':
          e.preventDefault();
          fireContact('wa');
          break;
        case 'e':
          e.preventDefault();
          fireContact('email');
          break;
        case 'm':
          e.preventDefault();
          fireContact('meeting');
          break;
        case 'n':
          e.preventDefault();
          noteInputRef.current?.focus();
          break;
        case 's':
          e.preventDefault();
          crm.snoozeLead(selectedLead.id, 1);
          break;
        case 'escape':
          e.preventDefault();
          setSelectedId(null);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, selectedLead, fireContact, crm]);

  const showInlineDetail = selectedLead !== null;

  return (
    <div className="px-4 md:px-6 py-4 h-[calc(100vh-64px)] flex flex-col gap-3 max-w-[1600px] mx-auto">
      {/* Centre mode bar — only relevant when no lead selected */}
      {!showInlineDetail && (
        <div className="flex items-center gap-2 flex-wrap">
          <nav className="ios-segmented" role="tablist">
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`ios-segment ${active ? 'ios-segment-active' : ''}`}
                  role="tab"
                  aria-selected={active}
                >
                  <m.icon className="w-[14px] h-[14px]" />
                  {m.label}
                </button>
              );
            })}
          </nav>
          <span className="text-[11px] text-gray-500 ml-1">
            Pick a person from the rail to drill in. <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">⌘K</kbd> for the palette.
          </span>
        </div>
      )}

      {showInlineDetail && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.08] text-[12px] font-semibold text-gray-700 ios-press"
          >
            <X className="w-3.5 h-3.5" />
            Close lead
          </button>
          <span className="text-[11px] text-gray-500">
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">esc</kbd> to close ·{' '}
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">c</kbd>
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">w</kbd>
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">e</kbd>
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">m</kbd> to contact ·{' '}
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">n</kbd> note ·{' '}
            <kbd className="px-1 py-0.5 rounded bg-black/[0.06]">s</kbd> snooze
          </span>
        </div>
      )}

      <div className="flex gap-3 flex-1 min-h-0">
        <LeftRail
          leads={crm.leads}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
        />

        <main className="flex-1 min-w-0 overflow-hidden">
          {showInlineDetail ? (
            <div className="h-full">
              <LeadDetailPanel
                lead={selectedLead}
                proofAssets={crm.proofAssets}
                onClose={() => setSelectedId(null)}
                onSave={(l) => crm.upsertLead(l)}
                onDelete={(id) => crm.deleteLead(id)}
                onLogActivity={crm.logActivity}
                onUpdateStage={crm.updateStage}
                onMarkActionDone={crm.markActionDone}
                onUpdateCommercial={crm.updateCommercial}
                variant="inline"
                onAddTag={crm.addTag}
                onRemoveTag={crm.removeTag}
                onAddFiles={crm.addFiles}
                onRemoveFile={crm.removeFile}
                noteInputRef={noteInputRef}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-1">
              {mode === 'today' && (
                <TodayMode
                  metrics={metrics}
                  onSelectLead={setSelectedId}
                  onMarkActionDone={crm.markActionDone}
                  onOpenAddLead={onOpenAddLead}
                />
              )}
              {mode === 'board' && (
                <BoardMode
                  metrics={metrics}
                  onSelectLead={setSelectedId}
                  onUpdateStage={crm.updateStage}
                />
              )}
              {mode === 'calendar' && (
                <CalendarMode leads={crm.leads} onSelectLead={setSelectedId} />
              )}
              {mode === 'activity' && (
                <ActivityMode leads={crm.leads} onSelectLead={setSelectedId} />
              )}
            </div>
          )}
        </main>
      </div>

      <CmdKPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        leads={crm.leads}
        selectedLead={selectedLead}
        onSelectLead={(id) => setSelectedId(id)}
        onSwitchMode={(m) => {
          setSelectedId(null);
          setMode(m);
        }}
        onOpenAddLead={onOpenAddLead}
        onSnoozeSelected={
          selectedLead ? (d) => crm.snoozeLead(selectedLead.id, d) : undefined
        }
        onMarkSelectedDone={
          selectedLead ? () => crm.markActionDone(selectedLead.id) : undefined
        }
      />
    </div>
  );
}

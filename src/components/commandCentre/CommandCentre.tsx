import { useState } from 'react';
import { Briefcase, BarChart3, Sparkles, Plus } from 'lucide-react';
import { useCRM, useCRMMetrics } from '../../hooks/useCRM';
import { RevenueView } from './RevenueView';
import { IntelligenceView } from './IntelligenceView';
import { AddLeadModal } from './AddLeadModal';
import { WorkspaceShell } from '../workspace/WorkspaceShell';

type Tab = 'workspace' | 'revenue' | 'intelligence';

const TABS: { id: Tab; label: string; icon: typeof Briefcase }[] = [
  { id: 'workspace', label: 'Workspace', icon: Briefcase },
  { id: 'revenue', label: 'Revenue', icon: BarChart3 },
  { id: 'intelligence', label: 'Intelligence', icon: Sparkles },
];

export function CommandCentre() {
  const crm = useCRM();
  const metrics = useCRMMetrics(crm.leads);
  const [tab, setTab] = useState<Tab>('workspace');
  const [showAdd, setShowAdd] = useState(false);
  const [defaultIsClient, setDefaultIsClient] = useState(false);

  const openAdd = (asClient = false) => {
    setDefaultIsClient(asClient);
    setShowAdd(true);
  };

  return (
    <div className="min-h-full ios-surface">
      <header className="sticky top-0 z-30 ios-toolbar">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-[15px] shadow-[0_2px_8px_rgba(99,102,241,0.35)]">
              V
            </div>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold text-gray-900 tracking-tight">DealDesk</div>
              <div className="text-[11px] text-gray-500 tracking-tight">Sales Command Centre</div>
            </div>
          </div>

          <nav className="ios-segmented ml-3" role="tablist">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`ios-segment ${active ? 'ios-segment-active' : ''}`}
                  aria-selected={active}
                  role="tab"
                >
                  <t.icon className="w-[15px] h-[15px]" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          <button
            onClick={() => openAdd(false)}
            className="flex items-center gap-1.5 pl-2.5 pr-3.5 py-2 rounded-full bg-blue-500 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.4)] hover:bg-blue-600 ios-press"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </header>

      {tab === 'workspace' && (
        <WorkspaceShell crm={crm} metrics={metrics} onOpenAddLead={() => openAdd(false)} />
      )}
      {tab === 'revenue' && <RevenueView leads={crm.leads} metrics={metrics} />}
      {tab === 'intelligence' && (
        <IntelligenceView
          leads={crm.leads}
          proofAssets={crm.proofAssets}
          onSelectLead={(l) => {
            try {
              sessionStorage.setItem('dealdesk-focus-lead', l.id);
            } catch {}
            setTab('workspace');
          }}
        />
      )}

      <AddLeadModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(l) => crm.upsertLead(l)}
        defaultIsClient={defaultIsClient}
        proofAssets={crm.proofAssets}
      />
    </div>
  );
}

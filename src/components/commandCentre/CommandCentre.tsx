import { useState } from 'react';
import {
  LayoutDashboard,
  GitBranch,
  CheckCircle2,
  Users,
  BarChart3,
  Bell,
  Search,
  Plus,
} from 'lucide-react';
import { Lead } from '../../types/crm';
import { useCRM, useCRMMetrics } from '../../hooks/useCRM';
import { DashboardView } from './DashboardView';
import { PipelineView } from './PipelineView';
import { FollowUpsView } from './FollowUpsView';
import { ClientsView } from './ClientsView';
import { RevenueView } from './RevenueView';
import { LeadDetailPanel } from './LeadDetailPanel';
import { AddLeadModal } from './AddLeadModal';

type Tab = 'dashboard' | 'pipeline' | 'followups' | 'clients' | 'revenue';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'followups', label: 'Follow-Ups', icon: CheckCircle2 },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'revenue', label: 'Revenue', icon: BarChart3 },
];

export function CommandCentre() {
  const crm = useCRM();
  const metrics = useCRMMetrics(crm.leads);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [defaultIsClient, setDefaultIsClient] = useState(false);
  const [search, setSearch] = useState('');

  const selectedLead = selectedId ? crm.leads.find((l) => l.id === selectedId) ?? null : null;

  const overdueCount = metrics.overdueFollowUps.length;
  const todayCount = metrics.followUpsDueToday.length;
  const followupBadge = overdueCount + todayCount;

  const searchMatches =
    search.trim().length > 0
      ? crm.leads
          .filter((l) => {
            const q = search.toLowerCase();
            return (
              l.name.toLowerCase().includes(q) ||
              l.company.toLowerCase().includes(q) ||
              l.offer.toLowerCase().includes(q)
            );
          })
          .slice(0, 6)
      : [];

  const openAdd = (asClient = false) => {
    setDefaultIsClient(asClient);
    setShowAdd(true);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow text-white font-bold">
              V
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-none">DealDesk</div>
              <div className="text-[10px] text-gray-500">Sales Command Centre</div>
            </div>
          </div>

          <nav className="flex gap-1 ml-4">
            {TABS.map((t) => {
              const active = tab === t.id;
              const badge = t.id === 'followups' ? followupBadge : 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition ${
                    active
                      ? 'bg-gray-900 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                  {badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        active ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm w-64 focus:border-blue-400 focus:outline-none bg-white"
            />
            {searchMatches.length > 0 && (
              <div className="absolute top-full mt-1 right-0 w-80 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50">
                {searchMatches.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setSelectedId(l.id);
                      setSearch('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex flex-col"
                  >
                    <span className="text-sm font-semibold text-gray-900">{l.company}</span>
                    <span className="text-[11px] text-gray-500">
                      {l.name} · {l.offer}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="relative p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
            <Bell className="w-4 h-4 text-gray-600" />
            {followupBadge > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => openAdd(false)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </header>

      <div>
        {tab === 'dashboard' && (
          <DashboardView
            leads={crm.leads}
            metrics={metrics}
            onSelectLead={(l) => setSelectedId(l.id)}
            onMarkActionDone={crm.markActionDone}
            onOpenAddLead={() => openAdd(false)}
          />
        )}
        {tab === 'pipeline' && (
          <PipelineView
            metrics={metrics}
            onSelectLead={(l) => setSelectedId(l.id)}
            onUpdateStage={crm.updateStage}
          />
        )}
        {tab === 'followups' && (
          <FollowUpsView
            metrics={metrics}
            onSelectLead={(l) => setSelectedId(l.id)}
            onMarkActionDone={crm.markActionDone}
          />
        )}
        {tab === 'clients' && (
          <ClientsView
            metrics={metrics}
            onSelectLead={(l) => setSelectedId(l.id)}
            onOpenAddClient={() => openAdd(true)}
          />
        )}
        {tab === 'revenue' && <RevenueView leads={crm.leads} metrics={metrics} />}
      </div>

      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => setSelectedId(null)}
        onSave={(l: Lead) => crm.upsertLead(l)}
        onDelete={(id) => crm.deleteLead(id)}
        onLogActivity={crm.logActivity}
        onUpdateStage={crm.updateStage}
        onMarkActionDone={crm.markActionDone}
      />

      <AddLeadModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(l) => crm.upsertLead(l)}
        defaultIsClient={defaultIsClient}
      />
    </div>
  );
}

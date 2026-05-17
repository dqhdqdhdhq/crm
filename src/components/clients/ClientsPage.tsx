import { useMemo, useState } from 'react';
import {
  Bookmark, ChevronRight, DollarSign, Globe2, Layers3, List as ListIcon,
  Plus, Search, ShieldAlert, Sparkles, Users,
} from 'lucide-react';
import { useClients } from './useClients';
import { AtlasLens } from './AtlasLens';
import { PortfolioLens } from './PortfolioLens';
import { ListLens } from './ListLens';
import { ClientDetailPanel } from './ClientDetailPanel';
import { Client, ClientStage, STAGE_META, STAGE_ORDER } from '../../types/clients';

type Lens = 'atlas' | 'portfolio' | 'list';
type ClientFilter = ClientStage | 'all' | 'bookmarked' | 'at-risk' | 'renewing' | 'live';

const LENSES: { id: Lens; label: string; icon: typeof Globe2; hint: string }[] = [
  { id: 'atlas',     label: 'Atlas',     icon: Globe2,   hint: 'Where every relationship sits on the map' },
  { id: 'portfolio', label: 'Portfolio', icon: Layers3,  hint: 'Health × MRR · who to save, who to grow' },
  { id: 'list',      label: 'List',      icon: ListIcon, hint: 'Dense, sortable, keyboard-friendly' },
];

interface ClientsPageProps {
  onOpenInDealDesk?: (leadId: string) => void;
}

export function ClientsPage({ onOpenInDealDesk }: ClientsPageProps = {}) {
  const { clients, upsert, remove, toggleBookmark, stats, getLeadById, getProofAssetById } = useClients();
  const [lens, setLens] = useState<Lens>('atlas');
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<ClientFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const priority = useMemo(() => {
    const topRisk = clients
      .filter((c) => (c.risk === 'at-risk' || c.risk === 'critical') && c.mrr > 0)
      .sort((a, b) => (b.mrr * (100 - b.healthScore)) - (a.mrr * (100 - a.healthScore)))[0];

    const renewal = clients
      .filter((c) => {
        if (!c.contractEnd) return false;
        const days = daysUntil(c.contractEnd);
        return days > 0 && days <= 90;
      })
      .sort((a, b) => daysUntil(a.contractEnd!) - daysUntil(b.contractEnd!))[0];

    const hotLead = clients
      .filter((c) => c.stage === 'engaged')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

    return { topRisk, renewal, hotLead };
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (q) {
        const hay = `${c.name} ${c.industry} ${c.location || ''} ${c.primaryContact.name} ${c.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (stageFilter === 'all') return true;
      if (stageFilter === 'bookmarked') return c.bookmarked;
      if (stageFilter === 'at-risk') return c.risk === 'at-risk' || c.risk === 'critical';
      if (stageFilter === 'live') return c.stage === 'active' || c.stage === 'partner';
      if (stageFilter === 'renewing') {
        if (!c.contractEnd) return false;
        const days = (new Date(c.contractEnd).getTime() - Date.now()) / 86400000;
        return days > 0 && days <= 90;
      }
      return c.stage === stageFilter;
    });
  }, [clients, query, stageFilter]);

  const selected = selectedId ? clients.find((c) => c.id === selectedId) ?? null : null;
  const sourceLead = selected?.sourceLeadId ? getLeadById(selected.sourceLeadId) : undefined;
  const keyProofAsset = sourceLead
    ? getProofAssetById(sourceLead.commercial?.assetThatConvincedId ?? sourceLead.commercial?.keyProofAssetId)
    : undefined;

  const onCreate = () => {
    const c: Client = {
      id: crypto.randomUUID(),
      name: 'New Client',
      industry: '',
      stage: 'discovery',
      tier: 'lead',
      risk: 'watch',
      healthScore: 50,
      bookmarked: false,
      primaryContact: { name: '' },
      mrr: 0,
      totalValue: 0,
      tags: [],
      notes: '',
      touches: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    upsert(c);
    setSelectedId(c.id);
  };

  return (
    <div className="min-h-full ios-surface pb-20">
      {/* Sticky toolbar */}
      <header className="sticky top-0 z-30 ios-toolbar">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)]">
              <Users className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold text-gray-900 tracking-tight">Clients</div>
              <div className="text-[11px] text-gray-500 tracking-tight">{LENSES.find((l) => l.id === lens)?.hint}</div>
            </div>
          </div>

          <nav className="ios-segmented ml-3" role="tablist">
            {LENSES.map((l) => {
              const active = lens === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLens(l.id)}
                  className={`ios-segment ${active ? 'ios-segment-active' : ''}`}
                  role="tab"
                  aria-selected={active}
                >
                  <l.icon className="w-[15px] h-[15px]" />
                  {l.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients, industries, tags…"
              className="pl-9 pr-3 py-2 rounded-xl border border-transparent text-[13px] w-72 bg-black/[0.05] focus:bg-white focus:border-blue-300 focus:outline-none placeholder:text-gray-500"
            />
          </div>

          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 pl-2.5 pr-3.5 py-2 rounded-full bg-blue-500 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.4)] hover:bg-blue-600 ios-press"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {/* KPI strip — the "purpose" of visiting this page */}
        <div className="max-w-[1600px] mx-auto px-6 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <KpiChip
            icon={Users}
            label="Total"
            value={stats.total}
            active={stageFilter === 'all'}
            onClick={() => setStageFilter('all')}
          />
          <KpiChip
            icon={DollarSign}
            label="MRR"
            value={`$${(stats.mrr / 1000).toFixed(1)}k`}
            tone="emerald"
            active={false}
            onClick={() => setStageFilter('all')}
          />
          <KpiChip
            icon={Sparkles}
            label="Live"
            value={stats.active}
            tone="indigo"
            active={stageFilter === 'live'}
            onClick={() => setStageFilter('live')}
          />
          <KpiChip
            icon={ShieldAlert}
            label="At risk"
            value={stats.atRisk}
            tone="rose"
            active={stageFilter === 'at-risk'}
            onClick={() => setStageFilter('at-risk')}
          />
          <KpiChip
            icon={ChevronRight}
            label="Renewing 90d"
            value={stats.renewing90}
            tone="amber"
            active={stageFilter === 'renewing'}
            onClick={() => setStageFilter('renewing')}
          />
          <KpiChip
            icon={Bookmark}
            label="Bookmarked"
            value={clients.filter((c) => c.bookmarked).length}
            tone="amber"
            active={stageFilter === 'bookmarked'}
            onClick={() => setStageFilter('bookmarked')}
          />

          <span className="mx-1 h-5 w-px bg-black/10" />

          {STAGE_ORDER.map((s) => {
            const m = STAGE_META[s];
            const count = clients.filter((c) => c.stage === s).length;
            const active = stageFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStageFilter(active ? 'all' : s)}
                className={`stage-chip ios-press ${active ? 'stage-chip-on' : ''}`}
                style={active ? { color: m.hex, boxShadow: `inset 0 0 0 1.5px ${m.hex}55`, background: `${m.hex}12` } : undefined}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.hex }} />
                {m.label}
                <span className="text-[10px] opacity-60 ml-0.5 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Body */}
      <main className="max-w-[1600px] mx-auto px-6 pt-5">
        <PriorityDock
          topRisk={priority.topRisk}
          renewal={priority.renewal}
          hotLead={priority.hotLead}
          onOpen={(client) => setSelectedId(client.id)}
          onFilter={(filter) => setStageFilter(filter)}
        />

        <div className="text-[11px] text-gray-500 mb-3 flex items-center justify-between">
          <span>
            Showing <span className="font-semibold text-gray-700 tabular-nums">{filtered.length}</span>
            {filtered.length !== clients.length && (
              <> of <span className="tabular-nums">{clients.length}</span></>
            )}
          </span>
          {stageFilter !== 'all' && (
            <button onClick={() => setStageFilter('all')} className="text-blue-600 hover:text-blue-700 font-semibold">
              Clear filter
            </button>
          )}
        </div>

        {/* Atlas needs its own height; others size naturally. */}
        {lens === 'atlas' && (
          <div className="h-[calc(100vh-220px)] min-h-[520px]">
            <AtlasLens
              clients={filtered}
              onSelect={(c) => setSelectedId(c.id)}
              selectedId={selectedId}
            />
          </div>
        )}
        {lens === 'portfolio' && (
          <PortfolioLens
            clients={filtered}
            onSelect={(c) => setSelectedId(c.id)}
            selectedId={selectedId}
          />
        )}
        {lens === 'list' && (
          <ListLens
            clients={filtered}
            onSelect={(c) => setSelectedId(c.id)}
            onToggleBookmark={toggleBookmark}
            selectedId={selectedId}
          />
        )}
      </main>

      <ClientDetailPanel
        client={selected}
        onClose={() => setSelectedId(null)}
        onSave={upsert}
        onDelete={(id) => { remove(id); setSelectedId(null); }}
        onToggleBookmark={toggleBookmark}
        sourceLead={sourceLead}
        keyProofAsset={keyProofAsset}
        onOpenInDealDesk={onOpenInDealDesk}
      />
    </div>
  );
}

function PriorityDock({
  topRisk,
  renewal,
  hotLead,
  onOpen,
  onFilter,
}: {
  topRisk?: Client;
  renewal?: Client;
  hotLead?: Client;
  onOpen: (client: Client) => void;
  onFilter: (filter: ClientFilter) => void;
}) {
  const cards = [
    {
      id: 'risk',
      label: 'Protect revenue',
      client: topRisk,
      meta: topRisk ? `$${topRisk.mrr.toLocaleString()}/mo · health ${topRisk.healthScore}` : 'No live accounts are at risk',
      icon: ShieldAlert,
      tone: '#be123c',
      onEmpty: () => onFilter('at-risk'),
    },
    {
      id: 'renewal',
      label: 'Renewal window',
      client: renewal,
      meta: renewal ? `${daysUntil(renewal.contractEnd!)}d left · $${renewal.mrr.toLocaleString()}/mo` : 'No contracts due in 90 days',
      icon: ChevronRight,
      tone: '#b45309',
      onEmpty: () => onFilter('renewing'),
    },
    {
      id: 'lead',
      label: 'Convert next',
      client: hotLead,
      meta: hotLead ? `${hotLead.industry} · ${hotLead.location || 'no location'}` : 'No engaged leads waiting',
      icon: Sparkles,
      tone: '#4338ca',
      onEmpty: () => onFilter('engaged'),
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => (card.client ? onOpen(card.client) : card.onEmpty())}
            className="priority-card ios-card p-3 text-left ios-press group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: `${card.tone}14`, color: card.tone }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    {card.label}
                  </span>
                </div>
                <div className="text-[14px] font-semibold text-gray-900 truncate">
                  {card.client?.name || 'All clear'}
                </div>
                <div className="text-[11px] text-gray-500 truncate mt-0.5">{card.meta}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 mt-1 flex-shrink-0" />
            </div>
          </button>
        );
      })}
    </section>
  );
}

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function KpiChip({
  icon: Icon, label, value, tone = 'slate', active, onClick,
}: {
  icon: any;
  label: string;
  value: number | string;
  tone?: 'slate' | 'emerald' | 'indigo' | 'rose' | 'amber';
  active: boolean;
  onClick: () => void;
}) {
  const map = {
    slate:   { fg: '#475569', bg: 'rgba(100,116,139,0.10)' },
    emerald: { fg: '#047857', bg: 'rgba(16,185,129,0.12)' },
    indigo:  { fg: '#4338ca', bg: 'rgba(99,102,241,0.12)' },
    rose:    { fg: '#be123c', bg: 'rgba(244,63,94,0.12)' },
    amber:   { fg: '#b45309', bg: 'rgba(245,158,11,0.14)' },
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`kpi-chip ios-press ${active ? 'kpi-chip-on' : ''}`}
      style={active ? { boxShadow: `inset 0 0 0 1.5px ${map.fg}66`, background: map.bg, color: map.fg } : undefined}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: map.fg }} />
      <span className="text-[11px] uppercase tracking-wider font-semibold opacity-70">{label}</span>
      <span className="text-[13px] font-bold tabular-nums" style={{ color: map.fg }}>{value}</span>
    </button>
  );
}

import { useMemo, useState } from 'react';
import {
  Sparkles,
  Download,
  TrendingUp,
  Trophy,
  Target,
  Film,
  MapPin,
  Users,
  Compass,
  XCircle,
  GitBranch,
  FileText,
  ChevronRight,
} from 'lucide-react';
import {
  Lead,
  ProofAsset,
  AwarenessSource,
  AWARENESS_SOURCE_LABELS,
  MarketTier,
  MARKET_TIER_LABELS,
  LeadQuality,
  LEAD_QUALITY_LABELS,
  BuyerType,
  BUYER_TYPE_LABELS,
  LOST_REASON_LABELS,
  STAGE_ORDER,
  COMMERCIAL_STAGE_LABELS,
  STAGE_COLORS,
  LeadStage,
} from '../../types/crm';
import { formatCurrency, formatCurrencyShort } from '../../hooks/useCRM';

interface Props {
  leads: Lead[];
  proofAssets: ProofAsset[];
  onSelectLead: (lead: Lead) => void;
}

type StageFilter = 'all' | 'won' | 'lost' | 'open';

export function IntelligenceView({ leads, proofAssets, onSelectLead }: Props) {
  // ── Filters ──────────────────────────────────────────────────────────────
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [source, setSource] = useState<AwarenessSource | ''>('');
  const [country, setCountry] = useState<string>('');
  const [marketTier, setMarketTier] = useState<MarketTier | ''>('');
  const [industry, setIndustry] = useState<string>('');
  const [proofAssetId, setProofAssetId] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [quality, setQuality] = useState<LeadQuality | ''>('');
  const [buyerType, setBuyerType] = useState<BuyerType | ''>('');
  const [valueMin, setValueMin] = useState<number>(0);
  const [valueMax, setValueMax] = useState<number>(0);

  const commercialLeads = useMemo(
    () => leads.filter((l) => l.dealType === 'ai-commercial' && l.commercial),
    [leads],
  );

  const countries = useMemo(() => {
    const set = new Set<string>();
    commercialLeads.forEach((l) => l.country && set.add(l.country));
    return Array.from(set).sort();
  }, [commercialLeads]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    commercialLeads.forEach((l) => l.industry && set.add(l.industry));
    return Array.from(set).sort();
  }, [commercialLeads]);

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);
    return commercialLeads.filter((l) => {
      const c = l.commercial!;
      if (from && new Date(c.firstAwarenessDate) < from) return false;
      if (to && new Date(c.firstAwarenessDate) > to) return false;
      if (source && c.firstAwarenessSource !== source) return false;
      if (country && l.country !== country) return false;
      if (marketTier && c.marketTier !== marketTier) return false;
      if (industry && l.industry !== industry) return false;
      if (
        proofAssetId &&
        c.firstAssetSeenId !== proofAssetId &&
        c.assetShownId !== proofAssetId &&
        c.assetThatConvincedId !== proofAssetId &&
        c.keyProofAssetId !== proofAssetId
      )
        return false;
      if (quality && c.leadQuality !== quality) return false;
      if (buyerType && c.buyerType !== buyerType) return false;
      if (stageFilter === 'won' && l.stage !== 'won') return false;
      if (stageFilter === 'lost' && l.stage !== 'lost') return false;
      if (stageFilter === 'open' && (l.stage === 'won' || l.stage === 'lost')) return false;
      if (valueMin > 0 && l.oneTimeValue < valueMin) return false;
      if (valueMax > 0 && l.oneTimeValue > valueMax) return false;
      return true;
    });
  }, [
    commercialLeads,
    dateFrom,
    dateTo,
    source,
    country,
    marketTier,
    industry,
    proofAssetId,
    quality,
    buyerType,
    stageFilter,
    valueMin,
    valueMax,
  ]);

  // ── KPIs (this month) ────────────────────────────────────────────────────
  const startOfMonth = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const kpis = useMemo(() => {
    const newThisMonth = filtered.filter(
      (l) => new Date(l.commercial!.firstAwarenessDate) >= startOfMonth,
    ).length;
    const qualifiedThisMonth = filtered.filter(
      (l) =>
        l.commercial?.leadQuality === 'A' || l.commercial?.leadQuality === 'B',
    ).length;
    const proposalsThisMonth = filtered.filter((l) =>
      l.activities.some(
        (a) => a.type === 'proposal-sent' && new Date(a.createdAt) >= startOfMonth,
      ),
    ).length;
    const wonLeads = filtered.filter((l) => l.stage === 'won');
    const wonThisMonth = wonLeads.filter((l) =>
      l.commercial?.closeDate && new Date(l.commercial.closeDate) >= startOfMonth,
    );
    const revenueThisMonth = wonThisMonth.reduce(
      (sum, l) => sum + (l.commercial?.finalAcceptedPrice ?? l.oneTimeValue),
      0,
    );
    const totalWonRevenue = wonLeads.reduce(
      (sum, l) => sum + (l.commercial?.finalAcceptedPrice ?? l.oneTimeValue),
      0,
    );
    const avgProjectValue = wonLeads.length > 0 ? totalWonRevenue / wonLeads.length : 0;
    const closedCount = filtered.filter((l) => l.stage === 'won' || l.stage === 'lost').length;
    const winRate = closedCount > 0 ? (wonLeads.length / closedCount) * 100 : 0;

    const closeTimes = wonLeads
      .map((l) => {
        const close = l.commercial?.closeDate ? new Date(l.commercial.closeDate) : null;
        const first = l.commercial ? new Date(l.commercial.firstAwarenessDate) : null;
        return close && first ? (close.getTime() - first.getTime()) / 86400000 : null;
      })
      .filter((v): v is number => v !== null);
    const avgDaysToClose = closeTimes.length
      ? closeTimes.reduce((s, v) => s + v, 0) / closeTimes.length
      : 0;

    const touches = wonLeads.map((l) => l.activities.length);
    const avgTouches = touches.length
      ? touches.reduce((s, v) => s + v, 0) / touches.length
      : 0;

    return {
      newThisMonth,
      qualifiedThisMonth,
      proposalsThisMonth,
      wonThisMonth: wonThisMonth.length,
      revenueThisMonth,
      avgProjectValue,
      winRate,
      avgDaysToClose,
      avgTouches,
      totalWon: wonLeads.length,
      totalWonRevenue,
    };
  }, [filtered, startOfMonth]);

  // ── Group by helpers ─────────────────────────────────────────────────────
  const bySource = useMemo(() => groupAnalytics(filtered, (l) => l.commercial!.firstAwarenessSource), [filtered]);
  const byIndustry = useMemo(() => groupAnalytics(filtered, (l) => l.industry || 'Unknown'), [filtered]);
  const byMarketTier = useMemo(() => groupAnalytics(filtered, (l) => l.commercial?.marketTier || 'unknown'), [filtered]);
  const byCountry = useMemo(() => groupAnalytics(filtered, (l) => l.country || 'Unknown'), [filtered]);

  const byAsset = useMemo(() => {
    const map: Record<string, { leads: Lead[]; qualified: number; wonRevenue: number }> = {};
    for (const a of proofAssets) {
      map[a.id] = { leads: [], qualified: 0, wonRevenue: 0 };
    }
    for (const l of filtered) {
      const c = l.commercial!;
      const assetIds = new Set([
        c.firstAssetSeenId,
        c.assetShownId,
        c.assetThatConvincedId,
        c.keyProofAssetId,
      ].filter(Boolean) as string[]);
      assetIds.forEach((id) => {
        if (!map[id]) map[id] = { leads: [], qualified: 0, wonRevenue: 0 };
        map[id].leads.push(l);
        if (c.leadQuality === 'A' || c.leadQuality === 'B') map[id].qualified += 1;
        if (l.stage === 'won') {
          map[id].wonRevenue += c.finalAcceptedPrice ?? l.oneTimeValue;
        }
      });
    }
    return map;
  }, [filtered, proofAssets]);

  const lostReasons = useMemo(() => {
    const reasonCount: Record<string, number> = {};
    filtered
      .filter((l) => l.stage === 'lost' && l.commercial?.lostReason)
      .forEach((l) => {
        const r = l.commercial!.lostReason!;
        reasonCount[r] = (reasonCount[r] || 0) + 1;
      });
    return reasonCount;
  }, [filtered]);

  const referrers = useMemo(() => {
    const map: Record<string, { leads: number; wonRevenue: number; companies: Set<string> }> = {};
    filtered.forEach((l) => {
      const c = l.commercial!;
      const name = c.referral?.referrerName;
      if (!name) return;
      if (!map[name]) map[name] = { leads: 0, wonRevenue: 0, companies: new Set() };
      map[name].leads += 1;
      map[name].companies.add(l.company);
      if (l.stage === 'won') {
        map[name].wonRevenue += c.finalAcceptedPrice ?? l.oneTimeValue;
      }
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.wonRevenue - a.wonRevenue || b.leads - a.leads);
  }, [filtered]);

  const networking = useMemo(() => {
    type Row = { key: string; city: string; venue: string; leads: number; qualified: number; wonRevenue: number };
    const map = new Map<string, Row>();
    filtered
      .filter((l) => l.commercial?.firstAwarenessSource === 'in-person-networking')
      .forEach((l) => {
        const c = l.commercial!;
        const city = c.networking?.city || 'Unknown city';
        const venue = c.networking?.venue || '—';
        const key = `${city}::${venue}`;
        if (!map.has(key)) map.set(key, { key, city, venue, leads: 0, qualified: 0, wonRevenue: 0 });
        const row = map.get(key)!;
        row.leads += 1;
        if (c.leadQuality === 'A' || c.leadQuality === 'B') row.qualified += 1;
        if (l.stage === 'won') row.wonRevenue += c.finalAcceptedPrice ?? l.oneTimeValue;
      });
    return Array.from(map.values()).sort((a, b) => b.wonRevenue - a.wonRevenue || b.leads - a.leads);
  }, [filtered]);

  // Count leads that have *ever reached* each stage (uses stageHistory + current stage)
  const stageFunnel = useMemo(() => {
    const everReached: Record<LeadStage, number> = STAGE_ORDER.reduce(
      (acc, s) => ({ ...acc, [s]: 0 }),
      {} as Record<LeadStage, number>,
    );
    filtered.forEach((l) => {
      const reached = new Set<LeadStage>();
      reached.add(l.stage);
      l.stageHistory?.forEach((h) => {
        reached.add(h.to);
        if (h.from) reached.add(h.from);
      });
      reached.forEach((s) => (everReached[s] += 1));
    });
    return everReached;
  }, [filtered]);

  // ── CSV export ───────────────────────────────────────────────────────────
  const exportCsv = () => {
    const rows = [
      [
        'Name',
        'Company',
        'Country',
        'Industry',
        'Stage',
        'Awareness Source',
        'Awareness Date',
        'Lead Quality',
        'Market Tier',
        'Buyer Type',
        'Budget Signal',
        'First Asset Seen',
        'Asset Shown',
        'Asset That Convinced',
        'Initial Quote',
        'Final Price',
        'Deposit Paid',
        'Close Date',
        'Days First→Close',
        'Touches',
        'Lost Reason',
      ],
      ...filtered.map((l) => {
        const c = l.commercial!;
        const first = new Date(c.firstAwarenessDate);
        const close = c.closeDate ? new Date(c.closeDate) : null;
        const daysToClose = close
          ? Math.round((close.getTime() - first.getTime()) / 86400000)
          : '';
        return [
          l.name,
          l.company,
          l.country ?? '',
          l.industry ?? '',
          l.stage,
          AWARENESS_SOURCE_LABELS[c.firstAwarenessSource],
          first.toISOString().slice(0, 10),
          c.leadQuality ?? '',
          c.marketTier ? MARKET_TIER_LABELS[c.marketTier] : '',
          c.buyerType ? BUYER_TYPE_LABELS[c.buyerType] : '',
          c.budgetSignal ?? '',
          assetName(proofAssets, c.firstAssetSeenId),
          assetName(proofAssets, c.assetShownId),
          assetName(proofAssets, c.assetThatConvincedId),
          c.initialQuotedPrice ?? '',
          c.finalAcceptedPrice ?? l.oneTimeValue,
          c.depositPaid ? 'Yes' : 'No',
          close ? close.toISOString().slice(0, 10) : '',
          String(daysToClose),
          String(l.activities.length),
          c.lostReason ? LOST_REASON_LABELS[c.lostReason] : '',
        ];
      }),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `venlyn-ai-commercials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthlyReview = useMemo(() => buildMonthlyReview(filtered, proofAssets, startOfMonth), [
    filtered,
    proofAssets,
    startOfMonth,
  ]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-7">
      {/* ── Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="ios-subtitle">Venlyn — premium AI commercial production</div>
          <h1 className="ios-large-title mt-1 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-500" />
            Commercial Intelligence
          </h1>
          <p className="ios-subtitle mt-1.5">
            Where the leads come from, what closes them, where the money lives.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 pl-3 pr-4 py-2.5 rounded-full bg-gray-900 text-white text-[13px] font-semibold shadow ios-press"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="ios-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-indigo-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
            Filters
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
          <FilterField label="From">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={filterInputClass} />
          </FilterField>
          <FilterField label="To">
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={filterInputClass} />
          </FilterField>
          <FilterField label="Source">
            <select value={source} onChange={(e) => setSource(e.target.value as AwarenessSource | '')} className={filterInputClass}>
              <option value="">All</option>
              {(Object.keys(AWARENESS_SOURCE_LABELS) as AwarenessSource[]).map((s) => (
                <option key={s} value={s}>
                  {AWARENESS_SOURCE_LABELS[s]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Country">
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={filterInputClass}>
              <option value="">All</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Market tier">
            <select value={marketTier} onChange={(e) => setMarketTier(e.target.value as MarketTier | '')} className={filterInputClass}>
              <option value="">All</option>
              {(Object.keys(MARKET_TIER_LABELS) as MarketTier[]).map((m) => (
                <option key={m} value={m}>
                  {MARKET_TIER_LABELS[m]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Industry">
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={filterInputClass}>
              <option value="">All</option>
              {industries.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Proof asset">
            <select value={proofAssetId} onChange={(e) => setProofAssetId(e.target.value)} className={filterInputClass}>
              <option value="">All</option>
              {proofAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Stage">
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as StageFilter)} className={filterInputClass}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </FilterField>
          <FilterField label="Quality">
            <select value={quality} onChange={(e) => setQuality(e.target.value as LeadQuality | '')} className={filterInputClass}>
              <option value="">All</option>
              {(['A', 'B', 'C'] as LeadQuality[]).map((q) => (
                <option key={q} value={q}>
                  {LEAD_QUALITY_LABELS[q]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Buyer type">
            <select value={buyerType} onChange={(e) => setBuyerType(e.target.value as BuyerType | '')} className={filterInputClass}>
              <option value="">All</option>
              {(Object.keys(BUYER_TYPE_LABELS) as BuyerType[]).map((b) => (
                <option key={b} value={b}>
                  {BUYER_TYPE_LABELS[b]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Min € value">
            <input type="number" value={valueMin || ''} onChange={(e) => setValueMin(Number(e.target.value))} className={filterInputClass} />
          </FilterField>
          <FilterField label="Max € value">
            <input type="number" value={valueMax || ''} onChange={(e) => setValueMax(Number(e.target.value))} className={filterInputClass} />
          </FilterField>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Kpi icon={Sparkles} label="New leads (mo)" value={String(kpis.newThisMonth)} tint="indigo" />
        <Kpi icon={Target} label="Qualified (mo)" value={String(kpis.qualifiedThisMonth)} tint="violet" />
        <Kpi icon={FileText} label="Proposals (mo)" value={String(kpis.proposalsThisMonth)} tint="amber" />
        <Kpi icon={Trophy} label="Won (mo)" value={String(kpis.wonThisMonth)} tint="emerald" />
        <Kpi icon={TrendingUp} label="Revenue (mo)" value={formatCurrencyShort(kpis.revenueThisMonth)} tint="rose" />
        <Kpi icon={Trophy} label="Avg deal" value={formatCurrencyShort(kpis.avgProjectValue)} tint="emerald" />
        <Kpi icon={GitBranch} label="Win rate" value={`${Math.round(kpis.winRate)}%`} tint="blue" />
        <Kpi icon={Compass} label="Avg days to close" value={`${Math.round(kpis.avgDaysToClose)}d`} tint="indigo" />
        <Kpi icon={Users} label="Avg touches" value={String(Math.round(kpis.avgTouches))} tint="violet" />
        <Kpi icon={Trophy} label="Total won revenue" value={formatCurrencyShort(kpis.totalWonRevenue)} tint="emerald" />
      </div>

      {/* ── Source analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Leads & Win Rate by First Awareness Source" icon={Compass}>
          <SourceTable rows={bySource} />
        </Panel>
        <Panel title="Revenue & Avg Deal by Source" icon={TrendingUp}>
          <SourceRevenueTable rows={bySource} />
        </Panel>
      </div>

      {/* ── Asset performance ── */}
      <Panel title="Proof Asset Performance" icon={Film}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <th className="py-2 text-left">Asset</th>
              <th className="py-2 text-left">Vertical</th>
              <th className="py-2 text-right">Leads</th>
              <th className="py-2 text-right">Qualified</th>
              <th className="py-2 text-right">Won revenue</th>
            </tr>
          </thead>
          <tbody>
            {proofAssets
              .map((a) => ({ asset: a, perf: byAsset[a.id] ?? { leads: [], qualified: 0, wonRevenue: 0 } }))
              .sort((a, b) => b.perf.wonRevenue - a.perf.wonRevenue || b.perf.leads.length - a.perf.leads.length)
              .map(({ asset, perf }) => (
                <tr key={asset.id} className="border-b border-gray-50 last:border-0 text-[13px]">
                  <td className="py-2.5 font-semibold text-gray-900">{asset.name}</td>
                  <td className="py-2.5 text-gray-600">{asset.vertical}</td>
                  <td className="py-2.5 text-right tabular-nums">{perf.leads.length}</td>
                  <td className="py-2.5 text-right tabular-nums">{perf.qualified}</td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                    {perf.wonRevenue ? formatCurrencyShort(perf.wonRevenue) : '—'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Panel>

      {/* ── Industry & geography ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Leads & Revenue by Industry / Vertical" icon={Target}>
          <GroupBars rows={byIndustry} />
        </Panel>
        <Panel title="Win Rate by Market Tier" icon={MapPin}>
          <WinRateBars
            rows={byMarketTier}
            labelFor={(k) => (k in MARKET_TIER_LABELS ? MARKET_TIER_LABELS[k as MarketTier] : k)}
          />
        </Panel>
      </div>

      <Panel title="Win Rate & Revenue by Country" icon={MapPin}>
        <WinRateBars rows={byCountry} labelFor={(k) => k} />
      </Panel>

      {/* ── In-person networking ── */}
      <Panel title="In-person Networking Performance" icon={MapPin}>
        {networking.length === 0 ? (
          <Empty>No in-person leads logged for current filters.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="py-2 text-left">City</th>
                <th className="py-2 text-left">Venue</th>
                <th className="py-2 text-right">Leads</th>
                <th className="py-2 text-right">Qualified</th>
                <th className="py-2 text-right">Won revenue</th>
              </tr>
            </thead>
            <tbody>
              {networking.map((r) => (
                <tr key={r.key} className="border-b border-gray-50 last:border-0 text-[13px]">
                  <td className="py-2.5 font-semibold text-gray-900">{r.city}</td>
                  <td className="py-2.5 text-gray-600">{r.venue}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.leads}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.qualified}</td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                    {r.wonRevenue ? formatCurrencyShort(r.wonRevenue) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* ── Referrers ── */}
      <Panel title="Best Referrers" icon={Users}>
        {referrers.length === 0 ? (
          <Empty>No referrer data yet.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="py-2 text-left">Referrer</th>
                <th className="py-2 text-right">Leads sent</th>
                <th className="py-2 text-right">Won revenue</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((r) => (
                <tr key={r.name} className="border-b border-gray-50 last:border-0 text-[13px]">
                  <td className="py-2.5 font-semibold text-gray-900">{r.name}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.leads}</td>
                  <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                    {r.wonRevenue ? formatCurrencyShort(r.wonRevenue) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* ── Stage funnel ── */}
      <Panel title="Commercial Stage Funnel — drop-off" icon={GitBranch}>
        <StageFunnel
          counts={stageFunnel}
          onPick={(s) => {
            const target = filtered.find((l) => l.stage === s);
            if (target) onSelectLead(target);
          }}
        />
      </Panel>

      {/* ── Lost reasons & list ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Lost Reasons" icon={XCircle}>
          {Object.keys(lostReasons).length === 0 ? (
            <Empty>No lost deals in current filter.</Empty>
          ) : (
            <div className="space-y-2">
              {Object.entries(lostReasons)
                .sort((a, b) => b[1] - a[1])
                .map(([r, n]) => {
                  const max = Math.max(...Object.values(lostReasons), 1);
                  return (
                    <div key={r}>
                      <div className="flex items-center justify-between text-[12px] mb-1">
                        <span className="font-semibold text-gray-800">
                          {LOST_REASON_LABELS[r as keyof typeof LOST_REASON_LABELS]}
                        </span>
                        <span className="text-gray-500 tabular-nums">{n}</span>
                      </div>
                      <div className="h-2.5 bg-rose-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-400 rounded-full"
                          style={{ width: `${(n / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Panel>

        <Panel title="Lead List" icon={Sparkles}>
          <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
            {filtered.length === 0 && <Empty>No leads match.</Empty>}
            {filtered
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.commercial!.firstAwarenessDate).getTime() -
                  new Date(a.commercial!.firstAwarenessDate).getTime(),
              )
              .map((l) => {
                const sc = STAGE_COLORS[l.stage];
                return (
                  <button
                    key={l.id}
                    onClick={() => onSelectLead(l)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold text-gray-900 truncate tracking-tight">
                        {l.company}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {AWARENESS_SOURCE_LABELS[l.commercial!.firstAwarenessSource]} ·{' '}
                        {l.country ?? '—'} · {l.industry ?? '—'}
                      </div>
                    </div>
                    <span className={`ios-pill ${sc.bg} ${sc.text}`}>
                      {COMMERCIAL_STAGE_LABELS[l.stage]}
                    </span>
                    <div className="text-[12.5px] font-semibold text-emerald-700 tabular-nums w-16 text-right">
                      {formatCurrencyShort(
                        l.commercial?.finalAcceptedPrice ?? l.oneTimeValue,
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                );
              })}
          </div>
        </Panel>
      </div>

      {/* ── Monthly review ── */}
      <Panel title="Monthly Review Summary" icon={TrendingUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
          <ReviewStat label="New leads" value={String(monthlyReview.newLeads)} />
          <ReviewStat label="Wins" value={String(monthlyReview.wins)} />
          <ReviewStat label="Losses" value={String(monthlyReview.losses)} />
          <ReviewStat label="Avg close time" value={`${monthlyReview.avgCloseDays}d`} />
          <ReviewStat label="Best source" value={monthlyReview.bestSource} />
          <ReviewStat label="Best asset" value={monthlyReview.bestAsset} />
          <ReviewStat label="Best vertical" value={monthlyReview.bestVertical} />
          <ReviewStat label="Top lost reason" value={monthlyReview.topLostReason} />
        </div>
        {monthlyReview.pattern && (
          <p className="mt-4 text-[12.5px] text-gray-600 italic">
            Pattern: {monthlyReview.pattern}
          </p>
        )}
      </Panel>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers / small components
// ────────────────────────────────────────────────────────────────────────────

const filterInputClass =
  'w-full px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-[12.5px] focus:border-indigo-300 focus:outline-none';

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

interface KpiProps {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  tint: 'emerald' | 'blue' | 'indigo' | 'violet' | 'amber' | 'rose';
}

const KPI_TINTS: Record<KpiProps['tint'], { bg: string; fg: string }> = {
  emerald: { bg: 'bg-emerald-500/12', fg: 'text-emerald-600' },
  blue: { bg: 'bg-blue-500/12', fg: 'text-blue-600' },
  indigo: { bg: 'bg-indigo-500/12', fg: 'text-indigo-600' },
  violet: { bg: 'bg-violet-500/12', fg: 'text-violet-600' },
  amber: { bg: 'bg-amber-500/15', fg: 'text-amber-600' },
  rose: { bg: 'bg-rose-500/12', fg: 'text-rose-600' },
};

function Kpi({ icon: Icon, label, value, tint }: KpiProps) {
  const t = KPI_TINTS[tint];
  return (
    <div className="ios-card p-4">
      <div className={`w-9 h-9 rounded-2xl ${t.bg} ${t.fg} flex items-center justify-center mb-3`}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <div className="ios-section-title text-[10.5px] mb-1">{label}</div>
      <div className="text-[20px] font-semibold text-gray-900 tracking-tight tabular-nums">
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof TrendingUp;
  children: React.ReactNode;
}) {
  return (
    <section className="ios-card overflow-hidden">
      <header className="px-5 pt-4 pb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h2 className="text-[15px] font-semibold text-gray-900 tracking-tight">{title}</h2>
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-gray-400 italic py-3">{children}</p>;
}

function ReviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-[15px] font-semibold text-gray-900 mt-1 tracking-tight">{value}</div>
    </div>
  );
}

interface GroupRow {
  key: string;
  total: number;
  qualified: number;
  won: number;
  lost: number;
  wonRevenue: number;
  totalValue: number;
  avgDaysToClose: number;
}

function groupAnalytics(
  leads: Lead[],
  keyFn: (l: Lead) => string,
): Record<string, GroupRow> {
  const out: Record<string, GroupRow> = {};
  leads.forEach((l) => {
    const c = l.commercial!;
    const k = keyFn(l);
    if (!out[k]) {
      out[k] = {
        key: k,
        total: 0,
        qualified: 0,
        won: 0,
        lost: 0,
        wonRevenue: 0,
        totalValue: 0,
        avgDaysToClose: 0,
      };
    }
    const row = out[k];
    row.total += 1;
    if (c.leadQuality === 'A' || c.leadQuality === 'B') row.qualified += 1;
    if (l.stage === 'won') {
      row.won += 1;
      row.wonRevenue += c.finalAcceptedPrice ?? l.oneTimeValue;
      const close = c.closeDate ? new Date(c.closeDate) : null;
      const first = new Date(c.firstAwarenessDate);
      if (close) {
        const d = (close.getTime() - first.getTime()) / 86400000;
        row.avgDaysToClose = (row.avgDaysToClose * (row.won - 1) + d) / row.won;
      }
    }
    if (l.stage === 'lost') row.lost += 1;
    row.totalValue += l.oneTimeValue;
  });
  return out;
}

function SourceTable({ rows }: { rows: Record<string, GroupRow> }) {
  const entries = Object.values(rows).sort((a, b) => b.total - a.total);
  if (entries.length === 0) return <Empty>No data.</Empty>;
  const max = Math.max(...entries.map((e) => e.total), 1);
  return (
    <div className="space-y-2">
      {entries.map((r) => {
        const closed = r.won + r.lost;
        const winRate = closed > 0 ? Math.round((r.won / closed) * 100) : 0;
        const label = AWARENESS_SOURCE_LABELS[r.key as AwarenessSource] ?? r.key;
        return (
          <div key={r.key}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-semibold text-gray-800">{label}</span>
              <span className="text-gray-500 tabular-nums">
                {r.total} leads · {winRate}% win
              </span>
            </div>
            <div className="h-2.5 bg-indigo-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(r.total / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SourceRevenueTable({ rows }: { rows: Record<string, GroupRow> }) {
  const entries = Object.values(rows).sort((a, b) => b.wonRevenue - a.wonRevenue);
  if (entries.length === 0) return <Empty>No data.</Empty>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
          <th className="py-2 text-left">Source</th>
          <th className="py-2 text-right">Won rev</th>
          <th className="py-2 text-right">Avg deal</th>
          <th className="py-2 text-right">Avg days</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((r) => {
          const label = AWARENESS_SOURCE_LABELS[r.key as AwarenessSource] ?? r.key;
          const avgDeal = r.won > 0 ? r.wonRevenue / r.won : 0;
          return (
            <tr key={r.key} className="border-b border-gray-50 last:border-0 text-[13px]">
              <td className="py-2.5 font-semibold text-gray-900">{label}</td>
              <td className="py-2.5 text-right tabular-nums font-semibold text-emerald-700">
                {r.wonRevenue ? formatCurrencyShort(r.wonRevenue) : '—'}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {avgDeal ? formatCurrencyShort(avgDeal) : '—'}
              </td>
              <td className="py-2.5 text-right tabular-nums">
                {r.avgDaysToClose ? `${Math.round(r.avgDaysToClose)}d` : '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GroupBars({ rows }: { rows: Record<string, GroupRow> }) {
  const entries = Object.values(rows).sort((a, b) => b.wonRevenue - a.wonRevenue || b.total - a.total);
  if (entries.length === 0) return <Empty>No data.</Empty>;
  const maxRev = Math.max(...entries.map((e) => Math.max(e.wonRevenue, e.totalValue)), 1);
  return (
    <div className="space-y-2">
      {entries.map((r) => (
        <div key={r.key}>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="font-semibold text-gray-800">{r.key}</span>
            <span className="text-gray-500 tabular-nums">
              {r.total} leads · {formatCurrencyShort(r.wonRevenue)} won
            </span>
          </div>
          <div className="h-2.5 bg-violet-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full"
              style={{ width: `${(r.wonRevenue / maxRev) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function WinRateBars({
  rows,
  labelFor,
}: {
  rows: Record<string, GroupRow>;
  labelFor: (k: string) => string;
}) {
  const entries = Object.values(rows).filter((r) => r.won + r.lost > 0);
  if (entries.length === 0) return <Empty>No closed deals yet.</Empty>;
  return (
    <div className="space-y-2">
      {entries.map((r) => {
        const closed = r.won + r.lost;
        const rate = closed > 0 ? (r.won / closed) * 100 : 0;
        return (
          <div key={r.key}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-semibold text-gray-800">{labelFor(r.key)}</span>
              <span className="text-gray-500 tabular-nums">
                {Math.round(rate)}% · {r.won}/{closed}
              </span>
            </div>
            <div className="h-2.5 bg-emerald-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StageFunnel({
  counts,
  onPick,
}: {
  counts: Record<LeadStage, number>;
  onPick: (s: LeadStage) => void;
}) {
  const stages: LeadStage[] = [
    'new',
    'qualifying',
    'contacted',
    'interested',
    'meeting-booked',
    'demo-done',
    'proposal-sent',
    'negotiation',
    'verbal-yes',
    'won',
  ];
  const max = Math.max(...stages.map((s) => counts[s]), 1);
  return (
    <div className="space-y-1.5">
      {stages.map((s) => {
        const sc = STAGE_COLORS[s];
        const n = counts[s] || 0;
        return (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className={`font-semibold ${sc.text}`}>{COMMERCIAL_STAGE_LABELS[s]}</span>
              <span className="text-gray-500 tabular-nums">{n}</span>
            </div>
            <div className="h-6 bg-black/[0.04] rounded-lg overflow-hidden relative">
              <div
                className={`h-full ${sc.bar} rounded-lg transition-all group-hover:opacity-90`}
                style={{ width: `${Math.max((n / max) * 100, n > 0 ? 6 : 0)}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function assetName(assets: ProofAsset[], id?: string) {
  if (!id) return '';
  return assets.find((a) => a.id === id)?.name ?? '';
}

interface MonthlyReview {
  newLeads: number;
  wins: number;
  losses: number;
  avgCloseDays: number;
  bestSource: string;
  bestAsset: string;
  bestVertical: string;
  topLostReason: string;
  pattern: string;
}

function buildMonthlyReview(
  leads: Lead[],
  proofAssets: ProofAsset[],
  startOfMonth: Date,
): MonthlyReview {
  const monthLeads = leads.filter(
    (l) => l.commercial && new Date(l.commercial.firstAwarenessDate) >= startOfMonth,
  );
  const monthWins = leads.filter(
    (l) =>
      l.stage === 'won' &&
      l.commercial?.closeDate &&
      new Date(l.commercial.closeDate) >= startOfMonth,
  );
  const monthLosses = leads.filter((l) => {
    if (l.stage !== 'lost') return false;
    const lostStage = l.stageHistory?.find((h) => h.to === 'lost');
    if (!lostStage) return false;
    return new Date(lostStage.enteredAt) >= startOfMonth;
  });

  const closeDays = monthWins
    .map((l) => {
      const close = l.commercial!.closeDate ? new Date(l.commercial!.closeDate) : null;
      const first = new Date(l.commercial!.firstAwarenessDate);
      return close ? (close.getTime() - first.getTime()) / 86400000 : null;
    })
    .filter((v): v is number => v !== null);
  const avgCloseDays = closeDays.length
    ? Math.round(closeDays.reduce((s, v) => s + v, 0) / closeDays.length)
    : 0;

  const sourceWins: Record<string, number> = {};
  monthWins.forEach((l) => {
    const s = l.commercial!.firstAwarenessSource;
    sourceWins[s] = (sourceWins[s] || 0) + (l.commercial?.finalAcceptedPrice ?? l.oneTimeValue);
  });
  const bestSourceEntry = Object.entries(sourceWins).sort((a, b) => b[1] - a[1])[0];
  const bestSource = bestSourceEntry
    ? AWARENESS_SOURCE_LABELS[bestSourceEntry[0] as AwarenessSource]
    : '—';

  const assetWins: Record<string, number> = {};
  monthWins.forEach((l) => {
    const id = l.commercial?.assetThatConvincedId || l.commercial?.keyProofAssetId;
    if (!id) return;
    assetWins[id] = (assetWins[id] || 0) + (l.commercial?.finalAcceptedPrice ?? l.oneTimeValue);
  });
  const bestAssetEntry = Object.entries(assetWins).sort((a, b) => b[1] - a[1])[0];
  const bestAsset = bestAssetEntry
    ? proofAssets.find((a) => a.id === bestAssetEntry[0])?.name ?? '—'
    : '—';

  const verticalWins: Record<string, number> = {};
  monthWins.forEach((l) => {
    const v = l.industry || 'Unknown';
    verticalWins[v] = (verticalWins[v] || 0) + (l.commercial?.finalAcceptedPrice ?? l.oneTimeValue);
  });
  const bestVerticalEntry = Object.entries(verticalWins).sort((a, b) => b[1] - a[1])[0];
  const bestVertical = bestVerticalEntry ? bestVerticalEntry[0] : '—';

  const lostReasonCount: Record<string, number> = {};
  monthLosses.forEach((l) => {
    const r = l.commercial?.lostReason;
    if (!r) return;
    lostReasonCount[r] = (lostReasonCount[r] || 0) + 1;
  });
  const topLostEntry = Object.entries(lostReasonCount).sort((a, b) => b[1] - a[1])[0];
  const topLostReason = topLostEntry
    ? LOST_REASON_LABELS[topLostEntry[0] as keyof typeof LOST_REASON_LABELS]
    : '—';

  // simple pattern heuristic
  let pattern = '';
  if (monthWins.length > 0 && monthLosses.length > monthWins.length) {
    pattern = `More deals lost than won this month — top reason: ${topLostReason}. Consider tightening qualification on ${bestSource} leads.`;
  } else if (monthWins.length > 0 && bestSourceEntry) {
    pattern = `${bestSource} is the strongest revenue channel this month — ${bestAsset} is doing the heavy lifting.`;
  } else if (monthLeads.length > 0) {
    pattern = `${monthLeads.length} new leads, ${monthWins.length} closed. Push proposals on warm conversations.`;
  }

  return {
    newLeads: monthLeads.length,
    wins: monthWins.length,
    losses: monthLosses.length,
    avgCloseDays,
    bestSource,
    bestAsset,
    bestVertical,
    topLostReason,
    pattern,
  };
}

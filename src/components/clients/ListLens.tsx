import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Bookmark, MapPin } from 'lucide-react';
import { Client, RISK_META, STAGE_META, TIER_META } from '../../types/clients';

interface Props {
  clients: Client[];
  onSelect: (c: Client) => void;
  onToggleBookmark: (id: string) => void;
  selectedId: string | null;
}

type SortKey = 'name' | 'stage' | 'tier' | 'mrr' | 'health' | 'updatedAt';

export function ListLens({ clients, onSelect, onToggleBookmark, selectedId }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('mrr');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return clients.slice().sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      switch (sortKey) {
        case 'name':  av = a.name.toLowerCase(); bv = b.name.toLowerCase(); break;
        case 'stage': av = a.stage; bv = b.stage; break;
        case 'tier':  av = a.tier;  bv = b.tier; break;
        case 'mrr':   av = a.mrr;   bv = b.mrr; break;
        case 'health':av = a.healthScore; bv = b.healthScore; break;
        case 'updatedAt': av = new Date(a.updatedAt).getTime(); bv = new Date(b.updatedAt).getTime(); break;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [clients, sortKey, sortDir]);

  const setSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir(k === 'name' || k === 'stage' || k === 'tier' ? 'asc' : 'desc'); }
  };

  return (
    <div className="ios-card-elev overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-black/[0.025] text-[11px] uppercase tracking-wider text-gray-500">
              <Th label="Client"    onClick={() => setSort('name')}    active={sortKey === 'name'}    dir={sortDir} />
              <Th label="Stage"     onClick={() => setSort('stage')}   active={sortKey === 'stage'}   dir={sortDir} />
              <Th label="Tier"      onClick={() => setSort('tier')}    active={sortKey === 'tier'}    dir={sortDir} />
              <Th label="MRR"       onClick={() => setSort('mrr')}     active={sortKey === 'mrr'}     dir={sortDir} align="right" />
              <Th label="Health"    onClick={() => setSort('health')}  active={sortKey === 'health'}  dir={sortDir} />
              <Th label="Updated"   onClick={() => setSort('updatedAt')} active={sortKey === 'updatedAt'} dir={sortDir} />
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const m = STAGE_META[c.stage];
              const t = TIER_META[c.tier];
              const r = RISK_META[c.risk];
              const isSel = selectedId === c.id;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className={`group cursor-pointer border-t border-black/[0.04] hover:bg-blue-50/40 transition-colors ${
                    isSel ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} stageHex={m.hex} />
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                          {c.name}
                          {c.bookmarked && <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                          {c.industry}
                          {c.location && (
                            <>
                              <span className="opacity-40">·</span>
                              <MapPin className="w-2.5 h-2.5" />
                              {c.location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 ios-pill" style={{ color: m.hex, background: `${m.hex}1a` }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.hex }} />
                      {m.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`ios-pill ${t.chip}`}>{t.label}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                    {c.mrr > 0 ? `$${c.mrr.toLocaleString()}` : <span className="text-gray-300 font-normal">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <HealthBar score={c.healthScore} riskChip={r.chip} riskLabel={r.label} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-[12px] whitespace-nowrap">
                    {relativeTime(new Date(c.updatedAt))}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleBookmark(c.id); }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ios-press ${
                        c.bookmarked ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50/60'
                      }`}
                      title={c.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <Bookmark className={`w-4 h-4 ${c.bookmarked ? 'fill-amber-400' : ''}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-[13px]">
                  No clients match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  label, onClick, active, dir, align = 'left',
}: { label: string; onClick: () => void; active: boolean; dir: 'asc' | 'desc'; align?: 'left' | 'right' }) {
  return (
    <th className={`px-4 py-2.5 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button onClick={onClick} className={`inline-flex items-center gap-1 hover:text-gray-800 ${active ? 'text-gray-900' : ''}`}>
        {label}
        {active
          ? (dir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)
          : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </button>
    </th>
  );
}

function Avatar({ name, stageHex }: { name: string; stageHex: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(15,23,42,0.18)] flex-shrink-0"
      style={{ background: `linear-gradient(135deg, ${stageHex}, ${stageHex}cc)` }}
    >
      {initials}
    </div>
  );
}

function HealthBar({ score, riskChip, riskLabel }: { score: number; riskChip: string; riskLabel: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background:
              score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : score >= 35 ? '#f97316' : '#ef4444',
          }}
        />
      </div>
      <span className="text-[11px] tabular-nums font-semibold text-gray-700 w-7 text-right">{score}</span>
      <span className={`ios-pill ${riskChip} hidden lg:inline-flex`}>{riskLabel}</span>
    </div>
  );
}

function relativeTime(d: Date) {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

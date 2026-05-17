import { useMemo, useState } from 'react';
import { Client, STAGE_META } from '../../types/clients';

interface Props {
  clients: Client[];
  onSelect: (c: Client) => void;
  selectedId: string | null;
}

// Quadrant matrix: Health (y) × MRR (x) with bubble size = totalValue.
// Quadrants: Champions / At Risk / Hidden Gems / Dormant.
export function PortfolioLens({ clients, onSelect, selectedId }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Only plot anyone with a meaningful relationship — pure cold leads belong on the Atlas, not here.
  const visible = clients.filter(
    (c) => c.stage !== 'discovery' && (c.mrr > 0 || c.totalValue > 0 || c.stage === 'engaged'),
  );

  // For project-shape clients (AI Commercial, mrr = 0), use a 12-month amortised value
  // as the x-axis weight — otherwise they'd cluster at the far-left "dormant" edge
  // despite carrying real revenue.
  const effectiveMrr = (c: Client) =>
    c.dealType === 'ai-commercial' && c.mrr === 0 ? c.totalValue / 12 : c.mrr;

  const maxMrr = Math.max(1000, ...visible.map(effectiveMrr));
  const maxValue = Math.max(1, ...visible.map((c) => c.totalValue));

  const counts = useMemo(() => {
    let champs = 0, atRisk = 0, gems = 0, dormant = 0;
    visible.forEach((c) => {
      const highMrr = effectiveMrr(c) >= maxMrr * 0.35;
      const highHealth = c.healthScore >= 60;
      if (highMrr && highHealth) champs++;
      else if (highMrr && !highHealth) atRisk++;
      else if (!highMrr && highHealth) gems++;
      else dormant++;
    });
    return { champs, atRisk, gems, dormant };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, maxMrr]);

  const project = (c: Client) => {
    const x = Math.min(100, (effectiveMrr(c) / maxMrr) * 100);
    const y = 100 - Math.min(100, c.healthScore);
    return { x, y };
  };
  const radiusFor = (c: Client) => {
    const r = 0.6 + Math.sqrt(c.totalValue / maxValue) * 2.4;
    return Math.max(0.9, Math.min(3.0, r));
  };

  return (
    <div className="space-y-4">
      {/* Quadrant tally */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuadStat label="Champions"   help="High MRR · Healthy"   count={counts.champs}  tone="emerald" />
        <QuadStat label="At Risk"     help="High MRR · Unhealthy" count={counts.atRisk}  tone="rose" />
        <QuadStat label="Hidden Gems" help="Low MRR · Healthy"    count={counts.gems}    tone="blue" />
        <QuadStat label="Dormant"     help="Low MRR · Unhealthy"  count={counts.dormant} tone="slate" />
      </div>

      {/* Plot */}
      <div className="ios-card-elev p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[15px] font-semibold text-gray-900 tracking-tight">Portfolio matrix</div>
            <div className="text-[12px] text-gray-500">Health × MRR · bubble size = lifetime value</div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500">
            {Object.entries(STAGE_META)
              .filter(([s]) => s !== 'discovery' && s !== 'churned')
              .map(([s, m]) => (
                <span key={s} className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: m.hex }} />
                  {m.label}
                </span>
              ))}
          </div>
        </div>

        <div className="portfolio-grid relative aspect-[16/10] rounded-2xl overflow-hidden">
          {/* Quadrant labels */}
          <span className="quad-label" style={{ top: 12,    left: 12 }}>Hidden Gems</span>
          <span className="quad-label" style={{ top: 12,    right: 12 }}>Champions</span>
          <span className="quad-label" style={{ bottom: 12, left: 12 }}>Dormant</span>
          <span className="quad-label" style={{ bottom: 12, right: 12 }}>At Risk</span>

          {/* Axis dividers */}
          <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-black/10" />
          <div className="absolute inset-y-0 left-[35%] border-l border-dashed border-black/10" />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {visible.map((c) => {
              const p = project(c);
              const r = radiusFor(c);
              const m = STAGE_META[c.stage];
              const isSel = selectedId === c.id || hoverId === c.id;
              return (
                <g
                  key={c.id}
                  onMouseEnter={() => setHoverId(c.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelect(c)}
                  className="cursor-pointer"
                  style={{ transition: 'transform 220ms cubic-bezier(0.32,0.72,0,1)' }}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r * (isSel ? 1.35 : 1)}
                    fill={m.hex}
                    fillOpacity={0.18}
                    stroke={m.hex}
                    strokeWidth={isSel ? 0.5 : 0.3}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={Math.max(0.6, r * 0.45)}
                    fill={m.hex}
                  />
                </g>
              );
            })}
          </svg>

          {/* Axis labels */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[10px] uppercase tracking-widest text-gray-400 font-semibold pl-6">
            Health →
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
            MRR →
          </div>

          {/* Hover tooltip */}
          {hoverId && (() => {
            const c = visible.find((x) => x.id === hoverId);
            if (!c) return null;
            const p = project(c);
            const m = STAGE_META[c.stage];
            return (
              <div
                className="absolute pointer-events-none ios-card-elev px-3 py-2 z-20"
                style={{
                  left: `clamp(8px, calc(${p.x}% + 12px), calc(100% - 220px))`,
                  top: `clamp(8px, calc(${p.y}% - 8px), calc(100% - 70px))`,
                  minWidth: 200,
                }}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: m.hex }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.hex }} />
                  {m.label}
                </div>
                <div className="text-[13px] font-semibold text-gray-900 leading-tight">{c.name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {c.mrr > 0 ? `$${c.mrr.toLocaleString()}/mo · ` : ''}Health {c.healthScore}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function QuadStat({
  label, help, count, tone,
}: { label: string; help: string; count: number; tone: 'emerald' | 'rose' | 'blue' | 'slate' }) {
  const toneMap = {
    emerald: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
    rose:    { dot: 'bg-rose-500',    text: 'text-rose-700' },
    blue:    { dot: 'bg-blue-500',    text: 'text-blue-700' },
    slate:   { dot: 'bg-slate-400',   text: 'text-slate-600' },
  }[tone];
  return (
    <div className="ios-card p-3 flex items-center justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${toneMap.dot}`} />
          <span className={`text-[12px] font-semibold ${toneMap.text}`}>{label}</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5 truncate">{help}</div>
      </div>
      <div className="text-[22px] font-semibold text-gray-900 tabular-nums tracking-tight">{count}</div>
    </div>
  );
}

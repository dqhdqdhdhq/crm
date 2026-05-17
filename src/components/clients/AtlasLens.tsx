import { useMemo, useRef, useState } from 'react';
import { Compass, Layers, MapPin, Route, Sparkles, X } from 'lucide-react';
import { Client, ClientStage, STAGE_META, STAGE_ORDER } from '../../types/clients';

interface Props {
  clients: Client[];
  onSelect: (c: Client) => void;
  selectedId: string | null;
}

const STAGE_TOGGLES: ClientStage[] = STAGE_ORDER;

export function AtlasLens({ clients, onSelect, selectedId }: Props) {
  const [enabled, setEnabled] = useState<Record<ClientStage, boolean>>(() =>
    STAGE_ORDER.reduce((acc, s) => ({ ...acc, [s]: true }), {} as Record<ClientStage, boolean>),
  );
  const [routeMode, setRouteMode] = useState(false);
  const [routeIds, setRouteIds] = useState<string[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const visible = clients.filter((c) => c.lat != null && c.lng != null && enabled[c.stage]);

  const bbox = useMemo(() => {
    if (visible.length === 0) {
      return { minLat: 33.7, maxLat: 34.3, minLng: -118.7, maxLng: -118.0 };
    }
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    visible.forEach((c) => {
      minLat = Math.min(minLat, c.lat!);
      maxLat = Math.max(maxLat, c.lat!);
      minLng = Math.min(minLng, c.lng!);
      maxLng = Math.max(maxLng, c.lng!);
    });
    const padLat = Math.max(0.05, (maxLat - minLat) * 0.18);
    const padLng = Math.max(0.05, (maxLng - minLng) * 0.18);
    return { minLat: minLat - padLat, maxLat: maxLat + padLat, minLng: minLng - padLng, maxLng: maxLng + padLng };
  }, [visible]);

  // Project lat/lng -> [0,1] within the bbox (no real map projection — small region so flat is fine).
  const project = (lat: number, lng: number) => {
    const x = (lng - bbox.minLng) / (bbox.maxLng - bbox.minLng);
    const y = 1 - (lat - bbox.minLat) / (bbox.maxLat - bbox.minLat);
    return { x: x * 100, y: y * 100 };
  };

  // Build a nearest-neighbor route through the selected pins.
  const orderedRoute = useMemo(() => {
    if (routeIds.length < 2) return routeIds;
    const lookup = new Map(visible.map((c) => [c.id, c]));
    const stops = routeIds.map((id) => lookup.get(id)!).filter(Boolean);
    if (stops.length < 2) return routeIds;
    const ordered = [stops[0]];
    const remaining = stops.slice(1);
    while (remaining.length) {
      const last = ordered[ordered.length - 1];
      let bestIdx = 0;
      let bestD = Infinity;
      remaining.forEach((s, i) => {
        const d = Math.hypot((s.lat! - last.lat!), (s.lng! - last.lng!));
        if (d < bestD) { bestD = d; bestIdx = i; }
      });
      ordered.push(remaining.splice(bestIdx, 1)[0]);
    }
    return ordered.map((s) => s.id);
  }, [routeIds, visible]);

  const togglePinForRoute = (id: string) => {
    setRouteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handlePinClick = (c: Client) => {
    if (routeMode) togglePinForRoute(c.id);
    else onSelect(c);
  };

  return (
    <div ref={wrapRef} className="atlas-canvas relative overflow-hidden rounded-[28px] border border-white/60">
      {/* Soft topographic backdrop */}
      <div className="atlas-bg absolute inset-0" />
      <div className="atlas-grid absolute inset-0 opacity-[0.35]" />

      {/* Floating filter rail */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-20 ios-card-elev p-2 flex items-center gap-1 max-w-[calc(100%-32px)] overflow-x-auto scrollbar-hide">
        <Layers className="w-4 h-4 text-gray-500 ml-1 flex-shrink-0" />
        {STAGE_TOGGLES.map((s) => {
          const m = STAGE_META[s];
          const on = enabled[s];
          const count = clients.filter((c) => c.stage === s && c.lat != null).length;
          return (
            <button
              key={s}
              onClick={() => setEnabled((e) => ({ ...e, [s]: !e[s] }))}
              className={`atlas-chip ${on ? 'atlas-chip-on' : ''} ios-press`}
              style={on ? { boxShadow: `inset 0 0 0 1.5px ${m.hex}40`, color: m.hex } : undefined}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: m.hex }} />
              {m.label}
              <span className="text-[10px] opacity-60 ml-0.5">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Route toolbar */}
      <div className="absolute top-16 sm:top-4 right-4 z-20 ios-card-elev p-1.5 flex items-center gap-1">
        <button
          onClick={() => { setRouteMode((v) => !v); if (routeMode) setRouteIds([]); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold ios-press ${
            routeMode ? 'bg-blue-500 text-white' : 'bg-black/[0.04] text-gray-700 hover:bg-black/[0.07]'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          {routeMode ? 'Routing' : 'Plan route'}
        </button>
        {routeMode && routeIds.length > 0 && (
          <button
            onClick={() => setRouteIds([])}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] ios-press"
            title="Clear stops"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-center px-6 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-md flex items-center justify-center ring-1 ring-black/5">
            <Compass className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-[14px] font-semibold text-gray-900">No pins to plot</div>
          <div className="text-[12px] text-gray-500 max-w-[280px]">
            Turn on more stages above, or add a client with a location to see them on the atlas.
          </div>
        </div>
      )}

      {/* SVG plot */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Route polyline */}
        {orderedRoute.length > 1 && (
          <polyline
            points={orderedRoute
              .map((id) => {
                const c = visible.find((v) => v.id === id);
                if (!c) return '';
                const p = project(c.lat!, c.lng!);
                return `${p.x},${p.y}`;
              })
              .filter(Boolean)
              .join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.45"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1.2 0.9"
            vectorEffect="non-scaling-stroke"
            style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.35))' }}
          />
        )}
      </svg>

      {/* Pins overlay (HTML so we get proper hover/animation) */}
      <div className="absolute inset-0 z-10">
        {visible.map((c) => {
          const p = project(c.lat!, c.lng!);
          const m = STAGE_META[c.stage];
          const isSel = selectedId === c.id;
          const isHover = hoverId === c.id;
          const inRoute = routeIds.includes(c.id);
          const routeIdx = orderedRoute.indexOf(c.id);
          return (
            <div
              key={c.id}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <button
                onMouseEnter={() => setHoverId(c.id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={() => handlePinClick(c)}
                className="atlas-pin group"
                aria-label={c.name}
              >
                <span
                  className={`atlas-pin-shape ${isSel || isHover || inRoute ? 'atlas-pin-shape-on' : ''}`}
                  style={{ background: m.hex }}
                >
                  {inRoute && routeIdx >= 0 ? (
                    <span className="text-[9px] font-bold text-white">{routeIdx + 1}</span>
                  ) : (
                    <MapPin className="w-3 h-3 text-white" strokeWidth={2.5} />
                  )}
                </span>
                <span className="atlas-pin-stem" style={{ background: m.hex }} />
                <span className="atlas-pin-pulse" style={{ background: m.hex }} />
              </button>

              {(isHover || isSel) && (
                <div className="atlas-pin-card ios-card-elev animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: m.hex }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: m.hex }}>
                      {m.label}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-900 leading-tight mt-1 mb-0.5">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {c.industry}{c.location ? ` · ${c.location}` : ''}
                  </div>
                  {c.mrr > 0 && (
                    <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                      ${c.mrr.toLocaleString()}/mo · Health {c.healthScore}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom legend / hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 ios-card px-3 py-1.5 flex items-center gap-2 text-[11px] text-gray-600">
        <Sparkles className="w-3 h-3 text-blue-500" />
        <span>
          {routeMode
            ? `Tap pins to add stops · ${routeIds.length} selected`
            : `${visible.length} of ${clients.length} mapped · tap a pin to open`}
        </span>
      </div>
    </div>
  );
}

import { useCallback, useMemo } from 'react';
import { Client, ClientStage, ClientTier, riskFromHealth } from '../../types/clients';
import { Lead, ProofAsset } from '../../types/crm';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { seedClients } from './clientsSeed';
import { seedLeads, seedProofAssets } from '../../hooks/useCRM';
import { ClientOverlay, OverlayClient, isWonClient, projectLeadToClient } from './leadProjection';

/**
 * Single source of truth for all Clients across every lens.
 *
 * The visible list is a union of three sources, merged by id:
 *   1. Standalone clients (legacy seed + ad-hoc "New Client" creations) —
 *      persisted in the `clients` localStorage key.
 *   2. Won DealDesk leads (`crm-leads`), projected via `projectLeadToClient`.
 *      These appear automatically the moment a Lead transitions to `won`.
 *   3. A small overlay (`clients-overlay`) keyed by leadId, holding edits
 *      the user makes on a lead-derived client from the Clients page
 *      (bookmark / health / tier / tags / notes / extra touches). The deal
 *      record stays the source of truth for the commercial timeline; the
 *      overlay only carries relationship-management tweaks.
 */
export function useClients() {
  const initialClients = useMemo(() => makeInitialClients(), []);
  const [standaloneClients, setStandaloneClients] = useLocalStorage<Client[]>('clients', initialClients);
  // Share the same fallback seeds as useCRM so a fresh visitor landing on
  // /clients first still sees the won-lead projections (Vinarija Stari Most, etc.).
  // Once either hook writes, useLocalStorage broadcasts in-process and the two stay in sync.
  const seededLeads = useMemo(() => seedLeads(), []);
  const seededAssets = useMemo(() => seedProofAssets(), []);
  const [leads] = useLocalStorage<Lead[]>('crm-leads', seededLeads);
  const [overlay, setOverlay] = useLocalStorage<ClientOverlay>('clients-overlay', {});
  const [proofAssets] = useLocalStorage<ProofAsset[]>('crm-proof-assets', seededAssets);

  // Lead-derived clients, computed each render. Cheap; the lead list is small.
  const leadDerived = useMemo<Client[]>(() => {
    return leads
      .filter(isWonClient)
      .map((l) => projectLeadToClient(l, overlay[l.id]));
  }, [leads, overlay]);

  const leadIds = useMemo(() => new Set(leadDerived.map((c) => c.id)), [leadDerived]);

  // Standalone clients win on collision (manual override beats projection),
  // but in practice ids should never collide unless the user already had a
  // standalone Client with the same id as a lead.
  const clients = useMemo<Client[]>(() => {
    const standaloneIds = new Set(standaloneClients.map((c) => c.id));
    const fromLeads = leadDerived.filter((c) => !standaloneIds.has(c.id));
    return [...standaloneClients, ...fromLeads];
  }, [standaloneClients, leadDerived]);

  // Cross-source setter — used by callers that build a new array (e.g. drag-reorder).
  // Splits writes back to whichever bucket each item belongs to.
  const setClients = useCallback(
    (value: Client[] | ((prev: Client[]) => Client[])) => {
      const next = typeof value === 'function' ? (value as (prev: Client[]) => Client[])(clients) : value;
      const nextStandalone = next.filter((c) => !leadIds.has(c.id));
      setStandaloneClients(nextStandalone);
    },
    [clients, leadIds, setStandaloneClients],
  );

  const upsert = useCallback(
    (c: Client) => {
      const sanitised: Client = {
        ...c,
        risk: riskFromHealth(c.healthScore),
        updatedAt: new Date(),
      };

      if (leadIds.has(c.id)) {
        // Lead-derived: write editable fields into the overlay rather than mutating the deal record.
        setOverlay((prev) => ({
          ...prev,
          [c.id]: {
            ...(prev[c.id] || {}),
            bookmarked: sanitised.bookmarked,
            healthScore: sanitised.healthScore,
            tier: sanitised.tier,
            tags: sanitised.tags,
            notes: sanitised.notes,
            // Preserve any explicit extraTouches already present.
            extraTouches: prev[c.id]?.extraTouches,
          },
        }));
        return;
      }

      setStandaloneClients((prev) => {
        const i = prev.findIndex((p) => p.id === sanitised.id);
        if (i === -1) return [...prev, sanitised];
        const copy = prev.slice();
        copy[i] = sanitised;
        return copy;
      });
    },
    [leadIds, setOverlay, setStandaloneClients],
  );

  const remove = useCallback(
    (id: string) => {
      if (leadIds.has(id)) {
        // Lead-derived: can't delete the relationship from here; clear the overlay so
        // the projection resets to defaults. The lead itself stays untouched.
        setOverlay((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return;
      }
      setStandaloneClients((prev) => prev.filter((c) => c.id !== id));
    },
    [leadIds, setOverlay, setStandaloneClients],
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      if (leadIds.has(id)) {
        setOverlay((prev) => ({
          ...prev,
          [id]: { ...(prev[id] || {}), bookmarked: !(prev[id]?.bookmarked ?? false) },
        }));
        return;
      }
      setStandaloneClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, bookmarked: !c.bookmarked, updatedAt: new Date() } : c)),
      );
    },
    [leadIds, setOverlay, setStandaloneClients],
  );

  const getLeadById = useCallback(
    (id: string): Lead | undefined => leads.find((l) => l.id === id),
    [leads],
  );

  const getProofAssetById = useCallback(
    (id: string | undefined): ProofAsset | undefined =>
      id ? proofAssets.find((a) => a.id === id) : undefined,
    [proofAssets],
  );

  const stats = useMemo(() => {
    const total = clients.length;
    const mrr = clients.reduce((s, c) => s + (c.mrr || 0), 0);
    const active = clients.filter((c) => c.stage === 'active' || c.stage === 'partner').length;
    const atRisk = clients.filter((c) => c.risk === 'at-risk' || c.risk === 'critical').length;
    const renewing90 = clients.filter((c) => {
      if (!c.contractEnd) return false;
      const days = (new Date(c.contractEnd).getTime() - Date.now()) / 86400000;
      return days > 0 && days <= 90;
    }).length;
    return { total, mrr, active, atRisk, renewing90 };
  }, [clients]);

  return {
    clients,
    setClients,
    upsert,
    remove,
    toggleBookmark,
    stats,
    getLeadById,
    getProofAssetById,
  };
}

// Re-export for backwards-compatible callers (e.g. legacy overlay seeding).
export type { OverlayClient };

function makeInitialClients(): Client[] {
  const legacy = readLegacyClients();
  if (legacy.length === 0) return seedClients;

  const seen = new Set<string>();
  const merged: Client[] = [];

  [...seedClients, ...legacy].forEach((client) => {
    const key = `${client.name.trim().toLowerCase()}|${(client.location || '').trim().toLowerCase()}`;
    if (!client.name.trim() || seen.has(key)) return;
    seen.add(key);
    merged.push(client);
  });

  return merged;
}

function readLegacyClients(): Client[] {
  if (typeof window === 'undefined') return [];

  const clients: Client[] = [];
  const prospects = readArray('prospects');
  const partners = readArray('partners');

  prospects.forEach((p) => {
    const name = text(p.shopBusinessName) || 'Unnamed Prospect';
    const stage: ClientStage =
      p.answered === 'interested' ? 'engaged' : p.answered === 'yes' ? 'outreach' : 'discovery';
    const healthScore = p.answered === 'interested' ? 68 : p.answered === 'yes' ? 56 : 38;

    clients.push({
      id: `legacy-prospect-${text(p.id) || crypto.randomUUID()}`,
      name,
      industry: text(p.industry) || 'Local Business',
      location: text(p.location),
      lat: numberOrUndefined(p.latitude),
      lng: numberOrUndefined(p.longitude),
      mapsUrl: text(p.googleMapsUrl),
      reviewCount: numberOrUndefined(p.reviews),
      stage,
      tier: 'lead',
      risk: riskFromHealth(healthScore),
      healthScore,
      bookmarked: false,
      primaryContact: {
        name,
        email: text(p.email),
      },
      mrr: 0,
      totalValue: 0,
      tags: [stage === 'engaged' ? 'Interested' : stage === 'outreach' ? 'Contacted' : 'Prospect'],
      notes: text(p.notes),
      touches: text(p.notes)
        ? [{ id: `legacy-touch-${text(p.id) || crypto.randomUUID()}`, type: 'note', body: text(p.notes), at: dateOrNow(p.updatedAt) }]
        : [],
      createdAt: dateOrNow(p.createdAt),
      updatedAt: dateOrNow(p.updatedAt),
      lastContactAt: p.answered === 'no' ? undefined : dateOrNow(p.updatedAt),
    });
  });

  partners.forEach((p) => {
    const healthScore = numberOrUndefined(p.healthScore) ?? 80;
    const stage = partnerStage(text(p.status));
    const monthlyRecurring = numberOrUndefined(p.monthlyRecurring) ?? Math.round((numberOrUndefined(p.revenue) ?? 0) / 12);
    const tier = partnerTier(text(p.tier));

    clients.push({
      id: `legacy-partner-${text(p.id) || crypto.randomUUID()}`,
      name: text(p.name) || 'Unnamed Partner',
      industry: text(p.industry) || 'Partner',
      website: text(p.website),
      location: Array.isArray(p.territory) ? p.territory.join(', ') : '',
      stage,
      tier,
      risk: riskFromHealth(healthScore),
      healthScore,
      bookmarked: Boolean(p.isBookmarked),
      primaryContact: {
        name: text(p.primaryContact?.name) || 'Primary contact',
        role: text(p.primaryContact?.role),
        email: text(p.primaryContact?.email),
        phone: text(p.primaryContact?.phone),
        linkedin: text(p.primaryContact?.linkedin),
      },
      mrr: monthlyRecurring,
      totalValue: numberOrUndefined(p.totalValue) ?? numberOrUndefined(p.revenue) ?? 0,
      contractStart: dateOrUndefined(p.contractStart),
      contractEnd: dateOrUndefined(p.contractEnd),
      tags: [
        text(p.partnershipType),
        ...(Array.isArray(p.tags) ? p.tags.map(text).filter(Boolean) : []),
      ].filter(Boolean),
      notes: text(p.notes) || text(p.description),
      touches: Array.isArray(p.activityLog)
        ? p.activityLog.slice(0, 8).map((a: any, i: number) => ({
            id: `legacy-activity-${text(p.id) || 'partner'}-${text(a.id) || i}`,
            type: mapActivityType(text(a.type)),
            body: text(a.description) || 'Activity',
            at: dateOrNow(a.date),
          }))
        : [],
      createdAt: dateOrNow(p.joinDate ?? p.createdAt),
      updatedAt: dateOrNow(p.lastModified ?? p.lastActivity ?? p.updatedAt),
      lastContactAt: dateOrUndefined(p.lastContact),
    });
  });

  return clients;
}

function readArray(key: string): any[] {
  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberOrUndefined(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function dateOrUndefined(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateOrNow(value: unknown): Date {
  return dateOrUndefined(value) ?? new Date();
}

function partnerStage(status: string): ClientStage {
  if (status === 'terminated') return 'churned';
  if (status === 'inactive' || status === 'paused') return 'dormant';
  if (status === 'pending' || status === 'trial') return 'engaged';
  return 'partner';
}

function partnerTier(tier: string): ClientTier {
  if (tier === 'platinum' || tier === 'gold' || tier === 'silver' || tier === 'bronze') return tier;
  return 'gold';
}

function mapActivityType(type: string): Client['touches'][number]['type'] {
  if (type === 'call' || type === 'email' || type === 'meeting') return type;
  return 'note';
}

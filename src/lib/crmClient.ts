import type { Lead } from '../types/crm';

const BASE_URL =
  (import.meta.env.VITE_CRM_API_URL as string | undefined) ?? 'http://localhost:5174';

// Mirror of the date-revival heuristic in useLocalStorage: any key ending in
// "date"/"At" or containing "date" is parsed back into a Date instance so
// downstream consumers keep getting Date objects (current behaviour).
function reviveDates(key: string, value: unknown): unknown {
  const looksLikeDate =
    /date$/i.test(key) || /At$/.test(key) || key.toLowerCase().includes('date');
  if (looksLikeDate && typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  return text ? (JSON.parse(text, reviveDates) as T) : (undefined as T);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`crmClient ${init?.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
  }
  return parseJson<T>(res);
}

export const crmClient = {
  listLeads: () => request<Lead[]>('/leads'),
  getLead: (id: string) => request<Lead>(`/leads/${encodeURIComponent(id)}`),
  upsertLead: (lead: Lead) =>
    request<Lead>('/leads', { method: 'POST', body: JSON.stringify(lead) }),
  patchLead: (id: string, patch: Partial<Lead>) =>
    request<Lead>(`/leads/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),
  deleteLead: (id: string) =>
    request<void>(`/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

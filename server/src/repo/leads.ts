import { db } from '../db.ts';
import { Lead, type LeadPatch } from '../schemas/lead.ts';

type Row = {
  id: string;
  data: string;
};

function rowToLead(row: Row): Lead {
  return Lead.parse(JSON.parse(row.data));
}

const selectAllStmt = db.prepare('SELECT id, data FROM leads ORDER BY datetime(updated_at) DESC');
const selectByIdStmt = db.prepare('SELECT id, data FROM leads WHERE id = ?');
const deleteByIdStmt = db.prepare('DELETE FROM leads WHERE id = ?');

const upsertStmt = db.prepare(`
  INSERT INTO leads (id, name, company, email, phone, stage, temperature, is_client, created_at, updated_at, data)
  VALUES (@id, @name, @company, @email, @phone, @stage, @temperature, @is_client, @created_at, @updated_at, @data)
  ON CONFLICT(id) DO UPDATE SET
    name        = excluded.name,
    company     = excluded.company,
    email       = excluded.email,
    phone       = excluded.phone,
    stage       = excluded.stage,
    temperature = excluded.temperature,
    is_client   = excluded.is_client,
    created_at  = excluded.created_at,
    updated_at  = excluded.updated_at,
    data        = excluded.data
`);

function leadToRow(lead: Lead) {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    stage: lead.stage,
    temperature: lead.temperature,
    is_client: lead.isClient ? 1 : 0,
    created_at: lead.createdAt.toISOString(),
    updated_at: lead.updatedAt.toISOString(),
    data: JSON.stringify(lead),
  };
}

export const leadsRepo = {
  list(): Lead[] {
    return (selectAllStmt.all() as Row[]).map(rowToLead);
  },

  get(id: string): Lead | null {
    const row = selectByIdStmt.get(id) as Row | undefined;
    return row ? rowToLead(row) : null;
  },

  upsert(lead: Lead): Lead {
    upsertStmt.run(leadToRow(lead));
    return lead;
  },

  patch(id: string, patch: LeadPatch): Lead | null {
    const current = this.get(id);
    if (!current) return null;
    const merged = Lead.parse({
      ...current,
      ...patch,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: patch.updatedAt ?? new Date(),
    });
    upsertStmt.run(leadToRow(merged));
    return merged;
  },

  delete(id: string): boolean {
    const result = deleteByIdStmt.run(id);
    return result.changes > 0;
  },

  bulkUpsert(leads: Lead[]) {
    const tx = db.transaction((items: Lead[]) => {
      for (const lead of items) upsertStmt.run(leadToRow(lead));
    });
    tx(leads);
  },
};

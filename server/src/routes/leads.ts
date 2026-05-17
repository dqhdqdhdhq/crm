import { Hono } from 'hono';
import { leadsRepo } from '../repo/leads.ts';
import { Lead, LeadPatch } from '../schemas/lead.ts';

export const leadsRoute = new Hono();

leadsRoute.get('/', (c) => {
  return c.json(leadsRepo.list());
});

leadsRoute.get('/:id', (c) => {
  const lead = leadsRepo.get(c.req.param('id'));
  if (!lead) return c.json({ error: 'not_found' }, 404);
  return c.json(lead);
});

leadsRoute.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = Lead.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);
  }
  const lead = leadsRepo.upsert(parsed.data);
  return c.json(lead, 201);
});

leadsRoute.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  const parsed = LeadPatch.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);
  }
  const lead = leadsRepo.patch(id, parsed.data);
  if (!lead) return c.json({ error: 'not_found' }, 404);
  return c.json(lead);
});

leadsRoute.delete('/:id', (c) => {
  const ok = leadsRepo.delete(c.req.param('id'));
  if (!ok) return c.json({ error: 'not_found' }, 404);
  return c.body(null, 204);
});

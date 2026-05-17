import { z } from 'zod';
import { leadsRepo } from '../../repo/leads.ts';
import { LeadStage } from '../../schemas/lead.ts';
import { registerTool } from './registry.ts';

const Params = z.object({
  query: z.string().optional(),
  stage: LeadStage.optional(),
  staleDays: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

type Params = z.infer<typeof Params>;

type Hit = {
  id: string;
  name: string;
  company: string;
  stage: z.infer<typeof LeadStage>;
  lastContactedAt: string | null;
  ownerNotesPreview: string;
};

const jsonSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Case-insensitive substring match against name, email, phone, or company.',
    },
    stage: {
      type: 'string',
      enum: LeadStage.options,
      description: 'Exact pipeline stage to filter by.',
    },
    staleDays: {
      type: 'integer',
      minimum: 1,
      description:
        'Return only leads whose most recent activity is older than this many days. Leads with no activity use createdAt.',
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 50,
      description: 'Max rows to return. Defaults to 20.',
    },
  },
  additionalProperties: false,
};

function lastActivityDate(activities: { createdAt: Date }[], fallback: Date): Date {
  if (activities.length === 0) return fallback;
  let max = activities[0].createdAt.getTime();
  for (const a of activities) {
    const t = a.createdAt.getTime();
    if (t > max) max = t;
  }
  return new Date(max);
}

async function handler(rawArgs: unknown): Promise<Hit[]> {
  const args: Params = Params.parse(rawArgs);
  const limit = args.limit ?? 20;
  const q = args.query?.trim().toLowerCase();
  const now = Date.now();

  const all = leadsRepo.list();

  const hits: Hit[] = [];
  for (const lead of all) {
    if (args.stage && lead.stage !== args.stage) continue;

    if (q) {
      const haystack = [lead.name, lead.company, lead.email ?? '', lead.phone ?? '']
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) continue;
    }

    const lastActivity = lead.activities.length
      ? lastActivityDate(lead.activities, lead.createdAt)
      : null;

    if (args.staleDays !== undefined) {
      const reference = lastActivity ?? lead.createdAt;
      const ageDays = (now - reference.getTime()) / 86_400_000;
      if (ageDays < args.staleDays) continue;
    }

    hits.push({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      stage: lead.stage,
      lastContactedAt: lastActivity ? lastActivity.toISOString() : null,
      ownerNotesPreview: (lead.notes ?? '').slice(0, 120),
    });

    if (hits.length >= limit) break;
  }

  return hits;
}

registerTool({
  name: 'search_leads',
  description:
    'Search the CRM for leads. Supports a free-text query across name/email/phone/company, an exact stage filter, and a staleness filter in days. Returns at most `limit` rows (default 20).',
  paramsSchema: Params,
  jsonSchema,
  permission: 'read',
  handler: handler as (args: unknown) => Promise<unknown>,
});

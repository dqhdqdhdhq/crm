import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { leadsRoute } from './routes/leads.ts';
import { aiRoute } from './routes/ai.ts';
import { DB_PATH } from './db.ts';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin ?? '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
);

app.get('/health', (c) => c.json({ ok: true }));

app.route('/leads', leadsRoute);
app.route('/ai', aiRoute);

const port = Number(process.env.PORT ?? 5174);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[crm-server] listening on http://localhost:${info.port}`);
  console.log(`[crm-server] sqlite: ${DB_PATH}`);
});

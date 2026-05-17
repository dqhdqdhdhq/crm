import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DB_PATH =
  process.env.CRM_DB_PATH ?? resolve(__dirname, '..', 'data', 'crm.db');

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    company      TEXT NOT NULL,
    email        TEXT,
    phone        TEXT,
    stage        TEXT NOT NULL,
    temperature  TEXT NOT NULL,
    is_client    INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL,
    data         TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_leads_stage      ON leads(stage);
  CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON leads(updated_at);
  CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);
  CREATE INDEX IF NOT EXISTS idx_leads_phone      ON leads(phone);
`);

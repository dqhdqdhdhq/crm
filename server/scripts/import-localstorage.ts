#!/usr/bin/env tsx
/**
 * One-shot importer for migrating from localStorage to SQLite.
 *
 * Usage:
 *   npm --prefix server run import -- ./dump.json
 *   pbpaste | npm --prefix server run import -- --stdin
 *
 * Input formats accepted:
 *   1. A raw array of Lead objects (the value stored under "crm-leads")
 *   2. An object like { "crm-leads": [...] } (e.g. a dump of the whole
 *      localStorage object)
 */
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { Lead } from '../src/schemas/lead.ts';
import { leadsRepo } from '../src/repo/leads.ts';

async function readInput(): Promise<string> {
  const args = process.argv.slice(2);
  const useStdin = args.includes('--stdin');
  const path = args.find((a) => !a.startsWith('--'));

  if (useStdin) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf-8');
  }

  if (!path) {
    console.error('Usage: import-localstorage <path.json> | --stdin');
    process.exit(1);
  }

  return readFileSync(path, 'utf-8');
}

const ContainerSchema = z.union([
  z.array(z.unknown()),
  z.object({ 'crm-leads': z.array(z.unknown()) }),
]);

async function main() {
  const raw = await readInput();
  const parsedJson = JSON.parse(raw);
  const container = ContainerSchema.parse(parsedJson);
  const rawLeads = Array.isArray(container) ? container : container['crm-leads'];

  const leads = z.array(Lead).parse(rawLeads);
  leadsRepo.bulkUpsert(leads);

  console.log(`Imported ${leads.length} leads.`);
}

main().catch((err) => {
  console.error('Import failed:');
  console.error(err);
  process.exit(1);
});

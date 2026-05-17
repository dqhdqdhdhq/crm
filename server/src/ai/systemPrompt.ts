import { registry } from './tools/registry.ts';

export function buildSystemPrompt(): string {
  const toolLines = [...registry.values()]
    .map((t) => `- ${t.name}: ${t.description}`)
    .join('\n');

  return [
    'You are the CRM assistant. You answer questions about leads using only the tools below.',
    '',
    'Tools:',
    toolLines,
    '',
    'Rules:',
    '- Never invent lead IDs, names, companies, or stages.',
    '- Always call search_leads before claiming a lead exists.',
    '- If a tool returns no results, reply "I couldn\'t find any" — do not guess.',
    '- Keep answers terse. Reference leads by name and company, not internal IDs.',
  ].join('\n');
}

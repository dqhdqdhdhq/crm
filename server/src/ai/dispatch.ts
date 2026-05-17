import { registry } from './tools/registry.ts';

export type ToolTraceEntry = {
  toolName: string;
  args: unknown;
  result: unknown;
  durationMs: number;
};

export async function dispatchToolCall(
  name: string,
  rawArgs: unknown,
): Promise<ToolTraceEntry> {
  const tool = registry.get(name);
  if (!tool) {
    throw new Error(`unknown tool: ${name}`);
  }

  const parsed = tool.paramsSchema.safeParse(rawArgs);
  if (!parsed.success) {
    throw new Error(
      `invalid args for ${name}: ${JSON.stringify(parsed.error.issues)}`,
    );
  }

  if (tool.permission !== 'read') {
    throw new Error('permission tier not implemented in this section');
  }

  const start = Date.now();
  const result = await tool.handler(parsed.data);
  const durationMs = Date.now() - start;

  return { toolName: name, args: parsed.data, result, durationMs };
}

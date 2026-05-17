import type { ZodTypeAny } from 'zod';
import type { OllamaToolDefinition } from '../ollama.ts';

export type ToolPermission = 'read' | 'draft' | 'confirm' | 'high-risk';

export type Tool<Params = unknown, Result = unknown> = {
  name: string;
  description: string;
  paramsSchema: ZodTypeAny;
  jsonSchema: Record<string, unknown>;
  permission: ToolPermission;
  handler: (args: Params) => Promise<Result>;
};

export const registry = new Map<string, Tool>();

export function registerTool(tool: Tool) {
  if (registry.has(tool.name)) {
    throw new Error(`tool already registered: ${tool.name}`);
  }
  registry.set(tool.name, tool);
}

export function toOllamaTools(): OllamaToolDefinition[] {
  return [...registry.values()].map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.jsonSchema,
    },
  }));
}

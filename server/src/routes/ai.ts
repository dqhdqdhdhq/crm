import { Hono } from 'hono';
import { z } from 'zod';
import { ollamaChat, type ChatMessage } from '../ai/ollama.ts';
import { toOllamaTools } from '../ai/tools/registry.ts';
import { dispatchToolCall, type ToolTraceEntry } from '../ai/dispatch.ts';
import { buildSystemPrompt } from '../ai/systemPrompt.ts';

// Ensure tools register themselves.
import '../ai/tools/searchLeads.ts';

const InboundMessage = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
});

const ChatBody = z.object({
  messages: z.array(InboundMessage).min(1),
});

const MAX_ITERATIONS = 5;

export const aiRoute = new Hono();

aiRoute.post('/chat', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = ChatBody.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'invalid_payload', issues: parsed.error.issues }, 400);
  }

  const tools = toOllamaTools();
  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    ...parsed.data.messages,
  ];
  const trace: ToolTraceEntry[] = [];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let response;
    try {
      response = await ollamaChat({ messages, tools });
    } catch (err) {
      return c.json(
        { error: 'ollama_error', message: (err as Error).message, trace },
        502,
      );
    }

    const assistantMsg = response.message;
    messages.push({
      role: 'assistant',
      content: assistantMsg.content ?? '',
      tool_calls: assistantMsg.tool_calls,
    });

    const calls = assistantMsg.tool_calls ?? [];
    if (calls.length === 0) {
      return c.json({ message: assistantMsg.content ?? '', trace });
    }

    for (const call of calls) {
      try {
        const entry = await dispatchToolCall(call.function.name, call.function.arguments);
        trace.push(entry);
        messages.push({
          role: 'tool',
          name: call.function.name,
          content: JSON.stringify(entry.result),
        });
      } catch (err) {
        const message = (err as Error).message;
        trace.push({
          toolName: call.function.name,
          args: call.function.arguments,
          result: { error: message },
          durationMs: 0,
        });
        messages.push({
          role: 'tool',
          name: call.function.name,
          content: JSON.stringify({ error: message }),
        });
      }
    }
  }

  return c.json(
    { error: 'max_iterations_exceeded', message: `aborted after ${MAX_ITERATIONS} tool rounds`, trace },
    500,
  );
});

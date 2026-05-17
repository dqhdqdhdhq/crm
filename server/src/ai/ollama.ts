export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  tool_calls?: OllamaToolCall[];
  name?: string;
};

export type OllamaToolCall = {
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
};

export type OllamaToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type OllamaChatRequest = {
  model: string;
  messages: ChatMessage[];
  tools?: OllamaToolDefinition[];
  stream?: false;
  options?: Record<string, unknown>;
};

export type OllamaChatResponse = {
  model: string;
  created_at: string;
  message: {
    role: 'assistant';
    content: string;
    tool_calls?: OllamaToolCall[];
  };
  done: boolean;
  total_duration?: number;
};

export const OLLAMA_HOST = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'gemma3:4b';

export async function ollamaChat(args: {
  messages: ChatMessage[];
  tools?: OllamaToolDefinition[];
  model?: string;
}): Promise<OllamaChatResponse> {
  const body: OllamaChatRequest = {
    model: args.model ?? OLLAMA_MODEL,
    messages: args.messages,
    tools: args.tools,
    stream: false,
  };

  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ollama ${res.status} ${res.statusText}: ${text}`);
  }

  return (await res.json()) as OllamaChatResponse;
}

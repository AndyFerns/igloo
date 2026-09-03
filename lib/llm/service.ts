// Provider abstraction for the generation layer.
//
// The rest of the app only depends on `chatCompletion()` and `llmStatus()`.
// Any OpenAI-compatible Chat Completions endpoint works by setting
// LLM_BASE_URL / LLM_MODEL / LLM_API_KEY — no application code changes.

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  json?: boolean; // request a JSON object response
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export class LlmError extends Error {
  constructor(
    message: string,
    public code:
      | "missing_key"
      | "timeout"
      | "rate_limit"
      | "bad_response"
      | "upstream"
      | "network"
  ) {
    super(message);
    this.name = "LlmError";
  }
}

export interface LlmStatus {
  configured: boolean;
  model: string;
  baseUrl: string;
}

export function llmStatus(): LlmStatus {
  return {
    configured: Boolean(process.env.LLM_API_KEY),
    model: process.env.LLM_MODEL || "gpt-4o-mini",
    baseUrl: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
  };
}

export async function chatCompletion(
  messages: LlmMessage[],
  opts: ChatOptions = {}
): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new LlmError(
      "The mentor LLM is not configured. Set LLM_API_KEY in your .env.local file.",
      "missing_key"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.5,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.json) body.response_format = { type: "json_object" };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
      throw new LlmError("The mentor took too long to respond. Please try again.", "timeout");
    }
    throw new LlmError("Could not reach the LLM provider.", "network");
  }
  clearTimeout(timeout);

  if (res.status === 429) {
    throw new LlmError("The provider is rate-limiting requests. Wait a moment and retry.", "rate_limit");
  }
  if (!res.ok) {
    // Some providers reject json response_format; retry once without it.
    if (opts.json && (res.status === 400 || res.status === 422)) {
      const { json, ...rest } = opts;
      return chatCompletion(messages, rest);
    }
    throw new LlmError(`The LLM provider returned an error (${res.status}).`, "upstream");
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new LlmError("The LLM provider returned an unreadable response.", "bad_response");
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new LlmError("The LLM provider returned an empty response.", "bad_response");
  }
  return content;
}

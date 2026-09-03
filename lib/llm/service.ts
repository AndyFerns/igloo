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
      | "auth"
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

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.5,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.json) body.response_format = { type: "json_object" };

  // Transient failures (503 overload, 500, network blips, empty bodies) are
  // common on free tiers — retry a few times with backoff before giving up.
  const maxAttempts = 3;
  let lastTransient: LlmError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);

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
      lastTransient = new LlmError("Could not reach the LLM provider.", "network");
      if (attempt < maxAttempts) {
        await sleep(attempt * 700);
        continue;
      }
      throw lastTransient;
    }
    clearTimeout(timeout);

    if (res.status === 429) {
      throw new LlmError("The provider is rate-limiting requests. Wait a moment and retry.", "rate_limit");
    }
    if (res.status === 401 || res.status === 403) {
      // Auth/account problem: bad key, no model access, or (common on a fresh
      // account) no credits/billing. Surface the provider's own message.
      const detail = await readErrorDetail(res);
      const base =
        res.status === 401
          ? "The provider rejected the API key (401). Check LLM_API_KEY is correct and active."
          : "The provider denied the request (403) — often no credits/billing on the account, or the key can't access this model.";
      throw new LlmError(detail ? `${base} Provider said: ${detail}` : base, "auth");
    }
    // Some providers reject json response_format; drop it and retry once.
    if (opts.json && (res.status === 400 || res.status === 422)) {
      const { json, ...rest } = opts;
      return chatCompletion(messages, rest);
    }
    // Retryable server-side errors.
    if (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 504) {
      const detail = await readErrorDetail(res);
      lastTransient = new LlmError(
        detail
          ? `The LLM provider is temporarily unavailable (${res.status}): ${detail}`
          : `The LLM provider is temporarily unavailable (${res.status}).`,
        "upstream"
      );
      if (attempt < maxAttempts) {
        await sleep(attempt * 900);
        continue;
      }
      throw lastTransient;
    }
    if (!res.ok) {
      const detail = await readErrorDetail(res);
      throw new LlmError(
        detail
          ? `The LLM provider returned an error (${res.status}): ${detail}`
          : `The LLM provider returned an error (${res.status}).`,
        "upstream"
      );
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new LlmError("The LLM provider returned an unreadable response.", "bad_response");
    }

    const choice = data?.choices?.[0];
    const content = choice?.message?.content;

    // Truncated output (hit the token cap mid-JSON) — the caller can't parse
    // it. Report it clearly rather than as a generic structuring failure.
    if (choice?.finish_reason === "length") {
      throw new LlmError(
        "The response was cut off before it finished (token limit). Try again, or shorten the problem statement.",
        "bad_response"
      );
    }

    if (typeof content !== "string" || content.trim().length === 0) {
      // Empty body can be a transient hiccup — retry.
      lastTransient = new LlmError("The LLM provider returned an empty response.", "bad_response");
      if (attempt < maxAttempts) {
        await sleep(attempt * 700);
        continue;
      }
      throw lastTransient;
    }

    return content;
  }

  throw lastTransient ?? new LlmError("The LLM provider request failed.", "upstream");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error?.message || body?.error || body?.message || "";
  } catch {
    return "";
  }
}

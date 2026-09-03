import type { AnalyzeResponse, ChatMessage, MentorReport, TeamContext } from "@/lib/types";

// Thin client for the mentor API. Honors NEXT_PUBLIC_API_URL so the frontend
// can point at a separate backend later; empty => same-origin Next routes.
const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status}).`) as Error & {
      code?: string;
      status?: number;
    };
    err.code = data?.code;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export function analyze(problem: string, team: TeamContext) {
  return post<AnalyzeResponse>("/api/analyze", { problem, team });
}

export function chat(args: {
  problem: string;
  team: TeamContext;
  report: MentorReport;
  messages: ChatMessage[];
}) {
  return post<{ reply: string }>("/api/chat", args);
}

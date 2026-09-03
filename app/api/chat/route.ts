import { NextResponse } from "next/server";
import { chatCompletion, LlmError } from "@/lib/llm/service";
import { buildChatSystemPrompt } from "@/lib/llm/prompts";
import type { ChatMessage, MentorReport, TeamContext } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Compact the report into a short digest so follow-up chat stays grounded in
// the current project without resending the whole JSON payload every turn.
function digest(report: MentorReport): string {
  const feat = report.features
    .slice(0, 8)
    .map((f) => `- ${f.name} [${f.priority || f.tier}]`)
    .join("\n");
  const personas = report.personas.map((p) => `${p.name} (${p.role})`).join(", ");
  return [
    `Core problem: ${report.core_problem}`,
    `Domain: ${report.domain}`,
    personas ? `Personas: ${personas}` : "",
    `MVP: ${report.prototype_priorities.mvpWorkflow}`,
    feat ? `Features:\n${feat}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(req: Request) {
  let body: {
    problem?: string;
    team?: TeamContext;
    report?: MentorReport;
    messages?: ChatMessage[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const problem = (body.problem || "").trim();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!problem || messages.length === 0) {
    return NextResponse.json({ error: "Missing project context or message." }, { status: 400 });
  }

  const reportDigest = body.report ? digest(body.report) : "No report generated yet.";
  const system = buildChatSystemPrompt(problem, body.team || {}, reportDigest);

  // Keep the last ~10 turns for context economy.
  const recent = messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const reply = await chatCompletion(
      [{ role: "system", content: system }, ...recent],
      { temperature: 0.6, timeoutMs: 45_000, maxTokens: 1200 }
    );
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof LlmError) {
      const status =
        err.code === "missing_key" ? 503 : err.code === "rate_limit" ? 429 : err.code === "timeout" ? 504 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    return NextResponse.json({ error: "Unexpected chat error." }, { status: 500 });
  }
}

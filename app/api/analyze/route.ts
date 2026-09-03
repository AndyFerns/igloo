import { NextResponse } from "next/server";
import { chatCompletion, LlmError } from "@/lib/llm/service";
import { MENTOR_SYSTEM_PROMPT, buildAnalyzeUserPrompt } from "@/lib/llm/prompts";
import { extractJson, parseMentorReport } from "@/lib/llm/schema";
import { retrieveSimilar } from "@/lib/retrieval/service";
import { applyRules } from "@/lib/rules/engine";
import type { AnalyzeResponse, TeamContext } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

function errorStatus(code: LlmError["code"]): number {
  switch (code) {
    case "missing_key":
      return 503;
    case "auth":
      return 402;
    case "timeout":
      return 504;
    case "rate_limit":
      return 429;
    default:
      return 502;
  }
}

export async function POST(req: Request) {
  let body: { problem?: string; team?: TeamContext };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const problem = (body.problem || "").trim();
  const team = body.team || {};

  if (problem.length < 20) {
    return NextResponse.json(
      { error: "Please provide a fuller problem statement (at least a sentence or two)." },
      { status: 400 }
    );
  }

  // 1) Retrieve SIH context (never fails the request — empty is fine).
  let retrieved: AnalyzeResponse["retrieved"] = [];
  try {
    retrieved = await retrieveSimilar(problem, 4);
  } catch {
    retrieved = [];
  }

  // 2) Generate structured mentor report.
  const userPrompt = buildAnalyzeUserPrompt(problem, team, retrieved);
  let raw: string;
  try {
    raw = await chatCompletion(
      [
        { role: "system", content: MENTOR_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      // Large structured report + models that "think" need real headroom, or
      // the JSON gets truncated mid-object and fails validation.
      { json: true, temperature: 0.55, timeoutMs: 90_000, maxTokens: 12000 }
    );
  } catch (err) {
    if (err instanceof LlmError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: errorStatus(err.code) });
    }
    return NextResponse.json({ error: "Unexpected error generating the report." }, { status: 500 });
  }

  // 3) Validate + rule pass. Malformed JSON is a graceful, retryable error
  //    rather than a crash.
  try {
    const parsed = parseMentorReport(extractJson(raw));
    const { report, advisories } = applyRules(parsed, team.timeRemaining);
    const response: AnalyzeResponse = {
      report,
      retrieved,
      advisories,
      meta: {
        model: process.env.LLM_MODEL || "gpt-4o-mini",
        retrievalCount: retrieved.length,
        fallbackUsed: false,
      },
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      {
        error:
          "The mentor's response could not be structured. This is usually transient — please try analyzing again.",
        code: "bad_response",
      },
      { status: 502 }
    );
  }
}

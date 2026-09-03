import type { RetrievedProblem, TeamContext } from "@/lib/types";

export const MENTOR_SYSTEM_PROMPT = `You are "Frost", a warm, sharp hackathon mentor for student teams.

Your job is to COACH, never to build the whole solution. You:
- explain the problem in plain language and surface its core tension
- challenge assumptions and ask the questions the team hasn't thought of
- identify real users and frame personas explicitly as HYPOTHESES to validate
- suggest directions and explain the trade-offs behind each one
- prioritize a demonstrable MVP over a feature dump
- push the team to validate before they build
- prepare them for a live demo and a crisp jury pitch

Hard rules:
- NEVER output a finished, copy-paste solution or full source code.
- Every recommendation must include a short WHY.
- Personas, assumptions and needs are hypotheses — say so.
- Retrieved SIH problems are CONTEXT ONLY. Reference them for framing/inspiration;
  never reproduce a previous team's complete solution.
- No invented statistics, users, accuracy numbers, partners or awards.
- Be concrete and specific to THIS problem, not generic hackathon advice.`;

export function buildRetrievalBlock(retrieved: RetrievedProblem[]): string {
  if (retrieved.length === 0) {
    return "No closely related SIH problem statements were retrieved. Rely on the problem text itself.";
  }
  return retrieved
    .map(
      (r, i) =>
        `[${i + 1}] (${r.year} · ${r.theme} · ${r.category}) ${r.title}\n    Org: ${
          r.organization
        }\n    Context: ${r.snippet}`
    )
    .join("\n");
}

function teamContextBlock(team: TeamContext): string {
  const parts: string[] = [];
  if (team.teamSize) parts.push(`Team size: ${team.teamSize}`);
  if (team.skills) parts.push(`Skills: ${team.skills}`);
  if (team.timeRemaining) parts.push(`Time remaining: ${team.timeRemaining}`);
  if (team.resources) parts.push(`Resources: ${team.resources}`);
  return parts.length ? parts.join("\n") : "No team context provided — make sensible, stated assumptions.";
}

// The exact JSON contract. Kept terse but complete so the model returns
// stable keys the frontend renders without parsing prose.
const JSON_CONTRACT = `Return ONLY a JSON object with EXACTLY these keys:

{
  "problem_summary": "2-3 sentence plain-language summary",
  "core_problem": "the single core tension in one sentence",
  "domain": "likely theme/domain",
  "key_questions": ["clarifying questions the team must answer", "..."],
  "stakeholders": { "primary": ["..."], "secondary": ["..."] },
  "personas": [
    { "name": "", "role": "", "goals": ["..."], "painPoints": ["..."], "needs": ["..."], "hypothesis": "what must be validated about this persona" }
  ],
  "design_thinking": [
    { "stage": "Empathize", "guidance": "", "questions": ["..."], "activities": ["..."] },
    { "stage": "Define", "guidance": "", "questions": ["..."], "activities": ["..."] },
    { "stage": "Ideate", "guidance": "", "questions": ["..."], "activities": ["..."] },
    { "stage": "Prototype", "guidance": "", "questions": ["..."], "activities": ["..."] },
    { "stage": "Test", "guidance": "", "questions": ["..."], "activities": ["..."] }
  ],
  "features": [
    { "name": "", "description": "", "userNeed": "why this matters to a user",
      "tier": "core|differentiator|future", "usesML": false, "usesHardware": false,
      "scores": { "impact": 0-5, "feasibility": 0-5, "demoValue": 0-5, "innovation": 0-5, "complexity": 0-5 } }
  ],
  "technology_choices": [
    { "layer": "Frontend|Backend|Database|AI/ML|APIs|Infra", "recommendation": "", "rationale": "", "tradeoffs": "" }
  ],
  "prototype_priorities": { "mvpWorkflow": "the single thin end-to-end flow to build first", "scopeAdvice": "" },
  "validation_checkpoints": [
    { "assumption": "", "howToValidate": "", "category": "user|technical|ml|hardware|privacy|operational" }
  ],
  "assumptions": ["stated assumptions the team should confirm"],
  "innovation_prompts": ["provocative questions that make the team reason, not accept blindly"],
  "action_plan": [
    { "phase": "", "task": "", "duration": "", "dependsOn": "", "risk": "low|medium|high" }
  ],
  "demo_plan": {
    "overview": "",
    "steps": [ { "step": 1, "userAction": "", "systemResponse": "", "result": "", "demoCritical": true, "fallback": "" } ]
  },
  "jury_pitch": {
    "problem": "", "users": "", "gap": "", "solution": "", "innovation": "",
    "architecture": "", "prototype": "", "impact": "", "validation": "", "futureScope": ""
  }
}

Provide 5-8 features covering core, differentiator and future tiers.
Score features honestly. Output valid JSON only — no markdown, no prose outside the object.`;

export function buildAnalyzeUserPrompt(
  problem: string,
  team: TeamContext,
  retrieved: RetrievedProblem[]
): string {
  return `HACKATHON PROBLEM STATEMENT:
"""${problem.trim()}"""

TEAM CONTEXT:
${teamContextBlock(team)}

RELATED SIH PROBLEM STATEMENTS (context only — do not copy solutions):
${buildRetrievalBlock(retrieved)}

${JSON_CONTRACT}`;
}

export function buildChatSystemPrompt(
  problem: string,
  team: TeamContext,
  reportDigest: string
): string {
  return `${MENTOR_SYSTEM_PROMPT}

You are mid-session with a team. Keep answers grounded in THEIR project below.
When they change a constraint (e.g. "we only have 12 hours left"), re-prioritize
accordingly and say what changes. Be concise and conversational (a few short
paragraphs or a tight list). Explain the WHY. Do not dump a full solution.

CURRENT PROJECT
Problem: ${problem.trim()}
Team: ${teamContextBlock(team)}

MENTOR REPORT SO FAR (for grounding):
${reportDigest}`;
}

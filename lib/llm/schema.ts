import type {
  MentorReport,
  FeatureIdea,
  DesignThinkingStage,
} from "@/lib/types";

// Parse + validate the model's JSON into a MentorReport. We coerce loosely
// (models drift on exact shapes) but guarantee every key exists so the UI
// never crashes. `parseMentorReport` throws only when the payload is so
// malformed that no useful report can be recovered.

function str(v: any, fallback = ""): string {
  return typeof v === "string" ? v : v == null ? fallback : String(v);
}

function strArr(v: any): string[] {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function num(v: any, fallback = 0): number {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Extract the first balanced JSON object from a string. */
export function extractJson(text: string): any {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Strip code fences / prose around the object.
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("No JSON object found in model output.");
  }
}

const STAGES: DesignThinkingStage["stage"][] = [
  "Empathize",
  "Define",
  "Ideate",
  "Prototype",
  "Test",
];

function coerceFeature(raw: any): FeatureIdea {
  const s = raw?.scores || {};
  const tier = ["core", "differentiator", "future"].includes(raw?.tier)
    ? raw.tier
    : "core";
  return {
    name: str(raw?.name, "Untitled feature"),
    description: str(raw?.description),
    userNeed: str(raw?.userNeed || raw?.user_need),
    tier,
    usesML: Boolean(raw?.usesML ?? raw?.uses_ml),
    usesHardware: Boolean(raw?.usesHardware ?? raw?.uses_hardware),
    scores: {
      impact: clamp(num(s.impact, 3)),
      feasibility: clamp(num(s.feasibility, 3)),
      demoValue: clamp(num(s.demoValue ?? s.demo_value, 3)),
      innovation: clamp(num(s.innovation, 3)),
      complexity: clamp(num(s.complexity, 3)),
    },
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(5, Math.round(n)));
}

export function parseMentorReport(raw: any): MentorReport {
  if (!raw || typeof raw !== "object") {
    throw new Error("Model output was not a JSON object.");
  }

  const dtRaw = Array.isArray(raw.design_thinking) ? raw.design_thinking : [];
  const design_thinking: DesignThinkingStage[] = STAGES.map((stage) => {
    const found = dtRaw.find(
      (d: any) => str(d?.stage).toLowerCase() === stage.toLowerCase()
    );
    return {
      stage,
      guidance: str(found?.guidance),
      questions: strArr(found?.questions),
      activities: strArr(found?.activities),
    };
  });

  const features: FeatureIdea[] = Array.isArray(raw.features)
    ? raw.features.map(coerceFeature)
    : [];

  const report: MentorReport = {
    problem_summary: str(raw.problem_summary),
    core_problem: str(raw.core_problem),
    domain: str(raw.domain),
    key_questions: strArr(raw.key_questions),
    stakeholders: {
      primary: strArr(raw.stakeholders?.primary),
      secondary: strArr(raw.stakeholders?.secondary),
    },
    personas: Array.isArray(raw.personas)
      ? raw.personas.map((p: any) => ({
          name: str(p?.name, "Persona"),
          role: str(p?.role),
          goals: strArr(p?.goals),
          painPoints: strArr(p?.painPoints || p?.pain_points),
          needs: strArr(p?.needs),
          hypothesis: str(p?.hypothesis),
        }))
      : [],
    design_thinking,
    features,
    technology_choices: Array.isArray(raw.technology_choices)
      ? raw.technology_choices.map((t: any) => ({
          layer: str(t?.layer),
          recommendation: str(t?.recommendation),
          rationale: str(t?.rationale),
          tradeoffs: str(t?.tradeoffs || t?.tradeoff),
        }))
      : [],
    prototype_priorities: {
      mvpWorkflow: str(raw.prototype_priorities?.mvpWorkflow || raw.prototype_priorities?.mvp_workflow),
      scopeAdvice: str(raw.prototype_priorities?.scopeAdvice || raw.prototype_priorities?.scope_advice),
    },
    validation_checkpoints: Array.isArray(raw.validation_checkpoints)
      ? raw.validation_checkpoints.map((v: any) => ({
          assumption: str(v?.assumption),
          howToValidate: str(v?.howToValidate || v?.how_to_validate),
          category: normalizeCategory(v?.category),
        }))
      : [],
    assumptions: strArr(raw.assumptions),
    innovation_prompts: strArr(raw.innovation_prompts),
    action_plan: Array.isArray(raw.action_plan)
      ? raw.action_plan.map((a: any) => ({
          phase: str(a?.phase),
          task: str(a?.task),
          duration: str(a?.duration),
          dependsOn: str(a?.dependsOn || a?.depends_on) || undefined,
          risk: normalizeRisk(a?.risk),
        }))
      : [],
    demo_plan: {
      overview: str(raw.demo_plan?.overview),
      steps: Array.isArray(raw.demo_plan?.steps)
        ? raw.demo_plan.steps.map((s: any, i: number) => ({
            step: num(s?.step, i + 1),
            userAction: str(s?.userAction || s?.user_action),
            systemResponse: str(s?.systemResponse || s?.system_response),
            result: str(s?.result),
            demoCritical: Boolean(s?.demoCritical ?? s?.demo_critical),
            fallback: str(s?.fallback) || undefined,
          }))
        : [],
    },
    jury_pitch: {
      problem: str(raw.jury_pitch?.problem),
      users: str(raw.jury_pitch?.users),
      gap: str(raw.jury_pitch?.gap),
      solution: str(raw.jury_pitch?.solution),
      innovation: str(raw.jury_pitch?.innovation),
      architecture: str(raw.jury_pitch?.architecture),
      prototype: str(raw.jury_pitch?.prototype),
      impact: str(raw.jury_pitch?.impact),
      validation: str(raw.jury_pitch?.validation),
      futureScope: str(raw.jury_pitch?.futureScope || raw.jury_pitch?.future_scope),
    },
  };

  // Minimum viability check: without a summary and at least one feature the
  // report is not useful — signal the caller to use the fallback path.
  if (!report.problem_summary && report.features.length === 0) {
    throw new Error("Model output missing essential fields.");
  }

  return report;
}

function normalizeCategory(v: any): any {
  const c = str(v).toLowerCase();
  const allowed = ["user", "technical", "ml", "hardware", "privacy", "operational"];
  return allowed.includes(c) ? c : "technical";
}

function normalizeRisk(v: any): "low" | "medium" | "high" | undefined {
  const r = str(v).toLowerCase();
  return r === "low" || r === "medium" || r === "high" ? r : undefined;
}

/**
 * Deterministic fallback report used when structured generation fails
 * entirely. It is clearly framed as a scaffold, contains no invented facts,
 * and keeps the workspace usable instead of crashing. It is NOT a canned
 * answer to any specific problem — it echoes the user's own text and prompts
 * them to retry generation.
 */
export function fallbackReport(problem: string): MentorReport {
  const p = problem.trim();
  const stub = (guidance: string): DesignThinkingStage => ({
    stage: "Empathize",
    guidance,
    questions: [],
    activities: [],
  });
  return {
    problem_summary:
      "The mentor could not generate a full structured analysis this time. Below is a working scaffold — edit your problem statement or retry generation.",
    core_problem: "Re-run the analysis to let the mentor extract the core problem.",
    domain: "",
    key_questions: [
      "Who exactly experiences this problem, and how often?",
      "What does success look like in one demonstrable flow?",
      "What is the single riskiest assumption to validate first?",
    ],
    stakeholders: { primary: [], secondary: [] },
    personas: [],
    design_thinking: STAGES.map((stage) => ({
      stage,
      guidance:
        stage === "Empathize"
          ? "Start by talking to real users about " + (p ? "this problem." : "the problem.")
          : "",
      questions: [],
      activities: [],
    })),
    features: [],
    technology_choices: [],
    prototype_priorities: {
      mvpWorkflow: "Retry generation to get a recommended thin end-to-end MVP flow.",
      scopeAdvice: "Keep the MVP to one user, one flow, one visible result.",
    },
    validation_checkpoints: [],
    assumptions: [],
    innovation_prompts: [],
    action_plan: [],
    demo_plan: { overview: "", steps: [] },
    jury_pitch: {
      problem: p,
      users: "",
      gap: "",
      solution: "",
      innovation: "",
      architecture: "",
      prototype: "",
      impact: "",
      validation: "",
      futureScope: "",
    },
  };
}

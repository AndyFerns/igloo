import type {
  FeatureIdea,
  FeaturePriority,
  MentorReport,
  RuleAdvisory,
  ValidationCheckpoint,
} from "@/lib/types";

// Deterministic mentor logic. Everything here is rule-based, not LLM-based:
// feature prioritization, scope control, and mandatory validation prompts for
// ML / hardware features. The LLM proposes scores; these rules turn them into
// a defensible priority classification and add checks the LLM should not be
// trusted to remember every time.

const ML_HINTS =
  /\b(ml|machine learning|deep learning|model|training|predict|prediction|classif|nlp|llm|neural|recommend|forecast|detect(ion)?|computer vision|ocr|embedding)\b/i;
const HW_HINTS =
  /\b(iot|sensor|hardware|arduino|raspberry|drone|camera|gps|rfid|device|microcontroller|esp32|wearable|robot)\b/i;

function detectML(f: FeatureIdea): boolean {
  return Boolean(f.usesML) || ML_HINTS.test(`${f.name} ${f.description}`);
}
function detectHW(f: FeatureIdea): boolean {
  return Boolean(f.usesHardware) || HW_HINTS.test(`${f.name} ${f.description}`);
}

/**
 * Weighted priority score. Impact, feasibility and demo value dominate for a
 * hackathon; innovation is a lighter bonus; complexity is a penalty.
 */
function priorityScore(f: FeatureIdea): number {
  const s = f.scores || { impact: 3, feasibility: 3, demoValue: 3, innovation: 3, complexity: 3 };
  return (
    s.impact * 1.1 +
    s.feasibility * 1.0 +
    s.demoValue * 1.2 +
    s.innovation * 0.6 -
    s.complexity * 0.9
  );
}

function classify(score: number, tier: FeatureIdea["tier"]): FeaturePriority {
  if (tier === "future") return "Future Scope";
  if (score >= 7.5) return "Must Build";
  if (score >= 5.5) return "Should Build";
  if (score >= 3.5) return "If Time Allows";
  return "Future Scope";
}

/** Apply feature scoring + classification and attach per-feature rule notes. */
export function scoreFeatures(features: FeatureIdea[]): FeatureIdea[] {
  return features.map((f) => {
    const usesML = detectML(f);
    const usesHardware = detectHW(f);
    const score = priorityScore(f);
    const priority = classify(score, f.tier);
    const notes: string[] = [];

    if (usesML) {
      notes.push("ML feature — confirm you have (or can get) training data.");
      notes.push("Decide the evaluation metric before building.");
      notes.push("Have a rule-based fallback if the model underperforms in the demo.");
    }
    if (usesHardware) {
      notes.push("Hardware/IoT — confirm the device is physically available.");
      notes.push("Prepare a software simulation so the demo doesn't depend on hardware.");
    }
    if ((f.scores?.complexity ?? 0) >= 4 && priority !== "Future Scope") {
      notes.push("High complexity — timebox this or cut it if the MVP flow slips.");
    }

    return { ...f, usesML, usesHardware, priority, ruleNotes: notes };
  });
}

/** Time-budget-aware pressure: fewer hours => stricter about "Must Build". */
function parseHours(timeRemaining?: string): number | null {
  if (!timeRemaining) return null;
  const m = timeRemaining.match(/(\d+(?:\.\d+)?)\s*(h|hr|hour|d|day)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return /d|day/i.test(m[2]) ? n * 24 : n;
}

/** Produce scope / feasibility / ML / hardware advisories for the whole report. */
export function buildAdvisories(
  features: FeatureIdea[],
  timeRemaining?: string
): RuleAdvisory[] {
  const advisories: RuleAdvisory[] = [];
  const mustBuild = features.filter((f) => f.priority === "Must Build");
  const hours = parseHours(timeRemaining);

  const mustBudget = hours != null && hours <= 12 ? 2 : hours != null && hours <= 24 ? 3 : 4;
  if (mustBuild.length > mustBudget) {
    advisories.push({
      kind: "scope",
      severity: "warning",
      message:
        `You have ${mustBuild.length} "Must Build" features` +
        (hours != null ? ` for ~${hours}h` : "") +
        `. That is likely too many — narrow to ${mustBudget} and demote the rest so you can finish one complete flow.`,
    });
  }

  if (hours != null && hours <= 12) {
    advisories.push({
      kind: "feasibility",
      severity: "info",
      message:
        "Under 12 hours left: build one thin end-to-end path (input → processing → visible result) before adding any second feature.",
    });
  }

  if (features.some((f) => f.usesML)) {
    advisories.push({
      kind: "ml",
      severity: "info",
      message:
        "An ML feature is in scope. Confirm training data, pick your evaluation metric, and keep a deterministic fallback for the live demo.",
    });
  }
  if (features.some((f) => f.usesHardware)) {
    advisories.push({
      kind: "hardware",
      severity: "info",
      message:
        "A hardware/IoT feature is in scope. Verify the device is on hand and prepare a simulation so the demo can't be blocked by hardware.",
    });
  }

  return advisories;
}

/** Ensure ML/hardware/privacy checkpoints exist even if the LLM omitted them. */
export function augmentValidation(
  checkpoints: ValidationCheckpoint[],
  features: FeatureIdea[]
): ValidationCheckpoint[] {
  const out = [...checkpoints];
  const has = (cat: ValidationCheckpoint["category"]) => out.some((c) => c.category === cat);

  if (features.some((f) => f.usesML) && !has("ml")) {
    out.push({
      assumption: "The ML model will be accurate enough to be useful.",
      howToValidate:
        "Define a metric (e.g. precision/recall) and a target, test on a small held-out sample, and compare against a simple baseline.",
      category: "ml",
    });
  }
  if (features.some((f) => f.usesHardware) && !has("hardware")) {
    out.push({
      assumption: "The required hardware will work reliably during the demo.",
      howToValidate:
        "Dry-run the device end to end the day before; prepare a recorded/simulated fallback.",
      category: "hardware",
    });
  }
  return out;
}

/**
 * Run the full deterministic pass over an LLM-generated report: score and
 * classify features, backfill validation, and compute advisories. Returns a
 * new report plus the advisory list.
 */
export function applyRules(
  report: MentorReport,
  timeRemaining?: string
): { report: MentorReport; advisories: RuleAdvisory[] } {
  const features = scoreFeatures(report.features);
  const advisories = buildAdvisories(features, timeRemaining);
  const validation_checkpoints = augmentValidation(report.validation_checkpoints, features);
  return {
    report: { ...report, features, validation_checkpoints },
    advisories,
  };
}

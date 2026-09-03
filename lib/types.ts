// Shared domain types for the Hackathon Mentor.

export interface TeamContext {
  teamSize?: string;
  skills?: string;
  timeRemaining?: string;
  resources?: string;
}

/** A normalized SIH problem statement used as retrieval context. */
export interface SihProblem {
  id: string;
  year: number;
  title: string;
  organization: string;
  department: string;
  category: string; // Software | Hardware
  theme: string;
  description: string;
  datasetInfo?: string;
  webUrl?: string;
}

export interface RetrievedProblem {
  id: string;
  year: number;
  title: string;
  organization: string;
  theme: string;
  category: string;
  score: number; // 0..1 similarity
  snippet: string;
  webUrl?: string;
}

// ── Structured mentor output contract (matches the PRD keys) ───────────────

export interface Persona {
  name: string;
  role: string;
  goals: string[];
  painPoints: string[];
  needs: string[];
  hypothesis: string; // what must be validated
}

export interface DesignThinkingStage {
  stage: "Empathize" | "Define" | "Ideate" | "Prototype" | "Test";
  guidance: string;
  questions: string[];
  activities: string[];
}

export interface FeatureIdea {
  name: string;
  description: string;
  userNeed: string; // why it matters
  tier: "core" | "differentiator" | "future";
  usesML?: boolean;
  usesHardware?: boolean;
  // Deterministic scores (0..5). The LLM proposes; the rule engine may
  // override/normalize and derive the priority classification.
  scores?: FeatureScores;
  priority?: FeaturePriority;
  ruleNotes?: string[];
}

export interface FeatureScores {
  impact: number;
  feasibility: number;
  demoValue: number;
  innovation: number;
  complexity: number; // higher = more complex (penalized)
}

export type FeaturePriority =
  | "Must Build"
  | "Should Build"
  | "If Time Allows"
  | "Future Scope";

export interface TechnologyChoice {
  layer: string; // Frontend | Backend | Database | AI/ML | APIs | Infra
  recommendation: string;
  rationale: string;
  tradeoffs: string;
}

export interface ValidationCheckpoint {
  assumption: string;
  howToValidate: string;
  category: "user" | "technical" | "ml" | "hardware" | "privacy" | "operational";
}

export interface ActionStep {
  phase: string;
  task: string;
  duration: string;
  dependsOn?: string;
  risk?: "low" | "medium" | "high";
}

export interface DemoStep {
  step: number;
  userAction: string;
  systemResponse: string;
  result: string;
  demoCritical: boolean;
  fallback?: string;
}

export interface JuryPitch {
  problem: string;
  users: string;
  gap: string;
  solution: string;
  innovation: string;
  architecture: string;
  prototype: string;
  impact: string;
  validation: string;
  futureScope: string;
}

export interface MentorReport {
  problem_summary: string;
  core_problem: string;
  domain: string;
  key_questions: string[];
  stakeholders: { primary: string[]; secondary: string[] };
  personas: Persona[];
  design_thinking: DesignThinkingStage[];
  features: FeatureIdea[];
  technology_choices: TechnologyChoice[];
  prototype_priorities: {
    mvpWorkflow: string;
    scopeAdvice: string;
  };
  validation_checkpoints: ValidationCheckpoint[];
  assumptions: string[];
  innovation_prompts: string[];
  action_plan: ActionStep[];
  demo_plan: {
    overview: string;
    steps: DemoStep[];
  };
  jury_pitch: JuryPitch;
}

/** Deterministic advisories produced by the rule engine (not from the LLM). */
export interface RuleAdvisory {
  kind: "scope" | "ml" | "hardware" | "feasibility";
  message: string;
  severity: "info" | "warning";
}

export interface AnalyzeResponse {
  report: MentorReport;
  retrieved: RetrievedProblem[];
  advisories: RuleAdvisory[];
  meta: {
    model: string;
    retrievalCount: number;
    fallbackUsed: boolean;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

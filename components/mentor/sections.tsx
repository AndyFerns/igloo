"use client";

import { Card, Badge, LabeledList, Divider } from "@/components/ui";
import type {
  MentorReport,
  FeatureIdea,
  FeaturePriority,
  RuleAdvisory,
} from "@/lib/types";

// ── shared bits ────────────────────────────────────────────────────────────

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-ink-soft">{children}</p>;
}

function Empty({ label }: { label: string }) {
  return (
    <p className="text-sm italic text-ink-faint">
      {label} — try regenerating this section from the chat.
    </p>
  );
}

const PRIORITY_TONE: Record<FeaturePriority, { bg: string; text: string; dot: string }> = {
  "Must Build": { bg: "bg-accent-wash", text: "text-accent", dot: "bg-accent" },
  "Should Build": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "If Time Allows": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "Future Scope": { bg: "bg-black/[0.04]", text: "text-ink-faint", dot: "bg-ink-faint" },
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] uppercase tracking-wide text-ink-faint">{label}</span>
      <span className="flex-1">
        <span className="flex h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
          <span
            className="h-full rounded-full bg-accent/70"
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </span>
      </span>
      <span className="w-4 text-right text-[11px] tabular-nums text-ink-soft">{value}</span>
    </div>
  );
}

// ── Problem ────────────────────────────────────────────────────────────────

function ProblemSection({ r }: { r: MentorReport }) {
  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">Core problem</Badge>
          {r.domain && <Badge tone="neutral">{r.domain}</Badge>}
        </div>
        <p className="mt-3 text-lg font-medium leading-snug tracking-tight text-ink">
          {r.core_problem || "—"}
        </p>
        <Divider className="my-5" />
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Summary</div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.problem_summary || "—"}</p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink">Questions to answer first</h3>
          <p className="mb-3 mt-1 text-xs text-ink-faint">Resolve these before you commit to a direction.</p>
          {r.key_questions.length ? (
            <ol className="space-y-2.5">
              {r.key_questions.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <span className="mt-0.5 text-xs font-semibold tabular-nums text-accent">{i + 1}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty label="No questions yet" />
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink">Stakeholders</h3>
          <div className="mt-3 space-y-4">
            <LabeledList label="Primary" items={r.stakeholders.primary} tone="accent" />
            <LabeledList label="Secondary" items={r.stakeholders.secondary} />
            {!r.stakeholders.primary.length && !r.stakeholders.secondary.length && (
              <Empty label="No stakeholders yet" />
            )}
          </div>
        </Card>
      </div>

      {r.assumptions.length > 0 && (
        <Card className="border-dashed p-6">
          <div className="flex items-center gap-2">
            <Badge tone="warn">Hypotheses</Badge>
            <h3 className="text-sm font-semibold text-ink">Stated assumptions to confirm</h3>
          </div>
          <LabeledList label="" items={r.assumptions} />
        </Card>
      )}
    </div>
  );
}

// ── Users & personas ───────────────────────────────────────────────────────

function UsersSection({ r }: { r: MentorReport }) {
  if (!r.personas.length) return <Empty label="No personas yet" />;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {r.personas.map((p, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold tracking-tight text-ink">{p.name}</h3>
              <div className="text-xs text-ink-soft">{p.role}</div>
            </div>
            <Badge tone="warn">Hypothesis</Badge>
          </div>
          <div className="mt-4 space-y-4">
            <LabeledList label="Goals" items={p.goals} tone="accent" />
            <LabeledList label="Pain points" items={p.painPoints} />
            <LabeledList label="Needs" items={p.needs} />
          </div>
          {p.hypothesis && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
              <span className="font-semibold">Validate:</span> {p.hypothesis}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── Design thinking ────────────────────────────────────────────────────────

function DesignThinkingSection({ r }: { r: MentorReport }) {
  const filled = r.design_thinking.filter((d) => d.guidance || d.questions.length || d.activities.length);
  if (!filled.length) return <Empty label="No design-thinking guidance yet" />;
  return (
    <div className="space-y-4">
      {r.design_thinking.map((d, i) => (
        <Card key={d.stage} className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-semibold text-canvas">
              {i + 1}
            </span>
            <h3 className="text-base font-semibold tracking-tight text-ink">{d.stage}</h3>
          </div>
          {d.guidance && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{d.guidance}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LabeledList label="Ask" items={d.questions} tone="accent" />
            <LabeledList label="Do" items={d.activities} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Ideas ──────────────────────────────────────────────────────────────────

function tierLabel(t: FeatureIdea["tier"]) {
  return t === "core" ? "Core" : t === "differentiator" ? "Differentiator" : "Future";
}

function IdeasSection({ r }: { r: MentorReport }) {
  if (!r.features.length) return <Empty label="No feature ideas yet" />;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {r.features.map((f, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{f.name}</h3>
              <Badge tone={f.tier === "core" ? "accent" : "neutral"}>{tierLabel(f.tier)}</Badge>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.description}</p>
            {f.userNeed && (
              <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                <span className="font-semibold text-ink-soft">Why: </span>
                {f.userNeed}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {f.usesML && <Badge tone="warn">ML</Badge>}
              {f.usesHardware && <Badge tone="warn">Hardware</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {r.innovation_prompts.length > 0 && (
        <Card className="bg-panel-wash p-6">
          <div className="mb-1 flex items-center gap-2">
            <Badge tone="accent">Think about</Badge>
            <h3 className="text-sm font-semibold text-ink">Innovation prompts</h3>
          </div>
          <p className="mb-3 text-xs text-ink-faint">Reason about these — don&rsquo;t accept them blindly.</p>
          <ul className="space-y-2.5">
            {r.innovation_prompts.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

// ── Technology ─────────────────────────────────────────────────────────────

function TechSection({ r }: { r: MentorReport }) {
  if (!r.technology_choices.length) return <Empty label="No technology guidance yet" />;
  return (
    <div className="space-y-3">
      {r.technology_choices.map((t, i) => (
        <Card key={i} className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="sm:w-40 sm:shrink-0">
              <Badge tone="ink">{t.layer || "Layer"}</Badge>
              <p className="mt-2 text-sm font-semibold text-ink">{t.recommendation}</p>
            </div>
            <div className="flex-1 space-y-2">
              {t.rationale && (
                <p className="text-sm leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">Why: </span>
                  {t.rationale}
                </p>
              )}
              {t.tradeoffs && (
                <p className="text-sm leading-relaxed text-ink-faint">
                  <span className="font-semibold text-ink-soft">Trade-off: </span>
                  {t.tradeoffs}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── MVP (rule-scored) ──────────────────────────────────────────────────────

const PRIORITY_ORDER: FeaturePriority[] = [
  "Must Build",
  "Should Build",
  "If Time Allows",
  "Future Scope",
];

function MvpSection({ r, advisories }: { r: MentorReport; advisories: RuleAdvisory[] }) {
  const grouped = PRIORITY_ORDER.map((p) => ({
    priority: p,
    items: r.features.filter((f) => (f.priority || "Future Scope") === p),
  })).filter((g) => g.items.length);

  return (
    <div className="space-y-5">
      <Card className="bg-panel-wash p-6">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Build this first</Badge>
          <h3 className="text-sm font-semibold text-ink">Minimum demonstrable workflow</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {r.prototype_priorities.mvpWorkflow || "—"}
        </p>
        {r.prototype_priorities.scopeAdvice && (
          <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">Scope: </span>
            {r.prototype_priorities.scopeAdvice}
          </p>
        )}
      </Card>

      {advisories.filter((a) => a.kind === "scope" || a.kind === "feasibility").map((a, i) => (
        <div
          key={i}
          className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
            a.severity === "warning"
              ? "border-accent/25 bg-accent-wash text-accent"
              : "border-line bg-surface text-ink-soft"
          }`}
        >
          <span className="font-semibold">Rule engine · </span>
          {a.message}
        </div>
      ))}

      {grouped.length ? (
        grouped.map((g) => {
          const tone = PRIORITY_TONE[g.priority];
          return (
            <div key={g.priority}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                <h3 className={`text-sm font-semibold ${tone.text}`}>{g.priority}</h3>
                <span className="text-xs text-ink-faint">({g.items.length})</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {g.items.map((f, i) => (
                  <Card key={i} className={`p-5 ${g.priority === "Must Build" ? "ring-1 ring-accent/15" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-ink">{f.name}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.bg} ${tone.text}`}>
                        {g.priority}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{f.description}</p>
                    {f.scores && (
                      <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                        <ScoreBar label="Impact" value={f.scores.impact} />
                        <ScoreBar label="Feasible" value={f.scores.feasibility} />
                        <ScoreBar label="Demo" value={f.scores.demoValue} />
                        <ScoreBar label="Innov." value={f.scores.innovation} />
                        <ScoreBar label="Complex" value={f.scores.complexity} />
                      </div>
                    )}
                    {f.ruleNotes && f.ruleNotes.length > 0 && (
                      <ul className="mt-3 space-y-1 border-t border-line pt-3">
                        {f.ruleNotes.map((n, j) => (
                          <li key={j} className="flex gap-2 text-[11px] leading-relaxed text-amber-700">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <Empty label="No prioritized features yet" />
      )}
    </div>
  );
}

// ── Validation ─────────────────────────────────────────────────────────────

const CAT_TONE: Record<string, string> = {
  ml: "bg-purple-50 text-purple-700 border-purple-200",
  hardware: "bg-sky-50 text-sky-700 border-sky-200",
  privacy: "bg-rose-50 text-rose-700 border-rose-200",
  user: "bg-emerald-50 text-emerald-700 border-emerald-200",
  technical: "bg-black/[0.04] text-ink-soft border-line",
  operational: "bg-amber-50 text-amber-700 border-amber-200",
};

function ValidationSection({ r }: { r: MentorReport }) {
  if (!r.validation_checkpoints.length) return <Empty label="No validation checkpoints yet" />;
  return (
    <div className="space-y-3">
      {r.validation_checkpoints.map((v, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-3">
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${CAT_TONE[v.category] || CAT_TONE.technical}`}>
              {v.category}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{v.assumption}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink-soft">Test it: </span>
                {v.howToValidate}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Action plan ────────────────────────────────────────────────────────────

const RISK_TONE: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-accent",
};

function ActionPlanSection({ r }: { r: MentorReport }) {
  if (!r.action_plan.length) return <Empty label="No action plan yet" />;
  return (
    <Card className="p-2 sm:p-4">
      <ol className="relative">
        {r.action_plan.map((a, i) => (
          <li key={i} className="flex gap-4 px-3 py-3.5">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-wash text-xs font-semibold text-accent">
                {i + 1}
              </span>
              {i < r.action_plan.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                {a.phase && <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{a.phase}</span>}
                {a.duration && <Badge tone="neutral">{a.duration}</Badge>}
                {a.risk && <span className={`text-[11px] font-semibold uppercase ${RISK_TONE[a.risk]}`}>{a.risk} risk</span>}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink">{a.task}</p>
              {a.dependsOn && <p className="mt-0.5 text-xs text-ink-faint">Depends on: {a.dependsOn}</p>}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ── registry ───────────────────────────────────────────────────────────────

export type SectionId =
  | "problem"
  | "users"
  | "design"
  | "ideas"
  | "tech"
  | "mvp"
  | "validation"
  | "plan";

export const SECTION_TABS: { id: SectionId; label: string }[] = [
  { id: "problem", label: "Problem" },
  { id: "users", label: "Users" },
  { id: "design", label: "Design Thinking" },
  { id: "ideas", label: "Ideas" },
  { id: "tech", label: "Technology" },
  { id: "mvp", label: "MVP" },
  { id: "validation", label: "Validation" },
  { id: "plan", label: "Action Plan" },
];

export function SectionRenderer({
  id,
  report,
  advisories,
}: {
  id: SectionId;
  report: MentorReport;
  advisories: RuleAdvisory[];
}) {
  switch (id) {
    case "problem":
      return <ProblemSection r={report} />;
    case "users":
      return <UsersSection r={report} />;
    case "design":
      return <DesignThinkingSection r={report} />;
    case "ideas":
      return <IdeasSection r={report} />;
    case "tech":
      return <TechSection r={report} />;
    case "mvp":
      return <MvpSection r={report} advisories={advisories} />;
    case "validation":
      return <ValidationSection r={report} />;
    case "plan":
      return <ActionPlanSection r={report} />;
  }
}

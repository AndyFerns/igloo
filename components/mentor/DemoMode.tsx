"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@/components/ui";
import type { MentorReport } from "@/lib/types";

export function DemoMode({ report }: { report: MentorReport }) {
  const steps = report.demo_plan.steps;
  const [active, setActive] = useState(0);

  if (!steps.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-ink-soft">
          No demo walkthrough was generated. Ask Mewrin in chat to &ldquo;build a step-by-step demo
          flow&rdquo; and it will fill this in.
        </p>
      </Card>
    );
  }

  const step = steps[active];

  return (
    <div className="space-y-6">
      <Card className="bg-panel-wash p-6">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Demo flow</Badge>
          <span className="text-xs text-ink-faint">~2–3 minutes · {steps.length} steps</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{report.demo_plan.overview || "Walk the jury through one clean end-to-end path."}</p>
      </Card>

      {/* Stepper */}
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              i === active
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-soft hover:border-ink/25"
            }`}
          >
            <span className={i === active ? "text-white" : "text-ink-faint"}>{i + 1}</span>
            {s.demoCritical && <span className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-white" : "bg-accent"}`} />}
          </button>
        ))}
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Step {step.step}
          </div>
          {step.demoCritical && <Badge tone="accent">Demo-critical</Badge>}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">User does</div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{step.userAction || "—"}</p>
          </div>
          <div className="relative sm:border-l sm:border-line sm:pl-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">System responds</div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{step.systemResponse || "—"}</p>
          </div>
          <div className="relative sm:border-l sm:border-line sm:pl-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Result</div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">{step.result || "—"}</p>
          </div>
        </div>

        {step.fallback && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs leading-relaxed text-amber-800">
            <span className="font-semibold">If it breaks: </span>
            {step.fallback}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={() => setActive((v) => Math.max(0, v - 1))} disabled={active === 0}>
            Previous
          </Button>
          <span className="text-xs text-ink-faint">{active + 1} / {steps.length}</span>
          <Button size="sm" onClick={() => setActive((v) => Math.min(steps.length - 1, v + 1))} disabled={active === steps.length - 1}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

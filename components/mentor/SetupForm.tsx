"use client";

import { useState } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { MentorCompanion } from "@/components/MentorCompanion";
import type { TeamContext } from "@/lib/types";

const EXAMPLE = {
  problem:
    "Reducing food wastage in college canteens. Canteens over-prepare meals because they cannot predict demand, leading to large amounts of edible food being thrown away daily while nearby communities face food insecurity. Build a solution that helps canteens forecast demand and redirect surplus food responsibly.",
  team: { teamSize: "4", skills: "React, Python, basic ML", timeRemaining: "24 hours", resources: "Laptops, no hardware, free-tier cloud" },
};

export function SetupForm({
  onSubmit,
  error,
  initialProblem = "",
  initialTeam = {},
}: {
  onSubmit: (problem: string, team: TeamContext) => void;
  error?: string | null;
  initialProblem?: string;
  initialTeam?: TeamContext;
}) {
  const [problem, setProblem] = useState(initialProblem);
  const [team, setTeam] = useState<TeamContext>(initialTeam);
  const [touched, setTouched] = useState(false);

  const valid = problem.trim().length >= 20;

  function loadExample() {
    setProblem(EXAMPLE.problem);
    setTeam(EXAMPLE.team);
  }

  function submit() {
    setTouched(true);
    if (valid) onSubmit(problem.trim(), team);
  }

  const field = (
    label: string,
    key: keyof TeamContext,
    placeholder: string
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <input
        value={team[key] || ""}
        onChange={(e) => setTeam((t) => ({ ...t, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-accent"
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-content px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left: form */}
        <div className="animate-fade-up">
          <Badge tone="accent" className="mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> New mentoring session
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            What problem are you solving?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            Paste the full hackathon problem statement — the more detail, the sharper the guidance.
            Team context is optional but shapes the MVP and tech recommendations.
          </p>

          <Card className="mt-6 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <label htmlFor="problem" className="text-sm font-medium text-ink">
                Problem statement
              </label>
              <button
                onClick={loadExample}
                className="text-xs font-medium text-accent hover:underline"
                type="button"
              >
                Load example (food wastage)
              </button>
            </div>
            <textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={7}
              placeholder="e.g. Build an assistant that helps rural clinics triage patients when no doctor is available…"
              className="mt-2 w-full resize-y rounded-xl border border-line bg-canvas/50 px-3.5 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus-accent"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className={touched && !valid ? "text-accent" : "text-ink-faint"}>
                {touched && !valid ? "Add a bit more detail (at least a sentence or two)." : `${problem.trim().length} characters`}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {field("Team size", "teamSize", "e.g. 4")}
              {field("Time remaining", "timeRemaining", "e.g. 24 hours")}
              {field("Team skills", "skills", "e.g. React, Python, ML basics")}
              {field("Resources", "resources", "e.g. laptops, no hardware")}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-accent/25 bg-accent-wash px-4 py-3 text-sm text-accent">
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={submit} size="lg" disabled={!valid && touched}>
                Analyze with Mewrin
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
              <span className="text-xs text-ink-faint">Retrieves related SIH context, then coaches you.</span>
            </div>
          </Card>
        </div>

        {/* Right: companion + tips */}
        <div className="animate-fade-up lg:pt-16">
          <Card className="bg-panel-wash p-6">
            <div className="flex items-center gap-3">
              <MentorCompanion mood="idle" size="md" />
              <div>
                <div className="font-semibold text-ink">Mewrin</div>
                <div className="text-xs text-ink-soft">Your hackathon mentor</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              &ldquo;Give me the real problem statement and I&rsquo;ll help you understand it, find
              your users, and pick a scope you can actually demo. I&rsquo;ll push back when
              something looks too ambitious for the time you have.&rdquo;
            </p>
            <div className="mt-5 space-y-2">
              {[
                "I use related SIH problems as context — never as answers.",
                "I flag ML and hardware risks before you commit to them.",
                "You can change constraints anytime and I'll re-prioritize.",
              ].map((t) => (
                <div key={t} className="flex gap-2.5 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { MentorCompanion } from "@/components/MentorCompanion";

const PHASES = [
  "Reading your problem statement",
  "Searching related SIH problems",
  "Framing users and assumptions",
  "Weighing feature trade-offs",
  "Scoring the MVP and building guidance",
];

export function AnalyzingState() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, PHASES.length - 1)), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <MentorCompanion mood="thinking" size="lg" />
      <h2 className="mt-6 text-lg font-semibold tracking-tight text-ink">Mewrin is thinking…</h2>
      <p className="mt-1 text-sm text-ink-soft">This usually takes 10–25 seconds.</p>

      <div className="mt-8 w-full space-y-2.5 text-left">
        {PHASES.map((p, idx) => {
          const done = idx < i;
          const active = idx === i;
          return (
            <div
              key={p}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all ${
                active
                  ? "border-accent/30 bg-accent-wash"
                  : done
                    ? "border-line bg-surface"
                    : "border-line/60 bg-surface opacity-55"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                    <path d="M3 8.5l3 3 7-7" fill="none" stroke="#F0521B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <span className="h-2.5 w-2.5 animate-pulse-soft rounded-full bg-accent" />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full border border-ink-faint" />
                )}
              </span>
              <span className={`text-sm ${active ? "font-medium text-ink" : "text-ink-soft"}`}>{p}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

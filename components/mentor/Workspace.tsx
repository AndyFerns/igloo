"use client";

import { useState } from "react";
import { Wordmark } from "@/components/SiteNav";
import { Badge, Button, Card } from "@/components/ui";
import { SECTION_TABS, SectionRenderer, type SectionId } from "./sections";
import { ChatPanel } from "./ChatPanel";
import { DemoMode } from "./DemoMode";
import { JuryMode } from "./JuryMode";
import type { AnalyzeResponse, TeamContext } from "@/lib/types";

type View = "workspace" | "demo" | "jury";

const VIEWS: { id: View; label: string }[] = [
  { id: "workspace", label: "Workspace" },
  { id: "demo", label: "Demo mode" },
  { id: "jury", label: "Jury mode" },
];

function RetrievedContext({ data }: { data: AnalyzeResponse }) {
  const { retrieved } = data;
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Related SIH context
        </div>
        <Badge tone="neutral">{retrieved.length}</Badge>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
        Reference only — used to ground guidance, never copied.
      </p>
      <div className="mt-3 space-y-2">
        {retrieved.length === 0 && (
          <p className="text-xs italic text-ink-faint">No close matches in the corpus.</p>
        )}
        {retrieved.map((r) => {
          const inner = (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-accent">{r.year}</span>
                <span className="text-[10px] text-ink-faint">· {Math.round(r.score * 100)}% match</span>
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs font-medium leading-snug text-ink">{r.title}</div>
              <div className="mt-0.5 text-[10px] text-ink-faint">{r.theme} · {r.category}</div>
            </>
          );
          return r.webUrl ? (
            <a
              key={r.id}
              href={r.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-line p-2.5 transition-colors hover:border-accent/30"
            >
              {inner}
            </a>
          ) : (
            <div key={r.id} className="rounded-xl border border-line p-2.5">
              {inner}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Advisories({ data }: { data: AnalyzeResponse }) {
  if (!data.advisories.length) return null;
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Rule engine</div>
      <div className="mt-2.5 space-y-2">
        {data.advisories.map((a, i) => (
          <div
            key={i}
            className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${
              a.severity === "warning"
                ? "border-accent/25 bg-accent-wash text-accent"
                : "border-line bg-canvas/40 text-ink-soft"
            }`}
          >
            {a.message}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function Workspace({
  problem,
  team,
  data,
  onNewProblem,
}: {
  problem: string;
  team: TeamContext;
  data: AnalyzeResponse;
  onNewProblem: () => void;
}) {
  const [view, setView] = useState<View>("workspace");
  const [section, setSection] = useState<SectionId>("problem");
  const { report } = data;

  const title = report.domain || problem.slice(0, 60) + (problem.length > 60 ? "…" : "");

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-4">
              <Wordmark />
              <div className="hidden min-w-0 border-l border-line pl-4 md:block">
                <div className="truncate text-sm font-medium text-ink" title={problem}>{title}</div>
                <div className="truncate text-[11px] text-ink-faint">
                  {[team.teamSize && `${team.teamSize} people`, team.timeRemaining, team.skills]
                    .filter(Boolean)
                    .join(" · ") || "No team context"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="neutral" className="hidden sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {data.meta.model}
              </Badge>
              <Button variant="secondary" size="sm" onClick={onNewProblem}>
                New problem
              </Button>
            </div>
          </div>

          {/* View switch */}
          <div className="flex gap-1 pb-2">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  view === v.id ? "bg-ink text-canvas" : "text-ink-soft hover:bg-black/[0.04]"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 py-6 sm:px-6">
        {view === "workspace" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Main column */}
            <div className="min-w-0">
              {/* Section tabs */}
              <div className="scroll-slim -mx-1 mb-5 flex gap-1 overflow-x-auto px-1 pb-1">
                {SECTION_TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSection(t.id)}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      section === t.id
                        ? "border-accent bg-accent-wash text-accent"
                        : "border-line bg-surface text-ink-soft hover:border-ink/25"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div key={section} className="animate-fade-up">
                <SectionRenderer id={section} report={report} advisories={data.advisories} />
              </div>
            </div>

            {/* Right rail */}
            <aside className="space-y-4 lg:sticky lg:top-[7.5rem] lg:self-start">
              <Card className="h-[460px] overflow-hidden p-0">
                <ChatPanel problem={problem} team={team} report={report} />
              </Card>
              <Advisories data={data} />
              <RetrievedContext data={data} />
            </aside>
          </div>
        )}

        {view === "demo" && (
          <div className="mx-auto max-w-3xl">
            <DemoMode report={report} />
          </div>
        )}

        {view === "jury" && (
          <div className="mx-auto max-w-4xl">
            <JuryMode report={report} />
          </div>
        )}
      </main>
    </div>
  );
}

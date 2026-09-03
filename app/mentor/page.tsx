"use client";

import { useState } from "react";
import { SetupForm } from "@/components/mentor/SetupForm";
import { AnalyzingState } from "@/components/mentor/AnalyzingState";
import { Workspace } from "@/components/mentor/Workspace";
import { analyze } from "@/lib/client";
import type { AnalyzeResponse, TeamContext } from "@/lib/types";

type Stage = "setup" | "analyzing" | "workspace";

export default function MentorPage() {
  const [stage, setStage] = useState<Stage>("setup");
  const [problem, setProblem] = useState("");
  const [team, setTeam] = useState<TeamContext>({});
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalyze(p: string, t: TeamContext) {
    setProblem(p);
    setTeam(t);
    setError(null);
    setStage("analyzing");
    try {
      const result = await analyze(p, t);
      setData(result);
      setStage("workspace");
    } catch (e: any) {
      const code = e?.code;
      const msg =
        code === "missing_key"
          ? "The mentor LLM isn't configured yet. Add your API key to .env.local (LLM_API_KEY) and restart the dev server."
          : e?.message || "Analysis failed. Please try again.";
      setError(msg);
      setStage("setup");
    }
  }

  if (stage === "analyzing") return <div className="min-h-screen bg-canvas"><AnalyzingState /></div>;

  if (stage === "workspace" && data)
    return (
      <Workspace
        problem={problem}
        team={team}
        data={data}
        onNewProblem={() => {
          setStage("setup");
          setData(null);
        }}
      />
    );

  return (
    <div className="min-h-screen bg-canvas bg-hero-wash">
      <SetupForm onSubmit={runAnalyze} error={error} initialProblem={problem} initialTeam={team} />
    </div>
  );
}

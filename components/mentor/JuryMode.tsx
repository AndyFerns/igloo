"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button } from "@/components/ui";
import type { JuryPitch, MentorReport } from "@/lib/types";

const FIELDS: { key: keyof JuryPitch; label: string }[] = [
  { key: "problem", label: "Problem" },
  { key: "users", label: "Users" },
  { key: "gap", label: "Gap" },
  { key: "solution", label: "Solution" },
  { key: "innovation", label: "Innovation" },
  { key: "architecture", label: "Architecture" },
  { key: "prototype", label: "Prototype" },
  { key: "impact", label: "Impact" },
  { key: "validation", label: "Validation" },
  { key: "futureScope", label: "Future scope" },
];

export function JuryMode({ report }: { report: MentorReport }) {
  const [pitch, setPitch] = useState<JuryPitch>(report.jury_pitch);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keep local edits, but resync if a brand-new report arrives.
  useEffect(() => setPitch(report.jury_pitch), [report]);

  function copyOutline() {
    const text = FIELDS.map((f) => `${f.label.toUpperCase()}\n${pitch[f.key] || "—"}`).join("\n\n");
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => {}
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Jury pitch</Badge>
          <span className="text-xs text-ink-faint">A 90-second narrative you can edit</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "Done editing" : "Edit"}
          </Button>
          <Button size="sm" onClick={copyOutline}>
            {copied ? "Copied ✓" : "Copy outline"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {FIELDS.map((f, i) => (
          <Card key={f.key} className="p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-canvas">
                {i + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{f.label}</span>
            </div>
            {editing ? (
              <textarea
                value={pitch[f.key] || ""}
                onChange={(e) => setPitch((p) => ({ ...p, [f.key]: e.target.value }))}
                rows={3}
                className="scroll-slim mt-2 w-full resize-y rounded-lg border border-line bg-canvas/50 px-3 py-2 text-sm leading-relaxed text-ink focus-accent"
              />
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pitch[f.key] || "—"}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

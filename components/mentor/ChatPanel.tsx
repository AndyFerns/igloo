"use client";

import { useEffect, useRef, useState } from "react";
import { MentorCompanion } from "@/components/MentorCompanion";
import { chat } from "@/lib/client";
import type { ChatMessage, MentorReport, TeamContext } from "@/lib/types";

const SUGGESTIONS = [
  "We only have 12 hours left — what changes?",
  "Why did you recommend that MVP?",
  "Give me a simpler alternative to the ML feature.",
  "What's the riskiest assumption here?",
];

export function ChatPanel({
  problem,
  team,
  report,
}: {
  problem: string;
  team: TeamContext;
  report: MentorReport;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await chat({ problem, team, report, messages: next });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Try again.");
      setMessages(messages); // roll back the optimistic user msg on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
        <MentorCompanion mood={loading ? "thinking" : "idle"} size="sm" />
        <div>
          <div className="text-sm font-semibold text-ink">Ask Mewrin</div>
          <div className="text-[11px] text-ink-soft">Grounded in this project</div>
        </div>
      </div>

      <div ref={scrollRef} className="scroll-slim flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-ink-faint">Challenge a recommendation or change your constraints:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full rounded-xl border border-line bg-surface px-3 py-2 text-left text-xs text-ink-soft transition-colors hover:border-accent/30 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-ink text-canvas"
                  : "border border-line bg-surface text-ink-soft"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-4 py-3">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-ink-faint"
                  style={{ animationDelay: `${d * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-accent/25 bg-accent-wash px-3.5 py-2.5 text-xs text-accent">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask, challenge, or change a constraint…"
            className="scroll-slim max-h-28 flex-1 resize-none rounded-xl border border-line bg-canvas/50 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-accent"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-accent-soft disabled:opacity-40"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

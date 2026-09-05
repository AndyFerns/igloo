import { SiteNav, Wordmark } from "@/components/SiteNav";
import { Button, Card, Badge } from "@/components/ui";
import { AbstractFlow } from "@/components/visuals";
import { MentorCompanion } from "@/components/MentorCompanion";

const STEPS = [
  {
    n: "01",
    title: "Paste the problem",
    body: "Drop in your hackathon problem statement and a little team context — size, skills, time left.",
  },
  {
    n: "02",
    title: "Mewrin retrieves & reasons",
    body: "It finds related SIH problems for context, then works through the problem the way a good mentor would.",
  },
  {
    n: "03",
    title: "Coach, don't spoon-feed",
    body: "You get structured guidance across ten areas — plus a live chat to challenge any recommendation.",
  },
];

const SECTIONS = [
  ["Problem", "Plain-language summary, the core tension, and the questions you haven't asked yet."],
  ["Users & personas", "Stakeholders and hypothesis personas — clearly framed as things to validate."],
  ["Design thinking", "Empathize → Define → Ideate → Prototype → Test, with stage-specific prompts."],
  ["Ideas", "Feature ideas across core, differentiator and future — each tied to a real user need."],
  ["Technology", "Frontend, backend, data and AI options weighed against your skills and time."],
  ["MVP", "Rule-scored prioritization: Must / Should / If-time / Future, and one thin flow to build."],
  ["Validation", "Assumptions and how to test them — with ML, hardware and privacy checks."],
  ["Action plan", "A time-aware roadmap that flags dependencies and risky tasks."],
  ["Demo", "A step-by-step user → system → result walkthrough with fallbacks."],
  ["Jury pitch", "A crisp Problem → Gap → Solution → Impact → Future outline you can edit."],
];

const PRINCIPLES = [
  ["Coaches, never ghost-writes", "Mewrin helps you think — it will not hand you a finished project to copy."],
  ["Everything has a why", "Every recommendation comes with its reasoning and trade-offs."],
  ["Assumptions stay honest", "Personas and claims are labelled as hypotheses that need validating."],
  ["Grounded in real context", "Related SIH problem statements are used as reference, never reproduced."],
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteNav />

      {/* Hero */}
      <section className="bg-hero-wash">
        <div className="mx-auto grid max-w-content items-center gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-24">
          <div className="animate-fade-up">
            <Badge tone="accent" className="mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> AI mentor for hackathon teams
            </Badge>
            <h1 className="text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.02em] text-ink sm:text-6xl">
              Understand the problem.
              <br />
              <span className="text-ink-faint">Build the right</span> thing.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Mewrin is a calm, sharp mentor for hackathon teams. Paste your problem statement and it
              walks you from confusion to a demonstrable MVP and a jury-ready pitch — coaching your
              team instead of building the solution for you.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/mentor" size="lg">
                Start mentoring
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
              <Button href="#how" variant="secondary" size="lg">
                How it works
              </Button>
            </div>
            <p className="mt-4 text-xs text-ink-faint">
              No sign-up. Your problem statement stays in your session.
            </p>
          </div>

          {/* Visual + companion */}
          <div className="relative animate-fade-up">
            <Card className="relative overflow-hidden bg-panel-wash p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
                  Signal from noise
                </div>
                <Badge tone="neutral">RAG-grounded</Badge>
              </div>
              <AbstractFlow className="mt-2 w-full" />
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                <MentorCompanion mood="happy" size="sm" />
                <div>
                  <div className="text-sm font-medium text-ink">Meet Mewrin</div>
                  <div className="text-xs text-ink-soft">
                    Your mentor companion — friendly, but it will challenge you.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-9 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          How it works
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6">
              <div className="text-sm font-semibold text-accent">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Sections */}
      <section id="sections" className="border-y border-line bg-white/50">
        <div className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            What you get
          </div>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Ten structured areas — from first read of the problem to the last slide of your pitch.
          </h2>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {SECTIONS.map(([title, body], i) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-ink/20"
              >
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="font-medium text-ink">{title}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-ink-soft">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section id="principles" className="mx-auto max-w-content px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              The approach
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              A mentor, not an autopilot.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              The best hackathon teams win because they understood the problem and made sharp
              trade-offs — not because someone handed them code. Mewrin is built around that.
            </p>
            <div className="mt-6">
              <Button href="/mentor">Start mentoring</Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRINCIPLES.map(([t, b]) => (
              <Card key={t} className="p-5">
                <div className="font-medium text-ink">{t}</div>
                <div className="mt-1.5 text-sm leading-relaxed text-ink-soft">{b}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center sm:px-8">
          <Wordmark />
          <p className="text-xs text-ink-faint">
            Built for TCS Tech Day · P8 Hackathon Mentor. Uses public SIH problem statements as
            reference context only.
          </p>
        </div>
      </footer>
    </div>
  );
}

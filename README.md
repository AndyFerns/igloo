# Frost — Hackathon Mentor AI Assistant

A polished conversational AI **mentor** for hackathon teams. Paste a problem
statement and a little team context; Frost helps you understand the problem,
identify users, apply design thinking, generate and prioritize features, choose
feasible technology, validate assumptions, plan the build, and prepare a demo
and jury pitch — **coaching the team instead of building the solution for it.**

Built for TCS Tech Day · P8. Uses public SIH 2025/2026 problem statements as
**reference context only** (RAG), never reproducing prior solutions.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then add your LLM API key
npm run dev                  # http://localhost:3000
```

Open the app → **Start mentoring** → paste a problem (or "Load example") →
**Analyze**.

### Configure the LLM

The generation layer talks to **any OpenAI-compatible Chat Completions API**.
Set three variables in `.env.local`:

```
LLM_API_KEY=your-key
LLM_BASE_URL=https://api.x.ai/v1      # xAI Grok, OpenAI, OpenRouter, Together, local vLLM…
LLM_MODEL=grok-4                       # or gpt-4o-mini, etc.
```

No key yet? The app still runs — retrieval, the rule engine and the whole UI
work, and the Analyze action returns a clear "not configured" message instead
of crashing.

---

## Architecture

```
User problem + team context
        │
        ▼
  Semantic retrieval  ──►  Relevant SIH 2025/2026 context   (lib/retrieval)
        │
        ▼
     Mentor LLM  ─────────►  Structured JSON                 (lib/llm)
        │
        ▼
  Deterministic rules  ──►  Feature scoring + validation     (lib/rules)
        │
        ▼
  Frontend mentor workspace                                  (app, components)
```

**RAG-first.** The SIH corpus is contextual knowledge — the model is never
asked to memorize it.

| Concern | Where | Notes |
| --- | --- | --- |
| LLM provider | `lib/llm/service.ts` | Provider-agnostic; swap via env vars only. |
| Prompts + contract | `lib/llm/prompts.ts` | System prompt + strict JSON contract. |
| Output validation | `lib/llm/schema.ts` | Loose-coerce + validate; graceful fallback. |
| Retrieval | `lib/retrieval/*` | Loads/normalizes SIH JSON; in-process TF-IDF cosine. |
| Rule engine | `lib/rules/engine.ts` | Feature prioritization, scope + ML/hardware checks. |
| API routes | `app/api/*` | `analyze`, `chat`, `retrieve`, `health`. |
| UI | `app/`, `components/` | Landing, setup, workspace, demo & jury modes. |

### Retrieval (and the FAISS extension point)

For a few hundred SIH problems, a pure-TypeScript **TF-IDF + cosine** index
returns genuinely relevant matches with zero external services (e.g. a
landslide-monitoring query matches the real SIH landslide PS at ~0.52). The
retrieval interface in `lib/retrieval/service.ts` is shaped exactly like an
embedding + FAISS backend would be: to upgrade, implement
`embeddingBackendAvailable()` with an `all-MiniLM-L6-v2` encoder + a FAISS index
at `FAISS_INDEX_PATH` and branch `retrieveSimilar` — the TF-IDF path stays as
the zero-dependency fallback. `EMBEDDING_MODEL` and `FAISS_INDEX_PATH` are
already read from the environment.

Drop a `data/sih2025_problem_statements.json` file in and it is normalized into
the same corpus automatically.

### Deterministic rule engine

Some logic is better done in code than by an LLM. The engine:

- scores each feature on **impact · feasibility · demo value · innovation ·
  complexity** and classifies it **Must Build / Should Build / If Time Allows /
  Future Scope**;
- detects **ML** features → prompts for training data, an evaluation metric, and
  a fallback;
- detects **hardware/IoT** features → prompts to confirm the device exists and
  to prepare a demo simulation;
- flags **scope creep** — and tightens the "Must Build" budget when little time
  remains (e.g. "12 hours left").

---

## The mentor workspace

Ten structured areas, rendered as cards/tabs (not a wall of text):
**Problem · Users & Personas · Design Thinking · Ideas · Technology · MVP ·
Validation · Action Plan**, plus focused **Demo mode** (step-by-step
user → system → result, with fallbacks) and an editable **Jury mode**
(Problem → Users → Gap → Solution → Innovation → Architecture → Prototype →
Impact → Validation → Future). A grounded **chat** lets the team challenge
recommendations, request alternatives, or change constraints mid-session.

`<MentorCompanion />` (`components/MentorCompanion.tsx`) is an original,
license-free SVG mascot isolated behind one component, so a future Three.js /
R3F creature drops in without touching the surrounding UI.

---

## Structured output contract

`/api/analyze` requests JSON with these keys and validates before rendering:
`problem_summary, core_problem, key_questions, stakeholders, personas,
design_thinking, features, technology_choices, prototype_priorities,
validation_checkpoints, assumptions, innovation_prompts, action_plan,
demo_plan, jury_pitch`.

---

## Tech stack

Next.js 14 (App Router) · React · TypeScript · Tailwind CSS. Single stack — the
API routes keep the LLM key server-side; session state is in-memory (no
database needed for the prototype).

## Data & responsible use

Uses publicly available SIH problem statements as reference context only.
Personas and assumptions are presented as **hypotheses to validate**, not
claims about real users. No personal student data; no reproduction of previous
teams' complete solutions. `data/master_ai.xlsx` (Kaggle winning-solution
write-ups) is present in the repo but intentionally not wired into the mentor
flow.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
```

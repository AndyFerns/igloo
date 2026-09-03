import { NextResponse } from "next/server";
import { llmStatus } from "@/lib/llm/service";
import { loadCorpus } from "@/lib/retrieval/corpus";

export const runtime = "nodejs";

export async function GET() {
  const llm = llmStatus();
  let corpusSize = 0;
  try {
    corpusSize = (await loadCorpus()).length;
  } catch {
    corpusSize = 0;
  }
  return NextResponse.json({
    ok: true,
    llm: { configured: llm.configured, model: llm.model },
    retrieval: { corpusSize, backend: "tfidf" },
  });
}

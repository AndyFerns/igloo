import type { RetrievedProblem, SihProblem } from "@/lib/types";
import { loadCorpus } from "./corpus";

/**
 * Semantic-ish retrieval over the SIH corpus.
 *
 * The prototype uses an in-process TF-IDF + cosine index. For a few hundred
 * problem statements this returns genuinely relevant matches with zero external
 * dependencies. The public interface (`retrieveSimilar`) is deliberately the
 * same shape a FAISS + embedding backend would expose, so swapping in
 * EMBEDDING_MODEL / FAISS_INDEX_PATH later is a drop-in replacement — see
 * `embeddingBackendAvailable()` below.
 */

const STOP = new Set(
  "a an the and or of to in on for with by from as at is are be this that these those it its into using use used based system real time data model models solution should shall must will can may help provide develop developing developed platform application app".split(
    " "
  )
);

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

interface IndexedDoc {
  problem: SihProblem;
  tf: Map<string, number>;
  norm: number; // precomputed vector norm over tf-idf weights
}

interface CorpusIndex {
  docs: IndexedDoc[];
  idf: Map<string, number>;
}

let indexPromise: Promise<CorpusIndex> | null = null;

async function buildIndex(): Promise<CorpusIndex> {
  const corpus = await loadCorpus();
  const df = new Map<string, number>();

  // First pass: term frequency per doc + document frequency.
  const partial = corpus.map((p) => {
    const tokens = tokenize(`${p.title} ${p.title} ${p.theme} ${p.description}`);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
    return { problem: p, tf };
  });

  const N = Math.max(corpus.length, 1);
  const idf = new Map<string, number>();
  for (const [term, freq] of df) idf.set(term, Math.log((N + 1) / (freq + 1)) + 1);

  const docs: IndexedDoc[] = partial.map(({ problem, tf }) => {
    let sq = 0;
    for (const [term, count] of tf) {
      const w = count * (idf.get(term) || 0);
      sq += w * w;
    }
    return { problem, tf, norm: Math.sqrt(sq) || 1 };
  });

  return { docs, idf };
}

function queryVector(text: string, idf: Map<string, number>) {
  const tokens = tokenize(text);
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  let sq = 0;
  for (const [term, count] of tf) {
    const w = count * (idf.get(term) || 0);
    sq += w * w;
  }
  return { tf, norm: Math.sqrt(sq) || 1 };
}

function makeSnippet(desc: string, len = 240): string {
  const clean = (desc || "").replace(/\s+/g, " ").trim();
  return clean.length > len ? clean.slice(0, len).trimEnd() + "…" : clean;
}

/** Retrieve the top-K most similar SIH problems for a query. */
export async function retrieveSimilar(
  query: string,
  k = 4
): Promise<RetrievedProblem[]> {
  if (!indexPromise) indexPromise = buildIndex();
  const { docs, idf } = await indexPromise;
  if (docs.length === 0) return []; // graceful empty-context fallback

  const q = queryVector(query, idf);
  if (q.tf.size === 0) return [];

  const scored = docs.map((doc) => {
    let dot = 0;
    // Iterate the smaller map for speed.
    const [small, big] = q.tf.size < doc.tf.size ? [q.tf, doc.tf] : [doc.tf, q.tf];
    for (const [term, count] of small) {
      const other = big.get(term);
      if (other === undefined) continue;
      const w = idf.get(term) || 0;
      dot += count * w * (other * w);
    }
    const score = dot / (q.norm * doc.norm);
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0.02)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ doc, score }) => ({
      id: doc.problem.id,
      year: doc.problem.year,
      title: doc.problem.title,
      organization: doc.problem.organization,
      theme: doc.problem.theme,
      category: doc.problem.category,
      score: Math.round(score * 1000) / 1000,
      snippet: makeSnippet(doc.problem.description),
      webUrl: doc.problem.webUrl,
    }));
}

/**
 * Extension point: return true when a real embedding + FAISS backend is
 * configured and reachable. Wire an all-MiniLM-L6-v2 encoder + a FAISS index
 * at FAISS_INDEX_PATH here, then branch `retrieveSimilar` to use it. The
 * TF-IDF path above remains the zero-dependency fallback.
 */
export function embeddingBackendAvailable(): boolean {
  return false;
}

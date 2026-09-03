import { promises as fs } from "fs";
import path from "path";
import type { SihProblem } from "@/lib/types";

// Loads and normalizes the SIH problem-statement corpus into one canonical
// structure. SIH 2025 and 2026 files can both be dropped in; each is
// normalized to the same shape. Cached in module scope for the process.

let cache: SihProblem[] | null = null;

function stripHtml(s: string): string {
  return (s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalize one raw SIH 2026 JSON record. */
function normalize2026(raw: any): SihProblem | null {
  if (!raw || !raw.title) return null;
  const description =
    stripHtml(raw.description || raw.raw_description || "") ||
    stripHtml(
      Array.isArray(raw.sections)
        ? raw.sections.map((s: any) => `${s.heading || ""} ${s.content || ""}`).join(" ")
        : ""
    );
  return {
    id: String(raw.id || raw.numeric_id || raw.serial_no || raw.title),
    year: 2026,
    title: String(raw.title).trim(),
    organization: String(raw.organization || "").trim(),
    department: String(raw.department || "").trim(),
    category: String(raw.category || "").trim(),
    theme: String(raw.theme || "").trim(),
    description,
    datasetInfo: raw.dataset_info ? stripHtml(raw.dataset_info) : undefined,
    webUrl: raw.web_url || undefined,
  };
}

/** Best-effort normalizer for an unknown/2025-style record shape. */
function normalizeGeneric(raw: any, year: number): SihProblem | null {
  if (!raw) return null;
  const title = raw.title || raw.Title || raw.name;
  if (!title) return null;
  return {
    id: String(raw.id || raw.PS_ID || raw["PS ID"] || title),
    year,
    title: String(title).trim(),
    organization: String(raw.organization || raw.Organization || "").trim(),
    department: String(raw.department || raw.Department || "").trim(),
    category: String(raw.category || raw.Category || "").trim(),
    theme: String(raw.theme || raw.Theme || "").trim(),
    description: stripHtml(raw.description || raw.Description || ""),
    datasetInfo: raw.dataset_info ? stripHtml(raw.dataset_info) : undefined,
    webUrl: raw.web_url || raw["Web URL"] || undefined,
  };
}

async function readJsonSafe(file: string): Promise<any | null> {
  try {
    const buf = await fs.readFile(file, "utf-8");
    return JSON.parse(buf);
  } catch {
    return null;
  }
}

/**
 * Load the corpus. Reads SIH_DATA_PATH (default: the bundled 2026 file) and,
 * if present, an optional 2025 file alongside it. Returns [] gracefully if no
 * data is available so the mentor still works with empty retrieval context.
 */
export async function loadCorpus(): Promise<SihProblem[]> {
  if (cache) return cache;

  const primary =
    process.env.SIH_DATA_PATH ||
    path.join(process.cwd(), "data", "sih2026_problem_statements.json");

  const out: SihProblem[] = [];

  const primaryData = await readJsonSafe(path.resolve(process.cwd(), primary));
  if (primaryData) {
    const list = Array.isArray(primaryData)
      ? primaryData
      : primaryData.problem_statements || primaryData.problems || primaryData.data || [];
    for (const r of list) {
      const n = normalize2026(r) || normalizeGeneric(r, 2026);
      if (n) out.push(n);
    }
  }

  // Optional SIH 2025 file, if the team drops one in.
  const p2025 = path.join(process.cwd(), "data", "sih2025_problem_statements.json");
  const data2025 = await readJsonSafe(p2025);
  if (data2025) {
    const list = Array.isArray(data2025)
      ? data2025
      : data2025.problem_statements || data2025.problems || data2025.data || [];
    for (const r of list) {
      const n = normalizeGeneric(r, 2025);
      if (n) out.push(n);
    }
  }

  cache = out;
  return out;
}

export function clearCorpusCache() {
  cache = null;
}

import { NextResponse } from "next/server";
import { retrieveSimilar } from "@/lib/retrieval/service";

export const runtime = "nodejs";

// Debug/inspection endpoint: see what RAG context a problem retrieves.
export async function POST(req: Request) {
  try {
    const { problem, k } = await req.json();
    if (!problem || typeof problem !== "string") {
      return NextResponse.json({ error: "Provide a 'problem' string." }, { status: 400 });
    }
    const retrieved = await retrieveSimilar(problem, Math.min(Math.max(Number(k) || 5, 1), 8));
    return NextResponse.json({ retrieved });
  } catch {
    return NextResponse.json({ error: "Retrieval failed." }, { status: 500 });
  }
}

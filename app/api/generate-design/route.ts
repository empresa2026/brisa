import { NextResponse } from "next/server";
import { jsonError, readId } from "@/lib/api";
import { runDesign } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const id = await readId(req);
    const result = await runDesign(id);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return jsonError(err);
  }
}

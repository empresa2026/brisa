import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { createFromInput } from "@/lib/pipeline";
import { listProjects } from "@/lib/storage";
import { ProjectInputSchema } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(req: Request) {
  try {
    const parsed = ProjectInputSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    const meta = await createFromInput(parsed.data);
    return NextResponse.json({ id: meta.id });
  } catch (err) {
    return jsonError(err);
  }
}

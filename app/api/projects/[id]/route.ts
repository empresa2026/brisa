import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { loadProject } from "@/lib/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await loadProject(params.id);
    if (!project) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
    return NextResponse.json(project);
  } catch (err) {
    return jsonError(err);
  }
}

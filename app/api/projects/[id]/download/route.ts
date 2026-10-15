import { jsonError } from "@/lib/api";
import { buildStarterZip } from "@/lib/build-engine/exporter";
import { ident } from "@/lib/build-engine/schema";
import { loadProject } from "@/lib/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const p = await loadProject(params.id);
    if (!p) return Response.json({ error: "Projeto não encontrado" }, { status: 404 });
    if (!p.spec || !p.prd || !p.design) return Response.json({ error: "Finalize o build antes de baixar" }, { status: 400 });
    const docs = Object.fromEntries(Object.entries(p.docs).filter((e): e is [string, string] => !!e[1]));
    const zip = await buildStarterZip({ spec: p.spec, prd: p.prd, ds: p.design, docs });
    const name = `${ident(p.prd.appName).replace(/_/g, "-") || "app"}-starter.zip`;
    return new Response(new Uint8Array(zip), {
      headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="${name}"` },
    });
  } catch (err) {
    return jsonError(err);
  }
}

import { jsonError } from "@/lib/api";
import { DOC_FILES } from "@/lib/project";
import { readFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string; name: string } }) {
  try {
    if (!(DOC_FILES as readonly string[]).includes(params.name)) return Response.json({ error: "Arquivo não permitido" }, { status: 404 });
    const content = await readFile(params.id, params.name);
    if (content === null) return Response.json({ error: "Arquivo ainda não gerado" }, { status: 404 });
    return new Response(content, {
      headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename="${params.name}"` },
    });
  } catch (err) {
    return jsonError(err);
  }
}

import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { runEbook } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BYTES = 30 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const id = form.get("id");
    const file = form.get("file");
    if (typeof id !== "string") throw new Error("ID de projeto inválido");
    if (!(file instanceof File)) throw new Error("Arquivo PDF inválido");
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "PDF maior que 30 MB" }, { status: 413 });
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 5).toString() !== "%PDF-") throw new Error("O arquivo enviado não é um PDF válido");
    const result = await runEbook(id, buffer, file.name);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return jsonError(err);
  }
}

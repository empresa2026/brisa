import { NextResponse } from "next/server";
import { LLMRefusal } from "./llm";

export function jsonError(err: unknown, status = 500) {
  const message = err instanceof Error ? err.message : String(err);
  const code = err instanceof LLMRefusal ? 422 : /não encontrado/i.test(message) ? 404 : /inválid|antes/i.test(message) ? 400 : status;
  return NextResponse.json({ error: message }, { status: code });
}

export async function readId(req: Request): Promise<string> {
  const body = (await req.json().catch(() => ({}))) as { id?: unknown };
  if (typeof body.id !== "string") throw new Error("ID de projeto inválido");
  return body.id;
}

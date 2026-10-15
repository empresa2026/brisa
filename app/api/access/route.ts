import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const expected = process.env.BUILDER_ACCESS_CODE;
  if (!expected || code !== expected) return NextResponse.json({ error: "Código inválido" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ab_access", expected, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return res;
}

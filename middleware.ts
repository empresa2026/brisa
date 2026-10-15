import { NextResponse, type NextRequest } from "next/server";

/** Se BUILDER_ACCESS_CODE estiver definido, as APIs exigem o cookie de acesso (protege o custo da IA). */
export function middleware(req: NextRequest) {
  const code = process.env.BUILDER_ACCESS_CODE;
  if (!code || req.nextUrl.pathname === "/api/access") return NextResponse.next();
  if (req.cookies.get("ab_access")?.value === code) return NextResponse.next();
  return NextResponse.json({ error: "Acesso restrito", needsAccess: true }, { status: 401 });
}

export const config = { matcher: "/api/:path*" };

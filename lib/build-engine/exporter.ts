import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";
import type { DesignSystem, PRD } from "../types";
import { toPrismaSchema, toSupabaseSQL, ident } from "./schema";
import type { AppSpec } from "./spec-types";

async function src(rel: string) {
  return fs.readFile(path.join(process.cwd(), rel), "utf8");
}

function claudeMd(prd: PRD, ds: DesignSystem) {
  return `# CLAUDE.md — ${prd.appName}

Este projeto foi gerado pelo **App Builder 1M**. Produto, referências e design já estão decididos — não entreviste o cliente.

## Fontes da verdade
- \`docs/PRD.md\` — 10 must-have, 5 luxo, 3 planos, modelo de dados
- \`docs/PRODUCT.md\` — posicionamento e voz
- \`docs/DESIGN.md\` — tokens, tipografia, princípios e referências Behance
- \`docs/references.md\` — apps reais (Play Store), repos (GitHub) e designs (Behance)
- \`app-spec.json\` — telas atuais do protótipo navegável
- \`supabase/migrations/0001_init.sql\` — schema com RLS (fonte da verdade do banco)

## Fluxo de construção (execute, não pergunte)
1. \`bash instala-fluxo-1M.sh --project\`
2. Design: \`/impeccable init --references="${ds.references.join(",")}"\` e depois \`/frontend-design\` usando os tokens de DESIGN.md. Componentes com shadcn/ui.
3. Plano: \`/superpowers:plan\` a partir do roadmap do PRD (MVP primeiro).
4. Build: \`/superpowers:build\` — Next.js 14 (App Router) + Supabase Auth/DB + Prisma.
5. Banco: revise com \`/supabase-postgres-best-practices\`; nunca desative RLS.
6. Qualidade: rode \`web-design-guidelines\` como gate antes do deploy.
7. Deploy: Vercel (\`vercel --prod\`), com as variáveis do \`.env.example\`.

## Regras
- PT-BR em toda a interface. Pix e WhatsApp são requisitos de base.
- Substitua os dados de exemplo do \`app-spec.json\` por queries reais tela a tela, mantendo o visual.
- LGPD: consentimento no cadastro, exclusão de conta, nada de dados sensíveis em logs.
`;
}

function readme(prd: PRD) {
  return `# ${prd.appName}

> ${prd.tagline}

Starter kit gerado pelo App Builder 1M: protótipo navegável + documentação de produto + banco Supabase com RLS.

## Rodar
\`\`\`bash
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase
npm run dev                  # http://localhost:3000
\`\`\`

## Banco (Supabase)
1. Crie um projeto em https://supabase.com
2. Rode \`supabase/migrations/0001_init.sql\` no SQL Editor (ou \`supabase db push\`)
3. Opcional: \`npx prisma db pull && npx prisma generate\`

## Deploy
\`npx vercel --prod\` — configure as mesmas variáveis do \`.env.example\` na Vercel.

## Continuar com Claude Code
Abra a pasta no Claude Code e siga o \`CLAUDE.md\`.
`;
}

export async function buildStarterZip(opts: {
  spec: AppSpec;
  prd: PRD;
  ds: DesignSystem;
  docs: Record<string, string>;
}): Promise<Buffer> {
  const { spec, prd, ds, docs } = opts;
  const zip = new JSZip();
  const root = zip.folder(ident(prd.appName).replace(/_/g, "-") || "app")!;

  const pkg = {
    name: ident(prd.appName).replace(/_/g, "-") || "app",
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start", "db:pull": "prisma db pull", postinstall: "prisma generate" },
    dependencies: {
      next: "14.2.35",
      react: "18.3.1",
      "react-dom": "18.3.1",
      "lucide-react": "^0.460.0",
      "@supabase/supabase-js": "^2.45.0",
      "@supabase/ssr": "^0.5.2",
      "@prisma/client": "^5.22.0",
    },
    devDependencies: { typescript: "^5.6.0", "@types/react": "^18.3.0", "@types/node": "^20.0.0", prisma: "^5.22.0" },
  };
  root.file("package.json", JSON.stringify(pkg, null, 2));
  root.file("tsconfig.json", JSON.stringify({
    compilerOptions: {
      target: "ES2020", lib: ["dom", "dom.iterable", "esnext"], strict: true, noEmit: true, esModuleInterop: true, module: "esnext",
      moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "preserve", skipLibCheck: true,
      plugins: [{ name: "next" }], paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"],
  }, null, 2));
  root.file("next.config.mjs", "/** @type {import('next').NextConfig} */\nexport default {};\n");
  root.file(".gitignore", "node_modules\n.next\n.env*.local\n");
  root.file(".env.example", "NEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nDATABASE_URL=\nDIRECT_URL=\n");

  root.file("app-spec.json", JSON.stringify(spec, null, 2));
  root.file("components/spec-types.ts", await src("lib/build-engine/spec-types.ts"));
  root.file("components/app-renderer.tsx", await src("components/preview/app-renderer.tsx"));
  root.file("lib/supabase.ts", `import { createBrowserClient } from "@supabase/ssr";

export function supabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
`);
  root.file("app/layout.tsx", `import type { Metadata, Viewport } from "next";
import spec from "@/app-spec.json";
import { googleFontsHref, type AppSpec } from "@/components/spec-types";
import "./globals.css";

export const metadata: Metadata = { title: ${JSON.stringify(prd.appName)}, description: ${JSON.stringify(prd.tagline)} };
export const viewport: Viewport = { themeColor: ${JSON.stringify(ds.colors.primary)}, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={googleFontsHref(spec as AppSpec)} />
      </head>
      <body>{children}</body>
    </html>
  );
}
`);
  root.file("app/globals.css", `html,body{margin:0;height:100%;background:${ds.colors.background}}
.shell{height:100dvh;max-width:480px;margin:0 auto;box-shadow:0 0 0 1px rgba(0,0,0,.04),0 30px 80px rgba(0,0,0,.08)}
`);
  root.file("app/page.tsx", `import spec from "@/app-spec.json";
import type { AppSpec } from "@/components/spec-types";
import { AppRenderer } from "@/components/app-renderer";

export default function Page() {
  return (
    <main className="shell">
      <AppRenderer spec={spec as AppSpec} />
    </main>
  );
}
`);

  root.file("prisma/schema.prisma", toPrismaSchema(prd));
  root.file("supabase/migrations/0001_init.sql", toSupabaseSQL(prd));
  for (const [name, content] of Object.entries(docs)) root.file(`docs/${name}`, content);
  root.file("CLAUDE.md", claudeMd(prd, ds));
  root.file("README.md", readme(prd));
  root.file("instala-fluxo-1M.sh", await src("instala-fluxo-1M.sh"), { unixPermissions: 0o755 });

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", platform: "UNIX" });
}

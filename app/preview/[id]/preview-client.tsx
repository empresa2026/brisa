"use client";

import { AppRenderer } from "@/components/preview/app-renderer";
import { Phone } from "@/components/builder/phone";
import { googleFontsHref, type AppSpec } from "@/lib/build-engine/spec-types";

/** No celular abre em tela cheia (como um app); no desktop, dentro do aparelho. */
export function PreviewClient({ spec }: { spec: AppSpec }) {
  return (
    <main className="min-h-dvh" style={{ background: spec.theme.background }}>
      <link rel="stylesheet" href={googleFontsHref(spec)} />
      <div className="h-dvh md:hidden">
        <AppRenderer spec={spec} />
      </div>
      <div className="hidden min-h-dvh items-center justify-center gap-16 p-10 md:flex">
        <div className="max-w-sm" style={{ color: spec.theme.foreground }}>
          <p className="text-sm font-semibold uppercase tracking-widest opacity-60">Protótipo</p>
          <h1 className="mt-2 text-6xl font-bold leading-none" style={{ fontFamily: `'${spec.theme.fontDisplay}'` }}>{spec.name}</h1>
          <p className="mt-4 text-lg opacity-75" style={{ fontFamily: `'${spec.theme.fontBody}'` }}>{spec.tagline}</p>
          <p className="mt-8 text-sm opacity-60">Abra este link no celular para ver em tela cheia.</p>
        </div>
        <div className="w-[380px]"><Phone spec={spec} /></div>
      </div>
    </main>
  );
}

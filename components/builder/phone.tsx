"use client";

import { AppRenderer } from "@/components/preview/app-renderer";
import { googleFontsHref, type AppSpec } from "@/lib/build-engine/spec-types";

export function Phone({ spec, className = "" }: { spec: AppSpec; className?: string }) {
  return (
    <div className={`relative mx-auto aspect-[9/19] w-full max-w-[370px] rounded-[54px] bg-[#0c0c0e] p-[11px] shadow-[0_50px_100px_-30px_rgba(0,0,0,.45)] ${className}`}>
      <link rel="stylesheet" href={googleFontsHref(spec)} />
      <div className="absolute left-1/2 top-[18px] z-20 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
      <div className="h-full overflow-hidden rounded-[44px]">
        <AppRenderer key={JSON.stringify(spec.theme) + spec.name} spec={spec} />
      </div>
    </div>
  );
}

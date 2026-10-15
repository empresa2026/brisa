import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { SiteHeader } from "@/components/builder/site-header";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meus apps — Builder 1M" };

export default async function ProjectsPage() {
  const projects = await listProjects();
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="container py-12">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h1 className="font-display text-5xl">Meus apps</h1>
          <Button asChild variant="accent"><Link href="/"><Plus /> Novo app</Link></Button>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-16 text-center">
            <p className="font-display text-3xl">Nenhum app ainda</p>
            <p className="mt-2 text-muted-foreground">Comece com 2 linhas sobre o que você faz.</p>
            <Button asChild className="mt-6"><Link href="/">Criar o primeiro</Link></Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const done = p.steps.build.state === "done";
              return (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="group flex h-full flex-col rounded-3xl border bg-card p-6 transition-colors hover:border-foreground/40">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(p.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${done ? "bg-accent text-accent-foreground" : "bg-muted"}`}>{done ? "Pronto" : "Em construção"}</span>
                    </div>
                    <p className="mt-6 font-display text-3xl">{p.appName ?? "Sem nome ainda"}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.tagline ?? p.input.what}</p>
                    <p className="mt-auto flex items-center gap-1 pt-6 text-sm font-semibold">Abrir <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

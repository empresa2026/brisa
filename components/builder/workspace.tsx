"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, BookOpen, Check, Compass, Download, ExternalLink, FileText, Hammer, Layers, Loader2, Maximize2, Palette, RotateCcw,
  Search, Star, Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "@/components/markdown";
import { Phone } from "./phone";
import { takePendingEbook } from "@/lib/client/pending-ebook";
import type { ProjectBundle } from "@/lib/project";
import type { StepId } from "@/lib/types";

const STEPS: { id: StepId; label: string; desc: string; icon: typeof Search; endpoint?: string }[] = [
  { id: "ebook", label: "Leitura do e-book", desc: "Tema, capítulos, exercícios e monetização", icon: BookOpen },
  { id: "references", label: "Reference Engine", desc: "Google Play, App Store, GitHub e Behance", icon: Search, endpoint: "/api/fetch-references" },
  { id: "prd", label: "PM Engine", desc: "PRD com 10 must-have, 5 luxo, 3 planos", icon: Compass, endpoint: "/api/generate-prd" },
  { id: "design", label: "Design Engine", desc: "Direção de arte e design system", icon: Palette, endpoint: "/api/generate-design" },
  { id: "build", label: "Build Engine", desc: "Telas do app e starter kit", icon: Hammer, endpoint: "/api/build-app" },
];

const DOC_LABELS: Record<string, string> = { "PRD.md": "PRD", "PRODUCT.md": "Produto", "DESIGN.md": "Design", "references.md": "Referências" };

const brl = (v: number) => (v === 0 ? "Grátis" : `R$ ${v.toFixed(2).replace(".", ",")}`);

export function Workspace({ initial, autoRun }: { initial: ProjectBundle; autoRun: boolean }) {
  const [bundle, setBundle] = useState(initial);
  const [running, setRunning] = useState<StepId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState("PRD.md");
  const started = useRef(false);
  const id = bundle.meta.id;

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/projects/${id}`, { cache: "no-store" });
    if (r.ok) setBundle(await r.json());
  }, [id]);

  const run = useCallback(async (from?: StepId) => {
    setError(null);
    try {
      const file = takePendingEbook(id);
      if (file) {
        setRunning("ebook");
        const fd = new FormData();
        fd.append("id", id);
        fd.append("file", file);
        const r = await fetch("/api/upload-ebook", { method: "POST", body: fd });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Falha ao ler o e-book");
        await refresh();
      }
      const current = (await (await fetch(`/api/projects/${id}`, { cache: "no-store" })).json()) as ProjectBundle;
      // Roda a partir de `from` (ou do primeiro passo não concluído); tudo depois dele é refeito.
      let reached = false;
      for (const step of STEPS) {
        if (!step.endpoint) continue;
        if (step.id === from || (!from && current.meta.steps[step.id].state !== "done")) reached = true;
        if (!reached) continue;
        setRunning(step.id);
        const r = await fetch(step.endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `Falha em ${step.label}`);
        await refresh();
      }
    } catch (err) {
      setError((err as Error).message);
      await refresh();
    } finally {
      setRunning(null);
    }
  }, [id, refresh]);

  useEffect(() => {
    if (started.current) return;
    const pending = STEPS.some((s) => s.endpoint && bundle.meta.steps[s.id].state !== "done");
    if (autoRun || pending) {
      started.current = true;
      void run();
    }
  }, [autoRun, bundle.meta.steps, run]);

  const { meta, prd, references, design, spec, ebook } = bundle;
  const visibleSteps = STEPS.filter((s) => s.id !== "ebook" || meta.hasEbook || running === "ebook");
  const doneCount = visibleSteps.filter((s) => meta.steps[s.id].state === "done").length;
  const finished = !!spec && !running;

  return (
    <div className="container py-8 lg:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">“{meta.input.what}”{meta.input.where && ` · ${meta.input.where}`}{meta.input.who && ` · ${meta.input.who}`}</p>
          <h1 className="mt-1 truncate font-display text-4xl sm:text-5xl">{meta.appName ?? "Construindo seu app…"}</h1>
          {meta.tagline && <p className="mt-1 text-lg text-muted-foreground">{meta.tagline}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {spec && (
            <Button variant="outline" asChild>
              <Link href={`/preview/${id}`} target="_blank"><Maximize2 /> Tela cheia</Link>
            </Button>
          )}
          {finished && (
            <Button variant="accent" asChild>
              <a href={`/api/projects/${id}/download`}><Download /> Baixar starter kit</a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {spec ? (
            <Phone spec={spec} />
          ) : (
            <div className="relative mx-auto flex aspect-[9/19] w-full max-w-[370px] flex-col items-center justify-center overflow-hidden rounded-[54px] bg-[#121214] p-10 text-center text-white">
              <Loader2 className="relative mb-5 size-8 animate-spin text-accent" />
              <p className="relative font-display text-3xl leading-tight">{running ? STEPS.find((s) => s.id === running)?.label : "Na fila"}</p>
              <p className="relative mt-3 text-sm text-white/60">{running ? STEPS.find((s) => s.id === running)?.desc : "Preparando os motores"}</p>
              <p className="relative mt-10 text-xs text-white/40">Seu app aparece aqui assim que o Build Engine terminar.</p>
            </div>
          )}
          <p className="mt-4 text-center text-xs text-muted-foreground">Protótipo navegável — toque nas abas, checklists e filtros.</p>
        </div>

        <div className="min-w-0">
          <Card className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Pipeline</h2>
              <div className="flex items-center gap-2">
                <Badge variant={meta.engine === "claude" ? "accent" : "muted"}>{meta.engine === "claude" ? "Motor Claude" : "Motor offline"}</Badge>
                <span className="text-xs tabular-nums text-muted-foreground">{doneCount}/{visibleSteps.length}</span>
              </div>
            </div>
            <ol className="space-y-1" aria-live="polite">
              {visibleSteps.map((s) => {
                const st = meta.steps[s.id];
                const state = running === s.id ? "running" : st.state;
                return (
                  <li key={s.id} className="flex items-start gap-3 rounded-xl p-2">
                    <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border ${state === "done" ? "border-transparent bg-accent" : state === "error" ? "border-destructive text-destructive" : state === "running" ? "border-foreground" : "text-muted-foreground"}`}>
                      {state === "done" ? <Check className="size-4" strokeWidth={3} /> : state === "running" ? <Loader2 className="size-4 animate-spin" /> : state === "error" ? <AlertTriangle className="size-4" /> : <s.icon className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{state === "done" || state === "error" ? st.message ?? s.desc : s.desc}</p>
                    </div>
                    {s.endpoint && state !== "running" && !running && (state === "done" || state === "error") && (
                      <Button variant="ghost" size="sm" onClick={() => run(s.id)} aria-label={`Refazer a partir de ${s.label}`}><RotateCcw /> Refazer</Button>
                    )}
                  </li>
                );
              })}
            </ol>
            {error && (
              <div role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={() => run()}>Tentar de novo</Button>
              </div>
            )}
          </Card>

          {meta.engine === "offline" && (
            <div role="note" className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold">Rodando sem IA (motor offline)</p>
              <p className="mt-1">
                O produto foi montado com a biblioteca de nichos e os apps encontrados nas lojas. Para um app 100% sob medida para
                “{meta.input.what}”, configure a variável <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code> na Vercel e clique em Refazer no PM Engine.
              </p>
            </div>
          )}

          <Tabs defaultValue="produto" className="mt-8">
            <TabsList>
              <TabsTrigger value="produto" disabled={!prd}><Layers /> Produto</TabsTrigger>
              <TabsTrigger value="refs" disabled={!references}><Search /> Referências</TabsTrigger>
              <TabsTrigger value="design" disabled={!design}><Palette /> Design</TabsTrigger>
              <TabsTrigger value="docs" disabled={!prd}><FileText /> Documentos</TabsTrigger>
              <TabsTrigger value="export" disabled={!spec}><Download /> Exportar</TabsTrigger>
            </TabsList>

            <TabsContent value="produto">
              {prd ? (
                <div className="space-y-10">
                  {ebook && (
                    <Card className="p-5">
                      <h3 className="flex items-start gap-2 font-display text-2xl"><Upload className="mt-1.5 size-4 shrink-0 text-muted-foreground" aria-hidden />{ebook.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{ebook.summary}</p>
                      <p className="mt-3 text-sm"><b>{ebook.chapters.length}</b> capítulos · <b>{ebook.exercises.length}</b> exercícios viraram funcionalidades</p>
                    </Card>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">{prd.positioning}</p>
                  </div>
                  <section>
                    <h3 className="mb-4 font-display text-3xl">10 essenciais</h3>
                    <ol className="grid gap-3 sm:grid-cols-2">
                      {prd.mustHave.map((f, i) => (
                        <li key={i} className="rounded-2xl border bg-card p-4">
                          <div>
                            <div>
                              <p className="font-semibold">{f.name}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                              <p className="mt-2 text-xs text-muted-foreground/80"><b>Por quê:</b> {f.why}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <section>
                    <h3 className="mb-4 font-display text-3xl">5 de luxo</h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {prd.luxury.map((f, i) => (
                        <li key={i} className="rounded-2xl bg-[#121214] p-4 text-white">
                          <p className="flex items-center gap-2 font-semibold"><Star className="size-4 text-accent" />{f.name}</p>
                          <p className="mt-1 text-sm text-white/65">{f.description}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="mb-4 font-display text-3xl">Monetização</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      {prd.plans.map((p, i) => (
                        <div key={i} className={`rounded-2xl border p-5 ${i === 1 ? "border-2 border-foreground" : "bg-card"}`}>
                          <p className="font-semibold">{p.name}</p>
                          <p className="mt-2 font-display text-4xl">{brl(p.priceBRL)}</p>
                          <p className="text-xs text-muted-foreground">{p.billing}</p>
                          <p className="mt-3 text-sm">{p.pitch}</p>
                          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{p.includes.map((x) => <li key={x} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0" />{x}</li>)}</ul>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : <Empty />}
            </TabsContent>

            <TabsContent value="refs">
              {references ? (
                <div className="space-y-8">
                  <RefGroup title="Google Play" items={references.playstore.map((a) => ({ title: a.title, sub: `${a.developer}${a.rating ? ` · ★ ${a.rating.toFixed(1)}` : ""}`, body: a.summary, tags: a.features.slice(0, 4), url: a.url, live: a.source === "live", icon: a.icon }))} />
                  {!!references.appstore?.length && (
                    <RefGroup title="Apple App Store" items={references.appstore.map((a) => ({ title: a.title, sub: `${a.developer}${a.rating ? ` · ★ ${a.rating.toFixed(1)}` : ""}`, body: a.summary, tags: a.features.slice(0, 4), url: a.url, live: a.source === "live", icon: a.icon }))} />
                  )}
                  <RefGroup title="GitHub" items={references.github.map((r) => ({ title: r.fullName, sub: r.stars ? `★ ${r.stars.toLocaleString("pt-BR")}${r.language ? ` · ${r.language}` : ""}` : "open source", body: r.description, tags: r.topics.slice(0, 4), url: r.url, live: r.source === "live" }))} />
                  <RefGroup title="Behance" items={references.behance.map((d) => ({ title: d.title, sub: d.author, body: d.notes, tags: [], url: d.url, live: d.source === "live", icon: d.cover }))} />
                  <Card className="p-5">
                    <h3 className="font-semibold">Insights</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{references.insights.map((i) => <li key={i}>• {i}</li>)}</ul>
                  </Card>
                </div>
              ) : <Empty />}
            </TabsContent>

            <TabsContent value="design">
              {design ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-3xl">{design.mood}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{design.rationale}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {Object.entries(design.colors).map(([k, v]) => (
                      <div key={k}>
                        <div className="aspect-square rounded-2xl border" style={{ background: v }} />
                        <p className="mt-1.5 text-xs font-semibold">{k}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{v}</p>
                      </div>
                    ))}
                  </div>
                  <Card className="grid gap-4 p-5 sm:grid-cols-2">
                    <div><p className="text-xs text-muted-foreground">Display</p><p className="text-2xl" style={{ fontFamily: `'${design.fonts.display}'` }}>{design.fonts.display}</p></div>
                    <div><p className="text-xs text-muted-foreground">Texto</p><p className="text-2xl" style={{ fontFamily: `'${design.fonts.body}'` }}>{design.fonts.body}</p></div>
                  </Card>
                  <ul className="space-y-2 text-sm">{design.principles.map((p) => <li key={p} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" />{p}</li>)}</ul>
                </div>
              ) : <Empty />}
            </TabsContent>

            <TabsContent value="docs">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {Object.keys(DOC_LABELS).map((d) => (
                  <Button key={d} size="sm" variant={doc === d ? "default" : "outline"} onClick={() => setDoc(d)} disabled={!bundle.docs[d]}>{DOC_LABELS[d]}</Button>
                ))}
                {bundle.docs[doc] && (
                  <Button size="sm" variant="ghost" asChild><a href={`/api/projects/${id}/files/${doc}`}><Download /> {doc}</a></Button>
                )}
              </div>
              <Card className="p-6 sm:p-8">{bundle.docs[doc] ? <Markdown>{bundle.docs[doc]!}</Markdown> : <Empty />}</Card>
            </TabsContent>

            <TabsContent value="export">
              <Card className="p-6 sm:p-8">
                <h3 className="font-display text-3xl">Starter kit pronto para publicar</h3>
                <p className="mt-2 text-muted-foreground">Next.js 14 com este protótipo, Supabase com RLS, Prisma, documentação e CLAUDE.md para continuar o build com Claude Code.</p>
                <pre className="mt-6 overflow-x-auto rounded-xl bg-[#121214] p-4 text-[13px] leading-relaxed text-white/90">{`unzip ${(prd?.appName ?? "app").toLowerCase().replace(/\s+/g, "-")}-starter.zip && cd ${(prd?.appName ?? "app").toLowerCase().replace(/\s+/g, "-")}
npm install && npm run dev        # protótipo em localhost:3000
# Supabase: rode supabase/migrations/0001_init.sql
bash instala-fluxo-1M.sh --project  # skills do fluxo 1M
claude                              # siga o CLAUDE.md
npx vercel --prod                   # deploy`}</pre>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button variant="accent" asChild><a href={`/api/projects/${id}/download`}><Download /> Baixar .zip</a></Button>
                  <Button variant="outline" asChild><Link href={`/preview/${id}`} target="_blank"><ExternalLink /> Link do protótipo para o cliente</Link></Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return <p className="py-10 text-center text-sm text-muted-foreground">Ainda sendo gerado…</p>;
}

function RefGroup({ title, items }: { title: string; items: { title: string; sub: string; body: string; tags: string[]; url: string; live: boolean; icon?: string }[] }) {
  return (
    <section>
      <h3 className="mb-3 font-display text-2xl">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <a key={it.url + it.title} href={it.url} target="_blank" rel="noreferrer" className="group rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/40">
            <div className="flex items-start gap-3">
              {it.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.icon} alt="" className="size-10 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted font-display text-lg">{it.title.charAt(0)}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold"><span className="truncate">{it.title}</span><ExternalLink className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" /></p>
                <p className="text-xs text-muted-foreground">{it.sub}</p>
              </div>
              <Badge variant={it.live ? "accent" : "outline"}>{it.live ? "ao vivo" : "curado"}</Badge>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{it.body}</p>
            {it.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{it.tags.map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t}</span>)}</div>}
          </a>
        ))}
      </div>
    </section>
  );
}

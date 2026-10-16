import { ArrowDownRight, Check } from "lucide-react";
import { InputForm } from "@/components/builder/input-form";
import { SiteHeader } from "@/components/builder/site-header";

const PHASES = [
  { n: "1", title: "Você conta em 2 linhas", body: "O que faz, onde atua e quem paga. Se tiver e-book, o método vira o coração do app." },
  { n: "2", title: "Pesquisamos o mercado", body: "Apps líderes na Google Play e na App Store (features e reviews reais), projetos no GitHub e designs no Behance." },
  { n: "3", title: "Um PM sênior decide", body: "PRD completo: 10 features essenciais, 5 de luxo e 3 planos de monetização — sem te entrevistar." },
  { n: "4", title: "Direção de arte do nicho", body: "Design system autoral, tipografia e paleta pensadas para o seu público. Nada de cara de template." },
  { n: "5", title: "App pronto para seguir", body: "Protótipo navegável no celular + starter kit Next.js 14, Supabase com RLS e Prisma." },
];

const DELIVERABLES = [
  "Protótipo navegável para mostrar a clientes e investidores",
  "PRD.md, PRODUCT.md e DESIGN.md prontos para o time ou para a IA",
  "Relatório de referências com links reais",
  "Banco Supabase com segurança por usuário (RLS)",
  "Projeto Next.js para baixar e publicar na Vercel",
  "CLAUDE.md com o fluxo para continuar o build com Claude Code",
];

const PLANS = [
  { name: "Teste", price: "Grátis", sub: "para validar a ideia", items: ["1 app completo", "Protótipo navegável", "PRD e referências"], hl: false },
  { name: "Criador", price: "R$ 97", sub: "por mês", items: ["Apps ilimitados", "Starter kit para download", "E-book → app", "Motor Claude completo"], hl: true },
  { name: "Agência", price: "R$ 397", sub: "por mês", items: ["Tudo do Criador", "Marca própria nos entregáveis", "Projetos para clientes", "Suporte prioritário"], hl: false },
];

export default function BuilderHome() {
  return (
    <div className="min-h-dvh">
      <div className="relative overflow-hidden bg-[#121214] text-white">
        <SiteHeader dark />
        <section className="container relative grid gap-12 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="flex flex-col justify-center">
            <h1 className="text-balance font-display text-[44px] leading-[0.98] tracking-tight sm:text-6xl lg:text-[76px]">
              Da ideia de 2 linhas ao app com <em className="text-accent not-italic">cara de 1 milhão.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Você não precisa saber o que o app vai ter. Diga o que faz — ou suba seu e-book. Nós pesquisamos os apps que já faturam no seu nicho, escrevemos o produto e desenhamos o app.
            </p>
            <div className="mt-8 hidden items-center gap-3 text-sm text-white/60 lg:flex">
              <ArrowDownRight className="size-4" /> Leva cerca de 2 minutos. Você acompanha cada fase ao vivo.
            </div>
          </div>
          <InputForm />
        </section>
      </div>

      <section className="container py-20 lg:py-28">
        <div className="mb-12 max-w-2xl">
          <h2 className=" text-balance font-display text-4xl leading-tight sm:text-5xl">Cinco motores. Zero perguntas para você.</h2>
        </div>
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {PHASES.map((p) => (
            <li key={p.n} className="border-t-2 border-foreground pt-5">
              <span className="tabular font-display text-3xl">{p.n}</span>
              <h3 className="mt-3 font-semibold leading-snug">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-card">
        <div className="container grid gap-12 py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <h2 className="text-balance font-display text-4xl leading-tight">O que você recebe no final</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Tudo o que uma consultoria de produto entregaria em semanas — em minutos, baseado em apps reais que já faturam.
            </p>
          </div>
          <ul className="divide-y self-center border-y">
            {DELIVERABLES.map((d) => (
              <li key={d} className="flex items-center gap-3 py-4">
                <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container py-20 lg:py-24" id="planos">
        <h2 className="text-center font-display text-4xl sm:text-5xl">Planos</h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-3xl border p-7 ${p.hl ? "bg-[#121214] text-white" : "bg-card"}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                {p.hl && <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-accent-foreground">Mais escolhido</span>}
              </div>
              <p className="mt-6 font-display text-5xl">{p.price}</p>
              <p className={`text-sm ${p.hl ? "text-white/60" : "text-muted-foreground"}`}>{p.sub}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" />{i}</li>)}
              </ul>
              <a href="#" className={`mt-8 flex h-11 items-center justify-center rounded-full text-sm font-semibold ${p.hl ? "bg-accent text-accent-foreground" : "border hover:bg-secondary"}`}>Começar</a>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        Brisa · referências públicas da Google Play, App Store, GitHub e Behance são usadas apenas como pesquisa de mercado.
      </footer>
    </div>
  );
}

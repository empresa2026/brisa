import { z } from "zod";
import { detectArchetype, specificTerms, type Archetype } from "../archetypes";
import { generateStructured, llmEnabled } from "../llm";
import type { EbookExtraction, ProjectInput, References } from "../types";
import { curatedBehance, searchBehance, searchBehanceLite } from "./behance";
import { curatedGithub, searchGithub } from "./github";
import { curatedPlayStore, searchPlayStore } from "./playstore";

const TermsSchema = z.object({
  searchTerms: z.array(z.string()).describe("3 termos curtos em inglês para buscar apps concorrentes na Play Store"),
  githubTerms: z.array(z.string()).describe("2 termos em inglês para repositórios open source do domínio"),
  designTerms: z.array(z.string()).describe("2 termos em inglês para buscar UI de apps do nicho no Behance"),
});

async function deriveTerms(input: ProjectInput, archetype: Archetype, ebook?: EbookExtraction | null) {
  const base = {
    searchTerms: [...specificTerms(`${input.what} ${ebook?.theme ?? ""}`), ...archetype.searchTerms],
    githubTerms: archetype.searchTerms,
    designTerms: [...specificTerms(input.what).slice(0, 1).map((t) => `${t} app`), ...archetype.designTerms],
  };
  if (!llmEnabled()) return base;
  try {
    const t = await generateStructured({
      system: "Você traduz a descrição de um negócio brasileiro em termos de busca precisos (em inglês) para achar concorrentes.",
      user: `Negócio: ${input.what}\nOnde: ${input.where}\nQuem paga: ${input.who}\nTema do e-book: ${ebook?.theme ?? "-"}\nNicho detectado: ${archetype.label}`,
      schema: TermsSchema,
      maxTokens: 2000,
      effort: "low",
    });
    return {
      searchTerms: [...t.searchTerms, ...base.searchTerms],
      githubTerms: [...t.githubTerms, ...base.githubTerms],
      designTerms: [...t.designTerms, ...base.designTerms],
    };
  } catch {
    return base;
  }
}

async function attempt<T>(label: string, fns: (() => Promise<T[]>)[], min: number, fallback: () => T[], log: string[]) {
  for (const fn of fns) {
    try {
      const out = await fn();
      if (out.length >= min) return out;
      log.push(`${label}: poucas respostas ao vivo (${out.length}), tentando alternativa`);
    } catch (err) {
      log.push(`${label}: fonte ao vivo indisponível (${(err as Error).message})`);
    }
  }
  return fallback();
}

export async function fetchReferences(input: ProjectInput, ebook?: EbookExtraction | null) {
  const archetype = detectArchetype(`${input.who} ${ebook?.summary ?? ""}`, ebook?.theme ?? "", input.what);
  const terms = await deriveTerms(input, archetype, ebook);
  const log: string[] = [];
  const extra = specificTerms(input.what);

  const [playstore, github, behance] = await Promise.all([
    attempt("Play Store", [() => searchPlayStore(terms.searchTerms)], 2, () => curatedPlayStore(archetype), log),
    attempt("GitHub", [() => searchGithub(terms.githubTerms)], 1, () => curatedGithub(archetype), log),
    attempt(
      "Behance",
      [() => searchBehance(terms.designTerms), () => searchBehanceLite(terms.designTerms)],
      1,
      () => curatedBehance(archetype, extra),
      log,
    ),
  ]);

  // Garante que o exemplo validado de piscinas sempre apareça junto dos resultados ao vivo.
  if (extra.length && !behance.some((b) => /swimmer/i.test(b.title))) {
    behance.push(...curatedBehance(archetype, extra).slice(0, 1));
  }

  const refs: References = {
    archetype: archetype.id,
    searchTerms: Array.from(new Set(terms.searchTerms)).slice(0, 6),
    playstore,
    github,
    behance,
    insights: buildInsights(archetype, playstore),
    generatedAt: new Date().toISOString(),
  };
  return { refs, archetype, log };
}

function buildInsights(archetype: Archetype, apps: References["playstore"]): string[] {
  const insights: string[] = [];
  const featureCount = new Map<string, number>();
  for (const a of apps) for (const f of a.features) featureCount.set(f, (featureCount.get(f) ?? 0) + 1);
  const common = [...featureCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f]) => f);
  if (common.length) insights.push(`Features recorrentes nas referências: ${common.join("; ")}.`);

  const complaints = apps.flatMap((a) => a.reviews.filter((r) => r.score <= 3).map((r) => `"${r.text.slice(0, 140)}…" (${a.title})`));
  if (complaints.length) insights.push(`Reclamações reais de usuários a evitar: ${complaints.slice(0, 3).join(" | ")}`);

  const praise = apps.flatMap((a) => a.reviews.filter((r) => r.score >= 5).map((r) => `"${r.text.slice(0, 120)}…" (${a.title})`));
  if (praise.length) insights.push(`O que os usuários amam: ${praise.slice(0, 2).join(" | ")}`);

  insights.push(`Nicho detectado: ${archetype.label}. Padrão dos líderes: ${archetype.mustHave.slice(0, 3).map((f) => f.name.toLowerCase()).join(", ")}.`);
  insights.push("No Brasil: Pix, WhatsApp e LGPD são requisitos de base, não diferenciais.");
  return insights;
}

export function referencesToMarkdown(refs: References, log: string[] = []): string {
  const badge = (s: string) => (s === "live" ? "🟢 ao vivo" : "📚 curado");
  const lines: string[] = [];
  lines.push(`# Referências reais — ${refs.archetype}`, "");
  lines.push(`Gerado em ${new Date(refs.generatedAt).toLocaleString("pt-BR")} · termos: ${refs.searchTerms.join(", ")}`, "");
  lines.push("## Google Play", "");
  for (const a of refs.playstore) {
    lines.push(`### [${a.title}](${a.url}) — ${a.developer} ${badge(a.source)}`);
    if (a.rating) lines.push(`Nota ${a.rating.toFixed(1)}${a.installs ? ` · ${a.installs} instalações` : ""}`);
    lines.push("", a.summary, "");
    if (a.features.length) lines.push("**Features:**", ...a.features.map((f) => `- ${f}`), "");
    if (a.reviews.length) lines.push("**Reviews:**", ...a.reviews.map((r) => `- (${r.score}★) ${r.text}`), "");
  }
  lines.push("## GitHub", "");
  for (const r of refs.github) {
    lines.push(`- [${r.fullName}](${r.url}) ${badge(r.source)}${r.stars ? ` · ★ ${r.stars.toLocaleString("pt-BR")}` : ""} — ${r.description}`);
  }
  lines.push("", "## Behance", "");
  for (const d of refs.behance) lines.push(`- [${d.title}](${d.url}) ${badge(d.source)} — ${d.notes}`);
  lines.push("", "## Insights", "", ...refs.insights.map((i) => `- ${i}`));
  if (log.length) lines.push("", "## Log do motor", "", ...log.map((l) => `- ${l}`));
  return lines.join("\n") + "\n";
}

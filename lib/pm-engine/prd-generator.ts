import { getArchetype, type Archetype } from "../archetypes";
import { generateStructured, llmEnabled } from "../llm";
import { PRDSchema, type EbookExtraction, type PRD, type ProjectInput, type References } from "../types";

const NAME_BANK: Record<string, string[]> = {
  finance: ["Prospera", "Rumo", "Cofrinho Pro", "Florescer"],
  fieldservice: ["Rota Clara", "Fluxo Pro", "Campo", "Cristal Pro"],
  fitness: ["Pulso", "Ritmo", "Forja", "Fôlego"],
  health: ["Sereno", "Equilíbrio", "Vital", "Cuidar"],
  beauty: ["Aura", "Lumière", "Navalha", "Brilho"],
  food: ["Fornada", "Sabor Direto", "Prato Cheio", "Brasa"],
  education: ["Trilha", "Método", "Ascende", "Lume"],
  realestate: ["Morada", "Chave", "Endereço", "Lar"],
  pets: ["Patinha", "Bicho Bom", "Focinho", "Matilha"],
  retail: ["Vitrine", "Atelier", "Arara", "Maison"],
  services: ["Prumo", "Norte", "Ofício", "Lume"],
};

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function pmPrompt(theme: string, input: ProjectInput, referencesMd: string, ebook?: EbookExtraction | null) {
  return `Você é PM Sênior com 10 anos em apps de ${theme} que faturam R$ 1 milhão.

Input leigo (o cliente NÃO sabe o que quer — o trabalho de produto é todo seu):
${JSON.stringify(input, null, 2)}
${ebook ? `\nE-book do especialista (o método dele deve virar o coração do app):\n${JSON.stringify(ebook, null, 2)}\n` : ""}
Referências reais coletadas (Play Store, GitHub, Behance):
${referencesMd}

Escreva o PRD completo:
- 10 must-have baseados no que os apps líderes da Play Store fazem e nas reclamações dos reviews (cite a referência no campo "why")
- 5 features de luxo que um cliente rico pagaria
- 3 planos de monetização em reais, coerentes com o público e a cidade
- personas, posicionamento, entidades do banco (snake_case), métricas, roadmap em 3 fases, riscos e voz da marca
- nome do app: curto, brasileiro, memorável, que soe como marca de 1 milhão

NÃO pergunte nada ao usuário. Assuma tudo com base nas referências. Escreva em português do Brasil.
Considere o contexto brasileiro (Pix, WhatsApp, LGPD) quando fizer sentido.`;
}

export async function generatePRD(opts: {
  input: ProjectInput;
  references: References;
  referencesMd: string;
  ebook?: EbookExtraction | null;
}): Promise<{ prd: PRD; engine: "claude" | "offline" }> {
  const archetype = getArchetype(opts.references.archetype);
  if (llmEnabled()) {
    try {
      const prd = await generateStructured({
        system: "Você é um Product Manager sênior brasileiro, obcecado por apps que faturam. Decide com convicção, sem pedir esclarecimentos.",
        user: pmPrompt(opts.ebook?.theme || archetype.label, opts.input, opts.referencesMd, opts.ebook),
        schema: PRDSchema,
        effort: "high",
      });
      return { prd: normalizePRD(prd, archetype, opts.input, opts.ebook), engine: "claude" };
    } catch (err) {
      console.warn("[prd] Claude falhou, usando motor offline:", (err as Error).message);
    }
  }
  return { prd: offlinePRD(archetype, opts.input, opts.references, opts.ebook), engine: "offline" };
}

/** Garante as contagens prometidas (10 / 5 / 3) mesmo se o modelo errar. */
function normalizePRD(prd: PRD, archetype: Archetype, input: ProjectInput, ebook?: EbookExtraction | null): PRD {
  const fallback = offlinePRD(archetype, input, null, ebook);
  const fill = <T>(list: T[], extra: T[], n: number) => [...list, ...extra].slice(0, n);
  return {
    ...prd,
    mustHave: fill(prd.mustHave, fallback.mustHave, 10),
    luxury: fill(prd.luxury, fallback.luxury, 5),
    plans: fill(prd.plans, fallback.plans, 3),
    entities: prd.entities.length ? prd.entities : fallback.entities,
  };
}

/** Features reais extraídas das descrições dos apps encontrados ao vivo na Play Store. */
function liveFeatures(refs: References | null) {
  const out: PRD["mustHave"] = [];
  const seen = new Set<string>();
  for (const app of [...(refs?.playstore ?? []), ...(refs?.appstore ?? [])]) {
    if (app.source !== "live") continue;
    for (const raw of app.features) {
      const text = raw.replace(/^[\s•\-–*✓✔★]+/, "").replace(/\s+/g, " ").trim();
      const name = text.split(/[:.;!–-]/)[0].trim();
      if (name.length < 6 || name.length > 70) continue;
      const key = name.toLowerCase().slice(0, 24);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        description: text.length > name.length ? text : `${name} — presente nos apps líderes do nicho.`,
        why: `Presente em ${app.title}${app.rating ? ` (★ ${app.rating.toFixed(1)})` : ""}, app real encontrado nas lojas.`,
      });
    }
  }
  return out;
}

const STOPWORDS = new Set(["para", "com", "de", "da", "do", "das", "dos", "em", "e", "a", "o", "os", "as", "um", "uma", "app", "aplicativo", "meu", "minha"]);

function namesFromInput(what: string) {
  const word = what
    .split(/[\s,/]+/)
    .map((w) => w.replace(/[^\p{L}]/gu, ""))
    .find((w) => w.length >= 4 && !STOPWORDS.has(w.toLowerCase()));
  if (!word) return NAME_BANK.services;
  const W = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  return [`${W} Pro`, `Meu ${W}`, `${W}+`, `${W} Hub`];
}

export function offlinePRD(archetype: Archetype, input: ProjectInput, refs: References | null, ebook?: EbookExtraction | null): PRD {
  const generic = archetype.apps.length === 0;
  const isPool = /piscina|pool/i.test(input.what);
  const names = isPool
    ? ["Cristal Pro", "Piscina Clara", "Azul Pro", "Lâmina"]
    : generic
      ? namesFromInput(input.what)
      : NAME_BANK[archetype.id] ?? NAME_BANK.services;
  const appName = names[hash(input.what + input.where) % names.length];
  const who = input.who || `${archetype.units.client}s que buscam ${archetype.label.toLowerCase()}`;
  const where = input.where || "Brasil";
  const refNames =
    refs?.playstore.filter((a) => a.source === "live").map((a) => a.title).join(", ") ||
    archetype.apps.map((a) => a.title).join(", ") ||
    "os apps genéricos do mercado";

  // Nicho fora da biblioteca: as features vêm dos concorrentes reais encontrados (até 6).
  // Nicho conhecido: até 2 features reais entram no lugar das menos específicas.
  const live = liveFeatures(refs);
  const mustHave = generic
    ? [...live.slice(0, 6), ...archetype.mustHave].slice(0, 10)
    : [...archetype.mustHave.slice(0, 8), ...live.slice(0, 2), ...archetype.mustHave.slice(8)].slice(0, 10);
  if (ebook) {
    mustHave.splice(7, 2,
      {
        name: `Trilha "${ebook.title}"`,
        description: `Os capítulos do e-book viram módulos interativos: ${ebook.chapters.slice(0, 4).map((c) => c.title).join(", ")}.`,
        why: "Transforma o método do especialista em produto recorrente — o e-book é o diferencial que nenhuma referência tem.",
      },
      {
        name: "Exercícios do livro com progresso",
        description: ebook.exercises.length ? `Exercícios como checklists: ${ebook.exercises.slice(0, 3).join("; ")}.` : "Cada capítulo termina com uma prática guiada e registro de progresso.",
        why: "Aplicação prática aumenta resultado e retenção.",
      },
    );
  }

  return {
    appName,
    tagline: taglineFor(archetype, input),
    problem: `${capitalize(who)} em ${where} não têm uma ferramenta simples que una ${mustHave[0].name.toLowerCase()} e ${mustHave[1].name.toLowerCase()}. Hoje se viram com WhatsApp, planilhas e apps que não foram feitos para isso (${refNames}), que não falam a língua do cliente brasileiro nem cobram via Pix.`,
    positioning: `O ${appName} entrega a experiência dos líderes globais (${refNames}) com o método de ${input.what}, em português, com Pix e WhatsApp nativos e foco em ${who}.`,
    personas: [
      { name: "Cliente final", profile: capitalize(who), job: `Conseguir resultado com ${input.what} sem complicação`, pain: "Falta de acompanhamento e de clareza do próximo passo" },
      { name: "Especialista (você)", profile: `Profissional de ${input.what} em ${where}`, job: "Atender mais gente sem trabalhar mais horas", pain: "Tempo perdido com agenda, cobrança e mensagens repetidas" },
    ],
    mustHave: mustHave.slice(0, 10),
    luxury: archetype.luxury.slice(0, 5),
    plans: archetype.plans.map((p) => ({ ...p, billing: p.priceBRL === 0 ? "por uso" : "mensal" })),
    entities: archetype.entities.map((e) => ({
      name: e.name,
      label: e.label,
      fields: e.fields.map(([name, type]) => ({ name, type: type as PRD["entities"][number]["fields"][number]["type"] })),
    })),
    metrics: ["Receita recorrente mensal (MRR)", "Ativação: % que conclui o onboarding em 24h", "Retenção D30", "Conversão grátis → pago", "NPS"],
    roadmap: [
      { phase: "MVP (semanas 1-4)", items: mustHave.slice(0, 6).map((f) => f.name) },
      { phase: "Monetização (semanas 5-8)", items: [...mustHave.slice(6, 10).map((f) => f.name), `Planos ${archetype.plans.map((p) => p.name).join(" / ")}`] },
      { phase: "Premium (mês 3+)", items: archetype.luxury.slice(0, 3).map((f) => f.name) },
    ],
    risks: [
      "Adoção: o cliente final precisa ver valor no 1º dia — onboarding guiado e resultado imediato",
      "Concorrência de apps gratuitos — diferenciar pelo método e pelo acompanhamento humano",
      "LGPD: dados pessoais com consentimento explícito, RLS no banco e exclusão de conta",
    ],
    brandVoice: voiceFor(archetype),
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function taglineFor(a: Archetype, input: ProjectInput) {
  const map: Record<string, string> = {
    finance: "Seu dinheiro com direção, todo dia.",
    fieldservice: "Sua operação inteira, na palma da mão.",
    fitness: "Treino certo. Resultado que aparece.",
    health: "Cuidado contínuo, entre uma consulta e outra.",
    beauty: "Sua agenda cheia, sua cliente encantada.",
    food: "Do forno ao cliente, sem taxa de marketplace.",
    education: "O método do especialista, no ritmo do aluno.",
    realestate: "O imóvel certo, sem burocracia.",
    pets: "Cuidado de verdade para quem é da família.",
    retail: "Sua marca, com experiência de grande varejo.",
  };
  return map[a.id] ?? `Tudo de ${input.what.charAt(0).toLowerCase()}${input.what.slice(1)} em um app.`;
}

function voiceFor(a: Archetype) {
  const map: Record<Archetype["mood"], string> = {
    trust: "Clara, segura e encorajadora — como uma mentora que já esteve lá.",
    energy: "Direta, motivadora e enérgica — sem gritar.",
    calm: "Acolhedora, serena e precisa.",
    luxury: "Sofisticada, concisa e atenciosa aos detalhes.",
    warm: "Calorosa, apetitosa e próxima.",
    fresh: "Prática, confiável e eficiente — fala de resultado.",
    playful: "Leve, divertida e celebradora de pequenas vitórias.",
  };
  return map[a.mood];
}

/* ---------- Markdown ---------- */

const brl = (v: number) => (v === 0 ? "Grátis / por uso" : `R$ ${v.toFixed(2).replace(".", ",")}`);

export function prdToMarkdown(prd: PRD, input: ProjectInput, engine: string): string {
  const L: string[] = [];
  L.push(`# PRD — ${prd.appName}`, "", `> ${prd.tagline}`, "");
  L.push(`_Gerado pelo PM Engine (${engine}) a partir de: “${input.what}” · ${input.where || "—"} · ${input.who || "—"}_`, "");
  L.push("## Problema", "", prd.problem, "", "## Posicionamento", "", prd.positioning, "");
  L.push("## Personas", "");
  for (const p of prd.personas) L.push(`- **${p.name}** — ${p.profile}. *Job:* ${p.job}. *Dor:* ${p.pain}`);
  L.push("", "## 10 features essenciais (must-have)", "");
  prd.mustHave.forEach((f, i) => L.push(`${i + 1}. **${f.name}** — ${f.description}  \n   _Por quê:_ ${f.why}`));
  L.push("", "## 5 features de luxo", "");
  prd.luxury.forEach((f, i) => L.push(`${i + 1}. **${f.name}** — ${f.description}  \n   _Por quê:_ ${f.why}`));
  L.push("", "## Monetização (3 planos)", "", "| Plano | Preço | Cobrança | Proposta | Inclui |", "|---|---|---|---|---|");
  for (const p of prd.plans) L.push(`| ${p.name} | ${brl(p.priceBRL)} | ${p.billing} | ${p.pitch} | ${p.includes.join(", ")} |`);
  L.push("", "## Modelo de dados", "");
  for (const e of prd.entities) L.push(`- \`${e.name}\` (${e.label}): ${e.fields.map((f) => `${f.name}:${f.type}`).join(", ")}`);
  L.push("", "## Métricas", "", ...prd.metrics.map((m) => `- ${m}`));
  L.push("", "## Roadmap", "");
  for (const r of prd.roadmap) L.push(`### ${r.phase}`, ...r.items.map((i) => `- ${i}`), "");
  L.push("## Riscos", "", ...prd.risks.map((r) => `- ${r}`), "", "## Voz da marca", "", prd.brandVoice, "");
  return L.join("\n");
}

export function productToMarkdown(prd: PRD, refs: References): string {
  return [
    `# PRODUCT — ${prd.appName}`,
    "",
    `**Tagline:** ${prd.tagline}`,
    "",
    `**Para quem:** ${prd.personas[0]?.profile ?? ""}`,
    "",
    `**Promessa:** ${prd.positioning}`,
    "",
    "## Escada de valor",
    "",
    ...prd.plans.map((p) => `- **${p.name}** (${brl(p.priceBRL)}) — ${p.pitch}`),
    "",
    "## Diferenciais vs. referências",
    "",
    ...refs.playstore.map((a) => `- vs **${a.title}**: mesma base (${a.features.slice(0, 2).join(", ") || a.summary}), mas em PT-BR, com Pix/WhatsApp e o método do especialista.`),
    "",
    "## Voz",
    "",
    prd.brandVoice,
    "",
  ].join("\n");
}

import { detectArchetype } from "../archetypes";
import { generateStructured, llmEnabled } from "../llm";
import { EbookExtractionSchema, type EbookExtraction } from "../types";

/** Limite da API para PDFs enviados como documento. */
const MAX_PDF_BYTES_FOR_CLAUDE = 30 * 1024 * 1024;

export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pages: number; title?: string }> {
  // Importa o arquivo interno: o index do pdf-parse v1 roda um teste de debug ao ser importado.
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (b: Buffer) => Promise<{
    text: string;
    numpages: number;
    info?: { Title?: string };
  }>;
  const result = await pdfParse(buffer);
  return { text: result.text ?? "", pages: result.numpages ?? 0, title: result.info?.Title || undefined };
}

const SYSTEM = `Você é editor-chefe e estrategista de produtos digitais no Brasil.
Recebe o e-book de um especialista e extrai a matéria-prima para transformar o conteúdo em um aplicativo pago.
Responda em português do Brasil. Seja específico ao conteúdo do livro; não invente capítulos que não existem.`;

const INSTRUCTIONS = `Extraia do e-book:
- title, theme (tema em poucas palavras), summary (3-4 frases), audience (quem é o leitor ideal)
- chapters: capítulos reais com resumo de 1 frase
- exercises: exercícios, checklists, desafios ou práticas que podem virar funcionalidades interativas
- suggestedMonetization: 3-5 formas concretas de monetizar este conteúdo em app (com faixa de preço em R$)
- appIdeas: 5 funcionalidades de app derivadas diretamente do método do livro`;

export async function parseEbook(buffer: Buffer, fileName: string): Promise<{ extraction: EbookExtraction; text: string }> {
  const { text, pages, title } = await extractPdfText(buffer).catch(() => ({ text: "", pages: 0, title: undefined }));

  if (llmEnabled() && buffer.byteLength <= MAX_PDF_BYTES_FOR_CLAUDE) {
    try {
      const extraction = await generateStructured({
        system: SYSTEM,
        schema: EbookExtractionSchema,
        user: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: buffer.toString("base64") },
            title: fileName,
          },
          { type: "text", text: INSTRUCTIONS },
        ],
      });
      return { extraction, text };
    } catch (err) {
      console.warn("[ebook] Claude falhou, usando heurística:", (err as Error).message);
    }
  }

  return { extraction: heuristicExtraction(text, title || fileName.replace(/\.pdf$/i, ""), pages), text };
}

/** Extração sem IA: capítulos por padrões de título, exercícios por palavras-chave. */
export function heuristicExtraction(text: string, title: string, pages: number): EbookExtraction {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const chapterRe = /^(cap[ií]tulo|chapter|m[óo]dulo|parte|lição|licao|aula)\s*[\divxlc]+\b[\s.:–-]*(.*)$/i;
  const numberedRe = /^(\d{1,2})[.)]\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^.!?]{6,70})$/;
  const isHeading = (l: string) => chapterRe.test(l) || numberedRe.test(l);
  const chapters: EbookExtraction["chapters"] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length && chapters.length < 15; i++) {
    const l = lines[i];
    const m = l.match(chapterRe) || l.match(numberedRe);
    if (!m) continue;
    const name = (m[2] || lines[i + 1] || l).trim().slice(0, 90);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    // Resumo = primeira frase do corpo, parando no próximo título.
    const body: string[] = [];
    for (let j = i + 1; j < lines.length && !isHeading(lines[j]) && body.join(" ").length < 400; j++) body.push(lines[j]);
    const first = body.join(" ").split(/(?<=[.!?])\s+/)[0] ?? "";
    chapters.push({ title: name, summary: first.slice(0, 200) });
  }

  const exerciseRe = /(exerc[ií]cio|atividade|desafio|checklist|pr[áa]tica|tarefa|passo a passo|reflita|anote)/i;
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/);
  const exercises = Array.from(
    new Set(
      sentences
        .filter((x) => exerciseRe.test(x) && x.length > 15 && x.length < 220)
        .map((x) => x.replace(/^.*?(exerc[ií]cio|atividade|desafio|checklist|tarefa)\s*:\s*/i, "").trim())
        .map((x) => x.charAt(0).toUpperCase() + x.slice(1)),
    ),
  ).slice(0, 10);

  const archetype = detectArchetype(text.slice(0, 50_000), title);
  const firstParagraph = sentences.filter((x) => x.length > 60 && !isHeading(x)).slice(0, 2).join(" ").slice(0, 500);

  return {
    title,
    theme: archetype.label,
    summary: firstParagraph || `E-book de ${pages} páginas sobre ${archetype.label.toLowerCase()}.`,
    audience: "Leitores do e-book que querem aplicar o método no dia a dia",
    chapters: chapters.length ? chapters : [{ title: "Conteúdo principal", summary: "Capítulos não identificados automaticamente." }],
    exercises,
    suggestedMonetization: archetype.plans.map((p) => `${p.name} — R$ ${p.priceBRL.toFixed(2).replace(".", ",")}/mês: ${p.pitch}`),
    appIdeas: [
      "Trilha de aulas curtas baseada nos capítulos",
      "Exercícios do livro como checklists interativos com progresso",
      "Desafio de 21 dias aplicando o método",
      "Comunidade de leitores com perguntas ao autor",
      "Diagnóstico inicial que recomenda por qual capítulo começar",
    ],
  };
}

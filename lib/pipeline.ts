import { detectArchetype, getArchetype } from "./archetypes";
import { generateAppSpec } from "./build-engine/app-spec";
import type { AppSpec } from "./build-engine/spec-types";
import { buildDesignSystem, designToMarkdown } from "./design-engine/design-system";
import { parseEbook } from "./extraction/ebook-parser";
import { llmEnabled } from "./llm";
import { generatePRD, prdToMarkdown, productToMarkdown } from "./pm-engine/prd-generator";
import { fetchReferences, referencesToMarkdown } from "./reference-engine";
import { createProject, getMeta, readFile, readJSON, setStep, updateMeta, writeFile, writeJSON } from "./storage";
import type { DesignSystem, EbookExtraction, PRD, ProjectInput, ProjectMeta, References, StepId } from "./types";

export async function createFromInput(input: ProjectInput) {
  const meta = await createProject({
    input,
    hasEbook: false,
    engine: llmEnabled() ? "claude" : "offline",
    steps: {
      input: { state: "done", at: new Date().toISOString() },
      ebook: { state: "skipped" },
      references: { state: "pending" },
      prd: { state: "pending" },
      design: { state: "pending" },
      build: { state: "pending" },
    },
  });
  await writeJSON(meta.id, "input.json", input);
  return meta;
}

async function guard<T>(id: string, step: StepId, fn: () => Promise<T>, doneMsg: (r: T) => string): Promise<T> {
  await setStep(id, step, "running");
  try {
    const r = await fn();
    await setStep(id, step, "done", doneMsg(r));
    return r;
  } catch (err) {
    await setStep(id, step, "error", (err as Error).message);
    throw err;
  }
}

async function requireMeta(id: string): Promise<ProjectMeta> {
  const meta = await getMeta(id);
  if (!meta) throw new Error("Projeto não encontrado");
  return meta;
}

/* Fase 1b — e-book */
export async function runEbook(id: string, file: Buffer, fileName: string) {
  await requireMeta(id);
  await updateMeta(id, (m) => { m.hasEbook = true; });
  return guard(id, "ebook", async () => {
    await writeFile(id, "ebook.pdf", file);
    const { extraction, text } = await parseEbook(file, fileName);
    await writeJSON(id, "ebook.json", extraction);
    await writeFile(id, "ebook.txt", text);
    return extraction;
  }, (e) => `${e.chapters.length} capítulos · ${e.exercises.length} exercícios`);
}

/* Fase 2 — Reference Engine */
export async function runReferences(id: string) {
  const meta = await requireMeta(id);
  const ebook = await readJSON<EbookExtraction>(id, "ebook.json");
  return guard(id, "references", async () => {
    const { refs, log } = await fetchReferences(meta.input, ebook);
    await writeJSON(id, "references.json", refs);
    await writeFile(id, "references.md", referencesToMarkdown(refs, log));
    return refs;
  }, (r) => {
    const apple = r.appstore ?? [];
    const live = [...r.playstore, ...apple, ...r.github, ...r.behance].filter((x) => x.source === "live").length;
    return `${r.playstore.length} Google Play · ${apple.length} App Store · ${r.github.length} repos · ${r.behance.length} designs${live ? ` (${live} ao vivo)` : " (biblioteca curada)"}`;
  });
}

/* Fase 3 — PM Engine */
export async function runPRD(id: string) {
  const meta = await requireMeta(id);
  const [refs, refsMd, ebook] = await Promise.all([
    readJSON<References>(id, "references.json"),
    readFile(id, "references.md"),
    readJSON<EbookExtraction>(id, "ebook.json"),
  ]);
  if (!refs || !refsMd) throw new Error("Rode o Reference Engine antes do PRD");
  return guard(id, "prd", async () => {
    const { prd, engine } = await generatePRD({ input: meta.input, references: refs, referencesMd: refsMd, ebook });
    await writeJSON(id, "prd.json", prd);
    await writeFile(id, "PRD.md", prdToMarkdown(prd, meta.input, engine === "claude" ? "Claude" : "offline"));
    await writeFile(id, "PRODUCT.md", productToMarkdown(prd, refs));
    // DESIGN.md inicial: a direção sai junto com o PRD e é detalhada na Fase 4.
    const ds = buildDesignSystem(getArchetype(refs.archetype), prd, refs);
    await writeFile(id, "DESIGN.md", designToMarkdown(ds, prd));
    await updateMeta(id, (m) => { m.appName = prd.appName; m.tagline = prd.tagline; });
    return prd;
  }, (p) => `${p.appName}: ${p.mustHave.length} must-have · ${p.luxury.length} luxo · ${p.plans.length} planos`);
}

/* Fase 4 — Design Engine */
export async function runDesign(id: string) {
  const [refs, prd] = await Promise.all([readJSON<References>(id, "references.json"), readJSON<PRD>(id, "prd.json")]);
  if (!refs || !prd) throw new Error("Gere o PRD antes do design");
  return guard(id, "design", async () => {
    const ds = buildDesignSystem(getArchetype(refs.archetype), prd, refs);
    await writeJSON(id, "design.json", ds);
    await writeFile(id, "DESIGN.md", designToMarkdown(ds, prd));
    return ds;
  }, (d) => d.mood);
}

/* Fase 5 — Build Engine */
export async function runBuild(id: string) {
  const meta = await requireMeta(id);
  const [refs, prd, ds, ebook] = await Promise.all([
    readJSON<References>(id, "references.json"),
    readJSON<PRD>(id, "prd.json"),
    readJSON<DesignSystem>(id, "design.json"),
    readJSON<EbookExtraction>(id, "ebook.json"),
  ]);
  if (!refs || !prd || !ds) throw new Error("Rode as fases anteriores antes do build");
  return guard(id, "build", async () => {
    const archetype = refs.archetype ? getArchetype(refs.archetype) : detectArchetype("", "", meta.input.what);
    const { spec } = await generateAppSpec({ archetype, prd, ds, input: meta.input, ebook });
    await writeJSON(id, "app-spec.json", spec);
    return spec;
  }, (s: AppSpec) => `${s.screens.length} telas · ${s.screens.reduce((n, x) => n + x.sections.length, 0)} seções`);
}

export const STEP_RUNNERS = {
  references: runReferences,
  prd: runPRD,
  design: runDesign,
  build: runBuild,
} as const;

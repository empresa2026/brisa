/**
 * Smoke test do pipeline completo, sem servidor.
 * Uso: pnpm test:pipeline [caminho/para/ebook.pdf]
 * Usa um DATA_DIR temporário e valida as garantias do produto (10/5/3, telas, SQL com RLS, zip).
 */
import { mkdtempSync, readFileSync } from "fs";
import os from "os";
import path from "path";

process.env.DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "builder-smoke-"));

const CASES = [
  { what: "Limpeza e manutenção de piscinas", where: "Belo Horizonte", who: "Casas e condomínios de alto padrão" },
  { what: "Coach de finanças", where: "BH", who: "Mulheres de 30 a 45" },
  { what: "Barbearia premium", where: "Curitiba", who: "Homens executivos" },
  { what: "Aulas de surf", where: "Florianópolis", who: "Iniciantes adultos" },
];

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(`✘ ${msg}`);
}

async function main() {
  const { createFromInput, runEbook, runReferences, runPRD, runDesign, runBuild } = await import("../lib/pipeline");
  const { loadProject } = await import("../lib/project");
  const { buildStarterZip } = await import("../lib/build-engine/exporter");
  const { toSupabaseSQL } = await import("../lib/build-engine/schema");
  const ebookPath = process.argv[2];

  for (const [i, input] of CASES.entries()) {
    const t0 = Date.now();
    const meta = await createFromInput(input);
    if (ebookPath && i === 1) {
      const e = await runEbook(meta.id, readFileSync(ebookPath), path.basename(ebookPath));
      console.log(`  e-book: ${e.chapters.length} capítulos, ${e.exercises.length} exercícios`);
      console.log(`  capítulos: ${e.chapters.map((c) => c.title).join(" | ")}`);
      console.log(`  exercícios: ${e.exercises.join(" | ")}`);
    }
    const refs = await runReferences(meta.id);
    const prd = await runPRD(meta.id);
    await runDesign(meta.id);
    const spec = await runBuild(meta.id);
    const p = (await loadProject(meta.id))!;

    assert(refs.playstore.length >= 2, "pelo menos 2 apps de referência");
    assert(prd.mustHave.length === 10, "10 must-have");
    assert(prd.luxury.length === 5, "5 luxo");
    assert(prd.plans.length === 3, "3 planos");
    assert(spec.screens.length === spec.tabs.length && spec.tabs.length >= 3, "uma tela por aba");
    const sql = toSupabaseSQL(prd);
    assert((sql.match(/enable row level security/g) ?? []).length === prd.entities.length, "RLS em todas as tabelas");
    for (const f of ["references.md", "PRD.md", "PRODUCT.md", "DESIGN.md"]) assert(p.docs[f], `${f} gerado`);
    const docs = Object.fromEntries(Object.entries(p.docs).filter((e): e is [string, string] => !!e[1]));
    const zip = await buildStarterZip({ spec, prd, ds: p.design!, docs });
    assert(zip.byteLength > 5000, "zip do starter kit");

    console.log(`✔ ${input.what} → ${prd.appName} [${refs.archetype}] · ${spec.screens.length} telas · zip ${(zip.byteLength / 1024).toFixed(0)} KB · ${Date.now() - t0} ms`);
  }
  console.log(`\nTudo certo. Projetos de teste em ${process.env.DATA_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

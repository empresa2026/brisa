import type { AppSpec } from "./build-engine/spec-types";
import { getMeta, readFile, readJSON } from "./storage";
import type { DesignSystem, EbookExtraction, PRD, ProjectMeta, References } from "./types";

export interface ProjectBundle {
  meta: ProjectMeta;
  ebook: EbookExtraction | null;
  references: References | null;
  prd: PRD | null;
  design: DesignSystem | null;
  spec: AppSpec | null;
  docs: Record<string, string | null>;
}

export const DOC_FILES = ["references.md", "PRD.md", "PRODUCT.md", "DESIGN.md"] as const;

export async function loadProject(id: string): Promise<ProjectBundle | null> {
  const meta = await getMeta(id);
  if (!meta) return null;
  const [ebook, references, prd, design, spec, ...docs] = await Promise.all([
    readJSON<EbookExtraction>(id, "ebook.json"),
    readJSON<References>(id, "references.json"),
    readJSON<PRD>(id, "prd.json"),
    readJSON<DesignSystem>(id, "design.json"),
    readJSON<AppSpec>(id, "app-spec.json"),
    ...DOC_FILES.map((f) => readFile(id, f)),
  ]);
  return { meta, ebook, references, prd, design, spec, docs: Object.fromEntries(DOC_FILES.map((f, i) => [f, docs[i]])) };
}

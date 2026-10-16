import { z } from "zod";

/* ---------- Fase 1: input leigo ---------- */

export const ProjectInputSchema = z.object({
  what: z.string().trim().min(2, "Conte em poucas palavras o que você faz").max(400),
  where: z.string().trim().max(160).default(""),
  who: z.string().trim().max(240).default(""),
});
export type ProjectInput = z.infer<typeof ProjectInputSchema>;

export const EbookExtractionSchema = z.object({
  title: z.string(),
  theme: z.string(),
  summary: z.string(),
  audience: z.string(),
  chapters: z.array(z.object({ title: z.string(), summary: z.string() })),
  exercises: z.array(z.string()),
  suggestedMonetization: z.array(z.string()),
  appIdeas: z.array(z.string()),
});
export type EbookExtraction = z.infer<typeof EbookExtractionSchema>;

/* ---------- Fase 2: referências ---------- */

export type ReferenceSource = "live" | "curated";

export interface StoreApp {
  title: string;
  developer: string;
  url: string;
  icon?: string;
  rating?: number;
  installs?: string;
  summary: string;
  features: string[];
  reviews: { text: string; score: number }[];
  source: ReferenceSource;
}

export interface GithubRepo {
  fullName: string;
  url: string;
  description: string;
  stars: number;
  topics: string[];
  language?: string;
  source: ReferenceSource;
}

export interface DesignRef {
  title: string;
  author: string;
  url: string;
  cover?: string;
  notes: string;
  source: ReferenceSource;
}

export interface References {
  archetype: string;
  searchTerms: string[];
  playstore: StoreApp[];
  /** Ausente em projetos criados antes da integração com a Apple App Store. */
  appstore?: StoreApp[];
  github: GithubRepo[];
  behance: DesignRef[];
  insights: string[];
  generatedAt: string;
}

/* ---------- Fase 3: PRD ---------- */

export const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  why: z.string().describe("Qual referência real ou dor justifica a feature"),
});

export const PlanSchema = z.object({
  name: z.string(),
  priceBRL: z.number().describe("Preço mensal em reais"),
  billing: z.string().describe("ex: mensal, anual, por uso"),
  pitch: z.string(),
  includes: z.array(z.string()),
});

export const EntitySchema = z.object({
  name: z.string().describe("snake_case, plural, ex: clients"),
  label: z.string(),
  fields: z.array(
    z.object({
      name: z.string().describe("snake_case"),
      type: z.enum(["text", "integer", "numeric", "boolean", "date", "timestamptz", "jsonb", "uuid"]),
    }),
  ),
});

export const PRDSchema = z.object({
  appName: z.string().describe("Nome curto, memorável, brasileiro, sem clichês genéricos"),
  tagline: z.string(),
  problem: z.string(),
  positioning: z.string().describe("Como se diferencia das referências"),
  personas: z.array(z.object({ name: z.string(), profile: z.string(), job: z.string(), pain: z.string() })),
  mustHave: z.array(FeatureSchema).describe("Exatamente 10 features essenciais"),
  luxury: z.array(FeatureSchema).describe("Exatamente 5 features premium que um cliente rico pagaria"),
  plans: z.array(PlanSchema).describe("Exatamente 3 planos"),
  entities: z.array(EntitySchema).describe("4 a 7 tabelas principais do banco"),
  metrics: z.array(z.string()).describe("KPIs norte"),
  roadmap: z.array(z.object({ phase: z.string(), items: z.array(z.string()) })),
  risks: z.array(z.string()),
  brandVoice: z.string(),
});
export type PRD = z.infer<typeof PRDSchema>;

/* ---------- Fase 4: design ---------- */

export interface DesignSystem {
  mood: string;
  rationale: string;
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
  dark: boolean;
  radius: number;
  fonts: { display: string; body: string };
  density: "comfortable" | "compact";
  references: string[];
  principles: string[];
}

/* ---------- Status ---------- */

export type StepId = "input" | "ebook" | "references" | "prd" | "design" | "build";
export type StepState = "pending" | "running" | "done" | "error" | "skipped";

export interface ProjectMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: ProjectInput;
  hasEbook: boolean;
  engine: "claude" | "offline";
  steps: Record<StepId, { state: StepState; message?: string; at?: string }>;
  appName?: string;
  tagline?: string;
}

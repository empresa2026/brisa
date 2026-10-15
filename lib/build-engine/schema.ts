import type { PRD } from "../types";

type Entity = PRD["entities"][number];
type FieldType = Entity["fields"][number]["type"];

const RESERVED = new Set(["id", "owner_id", "created_at", "updated_at"]);

export function ident(s: string) {
  const out = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^(\d)/, "_$1");
  return out || "item";
}

function cleanEntities(entities: Entity[]) {
  const seen = new Set<string>();
  return entities
    .map((e) => ({
      ...e,
      name: ident(e.name),
      fields: e.fields.map((f) => ({ ...f, name: ident(f.name) })).filter((f, i, arr) => !RESERVED.has(f.name) && arr.findIndex((x) => x.name === f.name) === i),
    }))
    .filter((e) => (seen.has(e.name) ? false : (seen.add(e.name), true)));
}

/** Resolve "client_id" → tabela "clients" quando existir. */
function fkTarget(field: string, tables: string[]) {
  if (!field.endsWith("_id")) return null;
  const base = field.slice(0, -3);
  return tables.find((t) => t === `${base}s` || t === `${base}es` || t === base || t === `${base.replace(/y$/, "ies")}`) ?? null;
}

const SQL_TYPES: Record<FieldType, string> = {
  text: "text",
  integer: "integer",
  numeric: "numeric(12,2)",
  boolean: "boolean",
  date: "date",
  timestamptz: "timestamptz",
  jsonb: "jsonb",
  uuid: "uuid",
};

/**
 * Migração Supabase seguindo supabase-postgres-best-practices:
 * - owner_id com default auth.uid() e RLS por dono em todas as tabelas
 * - (select auth.uid()) nas policies (avaliado 1x por query, não por linha)
 * - índices em todas as FKs e em owner_id
 * - políticas separadas por operação, restritas ao papel authenticated
 */
export function toSupabaseSQL(prd: PRD): string {
  const entities = cleanEntities(prd.entities);
  const tables = entities.map((e) => e.name);
  // Tabelas referenciadas precisam existir antes: ordena por dependência.
  const ordered: typeof entities = [];
  const pending = [...entities];
  while (pending.length) {
    const idx = pending.findIndex((e) => e.fields.every((f) => {
      const t = fkTarget(f.name, tables);
      return !t || t === e.name || ordered.some((o) => o.name === t);
    }));
    ordered.push(...pending.splice(idx === -1 ? 0 : idx, 1));
  }

  const L: string[] = [
    `-- ${prd.appName}: schema inicial`,
    "-- Gerado pelo Build Engine. Revise antes de aplicar em produção.",
    "",
    "",
    "create or replace function public.set_updated_at() returns trigger",
    "language plpgsql set search_path = '' as $$",
    "begin new.updated_at = now(); return new; end; $$;",
    "",
  ];

  for (const e of ordered) {
    const cols = [
      "  id uuid primary key default gen_random_uuid()",
      "  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade",
      ...e.fields.map((f) => {
        const target = f.type === "uuid" ? fkTarget(f.name, tables) : null;
        return `  ${f.name} ${SQL_TYPES[f.type]}${target ? ` references public.${target}(id) on delete cascade` : ""}`;
      }),
      "  created_at timestamptz not null default now()",
      "  updated_at timestamptz not null default now()",
    ];
    L.push(`-- ${e.label}`, `create table public.${e.name} (`, cols.join(",\n"), ");", "");
    L.push(`create index ${e.name}_owner_id_idx on public.${e.name} (owner_id);`);
    for (const f of e.fields) {
      if (f.type === "uuid" && fkTarget(f.name, tables)) L.push(`create index ${e.name}_${f.name}_idx on public.${e.name} (${f.name});`);
    }
    L.push(
      `create trigger ${e.name}_updated_at before update on public.${e.name} for each row execute function public.set_updated_at();`,
      `alter table public.${e.name} enable row level security;`,
      `create policy "${e.name}_select_own" on public.${e.name} for select to authenticated using ((select auth.uid()) = owner_id);`,
      `create policy "${e.name}_insert_own" on public.${e.name} for insert to authenticated with check ((select auth.uid()) = owner_id);`,
      `create policy "${e.name}_update_own" on public.${e.name} for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);`,
      `create policy "${e.name}_delete_own" on public.${e.name} for delete to authenticated using ((select auth.uid()) = owner_id);`,
      "",
    );
  }
  return L.join("\n");
}

const PRISMA_TYPES: Record<FieldType, string> = {
  text: "String?",
  integer: "Int?",
  numeric: "Decimal? @db.Decimal(12, 2)",
  boolean: "Boolean?",
  date: "DateTime? @db.Date",
  timestamptz: "DateTime? @db.Timestamptz(6)",
  jsonb: "Json?",
  uuid: "String? @db.Uuid",
};

function pascal(s: string) {
  return s.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

export function toPrismaSchema(prd: PRD): string {
  const entities = cleanEntities(prd.entities);
  const L = [
    "// Prisma espelha o schema do Supabase (supabase/migrations). A migração SQL é a fonte da verdade,",
    "// pois contém RLS. Use `prisma db pull` após aplicar a migração para sincronizar.",
    "generator client {",
    '  provider = "prisma-client-js"',
    "}",
    "",
    "datasource db {",
    '  provider  = "postgresql"',
    '  url       = env("DATABASE_URL")',
    '  directUrl = env("DIRECT_URL")',
    "}",
    "",
  ];
  for (const e of entities) {
    L.push(`/// ${e.label}`, `model ${pascal(e.name)} {`);
    L.push('  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid');
    L.push('  ownerId   String   @map("owner_id") @db.Uuid');
    for (const f of e.fields) {
      const name = f.name.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
      L.push(`  ${name} ${PRISMA_TYPES[f.type]}${name !== f.name ? ` @map("${f.name}")` : ""}`);
    }
    L.push('  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)');
    L.push('  updatedAt DateTime @default(now()) @map("updated_at") @db.Timestamptz(6)');
    L.push("", "  @@index([ownerId])", `  @@map("${e.name}")`, "}", "");
  }
  return L.join("\n");
}

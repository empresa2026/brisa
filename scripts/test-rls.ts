/**
 * Prova de isolamento do SQL gerado (skill supabase-postgres-best-practices → security-rls-*).
 * Sobe um Postgres real em memória (PGlite), simula o ambiente Supabase (auth.users, auth.uid(),
 * papéis anon/authenticated com os grants padrão do Supabase) e verifica, para cada nicho:
 *   1. usuário A grava e lê os próprios dados
 *   2. usuário B não vê nem altera os dados de A
 *   3. anon não acessa nada
 */
import { PGlite } from "@electric-sql/pglite";
import { getArchetype, ARCHETYPES, GENERIC_ARCHETYPE } from "../lib/archetypes";
import { offlinePRD } from "../lib/pm-engine/prd-generator";
import { toSupabaseSQL } from "../lib/build-engine/schema";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

const SUPABASE_STUB = `
create schema auth;
create table auth.users (id uuid primary key);
insert into auth.users values ('${A}'), ('${B}');
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role anon nologin;
create role authenticated nologin;
grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
-- Supabase concede tudo nas tabelas novas do schema public a anon e authenticated por padrão:
alter default privileges in schema public grant all on tables to anon, authenticated;
`;

async function as(db: PGlite, role: string, uid: string | null, sql: string) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${role};`);
  try {
    return await db.query<Record<string, unknown>>(sql);
  } finally {
    await db.exec("reset role;");
  }
}

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(`✘ ${msg}`);
}

async function main() {
  const niches = [...ARCHETYPES, GENERIC_ARCHETYPE];
  for (const a of niches) {
    const prd = offlinePRD(getArchetype(a.id), { what: a.label, where: "BH", who: "" }, null);
    const db = new PGlite();
    await db.exec(SUPABASE_STUB);
    await db.exec(toSupabaseSQL(prd));

    // Tabela sem FKs obrigatórias para o teste de escrita.
    const table = prd.entities[0].name;
    await as(db, "authenticated", A, `insert into public.${table} default values`);
    const ownA = await as(db, "authenticated", A, `select count(*)::int as n from public.${table}`);
    const seenByB = await as(db, "authenticated", B, `select count(*)::int as n from public.${table}`);
    const updByB = await as(db, "authenticated", B, `update public.${table} set updated_at = now() returning id`);
    let anonBlocked = false;
    try {
      await as(db, "anon", null, `select * from public.${table}`);
    } catch {
      anonBlocked = true;
    }
    let spoofBlocked = false;
    try {
      await as(db, "authenticated", B, `insert into public.${table} (owner_id) values ('${A}')`);
    } catch {
      spoofBlocked = true;
    }

    assert(ownA.rows[0].n === 1, `${a.id}: A deveria ver 1 linha`);
    assert(seenByB.rows[0].n === 0, `${a.id}: B não pode ver dados de A`);
    assert(updByB.rows.length === 0, `${a.id}: B não pode alterar dados de A`);
    assert(anonBlocked, `${a.id}: anon não pode ler`);
    assert(spoofBlocked, `${a.id}: B não pode gravar em nome de A`);
    console.log(`✔ ${a.id.padEnd(12)} ${prd.entities.length} tabelas · isolamento A/B ok · anon bloqueado · falsificação de dono bloqueada`);
    await db.close();
  }
  console.log("\nRLS verificado em todos os nichos.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

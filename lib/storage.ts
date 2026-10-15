import { promises as fs } from "fs";
import path from "path";
import { customAlphabet } from "nanoid";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ProjectMeta, StepId } from "./types";

const newId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

export function dataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  // Na Vercel o filesystem do deploy é somente leitura; /tmp é gravável.
  if (process.env.VERCEL) return "/tmp/projects";
  return path.join(process.cwd(), "data", "projects");
}

const ID_RE = /^[0-9a-z]{10}$/;

export function projectDir(id: string) {
  if (!ID_RE.test(id)) throw new Error("ID de projeto inválido");
  return path.join(dataDir(), id);
}

/*
 * Dois backends: disco local (padrão) ou Supabase Storage, ativado por
 * SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. Em serverless (Vercel) use o Supabase:
 * /tmp não é compartilhado entre invocações.
 */
const BUCKET = process.env.SUPABASE_BUCKET || "builder-projects";
let sb: SupabaseClient | null | undefined;
function remote(): SupabaseClient | null {
  if (sb === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    sb = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return sb;
}

const CONTENT_TYPES: Record<string, string> = { ".json": "application/json", ".md": "text/markdown", ".pdf": "application/pdf", ".txt": "text/plain" };

function safeName(name: string) {
  if (!/^[A-Za-z0-9._-]+$/.test(name)) throw new Error("Nome de arquivo inválido");
  return name;
}

export async function writeFile(id: string, name: string, content: string | Buffer) {
  const dir = projectDir(id);
  const client = remote();
  if (client) {
    const { error } = await client.storage.from(BUCKET).upload(`${id}/${safeName(name)}`, content, {
      upsert: true,
      contentType: `${CONTENT_TYPES[path.extname(name)] ?? "application/octet-stream"}; charset=utf-8`,
    });
    if (error) throw new Error(`Falha ao salvar ${name}: ${error.message}`);
    return;
  }
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safeName(name)), content);
}

export async function readBuffer(id: string, name: string): Promise<Buffer | null> {
  const dir = projectDir(id);
  const client = remote();
  if (client) {
    const { data, error } = await client.storage.from(BUCKET).download(`${id}/${safeName(name)}`);
    return error || !data ? null : Buffer.from(await data.arrayBuffer());
  }
  try {
    return await fs.readFile(path.join(dir, safeName(name)));
  } catch {
    return null;
  }
}

export async function readFile(id: string, name: string): Promise<string | null> {
  const buf = await readBuffer(id, name);
  return buf ? buf.toString("utf8") : null;
}

export async function readJSON<T>(id: string, name: string): Promise<T | null> {
  const raw = await readFile(id, name);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function writeJSON(id: string, name: string, data: unknown) {
  await writeFile(id, name, JSON.stringify(data, null, 2));
}

export async function createProject(meta: Omit<ProjectMeta, "id" | "createdAt" | "updatedAt">) {
  const id = newId();
  const now = new Date().toISOString();
  const full: ProjectMeta = { ...meta, id, createdAt: now, updatedAt: now };
  await writeJSON(id, "meta.json", full);
  return full;
}

export async function getMeta(id: string) {
  return readJSON<ProjectMeta>(id, "meta.json");
}

export async function updateMeta(id: string, patch: (m: ProjectMeta) => void) {
  const meta = await getMeta(id);
  if (!meta) throw new Error("Projeto não encontrado");
  patch(meta);
  meta.updatedAt = new Date().toISOString();
  await writeJSON(id, "meta.json", meta);
  return meta;
}

export async function setStep(id: string, step: StepId, state: ProjectMeta["steps"][StepId]["state"], message?: string) {
  return updateMeta(id, (m) => {
    m.steps[step] = { state, message, at: new Date().toISOString() };
  });
}

async function listIds(): Promise<string[]> {
  const client = remote();
  if (client) {
    const { data, error } = await client.storage.from(BUCKET).list("", { limit: 1000, sortBy: { column: "name", order: "desc" } });
    if (error) throw new Error(error.message);
    return data.map((d) => d.name);
  }
  return fs.readdir(dataDir());
}

export async function listProjects(): Promise<ProjectMeta[]> {
  try {
    const ids = await listIds();
    const metas = await Promise.all(ids.filter((i) => ID_RE.test(i)).map((i) => getMeta(i)));
    return metas.filter((m): m is ProjectMeta => !!m).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

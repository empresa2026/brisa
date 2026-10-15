import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

/**
 * Camada única de acesso à Claude. Sem credencial configurada, o builder roda
 * no motor offline (biblioteca curada + heurísticas) — nunca quebra.
 */
export function llmEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";
type Effort = "low" | "medium" | "high" | "xhigh" | "max";
const EFFORT = (process.env.CLAUDE_EFFORT as Effort) || "medium";

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ timeout: 280_000, maxRetries: 2 });
  return client;
}

export class LLMRefusal extends Error {}

type UserContent = Anthropic.Beta.Messages.BetaContentBlockParam[] | string;

/** Chamada com saída estruturada validada por Zod. Retorna o objeto já parseado. */
export async function generateStructured<S extends z.ZodType>(opts: {
  system: string;
  user: UserContent;
  schema: S;
  maxTokens?: number;
  effort?: Effort;
}): Promise<z.infer<S>> {
  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
    output_config: { effort: opts.effort ?? EFFORT, format: betaZodOutputFormat(opts.schema) },
  });

  if (response.stop_reason === "refusal") {
    throw new LLMRefusal("A Claude recusou esta solicitação.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Resposta da Claude truncada (max_tokens).");
  }
  if (!response.parsed_output) {
    throw new Error("A Claude não retornou JSON válido.");
  }
  return response.parsed_output as z.infer<S>;
}

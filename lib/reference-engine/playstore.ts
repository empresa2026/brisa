import type { Archetype } from "../archetypes";
import type { StoreApp } from "../types";

const TIMEOUT_MS = 12_000;

function withTimeout<T>(p: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

/** Extrai frases de feature da descrição da loja (bullets e linhas curtas). */
function featuresFromDescription(desc: string): string[] {
  return desc
    .split(/\r?\n|•|★|✓|✔|- /)
    .map((s) => s.replace(/<[^>]+>/g, "").trim())
    .filter((s) => s.length > 12 && s.length < 110 && !/https?:|@|copyright|privacy/i.test(s))
    .slice(0, 8);
}

export interface StoreQuery {
  term: string;
  lang: string;
  country: string;
}

/** Termo digitado pelo usuário → loja brasileira; termos derivados em inglês → loja americana. */
export function toQueries(ptTerms: string[], enTerms: string[]): StoreQuery[] {
  return [
    ...ptTerms.filter(Boolean).map((term) => ({ term, lang: "pt", country: "br" })),
    ...enTerms.filter(Boolean).map((term) => ({ term, lang: "en", country: "us" })),
  ];
}

/** Busca 3 apps reais do tema na Google Play, com features e reviews. */
export async function searchPlayStore(queries: StoreQuery[], limit = 3): Promise<StoreApp[]> {
  const gplay = (await import("google-play-scraper")).default;
  const results: StoreApp[] = [];
  const seen = new Set<string>();

  for (const { term, lang, country } of queries) {
    if (results.length >= limit) break;
    const found = await withTimeout(gplay.search({ term, num: 6, lang, country }));
    for (const hit of found) {
      if (results.length >= limit || seen.has(hit.appId)) continue;
      seen.add(hit.appId);
      const [details, reviews] = await Promise.all([
        withTimeout(gplay.app({ appId: hit.appId, lang, country })).catch(() => null),
        withTimeout(gplay.reviews({ appId: hit.appId, num: 20, sort: 1 /* HELPFULNESS */ as never, lang, country })).catch(() => null),
      ]);
      const reviewList = (reviews?.data ?? [])
        .filter((r: { text?: string }) => r.text && r.text.length > 40)
        .slice(0, 4)
        .map((r: { text: string; score: number }) => ({ text: r.text.slice(0, 280), score: r.score }));
      results.push({
        title: hit.title,
        developer: hit.developer,
        url: hit.url,
        icon: hit.icon,
        rating: hit.score ?? details?.score,
        installs: details?.installs,
        summary: hit.summary ?? details?.summary ?? "",
        features: featuresFromDescription(details?.description ?? ""),
        reviews: reviewList,
        source: "live",
      });
    }
  }
  return results;
}

export function curatedPlayStore(archetype: Archetype, userQuery = ""): StoreApp[] {
  if (!archetype.apps.length && userQuery) {
    // Nicho fora da biblioteca e loja indisponível: aponta para a busca real, sem inventar apps.
    return [{
      title: `Apps de "${userQuery}" na Google Play`,
      developer: "Busca na loja brasileira",
      url: `https://play.google.com/store/search?q=${encodeURIComponent(userQuery)}&c=apps&hl=pt_BR&gl=BR`,
      summary: "A loja não respondeu no momento da pesquisa. Abra a busca para ver os concorrentes.",
      features: [],
      reviews: [],
      source: "curated",
    }];
  }
  return archetype.apps.map((a) => ({
    title: a.title,
    developer: a.developer,
    url: `https://play.google.com/store/search?q=${encodeURIComponent(a.query)}&c=apps`,
    summary: a.summary,
    features: a.features,
    reviews: [],
    source: "curated",
  }));
}

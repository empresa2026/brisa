import type { StoreApp } from "../types";
import { featuresFromDescription, type StoreQuery } from "./playstore";

/**
 * Apple App Store via APIs públicas oficiais da Apple (sem scraper):
 * - iTunes Search API para buscar apps
 * - feed RSS de avaliações para reviews
 * Usa fetch com timeout: uma falha de rede vira erro tratado, nunca derruba o servidor.
 */
const TIMEOUT_MS = 10_000;

interface ItunesApp {
  trackId: number;
  trackName: string;
  artistName: string;
  trackViewUrl: string;
  artworkUrl100?: string;
  averageUserRating?: number;
  userRatingCount?: number;
  description?: string;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Apple HTTP ${res.status}`);
  return (await res.json()) as T;
}

async function reviewsFor(id: number, country: string) {
  type Entry = { content?: { label?: string }; "im:rating"?: { label?: string } };
  const data = await getJSON<{ feed?: { entry?: Entry[] | Entry } }>(
    `https://itunes.apple.com/${country}/rss/customerreviews/page=1/id=${id}/sortby=mosthelpful/json`,
  );
  const entries = Array.isArray(data.feed?.entry) ? data.feed!.entry : data.feed?.entry ? [data.feed.entry] : [];
  return entries
    .map((e) => ({ text: e.content?.label ?? "", score: Number(e["im:rating"]?.label ?? 0) }))
    .filter((r) => r.text.length > 40 && r.score > 0)
    .slice(0, 4)
    .map((r) => ({ text: r.text.slice(0, 280), score: r.score }));
}

/** Busca 3 apps reais na Apple App Store com features (da descrição) e reviews. */
export async function searchAppStore(queries: StoreQuery[], limit = 3): Promise<StoreApp[]> {
  const results: StoreApp[] = [];
  const seen = new Set<number>();
  for (const { term, country } of queries) {
    if (results.length >= limit) break;
    const data = await getJSON<{ results: ItunesApp[] }>(
      `https://itunes.apple.com/search?${new URLSearchParams({ term, country, entity: "software", limit: "6" })}`,
    );
    for (const app of data.results) {
      if (results.length >= limit || seen.has(app.trackId)) continue;
      seen.add(app.trackId);
      const reviews = await reviewsFor(app.trackId, country).catch(() => []);
      results.push({
        title: app.trackName,
        developer: app.artistName,
        url: app.trackViewUrl,
        icon: app.artworkUrl100,
        rating: app.averageUserRating,
        installs: app.userRatingCount ? `${app.userRatingCount.toLocaleString("pt-BR")} avaliações` : undefined,
        summary: (app.description ?? "").split(/\n/)[0].slice(0, 220),
        features: featuresFromDescription(app.description ?? ""),
        reviews,
        source: "live",
      });
    }
  }
  return results;
}

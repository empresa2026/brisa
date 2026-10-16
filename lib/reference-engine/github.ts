import { Octokit } from "@octokit/rest";
import type { Archetype } from "../archetypes";
import type { GithubRepo } from "../types";

/** Busca 3 repositórios open source relevantes ao tema (apps, listas awesome). */
export async function searchGithub(terms: string[], limit = 3): Promise<GithubRepo[]> {
  try {
    return await search(new Octokit({ auth: process.env.GITHUB_TOKEN || undefined, request: { timeout: 10_000 } }), terms, limit);
  } catch (err) {
    // Token inválido/expirado: a busca pública funciona sem autenticação (com limite menor).
    if ((err as { status?: number }).status === 401 && process.env.GITHUB_TOKEN) {
      return search(new Octokit({ request: { timeout: 10_000 } }), terms, limit);
    }
    throw err;
  }
}

async function search(octokit: Octokit, terms: string[], limit: number): Promise<GithubRepo[]> {
  const results: GithubRepo[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    if (results.length >= limit) break;
    const { data } = await octokit.rest.search.repos({ q: `${term} in:name,description,topics stars:>50`, sort: "stars", per_page: 6 });
    for (const r of data.items) {
      if (results.length >= limit || seen.has(r.full_name) || r.archived) continue;
      seen.add(r.full_name);
      results.push({
        fullName: r.full_name,
        url: r.html_url,
        description: r.description ?? "",
        stars: r.stargazers_count,
        topics: r.topics ?? [],
        language: r.language ?? undefined,
        source: "live",
      });
    }
  }
  return results;
}

export function curatedGithub(archetype: Archetype, userQuery = ""): GithubRepo[] {
  const repos: GithubRepo[] = archetype.repos.map((r) => ({
    fullName: r.fullName,
    url: `https://github.com/${r.fullName}`,
    description: r.description,
    stars: 0,
    topics: [],
    source: "curated",
  }));
  // Completa com buscas do GitHub (sempre válidas) para chegar a 3 referências.
  for (const term of archetype.searchTerms.length ? archetype.searchTerms : [userQuery].filter(Boolean)) {
    if (repos.length >= 3) break;
    repos.push({
      fullName: `Busca: ${term}`,
      url: `https://github.com/search?q=${encodeURIComponent(term)}&type=repositories&s=stars`,
      description: `Repositórios open source mais estrelados sobre "${term}".`,
      stars: 0,
      topics: [],
      source: "curated",
    });
  }
  return repos;
}

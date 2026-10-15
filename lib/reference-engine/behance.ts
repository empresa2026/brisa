import { existsSync } from "fs";
import type { Archetype } from "../archetypes";
import type { DesignRef } from "../types";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean) as string[];

function chromePath() {
  return CHROME_CANDIDATES.find((p) => existsSync(p));
}

const searchUrl = (term: string) => `https://www.behance.net/search/projects?search=${encodeURIComponent(term)}`;

/** Busca 2 projetos de design reais no Behance via Puppeteer (renderiza o JS da busca). */
export async function searchBehance(terms: string[], limit = 2): Promise<DesignRef[]> {
  const executablePath = chromePath();
  if (!executablePath) throw new Error("Chromium não encontrado (defina CHROME_PATH)");

  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    );
    const results: DesignRef[] = [];
    for (const term of terms) {
      if (results.length >= limit) break;
      await page.goto(searchUrl(term), { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.waitForSelector('a[href*="/gallery/"]', { timeout: 12_000 }).catch(() => undefined);
      const found = await page.evaluate(() => {
        const out: { title: string; url: string; cover?: string; author: string }[] = [];
        const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/gallery/"]'));
        for (const a of anchors) {
          const img = a.querySelector("img");
          const card = a.closest("div[class*='Cover'], li, article") ?? a.parentElement;
          const owner = card?.querySelector<HTMLAnchorElement>('a[href*="behance.net/"]:not([href*="/gallery/"])');
          const title = (img?.alt || a.getAttribute("title") || a.textContent || "").trim();
          if (!title) continue;
          out.push({ title, url: a.href.split("?")[0], cover: img?.src, author: owner?.textContent?.trim() || "Behance" });
        }
        return out;
      });
      for (const f of found) {
        if (results.length >= limit || results.some((r) => r.url === f.url)) continue;
        results.push({ ...f, notes: `Encontrado na busca "${term}"`, source: "live" });
      }
    }
    return results;
  } finally {
    await browser.close();
  }
}

/** Fallback sem navegador: busca as og:tags da página de busca. */
export async function searchBehanceLite(terms: string[], limit = 2): Promise<DesignRef[]> {
  const results: DesignRef[] = [];
  for (const term of terms) {
    const res = await fetch(searchUrl(term), {
      headers: { "user-agent": "Mozilla/5.0 (compatible; AppBuilderBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Behance HTTP ${res.status}`);
    const html = await res.text();
    const re = /https:\/\/www\.behance\.net\/gallery\/(\d+)\/([A-Za-z0-9-]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && results.length < limit) {
      const url = m[0];
      if (results.some((r) => r.url === url)) continue;
      results.push({ title: m[2].replace(/-/g, " "), author: "Behance", url, notes: `Busca "${term}"`, source: "live" });
    }
    if (results.length >= limit) break;
  }
  if (!results.length) throw new Error("Nenhum projeto encontrado");
  return results;
}

export function curatedBehance(archetype: Archetype, extraTerms: string[] = []): DesignRef[] {
  const refs: DesignRef[] = [];
  if (extraTerms.some((t) => t.includes("pool"))) {
    refs.push({
      title: "SWIMMER — Pool Care Mobile App (concept)",
      author: "Behance",
      url: searchUrl("swimmer pool care app"),
      notes: "Mobile app concept for pool maintenance and sale of pool care products: manage upkeep and buy products through a simple interface.",
      source: "curated",
    });
  }
  for (const term of archetype.designTerms) {
    if (refs.length >= 2) break;
    refs.push({
      title: `Projetos em destaque: ${term}`,
      author: "Behance",
      url: searchUrl(term),
      notes: "Busca curada de estudos de caso de UI do nicho.",
      source: "curated",
    });
  }
  return refs.slice(0, 2);
}

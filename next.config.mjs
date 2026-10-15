/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "puppeteer-core", "google-play-scraper", "jszip"],
    // The exported starter kit ships the same renderer used by the live preview.
    outputFileTracingIncludes: {
      "/api/projects/[id]/download": ["./components/preview/**/*", "./lib/build-engine/spec-types.ts", "./instala-fluxo-1M.sh"],
    },
  },
};
export default nextConfig;

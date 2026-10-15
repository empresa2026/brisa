/**
 * AppSpec — contrato entre o Build Engine e o renderer.
 * Este arquivo não depende de nada além de TypeScript: ele é copiado
 * para o starter kit exportado.
 */

export const ICON_NAMES = [
  "home", "calendar", "users", "user", "wallet", "chart", "bell", "settings", "star", "heart",
  "message", "book", "play", "check", "clock", "map", "camera", "droplet", "dumbbell", "utensils",
  "scissors", "paw", "building", "briefcase", "graduation", "shopping", "truck", "receipt", "shield",
  "sparkles", "crown", "target", "trending", "flame", "leaf", "gift", "phone", "file", "zap", "route",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

export const SECTION_KINDS = [
  "hero", "stats", "list", "cards", "chart", "progress", "schedule", "checklist", "pricing", "cta", "chips", "timeline", "profile",
] as const;
export type SectionKind = (typeof SECTION_KINDS)[number];

export interface SpecItem {
  title: string;
  subtitle?: string;
  value?: string;
  meta?: string;
  icon?: IconName;
  badge?: string;
  progress?: number;
  done?: boolean;
}

export interface SpecSection {
  kind: SectionKind;
  title?: string;
  subtitle?: string;
  items: SpecItem[];
  cta?: string;
  premium?: boolean;
}

export interface SpecScreen {
  id: string;
  title: string;
  subtitle?: string;
  sections: SpecSection[];
}

export interface SpecTheme {
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
  radius: number;
  fontDisplay: string;
  fontBody: string;
  dark: boolean;
}

export interface AppSpec {
  name: string;
  tagline: string;
  theme: SpecTheme;
  onboarding: { headline: string; sub: string; cta: string; bullets: string[] };
  tabs: { id: string; label: string; icon: IconName }[];
  screens: SpecScreen[];
}

/** URL do Google Fonts com as fontes do tema (função pura: pode rodar no servidor). */
export function googleFontsHref(spec: AppSpec): string {
  // Fontes de peso único não aceitam o eixo wght (a API responde 400 para a URL inteira).
  const single = ["Archivo Black", "DM Serif Display"];
  const fam = (f: string) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}${single.includes(f) ? "" : ":wght@400;500;600;700"}`;
  const fonts = Array.from(new Set([spec.theme.fontDisplay, spec.theme.fontBody]));
  return `https://fonts.googleapis.com/css2?${fonts.map(fam).join("&")}&display=swap`;
}

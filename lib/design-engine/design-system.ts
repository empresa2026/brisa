import type { Archetype } from "../archetypes";
import type { DesignSystem, PRD, References } from "../types";

/**
 * Paletas autorais por "mood" — evitam o look genérico de IA (roxo-gradiente, Inter, cards iguais).
 * Cada uma foi pensada como direção de arte de um app premium do nicho.
 */
const MOODS: Record<Archetype["mood"], Omit<DesignSystem, "references" | "rationale">> = {
  trust: {
    mood: "Confiança editorial — verde-petróleo profundo com dourado discreto",
    colors: {
      primary: "#0F4C45", primaryForeground: "#F4F1EA", accent: "#C8A24A", background: "#F6F3EC", surface: "#FFFFFF",
      foreground: "#14201E", muted: "#6B7A77", border: "#E3DED2", success: "#2F8F5B", warning: "#C98A1B", danger: "#B4432F",
    },
    dark: false, radius: 18, fonts: { display: "Fraunces", body: "Manrope" }, density: "comfortable",
    principles: ["Números grandes e calmos: dinheiro nunca grita", "Dourado só para conquistas", "Cards com respiro generoso e tipografia serifada nos títulos"],
  },
  fresh: {
    mood: "Água limpa — azul-piscina vivo sobre branco gelo, eficiente como app de operação",
    colors: {
      primary: "#0077B6", primaryForeground: "#FFFFFF", accent: "#00C2A8", background: "#F2F8FB", surface: "#FFFFFF",
      foreground: "#0B2233", muted: "#5F7686", border: "#D9E7EF", success: "#12A36E", warning: "#E8A317", danger: "#D64545",
    },
    dark: false, radius: 16, fonts: { display: "Space Grotesk", body: "Inter Tight" }, density: "compact",
    principles: ["Informação de campo em 1 olhar: status por cor", "Botões grandes para uso com luva/sol", "Mapas e rotas como protagonistas"],
  },
  energy: {
    mood: "Noite de treino — preto grafite com laranja elétrico",
    colors: {
      primary: "#FF5A1F", primaryForeground: "#120A06", accent: "#D7FF3A", background: "#0E0F12", surface: "#17191E",
      foreground: "#F5F5F2", muted: "#9AA0A8", border: "#262A31", success: "#3DDC84", warning: "#FFB020", danger: "#FF4D4D",
    },
    dark: true, radius: 20, fonts: { display: "Archivo Black", body: "Archivo" }, density: "comfortable",
    principles: ["Tipografia condensada e pesada para números de performance", "Laranja só em ações e recordes", "Fundo escuro para foco total no treino"],
  },
  calm: {
    mood: "Clínica-spa — sálvia suave, areia e muito espaço em branco",
    colors: {
      primary: "#4F7A68", primaryForeground: "#FFFFFF", accent: "#E7B79A", background: "#F7F5F0", surface: "#FFFFFF",
      foreground: "#22302A", muted: "#76847D", border: "#E4E1D8", success: "#4F9A6F", warning: "#D19A3D", danger: "#C0584A",
    },
    dark: false, radius: 24, fonts: { display: "DM Serif Display", body: "DM Sans" }, density: "comfortable",
    principles: ["Ritmo lento: uma ação principal por tela", "Cantos muito arredondados transmitem acolhimento", "Sem vermelho fora de alertas reais"],
  },
  luxury: {
    mood: "Maison — preto tinta, champanhe e serifas finas",
    colors: {
      primary: "#1A1714", primaryForeground: "#F6EFE4", accent: "#B89462", background: "#F8F4EE", surface: "#FFFFFF",
      foreground: "#1A1714", muted: "#7D746A", border: "#E8E0D4", success: "#5C8C64", warning: "#C4913C", danger: "#A8473B",
    },
    dark: false, radius: 12, fonts: { display: "Cormorant Garamond", body: "Jost" }, density: "comfortable",
    principles: ["Fotografia grande e editorial", "Champanhe como detalhe, nunca como fundo", "Microtipografia em caixa-alta espaçada para rótulos"],
  },
  warm: {
    mood: "Forno a lenha — terracota, creme e mostarda",
    colors: {
      primary: "#C2410C", primaryForeground: "#FFF8F1", accent: "#F2B33D", background: "#FFF8F1", surface: "#FFFFFF",
      foreground: "#2A160C", muted: "#8A6B5A", border: "#F0E1D3", success: "#3F8F4F", warning: "#E19B1B", danger: "#B3261E",
    },
    dark: false, radius: 20, fonts: { display: "Bricolage Grotesque", body: "Nunito Sans" }, density: "comfortable",
    principles: ["Comida em primeiro plano", "Cores quentes que abrem o apetite", "Checkout sempre a 1 toque"],
  },
  playful: {
    mood: "Progresso alegre — índigo profundo com verde-limão e coral",
    colors: {
      primary: "#3D2C8D", primaryForeground: "#FFFFFF", accent: "#B8F35A", background: "#F7F6FD", surface: "#FFFFFF",
      foreground: "#1B1640", muted: "#6E6A8A", border: "#E5E2F5", success: "#2FB36B", warning: "#F5A524", danger: "#F0544F",
    },
    dark: false, radius: 22, fonts: { display: "Sora", body: "Plus Jakarta Sans" }, density: "comfortable",
    principles: ["Cada conquista é celebrada", "Barras de progresso por toda parte", "Ilustração e ícones arredondados"],
  },
};

export function buildDesignSystem(archetype: Archetype, prd: PRD, refs: References): DesignSystem {
  const base = MOODS[archetype.mood];
  return {
    ...base,
    rationale: `Direção derivada das referências do nicho (${refs.behance.map((b) => b.title).join("; ")}) e da voz da marca: “${prd.brandVoice}”.`,
    references: refs.behance.map((b) => b.url),
  };
}

export function designToMarkdown(ds: DesignSystem, prd: PRD): string {
  const c = ds.colors;
  return [
    `# DESIGN — ${prd.appName}`,
    "",
    `**Direção:** ${ds.mood}`,
    "",
    ds.rationale,
    "",
    "## Tokens",
    "",
    "| Token | Valor |",
    "|---|---|",
    ...Object.entries(c).map(([k, v]) => `| ${k} | \`${v}\` |`),
    `| radius | ${ds.radius}px |`,
    `| tema | ${ds.dark ? "escuro" : "claro"} |`,
    "",
    "## Tipografia",
    "",
    `- Display: **${ds.fonts.display}** (Google Fonts)`,
    `- Texto: **${ds.fonts.body}** (Google Fonts)`,
    "",
    "## Princípios",
    "",
    ...ds.principles.map((p) => `- ${p}`),
    "- Anti-slop: nada de gradiente roxo genérico, emojis como ícone, ou cards todos iguais",
    "- Acessibilidade: contraste AA, alvos de toque ≥ 44px, foco visível",
    "",
    "## Referências visuais",
    "",
    ...ds.references.map((r) => `- ${r}`),
    "",
    "## Para refinar com Claude Code",
    "",
    "```",
    `/impeccable init --references="${ds.references.join(",")}"`,
    "/frontend-design",
    "```",
    "",
  ].join("\n");
}

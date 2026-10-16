"use client";

/**
 * Renderer do app gerado. Autossuficiente (React + lucide-react) para ser copiado
 * para o starter kit exportado sem alterações.
 */
import { useMemo, useState, type CSSProperties } from "react";
import {
  BatteryFull, Bell, BookOpen, Briefcase, Building2, Calendar, Camera, ChartColumn, Check, ChevronRight, Clock, Crown, Droplet, Dumbbell,
  File, Flame, Gift, GraduationCap, Heart, Home, Leaf, Map, MessageCircle, PawPrint, Phone, Play, Receipt, Route, Scissors,
  Settings, Shield, ShoppingBag, Signal, Sparkles, Star, Target, TrendingUp, Truck, User, Users, UtensilsCrossed, Wallet, Wifi, Zap,
  type LucideIcon,
} from "lucide-react";
import type { AppSpec, IconName, SpecItem, SpecSection } from "./spec-types";

const ICONS: Record<IconName, LucideIcon> = {
  home: Home, calendar: Calendar, users: Users, user: User, wallet: Wallet, chart: ChartColumn, bell: Bell, settings: Settings,
  star: Star, heart: Heart, message: MessageCircle, book: BookOpen, play: Play, check: Check, clock: Clock, map: Map,
  camera: Camera, droplet: Droplet, dumbbell: Dumbbell, utensils: UtensilsCrossed, scissors: Scissors, paw: PawPrint,
  building: Building2, briefcase: Briefcase, graduation: GraduationCap, shopping: ShoppingBag, truck: Truck, receipt: Receipt,
  shield: Shield, sparkles: Sparkles, crown: Crown, target: Target, trending: TrendingUp, flame: Flame, leaf: Leaf, gift: Gift,
  phone: Phone, file: File, zap: Zap, route: Route,
};

function Icon({ name, size = 18 }: { name?: IconName | string; size?: number }) {
  const C = (name && ICONS[name as IconName]) || Sparkles;
  return <C size={size} strokeWidth={1.9} aria-hidden />;
}

const CSS = `
.ab-root{font-family:var(--ab-body),system-ui,sans-serif;color:var(--ab-fg);background:var(--ab-bg);height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden;-webkit-font-smoothing:antialiased}
.ab-root *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.ab-root button{touch-action:manipulation}
.ab-display{font-family:var(--ab-display),var(--ab-body),serif;letter-spacing:-0.02em}
.ab-scroll{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:4px 18px 24px;scrollbar-width:none}
.ab-scroll::-webkit-scrollbar{display:none}
.ab-status{display:flex;justify-content:space-between;align-items:center;padding:max(14px,env(safe-area-inset-top)) 24px 6px;font-size:13px;font-weight:600}
.ab-head{padding:10px 18px 14px}
.ab-head h1{font-size:27px;line-height:1.1;margin:0;font-weight:700}
.ab-head p{margin:6px 0 0;color:var(--ab-muted);font-size:13px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ab-sec{margin-top:22px}
.ab-sec-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}
.ab-sec-h h2{font-size:16px;margin:0;font-weight:700}
.ab-sec-h span{font-size:12px;color:var(--ab-primary-text);font-weight:600}
.ab-card{background:var(--ab-surface);border:1px solid var(--ab-border);border-radius:var(--ab-r)}
.ab-hero{background:var(--ab-primary);color:var(--ab-primary-fg);border-radius:calc(var(--ab-r) + 6px);padding:22px;position:relative;overflow:hidden}
.ab-hero:after{content:"";position:absolute;right:-40px;top:-40px;width:160px;height:160px;border-radius:50%;background:var(--ab-accent);opacity:.22}
.ab-hero:before{content:"";position:absolute;right:30px;bottom:-60px;width:120px;height:120px;border-radius:50%;border:18px solid var(--ab-accent);opacity:.18}
.ab-hero .v{font-size:34px;font-weight:700;line-height:1;position:relative;z-index:1}
.ab-hero .l{font-size:13px;opacity:.85;margin-top:8px;max-width:85%;position:relative;z-index:1;line-height:1.45}
.ab-btn{display:inline-flex;align-items:center;gap:6px;border:0;cursor:pointer;font:inherit;font-weight:700;font-size:14px;border-radius:999px;padding:11px 18px;min-height:44px}
.ab-btn-on-primary{background:var(--ab-accent);color:var(--ab-accent-fg);margin-top:16px;position:relative;z-index:1}
.ab-btn-primary{background:var(--ab-primary);color:var(--ab-primary-fg)}
.ab-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ab-stat{padding:12px}
.ab-stat .i{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:var(--ab-soft);color:var(--ab-primary-text);margin-bottom:10px}
.ab-stat .v{font-size:17px;font-weight:700;line-height:1.1}
.ab-stat .t{font-size:11px;color:var(--ab-muted);margin-top:3px}
.ab-stat .m{font-size:11px;font-weight:700;color:var(--ab-success);margin-top:2px}
.ab-row{display:flex;align-items:center;gap:12px;padding:12px 14px}
.ab-row + .ab-row{border-top:1px solid var(--ab-border)}
.ab-row .i{width:38px;height:38px;flex:none;border-radius:12px;display:grid;place-items:center;background:var(--ab-soft);color:var(--ab-primary-text)}
.ab-row .b{flex:1;min-width:0}
.ab-row .t{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ab-row .s{font-size:12px;color:var(--ab-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ab-row .r{text-align:right;font-size:13px;font-weight:700;flex:none}
.ab-badge{display:inline-block;font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--ab-accent);color:var(--ab-accent-fg);white-space:nowrap}
.ab-hs{display:flex;gap:10px;overflow-x:auto;margin:0 -18px;padding:0 18px 4px;scrollbar-width:none}
.ab-hs::-webkit-scrollbar{display:none}
.ab-tile{flex:none;width:168px;padding:0;overflow:hidden}
.ab-tile .art{height:96px;display:grid;place-items:center;color:var(--ab-primary-fg);background:linear-gradient(135deg,var(--ab-primary),color-mix(in srgb,var(--ab-primary) 55%,var(--ab-accent)));position:relative}
.ab-tile .art .ab-badge{position:absolute;left:8px;top:8px}
.ab-tile .c{padding:10px 12px 12px}
.ab-tile .t{font-size:13px;font-weight:700;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ab-tile .s{font-size:11px;color:var(--ab-muted);margin-top:4px}
.ab-tile .v{font-size:13px;font-weight:700;margin-top:6px;color:var(--ab-primary-text)}
.ab-chart{padding:16px 14px 12px}
.ab-bars{display:flex;align-items:flex-end;gap:10px;height:120px}
.ab-bar{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}
.ab-bar i{display:block;width:100%;border-radius:8px 8px 4px 4px;background:var(--ab-soft-strong)}
.ab-bar:last-child i{background:var(--ab-primary)}
.ab-bar span{font-size:10px;color:var(--ab-muted)}
.ab-chart .top{display:flex;justify-content:space-between;font-size:12px;color:var(--ab-muted);margin-bottom:12px}
.ab-chart .top b{font-size:18px;color:var(--ab-fg)}
.ab-prog{padding:12px 14px}
.ab-prog + .ab-prog{border-top:1px solid var(--ab-border)}
.ab-prog .h{display:flex;justify-content:space-between;font-size:13px;font-weight:600;gap:8px}
.ab-prog .s{font-size:11px;color:var(--ab-muted);margin-top:2px}
.ab-track{height:8px;border-radius:99px;background:var(--ab-soft);margin-top:9px;overflow:hidden}
.ab-track i{display:block;height:100%;border-radius:99px;background:var(--ab-primary)}
.ab-check{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;width:100%;background:none;border:0;font:inherit;color:inherit;text-align:left;min-height:44px}
.ab-check + .ab-check{border-top:1px solid var(--ab-border)}
.ab-check .box{width:24px;height:24px;flex:none;border-radius:8px;border:2px solid var(--ab-border);display:grid;place-items:center;transition:background-color .2s,border-color .2s}
.ab-check.on .box{background:var(--ab-success);border-color:var(--ab-success);color:#fff}
.ab-check.on .t{text-decoration:line-through;color:var(--ab-muted)}
.ab-check .t{font-size:14px;font-weight:500}
.ab-chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none}
.ab-chip{flex:none;font:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:999px;border:1px solid var(--ab-border);background:var(--ab-surface);color:var(--ab-fg);cursor:pointer;min-height:36px}
.ab-chip.on{background:var(--ab-fg);color:var(--ab-bg);border-color:var(--ab-fg)}
.ab-cta{padding:18px;display:flex;gap:14px;align-items:center}
.ab-cta.prem{background:var(--ab-fg);color:var(--ab-bg);border-color:transparent}
.ab-cta.prem .s{color:color-mix(in srgb,var(--ab-bg) 70%,transparent)}
.ab-cta .t{font-weight:700;font-size:15px}
.ab-cta .s{font-size:12px;color:var(--ab-muted);margin-top:3px;line-height:1.4}
.ab-cta .ic{width:44px;height:44px;border-radius:14px;flex:none;display:grid;place-items:center;background:var(--ab-accent);color:var(--ab-accent-fg)}
.ab-price{padding:16px;position:relative}
.ab-price + .ab-price{margin-top:10px}
.ab-price.hl{border:2px solid var(--ab-primary)}
.ab-price .n{font-weight:700;font-size:15px}
.ab-price .p{font-size:22px;font-weight:700;margin-top:4px}
.ab-price .p small{font-size:12px;color:var(--ab-muted);font-weight:500}
.ab-price .s{font-size:12px;color:var(--ab-muted);margin-top:4px}
.ab-price .m{font-size:12px;margin-top:8px}
.ab-price .ab-badge{position:absolute;right:12px;top:12px}
.ab-tl{display:flex;gap:12px;padding:12px 14px}
.ab-tl + .ab-tl{border-top:1px solid var(--ab-border)}
.ab-av{width:36px;height:36px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;font-size:13px;background:var(--ab-soft-strong);color:var(--ab-primary-text)}
.ab-tl .t{font-size:13px;font-weight:700;display:flex;justify-content:space-between}
.ab-tl .t span{font-weight:500;color:var(--ab-muted);font-size:11px}
.ab-tl .s{font-size:13px;margin-top:3px;line-height:1.45}
.ab-prof{display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 14px}
.ab-prof .av{width:72px;height:72px;font-size:26px}
.ab-prof .n{font-size:20px;font-weight:700;margin-top:10px}
.ab-prof .s{font-size:12px;color:var(--ab-muted)}
.ab-prof .st{display:flex;gap:22px;margin-top:14px}
.ab-prof .st b{display:block;font-size:16px}
.ab-prof .st span{font-size:11px;color:var(--ab-muted)}
.ab-tabs{display:flex;justify-content:space-around;padding:8px 6px max(22px,env(safe-area-inset-bottom));background:var(--ab-surface);border-top:1px solid var(--ab-border)}
.ab-tab{display:flex;flex-direction:column;align-items:center;gap:3px;font:inherit;font-size:10px;font-weight:600;color:var(--ab-muted);background:none;border:0;cursor:pointer;padding:6px 8px;min-width:56px;min-height:44px;border-radius:12px}
.ab-tab.on{color:var(--ab-primary-text)}
.ab-tab.on .pill{background:var(--ab-soft)}
.ab-tab .pill{padding:4px 14px;border-radius:999px;display:grid;place-items:center;transition:background .2s}
.ab-tab:focus-visible,.ab-btn:focus-visible,.ab-chip:focus-visible,.ab-check:focus-visible{outline:2px solid var(--ab-primary);outline-offset:2px}
.ab-onb{position:absolute;inset:0;z-index:5;background:var(--ab-primary);color:var(--ab-primary-fg);display:flex;flex-direction:column;padding:64px 26px 34px;overflow:hidden}
.ab-onb .orb{position:absolute;width:320px;height:320px;border-radius:50%;background:var(--ab-accent);opacity:.25;right:-120px;top:-80px}
.ab-onb .orb2{position:absolute;width:220px;height:220px;border-radius:50%;border:28px solid var(--ab-accent);opacity:.18;left:-90px;bottom:120px}
.ab-onb .brand{font-size:15px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.9;position:relative}
.ab-onb h1{font-size:38px;line-height:1.02;margin:auto 0 14px;position:relative;font-weight:700}
.ab-onb p{font-size:14px;opacity:.82;line-height:1.5;margin:0 0 18px;position:relative;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.ab-onb ul{list-style:none;padding:0;margin:0 0 26px;position:relative}
.ab-onb li{display:flex;gap:10px;align-items:center;font-size:14px;padding:6px 0}
.ab-onb li i{width:22px;height:22px;border-radius:50%;background:var(--ab-accent);color:var(--ab-accent-fg);display:grid;place-items:center;flex:none}
.ab-onb .ab-btn{justify-content:center;width:100%;background:var(--ab-accent);color:var(--ab-accent-fg);font-size:16px;padding:16px;position:relative}
@keyframes ab-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ab-anim > *{animation:ab-in .45s ease both}
.ab-anim > *:nth-child(2){animation-delay:.05s}.ab-anim > *:nth-child(3){animation-delay:.1s}.ab-anim > *:nth-child(4){animation-delay:.15s}.ab-anim > *:nth-child(5){animation-delay:.2s}
@media (prefers-reduced-motion: reduce){.ab-anim > *{animation:none}.ab-track i{transition:none}}
`;

function luminance(hex: string) {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return 0.5;
  const [r, g, b] = m.map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function initials(s: string) {
  return s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Section({ s, checks, toggle, chip, setChip, sid }: {
  s: SpecSection; sid: string; checks: Record<string, boolean>; toggle: (k: string) => void; chip: Record<string, number>; setChip: (k: string, i: number) => void;
}) {
  const head = s.title && s.kind !== "hero" && s.kind !== "cta" && s.kind !== "profile" ? (
    <div className="ab-sec-h"><h2 className="ab-display">{s.title}</h2>{s.subtitle ? <span>{s.subtitle}</span> : null}</div>
  ) : null;
  const items = s.items ?? [];

  switch (s.kind) {
    case "hero":
      return (
        <div className="ab-hero">
          <div className="v ab-display" style={{ fontVariantNumeric: "tabular-nums" }}>{s.title}</div>
          {s.subtitle && <div className="l">{s.subtitle}</div>}
          {s.cta && <button className="ab-btn ab-btn-on-primary">{s.cta} <ChevronRight size={16} /></button>}
        </div>
      );
    case "stats":
      return (<div>{head}<div className="ab-stats">{items.slice(0, 3).map((it, i) => (
        <div key={i} className="ab-card ab-stat">
          <div className="i"><Icon name={it.icon} size={15} /></div>
          <div className="v ab-display">{it.value ?? it.title}</div>
          <div className="t">{it.title}</div>
          {it.meta && <div className="m">{it.meta}</div>}
        </div>))}</div></div>);
    case "list":
    case "schedule":
      return (<div>{head}<div className="ab-card">{items.map((it, i) => (
        <div key={i} className="ab-row">
          <div className="i">{s.kind === "schedule" && !it.icon ? <Clock size={18} /> : <Icon name={it.icon ?? "user"} />}</div>
          <div className="b"><div className="t">{it.title}</div>{it.subtitle && <div className="s">{it.subtitle}</div>}</div>
          <div className="r">{it.badge ? <span className="ab-badge">{it.badge}</span> : it.value ?? it.meta ?? <ChevronRight size={16} />}</div>
        </div>))}</div></div>);
    case "cards":
      return (<div>{head}<div className="ab-hs">{items.map((it, i) => (
        <div key={i} className="ab-card ab-tile">
          <div className="art">{it.badge && <span className="ab-badge">{it.badge}</span>}<Icon name={it.icon} size={30} /></div>
          <div className="c"><div className="t">{it.title}</div>{it.subtitle && <div className="s">{it.subtitle}</div>}{it.value && <div className="v">{it.value}</div>}</div>
        </div>))}</div></div>);
    case "chart": {
      const last = items[items.length - 1];
      return (<div>{head}<div className="ab-card ab-chart">
        {last && <div className="top"><span>{s.subtitle ?? "Este mês"}</span><b className="ab-display">{last.value}</b></div>}
        <div className="ab-bars">{items.map((it, i) => (
          <div key={i} className="ab-bar"><i style={{ height: `${Math.max(8, Math.min(100, it.progress ?? 50))}%` }} /><span>{it.title}</span></div>))}</div>
      </div></div>);
    }
    case "progress":
      return (<div>{head}<div className="ab-card">{items.map((it, i) => (
        <div key={i} className="ab-prog">
          <div className="h"><span>{it.title}</span><span>{it.value ?? `${Math.round(it.progress ?? 0)}%`}</span></div>
          {it.subtitle && <div className="s">{it.subtitle}</div>}
          <div className="ab-track"><i style={{ width: `${Math.max(0, Math.min(100, it.progress ?? 0))}%` }} /></div>
        </div>))}</div></div>);
    case "checklist":
      return (<div>{head}<div className="ab-card">{items.map((it, i) => {
        const k = `${sid}-${i}`;
        const on = checks[k] ?? !!it.done;
        return (
          <button key={i} className={`ab-check${on ? " on" : ""}`} onClick={() => toggle(k)} aria-pressed={on}>
            <span className="box">{on && <Check size={15} strokeWidth={3} />}</span><span className="t">{it.title}</span>
          </button>);
      })}</div></div>);
    case "chips":
      return (<div>{head}<div className="ab-chips" role="tablist">{items.map((it, i) => (
        <button key={i} role="tab" aria-selected={(chip[sid] ?? 0) === i} className={`ab-chip${(chip[sid] ?? 0) === i ? " on" : ""}`} onClick={() => setChip(sid, i)}>{it.title}</button>))}</div></div>);
    case "pricing":
      return (<div>{head}{items.map((it, i) => (
        <div key={i} className={`ab-card ab-price${it.badge ? " hl" : ""}`}>
          {it.badge && <span className="ab-badge">{it.badge}</span>}
          <div className="n">{it.title}</div>
          <div className="p ab-display">{it.value}{it.value && /R\$/.test(it.value) ? <small> /mês</small> : null}</div>
          {it.subtitle && <div className="s">{it.subtitle}</div>}
          {it.meta && <div className="m">{it.meta}</div>}
        </div>))}</div>);
    case "cta":
      return (
        <div className={`ab-card ab-cta${s.premium ? " prem" : ""}`}>
          <div className="ic">{s.premium ? <Crown size={20} /> : <Sparkles size={20} />}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t">{s.title}</div>
            {s.subtitle && <div className="s">{s.subtitle}</div>}
          </div>
          {s.cta && <ChevronRight size={20} />}
        </div>
      );
    case "timeline":
      return (<div>{head}<div className="ab-card">{items.map((it, i) => (
        <div key={i} className="ab-tl">
          <div className="ab-av">{initials(it.title)}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div className="t">{it.title}{it.meta && <span>{it.meta}</span>}</div><div className="s">{it.subtitle}</div></div>
        </div>))}</div></div>);
    case "profile":
      return (
        <div className="ab-card ab-prof">
          <div className="ab-av av">{initials(s.title ?? "Você")}</div>
          <div className="n ab-display">{s.title}</div>
          {s.subtitle && <div className="s">{s.subtitle}</div>}
          <div className="st">{items.slice(0, 3).map((it, i) => <div key={i}><b>{it.value ?? "—"}</b><span>{it.title}</span></div>)}</div>
        </div>
      );
    default:
      return null;
  }
}

export function AppRenderer({ spec, showOnboarding = true, className, style }: {
  spec: AppSpec; showOnboarding?: boolean; className?: string; style?: CSSProperties;
}) {
  const [tab, setTab] = useState(spec.tabs[0]?.id);
  const [onb, setOnb] = useState(showOnboarding);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [chip, setChipState] = useState<Record<string, number>>({});
  const t = spec.theme;

  const vars = useMemo(() => {
    const accentIsLight = luminance(t.accent) > 0.45;
    return {
      "--ab-primary": t.primary,
      "--ab-primary-fg": t.primaryForeground,
      "--ab-primary-text": t.primary,
      "--ab-accent": t.accent,
      "--ab-accent-fg": accentIsLight ? "#111111" : "#FFFFFF",
      "--ab-bg": t.background,
      "--ab-surface": t.surface,
      "--ab-fg": t.foreground,
      "--ab-muted": t.muted,
      "--ab-border": t.border,
      "--ab-success": t.success,
      "--ab-soft": `color-mix(in srgb, ${t.primary} ${t.dark ? 22 : 10}%, ${t.surface})`,
      "--ab-soft-strong": `color-mix(in srgb, ${t.primary} ${t.dark ? 40 : 24}%, ${t.surface})`,
      "--ab-r": `${t.radius}px`,
      "--ab-display": `'${t.fontDisplay}'`,
      "--ab-body": `'${t.fontBody}'`,
    } as CSSProperties;
  }, [t]);

  const screen = spec.screens.find((s) => s.id === tab) ?? spec.screens[0];

  return (
    <div className={`ab-root ${className ?? ""}`} style={{ ...vars, ...style }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ab-status"><span>9:41</span><span aria-hidden style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Signal size={14} strokeWidth={2.4} /><Wifi size={14} strokeWidth={2.4} /><BatteryFull size={18} strokeWidth={2} /></span></div>

      {onb && (
        <div className="ab-onb">
          <div className="orb" /><div className="orb2" />
          <div className="brand">{spec.name}</div>
          <h1 className="ab-display">{spec.onboarding.headline}</h1>
          <p>{spec.onboarding.sub}</p>
          <ul>{spec.onboarding.bullets.slice(0, 3).map((b, i) => <li key={i}><i><Check size={13} strokeWidth={3} /></i>{b}</li>)}</ul>
          <button className="ab-btn" onClick={() => setOnb(false)}>{spec.onboarding.cta}</button>
        </div>
      )}

      {screen && (
        <>
          <div className="ab-head">
            <h1 className="ab-display">{screen.title}</h1>
            {screen.subtitle && <p>{screen.subtitle}</p>}
          </div>
          <div className="ab-scroll" key={screen.id}>
            <div className="ab-anim">
              {screen.sections.map((s, i) => (
                <div key={i} className={i ? "ab-sec" : undefined}>
                  <Section s={s} sid={`${screen.id}-${i}`} checks={checks} toggle={(k) => setChecks((c) => ({ ...c, [k]: !(c[k] ?? s.items[Number(k.split("-").pop())]?.done) }))} chip={chip} setChip={(k, v) => setChipState((c) => ({ ...c, [k]: v }))} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <nav className="ab-tabs" aria-label="Navegação principal">
        {spec.tabs.map((tb) => (
          <button key={tb.id} className={`ab-tab${tb.id === tab ? " on" : ""}`} onClick={() => setTab(tb.id)} aria-current={tb.id === tab ? "page" : undefined}>
            <span className="pill"><Icon name={tb.icon} size={20} /></span>{tb.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export type { SpecItem };

import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground font-display text-lg leading-none transition-transform group-hover:-rotate-6">1M</span>
      <span>Builder</span>
    </Link>
  );
}

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur ${dark ? "border-white/10 bg-[#121214]/80 text-white" : "bg-background/80"}`}>
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/projects" className={`rounded-full px-4 py-2 font-medium ${dark ? "hover:bg-white/10" : "hover:bg-secondary"}`}>Meus apps</Link>
        </nav>
      </div>
    </header>
  );
}

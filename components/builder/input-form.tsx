"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Loader2, MapPin, Upload, Users, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setPendingEbook } from "@/lib/client/pending-ebook";

const EXAMPLES = [
  { what: "Limpeza e manutenção de piscinas", where: "Belo Horizonte", who: "Casas e condomínios de alto padrão" },
  { what: "Coach de finanças", where: "BH", who: "Mulheres de 30 a 45 anos endividadas" },
  { what: "Personal trainer online", where: "São Paulo", who: "Homens 25-40 que querem hipertrofia" },
  { what: "Barbearia premium", where: "Curitiba", who: "Homens executivos" },
  { what: "Nutricionista materno-infantil", where: "Recife", who: "Gestantes e mães de primeira viagem" },
];

export function InputForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [who, setWho] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCode, setNeedsCode] = useState(false);
  const [code, setCode] = useState("");

  async function unlock() {
    const r = await fetch("/api/access", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    if (r.ok) { setNeedsCode(false); setError(null); } else setError("Código de acesso inválido.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (what.trim().length < 2) { setError("Conte em poucas palavras o que você faz."); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ what, where, who }),
      });
      const data = await res.json();
      if (res.status === 401 && data.needsAccess) { setNeedsCode(true); setBusy(false); return; }
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar o projeto");
      if (file) setPendingEbook(data.id, file);
      router.push(`/projects/${data.id}?run=1`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  function onFile(f: File | undefined) {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) { setError("Envie o e-book em PDF."); return; }
    if (f.size > 30 * 1024 * 1024) { setError("O PDF precisa ter até 30 MB."); return; }
    setError(null);
    setFile(f);
  }

  return (
    <form onSubmit={submit} className="relative rounded-2xl bg-white p-5 text-foreground shadow-[0_24px_60px_-20px_rgba(0,0,0,.55)] sm:p-7">
      <div className="space-y-5">
        <Field icon={<Wand2 />} label="O que você faz?" hint="ex: coach de finanças, limpeza de piscinas">
          <Input name="what" autoComplete="off" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Coach de finanças…" maxLength={400} aria-required />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field icon={<MapPin />} label="Onde atua?" hint="cidade ou online">
            <Input name="where" autoComplete="address-level2" value={where} onChange={(e) => setWhere(e.target.value)} placeholder="BH…" maxLength={160} />
          </Field>
          <Field icon={<Users />} label="Quem paga?" hint="seu cliente ideal">
            <Input name="who" autoComplete="off" value={who} onChange={(e) => setWho(e.target.value)} placeholder="Mulheres de 30 a 45…" maxLength={240} />
          </Field>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          className="rounded-2xl border-2 border-dashed border-input bg-secondary/50 p-4 transition-colors hover:border-foreground/40"
        >
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} id="ebook" />
          {file ? (
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-accent"><FileText className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB · vamos transformar o método em app</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)} aria-label="Remover e-book"><X /></Button>
            </div>
          ) : (
            <label htmlFor="ebook" className="flex cursor-pointer items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-card border"><Upload className="size-5" /></span>
              <span className="text-sm">
                <span className="font-semibold">Tem um e-book? Solte o PDF aqui</span>
                <span className="block text-xs text-muted-foreground">Opcional · extraímos tema, capítulos, exercícios e monetização</span>
              </span>
            </label>
          )}
        </div>

        {needsCode && (
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código de acesso…" type="password" name="access-code" autoComplete="off" spellCheck={false} aria-label="Código de acesso" />
            <Button type="button" onClick={unlock}>Liberar</Button>
          </div>
        )}
        <p role="alert" aria-live="polite" className="text-sm font-medium text-destructive empty:hidden">{error}</p>

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={busy}>
          {busy ? <><Loader2 className="animate-spin" /> Preparando seu projeto…</> : <>Criar meu app <ArrowRight /></>}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Sem entrevista. Sem formulário longo. A gente pesquisa e decide por você.</p>
      </div>

      <div className="mt-6 border-t pt-4">
        <p className="mb-2 text-sm text-muted-foreground">Sem ideia? Experimente um exemplo:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.what}
              type="button"
              onClick={() => { setWhat(ex.what); setWhere(ex.where); setWho(ex.who); setError(null); }}
              className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-foreground/40 hover:bg-secondary"
            >
              {ex.what} · {ex.where}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

function Field({ icon, label, hint, children }: { icon: React.ReactNode; label: string; hint: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold [&_svg]:size-4 [&_svg]:text-muted-foreground">
        {icon}{label}<span className="font-normal text-muted-foreground">— {hint}</span>
      </span>
      {children}
    </label>
  );
}

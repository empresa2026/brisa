import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-8 text-center">
      <div>
        <p className="font-display text-7xl">404</p>
        <p className="mt-2 text-muted-foreground">Não encontramos este projeto.</p>
        <Link href="/" className="mt-6 inline-block font-semibold underline">Criar um app</Link>
      </div>
    </main>
  );
}

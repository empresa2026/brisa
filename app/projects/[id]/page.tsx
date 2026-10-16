import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/builder/site-header";
import { Workspace } from "@/components/builder/workspace";
import { loadProject } from "@/lib/project";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await loadProject(params.id).catch(() => null);
  return { title: p?.meta.appName ? `${p.meta.appName} — Brisa` : "Projeto — Brisa" };
}

export default async function ProjectPage({ params, searchParams }: { params: { id: string }; searchParams: { run?: string } }) {
  const project = await loadProject(params.id).catch(() => null);
  if (!project) notFound();
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <Workspace initial={project} autoRun={searchParams.run === "1"} />
    </div>
  );
}

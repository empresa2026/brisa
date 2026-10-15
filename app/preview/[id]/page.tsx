import { notFound } from "next/navigation";
import { PreviewClient } from "./preview-client";
import { readJSON } from "@/lib/storage";
import type { AppSpec } from "@/lib/build-engine/spec-types";

export const dynamic = "force-dynamic";

async function load(id: string) {
  try {
    return await readJSON<AppSpec>(id, "app-spec.json");
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const spec = await load(params.id);
  return { title: spec ? `${spec.name} — ${spec.tagline}` : "Preview" };
}

export default async function PreviewPage({ params }: { params: { id: string } }) {
  const spec = await load(params.id);
  if (!spec) notFound();
  return <PreviewClient spec={spec} />;
}

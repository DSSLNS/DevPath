import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModuleBySlug, modules } from "@/content";
import { curriculumManifest } from "@/content/curriculum/manifest";
import { PageHeader } from "@/components/ui/card";
import { renderInline } from "@/lib/markdown";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { ModuleLessonStatus, ModuleAssessmentLink } from "@/components/learn/module-client";

export function generateStaticParams() {
  return modules.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const m = getModuleBySlug((await params).module);
  return { title: m ? m.title : "Module not found", description: m?.description };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const m = getModuleBySlug((await params).module);
  if (!m) notFound();
  const manifest = curriculumManifest.find((x) => x.id === m.id);
  const written = new Set(m.lessons.map((l) => l.slug));
  const planned = (manifest?.lessons ?? []).filter(([slug]) => !written.has(slug));
  return (
    <div className="max-w-4xl">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <Link href="/learn" className="hover:text-fg">
          Learn
        </Link>{" "}
        / Module {m.order}
      </nav>
      <PageHeader
        eyebrow={`Module ${m.order}${m.optional ? " · Optional" : ""}`}
        title={m.title}
        description={m.description}
        actions={<ModuleAssessmentLink moduleId={m.id} />}
      />
      {m.lessons.length === 0 && (
        <p className="mb-4 rounded-lg border border-dashed border-border-strong bg-surface p-4 text-sm text-muted">
          Lessons for this module are planned but not published yet. The topics it will cover are listed below.
        </p>
      )}
      <ol className="space-y-2">
        {m.lessons.map((l, i) => (
          <li key={l.id}>
            <Link href={`/learn/${m.slug}/${l.slug}`} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
              <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold text-subtle tabular-nums">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{l.title}</span>
                  <DifficultyBadge level={l.difficulty} />
                  {l.optional && <Badge tone="warning">Optional</Badge>}
                  <span className="text-xs text-subtle">{l.minutes} min</span>
                </span>
                <span className="mt-0.5 block text-sm text-muted">{renderInline(l.summary)}</span>
              </span>
              <ModuleLessonStatus lessonId={l.id} />
            </Link>
          </li>
        ))}
      </ol>
      {planned.length > 0 && (
        <section className="mt-6" aria-labelledby="planned-h">
          <h2 id="planned-h" className="mb-2 text-sm font-semibold text-muted">
            Planned lessons (not yet published)
          </h2>
          <ul className="grid gap-1 text-sm text-subtle sm:grid-cols-2">
            {planned.map(([slug, title]) => (
              <li key={slug} className="rounded border border-dashed border-border px-3 py-1.5">
                {title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getTechnology, learningPaths, projects } from "@/content";
import { renderInline } from "@/lib/markdown";
import { formatDuration } from "@/lib/courses";
import { PathProgressPanel, PathSteps } from "@/components/paths/path-detail";
import { PATH_STYLE } from "@/components/paths/path-style";
import { DifficultyBadge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";

const careerPaths = learningPaths.filter((p) => p.steps);

export function generateStaticParams() {
  return careerPaths.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const path = careerPaths.find((p) => p.id === id);
  return path ? { title: path.title, description: path.description } : { title: "Learning path not found" };
}

export default async function PathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = careerPaths.find((p) => p.id === id);
  if (!path) notFound();
  const style = PATH_STYLE[path.accent ?? "fullstack"];
  const Icon = style.icon;
  const techs = (path.technologyIds ?? []).map((id) => getTechnology(id)!).filter(Boolean);
  const planned = techs.filter((t) => getCourse(t).totalDays > 0);
  const minutes = planned.reduce((n, t) => n + getCourse(t).totalMinutes, 0);
  const related = projects.filter((p) => path.projectIds?.includes(p.id));

  return (
    <div className="max-w-5xl">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-subtle">
        <Link href="/paths" className="hover:text-fg">
          Learning paths
        </Link>{" "}
        / {path.title}
      </nav>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl", style.iconClass)} aria-hidden>
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <p className="text-xs font-medium tracking-wide text-subtle uppercase">Learning path</p>
          <h1 className="text-3xl font-semibold tracking-tight">{path.title}</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted">{path.description}</p>
          <p className="mt-2 text-sm text-subtle">
            {path.steps!.length} steps · {techs.length} courses
            {minutes > 0 && ` · about ${formatDuration(minutes)} for the ${planned.length} courses with a day-by-day plan`}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="sequence-h">
            <h2 id="sequence-h" className="text-xl font-semibold tracking-tight">
              Your learning sequence
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              A recommended order, not a lock. Open any available course whenever you like. Courses marked &ldquo;Coming soon&rdquo; are still being written
              and don&apos;t block the steps after them.
            </p>
            <PathSteps pathId={path.id} />
          </section>

          <section aria-labelledby="projects-h">
            <h2 id="projects-h" className="text-xl font-semibold tracking-tight">
              Practical projects
            </h2>
            {related.length ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link href={`/projects/${p.slug}`} className="block h-full rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{p.title}</span>
                        <DifficultyBadge level={p.difficulty} />
                      </span>
                      <span className="mt-1 block text-sm text-muted">{p.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-lg border border-dashed border-border-strong bg-surface p-4 text-sm text-muted">
                Projects for this path are coming soon. Until then, the practice exercises and challenges in each course give you hands-on work.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4" aria-label="Path overview">
          <PathProgressPanel pathId={path.id} />
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <h2 className="mb-2 font-semibold">Skills you&apos;ll gain</h2>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              {path.skills?.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <h2 className="mb-1 font-semibold">Prerequisites</h2>
            <p className="text-muted">{renderInline(path.prerequisites ?? "None.")}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <h2 className="mb-1 font-semibold">Suggested order</h2>
            <p className="text-muted">{path.sequence}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

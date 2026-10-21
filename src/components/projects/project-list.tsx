"use client";

import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { DifficultyBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";

export function ProjectList({ planned }: { planned: string[] }) {
  const { projects } = useCatalog();
  const s = useLearnerState();
  const published = new Set(projects.map((p) => p.title.toLowerCase()));
  const upcoming = planned.filter((t) => !published.has(t.toLowerCase()));
  return (
    <div>
      <ol className="grid gap-3 md:grid-cols-2">
        {projects.map((p) => {
          const prog = s.projects[p.id];
          const done = p.stepIds.filter((id) => prog?.steps[id]).length;
          return (
            <li key={p.id}>
              <Link href={`/projects/${p.slug}`} className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-subtle tabular-nums">{p.order}.</span>
                  <span className="min-w-0 flex-1 font-medium">{p.title}</span>
                  {prog?.completedAt && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Completed" />}
                </div>
                <div className="mt-auto pt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs text-subtle">
                    <DifficultyBadge level={p.difficulty} />
                    <span>
                      {done}/{p.stepIds.length} steps
                    </span>
                  </div>
                  <ProgressBar value={(done / p.stepIds.length) * 100} label={`${p.title} progress`} />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      {upcoming.length > 0 && (
        <section className="mt-6" aria-labelledby="planned-projects">
          <h2 id="planned-projects" className="mb-2 text-sm font-semibold text-muted">
            Planned projects (not yet published)
          </h2>
          <ul className="grid gap-1.5 text-sm text-subtle sm:grid-cols-2">
            {upcoming.map((t) => (
              <li key={t} className="flex items-center gap-2 rounded border border-dashed border-border px-3 py-2">
                <Lock className="h-3.5 w-3.5" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

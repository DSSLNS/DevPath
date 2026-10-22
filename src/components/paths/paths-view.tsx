"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { techProgress } from "@/lib/courses";
import { overallProgress } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { TechMonogram } from "@/components/courses/tech-card";

export function PathsView() {
  const catalog = useCatalog();
  const state = useLearnerState();
  const career = catalog.paths.filter((p) => p.technologyIds?.length);
  const js = catalog.paths.filter((p) => !p.technologyIds?.length);

  const Select = ({ id }: { id: string }) =>
    state.settings.pathId === id ? (
      <Badge tone="success">
        <Check className="h-3 w-3" aria-hidden /> Your current path
      </Badge>
    ) : (
      <Button size="sm" onClick={() => learnerStore.updateSettings({ pathId: id })}>
        Follow this path
      </Button>
    );

  return (
    <div className="space-y-8">
      <section aria-labelledby="career-h">
        <h2 id="career-h" className="mb-3 text-lg font-semibold">
          Career paths
        </h2>
        <div className="space-y-4">
          {career.map((p) => {
            const progress = overallProgress(catalog, state, p.id);
            return (
              <article key={p.id} className="rounded-lg border border-border bg-surface p-5" data-testid={`path-${p.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{p.title}</h3>
                    <p className="mt-0.5 text-sm text-muted">{p.description}</p>
                  </div>
                  <Select id={p.id} />
                </div>
                {progress.total > 0 && (
                  <div className="mt-3 max-w-sm">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-subtle">Published lessons on this path</span>
                      <span className="tabular-nums">
                        {progress.done}/{progress.total}
                      </span>
                    </div>
                    <ProgressBar value={progress.percent} label={`${p.title} progress`} />
                  </div>
                )}
                <ol className="mt-4 space-y-2">
                  {p.technologyIds!.map((id, i) => {
                    const tech = catalog.technologies.find((t) => t.id === id);
                    if (!tech) return null;
                    const tp = techProgress(tech, state);
                    return (
                      <li key={id} className="flex items-start gap-3">
                        <span className="mt-2 w-5 shrink-0 text-right text-xs font-semibold text-subtle tabular-nums">{i + 1}</span>
                        <TechMonogram tech={tech} className="h-8 w-8 text-[10px]" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/courses/${tech.id}`} className="font-medium hover:text-primary hover:underline">
                              {tech.name}
                            </Link>
                            {tech.status === "available" ? (
                              tp.total > 0 && tp.completed === tp.total ? (
                                <Badge tone="success">Published lessons done</Badge>
                              ) : tp.started ? (
                                <Badge tone="info">{tp.percent}% complete</Badge>
                              ) : null
                            ) : tech.status === "notes" ? (
                              <Badge tone="info">Reference notes</Badge>
                            ) : (
                              <Badge>Planned</Badge>
                            )}
                          </div>
                          {p.reasons?.[id] && <p className="text-sm text-muted">{p.reasons[id]}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="js-h">
        <h2 id="js-h" className="mb-3 text-lg font-semibold">
          JavaScript tracks
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {js.map((p) => (
            <article key={p.id} className="flex flex-col rounded-lg border border-border bg-surface p-4">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
              <div className="mt-3">
                <Select id={p.id} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock, Lock } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { moduleProgress } from "@/lib/progress";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/components/ui/cn";

export function CurriculumOverview() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const path = catalog.paths.find((p) => p.id === s.settings.pathId) ?? catalog.paths[0];
  const inPath = new Set(path.moduleIds);
  return (
    <div>
      <div className="mb-5 flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center">
        <label htmlFor="path-select" className="text-sm font-medium">
          Learning path
        </label>
        <select
          id="path-select"
          value={path.id}
          onChange={(e) => learnerStore.updateSettings({ pathId: e.target.value })}
          className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
        >
          {catalog.paths.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted sm:ml-2">{path.description}</p>
      </div>
      <ol className="space-y-3">
        {catalog.modules.map((m) => {
          const p = moduleProgress(s, m);
          const minutes = m.lessons.reduce((n, l) => n + l.minutes, 0);
          return (
            <li key={m.id} className={cn("rounded-lg border border-border bg-surface", !inPath.has(m.id) && "opacity-70")}>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-bg-subtle text-sm font-semibold text-muted">{m.order}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/learn/${m.slug}`} className="font-semibold hover:text-primary">
                      {m.title}
                    </Link>
                    {m.optional && <Badge tone="warning">Optional</Badge>}
                    {!inPath.has(m.id) && <Badge>Not in current path</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{m.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle">
                    <span>
                      {m.lessons.length} published lesson{m.lessons.length === 1 ? "" : "s"}
                      {m.planned.length > 0 && ` · ${m.planned.length} planned`}
                    </span>
                    {minutes > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden /> ~{Math.round(minutes / 6) / 10} h
                      </span>
                    )}
                    {m.prerequisites.length > 0 && <span>Builds on: {m.prerequisites.map((id) => catalog.moduleById.get(id)?.title).join(", ")}</span>}
                  </div>
                </div>
                <div className="w-full shrink-0 sm:w-40">
                  <div className="mb-1 text-right text-xs text-subtle tabular-nums">
                    {p.done}/{p.total} complete
                  </div>
                  <ProgressBar value={p.percent} label={`${m.title} completion`} />
                </div>
              </div>
              {(m.lessons.length > 0 || m.planned.length > 0) && (
                <details className="border-t border-border">
                  <summary className="cursor-pointer px-4 py-2 text-sm text-muted hover:text-fg">Show lessons</summary>
                  <ul className="grid gap-x-6 px-4 pb-3 sm:grid-cols-2">
                    {m.lessons.map((l) => {
                      const done = !!s.lessons[l.id]?.completedAt;
                      return (
                        <li key={l.id}>
                          <Link href={`/learn/${m.slug}/${l.slug}`} className="flex items-center gap-2 py-1 text-sm hover:text-primary">
                            {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-label="Completed" /> : <Circle className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />}
                            <span className="truncate">{l.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                    {m.planned.map((l) => (
                      <li key={l.slug} className="flex items-center gap-2 py-1 text-sm text-subtle">
                        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{l.title}</span>
                        <span className="text-[11px]">(planned)</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

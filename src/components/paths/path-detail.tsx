"use client";

import Link from "next/link";
import { CheckCircle2, CircleDashed, PlayCircle, Circle, NotebookText } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { pathProgress, type StepStatus } from "@/lib/courses";
import { renderInline } from "@/lib/markdown";
import { learnerStore } from "@/lib/store/hooks";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { TechMonogram } from "@/components/courses/tech-card";
import { cn } from "@/components/ui/cn";

const STATUS: Record<StepStatus, { label: string; icon: typeof Circle; className: string }> = {
  completed: { label: "Completed", icon: CheckCircle2, className: "text-success" },
  current: { label: "Up next", icon: PlayCircle, className: "text-primary" },
  upcoming: { label: "Upcoming", icon: Circle, className: "text-subtle" },
  "coming-soon": { label: "Coming soon", icon: CircleDashed, className: "text-subtle" },
};

export function PathSteps({ pathId }: { pathId: string }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const path = catalog.paths.find((p) => p.id === pathId);
  if (!path) return null;
  const { steps } = pathProgress(catalog, path, state);
  const notes = new Map(catalog.kb.map((n) => [n.id, n]));
  return (
    <ol className="relative space-y-3" data-testid="path-steps">
      {steps.map(({ step, tech, status, progress }, i) => {
        const s = STATUS[status];
        const Icon = s.icon;
        const stepNotes = (step.noteIds ?? []).map((id) => notes.get(id)).filter((n) => !!n);
        return (
          <li
            key={step.id}
            className={cn("rounded-lg border bg-surface p-4", status === "current" ? "border-primary/60 shadow-sm" : "border-border")}
            data-testid={`path-step-${step.id}`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 w-6 shrink-0 text-right text-sm font-semibold text-subtle tabular-nums">{i + 1}</span>
              <TechMonogram tech={tech} className="h-9 w-9 text-[10px]" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{step.title}</h3>
                  <span className={cn("inline-flex items-center gap-1 text-xs font-medium", s.className)}>
                    <Icon className="h-3.5 w-3.5" aria-hidden /> {s.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">{renderInline(step.description)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle">
                  <span>
                    Course:{" "}
                    <Link href={`/courses/${tech.id}`} className="text-primary hover:underline">
                      {tech.name}
                    </Link>
                  </span>
                  <DifficultyBadge level={tech.level} />
                  {tech.status === "available" && (
                    <span className="tabular-nums">
                      {progress.completed}/{progress.total} lessons{tech.plannedLessons > 0 && ` · ${tech.plannedLessons} more coming`}
                    </span>
                  )}
                  {tech.status === "notes" && <Badge tone="info">Reference notes available</Badge>}
                </div>
                {stepNotes.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {stepNotes.map((n) => (
                      <li key={n.id}>
                        <Link href={`/e2e/${n.slug}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <NotebookText className="h-3 w-3" aria-hidden /> {n.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function PathProgressPanel({ pathId }: { pathId: string }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const path = catalog.paths.find((p) => p.id === pathId);
  if (!path) return null;
  const p = pathProgress(catalog, path, state);
  const followed = state.settings.pathId === path.id;
  const next = p.current;
  const nextLesson = next?.tech.status === "available" ? next.tech.lessonIds.find((id) => !state.lessons[id]?.completedAt) : undefined;
  return (
    <div className="rounded-lg border border-border bg-surface p-4" data-testid="path-progress">
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-semibold">Your progress</span>
        <span className="text-muted tabular-nums">
          {p.completed}/{p.total} lessons
        </span>
      </div>
      <ProgressBar value={p.percent} label={`${path.title} progress`} />
      <p className="mt-1.5 text-xs text-subtle">Counts published lessons only, saved in this browser.</p>
      {next && (
        <div className="mt-4">
          <h2 className="text-xs font-semibold tracking-wide text-subtle uppercase">Recommended next</h2>
          <p className="mt-1 font-medium">{next.step.title}</p>
          <Link href={nextLesson ? catalog.lessonUrl(nextLesson) : `/courses/${next.tech.id}`} className={cn(buttonClass("primary", "sm"), "mt-2")}>
            {nextLesson ? (p.started ? "Continue learning" : "Start learning") : next.tech.status === "notes" ? "Read the notes" : "Open course"}
          </Link>
        </div>
      )}
      <div className="mt-4 border-t border-border pt-3">
        {followed ? (
          <p className="text-xs text-success">This is the path your dashboard follows.</p>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => learnerStore.updateSettings({ pathId: path.id })} data-testid="follow-path">
            Make this my learning path
          </Button>
        )}
      </div>
    </div>
  );
}

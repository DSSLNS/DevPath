"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, NotebookText } from "lucide-react";
import type { CatalogTechnology } from "@/lib/catalog/types";
import { useLearnerState } from "@/lib/store/hooks";
import { formatDuration, techProgress } from "@/lib/courses";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/components/ui/cn";

export function TechMonogram({ tech, className }: { tech: Pick<CatalogTechnology, "badge" | "category">; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-md text-[11px] font-bold tracking-tight",
        tech.category === "fundamentals" && "bg-primary-soft text-primary-soft-fg",
        tech.category === "frontend" && "bg-info-soft text-info",
        tech.category === "backend" && "bg-success-soft text-success",
        tech.category === "databases" && "bg-warning-soft text-warning",
        tech.category === "testing" && "bg-danger-soft text-danger",
        (tech.category === "tools" || tech.category === "web-platform") && "bg-bg-subtle text-muted",
        className,
      )}
    >
      {tech.badge}
    </span>
  );
}

export function TechCard({ tech }: { tech: CatalogTechnology }) {
  const state = useLearnerState();
  const p = techProgress(tech, state);
  const href = `/courses/${tech.id}`;
  const action = tech.status === "available" ? (p.started ? "Continue learning" : "Start learning") : tech.status === "notes" ? "Read the notes" : "See what's coming";
  return (
    <article className="group relative flex flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong" data-testid={`tech-card-${tech.id}`}>
      <div className="flex items-start gap-3">
        <TechMonogram tech={tech} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {tech.name}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <DifficultyBadge level={tech.level} />
            {tech.status === "available" && tech.plannedLessons > 0 && <Badge tone="info">In progress</Badge>}
            {tech.status === "notes" && <Badge tone="info">Reference notes</Badge>}
            {tech.status === "planned" && <Badge>Coming soon</Badge>}
          </div>
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm text-muted">{tech.description}</p>
      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle">
        {tech.status === "available" && (
          <div className="flex items-center gap-1">
            <dt className="sr-only">Lessons</dt>
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            <dd>
              {tech.lessonIds.length} lesson{tech.lessonIds.length === 1 ? "" : "s"} published
              {tech.plannedLessons > 0 && ` · ${tech.plannedLessons} planned`}
            </dd>
          </div>
        )}
        {tech.totalDays > 0 && (
          <div className="flex items-center gap-1">
            <dt className="sr-only">Estimated duration</dt>
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <dd title={tech.estimated ? "Includes estimates for lessons not written yet" : undefined}>
              {tech.totalDays} days · {tech.estimated ? "~" : ""}
              {formatDuration(tech.totalMinutes)}
            </dd>
          </div>
        )}
        {tech.kbNotes > 0 && (
          <div className="flex items-center gap-1">
            <dt className="sr-only">Reference notes</dt>
            <NotebookText className="h-3.5 w-3.5" aria-hidden />
            <dd>{tech.kbNotes} notes</dd>
          </div>
        )}
      </dl>
      {tech.status === "available" && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-subtle">Your progress</span>
            <span className="font-medium tabular-nums">{p.percent}%</span>
          </div>
          <ProgressBar value={p.percent} label={`${tech.name} progress`} />
        </div>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
        {action} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </article>
  );
}

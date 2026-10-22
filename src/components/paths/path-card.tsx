"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LearningPath } from "@/content/types";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { pathProgress } from "@/lib/courses";
import { cn } from "@/components/ui/cn";
import { PATH_STYLE } from "./path-style";

const VISIBLE_TECHS = 6;

export function PathCard({ path, headingLevel = 3 }: { path: LearningPath; headingLevel?: 2 | 3 }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const style = PATH_STYLE[path.accent ?? "fullstack"];
  const Icon = style.icon;
  const progress = pathProgress(catalog, path, state);
  const techs = (path.technologyIds ?? []).map((id) => catalog.technologies.find((t) => t.id === id)).filter((t) => !!t);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={cn("group relative flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors", style.ring)} data-testid={`path-card-${path.id}`}>
      <span className={cn("grid h-11 w-11 place-items-center rounded-lg", style.iconClass)} aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <H className="mt-4 text-lg font-semibold tracking-tight">
        <Link href={`/paths/${path.id}`} className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none">
          {path.title}
        </Link>
      </H>
      <p className="mt-1.5 text-sm text-muted">{path.description}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies covered">
        {techs.slice(0, VISIBLE_TECHS).map((t) => (
          <li key={t.id} className="rounded-md border border-border bg-bg-subtle px-2 py-0.5 text-xs text-muted">
            {t.name}
          </li>
        ))}
        {techs.length > VISIBLE_TECHS && <li className="px-1 py-0.5 text-xs text-subtle">+{techs.length - VISIBLE_TECHS} more</li>}
      </ul>
      <div className="mt-auto pt-5">
        {progress.started && progress.total > 0 && (
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-subtle">Your progress</span>
              <span className="font-medium tabular-nums">{progress.percent}%</span>
            </div>
            <div role="progressbar" aria-label={`${path.title} progress`} aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
              <div className={cn("h-full rounded-full", style.barClass)} style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          Explore path <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

export function CareerPathGrid({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const catalog = useCatalog();
  const paths = catalog.paths.filter((p) => p.steps);
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {paths.map((p) => (
        <PathCard key={p.id} path={p} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LearningPath, PathAccent } from "@/content/types";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { pathProgress } from "@/lib/courses";
import { cn } from "@/components/ui/cn";
import { Reveal } from "@/components/ui/reveal";
import { PATH_STYLE } from "./path-style";

const VISIBLE_TECHS = 7;

/** Small decorative illustration that hints at what each path builds. */
function PathVisual({ accent }: { accent: PathAccent }) {
  const box = "rounded-md border border-border bg-surface";
  if (accent === "frontend")
    return (
      <div className="grid h-full grid-cols-[1.2fr_1fr] gap-2 p-3">
        <div className="space-y-1.5">
          <span className="block h-2 w-3/4 rounded bg-info/70" />
          <span className="block h-1.5 w-full rounded bg-border-strong" />
          <span className="block h-1.5 w-2/3 rounded bg-border-strong" />
          <span className="mt-2 block h-4 w-14 rounded bg-info" />
        </div>
        <div className="rounded-md bg-gradient-to-br from-info/40 to-primary/20" />
        <div className={cn(box, "col-span-2 grid grid-cols-3 gap-1.5 p-1.5")}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-6 rounded bg-surface-hover" />
          ))}
        </div>
      </div>
    );
  if (accent === "backend")
    return (
      <div className="flex h-full flex-col justify-center gap-1.5 p-3 font-mono text-[10px] leading-tight">
        <span className="text-subtle">$ node server.js</span>
        <span className="text-success">Listening on :3000</span>
        <span>
          <span className="rounded bg-success-soft px-1 text-success">GET</span> <span className="text-muted">/api/users</span> <span className="text-success">200</span>
        </span>
        <span>
          <span className="rounded bg-info-soft px-1 text-info">POST</span> <span className="text-muted">/api/orders</span> <span className="text-success">201</span>
        </span>
      </div>
    );
  if (accent === "testing")
    return (
      <div className="flex h-full flex-col justify-center gap-1.5 p-3 text-[10px]">
        {["login form shows errors", "checkout total is correct", "API returns 404 for unknown id"].map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-muted">
            <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-warning text-[8px] font-bold text-primary-fg">✓</span>
            <span className="truncate">{t}</span>
          </span>
        ))}
        <span className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
          <span className="block h-full w-full rounded-full bg-warning" />
        </span>
      </div>
    );
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 p-3">
      {[
        ["UI", "bg-info/60"],
        ["API", "bg-success/60"],
        ["Database", "bg-warning/60"],
      ].map(([label, color], i) => (
        <span key={label} className={cn(box, "flex items-center gap-2 px-2 py-1 text-[10px] text-muted")} style={{ marginLeft: `${i * 10}px` }}>
          <span className={cn("h-2 w-2 rounded-full", color)} /> {label}
        </span>
      ))}
    </div>
  );
}

export function PathCard({ path, headingLevel = 3 }: { path: LearningPath; headingLevel?: 2 | 3 }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const accent = path.accent ?? "fullstack";
  const style = PATH_STYLE[accent];
  const Icon = style.icon;
  const progress = pathProgress(catalog, path, state);
  const techs = (path.technologyIds ?? []).map((id) => catalog.technologies.find((t) => t.id === id)).filter((t) => !!t);
  const withLessons = techs.filter((t) => t.status === "available");
  const withNotes = techs.filter((t) => t.status === "notes");
  const lessons = withLessons.reduce((n, t) => n + t.lessonIds.length, 0);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      className={cn("group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-md transition-[transform,border-color] duration-300 hover:-translate-y-0.5", style.ring)}
      data-testid={`path-card-${path.id}`}
    >
      <div className="grid gap-5 p-6 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="min-w-0">
          <span className={cn("grid h-11 w-11 place-items-center rounded-xl", style.iconClass)} aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
          <H className="mt-4 text-xl font-semibold tracking-tight">
            <Link href={`/paths/${path.id}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
              {path.title}
            </Link>
          </H>
          <p className="mt-2 text-sm leading-relaxed text-muted">{path.description}</p>
        </div>
        <div className="hidden h-32 overflow-hidden rounded-xl border border-border bg-bg sm:block" aria-hidden>
          <PathVisual accent={accent} />
        </div>
      </div>
      <div className="mt-auto border-t border-border px-6 py-4">
        <ul className="flex flex-wrap gap-1.5" aria-label="Courses on this path">
          {techs.slice(0, VISIBLE_TECHS).map((t) => (
            <li key={t.id} className="rounded-md border border-border bg-bg-subtle px-2 py-0.5 text-xs text-muted">
              {t.name}
            </li>
          ))}
          {techs.length > VISIBLE_TECHS && <li className="px-1 py-0.5 text-xs text-subtle">+{techs.length - VISIBLE_TECHS} more</li>}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-subtle" data-testid="path-availability">
            {withLessons.length} of {techs.length} courses have lessons ({lessons} published)
            {withNotes.length > 0 && ` · ${withNotes.length} with reference notes`}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Explore path <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
        {progress.started && progress.total > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-subtle">Your progress</span>
              <span className="font-medium tabular-nums">{progress.percent}%</span>
            </div>
            <div role="progressbar" aria-label={`${path.title} progress`} aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
              <div className={cn("h-full rounded-full transition-[width] duration-700", style.barClass)} style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function CareerPathGrid({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const catalog = useCatalog();
  const paths = catalog.paths.filter((p) => p.steps);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {paths.map((p, i) => (
        <Reveal key={p.id} delay={i * 80} className="h-full">
          <PathCard path={p} headingLevel={headingLevel} />
        </Reveal>
      ))}
    </div>
  );
}

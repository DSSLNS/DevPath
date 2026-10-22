/**
 * Per-technology progress derived from learner state. Pure functions: the same rules
 * run for guests (localStorage) and signed-in learners (server-synced state).
 */
import type { CatalogTechnology } from "@/lib/catalog/types";
import type { CatalogApi } from "@/lib/catalog/context";
import type { PersistedState } from "@/lib/store/schema";
import type { LearningPath, PathStep } from "@/content/types";

export interface TechProgress {
  completed: number;
  /** Published lessons only: planned lessons can't be completed, so they don't count against the learner. */
  total: number;
  percent: number;
  started: boolean;
  lastOpenedAt?: string;
  /** First published lesson not completed yet, in course order. */
  nextLessonId?: string;
}

export function techProgress(tech: CatalogTechnology, s: PersistedState): TechProgress {
  const completed = tech.lessonIds.filter((id) => s.lessons[id]?.completedAt).length;
  const opened = tech.lessonIds.map((id) => s.lessons[id]?.lastOpenedAt).filter((d): d is string => !!d);
  return {
    completed,
    total: tech.lessonIds.length,
    percent: tech.lessonIds.length ? Math.round((completed / tech.lessonIds.length) * 100) : 0,
    started: opened.length > 0,
    lastOpenedAt: opened.sort().at(-1),
    nextLessonId: tech.lessonIds.find((id) => !s.lessons[id]?.completedAt),
  };
}

/** Technologies the learner has opened at least one lesson in, most recent first. */
export function startedTechnologies(c: CatalogApi, s: PersistedState) {
  return c.technologies
    .map((tech) => ({ tech, progress: techProgress(tech, s) }))
    .filter((x) => x.progress.started)
    .sort((a, b) => (b.progress.lastOpenedAt ?? "").localeCompare(a.progress.lastOpenedAt ?? ""));
}

export function technologyForLesson(c: CatalogApi, lessonId: string) {
  return c.technologies.find((t) => t.lessonIds.includes(lessonId));
}

export function formatDuration(minutes: number) {
  const hours = minutes / 60;
  return hours < 1 ? `${minutes} min` : `${Math.round(hours)} h`;
}

export type StepStatus = "completed" | "current" | "upcoming" | "coming-soon";

export interface PathProgress {
  /** Published lessons completed across the path's unique courses. */
  completed: number;
  total: number;
  percent: number;
  started: boolean;
  /** Per step, in path order. */
  steps: { step: PathStep; tech: CatalogTechnology; status: StepStatus; progress: TechProgress }[];
  /** First step that isn't finished and can be studied now. */
  current?: { step: PathStep; tech: CatalogTechnology };
}

/**
 * Progress through a career path. A step is "completed" when every published lesson of its
 * course is complete; courses with nothing published yet are "coming soon" and never block
 * later steps. Steps are advice, not locks: every available course can be opened at any time.
 */
export function pathProgress(c: CatalogApi, path: LearningPath, s: PersistedState): PathProgress {
  const techs = new Map(c.technologies.map((t) => [t.id, t]));
  const steps = (path.steps ?? []).flatMap((step) => {
    const tech = techs.get(step.techId);
    return tech ? [{ step, tech, progress: techProgress(tech, s) }] : [];
  });
  let currentFound = false;
  const withStatus = steps.map((x) => {
    let status: StepStatus;
    if (x.tech.status === "planned") status = "coming-soon";
    else if (x.tech.status === "available" && x.progress.total > 0 && x.progress.completed === x.progress.total) status = "completed";
    else if (!currentFound) {
      status = "current";
      currentFound = true;
    } else status = "upcoming";
    return { ...x, status };
  });
  const unique = [...new Map(steps.map((x) => [x.tech.id, x])).values()];
  const completed = unique.reduce((n, x) => n + x.progress.completed, 0);
  const total = unique.reduce((n, x) => n + x.progress.total, 0);
  const current = withStatus.find((x) => x.status === "current");
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
    started: unique.some((x) => x.progress.started),
    steps: withStatus,
    current: current && { step: current.step, tech: current.tech },
  };
}

/**
 * Per-technology progress derived from learner state. Pure functions: the same rules
 * run for guests (localStorage) and signed-in learners (server-synced state).
 */
import type { CatalogTechnology } from "@/lib/catalog/types";
import type { CatalogApi } from "@/lib/catalog/context";
import type { PersistedState } from "@/lib/store/schema";

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

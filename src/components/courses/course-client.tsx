"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, CircleDashed, PlayCircle } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { techProgress } from "@/lib/courses";
import { bestQuizPercent, dayStatus } from "@/lib/days";
import { ProgressBar } from "@/components/ui/progress";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CourseProgressPanel({ techId }: { techId: string }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const tech = catalog.technologies.find((t) => t.id === techId);
  if (!tech || tech.status !== "available") return null;
  const p = techProgress(tech, state);
  const next = p.nextLessonId ? catalog.lessonById.get(p.nextLessonId) : undefined;
  return (
    <div className="rounded-lg border border-border bg-surface p-4" data-testid="course-progress">
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">Your progress</span>
        <span className="text-muted tabular-nums">
          {p.completed} of {p.total} published lessons complete
        </span>
      </div>
      <ProgressBar value={p.percent} label={`${tech.name} course progress`} />
      <div className="mt-3 flex flex-wrap gap-2">
        {next ? (
          <Link href={catalog.lessonUrl(next.id)} className={buttonClass("primary")}>
            <PlayCircle className="h-4 w-4" aria-hidden /> {p.started ? "Continue" : "Start"}: {next.title}
          </Link>
        ) : (
          <p className="text-sm text-success">You have completed every published lesson in this course. New lessons are added as they are written.</p>
        )}
      </div>
    </div>
  );
}

export function DayStatusBadge({ lessonIds, quizId }: { lessonIds: string[]; quizId: string }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const s = dayStatus(catalog, state, lessonIds, quizId);
  if (s.published === 0) return <Badge>Planned</Badge>;
  if (s.complete) return <Badge tone="success">Completed</Badge>;
  if (s.completedLessons > 0 || s.bestScore !== null) return <Badge tone="info">In progress</Badge>;
  return null;
}

/** One row per lesson inside a roadmap day: completion icon, link (or planned label). */
export function DayLessonList({ lessons }: { lessons: { id: string; title: string; url?: string; minutes?: number }[] }) {
  const state = useLearnerState();
  return (
    <ul className="mt-2 space-y-1">
      {lessons.map((l) => {
        const done = !!state.lessons[l.id]?.completedAt;
        const opened = !!state.lessons[l.id];
        const Icon = !l.url ? CircleDashed : done ? CheckCircle2 : opened ? PlayCircle : Circle;
        return (
          <li key={l.id} className="flex items-center gap-2 text-sm">
            <Icon className={`h-4 w-4 shrink-0 ${done ? "text-success" : "text-subtle"}`} aria-hidden />
            <span className="sr-only">{!l.url ? "Planned:" : done ? "Completed:" : opened ? "Started:" : "Not started:"}</span>
            {l.url ? (
              <Link href={l.url} className="text-fg hover:text-primary hover:underline">
                {l.title}
              </Link>
            ) : (
              <span className="text-muted">
                {l.title} <span className="text-xs text-subtle">(planned)</span>
              </span>
            )}
            {l.minutes && l.url && <span className="ml-auto text-xs text-subtle tabular-nums">{l.minutes} min</span>}
          </li>
        );
      })}
    </ul>
  );
}

/** End-of-day summary built only from saved learner data. */
export function DaySummary({
  lessonIds,
  quizId,
  objectives,
  nextDay,
}: {
  lessonIds: string[];
  quizId: string;
  objectives: string[];
  nextDay?: { href: string; title: string };
}) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const s = dayStatus(catalog, state, lessonIds, quizId);
  const threshold = state.settings.masteryThreshold;
  const minutes = Math.round(s.activeSeconds / 60);
  return (
    <section aria-labelledby="day-summary-h" className="rounded-lg border border-border bg-surface p-5" data-testid="day-summary">
      <h2 id="day-summary-h" className="text-lg font-semibold">
        Day summary
      </h2>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-surface-2 p-3">
          <dt className="text-xs text-subtle">Lessons completed</dt>
          <dd className="font-semibold tabular-nums">
            {s.completedLessons} / {s.published}
          </dd>
        </div>
        <div className="rounded-md bg-surface-2 p-3">
          <dt className="text-xs text-subtle">Practice exercises solved</dt>
          <dd className="font-semibold tabular-nums">
            {s.exercisesSolved} / {s.exercisesTotal}
          </dd>
        </div>
        <div className="rounded-md bg-surface-2 p-3">
          <dt className="text-xs text-subtle">Day assessment</dt>
          <dd className="font-semibold">{s.bestScore === null ? "Not taken yet" : `Best score ${s.bestScore}%${s.bestScore >= threshold ? " · passed" : ""}`}</dd>
        </div>
        <div className="rounded-md bg-surface-2 p-3">
          <dt className="text-xs text-subtle">Active time on these lessons</dt>
          <dd className="font-semibold">{s.activeSeconds === 0 ? "Not recorded yet" : minutes < 1 ? "Under a minute" : `${minutes} min`}</dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-subtle uppercase">Topics covered</h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
            {objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-subtle uppercase">Concepts to revise</h3>
          {s.toRevise.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted">
              {s.bestScore === null ? "Take the day assessment to find out which concepts need more practice." : "Nothing flagged. Your answers show a good grasp of today's lessons."}
            </p>
          ) : (
            <ul className="mt-1.5 space-y-1 text-sm">
              {s.toRevise.map((id) => (
                <li key={id}>
                  <Link href={catalog.lessonUrl(id)} className="text-primary hover:underline">
                    {catalog.lessonById.get(id)?.title ?? id}
                  </Link>{" "}
                  <span className="text-muted">(review the lesson and retry its practice)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        The day counts as complete when you have marked every published lesson complete. Passing the assessment ({threshold}% or more, set in Settings) is tracked
        separately, so reading a lesson never counts as mastering it.
      </p>
      {nextDay && (
        <Link href={nextDay.href} className={`${buttonClass(s.complete ? "primary" : "secondary")} mt-3`}>
          Next: {nextDay.title} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}

export function BestQuizScore({ quizId }: { quizId: string }) {
  const state = useLearnerState();
  const best = bestQuizPercent(state, quizId);
  return best === null ? null : <Badge tone={best >= state.settings.masteryThreshold ? "success" : "warning"}>Best {best}%</Badge>;
}

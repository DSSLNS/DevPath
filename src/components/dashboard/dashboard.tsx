"use client";

import Link from "next/link";
import { ArrowRight, BookMarked, Flame, FolderKanban, History, ListChecks, PlayCircle, Target, TriangleAlert } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import {
  currentStreak,
  lastAttempts,
  moduleProgress,
  overallProgress,
  pathModules,
  recommendedNextLesson,
  weakTopics,
} from "@/lib/progress";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { Card, CardHeader, PageHeader } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { buttonClass } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/ui/badge";
import { contentHref, contentTitle } from "@/components/bookmarks/content-ref";

export function Dashboard() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const meta = useStoreMeta();

  if (!meta.hydrated) {
    return <div className="h-64 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading your dashboard" />;
  }

  const hasActivity = Object.keys(s.lessons).length > 0 || s.quizAttempts.length > 0 || Object.keys(s.exercises).length > 0;
  const next = recommendedNextLesson(catalog, s);
  const path = catalog.paths.find((p) => p.id === s.settings.pathId) ?? catalog.paths[0];

  if (!hasActivity) return <Onboarding nextLessonId={next?.id} />;

  const overall = overallProgress(catalog, s);
  const last = s.lastLessonId ? catalog.lessonById.get(s.lastLessonId) : undefined;
  const lastSection = s.lastLessonId ? s.lessons[s.lastLessonId]?.lastSection : undefined;
  const weak = weakTopics(catalog, s).slice(0, 5);
  const attempts = lastAttempts(s, 5);
  const streak = currentStreak(s);
  const completed = Object.values(s.lessons).filter((l) => l.completedAt).length;
  const pendingExercises = Object.entries(s.exercises)
    .filter(([, e]) => e.attempts > 0 && e.correctCount === 0)
    .map(([id]) => ({ id, lesson: catalog.lessons.find((l) => l.practiceIds.includes(id) || l.challengeId === id) }))
    .filter((x) => x.lesson)
    .slice(0, 5);
  const pendingChallenges = Object.entries(s.challenges)
    .filter(([, c]) => c.attempts > 0 && !c.passed && !c.selfReviewed)
    .map(([id]) => catalog.challenges.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 3);
  const projects = catalog.projects
    .map((p) => ({ p, prog: s.projects[p.id] }))
    .filter((x) => x.prog)
    .slice(0, 4);

  return (
    <div>
      <PageHeader title="Dashboard" description="Pick up where you left off and see what to study next." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold tracking-wide text-subtle uppercase">Continue learning</div>
              {last ? (
                <>
                  <h2 className="mt-1 truncate text-xl font-semibold">{last.title}</h2>
                  <p className="text-sm text-muted">
                    {catalog.moduleById.get(last.moduleId)?.title} · Lesson {last.index + 1}
                    {lastSection ? " · resumes where you stopped" : ""}
                  </p>
                </>
              ) : (
                <h2 className="mt-1 text-xl font-semibold">Start your next lesson</h2>
              )}
            </div>
            {last ? (
              <Link href={`${catalog.lessonUrl(last.id)}?resume=1`} className={buttonClass("primary", "md")} data-testid="continue-learning">
                <PlayCircle className="h-4 w-4" aria-hidden /> Continue learning
              </Link>
            ) : next ? (
              <Link href={catalog.lessonUrl(next.id)} className={buttonClass("primary")}>
                Start
              </Link>
            ) : null}
          </div>
          {next && next.id !== last?.id && (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm">
              <Target className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                Recommended next: <strong>{next.title}</strong>
              </span>
              <Link href={catalog.lessonUrl(next.id)} className="shrink-0 text-primary hover:underline">
                Open
              </Link>
            </div>
          )}
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <ProgressRing value={overall.percent} size={72} label="Path completion" />
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-subtle uppercase">Current path</div>
            <div className="truncate font-semibold">{path.title}</div>
            <div className="text-sm text-muted">
              {overall.done} of {overall.total} published lessons · {completed} completed overall
            </div>
            {s.settings.showAchievements && streak > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs text-warning">
                <Flame className="h-3.5 w-3.5" aria-hidden /> {streak}-day streak
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Modules in your path" action={<Link href="/learn" className="text-xs text-primary hover:underline">View curriculum</Link>} />
          <ul className="divide-y divide-border">
            {pathModules(catalog, s.settings.pathId)
              .filter((m) => m.lessons.length)
              .slice(0, 8)
              .map((m) => {
                const p = moduleProgress(s, m);
                return (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Link href={`/learn/${m.slug}`} className="w-48 shrink-0 truncate text-sm hover:text-primary sm:w-64">
                      {m.order}. {m.title}
                    </Link>
                    <ProgressBar value={p.percent} label={`${m.title} progress`} />
                    <span className="w-12 shrink-0 text-right text-xs text-subtle tabular-nums">
                      {p.done}/{p.total}
                    </span>
                  </li>
                );
              })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Needs revision" action={weak.length > 0 ? <Link href="/progress#revision" className="text-xs text-primary hover:underline">Revise</Link> : undefined} />
          {weak.length ? (
            <ul className="divide-y divide-border">
              {weak.map((w) => {
                const l = catalog.lessonById.get(w.lessonId);
                return (
                  <li key={w.lessonId} className="px-4 py-2.5 text-sm">
                    <Link href={catalog.lessonUrl(w.lessonId)} className="flex items-center gap-2 hover:text-primary">
                      <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
                      <span className="truncate">{l?.title ?? w.lessonId}</span>
                    </Link>
                    <div className="pl-5.5 text-xs text-subtle">{w.reason}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">No weak topics yet. Topics appear here when quiz scores fall below {s.settings.masteryThreshold}% or answers are incorrect.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent quiz attempts" action={<Link href="/quizzes" className="text-xs text-primary hover:underline">All assessments</Link>} />
          {attempts.length ? (
            <ul className="divide-y divide-border">
              {attempts.map((a) => (
                <li key={a.id} className="flex items-center gap-2 px-4 py-2.5 text-sm">
                  <ListChecks className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className={a.percent >= 70 ? "font-medium text-success tabular-nums" : "font-medium text-warning tabular-nums"}>{a.percent}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">Take a lesson quiz to see your scores here.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Practice awaiting completion" action={<Link href="/practice" className="text-xs text-primary hover:underline">Practice Lab</Link>} />
          {pendingExercises.length || pendingChallenges.length ? (
            <ul className="divide-y divide-border text-sm">
              {pendingExercises.map((x) => (
                <li key={x.id} className="px-4 py-2.5">
                  <Link href={`${catalog.lessonUrl(x.lesson!.id)}#practice`} className="hover:text-primary">
                    Unsolved exercise in <strong>{x.lesson!.title}</strong>
                  </Link>
                </li>
              ))}
              {pendingChallenges.map((c) => (
                <li key={c!.id} className="flex items-center gap-2 px-4 py-2.5">
                  <Link href={`/practice/${c!.slug}`} className="min-w-0 flex-1 truncate hover:text-primary">
                    {c!.title}
                  </Link>
                  <DifficultyBadge level={c!.difficulty} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">Nothing pending. Exercises you attempt but haven&apos;t solved yet show up here.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Recently viewed" />
          {s.recent.length ? (
            <ul className="divide-y divide-border text-sm">
              {s.recent.slice(0, 6).map((r) => (
                <li key={`${r.type}:${r.id}`} className="flex items-center gap-2 px-4 py-2.5">
                  <History className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                  <Link href={contentHref(catalog, r.type, r.id)} className="min-w-0 flex-1 truncate hover:text-primary">
                    {contentTitle(catalog, r.type, r.id)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">Lessons and notes you open appear here.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Bookmarks" action={<Link href="/bookmarks" className="text-xs text-primary hover:underline">All</Link>} />
          {s.bookmarks.length ? (
            <ul className="divide-y divide-border text-sm">
              {s.bookmarks.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center gap-2 px-4 py-2.5">
                  <BookMarked className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                  <Link href={contentHref(catalog, b.contentType, b.contentId)} className="min-w-0 flex-1 truncate hover:text-primary">
                    {contentTitle(catalog, b.contentType, b.contentId)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">Bookmark lessons and notes to keep them one click away.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Projects" action={<Link href="/projects" className="text-xs text-primary hover:underline">All projects</Link>} />
          {projects.length ? (
            <ul className="divide-y divide-border text-sm">
              {projects.map(({ p, prog }) => {
                const done = p.stepIds.filter((id) => prog!.steps[id]).length;
                return (
                  <li key={p.id} className="px-4 py-2.5">
                    <Link href={`/projects/${p.slug}`} className="flex items-center gap-2 hover:text-primary">
                      <FolderKanban className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{p.title}</span>
                      <span className="text-xs text-subtle">{prog!.completedAt ? "Done" : `${done}/${p.stepIds.length} steps`}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">Start a guided project to apply what you learn.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Onboarding({ nextLessonId }: { nextLessonId?: string }) {
  const catalog = useCatalog();
  const s = useLearnerState();
  const published = catalog.lessons.length;
  return (
    <div className="mx-auto max-w-4xl" data-testid="onboarding">
      <PageHeader
        eyebrow="Welcome"
        title="Start learning JavaScript"
        description="You haven't started yet, so there's no progress to show. Choose a learning path, then open your first lesson. Your progress is saved in this browser."
      />
      <h2 className="mb-2 text-sm font-semibold">1. Choose a learning path</h2>
      <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Learning path">
        {catalog.paths.map((p) => {
          const selected = s.settings.pathId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => learnerStore.updateSettings({ pathId: p.id })}
              className={`rounded-lg border p-4 text-left transition-colors ${selected ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-border-strong"}`}
            >
              <div className="font-semibold">{p.title}</div>
              <p className="mt-1 text-sm text-muted">{p.description}</p>
              <p className="mt-2 text-xs text-subtle">{p.moduleIds.length} modules</p>
            </button>
          );
        })}
      </div>
      <h2 className="mt-6 mb-2 text-sm font-semibold">2. Begin</h2>
      <div className="flex flex-wrap gap-2">
        {nextLessonId && (
          <Link href={catalog.lessonUrl(nextLessonId)} className={buttonClass("primary")} data-testid="start-first-lesson">
            Start with “{catalog.lessonById.get(nextLessonId)?.title}” <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
        <Link href="/learn" className={buttonClass("secondary")}>
          Browse the curriculum
        </Link>
        <Link href="/e2e" className={buttonClass("ghost")}>
          Explore E2E testing notes
        </Link>
      </div>
      <p className="mt-6 text-xs text-subtle">
        {published} lessons are published so far across {catalog.modules.filter((m) => m.lessons.length).length} modules. The rest of the curriculum is listed as planned.
      </p>
    </div>
  );
}

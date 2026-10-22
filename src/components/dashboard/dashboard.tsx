"use client";

import Link from "next/link";
import { ArrowRight, BookMarked, Lightbulb, ListChecks, PlayCircle, Search, TriangleAlert } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { recommendedNextLesson, weakTopics } from "@/lib/progress";
import { pathProgress, startedTechnologies, technologyForLesson, techProgress } from "@/lib/courses";
import { useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { buttonClass } from "@/components/ui/button";
import { contentHref, contentTitle } from "@/components/bookmarks/content-ref";
import { TechMonogram } from "@/components/courses/tech-card";
import { CareerPathGrid } from "@/components/paths/path-card";
import { ProgressOverview, TodayPlan } from "./learning-overview";

export function Dashboard() {
  const meta = useStoreMeta();
  const s = useLearnerState();
  const hasActivity = Object.keys(s.lessons).length > 0 || s.quizAttempts.length > 0 || Object.values(s.exercises).some((e) => e.attempts > 0);

  return (
    <div className="mx-auto max-w-6xl">
      <Hero />
      {meta.hydrated && hasActivity && <ContinueLearning />}

      <section aria-labelledby="paths-h" className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="paths-h" className="text-xl font-semibold tracking-tight">
              Choose your learning path
            </h2>
            <p className="text-sm text-muted">Four paths, built from shared courses. Progress in a course counts towards every path that uses it.</p>
          </div>
          <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
            Browse all courses
          </Link>
        </div>
        <CareerPathGrid />
      </section>

      {!meta.hydrated ? (
        <div className="mt-10 h-40 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading your progress" />
      ) : hasActivity ? (
        <ReturningLearner />
      ) : (
        <NewLearner />
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="rounded-2xl border border-border bg-surface px-5 py-8 shadow-sm sm:px-10 sm:py-12" aria-labelledby="hero-h">
      <h1 id="hero-h" className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        Learn Web Development, Step by Step.
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] text-muted sm:text-base">
        Choose your learning path, master the fundamentals, practise with real examples, and build projects at your own pace.
      </p>
      <form action="/search" role="search" className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
        <label htmlFor="hero-search" className="sr-only">
          Search courses, lessons, notes and exercises
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
          <input
            id="hero-search"
            name="q"
            type="search"
            placeholder="Search HTML, JavaScript, React, Node.js, Cypress..."
            className="h-11 w-full rounded-lg border border-border bg-bg pr-3 pl-9 text-sm"
            data-testid="hero-search"
          />
        </div>
        <button type="submit" className={buttonClass("secondary", "md", "h-11 justify-center")}>
          Search
        </button>
      </form>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/paths" className={buttonClass("primary", "md", "h-10")} data-testid="explore-paths">
          Explore Learning Paths <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/courses" className={buttonClass("ghost", "md", "h-10")}>
          Explore all courses
        </Link>
      </div>
    </section>
  );
}

function ContinueLearning() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const last = s.lastLessonId ? catalog.lessonById.get(s.lastLessonId) : undefined;
  const tech = last ? technologyForLesson(catalog, last.id) : undefined;
  const recent = startedTechnologies(catalog, s).slice(0, 4);
  if (!last) return null;
  return (
    <section aria-labelledby="continue-h" className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h2 id="continue-h" className="text-xs font-semibold tracking-wide text-subtle uppercase">
            Continue learning
          </h2>
          <p className="mt-1 truncate text-lg font-semibold">{last.title}</p>
          <p className="truncate text-sm text-muted">
            {tech ? `${tech.name} · ` : ""}
            {catalog.moduleById.get(last.moduleId)?.title}
          </p>
        </div>
        <Link href={`${catalog.lessonUrl(last.id)}?resume=1`} className={buttonClass("primary")} data-testid="continue-learning">
          <PlayCircle className="h-4 w-4" aria-hidden /> Continue learning
        </Link>
      </Card>
      <Card className="p-5">
        <h2 className="text-xs font-semibold tracking-wide text-subtle uppercase">Recently opened courses</h2>
        <ul className="mt-2 space-y-2">
          {recent.map(({ tech: t, progress }) => (
            <li key={t.id} className="flex items-center gap-3">
              <TechMonogram tech={t} className="h-8 w-8 text-[10px]" />
              <div className="min-w-0 flex-1">
                <Link href={`/courses/${t.id}`} className="block truncate text-sm font-medium hover:text-primary">
                  {t.name}
                </Link>
                <ProgressBar value={progress.percent} label={`${t.name} progress`} className="mt-1" />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-subtle tabular-nums">{progress.percent}%</span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function NewLearner() {
  const catalog = useCatalog();
  const starts = [
    { techId: "html", why: "Never coded before? Build your first web page today." },
    { techId: "javascript", why: "Know some HTML and CSS? Make pages interactive." },
    { techId: "testing-fundamentals", why: "Heading into QA? Learn how testing works first." },
  ]
    .map((x) => ({ ...x, tech: catalog.technologies.find((t) => t.id === x.techId) }))
    .filter((x) => x.tech);
  return (
    <section aria-labelledby="start-h" className="mt-10" data-testid="onboarding">
      <h2 id="start-h" className="text-xl font-semibold tracking-tight">
        Not sure where to start?
      </h2>
      <p className="mb-4 text-sm text-muted">
        Pick one of these and begin straight away. No account is needed: your progress is saved in this browser on this device.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {starts.map(({ tech, why }) => {
          const first = tech!.lessonIds[0];
          return (
            <Link
              key={tech!.id}
              href={first ? catalog.lessonUrl(first) : `/courses/${tech!.id}`}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 hover:border-border-strong"
              data-testid={`start-${tech!.id}`}
            >
              <TechMonogram tech={tech!} />
              <span className="min-w-0">
                <span className="block font-medium">{tech!.name}</span>
                <span className="block text-sm text-muted">{why}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {first ? "Start the first lesson" : "Read the notes"} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ReturningLearner() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const careerPaths = catalog.paths.filter((p) => p.steps);
  const inProgress = careerPaths.map((p) => ({ p, prog: pathProgress(catalog, p, s) })).filter((x) => x.prog.started);
  const attempts = [...s.quizAttempts].reverse().slice(0, 5);

  // Recommended next steps: the next lesson in the course being studied, the followed path's next
  // course, then lessons that need revision. Only real, saved data is used.
  const steps: { key: string; href: string; title: string; detail: string; icon: typeof Lightbulb }[] = [];
  const focus = s.lastLessonId ? technologyForLesson(catalog, s.lastLessonId) : undefined;
  const focusNext = focus ? techProgress(focus, s).nextLessonId : undefined;
  const nextLesson = (focusNext && catalog.lessonById.get(focusNext)) || recommendedNextLesson(catalog, s);
  if (nextLesson) steps.push({ key: "next", href: catalog.lessonUrl(nextLesson.id), title: nextLesson.title, detail: "Next lesson", icon: PlayCircle });
  const followed = careerPaths.find((p) => p.id === s.settings.pathId);
  const pathNext = followed ? pathProgress(catalog, followed, s).current : undefined;
  if (pathNext && pathNext.tech.id !== focus?.id)
    steps.push({ key: "path", href: `/courses/${pathNext.tech.id}`, title: pathNext.step.title, detail: `Next on ${followed!.title}`, icon: Lightbulb });
  for (const w of weakTopics(catalog, s).slice(0, 2)) {
    const l = catalog.lessonById.get(w.lessonId);
    if (l) steps.push({ key: `rev-${l.id}`, href: catalog.lessonUrl(l.id), title: l.title, detail: `Revise: ${w.reason}`, icon: TriangleAlert });
  }

  return (
    <div className="mt-10 grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ProgressOverview />
      </div>
      <TodayPlan />

      <Card>
        <CardHeader title="Recommended next steps" />
        {steps.length ? (
          <ul className="divide-y divide-border">
            {steps.map(({ key, href, title, detail, icon: Icon }) => (
              <li key={key}>
                <Link href={href} className="flex items-start gap-2.5 px-4 py-3 text-sm hover:bg-surface-hover">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{title}</span>
                    <span className="block text-xs text-muted">{detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-muted">You&apos;re up to date with every published lesson you started. Pick a new course from a path above.</p>
        )}
      </Card>

      <Card>
        <CardHeader title="Learning paths in progress" action={<Link href="/paths" className="text-xs text-primary hover:underline">All paths</Link>} />
        {inProgress.length ? (
          <ul className="divide-y divide-border">
            {inProgress.map(({ p, prog }) => (
              <li key={p.id} className="px-4 py-3">
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <Link href={`/paths/${p.id}`} className="truncate font-medium hover:text-primary">
                    {p.title}
                  </Link>
                  <span className="shrink-0 text-xs text-subtle tabular-nums">{prog.percent}%</span>
                </div>
                <ProgressBar value={prog.percent} label={`${p.title} progress`} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-muted">Paths you study in appear here.</p>
        )}
      </Card>

      <Card>
        <CardHeader title="Assessment results" action={<Link href="/quizzes" className="text-xs text-primary hover:underline">All assessments</Link>} />
        {attempts.length ? (
          <ul className="divide-y divide-border">
            {attempts.map((a) => (
              <li key={a.id} className="flex items-center gap-2 px-4 py-2.5 text-sm">
                <ListChecks className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{a.title}</span>
                <span className={a.percent >= s.settings.masteryThreshold ? "font-medium text-success tabular-nums" : "font-medium text-warning tabular-nums"}>{a.percent}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-muted">Take a lesson or day assessment to see your scores here.</p>
        )}
      </Card>

      {s.bookmarks.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader title="Bookmarks" action={<Link href="/bookmarks" className="text-xs text-primary hover:underline">All bookmarks</Link>} />
          <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {s.bookmarks.slice(0, 6).map((b) => (
              <li key={b.id} className="bg-surface">
                <Link href={contentHref(catalog, b.contentType, b.contentId)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-hover">
                  <BookMarked className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                  <span className="truncate">{contentTitle(catalog, b.contentType, b.contentId)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

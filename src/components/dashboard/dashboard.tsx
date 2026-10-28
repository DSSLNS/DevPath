"use client";

import Link from "next/link";
import { BookMarked, Lightbulb, ListChecks, PlayCircle, TriangleAlert } from "lucide-react";
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
import { CourseCatalog } from "@/components/courses/course-catalog";
import { FeaturedProjects } from "@/components/projects/project-showcase";
import { Section, SectionHeading } from "@/components/ui/section";
import { Hero } from "@/components/home/hero";
import { Journey } from "@/components/home/journey";
import { Features } from "@/components/home/features";
import { ProgressOverview, TodayPlan } from "./learning-overview";

export function Dashboard() {
  const meta = useStoreMeta();
  const s = useLearnerState();
  const catalog = useCatalog();
  const hasActivity = Object.keys(s.lessons).length > 0 || s.quizAttempts.length > 0 || Object.values(s.exercises).some((e) => e.attempts > 0);

  return (
    <div className="mx-auto max-w-6xl">
      <Hero />
      {meta.hydrated && hasActivity && <ContinueLearning />}

      <Section id="paths" labelledBy="paths-h">
        <SectionHeading
          id="paths-h"
          eyebrow="Learning paths"
          title="Choose Your Learning Path"
          description="Four paths built from shared courses. Progress in a course counts towards every path that uses it, and nothing is locked."
          action={
            <Link href="/paths" className={buttonClass("secondary")}>
              Compare paths
            </Link>
          }
        />
        <CareerPathGrid />
      </Section>

      {meta.hydrated && hasActivity && (
        <Section labelledBy="progress-h" className="pt-0">
          <SectionHeading id="progress-h" eyebrow="Your learning" title="Pick up where you left off" description="Everything here comes from progress saved in this browser." />
          <ReturningLearner />
        </Section>
      )}

      <Journey />
      <Features />

      <Section labelledBy="projects-h">
        <SectionHeading
          id="projects-h"
          eyebrow="Projects"
          title="Build Real Projects"
          description="Apply what you learn in guided projects with requirements, milestones and testing checklists."
          action={
            <Link href="/projects" className={buttonClass("secondary")}>
              All projects
            </Link>
          }
        />
        <FeaturedProjects />
      </Section>

      <Section labelledBy="discover-h">
        <SectionHeading
          id="discover-h"
          eyebrow="Course discovery"
          title="Find Your Next Course"
          description="Search and filter by path, difficulty, availability and your progress. Courses still being written are labelled honestly."
          action={
            <Link href="/courses" className={buttonClass("secondary")}>
              All {catalog.technologies.length} technologies
            </Link>
          }
        />
        <CourseCatalog featuredIds={DISCOVERY_IDS} headingLevel={3} />
      </Section>
    </div>
  );
}

/** Courses shown in home-page discovery; the full catalog lives on /courses. */
const DISCOVERY_IDS = ["html", "css", "javascript", "typescript", "react", "nextjs", "nodejs", "express", "api-testing", "cypress", "playwright", "testing-fundamentals"];

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

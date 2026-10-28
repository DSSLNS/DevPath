import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { assessmentQuestions, dayChallenges, getCourse, getLessonRef, getTechnology, lessonUrl, technologies } from "@/content";
import { curriculumManifest } from "@/content/curriculum/manifest";
import type { RoadmapDay } from "@/content/technologies/types";
import { renderInline } from "@/lib/markdown";
import { PageHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { DayLessonList, DaySummary } from "@/components/courses/course-client";
import { ActiveTimeTracker } from "@/components/lesson/active-time-tracker";

function openable(d: RoadmapDay) {
  return d.lessonIds.some((id) => getLessonRef(id));
}

export function generateStaticParams() {
  return technologies.flatMap((t) =>
    getCourse(t)
      .weeks.flatMap((w) => w.days)
      .filter(openable)
      .map((d) => ({ tech: t.id, day: String(d.day) })),
  );
}

function findDay(techId: string, dayParam: string) {
  const tech = getTechnology(techId);
  if (!tech || !/^\d+$/.test(dayParam)) return null;
  const days = getCourse(tech).weeks.flatMap((w) => w.days);
  const index = days.findIndex((d) => d.day === Number(dayParam));
  if (index < 0 || !openable(days[index])) return null;
  return { tech, day: days[index], prev: days.slice(0, index).findLast(openable), next: days.slice(index + 1).find(openable), nextAny: days[index + 1] };
}

export async function generateMetadata({ params }: { params: Promise<{ tech: string; day: string }> }): Promise<Metadata> {
  const { tech, day } = await params;
  const found = findDay(tech, day);
  return found ? { title: `${found.tech.name} Day ${found.day.day}: ${found.day.title}`, description: found.day.objective } : { title: "Day not found" };
}

const manifestTitles = new Map<string, string>(curriculumManifest.flatMap((m) => m.lessons.map(([slug, title]) => [`${m.slug}-${slug}`, title] as const)));

export default async function DayPage({ params }: { params: Promise<{ tech: string; day: string }> }) {
  const p = await params;
  const found = findDay(p.tech, p.day);
  if (!found) notFound();
  const { tech, day, prev, next, nextAny } = found;
  const refs = day.lessonIds.map((id) => getLessonRef(id)).filter((r) => !!r);
  const published = refs.map((r) => r.lesson.id);
  const review = day.kind === "review";
  const questions = assessmentQuestions(published, review ? 15 : 12);
  const tasks = review ? [] : dayChallenges(published);
  const quizId = `day:${tech.id}:${day.day}`;
  const objectives = review ? refs.map((r) => r.lesson.title) : refs.flatMap((r) => r.lesson.objectives);
  const criteria = review ? [] : refs.flatMap((r) => r.lesson.completionCriteria ?? []);
  const missing = day.lessonIds.filter((id) => !getLessonRef(id));

  return (
    <div className="max-w-4xl">
      <ActiveTimeTracker />
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <Link href="/courses" className="hover:text-fg">
          Learn
        </Link>{" "}
        /{" "}
        <Link href={`/courses/${tech.id}`} className="hover:text-fg">
          {tech.name}
        </Link>{" "}
        / Day {day.day}
      </nav>
      <PageHeader
        eyebrow={`${tech.name} · Day ${day.day}${review ? " · Review" : ""}`}
        title={day.title}
        description={day.objective}
        actions={
          <span className="inline-flex items-center gap-1 text-sm text-muted">
            <Clock className="h-4 w-4" aria-hidden /> {day.estimated ? "about " : ""}
            {day.minutes} min
          </span>
        }
      />

      {missing.length > 0 && (
        <p className="mb-5 rounded-lg border border-dashed border-border-strong bg-surface p-3 text-sm text-muted">
          {missing.length} lesson{missing.length > 1 ? "s" : ""} for this day {missing.length > 1 ? "are" : "is"} still being written. The plan, practice and
          assessment below use only the published lessons.
        </p>
      )}

      <section aria-labelledby="how-h" className="mb-8 rounded-lg border border-border bg-surface p-5">
        <h2 id="how-h" className="font-semibold">
          {review ? "How to use this review day" : "How to work through today"}
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {review ? (
            <>
              <li>Skim the key points of each lesson below, starting with any marked “to revise”.</li>
              <li>Redo practice exercises you got wrong, without looking at the solutions.</li>
              <li>Take the week assessment. It mixes questions from every lesson this week.</li>
              <li>Use the summary to decide what to revisit before moving on.</li>
            </>
          ) : (
            <>
              <li>Read the learning objectives so you know what to look for.</li>
              <li>Work through each lesson in order: read the notes, run the examples, and do the practice exercises.</li>
              <li>Complete the practical coding tasks below.</li>
              <li>Take the end-of-day assessment and review the explanations for anything you missed.</li>
              <li>Mark each lesson complete and check your day summary.</li>
            </>
          )}
        </ol>
      </section>

      <section aria-labelledby="objectives-h" className="mb-8">
        <h2 id="objectives-h" className="mb-2 text-xl font-semibold tracking-tight">
          {review ? "Lessons covered this week" : "Learning objectives"}
        </h2>
        {review ? (
          <DayLessonList
            lessons={day.lessonIds.map((id) => {
              const ref = getLessonRef(id);
              return { id, title: ref?.lesson.title ?? manifestTitles.get(id) ?? id, url: ref ? lessonUrl(id) : undefined, minutes: ref?.lesson.minutes };
            })}
          />
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-[15px]">
            {objectives.map((o) => (
              <li key={o}>{renderInline(o)}</li>
            ))}
          </ul>
        )}
      </section>

      {!review && (
        <section aria-labelledby="lessons-h" className="mb-8">
          <h2 id="lessons-h" className="mb-3 text-xl font-semibold tracking-tight">
            Today&apos;s lessons
          </h2>
          <ol className="space-y-2">
            {refs.map((r, i) => (
              <li key={r.lesson.id}>
                <Link href={lessonUrl(r.lesson.id)} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                  <span className="mt-0.5 w-6 shrink-0 text-sm font-semibold text-subtle tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{r.lesson.title}</span>
                      <span className="text-xs text-subtle">{r.lesson.minutes} min</span>
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{renderInline(r.lesson.summary)}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-subtle" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {tasks.length > 0 && (
        <section aria-labelledby="tasks-h" className="mb-8">
          <h2 id="tasks-h" className="mb-1 text-xl font-semibold tracking-tight">
            Practical coding tasks
          </h2>
          <p className="mb-4 text-sm text-muted">Hands-on tasks checked by automated tests. They&apos;re the same challenges as at the end of each lesson, so progress is shared.</p>
          <div className="space-y-4">
            {tasks.map((t) => (
              <ExerciseCard key={t.exercise.id} exercise={t.exercise} label={`Task: ${getLessonRef(t.lessonId)?.lesson.title}`} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="assessment-h" className="mb-8">
        <h2 id="assessment-h" className="mb-1 flex items-center gap-2 text-xl font-semibold tracking-tight">
          {review ? "Week assessment" : "End-of-day assessment"} <Badge>{questions.length} questions</Badge>
        </h2>
        <p className="mb-4 text-sm text-muted">
          Questions come only from today&apos;s lessons and mix question types: multiple choice, true or false, fill in the blank, matching, ordering and more. You get feedback with an
          explanation for every answer, and you can retake it any time.
        </p>
        <QuizRunner quizId={quizId} kind="day" title={`${tech.name} Day ${day.day} assessment`} questions={questions} />
      </section>

      {criteria.length > 0 && (
        <section aria-labelledby="criteria-h" className="mb-8 rounded-lg border border-border bg-surface p-5">
          <h2 id="criteria-h" className="font-semibold">
            By the end of today
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {criteria.map((c) => (
              <li key={c}>{renderInline(c)}</li>
            ))}
          </ul>
        </section>
      )}

      <DaySummary
        lessonIds={published}
        quizId={quizId}
        objectives={refs.map((r) => r.lesson.title)}
        nextDay={next ? { href: `/courses/${tech.id}/day/${next.day}`, title: `Day ${next.day}: ${next.title}` } : undefined}
      />
      {!next && nextAny && (
        <p className="mt-3 text-sm text-muted">
          The next day in this course (Day {nextAny.day}: {nextAny.title}) is still being written.
        </p>
      )}

      <nav aria-label="Day navigation" className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
        {prev ? (
          <Link href={`/courses/${tech.id}/day/${prev.day}`} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-hover">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Day {prev.day}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/courses/${tech.id}`} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-hover">
          Back to the {tech.name} roadmap
        </Link>
      </nav>
    </div>
  );
}

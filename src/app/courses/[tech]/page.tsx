import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, Info, NotebookText } from "lucide-react";
import { getCourse, getLessonRef, getTechnology, kbNotes, lessonUrl, techCategories, technologies } from "@/content";
import { curriculumManifest } from "@/content/curriculum/manifest";
import { PageHeader } from "@/components/ui/card";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { CourseProgressPanel, DayLessonList, DayStatusBadge } from "@/components/courses/course-client";
import { formatDuration } from "@/lib/courses";

export function generateStaticParams() {
  return technologies.map((t) => ({ tech: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ tech: string }> }): Promise<Metadata> {
  const t = getTechnology((await params).tech);
  return t ? { title: `Learn ${t.name}`, description: t.description } : { title: "Course not found" };
}

const manifestTitles = new Map<string, string>(curriculumManifest.flatMap((m) => m.lessons.map(([slug, title]) => [`${m.slug}-${slug}`, title] as const)));

export default async function CoursePage({ params }: { params: Promise<{ tech: string }> }) {
  const tech = getTechnology((await params).tech);
  if (!tech) notFound();
  const course = getCourse(tech);
  const category = techCategories.find((c) => c.id === tech.category);
  const notes = tech.kbCategory ? kbNotes.filter((n) => n.category === tech.kbCategory) : [];
  const prereqs = tech.prerequisites.map((id) => getTechnology(id)).filter((t) => !!t);

  return (
    <div className="max-w-5xl">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <Link href="/courses" className="hover:text-fg">
          Learn
        </Link>{" "}
        / {category?.title}
      </nav>
      <PageHeader eyebrow={category?.title} title={tech.name} description={tech.description} />

      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <DifficultyBadge level={tech.level} />
        {course.totalDays > 0 && (
          <span className="inline-flex items-center gap-1 text-muted">
            <CalendarDays className="h-4 w-4" aria-hidden /> {course.totalDays} days · {course.estimated ? "about " : ""}
            {formatDuration(course.totalMinutes)} of study
          </span>
        )}
        {course.totalDays > 0 && (
          <span className="text-muted">
            · {course.publishedLessons} lessons published{course.plannedLessons > 0 && `, ${course.plannedLessons} planned`}
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <CourseProgressPanel techId={tech.id} />

          {course.weeks.length > 0 ? (
            <section aria-labelledby="roadmap-h">
              <h2 id="roadmap-h" className="text-lg font-semibold">
                Day-by-day roadmap
              </h2>
              <p className="mb-4 text-sm text-muted">
                Each day takes roughly 30–60 minutes, including practice and a short assessment. Days are suggestions, not deadlines: go faster, slower or skip
                around. Lessons marked “coming soon” are shown so you can see what&apos;s ahead; they can&apos;t be opened yet.
              </p>
              <div className="space-y-6">
                {course.weeks.map((w) => (
                  <section key={w.week} aria-labelledby={`week-${w.week}`}>
                    <h3 id={`week-${w.week}`} className="mb-2 text-sm font-semibold tracking-wide text-subtle uppercase">
                      Week {w.week} · {w.title}
                    </h3>
                    <ol className="space-y-2">
                      {w.days.map((d) => {
                        const published = d.lessonIds.filter((id) => getLessonRef(id));
                        const openable = published.length > 0;
                        const href = `/courses/${tech.id}/day/${d.day}`;
                        return (
                          <li key={d.day} className="rounded-lg border border-border bg-surface p-4" data-testid={`roadmap-day-${d.day}`}>
                            <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                              <span className="text-xs font-semibold text-subtle uppercase tabular-nums">Day {d.day}</span>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium">
                                  {openable ? (
                                    <Link href={href} className="hover:text-primary hover:underline">
                                      {d.title}
                                    </Link>
                                  ) : (
                                    d.title
                                  )}
                                </h4>
                                <p className="mt-0.5 text-sm text-muted">{d.objective}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {d.kind === "review" && <Badge tone="primary">Review</Badge>}
                                <DayStatusBadge lessonIds={published} quizId={`day:${tech.id}:${d.day}`} />
                                <span className="text-xs text-subtle tabular-nums" title={d.estimated ? "Estimated: includes lessons not written yet" : undefined}>
                                  {d.estimated ? "~" : ""}
                                  {d.minutes} min
                                </span>
                              </div>
                            </div>
                            {d.kind === "learn" && (
                              <DayLessonList
                                lessons={d.lessonIds.map((id) => {
                                  const ref = getLessonRef(id);
                                  return { id, title: ref?.lesson.title ?? manifestTitles.get(id) ?? id, url: ref ? lessonUrl(id) : undefined, minutes: ref?.lesson.minutes };
                                })}
                              />
                            )}
                            {openable && (
                              <Link href={href} className={`${buttonClass("secondary", "sm")} mt-3`}>
                                {d.kind === "review" ? "Open review and assessment" : "Open day plan"}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ))}
              </div>
            </section>
          ) : (
            <section aria-labelledby="outline-h" className="rounded-lg border border-dashed border-border-strong bg-surface p-5">
              <h2 id="outline-h" className="font-semibold">
                Coming soon: planned curriculum
              </h2>
              <p className="mt-1 text-sm text-muted">
                Lessons for {tech.name} aren&apos;t published yet. We publish a technology once its lessons are fully written and checked, rather than shipping empty pages.
                The course will cover:
              </p>
              <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
                {tech.outline.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-border-strong" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4" aria-label="About this course">
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <h2 className="mb-1 flex items-center gap-1.5 font-semibold">
              <Info className="h-4 w-4 text-subtle" aria-hidden /> How you&apos;ll practise
            </h2>
            <p className="text-muted">{tech.practice.note}</p>
          </div>
          {prereqs.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-4 text-sm">
              <h2 className="mb-1 font-semibold">Helpful to know first</h2>
              <p className="mb-2 text-muted">Recommended, not required. You can start anywhere.</p>
              <ul className="space-y-1">
                {prereqs.map((p) => (
                  <li key={p.id}>
                    <Link href={`/courses/${p.id}`} className="text-primary hover:underline">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {notes.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-4 text-sm">
              <h2 className="mb-1 flex items-center gap-1.5 font-semibold">
                <NotebookText className="h-4 w-4 text-subtle" aria-hidden /> Reference notes ({notes.length})
              </h2>
              <ul className="space-y-1">
                {notes.slice(0, 8).map((n) => (
                  <li key={n.id}>
                    <Link href={`/e2e/${n.slug}`} className="text-primary hover:underline">
                      {n.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {notes.length > 8 && (
                <Link href="/e2e" className="mt-2 inline-block text-primary hover:underline">
                  All notes
                </Link>
              )}
            </div>
          )}
          {tech.id === "javascript" && (
            <div className="rounded-lg border border-border bg-surface p-4 text-sm">
              <h2 className="mb-1 font-semibold">Browse by module</h2>
              <p className="text-muted">
                Prefer the module view?{" "}
                <Link href="/learn" className="text-primary hover:underline">
                  Open the JavaScript curriculum
                </Link>
                . Every term defined across lessons is collected in{" "}
                <Link href="/concepts" className="text-primary hover:underline">
                  JavaScript Concepts
                </Link>
                .
              </p>
            </div>
          )}
          <div className="rounded-lg border border-border bg-surface p-4 text-sm">
            <h2 className="mb-1 font-semibold">Official documentation</h2>
            <ul className="space-y-1">
              {tech.docs.map((d) => (
                <li key={d.url}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    {d.title} <ExternalLink className="h-3 w-3" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

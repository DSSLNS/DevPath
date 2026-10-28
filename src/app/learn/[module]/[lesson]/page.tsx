import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, ExternalLink } from "lucide-react";
import { adjacentLessons, getLesson, getLessonRef, lessonUrl, modules, technologyForModule, type QuestionRef } from "@/content";
import { renderInline } from "@/lib/markdown";
import { withHtmlCheckDefaults } from "@/content/html-check";
import { Blocks } from "@/components/content/blocks";
import { CodeBlockStatic } from "@/components/content/code-block-static";
import { CodeRunner } from "@/components/editor/code-runner";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { LessonTracker } from "@/components/lesson/lesson-tracker";
import { ActiveTimeTracker } from "@/components/lesson/active-time-tracker";
import { BookmarkButton } from "@/components/lesson/bookmark-button";
import { CompletionStatus } from "@/components/lesson/completion-status";
import { CompletionPanel } from "@/components/lesson/completion-panel";
import { Badge, DifficultyBadge, TechBadges } from "@/components/ui/badge";

export function generateStaticParams() {
  return modules.flatMap((m) => m.lessons.map((l) => ({ module: m.slug, lesson: l.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string; lesson: string }> }): Promise<Metadata> {
  const { module, lesson } = await params;
  const ref = getLesson(module, lesson);
  return ref ? { title: ref.lesson.title, description: ref.lesson.summary } : { title: "Lesson not found" };
}

const GRADABLE = new Set(["mcq", "multi-select", "true-false", "predict-output", "fill-blank", "match", "order"]);

export default async function LessonPage({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const { module, lesson: lessonSlug } = await params;
  const ref = getLesson(module, lessonSlug);
  if (!ref) notFound();
  const { module: mod, index } = ref;
  // HTML/CSS items carry their lesson's validation mode (snippet, document or demo) into the editors.
  const lesson = withHtmlCheckDefaults(ref.lesson);
  const { prev, next } = adjacentLessons(lesson.id);

  const quizQuestions: QuestionRef[] = lesson.quiz.filter((q) => GRADABLE.has(q.type)).map((exercise) => ({ exercise, lessonId: lesson.id, moduleId: mod.id }));
  const ungradedQuiz = lesson.quiz.filter((q) => !GRADABLE.has(q.type));

  const tech = technologyForModule(mod.id);
  // HTML and CSS lessons show markup or stylesheets in their mistake examples; everything else is JavaScript.
  const webLesson = !lesson.tech.includes("javascript") && (lesson.tech.includes("html") || lesson.tech.includes("css"));
  const mistakeLanguage = (code: string) => (!webLesson ? "js" : code.trimStart().startsWith("<") ? "html" : "css");
  const toc = [
    { id: "introduction", title: "Introduction" },
    ...lesson.sections.map((s) => ({ id: s.id, title: s.title })),
    { id: "playground", title: "Try it yourself" },
    ...(lesson.bestPractices?.length ? [{ id: "best-practices", title: "Best practices" }] : []),
    { id: "common-mistakes", title: "Common mistakes" },
    { id: "debugging", title: "Debugging tips" },
    { id: "summary", title: lesson.cheatSheet?.length ? "Quick revision and cheat sheet" : "Quick revision" },
    { id: "practice", title: "Practice" },
    { id: "quiz", title: "End-of-lesson assessment" },
    { id: "further-reading", title: "Related and further reading" },
    { id: "complete", title: "Complete lesson" },
  ];

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-10">
      <LessonTracker lessonId={lesson.id} sectionIds={toc.map((t) => t.id)} />
      <ActiveTimeTracker lessonId={lesson.id} />
      <article className="min-w-0 max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
          <Link href="/courses" className="hover:text-fg">
            Learn
          </Link>{" "}
          /{" "}
          {tech && (
            <>
              <Link href={`/courses/${tech.id}`} className="hover:text-fg">
                {tech.name}
              </Link>{" "}
              /{" "}
            </>
          )}
          <Link href={`/learn/${mod.slug}`} className="hover:text-fg">
            {mod.title}
          </Link>
        </nav>
        <header className="mb-6 border-b border-border pb-5">
          <div className="mb-1 text-xs font-medium text-subtle">
            Lesson {index + 1} of {mod.lessons.length} published in this module
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
          <p className="mt-2 text-[15px] text-muted">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DifficultyBadge level={lesson.difficulty} />
            {lesson.optional && <Badge tone="warning">Optional / advanced</Badge>}
            <TechBadges tech={lesson.tech} />
            <span className="inline-flex items-center gap-1 text-xs text-subtle">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {lesson.minutes} min
            </span>
            <CompletionStatus lessonId={lesson.id} />
            <span className="ml-auto">
              <BookmarkButton type="lesson" id={lesson.id} />
            </span>
          </div>
          <LessonNav prev={prev?.id} next={next?.id} className="mt-4" />
        </header>

        <section id="introduction" aria-labelledby="introduction-h" className="scroll-mt-20">
          <h2 id="introduction-h" className="sr-only">
            Introduction
          </h2>
          <Blocks blocks={lesson.intro} />
          <div className="my-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-subtle uppercase">Learning objectives</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {lesson.objectives.map((o) => (
                  <li key={o}>{renderInline(o)}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-subtle uppercase">Prerequisites</h3>
              {lesson.prerequisites.length ? (
                <ul className="space-y-1 text-sm">
                  {lesson.prerequisites.map((p) => {
                    const r = getLessonRef(p);
                    return (
                      <li key={p}>
                        {r ? (
                          <Link className="text-primary hover:underline" href={lessonUrl(p)}>
                            {r.lesson.title}
                          </Link>
                        ) : (
                          <span className="text-muted">{p.replace(/-/g, " ")} (planned lesson)</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted">None. This is a good place to start.</p>
              )}
            </div>
          </div>
          {lesson.terms.length > 0 && (
            <div className="my-5">
              <h3 className="mb-2 text-sm font-semibold">Key terms</h3>
              <dl className="grid gap-2 sm:grid-cols-2">
                {lesson.terms.map((t) => (
                  <div key={t.term} className="rounded-lg border border-border bg-surface-2 px-3 py-2">
                    <dt className="text-sm font-semibold">{t.term}</dt>
                    <dd className="text-sm text-muted">{renderInline(t.definition)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        {lesson.sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 scroll-mt-20">
            <h2 id={`${s.id}-h`} className="mb-2 text-xl font-semibold tracking-tight">
              {s.title}
            </h2>
            <Blocks blocks={s.blocks} />
          </section>
        ))}

        <section id="playground" aria-labelledby="playground-h" className="mt-10 scroll-mt-20">
          <h2 id="playground-h" className="mb-2 text-xl font-semibold tracking-tight">
            Try it yourself
          </h2>
          <p className="mb-3 text-sm text-muted">
            Edit and run the examples. Code runs in an isolated sandbox with no network or storage access. Use “Try it” on any code block above to load it here.
          </p>
          <CodeRunner examples={lesson.examples} acceptTryIt title="Lesson playground" />
        </section>

        {lesson.bestPractices && lesson.bestPractices.length > 0 && (
          <section id="best-practices" aria-labelledby="best-practices-h" className="mt-10 scroll-mt-20">
            <h2 id="best-practices-h" className="mb-2 text-xl font-semibold tracking-tight">
              Best practices
            </h2>
            <ul className="list-disc space-y-1.5 pl-6 text-[15px]">
              {lesson.bestPractices.map((b) => (
                <li key={b}>{renderInline(b)}</li>
              ))}
            </ul>
          </section>
        )}

        <section id="common-mistakes" aria-labelledby="mistakes-h" className="mt-10 scroll-mt-20">
          <h2 id="mistakes-h" className="mb-3 text-xl font-semibold tracking-tight">
            Common mistakes
          </h2>
          <div className="space-y-4">
            {lesson.commonMistakes.map((m) => (
              <div key={m.title} className="rounded-lg border border-border bg-surface p-4">
                <h3 className="font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-fg/90">{renderInline(m.explanation)}</p>
                {(m.wrong || m.right) && (
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {m.wrong && <CodeBlockStatic code={m.wrong} language={mistakeLanguage(m.wrong)} title="✗ Avoid" compact />}
                    {m.right && <CodeBlockStatic code={m.right} language={mistakeLanguage(m.right)} title="✓ Prefer" compact />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="debugging" aria-labelledby="debugging-h" className="mt-10 scroll-mt-20">
          <h2 id="debugging-h" className="mb-2 text-xl font-semibold tracking-tight">
            Debugging tips
          </h2>
          <ul className="list-disc space-y-1.5 pl-6 text-[15px]">
            {lesson.debugging.map((d) => (
              <li key={d}>{renderInline(d)}</li>
            ))}
          </ul>
        </section>

        <section id="summary" aria-labelledby="summary-h" className="mt-10 scroll-mt-20">
          <h2 id="summary-h" className="mb-2 text-xl font-semibold tracking-tight">
            Quick revision
          </h2>
          <ul className="list-disc space-y-1.5 pl-6 text-[15px]">
            {lesson.keyPoints.map((k) => (
              <li key={k}>{renderInline(k)}</li>
            ))}
          </ul>
          {lesson.cheatSheet && lesson.cheatSheet.length > 0 && (
            <div className="mt-5 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <caption className="border-b border-border bg-surface-2 px-3 py-2 text-left text-xs font-semibold tracking-wide text-subtle uppercase">Cheat sheet</caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Syntax or concept</th>
                    <th scope="col">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.cheatSheet.map((row) => (
                    <tr key={row.item} className="border-b border-border last:border-0">
                      <th scope="row" className="w-2/5 bg-surface px-3 py-2 text-left align-top font-normal">
                        {renderInline(row.item)}
                      </th>
                      <td className="px-3 py-2 align-top text-fg/90">{renderInline(row.meaning)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="practice" aria-labelledby="practice-h" className="mt-10 scroll-mt-20">
          <h2 id="practice-h" className="mb-1 text-xl font-semibold tracking-tight">
            Practice
          </h2>
          <p className="mb-4 text-sm text-muted">Answers are only checked when you submit. Hints and solutions are available if you get stuck.</p>
          <div className="space-y-4">
            {lesson.exercises.map((e, i) => (
              <ExerciseCard key={e.id} exercise={e} index={i} />
            ))}
            <ExerciseCard exercise={lesson.challenge} label="Practical challenge" />
          </div>
        </section>

        <section id="quiz" aria-labelledby="quiz-h" className="mt-10 scroll-mt-20">
          <h2 id="quiz-h" className="mb-1 text-xl font-semibold tracking-tight">
            End-of-lesson assessment
          </h2>
          <p className="mb-4 text-sm text-muted">Check your understanding. Every answer comes with an explanation. Your score is saved and feeds into mastery and revision, and you can retake it any time.</p>
          <QuizRunner quizId={`lesson:${lesson.id}`} kind="lesson" title={`Quiz: ${lesson.title}`} questions={quizQuestions} />
          {ungradedQuiz.length > 0 && (
            <div className="mt-4 space-y-4">
              {ungradedQuiz.map((e, i) => (
                <ExerciseCard key={e.id} exercise={e} label={`Bonus question ${i + 1}`} />
              ))}
            </div>
          )}
        </section>

        <section id="further-reading" aria-labelledby="further-reading-h" className="mt-10 scroll-mt-20">
          <h2 id="further-reading-h" className="mb-3 text-xl font-semibold tracking-tight">
            Related and further reading
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {lesson.related.length > 0 && (
              <div>
                <h3 className="mb-1.5 text-sm font-semibold">Related lessons</h3>
                <ul className="space-y-1 text-sm">
                  {lesson.related.map((id) => {
                    const r = getLessonRef(id);
                    return (
                      <li key={id}>
                        {r ? (
                          <Link href={lessonUrl(id)} className="text-primary hover:underline">
                            {r.lesson.title}
                          </Link>
                        ) : (
                          <span className="text-muted">{id.replace(/-/g, " ")} (planned)</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div>
              <h3 className="mb-1.5 text-sm font-semibold">Official documentation</h3>
              <ul className="space-y-1 text-sm">
                {lesson.references.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      {r.title} <ExternalLink className="h-3 w-3" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <CompletionPanel lessonId={lesson.id} objectives={lesson.objectives} criteria={lesson.completionCriteria} nextLessonId={next?.id} />
        </div>
        <LessonNav prev={prev?.id} next={next?.id} className="mt-6" />
      </article>

      <aside className="hidden xl:block" aria-label="On this page">
        <div className="sticky top-20">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-subtle uppercase">On this page</h2>
          <ul className="space-y-1 border-l border-border text-[13px]">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-3 text-muted hover:border-border-strong hover:text-fg">
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function LessonNav({ prev, next, className }: { prev?: string; next?: string; className?: string }) {
  const p = prev ? getLessonRef(prev) : undefined;
  const n = next ? getLessonRef(next) : undefined;
  return (
    <nav aria-label="Lesson navigation" className={`flex flex-col gap-2 sm:flex-row sm:justify-between ${className ?? ""}`}>
      {p ? (
        <Link href={lessonUrl(p.lesson.id)} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-hover" rel="prev">
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[11px] text-subtle">Previous</span>
            <span className="block truncate">{p.lesson.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {n && (
        <Link href={lessonUrl(n.lesson.id)} className="flex items-center justify-end gap-2 rounded-md border border-border px-3 py-2 text-right text-sm hover:bg-surface-hover" rel="next">
          <span className="min-w-0">
            <span className="block text-[11px] text-subtle">Next</span>
            <span className="block truncate">{n.lesson.title}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      )}
    </nav>
  );
}

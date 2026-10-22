"use client";

import Link from "next/link";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { bestLessonQuiz, practiceStats } from "@/lib/progress";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { Button, buttonClass } from "@/components/ui/button";
import { renderInline } from "@/lib/markdown";

/**
 * Completion rule: the learner explicitly marks the lesson complete. The panel
 * shows what they covered so the decision is informed, but nothing is auto-completed.
 */
export function CompletionPanel({
  lessonId,
  objectives,
  criteria,
  nextLessonId,
}: {
  lessonId: string;
  objectives: string[];
  criteria?: string[];
  nextLessonId?: string;
}) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const lesson = catalog.lessonById.get(lessonId);
  if (!lesson) return null;
  const done = !!state.lessons[lessonId]?.completedAt;
  const quiz = bestLessonQuiz(state, lessonId);
  const practice = practiceStats(state, lesson);
  const next = nextLessonId ? catalog.lessonById.get(nextLessonId) : undefined;
  return (
    <section id="complete" aria-labelledby="complete-title" className="rounded-lg border border-border bg-surface p-5" data-testid="completion-panel">
      <h2 id="complete-title" className="text-lg font-semibold">
        {done ? "Lesson completed" : "Finish this lesson"}
      </h2>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-md bg-surface-2 p-3">
          <dt className="text-xs text-subtle">Assessment</dt>
          <dd className="font-semibold">
            {quiz === null ? "Not taken yet" : `Best score ${quiz}% · ${quiz >= state.settings.masteryThreshold ? "passed" : `pass mark ${state.settings.masteryThreshold}%`}`}
          </dd>
        </div>
        <div className="rounded-md bg-surface-2 p-3">
          <dt className="text-xs text-subtle">Exercises attempted</dt>
          <dd className="font-semibold">
            {practice.attempted}/{practice.total} attempted · {practice.solved} solved
          </dd>
        </div>
        <div className="rounded-md bg-surface-2 p-3">
          <dt className="text-xs text-subtle">Recommended next</dt>
          <dd className="font-semibold">{next ? next.title : "End of the current curriculum"}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <h3 className="text-xs font-semibold tracking-wide text-subtle uppercase">Concepts covered</h3>
        <ul className="mt-1.5 space-y-1 text-sm">
          {objectives.map((o) => (
            <li key={o} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden />
              <span>{renderInline(o)}</span>
            </li>
          ))}
        </ul>
      </div>
      {criteria && criteria.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold tracking-wide text-subtle uppercase">Completion criteria: you should now be able to</h3>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
            {criteria.map((c) => (
              <li key={c}>{renderInline(c)}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">
        Marking the lesson complete records that you have worked through it. Passing the assessment is tracked separately and is what counts towards mastery.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {done ? (
          <Button onClick={() => learnerStore.setLessonComplete(lessonId, false)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Mark as not complete
          </Button>
        ) : (
          <Button variant="primary" onClick={() => learnerStore.setLessonComplete(lessonId, true)} data-testid="mark-complete">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Mark lesson complete
          </Button>
        )}
        {next && (
          <Link href={catalog.lessonUrl(next.id)} className={buttonClass(done ? "primary" : "secondary")}>
            Next lesson: {next.title}
          </Link>
        )}
        {quiz === null && (
          <a href="#quiz" className={buttonClass("ghost")}>
            Take the quiz first
          </a>
        )}
      </div>
    </section>
  );
}

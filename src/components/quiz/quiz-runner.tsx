"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import type { QuestionRef } from "@/content";
import { gradeAnswer, isEmptyAnswer, type Answer, type GradeResult } from "@/lib/exercises/grade";
import { renderInline } from "@/lib/markdown";
import { learnerStore } from "@/lib/store/hooks";
import type { QuizAttempt, QuizKind } from "@/lib/store/schema";
import { uid } from "@/lib/store/store";
import { useCatalog } from "@/lib/catalog/context";
import { AnswerInput, emptyAnswer, type GradableExercise } from "@/components/exercises/answer-input";
import { TYPE_LABEL } from "@/components/exercises/exercise-card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { DifficultyBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/components/ui/cn";
import Link from "next/link";

export interface QuizRunnerProps {
  quizId: string;
  kind: QuizKind;
  title: string;
  questions: QuestionRef[];
  minutes?: number;
  /** Called when the learner wants to retry only the incorrect questions. */
  onRetryIncorrect?: (questionIds: string[]) => void;
  compact?: boolean;
}

interface Finished {
  attempt: QuizAttempt;
  grades: Record<string, GradeResult>;
}

export function QuizRunner({ quizId, kind, title, questions, minutes = 0, onRetryIncorrect, compact }: QuizRunnerProps) {
  const catalog = useCatalog();
  const [runKey, setRunKey] = useState(0);
  const [subset, setSubset] = useState<string[] | null>(null);
  const active = useMemo(() => (subset ? questions.filter((q) => subset.includes(q.exercise.id)) : questions), [questions, subset]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [finished, setFinished] = useState<Finished | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  // Set on mount/reset (not during render) so prerendering stays deterministic.
  const startedAt = useRef<Date | null>(null);
  const attemptId = useRef("");
  const [remaining, setRemaining] = useState(minutes * 60);

  const reset = useCallback((ids: string[] | null) => {
    setSubset(ids);
    setIndex(0);
    setAnswers({});
    setFinished(null);
    setRemaining(minutes * 60);
    setRunKey((k) => k + 1);
  }, [minutes]);

  useEffect(() => {
    startedAt.current = new Date();
    attemptId.current = uid("quiz");
  }, [runKey]);

  const answerFor = (q: QuestionRef) => answers[q.exercise.id] ?? emptyAnswer(q.exercise);
  const answeredCount = active.filter((q) => answers[q.exercise.id] && !isEmptyAnswer(answers[q.exercise.id])).length;

  const finish = useCallback(
    (status: "completed" | "timed-out") => {
      if (finished) return; // guard against duplicate submission
      const grades: Record<string, GradeResult> = {};
      const recs: QuizAttempt["answers"] = {};
      let score = 0;
      for (const q of active) {
        const a = answers[q.exercise.id] ?? emptyAnswer(q.exercise);
        const g = isEmptyAnswer(a) ? { correct: false, score: 0, feedback: "Not answered." } : gradeAnswer(q.exercise, a);
        grades[q.exercise.id] = g;
        recs[q.exercise.id] = { answer: a, correct: g.correct };
        if (g.correct) score++;
      }
      const now = new Date();
      const started = startedAt.current ?? now;
      const attempt: QuizAttempt = {
        id: attemptId.current || uid("quiz"),
        quizId: subset ? `${quizId}:retry` : quizId,
        kind,
        title: subset ? `${title} (retry incorrect)` : title,
        questionIds: active.map((q) => q.exercise.id),
        answers: recs,
        score,
        total: active.length,
        percent: active.length ? Math.round((score / active.length) * 100) : 0,
        startedAt: started.toISOString(),
        completedAt: now.toISOString(),
        durationSec: Math.round((now.getTime() - started.getTime()) / 1000),
        status,
        lessonIds: [...new Set(active.map((q) => q.lessonId))],
      };
      learnerStore.recordQuizAttempt(attempt);
      setFinished({ attempt, grades });
    },
    [active, answers, finished, kind, quizId, subset, title],
  );

  // Countdown timer
  useEffect(() => {
    if (!minutes || finished) return;
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [minutes, finished, runKey]);
  useEffect(() => {
    if (minutes && remaining <= 0 && !finished) finish("timed-out");
  }, [remaining, minutes, finished, finish]);

  if (!active.length) {
    return <p className="text-sm text-muted">There are no questions in this quiz yet.</p>;
  }

  if (finished) {
    const { attempt, grades } = finished;
    const incorrect = active.filter((q) => !grades[q.exercise.id]?.correct).map((q) => q.exercise.id);
    return (
      <div className="space-y-4" data-testid="quiz-results">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <div className="text-xs font-semibold tracking-wide text-subtle uppercase">{attempt.status === "timed-out" ? "Time's up" : "Quiz complete"}</div>
              <div className="text-3xl font-semibold tabular-nums" data-testid="quiz-score">
                {attempt.score}/{attempt.total} <span className="text-lg text-muted">({attempt.percent}%)</span>
              </div>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              {incorrect.length > 0 && (
                <Button variant="primary" onClick={() => (onRetryIncorrect ? onRetryIncorrect(incorrect) : reset(incorrect))}>
                  <RotateCcw className="h-4 w-4" aria-hidden /> Retry {incorrect.length} incorrect
                </Button>
              )}
              <Button onClick={() => reset(null)}>Retake quiz</Button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">
            {attempt.percent >= 80
              ? "Strong result. Review any misses below, then move on."
              : attempt.percent >= 50
                ? "Good progress. Review the explanations for the questions you missed, then retry them."
                : "Review the lesson sections linked below, then retry the incorrect questions."}
          </p>
        </div>
        <h3 className="text-sm font-semibold">Review answers</h3>
        <ol className="space-y-3">
          {active.map((q, i) => {
            const g = grades[q.exercise.id];
            const lesson = catalog.lessonById.get(q.lessonId);
            return (
              <li key={q.exercise.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="mb-2 flex items-start gap-2">
                  {g.correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Correct" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label="Incorrect" />}
                  <div className="min-w-0 flex-1 text-sm font-medium">
                    {i + 1}. {renderInline(q.exercise.prompt)}
                  </div>
                </div>
                <AnswerInput exercise={q.exercise as GradableExercise} value={answerFor(q)} onChange={() => {}} disabled review={g} />
                <div className="mt-3 rounded-md bg-surface-2 px-3 py-2 text-sm">
                  <span className="font-medium">Explanation: </span>
                  {renderInline(q.exercise.explanation)}
                </div>
                {lesson && (
                  <Link href={catalog.lessonUrl(lesson.id)} className="mt-2 inline-block text-xs text-primary hover:underline">
                    Revisit lesson: {lesson.title}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const q = active[index];
  const mm = Math.max(0, Math.floor(remaining / 60));
  const ss = Math.max(0, remaining % 60);
  return (
    <div className={cn("rounded-lg border border-border bg-surface", compact && "border-0 bg-transparent")} data-testid="quiz-runner">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <span className="text-sm font-medium">
          Question {index + 1} of {active.length}
        </span>
        <span className="text-xs text-subtle">{TYPE_LABEL[q.exercise.type]}</span>
        <DifficultyBadge level={q.exercise.difficulty} />
        {minutes > 0 && (
          <span className={cn("ml-auto flex items-center gap-1 text-sm tabular-nums", remaining < 60 ? "text-danger" : "text-muted")} role="timer" aria-live={remaining < 60 ? "polite" : "off"}>
            <Clock className="h-4 w-4" aria-hidden /> {mm}:{String(ss).padStart(2, "0")}
          </span>
        )}
        <ProgressBar value={(answeredCount / active.length) * 100} label="Questions answered" className="basis-full" />
      </div>
      <div className="space-y-3 px-4 py-4" key={`${runKey}-${q.exercise.id}`}>
        <div className="text-[15px] leading-relaxed font-medium">{renderInline(q.exercise.prompt)}</div>
        <AnswerInput
          exercise={q.exercise as GradableExercise}
          value={answerFor(q)}
          onChange={(a) => setAnswers((prev) => ({ ...prev, [q.exercise.id]: a }))}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        <Button size="sm" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Previous
        </Button>
        {index < active.length - 1 ? (
          <Button size="sm" variant="primary" onClick={() => setIndex((i) => i + 1)}>
            Next <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={() => (answeredCount < active.length ? setConfirmSubmit(true) : finish("completed"))} data-testid="submit-quiz">
            Submit quiz
          </Button>
        )}
        <nav aria-label="Jump to question" className="ml-auto flex flex-wrap gap-1">
          {active.map((x, i) => {
            const done = answers[x.exercise.id] && !isEmptyAnswer(answers[x.exercise.id]);
            return (
              <button
                key={x.exercise.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${done ? ", answered" : ""}`}
                aria-current={i === index ? "step" : undefined}
                className={cn(
                  "h-7 w-7 rounded text-xs tabular-nums",
                  i === index ? "bg-primary text-primary-fg" : done ? "bg-primary-soft text-primary-soft-fg" : "border border-border text-muted hover:bg-surface-hover",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>
      </div>
      <ConfirmDialog
        open={confirmSubmit}
        onCancel={() => setConfirmSubmit(false)}
        onConfirm={() => {
          setConfirmSubmit(false);
          finish("completed");
        }}
        title="Submit with unanswered questions?"
        description={`You have answered ${answeredCount} of ${active.length} questions. Unanswered questions count as incorrect.`}
        confirmLabel="Submit anyway"
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Eye, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import type { Exercise } from "@/content/types";
import { gradeAnswer, gradeCodeResult, isEmptyAnswer, type Answer, type GradeResult } from "@/lib/exercises/grade";
import { renderInline } from "@/lib/markdown";
import type { RunResult } from "@/lib/sandbox/types";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { cn } from "@/components/ui/cn";
import { CodeBlockStatic } from "@/components/content/code-block-static";
import { CodeRunner } from "@/components/editor/code-runner";
import { AnswerInput, emptyAnswer, restoreAnswer, type GradableExercise } from "./answer-input";

export const TYPE_LABEL: Record<Exercise["type"], string> = {
  mcq: "Multiple choice",
  "multi-select": "Multiple select",
  "true-false": "True / false",
  "predict-output": "Predict the output",
  "find-bug": "Find the bug",
  "fill-blank": "Fill in the blank",
  code: "Write the code",
  match: "Match the concept",
  order: "Arrange the steps",
  "short-answer": "Short answer",
};

export function ExerciseCard(props: { exercise: Exercise; index?: number; label?: string }) {
  const meta = useStoreMeta();
  // Remount once storage is loaded so the learner's saved answer becomes the initial state.
  return <ExerciseCardInner key={meta.hydrated ? "client" : "server"} {...props} restore={meta.hydrated} />;
}

function ExerciseCardInner({ exercise: ex, index, label, restore }: { exercise: Exercise; index?: number; label?: string; restore: boolean }) {
  const state = useLearnerState();
  const progress = state.exercises[ex.id];
  const [answer, setAnswer] = useState<Answer>(() =>
    restore && progress?.lastAnswer !== undefined ? restoreAnswer(ex, progress.lastAnswer) : emptyAnswer(ex),
  );
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [gradedAnswer, setGradedAnswer] = useState<string | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [confirmReveal, setConfirmReveal] = useState(false);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(draftTimer.current), []);

  const isCode = ex.type === "code" || ex.type === "find-bug";
  const revealed = !!progress?.revealed;
  const serialized = JSON.stringify(answer);
  const unchangedSinceGrade = gradedAnswer === serialized;

  const submit = () => {
    if (isEmptyAnswer(answer) || unchangedSinceGrade) return;
    const g = gradeAnswer(ex, answer);
    setGrade(g);
    setGradedAnswer(serialized);
    learnerStore.recordExercise(ex.id, g.correct, answer);
  };

  const onCodeResult = (r: RunResult, code: string) => {
    setLastRun(r);
    const tests = ex.type === "code" || ex.type === "find-bug" ? ex.tests.length : 0;
    const g = gradeCodeResult(r, tests);
    setGrade(g);
    setGradedAnswer(JSON.stringify({ type: ex.type, value: code }));
    learnerStore.recordExercise(ex.id, g.correct, { type: ex.type, value: code });
  };

  const retry = () => {
    setGrade(null);
    setGradedAnswer(null);
    if (!isCode && (ex.type === "order" || ex.type === "match" || ex.type === "fill-blank" || ex.type === "multi-select")) {
      // keep answer so learners can adjust it
    }
  };

  const solution =
    ex.type === "code" || ex.type === "find-bug"
      ? ex.solution
      : ex.type === "predict-output"
        ? ex.answer
        : ex.type === "fill-blank"
          ? ex.blanks.map((b, i) => `Blank ${i + 1}: ${b.answers[0]}`).join("\n")
          : ex.type === "order"
            ? ex.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
            : ex.type === "match"
              ? ex.pairs.map((p) => `${p.left} → ${p.right}`).join("\n")
              : ex.type === "short-answer"
                ? ex.sampleAnswer
                : null;

  return (
    <article className="rounded-lg border border-border bg-surface" aria-labelledby={`${ex.id}-title`} data-testid={`exercise-${ex.id}`}>
      <header className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <h4 id={`${ex.id}-title`} className="mr-auto text-sm font-semibold">
          {label ?? (index !== undefined ? `Exercise ${index + 1}` : "Exercise")}
          <span className="font-normal text-subtle"> · {TYPE_LABEL[ex.type]}</span>
        </h4>
        {(ex.type === "find-bug" || ex.debugging) && <Badge tone="warning">Debugging</Badge>}
        <DifficultyBadge level={ex.difficulty} />
        {progress && progress.attempts > 0 && (
          <span className="text-xs text-subtle" aria-label={`${progress.attempts} attempts, ${progress.correctCount} correct`}>
            {progress.attempts} attempt{progress.attempts > 1 ? "s" : ""}
            {progress.correctCount > 0 && <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-success" aria-hidden />}
          </span>
        )}
      </header>
      <div className="space-y-3 px-4 py-3">
        <div className="text-[15px] leading-relaxed">{renderInline(ex.prompt)}</div>
        {ex.instructions && <p className="text-sm text-muted">{renderInline(ex.instructions)}</p>}

        {isCode ? (
          <CodeRunner
            title={ex.type === "find-bug" ? "Fix the code" : "Your solution"}
            initialCode={(answer.value as string) ?? ""}
            resetCode={ex.type === "code" ? ex.starter : ex.code}
            tests={ex.tests}
            runLabel="Run tests"
            onResult={onCodeResult}
            editorMinHeight={140}
            onCodeChange={(code) => {
              clearTimeout(draftTimer.current);
              draftTimer.current = setTimeout(() => learnerStore.saveExerciseDraft(ex.id, { type: ex.type, value: code }), 600);
            }}
          />
        ) : (
          <AnswerInput exercise={ex as GradableExercise} value={answer} onChange={setAnswer} disabled={!!grade} review={grade} />
        )}

        {isCode && lastRun && lastRun.tests.length > 0 && (
          <ul className="space-y-1" aria-label="Test results">
            {lastRun.tests.map((t) => (
              <li key={t.name} className={cn("flex gap-2 rounded-md px-2.5 py-1.5 text-sm", t.passed ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                {t.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                <span>
                  <span className="sr-only">{t.passed ? "Passed: " : "Failed: "}</span>
                  {t.name}
                  {!t.passed && t.message && <span className="block font-mono text-xs opacity-90">{t.message}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        {grade && (
          <div
            role="status"
            className={cn("rounded-md border px-3 py-2.5 text-sm", grade.correct ? "border-success/40 bg-success-soft" : "border-danger/40 bg-danger-soft")}
          >
            <div className={cn("flex items-center gap-2 font-semibold", grade.correct ? "text-success" : "text-danger")}>
              {grade.correct ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
              {grade.correct ? "Correct" : ex.type === "short-answer" ? "Some key ideas are missing" : "Not quite"}
            </div>
            {grade.feedback && <p className="mt-1 text-fg/90">{grade.feedback}</p>}
            {(grade.correct || revealed || ex.type === "short-answer") && <p className="mt-1.5 text-fg/90">{renderInline(ex.explanation)}</p>}
          </div>
        )}

        {hintsShown > 0 && (
          <ul className="space-y-1.5">
            {ex.hints.slice(0, hintsShown).map((h, i) => (
              <li key={i} className="flex gap-2 rounded-md border border-info/30 bg-info-soft px-3 py-2 text-sm">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden />
                <span>
                  <span className="font-medium">Hint {i + 1}:</span> {renderInline(h)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {revealed && solution && (
          <div>
            <div className="mb-1 text-xs font-semibold text-muted">Solution</div>
            {isCode ? <CodeBlockStatic code={solution} compact /> : <pre className="rounded-md border border-border bg-surface-2 p-3 text-sm whitespace-pre-wrap">{solution}</pre>}
            {!grade?.correct && <p className="mt-2 text-sm text-fg/90">{renderInline(ex.explanation)}</p>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!isCode && !grade && (
            <Button variant="primary" size="sm" onClick={submit} disabled={isEmptyAnswer(answer)}>
              Check answer
            </Button>
          )}
          {!isCode && grade && !grade.correct && (
            <Button size="sm" onClick={retry}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Try again
            </Button>
          )}
          {!isCode && grade?.correct && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setGrade(null);
                setGradedAnswer(null);
                setAnswer(emptyAnswer(ex));
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Practise again
            </Button>
          )}
          {hintsShown < ex.hints.length && !grade?.correct && (
            <Button size="sm" variant="ghost" onClick={() => setHintsShown((n) => n + 1)}>
              <Lightbulb className="h-3.5 w-3.5" aria-hidden /> {hintsShown ? "Next hint" : "Show hint"} ({hintsShown}/{ex.hints.length})
            </Button>
          )}
          {solution && !revealed && (
            <Button size="sm" variant="ghost" onClick={() => setConfirmReveal(true)}>
              <Eye className="h-3.5 w-3.5" aria-hidden /> Show solution
            </Button>
          )}
          {!isEmptyAnswer(answer) && !grade && !isCode && <span className="text-xs text-subtle">Answers are checked only when you submit.</span>}
        </div>
      </div>
      <ConfirmDialog
        open={confirmReveal}
        onCancel={() => setConfirmReveal(false)}
        onConfirm={() => {
          learnerStore.revealSolution(ex.id);
          setConfirmReveal(false);
        }}
        title="Reveal the solution?"
        description="Trying first helps you learn. Revealing is recorded in your progress so revision mode can bring this exercise back later."
        confirmLabel="Show solution"
      />
    </article>
  );
}

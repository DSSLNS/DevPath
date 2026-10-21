"use client";

import { useId, useMemo } from "react";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import type { Exercise } from "@/content/types";
import type { Answer, GradeResult } from "@/lib/exercises/grade";
import { seededShuffle } from "@/lib/exercises/grade";
import { renderInline } from "@/lib/markdown";
import { HighlightedCode } from "@/components/content/code-block-static";
import { cn } from "@/components/ui/cn";

export type GradableExercise = Exclude<Exercise, { type: "code" } | { type: "find-bug" }>;

export function emptyAnswer(ex: Exercise): Answer {
  switch (ex.type) {
    case "mcq":
      return { type: "mcq", value: "" };
    case "multi-select":
      return { type: "multi-select", value: [] };
    case "true-false":
      return { type: "true-false", value: undefined as unknown as boolean };
    case "predict-output":
      return { type: "predict-output", value: "" };
    case "fill-blank":
      return { type: "fill-blank", value: ex.blanks.map(() => "") };
    case "match":
      return { type: "match", value: {} };
    case "order":
      return { type: "order", value: seededShuffle(ex.steps, ex.id) };
    case "short-answer":
      return { type: "short-answer", value: "" };
    case "code":
      return { type: "code", value: ex.starter };
    case "find-bug":
      return { type: "find-bug", value: ex.code };
  }
}

/** Restores a stored answer if it has the right shape, otherwise returns the empty answer. */
export function restoreAnswer(ex: Exercise, stored: unknown): Answer {
  const empty = emptyAnswer(ex);
  if (!stored || typeof stored !== "object" || (stored as Answer).type !== ex.type) return empty;
  return stored as Answer;
}

function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-md border border-code-border bg-code p-3 text-[13px] leading-relaxed text-code-fg" tabIndex={0}>
      <code>
        <HighlightedCode code={code} />
      </code>
    </pre>
  );
}

export function AnswerInput({
  exercise: ex,
  value,
  onChange,
  disabled,
  review,
}: {
  exercise: GradableExercise;
  value: Answer;
  onChange: (a: Answer) => void;
  disabled?: boolean;
  /** When set, show per-option/per-part correctness. */
  review?: GradeResult | null;
}) {
  const name = useId();
  const showCorrect = !!review;

  switch (ex.type) {
    case "mcq":
    case "true-false": {
      const options =
        ex.type === "mcq"
          ? ex.options
          : [
              { id: "true", text: "True", explanation: undefined },
              { id: "false", text: "False", explanation: undefined },
            ];
      const selected = ex.type === "mcq" ? (value.value as string) : value.value === undefined ? "" : String(value.value);
      const correctId = ex.type === "mcq" ? ex.answer : String(ex.answer);
      return (
        <div>
          {ex.code && <CodeSnippet code={ex.code} />}
          <fieldset disabled={disabled}>
            <legend className="sr-only">Choose one answer</legend>
            <div className="space-y-2">
              {options.map((o) => {
                const isSel = selected === o.id;
                const isRight = showCorrect && o.id === correctId;
                const isWrong = showCorrect && isSel && o.id !== correctId;
                return (
                  <label
                    key={o.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                      isRight ? "border-success bg-success-soft" : isWrong ? "border-danger bg-danger-soft" : isSel ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-hover",
                      disabled && "cursor-default",
                    )}
                  >
                    <input
                      type="radio"
                      name={name}
                      className="mt-1 accent-[var(--primary)]"
                      checked={isSel}
                      onChange={() => onChange(ex.type === "mcq" ? { type: "mcq", value: o.id } : { type: "true-false", value: o.id === "true" })}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className="min-w-0 flex-1">{renderInline(o.text)}</span>
                        {isRight && <Check className="h-4 w-4 shrink-0 text-success" aria-label="Correct answer" />}
                        {isWrong && <X className="h-4 w-4 shrink-0 text-danger" aria-label="Your answer, incorrect" />}
                      </span>
                      {showCorrect && o.explanation && (isSel || isRight) && <span className="mt-1 block text-[13px] text-muted">{renderInline(o.explanation)}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      );
    }
    case "multi-select": {
      const selected = new Set(value.value as string[]);
      return (
        <div>
          {ex.code && <CodeSnippet code={ex.code} />}
          <fieldset disabled={disabled}>
            <legend className="mb-2 text-xs text-subtle">Select all that apply</legend>
            <div className="space-y-2">
              {ex.options.map((o) => {
                const isSel = selected.has(o.id);
                const shouldBe = ex.answers.includes(o.id);
                const state = showCorrect ? (shouldBe ? "right" : isSel ? "wrong" : "none") : "none";
                return (
                  <label
                    key={o.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-md border px-3 py-2.5 text-sm",
                      state === "right" ? "border-success bg-success-soft" : state === "wrong" ? "border-danger bg-danger-soft" : isSel ? "border-primary bg-primary-soft" : "border-border hover:bg-surface-hover",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--primary)]"
                      checked={isSel}
                      onChange={() => {
                        const next = new Set(selected);
                        if (isSel) next.delete(o.id);
                        else next.add(o.id);
                        onChange({ type: "multi-select", value: [...next] });
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      {renderInline(o.text)}
                      {showCorrect && (
                        <span className="sr-only">{shouldBe ? " (should be selected)" : " (should not be selected)"}</span>
                      )}
                      {showCorrect && o.explanation && <span className="mt-1 block text-[13px] text-muted">{renderInline(o.explanation)}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      );
    }
    case "predict-output":
      return (
        <div>
          <CodeSnippet code={ex.code} />
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor={name}>
            Expected console output (one line per console.log)
          </label>
          <textarea
            id={name}
            value={value.value as string}
            disabled={disabled}
            onChange={(e) => onChange({ type: "predict-output", value: e.target.value })}
            rows={Math.max(3, ex.answer.split("\n").length + 1)}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-code px-3 py-2 font-mono text-[13px] text-code-fg"
          />
          {showCorrect && !review?.correct && (
            <div className="mt-2 rounded-md border border-border bg-surface-2 p-3">
              <div className="mb-1 text-xs font-semibold text-muted">Actual output</div>
              <pre className="font-mono text-[13px] whitespace-pre-wrap">{ex.answer}</pre>
            </div>
          )}
        </div>
      );
    case "fill-blank": {
      const parts = ex.template.split("___");
      const vals = value.value as string[];
      return (
        <div className="overflow-x-auto rounded-md border border-code-border bg-code p-3 font-mono text-[13px] leading-8 whitespace-pre text-code-fg">
          {parts.map((p, i) => (
            <span key={i}>
              {p}
              {i < parts.length - 1 && (
                <input
                  aria-label={`Blank ${i + 1}`}
                  value={vals[i] ?? ""}
                  disabled={disabled}
                  spellCheck={false}
                  autoCapitalize="off"
                  onChange={(e) => {
                    const next = [...vals];
                    next[i] = e.target.value;
                    onChange({ type: "fill-blank", value: next });
                  }}
                  size={Math.max(6, (vals[i] ?? "").length + 1, ex.blanks[i]?.answers[0]?.length ?? 6)}
                  className={cn(
                    "mx-0.5 rounded border bg-surface px-1.5 py-0.5 font-mono text-[13px]",
                    review?.parts ? (review.parts[i] ? "border-success" : "border-danger") : "border-border-strong",
                  )}
                />
              )}
              {review?.parts && i < parts.length - 1 && !review.parts[i] && (
                <span className="text-[11px] text-success"> ({ex.blanks[i].answers[0]})</span>
              )}
            </span>
          ))}
        </div>
      );
    }
    case "match":
      return <MatchInput ex={ex} value={value as Extract<Answer, { type: "match" }>} onChange={onChange} disabled={disabled} review={review} />;
    case "order": {
      const steps = value.value as string[];
      const move = (i: number, d: -1 | 1) => {
        const next = [...steps];
        const j = i + d;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j], next[i]];
        onChange({ type: "order", value: next });
      };
      return (
        <ol className="space-y-1.5" aria-label="Steps to arrange">
          {steps.map((s, i) => (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2 rounded-md border bg-surface px-2 py-1.5 text-sm",
                review?.parts ? (review.parts[i] ? "border-success" : "border-danger") : "border-border",
              )}
            >
              <span className="w-5 text-center text-xs font-semibold text-subtle">{i + 1}</span>
              <span className="min-w-0 flex-1">{renderInline(s)}</span>
              {review?.parts && !review.parts[i] && <span className="text-[11px] text-success">should be #{ex.steps.indexOf(s) + 1}</span>}
              {!disabled && (
                <span className="flex shrink-0 gap-0.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted hover:bg-surface-hover disabled:opacity-30" aria-label={`Move "${s}" up`}>
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === steps.length - 1} className="rounded p-1 text-muted hover:bg-surface-hover disabled:opacity-30" aria-label={`Move "${s}" down`}>
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </span>
              )}
            </li>
          ))}
        </ol>
      );
    }
    case "short-answer":
      return (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted" htmlFor={name}>
            Your answer
          </label>
          <textarea
            id={name}
            value={value.value as string}
            disabled={disabled}
            onChange={(e) => onChange({ type: "short-answer", value: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          {showCorrect && (
            <div className="mt-2 rounded-md border border-border bg-surface-2 p-3 text-sm">
              <div className="mb-1 text-xs font-semibold text-muted">Sample answer</div>
              {renderInline(ex.sampleAnswer)}
              <p className="mt-2 text-xs text-subtle">
                Short answers are checked for key ideas only ({ex.keywords.map((g) => g[0]).join(", ")}). Compare your wording with the sample answer.
              </p>
            </div>
          )}
        </div>
      );
  }
}

function MatchInput({
  ex,
  value,
  onChange,
  disabled,
  review,
}: {
  ex: Extract<Exercise, { type: "match" }>;
  value: Extract<Answer, { type: "match" }>;
  onChange: (a: Answer) => void;
  disabled?: boolean;
  review?: GradeResult | null;
}) {
  const rights = useMemo(() => seededShuffle(ex.pairs.map((p) => p.right), ex.id + "r"), [ex]);
  return (
    <div className="space-y-2">
      {ex.pairs.map((p, i) => (
        <div
          key={i}
          className={cn(
            "grid gap-2 rounded-md border px-3 py-2 sm:grid-cols-[1fr_1fr] sm:items-center",
            review?.parts ? (review.parts[i] ? "border-success" : "border-danger") : "border-border",
          )}
        >
          <span className="text-sm">{renderInline(p.left)}</span>
          <div>
            <select
              aria-label={`Match for ${p.left}`}
              value={value.value[i] ?? ""}
              disabled={disabled}
              onChange={(e) => {
                const next = { ...value.value };
                if (e.target.value) next[i] = e.target.value;
                else delete next[i];
                onChange({ type: "match", value: next });
              }}
              className="h-9 w-full rounded-md border border-border bg-surface px-2 text-sm"
            >
              <option value="">Choose…</option>
              {rights.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/`/g, "")}
                </option>
              ))}
            </select>
            {review?.parts && !review.parts[i] && <div className="mt-1 text-[12px] text-success">Correct: {renderInline(p.right)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

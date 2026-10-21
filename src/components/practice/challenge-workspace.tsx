"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Eye, Lightbulb, XCircle } from "lucide-react";
import type { Challenge } from "@/content/types";
import type { RunResult } from "@/lib/sandbox/types";
import { gradeCodeResult } from "@/lib/exercises/grade";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { renderInline } from "@/lib/markdown";
import { CodeRunner } from "@/components/editor/code-runner";
import { CodeBlockStatic } from "@/components/content/code-block-static";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { cn } from "@/components/ui/cn";

export function ChallengeWorkspace({ challenge }: { challenge: Challenge }) {
  const meta = useStoreMeta();
  useEffect(() => {
    if (meta.hydrated) learnerStore.visit({ type: "challenge", id: challenge.id });
  }, [meta.hydrated, challenge.id]);
  if (!meta.hydrated) return <div className="h-72 animate-pulse rounded-lg bg-surface" aria-busy="true" />;
  return <Workspace challenge={challenge} />;
}

function Workspace({ challenge: c }: { challenge: Challenge }) {
  const s = useLearnerState();
  const progress = s.challenges[c.id];
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [run, setRun] = useState<RunResult | null>(null);
  const [initial] = useState(() => learnerStore.getState().challenges[c.id]?.lastCode ?? c.starter);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const manual = c.validation === "manual";

  const onResult = (r: RunResult, code: string) => {
    setRun(r);
    const g = gradeCodeResult(r, c.tests?.length ?? 0);
    learnerStore.recordChallenge(c.id, g.correct, code);
  };
  const grade = run ? gradeCodeResult(run, c.tests?.length ?? 0) : null;
  const checked = progress?.checklist ?? [];

  return (
    <div className="space-y-4">
      {progress && (
        <p className="text-xs text-subtle" aria-live="polite">
          {progress.attempts} attempt{progress.attempts === 1 ? "" : "s"}
          {progress.passed && " · Solved"}
          {progress.selfReviewed && " · Self-reviewed"}
        </p>
      )}
      {manual ? (
        <>
          <div className="rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
            This challenge uses {c.topic === "react" ? "React" : c.topic === "cypress" ? "Cypress" : "Playwright"}, which can&apos;t run inside the browser
            sandbox. Write your solution here or in your own project, run it locally, then review it against the checklist. Your code is saved in this browser
            but is <strong>not</strong> validated automatically.
          </div>
          <CodeRunnerlessEditor
            initial={initial}
            onChange={(code) => {
              clearTimeout(timer.current);
              timer.current = setTimeout(() => learnerStore.saveChallengeDraft(c.id, code), 500);
            }}
          />
          <fieldset className="rounded-lg border border-border bg-surface p-4">
            <legend className="px-1 text-sm font-semibold">Self-review checklist</legend>
            <ul className="mt-2 space-y-2">
              {c.checklist?.map((item, i) => (
                <li key={i}>
                  <label className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[var(--primary)]"
                      checked={checked.includes(i)}
                      onChange={() => {
                        const next = checked.includes(i) ? checked.filter((x) => x !== i) : [...checked, i];
                        learnerStore.setChallengeChecklist(c.id, next, next.length === (c.checklist?.length ?? 0));
                      }}
                    />
                    <span>{renderInline(item)}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-subtle">The challenge is marked as self-reviewed when every item is ticked.</p>
          </fieldset>
        </>
      ) : (
        <>
          <CodeRunner
            title="Your solution"
            initialCode={initial}
            resetCode={c.starter}
            runtime={c.validation === "dom" ? "dom" : "js"}
            html={c.html}
            tests={c.tests}
            runLabel="Run tests"
            onResult={onResult}
            editorMinHeight={260}
            onCodeChange={(code) => {
              clearTimeout(timer.current);
              timer.current = setTimeout(() => learnerStore.saveChallengeDraft(c.id, code), 500);
            }}
          />
          {run && (
            <div className={cn("rounded-lg border p-4", grade?.correct ? "border-success/40 bg-success-soft" : "border-danger/40 bg-danger-soft")} role="status">
              <div className={cn("flex items-center gap-2 font-semibold", grade?.correct ? "text-success" : "text-danger")}>
                {grade?.correct ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
                {grade?.feedback}
              </div>
              {run.tests.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {run.tests.map((t) => (
                    <li key={t.name} className="flex gap-2">
                      {t.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Passed" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label="Failed" />}
                      <span>
                        {t.name}
                        {!t.passed && <span className="block font-mono text-xs text-danger">{t.message}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {hints < c.hints.length && (
          <Button size="sm" variant="ghost" onClick={() => setHints((h) => h + 1)}>
            <Lightbulb className="h-3.5 w-3.5" aria-hidden /> {hints ? "Next hint" : "Show hint"} ({hints}/{c.hints.length})
          </Button>
        )}
        {!showSolution && (
          <Button size="sm" variant="ghost" onClick={() => setConfirm(true)}>
            <Eye className="h-3.5 w-3.5" aria-hidden /> Show solution
          </Button>
        )}
      </div>
      {hints > 0 && (
        <ul className="space-y-1.5">
          {c.hints.slice(0, hints).map((h, i) => (
            <li key={i} className="rounded-md border border-info/30 bg-info-soft px-3 py-2 text-sm">
              <span className="font-medium">Hint {i + 1}:</span> {renderInline(h)}
            </li>
          ))}
        </ul>
      )}
      {showSolution && (
        <section aria-labelledby="solution-h">
          <h2 id="solution-h" className="mb-1 text-sm font-semibold">
            Reference solution
          </h2>
          <CodeBlockStatic code={c.solution} language={c.topic === "react" ? "jsx" : "js"} />
          <p className="text-sm text-fg/90">{renderInline(c.explanation)}</p>
        </section>
      )}
      <ConfirmDialog
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          setShowSolution(true);
        }}
        title="Show the reference solution?"
        description="You can still attempt the challenge afterwards, but try a few more ideas first if you can."
        confirmLabel="Show solution"
      />
    </div>
  );
}

function CodeRunnerlessEditor({ initial, onChange }: { initial: string; onChange: (s: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">Your solution (not executed)</span>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        spellCheck={false}
        rows={16}
        className="w-full rounded-lg border border-border bg-code p-3 font-mono text-[13px] text-code-fg"
      />
    </label>
  );
}

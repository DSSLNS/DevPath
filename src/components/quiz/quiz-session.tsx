"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { QuestionRef } from "@/content";
import { useCatalog } from "@/lib/catalog/context";
import { buildQuiz, decodeQuizConfig } from "@/lib/quiz";
import { globalAssessmentRule, moduleAssessmentRule } from "@/lib/progress";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { QuizRunner } from "./quiz-runner";

let bankCache: Promise<QuestionRef[]> | null = null;
function loadBank() {
  bankCache ??= fetch("/question-bank.json").then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
  bankCache.catch(() => (bankCache = null));
  return bankCache;
}

export function QuizSession() {
  const params = useSearchParams();
  const catalog = useCatalog();
  const state = useLearnerState();
  const meta = useStoreMeta();
  const [bank, setBank] = useState<QuestionRef[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const config = useMemo(() => decodeQuizConfig(new URLSearchParams(params.toString())), [params]);

  useEffect(() => {
    loadBank().then(setBank, () => setError("The question bank could not be loaded. Check your connection and reload the page."));
  }, []);

  // Built once per config from a snapshot of the store, so answering questions
  // (which updates learner state) never reshuffles the quiz mid-attempt.
  const key = params.toString();
  const built = useMemo(
    () => (bank && config && meta.hydrated ? buildQuiz(catalog, bank, config, learnerStore.getState()) : null),
    [bank, config, meta.hydrated, catalog],
  );

  if (!config) {
    return (
      <div>
        <PageHeader title="Assessment not found" description="This assessment link is invalid or incomplete." />
        <Link href="/quizzes" className={buttonClass("primary")}>
          Back to assessments
        </Link>
      </div>
    );
  }

  // Progression rules are enforced here too, not just on the hub, so a copied URL can't skip them.
  const rule =
    config.kind === "module" && config.target
      ? catalog.moduleById.get(config.target)
        ? moduleAssessmentRule(state, catalog.moduleById.get(config.target)!)
        : { unlocked: false, reason: "Unknown module." }
      : config.kind === "mixed" || config.kind === "challenge" || config.kind === "interview" || config.kind === "final"
        ? globalAssessmentRule(catalog, state, config.kind)
        : { unlocked: true, reason: "" };

  if (error) return <p role="alert" className="text-sm text-danger">{error}</p>;
  if (!meta.hydrated || !bank || !built) return <p className="text-sm text-muted">Loading assessment…</p>;

  if (!rule.unlocked) {
    return (
      <div>
        <PageHeader title="This assessment is locked" description={rule.reason} />
        <Link href="/quizzes" className={buttonClass("primary")}>
          Back to assessments
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <Link href="/quizzes" className="hover:text-fg">
          Quizzes & Assessments
        </Link>
      </nav>
      <PageHeader
        title={built.title}
        description={`${built.questions.length} question${built.questions.length === 1 ? "" : "s"}${config.minutes ? ` · ${config.minutes} minute time limit` : " · untimed"}${config.difficulty !== "any" ? ` · ${config.difficulty}` : ""}`}
      />
      {built.emptyReason ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-6 text-sm text-muted">
          {built.emptyReason}{" "}
          <Link href="/quizzes" className="text-primary underline">
            Change the settings
          </Link>
        </div>
      ) : (
        <QuizRunner key={key} quizId={built.quizId} kind={config.kind} title={built.title} questions={built.questions} minutes={config.minutes} />
      )}
    </div>
  );
}

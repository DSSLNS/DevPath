"use client";

import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { moduleAssessmentRule } from "@/lib/progress";
import { useLearnerState } from "@/lib/store/hooks";
import { buttonClass } from "@/components/ui/button";
import { encodeQuizConfig } from "@/lib/quiz";

export function ModuleLessonStatus({ lessonId }: { lessonId: string }) {
  const s = useLearnerState();
  if (s.lessons[lessonId]?.completedAt) return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Completed" />;
  if (s.lessons[lessonId]) return <span className="shrink-0 text-xs text-subtle">In progress</span>;
  return null;
}

export function ModuleAssessmentLink({ moduleId }: { moduleId: string }) {
  const catalog = useCatalog();
  const s = useLearnerState();
  const m = catalog.moduleById.get(moduleId);
  if (!m) return null;
  const rule = moduleAssessmentRule(s, m);
  if (!rule.unlocked) {
    return (
      <span className="inline-flex max-w-xs items-center gap-1.5 text-xs text-subtle">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden /> Module assessment: {rule.reason}
      </span>
    );
  }
  const href = `/quizzes/run?${encodeQuizConfig({ kind: "module", target: moduleId, count: 15, difficulty: "any", moduleIds: [], minutes: 0, seed: "m" })}`;
  return (
    <Link href={href} className={buttonClass("primary")}>
      Take module assessment
    </Link>
  );
}

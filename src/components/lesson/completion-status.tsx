"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useLearnerState } from "@/lib/store/hooks";

export function CompletionStatus({ lessonId }: { lessonId: string }) {
  const s = useLearnerState();
  const done = !!s.lessons[lessonId]?.completedAt;
  return done ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-success" data-testid="lesson-status">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-subtle" data-testid="lesson-status">
      <Circle className="h-3.5 w-3.5" aria-hidden /> {s.lessons[lessonId] ? "In progress" : "Not started"}
    </span>
  );
}

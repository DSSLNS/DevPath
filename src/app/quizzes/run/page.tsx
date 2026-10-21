import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizSession } from "@/components/quiz/quiz-session";

export const metadata: Metadata = { title: "Assessment" };

export default function QuizRunPage() {
  return (
    <div className="max-w-3xl">
      <Suspense fallback={<p className="text-sm text-muted">Loading assessment…</p>}>
        <QuizSession />
      </Suspense>
    </div>
  );
}

import type { Metadata } from "next";
import { QuizHub } from "@/components/quiz/quiz-hub";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Quizzes & Assessments" };

export default function QuizzesPage() {
  return (
    <div>
      <PageHeader
        title="Quizzes & Assessments"
        description="Lesson quizzes live inside each lesson. Here you can take module assessments, mixed practice, challenge mode, mock interviews and the final assessment."
      />
      <QuizHub />
    </div>
  );
}

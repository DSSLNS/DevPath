import type { Metadata } from "next";
import { CurriculumOverview } from "@/components/learn/curriculum-overview";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Learn JavaScript" };

export default function LearnPage() {
  return (
    <div>
      <PageHeader
        title="Learn JavaScript"
        description="A structured curriculum from your first program to professional JavaScript, TypeScript and React. Fundamentals come before the frameworks and testing tools that depend on them."
      />
      <CurriculumOverview />
    </div>
  );
}

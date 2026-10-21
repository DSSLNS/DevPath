import type { Metadata } from "next";
import { ProgressView } from "@/components/progress/progress-view";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Progress & Achievements" };

export default function ProgressPage() {
  return (
    <div>
      <PageHeader title="Progress & Achievements" description="Topic-level progress, transparent mastery rules, and a revision queue built from your mistakes." />
      <ProgressView />
    </div>
  );
}

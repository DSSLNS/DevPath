import type { Metadata } from "next";
import Link from "next/link";
import { Code2 } from "lucide-react";
import { ChallengeLibrary } from "@/components/practice/challenge-library";
import { PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "Practice Lab" };

export default function PracticePage() {
  return (
    <div>
      <PageHeader
        title="Practice Lab"
        description="Solve challenges independent of lessons. JavaScript and DOM challenges are checked automatically by tests in a sandbox; React, Cypress and Playwright challenges use a self-review checklist."
        actions={
          <Link href="/practice/playground" className={buttonClass("primary")}>
            <Code2 className="h-4 w-4" aria-hidden /> Open playground
          </Link>
        }
      />
      <ChallengeLibrary />
    </div>
  );
}

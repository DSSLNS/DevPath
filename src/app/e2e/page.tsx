import type { Metadata } from "next";
import { kbCategories } from "@/content";
import { PageHeader } from "@/components/ui/card";
import { KbBrowser } from "@/components/kb/kb-browser";

export const metadata: Metadata = { title: "E2E Testing Notes" };

export default function E2ePage() {
  return (
    <div>
      <PageHeader
        title="E2E Testing Notes"
        description="A curated knowledge base on using JavaScript for reliable browser automation with Cypress and Playwright: fundamentals, APIs, real e-commerce scenarios and best practices."
      />
      <KbBrowser categories={kbCategories} />
    </div>
  );
}

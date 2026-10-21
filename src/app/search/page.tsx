import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsPage } from "@/components/layout/search-results-page";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading search…</p>}>
      <SearchResultsPage />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchDocs, groupResults } from "@/lib/search/search";
import { CATEGORY_LABEL, type SearchCategory } from "@/lib/search/types";
import { useSearchIndex } from "@/lib/search/use-search-index";
import { PageHeader } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { useNoteDocs } from "./search-palette";
import type { Difficulty } from "@/content/types";

export function SearchResultsPage() {
  const initial = useSearchParams().get("q") ?? "";
  return <SearchResults key={initial} initial={initial} />;
}

function SearchResults({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [cats, setCats] = useState<SearchCategory[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const { docs, error, retry } = useSearchIndex(true);
  const notes = useNoteDocs();

  const results = useMemo(
    () => (docs && q.trim() ? searchDocs([...notes, ...docs], q, { categories: cats, difficulty: difficulty || undefined, limit: 200 }) : []),
    [docs, notes, q, cats, difficulty],
  );
  const groups = groupResults(results);
  const allCats = Object.keys(CATEGORY_LABEL) as SearchCategory[];

  return (
    <div className="max-w-4xl">
      <PageHeader title="Search" />
      <form
        role="search"
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search query</span>
          <Search className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-subtle" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-full rounded-md border border-border bg-surface pr-3 pl-9" placeholder="Search everything" autoFocus />
        </label>
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | "")} className="h-10 rounded-md border border-border bg-surface px-2 text-sm">
          <option value="">Any difficulty</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </form>
      <div className="mb-4 flex flex-wrap gap-1" role="group" aria-label="Filter by category">
        {allCats.map((c) => {
          const on = cats.includes(c);
          return (
            <button key={c} type="button" aria-pressed={on} onClick={() => setCats(on ? cats.filter((x) => x !== c) : [...cats, c])} className={cn("rounded-full border px-2.5 py-0.5 text-xs", on ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border text-muted")}>
              {CATEGORY_LABEL[c]}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}{" "}
          <button className="underline" onClick={retry}>
            Retry
          </button>
        </p>
      )}
      {!q.trim() ? (
        <p className="text-sm text-muted">Type a term to search lessons, concepts, code examples, E2E notes, Cypress commands, Playwright APIs, exercises and your notes.</p>
      ) : !docs ? (
        <p className="text-sm text-muted">Loading search index…</p>
      ) : results.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong p-6 text-sm text-muted" role="status">
          No results for “{q}”. Check the spelling, try a broader term, or remove filters.
        </p>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-subtle" role="status">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          {[...groups.entries()].map(([cat, list]) => (
            <section key={cat} aria-labelledby={`g-${cat}`}>
              <h2 id={`g-${cat}`} className="mb-2 text-sm font-semibold text-subtle">
                {CATEGORY_LABEL[cat]} ({list.length})
              </h2>
              <ul className="space-y-2">
                {list.map((r) => (
                  <li key={r.doc.id} className="rounded-lg border border-border bg-surface p-3">
                    <Link href={r.doc.url} className="font-medium hover:text-primary">
                      {r.doc.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-subtle">
                      {r.doc.subtitle}
                      {r.doc.difficulty && <DifficultyBadge level={r.doc.difficulty as Difficulty} />}
                    </div>
                    {r.snippet && <p className="mt-1 line-clamp-2 text-sm text-muted">{r.snippet}</p>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

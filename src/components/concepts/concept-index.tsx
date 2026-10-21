"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { renderInline } from "@/lib/markdown";

export interface ConceptEntry {
  id: string;
  term: string;
  definition: string;
  lessons: { title: string; url: string }[];
}

export function ConceptIndex({ entries }: { entries: ConceptEntry[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? entries.filter((e) => e.term.toLowerCase().includes(t) || e.definition.toLowerCase().includes(t)) : entries;
  }, [entries, q]);
  const letters = [...new Set(list.map((e) => e.term[0].toUpperCase()))];
  return (
    <section aria-labelledby="concept-index">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="concept-index" className="text-lg font-semibold">
          Concept index <span className="text-sm font-normal text-subtle">({entries.length})</span>
        </h2>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Filter concepts</span>
          <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-subtle" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter concepts" className="h-9 w-full rounded-md border border-border bg-surface pr-2 pl-8 text-sm" />
        </label>
      </div>
      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong p-4 text-sm text-muted" role="status">
          No concepts match “{q}”. Try the global search (Ctrl/⌘ K) to search lesson content too.
        </p>
      ) : (
        letters.map((letter) => (
          <div key={letter} className="mb-5">
            <h3 className="mb-2 border-b border-border pb-1 text-sm font-semibold text-subtle">{letter}</h3>
            <dl className="grid gap-2 md:grid-cols-2">
              {list
                .filter((e) => e.term[0].toUpperCase() === letter)
                .map((e) => (
                  <div key={e.id} id={e.id} className="scroll-mt-20 rounded-lg border border-border bg-surface p-3">
                    <dt className="font-semibold">{e.term}</dt>
                    <dd className="mt-0.5 text-sm text-muted">{renderInline(e.definition)}</dd>
                    {e.lessons.length > 0 && (
                      <dd className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {e.lessons.slice(0, 4).map((l) => (
                          <Link key={l.url} href={l.url} className="text-primary hover:underline">
                            {l.title}
                          </Link>
                        ))}
                      </dd>
                    )}
                  </div>
                ))}
            </dl>
          </div>
        ))
      )}
    </section>
  );
}

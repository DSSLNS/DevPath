"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { searchDocs, type SearchResult } from "@/lib/search/search";
import { CATEGORY_LABEL, type SearchCategory, type SearchDoc } from "@/lib/search/types";
import { useSearchIndex } from "@/lib/search/use-search-index";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";

const FILTERS: { id: SearchCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lesson", label: "Lessons" },
  { id: "kb", label: "E2E notes" },
  { id: "concept", label: "Concepts" },
  { id: "example", label: "Examples" },
  { id: "exercise", label: "Exercises" },
  { id: "challenge", label: "Challenges" },
  { id: "note", label: "My notes" },
];

const SUGGESTIONS = ["closures", "map vs forEach", "promise.all", "event loop", "cy.intercept", "getByRole", "flaky tests", "destructuring"];

export function useNoteDocs(): SearchDoc[] {
  const { notes } = useLearnerState();
  return useMemo(
    () =>
      notes.map((n) => ({
        id: `note:${n.id}`,
        category: "note" as const,
        title: n.title || "Untitled note",
        subtitle: n.tags.length ? `My note · ${n.tags.join(", ")}` : "My note",
        url: `/notes?note=${n.id}`,
        tags: n.tags,
        text: n.content.slice(0, 2500),
      })),
    [notes],
  );
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { recentSearches } = useLearnerState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchCategory | "all">("all");
  const [active, setActive] = useState(0);
  const { docs, error, retry } = useSearchIndex(open);
  const noteDocs = useNoteDocs();
  const listId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && d.open) d.close();
  }, [open]);

  const results: SearchResult[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchDocs([...noteDocs, ...(docs ?? [])], query, {
      categories: filter === "all" ? undefined : [filter],
      limit: 30,
    });
  }, [docs, noteDocs, query, filter]);

  const go = (r: SearchResult) => {
    learnerStore.addRecentSearch(query);
    onClose();
    router.push(r.doc.url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) go(results[active]);
      else if (query.trim()) {
        learnerStore.addRecentSearch(query);
        onClose();
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  return (
    <dialog
      ref={ref}
      aria-label="Search"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="mx-auto mt-[8vh] w-[calc(100%-1.5rem)] max-w-2xl rounded-lg border border-border bg-surface p-0 text-fg shadow-lg"
      data-testid="search-dialog"
    >
      {open && (
        <div className="flex max-h-[80vh] flex-col">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-activedescendant={results.length ? `${listId}-opt-${active}` : undefined}
              aria-autocomplete="list"
              aria-label="Search everything"
              placeholder="Search lessons, concepts, Cypress commands, Playwright APIs, your notes…"
              className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle"
            />
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close search">
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2" role="group" aria-label="Filter results">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => {
                  setFilter(f.id);
                  setActive(0);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-xs",
                  filter === f.id ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border text-muted hover:text-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="min-h-[200px] overflow-y-auto p-2">
            {error && (
              <div className="p-4 text-sm text-danger">
                {error}{" "}
                <button className="underline" onClick={retry}>
                  Retry
                </button>
              </div>
            )}
            {!docs && !error && query && (
              <div className="flex items-center gap-2 p-4 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading search index…
              </div>
            )}
            {!query.trim() && (
              <div className="p-2 text-sm">
                {recentSearches.length > 0 && (
                  <>
                    <h3 className="px-2 pb-1 text-xs font-semibold text-subtle">Recent searches</h3>
                    <div className="mb-3 flex flex-wrap gap-1.5 px-2">
                      {recentSearches.map((s) => (
                        <button key={s} type="button" onClick={() => setQuery(s)} className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:text-fg">
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <h3 className="px-2 pb-1 text-xs font-semibold text-subtle">Try searching for</h3>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => setQuery(s)} className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:text-fg">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {query.trim() && docs && results.length === 0 && (
              <div className="p-6 text-center text-sm text-muted" role="status">
                No results for <strong className="text-fg">“{query}”</strong>
                {filter !== "all" && " in this category"}. Try a shorter term, a synonym (e.g. “array methods”), or{" "}
                {filter !== "all" ? (
                  <button className="text-primary underline" onClick={() => setFilter("all")}>
                    search all categories
                  </button>
                ) : (
                  "browse the curriculum"
                )}
                .
              </div>
            )}
            {results.length > 0 && (
              <ul id={listId} role="listbox" aria-label="Search results" className="space-y-0.5">
                {results.map((r, i) => {
                  const showHeader = i === 0 || results[i - 1].doc.category !== r.doc.category;
                  return (
                    <li key={r.doc.id} role="presentation">
                      {showHeader && filter === "all" && (
                        <div className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-subtle uppercase" aria-hidden>
                          {CATEGORY_LABEL[r.doc.category]}
                        </div>
                      )}
                      <div
                        id={`${listId}-opt-${i}`}
                        role="option"
                        aria-selected={i === active}
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(r)}
                        className={cn("flex cursor-pointer items-start gap-3 rounded-md px-2.5 py-2", i === active ? "bg-primary-soft" : "hover:bg-surface-hover")}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{r.doc.title}</div>
                          <div className="truncate text-xs text-subtle">
                            {filter !== "all" ? `${CATEGORY_LABEL[r.doc.category]} · ` : ""}
                            {r.doc.subtitle}
                          </div>
                        </div>
                        {i === active && <CornerDownLeft className="mt-1 h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-subtle">
            <span>↑↓ to navigate · Enter to open · Esc to close</span>
            {query.trim() && (
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  onClose();
                  router.push(`/search?q=${encodeURIComponent(query)}`);
                }}
              >
                All results
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

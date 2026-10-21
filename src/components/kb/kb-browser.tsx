"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookMarked, Search, TestTubes } from "lucide-react";
import type { Difficulty, KbCategory, Tech } from "@/content/types";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { DifficultyBadge, TechBadges, techLabel } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/components/ui/cn";

export function KbBrowser({ categories }: { categories: { id: KbCategory; title: string; description: string }[] }) {
  const { kb } = useCatalog();
  const { bookmarks } = useLearnerState();
  const [category, setCategory] = useState<KbCategory | "all">("all");
  const [tech, setTech] = useState<Tech | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [q, setQ] = useState("");

  const techs = useMemo(() => [...new Set(kb.flatMap((n) => n.tech))], [kb]);
  const list = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return kb.filter(
      (n) =>
        (category === "all" || n.category === category) &&
        (tech === "all" || n.tech.includes(tech)) &&
        (difficulty === "all" || n.difficulty === difficulty) &&
        terms.every((t) => `${n.title} ${n.summary} ${n.tags.join(" ")}`.toLowerCase().includes(t)),
    );
  }, [kb, category, tech, difficulty, q]);
  const bookmarked = new Set(bookmarks.filter((b) => b.contentType === "kb").map((b) => b.contentId));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Note categories" className="min-w-0">
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {[{ id: "all" as const, title: "All notes", description: "" }, ...categories].map((c) => {
            const count = c.id === "all" ? kb.length : kb.filter((n) => n.category === c.id).length;
            return (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-sm",
                    category === c.id ? "bg-primary-soft font-medium text-primary-soft-fg" : "text-muted hover:bg-surface-hover hover:text-fg",
                  )}
                >
                  <span>{c.title}</span>
                  <span className="text-xs tabular-nums text-subtle">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="min-w-0">
        {category !== "all" && <p className="mb-3 text-sm text-muted">{categories.find((c) => c.id === category)?.description}</p>}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Filter notes</span>
            <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-subtle" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by title or tag, e.g. intercept, locator, flaky"
              className="h-9 w-full rounded-md border border-border bg-surface pr-3 pl-8 text-sm"
            />
          </label>
          <select aria-label="Technology" value={tech} onChange={(e) => setTech(e.target.value as Tech | "all")} className="h-9 rounded-md border border-border bg-surface px-2 text-sm">
            <option value="all">All technologies</option>
            {techs.map((t) => (
              <option key={t} value={t}>
                {techLabel[t]}
              </option>
            ))}
          </select>
          <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | "all")} className="h-9 rounded-md border border-border bg-surface px-2 text-sm">
            <option value="all">Any difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        {list.length === 0 ? (
          <EmptyState icon={TestTubes} title="No notes match">
            {kb.filter((n) => category === "all" || n.category === category).length === 0
              ? "Notes for this category are planned but not published yet."
              : "Try removing a filter or searching for a different term."}
          </EmptyState>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {list.map((n) => (
              <li key={n.id}>
                <Link href={`/e2e/${n.slug}`} className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                  <div className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 font-medium">{n.title}</span>
                    {bookmarked.has(n.id) && <BookMarked className="h-4 w-4 shrink-0 text-primary" aria-label="Bookmarked" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{n.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    <TechBadges tech={n.tech} />
                    <DifficultyBadge level={n.difficulty} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

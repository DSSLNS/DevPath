"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import type { Difficulty } from "@/content/types";
import type { TechCategoryId } from "@/content/technologies/types";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { techProgress } from "@/lib/courses";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TechCard } from "./tech-card";

type Sort = "recommended" | "name" | "progress" | "recent";
type Availability = "all" | "lessons" | "any-content";

const control = "h-9 rounded-md border border-border bg-surface px-2 text-sm text-fg";

/**
 * "What would you like to learn today?" — searchable, filterable technology cards grouped by category.
 * `compact` limits the view to technologies with content (used on the dashboard).
 */
export function CourseCatalog({ compact = false, headingLevel = 2 }: { compact?: boolean; headingLevel?: 2 | 3 }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TechCategoryId | "all">("all");
  const [level, setLevel] = useState<Difficulty | "all">("all");
  const [availability, setAvailability] = useState<Availability>(compact ? "any-content" : "all");
  const [sort, setSort] = useState<Sort>("recommended");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = catalog.technologies.filter(
      (t) =>
        (!q || `${t.name} ${t.description} ${t.badge}`.toLowerCase().includes(q)) &&
        (category === "all" || t.category === category) &&
        (level === "all" || t.level === level) &&
        (availability === "all" || (availability === "lessons" ? t.status === "available" : t.status !== "planned")),
    );
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "progress") return [...list].sort((a, b) => techProgress(b, state).percent - techProgress(a, state).percent);
    if (sort === "recent")
      return [...list].sort((a, b) => (techProgress(b, state).lastOpenedAt ?? "").localeCompare(techProgress(a, state).lastOpenedAt ?? ""));
    return list;
  }, [catalog.technologies, query, category, level, availability, sort, state]);

  const H = headingLevel === 2 ? "h2" : "h3";
  const grouped = sort === "recommended";
  const reset = () => {
    setQuery("");
    setCategory("all");
    setLevel("all");
    setAvailability("all");
  };

  return (
    <div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end" role="search" aria-label="Find a technology">
        <label className="text-sm lg:min-w-64 lg:flex-1">
          <span className="mb-1 block text-xs text-muted">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="HTML, React, SQL, Playwright…"
            className={`${control} w-full`}
            data-testid="tech-search"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as TechCategoryId | "all")} className={`${control} w-full`}>
            <option value="all">All categories</option>
            {catalog.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as Difficulty | "all")} className={`${control} w-full`}>
            <option value="all">Any level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Availability</span>
          <select value={availability} onChange={(e) => setAvailability(e.target.value as Availability)} className={`${control} w-full`}>
            <option value="all">Everything, including coming soon</option>
            <option value="any-content">Lessons or notes available</option>
            <option value="lessons">Lessons available</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${control} w-full`}>
            <option value="recommended">Recommended order</option>
            <option value="name">Name</option>
            <option value="progress">My progress</option>
            <option value="recent">Recently studied</option>
          </select>
        </label>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length} technologies shown
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="No technologies match" action={<Button onClick={reset}>Clear filters</Button>}>
          Try a different search term or remove a filter.
        </EmptyState>
      ) : grouped ? (
        <div className="space-y-8">
          {catalog.categories.map((c) => {
            const items = filtered.filter((t) => t.category === c.id);
            if (!items.length) return null;
            return (
              <section key={c.id} aria-labelledby={`cat-${c.id}`}>
                <H id={`cat-${c.id}`} className="text-base font-semibold">
                  {c.title}
                </H>
                <p className="mb-3 text-sm text-muted">{c.description}</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((t) => (
                    <TechCard key={t.id} tech={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <TechCard key={t.id} tech={t} />
          ))}
        </div>
      )}
    </div>
  );
}

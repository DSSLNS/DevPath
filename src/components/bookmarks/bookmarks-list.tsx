"use client";

import Link from "next/link";
import { useState } from "react";
import { BookMarked, X } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import type { BookmarkType } from "@/lib/store/schema";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { contentExists, contentHref, contentTitle } from "./content-ref";

const LABEL: Record<BookmarkType, string> = { lesson: "Lesson", kb: "E2E note", challenge: "Challenge", project: "Project", glossary: "Concept", note: "My note" };

export function BookmarksList() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const meta = useStoreMeta();
  const [type, setType] = useState<BookmarkType | "all">("all");
  if (!meta.hydrated) return <div className="h-40 animate-pulse rounded-lg bg-surface" aria-busy="true" />;
  const list = s.bookmarks.filter((b) => type === "all" || b.contentType === type);
  if (!s.bookmarks.length)
    return (
      <EmptyState icon={BookMarked} title="No bookmarks yet">
        Use the Bookmark button on any lesson, E2E note, challenge, project or personal note.
      </EmptyState>
    );
  const types = [...new Set(s.bookmarks.map((b) => b.contentType))];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label="Filter bookmarks">
        {(["all", ...types] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => setType(t)}
            className={cn("rounded-full border px-2.5 py-0.5 text-xs", type === t ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border text-muted")}
          >
            {t === "all" ? "All" : LABEL[t]}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {list.map((b) => {
          const exists = contentExists(catalog, b.contentType, b.contentId, s.notes);
          return (
            <li key={b.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-20 shrink-0 text-xs text-subtle">{LABEL[b.contentType]}</span>
              {exists ? (
                <Link href={contentHref(catalog, b.contentType, b.contentId)} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary">
                  {contentTitle(catalog, b.contentType, b.contentId, s.notes)}
                </Link>
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm text-subtle">This item is no longer available</span>
              )}
              <span className="hidden text-xs text-subtle sm:inline">{new Date(b.createdAt).toLocaleDateString()}</span>
              <Button size="icon" variant="ghost" aria-label="Remove bookmark" onClick={() => learnerStore.removeBookmark(b.id)}>
                <X className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

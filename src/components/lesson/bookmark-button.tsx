"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import type { BookmarkType } from "@/lib/store/schema";
import { Button } from "@/components/ui/button";

export function BookmarkButton({ type, id, label = "Bookmark" }: { type: BookmarkType; id: string; label?: string }) {
  const { bookmarks } = useLearnerState();
  const on = bookmarks.some((b) => b.contentType === type && b.contentId === id);
  return (
    <Button size="sm" variant={on ? "secondary" : "ghost"} aria-pressed={on} onClick={() => learnerStore.toggleBookmark(type, id)} data-testid="bookmark-toggle">
      {on ? <BookmarkCheck className="h-4 w-4 text-primary" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
      {on ? "Bookmarked" : label}
    </Button>
  );
}

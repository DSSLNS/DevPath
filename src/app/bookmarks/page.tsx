import type { Metadata } from "next";
import { BookmarksList } from "@/components/bookmarks/bookmarks-list";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Bookmarks" };

export default function BookmarksPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Bookmarks" description="Lessons, notes, challenges and projects you saved for later." />
      <BookmarksList />
    </div>
  );
}

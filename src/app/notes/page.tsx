import type { Metadata } from "next";
import { Suspense } from "react";
import { NotesWorkspace } from "@/components/notes/notes-workspace";

export const metadata: Metadata = { title: "My Notes" };

export default function NotesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading notes…</p>}>
      <NotesWorkspace />
    </Suspense>
  );
}

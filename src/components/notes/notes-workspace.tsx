"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, NotebookPen, Pencil, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { renderMarkdown } from "@/lib/markdown";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import type { PersonalNote } from "@/lib/store/schema";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { BookmarkButton } from "@/components/lesson/bookmark-button";

type Sort = "updated" | "created" | "title";

export function NotesWorkspace() {
  const s = useLearnerState();
  const meta = useStoreMeta();
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("note");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<Sort>("updated");

  const allTags = useMemo(() => [...new Set(s.notes.flatMap((n) => n.tags))].sort(), [s.notes]);
  const notes = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = s.notes.filter(
      (n) => (!tag || n.tags.includes(tag)) && terms.every((t) => `${n.title} ${n.content} ${n.tags.join(" ")}`.toLowerCase().includes(t)),
    );
    const sorted = [...filtered].sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : sort === "created" ? b.createdAt.localeCompare(a.createdAt) : b.updatedAt.localeCompare(a.updatedAt),
    );
    return [...sorted.filter((n) => n.pinned), ...sorted.filter((n) => !n.pinned)];
  }, [s.notes, q, tag, sort]);

  const selected = s.notes.find((n) => n.id === selectedId);
  const select = (id: string | null) => router.push(id ? `/notes?note=${id}` : "/notes", { scroll: false });

  const create = () => {
    const lessonId = params.get("lesson") ?? undefined;
    const n = learnerStore.createNote({ title: "Untitled note", lessonIds: lessonId ? [lessonId] : [] });
    select(n.id);
  };

  if (!meta.hydrated) return <div className="h-64 animate-pulse rounded-lg bg-surface" aria-busy="true" />;

  return (
    <div>
      <PageHeader
        title="My Notes"
        description="Personal notes with Markdown and code blocks. Notes autosave in this browser."
        actions={
          <Button variant="primary" onClick={create} data-testid="new-note">
            <Plus className="h-4 w-4" aria-hidden /> New note
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className={cn("min-w-0", selected && "hidden lg:block")}>
          <div className="mb-2 flex gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search notes</span>
              <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-subtle" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes" className="h-9 w-full rounded-md border border-border bg-surface pr-2 pl-8 text-sm" />
            </label>
            <select aria-label="Sort notes" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 rounded-md border border-border bg-surface px-2 text-sm">
              <option value="updated">Last updated</option>
              <option value="created">Newest</option>
              <option value="title">Title</option>
            </select>
          </div>
          {allTags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1" role="group" aria-label="Filter by tag">
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tag === t}
                  onClick={() => setTag(tag === t ? "" : t)}
                  className={cn("rounded-full border px-2 py-0.5 text-xs", tag === t ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border text-muted")}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
          {s.notes.length === 0 ? (
            <EmptyState icon={NotebookPen} title="No notes yet" action={<Button onClick={create}>Write your first note</Button>}>
              Capture explanations in your own words, code snippets and questions to revisit.
            </EmptyState>
          ) : notes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border-strong p-4 text-sm text-muted" role="status">
              No notes match “{q}”{tag && ` with tag #${tag}`}.
            </p>
          ) : (
            <ul className="space-y-1.5" aria-label="Notes">
              {notes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => select(n.id)}
                    aria-current={n.id === selectedId ? "true" : undefined}
                    className={cn("w-full rounded-lg border p-3 text-left", n.id === selectedId ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-border-strong")}
                  >
                    <div className="flex items-center gap-1.5">
                      {n.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Pinned" />}
                      <span className="truncate font-medium">{n.title || "Untitled note"}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.content.replace(/[#*`>]/g, "").slice(0, 160) || "Empty note"}</p>
                    <p className="mt-1 text-[11px] text-subtle">Updated {new Date(n.updatedAt).toLocaleString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={cn("min-w-0", !selected && "hidden lg:block")}>
          {selected ? (
            <NoteEditor key={selected.id} note={selected} onBack={() => select(null)} onDeleted={() => select(null)} />
          ) : selectedId ? (
            <p className="rounded-lg border border-dashed border-border-strong p-6 text-sm text-muted" role="alert">
              This note no longer exists. It may have been deleted in another tab.
            </p>
          ) : (
            <div className="hidden h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-border-strong text-sm text-muted lg:flex">
              Select a note or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteEditor({ note, onBack, onDeleted }: { note: PersonalNote; onBack: () => void; onDeleted: () => void }) {
  const catalog = useCatalog();
  const meta = useStoreMeta();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags.join(", "));
  const [mode, setMode] = useState<"edit" | "preview">(note.content ? "preview" : "edit");
  const [status, setStatus] = useState<"saved" | "pending" | "error">("saved");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef({ title: note.title, content: note.content, tags: note.tags.join(", ") });

  const save = () => {
    const { title: t, content: c, tags: tg } = latest.current;
    learnerStore.updateNote(note.id, {
      title: t.trim() || "Untitled note",
      content: c,
      tags: [...new Set(tg.split(",").map((x) => x.trim().replace(/^#/, "").toLowerCase()).filter(Boolean))],
    });
    setStatus(learnerStore.getMeta().saveStatus === "error" ? "error" : "saved");
  };
  const schedule = () => {
    setStatus("pending");
    clearTimeout(timer.current);
    timer.current = setTimeout(save, 700);
  };

  // Flush pending edits when leaving the note, and warn before closing the tab with unsaved changes.
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (status === "pending") {
        save();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        save();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const linked = note.lessonIds.map((id) => catalog.lessonById.get(id)).filter(Boolean);
  return (
    <div className="rounded-lg border border-border bg-surface" data-testid="note-editor">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Notes
        </Button>
        <div className="flex rounded-md border border-border p-0.5" role="group" aria-label="Editor mode">
          <button type="button" aria-pressed={mode === "edit"} onClick={() => setMode("edit")} className={cn("flex items-center gap-1 rounded px-2 py-1 text-xs", mode === "edit" ? "bg-primary-soft text-primary-soft-fg" : "text-muted")}>
            <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
          </button>
          <button type="button" aria-pressed={mode === "preview"} onClick={() => setMode("preview")} className={cn("flex items-center gap-1 rounded px-2 py-1 text-xs", mode === "preview" ? "bg-primary-soft text-primary-soft-fg" : "text-muted")}>
            <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
          </button>
        </div>
        <span className={cn("text-xs", status === "error" ? "text-danger" : "text-subtle")} aria-live="polite" data-testid="note-save-status">
          {status === "pending" ? "Saving…" : status === "error" ? "Could not save. Your text is kept on screen. Export your data from Settings." : meta.saveStatus === "error" ? "Not saved" : "All changes saved"}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <BookmarkButton type="note" id={note.id} />
          <Button size="sm" variant="ghost" onClick={() => learnerStore.updateNote(note.id, { pinned: !note.pinned })} aria-pressed={note.pinned}>
            {note.pinned ? <PinOff className="h-4 w-4" aria-hidden /> : <Pin className="h-4 w-4" aria-hidden />}
            {note.pinned ? "Unpin" : "Pin"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)} aria-label="Delete note">
            <Trash2 className="h-4 w-4 text-danger" aria-hidden />
          </Button>
        </span>
      </div>
      <div className="space-y-3 p-4">
        <label className="block">
          <span className="sr-only">Title</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              latest.current.title = e.target.value;
              schedule();
            }}
            placeholder="Note title"
            className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-subtle"
            maxLength={200}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted">Tags (comma separated)</span>
            <input
              value={tags}
              onChange={(e) => {
                setTags(e.target.value);
                latest.current.tags = e.target.value;
                schedule();
              }}
              placeholder="closures, interview"
              className="h-9 w-full rounded-md border border-border bg-surface px-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted">Link to a lesson</span>
            <select
              value=""
              onChange={(e) => e.target.value && learnerStore.updateNote(note.id, { lessonIds: [...new Set([...note.lessonIds, e.target.value])] })}
              className="h-9 w-full rounded-md border border-border bg-surface px-2"
            >
              <option value="">Add a related lesson…</option>
              {catalog.modules
                .filter((m) => m.lessons.length)
                .map((m) => (
                  <optgroup key={m.id} label={m.title}>
                    {m.lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
            </select>
          </label>
        </div>
        {linked.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Related lessons">
            {linked.map((l) => (
              <li key={l!.id} className="flex items-center gap-1">
                <Link href={catalog.lessonUrl(l!.id)} className="text-xs text-primary hover:underline">
                  <Badge tone="primary">{l!.title}</Badge>
                </Link>
                <button
                  type="button"
                  className="text-xs text-subtle hover:text-danger"
                  aria-label={`Remove link to ${l!.title}`}
                  onClick={() => learnerStore.updateNote(note.id, { lessonIds: note.lessonIds.filter((x) => x !== l!.id) })}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {mode === "edit" ? (
          <label className="block">
            <span className="sr-only">Note content (Markdown)</span>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                latest.current.content = e.target.value;
                schedule();
              }}
              rows={18}
              spellCheck
              placeholder={"Write in Markdown.\n\n## Heading\n- bullet\n`inline code`\n\n```js\nconsole.log('code block');\n```"}
              className="w-full rounded-md border border-border bg-surface-2 p-3 font-mono text-[13.5px] leading-relaxed"
            />
          </label>
        ) : (
          <div className="min-h-48 rounded-md border border-border p-4 text-[15px] leading-7" data-testid="note-preview">
            {content.trim() ? renderMarkdown(content) : <p className="text-sm text-subtle">Nothing written yet. Switch to Edit to start.</p>}
          </div>
        )}
        <p className="text-[11px] text-subtle">
          Created {new Date(note.createdAt).toLocaleString()} · Last updated {new Date(note.updatedAt).toLocaleString()}
        </p>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          clearTimeout(timer.current);
          timer.current = undefined;
          learnerStore.deleteNote(note.id);
          setConfirmDelete(false);
          onDeleted();
        }}
        title="Delete this note?"
        description={`“${note.title}” will be permanently deleted from this browser. This cannot be undone.`}
        confirmLabel="Delete note"
      />
    </div>
  );
}

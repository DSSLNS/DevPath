import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getKbNote, getKbNoteById, getLessonRef, kbCategories, kbNotes, lessonUrl } from "@/content";
import { renderInline } from "@/lib/markdown";
import { Blocks } from "@/components/content/blocks";
import { CodeBlockStatic } from "@/components/content/code-block-static";
import { Badge, DifficultyBadge, TechBadges } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/lesson/bookmark-button";
import { VisitTracker } from "@/components/kb/visit-tracker";

export function generateStaticParams() {
  return kbNotes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const n = getKbNote((await params).slug);
  return n ? { title: n.title, description: n.summary } : { title: "Note not found" };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-8 scroll-mt-20">
      <h2 id={`${id}-h`} className="mb-2 text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function KbNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const n = getKbNote((await params).slug);
  if (!n) notFound();
  const cat = kbCategories.find((c) => c.id === n.category);
  return (
    <article className="max-w-3xl">
      <VisitTracker id={n.id} />
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <Link href="/e2e" className="hover:text-fg">
          E2E Testing Notes
        </Link>{" "}
        / {cat?.title}
      </nav>
      <header className="mb-4 border-b border-border pb-5">
        <h1 className="text-3xl font-semibold tracking-tight">{n.title}</h1>
        <p className="mt-2 text-[15px] text-muted">{n.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-subtle">Applies to:</span>
          <TechBadges tech={n.tech} />
          <DifficultyBadge level={n.difficulty} />
          {n.versionNote && <Badge tone="info">{n.versionNote}</Badge>}
          <span className="ml-auto">
            <BookmarkButton type="kb" id={n.id} />
          </span>
        </div>
      </header>

      {n.prerequisites.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-1.5 text-xs font-semibold tracking-wide text-subtle uppercase">Prerequisites</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {n.prerequisites.map((p) => (
              <li key={p}>{renderInline(p)}</li>
            ))}
          </ul>
        </div>
      )}

      <Section id="explanation" title="Explanation">
        <Blocks blocks={n.explanation} />
      </Section>
      <Section id="syntax" title="Syntax">
        <Blocks blocks={n.syntax} />
      </Section>
      <Section id="code" title="Working example">
        <CodeBlockStatic code={n.code.code} language={n.code.language} title={n.code.title} />
      </Section>
      <Section id="walkthrough" title="Line by line">
        <ol className="space-y-2">
          {n.walkthrough.map((w, i) => (
            <li key={i} className="rounded-lg border border-border bg-surface p-3">
              <code className="block overflow-x-auto font-mono text-[13px] whitespace-pre text-fg">{w.line}</code>
              <p className="mt-1 text-sm text-muted">{renderInline(w.explanation)}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section id="when" title="When to use it">
        <ul className="list-disc space-y-1 pl-6 text-[15px]">
          {n.whenToUse.map((x) => (
            <li key={x}>{renderInline(x)}</li>
          ))}
        </ul>
      </Section>
      <Section id="mistakes" title="Common mistakes">
        <ul className="list-disc space-y-1 pl-6 text-[15px]">
          {n.mistakes.map((x) => (
            <li key={x}>{renderInline(x)}</li>
          ))}
        </ul>
      </Section>
      <Section id="debugging" title="Debugging tips">
        <ul className="list-disc space-y-1 pl-6 text-[15px]">
          {n.debugging.map((x) => (
            <li key={x}>{renderInline(x)}</li>
          ))}
        </ul>
      </Section>
      <Section id="practice" title="Practice task">
        <div className="rounded-lg border border-primary/30 bg-primary-soft p-4 text-[15px]">{renderInline(n.practice)}</div>
      </Section>
      <Section id="related" title="Related">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <h3 className="mb-1 text-sm font-semibold">Notes</h3>
            <ul className="space-y-1 text-sm">
              {n.relatedNotes.map((id) => {
                const r = getKbNoteById(id);
                return r ? (
                  <li key={id}>
                    <Link href={`/e2e/${r.slug}`} className="text-primary hover:underline">
                      {r.title}
                    </Link>
                  </li>
                ) : null;
              })}
              {n.relatedNotes.length === 0 && <li className="text-muted">None yet</li>}
            </ul>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold">JavaScript lessons</h3>
            <ul className="space-y-1 text-sm">
              {n.relatedLessons.map((id) => {
                const r = getLessonRef(id);
                return (
                  <li key={id}>
                    {r ? (
                      <Link href={lessonUrl(id)} className="text-primary hover:underline">
                        {r.lesson.title}
                      </Link>
                    ) : (
                      <span className="text-muted">{id.replace(/-/g, " ")} (planned)</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold">Official docs</h3>
            <ul className="space-y-1 text-sm">
              {n.docs.map((d) => (
                <li key={d.url}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                    {d.title} <ExternalLink className="h-3 w-3" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </article>
  );
}

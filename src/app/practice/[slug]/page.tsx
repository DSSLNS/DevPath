import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { challenges, getChallenge, getLessonRef, lessonUrl } from "@/content";
import { Blocks } from "@/components/content/blocks";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { renderInline } from "@/lib/markdown";
import { ChallengeWorkspace } from "@/components/practice/challenge-workspace";
import { BookmarkButton } from "@/components/lesson/bookmark-button";

export function generateStaticParams() {
  return challenges.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getChallenge((await params).slug);
  return { title: c ? c.title : "Challenge not found" };
}

export default async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = getChallenge((await params).slug);
  if (!c) notFound();
  return (
    <div className="max-w-5xl">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <Link href="/practice" className="hover:text-fg">
          Practice Lab
        </Link>{" "}
        / {c.topic}
      </nav>
      <PageHeader title={c.title} actions={<BookmarkButton type="challenge" id={c.id} />} />
      <div className="mb-4 -mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge level={c.difficulty} />
        <Badge>{c.minutes} min</Badge>
        {c.validation === "manual" ? (
          <Badge tone="warning">Self-reviewed: this challenge can&apos;t run in the browser sandbox</Badge>
        ) : (
          <Badge tone="info">Checked automatically by {c.tests?.length ?? 0} tests</Badge>
        )}
      </div>
      <section aria-labelledby="problem-h" className="rounded-lg border border-border bg-surface p-5">
        <h2 id="problem-h" className="text-lg font-semibold">
          Problem
        </h2>
        <Blocks blocks={c.statement} />
        <h3 className="mt-4 text-sm font-semibold">Expected behaviour</h3>
        <ul className="mt-1 list-disc space-y-1 pl-6 text-sm">
          {c.expectedBehavior.map((e) => (
            <li key={e}>{renderInline(e)}</li>
          ))}
        </ul>
        {c.relatedLessons.length > 0 && (
          <p className="mt-4 text-xs text-subtle">
            Related lessons:{" "}
            {c.relatedLessons.map((id, i) => {
              const r = getLessonRef(id);
              return (
                <span key={id}>
                  {i > 0 && ", "}
                  {r ? (
                    <Link href={lessonUrl(id)} className="text-primary hover:underline">
                      {r.lesson.title}
                    </Link>
                  ) : (
                    id.replace(/-/g, " ")
                  )}
                </span>
              );
            })}
          </p>
        )}
      </section>
      <div className="mt-5">
        <ChallengeWorkspace challenge={c} />
      </div>
    </div>
  );
}

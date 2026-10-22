import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessonRef, getProject, lessonUrl, projects } from "@/content";
import { renderInline } from "@/lib/markdown";
import { Blocks } from "@/components/content/blocks";
import { CodeBlockStatic } from "@/components/content/code-block-static";
import { DifficultyBadge, TechBadges, Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/card";
import { BookmarkButton } from "@/components/lesson/bookmark-button";
import { VisitTracker } from "@/components/kb/visit-tracker";
import { ProjectChecklist, ProjectCompleteButton, ProjectStepToggle, RevealSolution } from "@/components/projects/project-client";
import { ActiveTimeTracker } from "@/components/lesson/active-time-tracker";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  return { title: p ? p.title : "Project not found", description: p?.summary };
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-10 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  return (
    <article className="max-w-3xl">
      <VisitTracker id={p.id} type="project" />
      <ActiveTimeTracker />
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-subtle">
        <Link href="/projects" className="hover:text-fg">
          Projects
        </Link>{" "}
        / Project {p.order}
      </nav>
      <PageHeader title={p.title} description={p.summary} actions={<BookmarkButton type="project" id={p.id} />} />
      <div className="-mt-3 mb-4 flex flex-wrap items-center gap-2">
        <DifficultyBadge level={p.difficulty} />
        <TechBadges tech={p.tech} />
        <Badge>~{p.hours} h</Badge>
      </div>
      <Blocks blocks={p.intro} />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold">Requirements</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {p.requirements.map((r) => (
              <li key={r}>{renderInline(r)}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold">Skills you will practise</h2>
          <ul className="flex flex-wrap gap-1.5">
            {p.skills.map((s) => (
              <li key={s}>
                <Badge>{s}</Badge>
              </li>
            ))}
          </ul>
          {p.relatedLessons.length > 0 && (
            <>
              <h3 className="mt-3 mb-1 text-xs font-semibold text-subtle">Related lessons</h3>
              <ul className="space-y-0.5 text-sm">
                {p.relatedLessons.map((id) => {
                  const r = getLessonRef(id);
                  return (
                    <li key={id}>
                      {r ? (
                        <Link className="text-primary hover:underline" href={lessonUrl(id)}>
                          {r.lesson.title}
                        </Link>
                      ) : (
                        <span className="text-muted">{id.replace(/-/g, " ")} (planned)</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      <H2 id="stories">User stories</H2>
      <ul className="space-y-2">
        {p.userStories.map((u) => (
          <li key={u} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
            {renderInline(u)}
          </li>
        ))}
      </ul>

      <H2 id="starter">Starter code</H2>
      {p.starter.map((f) => (
        <CodeBlockStatic key={f.filename} code={f.code} language={f.language} title={f.filename} />
      ))}

      <H2 id="steps">Step-by-step implementation</H2>
      <ol className="space-y-4">
        {p.steps.map((s, i) => (
          <li key={s.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bg-subtle text-sm font-semibold">{i + 1}</span>
              <h3 className="min-w-0 flex-1 pt-0.5 font-semibold">{s.title}</h3>
              <ProjectStepToggle projectId={p.id} stepId={s.id} />
            </div>
            <div className="mt-2">
              <Blocks blocks={s.blocks} />
            </div>
          </li>
        ))}
      </ol>

      <H2 id="decisions">Important decisions</H2>
      <dl className="space-y-3">
        {p.decisions.map((d) => (
          <div key={d.title} className="rounded-lg border border-border bg-surface p-4">
            <dt className="font-semibold">{d.title}</dt>
            <dd className="mt-1 text-sm text-fg/90">{renderInline(d.text)}</dd>
          </div>
        ))}
      </dl>

      <H2 id="testing">Testing checklist</H2>
      <ProjectChecklist projectId={p.id} items={p.testingChecklist} />

      <H2 id="solution">Reference solution</H2>
      <RevealSolution>
        {p.solution.map((f) => (
          <CodeBlockStatic key={f.filename} code={f.code} language={f.language} title={f.filename} />
        ))}
      </RevealSolution>

      <H2 id="extensions">Extension challenges</H2>
      <ul className="list-disc space-y-1 pl-6 text-[15px]">
        {p.extensions.map((e) => (
          <li key={e}>{renderInline(e)}</li>
        ))}
      </ul>

      <div className="mt-8">
        <ProjectCompleteButton projectId={p.id} />
      </div>
    </article>
  );
}

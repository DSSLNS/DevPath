"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { plannedProjects, type PlannedProject } from "@/content/projects/planned";
import type { Difficulty } from "@/content/types";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/components/ui/cn";
import { renderInline } from "@/lib/markdown";

type Preview = PlannedProject["preview"] | "todo" | "form" | "calculator" | "game";

/** Lightweight CSS mockups so each card has a recognisable visual, not a wall of text. */
function ProjectPreview({ kind }: { kind: Preview }) {
  const line = "block h-1.5 rounded bg-border-strong";
  const inner = (() => {
    switch (kind) {
      case "todo":
        return (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              <span className="h-5 flex-1 rounded border border-border bg-surface" />
              <span className="h-5 w-10 rounded bg-primary" />
            </div>
            {["Buy milk", "Finish lesson 5", "Push to GitHub"].map((t, i) => (
              <div key={t} className="flex items-center gap-1.5 rounded border border-border bg-surface px-1.5 py-1 text-[9px] text-muted">
                <span className={cn("h-2.5 w-2.5 rounded-sm border", i === 0 ? "border-success bg-success" : "border-border-strong")} />
                <span className={i === 0 ? "line-through" : ""}>{t}</span>
              </div>
            ))}
          </div>
        );
      case "form":
        return (
          <div className="space-y-1.5 text-[9px]">
            <span className="block h-5 rounded border border-border bg-surface" />
            <span className="block h-5 rounded border border-danger/60 bg-surface" />
            <span className="text-danger">Enter a valid email address</span>
            <span className="block h-5 w-16 rounded bg-primary" />
          </div>
        );
      case "portfolio":
        return (
          <div className="grid grid-cols-[1fr_1.2fr] gap-2">
            <div className="space-y-1.5">
              <span className="block h-8 w-8 rounded-full bg-gradient-to-br from-primary/60 to-info/40" />
              <span className={cn(line, "w-full bg-fg/70")} />
              <span className={cn(line, "w-2/3")} />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-7 rounded bg-surface-hover" />
              ))}
            </div>
          </div>
        );
      case "dashboard":
        return (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {["1.2k", "86%", "34"].map((v) => (
                <span key={v} className="rounded border border-border bg-surface px-1.5 py-1 text-[9px] font-semibold">
                  {v}
                </span>
              ))}
            </div>
            <div className="flex h-12 items-end gap-1 rounded border border-border bg-surface p-1.5">
              {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
                <span key={i} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        );
      case "api":
        return (
          <div className="space-y-1 font-mono text-[9px]">
            {[
              ["GET", "/tasks", "200"],
              ["POST", "/tasks", "201"],
              ["PATCH", "/tasks/7", "200"],
              ["DELETE", "/tasks/9", "404"],
            ].map(([m, p, s]) => (
              <div key={p + m} className="flex items-center gap-1.5 rounded border border-border bg-surface px-1.5 py-1">
                <span className="w-9 font-semibold text-info">{m}</span>
                <span className="flex-1 text-muted">{p}</span>
                <span className={s === "404" ? "text-warning" : "text-success"}>{s}</span>
              </div>
            ))}
          </div>
        );
      case "fullstack":
        return (
          <div className="flex items-center justify-between gap-1 text-[9px]">
            {["React UI", "Express API", "PostgreSQL"].map((t, i) => (
              <span key={t} className="flex items-center gap-1">
                <span className="rounded border border-border bg-surface px-1.5 py-2 text-muted">{t}</span>
                {i < 2 && <span className="text-subtle">→</span>}
              </span>
            ))}
          </div>
        );
      case "tests":
        return (
          <div className="space-y-1 font-mono text-[9px]">
            {["login › shows error", "search › filters results", "checkout › applies coupon"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-muted">
                <span className="text-success">✓</span> {t}
              </div>
            ))}
            <span className="block pt-1 text-success">3 passed (4.2s)</span>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="h-5 rounded bg-surface-hover" />
            ))}
          </div>
        );
    }
  })();
  return (
    <div aria-hidden className="h-36 overflow-hidden border-b border-border bg-bg p-4 transition-transform duration-500 group-hover:scale-[1.02]">
      {inner}
    </div>
  );
}

const PREVIEW_BY_SLUG: Record<string, Preview> = { "todo-list": "todo", "form-validation": "form", calculator: "calculator", "number-guessing-game": "game" };
const TECH_LABEL: Record<string, string> = { javascript: "JavaScript", dom: "DOM", html: "HTML", css: "CSS", react: "React", typescript: "TypeScript", node: "Node.js", cypress: "Cypress", playwright: "Playwright" };

interface CardData {
  key: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  technologies: string[];
  skills: string[];
  requirements: string[];
  preview: Preview;
  href: string;
  action: string;
  available: boolean;
  completed?: boolean;
  /** Saved step progress for published projects. */
  steps?: { done: number; total: number };
}

function ProjectCard({ p }: { p: CardData }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-md" data-testid={`project-card-${p.key}`}>
      <ProjectPreview kind={p.preview} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <DifficultyBadge level={p.difficulty} />
          {p.available ? <Badge tone="success">Available</Badge> : <Badge>Coming soon</Badge>}
          {p.completed && (
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Completed
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
        <p className="mt-1 text-sm text-muted">{renderInline(p.summary)}</p>
        <p className="mt-3 text-xs text-subtle">
          <span className="font-medium text-muted">Technologies:</span> {p.technologies.join(", ")}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills you'll practise">
          {p.skills.map((s) => (
            <li key={s} className="rounded-md border border-border bg-bg-subtle px-2 py-0.5 text-[11px] text-muted">
              {renderInline(s)}
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <p className="text-[11px] font-semibold tracking-wide text-subtle uppercase">Requirements</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted">
            {p.requirements.map((r) => (
              <li key={r}>{renderInline(r)}</li>
            ))}
          </ul>
        </div>
        {p.steps && p.steps.done > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-subtle">
              <span>Your progress</span>
              <span className="tabular-nums">
                {p.steps.done}/{p.steps.total} steps
              </span>
            </div>
            <ProgressBar value={(p.steps.done / p.steps.total) * 100} label={`${p.title} progress`} />
          </div>
        )}
        <Link href={p.href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary hover:underline">
          {p.action} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function usePublishedCards(): CardData[] {
  const { projects } = useCatalog();
  const s = useLearnerState();
  return projects.map((p) => ({
    key: p.slug,
    title: p.title,
    summary: p.summary,
    difficulty: p.difficulty,
    technologies: p.tech.map((t) => TECH_LABEL[t] ?? t),
    skills: p.skills.slice(0, 3),
    requirements: p.requirements.slice(0, 3),
    preview: PREVIEW_BY_SLUG[p.slug] ?? "calculator",
    href: `/projects/${p.slug}`,
    action: "View project",
    available: true,
    completed: !!s.projects[p.id]?.completedAt,
    steps: { done: p.stepIds.filter((id) => s.projects[p.id]?.steps[id]).length, total: p.stepIds.length },
  }));
}

function plannedCards(list: PlannedProject[], pathTitle: (id: string) => string): CardData[] {
  return list.map((p) => ({
    key: p.id,
    title: p.title,
    summary: p.summary,
    difficulty: p.difficulty,
    technologies: p.technologies,
    skills: p.skills,
    requirements: p.requirements,
    preview: p.preview,
    href: `/paths/${p.pathId}`,
    action: `Learn the skills: ${pathTitle(p.pathId)}`,
    available: false,
  }));
}

/** Home page showcase: the published to-do project plus the projects on the roadmap. */
export function FeaturedProjects() {
  const catalog = useCatalog();
  const pathTitle = (id: string) => catalog.paths.find((p) => p.id === id)?.title ?? "learning path";
  const published = usePublishedCards().filter((c) => c.key === "todo-list");
  const cards = [...published, ...plannedCards(plannedProjects, pathTitle)];
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((c, i) => (
        <Reveal key={c.key} delay={(i % 3) * 80} className="h-full">
          <ProjectCard p={c} />
        </Reveal>
      ))}
    </div>
  );
}

/** Projects page: every published project, then the ones coming soon. */
export function ProjectLibrary() {
  const catalog = useCatalog();
  const pathTitle = (id: string) => catalog.paths.find((p) => p.id === id)?.title ?? "learning path";
  const published = usePublishedCards();
  return (
    <div className="space-y-10">
      <section aria-labelledby="published-projects">
        <h2 id="published-projects" className="mb-4 text-lg font-semibold">
          Available now ({published.length})
        </h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {published.map((c) => (
            <ProjectCard key={c.key} p={c} />
          ))}
        </div>
      </section>
      <section aria-labelledby="planned-projects">
        <h2 id="planned-projects" className="mb-1 text-lg font-semibold">
          Coming soon
        </h2>
        <p className="mb-4 text-sm text-muted">These projects are being written. Their learning paths teach the skills you&apos;ll need.</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plannedCards(plannedProjects, pathTitle).map((c) => (
            <ProjectCard key={c.key} p={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

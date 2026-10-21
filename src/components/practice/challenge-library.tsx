"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, CircleDot, Clock, FlaskConical } from "lucide-react";
import type { ChallengeTopic, Difficulty } from "@/content/types";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { Badge, DifficultyBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const TOPICS: { id: ChallengeTopic; label: string }[] = [
  { id: "fundamentals", label: "Fundamentals" },
  { id: "arrays", label: "Array methods" },
  { id: "objects", label: "Objects" },
  { id: "functions", label: "Functions" },
  { id: "async", label: "Async" },
  { id: "dom", label: "DOM" },
  { id: "api", label: "API handling" },
  { id: "debugging", label: "Debugging" },
  { id: "react", label: "React" },
  { id: "cypress", label: "Cypress" },
  { id: "playwright", label: "Playwright" },
];

export function ChallengeLibrary() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const [topic, setTopic] = useState<ChallengeTopic | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [time, setTime] = useState<"all" | "short" | "medium" | "long">("all");
  const [status, setStatus] = useState<"all" | "todo" | "attempted" | "solved">("all");

  const statusOf = (id: string) => {
    const p = s.challenges[id];
    if (p?.passed || p?.selfReviewed) return "solved";
    if (p && p.attempts > 0) return "attempted";
    return "todo";
  };

  const list = useMemo(
    () =>
      catalog.challenges.filter(
        (c) =>
          (topic === "all" || c.topic === topic) &&
          (difficulty === "all" || c.difficulty === difficulty) &&
          (time === "all" || (time === "short" ? c.minutes <= 15 : time === "medium" ? c.minutes > 15 && c.minutes <= 30 : c.minutes > 30)) &&
          (status === "all" || statusOf(c.id) === status),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog.challenges, topic, difficulty, time, status, s.challenges],
  );

  const counts = new Map<ChallengeTopic, number>();
  catalog.challenges.forEach((c) => counts.set(c.topic, (counts.get(c.topic) ?? 0) + 1));

  const select = "h-9 rounded-md border border-border bg-surface px-2 text-sm";
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Topic</span>
          <select className={select} value={topic} onChange={(e) => setTopic(e.target.value as ChallengeTopic | "all")}>
            <option value="all">All topics</option>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({counts.get(t.id) ?? 0})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Difficulty</span>
          <select className={select} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | "all")}>
            <option value="all">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Estimated time</span>
          <select className={select} value={time} onChange={(e) => setTime(e.target.value as typeof time)}>
            <option value="all">Any</option>
            <option value="short">≤ 15 min</option>
            <option value="medium">16–30 min</option>
            <option value="long">30+ min</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Status</span>
          <select className={select} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">All</option>
            <option value="todo">Not started</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
          </select>
        </label>
        <span className="ml-auto text-xs text-subtle" aria-live="polite">
          {list.length} of {catalog.challenges.length} challenges
        </span>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={FlaskConical} title={catalog.challenges.length ? "No challenges match these filters" : "No challenges published yet"}>
          {catalog.challenges.length
            ? "Try a different topic or difficulty."
            : "Challenges are being written. Meanwhile, every lesson has practice exercises."}
          {topic !== "all" && !counts.get(topic as ChallengeTopic) && " Challenges for this topic are planned but not published yet."}
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const st = statusOf(c.id);
            return (
              <li key={c.id}>
                <Link href={`/practice/${c.slug}`} className="flex h-full flex-col rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
                  <div className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 font-medium">{c.title}</span>
                    {st === "solved" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="Solved" />
                    ) : st === "attempted" ? (
                      <CircleDot className="h-4 w-4 shrink-0 text-warning" aria-label="Attempted" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-subtle" aria-label="Not started" />
                    )}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                    <Badge>{TOPICS.find((t) => t.id === c.topic)?.label}</Badge>
                    <DifficultyBadge level={c.difficulty} />
                    {c.validation === "manual" ? <Badge tone="warning">Self-review</Badge> : <Badge tone="info">Auto-tested</Badge>}
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-subtle">
                      <Clock className="h-3 w-3" aria-hidden /> {c.minutes} min
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Play } from "lucide-react";
import type { Difficulty } from "@/content/types";
import { useCatalog } from "@/lib/catalog/context";
import { globalAssessmentRule, incorrectQuestionIds, moduleAssessmentRule, PROGRESSION, weakTopics } from "@/lib/progress";
import { encodeQuizConfig, type QuizConfig } from "@/lib/quiz";
import { useLearnerState } from "@/lib/store/hooks";
import type { QuizKind } from "@/lib/store/schema";
import { Button, buttonClass } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";

/** A fresh seed per started assessment so each attempt gets a new question selection. */
function newSeed() {
  return Math.random().toString(36).slice(2, 10);
}

const MODES: { kind: Exclude<QuizKind, "lesson" | "module" | "day" | "revision">; title: string; description: string; defaults: { count: number; minutes: number } }[] = [
  { kind: "mixed", title: "Mixed practice", description: "Questions drawn from lessons you have completed.", defaults: { count: 10, minutes: 0 } },
  { kind: "challenge", title: "Challenge mode", description: "Harder questions that combine several concepts, from modules you have completed.", defaults: { count: 10, minutes: 15 } },
  { kind: "interview", title: "Mock interview", description: "Output prediction, debugging and explanation questions in interview style.", defaults: { count: 12, minutes: 20 } },
  { kind: "final", title: "Final assessment", description: "A comprehensive assessment across the JavaScript curriculum.", defaults: { count: 40, minutes: 60 } },
];

export function QuizHub() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const router = useRouter();
  const [config, setConfig] = useState<{ kind: QuizKind; count: number; difficulty: Difficulty | "any"; moduleIds: string[]; minutes: number } | null>(null);
  const wrong = incorrectQuestionIds(s).filter((id) => catalog.questions[id]);
  const weak = weakTopics(catalog, s).slice(0, 6);
  const history = [...s.quizAttempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  const start = (c: Omit<QuizConfig, "seed">) => router.push(`/quizzes/run?${encodeQuizConfig({ ...c, seed: newSeed() })}`);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        {MODES.map((m) => {
          const rule = globalAssessmentRule(catalog, s, m.kind);
          const open = config?.kind === m.kind;
          return (
            <Card key={m.kind} className="p-4" data-testid={`mode-${m.kind}`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{m.title}</h2>
                  <p className="mt-0.5 text-sm text-muted">{m.description}</p>
                  <p className={cn("mt-2 flex items-center gap-1 text-xs", rule.unlocked ? "text-success" : "text-subtle")}>
                    {!rule.unlocked && <Lock className="h-3 w-3" aria-hidden />} {rule.reason}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={open ? "secondary" : "primary"}
                  disabled={!rule.unlocked}
                  onClick={() => setConfig(open ? null : { kind: m.kind, count: m.defaults.count, minutes: m.defaults.minutes, difficulty: "any", moduleIds: [] })}
                  aria-expanded={open}
                >
                  {open ? "Close" : "Configure"}
                </Button>
              </div>
              {open && config && (
                <form
                  className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    start(config);
                  }}
                >
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-muted">Questions</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={config.count}
                      onChange={(e) => setConfig({ ...config, count: Math.min(60, Math.max(1, Number(e.target.value) || 1)) })}
                      className="h-9 w-full rounded-md border border-border bg-surface px-2"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-muted">Difficulty</span>
                    <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value as Difficulty | "any" })} className="h-9 w-full rounded-md border border-border bg-surface px-2">
                      <option value="any">Any</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-muted">Timer (minutes, 0 = off)</span>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={config.minutes}
                      onChange={(e) => setConfig({ ...config, minutes: Math.min(120, Math.max(0, Number(e.target.value) || 0)) })}
                      className="h-9 w-full rounded-md border border-border bg-surface px-2"
                    />
                  </label>
                  <fieldset className="sm:col-span-3">
                    <legend className="mb-1 text-xs text-muted">Topics (leave empty for all eligible)</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {catalog.modules
                        .filter((mod) => mod.lessons.length)
                        .map((mod) => {
                          const on = config.moduleIds.includes(mod.id);
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setConfig({ ...config, moduleIds: on ? config.moduleIds.filter((x) => x !== mod.id) : [...config.moduleIds, mod.id] })}
                              className={cn("rounded-full border px-2.5 py-0.5 text-xs", on ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border text-muted")}
                            >
                              {mod.title}
                            </button>
                          );
                        })}
                    </div>
                  </fieldset>
                  <div className="sm:col-span-3">
                    <Button type="submit" variant="primary">
                      <Play className="h-4 w-4" aria-hidden /> Start {m.title.toLowerCase()}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader title="Module assessments" description={`Unlocks when ${PROGRESSION.moduleAssessmentMinPercent}% of a module's lessons are complete. Pass mark: ${PROGRESSION.passPercent}%.`} />
        <ul className="divide-y divide-border">
          {catalog.modules
            .filter((m) => m.lessons.length)
            .map((m) => {
              const rule = moduleAssessmentRule(s, m);
              const best = Math.max(-1, ...s.quizAttempts.filter((a) => a.quizId === `module:${m.id}`).map((a) => a.percent));
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">
                      {m.order}. {m.title}
                    </span>
                    <span className="block text-xs text-subtle">{rule.reason}</span>
                  </span>
                  {best >= 0 && <span className={best >= PROGRESSION.passPercent ? "text-xs font-medium text-success" : "text-xs font-medium text-warning"}>Best {best}%</span>}
                  {rule.unlocked ? (
                    <button
                      type="button"
                      className={buttonClass("secondary", "sm")}
                      onClick={() => start({ kind: "module", target: m.id, count: 15, difficulty: "any", moduleIds: [], minutes: 0 })}
                    >
                      Start
                    </button>
                  ) : (
                    <Lock className="h-4 w-4 text-subtle" aria-label="Locked" />
                  )}
                </li>
              );
            })}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card id="weak-topics">
          <CardHeader
            title="Weak topics"
            action={
              wrong.length > 0 ? (
                <button type="button" className={buttonClass("primary", "sm")} onClick={() => start({ kind: "revision", count: Math.min(20, wrong.length), difficulty: "any", moduleIds: [], minutes: 0, questionIds: wrong.slice(0, 20) })}>
                  Retry {Math.min(20, wrong.length)} incorrect
                </button>
              ) : undefined
            }
          />
          {weak.length ? (
            <ul className="divide-y divide-border text-sm">
              {weak.map((w) => (
                <li key={w.lessonId} className="px-4 py-2.5">
                  <Link href={catalog.lessonUrl(w.lessonId)} className="hover:text-primary">
                    {catalog.lessonById.get(w.lessonId)?.title}
                  </Link>
                  <span className="block text-xs text-subtle">{w.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">No weak topics identified yet.</p>
          )}
        </Card>
        <Card>
          <CardHeader title="Score history" />
          {history.length ? (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface-2 text-xs text-subtle">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">Assessment</th>
                    <th scope="col" className="px-2 py-2 font-medium">Score</th>
                    <th scope="col" className="px-4 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="max-w-[220px] truncate px-4 py-2">{a.title}</td>
                      <td className="px-2 py-2 tabular-nums">
                        {a.score}/{a.total} ({a.percent}%)
                      </td>
                      <td className="px-4 py-2 text-xs text-subtle">{new Date(a.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-4 py-4 text-sm text-muted">No attempts yet. Lesson quizzes are at the end of each lesson.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

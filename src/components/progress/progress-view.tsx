"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, CheckCircle2, Circle, CircleDot, Lock, Star } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import {
  achievements,
  bestLessonQuiz,
  currentStreak,
  incorrectQuestionIds,
  lessonMastery,
  moduleProgress,
  staleLessons,
  weakTopics,
  type MasteryLevel,
} from "@/lib/progress";
import { encodeQuizConfig } from "@/lib/quiz";
import { useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

const MASTERY: Record<MasteryLevel, { label: string; cls: string; icon: typeof Circle }> = {
  "not-started": { label: "Not started", cls: "text-subtle", icon: Circle },
  learning: { label: "Learning", cls: "text-info", icon: CircleDot },
  practising: { label: "Practising", cls: "text-warning", icon: CircleDot },
  mastered: { label: "Mastered", cls: "text-success", icon: Star },
};

export function ProgressView() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const meta = useStoreMeta();
  const router = useRouter();
  if (!meta.hydrated) return <div className="h-64 animate-pulse rounded-lg bg-surface" aria-busy="true" />;

  const lessons = catalog.lessons;
  const completed = lessons.filter((l) => s.lessons[l.id]?.completedAt).length;
  const mastered = lessons.filter((l) => lessonMastery(s, l) === "mastered").length;
  const attempts = Object.values(s.exercises).reduce((n, e) => n + e.attempts, 0);
  const correct = Object.values(s.exercises).reduce((n, e) => n + e.correctCount, 0);
  const wrong = incorrectQuestionIds(s).filter((id) => catalog.questions[id]);
  const failedExercises = Object.entries(s.exercises).filter(([id, e]) => e.attempts > 0 && !e.lastCorrect && !catalog.questions[id]);
  const weak = weakTopics(catalog, s);
  const stale = staleLessons(catalog, s);
  const ach = achievements(catalog, s);
  const projectsDone = Object.values(s.projects).filter((p) => p.completedAt).length;

  const stats = [
    { label: "Lessons completed", value: `${completed}/${lessons.length}` },
    { label: "Lessons mastered", value: mastered },
    { label: "Exercise attempts", value: attempts },
    { label: "Correct answers", value: correct },
    { label: "Quizzes taken", value: s.quizAttempts.length },
    { label: "Projects completed", value: projectsDone },
    { label: "Notes", value: s.notes.length },
    { label: "Bookmarks", value: s.bookmarks.length },
  ];

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((x) => (
          <div key={x.label} className="rounded-lg border border-border bg-surface p-3">
            <dt className="text-xs text-subtle">{x.label}</dt>
            <dd className="text-xl font-semibold tabular-nums">{x.value}</dd>
          </div>
        ))}
      </dl>

      <Card id="revision">
        <CardHeader title="Revision mode" description="Prioritises incorrect answers, failed exercises, low-scoring topics and lessons you haven't reviewed for two weeks." />
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">1. Questions you answered incorrectly ({wrong.length})</h3>
            {wrong.length ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  router.push(
                    `/quizzes/run?${encodeQuizConfig({ kind: "revision", count: Math.min(20, wrong.length), difficulty: "any", moduleIds: [], minutes: 0, seed: Date.now().toString(36), questionIds: wrong.slice(0, 20) })}`,
                  )
                }
              >
                Start revision quiz ({Math.min(20, wrong.length)})
              </Button>
            ) : (
              <p className="text-sm text-muted">Nothing to revise. Incorrect answers will appear here.</p>
            )}
            <h3 className="mt-4 mb-2 text-sm font-semibold">2. Exercises not yet solved ({failedExercises.length})</h3>
            <ul className="space-y-1 text-sm">
              {failedExercises.slice(0, 6).map(([id]) => {
                const l = lessons.find((x) => x.practiceIds.includes(id) || x.challengeId === id || x.quizIds.includes(id));
                return l ? (
                  <li key={id}>
                    <Link href={`${catalog.lessonUrl(l.id)}#practice`} className="text-primary hover:underline">
                      {l.title}
                    </Link>
                  </li>
                ) : null;
              })}
              {!failedExercises.length && <li className="text-muted">None.</li>}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">3. Low-scoring topics ({weak.length})</h3>
            <ul className="space-y-1 text-sm">
              {weak.slice(0, 6).map((w) => (
                <li key={w.lessonId}>
                  <Link href={catalog.lessonUrl(w.lessonId)} className="text-primary hover:underline">
                    {catalog.lessonById.get(w.lessonId)?.title}
                  </Link>{" "}
                  <span className="text-xs text-subtle">{w.reason}</span>
                </li>
              ))}
              {!weak.length && <li className="text-muted">None.</li>}
            </ul>
            <h3 className="mt-4 mb-2 text-sm font-semibold">4. Not reviewed recently ({stale.length})</h3>
            <ul className="space-y-1 text-sm">
              {stale.slice(0, 6).map((l) => (
                <li key={l.id}>
                  <Link href={catalog.lessonUrl(l.id)} className="text-primary hover:underline">
                    {l.title}
                  </Link>
                </li>
              ))}
              {!stale.length && <li className="text-muted">None.</li>}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Topic breakdown"
          description={`Mastered = lesson completed + best lesson-quiz score ≥ ${s.settings.masteryThreshold}% + at least half the practice exercises solved. Change the threshold in Settings.`}
        />
        <div className="divide-y divide-border">
          {catalog.modules
            .filter((m) => m.lessons.length)
            .map((m) => {
              const p = moduleProgress(s, m);
              return (
                <details key={m.id} className="group">
                  <summary className="flex cursor-pointer items-center gap-3 px-4 py-3">
                    <span className="w-56 shrink-0 truncate text-sm font-medium sm:w-72">
                      {m.order}. {m.title}
                    </span>
                    <ProgressBar value={p.percent} label={`${m.title} completion`} />
                    <span className="w-12 shrink-0 text-right text-xs text-subtle tabular-nums">
                      {p.done}/{p.total}
                    </span>
                  </summary>
                  <ul className="grid gap-x-6 px-4 pb-3 sm:grid-cols-2">
                    {m.lessons.map((l) => {
                      const level = lessonMastery(s, l);
                      const M = MASTERY[level];
                      const quiz = bestLessonQuiz(s, l.id);
                      return (
                        <li key={l.id} className="flex items-center gap-2 py-1 text-sm">
                          <M.icon className={cn("h-3.5 w-3.5 shrink-0", M.cls)} aria-hidden />
                          <Link href={catalog.lessonUrl(l.id)} className="min-w-0 flex-1 truncate hover:text-primary">
                            {l.title}
                          </Link>
                          <span className={cn("shrink-0 text-xs", M.cls)}>{M.label}</span>
                          {quiz !== null && <span className="shrink-0 text-xs text-subtle tabular-nums">{quiz}%</span>}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
        </div>
      </Card>

      {s.settings.showAchievements && (
        <Card>
          <CardHeader title="Achievements" description={`Optional motivation. Current streak: ${currentStreak(s)} day(s). Breaks never remove earned achievements.`} />
          <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {ach.map((a) => (
              <li key={a.id} className={cn("flex gap-3 rounded-lg border p-3", a.earned ? "border-success/40 bg-success-soft" : "border-border")}>
                {a.earned ? <Award className="h-5 w-5 shrink-0 text-success" aria-hidden /> : <Lock className="h-5 w-5 shrink-0 text-subtle" aria-hidden />}
                <div>
                  <div className="text-sm font-semibold">
                    {a.title}
                    <span className="sr-only">{a.earned ? " (earned)" : " (not earned yet)"}</span>
                  </div>
                  <div className="text-xs text-muted">{a.description}</div>
                </div>
                {a.earned && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-success" aria-hidden />}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

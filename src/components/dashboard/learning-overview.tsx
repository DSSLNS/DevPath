"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, Clock, Flame, Target } from "lucide-react";
import { currentStreak } from "@/lib/progress";
import type { PersistedState } from "@/lib/store/schema";
import { todayKey } from "@/lib/store/store";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GoalDialog, goalLabel } from "@/components/goals/goal-picker";

export function formatMinutes(seconds: number) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function todaySeconds(s: PersistedState) {
  return s.timeLog[todayKey()] ?? 0;
}

/** Today's plan: goal progress when a goal is set, otherwise an optional, dismissible suggestion. Never shames missed days. */
export function TodayPlan() {
  const s = useLearnerState();
  const [goalOpen, setGoalOpen] = useState(false);
  const goal = s.settings.dailyGoalMinutes;
  const today = todaySeconds(s);
  const pct = goal ? Math.min(100, (today / 60 / goal) * 100) : 0;
  return (
    <Card className="p-5" data-testid="today-plan">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-subtle uppercase">
        <CalendarClock className="h-4 w-4" aria-hidden /> Today&apos;s learning
      </div>
      {goal > 0 ? (
        <>
          <p className="mt-2 text-sm">
            <strong className="tabular-nums">{formatMinutes(today)}</strong> of your {goalLabel(goal).replace(" per day", "")} goal today
          </p>
          <ProgressBar value={pct} label="Daily goal progress" tone={pct >= 100 ? "success" : "primary"} className="mt-2" />
          <p className="mt-2 text-xs text-muted">
            {pct >= 100 ? "Goal reached for today. Anything more is a bonus." : "Only active time on lessons and practice counts."}{" "}
            <Link href="/settings" className="text-primary hover:underline">
              Change goal
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm">
            <strong className="tabular-nums">{today ? formatMinutes(today) : "No time"}</strong> of active learning today.
          </p>
          {!s.settings.goalPromptSeen && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => setGoalOpen(true)} data-testid="set-goal">
                <Target className="h-3.5 w-3.5" aria-hidden /> Set a daily goal
              </Button>
              <Button size="sm" variant="ghost" onClick={() => learnerStore.updateSettings({ goalPromptSeen: true })}>
                No thanks
              </Button>
            </div>
          )}
        </>
      )}
      <GoalDialog open={goalOpen} onClose={() => setGoalOpen(false)} />
    </Card>
  );
}

export function ProgressOverview() {
  const s = useLearnerState();
  const completed = Object.values(s.lessons).filter((l) => l.completedAt).length;
  const attempts = s.quizAttempts.length;
  const avg = attempts ? Math.round(s.quizAttempts.reduce((n, a) => n + a.percent, 0) / attempts) : null;
  const challenges = Object.values(s.challenges).filter((c) => c.passed || c.selfReviewed).length;
  const solvedCode = Object.entries(s.exercises).filter(([id, e]) => e.correctCount > 0 && id.endsWith("-challenge")).length;
  const totalSeconds = Object.values(s.timeLog).reduce((n, x) => n + x, 0);
  const streak = currentStreak(s);
  const stats = [
    { label: "Lessons completed", value: String(completed) },
    { label: "Assessments taken", value: String(attempts) },
    { label: "Average score", value: avg === null ? "—" : `${avg}%` },
    { label: "Coding challenges solved", value: String(challenges + solvedCode) },
    { label: "Active learning time", value: totalSeconds ? formatMinutes(totalSeconds) : "—" },
  ];
  return (
    <Card>
      <CardHeader title="Progress overview" action={<Link href="/progress" className="text-xs text-primary hover:underline">Details</Link>} />
      <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3" data-testid="progress-overview">
        {stats.map((x) => (
          <div key={x.label} className="bg-surface px-4 py-3">
            <dt className="text-xs text-subtle">{x.label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{x.value}</dd>
          </div>
        ))}
        <div className="bg-surface px-4 py-3">
          <dt className="text-xs text-subtle">Learning streak</dt>
          <dd className="flex items-center gap-1 text-lg font-semibold tabular-nums">
            {s.settings.showAchievements && streak > 0 ? (
              <>
                <Flame className="h-4 w-4 text-warning" aria-hidden /> {streak} day{streak === 1 ? "" : "s"}
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
      <p className="flex items-center gap-1.5 px-4 py-2 text-xs text-subtle">
        <Clock className="h-3.5 w-3.5" aria-hidden /> Time counts only while you&apos;re actively working on lessons or practice.
        <Target className="ml-1 h-3.5 w-3.5" aria-hidden /> Scores are from saved assessment attempts.
      </p>
    </Card>
  );
}

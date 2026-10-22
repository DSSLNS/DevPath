"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Clock, Flame, Target } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { useAccount } from "@/lib/account";
import { startedTechnologies, technologyForLesson } from "@/lib/courses";
import { currentStreak } from "@/lib/progress";
import type { PersistedState } from "@/lib/store/schema";
import { todayKey } from "@/lib/store/store";
import { useLearnerState } from "@/lib/store/hooks";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { buttonClass } from "@/components/ui/button";
import { TechMonogram } from "@/components/courses/tech-card";
import { goalLabel } from "@/components/account/account-dialogs";

export function formatMinutes(seconds: number) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function todaySeconds(s: PersistedState) {
  return s.timeLog[todayKey()] ?? 0;
}

export function WelcomeHeader() {
  const account = useAccount();
  const catalog = useCatalog();
  const s = useLearnerState();
  const focus = s.lastLessonId ? technologyForLesson(catalog, s.lastLessonId) : undefined;
  const name = account.status === "signed-in" ? account.user.name.split(" ")[0] : null;
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{name ? `Welcome back, ${name}` : "Welcome back"}</h1>
      <p className="mt-1 text-sm text-muted">
        {focus ? (
          <>
            Current focus: <strong className="text-fg">{focus.name}</strong>. Pick up where you left off, or choose something new below.
          </>
        ) : (
          "Pick up where you left off and see what to study next."
        )}
        {account.status === "guest" && (
          <>
            {" "}
            Progress is saved in this browser.{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create a free account
            </Link>{" "}
            to keep it on every device.
          </>
        )}
      </p>
    </header>
  );
}

/** Today's plan: goal progress when a goal is set, otherwise a neutral nudge. Never shames missed days. */
export function TodayPlan({ nextHref, nextTitle }: { nextHref?: string; nextTitle?: string }) {
  const s = useLearnerState();
  const account = useAccount();
  const goal = s.settings.dailyGoalMinutes;
  const today = todaySeconds(s);
  const pct = goal ? Math.min(100, (today / 60 / goal) * 100) : 0;
  return (
    <Card className="p-5" data-testid="today-plan">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-subtle uppercase">
        <CalendarClock className="h-4 w-4" aria-hidden /> Today&apos;s learning plan
      </div>
      {goal > 0 ? (
        <>
          <p className="mt-2 text-sm">
            <strong className="tabular-nums">{formatMinutes(today)}</strong> of your {goalLabel(goal).replace(" per day", "")} goal today
          </p>
          <ProgressBar value={pct} label="Daily goal progress" tone={pct >= 100 ? "success" : "primary"} className="mt-2" />
          <p className="mt-2 text-xs text-muted">
            {pct >= 100 ? "Goal reached for today. Anything more is a bonus." : "Only active time on lessons and practice counts."}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Continue where you left off.{" "}
          {account.status === "signed-in" ? (
            <Link href="/account" className="text-primary hover:underline">
              Set a daily goal
            </Link>
          ) : (
            <Link href="/settings" className="text-primary hover:underline">
              Set an optional daily goal
            </Link>
          )}{" "}
          if a target helps you.
        </p>
      )}
      {nextHref && nextTitle && (
        <Link href={nextHref} className={`${buttonClass("secondary", "sm")} mt-3 max-w-full`}>
          <span className="truncate">Next: {nextTitle}</span> <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </Link>
      )}
    </Card>
  );
}

export function MyLearningPaths() {
  const catalog = useCatalog();
  const s = useLearnerState();
  const started = startedTechnologies(catalog, s);
  return (
    <Card>
      <CardHeader title="My learning paths" description="Technologies you've started" action={<Link href="/courses" className="text-xs text-primary hover:underline">All technologies</Link>} />
      {started.length ? (
        <ul className="divide-y divide-border">
          {started.map(({ tech, progress }) => (
            <li key={tech.id} className="flex items-center gap-3 px-4 py-3">
              <TechMonogram tech={tech} className="h-8 w-8 text-[10px]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Link href={`/courses/${tech.id}`} className="truncate text-sm font-medium hover:text-primary">
                    {tech.name}
                  </Link>
                  <span className="shrink-0 text-xs text-subtle tabular-nums">
                    {progress.completed}/{progress.total} lessons
                  </span>
                </div>
                <ProgressBar value={progress.percent} label={`${tech.name} progress`} className="mt-1.5" />
              </div>
              {progress.nextLessonId && (
                <Link href={catalog.lessonUrl(progress.nextLessonId)} className="shrink-0 text-xs text-primary hover:underline">
                  Continue
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-4 text-sm text-muted">Open a lesson in any technology and it will appear here.</p>
      )}
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

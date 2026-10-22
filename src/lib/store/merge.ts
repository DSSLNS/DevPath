/**
 * Deterministic merge of two learner states.
 *
 * Used when (a) a guest's browser progress is added to their account, and (b) two devices
 * saved concurrently and the server rejected the older revision. Progress is never lost:
 * completions, attempts and notes from either side survive. Counters that both sides may
 * share a common history for (attempt counts, active time) take the maximum instead of the
 * sum, so time and attempts are never inflated by a merge.
 *
 * Known limitation: deleting a bookmark or note on one device while another device edits
 * offline can resurrect the deleted item, because deletions are not recorded.
 */
import {
  type ChallengeProgress,
  type ExerciseProgress,
  type LessonProgress,
  type PersistedState,
  type ProjectProgress,
  type RecentItem,
} from "./schema";

const MAX_QUIZ_ATTEMPTS = 300;
const MAX_RECENT = 20;
const MAX_HISTORY = 20;

const minStr = (a?: string, b?: string) => (a === undefined ? b : b === undefined ? a : a < b ? a : b);
const maxStr = (a?: string, b?: string) => (a === undefined ? b : b === undefined ? a : a > b ? a : b);

function mergeRecord<T>(a: Record<string, T>, b: Record<string, T>, merge: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? merge(a[k], v) : v;
  return out;
}

function mergeLesson(a: LessonProgress, b: LessonProgress): LessonProgress {
  const later = a.lastOpenedAt >= b.lastOpenedAt ? a : b;
  const activeSeconds = Math.max(a.activeSeconds ?? 0, b.activeSeconds ?? 0);
  return {
    firstOpenedAt: minStr(a.firstOpenedAt, b.firstOpenedAt)!,
    lastOpenedAt: maxStr(a.lastOpenedAt, b.lastOpenedAt)!,
    completedAt: minStr(a.completedAt, b.completedAt),
    lastSection: later.lastSection ?? a.lastSection ?? b.lastSection,
    ...(activeSeconds ? { activeSeconds } : {}),
  };
}

function mergeExercise(a: ExerciseProgress, b: ExerciseProgress): ExerciseProgress {
  const later = a.lastAttemptAt >= b.lastAttemptAt ? a : b;
  const history = [...(a.history ?? []), ...(b.history ?? [])]
    .filter((h, i, all) => all.findIndex((x) => x.at === h.at && x.correct === h.correct) === i)
    .sort((x, y) => x.at.localeCompare(y.at))
    .slice(-MAX_HISTORY);
  return {
    attempts: Math.max(a.attempts, b.attempts),
    correctCount: Math.max(a.correctCount, b.correctCount),
    lastCorrect: later.lastCorrect,
    lastAttemptAt: later.lastAttemptAt,
    lastAnswer: later.lastAnswer ?? a.lastAnswer ?? b.lastAnswer,
    revealed: a.revealed || b.revealed || undefined,
    ...(history.length ? { history } : {}),
  };
}

function mergeChallenge(a: ChallengeProgress, b: ChallengeProgress): ChallengeProgress {
  const later = a.lastAttemptAt >= b.lastAttemptAt ? a : b;
  return {
    ...later,
    attempts: Math.max(a.attempts, b.attempts),
    passed: a.passed || b.passed,
    passedAt: minStr(a.passedAt, b.passedAt),
    selfReviewed: a.selfReviewed || b.selfReviewed || undefined,
    checklist: [...new Set([...(a.checklist ?? []), ...(b.checklist ?? [])])].sort((x, y) => x - y),
  };
}

function mergeProject(a: ProjectProgress, b: ProjectProgress): ProjectProgress {
  const steps: Record<string, boolean> = { ...a.steps };
  for (const [k, v] of Object.entries(b.steps)) steps[k] = steps[k] || v;
  return {
    startedAt: minStr(a.startedAt, b.startedAt)!,
    steps,
    checklist: [...new Set([...a.checklist, ...b.checklist])].sort((x, y) => x - y),
    completedAt: minStr(a.completedAt, b.completedAt),
  };
}

function unionBy<T>(items: T[], key: (x: T) => string, prefer: (x: T, y: T) => T): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    const k = key(item);
    const existing = map.get(k);
    map.set(k, existing ? prefer(existing, item) : item);
  }
  return [...map.values()];
}

export interface MergeOptions {
  /** Whose settings (theme, goal, …) win. Defaults to `base`. */
  settingsFrom?: "base" | "incoming";
}

export function mergeStates(base: PersistedState, incoming: PersistedState, { settingsFrom = "base" }: MergeOptions = {}): PersistedState {
  const recent = unionBy<RecentItem>([...base.recent, ...incoming.recent], (r) => `${r.type}:${r.id}`, (x, y) => (x.at >= y.at ? x : y))
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, MAX_RECENT);
  const lessons = mergeRecord(base.lessons, incoming.lessons, mergeLesson);
  const lastLesson = Object.entries(lessons).sort(([, x], [, y]) => y.lastOpenedAt.localeCompare(x.lastOpenedAt))[0]?.[0];
  const timeLog = { ...base.timeLog };
  for (const [day, secs] of Object.entries(incoming.timeLog)) timeLog[day] = Math.max(timeLog[day] ?? 0, secs);

  return {
    version: 1,
    lessons,
    exercises: mergeRecord(base.exercises, incoming.exercises, mergeExercise),
    quizAttempts: unionBy([...base.quizAttempts, ...incoming.quizAttempts], (q) => q.id, (x) => x)
      .sort((x, y) => x.completedAt.localeCompare(y.completedAt))
      .slice(-MAX_QUIZ_ATTEMPTS),
    lastLessonId: lastLesson ?? base.lastLessonId ?? incoming.lastLessonId,
    recent,
    bookmarks: unionBy([...base.bookmarks, ...incoming.bookmarks], (b) => `${b.contentType}:${b.contentId}`, (x, y) => (x.createdAt <= y.createdAt ? x : y)),
    notes: unionBy([...base.notes, ...incoming.notes], (n) => n.id, (x, y) => (x.updatedAt >= y.updatedAt ? x : y)),
    challenges: mergeRecord(base.challenges, incoming.challenges, mergeChallenge),
    projects: mergeRecord(base.projects, incoming.projects, mergeProject),
    activity: [...new Set([...base.activity, ...incoming.activity])].sort().slice(-400),
    timeLog,
    recentSearches: [...new Set([...base.recentSearches, ...incoming.recentSearches])].slice(0, 8),
    settings: settingsFrom === "base" ? base.settings : incoming.settings,
  };
}

/** True when a state contains learning progress worth offering to import (merely opening a lesson doesn't count). */
export function hasProgress(s: PersistedState) {
  return (
    Object.values(s.lessons).some((l) => l.completedAt) ||
    Object.values(s.exercises).some((e) => e.attempts > 0) ||
    s.quizAttempts.length > 0 ||
    s.notes.length > 0 ||
    s.bookmarks.length > 0 ||
    Object.keys(s.challenges).length > 0 ||
    Object.keys(s.projects).length > 0
  );
}

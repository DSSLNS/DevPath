/**
 * Progress computations. Pure functions of (content, persisted state) so the
 * rules are transparent and unit-testable. Rules are documented in the UI on
 * the Progress page.
 */
import type { CatalogApi } from "@/lib/catalog/context";
import type { CatalogLesson as Lesson, CatalogModule as Module } from "@/lib/catalog/types";
import type { PersistedState, QuizAttempt } from "@/lib/store/schema";
import { todayKey } from "@/lib/store/store";

export const isLessonComplete = (s: PersistedState, id: string) => !!s.lessons[id]?.completedAt;

export function moduleProgress(s: PersistedState, m: Module) {
  const done = m.lessons.filter((l) => isLessonComplete(s, l.id)).length;
  return { done, total: m.lessons.length, percent: m.lessons.length ? (done / m.lessons.length) * 100 : 0 };
}

export function pathModules(c: CatalogApi, pathId: string): Module[] {
  const path = c.paths.find((p) => p.id === pathId) ?? c.paths[0];
  return path.moduleIds.map((id) => c.moduleById.get(id)).filter((m): m is Module => !!m);
}

export function overallProgress(c: CatalogApi, s: PersistedState, pathId = s.settings.pathId) {
  const lessons = pathModules(c, pathId).flatMap((m) => m.lessons);
  const done = lessons.filter((l) => isLessonComplete(s, l.id)).length;
  return { done, total: lessons.length, percent: lessons.length ? (done / lessons.length) * 100 : 0 };
}

/** Best lesson-quiz percentage for a lesson, from lesson quiz attempts. */
export function bestLessonQuiz(s: PersistedState, lessonId: string): number | null {
  const attempts = s.quizAttempts.filter((a) => a.quizId === `lesson:${lessonId}`);
  if (!attempts.length) return null;
  return Math.max(...attempts.map((a) => a.percent));
}

/** Practice exercises (excluding quiz) answered correctly at least once. */
export function practiceStats(s: PersistedState, lesson: Lesson) {
  const ids = [...lesson.practiceIds, lesson.challengeId];
  const attempted = ids.filter((id) => (s.exercises[id]?.attempts ?? 0) > 0).length;
  const solved = ids.filter((id) => (s.exercises[id]?.correctCount ?? 0) > 0).length;
  return { attempted, solved, total: ids.length };
}

export type MasteryLevel = "not-started" | "learning" | "practising" | "mastered";

/**
 * Mastery rule (per lesson):
 *  - mastered:   lesson completed AND best lesson-quiz score >= threshold AND at least half the practice exercises solved
 *  - practising: lesson completed or any exercise attempted
 *  - learning:   lesson opened
 */
export function lessonMastery(s: PersistedState, lesson: Lesson): MasteryLevel {
  const opened = !!s.lessons[lesson.id];
  const completed = isLessonComplete(s, lesson.id);
  const quiz = bestLessonQuiz(s, lesson.id);
  const p = practiceStats(s, lesson);
  if (completed && quiz !== null && quiz >= s.settings.masteryThreshold && p.solved >= Math.ceil(p.total / 2)) return "mastered";
  if (completed || p.attempted > 0 || quiz !== null) return "practising";
  if (opened) return "learning";
  return "not-started";
}

/** Per-question correctness history across all quiz attempts and practice. */
function questionHistory(s: PersistedState) {
  const map = new Map<string, { correct: number; wrong: number; lastWrongAt?: string; lastCorrect: boolean }>();
  for (const a of s.quizAttempts) {
    for (const [qid, rec] of Object.entries(a.answers)) {
      const h = map.get(qid) ?? { correct: 0, wrong: 0, lastCorrect: false };
      if (rec.correct) h.correct++;
      else {
        h.wrong++;
        h.lastWrongAt = a.completedAt;
      }
      h.lastCorrect = rec.correct;
      map.set(qid, h);
    }
  }
  for (const [id, e] of Object.entries(s.exercises)) {
    if (!e.attempts) continue;
    const h = map.get(id) ?? { correct: 0, wrong: 0, lastCorrect: false };
    h.correct += e.correctCount;
    h.wrong += e.attempts - e.correctCount;
    h.lastCorrect = e.lastCorrect;
    map.set(id, h);
  }
  return map;
}

/** Question ids whose most recent answer was wrong. */
export function incorrectQuestionIds(s: PersistedState): string[] {
  const out: string[] = [];
  for (const [id, h] of questionHistory(s)) if (!h.lastCorrect && h.wrong > 0) out.push(id);
  return out;
}

export interface WeakTopic {
  lessonId: string;
  reason: string;
  score: number; // lower = weaker
}

/**
 * Weak topics: lessons with a best quiz score below the mastery threshold,
 * or with questions/exercises whose latest answer was wrong.
 */
export function weakTopics(c: CatalogApi, s: PersistedState): WeakTopic[] {
  const out = new Map<string, WeakTopic>();
  const threshold = s.settings.masteryThreshold;
  for (const l of c.lessons) {
    const best = bestLessonQuiz(s, l.id);
    if (best !== null && best < threshold) out.set(l.id, { lessonId: l.id, reason: `Best quiz score ${Math.round(best)}%`, score: best });
  }
  // Module/mixed assessment answers attribute mistakes to lessons.
  const wrongByLesson = new Map<string, number>();
  for (const qid of incorrectQuestionIds(s)) {
    const lessonId = c.questions[qid]?.lessonId ?? findLessonForExercise(c, qid);
    if (lessonId) wrongByLesson.set(lessonId, (wrongByLesson.get(lessonId) ?? 0) + 1);
  }
  for (const [lessonId, wrong] of wrongByLesson) {
    const prev = out.get(lessonId);
    const reason = `${wrong} question${wrong > 1 ? "s" : ""} answered incorrectly`;
    out.set(lessonId, prev ? { ...prev, reason: `${prev.reason}; ${reason}` } : { lessonId, reason, score: 60 - wrong * 5 });
  }
  return [...out.values()].sort((a, b) => a.score - b.score);
}

function findLessonForExercise(c: CatalogApi, id: string) {
  return c.lessons.find((l) => l.practiceIds.includes(id) || l.quizIds.includes(id) || l.challengeId === id)?.id;
}

/** Lessons completed more than `days` days ago and not reviewed since. */
export function staleLessons(c: CatalogApi, s: PersistedState, days = 14, now = new Date()) {
  const cutoff = now.getTime() - days * 86400000;
  return c.lessons.filter((l) => {
    const p = s.lessons[l.id];
    return p?.completedAt && new Date(p.lastOpenedAt).getTime() < cutoff;
  });
}

export function recommendedNextLesson(c: CatalogApi, s: PersistedState): Lesson | undefined {
  const lessons = pathModules(c, s.settings.pathId).flatMap((m) => m.lessons);
  return lessons.find((l) => !isLessonComplete(s, l.id));
}

/** Current streak of consecutive active days ending today or yesterday (breaks never "punish": streaks are optional). */
export function currentStreak(s: PersistedState, now = new Date()) {
  const days = new Set(s.activity);
  const d = new Date(now);
  if (!days.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(todayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ---------------------------------------------------------------- assessments

export interface AssessmentRule {
  unlocked: boolean;
  reason: string;
}

export const PROGRESSION = {
  /** % of a module's lessons that must be completed to take its module assessment. */
  moduleAssessmentMinPercent: 50,
  /** Completed lessons needed for mixed practice. */
  mixedMinLessons: 3,
  /** Completed modules needed for challenge mode and mock interviews. */
  challengeMinModules: 2,
  /** Passed module assessments needed for the final assessment. */
  finalMinModulesPassed: 4,
  passPercent: 70,
};

export function moduleAssessmentRule(s: PersistedState, m: Module): AssessmentRule {
  if (!m.lessons.length) return { unlocked: false, reason: "This module has no published lessons yet." };
  if (s.settings.unlockAll) return { unlocked: true, reason: "Unlocked in settings" };
  const p = moduleProgress(s, m);
  return p.percent >= PROGRESSION.moduleAssessmentMinPercent
    ? { unlocked: true, reason: `${p.done}/${p.total} lessons completed` }
    : {
        unlocked: false,
        reason: `Complete at least ${PROGRESSION.moduleAssessmentMinPercent}% of this module's lessons (${p.done}/${p.total} done).`,
      };
}

export function completedLessonIds(c: CatalogApi, s: PersistedState) {
  return Object.entries(s.lessons)
    .filter(([id, p]) => p.completedAt && c.lessonById.has(id))
    .map(([id]) => id);
}

export function completedModules(c: CatalogApi, s: PersistedState) {
  return c.modules.filter((m) => m.lessons.length > 0 && moduleProgress(s, m).done === m.lessons.length);
}

export function passedModuleAssessments(s: PersistedState) {
  const passed = new Set<string>();
  for (const a of s.quizAttempts) if (a.kind === "module" && a.percent >= PROGRESSION.passPercent) passed.add(a.quizId);
  return passed;
}

export function globalAssessmentRule(c: CatalogApi, s: PersistedState, kind: "mixed" | "challenge" | "interview" | "final"): AssessmentRule {
  if (s.settings.unlockAll) return { unlocked: true, reason: "Unlocked in settings" };
  if (kind === "mixed") {
    const n = completedLessonIds(c, s).length;
    return n >= PROGRESSION.mixedMinLessons
      ? { unlocked: true, reason: `Draws from your ${n} completed lessons` }
      : { unlocked: false, reason: `Complete ${PROGRESSION.mixedMinLessons} lessons first (${n} done).` };
  }
  if (kind === "challenge" || kind === "interview") {
    const n = completedModules(c, s).length;
    return n >= PROGRESSION.challengeMinModules
      ? { unlocked: true, reason: `${n} modules completed` }
      : { unlocked: false, reason: `Complete ${PROGRESSION.challengeMinModules} full modules first (${n} done).` };
  }
  const n = passedModuleAssessments(s).size;
  return n >= PROGRESSION.finalMinModulesPassed
    ? { unlocked: true, reason: `${n} module assessments passed` }
    : {
        unlocked: false,
        reason: `Pass ${PROGRESSION.finalMinModulesPassed} module assessments with ${PROGRESSION.passPercent}%+ first (${n} passed).`,
      };
}

// ---------------------------------------------------------------- achievements

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
}

export function achievements(c: CatalogApi, s: PersistedState): Achievement[] {
  const completed = completedLessonIds(c, s).length;
  const perfect = s.quizAttempts.some((a) => a.total >= 3 && a.percent === 100);
  const solvedChallenges = Object.values(s.challenges).filter((c) => c.passed || c.selfReviewed).length;
  const list: [string, string, string, boolean][] = [
    ["first-lesson", "First steps", "Complete your first lesson.", completed >= 1],
    ["ten-lessons", "Building momentum", "Complete 10 lessons.", completed >= 10],
    ["first-module", "Module finished", "Complete every lesson in a module.", completedModules(c, s).length >= 1],
    ["perfect-quiz", "Perfect score", "Score 100% on a quiz with at least 3 questions.", perfect],
    ["first-challenge", "Problem solver", "Solve a Practice Lab challenge.", solvedChallenges >= 1],
    ["five-challenges", "Practice habit", "Solve 5 Practice Lab challenges.", solvedChallenges >= 5],
    ["first-note", "Note taker", "Write your first personal note.", s.notes.length >= 1],
    ["first-project", "Builder", "Complete a guided project.", Object.values(s.projects).some((p) => p.completedAt)],
    ["streak-7", "Consistent", "Study on 7 consecutive days.", currentStreak(s) >= 7],
  ];
  return list.map(([id, title, description, earned]) => ({ id, title, description, earned }));
}

export function lastAttempts(s: PersistedState, n = 5): QuizAttempt[] {
  return [...s.quizAttempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, n);
}

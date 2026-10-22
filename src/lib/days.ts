/** Day-level progress for course roadmaps, derived from saved learner state. */
import type { CatalogApi } from "@/lib/catalog/context";
import type { PersistedState } from "@/lib/store/schema";

export function bestQuizPercent(s: PersistedState, quizId: string): number | null {
  const scores = s.quizAttempts.filter((a) => a.quizId === quizId).map((a) => a.percent);
  return scores.length ? Math.max(...scores) : null;
}

export interface DayStatus {
  published: number;
  completedLessons: number;
  /** Every published lesson of the day is marked complete. */
  complete: boolean;
  exercisesSolved: number;
  exercisesTotal: number;
  bestScore: number | null;
  activeSeconds: number;
  /** Lessons with a wrong latest answer in the day assessment or in their own practice. */
  toRevise: string[];
}

export function dayStatus(c: CatalogApi, s: PersistedState, lessonIds: string[], quizId: string): DayStatus {
  const lessons = lessonIds.map((id) => c.lessonById.get(id)).filter((l) => !!l);
  const completedLessons = lessons.filter((l) => s.lessons[l.id]?.completedAt).length;
  const practiceIds = lessons.flatMap((l) => [...l.practiceIds, l.challengeId]);
  const exercisesSolved = practiceIds.filter((id) => (s.exercises[id]?.correctCount ?? 0) > 0).length;

  const latest = s.quizAttempts.filter((a) => a.quizId === quizId).at(-1);
  const revise = new Set<string>();
  if (latest) {
    for (const [qid, rec] of Object.entries(latest.answers)) {
      const lessonId = c.questions[qid]?.lessonId;
      if (!rec.correct && lessonId) revise.add(lessonId);
    }
  }
  for (const l of lessons) {
    if (l.practiceIds.some((id) => s.exercises[id] && s.exercises[id].attempts > 0 && !s.exercises[id].lastCorrect)) revise.add(l.id);
  }

  return {
    published: lessons.length,
    completedLessons,
    complete: lessons.length > 0 && completedLessons === lessons.length,
    exercisesSolved,
    exercisesTotal: practiceIds.length,
    bestScore: bestQuizPercent(s, quizId),
    activeSeconds: lessons.reduce((n, l) => n + (s.lessons[l.id]?.activeSeconds ?? 0), 0),
    toRevise: [...revise],
  };
}

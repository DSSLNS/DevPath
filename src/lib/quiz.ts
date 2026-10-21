/**
 * Builds question sets for every assessment kind from the content question bank.
 */
import type { QuestionRef } from "@/content";
import type { CatalogApi } from "@/lib/catalog/context";
import type { Difficulty } from "@/content/types";
import type { PersistedState, QuizKind } from "@/lib/store/schema";
import { seededShuffle } from "@/lib/exercises/grade";
import { completedLessonIds, completedModules, incorrectQuestionIds } from "@/lib/progress";

export interface QuizConfig {
  kind: QuizKind;
  /** lesson id (lesson quiz) or module id (module assessment) */
  target?: string;
  count: number;
  difficulty: Difficulty | "any";
  /** Restrict to these module ids (empty = all eligible). */
  moduleIds: string[];
  /** Time limit in minutes; 0 = untimed. */
  minutes: number;
  /** Seed for deterministic question selection; new seed = new set. */
  seed: string;
  /** Explicit question ids (retry incorrect / revision). */
  questionIds?: string[];
}

export interface BuiltQuiz {
  quizId: string;
  title: string;
  questions: QuestionRef[];
  lessonIds: string[];
  /** Why this quiz could not be built, if empty. */
  emptyReason?: string;
}

const KIND_TITLES: Record<QuizKind, string> = {
  lesson: "Lesson quiz",
  module: "Module assessment",
  mixed: "Mixed practice",
  challenge: "Challenge mode",
  interview: "Mock interview",
  final: "Final assessment",
  revision: "Revision session",
};

export function quizTitle(c: CatalogApi, kind: QuizKind, target?: string) {
  if (kind === "lesson" && target) return `Quiz: ${c.lessonById.get(target)?.title ?? target}`;
  if (kind === "module" && target) return `Assessment: ${c.moduleById.get(target)?.title ?? target}`;
  return KIND_TITLES[kind];
}

export function buildQuiz(c: CatalogApi, questionBank: QuestionRef[], config: QuizConfig, state: PersistedState): BuiltQuiz {
  const { kind, target } = config;
  let pool: QuestionRef[] = [];
  let quizId: string = kind;

  if (config.questionIds?.length) {
    const ids = new Set(config.questionIds);
    pool = questionBank.filter((q) => ids.has(q.exercise.id));
    quizId = kind === "revision" ? "revision" : `${kind}${target ? `:${target}` : ""}`;
    return finish(c, pool, quizId, kind, target, config, false);
  }

  switch (kind) {
    case "lesson": {
      const ref = target ? c.lessonById.get(target) : undefined;
      if (!ref) return { quizId: "lesson", title: "Lesson quiz", questions: [], lessonIds: [], emptyReason: "Unknown lesson." };
      const quizIds = new Set(ref.quizIds);
      pool = questionBank.filter((q) => quizIds.has(q.exercise.id));
      quizId = `lesson:${target}`;
      return finish(c, pool, quizId, kind, target, { ...config, count: pool.length }, false);
    }
    case "module":
      pool = questionBank.filter((q) => q.moduleId === target);
      quizId = `module:${target}`;
      break;
    case "mixed": {
      const done = new Set(completedLessonIds(c, state));
      pool = questionBank.filter((q) => done.has(q.lessonId) || state.settings.unlockAll);
      break;
    }
    case "challenge": {
      const done = new Set(completedModules(c, state).map((m) => m.id));
      pool = questionBank.filter(
        (q) => (done.has(q.moduleId) || state.settings.unlockAll) && q.exercise.difficulty !== "beginner",
      );
      // Challenge mode favours multi-concept question types.
      pool = pool.filter((q) => ["predict-output", "multi-select", "order", "match", "mcq", "fill-blank"].includes(q.exercise.type));
      break;
    }
    case "interview":
      pool = questionBank.filter((q) =>
        ["predict-output", "mcq", "multi-select", "true-false"].includes(q.exercise.type) &&
        (state.settings.unlockAll || completedModules(c, state).some((m) => m.id === q.moduleId)),
      );
      break;
    case "final":
      pool = questionBank.filter((q) => c.moduleById.get(q.moduleId)?.path === "javascript");
      break;
    case "revision": {
      const wrong = new Set(incorrectQuestionIds(state));
      pool = questionBank.filter((q) => wrong.has(q.exercise.id));
      break;
    }
  }
  return finish(c, pool, quizId, kind, target, config, true);
}

function finish(
  c: CatalogApi,
  pool: QuestionRef[],
  quizId: string,
  kind: QuizKind,
  target: string | undefined,
  config: QuizConfig,
  applyFilters: boolean,
): BuiltQuiz {
  let filtered = pool;
  if (applyFilters) {
    if (config.difficulty !== "any") filtered = filtered.filter((q) => q.exercise.difficulty === config.difficulty);
    if (config.moduleIds.length) filtered = filtered.filter((q) => config.moduleIds.includes(q.moduleId));
  }
  let questions = applyFilters ? seededShuffle(filtered, config.seed) : filtered;
  if (kind === "final" || kind === "module") questions = spreadAcrossLessons(questions);
  questions = questions.slice(0, Math.max(1, config.count));
  const lessonIds = [...new Set(questions.map((q) => q.lessonId))];
  return {
    quizId,
    title: quizTitle(c, kind, target),
    questions,
    lessonIds,
    emptyReason: questions.length
      ? undefined
      : pool.length
        ? "No questions match these filters. Try a different difficulty or topic."
        : "There are no questions available for this assessment yet.",
  };
}

/** Round-robin by lesson so a short assessment covers many lessons rather than one. */
function spreadAcrossLessons(qs: QuestionRef[]) {
  const byLesson = new Map<string, QuestionRef[]>();
  for (const q of qs) byLesson.set(q.lessonId, [...(byLesson.get(q.lessonId) ?? []), q]);
  const queues = [...byLesson.values()];
  const out: QuestionRef[] = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
  return out;
}

export function encodeQuizConfig(c: QuizConfig) {
  const p = new URLSearchParams();
  p.set("kind", c.kind);
  if (c.target) p.set("target", c.target);
  p.set("count", String(c.count));
  if (c.difficulty !== "any") p.set("difficulty", c.difficulty);
  if (c.moduleIds.length) p.set("modules", c.moduleIds.join(","));
  if (c.minutes) p.set("minutes", String(c.minutes));
  p.set("seed", c.seed);
  if (c.questionIds?.length) p.set("q", c.questionIds.join(","));
  return p.toString();
}

const KINDS: QuizKind[] = ["lesson", "module", "mixed", "challenge", "interview", "final", "revision"];
export function decodeQuizConfig(p: URLSearchParams): QuizConfig | null {
  const kind = p.get("kind") as QuizKind | null;
  if (!kind || !KINDS.includes(kind)) return null;
  const count = Math.min(60, Math.max(1, Number(p.get("count")) || 10));
  const d = p.get("difficulty");
  return {
    kind,
    target: p.get("target") ?? undefined,
    count,
    difficulty: d === "beginner" || d === "intermediate" || d === "advanced" ? d : "any",
    moduleIds: (p.get("modules") ?? "").split(",").filter(Boolean),
    minutes: Math.min(120, Math.max(0, Number(p.get("minutes")) || 0)),
    seed: p.get("seed") ?? "default",
    questionIds: (p.get("q") ?? "").split(",").filter(Boolean),
  };
}

import { describe, expect, it } from "vitest";
import { getCatalog } from "@/lib/catalog/build";
import { makeCatalogApi } from "@/lib/catalog/context";
import {
  currentStreak,
  globalAssessmentRule,
  lessonMastery,
  moduleAssessmentRule,
  recommendedNextLesson,
  weakTopics,
} from "@/lib/progress";
import { buildQuiz, decodeQuizConfig, encodeQuizConfig } from "@/lib/quiz";
import { questionBank } from "@/content";
import { createDefaultState, type PersistedState } from "@/lib/store/schema";

const c = makeCatalogApi(getCatalog());
const map = c.lessonById.get("arrays-map")!;
const state = (patch: Partial<PersistedState> = {}): PersistedState => ({ ...createDefaultState(), ...patch });
const attempt = (quizId: string, percent: number, kind: "lesson" | "module" = "lesson") => ({
  id: quizId + percent, quizId, kind, title: "t", questionIds: [], answers: {}, score: 0, total: 4, percent,
  startedAt: "", completedAt: "2026-01-01", durationSec: 1, status: "completed" as const, lessonIds: [],
});

describe("mastery", () => {
  it("follows the documented rule", () => {
    expect(lessonMastery(state(), map)).toBe("not-started");
    expect(lessonMastery(state({ lessons: { [map.id]: { firstOpenedAt: "", lastOpenedAt: "" } } }), map)).toBe("learning");
    const solved = Object.fromEntries([...map.practiceIds, map.challengeId].map((id) => [id, { attempts: 1, correctCount: 1, lastCorrect: true, lastAttemptAt: "" }]));
    const done = { [map.id]: { firstOpenedAt: "", lastOpenedAt: "", completedAt: "x" } };
    expect(lessonMastery(state({ lessons: done, exercises: solved, quizAttempts: [attempt(`lesson:${map.id}`, 60)] }), map)).toBe("practising");
    expect(lessonMastery(state({ lessons: done, exercises: solved, quizAttempts: [attempt(`lesson:${map.id}`, 100)] }), map)).toBe("mastered");
  });
});

describe("weak topics and recommendations", () => {
  it("flags low quiz scores", () => {
    const w = weakTopics(c, state({ quizAttempts: [attempt(`lesson:${map.id}`, 25)] }));
    expect(w[0].lessonId).toBe(map.id);
  });
  it("recommends the first incomplete lesson of the path", () => {
    expect(recommendedNextLesson(c, state())?.id).toBe(c.lessons[0].id);
  });
});

describe("progression rules", () => {
  it("locks assessments until prerequisites are met", () => {
    const m = c.moduleById.get("m06")!;
    expect(moduleAssessmentRule(state(), m).unlocked).toBe(false);
    expect(globalAssessmentRule(c, state(), "final").unlocked).toBe(false);
    expect(globalAssessmentRule(c, state({ settings: { ...createDefaultState().settings, unlockAll: true } }), "final").unlocked).toBe(true);
    const lessons = Object.fromEntries(m.lessons.map((l) => [l.id, { firstOpenedAt: "", lastOpenedAt: "", completedAt: "x" }]));
    expect(moduleAssessmentRule(state({ lessons }), m).unlocked).toBe(true);
  });
});

describe("streaks", () => {
  it("counts consecutive days ending today or yesterday", () => {
    const now = new Date(2026, 9, 21);
    expect(currentStreak(state({ activity: ["2026-10-19", "2026-10-20"] }), now)).toBe(2);
    expect(currentStreak(state({ activity: ["2026-10-18"] }), now)).toBe(0);
  });
});

describe("quiz builder", () => {
  it("builds a lesson quiz from the lesson's questions", () => {
    const q = buildQuiz(c, questionBank, { kind: "lesson", target: map.id, count: 10, difficulty: "any", moduleIds: [], minutes: 0, seed: "s" }, state());
    expect(q.questions.map((x) => x.exercise.id)).toEqual(map.quizIds);
  });
  it("respects count, difficulty and is deterministic per seed", () => {
    const cfg = { kind: "final" as const, count: 5, difficulty: "beginner" as const, moduleIds: [], minutes: 0, seed: "abc" };
    const a = buildQuiz(c, questionBank, cfg, state());
    expect(a.questions).toHaveLength(5);
    expect(a.questions.every((q) => q.exercise.difficulty === "beginner")).toBe(true);
    expect(buildQuiz(c, questionBank, cfg, state()).questions.map((q) => q.exercise.id)).toEqual(a.questions.map((q) => q.exercise.id));
  });
  it("explains empty results", () => {
    const q = buildQuiz(c, questionBank, { kind: "mixed", count: 5, difficulty: "any", moduleIds: [], minutes: 0, seed: "s" }, state());
    expect(q.questions).toHaveLength(0);
    expect(q.emptyReason).toBeTruthy();
  });
  it("round-trips config through the URL and rejects bad input", () => {
    const cfg = { kind: "module" as const, target: "m06", count: 12, difficulty: "intermediate" as const, moduleIds: ["m06"], minutes: 10, seed: "x", questionIds: [] };
    expect(decodeQuizConfig(new URLSearchParams(encodeQuizConfig(cfg)))).toEqual(cfg);
    expect(decodeQuizConfig(new URLSearchParams("kind=hack"))).toBeNull();
    expect(decodeQuizConfig(new URLSearchParams("kind=mixed&count=9999"))?.count).toBe(60);
  });
});

import { describe, expect, it } from "vitest";
import { hasProgress, mergeStates } from "@/lib/store/merge";
import { createDefaultState, type PersistedState } from "@/lib/store/schema";

const state = (patch: Partial<PersistedState>): PersistedState => ({ ...createDefaultState(), ...patch });

describe("mergeStates", () => {
  it("keeps progress from both sides and never un-completes a lesson", () => {
    const a = state({ lessons: { x: { firstOpenedAt: "2026-01-02", lastOpenedAt: "2026-01-05", completedAt: "2026-01-05" } } });
    const b = state({
      lessons: {
        x: { firstOpenedAt: "2026-01-01", lastOpenedAt: "2026-01-09", lastSection: "syntax" },
        y: { firstOpenedAt: "2026-01-03", lastOpenedAt: "2026-01-03" },
      },
    });
    const m = mergeStates(a, b);
    expect(m.lessons.x).toEqual({ firstOpenedAt: "2026-01-01", lastOpenedAt: "2026-01-09", completedAt: "2026-01-05", lastSection: "syntax" });
    expect(Object.keys(m.lessons).sort()).toEqual(["x", "y"]);
    expect(m.lastLessonId).toBe("x");
  });

  it("does not inflate counters or time that both sides share", () => {
    const a = state({
      exercises: { e: { attempts: 3, correctCount: 1, lastCorrect: false, lastAttemptAt: "2026-01-02" } },
      timeLog: { "2026-01-02": 600 },
      lessons: { x: { firstOpenedAt: "1", lastOpenedAt: "1", activeSeconds: 300 } },
    });
    const b = state({
      exercises: { e: { attempts: 4, correctCount: 1, lastCorrect: true, lastAttemptAt: "2026-01-03" } },
      timeLog: { "2026-01-02": 420, "2026-01-03": 60 },
      lessons: { x: { firstOpenedAt: "1", lastOpenedAt: "1", activeSeconds: 500 } },
    });
    const m = mergeStates(a, b);
    expect(m.exercises.e).toMatchObject({ attempts: 4, correctCount: 1, lastCorrect: true, lastAttemptAt: "2026-01-03" });
    expect(m.timeLog).toEqual({ "2026-01-02": 600, "2026-01-03": 60 });
    expect(m.lessons.x.activeSeconds).toBe(500);
  });

  it("unions quiz attempts, notes and bookmarks without duplicates", () => {
    const attempt = { id: "q1", quizId: "lesson:x", kind: "lesson" as const, title: "Q", questionIds: [], answers: {}, score: 1, total: 1, percent: 100, startedAt: "1", completedAt: "1", durationSec: 1, status: "completed" as const, lessonIds: [] };
    const note = { id: "n1", title: "Old", content: "", tags: [], lessonIds: [], pinned: false, createdAt: "1", updatedAt: "1" };
    const a = state({ quizAttempts: [attempt], notes: [note], bookmarks: [{ id: "b1", contentType: "lesson", contentId: "x", createdAt: "2" }] });
    const b = state({
      quizAttempts: [attempt, { ...attempt, id: "q2", completedAt: "2" }],
      notes: [{ ...note, title: "New", updatedAt: "2" }],
      bookmarks: [{ id: "b9", contentType: "lesson", contentId: "x", createdAt: "1" }],
    });
    const m = mergeStates(a, b);
    expect(m.quizAttempts.map((q) => q.id)).toEqual(["q1", "q2"]);
    expect(m.notes).toHaveLength(1);
    expect(m.notes[0].title).toBe("New");
    expect(m.bookmarks).toEqual([{ id: "b9", contentType: "lesson", contentId: "x", createdAt: "1" }]);
  });

  it("takes settings from the requested side", () => {
    const a = state({ settings: { ...createDefaultState().settings, dailyGoalMinutes: 30 } });
    const b = state({ settings: { ...createDefaultState().settings, dailyGoalMinutes: 60 } });
    expect(mergeStates(a, b).settings.dailyGoalMinutes).toBe(30);
    expect(mergeStates(a, b, { settingsFrom: "incoming" }).settings.dailyGoalMinutes).toBe(60);
  });

  it("merges challenge and project progress monotonically", () => {
    const a = state({
      challenges: { c: { attempts: 2, passed: true, passedAt: "1", lastAttemptAt: "1" } },
      projects: { p: { startedAt: "2", steps: { s1: true }, checklist: [0] } },
    });
    const b = state({
      challenges: { c: { attempts: 5, passed: false, lastAttemptAt: "3", lastCode: "x" } },
      projects: { p: { startedAt: "1", steps: { s1: false, s2: true }, checklist: [2], completedAt: "4" } },
    });
    const m = mergeStates(a, b);
    expect(m.challenges.c).toMatchObject({ attempts: 5, passed: true, passedAt: "1", lastCode: "x" });
    expect(m.projects.p).toEqual({ startedAt: "1", steps: { s1: true, s2: true }, checklist: [0, 2], completedAt: "4" });
  });
});

describe("hasProgress", () => {
  it("ignores merely opened lessons and detects real progress", () => {
    expect(hasProgress(createDefaultState())).toBe(false);
    expect(hasProgress(state({ lessons: { x: { firstOpenedAt: "1", lastOpenedAt: "1" } } }))).toBe(false);
    expect(hasProgress(state({ lessons: { x: { firstOpenedAt: "1", lastOpenedAt: "1", completedAt: "1" } } }))).toBe(true);
  });
});

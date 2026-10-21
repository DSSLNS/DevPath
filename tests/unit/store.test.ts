import { describe, expect, it } from "vitest";
import { createDefaultState, parseState } from "@/lib/store/schema";
import { LearnerStore, memoryAdapter } from "@/lib/store/store";

describe("parseState", () => {
  it("returns defaults for empty storage without flagging recovery", () => {
    expect(parseState(null)).toEqual({ state: createDefaultState(), recovered: false });
  });
  it("recovers from invalid JSON and wrong versions", () => {
    expect(parseState("{oops").recovered).toBe(true);
    expect(parseState(JSON.stringify({ version: 99 })).recovered).toBe(true);
  });
  it("keeps valid entries and drops invalid ones", () => {
    const raw = JSON.stringify({
      ...createDefaultState(),
      lessons: { good: { firstOpenedAt: "x", lastOpenedAt: "y" }, bad: { nope: true } },
      notes: [{ id: "n", title: "t", content: "c", tags: ["a", 3], lessonIds: [], pinned: false, createdAt: "1", updatedAt: "1" }, { id: 4 }],
      settings: { theme: "neon", masteryThreshold: 5, editorFontSize: 16 },
    });
    const { state, recovered } = parseState(raw);
    expect(recovered).toBe(true);
    expect(Object.keys(state.lessons)).toEqual(["good"]);
    expect(state.notes).toHaveLength(1);
    expect(state.notes[0].tags).toEqual(["a"]);
    expect(state.settings.theme).toBe("system");
    expect(state.settings.masteryThreshold).toBe(80);
    expect(state.settings.editorFontSize).toBe(16);
  });
});

describe("LearnerStore", () => {
  const make = (initial: string | null = null) => {
    const adapter = memoryAdapter(initial);
    const store = new LearnerStore();
    store.hydrate(adapter);
    return { store, adapter };
  };

  it("persists lesson progress", () => {
    const { store, adapter } = make();
    store.openLesson("arrays-map");
    store.setLessonComplete("arrays-map", true);
    const again = new LearnerStore();
    again.hydrate(memoryAdapter(adapter.data));
    expect(again.getState().lessons["arrays-map"].completedAt).toBeTruthy();
    expect(again.getState().lastLessonId).toBe("arrays-map");
  });

  it("tracks attempts and correctness", () => {
    const { store } = make();
    store.recordExercise("ex", false, "a");
    store.recordExercise("ex", true, "b");
    const e = store.getState().exercises.ex;
    expect(e).toMatchObject({ attempts: 2, correctCount: 1, lastCorrect: true, lastAnswer: "b" });
    expect(e.history).toHaveLength(2);
  });

  it("ignores duplicate quiz submissions", () => {
    const { store } = make();
    const attempt = {
      id: "same", quizId: "q", kind: "lesson" as const, title: "t", questionIds: [], answers: {}, score: 1, total: 1, percent: 100,
      startedAt: "", completedAt: "", durationSec: 1, status: "completed" as const, lessonIds: [],
    };
    store.recordQuizAttempt(attempt);
    store.recordQuizAttempt(attempt);
    expect(store.getState().quizAttempts).toHaveLength(1);
  });

  it("toggles bookmarks", () => {
    const { store } = make();
    store.toggleBookmark("lesson", "x");
    expect(store.getState().bookmarks).toHaveLength(1);
    store.toggleBookmark("lesson", "x");
    expect(store.getState().bookmarks).toHaveLength(0);
  });

  it("creates, updates and deletes notes", () => {
    const { store } = make();
    const n = store.createNote({ title: "A" });
    store.updateNote(n.id, { content: "hello", pinned: true });
    expect(store.getState().notes[0]).toMatchObject({ content: "hello", pinned: true });
    store.deleteNote(n.id);
    expect(store.getState().notes).toHaveLength(0);
  });

  it("surfaces save failures instead of hiding them", () => {
    const store = new LearnerStore();
    store.hydrate({
      load: () => null,
      save: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });
    store.openLesson("x");
    expect(store.getMeta().saveStatus).toBe("error");
    expect(store.getMeta().saveError).toMatch(/full/);
    // In-memory state still updates so the session keeps working.
    expect(store.getState().lastLessonId).toBe("x");
  });

  it("flags unavailable storage", () => {
    const store = new LearnerStore();
    store.hydrate({ load: () => { throw new Error("blocked"); }, save: () => {} });
    expect(store.getMeta().storageUnavailable).toBe(true);
  });

  it("imports only valid backups and keeps settings on reset", () => {
    const { store } = make();
    expect(store.importData("not json").ok).toBe(false);
    store.updateSettings({ theme: "dark" });
    store.createNote();
    store.resetAll();
    expect(store.getState().notes).toHaveLength(0);
    expect(store.getState().settings.theme).toBe("dark");
    const backup = JSON.stringify({ ...createDefaultState(), lastLessonId: "arrays-map" });
    expect(store.importData(backup).ok).toBe(true);
    expect(store.getState().lastLessonId).toBe("arrays-map");
  });
});

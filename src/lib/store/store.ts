/**
 * Learner state store.
 *
 * - Persistence goes through a `StorageAdapter`, so the localStorage adapter used by
 *   the single-user MVP can later be swapped for an authenticated API/database adapter.
 * - Updates are immutable; subscribers are notified synchronously.
 * - Save failures (quota exceeded, storage disabled) are surfaced via `saveStatus`
 *   instead of being silently ignored.
 */
import {
  createDefaultState,
  parseState,
  type Bookmark,
  type BookmarkType,
  type ExerciseProgress,
  type PersistedState,
  type PersonalNote,
  type QuizAttempt,
  type RecentItem,
  type Settings,
} from "./schema";

export interface StorageAdapter {
  load(): string | null;
  save(serialized: string): void;
  /** Subscribe to changes made elsewhere (e.g. another tab). Returns an unsubscribe fn. */
  onExternalChange?(cb: (serialized: string | null) => void): () => void;
}

export const STORAGE_KEY = "jsacademy:state:v1";

export function localStorageAdapter(key = STORAGE_KEY): StorageAdapter {
  return {
    load: () => window.localStorage.getItem(key),
    save: (s) => window.localStorage.setItem(key, s),
    onExternalChange: (cb) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) cb(e.newValue);
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
}

export function memoryAdapter(initial: string | null = null): StorageAdapter & { data: string | null } {
  const a = {
    data: initial,
    load: () => a.data,
    save: (s: string) => {
      a.data = s;
    },
  };
  return a;
}

export type SaveStatus = "idle" | "saved" | "error";

export interface StoreMeta {
  saveStatus: SaveStatus;
  saveError?: string;
  /** Stored data was invalid and has been partially/fully reset. */
  recovered: boolean;
  /** Storage could not be read at all (e.g. disabled). */
  storageUnavailable: boolean;
  hydrated: boolean;
}

const MAX_QUIZ_ATTEMPTS = 300;
const MAX_RECENT = 20;
const MAX_HISTORY = 20;

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uid(prefix = "id") {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rnd}`;
}

export class LearnerStore {
  private state: PersistedState = createDefaultState();
  private meta: StoreMeta = { saveStatus: "idle", recovered: false, storageUnavailable: false, hydrated: false };
  private listeners = new Set<() => void>();
  private adapter: StorageAdapter | null = null;
  private unsubscribeExternal?: () => void;

  getState = () => this.state;
  getMeta = () => this.meta;

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  /** Load from storage. Safe to call once on the client. */
  hydrate(adapter: StorageAdapter) {
    this.adapter = adapter;
    let raw: string | null = null;
    let storageUnavailable = false;
    try {
      raw = adapter.load();
    } catch {
      storageUnavailable = true;
    }
    const { state, recovered } = parseState(raw);
    this.state = state;
    this.meta = { ...this.meta, recovered, storageUnavailable, hydrated: true };
    this.unsubscribeExternal?.();
    this.unsubscribeExternal = adapter.onExternalChange?.((serialized) => {
      const parsed = parseState(serialized);
      this.state = parsed.state;
      this.emit();
    });
    if (recovered) this.persist();
    this.emit();
  }

  dismissRecovered() {
    this.meta = { ...this.meta, recovered: false };
    this.emit();
  }

  private persist() {
    if (!this.adapter) return;
    try {
      this.adapter.save(JSON.stringify(this.state));
      this.meta = { ...this.meta, saveStatus: "saved", saveError: undefined };
    } catch (e) {
      const message =
        e instanceof Error && /quota/i.test(e.name + e.message)
          ? "Browser storage is full. Export your data and remove old notes."
          : "Your browser blocked saving. Progress will be lost when you close this tab.";
      this.meta = { ...this.meta, saveStatus: "error", saveError: message };
    }
  }

  private update(fn: (s: PersistedState) => PersistedState, { track = true } = {}) {
    let next = fn(this.state);
    if (track) {
      const day = todayKey();
      if (!next.activity.includes(day)) next = { ...next, activity: [...next.activity, day].slice(-400) };
    }
    this.state = next;
    this.persist();
    this.emit();
  }

  // ------------------------------------------------------------- lessons
  openLesson(lessonId: string) {
    const now = new Date().toISOString();
    this.update(
      (s) => ({
        ...s,
        lastLessonId: lessonId,
        lessons: {
          ...s.lessons,
          [lessonId]: { ...s.lessons[lessonId], firstOpenedAt: s.lessons[lessonId]?.firstOpenedAt ?? now, lastOpenedAt: now },
        },
        recent: pushRecent(s.recent, { type: "lesson", id: lessonId, at: now }),
      }),
      { track: false },
    );
  }

  setLessonSection(lessonId: string, sectionId: string) {
    const current = this.state.lessons[lessonId];
    if (!current || current.lastSection === sectionId) return;
    this.update((s) => ({ ...s, lessons: { ...s.lessons, [lessonId]: { ...current, lastSection: sectionId } } }), {
      track: false,
    });
  }

  setLessonComplete(lessonId: string, complete: boolean) {
    const now = new Date().toISOString();
    this.update((s) => {
      const prev = s.lessons[lessonId] ?? { firstOpenedAt: now, lastOpenedAt: now };
      return {
        ...s,
        lessons: { ...s.lessons, [lessonId]: { ...prev, completedAt: complete ? (prev.completedAt ?? now) : undefined } },
      };
    });
  }

  // ------------------------------------------------------------- exercises
  recordExercise(exerciseId: string, correct: boolean, answer: unknown) {
    const now = new Date().toISOString();
    this.update((s) => {
      const prev: ExerciseProgress | undefined = s.exercises[exerciseId];
      return {
        ...s,
        exercises: {
          ...s.exercises,
          [exerciseId]: {
            attempts: (prev?.attempts ?? 0) + 1,
            correctCount: (prev?.correctCount ?? 0) + (correct ? 1 : 0),
            lastCorrect: correct,
            lastAttemptAt: now,
            lastAnswer: answer,
            revealed: prev?.revealed,
            history: [...(prev?.history ?? []), { at: now, correct }].slice(-MAX_HISTORY),
          },
        },
      };
    });
  }

  saveExerciseDraft(exerciseId: string, answer: unknown) {
    this.update(
      (s) => {
        const prev = s.exercises[exerciseId];
        const base: ExerciseProgress = prev ?? { attempts: 0, correctCount: 0, lastCorrect: false, lastAttemptAt: "" };
        return { ...s, exercises: { ...s.exercises, [exerciseId]: { ...base, lastAnswer: answer } } };
      },
      { track: false },
    );
  }

  revealSolution(exerciseId: string) {
    this.update((s) => {
      const prev = s.exercises[exerciseId] ?? { attempts: 0, correctCount: 0, lastCorrect: false, lastAttemptAt: "" };
      return { ...s, exercises: { ...s.exercises, [exerciseId]: { ...prev, revealed: true } } };
    });
  }

  resetExercise(exerciseId: string) {
    this.update(
      (s) => {
        const prev = s.exercises[exerciseId];
        if (!prev) return s;
        return { ...s, exercises: { ...s.exercises, [exerciseId]: { ...prev, lastAnswer: undefined } } };
      },
      { track: false },
    );
  }

  // ------------------------------------------------------------- quizzes
  recordQuizAttempt(attempt: QuizAttempt) {
    this.update((s) => {
      // Duplicate submissions of the same attempt are ignored.
      if (s.quizAttempts.some((a) => a.id === attempt.id)) return s;
      return { ...s, quizAttempts: [...s.quizAttempts, attempt].slice(-MAX_QUIZ_ATTEMPTS) };
    });
  }

  // ------------------------------------------------------------- bookmarks
  toggleBookmark(contentType: BookmarkType, contentId: string) {
    this.update(
      (s) => {
        const existing = s.bookmarks.find((b) => b.contentType === contentType && b.contentId === contentId);
        if (existing) return { ...s, bookmarks: s.bookmarks.filter((b) => b !== existing) };
        const bm: Bookmark = { id: uid("bm"), contentType, contentId, createdAt: new Date().toISOString() };
        return { ...s, bookmarks: [bm, ...s.bookmarks] };
      },
      { track: false },
    );
  }

  removeBookmark(id: string) {
    this.update((s) => ({ ...s, bookmarks: s.bookmarks.filter((b) => b.id !== id) }), { track: false });
  }

  // ------------------------------------------------------------- notes
  createNote(partial: Partial<Pick<PersonalNote, "title" | "content" | "tags" | "lessonIds">> = {}): PersonalNote {
    const now = new Date().toISOString();
    const note: PersonalNote = {
      id: uid("note"),
      title: partial.title ?? "Untitled note",
      content: partial.content ?? "",
      tags: partial.tags ?? [],
      lessonIds: partial.lessonIds ?? [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    this.update((s) => ({ ...s, notes: [note, ...s.notes] }));
    return note;
  }

  updateNote(id: string, patch: Partial<Omit<PersonalNote, "id" | "createdAt">>) {
    this.update((s) => ({
      ...s,
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
    }));
  }

  deleteNote(id: string) {
    this.update(
      (s) => ({
        ...s,
        notes: s.notes.filter((n) => n.id !== id),
      }),
      { track: false },
    );
  }

  // ------------------------------------------------------------- challenges & projects
  recordChallenge(id: string, passed: boolean, code: string) {
    const now = new Date().toISOString();
    this.update((s) => {
      const prev = s.challenges[id];
      return {
        ...s,
        challenges: {
          ...s.challenges,
          [id]: {
            ...prev,
            attempts: (prev?.attempts ?? 0) + 1,
            passed: (prev?.passed ?? false) || passed,
            passedAt: prev?.passedAt ?? (passed ? now : undefined),
            lastAttemptAt: now,
            lastCode: code,
          },
        },
      };
    });
  }

  saveChallengeDraft(id: string, code: string) {
    this.update(
      (s) => {
        const prev = s.challenges[id] ?? { attempts: 0, passed: false, lastAttemptAt: "" };
        return { ...s, challenges: { ...s.challenges, [id]: { ...prev, lastCode: code } } };
      },
      { track: false },
    );
  }

  setChallengeChecklist(id: string, checklist: number[], selfReviewed: boolean) {
    const now = new Date().toISOString();
    this.update((s) => {
      const prev = s.challenges[id] ?? { attempts: 0, passed: false, lastAttemptAt: now };
      return {
        ...s,
        challenges: {
          ...s.challenges,
          [id]: { ...prev, checklist, selfReviewed, passedAt: selfReviewed ? (prev.passedAt ?? now) : prev.passedAt },
        },
      };
    });
  }

  toggleProjectStep(projectId: string, stepId: string) {
    const now = new Date().toISOString();
    this.update((s) => {
      const prev = s.projects[projectId] ?? { startedAt: now, steps: {}, checklist: [] };
      return { ...s, projects: { ...s.projects, [projectId]: { ...prev, steps: { ...prev.steps, [stepId]: !prev.steps[stepId] } } } };
    });
  }

  toggleProjectChecklist(projectId: string, index: number) {
    const now = new Date().toISOString();
    this.update((s) => {
      const prev = s.projects[projectId] ?? { startedAt: now, steps: {}, checklist: [] };
      const checklist = prev.checklist.includes(index) ? prev.checklist.filter((i) => i !== index) : [...prev.checklist, index];
      return { ...s, projects: { ...s.projects, [projectId]: { ...prev, checklist } } };
    });
  }

  setProjectComplete(projectId: string, complete: boolean) {
    const now = new Date().toISOString();
    this.update((s) => {
      const prev = s.projects[projectId] ?? { startedAt: now, steps: {}, checklist: [] };
      return { ...s, projects: { ...s.projects, [projectId]: { ...prev, completedAt: complete ? now : undefined } } };
    });
  }

  // ------------------------------------------------------------- time
  /** Adds active learning time to today and (optionally) to a lesson. Called by the activity tracker. */
  addActiveTime(seconds: number, lessonId?: string) {
    const secs = Math.round(seconds);
    if (secs <= 0) return;
    const day = todayKey();
    this.update((s) => {
      const timeLog = { ...s.timeLog, [day]: Math.min(86400, (s.timeLog[day] ?? 0) + secs) };
      const lesson = lessonId ? s.lessons[lessonId] : undefined;
      return {
        ...s,
        timeLog,
        lessons: lesson && lessonId ? { ...s.lessons, [lessonId]: { ...lesson, activeSeconds: (lesson.activeSeconds ?? 0) + secs } } : s.lessons,
      };
    });
  }

  // ------------------------------------------------------------- misc
  visit(item: Omit<RecentItem, "at">) {
    this.update((s) => ({ ...s, recent: pushRecent(s.recent, { ...item, at: new Date().toISOString() }) }), { track: false });
  }

  addRecentSearch(q: string) {
    const query = q.trim();
    if (!query) return;
    this.update(
      (s) => ({ ...s, recentSearches: [query, ...s.recentSearches.filter((x) => x !== query)].slice(0, 8) }),
      { track: false },
    );
  }

  updateSettings(patch: Partial<Settings>) {
    this.update((s) => ({ ...s, settings: { ...s.settings, ...patch } }), { track: false });
  }

  exportData() {
    return JSON.stringify(this.state, null, 2);
  }

  /** Import a previously exported file. Returns false if the file is not valid. */
  importData(serialized: string): { ok: boolean; recovered: boolean } {
    const { state, recovered } = parseState(serialized);
    let ok = false;
    try {
      ok = (JSON.parse(serialized) as { version?: unknown }).version === 1;
    } catch {
      ok = false;
    }
    if (!ok) return { ok: false, recovered: false };
    this.update(() => state, { track: false });
    return { ok: true, recovered };
  }

  resetAll() {
    const settings = this.state.settings;
    this.update(() => ({ ...createDefaultState(), settings }), { track: false });
  }
}

function pushRecent(list: RecentItem[], item: RecentItem) {
  return [item, ...list.filter((r) => !(r.type === item.type && r.id === item.id))].slice(0, MAX_RECENT);
}

export const learnerStore = new LearnerStore();

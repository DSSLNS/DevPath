/**
 * Persisted learner state. Everything the learner does is stored here.
 * The schema is versioned and validated on load; invalid pieces are dropped
 * rather than crashing the app.
 */

export type ThemePreference = "system" | "light" | "dark";
export type BookmarkType = "lesson" | "kb" | "challenge" | "project" | "glossary" | "note";

export interface LessonProgress {
  firstOpenedAt: string;
  lastOpenedAt: string;
  completedAt?: string;
  /** Last section the learner was reading (anchor id), restored by Continue Learning. */
  lastSection?: string;
  /** Seconds of active engagement (page visible and recently interacted with). */
  activeSeconds?: number;
}

export interface ExerciseProgress {
  attempts: number;
  correctCount: number;
  lastCorrect: boolean;
  lastAttemptAt: string;
  /** Learner's most recent answer (e.g. code draft) for restoring and review. */
  lastAnswer?: unknown;
  /** True once the learner chose to reveal the solution. */
  revealed?: boolean;
  /** Attempt history (capped). */
  history?: { at: string; correct: boolean }[];
}

export interface QuizAnswerRecord {
  answer: unknown;
  correct: boolean;
}

export type QuizKind = "lesson" | "module" | "day" | "mixed" | "challenge" | "interview" | "final" | "revision";

export interface QuizAttempt {
  id: string;
  quizId: string;
  kind: QuizKind;
  title: string;
  questionIds: string[];
  answers: Record<string, QuizAnswerRecord>;
  score: number;
  total: number;
  percent: number;
  startedAt: string;
  completedAt: string;
  durationSec: number;
  status: "completed" | "timed-out";
  /** Lesson ids covered — used for weak-topic detection. */
  lessonIds: string[];
}

export interface Bookmark {
  id: string;
  contentType: BookmarkType;
  contentId: string;
  createdAt: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lessonIds: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeProgress {
  attempts: number;
  passed: boolean;
  lastAttemptAt: string;
  passedAt?: string;
  lastCode?: string;
  /** For manual-review challenges: checklist items the learner ticked. */
  checklist?: number[];
  selfReviewed?: boolean;
}

export interface ProjectProgress {
  startedAt: string;
  steps: Record<string, boolean>;
  checklist: number[];
  completedAt?: string;
}

export interface RecentItem {
  type: "lesson" | "kb" | "challenge" | "project";
  id: string;
  at: string;
}

export interface Settings {
  theme: ThemePreference;
  editorFontSize: number;
  /** Quiz percentage needed for a lesson/module to count as mastered. */
  masteryThreshold: number;
  showAchievements: boolean;
  /** Skip progression rules for assessments. */
  unlockAll: boolean;
  pathId: string;
  codeTimeoutMs: number;
  /** Optional daily learning goal in minutes; 0 means no goal. */
  dailyGoalMinutes: number;
  /** The learner has answered or dismissed the "What is your learning goal?" prompt. */
  goalPromptSeen: boolean;
}

export interface PersistedState {
  version: 1;
  lessons: Record<string, LessonProgress>;
  exercises: Record<string, ExerciseProgress>;
  quizAttempts: QuizAttempt[];
  lastLessonId?: string;
  recent: RecentItem[];
  bookmarks: Bookmark[];
  notes: PersonalNote[];
  challenges: Record<string, ChallengeProgress>;
  projects: Record<string, ProjectProgress>;
  /** Local calendar days (YYYY-MM-DD) with learning activity. */
  activity: string[];
  /** Active learning seconds per local calendar day (YYYY-MM-DD). */
  timeLog: Record<string, number>;
  recentSearches: string[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  editorFontSize: 14,
  masteryThreshold: 80,
  showAchievements: true,
  unlockAll: false,
  pathId: "javascript",
  codeTimeoutMs: 5000,
  dailyGoalMinutes: 0,
  goalPromptSeen: false,
};

export const MAX_GOAL_MINUTES = 600;

/** Career-path ids from an earlier release, mapped so saved settings keep pointing at the same path. */
const LEGACY_PATH_IDS: Record<string, string> = {
  "frontend-developer": "frontend",
  "backend-developer": "backend",
  "fullstack-developer": "fullstack",
  "test-automation-engineer": "testing",
};

export function createDefaultState(): PersistedState {
  return {
    version: 1,
    lessons: {},
    exercises: {},
    quizAttempts: [],
    recent: [],
    bookmarks: [],
    notes: [],
    challenges: {},
    projects: {},
    activity: [],
    timeLog: {},
    recentSearches: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

// --------------------------------------------------------------- validation

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isStr) : []);

function record<T>(v: unknown, check: (x: unknown) => x is T): { value: Record<string, T>; dropped: number } {
  const out: Record<string, T> = {};
  let dropped = 0;
  if (!isObj(v)) return { value: out, dropped: v === undefined ? 0 : 1 };
  for (const [k, x] of Object.entries(v)) {
    if (check(x)) out[k] = x;
    else dropped++;
  }
  return { value: out, dropped };
}

function list<T>(v: unknown, check: (x: unknown) => x is T): { value: T[]; dropped: number } {
  if (!Array.isArray(v)) return { value: [], dropped: v === undefined ? 0 : 1 };
  const value = v.filter(check);
  return { value, dropped: v.length - value.length };
}

const isLessonProgress = (x: unknown): x is LessonProgress =>
  isObj(x) &&
  isStr(x.firstOpenedAt) &&
  isStr(x.lastOpenedAt) &&
  (x.completedAt === undefined || isStr(x.completedAt)) &&
  (x.activeSeconds === undefined || (isNum(x.activeSeconds) && x.activeSeconds >= 0));

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

function parseTimeLog(v: unknown): Record<string, number> {
  if (!isObj(v)) return {};
  const entries = Object.entries(v).filter(([k, n]) => DAY_KEY.test(k) && isNum(n) && n >= 0 && n <= 86400);
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)).slice(-400)) as Record<string, number>;
}

const isExerciseProgress = (x: unknown): x is ExerciseProgress =>
  isObj(x) && isNum(x.attempts) && isNum(x.correctCount) && isBool(x.lastCorrect) && isStr(x.lastAttemptAt);

const isQuizAttempt = (x: unknown): x is QuizAttempt =>
  isObj(x) &&
  isStr(x.id) &&
  isStr(x.quizId) &&
  isStr(x.kind) &&
  isStr(x.title) &&
  Array.isArray(x.questionIds) &&
  isObj(x.answers) &&
  isNum(x.score) &&
  isNum(x.total) &&
  isNum(x.percent) &&
  isStr(x.completedAt) &&
  Array.isArray(x.lessonIds);

const isBookmark = (x: unknown): x is Bookmark =>
  isObj(x) && isStr(x.id) && isStr(x.contentType) && isStr(x.contentId) && isStr(x.createdAt);

const isNote = (x: unknown): x is PersonalNote =>
  isObj(x) &&
  isStr(x.id) &&
  isStr(x.title) &&
  isStr(x.content) &&
  Array.isArray(x.tags) &&
  Array.isArray(x.lessonIds) &&
  isBool(x.pinned) &&
  isStr(x.createdAt) &&
  isStr(x.updatedAt);

const isChallengeProgress = (x: unknown): x is ChallengeProgress =>
  isObj(x) && isNum(x.attempts) && isBool(x.passed) && isStr(x.lastAttemptAt);

const isProjectProgress = (x: unknown): x is ProjectProgress =>
  isObj(x) && isStr(x.startedAt) && isObj(x.steps) && Array.isArray(x.checklist);

const isRecent = (x: unknown): x is RecentItem => isObj(x) && isStr(x.type) && isStr(x.id) && isStr(x.at);

function parseSettings(v: unknown): Settings {
  const s = { ...DEFAULT_SETTINGS };
  if (!isObj(v)) return s;
  if (v.theme === "light" || v.theme === "dark" || v.theme === "system") s.theme = v.theme;
  if (isNum(v.editorFontSize) && v.editorFontSize >= 11 && v.editorFontSize <= 22) s.editorFontSize = v.editorFontSize;
  if (isNum(v.masteryThreshold) && v.masteryThreshold >= 50 && v.masteryThreshold <= 100) s.masteryThreshold = v.masteryThreshold;
  if (isBool(v.showAchievements)) s.showAchievements = v.showAchievements;
  if (isBool(v.unlockAll)) s.unlockAll = v.unlockAll;
  if (isStr(v.pathId)) s.pathId = LEGACY_PATH_IDS[v.pathId] ?? v.pathId;
  if (isNum(v.codeTimeoutMs) && v.codeTimeoutMs >= 1000 && v.codeTimeoutMs <= 20000) s.codeTimeoutMs = v.codeTimeoutMs;
  if (isNum(v.dailyGoalMinutes) && Number.isInteger(v.dailyGoalMinutes) && v.dailyGoalMinutes >= 0 && v.dailyGoalMinutes <= MAX_GOAL_MINUTES)
    s.dailyGoalMinutes = v.dailyGoalMinutes;
  if (isBool(v.goalPromptSeen)) s.goalPromptSeen = v.goalPromptSeen;
  return s;
}

export interface ParseResult {
  state: PersistedState;
  /** True when stored data was present but partially or wholly invalid. */
  recovered: boolean;
}

export function parseState(raw: string | null): ParseResult {
  if (raw === null || raw === "") return { state: createDefaultState(), recovered: false };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { state: createDefaultState(), recovered: true };
  }
  if (!isObj(data) || data.version !== 1) return { state: createDefaultState(), recovered: true };

  let dropped = 0;
  const take = <T>(r: { value: T; dropped: number }) => {
    dropped += r.dropped;
    return r.value;
  };
  const state: PersistedState = {
    version: 1,
    lessons: take(record(data.lessons, isLessonProgress)),
    exercises: take(record(data.exercises, isExerciseProgress)),
    quizAttempts: take(list(data.quizAttempts, isQuizAttempt)),
    lastLessonId: isStr(data.lastLessonId) ? data.lastLessonId : undefined,
    recent: take(list(data.recent, isRecent)),
    bookmarks: take(list(data.bookmarks, isBookmark)),
    notes: take(list(data.notes, isNote)).map((n) => ({ ...n, tags: strArray(n.tags), lessonIds: strArray(n.lessonIds) })),
    challenges: take(record(data.challenges, isChallengeProgress)),
    projects: take(record(data.projects, isProjectProgress)),
    activity: strArray(data.activity).filter((d) => DAY_KEY.test(d)),
    timeLog: parseTimeLog(data.timeLog),
    recentSearches: strArray(data.recentSearches).slice(0, 8),
    settings: parseSettings(data.settings),
  };
  return { state, recovered: dropped > 0 };
}

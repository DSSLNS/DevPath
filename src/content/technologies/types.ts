import type { Difficulty, KbCategory, Reference } from "@/content/types";

export type TechCategoryId = "fundamentals" | "frontend" | "backend" | "databases" | "testing" | "tools" | "web-platform";

export interface TechCategory {
  id: TechCategoryId;
  title: string;
  description: string;
}

/**
 * How learners can practise a technology inside DevPath. The UI states this plainly so a
 * static example is never presented as if it had run.
 */
export type PracticeMode =
  /** Code runs in the in-browser sandbox (JavaScript, DOM, HTML/CSS previews). */
  | "sandbox"
  /** Exercises are guided: expected output, local setup steps and self-review checklists. */
  | "guided";

export interface Technology {
  /** URL slug, e.g. "javascript". Stable: progress and paths reference it. */
  id: string;
  name: string;
  category: TechCategoryId;
  /** Short monogram shown on the card, e.g. "JS". No third-party logos. */
  badge: string;
  description: string;
  /** Level the course starts at. */
  level: Difficulty;
  /** Curriculum modules (in order) that make up this technology's course. Empty = no lessons yet. */
  moduleIds: string[];
  /** Knowledge-base category with reference notes for this technology, if any. */
  kbCategory?: KbCategory;
  /** Technology ids worth knowing first. Advice, never a lock. */
  prerequisites: string[];
  /** Topics the curriculum covers (shown as the planned outline when lessons are not written yet). */
  outline: string[];
  practice: { mode: PracticeMode; note: string };
  docs: Reference[];
  /** Explicit day groupings (lesson ids per day); otherwise lessons are grouped automatically. */
  dayPlan?: { title: string; lessonIds: string[]; objective: string }[];
}

export interface RoadmapDay {
  /** 1-based day number within the course. */
  day: number;
  kind: "learn" | "review";
  title: string;
  objective: string;
  /** Lessons taught this day (learn) or revised and assessed (review). */
  lessonIds: string[];
  /** Estimated minutes, including practice and the day assessment. */
  minutes: number;
  /** True when the estimate includes lessons that are not written yet. */
  estimated: boolean;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  days: RoadmapDay[];
}

export interface CourseSummary {
  techId: string;
  weeks: RoadmapWeek[];
  totalDays: number;
  totalMinutes: number;
  publishedLessons: number;
  plannedLessons: number;
  estimated: boolean;
}

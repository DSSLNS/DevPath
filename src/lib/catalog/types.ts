import type { ChallengeTopic, Difficulty, ExerciseType, KbCategory, LearningPath, Tech } from "@/content/types";
import type { PracticeMode, TechCategory, TechCategoryId } from "@/content/technologies/types";

export interface CatalogLesson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  minutes: number;
  moduleId: string;
  moduleSlug: string;
  index: number;
  optional?: boolean;
  tags: string[];
  practiceIds: string[];
  quizIds: string[];
  challengeId: string;
}

export interface CatalogModule {
  id: string;
  slug: string;
  order: number;
  title: string;
  description: string;
  path: string;
  optional?: boolean;
  prerequisites: string[];
  lessons: CatalogLesson[];
  /** Manifest lessons not written yet (shown as "planned", never as clickable lessons). */
  planned: { slug: string; title: string }[];
}

export interface CatalogQuestionMeta {
  lessonId: string;
  moduleId: string;
  type: ExerciseType;
  difficulty: Difficulty;
}

/** "available": has published lessons. "notes": reference notes only. "planned": outline only. */
export type TechStatus = "available" | "notes" | "planned";

export interface CatalogTechnology {
  id: string;
  name: string;
  category: TechCategoryId;
  badge: string;
  description: string;
  level: Difficulty;
  status: TechStatus;
  moduleIds: string[];
  /** Published lesson ids in course order. */
  lessonIds: string[];
  plannedLessons: number;
  totalDays: number;
  totalMinutes: number;
  /** Duration includes estimates for lessons that are not written yet. */
  estimated: boolean;
  kbCategory?: KbCategory;
  kbNotes: number;
  practiceMode: PracticeMode;
  prerequisites: string[];
}

export interface Catalog {
  technologies: CatalogTechnology[];
  categories: TechCategory[];
  modules: CatalogModule[];
  paths: LearningPath[];
  kb: { id: string; slug: string; title: string; category: KbCategory; tech: Tech[]; difficulty: Difficulty; summary: string; tags: string[] }[];
  challenges: { id: string; slug: string; title: string; topic: ChallengeTopic; difficulty: Difficulty; minutes: number; validation: "js" | "dom" | "manual" }[];
  projects: {
    id: string;
    slug: string;
    title: string;
    order: number;
    difficulty: Difficulty;
    stepIds: string[];
    checklistCount: number;
    summary: string;
    tech: Tech[];
    hours: number;
    skills: string[];
    requirements: string[];
  }[];
  glossary: { id: string; term: string }[];
  /** Metadata for every auto-gradable question (practice + quiz), keyed by exercise id. */
  questions: Record<string, CatalogQuestionMeta>;
}

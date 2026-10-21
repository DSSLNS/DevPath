import type { ChallengeTopic, Difficulty, ExerciseType, KbCategory, LearningPath, Tech } from "@/content/types";

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

export interface Catalog {
  modules: CatalogModule[];
  paths: LearningPath[];
  kb: { id: string; slug: string; title: string; category: KbCategory; tech: Tech[]; difficulty: Difficulty; summary: string; tags: string[] }[];
  challenges: { id: string; slug: string; title: string; topic: ChallengeTopic; difficulty: Difficulty; minutes: number; validation: "js" | "dom" | "manual" }[];
  projects: { id: string; slug: string; title: string; order: number; difficulty: Difficulty; stepIds: string[]; checklistCount: number }[];
  glossary: { id: string; term: string }[];
  /** Metadata for every auto-gradable question (practice + quiz), keyed by exercise id. */
  questions: Record<string, CatalogQuestionMeta>;
}

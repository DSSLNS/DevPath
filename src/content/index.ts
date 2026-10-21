/**
 * Content queries. Server- and client-safe (pure data access).
 */
import { modules } from "./curriculum";
import { glossary } from "./glossary";
import { kbCategories, kbNotes } from "./kb";
import { learningPaths } from "./paths";
import { challenges } from "./practice";
import { projects } from "./projects";
import type { Exercise, KbNote, Lesson, Module } from "./types";

export { modules, kbNotes, kbCategories, challenges, projects, glossary, learningPaths };

export interface LessonRef {
  lesson: Lesson;
  module: Module;
  index: number; // position within module
  globalIndex: number;
}

const lessonIndex = new Map<string, LessonRef>();
let g = 0;
for (const m of modules) {
  m.lessons.forEach((lesson, index) => {
    lessonIndex.set(lesson.id, { lesson, module: m, index, globalIndex: g++ });
  });
}

export const allLessons: Lesson[] = modules.flatMap((m) => m.lessons);

export function getModuleBySlug(slug: string) {
  return modules.find((m) => m.slug === slug);
}

export function getModuleById(id: string) {
  return modules.find((m) => m.id === id);
}

export function getLessonRef(lessonId: string) {
  return lessonIndex.get(lessonId);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const m = getModuleBySlug(moduleSlug);
  const lesson = m?.lessons.find((l) => l.slug === lessonSlug);
  return lesson && m ? lessonIndex.get(lesson.id) : undefined;
}

export function lessonUrl(lessonId: string) {
  const ref = lessonIndex.get(lessonId);
  return ref ? `/learn/${ref.module.slug}/${ref.lesson.slug}` : "/learn";
}

export function adjacentLessons(lessonId: string) {
  const ref = lessonIndex.get(lessonId);
  if (!ref) return { prev: undefined, next: undefined };
  return { prev: allLessons[ref.globalIndex - 1], next: allLessons[ref.globalIndex + 1] };
}

export function getKbNote(slug: string): KbNote | undefined {
  return kbNotes.find((n) => n.slug === slug);
}

export function getKbNoteById(id: string): KbNote | undefined {
  return kbNotes.find((n) => n.id === id);
}

export function getChallenge(slug: string) {
  return challenges.find((c) => c.slug === slug);
}

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/** Every auto-gradable question available for assessments, tagged with its lesson. */
export interface QuestionRef {
  exercise: Exercise;
  lessonId: string;
  moduleId: string;
}

const GRADABLE: Exercise["type"][] = [
  "mcq",
  "multi-select",
  "true-false",
  "predict-output",
  "fill-blank",
  "match",
  "order",
];

export const questionBank: QuestionRef[] = modules.flatMap((m) =>
  m.lessons.flatMap((l) =>
    [...l.quiz, ...l.exercises]
      .filter((e) => GRADABLE.includes(e.type))
      .map((exercise) => ({ exercise, lessonId: l.id, moduleId: m.id })),
  ),
);

const questionById = new Map(questionBank.map((q) => [q.exercise.id, q]));
export function getQuestion(id: string) {
  return questionById.get(id);
}

/** Find any exercise (lesson practice, quiz or challenge) by id. */
const exerciseById = new Map<string, { exercise: Exercise; lessonId: string }>();
for (const l of allLessons) {
  for (const e of [...l.exercises, ...l.quiz, l.challenge]) exerciseById.set(e.id, { exercise: e, lessonId: l.id });
}
export function getExercise(id: string) {
  return exerciseById.get(id);
}

export function lessonExerciseIds(lesson: Lesson) {
  return [...lesson.exercises, ...lesson.quiz, lesson.challenge].map((e) => e.id);
}

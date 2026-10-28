/** Server-only: derive the slim catalog from bundled content. */
import { challenges, getCourse, glossary, kbNotes, learningPaths, modules, projects, questionBank, techCategories, technologies } from "@/content";
import { curriculumManifest } from "@/content/curriculum/manifest";
import type { Catalog } from "./types";

let cached: Catalog | null = null;

export function getCatalog(): Catalog {
  if (cached) return cached;
  cached = {
    categories: techCategories,
    technologies: technologies.map((t) => {
      const course = getCourse(t);
      const lessonIds = t.moduleIds.flatMap((id) => modules.find((m) => m.id === id)?.lessons.map((l) => l.id) ?? []);
      const kbCount = t.kbCategory ? kbNotes.filter((n) => n.category === t.kbCategory).length : 0;
      return {
        id: t.id,
        name: t.name,
        category: t.category,
        badge: t.badge,
        description: t.description,
        level: t.level,
        status: lessonIds.length ? "available" : kbCount ? "notes" : "planned",
        moduleIds: t.moduleIds,
        lessonIds,
        plannedLessons: course.plannedLessons,
        totalDays: course.totalDays,
        totalMinutes: course.totalMinutes,
        estimated: course.estimated,
        kbCategory: t.kbCategory,
        kbNotes: kbCount,
        practiceMode: t.practice.mode,
        prerequisites: t.prerequisites,
      };
    }),
    modules: modules.map((m) => {
      const manifest = curriculumManifest.find((x) => x.id === m.id);
      const written = new Set(m.lessons.map((l) => l.slug));
      return {
        id: m.id,
        slug: m.slug,
        order: m.order,
        title: m.title,
        description: m.description,
        path: m.path,
        optional: m.optional,
        prerequisites: m.prerequisites,
        lessons: m.lessons.map((l, index) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          difficulty: l.difficulty,
          minutes: l.minutes,
          moduleId: m.id,
          moduleSlug: m.slug,
          index,
          optional: l.optional,
          tags: l.tags,
          practiceIds: l.exercises.map((e) => e.id),
          quizIds: l.quiz.map((e) => e.id),
          challengeId: l.challenge.id,
        })),
        planned: (manifest?.lessons ?? []).filter(([slug]) => !written.has(slug)).map(([slug, title]) => ({ slug, title })),
      };
    }),
    paths: learningPaths,
    kb: kbNotes.map((n) => ({ id: n.id, slug: n.slug, title: n.title, category: n.category, tech: n.tech, difficulty: n.difficulty, summary: n.summary, tags: n.tags })),
    challenges: challenges.map((c) => ({ id: c.id, slug: c.slug, title: c.title, topic: c.topic, difficulty: c.difficulty, minutes: c.minutes, validation: c.validation })),
    projects: projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      order: p.order,
      difficulty: p.difficulty,
      stepIds: p.steps.map((s) => s.id),
      checklistCount: p.testingChecklist.length,
      summary: p.summary,
      tech: p.tech,
      hours: p.hours,
      skills: p.skills.slice(0, 4),
      requirements: p.requirements.slice(0, 3),
    })),
    glossary: glossary.map((g) => ({ id: g.id, term: g.term })),
    questions: Object.fromEntries(
      questionBank.map((q) => [q.exercise.id, { lessonId: q.lessonId, moduleId: q.moduleId, type: q.exercise.type, difficulty: q.exercise.difficulty }]),
    ),
  };
  return cached;
}

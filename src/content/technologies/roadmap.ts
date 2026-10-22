/**
 * Builds a technology's day-by-day roadmap from its modules.
 *
 * Sizing: a learning day targets about an hour for an average beginner, including practice.
 * Written lessons use their own `minutes`; unwritten (planned) lessons use an estimate
 * and the day is flagged as estimated. After every six learning days comes a review day
 * that revisits and assesses that week's lessons.
 */
import { curriculumManifest, lessonIdFor } from "@/content/curriculum/manifest";
import type { Module } from "@/content/types";
import type { CourseSummary, RoadmapDay, RoadmapWeek, Technology } from "./types";

export const DAY_BUDGET_MINUTES = 60;
export const PLANNED_LESSON_MINUTES = 25;
export const DAY_ASSESSMENT_MINUTES = 10;
export const REVIEW_DAY_MINUTES = 40;
const LEARNING_DAYS_PER_WEEK = 6;

interface LessonInfo {
  id: string;
  title: string;
  minutes: number;
  written: boolean;
  moduleTitle: string;
}

function lessonsFor(tech: Technology, modules: Module[]): LessonInfo[] {
  return tech.moduleIds.flatMap((moduleId) => {
    const manifest = curriculumManifest.find((m) => m.id === moduleId);
    const mod = modules.find((m) => m.id === moduleId);
    if (!manifest) return [];
    return manifest.lessons.map(([slug, title]) => {
      const id = lessonIdFor(manifest.slug, slug);
      const written = mod?.lessons.find((l) => l.id === id);
      return { id, title: written?.title ?? title, minutes: written?.minutes ?? PLANNED_LESSON_MINUTES, written: !!written, moduleTitle: manifest.title };
    });
  });
}

function joinTitles(titles: string[]) {
  if (titles.length <= 1) return titles[0] ?? "";
  return `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}

/** Groups lessons into days of at most DAY_BUDGET_MINUTES (a single long lesson gets its own day). */
function autoGroup(lessons: LessonInfo[]): LessonInfo[][] {
  const days: LessonInfo[][] = [];
  let current: LessonInfo[] = [];
  let minutes = 0;
  for (const l of lessons) {
    const sameModule = current.length === 0 || current[0].moduleTitle === l.moduleTitle;
    if (current.length && (minutes + l.minutes > DAY_BUDGET_MINUTES || !sameModule)) {
      days.push(current);
      current = [];
      minutes = 0;
    }
    current.push(l);
    minutes += l.minutes;
  }
  if (current.length) days.push(current);
  return days;
}

export function buildCourse(tech: Technology, modules: Module[]): CourseSummary {
  const lessons = lessonsFor(tech, modules);
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const groups: { lessons: LessonInfo[]; title?: string; objective?: string }[] = tech.dayPlan
    ? tech.dayPlan.map((d) => ({ lessons: d.lessonIds.map((id) => byId.get(id)).filter((l): l is LessonInfo => !!l), title: d.title, objective: d.objective }))
    : autoGroup(lessons).map((g) => ({ lessons: g }));

  const weeks: RoadmapWeek[] = [];
  let day = 0;
  let week: RoadmapWeek | null = null;
  let weekLessons: string[] = [];
  let learningInWeek = 0;

  const closeWeek = () => {
    if (!week) return;
    const reviewed = weekLessons.map((id) => byId.get(id)!);
    week.days.push({
      day: ++day,
      kind: "review",
      title: `Week ${week.week} review and assessment`,
      objective: `Revise ${joinTitles([...new Set(reviewed.map((l) => l.moduleTitle))])}, retake weak quizzes, and complete the week's assessment.`,
      lessonIds: weekLessons,
      minutes: REVIEW_DAY_MINUTES,
      estimated: reviewed.some((l) => !l.written),
    });
    weeks.push(week);
    week = null;
    weekLessons = [];
    learningInWeek = 0;
  };

  for (const g of groups) {
    if (!week) week = { week: weeks.length + 1, title: g.lessons[0]?.moduleTitle ?? tech.name, days: [] };
    const titles = g.lessons.map((l) => l.title);
    const d: RoadmapDay = {
      day: ++day,
      kind: "learn",
      title: g.title ?? titles.join(" · "),
      objective: g.objective ?? `Learn ${joinTitles(titles.map((t) => t.charAt(0).toLowerCase() + t.slice(1)))}, practise each one, and pass the day's assessment.`,
      lessonIds: g.lessons.map((l) => l.id),
      minutes: g.lessons.reduce((n, l) => n + l.minutes, 0) + DAY_ASSESSMENT_MINUTES,
      estimated: g.lessons.some((l) => !l.written),
    };
    week.days.push(d);
    weekLessons.push(...d.lessonIds);
    const moduleTitles = [...new Set(weekLessons.map((id) => byId.get(id)!.moduleTitle))];
    week.title = moduleTitles.length > 2 ? `${moduleTitles[0]} to ${moduleTitles[moduleTitles.length - 1]}` : moduleTitles.join(" and ");
    if (++learningInWeek === LEARNING_DAYS_PER_WEEK) closeWeek();
  }
  closeWeek();

  const allDays = weeks.flatMap((w) => w.days);
  return {
    techId: tech.id,
    weeks,
    totalDays: allDays.length,
    totalMinutes: allDays.reduce((n, d) => n + d.minutes, 0),
    publishedLessons: lessons.filter((l) => l.written).length,
    plannedLessons: lessons.filter((l) => !l.written).length,
    estimated: allDays.some((d) => d.estimated),
  };
}

/**
 * Checks a single lesson file before it is registered in its module:
 *   npm run content:lesson -- src/content/curriculum/m17-html/links.ts
 * Runs the same structural and executable checks as content:check.
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { allManifestLessonIds, curriculumManifest } from "@/content/curriculum/manifest";
import type { Lesson, Module } from "@/content/types";
import { checkLesson, type ContentIssue } from "@/content/validate";
import { verifyLesson } from "@/content/verify";

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: npm run content:lesson -- <path to lesson file>");
  const mod = (await import(pathToFileURL(resolve(file)).href)) as Record<string, unknown>;
  const lessons = Object.values(mod).filter((v): v is Lesson => typeof v === "object" && v !== null && "sections" in v && "slug" in v);
  if (lessons.length !== 1) throw new Error(`Expected exactly one exported Lesson in ${file}, found ${lessons.length}`);
  const lesson = lessons[0];
  const manifest = curriculumManifest.find((m) => m.lessons.some(([slug]) => `${m.slug}-${slug}` === lesson.id));
  if (!manifest) throw new Error(`Lesson id "${lesson.id}" is not in the curriculum manifest`);
  const lessonModule: Module = { id: manifest.id, slug: manifest.slug, order: 0, title: manifest.title, description: "", prerequisites: [], path: "", lessons: [lesson] };

  const issues: ContentIssue[] = [];
  checkLesson(lesson, lessonModule, new Set(allManifestLessonIds), issues);
  await verifyLesson(lesson, issues);
  if (issues.length) {
    for (const i of issues) console.error(`✗ ${i.where}: ${i.message}`);
    console.error(`\n${issues.length} issue(s) in ${lesson.id}.`);
    process.exit(1);
  }
  console.log(`✓ ${lesson.id}: no issues.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

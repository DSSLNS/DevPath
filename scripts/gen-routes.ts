/** Generates src/generated/routes.json: every valid dynamic content route, used by src/proxy.ts to return real 404s. */
import { mkdirSync, writeFileSync } from "node:fs";
import { challenges, getCourse, getLessonRef, kbNotes, learningPaths, modules, projects, technologies } from "@/content";

const routes = [
  ...modules.map((m) => `/learn/${m.slug}`),
  ...modules.flatMap((m) => m.lessons.map((l) => `/learn/${m.slug}/${l.slug}`)),
  ...kbNotes.map((n) => `/e2e/${n.slug}`),
  ...challenges.map((c) => `/practice/${c.slug}`),
  ...projects.map((p) => `/projects/${p.slug}`),
  ...technologies.map((t) => `/courses/${t.id}`),
  ...learningPaths.filter((p) => p.steps).map((p) => `/paths/${p.id}`),
  ...technologies.flatMap((t) =>
    getCourse(t)
      .weeks.flatMap((w) => w.days)
      .filter((d) => d.lessonIds.some((id) => getLessonRef(id)))
      .map((d) => `/courses/${t.id}/day/${d.day}`),
  ),
].sort();

mkdirSync("src/generated", { recursive: true });
writeFileSync("src/generated/routes.json", JSON.stringify(routes, null, 0) + "\n");
console.log(`Generated ${routes.length} content routes.`);

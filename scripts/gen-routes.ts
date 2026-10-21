/** Generates src/generated/routes.json: every valid dynamic content route, used by src/proxy.ts to return real 404s. */
import { mkdirSync, writeFileSync } from "node:fs";
import { challenges, kbNotes, modules, projects } from "@/content";

const routes = [
  ...modules.map((m) => `/learn/${m.slug}`),
  ...modules.flatMap((m) => m.lessons.map((l) => `/learn/${m.slug}/${l.slug}`)),
  ...kbNotes.map((n) => `/e2e/${n.slug}`),
  ...challenges.map((c) => `/practice/${c.slug}`),
  ...projects.map((p) => `/projects/${p.slug}`),
].sort();

mkdirSync("src/generated", { recursive: true });
writeFileSync("src/generated/routes.json", JSON.stringify(routes, null, 0) + "\n");
console.log(`Generated ${routes.length} content routes.`);

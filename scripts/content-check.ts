/**
 * Content checker.
 *   npm run content:check                    # everything
 *   npm run content:check -- --module m06    # one or more modules (repeatable)
 *   npm run content:check -- --kb cypress    # one KB category
 *   npm run content:check -- --challenges --projects --glossary
 *   npm run content:check -- --structure-only
 *   npm run content:check -- --strict          # also fail on planned (unwritten) lessons
 */
import { modules } from "@/content/curriculum";
import { allManifestLessonIds, curriculumManifest } from "@/content/curriculum/manifest";
import { glossary } from "@/content/glossary";
import { kbNotes } from "@/content/kb";
import { challenges } from "@/content/practice";
import { projects } from "@/content/projects";
import {
  checkGlobalIds,
  validateChallenges,
  validateCurriculum,
  validateGlossary,
  validateKb,
  validateProjects,
  type ContentIssue,
} from "@/content/validate";
import { verifyChallenge, verifyKbNote, verifyLesson } from "@/content/verify";

const args = process.argv.slice(2);
const values = (flag: string) => args.flatMap((a, i) => (a === flag && args[i + 1] ? [args[i + 1]] : []));
const has = (flag: string) => args.includes(flag);

const moduleFilter = values("--module");
const kbFilter = values("--kb");
const scoped = moduleFilter.length || kbFilter.length || has("--challenges") || has("--projects") || has("--glossary");
const structureOnly = has("--structure-only");

// Cross-references are checked against the manifest so partially-written content can still be validated.
const lessonIds = new Set(allManifestLessonIds);

async function main() {
  const issues: ContentIssue[] = [];
  const selectedModules = modules.filter((m) => !scoped || moduleFilter.includes(m.id));
  const selectedKb = kbNotes.filter((n) => !scoped || kbFilter.includes(n.category));
  const doChallenges = !scoped || has("--challenges");
  const doProjects = !scoped || has("--projects");
  const doGlossary = !scoped || has("--glossary");

  // Structural checks
  const curriculumIssues = validateCurriculum(selectedModules, [], has("--strict"));
  // validateCurriculum resolves references within the given modules; re-check against the full manifest instead.
  issues.push(...curriculumIssues.filter((i) => !(i.message.startsWith("Unknown lesson reference") && lessonIds.has(i.message.match(/"(.+)"/)?.[1] ?? ""))));
  validateKb(selectedKb, lessonIds, issues);
  // related notes may live in other categories
  const allKbIds = new Set(kbNotes.map((n) => n.id));
  for (let i = issues.length - 1; i >= 0; i--) {
    const m = issues[i].message.match(/^Unknown related note "(.+)"$/);
    if (m && allKbIds.has(m[1])) issues.splice(i, 1);
  }
  if (doChallenges) validateChallenges(challenges, lessonIds, issues);
  if (doProjects) validateProjects(projects, lessonIds, issues);
  if (doGlossary) validateGlossary(glossary, lessonIds, issues);
  checkGlobalIds(modules, kbNotes, challenges, projects, glossary, issues);

  // Executable checks
  if (!structureOnly) {
    for (const m of selectedModules) for (const l of m.lessons) await verifyLesson(l, issues);
    for (const n of selectedKb) await verifyKbNote(n, issues);
    if (doChallenges) for (const c of challenges) await verifyChallenge(c, issues);
  }

  const lessonCount = selectedModules.reduce((n, m) => n + m.lessons.length, 0);
  console.log(
    `Checked ${selectedModules.length} modules (${lessonCount} lessons), ${selectedKb.length} KB notes` +
      `${doChallenges ? `, ${challenges.length} challenges` : ""}${doProjects ? `, ${projects.length} projects` : ""}` +
      `${doGlossary ? `, ${glossary.length} glossary terms` : ""}.`,
  );
  const planned = selectedModules.reduce(
    (n, m) => n + (curriculumManifest.find((x) => x.id === m.id)?.lessons.length ?? 0) - m.lessons.length,
    0,
  );
  if (planned) console.log(`${planned} manifest lesson(s) are planned but not written yet (use --strict to fail on these).`);
  if (issues.length) {
    console.log(`\n${issues.length} issue(s):\n`);
    for (const i of issues) console.log(`✗ [${i.where}] ${i.message}\n`);
    process.exit(1);
  }
  console.log("✓ No issues found.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

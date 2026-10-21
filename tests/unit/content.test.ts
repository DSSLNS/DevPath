import { describe, expect, it } from "vitest";
import { modules } from "@/content/curriculum";
import { allManifestLessonIds } from "@/content/curriculum/manifest";
import { glossary } from "@/content/glossary";
import { kbNotes } from "@/content/kb";
import { challenges } from "@/content/practice";
import { projects } from "@/content/projects";
import { checkGlobalIds, validateChallenges, validateCurriculum, validateGlossary, validateKb, validateProjects } from "@/content/validate";
import { verifyChallenge, verifyKbNote, verifyLesson } from "@/content/verify";

const lessonIds = new Set(allManifestLessonIds);
const fmt = (issues: { where: string; message: string }[]) => issues.map((i) => `[${i.where}] ${i.message}`).join("\n");

describe("bundled content", () => {
  it("passes structural validation", () => {
    const issues = validateCurriculum(modules);
    validateKb(kbNotes, lessonIds, issues);
    validateChallenges(challenges, lessonIds, issues);
    validateProjects(projects, lessonIds, issues);
    validateGlossary(glossary, lessonIds, issues);
    checkGlobalIds(modules, kbNotes, challenges, projects, glossary, issues);
    expect(fmt(issues)).toBe("");
  });

  it("every documented output, solution and test is correct", { timeout: 120_000 }, async () => {
    const issues: { where: string; message: string }[] = [];
    for (const m of modules) for (const l of m.lessons) await verifyLesson(l, issues);
    for (const n of kbNotes) await verifyKbNote(n, issues);
    for (const ch of challenges) await verifyChallenge(ch, issues);
    expect(fmt(issues)).toBe("");
  });
});

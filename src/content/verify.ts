/**
 * Executable content verification (Node only — uses vm/jsdom).
 * Ensures reference solutions pass, starters/buggy code fail, and documented
 * outputs match what the in-app sandbox actually prints.
 */
import { logsToOutput, runInJsdom, runInNode } from "@/lib/sandbox/node-runner";
import type { RunResult } from "@/lib/sandbox/types";
import type { Block, Challenge, CodeExample, Exercise, KbNote, Lesson } from "./types";
import type { ContentIssue } from "./validate";

export function normalizeOutput(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

function describe(r: RunResult) {
  if (r.syntaxError) return `syntax error: ${r.error}`;
  if (r.timedOut) return "timed out";
  if (r.error) return `threw ${r.error}`;
  const failed = r.tests.filter((t) => !t.passed);
  return failed.length ? failed.map((t) => `"${t.name}": ${t.message}`).join("; ") : "all tests passed";
}

async function verifyTested(
  where: string,
  passing: string,
  failing: string | null,
  tests: { name: string; code: string }[],
  issues: ContentIssue[],
  html?: string,
) {
  const run = (code: string) => (html !== undefined ? runInJsdom(html, code, tests) : runInNode(code, tests));
  const good = await run(passing);
  if (good.error || good.tests.length !== tests.length || good.tests.some((t) => !t.passed)) {
    issues.push({ where, message: `Reference solution does not pass: ${describe(good)}` });
  }
  if (failing !== null) {
    const bad = await run(failing);
    if (!bad.error && bad.tests.length === tests.length && bad.tests.every((t) => t.passed)) {
      issues.push({ where, message: "Starter/buggy code already passes every test (tests are too weak)" });
    }
  }
}

async function verifyOutput(where: string, code: string, expected: string, issues: ContentIssue[]) {
  const r = await runInNode(code);
  if (r.syntaxError) {
    issues.push({ where, message: `Code has a syntax error: ${r.error}` });
    return;
  }
  let actual = logsToOutput(r);
  if (r.error) actual = (actual ? actual + "\n" : "") + "Uncaught " + r.error;
  if (normalizeOutput(actual) !== normalizeOutput(expected)) {
    issues.push({
      where,
      message: `Documented output does not match sandbox output.\n--- expected ---\n${expected}\n--- actual ---\n${actual}`,
    });
  }
}

export async function verifyExercise(ex: Exercise, where: string, issues: ContentIssue[]) {
  const w = `${where} ${ex.id}`;
  if (ex.type === "code") await verifyTested(w, ex.solution, ex.starter, ex.tests, issues);
  else if (ex.type === "find-bug") await verifyTested(w, ex.solution, ex.code, ex.tests, issues);
  else if (ex.type === "predict-output") await verifyOutput(w, ex.code, ex.answer, issues);
}

export async function verifyBlocks(blocks: Block[], where: string, issues: ContentIssue[]) {
  for (const [i, b] of blocks.entries()) {
    if (b.kind !== "code" || b.output === undefined) continue;
    if (b.language && b.language !== "js") continue;
    if (b.runtime === "dom") continue;
    await verifyOutput(`${where} block[${i}]`, b.code, b.output, issues);
  }
}

export async function verifyExample(ex: CodeExample, where: string, issues: ContentIssue[]) {
  const r = ex.runtime === "dom" ? await runInJsdom(ex.html ?? "", ex.code) : await runInNode(ex.code);
  if (r.syntaxError) issues.push({ where: `${where} example ${ex.id}`, message: `Syntax error: ${r.error}` });
  if (r.timedOut) issues.push({ where: `${where} example ${ex.id}`, message: "Example timed out" });
}

export async function verifyLesson(lesson: Lesson, issues: ContentIssue[]) {
  const w = `lesson ${lesson.id}`;
  await verifyBlocks(lesson.intro, `${w} intro`, issues);
  for (const s of lesson.sections) await verifyBlocks(s.blocks, `${w} section ${s.id}`, issues);
  for (const e of lesson.examples) await verifyExample(e, w, issues);
  for (const e of [...lesson.exercises, ...lesson.quiz, lesson.challenge]) await verifyExercise(e, w, issues);
}

export async function verifyChallenge(c: Challenge, issues: ContentIssue[]) {
  if (c.validation === "manual" || !c.tests) return;
  await verifyTested(`challenge ${c.id}`, c.solution, c.starter, c.tests, issues, c.validation === "dom" ? c.html ?? "" : undefined);
}

export async function verifyKbNote(n: KbNote, issues: ContentIssue[]) {
  await verifyBlocks(n.explanation, `kb ${n.id} explanation`, issues);
  await verifyBlocks(n.syntax, `kb ${n.id} syntax`, issues);
}

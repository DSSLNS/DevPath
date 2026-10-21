/**
 * Pure grading logic for every exercise type that can be graded without
 * running code. Code-based types ("code", "find-bug") are graded from sandbox
 * test results via `gradeCodeResult`.
 */
import type { Exercise } from "@/content/types";
import type { RunResult } from "@/lib/sandbox/types";

export type Answer =
  | { type: "mcq"; value: string }
  | { type: "multi-select"; value: string[] }
  | { type: "true-false"; value: boolean }
  | { type: "predict-output"; value: string }
  | { type: "fill-blank"; value: string[] }
  | { type: "match"; value: Record<number, string> }
  | { type: "order"; value: string[] }
  | { type: "short-answer"; value: string }
  | { type: "code"; value: string }
  | { type: "find-bug"; value: string };

export interface GradeResult {
  correct: boolean;
  /** Partial credit details where relevant (0..1). */
  score: number;
  /** Short machine-generated feedback; content explanations are shown separately. */
  feedback?: string;
  /** Per-item correctness for multi-part answers (fill-blank, match, order). */
  parts?: boolean[];
}

export const normalizeCode = (s: string) => s.replace(/\s+/g, "").replace(/;$/, "");

export function normalizeOutput(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim().replace(/\s+/g, " "))
    .filter((l, i, arr) => !(l === "" && (i === 0 || i === arr.length - 1)))
    .join("\n")
    .trim();
}

/** Returns true if the answer is "empty" and should not be submitted. */
export function isEmptyAnswer(a: Answer): boolean {
  switch (a.type) {
    case "mcq":
      return !a.value;
    case "multi-select":
      return a.value.length === 0;
    case "true-false":
      return typeof a.value !== "boolean";
    case "predict-output":
    case "short-answer":
    case "code":
    case "find-bug":
      return !a.value.trim();
    case "fill-blank":
      return a.value.every((v) => !v || !v.trim());
    case "match":
      return Object.keys(a.value).length === 0;
    case "order":
      return a.value.length === 0;
  }
}

export function gradeAnswer(ex: Exercise, answer: Answer): GradeResult {
  if (ex.type !== answer.type) return { correct: false, score: 0, feedback: "Answer type mismatch" };
  switch (ex.type) {
    case "mcq": {
      const correct = (answer as Extract<Answer, { type: "mcq" }>).value === ex.answer;
      return { correct, score: correct ? 1 : 0 };
    }
    case "multi-select": {
      const chosen = new Set((answer as Extract<Answer, { type: "multi-select" }>).value);
      const expected = new Set(ex.answers);
      const correct = chosen.size === expected.size && [...expected].every((a) => chosen.has(a));
      const right = [...chosen].filter((c) => expected.has(c)).length;
      const wrong = [...chosen].filter((c) => !expected.has(c)).length;
      return {
        correct,
        score: Math.max(0, (right - wrong) / expected.size),
        feedback: correct ? undefined : `You selected ${right} of ${expected.size} correct option(s)${wrong ? ` and ${wrong} incorrect` : ""}.`,
      };
    }
    case "true-false": {
      const correct = (answer as Extract<Answer, { type: "true-false" }>).value === ex.answer;
      return { correct, score: correct ? 1 : 0 };
    }
    case "predict-output": {
      const given = normalizeOutput((answer as Extract<Answer, { type: "predict-output" }>).value);
      const expected = normalizeOutput(ex.answer);
      // Accept either quote style for strings; the formatter's choice of quote is not the concept being tested.
      const loose = (s: string) => s.replace(/"/g, "'");
      const correct = given === expected || loose(given) === loose(expected);
      const givenLines = given.split("\n");
      const expLines = expected.split("\n");
      const parts = expLines.map((l, i) => loose(givenLines[i] ?? "") === loose(l));
      return {
        correct,
        score: correct ? 1 : parts.filter(Boolean).length / expLines.length,
        parts,
        feedback: correct
          ? undefined
          : givenLines.length !== expLines.length
            ? `Expected ${expLines.length} line(s) of output, you wrote ${givenLines.length}.`
            : `${parts.filter(Boolean).length} of ${expLines.length} line(s) correct.`,
      };
    }
    case "fill-blank": {
      const values = (answer as Extract<Answer, { type: "fill-blank" }>).value;
      const parts = ex.blanks.map((b, i) => b.answers.some((a) => normalizeCode(a) === normalizeCode(values[i] ?? "")));
      const correct = parts.every(Boolean);
      return { correct, score: parts.filter(Boolean).length / parts.length, parts };
    }
    case "match": {
      const value = (answer as Extract<Answer, { type: "match" }>).value;
      const parts = ex.pairs.map((p, i) => value[i] === p.right);
      const correct = parts.every(Boolean);
      return { correct, score: parts.filter(Boolean).length / parts.length, parts };
    }
    case "order": {
      const value = (answer as Extract<Answer, { type: "order" }>).value;
      const parts = ex.steps.map((s, i) => value[i] === s);
      const correct = parts.every(Boolean) && value.length === ex.steps.length;
      return { correct, score: parts.filter(Boolean).length / parts.length, parts };
    }
    case "short-answer": {
      const text = (answer as Extract<Answer, { type: "short-answer" }>).value.toLowerCase();
      const parts = ex.keywords.map((group) => group.some((k) => text.includes(k.toLowerCase())));
      const correct = parts.every(Boolean);
      return {
        correct,
        score: parts.filter(Boolean).length / parts.length,
        parts,
        feedback: correct
          ? "Your answer mentions the key ideas. Compare it with the sample answer below."
          : `Your answer covers ${parts.filter(Boolean).length} of ${parts.length} key idea(s). Compare it with the sample answer.`,
      };
    }
    case "code":
    case "find-bug":
      return { correct: false, score: 0, feedback: "Code answers are graded by running tests." };
  }
}

export function gradeCodeResult(result: RunResult, expectedTests: number): GradeResult {
  if (result.syntaxError) return { correct: false, score: 0, feedback: "Your code has a syntax error, so the tests could not run." };
  if (result.timedOut) return { correct: false, score: 0, feedback: "Your code took too long. Check for infinite loops or unresolved promises." };
  if (result.error) return { correct: false, score: 0, feedback: `Your code threw an error: ${result.error}` };
  const passed = result.tests.filter((t) => t.passed).length;
  const correct = passed === expectedTests && result.tests.length === expectedTests;
  return {
    correct,
    score: expectedTests ? passed / expectedTests : 0,
    parts: result.tests.map((t) => t.passed),
    feedback: correct ? "All tests passed." : `${passed} of ${expectedTests} tests passed.`,
  };
}

/** Deterministic shuffle (seeded) so the order is stable across re-renders and hydration. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

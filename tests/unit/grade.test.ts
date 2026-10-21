import { describe, expect, it } from "vitest";
import type { Exercise } from "@/content/types";
import { gradeAnswer, gradeCodeResult, isEmptyAnswer, normalizeOutput, seededShuffle } from "@/lib/exercises/grade";

const base = { difficulty: "beginner" as const, prompt: "p", hints: [], explanation: "e" };

describe("gradeAnswer", () => {
  it("grades mcq", () => {
    const ex: Exercise = { ...base, id: "q", type: "mcq", options: [{ id: "a", text: "A" }, { id: "b", text: "B" }, { id: "c", text: "C" }], answer: "b" };
    expect(gradeAnswer(ex, { type: "mcq", value: "b" }).correct).toBe(true);
    expect(gradeAnswer(ex, { type: "mcq", value: "a" }).correct).toBe(false);
  });

  it("grades multi-select exactly, with partial score", () => {
    const ex: Exercise = { ...base, id: "m", type: "multi-select", options: [{ id: "a", text: "A" }, { id: "b", text: "B" }, { id: "c", text: "C" }], answers: ["a", "c"] };
    expect(gradeAnswer(ex, { type: "multi-select", value: ["c", "a"] }).correct).toBe(true);
    const partial = gradeAnswer(ex, { type: "multi-select", value: ["a"] });
    expect(partial.correct).toBe(false);
    expect(partial.score).toBe(0.5);
    expect(gradeAnswer(ex, { type: "multi-select", value: ["a", "b", "c"] }).correct).toBe(false);
  });

  it("grades predict-output ignoring whitespace and quote style", () => {
    const ex: Exercise = { ...base, id: "p", type: "predict-output", code: "", answer: "[ 'a', 'b' ]\n2" };
    expect(gradeAnswer(ex, { type: "predict-output", value: '  [ "a", "b" ]  \n2\n' }).correct).toBe(true);
    expect(gradeAnswer(ex, { type: "predict-output", value: "[ 'a', 'b' ]" }).correct).toBe(false);
  });

  it("grades fill-blank per part, whitespace-insensitive", () => {
    const ex: Exercise = { ...base, id: "f", type: "fill-blank", template: "a.___(x => x.___)", blanks: [{ answers: ["map"] }, { answers: ["name"] }] };
    const r = gradeAnswer(ex, { type: "fill-blank", value: [" map ", "id"] });
    expect(r.correct).toBe(false);
    expect(r.parts).toEqual([true, false]);
  });

  it("grades match and order", () => {
    const m: Exercise = { ...base, id: "mt", type: "match", pairs: [{ left: "1", right: "x" }, { left: "2", right: "y" }, { left: "3", right: "z" }] };
    expect(gradeAnswer(m, { type: "match", value: { 0: "x", 1: "y", 2: "z" } }).correct).toBe(true);
    expect(gradeAnswer(m, { type: "match", value: { 0: "y", 1: "x", 2: "z" } }).score).toBeCloseTo(1 / 3);
    const o: Exercise = { ...base, id: "o", type: "order", steps: ["a", "b", "c"] };
    expect(gradeAnswer(o, { type: "order", value: ["a", "b", "c"] }).correct).toBe(true);
    expect(gradeAnswer(o, { type: "order", value: ["b", "a", "c"] }).correct).toBe(false);
  });

  it("checks short answers by keyword groups", () => {
    const ex: Exercise = { ...base, id: "s", type: "short-answer", keywords: [["closure"], ["scope", "environment"]], sampleAnswer: "..." };
    expect(gradeAnswer(ex, { type: "short-answer", value: "A closure keeps its lexical Environment" }).correct).toBe(true);
    expect(gradeAnswer(ex, { type: "short-answer", value: "a closure" }).correct).toBe(false);
  });

  it("rejects mismatched answer types", () => {
    const ex: Exercise = { ...base, id: "t", type: "true-false", answer: true };
    expect(gradeAnswer(ex, { type: "mcq", value: "a" }).correct).toBe(false);
  });
});

describe("empty answers", () => {
  it("detects empty answers", () => {
    expect(isEmptyAnswer({ type: "mcq", value: "" })).toBe(true);
    expect(isEmptyAnswer({ type: "fill-blank", value: ["", " "] })).toBe(true);
    expect(isEmptyAnswer({ type: "predict-output", value: "  " })).toBe(true);
    expect(isEmptyAnswer({ type: "true-false", value: false })).toBe(false);
  });
});

describe("gradeCodeResult", () => {
  const ok = { logs: [], error: null, errorLine: null, syntaxError: false, durationMs: 1 };
  it("requires every test to pass", () => {
    expect(gradeCodeResult({ ...ok, tests: [{ name: "a", passed: true, message: "" }] }, 1).correct).toBe(true);
    expect(gradeCodeResult({ ...ok, tests: [{ name: "a", passed: true, message: "" }] }, 2).correct).toBe(false);
  });
  it("explains syntax errors, timeouts and thrown errors", () => {
    expect(gradeCodeResult({ ...ok, syntaxError: true, error: "SyntaxError: x", tests: [] }, 1).feedback).toMatch(/syntax error/);
    expect(gradeCodeResult({ ...ok, timedOut: true, error: "t", tests: [] }, 1).feedback).toMatch(/too long/);
    expect(gradeCodeResult({ ...ok, error: "TypeError: y", tests: [] }, 1).feedback).toMatch(/TypeError/);
  });
});

describe("helpers", () => {
  it("normalizes output", () => expect(normalizeOutput("\r\n a  b \r\n")).toBe("a b"));
  it("shuffles deterministically", () => {
    const a = seededShuffle([1, 2, 3, 4, 5], "seed");
    expect(seededShuffle([1, 2, 3, 4, 5], "seed")).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

import { describe, expect, it } from "vitest";
import { logsToOutput, runInNode } from "./node-runner";

const out = async (code: string) => logsToOutput(await runInNode(code));

describe("sandbox runtime formatting", () => {
  it("formats primitives and top-level strings raw", async () => {
    expect(await out(`console.log("hi", 1, true, null, undefined, 10n, -0)`)).toBe("hi 1 true null undefined 10n -0");
  });

  it("formats arrays and objects like Node (single line)", async () => {
    expect(await out(`console.log([1, "a", [2, [3, [4]]]])`)).toBe("[ 1, 'a', [ 2, [ 3, [Array] ] ] ]");
    expect(await out(`console.log({ a: 1, "b-c": "x", nested: { d: [] } })`)).toBe("{ a: 1, 'b-c': 'x', nested: { d: [] } }");
    expect(await out(`console.log([], {})`)).toBe("[] {}");
    expect(await out(`console.log(["it's"])`)).toBe(`[ "it's" ]`);
  });

  it("formats Map, Set, functions, classes and class instances", async () => {
    expect(await out(`console.log(new Map([["a", 1]]), new Set([1, 2]))`)).toBe("Map(1) { 'a' => 1 } Set(2) { 1, 2 }");
    expect(await out(`function foo() {}; console.log(foo, () => {})`)).toBe("[Function: foo] [Function (anonymous)]");
    expect(await out(`class A { constructor() { this.x = 1 } }; console.log(A, new A())`)).toBe("[class A] A { x: 1 }");
  });

  it("supports format specifiers and errors", async () => {
    expect(await out(`console.log("%s is %d", "age", 42)`)).toBe("age is 42");
    expect(await out(`console.log(new TypeError("bad"))`)).toBe("TypeError: bad");
  });

  it("waits for timers and respects event loop order", async () => {
    const code = `
      console.log("start");
      setTimeout(() => console.log("timeout"), 0);
      Promise.resolve().then(() => console.log("microtask"));
      console.log("end");`;
    expect(await out(code)).toBe("start\nend\nmicrotask\ntimeout");
  });

  it("supports top-level await", async () => {
    expect(await out(`const v = await new Promise(r => setTimeout(() => r(5), 10)); console.log(v)`)).toBe("5");
  });

  it("reports runtime errors with the user line number", async () => {
    const r = await runInNode(`const a = 1;\nconst b = undefinedThing + 1;`);
    expect(r.error).toBe("ReferenceError: undefinedThing is not defined");
    expect(r.errorLine).toBe(2);
  });

  it("reports syntax errors without running", async () => {
    const r = await runInNode(`console.log("x"`);
    expect(r.syntaxError).toBe(true);
    expect(r.logs).toHaveLength(0);
  });

  it("runs tests against learner code", async () => {
    const r = await runInNode(`function add(a, b) { return a + b }`, [
      { name: "adds", code: "assert.equal(add(2, 3), 5)" },
      { name: "deep", code: "assert.deepEqual([add(1, 1)], [3])" },
    ]);
    expect(r.tests.map((t) => t.passed)).toEqual([true, false]);
    expect(r.tests[1].message).toBe("AssertionError: Expected [ 3 ] but received [ 2 ]");
  });

  it("exposes learner logs to tests", async () => {
    const r = await runInNode(`console.log("hello")`, [{ name: "logs", code: `assert.deepEqual(__logs, ["hello"])` }]);
    expect(r.tests[0].passed).toBe(true);
    expect(r.logs.map((l) => l.text)).toEqual(["hello"]);
  });

  it("has no network access", async () => {
    const r = await runInNode(`console.log(typeof fetch)`);
    expect(logsToOutput(r)).toBe("undefined");
  });

  it("times out infinite async work", async () => {
    const r = await runInNode(`setInterval(() => {}, 10)`, [], 300);
    expect(r.timedOut).toBe(true);
  });
});

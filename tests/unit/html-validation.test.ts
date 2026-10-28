/**
 * Regression tests for HTML validation in the HTML/CSS course. These use the real parsers
 * (parse5 and html-validate); nothing is mocked.
 */
import { describe, expect, it } from "vitest";
import { detectHtmlMode } from "@/lib/html/mode";
import { validateHtml } from "@/lib/html/validate";
import { gradeCodeResult } from "@/lib/exercises/grade";
import { getLessonRef } from "@/content";
import { withHtmlCheckDefaults } from "@/content/html-check";

const COMPLETE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Page</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`;

const errorsOf = async (code: string, mode: "snippet" | "document", strict = false) =>
  (await validateHtml(code, { mode, strict })).diagnostics.filter((d) => d.severity === "error");

describe("HTML validation", () => {
  it("1. flags an incomplete tag (<html) with its position, in both modes", async () => {
    for (const mode of ["snippet", "document"] as const) {
      const errors = await errorsOf("<html", mode);
      const incomplete = errors.find((e) => e.title === "Incomplete HTML tag");
      expect(incomplete, mode).toBeDefined();
      expect(incomplete?.line).toBe(1);
      expect(incomplete?.column).toBeGreaterThan(1);
      expect(incomplete?.message).toContain("`>`");
    }
  });

  it("2. accepts a valid snippet", async () => {
    expect(await validateHtml("<h1>Hello</h1>", { mode: "snippet" })).toMatchObject({ errors: 0, warnings: 0 });
  });

  it("3. accepts a void element without an end tag", async () => {
    expect((await validateHtml("<br>", { mode: "snippet" })).errors).toBe(0);
  });

  it("4. accepts a void element with attributes", async () => {
    expect(await validateHtml('<img src="photo.jpg" alt="Photo">', { mode: "snippet" })).toMatchObject({ errors: 0, warnings: 0 });
  });

  it("5. treats an implicitly closed <p> as valid HTML by default, but an error when explicit end tags are required", async () => {
    const lenient = await validateHtml("<div><p>Hello</div>", { mode: "snippet" });
    expect(lenient.errors).toBe(0);
    expect(lenient.diagnostics.some((d) => d.severity === "warning" && d.source === "html-validate:no-implicit-close")).toBe(true);
    const strict = await errorsOf("<div><p>Hello</div>", "snippet", true);
    expect(strict.map((e) => e.source)).toContain("html-validate:no-implicit-close");
    // Genuinely misnested and unclosed elements are always errors.
    expect((await errorsOf("<b><i>text</b></i>", "snippet")).length).toBeGreaterThan(0);
    expect((await errorsOf("<div>Content", "snippet")).map((e) => e.source)).toContain("html-validate:close-order");
  });

  it("6. passes a complete, correctly structured document", async () => {
    expect(await validateHtml(COMPLETE, { mode: "document" })).toMatchObject({ errors: 0, warnings: 0 });
  });

  it("7. does not fail a snippet for lacking <html>, <head> or <body>", async () => {
    const v = await validateHtml("<h2>Menu</h2>\n<ul>\n  <li>Tea</li>\n  <li>Cake</li>\n</ul>", { mode: "snippet" });
    expect(v.errors).toBe(0);
    // The same code is not a complete page.
    const asDoc = await errorsOf("<h2>Menu</h2>", "document");
    expect(asDoc.map((e) => e.source)).toEqual(expect.arrayContaining(["structure:doctype", "structure:html", "structure:head", "structure:body"]));
  });

  it("8. reports a missing attribute quotation mark", async () => {
    const errors = await errorsOf('<img src="photo.jpg alt="Photo">', "snippet");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.title)).toEqual(expect.arrayContaining(["Attributes run together"]));
    expect((await errorsOf('<a href="/cart>Cart</a>', "snippet")).map((e) => e.title)).toContain("Unclosed quotation mark");
  });

  it("9. does not pass a browser-renderable but nonconforming document", async () => {
    // Browsers render this happily: they invent <head>, close <p> and ignore the misplaced <div>.
    const sloppy = "<!doctype html><html lang=\"en\"><head><title>T</title></head><body><ul><div>Item</div></ul><p>Text</body></html>";
    const v = await validateHtml(sloppy, { mode: "document" });
    expect(v.errors).toBeGreaterThan(0);
    expect(gradeCodeResult({ logs: [], error: null, errorLine: null, syntaxError: false, tests: [{ name: "t", passed: true, message: "" }], durationMs: 1 }, 1, v).correct).toBe(false);
    // A document with no <title> renders too, but isn't a complete document.
    expect((await errorsOf('<!doctype html><html lang="en"><head></head><body>x</body></html>', "document")).length).toBeGreaterThan(0);
  });

  it("10. keeps the intentional malformed-HTML demo usable in demo mode", async () => {
    const lesson = withHtmlCheckDefaults(getLessonRef("html-what-is-html")!.lesson);
    const demo = lesson.examples.find((e) => e.id === "html-what-is-html-example-error-tolerance")!;
    expect(demo.htmlCheck?.mode).toBe("demo");
    // The demo really is broken, so learners see the problems while the preview still renders.
    expect((await validateHtml(demo.code, { mode: "document" })).errors).toBeGreaterThan(0);
    // Every other example in the lesson is a valid complete document.
    for (const e of lesson.examples.filter((x) => x.htmlCheck?.mode === "document")) expect((await validateHtml(e.code, { mode: "document" })).errors, e.id).toBe(0);
  });

  it("detects the mode for free-form playgrounds", () => {
    expect(detectHtmlMode("<html")).toBe("document");
    expect(detectHtmlMode(COMPLETE)).toBe("document");
    expect(detectHtmlMode("<h1>Hi</h1>")).toBe("snippet");
    expect(detectHtmlMode("<header>x</header>")).toBe("snippet");
  });

  it("grades valid HTML only by its tests", () => {
    const ok = { logs: [], error: null, errorLine: null, syntaxError: false, tests: [{ name: "t", passed: true, message: "" }], durationMs: 1 };
    expect(gradeCodeResult(ok, 1, { errors: 0 }).correct).toBe(true);
    expect(gradeCodeResult({ ...ok, tests: [] }, 1, { errors: 0 }).correct).toBe(false);
  });
});

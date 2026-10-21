import { describe, expect, it } from "vitest";
import { buildSearchIndex } from "@/lib/search/build-index";
import { searchDocs } from "@/lib/search/search";

const docs = buildSearchIndex();

describe("search", () => {
  it("indexes lessons, concepts, examples, exercises, notes and challenges", () => {
    const cats = new Set(docs.map((d) => d.category));
    for (const c of ["lesson", "concept", "example", "exercise", "kb", "challenge", "project"]) expect(cats.has(c as never)).toBe(true);
  });
  it("ranks an exact lesson title first", () => {
    const r = searchDocs(docs, "map");
    expect(r[0].doc.category).toBe("lesson");
    expect(r[0].doc.title).toBe("map");
  });
  it("finds Cypress commands and Playwright APIs", () => {
    expect(searchDocs(docs, "cy.visit").some((r) => r.doc.url.startsWith("/e2e/"))).toBe(true);
    expect(searchDocs(docs, "getByRole")[0].doc.url).toMatch(/\/e2e\//);
  });
  it("requires every term to match and supports category filters", () => {
    expect(searchDocs(docs, "zzqxqzz")).toHaveLength(0);
    expect(searchDocs(docs, "array", { categories: ["kb"] }).every((r) => r.doc.category === "kb")).toBe(true);
  });
  it("returns nothing for an empty query", () => expect(searchDocs(docs, "   ")).toHaveLength(0));
});

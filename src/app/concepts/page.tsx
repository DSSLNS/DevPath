import type { Metadata } from "next";
import { allLessons, glossary, lessonUrl } from "@/content";
import { PageHeader } from "@/components/ui/card";
import { Blocks } from "@/components/content/blocks";
import { ConceptIndex, type ConceptEntry } from "@/components/concepts/concept-index";

export const metadata: Metadata = { title: "JavaScript Concepts" };

export default function ConceptsPage() {
  const map = new Map<string, ConceptEntry>();
  for (const g of glossary) {
    map.set(g.term.toLowerCase(), { id: g.id, term: g.term, definition: g.definition, lessons: g.lessonIds.map((id) => ({ title: allLessons.find((l) => l.id === id)?.title ?? id, url: lessonUrl(id) })) });
  }
  for (const l of allLessons) {
    for (const t of l.terms) {
      const key = t.term.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        if (!existing.lessons.some((x) => x.url === lessonUrl(l.id))) existing.lessons.push({ title: l.title, url: lessonUrl(l.id) });
      } else {
        map.set(key, { id: `concept-${key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, term: t.term, definition: t.definition, lessons: [{ title: l.title, url: lessonUrl(l.id) }] });
      }
    }
  }
  const entries = [...map.values()].sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: "base" }));
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="JavaScript Concepts"
        description="A searchable reference of every concept defined in the curriculum, with links to the lessons that teach it."
      />
      <section aria-labelledby="choose-method" className="mb-8 rounded-lg border border-border bg-surface p-5">
        <h2 id="choose-method" className="text-lg font-semibold">
          Quick reference: choosing an array method
        </h2>
        <Blocks
          blocks={[
            {
              kind: "table",
              headers: ["You want to…", "Use", "Returns", "Mutates?"],
              rows: [
                ["Transform every item", "`map`", "New array, same length", "No"],
                ["Keep only matching items", "`filter`", "New array, same or shorter", "No"],
                ["Combine items into one value (total, object, string)", "`reduce`", "Any single value", "No"],
                ["Get the first matching item", "`find`", "The item or `undefined`", "No"],
                ["Check whether any / every item matches", "`some` / `every`", "`true` or `false`", "No"],
                ["Run a side effect for each item (logging, DOM updates)", "`forEach`", "`undefined`", "No (but your callback might)"],
                ["Sort items", "`toSorted` (or `sort` on a copy)", "Sorted array", "`sort` mutates; `toSorted` doesn't"],
              ],
            },
          ]}
        />
      </section>
      <ConceptIndex entries={entries} />
    </div>
  );
}

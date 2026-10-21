/** Server-side: flatten all bundled content into search documents. */
import { allLessons, challenges, getLessonRef, glossary, kbCategories, kbNotes, lessonUrl, projects } from "@/content";
import type { Block } from "@/content/types";
import { stripInline } from "@/lib/markdown";
import type { SearchDoc } from "./types";

const MAX_TEXT = 2500;

function blocksText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.kind) {
        case "paragraph":
        case "heading":
        case "callout":
          return stripInline(b.text);
        case "list":
          return b.items.map(stripInline).join(" ");
        case "code":
          return b.code;
        case "table":
          return [...b.headers, ...b.rows.flat()].map(stripInline).join(" ");
        case "diagram":
          return [b.title, ...b.steps.map((s) => `${s.label} ${s.detail ?? ""}`)].join(" ");
        case "terms":
          return b.items.map((t) => `${t.term} ${t.definition}`).join(" ");
      }
    })
    .join(" ");
}

const clip = (s: string) => s.replace(/\s+/g, " ").slice(0, MAX_TEXT);

export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const l of allLessons) {
    const ref = getLessonRef(l.id)!;
    const url = lessonUrl(l.id);
    docs.push({
      id: `lesson:${l.id}`,
      category: "lesson",
      title: l.title,
      subtitle: `${ref.module.title} · Lesson ${ref.index + 1}`,
      url,
      tags: l.tags,
      text: clip([l.summary, ...l.objectives, blocksText(l.intro), ...l.sections.map((s) => `${s.title} ${blocksText(s.blocks)}`)].join(" ")),
      difficulty: l.difficulty,
      tech: l.tech,
    });
    for (const t of l.terms) {
      docs.push({ id: `concept:${l.id}:${t.term}`, category: "concept", title: t.term, subtitle: `Defined in ${l.title}`, url, tags: l.tags, text: clip(t.definition) });
    }
    for (const e of l.examples) {
      docs.push({ id: `example:${e.id}`, category: "example", title: e.title, subtitle: `Example in ${l.title}`, url: `${url}#playground`, tags: l.tags, text: clip(e.code) });
    }
    for (const e of [...l.exercises, l.challenge]) {
      docs.push({
        id: `exercise:${e.id}`,
        category: "exercise",
        title: stripInline(e.prompt).slice(0, 90),
        subtitle: `${e.type.replace("-", " ")} · ${l.title}`,
        url: `${url}#practice`,
        tags: l.tags,
        text: clip(stripInline(e.prompt)),
        difficulty: e.difficulty,
      });
    }
  }
  for (const n of kbNotes) {
    docs.push({
      id: `kb:${n.id}`,
      category: "kb",
      title: n.title,
      subtitle: kbCategories.find((c) => c.id === n.category)?.title ?? n.category,
      url: `/e2e/${n.slug}`,
      tags: n.tags,
      text: clip([n.summary, blocksText(n.explanation), blocksText(n.syntax), n.code.code].join(" ")),
      difficulty: n.difficulty,
      tech: n.tech,
    });
  }
  for (const c of challenges) {
    docs.push({
      id: `challenge:${c.id}`,
      category: "challenge",
      title: c.title,
      subtitle: `Practice Lab · ${c.topic}`,
      url: `/practice/${c.slug}`,
      tags: [c.topic],
      text: clip(blocksText(c.statement)),
      difficulty: c.difficulty,
    });
  }
  for (const p of projects) {
    docs.push({ id: `project:${p.id}`, category: "project", title: p.title, subtitle: "Guided project", url: `/projects/${p.slug}`, tags: p.skills, text: clip([p.summary, ...p.requirements].join(" ")), difficulty: p.difficulty, tech: p.tech });
  }
  for (const g of glossary) {
    docs.push({ id: `glossary:${g.id}`, category: "glossary", title: g.term, subtitle: "Glossary", url: `/concepts#${g.id}`, tags: g.tags, text: clip(stripInline(g.definition)) });
  }
  return docs;
}

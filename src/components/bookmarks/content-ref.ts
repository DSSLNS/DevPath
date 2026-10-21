import type { CatalogApi } from "@/lib/catalog/context";

type RefType = "lesson" | "kb" | "challenge" | "project" | "glossary" | "note";

export function contentHref(c: CatalogApi, type: RefType, id: string): string {
  switch (type) {
    case "lesson":
      return c.lessonUrl(id);
    case "kb": {
      const n = c.kb.find((x) => x.id === id);
      return n ? `/e2e/${n.slug}` : "/e2e";
    }
    case "challenge": {
      const ch = c.challenges.find((x) => x.id === id);
      return ch ? `/practice/${ch.slug}` : "/practice";
    }
    case "project": {
      const p = c.projects.find((x) => x.id === id);
      return p ? `/projects/${p.slug}` : "/projects";
    }
    case "glossary":
      return `/concepts#${id}`;
    case "note":
      return `/notes?note=${id}`;
  }
}

/** Title for a stored reference. Content that no longer exists is labelled rather than hidden. */
export function contentTitle(c: CatalogApi, type: RefType, id: string, notes: { id: string; title: string }[] = []): string {
  const missing = "Content no longer available";
  switch (type) {
    case "lesson":
      return c.lessonById.get(id)?.title ?? missing;
    case "kb":
      return c.kb.find((x) => x.id === id)?.title ?? missing;
    case "challenge":
      return c.challenges.find((x) => x.id === id)?.title ?? missing;
    case "project":
      return c.projects.find((x) => x.id === id)?.title ?? missing;
    case "glossary":
      return c.glossary.find((x) => x.id === id)?.term ?? missing;
    case "note":
      return notes.find((n) => n.id === id)?.title ?? missing;
  }
}

export function contentExists(c: CatalogApi, type: RefType, id: string, notes: { id: string; title: string }[] = []) {
  return contentTitle(c, type, id, notes) !== "Content no longer available";
}

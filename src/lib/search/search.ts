/** Client-side ranking. Small, deterministic and dependency-free. */
import type { SearchCategory, SearchDoc } from "./types";

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  snippet?: string;
}

export function tokenizeQuery(q: string) {
  return q
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

const CATEGORY_BOOST: Record<SearchCategory, number> = {
  lesson: 6,
  kb: 5,
  concept: 4,
  glossary: 4,
  note: 4,
  challenge: 3,
  project: 3,
  example: 2,
  exercise: 1,
};

export function searchDocs(
  docs: SearchDoc[],
  query: string,
  opts: { categories?: SearchCategory[]; difficulty?: string; limit?: number } = {},
): SearchResult[] {
  const tokens = tokenizeQuery(query);
  if (!tokens.length) return [];
  const phrase = query.trim().toLowerCase();
  const results: SearchResult[] = [];
  for (const doc of docs) {
    if (opts.categories?.length && !opts.categories.includes(doc.category)) continue;
    if (opts.difficulty && doc.difficulty && doc.difficulty !== opts.difficulty) continue;
    const title = doc.title.toLowerCase();
    const tags = doc.tags.join(" ").toLowerCase();
    const text = doc.text.toLowerCase();
    let score = 0;
    let all = true;
    for (const t of tokens) {
      let s = 0;
      if (title === t) s += 40;
      else if (title.startsWith(t)) s += 25;
      else if (new RegExp(`\\b${escapeRe(t)}`).test(title)) s += 18;
      else if (title.includes(t)) s += 12;
      if (tags.includes(t)) s += 8;
      if (text.includes(t)) s += 3 + Math.min(4, countOf(text, t));
      if (!s) all = false;
      score += s;
    }
    if (!all) continue;
    if (title.includes(phrase)) score += 20;
    else if (text.includes(phrase)) score += 6;
    score += CATEGORY_BOOST[doc.category];
    results.push({ doc, score, snippet: makeSnippet(doc.text, tokens[0]) });
  }
  results.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return results.slice(0, opts.limit ?? 50);
}

function countOf(s: string, t: string) {
  let n = 0;
  let i = s.indexOf(t);
  while (i !== -1 && n < 10) {
    n++;
    i = s.indexOf(t, i + t.length);
  }
  return n;
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function makeSnippet(text: string, token: string, radius = 70) {
  const i = text.toLowerCase().indexOf(token);
  if (i === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, i - radius);
  return (start > 0 ? "…" : "") + text.slice(start, i + token.length + radius).trim() + (i + radius < text.length ? "…" : "");
}

export function groupResults(results: SearchResult[]) {
  const groups = new Map<SearchCategory, SearchResult[]>();
  for (const r of results) groups.set(r.doc.category, [...(groups.get(r.doc.category) ?? []), r]);
  return groups;
}

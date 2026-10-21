/**
 * Minimal, safe markdown renderer. Produces React elements only and never
 * injects HTML, so user-written notes cannot execute script.
 *
 * Inline: `code`, **bold**, *italic*, [text](url)
 * Block (renderMarkdown): # headings, - / 1. lists, ``` fences, > quotes, paragraphs
 */
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { CodeBlockStatic } from "@/components/content/code-block-static";
import type { CodeLanguage } from "@/content/types";

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function safeHref(url: string): string | null {
  const u = url.trim();
  if (u.startsWith("/") && !u.startsWith("//")) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (/^mailto:/i.test(u)) return u;
  return null;
}

export function renderInline(text: string, keyPrefix = "i"): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const tok = m[0];
    const key = `${keyPrefix}-${k++}`;
    if (m[1]) {
      out.push(
        <code key={key} className="prose-code">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      out.push(
        <strong key={key} className="font-semibold text-fg">
          {renderInline(tok.slice(2, -2), key)}
        </strong>,
      );
    } else if (m[3]) {
      out.push(<em key={key}>{renderInline(tok.slice(1, -1), key)}</em>);
    } else if (m[4]) {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      const href = lm ? safeHref(lm[2]) : null;
      if (lm && href) {
        const external = /^https?:/i.test(href);
        out.push(
          external ? (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary-hover">
              {lm[1]}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link key={key} href={href} className="text-primary underline underline-offset-2 hover:text-primary-hover">
              {lm[1]}
            </Link>
          ),
        );
      } else {
        out.push(tok);
      }
    }
    last = idx + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length === 1 ? out[0] : <>{out}</>;
}

/** Strip inline markdown to plain text (for search and aria labels). */
export function stripInline(text: string) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

const LANGS: CodeLanguage[] = ["js", "ts", "jsx", "tsx", "html", "css", "bash", "json", "text"];
const LANG_ALIASES: Record<string, CodeLanguage> = { javascript: "js", typescript: "ts", sh: "bash", shell: "bash" };

export function renderMarkdown(src: string): ReactNode {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const langRaw = line.slice(3).trim().toLowerCase();
      const lang = (LANG_ALIASES[langRaw] ?? (LANGS.includes(langRaw as CodeLanguage) ? langRaw : "text")) as CodeLanguage;
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence
      blocks.push(<CodeBlockStatic key={key++} code={code.join("\n")} language={lang} compact />);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const cls = ["text-xl font-semibold", "text-lg font-semibold", "text-base font-semibold", "text-sm font-semibold"][level - 1];
      const Tag = (["h2", "h3", "h4", "h5"] as const)[level - 1];
      blocks.push(
        <Tag key={key++} className={`${cls} mt-4 mb-2 text-fg`}>
          {renderInline(h[2])}
        </Tag>,
      );
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      blocks.push(
        <ul key={key++} className="my-2 list-disc space-y-1 pl-6">
          {items.map((it, j) => (
            <li key={j}>{renderInline(taskItem(it))}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
      blocks.push(
        <ol key={key++} className="my-2 list-decimal space-y-1 pl-6">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    if (/^>\s?/.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push(
        <blockquote key={key++} className="my-2 border-l-2 border-border-strong pl-3 text-muted">
          {renderInline(q.join(" "))}
        </blockquote>,
      );
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\s*[-*]\s|\s*\d+[.)]\s|>)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(
      <p key={key++} className="my-2">
        {para.map((p, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {renderInline(p, `p${j}`)}
          </Fragment>
        ))}
      </p>,
    );
  }
  return <>{blocks}</>;
}

function taskItem(s: string) {
  return s.replace(/^\[ \]\s*/, "☐ ").replace(/^\[x\]\s*/i, "☑ ");
}

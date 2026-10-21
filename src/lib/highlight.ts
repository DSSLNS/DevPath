/**
 * Tiny, dependency-free syntax highlighter for static code blocks.
 * Produces token spans; the editor uses CodeMirror instead.
 */
import type { CodeLanguage } from "@/content/types";

export type TokenType = "keyword" | "string" | "number" | "comment" | "fn" | "prop" | "punct" | "tag" | "attr" | "plain";
export interface Token {
  t: TokenType;
  v: string;
}

const JS_KEYWORDS = new Set(
  (
    "const let var function return if else for while do switch case default break continue new class extends super " +
    "this typeof instanceof in of try catch finally throw async await yield import export from as null undefined true false " +
    "void delete static get set interface type enum implements private public protected readonly declare namespace keyof " +
    "infer unknown never any string number boolean bigint symbol object describe it test expect beforeEach afterEach"
  ).split(" "),
);

const JS_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?\b|\b0x[\da-f]+\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"'`/]+|\/)/gi;

function tokenizeJs(code: string): Token[] {
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  JS_RE.lastIndex = 0;
  while ((m = JS_RE.exec(code))) {
    const [v, comment, str, num, ident, ws] = m;
    if (comment) out.push({ t: "comment", v });
    else if (str) out.push({ t: "string", v });
    else if (num) out.push({ t: "number", v });
    else if (ident) {
      const prev = out.length ? out[out.length - 1].v : "";
      const next = code.slice(JS_RE.lastIndex).match(/^\s*(\(|=>|:)/)?.[1];
      if (JS_KEYWORDS.has(ident)) out.push({ t: "keyword", v });
      else if (prev.endsWith(".") && next !== "(") out.push({ t: "prop", v });
      else if (next === "(") out.push({ t: "fn", v });
      else out.push({ t: "plain", v });
    } else if (ws) out.push({ t: "plain", v });
    else out.push({ t: "punct", v });
  }
  return out;
}

function tokenizeHtml(code: string): Token[] {
  const out: Token[] = [];
  const re = /(<!--[\s\S]*?-->)|(<\/?[A-Za-z][\w-]*)|(\s[A-Za-z_:][\w:.-]*)(?==)|("[^"]*"|'[^']*')|(\/?>)|([^<"']+|.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const [v, comment, tag, attr, str, close] = m;
    if (comment) out.push({ t: "comment", v });
    else if (tag) out.push({ t: "tag", v });
    else if (attr) out.push({ t: "attr", v });
    else if (str) out.push({ t: "string", v });
    else if (close) out.push({ t: "tag", v });
    else out.push({ t: "plain", v });
  }
  return out;
}

function tokenizeBash(code: string): Token[] {
  const out: Token[] = [];
  const re = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'[^']*')|(^|\n)(\s*)(\$?\s*)([\w./-]+)|(--?[\w-]+)|([\s\S])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[1]) out.push({ t: "comment", v: m[1] });
    else if (m[2]) out.push({ t: "string", v: m[2] });
    else if (m[6]) {
      out.push({ t: "plain", v: (m[3] ?? "") + (m[4] ?? "") + (m[5] ?? "") });
      out.push({ t: "fn", v: m[6] });
    } else if (m[7]) out.push({ t: "attr", v: m[7] });
    else out.push({ t: "plain", v: m[0] });
  }
  return out;
}

export function tokenize(code: string, lang: CodeLanguage = "js"): Token[] {
  if (lang === "js" || lang === "ts" || lang === "jsx" || lang === "tsx" || lang === "json") {
    if (lang === "jsx" || lang === "tsx") {
      // Highlight JSX tags lightly on top of JS tokens.
      return tokenizeJs(code).flatMap((tok) =>
        tok.t === "punct" && /<\/?$/.test(tok.v) ? [{ t: "tag" as const, v: tok.v }] : [tok],
      );
    }
    return tokenizeJs(code);
  }
  if (lang === "html") return tokenizeHtml(code);
  if (lang === "bash") return tokenizeBash(code);
  return [{ t: "plain", v: code }];
}

/**
 * HTML validation for the HTML/CSS course (browser and Node).
 *
 * Browsers never reject markup: they repair it. `<html` renders as an empty page, so "the
 * preview loaded" says nothing about whether the code is correct. Validation therefore runs
 * before the preview and uses two real parsers:
 *
 *  - parse5 (spec-compliant HTML tokenizer/parser): syntax errors such as incomplete tags,
 *    broken attributes and stray characters, with exact line and column.
 *  - html-validate (conformance checker): unclosed or misnested elements, content not allowed
 *    in a parent, missing required document parts, deprecated elements and more.
 *
 * HTML is not XML: void elements (`<br>`, `<img>`) and optional end tags are valid and are
 * never reported as errors.
 */
import { parse, parseFragment, type DefaultTreeAdapterMap } from "parse5";
import type { HtmlCheckMode } from "@/content/types";

export { detectHtmlMode } from "./mode";

export type Severity = "error" | "warning" | "info";

export interface HtmlDiagnostic {
  severity: Severity;
  /** Short beginner-friendly heading, e.g. "Incomplete HTML tag". */
  title: string;
  /** What is wrong and how to fix it. */
  message: string;
  line?: number;
  column?: number;
  /** parse5 error code or html-validate rule id, for reference. */
  source: string;
}

export interface HtmlValidationOptions {
  /** "snippet": a fragment such as `<h1>Hi</h1>`. "document": a complete page with doctype, html, head and body. */
  mode: Exclude<HtmlCheckMode, "demo">;
  /** Also require explicit end tags (an implicitly closed `<p>` becomes an error). */
  strict?: boolean;
}

export interface HtmlValidation {
  diagnostics: HtmlDiagnostic[];
  errors: number;
  warnings: number;
}

// ------------------------------------------------------------------ parse5 syntax errors

const SYNTAX: Record<string, [string, string]> = {
  "eof-in-tag": ["Incomplete HTML tag", "A tag was started but never finished. Add the closing angle bracket `>` (for example `<html>`), and the matching end tag if the element needs one."],
  "eof-before-tag-name": ["Incomplete HTML tag", "There is a `<` at the very end of the code with no tag name after it. Finish the tag or remove the `<`."],
  "invalid-first-character-of-tag-name": ["Invalid tag syntax", "A `<` must be followed directly by a tag name such as `p` or `div`. To show a literal `<` on the page, write `&lt;`."],
  "missing-end-tag-name": ["Empty end tag", "`</>` has no tag name. Write the full end tag, for example `</p>`."],
  "missing-attribute-value": ["Missing attribute value", "An attribute has `=` but no value after it. Write `name=\"value\"`, or remove the `=`."],
  "missing-whitespace-between-attributes": ["Attributes run together", "Two attributes have no space between them. This usually means a quotation mark is missing: check that every attribute value starts and ends with `\"`."],
  "unexpected-character-in-attribute-name": ["Malformed attribute", "An attribute name contains a quote or `<`. Usually a value's closing quotation mark is missing, so the next attribute was swallowed. Check the quotes around each value."],
  "unexpected-character-in-unquoted-attribute-value": ["Malformed attribute value", "Unquoted attribute values can't contain quotes, `=`, `<` or backticks. Put the value in double quotes."],
  "unexpected-equals-sign-before-attribute-name": ["Malformed attribute", "There is an `=` where an attribute name should start. Remove it or add the attribute name."],
  "eof-in-attribute-value-double-quoted": ["Unclosed quotation mark", "An attribute value opened with `\"` is never closed. Add the closing `\"`."],
  "eof-in-attribute-value-single-quoted": ["Unclosed quotation mark", "An attribute value opened with `'` is never closed. Add the closing `'`."],
  "duplicate-attribute": ["Duplicate attribute", "The same attribute appears twice on one element. The browser ignores the second one, so remove the duplicate."],
  "end-tag-with-attributes": ["Attributes on an end tag", "End tags like `</a>` can't have attributes. Move them to the start tag."],
  "end-tag-with-trailing-solidus": ["Invalid end tag", "End tags don't take a slash before `>`. Write `</p>`, not `</p/>`."],
  "non-void-html-element-start-tag-with-trailing-solidus": ["Self-closing syntax on a normal element", "`<div/>` doesn't close the element in HTML: the slash is ignored and the element stays open. Write `<div></div>`. Only void elements like `<br>` and `<img>` have no end tag."],
  "eof-in-comment": ["Unclosed comment", "A comment starts with `<!--` but never ends. Close it with `-->`."],
  "abrupt-closing-of-empty-comment": ["Malformed comment", "Write comments as `<!-- text -->`."],
  "incorrectly-opened-comment": ["Malformed comment", "Comments must start with `<!--` (two dashes)."],
  "incorrectly-closed-comment": ["Malformed comment", "Comments must end with `-->`, not `--!>`."],
  "nested-comment": ["Nested comment", "Comments can't contain `<!--`. Close the first comment before starting another."],
  "eof-in-doctype": ["Incomplete doctype", "The doctype is not finished. Write exactly `<!DOCTYPE html>`."],
  "missing-doctype-name": ["Incomplete doctype", "Write exactly `<!DOCTYPE html>`."],
  "invalid-character-sequence-after-doctype-name": ["Invalid doctype", "Modern pages use exactly `<!DOCTYPE html>`."],
  "missing-semicolon-after-character-reference": ["Character reference missing `;`", "Character references end with a semicolon, for example `&amp;` or `&copy;`."],
  "unknown-named-character-reference": ["Unknown character reference", "This `&name;` isn't a known character reference. To show a literal `&`, write `&amp;`."],
  "unexpected-null-character": ["Invalid character", "The code contains a null character. Delete it and retype that part."],
  "unexpected-question-mark-instead-of-tag-name": ["Invalid tag syntax", "`<?` isn't HTML (it's XML or PHP syntax). Remove it."],
  "cdata-in-html-content": ["CDATA in HTML", "`<![CDATA[` only works in SVG or MathML. Use plain text or character references instead."],
};

/** Syntax errors that show up because a snippet is parsed as a fragment, not a page. */
const IGNORED_SYNTAX = new Set(["missing-doctype"]);

function humanize(code: string) {
  return code.charAt(0).toUpperCase() + code.slice(1).replace(/-/g, " ");
}

/** The quote character left open at the end of the code inside a tag, if any (only used to word a parse5 error). */
function openQuoteAtEnd(code: string): string | null {
  let inTag = false;
  let quote: string | null = null;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (inTag) {
      if (c === ">") inTag = false;
      else if ((c === '"' || c === "'") && code[i - 1] === "=") quote = c;
    } else if (c === "<" && /[a-zA-Z/]/.test(code[i + 1] ?? "")) inTag = true;
  }
  return inTag ? quote : null;
}

function syntaxErrors(code: string, mode: "snippet" | "document") {
  const out: HtmlDiagnostic[] = [];
  const onParseError = (e: { code: string; startLine: number; startCol: number }) => {
    if (IGNORED_SYNTAX.has(e.code)) return;
    let [title, message] = SYNTAX[e.code] ?? ["HTML syntax error", `${humanize(e.code)}. Check the markup around this position.`];
    // parse5 reports any tag cut off by the end of the code as "eof-in-tag"; when the cut happens
    // inside an attribute value, the real mistake is a missing closing quotation mark.
    if (e.code === "eof-in-tag") {
      const quote = openQuoteAtEnd(code);
      if (quote) [title, message] = ["Unclosed quotation mark", `An attribute value opened with \`${quote}\` is never closed, so everything after it became part of the value. Add the closing \`${quote}\`.`];
    }
    out.push({ severity: "error", title, message, line: e.startLine, column: e.startCol, source: `parse5:${e.code}` });
  };
  const doc = mode === "document" ? parse(code, { sourceCodeLocationInfo: true, onParseError }) : (parseFragment(code, { sourceCodeLocationInfo: true, onParseError }), null);
  return { errors: out, doc };
}

// ------------------------------------------------------------------ document structure

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const isElement = (n: Node): n is Element => "tagName" in n;

/**
 * In document mode the page must spell out its skeleton. The parser invents missing
 * <html>, <head> and <body> elements, so we check that each came from the source code.
 */
function structureErrors(doc: DefaultTreeAdapterMap["document"]): HtmlDiagnostic[] {
  const out: HtmlDiagnostic[] = [];
  const hasDoctype = doc.childNodes.some((n) => n.nodeName === "#documentType");
  if (!hasDoctype)
    out.push({ severity: "error", title: "Missing doctype", message: "A complete page must start with `<!DOCTYPE html>`. Without it, browsers render in quirks mode.", line: 1, column: 1, source: "structure:doctype" });
  const html = doc.childNodes.find((n): n is Element => isElement(n) && n.tagName === "html");
  const written = (el?: Element) => !!el?.sourceCodeLocation?.startTag;
  const child = (tag: string) => html?.childNodes.find((n): n is Element => isElement(n) && n.tagName === tag);
  for (const [el, tag] of [
    [html, "html"],
    [child("head"), "head"],
    [child("body"), "body"],
  ] as const) {
    if (!written(el))
      out.push({
        severity: "error",
        title: `Missing <${tag}> element`,
        message: `A complete page needs an explicit \`<${tag}>\` start tag. The browser adds a hidden one when it's missing, which is why the preview still appears.`,
        source: `structure:${tag}`,
      });
  }
  return out;
}

function suggestions(doc: DefaultTreeAdapterMap["document"]): HtmlDiagnostic[] {
  const out: HtmlDiagnostic[] = [];
  const all: Element[] = [];
  const walk = (n: Node) => {
    if (isElement(n)) all.push(n);
    if ("childNodes" in n) n.childNodes.forEach(walk);
  };
  walk(doc);
  if (!all.some((e) => e.tagName === "meta" && e.attrs.some((a) => a.name === "charset")))
    out.push({ severity: "info", title: "Declare the character encoding", message: "Add `<meta charset=\"utf-8\">` as the first element in `<head>` so every character displays correctly.", source: "suggest:charset" });
  if (!all.some((e) => e.tagName === "meta" && e.attrs.some((a) => a.name === "name" && a.value === "viewport")))
    out.push({ severity: "info", title: "Add a viewport tag for phones", message: "Add `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">` so the page isn't zoomed out on mobile screens.", source: "suggest:viewport" });
  return out;
}

// ------------------------------------------------------------------ html-validate conformance

/** Conformance rules whose failures make the markup structurally wrong (errors, not warnings). */
const ERROR_RULES = new Set(["close-order", "close-attr", "element-permitted-content", "element-permitted-occurrences", "element-permitted-order", "element-permitted-parent", "element-required-ancestor", "void-content", "no-dup-attr", "no-dup-id", "parser-error"]);
/** Rules html-validate reports that parse5 already explained with a friendlier message. */
const SYNTAX_OVERLAP = new Set(["parser-error", "attr-spacing", "no-dup-attr"]);

const RULE_TEXT: Record<string, string> = {
  "close-order": "Elements must be closed in the reverse order they were opened, and every opened element needs its end tag. For example `<b><i>text</i></b>`, not `<b><i>text</b></i>`.",
  "no-implicit-close": "This element is closed automatically by the browser. That's valid HTML, but writing the end tag yourself makes the structure clear and avoids surprises.",
  "element-permitted-content": "This element isn't allowed inside its parent. For example, `<ul>` may only contain `<li>`, and `<p>` can't contain block elements like `<div>`.",
  "element-required-content": "This element is missing a required child, for example `<head>` must contain a `<title>`.",
  "element-required-attributes": "This element is missing an attribute it should have.",
  "missing-doctype": "A complete page must start with `<!DOCTYPE html>`.",
  deprecated: "This element is obsolete. Browsers may still show it, but it isn't part of modern HTML. Use CSS or a modern element instead.",
  "wcag/h37": "Images need an `alt` attribute describing them for screen-reader users (use `alt=\"\"` for purely decorative images).",
};

type HtmlValidateModule = typeof import("html-validate/browser");
let validatorPromise: Promise<HtmlValidateModule> | null = null;
const loadValidator = () => (validatorPromise ??= import("html-validate/browser"));

async function conformance(code: string, { mode, strict }: HtmlValidationOptions, hadSyntaxErrors: boolean): Promise<HtmlDiagnostic[]> {
  const { HtmlValidate, StaticConfigLoader } = await loadValidator();
  const validator = new HtmlValidate(
    new StaticConfigLoader({
      extends: ["html-validate:standard"],
      rules: {
        "no-implicit-close": strict ? "error" : "warn",
        "missing-doctype": mode === "document" ? "error" : "off",
        "element-required-content": mode === "document" ? "error" : "off",
        "element-required-attributes": "warn",
        "wcag/h37": "warn",
        // Stylistic rules: not about correctness, so beginners aren't flooded with them.
        "attribute-boolean-style": "off",
        "attribute-empty-style": "off",
        "void-style": "off",
        "no-trailing-whitespace": "off",
        "doctype-style": "off",
      },
    }),
  );
  const report = await validator.validateString(code);
  const out: HtmlDiagnostic[] = [];
  for (const m of report.results.flatMap((r) => r.messages)) {
    if (hadSyntaxErrors && SYNTAX_OVERLAP.has(m.ruleId)) continue;
    // The structure check already explains a missing doctype in friendlier terms.
    if (m.ruleId === "missing-doctype") continue;
    const error = m.ruleId === "no-implicit-close" ? !!strict : ERROR_RULES.has(m.ruleId) || (mode === "document" && m.ruleId === "element-required-content");
    out.push({
      severity: error ? "error" : "warning",
      title: m.message,
      message: RULE_TEXT[m.ruleId] ?? "This markup isn't conforming HTML. The browser may still show it, but other browsers, tools or assistive technology might not.",
      line: m.line,
      column: m.column,
      source: `html-validate:${m.ruleId}`,
    });
  }
  return out;
}

// ------------------------------------------------------------------ public API

/** Validates learner HTML. Never throws; an empty editor in snippet mode is valid (nothing to check). */
export async function validateHtml(code: string, options: HtmlValidationOptions): Promise<HtmlValidation> {
  const syntax = syntaxErrors(code, options.mode);
  const diagnostics = [...syntax.errors];
  // A broken tag (e.g. `<html`) means elements are "missing" only as a side effect; report the cause alone.
  if (syntax.doc) diagnostics.push(...structureErrors(syntax.doc).filter((d) => !syntax.errors.length || d.source === "structure:doctype"));
  diagnostics.push(...(await conformance(code, options, syntax.errors.length > 0)));
  if (syntax.doc && !diagnostics.some((d) => d.severity === "error")) diagnostics.push(...suggestions(syntax.doc));
  // Syntax errors first (they usually cause the rest), then by severity and position.
  const rank = (d: HtmlDiagnostic) => (d.source.startsWith("parse5:") ? 0 : { error: 1, warning: 2, info: 3 }[d.severity]);
  diagnostics.sort((a, b) => rank(a) - rank(b) || (a.line ?? 1e9) - (b.line ?? 1e9) || (a.column ?? 0) - (b.column ?? 0));
  return {
    diagnostics,
    errors: diagnostics.filter((d) => d.severity === "error").length,
    warnings: diagnostics.filter((d) => d.severity === "warning").length,
  };
}

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderInline, renderMarkdown, safeHref, stripInline } from "@/lib/markdown";

describe("markdown rendering", () => {
  it("renders inline formatting", () => {
    const html = renderToStaticMarkup(<p>{renderInline("Use `map` for **new** arrays, *not* [forEach](https://developer.mozilla.org/)")}</p>);
    expect(html).toContain('<code class="prose-code">map</code>');
    expect(html).toContain("<strong");
    expect(html).toContain("<em>not</em>");
    expect(html).toContain('href="https://developer.mozilla.org/"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it("never renders raw HTML or unsafe links", () => {
    const html = renderToStaticMarkup(<div>{renderMarkdown('<script>alert(1)</script>\n[x](javascript:alert(1)) <img src=x onerror=alert(1)>')}</div>);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain('href="javascript');
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("//evil.com")).toBeNull();
    expect(safeHref("/learn")).toBe("/learn");
  });
  it("renders headings, lists and fenced code", () => {
    const html = renderToStaticMarkup(<div>{renderMarkdown("# Title\n- one\n- two\n\n```js\nconst a = 1;\n```")}</div>);
    expect(html).toContain("<h2");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("const");
  });
  it("strips formatting for plain text", () => expect(stripInline("**a** `b` [c](https://x)")).toBe("a b c"));
});

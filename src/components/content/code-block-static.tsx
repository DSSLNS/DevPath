import type { CodeLanguage } from "@/content/types";
import { tokenize } from "@/lib/highlight";
import { CopyButton } from "@/components/ui/copy-button";

const LANG_LABEL: Record<CodeLanguage, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  html: "HTML",
  css: "CSS",
  bash: "Terminal",
  json: "JSON",
  text: "Text",
};

export function HighlightedCode({ code, language = "js" }: { code: string; language?: CodeLanguage }) {
  return (
    <>
      {tokenize(code, language).map((tok, i) =>
        tok.t === "plain" ? tok.v : (
          <span key={i} className={`tok-${tok.t}`}>
            {tok.v}
          </span>
        ),
      )}
    </>
  );
}

export function CodeBlockStatic({
  code,
  language = "js",
  title,
  compact,
  actions,
}: {
  code: string;
  language?: CodeLanguage;
  title?: string;
  compact?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <figure className={`${compact ? "my-2" : "my-4"} overflow-hidden rounded-lg border border-code-border bg-code`}>
      <figcaption className="flex items-center justify-between gap-2 border-b border-code-border px-3 py-1.5 text-xs text-subtle">
        <span className="truncate">{title ?? LANG_LABEL[language]}</span>
        <span className="flex shrink-0 items-center gap-1">
          {actions}
          <CopyButton text={code} />
        </span>
      </figcaption>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed text-code-fg" tabIndex={0}>
        <code>
          <HighlightedCode code={code} language={language} />
        </code>
      </pre>
    </figure>
  );
}

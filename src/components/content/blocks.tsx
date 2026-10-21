import { AlertTriangle, Info, Lightbulb, OctagonAlert } from "lucide-react";
import type { Block } from "@/content/types";
import { renderInline } from "@/lib/markdown";
import { cn } from "@/components/ui/cn";
import { CodeBlockStatic } from "./code-block-static";
import { TryItButton } from "./try-it-button";

const calloutStyle = {
  info: { cls: "border-info/30 bg-info-soft", icon: Info, iconCls: "text-info", label: "Note" },
  tip: { cls: "border-success/30 bg-success-soft", icon: Lightbulb, iconCls: "text-success", label: "Tip" },
  warning: { cls: "border-warning/30 bg-warning-soft", icon: AlertTriangle, iconCls: "text-warning", label: "Warning" },
  danger: { cls: "border-danger/30 bg-danger-soft", icon: OctagonAlert, iconCls: "text-danger", label: "Important" },
} as const;

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.kind) {
    case "paragraph":
      return <p className="my-3 text-[15px] leading-7 text-fg/90">{renderInline(b.text)}</p>;
    case "heading":
      return <h3 className="mt-6 mb-2 text-base font-semibold text-fg">{renderInline(b.text)}</h3>;
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className={cn("my-3 space-y-1.5 pl-6 text-[15px] leading-7", b.ordered ? "list-decimal" : "list-disc")}>
          {b.items.map((it, i) => (
            <li key={i}>{renderInline(it)}</li>
          ))}
        </Tag>
      );
    }
    case "code": {
      const runnable = b.runnable && (b.language ?? "js") === "js";
      return (
        <div>
          <CodeBlockStatic
            code={b.code}
            language={b.language ?? "js"}
            title={b.title}
            actions={runnable ? <TryItButton code={b.code} runtime={b.runtime ?? "js"} /> : undefined}
          />
          {b.output !== undefined && (
            <div className="-mt-3 mb-4 rounded-b-lg border border-t-0 border-code-border bg-surface-2 px-3 py-2">
              <div className="mb-1 text-[11px] font-semibold tracking-wide text-subtle uppercase">Output</div>
              <pre className="overflow-x-auto font-mono text-[13px] whitespace-pre text-fg">{b.output}</pre>
            </div>
          )}
        </div>
      );
    }
    case "callout": {
      const s = calloutStyle[b.tone];
      const Icon = s.icon;
      return (
        <aside className={cn("my-4 flex gap-3 rounded-lg border px-4 py-3 text-[14.5px] leading-relaxed", s.cls)} aria-label={b.title ?? s.label}>
          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.iconCls)} aria-hidden />
          <div className="min-w-0">
            {b.title && <div className="mb-0.5 font-semibold text-fg">{b.title}</div>}
            <div className="text-fg/90">{renderInline(b.text)}</div>
          </div>
        </aside>
      );
    }
    case "table":
      return (
        <div className="my-4 overflow-x-auto rounded-lg border border-border" tabIndex={0} role="region" aria-label={b.caption ?? "Table"}>
          <table className="w-full border-collapse text-left text-sm">
            {b.caption && <caption className="border-b border-border bg-surface-2 px-3 py-2 text-left text-xs font-semibold text-muted">{b.caption}</caption>}
            <thead className="bg-surface-2">
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i} scope="col" className="border-b border-border px-3 py-2 font-semibold whitespace-nowrap text-fg">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri} className="border-b border-border last:border-0">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 align-top text-fg/90">
                      {renderInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "diagram":
      return <Diagram title={b.title} steps={b.steps} variant={b.variant ?? "flow"} />;
    case "terms":
      return (
        <dl className="my-4 grid gap-2 sm:grid-cols-2">
          {b.items.map((t) => (
            <div key={t.term} className="rounded-lg border border-border bg-surface-2 px-3 py-2">
              <dt className="text-sm font-semibold">{t.term}</dt>
              <dd className="text-sm text-muted">{renderInline(t.definition)}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

export function Diagram({ title, steps, variant }: { title: string; steps: { label: string; detail?: string }[]; variant: "flow" | "timeline" | "stack" }) {
  return (
    <figure className="my-5 rounded-lg border border-border bg-surface-2 p-4" role="group" aria-label={`Diagram: ${title}`}>
      <figcaption className="mb-3 text-xs font-semibold tracking-wide text-subtle uppercase">{renderInline(title)}</figcaption>
      {variant === "stack" ? (
        <ol className="mx-auto flex max-w-md flex-col-reverse gap-1.5" aria-label="Stack, bottom to top">
          {steps.map((s, i) => (
            <li key={i} className={cn("rounded-md border px-3 py-2 text-center text-sm", i === steps.length - 1 ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border bg-surface")}>
              <div className="font-mono text-[13px] font-medium">{s.label}</div>
              {s.detail && <div className="text-xs text-muted">{renderInline(s.detail)}</div>}
            </li>
          ))}
        </ol>
      ) : variant === "timeline" ? (
        <ol className="relative ml-2 border-l-2 border-border pl-5">
          {steps.map((s, i) => (
            <li key={i} className="relative mb-3 last:mb-0">
              <span className="absolute top-1.5 -left-[27px] grid h-4 w-4 place-items-center rounded-full border-2 border-primary bg-surface text-[9px] font-bold text-primary" aria-hidden>
                {i + 1}
              </span>
              <div className="font-mono text-[13px] font-medium text-fg">{s.label}</div>
              {s.detail && <div className="text-sm text-muted">{renderInline(s.detail)}</div>}
            </li>
          ))}
        </ol>
      ) : (
        <ol className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-stretch">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2 md:max-w-[240px] md:flex-1">
              <div className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2">
                <div className="font-mono text-[13px] font-medium break-words text-fg">{s.label}</div>
                {s.detail && <div className="text-xs text-muted">{renderInline(s.detail)}</div>}
              </div>
              {i < steps.length - 1 && (
                <span className="shrink-0 text-subtle" aria-hidden>
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

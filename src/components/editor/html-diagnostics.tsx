"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { HtmlCheckMode } from "@/content/types";
import type { HtmlDiagnostic, HtmlValidation, Severity } from "@/lib/html/validate";
import { renderInline } from "@/lib/markdown";
import { cn } from "@/components/ui/cn";

const STYLE: Record<Severity, { icon: typeof Info; label: string; className: string }> = {
  error: { icon: XCircle, label: "Error", className: "border-danger/30 bg-danger-soft text-danger" },
  warning: { icon: AlertTriangle, label: "Warning", className: "border-warning/30 bg-warning-soft text-warning" },
  info: { icon: Info, label: "Suggestion", className: "border-info/30 bg-info-soft text-info" },
};

const MODE_LABEL: Record<HtmlCheckMode, string> = {
  snippet: "HTML snippet",
  document: "complete HTML document",
  demo: "intentionally broken demo",
};

/** Validation results for the HTML in an editor: errors block the exercise, warnings and suggestions don't. */
export function HtmlDiagnostics({
  validation,
  mode,
  autoDetected,
  onLocate,
}: {
  validation: HtmlValidation;
  mode: HtmlCheckMode;
  autoDetected?: boolean;
  onLocate?: (line: number, column: number) => void;
}) {
  const { diagnostics, errors, warnings } = validation;
  const suggestions = diagnostics.length - errors - warnings;
  const checkedAs = `Checked as ${mode === "demo" ? "an" : "a"} ${MODE_LABEL[mode]}${autoDetected ? " (detected from your code)" : ""}.`;
  return (
    <div className="border-t border-border px-3 py-2.5" data-testid="html-diagnostics" aria-live="polite">
      {mode === "demo" && (
        <p className="mb-2 rounded-md border border-info/30 bg-info-soft px-2.5 py-2 text-xs text-info">
          This example is broken on purpose. The preview shows how the browser silently repairs the markup. The problems below are why it still isn&apos;t
          valid HTML.
        </p>
      )}
      {errors === 0 && mode !== "demo" ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-success" data-testid="html-valid">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> No HTML errors.{" "}
          <span className="font-normal text-muted">
            {checkedAs}
            {warnings ? ` ${warnings} warning${warnings > 1 ? "s" : ""} to review.` : ""}
          </span>
        </p>
      ) : (
        <p className="text-xs font-semibold" data-testid="html-errors-summary">
          {errors ? (
            <span className="text-danger">
              {errors} HTML error{errors > 1 ? "s" : ""}
              {mode === "demo" ? "" : ": fix " + (errors > 1 ? "them" : "it") + " before the page can be checked"}
            </span>
          ) : (
            <span className="text-warning">No syntax errors, but this markup isn&apos;t conforming</span>
          )}
          {warnings > 0 && <span className="font-normal text-muted"> · {warnings} warning{warnings > 1 ? "s" : ""}</span>}
          {suggestions > 0 && <span className="font-normal text-muted"> · {suggestions} suggestion{suggestions > 1 ? "s" : ""}</span>}
          <span className="block font-normal text-muted">{checkedAs}</span>
        </p>
      )}
      {diagnostics.length > 0 && (
        <ul className="mt-2 max-h-64 space-y-1.5 overflow-auto">
          {diagnostics.map((d, i) => (
            <DiagnosticItem key={`${d.source}-${i}`} d={d} onLocate={onLocate} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DiagnosticItem({ d, onLocate }: { d: HtmlDiagnostic; onLocate?: (line: number, column: number) => void }) {
  const s = STYLE[d.severity];
  const Icon = s.icon;
  const where = d.line ? `Line ${d.line}${d.column ? `, column ${d.column}` : ""}` : null;
  return (
    <li className={cn("rounded-md border px-2.5 py-2 text-xs", s.className)} data-severity={d.severity}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="font-semibold">
          {s.label}: {d.title}
        </span>
        {where &&
          (onLocate ? (
            <button type="button" className="underline underline-offset-2 hover:no-underline" onClick={() => onLocate(d.line!, d.column ?? 1)}>
              {where}
            </button>
          ) : (
            <span>{where}</span>
          ))}
      </div>
      <p className="mt-1 text-fg/85">{renderInline(d.message)}</p>
    </li>
  );
}

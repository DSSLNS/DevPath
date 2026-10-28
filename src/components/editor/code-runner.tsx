"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Loader2, Play, RotateCcw, Square } from "lucide-react";
import type { CodeExample, CodeTest, HtmlCheck, Runtime } from "@/content/types";
import { detectHtmlMode } from "@/lib/html/mode";
import type { HtmlValidation } from "@/lib/html/validate";
import { runInSandbox, type RunHandle } from "@/lib/sandbox/browser";
import type { LogEntry, RunResult } from "@/lib/sandbox/types";
import { useLearnerState } from "@/lib/store/hooks";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/components/ui/cn";
import { LOAD_CODE_EVENT, type LoadCodeDetail } from "@/components/content/try-it-button";
import { CodeEditor } from "./code-editor";
import { HtmlDiagnostics } from "./html-diagnostics";

export interface CodeRunnerProps {
  examples?: CodeExample[];
  initialCode?: string;
  runtime?: Runtime;
  html?: string;
  title?: string;
  /** Listen for "Try it" events from static code blocks on the page. */
  acceptTryIt?: boolean;
  /** Persist drafts via this callback (debounced by the caller if needed). */
  onCodeChange?: (code: string) => void;
  /** Tests to run with the code (challenges / exercises). */
  tests?: CodeTest[];
  /**
   * Called after each graded run. For HTML ("web" runtime) the validation result is passed too;
   * when it has errors the page was not rendered and the tests did not run.
   */
  onResult?: (result: RunResult, code: string, html?: HtmlValidation) => void;
  /** How HTML is validated in the "web" runtime. Omitted: detected from the code (free-form playgrounds only). */
  htmlCheck?: HtmlCheck;
  runLabel?: string;
  /** Reset target (defaults to the selected example / initial code). */
  resetCode?: string;
  editorMinHeight?: number;
  id?: string;
}

const RUNTIME_LABEL: Record<Runtime, string> = { js: "JS sandbox", dom: "DOM sandbox", web: "HTML/CSS preview" };
const RUNTIME_HINT: Record<Runtime, string> = {
  js: "Runs in an isolated worker (no DOM, network or storage)",
  dom: "Runs in a sandboxed page with a live preview",
  web: "Renders your HTML and CSS in a sandboxed page with no network access",
};

export function CodeRunner({
  examples,
  initialCode,
  runtime: runtimeProp = "js",
  html: htmlProp,
  title = "Code playground",
  acceptTryIt,
  onCodeChange,
  tests,
  onResult,
  runLabel = "Run",
  resetCode,
  editorMinHeight = 180,
  id,
  htmlCheck: htmlCheckProp,
}: CodeRunnerProps) {
  const { settings } = useLearnerState();
  const [exampleId, setExampleId] = useState(examples?.[0]?.id);
  const example = examples?.find((e) => e.id === exampleId);
  const [runtime, setRuntime] = useState<Runtime>(example?.runtime ?? runtimeProp);
  const [tryItCheck, setTryItCheck] = useState<HtmlCheck | undefined>(undefined);
  const [validation, setValidation] = useState<HtmlValidation | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [repairedPreview, setRepairedPreview] = useState(false);
  const [jumpTo, setJumpTo] = useState<{ line: number; column: number; seq: number }>();
  const [html, setHtml] = useState(example?.html ?? htmlProp ?? "");
  const baseCode = example?.code ?? initialCode ?? "";
  const [code, setCode] = useState(initialCode ?? example?.code ?? "");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [syntaxLine, setSyntaxLine] = useState<number | null>(null);
  const handle = useRef<RunHandle | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const runSeq = useRef(0);

  useEffect(() => () => handle.current?.cancel(), []);

  useEffect(() => {
    if (!acceptTryIt) return;
    const onLoad = (e: Event) => {
      const d = (e as CustomEvent<LoadCodeDetail>).detail;
      setExampleId(undefined);
      setCode(d.code);
      setRuntime(d.runtime);
      setTryItCheck(d.htmlCheck);
      setValidation(null);
      setBlocked(false);
      if (d.runtime !== "dom") setHtml("");
      setLogs([]);
      setResult(null);
    };
    window.addEventListener(LOAD_CODE_EVENT, onLoad);
    return () => window.removeEventListener(LOAD_CODE_EVENT, onLoad);
  }, [acceptTryIt]);

  // Explicit setting first (example, "Try it" block, exercise); free-form playgrounds detect it.
  const configuredCheck = (exampleId ? example?.htmlCheck : tryItCheck) ?? htmlCheckProp;
  const activeCheck: HtmlCheck = configuredCheck ?? { mode: detectHtmlMode(code) };

  /**
   * Run workflow. For HTML: validate first (browsers repair broken markup, so a rendered preview
   * proves nothing); with errors the preview and tests are skipped unless this is a demo, or the
   * learner explicitly asks for the browser's repaired version (`showRepaired`, never graded).
   */
  const run = useCallback(
    async (showRepaired = false) => {
      handle.current?.cancel();
      const seq = ++runSeq.current;
      setLogs([]);
      setResult(null);
      setRunning(true);
      let htmlResult: HtmlValidation | undefined;
      if (runtime === "web") {
        // Loaded on first use so JavaScript-only pages don't download the HTML parsers.
        const { validateHtml } = await import("@/lib/html/validate");
        htmlResult = await validateHtml(code, { mode: activeCheck.mode === "demo" ? "document" : activeCheck.mode, strict: activeCheck.strict });
        if (seq !== runSeq.current) return;
        setValidation(htmlResult);
        const stop = htmlResult.errors > 0 && activeCheck.mode !== "demo" && !showRepaired;
        setBlocked(stop);
        setRepairedPreview(showRepaired && htmlResult.errors > 0);
        if (stop) {
          preview.current?.replaceChildren();
          setRunning(false);
          onResult?.({ logs: [], error: null, errorLine: null, syntaxError: false, tests: [], durationMs: 0 }, code, htmlResult);
          return;
        }
      } else {
        setValidation(null);
        setBlocked(false);
        setRepairedPreview(false);
      }
      const live: LogEntry[] = [];
      const h = runInSandbox({
        // In the web runtime the edited code is the page itself.
        code: runtime === "web" ? "" : code,
        // A repaired preview of invalid HTML is for looking only: no tests, no grading.
        tests: showRepaired ? [] : tests,
        runtime,
        html: runtime === "web" ? code : html,
        timeoutMs: settings.codeTimeoutMs,
        previewContainer: preview.current,
        dark: document.documentElement.dataset.theme === "dark",
        onLog: (l) => {
          live.push(l);
          // Logs after completion (e.g. DOM click handlers) keep streaming in.
          if (seq === runSeq.current) setLogs([...live]);
        },
      });
      handle.current = h;
      const r = await h.result;
      if (seq !== runSeq.current) return;
      setRunning(false);
      setResult(r);
      if (runtime === "js") setLogs(r.logs);
      if (!showRepaired) onResult?.(r, code, htmlResult);
    },
    [code, tests, runtime, html, settings.codeTimeoutMs, onResult, activeCheck.mode, activeCheck.strict],
  );

  const reset = () => {
    handle.current?.cancel();
    setCode(resetCode ?? baseCode);
    setLogs([]);
    setResult(null);
    setRunning(false);
    onCodeChange?.(resetCode ?? baseCode);
  };

  const selectExample = (idValue: string) => {
    const ex = examples?.find((e) => e.id === idValue);
    if (!ex) return;
    handle.current?.cancel();
    setExampleId(idValue);
    setCode(ex.code);
    setRuntime(ex.runtime ?? "js");
    setValidation(null);
    setBlocked(false);
    setHtml(ex.html ?? "");
    setLogs([]);
    setResult(null);
    setRunning(false);
  };

  const errorText = result?.error;

  return (
    <section id={id} className="overflow-hidden rounded-lg border border-border bg-surface" aria-label={title}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <h3 className="mr-auto text-sm font-semibold">{title}</h3>
        {examples && examples.length > 1 && (
          <label className="flex items-center gap-1.5 text-xs text-muted">
            <span className="sr-only sm:not-sr-only">Example</span>
            <select
              value={exampleId ?? ""}
              onChange={(e) => selectExample(e.target.value)}
              className="h-8 max-w-[200px] rounded-md border border-border bg-surface px-2 text-[13px] text-fg"
            >
              {!exampleId && <option value="">Custom code</option>}
              {examples.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="rounded border border-border px-1.5 py-0.5 text-[11px] text-subtle" title={RUNTIME_HINT[runtime]}>
          {RUNTIME_LABEL[runtime]}
        </span>
      </div>
      <div className={cn("grid", runtime !== "js" ? "lg:grid-cols-2" : "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]")}>
        <div className="min-w-0 border-b border-border lg:border-r lg:border-b-0">
          <CodeEditor
            value={code}
            onChange={(v) => {
              setCode(v);
              onCodeChange?.(v);
            }}
            onRun={() => void run()}
            jumpTo={jumpTo}
            onSyntaxCheck={runtime === "web" ? undefined : setSyntaxLine}
            language={runtime === "web" ? "html" : "js"}
            ariaLabel={`${title} code editor. Press Control or Command plus Enter to run. Press Escape then Tab to leave the editor.`}
            minHeight={editorMinHeight}
          />
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
            {running ? (
              <Button variant="secondary" size="sm" onClick={() => handle.current?.cancel()}>
                <Square className="h-3.5 w-3.5" aria-hidden /> Stop
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => void run()} data-testid="run-code">
                <Play className="h-3.5 w-3.5" aria-hidden /> {runLabel}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={reset} title="Restore the original code">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
            </Button>
            <CopyButton text={code} className="h-8 px-2" />
            <Button variant="ghost" size="sm" onClick={() => (setLogs([]), setResult(null))} disabled={!logs.length && !result}>
              <Eraser className="h-3.5 w-3.5" aria-hidden /> Clear output
            </Button>
            <span className="ml-auto hidden text-[11px] text-subtle sm:inline">Ctrl/⌘ + Enter to run</span>
          </div>
          {runtime === "web" && validation && (
            <HtmlDiagnostics
              validation={validation}
              mode={activeCheck.mode}
              autoDetected={!configuredCheck}
              onLocate={(line, column) => setJumpTo((j) => ({ line, column, seq: (j?.seq ?? 0) + 1 }))}
            />
          )}
          {syntaxLine !== null && (
            <p className="border-t border-border bg-warning-soft px-3 py-1.5 text-xs text-warning" role="status">
              Possible syntax error near line {syntaxLine}. Check for missing brackets, quotes or commas.
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          {runtime !== "js" && (
            <div className="border-b border-border">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wide text-subtle uppercase">
                Preview
                {repairedPreview && <span className="normal-case tracking-normal text-warning">Browser-repaired version of invalid HTML (not checked)</span>}
              </div>
              <div className={cn("relative bg-white", runtime === "web" ? "h-72" : "h-56")}>
                {/* The sandbox mounts its iframe here imperatively, so React must not render children inside it. */}
                <div ref={preview} className="h-full w-full" data-testid="dom-preview" />
                {!running && !result && !blocked && <p className="pointer-events-none absolute inset-0 p-3 text-xs text-gray-500">Run the code to render the preview.</p>}
                {blocked && (
                  <div className="absolute inset-0 flex flex-col items-start gap-2 bg-white p-3 text-xs text-gray-700" data-testid="preview-blocked">
                    <p className="font-semibold text-red-700">The preview is paused because your HTML has errors.</p>
                    <p>
                      A browser would still show something: it silently repairs broken markup. That&apos;s why a page appearing doesn&apos;t mean the HTML is correct.
                      Fix the errors listed under the editor, then run again.
                    </p>
                    <button type="button" className="rounded border border-gray-300 px-2 py-1 font-medium hover:bg-gray-100" onClick={() => void run(true)} data-testid="show-repaired">
                      Show the browser&apos;s repaired version
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-subtle uppercase">Console</span>
            {result && !running && (
              <span className="text-[11px] text-subtle">
                {result.timedOut ? "Stopped" : `Finished in ${result.durationMs} ms`}
              </span>
            )}
          </div>
          <div
            className="max-h-80 min-h-[120px] flex-1 overflow-auto bg-code px-3 py-2 font-mono text-[13px]"
            aria-live="polite"
            aria-busy={running}
            data-testid="console-output"
            tabIndex={0}
            role="log"
            aria-label="Console output"
          >
            {running && !logs.length && (
              <span className="flex items-center gap-2 text-subtle">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Running…
              </span>
            )}
            {logs.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "border-b border-code-border/60 py-0.5 whitespace-pre-wrap break-words last:border-0",
                  l.level === "error" && "text-danger",
                  l.level === "warn" && "text-warning",
                  l.level === "info" && "text-info",
                )}
              >
                {l.text}
              </div>
            ))}
            {errorText && (
              <div className="mt-1 rounded border border-danger/30 bg-danger-soft px-2 py-1.5 text-danger" role="alert">
                <div className="font-semibold">{result?.syntaxError ? "Syntax error" : result?.timedOut ? "Timed out" : "Uncaught error"}</div>
                <div className="break-words whitespace-pre-wrap">{errorText}</div>
                {result?.errorLine && <div className="mt-0.5 text-xs">at line {result.errorLine}</div>}
                {result?.syntaxError && syntaxLine && <div className="mt-0.5 text-xs">near line {syntaxLine}</div>}
              </div>
            )}
            {result && !running && !errorText && !logs.length && !result.tests.length && (
              <span className="text-subtle">
                {runtime === "web" ? "Page rendered in the preview. Console messages from <script> tags appear here." : "No output. Use console.log() to print values."}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

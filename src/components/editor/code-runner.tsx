"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Loader2, Play, RotateCcw, Square } from "lucide-react";
import type { CodeExample, CodeTest } from "@/content/types";
import { runInSandbox, type RunHandle } from "@/lib/sandbox/browser";
import type { LogEntry, RunResult } from "@/lib/sandbox/types";
import { useLearnerState } from "@/lib/store/hooks";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/components/ui/cn";
import { LOAD_CODE_EVENT, type LoadCodeDetail } from "@/components/content/try-it-button";
import { CodeEditor } from "./code-editor";

export interface CodeRunnerProps {
  examples?: CodeExample[];
  initialCode?: string;
  runtime?: "js" | "dom";
  html?: string;
  title?: string;
  /** Listen for "Try it" events from static code blocks on the page. */
  acceptTryIt?: boolean;
  /** Persist drafts via this callback (debounced by the caller if needed). */
  onCodeChange?: (code: string) => void;
  /** Tests to run with the code (challenges / exercises). */
  tests?: CodeTest[];
  onResult?: (result: RunResult, code: string) => void;
  runLabel?: string;
  /** Reset target (defaults to the selected example / initial code). */
  resetCode?: string;
  editorMinHeight?: number;
  id?: string;
}

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
}: CodeRunnerProps) {
  const { settings } = useLearnerState();
  const [exampleId, setExampleId] = useState(examples?.[0]?.id);
  const example = examples?.find((e) => e.id === exampleId);
  const [runtime, setRuntime] = useState<"js" | "dom">(example?.runtime ?? runtimeProp);
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
      if (d.runtime === "js") setHtml("");
      setLogs([]);
      setResult(null);
    };
    window.addEventListener(LOAD_CODE_EVENT, onLoad);
    return () => window.removeEventListener(LOAD_CODE_EVENT, onLoad);
  }, [acceptTryIt]);

  const run = useCallback(async () => {
    handle.current?.cancel();
    const seq = ++runSeq.current;
    setLogs([]);
    setResult(null);
    setRunning(true);
    const live: LogEntry[] = [];
    const h = runInSandbox({
      code,
      tests,
      runtime,
      html,
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
    onResult?.(r, code);
  }, [code, tests, runtime, html, settings.codeTimeoutMs, onResult]);

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
        <span className="rounded border border-border px-1.5 py-0.5 text-[11px] text-subtle" title={runtime === "dom" ? "Runs in a sandboxed page with a live preview" : "Runs in an isolated worker (no DOM, network or storage)"}>
          {runtime === "dom" ? "DOM sandbox" : "JS sandbox"}
        </span>
      </div>
      <div className={cn("grid", runtime === "dom" ? "lg:grid-cols-2" : "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]")}>
        <div className="min-w-0 border-b border-border lg:border-r lg:border-b-0">
          <CodeEditor
            value={code}
            onChange={(v) => {
              setCode(v);
              onCodeChange?.(v);
            }}
            onRun={run}
            onSyntaxCheck={setSyntaxLine}
            ariaLabel={`${title} code editor. Press Control or Command plus Enter to run. Press Escape then Tab to leave the editor.`}
            minHeight={editorMinHeight}
          />
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
            {running ? (
              <Button variant="secondary" size="sm" onClick={() => handle.current?.cancel()}>
                <Square className="h-3.5 w-3.5" aria-hidden /> Stop
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={run} data-testid="run-code">
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
          {syntaxLine !== null && (
            <p className="border-t border-border bg-warning-soft px-3 py-1.5 text-xs text-warning" role="status">
              Possible syntax error near line {syntaxLine}. Check for missing brackets, quotes or commas.
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          {runtime === "dom" && (
            <div className="border-b border-border">
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wide text-subtle uppercase">Preview</div>
              <div ref={preview} className="h-56 bg-white" data-testid="dom-preview">
                {!running && !result && <p className="p-3 text-xs text-gray-500">Run the code to render the preview.</p>}
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
              <span className="text-subtle">No output. Use console.log() to print values.</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

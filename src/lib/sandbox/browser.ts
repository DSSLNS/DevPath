/**
 * Browser code execution sandbox.
 *
 * Isolation model (see docs/SECURITY.md):
 *  - Each run creates a fresh <iframe sandbox="allow-scripts"> WITHOUT allow-same-origin.
 *    The iframe therefore has an opaque origin: it cannot read this app's DOM,
 *    cookies, localStorage or IndexedDB, and cannot navigate the top window.
 *  - A Content-Security-Policy inside the iframe (default-src 'none') blocks all
 *    network requests (fetch, XHR, WebSocket, images, scripts from URLs).
 *  - "js" runtime: learner code runs in a Web Worker spawned by the iframe, so even
 *    an infinite loop never blocks the iframe's message handling. On timeout the
 *    whole iframe (and its worker) is destroyed.
 *  - "dom" runtime: learner code runs in the iframe document so it can manipulate a
 *    visible preview. A synchronous infinite loop there is stopped by removing the
 *    iframe on timeout; browsers that run sandboxed iframes in-process may freeze
 *    briefly until that happens.
 *  - No eval/new Function ever runs in the application's own context.
 */
import { SANDBOX_RUNTIME_SOURCE } from "./runtime-source";
import type { LogEntry, RunResult } from "./types";
import type { CodeTest } from "@/content/types";
import { injectIntoHead } from "./web-document";

const CSP_JS = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; style-src 'unsafe-inline'";
const CSP_DOM = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:; font-src data:";

function scriptSafe(s: string) {
  return JSON.stringify(s).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function jsRuntimeDocument() {
  const workerSource =
    SANDBOX_RUNTIME_SOURCE +
    "\n;self.__jsaSetEmitter(function (l) { postMessage({ type: 'log', log: l }); });" +
    "\nself.onmessage = function (ev) { self.onmessage = null; self.__jsaRun(ev.data.code, ev.data.tests).then(function (r) { postMessage({ type: 'done', result: r }); }); };" +
    "\nself.addEventListener('unhandledrejection', function (e) { e.preventDefault(); var r = e.reason; postMessage({ type: 'log', log: { level: 'error', text: 'Uncaught (in promise) ' + (r && r.name ? r.name + ': ' + r.message : String(r)) } }); });";
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP_JS}"></head><body><script>
(function () {
  var src = ${scriptSafe(workerSource)};
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var msg = e.data;
    if (!msg || msg.type !== 'run') return;
    var w;
    try {
      w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    } catch (err) {
      parent.postMessage({ type: 'fatal', error: 'The code sandbox could not start in this browser (' + (err && err.message) + ').' }, '*');
      return;
    }
    w.onmessage = function (ev) { parent.postMessage(ev.data, '*'); };
    w.onerror = function (ev) { ev.preventDefault(); parent.postMessage({ type: 'fatal', error: ev.message || 'Worker error' }, '*'); };
    w.postMessage({ code: msg.code, tests: msg.tests });
  });
  parent.postMessage({ type: 'ready' }, '*');
})();
</script></body></html>`;
}

function domRuntimeDocument(html: string, dark: boolean) {
  const style = `
    :root { color-scheme: ${dark ? "dark" : "light"}; }
    body { font: 14px/1.5 ui-sans-serif, system-ui, sans-serif; margin: 12px; color: ${dark ? "#e6e9ef" : "#16191f"}; background: ${dark ? "#141820" : "#ffffff"}; }
    button, input, select, textarea { font: inherit; }
    .hidden { display: none; }`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${CSP_DOM}"><style>${style}</style></head><body>${html}<script>
(function () {
  ${SANDBOX_RUNTIME_SOURCE}
  window.__jsaSetEmitter(function (l) { parent.postMessage({ type: 'log', log: l }, '*'); });
  window.addEventListener('error', function (e) { parent.postMessage({ type: 'log', log: { level: 'error', text: 'Uncaught ' + (e.error && e.error.name ? e.error.name + ': ' + e.error.message : e.message) } }, '*'); });
  window.addEventListener('unhandledrejection', function (e) { e.preventDefault(); var r = e.reason; parent.postMessage({ type: 'log', log: { level: 'error', text: 'Uncaught (in promise) ' + (r && r.name ? r.name + ': ' + r.message : String(r)) } }, '*'); });
  var ran = false;
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var msg = e.data;
    if (!msg || msg.type !== 'run' || ran) return;
    ran = true;
    window.__jsaRun(msg.code, msg.tests).then(function (r) { parent.postMessage({ type: 'done', result: r }, '*'); });
  });
  parent.postMessage({ type: 'ready' }, '*');
})();
</script></body></html>`;
}

/**
 * "web" runtime: the learner's code IS the page (HTML with optional <style>/<script>).
 * The CSP and the test runtime are injected into its <head>; the runtime signals "ready"
 * only after the document has been parsed so tests see the complete page.
 */
const CSP_WEB = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:";

export function webRuntimeDocument(learnerHtml: string) {
  const inject = `<meta http-equiv="Content-Security-Policy" content="${CSP_WEB}"><script>
(function () {
  ${SANDBOX_RUNTIME_SOURCE}
  window.__jsaSetEmitter(function (l) { parent.postMessage({ type: 'log', log: l }, '*'); });
  window.addEventListener('error', function (e) { parent.postMessage({ type: 'log', log: { level: 'error', text: 'Uncaught ' + (e.error && e.error.name ? e.error.name + ': ' + e.error.message : e.message) } }, '*'); });
  var ran = false;
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent) return;
    var msg = e.data;
    if (!msg || msg.type !== 'run' || ran) return;
    ran = true;
    window.__jsaRun(msg.code, msg.tests).then(function (r) { parent.postMessage({ type: 'done', result: r }, '*'); });
  });
  function ready() { parent.postMessage({ type: 'ready' }, '*'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
</script>`;
  return injectIntoHead(learnerHtml, inject);
}

export interface RunOptions {
  code: string;
  tests?: CodeTest[];
  runtime?: "js" | "dom" | "web";
  /** Body HTML for the dom runtime; the full page for the web runtime. */
  html?: string;
  timeoutMs?: number;
  /** Live log callback (logs also arrive in the final result). */
  onLog?: (log: LogEntry) => void;
  /** Where to mount the visible preview iframe for the dom runtime. */
  previewContainer?: HTMLElement | null;
  dark?: boolean;
}

export interface RunHandle {
  result: Promise<RunResult>;
  /** Stop the run and destroy the sandbox. */
  cancel: () => void;
}

export function runInSandbox(opts: RunOptions): RunHandle {
  const runtime = opts.runtime ?? "js";
  const visible = runtime !== "js";
  const timeoutMs = opts.timeoutMs ?? 5000;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.setAttribute("referrerpolicy", "no-referrer");
  iframe.setAttribute("aria-hidden", visible ? "false" : "true");
  iframe.title = visible ? "Code output preview" : "Code sandbox";
  if (visible && opts.previewContainer) {
    iframe.className = "h-full w-full border-0 bg-white";
    opts.previewContainer.replaceChildren(iframe);
  } else {
    iframe.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(iframe);
  }
  iframe.srcdoc =
    runtime === "web" ? webRuntimeDocument(opts.html ?? "") : runtime === "dom" ? domRuntimeDocument(opts.html ?? "", !!opts.dark) : jsRuntimeDocument();

  const logs: LogEntry[] = [];
  let settled = false;
  let resolveFn!: (r: RunResult) => void;
  const result = new Promise<RunResult>((r) => (resolveFn = r));
  const started = performance.now();

  const cleanupListener = () => window.removeEventListener("message", onMessage);
  const destroy = () => {
    cleanupListener();
    iframe.remove();
  };
  const finish = (r: RunResult, keepAlive = false) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    // DOM previews stay mounted so learners can interact with the result; logs keep streaming.
    if (!keepAlive) destroy();
    resolveFn(r);
  };

  function onMessage(e: MessageEvent) {
    if (e.source !== iframe.contentWindow) return;
    const msg = e.data as { type: string; log?: LogEntry; result?: RunResult; error?: string };
    if (msg.type === "ready") {
      iframe.contentWindow?.postMessage({ type: "run", code: opts.code, tests: opts.tests ?? [] }, "*");
    } else if (msg.type === "log" && msg.log) {
      if (!settled) logs.push(msg.log);
      opts.onLog?.(msg.log);
    } else if (msg.type === "done" && msg.result) {
      finish({ ...msg.result, durationMs: Math.round(performance.now() - started) }, visible);
    } else if (msg.type === "fatal") {
      finish({ logs, error: msg.error ?? "Sandbox error", errorLine: null, syntaxError: false, tests: [], durationMs: 0 });
    }
  }
  window.addEventListener("message", onMessage);

  const timer = setTimeout(() => {
    finish({
      logs,
      error: `Execution stopped after ${Math.round(timeoutMs / 1000)}s. Check for an infinite loop, a timer that is never cleared, or a promise that never settles.`,
      errorLine: null,
      syntaxError: false,
      timedOut: true,
      tests: [],
      durationMs: timeoutMs,
    });
  }, timeoutMs);

  return {
    result,
    cancel: () => {
      if (!settled) {
        finish({ logs, error: "Run cancelled.", errorLine: null, syntaxError: false, tests: [], durationMs: Math.round(performance.now() - started) });
      }
      destroy();
    },
  };
}

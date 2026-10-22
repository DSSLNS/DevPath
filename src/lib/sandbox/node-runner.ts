/**
 * Node-side runner used ONLY by tests and content tooling (never shipped to the browser).
 * Executes code with the exact same runtime the browser sandbox uses, inside a fresh vm context.
 */
import vm from "node:vm";
import { SANDBOX_RUNTIME_SOURCE } from "./runtime-source";
import type { RunResult } from "./types";
import { injectIntoHead } from "./web-document";
import type { CodeTest } from "@/content/types";

export async function runInNode(code: string, tests: CodeTest[] = [], timeoutMs = 4000): Promise<RunResult> {
  const context = vm.createContext({
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    queueMicrotask,
    structuredClone,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    AbortController,
    AbortSignal,
    Headers: globalThis.Headers,
    Request: globalThis.Request,
    Response: globalThis.Response,
    Blob: globalThis.Blob,
    FormData: globalThis.FormData,
    Intl,
    // fetch is deliberately absent: sandbox code has no network access.
  });
  vm.runInContext(SANDBOX_RUNTIME_SOURCE, context);
  const run = vm.runInContext("__jsaRun", context) as (c: string, t: CodeTest[]) => Promise<RunResult>;

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<RunResult>((resolve) => {
    timer = setTimeout(
      () =>
        resolve({
          logs: [],
          error: `Execution timed out after ${timeoutMs}ms`,
          errorLine: null,
          syntaxError: false,
          timedOut: true,
          tests: [],
          durationMs: timeoutMs,
        }),
      timeoutMs,
    );
  });
  try {
    const result = await Promise.race([run(code, tests), timeout]);
    // Results come from another realm; normalise to plain data.
    return JSON.parse(JSON.stringify(result)) as RunResult;
  } finally {
    clearTimeout(timer);
  }
}

export function logsToOutput(result: RunResult): string {
  return result.logs.map((l) => l.text).join("\n");
}

/** Runs code against an HTML document using jsdom (for "dom" runtime content). */
export function runInJsdom(html: string, code: string, tests: CodeTest[] = [], timeoutMs = 4000): Promise<RunResult> {
  return runInJsdomDocument(`<!doctype html><html><body>${html}</body></html>`, code, tests, timeoutMs);
}

/**
 * Runs tests against a learner-written page (for "web" runtime content). Learner <script>
 * elements are not executed here; web-runtime tests check markup and styles.
 */
export function runWebPage(page: string, tests: CodeTest[] = [], timeoutMs = 4000): Promise<RunResult> {
  return runInJsdomDocument(injectIntoHead(page, ""), "", tests, timeoutMs);
}

async function runInJsdomDocument(documentHtml: string, code: string, tests: CodeTest[], timeoutMs: number): Promise<RunResult> {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM(documentHtml, { runScripts: "outside-only" });
  const win = dom.window as unknown as { eval: (s: string) => unknown; __jsaRun: (c: string, t: CodeTest[]) => Promise<RunResult> };
  win.eval(SANDBOX_RUNTIME_SOURCE);
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<RunResult>((resolve) => {
    timer = setTimeout(
      () =>
        resolve({ logs: [], error: `Execution timed out after ${timeoutMs}ms`, errorLine: null, syntaxError: false, timedOut: true, tests: [], durationMs: timeoutMs }),
      timeoutMs,
    );
  });
  try {
    const result = await Promise.race([win.__jsaRun(code, tests), timeout]);
    return JSON.parse(JSON.stringify(result)) as RunResult;
  } finally {
    clearTimeout(timer);
    dom.window.close();
  }
}

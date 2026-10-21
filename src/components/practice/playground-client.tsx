"use client";

import { useRef, useState } from "react";
import type { CodeExample } from "@/content/types";
import { CodeRunner } from "@/components/editor/code-runner";
import { useStoreMeta } from "@/lib/store/hooks";

const DRAFT_KEY = "jsacademy:playground-draft";

type Library = (CodeExample & { group: string })[];

export function PlaygroundClient(props: { starter: string; library: Library }) {
  const meta = useStoreMeta();
  if (!meta.hydrated) return <div className="h-72 animate-pulse rounded-lg bg-surface" aria-busy="true" />;
  return <Playground {...props} />;
}

function readDraft() {
  try {
    return window.localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

function Playground({ starter, library }: { starter: string; library: Library }) {
  const [initial, setInitial] = useState(() => readDraft() ?? starter);
  const [selected, setSelected] = useState("");
  const [key, setKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [runtime, setRuntime] = useState<"js" | "dom">("js");
  const [html, setHtml] = useState("");

  const groups = [...new Set(library.map((e) => e.group))];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="w-full min-w-0 text-sm sm:w-auto">
          <span className="mb-1 block text-xs text-muted">Load an example from the library</span>
          <select
            value={selected}
            onChange={(e) => {
              const ex = library.find((x) => x.id === e.target.value);
              setSelected(e.target.value);
              if (ex) {
                setInitial(ex.code);
                setRuntime(ex.runtime ?? "js");
                setHtml(ex.html ?? "");
                setKey((k) => k + 1);
              }
            }}
            className="h-9 w-full rounded-md border border-border bg-surface px-2 text-sm sm:w-96"
          >
            <option value="">Choose an example ({library.length} available)…</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {library
                  .filter((e) => e.group === g)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Environment</span>
          <select
            value={runtime}
            onChange={(e) => {
              setRuntime(e.target.value as "js" | "dom");
              setKey((k) => k + 1);
            }}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
          >
            <option value="js">JavaScript (worker, no DOM)</option>
            <option value="dom">DOM page with preview</option>
          </select>
        </label>
      </div>
      <CodeRunner
        key={key}
        title="Playground"
        initialCode={initial}
        resetCode={starter}
        runtime={runtime}
        html={runtime === "dom" ? html || '<div id="app"><h1>Hello</h1><button id="btn">Click me</button></div>' : ""}
        editorMinHeight={320}
        onCodeChange={(code) => {
          clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            try {
              window.localStorage.setItem(DRAFT_KEY, code);
            } catch {
              /* storage unavailable: the global banner already explains this */
            }
          }, 500);
        }}
      />
    </div>
  );
}

"use client";

import { Play } from "lucide-react";

export const LOAD_CODE_EVENT = "jsa:load-code";
export interface LoadCodeDetail {
  code: string;
  runtime: "js" | "dom";
}

/** Sends a code snippet to the page's playground (if any) and scrolls to it. */
export function TryItButton({ code, runtime }: { code: string; runtime: "js" | "dom" }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent<LoadCodeDetail>(LOAD_CODE_EVENT, { detail: { code, runtime } }));
        document.getElementById("playground")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="inline-flex h-6 items-center gap-1 rounded px-1.5 text-xs font-medium text-primary hover:bg-primary-soft"
    >
      <Play className="h-3 w-3" aria-hidden />
      Try it
    </button>
  );
}

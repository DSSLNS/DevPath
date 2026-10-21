"use client";

import { useEffect, useState } from "react";
import type { SearchDoc } from "./types";

let cache: Promise<SearchDoc[]> | null = null;

export function loadSearchIndex() {
  if (!cache) {
    cache = fetch("/search-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<SearchDoc[]>;
      })
      .catch((e) => {
        cache = null;
        throw e;
      });
  }
  return cache;
}

export function useSearchIndex(enabled = true) {
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadSearchIndex()
      .then((d) => alive && (setDocs(d), setError(null)))
      .catch(() => alive && setError("The search index could not be loaded. Check your connection and try again."));
    return () => {
      alive = false;
    };
  }, [enabled, attempt]);
  return { docs, error, retry: () => setAttempt((a) => a + 1) };
}

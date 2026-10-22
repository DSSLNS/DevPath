"use client";

/**
 * StorageAdapter for signed-in learners: progress is saved to /api/progress.
 *
 * - Saves are debounced and sent one at a time with the last known `revision`.
 * - A 409 means another device saved first: the server copy and the local copy are merged
 *   (`mergeStates`) and saved again, so neither device loses progress.
 * - Network or server failures keep the latest unsaved snapshot in memory and retry with
 *   backoff, and immediately when the browser comes back online.
 * - Nothing is written to localStorage, so signing out leaves no account data behind.
 */
import { useSyncExternalStore } from "react";
import { mergeStates } from "./merge";
import { createDefaultState, parseState, type PersistedState } from "./schema";
import type { StorageAdapter } from "./store";

export type SyncStatus = "synced" | "saving" | "offline" | "signed-out" | "error";

let status: SyncStatus = "synced";
const listeners = new Set<() => void>();
function setStatus(next: SyncStatus) {
  if (next === status) return;
  status = next;
  listeners.forEach((l) => l());
}
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => status,
    () => "synced",
  );
}

const DEBOUNCE_MS = 800;
const RETRY_MS = [3_000, 10_000, 30_000, 60_000];
const KEEPALIVE_LIMIT = 60_000;

export interface ServerAdapterOptions {
  initial: PersistedState | null;
  revision: number;
  /** Called with a merged state after a conflict; the store replaces its state and saves again. */
  onMerged: (state: PersistedState) => void;
  getLocal: () => PersistedState;
  fetchFn?: typeof fetch;
}

export function serverAdapter({ initial, revision: startRevision, onMerged, getLocal, fetchFn = fetch }: ServerAdapterOptions): StorageAdapter & { flush: () => Promise<void> } {
  let revision = startRevision;
  let pending: string | null = null;
  let inflight = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let retry = 0;
  let stopped = false;

  const body = (serialized: string) => `{"baseRevision":${revision},"state":${serialized}}`;

  async function push(): Promise<void> {
    clearTimeout(timer);
    if (inflight || pending === null || stopped) return;
    const serialized = pending;
    pending = null;
    inflight = true;
    setStatus("saving");
    try {
      const res = await fetchFn("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: body(serialized), credentials: "same-origin" });
      if (res.ok) {
        revision = ((await res.json()) as { revision: number }).revision;
        retry = 0;
        setStatus(pending === null ? "synced" : "saving");
      } else if (res.status === 409) {
        const data = (await res.json()) as { revision: number; state: PersistedState | null };
        revision = data.revision;
        const server = data.state ? parseState(JSON.stringify(data.state)).state : createDefaultState();
        // The local copy has the learner's latest intent (including settings); keep everything from both.
        onMerged(mergeStates(server, getLocal(), { settingsFrom: "incoming" }));
      } else if (res.status === 401) {
        await res.text().catch(() => "");
        stopped = true;
        setStatus("signed-out");
      } else if (res.status === 400 || res.status === 413) {
        await res.text().catch(() => "");
        setStatus("error");
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      pending ??= serialized;
      setStatus("offline");
      timer = setTimeout(() => void push(), RETRY_MS[Math.min(retry++, RETRY_MS.length - 1)]);
    } finally {
      inflight = false;
    }
    if (pending !== null && status !== "offline" && !stopped) void push();
  }

  const onOnline = () => {
    retry = 0;
    void push();
  };
  const onPageHide = () => {
    if (pending === null || inflight) return;
    const payload = body(pending);
    if (payload.length > KEEPALIVE_LIMIT) return;
    pending = null;
    void fetchFn("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true, credentials: "same-origin" }).catch(() => {});
  };
  if (typeof window !== "undefined") {
    window.addEventListener("online", onOnline);
    window.addEventListener("pagehide", onPageHide);
  }

  return {
    load: () => (initial ? JSON.stringify(initial) : null),
    save(serialized) {
      if (stopped) return;
      pending = serialized;
      setStatus("saving");
      clearTimeout(timer);
      timer = setTimeout(() => void push(), DEBOUNCE_MS);
    },
    flush: push,
  };
}

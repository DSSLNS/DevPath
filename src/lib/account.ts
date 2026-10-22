"use client";

import { useSyncExternalStore } from "react";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
}

export type AccountState =
  | { status: "loading" }
  | { status: "guest"; /** Set when a signed-in session could not be loaded (server unreachable). */ error?: string }
  | { status: "signed-in"; user: AccountUser };

let state: AccountState = { status: "loading" };
const listeners = new Set<() => void>();

export const accountStore = {
  get: () => state,
  set(next: AccountState) {
    state = next;
    listeners.forEach((l) => l());
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

const serverSnapshot: AccountState = { status: "loading" };

export function useAccount(): AccountState {
  return useSyncExternalStore(accountStore.subscribe, accountStore.get, () => serverSnapshot);
}

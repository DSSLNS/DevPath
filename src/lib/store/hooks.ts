"use client";

import { useSyncExternalStore } from "react";
import { createDefaultState, type PersistedState } from "./schema";
import { learnerStore, type StoreMeta } from "./store";

const serverState = createDefaultState();
const serverMeta: StoreMeta = { saveStatus: "idle", recovered: false, storageUnavailable: false, hydrated: false };

/** Full learner state. During SSR and hydration this is the empty default state. */
export function useLearnerState(): PersistedState {
  return useSyncExternalStore(learnerStore.subscribe, learnerStore.getState, () => serverState);
}

export function useStoreMeta(): StoreMeta {
  return useSyncExternalStore(learnerStore.subscribe, learnerStore.getMeta, () => serverMeta);
}

export { learnerStore };

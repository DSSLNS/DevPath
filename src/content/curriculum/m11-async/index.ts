import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { syncVsAsync } from "./sync-vs-async";
import { callbacks } from "./callbacks";
import { callbackNesting } from "./callback-nesting";

export const asyncModule: Module = {
  id: "m11",
  slug: "async",
  order: 11,
  title: "Asynchronous JavaScript",
  description:
    "Master callbacks, promises, async/await, the event loop and fetch, including loading, error and race conditions.",
  prerequisites: ["m07"],
  path: "javascript",
  lessons: [syncVsAsync, callbacks, callbackNesting],
};

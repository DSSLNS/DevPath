import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { whatIsDom } from "./what-is-dom";
import { selectingElements } from "./selecting-elements";
import { updatingContent } from "./updating-content";

export const domModule: Module = {
  id: "m10",
  slug: "dom",
  order: 10,
  title: "DOM and Browser APIs",
  description:
    "Read and change web pages with the DOM, handle events and forms, and use browser storage and APIs.",
  prerequisites: ["m07"],
  path: "javascript",
  lessons: [whatIsDom, selectingElements, updatingContent],
};

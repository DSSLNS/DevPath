import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { creationIndexing } from "./creation-indexing";
import { addingRemoving } from "./adding-removing";
import { pushPopShiftUnshift } from "./push-pop-shift-unshift";
import { sliceVsSplice } from "./slice-vs-splice";
import { includesIndexof } from "./includes-indexof";
import { map } from "./map";

export const arraysModule: Module = {
  id: "m06",
  slug: "arrays",
  order: 6,
  title: "Arrays",
  description:
    "Create, read and transform lists of data with array methods like map, filter, reduce and find.",
  prerequisites: ["m05"],
  path: "javascript",
  lessons: [creationIndexing, addingRemoving, pushPopShiftUnshift, sliceVsSplice, includesIndexof, map],
};

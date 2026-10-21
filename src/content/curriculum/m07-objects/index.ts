import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { objectLiterals } from "./object-literals";

export const objectsModule: Module = {
  id: "m07",
  slug: "objects",
  order: 7,
  title: "Objects",
  description:
    "Model real data with objects, copy them safely, and transform API-shaped data.",
  prerequisites: ["m06"],
  path: "javascript",
  lessons: [objectLiterals],
};

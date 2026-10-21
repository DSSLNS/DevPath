import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { declarations } from "./declarations";
import { expressions } from "./expressions";
import { arrowFunctions } from "./arrow-functions";

export const functionsModule: Module = {
  id: "m05",
  slug: "functions",
  order: 5,
  title: "Functions",
  description:
    "Write reusable functions, understand scope and closures, and use callbacks, higher-order functions and composition.",
  prerequisites: ["m04"],
  path: "javascript",
  lessons: [declarations, expressions, arrowFunctions],
};

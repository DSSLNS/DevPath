import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { executionContext } from "./execution-context";
import { callStack } from "./call-stack";
import { hoisting } from "./hoisting";

export const advancedModule: Module = {
  id: "m09",
  slug: "advanced",
  order: 9,
  title: "Advanced JavaScript",
  description:
    "Understand how JavaScript really runs: execution context, hoisting, this, prototypes, classes and memory.",
  prerequisites: ["m08"],
  path: "javascript",
  lessons: [executionContext, callStack, hoisting],
};

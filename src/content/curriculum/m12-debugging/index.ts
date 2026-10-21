import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { syntaxErrors } from "./syntax-errors";
import { runtimeErrors } from "./runtime-errors";
import { customErrors } from "./custom-errors";
import { stackTraces } from "./stack-traces";

export const debuggingModule: Module = {
  id: "m12",
  slug: "debugging",
  order: 12,
  title: "Errors, Debugging, and Code Quality",
  description:
    "Find and fix bugs systematically, throw and handle errors, and keep code readable, linted and tested.",
  prerequisites: ["m05"],
  path: "javascript",
  lessons: [syntaxErrors, runtimeErrors, customErrors, stackTraces],
};

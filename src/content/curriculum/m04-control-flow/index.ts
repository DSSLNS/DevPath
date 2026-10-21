import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { ifElse } from "./if-else";
import { switchStatement } from "./switch";
import { forLoops } from "./for-loops";
import { breakContinue } from "./break-continue";
import { nestedLoops } from "./nested-loops";

export const controlFlowModule: Module = {
  id: "m04",
  slug: "control-flow",
  order: 4,
  title: "Conditional Statements and Loops",
  description:
    "Make decisions with if and switch, repeat work with loops, and choose between loops and array methods.",
  prerequisites: ["m03"],
  path: "javascript",
  lessons: [ifElse, switchStatement, forLoops, breakContinue, nestedLoops],
};

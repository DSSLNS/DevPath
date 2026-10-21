import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { arithmetic } from "./arithmetic";
import { assignment } from "./assignment";
import { truthyFalsy } from "./truthy-falsy";
import { ternary } from "./ternary";
import { nullishCoalescing } from "./nullish-coalescing";

export const operatorsModule: Module = {
  id: "m03",
  slug: "operators",
  order: 3,
  title: "Operators and Expressions",
  description:
    "Combine values with arithmetic, comparison and logical operators, and use modern operators like ?? and ?. safely.",
  prerequisites: ["m02"],
  path: "javascript",
  lessons: [arithmetic, assignment, truthyFalsy, ternary, nullishCoalescing],
};

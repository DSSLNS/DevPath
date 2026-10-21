import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)

export const typescriptModule: Module = {
  id: "m15",
  slug: "typescript",
  order: 15,
  title: "TypeScript Foundations",
  description:
    "Add static types to JavaScript: primitives, objects, unions, generics, narrowing and typed API responses.",
  prerequisites: ["m08"],
  path: "javascript",
  optional: true,
  lessons: [],
};

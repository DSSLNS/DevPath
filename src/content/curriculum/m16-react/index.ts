import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { whyReact } from "./why-react";
import { components } from "./components";
import { jsx } from "./jsx";
import { props } from "./props";

export const reactModule: Module = {
  id: "m16",
  slug: "react",
  order: 16,
  title: "React Fundamentals",
  description:
    "Build user interfaces with components, props, state, hooks, forms, routing and API integration.",
  prerequisites: ["m10", "m11"],
  path: "javascript",
  optional: true,
  lessons: [whyReact, components, jsx, props],
};

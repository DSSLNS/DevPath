import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { whatIsCss } from "./what-is-css";
import { selectors } from "./selectors";
import { cascadeSpecificity } from "./cascade-specificity";
import { boxModel } from "./box-model";

export const cssModule: Module = {
  id: "m18",
  slug: "css",
  order: 18,
  title: "CSS Foundations",
  description: "Style and lay out pages with CSS: selectors, the cascade, the box model, Flexbox, Grid and responsive design.",
  prerequisites: ["m17"],
  path: "frontend-developer",
  lessons: [whatIsCss, selectors, cascadeSpecificity, boxModel],
};

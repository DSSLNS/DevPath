import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { whatIsProgramming } from "./what-is-programming";
import { whatIsJavascript } from "./what-is-javascript";
import { howWebsitesWork } from "./how-websites-work";
import { frontendVsBackend } from "./frontend-vs-backend";

export const introductionModule: Module = {
  id: "m01",
  slug: "introduction",
  order: 1,
  title: "Introduction to Programming",
  description:
    "Understand what programming is, how the web works, and write and run your first JavaScript program.",
  prerequisites: [],
  path: "javascript",
  lessons: [whatIsProgramming, whatIsJavascript, howWebsitesWork, frontendVsBackend],
};

import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { whatIsHtml } from "./what-is-html";
import { documentStructure } from "./document-structure";
import { textContent } from "./text-content";
import { links } from "./links";

export const htmlModule: Module = {
  id: "m17",
  slug: "html",
  order: 17,
  title: "HTML Foundations",
  description: "Structure web pages with meaningful, accessible HTML: documents, text, links, media, lists, tables and forms.",
  prerequisites: [],
  path: "frontend-developer",
  lessons: [whatIsHtml, documentStructure, textContent, links],
};

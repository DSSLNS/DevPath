import type { LearningPath } from "@/content/types";

export const learningPaths: LearningPath[] = [
  {
    id: "javascript",
    title: "JavaScript: Zero to Professional",
    description: "The full curriculum, from your first program to advanced JavaScript, TypeScript and React.",
    moduleIds: ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12", "m13", "m14", "m15", "m16"],
  },
  {
    id: "qa-automation",
    title: "JavaScript for QA Automation",
    description: "The JavaScript a QA engineer needs for Cypress and Playwright, paired with the E2E knowledge base.",
    moduleIds: ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m10", "m11", "m12", "m14"],
  },
  {
    id: "react-ready",
    title: "Strong Foundations for React",
    description: "For React developers who want deeper JavaScript knowledge before (or alongside) React itself.",
    moduleIds: ["m05", "m06", "m07", "m08", "m09", "m11", "m15", "m16"],
  },
];

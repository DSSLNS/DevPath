export type SearchCategory = "lesson" | "concept" | "example" | "exercise" | "kb" | "challenge" | "project" | "glossary" | "note";

export interface SearchDoc {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  url: string;
  tags: string[];
  /** Body text used for matching (truncated). */
  text: string;
  difficulty?: string;
  tech?: string[];
}

export const CATEGORY_LABEL: Record<SearchCategory, string> = {
  lesson: "Lessons",
  concept: "Concepts",
  example: "Code examples",
  exercise: "Exercises",
  kb: "E2E & reference notes",
  challenge: "Practice challenges",
  project: "Projects",
  glossary: "Glossary",
  note: "My notes",
};

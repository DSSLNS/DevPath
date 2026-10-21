/**
 * Content model for JS Academy.
 *
 * All curriculum, knowledge-base, practice and project content is authored as
 * typed TypeScript data. Text fields marked "inline markdown" support:
 *   `code`, **bold**, *italic*, [link text](https://url)
 * Nothing in content is ever rendered as raw HTML.
 *
 * IDs must be globally unique and stable. Never derive IDs from array positions.
 */

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Tech =
  | "javascript"
  | "typescript"
  | "react"
  | "dom"
  | "node"
  | "cypress"
  | "playwright";

export type CodeLanguage = "js" | "ts" | "jsx" | "tsx" | "html" | "css" | "bash" | "json" | "text";

/** "js" runs in an isolated Web Worker (no DOM). "dom" runs in a sandboxed iframe document with a visible preview. */
export type Runtime = "js" | "dom";

export interface Reference {
  title: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Rich content blocks
// ---------------------------------------------------------------------------

export type Block =
  | { kind: "paragraph"; text: string /* inline markdown */ }
  | { kind: "heading"; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] /* inline markdown */ }
  | {
      kind: "code";
      code: string;
      language?: CodeLanguage;
      title?: string;
      /** Exact expected console output (lines separated by \n). Verified by the content test suite for runnable js. */
      output?: string;
      /** Show a "Try it" button that loads this code into the playground runner. */
      runnable?: boolean;
      runtime?: Runtime;
    }
  | {
      kind: "callout";
      tone: "info" | "tip" | "warning" | "danger";
      title?: string;
      text: string; // inline markdown
    }
  | { kind: "table"; caption?: string; headers: string[]; rows: string[][] /* inline markdown cells */ }
  | {
      /** A step-by-step flow or timeline diagram (e.g. event loop order, request lifecycle). */
      kind: "diagram";
      title: string;
      variant?: "flow" | "timeline" | "stack";
      steps: { label: string; detail?: string }[];
    }
  | { kind: "terms"; items: { term: string; definition: string }[] };

export interface ContentSection {
  /** Stable anchor id, kebab-case, unique within the lesson/note. */
  id: string;
  title: string;
  blocks: Block[];
}

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

/**
 * An automated test executed inside the sandbox after the learner's code.
 * `code` is JavaScript statements that may use the global `assert` helper:
 *   assert.equal(actual, expected, message?)      // Object.is / === semantics
 *   assert.deepEqual(actual, expected, message?)  // structural equality
 *   assert.ok(value, message?)
 *   assert.throws(fn, message?)
 *   await assert.rejects(promiseOrFn, message?)
 * Tests may be async (top-level await is allowed). Tests can also read
 * `__logs` (array of strings printed via console.log by the learner's code).
 */
export interface CodeTest {
  name: string;
  code: string;
}

export interface ChoiceOption {
  id: string; // e.g. "a", "b", "c"
  text: string; // inline markdown
  /** Why this option is right or wrong. Shown after submission. */
  explanation?: string;
}

interface ExerciseBase {
  /** Globally unique id, e.g. "arrays-map-ex-1". */
  id: string;
  difficulty: Difficulty;
  /** Question / task statement (inline markdown). */
  prompt: string;
  instructions?: string;
  hints: string[];
  /** Explanation of the correct answer (inline markdown), shown after submission or on reveal. */
  explanation: string;
  /** Marks a find-the-bug / debugging task for curriculum requirements. */
  debugging?: boolean;
}

export interface McqExercise extends ExerciseBase {
  type: "mcq";
  code?: string;
  options: ChoiceOption[];
  answer: string; // option id
}

export interface MultiSelectExercise extends ExerciseBase {
  type: "multi-select";
  code?: string;
  options: ChoiceOption[];
  answers: string[]; // option ids
}

export interface TrueFalseExercise extends ExerciseBase {
  type: "true-false";
  code?: string;
  answer: boolean;
}

export interface PredictOutputExercise extends ExerciseBase {
  type: "predict-output";
  code: string;
  /** Exact console output; lines separated by \n. Compared after trimming each line. */
  answer: string;
}

export interface FindBugExercise extends ExerciseBase {
  type: "find-bug";
  /** Buggy code the learner must fix. */
  code: string;
  tests: CodeTest[];
  solution: string;
}

export interface FillBlankExercise extends ExerciseBase {
  type: "fill-blank";
  /** Code template; each blank is written as `___` (three underscores). */
  template: string;
  /** One entry per `___` in order; each lists accepted answers (compared whitespace-insensitively). */
  blanks: { answers: string[] }[];
}

export interface CodeExercise extends ExerciseBase {
  type: "code";
  starter: string;
  tests: CodeTest[];
  solution: string;
}

export interface MatchExercise extends ExerciseBase {
  type: "match";
  pairs: { left: string; right: string }[];
}

export interface OrderExercise extends ExerciseBase {
  type: "order";
  /** Steps in the CORRECT order. The UI shuffles them. */
  steps: string[];
}

export interface ShortAnswerExercise extends ExerciseBase {
  type: "short-answer";
  /**
   * Keyword groups. An answer passes when it mentions at least one keyword
   * from each group (case-insensitive). Shown to the learner as a
   * keyword-based check, not as a full grade.
   */
  keywords: string[][];
  sampleAnswer: string;
}

export type Exercise =
  | McqExercise
  | MultiSelectExercise
  | TrueFalseExercise
  | PredictOutputExercise
  | FindBugExercise
  | FillBlankExercise
  | CodeExercise
  | MatchExercise
  | OrderExercise
  | ShortAnswerExercise;

export type ExerciseType = Exercise["type"];

// ---------------------------------------------------------------------------
// Curriculum
// ---------------------------------------------------------------------------

export interface CodeExample {
  id: string;
  title: string;
  code: string;
  runtime?: Runtime;
  /** For runtime "dom": HTML body markup the script runs against. */
  html?: string;
}

export interface CommonMistake {
  title: string;
  wrong?: string; // code
  right?: string; // code
  explanation: string; // inline markdown
}

export interface Lesson {
  /** Globally unique, e.g. "arrays-map". */
  id: string;
  /** URL segment, unique within the module, e.g. "map". */
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  minutes: number;
  tech: Tech[];
  tags: string[];
  /** Optional / advanced / framework-specific content label. */
  optional?: boolean;
  objectives: string[];
  /** Lesson ids the learner should know first. */
  prerequisites: string[];
  /** Beginner-friendly introduction (why this matters). */
  intro: Block[];
  /** New technical terms introduced by this lesson. */
  terms: { term: string; definition: string }[];
  /**
   * Main teaching sections. Should include (in this order where relevant):
   * explanation, syntax, examples (with expected output), code walkthrough,
   * real-world application.
   */
  sections: ContentSection[];
  commonMistakes: CommonMistake[];
  debugging: string[]; // inline markdown tips
  /** Interactive playground examples shown in the lesson's code runner. */
  examples: CodeExample[];
  /** Practice: at least 2 beginner, 1 intermediate, 1 debugging (configurable per lesson via `requirements`). */
  exercises: Exercise[];
  /** Lesson quiz: at least 3 multiple-choice questions. */
  quiz: Exercise[];
  /** Short practical challenge. */
  challenge: Exercise;
  /** Key takeaways shown at the end of the lesson. */
  keyPoints: string[];
  related: string[]; // lesson ids
  references: Reference[];
  /** Override default practice requirements for this lesson. */
  requirements?: Partial<PracticeRequirements>;
}

export interface PracticeRequirements {
  beginner: number;
  intermediate: number;
  debugging: number;
  quizMcq: number;
}

export interface Module {
  id: string; // e.g. "m06-arrays"
  slug: string; // e.g. "arrays"
  order: number;
  title: string;
  description: string;
  prerequisites: string[]; // module ids
  /** Learning path this module belongs to. Supports adding new paths later. */
  path: string;
  optional?: boolean;
  lessons: Lesson[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  moduleIds: string[];
}

// ---------------------------------------------------------------------------
// Knowledge base (E2E testing notes + JS reference notes)
// ---------------------------------------------------------------------------

export type KbCategory =
  | "fundamentals"
  | "js-for-testing"
  | "cypress"
  | "playwright"
  | "ecommerce"
  | "best-practices";

export interface KbNote {
  id: string; // e.g. "cy-intercept"
  slug: string; // unique across the knowledge base
  category: KbCategory;
  title: string;
  summary: string;
  tech: Tech[];
  difficulty: Difficulty;
  tags: string[];
  prerequisites: string[]; // inline markdown items
  explanation: Block[];
  /** Syntax reference (code blocks). */
  syntax: Block[];
  /** Complete working code. */
  code: { title: string; language: CodeLanguage; code: string };
  /** Line-by-line explanation of `code`. `line` is the snippet being explained. */
  walkthrough: { line: string; explanation: string }[];
  whenToUse: string[];
  mistakes: string[];
  debugging: string[];
  relatedNotes: string[]; // KbNote ids
  relatedLessons: string[]; // Lesson ids
  practice: string; // small practice task (inline markdown)
  docs: Reference[];
  /** Tool version the note was written against, e.g. "Cypress 13+". */
  versionNote?: string;
}

// ---------------------------------------------------------------------------
// Practice lab
// ---------------------------------------------------------------------------

export type ChallengeTopic =
  | "fundamentals"
  | "arrays"
  | "objects"
  | "functions"
  | "async"
  | "dom"
  | "api"
  | "debugging"
  | "react"
  | "cypress"
  | "playwright";

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  topic: ChallengeTopic;
  difficulty: Difficulty;
  minutes: number;
  statement: Block[];
  expectedBehavior: string[];
  starter: string;
  hints: string[];
  /**
   * "js": validated automatically by `tests` in the worker sandbox.
   * "dom": validated automatically by `tests` running in the sandboxed DOM document (`html` is the page body).
   * "manual": cannot be executed in the browser (React/Cypress/Playwright); the learner self-reviews against `checklist`.
   */
  validation: "js" | "dom" | "manual";
  html?: string;
  tests?: CodeTest[];
  checklist?: string[];
  solution: string;
  explanation: string;
  relatedLessons: string[];
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectFile {
  filename: string;
  language: CodeLanguage;
  code: string;
}

export interface Project {
  id: string;
  slug: string;
  order: number;
  title: string;
  summary: string;
  difficulty: Difficulty;
  tech: Tech[];
  hours: number;
  relatedLessons: string[];
  intro: Block[];
  requirements: string[];
  userStories: string[];
  skills: string[];
  steps: { id: string; title: string; blocks: Block[] }[];
  starter: ProjectFile[];
  solution: ProjectFile[];
  decisions: { title: string; text: string }[];
  testingChecklist: string[];
  extensions: string[];
}

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string; // inline markdown
  lessonIds: string[];
  tags: string[];
}

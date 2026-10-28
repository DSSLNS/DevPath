/**
 * Structural validation for all bundled content. Pure (no execution) so it can
 * run anywhere. Executable checks (solutions pass tests, outputs match) live in
 * scripts/content-check.ts and src/content/content.test.ts.
 */
import type {
  Block,
  Challenge,
  Exercise,
  GlossaryTerm,
  KbNote,
  Lesson,
  Module,
  PracticeRequirements,
  Project,
} from "./types";
import { allManifestLessonIds, curriculumManifest, lessonIdFor } from "./curriculum/manifest";

export interface ContentIssue {
  where: string;
  message: string;
}

export const DEFAULT_REQUIREMENTS: PracticeRequirements = {
  beginner: 2,
  intermediate: 1,
  debugging: 1,
  quizMcq: 3,
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function checkInline(text: string, where: string, issues: ContentIssue[]) {
  for (const m of text.matchAll(LINK)) {
    const url = m[2];
    if (!/^https:\/\//.test(url) && !url.startsWith("/")) {
      issues.push({ where, message: `Link must be https:// or an internal /path: ${url}` });
    }
  }
}

function checkBlocks(blocks: Block[], where: string, issues: ContentIssue[]) {
  blocks.forEach((b, i) => {
    const w = `${where} block[${i}]`;
    switch (b.kind) {
      case "paragraph":
      case "heading":
        if (!b.text.trim()) issues.push({ where: w, message: "Empty text" });
        checkInline(b.text, w, issues);
        break;
      case "list":
        if (!b.items.length) issues.push({ where: w, message: "Empty list" });
        b.items.forEach((t) => checkInline(t, w, issues));
        break;
      case "code":
        if (!b.code.trim()) issues.push({ where: w, message: "Empty code block" });
        break;
      case "callout":
        checkInline(b.text, w, issues);
        break;
      case "table":
        if (!b.headers.length) issues.push({ where: w, message: "Table without headers" });
        b.rows.forEach((r, ri) => {
          if (r.length !== b.headers.length)
            issues.push({ where: w, message: `Table row ${ri} has ${r.length} cells, expected ${b.headers.length}` });
          r.forEach((c) => checkInline(c, w, issues));
        });
        break;
      case "diagram":
        if (b.steps.length < 2) issues.push({ where: w, message: "Diagram needs at least 2 steps" });
        break;
      case "terms":
        if (!b.items.length) issues.push({ where: w, message: "Empty terms block" });
        break;
    }
  });
}

export function checkExercise(ex: Exercise, where: string, issues: ContentIssue[]) {
  const w = `${where} ${ex.id}`;
  if (!ex.prompt.trim()) issues.push({ where: w, message: "Missing prompt" });
  if (!ex.explanation.trim()) issues.push({ where: w, message: "Missing explanation" });
  checkInline(ex.prompt, w, issues);
  switch (ex.type) {
    case "mcq": {
      const ids = ex.options.map((o) => o.id);
      if (ex.options.length < 3) issues.push({ where: w, message: "MCQ needs at least 3 options" });
      if (new Set(ids).size !== ids.length) issues.push({ where: w, message: "Duplicate option ids" });
      if (!ids.includes(ex.answer)) issues.push({ where: w, message: `Answer "${ex.answer}" is not an option id` });
      break;
    }
    case "multi-select": {
      const ids = ex.options.map((o) => o.id);
      if (ex.options.length < 3) issues.push({ where: w, message: "Multi-select needs at least 3 options" });
      if (!ex.answers.length) issues.push({ where: w, message: "Multi-select needs at least one answer" });
      ex.answers.forEach((a) => {
        if (!ids.includes(a)) issues.push({ where: w, message: `Answer "${a}" is not an option id` });
      });
      break;
    }
    case "predict-output":
      if (!ex.code.trim()) issues.push({ where: w, message: "Missing code" });
      break;
    case "find-bug":
    case "code":
      if (!ex.tests.length) issues.push({ where: w, message: "Needs at least one test" });
      if (!ex.solution.trim()) issues.push({ where: w, message: "Missing solution" });
      break;
    case "fill-blank": {
      const count = ex.template.split("___").length - 1;
      if (count === 0) issues.push({ where: w, message: "Template has no ___ blanks" });
      if (count !== ex.blanks.length)
        issues.push({ where: w, message: `Template has ${count} blanks but ${ex.blanks.length} answers defined` });
      ex.blanks.forEach((b, i) => {
        if (!b.answers.length) issues.push({ where: w, message: `Blank ${i} has no accepted answers` });
      });
      break;
    }
    case "match":
      if (ex.pairs.length < 3) issues.push({ where: w, message: "Match needs at least 3 pairs" });
      if (new Set(ex.pairs.map((p) => p.right)).size !== ex.pairs.length)
        issues.push({ where: w, message: "Match right-hand values must be unique" });
      break;
    case "order":
      if (ex.steps.length < 3) issues.push({ where: w, message: "Order needs at least 3 steps" });
      if (new Set(ex.steps).size !== ex.steps.length) issues.push({ where: w, message: "Order steps must be unique" });
      break;
    case "short-answer":
      if (!ex.keywords.length || ex.keywords.some((g) => !g.length))
        issues.push({ where: w, message: "Short answer needs non-empty keyword groups" });
      if (!ex.sampleAnswer.trim()) issues.push({ where: w, message: "Missing sample answer" });
      break;
    case "true-false":
      break;
  }
}

export function isDebuggingExercise(ex: Exercise) {
  return ex.type === "find-bug" || ex.debugging === true;
}

export function lessonRequirements(lesson: Lesson): PracticeRequirements {
  return { ...DEFAULT_REQUIREMENTS, ...lesson.requirements };
}

/**
 * Modules written before best practices, cheat sheets and completion criteria were added to
 * the lesson format. New modules must include all three; these get them as they are revised.
 */
const LEGACY_FORMAT_MODULES = new Set(["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12", "m13", "m14", "m15", "m16"]);

export function checkLesson(lesson: Lesson, mod: Module, allLessonIds: Set<string>, issues: ContentIssue[]) {
  const w = `lesson ${lesson.id}`;
  if (lesson.id !== lessonIdFor(mod.slug, lesson.slug))
    issues.push({ where: w, message: `id must be "${lessonIdFor(mod.slug, lesson.slug)}"` });
  if (!SLUG.test(lesson.slug)) issues.push({ where: w, message: "Invalid slug" });
  if (lesson.objectives.length < 2) issues.push({ where: w, message: "Needs at least 2 objectives" });
  if (!lesson.intro.length) issues.push({ where: w, message: "Missing intro" });
  if (lesson.sections.length < 3) issues.push({ where: w, message: "Needs at least 3 sections" });
  if (lesson.commonMistakes.length < 2) issues.push({ where: w, message: "Needs at least 2 common mistakes" });
  if (!lesson.debugging.length) issues.push({ where: w, message: "Needs debugging guidance" });
  if (!lesson.examples.length) issues.push({ where: w, message: "Needs at least 1 interactive example" });
  if (lesson.keyPoints.length < 3) issues.push({ where: w, message: "keyPoints needs at least 3 points" });
  if (!lesson.references.length) issues.push({ where: w, message: "Needs at least 1 official reference" });
  if (lesson.minutes < 3 || lesson.minutes > 90) issues.push({ where: w, message: "minutes should be 3-90" });
  lesson.references.forEach((r) => {
    if (!/^https:\/\//.test(r.url)) issues.push({ where: w, message: `Reference must be https: ${r.url}` });
  });
  const sectionIds = lesson.sections.map((s) => s.id);
  if (new Set(sectionIds).size !== sectionIds.length) issues.push({ where: w, message: "Duplicate section ids" });
  lesson.sections.forEach((s) => {
    if (!SLUG.test(s.id)) issues.push({ where: w, message: `Invalid section id "${s.id}"` });
    checkBlocks(s.blocks, `${w} section ${s.id}`, issues);
  });
  checkBlocks(lesson.intro, `${w} intro`, issues);
  [...lesson.prerequisites, ...lesson.related].forEach((id) => {
    if (!allLessonIds.has(id)) issues.push({ where: w, message: `Unknown lesson reference "${id}"` });
  });
  if (lesson.prerequisites.includes(lesson.id) || lesson.related.includes(lesson.id))
    issues.push({ where: w, message: "Lesson references itself" });

  const req = lessonRequirements(lesson);
  const practice = lesson.exercises;
  const beginner = practice.filter((e) => e.difficulty === "beginner" && !isDebuggingExercise(e)).length;
  const intermediate = practice.filter((e) => e.difficulty !== "beginner" && !isDebuggingExercise(e)).length;
  const debugging = practice.filter(isDebuggingExercise).length;
  const mcq = lesson.quiz.filter((e) => e.type === "mcq").length;
  if (beginner < req.beginner) issues.push({ where: w, message: `Needs ${req.beginner} beginner exercises (has ${beginner})` });
  if (intermediate < req.intermediate)
    issues.push({ where: w, message: `Needs ${req.intermediate} intermediate exercises (has ${intermediate})` });
  if (debugging < req.debugging) issues.push({ where: w, message: `Needs ${req.debugging} debugging exercises (has ${debugging})` });
  if (mcq < req.quizMcq) issues.push({ where: w, message: `Quiz needs ${req.quizMcq} MCQs (has ${mcq})` });
  [...lesson.exercises, ...lesson.quiz, lesson.challenge].forEach((e) => checkExercise(e, w, issues));

  // Every HTML/CSS item must say how it is validated (snippet, complete document, or demo).
  const webItems = [
    ...[...lesson.intro, ...lesson.sections.flatMap((x) => x.blocks)].filter((b) => b.kind === "code" && b.runtime === "web" && b.runnable),
    ...lesson.examples.filter((e) => e.runtime === "web"),
    ...[...lesson.exercises, ...lesson.quiz, lesson.challenge].filter((e) => (e.type === "code" || e.type === "find-bug") && e.runtime === "web"),
  ] as { htmlCheck?: unknown }[];
  if (webItems.some((item) => !item.htmlCheck && !lesson.htmlCheck))
    issues.push({ where: w, message: 'HTML/CSS ("web" runtime) items need an htmlCheck mode: set lesson.htmlCheck or htmlCheck on each item' });

  const fullFormat = !LEGACY_FORMAT_MODULES.has(mod.id);
  if ((fullFormat || lesson.bestPractices) && (lesson.bestPractices?.length ?? 0) < 2)
    issues.push({ where: w, message: "bestPractices needs at least 2 items" });
  if ((fullFormat || lesson.cheatSheet) && (lesson.cheatSheet?.length ?? 0) < 3)
    issues.push({ where: w, message: "cheatSheet needs at least 3 rows" });
  if ((fullFormat || lesson.completionCriteria) && (lesson.completionCriteria?.length ?? 0) < 2)
    issues.push({ where: w, message: "completionCriteria needs at least 2 items" });
  lesson.bestPractices?.forEach((t) => checkInline(t, w, issues));
  lesson.completionCriteria?.forEach((t) => checkInline(t, w, issues));
  if (fullFormat) {
    const types = new Set([...lesson.exercises, ...lesson.quiz, lesson.challenge].map((e) => e.type));
    if (types.size < 4) issues.push({ where: w, message: `Use at least 4 different exercise types across practice, quiz and challenge (has ${types.size})` });
  }
}

export function validateCurriculum(modules: Module[], issues: ContentIssue[] = [], strict = false) {
  // References may point at planned (manifest) lessons; the UI labels those as planned.
  const allLessonIds = new Set(allManifestLessonIds);
  const moduleIds = new Set(curriculumManifest.map((m) => m.id));
  modules.forEach((mod) => {
    const manifest = curriculumManifest.find((m) => m.id === mod.id);
    if (!manifest) {
      issues.push({ where: `module ${mod.id}`, message: "Not in manifest" });
      return;
    }
    if (manifest.slug !== mod.slug) issues.push({ where: `module ${mod.id}`, message: "Slug differs from manifest" });
    mod.prerequisites.forEach((p) => {
      if (!moduleIds.has(p)) issues.push({ where: `module ${mod.id}`, message: `Unknown prerequisite module ${p}` });
    });
    const expected = manifest.lessons.map(([slug]) => slug);
    const actual = mod.lessons.map((l) => l.slug);
    const extra = actual.filter((s) => !expected.includes(s));
    const missing = expected.filter((s) => !actual.includes(s));
    if (extra.length) issues.push({ where: `module ${mod.id}`, message: `Lessons not in manifest: ${extra.join(", ")}` });
    if (expected.filter((s) => actual.includes(s)).join() !== actual.filter((s) => expected.includes(s)).join())
      issues.push({ where: `module ${mod.id}`, message: "Lesson order differs from manifest" });
    if (strict && missing.length)
      issues.push({ where: `module ${mod.id}`, message: `Planned lessons not written yet: ${missing.join(", ")}` });
    mod.lessons.forEach((l) => checkLesson(l, mod, allLessonIds, issues));
  });
  return issues;
}

export function validateKb(notes: KbNote[], lessonIds: Set<string>, issues: ContentIssue[] = []) {
  const ids = new Set(notes.map((n) => n.id));
  const slugs = new Set<string>();
  notes.forEach((n) => {
    const w = `kb ${n.id}`;
    if (slugs.has(n.slug)) issues.push({ where: w, message: "Duplicate slug" });
    slugs.add(n.slug);
    if (!SLUG.test(n.slug)) issues.push({ where: w, message: "Invalid slug" });
    if (!n.explanation.length) issues.push({ where: w, message: "Missing explanation" });
    if (!n.syntax.length) issues.push({ where: w, message: "Missing syntax" });
    if (!n.code.code.trim()) issues.push({ where: w, message: "Missing working code" });
    if (n.walkthrough.length < 3) issues.push({ where: w, message: "Walkthrough needs at least 3 lines" });
    if (!n.whenToUse.length) issues.push({ where: w, message: "Missing whenToUse" });
    if (n.mistakes.length < 2) issues.push({ where: w, message: "Needs at least 2 common mistakes" });
    if (!n.debugging.length) issues.push({ where: w, message: "Missing debugging tips" });
    if (!n.practice.trim()) issues.push({ where: w, message: "Missing practice task" });
    if (!n.docs.length) issues.push({ where: w, message: "Missing official docs" });
    n.docs.forEach((d) => {
      if (!/^https:\/\//.test(d.url)) issues.push({ where: w, message: `Doc link must be https: ${d.url}` });
    });
    n.relatedNotes.forEach((r) => {
      if (!ids.has(r)) issues.push({ where: w, message: `Unknown related note "${r}"` });
    });
    n.relatedLessons.forEach((r) => {
      if (!lessonIds.has(r)) issues.push({ where: w, message: `Unknown related lesson "${r}"` });
    });
    checkBlocks(n.explanation, `${w} explanation`, issues);
    checkBlocks(n.syntax, `${w} syntax`, issues);
  });
  return issues;
}

export function validateChallenges(list: Challenge[], lessonIds: Set<string>, issues: ContentIssue[] = []) {
  list.forEach((c) => {
    const w = `challenge ${c.id}`;
    if (!SLUG.test(c.slug)) issues.push({ where: w, message: "Invalid slug" });
    if (!c.statement.length) issues.push({ where: w, message: "Missing statement" });
    if (!c.expectedBehavior.length) issues.push({ where: w, message: "Missing expected behavior" });
    if (!c.hints.length) issues.push({ where: w, message: "Missing hints" });
    if (!c.solution.trim()) issues.push({ where: w, message: "Missing solution" });
    if (c.validation === "manual" && !(c.checklist && c.checklist.length >= 3))
      issues.push({ where: w, message: "Manual challenges need a review checklist (3+ items)" });
    if (c.validation !== "manual" && !(c.tests && c.tests.length))
      issues.push({ where: w, message: "Automated challenges need tests" });
    if (c.validation === "dom" && !c.html) issues.push({ where: w, message: "DOM challenges need html" });
    c.relatedLessons.forEach((r) => {
      if (!lessonIds.has(r)) issues.push({ where: w, message: `Unknown related lesson "${r}"` });
    });
    checkBlocks(c.statement, w, issues);
  });
  return issues;
}

export function validateProjects(list: Project[], lessonIds: Set<string>, issues: ContentIssue[] = []) {
  list.forEach((p) => {
    const w = `project ${p.id}`;
    if (!SLUG.test(p.slug)) issues.push({ where: w, message: "Invalid slug" });
    if (p.requirements.length < 3) issues.push({ where: w, message: "Needs 3+ requirements" });
    if (p.userStories.length < 2) issues.push({ where: w, message: "Needs 2+ user stories" });
    if (p.steps.length < 3) issues.push({ where: w, message: "Needs 3+ steps" });
    if (!p.starter.length || !p.solution.length) issues.push({ where: w, message: "Needs starter and solution files" });
    if (p.testingChecklist.length < 3) issues.push({ where: w, message: "Needs 3+ testing checklist items" });
    if (!p.extensions.length) issues.push({ where: w, message: "Needs extension challenges" });
    const stepIds = p.steps.map((s) => s.id);
    if (new Set(stepIds).size !== stepIds.length) issues.push({ where: w, message: "Duplicate step ids" });
    p.relatedLessons.forEach((r) => {
      if (!lessonIds.has(r)) issues.push({ where: w, message: `Unknown related lesson "${r}"` });
    });
    p.steps.forEach((s) => checkBlocks(s.blocks, `${w} step ${s.id}`, issues));
  });
  return issues;
}

export function validateGlossary(terms: GlossaryTerm[], lessonIds: Set<string>, issues: ContentIssue[] = []) {
  terms.forEach((t) => {
    t.lessonIds.forEach((id) => {
      if (!lessonIds.has(id)) issues.push({ where: `glossary ${t.id}`, message: `Unknown lesson "${id}"` });
    });
  });
  return issues;
}

/** Every exercise id, KB id, challenge id and project id must be globally unique. */
export function checkGlobalIds(
  modules: Module[],
  notes: KbNote[],
  list: Challenge[],
  projectList: Project[],
  terms: GlossaryTerm[],
  issues: ContentIssue[] = [],
) {
  const seen = new Map<string, string>();
  const add = (id: string, where: string) => {
    const prev = seen.get(id);
    if (prev) issues.push({ where, message: `Duplicate id "${id}" (also used by ${prev})` });
    else seen.set(id, where);
  };
  modules.forEach((m) => {
    add(m.id, `module ${m.id}`);
    m.lessons.forEach((l) => {
      add(l.id, `lesson ${l.id}`);
      [...l.exercises, ...l.quiz, l.challenge].forEach((e) => add(e.id, `lesson ${l.id}`));
      l.examples.forEach((e) => add(e.id, `lesson ${l.id} example`));
    });
  });
  notes.forEach((n) => add(n.id, `kb ${n.id}`));
  list.forEach((c) => add(c.id, `challenge ${c.id}`));
  projectList.forEach((p) => add(p.id, `project ${p.id}`));
  terms.forEach((t) => add(t.id, `glossary ${t.id}`));
  return issues;
}

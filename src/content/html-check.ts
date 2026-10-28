import type { Block, CodeExample, Exercise, HtmlCheck, Lesson } from "./types";

/** The validation mode for one web-runtime item: its own setting, else the lesson default. */
export function resolveHtmlCheck(item: { htmlCheck?: HtmlCheck }, lesson: Pick<Lesson, "htmlCheck">): HtmlCheck | undefined {
  return item.htmlCheck ?? lesson.htmlCheck;
}

const fillBlock = (b: Block, lesson: Lesson): Block =>
  b.kind === "code" && b.runtime === "web" ? { ...b, htmlCheck: resolveHtmlCheck(b, lesson) } : b;

const fillExercise = (e: Exercise, lesson: Lesson): Exercise =>
  (e.type === "code" || e.type === "find-bug") && e.runtime === "web" ? { ...e, htmlCheck: resolveHtmlCheck(e, lesson) } : e;

const fillExample = (e: CodeExample, lesson: Lesson): CodeExample => (e.runtime === "web" ? { ...e, htmlCheck: resolveHtmlCheck(e, lesson) } : e);

/** Copy of a lesson where every HTML/CSS item carries its resolved validation mode (for rendering). */
export function withHtmlCheckDefaults(lesson: Lesson): Lesson {
  if (!lesson.htmlCheck) return lesson;
  return {
    ...lesson,
    intro: lesson.intro.map((b) => fillBlock(b, lesson)),
    sections: lesson.sections.map((s) => ({ ...s, blocks: s.blocks.map((b) => fillBlock(b, lesson)) })),
    examples: lesson.examples.map((e) => fillExample(e, lesson)),
    exercises: lesson.exercises.map((e) => fillExercise(e, lesson)),
    quiz: lesson.quiz.map((e) => fillExercise(e, lesson)),
    challenge: fillExercise(lesson.challenge, lesson),
  };
}

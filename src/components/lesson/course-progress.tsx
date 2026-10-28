"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { techProgress, technologyForLesson } from "@/lib/courses";
import { ProgressBar } from "@/components/ui/progress";

/** Course-level progress shown in the lesson header (published lessons only, from saved data). */
export function LessonCourseProgress({ lessonId }: { lessonId: string }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const tech = technologyForLesson(catalog, lessonId);
  if (!tech) return null;
  const p = techProgress(tech, state);
  const position = tech.lessonIds.indexOf(lessonId) + 1;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs" data-testid="lesson-course-progress">
      <span className="shrink-0 text-subtle">
        Lesson {position} of {tech.lessonIds.length} in{" "}
        <Link href={`/courses/${tech.id}`} className="font-medium text-fg hover:text-primary hover:underline">
          {tech.name}
        </Link>
      </span>
      <ProgressBar value={p.percent} label={`${tech.name} course progress`} className="min-w-16 flex-1" />
      <span className="shrink-0 text-subtle tabular-nums">
        {p.completed}/{p.total} complete
      </span>
    </div>
  );
}

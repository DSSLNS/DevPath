"use client";

import { useEffect } from "react";
import { learnerStore, useStoreMeta } from "@/lib/store/hooks";

/** Records that a lesson was opened, restores the last-read section, and tracks the section in view. */
export function LessonTracker({ lessonId, sectionIds }: { lessonId: string; sectionIds: string[] }) {
  const meta = useStoreMeta();
  useEffect(() => {
    if (!meta.hydrated) return;
    const previous = learnerStore.getState().lessons[lessonId]?.lastSection;
    learnerStore.openLesson(lessonId);
    const params = new URLSearchParams(window.location.search);
    if (!window.location.hash && params.get("resume") === "1" && previous) {
      document.getElementById(previous)?.scrollIntoView({ block: "start" });
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        clearTimeout(timer);
        timer = setTimeout(() => learnerStore.setLessonSection(lessonId, visible.target.id), 800);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [lessonId, meta.hydrated, sectionIds]);
  return null;
}

"use client";

import { useEffect } from "react";
import { createActivityClock, FLUSH_EVERY_MS, TICK_MS } from "@/lib/activity-time";
import { learnerStore, useStoreMeta } from "@/lib/store/hooks";

const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"] as const;

/** Counts active learning time on lesson and practice pages (see lib/activity-time). */
export function ActiveTimeTracker({ lessonId }: { lessonId?: string }) {
  const meta = useStoreMeta();
  useEffect(() => {
    if (!meta.hydrated) return;
    const clock = createActivityClock(Date.now());
    let pendingMs = 0;
    let lastFlush = Date.now();
    const flush = () => {
      const seconds = Math.floor(pendingMs / 1000);
      if (seconds > 0) {
        learnerStore.addActiveTime(seconds, lessonId);
        pendingMs -= seconds * 1000;
      }
      lastFlush = Date.now();
    };
    let lastMove = 0;
    const onInteract = (e: Event) => {
      const now = Date.now();
      if (e.type === "mousemove") {
        if (now - lastMove < 2000) return;
        lastMove = now;
      }
      clock.interact(now);
    };
    const onVisibility = () => {
      // The interval that just ended was visible exactly when the page is now becoming hidden.
      const becameHidden = document.visibilityState === "hidden";
      pendingMs += clock.tick(Date.now(), becameHidden);
      if (becameHidden) flush();
    };
    EVENTS.forEach((ev) => window.addEventListener(ev, onInteract, { passive: true, capture: true }));
    document.addEventListener("visibilitychange", onVisibility);
    const interval = setInterval(() => {
      pendingMs += clock.tick(Date.now(), document.visibilityState === "visible");
      if (Date.now() - lastFlush >= FLUSH_EVERY_MS) flush();
    }, TICK_MS);
    return () => {
      clearInterval(interval);
      EVENTS.forEach((ev) => window.removeEventListener(ev, onInteract, { capture: true }));
      document.removeEventListener("visibilitychange", onVisibility);
      pendingMs += clock.tick(Date.now(), document.visibilityState === "visible");
      flush();
    };
  }, [meta.hydrated, lessonId]);
  return null;
}

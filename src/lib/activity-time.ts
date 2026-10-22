/**
 * Active-time measurement. Time counts only while the page is visible AND the learner
 * interacted (pointer, keyboard, scroll, touch) within the idle window, so a tab left
 * open over lunch doesn't inflate learning time.
 */
export const IDLE_AFTER_MS = 60_000;
export const TICK_MS = 5_000;
export const FLUSH_EVERY_MS = 30_000;

export interface ActivityClock {
  /** Record an interaction at `now`. */
  interact(now: number): void;
  /** Advance the clock; returns active milliseconds since the previous tick. */
  tick(now: number, visible: boolean): number;
}

export function createActivityClock(start: number): ActivityClock {
  let lastInteraction = start;
  let lastTick = start;
  return {
    interact(now) {
      lastInteraction = now;
    },
    tick(now, visible) {
      const from = lastTick;
      lastTick = now;
      if (!visible) return 0;
      // Only the part of the interval before the learner went idle counts.
      const activeUntil = Math.min(now, lastInteraction + IDLE_AFTER_MS);
      return Math.max(0, activeUntil - from);
    },
  };
}

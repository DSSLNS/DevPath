"use client";

import { useState, useSyncExternalStore } from "react";
import { Target } from "lucide-react";
import { useAccount } from "@/lib/account";
import { hasProgress, mergeStates } from "@/lib/store/merge";
import { MAX_GOAL_MINUTES, parseState, type PersistedState } from "@/lib/store/schema";
import { STORAGE_KEY } from "@/lib/store/store";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/cn";

// ------------------------------------------------------------------ guest progress import

const importFlag = (userId: string) => `devpath:guest-import:${userId}`;
let pendingImport: { userId: string; guest: PersistedState } | null = null;
const importListeners = new Set<() => void>();
const setPendingImport = (v: typeof pendingImport) => {
  pendingImport = v;
  importListeners.forEach((l) => l());
};

/**
 * After sign-in, offers to add progress made as a guest in this browser to the account.
 * Nothing is merged without the learner's confirmation, and the question is asked once per account.
 */
export function offerGuestImport(userId: string) {
  try {
    if (window.localStorage.getItem(importFlag(userId))) return;
    const guest = parseState(window.localStorage.getItem(STORAGE_KEY)).state;
    if (hasProgress(guest)) setPendingImport({ userId, guest });
  } catch {
    /* storage unavailable: nothing to import */
  }
}

function usePendingImport() {
  return useSyncExternalStore(
    (fn) => {
      importListeners.add(fn);
      return () => importListeners.delete(fn);
    },
    () => pendingImport,
    () => null,
  );
}

function GuestImportDialog() {
  const pending = usePendingImport();
  const toast = useToast();
  if (!pending) return null;
  const g = pending.guest;
  const lessons = Object.values(g.lessons).filter((l) => l.completedAt).length;
  const decide = (merge: boolean) => {
    try {
      window.localStorage.setItem(importFlag(pending.userId), merge ? "merged" : "declined");
      // Once merged, the guest copy is removed so it can't be added to a second account by accident.
      if (merge) window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (merge) {
      learnerStore.replaceState(mergeStates(learnerStore.getState(), g, { settingsFrom: "base" }));
      toast("Your progress from this browser was added to your account.");
    }
    setPendingImport(null);
  };
  return (
    <Dialog
      open
      onClose={() => decide(false)}
      title="Add this browser's progress to your account?"
      description="You learned on this device before signing in. You can add that progress to your account so it's available everywhere."
      footer={
        <>
          <Button onClick={() => decide(false)}>Keep it separate</Button>
          <Button variant="primary" onClick={() => decide(true)} data-testid="merge-guest-progress">
            Add to my account
          </Button>
        </>
      }
    >
      <ul className="list-disc space-y-1 pl-5">
        <li>
          {lessons} completed lesson{lessons === 1 ? "" : "s"}, {Object.keys(g.lessons).length} opened
        </li>
        <li>{g.quizAttempts.length} quiz attempts</li>
        <li>
          {g.notes.length} notes and {g.bookmarks.length} bookmarks
        </li>
      </ul>
      <p className="mt-3 text-muted">Nothing in your account is removed. If both have progress for the same lesson, the furthest progress is kept.</p>
    </Dialog>
  );
}

// ------------------------------------------------------------------ learning goal

const GOAL_OPTIONS = [15, 30, 45, 60, 120];

export function goalLabel(minutes: number) {
  if (minutes === 0) return "No daily goal";
  if (minutes % 60 === 0) return `${minutes / 60} hour${minutes === 60 ? "" : "s"} per day`;
  return `${minutes} minutes per day`;
}

/** Goal picker shared by the onboarding popup and Settings. */
export function GoalPicker({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const preset = GOAL_OPTIONS.includes(value);
  const [custom, setCustom] = useState(!preset && value > 0);
  const [customValue, setCustomValue] = useState(!preset && value > 0 ? String(value) : "");
  const valid = /^\d+$/.test(customValue) && Number(customValue) >= 5 && Number(customValue) <= MAX_GOAL_MINUTES;
  return (
    <div>
      <div role="radiogroup" aria-label="Daily learning goal" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {GOAL_OPTIONS.map((m) => {
          const checked = !custom && value === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => {
                setCustom(false);
                onChange(m);
              }}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                checked ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border hover:bg-surface-hover",
              )}
            >
              {m < 60 ? `${m} minutes` : `${m / 60} hour${m === 60 ? "" : "s"}`}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          onClick={() => setCustom(true)}
          className={cn("rounded-md border px-3 py-2 text-left text-sm", custom ? "border-primary bg-primary-soft text-primary-soft-fg" : "border-border hover:bg-surface-hover")}
        >
          Custom goal
        </button>
      </div>
      {custom && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted">Minutes per day (5–{MAX_GOAL_MINUTES})</span>
            <input
              type="number"
              inputMode="numeric"
              min={5}
              max={MAX_GOAL_MINUTES}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              aria-invalid={customValue !== "" && !valid}
              className="h-9 w-32 rounded-md border border-border bg-surface px-2 text-sm"
            />
          </label>
          <Button size="sm" disabled={!valid} onClick={() => onChange(Number(customValue))}>
            Use {valid ? `${customValue} minutes` : "this goal"}
          </Button>
          {customValue !== "" && !valid && <p className="w-full text-xs text-danger">Enter a whole number between 5 and {MAX_GOAL_MINUTES}.</p>}
        </div>
      )}
    </div>
  );
}

function GoalDialog() {
  const account = useAccount();
  const meta = useStoreMeta();
  const { settings } = useLearnerState();
  const importPending = usePendingImport();
  const toast = useToast();
  const [choice, setChoice] = useState(0);
  const open = account.status === "signed-in" && meta.hydrated && !settings.goalPromptSeen && !importPending;
  if (!open) return null;
  // Closing, skipping and saving all record that the question was answered, so it never nags.
  const finish = (minutes: number | null) => {
    learnerStore.updateSettings({ goalPromptSeen: true, ...(minutes !== null ? { dailyGoalMinutes: minutes } : {}) });
    if (minutes) toast(`Daily goal set: ${goalLabel(minutes)}. You can change it any time in Settings.`);
  };
  return (
    <Dialog
      open
      onClose={() => finish(null)}
      title="What is your learning goal?"
      description="Build a learning habit that works for you. Choose a daily target if you want, or skip this step and start learning right away."
      className="max-w-lg"
      footer={
        <>
          <Button onClick={() => finish(null)} data-testid="goal-skip">
            Skip for now
          </Button>
          <Button variant="primary" disabled={!choice} onClick={() => finish(choice)} data-testid="goal-save">
            <Target className="h-4 w-4" aria-hidden /> Set goal
          </Button>
        </>
      }
    >
      <GoalPicker value={choice} onChange={setChoice} />
      <p className="mt-3 text-xs text-muted">
        Only active time on lessons and practice counts. Missing a day is fine: there are no penalties, and you can change or turn off the goal in Settings.
      </p>
    </Dialog>
  );
}

export function AccountDialogs() {
  return (
    <>
      <GuestImportDialog />
      <GoalDialog />
    </>
  );
}

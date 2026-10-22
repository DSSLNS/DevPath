"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import { MAX_GOAL_MINUTES } from "@/lib/store/schema";
import { learnerStore } from "@/lib/store/hooks";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/components/ui/cn";

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

/**
 * Optional daily-goal chooser, opened by the learner (never shown automatically).
 * Saving or skipping records the answer so the dashboard stops suggesting it.
 */
export function GoalDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [choice, setChoice] = useState(0);
  const finish = (minutes: number | null) => {
    learnerStore.updateSettings({ goalPromptSeen: true, ...(minutes !== null ? { dailyGoalMinutes: minutes } : {}) });
    if (minutes) toast(`Daily goal set: ${goalLabel(minutes)}. You can change it any time in Settings.`);
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="What is your learning goal?"
      description="Build a learning habit that works for you. Choose a daily target if you want, or skip this step and keep learning."
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

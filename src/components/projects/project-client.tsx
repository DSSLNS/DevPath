"use client";

import { useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { Button } from "@/components/ui/button";
import { renderInline } from "@/lib/markdown";

export function ProjectStepToggle({ projectId, stepId }: { projectId: string; stepId: string }) {
  const s = useLearnerState();
  const done = !!s.projects[projectId]?.steps[stepId];
  return (
    <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted">
      <input type="checkbox" className="accent-[var(--primary)]" checked={done} onChange={() => learnerStore.toggleProjectStep(projectId, stepId)} />
      Done
    </label>
  );
}

export function ProjectChecklist({ projectId, items }: { projectId: string; items: string[] }) {
  const s = useLearnerState();
  const checked = s.projects[projectId]?.checklist ?? [];
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i}>
          <label className="flex cursor-pointer gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
            <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={checked.includes(i)} onChange={() => learnerStore.toggleProjectChecklist(projectId, i)} />
            <span>{renderInline(it)}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export function RevealSolution({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <div>{children}</div>
  ) : (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface p-4 text-sm text-muted">
      <p className="mb-3">Build it yourself first, step by step. Open the reference solution when you are done or truly stuck.</p>
      <Button onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" aria-hidden /> Show reference solution
      </Button>
    </div>
  );
}

export function ProjectCompleteButton({ projectId }: { projectId: string }) {
  const s = useLearnerState();
  const done = !!s.projects[projectId]?.completedAt;
  return done ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 font-medium text-success">
        <CheckCircle2 className="h-4 w-4" aria-hidden /> Project completed
      </span>
      <Button variant="ghost" size="sm" onClick={() => learnerStore.setProjectComplete(projectId, false)}>
        Mark as not complete
      </Button>
    </div>
  ) : (
    <Button variant="primary" onClick={() => learnerStore.setProjectComplete(projectId, true)}>
      <CheckCircle2 className="h-4 w-4" aria-hidden /> Mark project complete
    </Button>
  );
}

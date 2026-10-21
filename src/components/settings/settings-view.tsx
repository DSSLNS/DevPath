"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import type { ThemePreference } from "@/lib/store/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function SettingsView() {
  const s = useLearnerState();
  const meta = useStoreMeta();
  const catalog = useCatalog();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = learnerStore.updateSettings.bind(learnerStore);
  if (!meta.hydrated) return <div className="h-64 animate-pulse rounded-lg bg-surface" aria-busy="true" />;
  const row = "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between";
  const control = "h-9 rounded-md border border-border bg-surface px-2 text-sm";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Appearance" />
        <div className="divide-y divide-border">
          <div className={row}>
            <label htmlFor="theme" className="text-sm font-medium">
              Theme
            </label>
            <select id="theme" className={control} value={s.settings.theme} onChange={(e) => set({ theme: e.target.value as ThemePreference })} data-testid="theme-select">
              <option value="system">Match system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className={row}>
            <label htmlFor="font" className="text-sm font-medium">
              Code editor font size
            </label>
            <select id="font" className={control} value={s.settings.editorFontSize} onChange={(e) => set({ editorFontSize: Number(e.target.value) })}>
              {[12, 13, 14, 15, 16, 18, 20].map((n) => (
                <option key={n} value={n}>
                  {n}px
                </option>
              ))}
            </select>
          </div>
          <p className="px-4 py-3 text-xs text-subtle">Animations follow your operating system&apos;s “reduce motion” setting.</p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Learning" />
        <div className="divide-y divide-border">
          <div className={row}>
            <label htmlFor="path" className="text-sm font-medium">
              Learning path
            </label>
            <select id="path" className={control} value={s.settings.pathId} onChange={(e) => set({ pathId: e.target.value })}>
              {catalog.paths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className={row}>
            <label htmlFor="mastery" className="text-sm font-medium">
              Mastery threshold
              <span className="block text-xs font-normal text-subtle">Lesson-quiz score needed to count a topic as mastered.</span>
            </label>
            <select id="mastery" className={control} value={s.settings.masteryThreshold} onChange={(e) => set({ masteryThreshold: Number(e.target.value) })}>
              {[60, 70, 80, 90, 100].map((n) => (
                <option key={n} value={n}>
                  {n}%
                </option>
              ))}
            </select>
          </div>
          <div className={row}>
            <label htmlFor="timeout" className="text-sm font-medium">
              Code execution time limit
            </label>
            <select id="timeout" className={control} value={s.settings.codeTimeoutMs} onChange={(e) => set({ codeTimeoutMs: Number(e.target.value) })}>
              {[2000, 5000, 10000, 20000].map((n) => (
                <option key={n} value={n}>
                  {n / 1000} seconds
                </option>
              ))}
            </select>
          </div>
          <label className={row}>
            <span className="text-sm font-medium">
              Show achievements and streaks
              <span className="block text-xs font-normal text-subtle">Optional motivation. Turning this off hides them everywhere.</span>
            </span>
            <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={s.settings.showAchievements} onChange={(e) => set({ showAchievements: e.target.checked })} />
          </label>
          <label className={row}>
            <span className="text-sm font-medium">
              Unlock all assessments
              <span className="block text-xs font-normal text-subtle">Skips progression rules for module, challenge, interview and final assessments.</span>
            </span>
            <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={s.settings.unlockAll} onChange={(e) => set({ unlockAll: e.target.checked })} />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Your data" description="Progress, notes and bookmarks are stored in this browser only. Export a backup to move them to another browser." />
        <div className="flex flex-wrap gap-2 p-4">
          <Button
            onClick={() => {
              const blob = new Blob([learnerStore.exportData()], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `js-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Download className="h-4 w-4" aria-hidden /> Export data
          </Button>
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden /> Import data
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (file.size > 5_000_000) return toast("That file is too large to be a JS Academy backup.", "error");
              const result = learnerStore.importData(await file.text());
              if (!result.ok) toast("That file isn't a valid JS Academy backup. Nothing was changed.", "error");
              else toast(result.recovered ? "Imported. Some invalid entries were skipped." : "Backup imported.", "success");
            }}
          />
          <Button variant="danger" className="ml-auto" onClick={() => setConfirmReset(true)}>
            Reset all progress
          </Button>
        </div>
      </Card>
      <ConfirmDialog
        open={confirmReset}
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          learnerStore.resetAll();
          setConfirmReset(false);
          toast("All progress, notes and bookmarks were removed.", "success");
        }}
        title="Reset all progress?"
        description="This permanently deletes your lesson progress, quiz history, notes and bookmarks from this browser. Your settings are kept. Consider exporting a backup first."
        confirmLabel="Delete everything"
      />
    </div>
  );
}

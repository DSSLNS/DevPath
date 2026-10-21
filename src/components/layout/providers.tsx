"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { localStorageAdapter } from "@/lib/store/store";
import { resolveTheme } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

let hydrated = false;

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    let adapter;
    try {
      adapter = localStorageAdapter();
      // Accessing localStorage can throw when storage is disabled.
      void window.localStorage;
    } catch {
      adapter = undefined;
    }
    learnerStore.hydrate(
      adapter ?? {
        load: () => {
          throw new Error("unavailable");
        },
        save: () => {
          throw new Error("unavailable");
        },
      },
    );
  }, []);
  return (
    <ToastProvider>
      <ThemeSync />
      <StorageBanner />
      {children}
    </ToastProvider>
  );
}

function ThemeSync() {
  const { settings } = useLearnerState();
  const meta = useStoreMeta();
  useEffect(() => {
    if (!meta.hydrated) return;
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(settings.theme);
    };
    apply();
    document.documentElement.style.setProperty("--editor-font-size", `${settings.editorFontSize}px`);
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme, settings.editorFontSize, meta.hydrated]);
  return null;
}

function StorageBanner() {
  const meta = useStoreMeta();
  const message = meta.storageUnavailable
    ? "Your browser is blocking local storage, so progress, notes and settings cannot be saved in this session."
    : meta.saveStatus === "error"
      ? meta.saveError
      : meta.recovered
        ? "Some saved learning data was unreadable and has been repaired. Valid progress was kept."
        : null;
  if (!message) return null;
  return (
    <div role="alert" className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 border-b border-warning/30 bg-warning-soft px-4 py-2 text-sm text-warning">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
      {meta.recovered && !meta.storageUnavailable && meta.saveStatus !== "error" && (
        <Button size="icon" variant="ghost" aria-label="Dismiss" onClick={() => learnerStore.dismissRecovered()}>
          <X className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}

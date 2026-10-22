"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { localStorageAdapter, type StorageAdapter } from "@/lib/store/store";
import type { PersistedState } from "@/lib/store/schema";
import { serverAdapter, useSyncStatus } from "@/lib/store/server-adapter";
import { accountStore, useAccount, type AccountUser } from "@/lib/account";
import { AccountDialogs, offerGuestImport } from "@/components/account/account-dialogs";
import { resolveTheme } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

let hydrated = false;

function guestAdapter(): StorageAdapter {
  try {
    // Accessing localStorage can throw when storage is disabled.
    void window.localStorage;
    return localStorageAdapter();
  } catch {
    return {
      load: () => {
        throw new Error("unavailable");
      },
      save: () => {
        throw new Error("unavailable");
      },
    };
  }
}

/**
 * Signed-in learners load progress from the server; guests use this browser's storage.
 * /api/progress answers 401 for guests, so one request tells us which mode to use.
 */
async function bootstrap() {
  let res: Response | null = null;
  try {
    // Better Auth answers 200 with `null` for guests, so guests don't trigger a 401 on every page load.
    const session = await fetch("/api/auth/get-session", { cache: "no-store", credentials: "same-origin" });
    const signedIn = session.ok && (await session.json()) !== null;
    res = signedIn ? await fetch("/api/progress", { cache: "no-store", credentials: "same-origin" }) : new Response(null, { status: 401 });
  } catch {
    res = null;
  }
  if (res?.ok) {
    const data = (await res.json()) as { user: AccountUser; state: PersistedState | null; revision: number };
    learnerStore.hydrate(
      serverAdapter({
        initial: data.state,
        revision: data.revision,
        onMerged: (state) => learnerStore.replaceState(state),
        getLocal: () => learnerStore.getState(),
      }),
    );
    accountStore.set({ status: "signed-in", user: data.user });
    offerGuestImport(data.user.id);
    return;
  }
  // Always consume the body so the request completes (an unread 401 keeps the connection busy).
  await res?.text().catch(() => "");
  learnerStore.hydrate(guestAdapter());
  accountStore.set(
    res === null || res.status >= 500
      ? { status: "guest", error: "We couldn't reach the server, so progress is being saved in this browser only." }
      : { status: "guest" },
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    void bootstrap();
  }, []);
  return (
    <ToastProvider>
      <ThemeSync />
      <StorageBanner />
      <AccountDialogs />
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
  const account = useAccount();
  const sync = useSyncStatus();
  const signedIn = account.status === "signed-in";
  const message = signedIn
    ? sync === "offline"
      ? "You're offline or the server is unreachable. Your latest progress is kept in this tab and will be saved when the connection returns."
      : sync === "signed-out"
        ? "Your session has ended, so new progress isn't being saved. Sign in again to continue saving."
        : sync === "error"
          ? "Your progress couldn't be saved because the server rejected it. Export your data from Settings to keep a copy."
          : null
    : account.status === "guest" && account.error
      ? account.error
      : meta.storageUnavailable
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

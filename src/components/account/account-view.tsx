"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { validateName, validatePassword, PASSWORD_MIN } from "@/lib/auth-validation";
import { learnerStore, useLearnerState } from "@/lib/store/hooks";
import { useSyncStatus } from "@/lib/store/server-adapter";
import { Card, CardHeader } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Field, FormError } from "./auth-form";
import { GoalPicker, goalLabel } from "./account-dialogs";

export async function signOutEverywhereLocal() {
  await authClient.signOut();
  // Full reload on purpose: in-memory account progress is discarded and the app restarts in guest mode.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign("/");
}

const SYNC_LABEL = { synced: "All progress saved", saving: "Saving…", offline: "Offline: will retry", "signed-out": "Session ended", error: "Save failed" } as const;

export function AccountView({ user }: { user: { name: string; email: string; createdAt: string } }) {
  const toast = useToast();
  const { settings } = useLearnerState();
  const sync = useSyncStatus();
  const [name, setName] = useState(user.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string | null>>({});
  const [pwError, setPwError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"name" | "password" | "logout" | null>(null);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateName(name);
    setNameError(err);
    if (err) return;
    setBusy("name");
    const { error } = await authClient.updateUser({ name: name.trim() });
    setBusy(null);
    if (error) setNameError("We couldn't update your name. Please try again.");
    else toast("Name updated.", "success");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = { current: current ? null : "Enter your current password.", next: validatePassword(next) };
    setPwErrors(v);
    if (Object.values(v).some(Boolean)) return;
    setBusy("password");
    setPwError(null);
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(null);
    if (error) {
      setPwError(error.status === 400 || error.status === 401 ? "Your current password is incorrect." : "We couldn't change your password. Please try again.");
      return;
    }
    setCurrent("");
    setNext("");
    toast("Password changed. Other devices have been signed out.", "success");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Profile"
          description={`Signed in as ${user.email} · member since ${new Date(user.createdAt).toLocaleDateString()}`}
          action={<span className="text-xs text-subtle" aria-live="polite">{SYNC_LABEL[sync]}</span>}
        />
        <form onSubmit={saveName} className="flex flex-wrap items-start gap-2 p-4" noValidate>
          <div className="min-w-60 flex-1">
            <Field label="Display name" name="name" value={name} onChange={setName} autoComplete="name" error={nameError} />
          </div>
          <Button type="submit" className="mt-6" disabled={busy === "name"}>
            Save name
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Daily learning goal" description={`Current goal: ${goalLabel(settings.dailyGoalMinutes)}. Goals are optional and never lock any content.`} />
        <div className="space-y-3 p-4">
          <GoalPicker
            value={settings.dailyGoalMinutes}
            onChange={(m) => {
              learnerStore.updateSettings({ dailyGoalMinutes: m, goalPromptSeen: true });
              toast(`Daily goal set: ${goalLabel(m)}.`, "success");
            }}
          />
          {settings.dailyGoalMinutes > 0 && (
            <Button variant="ghost" size="sm" onClick={() => learnerStore.updateSettings({ dailyGoalMinutes: 0, goalPromptSeen: true })}>
              Turn off my daily goal
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Change password" description="Changing your password signs you out on your other devices." />
        <form onSubmit={changePassword} className="p-4" noValidate>
          <FormError message={pwError} />
          <Field label="Current password" name="current-password" type="password" value={current} onChange={setCurrent} autoComplete="current-password" error={pwErrors.current} />
          <Field
            label="New password"
            name="new-password"
            type="password"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            error={pwErrors.next}
            hint={`At least ${PASSWORD_MIN} characters, with a letter and a number.`}
          />
          <Button type="submit" disabled={busy === "password"}>
            Change password
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Your data" description="Your progress, notes and bookmarks are stored with your account and follow you to every device." />
        <div className="flex flex-wrap gap-2 p-4">
          <Link href="/progress" className={buttonClass("secondary")}>
            View my progress
          </Link>
          <Link href="/settings" className={buttonClass("secondary")}>
            Settings and data export
          </Link>
          <Button
            variant="danger"
            disabled={busy === "logout"}
            onClick={async () => {
              setBusy("logout");
              await signOutEverywhereLocal();
            }}
            data-testid="logout"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Log out
          </Button>
        </div>
      </Card>
    </div>
  );
}

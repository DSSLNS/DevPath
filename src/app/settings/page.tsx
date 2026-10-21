import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Preferences and data are stored only in this browser." />
      <SettingsView />
    </div>
  );
}

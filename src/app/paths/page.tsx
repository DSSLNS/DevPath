import type { Metadata } from "next";
import { PathsView } from "@/components/paths/paths-view";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Learning Paths",
  description: "Frontend, Backend, Testing & Automation and Full Stack learning paths.",
};

export default function PathsPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Learning paths"
        description="Each path suggests an order of courses for a goal. The courses are shared between paths, so progress in one counts everywhere. Nothing is locked: open any course at any time."
      />
      <PathsView />
    </div>
  );
}

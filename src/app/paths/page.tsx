import type { Metadata } from "next";
import { PathsView } from "@/components/paths/paths-view";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Learning Paths",
  description: "Guided routes across technologies: frontend, backend, full-stack and test automation.",
};

export default function PathsPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Learning paths"
        description="A path suggests an order across technologies for a career goal. Choosing one personalises your dashboard and sidebar. Nothing is locked, so you can still open any course at any time."
      />
      <PathsView />
    </div>
  );
}

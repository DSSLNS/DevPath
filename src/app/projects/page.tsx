import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/card";
import { ProjectLibrary } from "@/components/projects/project-showcase";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Guided projects that build in small stages: requirements, user stories, step-by-step implementation, starter code, a reference solution and a testing checklist."
      />
      <ProjectLibrary />
    </div>
  );
}

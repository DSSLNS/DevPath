import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/card";
import { ProjectList } from "@/components/projects/project-list";

export const metadata: Metadata = { title: "Projects" };

const PLANNED = [
  "Expense tracker",
  "Product search and filtering",
  "Weather application using an API",
  "Shopping cart",
  "React task management application",
  "React product listing application",
  "E-commerce product details and variant selection",
  "Cypress E2E regression suite",
  "Playwright browser automation suite",
];

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Guided projects that build in small stages: requirements, user stories, step-by-step implementation, starter code, a reference solution and a testing checklist."
      />
      <ProjectList planned={PLANNED} />
    </div>
  );
}

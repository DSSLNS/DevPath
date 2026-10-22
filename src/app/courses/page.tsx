import type { Metadata } from "next";
import { CourseCatalog } from "@/components/courses/course-catalog";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Learn",
  description: "Choose a web development technology to learn: HTML, CSS, JavaScript, React, Node.js, databases, testing and more.",
};

export default function CoursesPage() {
  return (
    <div>
      <PageHeader
        title="What would you like to learn today?"
        description="Pick any technology. Courses are split into day-by-day plans, but the plans are recommendations: learn at your own pace and in any order. Technologies marked “Planned” show the curriculum we're writing; their lessons aren't published yet."
      />
      <CourseCatalog />
    </div>
  );
}

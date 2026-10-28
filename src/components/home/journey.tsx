"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";

const STEPS = [
  { n: "01", title: "Learn the Fundamentals", body: "Start with HTML, CSS and JavaScript in short, day-by-day lessons written for beginners.", href: "/courses", link: "Explore courses" },
  { n: "02", title: "Understand the Concepts", body: "Plain-English explanations, diagrams and line-by-line walkthroughs show why code works, not just what to type.", href: "/concepts", link: "Browse concepts" },
  { n: "03", title: "Practise with Code", body: "Run and edit real code in the browser. Exercises are checked by automated tests and HTML validation.", href: "/practice", link: "Open Practice Lab" },
  { n: "04", title: "Test Your Knowledge", body: "End-of-day assessments mix multiple choice, output prediction, debugging and coding tasks, with explanations.", href: "/quizzes", link: "Take an assessment" },
  { n: "05", title: "Build Real Projects", body: "Guided projects with requirements, milestones and testing checklists turn lessons into portfolio work.", href: "/projects", link: "See projects" },
  { n: "06", title: "Apply Your Skills", body: "Follow a career path for frontend, backend, testing or full stack, and keep growing from there.", href: "/paths", link: "Choose a path" },
];

/** Numbered learning journey: horizontal on large screens, vertical on mobile. The line draws in as it enters view. */
export function Journey() {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return el?.classList.add("is-visible");
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (el.classList.add("is-visible"), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Section labelledBy="journey-h">
      <SectionHeading id="journey-h" eyebrow="How DevPath works" title="Your Journey from Beginner to Developer" description="Six stages, at your own pace. Every stage links to real lessons and practice you can use today." />
      <ol ref={ref} className="journey reveal relative grid gap-8 lg:grid-cols-6 lg:gap-5">
        <span aria-hidden className="journey-line absolute top-6 right-0 left-0 hidden h-px origin-left bg-primary lg:block" />
        <span aria-hidden className="journey-line-v absolute top-6 bottom-6 left-6 w-px origin-top bg-primary lg:hidden" />
        {STEPS.map((s, i) => (
          <li key={s.n} className="relative grid grid-cols-[3rem_1fr] gap-4 lg:block" style={{ transitionDelay: `${i * 90}ms` }}>
            <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-primary/60 bg-bg font-display text-sm font-semibold text-primary shadow-sm">
              {s.n}
            </span>
            <div className="lg:mt-5">
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
              <Link href={s.href} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {s.link} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

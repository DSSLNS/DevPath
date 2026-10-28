"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { useLearnerState } from "@/lib/store/hooks";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { HeroVisual } from "./hero-visual";

const POINTS = ["No account needed", "Progress saved in your browser", "Code runs in a safe sandbox"];

export function Hero() {
  const catalog = useCatalog();
  const s = useLearnerState();
  // "Start Learning" resumes the last lesson, or opens the first HTML lesson for newcomers.
  const firstHtml = catalog.technologies.find((t) => t.id === "html")?.lessonIds[0];
  const startHref = s.lastLessonId ? `${catalog.lessonUrl(s.lastLessonId)}?resume=1` : firstHtml ? catalog.lessonUrl(firstHtml) : "/courses";
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface px-5 py-12 sm:px-10 sm:py-16 lg:px-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [background:var(--glow)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_70%_at_70%_40%,black,transparent)]"
      />
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <p className="eyebrow animate-rise">Free, open web development courses</p>
          <h1 id="hero-title" className="mt-5 animate-rise text-[2.4rem] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]">
            Build Your Web Development Skills,{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">One Step at a Time.</span>
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-muted [animation-delay:120ms] sm:text-lg">
            Learn frontend, backend, and test automation through practical lessons, clear explanations, coding challenges, and real-world projects.
          </p>
          <div className="mt-8 flex animate-rise flex-col gap-3 [animation-delay:220ms] sm:flex-row">
            <Link href="/paths" className={buttonClass("primary", "md", "h-11 justify-center px-5 text-[15px]")} data-testid="explore-paths">
              Explore Learning Paths <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href={startHref} className={cn(buttonClass("secondary", "md", "h-11 justify-center px-5 text-[15px]"))} data-testid="start-learning">
              {s.lastLessonId ? "Continue Learning" : "Start Learning"}
            </Link>
          </div>
          <ul className="mt-8 flex animate-rise flex-col gap-2.5 text-sm text-muted [animation-delay:320ms] sm:flex-row sm:flex-wrap sm:gap-x-6">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

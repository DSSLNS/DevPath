"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, CheckCircle2, Code2, ListChecks, XCircle } from "lucide-react";
import { useCatalog } from "@/lib/catalog/context";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { HighlightedCode } from "@/components/content/code-block-static";

/** Static, captioned previews of the three learning modes. Each links to the real, working feature. */
function Frame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <figure className="mt-5">
      <div aria-hidden className="overflow-hidden rounded-xl border border-border bg-bg p-4 text-[12px]">
        {children}
      </div>
      <figcaption className="mt-2 text-[11px] text-subtle">{caption}</figcaption>
    </figure>
  );
}

function LessonPreview() {
  return (
    <Frame caption="Illustration of a lesson page">
      <p className="text-[10px] font-semibold tracking-wide text-subtle uppercase">Learning objectives</p>
      <ul className="mt-1.5 space-y-1 text-muted">
        <li>
          • Use <code className="prose-code">map</code> to transform every element
        </li>
        <li>
          • Explain why <code className="prose-code">map</code> never changes the original
        </li>
      </ul>
      <div className="mt-3 flex items-center gap-1.5 text-[10.5px]">
        {["1 → 2", "2 → 4", "3 → 6", "[2, 4, 6]"].map((s, i) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="rounded-md border border-border bg-surface px-1.5 py-1">{s}</span>
            {i < 3 && <span className="text-subtle">→</span>}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-md border border-border bg-surface p-2 text-[10.5px]">
        <span className="font-mono text-primary">arr.map(fn)</span>
        <span className="text-muted">new array, same length</span>
        <span className="font-mono text-primary">arr.filter(fn)</span>
        <span className="text-muted">keeps matching items</span>
      </div>
    </Frame>
  );
}

function PracticePreview() {
  return (
    <Frame caption="Illustration of the code editor's HTML validation">
      <pre className="rounded-md border border-border bg-code p-2 font-mono text-[10.5px] leading-[1.5] text-code-fg">
        <HighlightedCode code={'<img src="cat.png" alt="Cat>\n<p>Hello</p>'} language="html" />
      </pre>
      <div className="mt-2 rounded-md border border-danger/30 bg-danger-soft p-2 text-[10.5px] text-danger">
        <p className="flex items-center gap-1 font-semibold">
          <XCircle className="h-3 w-3" /> Error: Unclosed quotation mark · Line 1
        </p>
        <p className="mt-0.5 text-fg/80">Add the closing quote after the alt text.</p>
      </div>
      <p className="mt-2 flex items-center gap-1 text-[10.5px] text-success">
        <CheckCircle2 className="h-3 w-3" /> 2 of 3 tests passed
      </p>
    </Frame>
  );
}

function AssessmentPreview() {
  return (
    <Frame caption="Illustration of an end-of-day assessment">
      <p className="font-medium">What does this print?</p>
      <pre className="mt-1.5 rounded-md border border-border bg-code p-2 font-mono text-[10.5px] text-code-fg">
        <HighlightedCode code={"console.log([1, 2, 3].map((n) => n * 2));"} language="js" />
      </pre>
      <div className="mt-2 space-y-1 text-[10.5px]">
        <p className="rounded-md border border-success/40 bg-success-soft px-2 py-1 text-success">✓ [ 2, 4, 6 ]: map returns a new array</p>
        <p className="rounded-md border border-border px-2 py-1 text-muted">12</p>
      </div>
    </Frame>
  );
}

export function Features() {
  const catalog = useCatalog();
  const firstLesson = catalog.technologies.find((t) => t.id === "javascript")?.lessonIds[0];
  const items = [
    {
      icon: BookOpenText,
      title: "Detailed lessons",
      body: "Beginner-friendly notes, worked examples, diagrams, common mistakes, cheat sheets and quick revision guides.",
      preview: <LessonPreview />,
      href: firstLesson ? catalog.lessonUrl(firstLesson) : "/courses",
      link: "Open a lesson",
    },
    {
      icon: Code2,
      title: "Coding practice",
      body: "Interactive editors that run your code in a sandbox, validate HTML, and check exercises and debugging tasks with tests.",
      preview: <PracticePreview />,
      href: "/practice/playground",
      link: "Try the real editor",
    },
    {
      icon: ListChecks,
      title: "Assessments",
      body: "Quizzes, output prediction, fill-in-the-blank and coding tasks, each with a clear explanation of the right answer.",
      preview: <AssessmentPreview />,
      href: "/quizzes",
      link: "Go to assessments",
    },
  ];
  return (
    <Section labelledBy="features-h">
      <SectionHeading id="features-h" eyebrow="How you learn" title="Learn It. Practise It. Prove It." description="Every lesson combines explanation, hands-on practice and a check of what you've understood." />
      <div className="grid gap-5 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, body, preview, href, link }, i) => (
          <Reveal key={title} delay={i * 90} className="h-full">
            <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary-soft-fg" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
              {preview}
              <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary hover:underline">
                {link} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

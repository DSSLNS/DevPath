import type { Metadata } from "next";
import { modules } from "@/content";
import type { CodeExample } from "@/content/types";
import { PageHeader } from "@/components/ui/card";
import { PlaygroundClient } from "@/components/practice/playground-client";
import { ActiveTimeTracker } from "@/components/lesson/active-time-tracker";

export const metadata: Metadata = { title: "JavaScript Playground" };

const STARTER = `// Write any JavaScript and press Run (Ctrl/⌘ + Enter).
const products = [
  { name: "Desk Lamp", price: 35, inStock: true },
  { name: "Office Chair", price: 180, inStock: false },
  { name: "Notebook", price: 4.5, inStock: true },
];

const available = products.filter((p) => p.inStock).map((p) => p.name);
console.log(available);
`;

export default function PlaygroundPage() {
  // Example library: the interactive examples from every published lesson.
  const library: (CodeExample & { group: string })[] = modules.flatMap((m) =>
    m.lessons.flatMap((l) => l.examples.map((e) => ({ ...e, title: `${l.title}: ${e.title}`, group: m.title }))),
  );
  return (
    <div>
      <ActiveTimeTracker />
      <PageHeader
        title="JavaScript Playground"
        description="An isolated sandbox for experiments. Code can't reach the network, cookies or storage, and long-running code is stopped automatically. Your draft is saved in this browser."
      />
      <PlaygroundClient starter={STARTER} library={library} />
    </div>
  );
}

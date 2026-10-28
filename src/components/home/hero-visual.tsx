import { HighlightedCode } from "@/components/content/code-block-static";

/**
 * Decorative hero composition: a browser preview, a JavaScript editor, an API response and a
 * test run, layered with soft depth. It is an illustration (aria-hidden), not a live editor;
 * the real editors live in lessons and the Practice Lab.
 */

const EDITOR_CODE = `const cart = [
  { name: "Mug", price: 12, qty: 2 },
  { name: "Tea", price: 8, qty: 3 },
];

const total = cart.reduce(
  (sum, item) => sum + item.price * item.qty,
  0,
);

console.log(\`Total: $\${total}\`);`;

function Dots() {
  return (
    <span className="flex gap-1.5" aria-hidden>
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
    </span>
  );
}

function BrowserPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
      <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-3 py-2">
        <Dots />
        <div className="h-5 flex-1 rounded-md bg-bg-subtle px-2 text-[10px] leading-5 text-subtle">devpath-portfolio.example</div>
      </div>
      <div className="space-y-3 bg-bg p-4">
        <div className="flex items-center justify-between">
          <span className="h-2.5 w-16 rounded bg-primary/70" />
          <span className="flex gap-2">
            <span className="h-2 w-8 rounded bg-border-strong" />
            <span className="h-2 w-8 rounded bg-border-strong" />
            <span className="h-2 w-8 rounded bg-border-strong" />
          </span>
        </div>
        <div className="grid grid-cols-[1.3fr_1fr] gap-3 pt-2">
          <div className="space-y-2">
            <span className="block h-3 w-[85%] rounded bg-fg/80" />
            <span className="block h-3 w-[60%] rounded bg-fg/80" />
            <span className="block h-2 w-[90%] rounded bg-border-strong" />
            <span className="block h-2 w-[70%] rounded bg-border-strong" />
            <span className="mt-1 block h-5 w-20 rounded-md bg-primary" />
          </div>
          <div className="rounded-lg bg-gradient-to-br from-primary/35 via-info/20 to-success/20" />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5 rounded-md border border-border bg-surface p-2">
              <span className="block h-8 rounded bg-surface-hover" />
              <span className="block h-1.5 w-[80%] rounded bg-border-strong" />
              <span className="block h-1.5 w-[55%] rounded bg-border-strong" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditorCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-code shadow-lg">
      <div className="flex items-center justify-between border-b border-code-border px-3 py-2 text-[10px] text-subtle">
        <span className="font-mono">cart.js</span>
        <span className="rounded bg-primary-soft px-1.5 py-0.5 font-medium text-primary-soft-fg">JavaScript</span>
      </div>
      <pre className="overflow-hidden px-3 py-2.5 font-mono text-[10.5px] leading-[1.55] text-code-fg">
        <HighlightedCode code={EDITOR_CODE} language="js" />
      </pre>
      <div className="border-t border-code-border px-3 py-1.5 font-mono text-[10.5px] text-success">› Total: $48</div>
    </div>
  );
}

function ApiCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-[10.5px]">
        <span className="rounded bg-success-soft px-1.5 py-0.5 font-semibold text-success">GET</span>
        <span className="text-muted">/api/courses</span>
        <span className="ml-auto text-success">200 OK</span>
      </div>
      <pre className="px-3 py-2.5 font-mono text-[10.5px] leading-[1.55] text-code-fg">
        <HighlightedCode code={`{\n  "id": "javascript",\n  "level": "beginner",\n  "lessons": 39\n}`} language="json" />
      </pre>
    </div>
  );
}

function TestCard() {
  const tests = ["renders the course heading", "adds a lesson to bookmarks", "saves progress after reload"];
  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between text-[10.5px]">
        <span className="font-semibold">Test run</span>
        <span className="rounded bg-success-soft px-1.5 py-0.5 font-medium text-success">3 passed</span>
      </div>
      <ul className="space-y-1.5 font-mono text-[10px]">
        {tests.map((t) => (
          <li key={t} className="flex items-center gap-1.5 text-muted">
            <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-success text-[8px] font-bold text-primary-fg">✓</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[6/5] w-full max-w-[34rem] lg:aspect-square lg:max-w-none" aria-hidden>
      {/* Soft gradient shapes for depth */}
      <div className="absolute top-[6%] right-[6%] h-[60%] w-[60%] rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute bottom-[2%] left-[4%] h-[38%] w-[42%] rounded-full bg-info/15 blur-3xl" />
      {/* Main layer: the website being built */}
      <div className="absolute top-[10%] right-0 w-[80%] animate-float-slow">
        <BrowserPreview />
      </div>
      {/* Overlapping layers sit on the browser's edges so it stays readable */}
      <div className="absolute top-0 left-0 hidden w-[36%] animate-float [animation-delay:-4s] sm:block">
        <ApiCard />
      </div>
      <div className="absolute bottom-0 left-0 w-[52%] animate-float [animation-delay:-2s]">
        <EditorCard />
      </div>
      <div className="absolute right-[2%] bottom-[4%] w-[40%] animate-float-slow [animation-delay:-5s]">
        <TestCard />
      </div>
    </div>
  );
}

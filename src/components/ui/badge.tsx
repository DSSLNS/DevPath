import type { Difficulty, Tech } from "@/content/types";
import { cn } from "./cn";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";
const tones: Record<Tone, string> = {
  neutral: "bg-bg-subtle text-muted border-border",
  primary: "bg-primary-soft text-primary-soft-fg border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11.5px] font-medium leading-none whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}

const diffTone: Record<Difficulty, Tone> = { beginner: "success", intermediate: "info", advanced: "warning" };
export function DifficultyBadge({ level }: { level: Difficulty }) {
  return <Badge tone={diffTone[level]}>{level[0].toUpperCase() + level.slice(1)}</Badge>;
}

const techLabel: Record<Tech, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  dom: "DOM",
  node: "Node.js",
  cypress: "Cypress",
  playwright: "Playwright",
};
export function TechBadges({ tech }: { tech: Tech[] }) {
  return (
    <>
      {tech.map((t) => (
        <Badge key={t} tone="neutral">
          {techLabel[t]}
        </Badge>
      ))}
    </>
  );
}
export { techLabel };

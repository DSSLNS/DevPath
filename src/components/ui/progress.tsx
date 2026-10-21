import { cn } from "./cn";

export function ProgressBar({ value, label, className, tone = "primary" }: { value: number; label: string; className?: string; tone?: "primary" | "success" }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle", className)}
    >
      <div className={cn("h-full rounded-full transition-[width]", tone === "success" ? "bg-success" : "bg-primary")} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 44, label }: { value: number; size?: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${Math.round(v)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="5"
        strokeDasharray={c}
        strokeDashoffset={c - (v / 100) * c}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.26} fontWeight="600" fill="var(--text)">
        {Math.round(v)}%
      </text>
    </svg>
  );
}

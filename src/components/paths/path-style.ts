import { Layers, Monitor, Server, TestTubes, type LucideIcon } from "lucide-react";
import type { PathAccent } from "@/content/types";

/** Per-path accent: one icon and one semantic colour, so the four paths are easy to tell apart. */
export const PATH_STYLE: Record<PathAccent, { icon: LucideIcon; iconClass: string; barClass: string; ring: string }> = {
  frontend: { icon: Monitor, iconClass: "bg-info-soft text-info", barClass: "bg-info", ring: "hover:border-info/50" },
  backend: { icon: Server, iconClass: "bg-success-soft text-success", barClass: "bg-success", ring: "hover:border-success/50" },
  testing: { icon: TestTubes, iconClass: "bg-warning-soft text-warning", barClass: "bg-warning", ring: "hover:border-warning/50" },
  fullstack: { icon: Layers, iconClass: "bg-primary-soft text-primary-soft-fg", barClass: "bg-primary", ring: "hover:border-primary/50" },
};

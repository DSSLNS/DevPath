"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Award,
  BookMarked,
  Check,
  ChevronRight,
  Code2,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  Layers,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Monitor,
  NotebookPen,
  Route,
  Search,
  Server,
  Settings,
  Sun,
  TestTubes,
  X,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useCatalog } from "@/lib/catalog/context";
import { learnerStore, useLearnerState, useStoreMeta } from "@/lib/store/hooks";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";
import { SearchPalette } from "./search-palette";

export const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Explore Courses", icon: GraduationCap },
  { href: "/paths/frontend", label: "Frontend Development", icon: Monitor },
  { href: "/paths/backend", label: "Backend Development", icon: Server },
  { href: "/paths/testing", label: "Testing & Automation", icon: TestTubes },
  { href: "/paths/fullstack", label: "Full Stack Development", icon: Layers },
  { href: "/paths", label: "Learning Paths", icon: Route },
  { href: "/practice", label: "Practice Lab", icon: FlaskConical },
  { href: "/quizzes", label: "Quizzes & Assessments", icon: ListChecks },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/bookmarks", label: "Bookmarks", icon: BookMarked },
  { href: "/notes", label: "My Notes", icon: NotebookPen },
  { href: "/progress", label: "My Progress", icon: Award },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

const noopSubscribe = () => () => {};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/paths") return pathname === "/paths";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global shortcut: Cmd/Ctrl + K or "/" opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only z-[80] rounded bg-primary px-3 py-2 text-primary-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex" aria-label="Primary">
        <Sidebar pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar pathname={pathname} />
      </MobileDrawer>

      <div className="lg:pl-64">
        <TopBar onMenu={() => setDrawerOpen(true)} onSearch={() => setSearchOpen(true)} />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 pt-5 pb-24 outline-none sm:px-6 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      <BottomNav pathname={pathname} onSearch={() => setSearchOpen(true)} onMore={() => setDrawerOpen(true)} />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  // Lesson and course pages belong to "Explore Courses".
  const inCourse = pathname.startsWith("/learn") || pathname.startsWith("/concepts") || pathname.startsWith("/e2e");
  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 font-semibold tracking-tight">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-fg" aria-hidden>
          DP
        </span>
        {siteConfig.name}
      </Link>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href) || (inCourse && href === "/courses");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active ? "bg-primary-soft font-medium text-primary-soft-fg" : "text-muted hover:bg-surface-hover hover:text-fg",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        {pathname.startsWith("/learn/") && <CourseTree pathname={pathname} />}
      </nav>
    </div>
  );
}

/** Lesson navigation for the course being studied, shown only on lesson pages. */
function CourseTree({ pathname }: { pathname: string }) {
  const catalog = useCatalog();
  const state = useLearnerState();
  const current = pathname.split("/")[2];
  const currentModule = catalog.modules.find((m) => m.slug === current);
  const tech = currentModule ? catalog.technologies.find((t) => t.moduleIds.includes(currentModule.id)) : undefined;
  const list = (tech?.moduleIds ?? (currentModule ? [currentModule.id] : [])).map((id) => catalog.moduleById.get(id)).filter((m) => !!m && m.lessons.length > 0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!list.length) return null;
  return (
    <div className="mt-5 border-t border-border pt-4">
      <h2 className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">
        <span className="sr-only">Lessons in </span>
        {tech ? (
          <Link href={`/courses/${tech.id}`} className="hover:text-fg">
            {tech.name} course
          </Link>
        ) : (
          currentModule?.title
        )}
      </h2>
      <ul className="space-y-0.5">
        {list.map((m) => {
          const expanded = open[m!.id] ?? m!.slug === current;
          const done = m!.lessons.filter((l) => state.lessons[l.id]?.completedAt).length;
          return (
            <li key={m!.id}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [m!.id]: !expanded }))}
                aria-expanded={expanded}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] text-muted hover:bg-surface-hover hover:text-fg"
              >
                <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", expanded && "rotate-90")} aria-hidden />
                <span className="min-w-0 flex-1 truncate">{m!.title}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-subtle" aria-label={`${done} of ${m!.lessons.length} lessons complete`}>
                  {done}/{m!.lessons.length}
                </span>
              </button>
              {expanded && (
                <ul className="mb-1 ml-4 border-l border-border pl-2">
                  {m!.lessons.map((l) => {
                    const href = `/learn/${m!.slug}/${l.slug}`;
                    const active = pathname === href;
                    const complete = !!state.lessons[l.id]?.completedAt;
                    return (
                      <li key={l.id}>
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-1.5 rounded px-2 py-1 text-[12.5px]",
                            active ? "bg-primary-soft text-primary-soft-fg" : "text-muted hover:bg-surface-hover hover:text-fg",
                          )}
                        >
                          {complete ? (
                            <Check className="h-3 w-3 shrink-0 text-success" aria-label="Completed" />
                          ) : (
                            <span className="h-3 w-3 shrink-0 rounded-full border border-border-strong" aria-hidden />
                          )}
                          <span className="truncate">{l.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                  {m!.planned.length > 0 && <li className="px-2 py-1 text-[11.5px] text-subtle">+ {m!.planned.length} lessons coming soon</li>}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TopBar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const meta = useStoreMeta();
  const mac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
  const dark = typeof document !== "undefined" && document.documentElement.dataset.theme === "dark";
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur sm:px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open navigation menu">
        <Menu className="h-5 w-5" aria-hidden />
      </Button>
      <button
        type="button"
        onClick={onSearch}
        data-testid="open-search"
        className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-bg px-3 text-sm text-subtle hover:border-border-strong sm:max-w-md"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">Search courses, lessons, notes, APIs…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-border bg-surface px-1.5 text-[11px] text-subtle sm:inline" suppressHydrationWarning>
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        {meta.saveStatus === "error" && (
          <span className="hidden text-xs text-danger md:inline" role="status">
            Not saved
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={() => {
            const isDark = document.documentElement.dataset.theme === "dark";
            learnerStore.updateSettings({ theme: isDark ? "light" : "dark" });
          }}
        >
          <Sun className="hidden h-4 w-4 dark:block" aria-hidden />
          <Moon className="h-4 w-4 dark:hidden" aria-hidden />
          <span className="sr-only" suppressHydrationWarning>
            {dark ? "Currently dark" : "Currently light"}
          </span>
        </Button>
        <Link href="/settings" className="hidden h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-fg sm:inline-flex" aria-label="Settings">
          <Settings className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </header>
  );
}

function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label="Navigation"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Close on backdrop clicks and whenever a link inside the drawer is followed.
        if (e.target === ref.current || (e.target as HTMLElement).closest("a")) onClose();
      }}
      className="m-0 h-full max-h-none w-72 max-w-[85vw] border-r border-border bg-surface p-0 text-fg lg:hidden"
    >
      {open && (
        <div className="relative h-full">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation menu" className="absolute top-3 right-2 z-10">
            <X className="h-4 w-4" aria-hidden />
          </Button>
          {children}
        </div>
      )}
    </dialog>
  );
}

function BottomNav({ pathname, onSearch, onMore }: { pathname: string; onSearch: () => void; onMore: () => void }) {
  const items = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/courses", label: "Learn", icon: GraduationCap },
    { href: "/practice", label: "Practice", icon: Code2 },
  ];
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px]", isActive(pathname, href) ? "text-primary" : "text-muted")}
        >
          <Icon className="h-5 w-5" aria-hidden />
          {label}
        </Link>
      ))}
      <button type="button" onClick={onSearch} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted">
        <Search className="h-5 w-5" aria-hidden />
        Search
      </button>
      <button type="button" onClick={onMore} className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted">
        <Menu className="h-5 w-5" aria-hidden />
        More
      </button>
    </nav>
  );
}

import { describe, expect, it } from "vitest";
import { createActivityClock, IDLE_AFTER_MS } from "@/lib/activity-time";
import { safeNext, validateEmail, validatePassword } from "@/lib/auth-validation";
import { injectIntoHead } from "@/lib/sandbox/web-document";
import { runWebPage } from "@/lib/sandbox/node-runner";
import { createDefaultState, parseState } from "@/lib/store/schema";
import { LearnerStore, memoryAdapter, todayKey } from "@/lib/store/store";
import { assessmentQuestions, getCourse, getLessonRef, getTechnology, modules, technologies } from "@/content";
import { curriculumManifest, lessonIdFor } from "@/content/curriculum/manifest";
import { DAY_BUDGET_MINUTES } from "@/content/technologies/roadmap";

describe("active time", () => {
  it("counts only visible time before the learner goes idle", () => {
    const clock = createActivityClock(0);
    expect(clock.tick(5_000, true)).toBe(5_000);
    expect(clock.tick(10_000, false)).toBe(0); // tab hidden
    expect(clock.tick(IDLE_AFTER_MS + 5_000, true)).toBe(IDLE_AFTER_MS - 10_000); // stops counting after the idle window
    expect(clock.tick(IDLE_AFTER_MS + 30_000, true)).toBe(0);
    clock.interact(IDLE_AFTER_MS + 30_000);
    expect(clock.tick(IDLE_AFTER_MS + 35_000, true)).toBe(5_000);
  });

  it("records time per day and per lesson in the store", () => {
    const store = new LearnerStore();
    store.hydrate(memoryAdapter());
    store.openLesson("arrays-map");
    store.addActiveTime(90, "arrays-map");
    store.addActiveTime(30);
    expect(store.getState().timeLog[todayKey()]).toBe(120);
    expect(store.getState().lessons["arrays-map"].activeSeconds).toBe(90);
  });
});

describe("goal settings", () => {
  it("validates the goal and prompt flags", () => {
    const ok = parseState(JSON.stringify({ ...createDefaultState(), settings: { dailyGoalMinutes: 45, goalPromptSeen: true } })).state.settings;
    expect(ok).toMatchObject({ dailyGoalMinutes: 45, goalPromptSeen: true });
    const bad = parseState(JSON.stringify({ ...createDefaultState(), settings: { dailyGoalMinutes: 9999, goalPromptSeen: "yes" } })).state.settings;
    expect(bad).toMatchObject({ dailyGoalMinutes: 0, goalPromptSeen: false });
  });
});

describe("account form validation", () => {
  it("validates email and password rules", () => {
    expect(validateEmail("ada@example.com")).toBeNull();
    expect(validateEmail("ada@")).not.toBeNull();
    expect(validatePassword("short1")).not.toBeNull();
    expect(validatePassword("onlyletterslong")).not.toBeNull();
    expect(validatePassword("correct horse 42")).toBeNull();
  });
  it("only allows same-site redirects after login", () => {
    expect(safeNext("/courses/html")).toBe("/courses/html");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext(null)).toBe("/");
  });
});

describe("web runtime", () => {
  it("injects into the head of full documents and wraps fragments", () => {
    expect(injectIntoHead('<!doctype html><html lang="en"><head><title>T</title></head></html>', "<X>")).toBe('<!doctype html><X><html lang="en"><head><title>T</title></head></html>');
    expect(injectIntoHead("<html><body>b</body></html>", "<X>")).toBe("<X><html><body>b</body></html>");
    expect(injectIntoHead("<header>h</header>", "<X>")).toContain("<head><meta charset=\"utf-8\"><X></head><body><header>h</header>");
  });
  it("keeps the injected policy first in <head> even when learner markup precedes <head>", async () => {
    const page = '<!doctype html><script>var early = 1;</script><html lang="fr"><head><title>T</title></head><body><p>x</p></body></html>';
    const r = await runWebPage(injectIntoHead(page, '<meta name="sandbox-policy" content="1">'), [
      { name: "policy is the first head element", code: "assert.equal(document.head.firstElementChild.getAttribute('name'), 'sandbox-policy')" },
      { name: "learner attributes and mode survive", code: "assert.equal(document.documentElement.lang, 'fr'); assert.equal(document.compatMode, 'CSS1Compat'); assert.equal(document.title, 'T')" },
    ]);
    expect(r.tests.map((t) => [t.name, t.passed, t.message])).toEqual([
      ["policy is the first head element", true, ""],
      ["learner attributes and mode survive", true, ""],
    ]);
  });

  it("runs tests against the learner's page, including the cascade", async () => {
    const page = "<!doctype html><html lang=\"en\"><head><title>Shop</title><style>#buy{color:red} .btn{color:blue}</style></head><body><a id=\"buy\" class=\"btn\" href=\"/cart\">Buy</a></body></html>";
    const r = await runWebPage(page, [
      { name: "lang", code: "assert.equal(document.documentElement.lang, 'en')" },
      { name: "id beats class", code: "assert.equal(getComputedStyle(document.getElementById('buy')).color, 'rgb(255, 0, 0)')" },
    ]);
    expect(r.tests.every((t) => t.passed)).toBe(true);
  });
});

describe("technology catalog and roadmaps", () => {
  it("has unique technology ids and valid references", () => {
    const ids = technologies.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    const moduleIds = new Set(modules.map((m) => m.id));
    for (const t of technologies) {
      for (const p of t.prerequisites) expect(ids, `${t.id} prerequisite ${p}`).toContain(p);
      for (const m of t.moduleIds) expect(moduleIds.has(m), `${t.id} module ${m}`).toBe(true);
    }
    // A module belongs to at most one technology.
    const owned = technologies.flatMap((t) => t.moduleIds);
    expect(new Set(owned).size).toBe(owned.length);
  });

  it("schedules every manifest lesson of a course exactly once", () => {
    for (const t of technologies.filter((x) => x.moduleIds.length)) {
      const expected = t.moduleIds.flatMap((id) => {
        const m = curriculumManifest.find((x) => x.id === id)!;
        return m.lessons.map(([slug]) => lessonIdFor(m.slug, slug));
      });
      const days = getCourse(t).weeks.flatMap((w) => w.days);
      const scheduled = days.filter((d) => d.kind === "learn").flatMap((d) => d.lessonIds);
      expect(scheduled.sort(), t.id).toEqual([...expected].sort());
      expect(days.map((d) => d.day)).toEqual(days.map((_, i) => i + 1));
    }
  });

  it("sizes auto-planned days within the daily budget and adds weekly reviews", () => {
    const js = getCourse(getTechnology("javascript")!);
    for (const w of js.weeks) {
      expect(w.days.at(-1)?.kind).toBe("review");
      for (const d of w.days.filter((x) => x.kind === "learn")) {
        if (d.lessonIds.length > 1) expect(d.minutes - 10, `day ${d.day}`).toBeLessThanOrEqual(DAY_BUDGET_MINUTES);
      }
    }
  });

  it("builds day assessments only from that day's lessons, covering each lesson", () => {
    const day1 = getCourse(getTechnology("html")!).weeks[0].days[0];
    const published = day1.lessonIds.filter((id) => getLessonRef(id));
    const qs = assessmentQuestions(published, 12);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => published.includes(q.lessonId))).toBe(true);
    expect(new Set(qs.map((q) => q.lessonId))).toEqual(new Set(published));
  });
});

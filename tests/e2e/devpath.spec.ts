import { expect, test } from "@playwright/test";

const HTML_LESSON = "/learn/html/document-structure";

test.describe("no accounts", () => {
  test("the site opens on the dashboard with no login, sign-up or auth routes", async ({ page, request }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Build Your Web Development Skills, One Step at a Time." })).toBeVisible();
    await expect(page.getByRole("link", { name: /log in|sign up/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /log in|sign up/i })).toHaveCount(0);
    for (const url of ["/login", "/signup", "/account", "/forgot-password", "/reset-password", "/api/auth/get-session", "/api/progress"]) {
      expect((await request.get(url)).status(), url).toBe(404);
    }
  });

  test("progress persists in this browser and can be reset with confirmation", async ({ page }) => {
    await page.goto(HTML_LESSON);
    await page.getByTestId("mark-complete").click();
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");
    await page.reload();
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");

    await page.goto("/");
    await expect(page.getByTestId("continue-learning")).toBeVisible();
    await expect(page.getByTestId("path-card-frontend")).toContainText("Your progress");

    await page.goto("/settings");
    await page.getByRole("button", { name: "Reset all progress" }).click();
    await page.getByRole("dialog", { name: "Reset all progress?" }).getByRole("button", { name: "Delete everything" }).click();
    await page.goto(HTML_LESSON);
    await expect(page.getByTestId("lesson-status")).not.toContainText("Completed");
  });

  test("the daily goal is optional and can be set or skipped", async ({ page }) => {
    await page.goto(HTML_LESSON);
    await page.getByTestId("mark-complete").click();
    await page.goto("/");
    await page.getByTestId("set-goal").click();
    const dialog = page.getByRole("dialog", { name: "What is your learning goal?" });
    await dialog.getByRole("radio", { name: "30 minutes" }).click();
    await dialog.getByTestId("goal-save").click();
    await expect(page.getByTestId("today-plan")).toContainText("30 minutes goal");
    await page.reload();
    await expect(page.getByTestId("today-plan")).toContainText("30 minutes goal");
  });
});

test.describe("dashboard and learning paths", () => {
  test("new learners see the landing sections with real data, not empty statistics", async ({ page }) => {
    await page.goto("/");
    for (const id of ["frontend", "backend", "testing", "fullstack"]) await expect(page.getByTestId(`path-card-${id}`)).toBeVisible();
    await expect(page.getByTestId("path-card-frontend").getByTestId("path-availability")).toContainText("courses have lessons");
    await expect(page.getByTestId("path-card-frontend")).not.toContainText("Your progress");
    await expect(page.getByTestId("progress-overview")).toHaveCount(0);
    for (const h of ["Your Journey from Beginner to Developer", "Learn It. Practise It. Prove It.", "Build Real Projects", "Find Your Next Course"])
      await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
    // Hero actions work.
    await page.getByTestId("start-learning").click();
    await expect(page).toHaveURL(/\/learn\/html\//);
  });

  test("featured projects link to real project pages or their learning path", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("project-card-todo-list").getByRole("link", { name: "View project" }).click();
    await expect(page).toHaveURL(/\/projects\/todo-list$/);
    await page.goto("/");
    const planned = page.getByTestId("project-card-planned-express-api");
    await expect(planned).toContainText("Coming soon");
    await planned.getByRole("link", { name: /Learn the skills/ }).click();
    await expect(page).toHaveURL(/\/paths\/backend$/);
  });

  test("course discovery filters by learning path and progress", async ({ page }) => {
    await page.goto("/courses");
    await page.getByTestId("filter-path").selectOption("testing");
    await expect(page.getByTestId("tech-card-cypress")).toBeVisible();
    await expect(page.getByTestId("tech-card-react")).toHaveCount(0);
    await page.getByTestId("filter-progress").selectOption("in-progress");
    await expect(page.getByRole("heading", { name: "No technologies match" })).toBeVisible();
  });

  test("search finds technologies", async ({ page }) => {
    await page.goto("/search?q=cypress");
    await expect(page.getByRole("link", { name: /^Cypress/ }).first()).toBeVisible();
  });

  test("a path page lists ordered steps and opens the right course", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("path-card-frontend").getByRole("link", { name: "Frontend Development" }).click();
    await expect(page).toHaveURL(/\/paths\/frontend$/);
    await expect(page.getByTestId("path-step-html")).toContainText("Up next");
    await expect(page.getByTestId("path-step-git")).toContainText("Coming soon");
    await page.getByTestId("path-step-css").getByRole("link", { name: "CSS" }).click();
    await expect(page).toHaveURL(/\/courses\/css$/);
    await expect(page.getByTestId("roadmap-day-1")).toBeVisible();
    expect((await page.goto("/paths/not-a-path"))?.status()).toBe(404);
  });

  test("testing path links Cypress and Playwright notes", async ({ page }) => {
    await page.goto("/paths/testing");
    await expect(page.getByTestId("path-step-cypress").getByRole("link", { name: "Cypress", exact: true })).toBeVisible();
    await page.getByTestId("path-step-network").getByRole("link", { name: /Network/i }).first().click();
    await expect(page).toHaveURL(/\/e2e\//);
  });
});

test.describe("courses and lessons", () => {
  test("search and filters find technologies; coming-soon ones are labelled honestly", async ({ page }) => {
    await page.goto("/courses");
    await page.getByTestId("tech-search").fill("playwright");
    await expect(page.getByTestId("tech-card-playwright")).toBeVisible();
    await expect(page.getByTestId("tech-card-html")).toHaveCount(0);
    await page.getByTestId("tech-search").fill("");
    await page.getByLabel("Category").selectOption("databases");
    await expect(page.getByTestId("tech-card-sql")).toContainText("Coming soon");
  });

  test("a day plan links lessons, an assessment and a summary", async ({ page }) => {
    await page.goto("/courses/html/day/1");
    await expect(page.getByRole("heading", { name: /End-of-day assessment/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Practical coding tasks" })).toBeVisible();
    await expect(page.getByTestId("day-summary")).toContainText("Not taken yet");
    expect((await page.goto("/courses/html/day/3"))?.status()).toBe(404);
  });

  test("HTML lessons render learner pages in the sandboxed preview", async ({ page }) => {
    await page.goto(HTML_LESSON);
    const runner = page.getByRole("region", { name: "Lesson playground" });
    await runner.getByTestId("run-code").click();
    await expect(runner.getByTestId("dom-preview").frameLocator("iframe").locator("body")).not.toBeEmpty();
  });
});

test.describe("HTML validation", () => {
  async function typeInto(page: import("@playwright/test").Page, scope: import("@playwright/test").Locator, code: string) {
    const editor = scope.getByRole("textbox").first();
    await editor.click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.press("Delete");
    await editor.fill(code);
  }

  test("an incomplete tag is reported and does not render as if it were valid", async ({ page }) => {
    await page.goto("/practice/playground");
    await page.getByLabel("Environment").selectOption("web");
    const runner = page.getByRole("region", { name: "Playground" });
    await typeInto(page, runner, "<html");
    await runner.getByTestId("run-code").click();
    const diagnostics = runner.getByTestId("html-diagnostics");
    await expect(diagnostics).toContainText("Incomplete HTML tag");
    await expect(diagnostics).toContainText("Line 1, column");
    await expect(runner.getByTestId("preview-blocked")).toBeVisible();
    // The learner's code is left untouched so they can fix it.
    await expect(runner.getByRole("textbox").first()).toHaveText("<html");

    await runner.getByTestId("show-repaired").click();
    await expect(runner.getByText("Browser-repaired version of invalid HTML")).toBeVisible();

    await typeInto(page, runner, "<h1>Hello</h1>\n<br>\n<img src=\"data:,\" alt=\"Photo\">");
    await runner.getByTestId("run-code").click();
    await expect(runner.getByTestId("html-valid")).toContainText("HTML snippet");
    await expect(runner.getByTestId("preview-blocked")).toHaveCount(0);
  });

  test("an HTML exercise with broken markup is not marked as passed", async ({ page }) => {
    await page.goto("/learn/html/document-structure");
    const card = page.getByTestId("exercise-html-document-structure-ex-2");
    await typeInto(page, card, "<!doctype html>\n<html lang=\"en\">\n<head>\n<title>Shop</title>\n</head>\n<body>\n<h1 class=\"title>Shop</h1>\n</body>\n</html>");
    await card.getByTestId("run-code").click();
    await expect(card.getByTestId("html-diagnostics")).toContainText("Unclosed quotation mark");
    await expect(card).toContainText("so the page wasn't checked");
    await expect(card.getByLabel("Test results")).toHaveCount(0);
  });

  test("the intentional malformed-HTML demo still renders, with an explanation", async ({ page }) => {
    await page.goto("/learn/html/what-is-html");
    const runner = page.getByRole("region", { name: "Lesson playground" });
    await runner.getByLabel("Example").selectOption({ label: "A forgiven mistake (unclosed strong)" });
    await runner.getByTestId("run-code").click();
    await expect(runner.getByTestId("html-diagnostics")).toContainText("broken on purpose");
    await expect(runner.getByTestId("preview-blocked")).toHaveCount(0);
    await expect(runner.getByTestId("dom-preview").frameLocator("iframe").locator("body")).not.toBeEmpty();
  });
});

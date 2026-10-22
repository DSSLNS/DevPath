import { expect, test } from "@playwright/test";

const HTML_LESSON = "/learn/html/document-structure";

test.describe("no accounts", () => {
  test("the site opens on the dashboard with no login, sign-up or auth routes", async ({ page, request }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "Learn Web Development, Step by Step." })).toBeVisible();
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
  test("new learners see the four paths and starting points, not empty statistics", async ({ page }) => {
    await page.goto("/");
    for (const id of ["frontend", "backend", "testing", "fullstack"]) await expect(page.getByTestId(`path-card-${id}`)).toBeVisible();
    await expect(page.getByTestId("onboarding")).toBeVisible();
    await expect(page.getByTestId("progress-overview")).toHaveCount(0);
    await expect(page.getByTestId("path-card-frontend")).not.toContainText("Your progress");
  });

  test("hero search finds technologies", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-search").fill("cypress");
    await page.getByTestId("hero-search").press("Enter");
    await expect(page).toHaveURL(/\/search\?q=cypress/);
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

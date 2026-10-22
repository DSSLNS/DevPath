import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const HTML_LESSON = "/learn/html/document-structure";
const PASSWORD = "learn-web-dev-42";

const uniqueEmail = (tag: string) => `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

async function signUp(page: Page, email: string, name = "Ada Learner") {
  await page.goto("/signup");
  await page.getByLabel("Name or display name", { exact: true }).fill(name);
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByTestId("account-menu")).toBeVisible();
}

async function logIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByTestId("account-menu")).toBeVisible();
}

async function logOut(page: Page) {
  await page.goto("/account");
  await page.getByTestId("logout").click();
  await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
}

async function skipGoal(page: Page) {
  const dialog = page.getByRole("dialog", { name: "What is your learning goal?" });
  await expect(dialog).toBeVisible();
  await dialog.getByTestId("goal-skip").click();
  await expect(dialog).toBeHidden();
}

test.describe("technology catalog and courses", () => {
  test("search and filters find technologies; planned ones are labelled honestly", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByRole("heading", { level: 1, name: "What would you like to learn today?" })).toBeVisible();
    await page.getByTestId("tech-search").fill("playwright");
    await expect(page.getByTestId("tech-card-playwright")).toBeVisible();
    await expect(page.getByTestId("tech-card-html")).toHaveCount(0);
    await page.getByTestId("tech-search").fill("");
    await page.getByLabel("Category").selectOption("databases");
    await expect(page.getByTestId("tech-card-sql")).toContainText("Planned");
    await page.getByTestId("tech-card-sql").getByRole("link").click();
    await expect(page.getByRole("heading", { name: "Planned curriculum" })).toBeVisible();
  });

  test("a day plan links lessons, an assessment and a summary", async ({ page }) => {
    await page.goto("/courses/html");
    await expect(page.getByTestId("roadmap-day-1")).toContainText("What HTML Is");
    await page.getByTestId("roadmap-day-1").getByRole("link", { name: "Open day plan" }).click();
    await expect(page).toHaveURL(/\/courses\/html\/day\/1$/);
    await expect(page.getByRole("heading", { name: "Learning objectives" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /End-of-day assessment/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Practical coding tasks" })).toBeVisible();
    await expect(page.getByTestId("day-summary")).toContainText("Not taken yet");
    // Planned days are not openable.
    expect((await page.goto("/courses/html/day/3"))?.status()).toBe(404);
  });

  test("HTML lessons render learner pages in the sandboxed preview", async ({ page }) => {
    await page.goto(HTML_LESSON);
    await expect(page.getByRole("heading", { name: "Best practices" })).toBeVisible();
    await expect(page.getByRole("table", { name: "Cheat sheet" })).toBeVisible();
    const runner = page.getByRole("region", { name: "Lesson playground" });
    await expect(runner.getByText("HTML/CSS preview")).toBeVisible();
    await runner.getByTestId("run-code").click();
    const preview = runner.getByTestId("dom-preview").frameLocator("iframe");
    await expect(preview.locator("body")).not.toBeEmpty();
  });
});

test.describe("accounts and saved progress", () => {
  test("sign up, optional goal, progress persists across logout and login", async ({ page }) => {
    const email = uniqueEmail("persist");
    await signUp(page, email);

    const dialog = page.getByRole("dialog", { name: "What is your learning goal?" });
    await expect(dialog).toBeVisible();
    // The dashboard stays usable behind the optional popup.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await dialog.getByRole("radio", { name: "30 minutes" }).click();
    await dialog.getByTestId("goal-save").click();
    await expect(dialog).toBeHidden();

    await page.goto(HTML_LESSON);
    await page.getByTestId("mark-complete").click();
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");
    await expect(page.getByText("Saved to your account")).toBeVisible();

    await page.goto("/account");
    await page.getByTestId("logout").click();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
    // Signed out: the account's progress is not left in this browser.
    await page.goto(HTML_LESSON);
    await expect(page.getByTestId("lesson-status")).not.toContainText("Completed");

    await logIn(page, email);
    // The goal question is never asked twice.
    await expect(page.getByRole("dialog", { name: "What is your learning goal?" })).toHaveCount(0);
    await page.goto(HTML_LESSON);
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");
    await page.goto("/");
    await expect(page.getByTestId("today-plan")).toContainText("30 minutes goal");
  });

  test("sign-up and login validation messages", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name or display name", { exact: true }).fill("Grace");
    await page.getByLabel("Email address", { exact: true }).fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByLabel("Confirm password", { exact: true }).fill("different");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Use at least 10 characters.")).toBeVisible();
    await expect(page.getByText("The passwords don't match.")).toBeVisible();

    const email = uniqueEmail("dupe");
    await signUp(page, email);
    await skipGoal(page);
    await logOut(page);
    await page.goto("/signup");
    await page.getByLabel("Name or display name", { exact: true }).fill("Grace");
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("An account with this email already exists")).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("wrong-password-1");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "don't match an account" })).toBeVisible();
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  });

  test("guest progress can be added to a new account", async ({ page }) => {
    await page.goto(HTML_LESSON);
    await page.getByTestId("mark-complete").click();
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");
    await signUp(page, uniqueEmail("guest"));
    const importDialog = page.getByRole("dialog", { name: "Add this browser's progress to your account?" });
    await expect(importDialog).toContainText("1 completed lesson");
    await importDialog.getByTestId("merge-guest-progress").click();
    await skipGoal(page);
    await page.goto(HTML_LESSON);
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");
  });

  test("password reset flow", async ({ page }) => {
    const email = uniqueEmail("reset");
    await signUp(page, email);
    await skipGoal(page);
    await logOut(page);

    await page.goto("/forgot-password");
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("If an account exists for that email")).toBeVisible();

    const mail = readFileSync(".data/e2e-mail.log", "utf8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as { to: string; text: string })
      .filter((m) => m.to === email)
      .at(-1);
    const link = mail?.text.match(/https?:\/\/\S+/)?.[0];
    expect(link).toBeTruthy();
    await page.goto(link!);
    await expect(page).toHaveURL(/\/reset-password\?token=/);
    await page.getByLabel("New password", { exact: true }).fill("brand-new-pass-7");
    await page.getByLabel("Confirm new password", { exact: true }).fill("brand-new-pass-7");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByText("Your password was changed")).toBeVisible();
    await logIn(page, email, "brand-new-pass-7");
  });

  test("two devices saving at once both keep their progress", async ({ browser }) => {
    const email = uniqueEmail("sync");
    const a = await (await browser.newContext()).newPage();
    await signUp(a, email);
    await skipGoal(a);
    const b = await (await browser.newContext()).newPage();
    await logIn(b, email);

    await a.goto("/learn/html/what-is-html");
    await b.goto("/learn/css/what-is-css");
    await a.getByTestId("mark-complete").click();
    await expect(a.getByText("Saved to your account")).toBeVisible();
    // Device B still holds the older revision: its save conflicts and is merged on the client.
    await b.getByTestId("mark-complete").click();
    await expect(b.getByText("Saved to your account")).toBeVisible();

    for (const [page, url] of [
      [a, "/learn/css/what-is-css"],
      [b, "/learn/html/what-is-html"],
    ] as const) {
      await page.goto(url);
      await expect(page.getByTestId("lesson-status")).toContainText("Completed");
    }
  });
});

test.describe("access control", () => {
  test("progress API and account page require a session", async ({ page, request }) => {
    expect((await request.get("/api/progress")).status()).toBe(401);
    const put = await request.put("/api/progress", { data: { baseRevision: 0, state: { version: 1 } } });
    expect(put.status()).toBe(401);
    await page.goto("/account");
    await expect(page).toHaveURL(/\/login\?next=(%2F|\/)account/);
  });

  test("a signed-in user only ever sees their own progress", async ({ browser }) => {
    const alice = await (await browser.newContext()).newPage();
    await signUp(alice, uniqueEmail("alice"), "Alice");
    await skipGoal(alice);
    await alice.goto(HTML_LESSON);
    await alice.getByTestId("mark-complete").click();
    await expect(alice.getByText("Saved to your account")).toBeVisible();

    const bob = await (await browser.newContext()).newPage();
    await signUp(bob, uniqueEmail("bob"), "Bob");
    await skipGoal(bob);
    const res = await bob.request.get("/api/progress");
    const body = (await res.json()) as { user: { name: string }; state: { lessons: Record<string, unknown> } | null };
    expect(body.user.name).toBe("Bob");
    expect(Object.keys(body.state?.lessons ?? {})).not.toContain("html-document-structure");
  });
});

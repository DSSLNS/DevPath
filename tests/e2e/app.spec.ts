import { expect, test, type Page } from "@playwright/test";

const LESSON = "/learn/arrays/map";

async function runCode(page: Page, code: string) {
  const runner = page.getByRole("region", { name: "Lesson playground" });
  const editor = runner.getByRole("textbox", { name: /Lesson playground code editor/ });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Delete");
  await editor.fill(code);
  await runner.getByTestId("run-code").click();
  return runner.getByTestId("console-output");
}

test.describe("navigation and shell", () => {
  test("new learner sees onboarding, not invented progress", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("onboarding")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "What would you like to learn today?" })).toBeVisible();
  });

  test("primary navigation reaches every section", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    for (const [label, heading] of [
      ["Learn", "What would you like to learn today?"],
      ["Learning Paths", "Learning paths"],
      ["JavaScript Curriculum", "Learn JavaScript"],
      ["JavaScript Concepts", "JavaScript Concepts"],
      ["Practice Lab", "Practice Lab"],
      ["Quizzes & Assessments", "Quizzes & Assessments"],
      ["E2E Testing Notes", "E2E Testing Notes"],
      ["Projects", "Projects"],
      ["Bookmarks", "Bookmarks"],
      ["My Notes", "My Notes"],
      ["My Progress", "Progress & Achievements"],
      ["Settings", "Settings"],
    ]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });

  test("unknown lesson shows a 404 page", async ({ page }) => {
    const res = await page.goto("/learn/arrays/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("curriculum lists published and planned lessons", async ({ page }) => {
    await page.goto("/learn/arrays");
    await expect(page.getByRole("link", { name: /map/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Planned lessons (not yet published)" })).toBeVisible();
  });
});

test.describe("lesson experience", () => {
  test("renders full lesson structure", async ({ page }) => {
    await page.goto(LESSON);
    await expect(page.getByRole("heading", { level: 1, name: "map" })).toBeVisible();
    for (const h of ["Learning objectives", "Prerequisites"]) await expect(page.getByRole("heading", { name: h })).toBeVisible();
    for (const h of ["Try it yourself", "Common mistakes", "Debugging tips", "Quick revision", "Practice", "End-of-lesson assessment", "Related and further reading"])
      await expect(page.getByRole("heading", { level: 2, name: h, exact: true })).toBeVisible();
  });

  test("runs code in the sandbox and shows output", async ({ page }) => {
    await page.goto(LESSON);
    const out = await runCode(page, "console.log([1, 2, 3].map((n) => n * 2));");
    await expect(out).toContainText("[ 2, 4, 6 ]");
  });

  test("reports runtime errors with a line number", async ({ page }) => {
    await page.goto(LESSON);
    const out = await runCode(page, "const a = 1;\nnotDefined();");
    await expect(out).toContainText("ReferenceError: notDefined is not defined");
    await expect(out).toContainText("at line 2");
  });

  test("sandbox blocks network, storage and parent access", async ({ page }) => {
    await page.goto(LESSON);
    const out = await runCode(
      page,
      [
        "console.log('fetch:', typeof fetch);",
        "try { localStorage.getItem('x'); console.log('storage: allowed'); } catch (e) { console.log('storage: blocked'); }",
        "try { console.log('parent:', typeof parent.document.cookie); } catch (e) { console.log('parent: blocked'); }",
      ].join("\n"),
    );
    await expect(out).toContainText("fetch: undefined");
    await expect(out).toContainText("storage: blocked");
    await expect(out).not.toContainText("storage: allowed");
  });

  test("stops infinite loops without freezing the app", async ({ page }) => {
    await page.goto("/settings");
    await page.getByLabel("Code execution time limit").selectOption("2000");
    await page.goto(LESSON);
    const out = await runCode(page, "while (true) {}");
    await expect(out).toContainText("Execution stopped after 2s", { timeout: 8000 });
    // The page is still responsive.
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
  });

  test("predict-output exercise validates and explains", async ({ page }) => {
    await page.goto(LESSON);
    const card = page.getByTestId("exercise-arrays-map-ex-2");
    await card.getByLabel(/Expected console output/).fill("[ 'cart', 'checkout' ]\n2");
    await card.getByRole("button", { name: "Check answer" }).click();
    await expect(card.getByText("Not quite")).toBeVisible();
    await card.getByRole("button", { name: "Try again" }).click();
    await card.getByLabel(/Expected console output/).fill("[ 'CART', 'CHECKOUT' ]\n2");
    await card.getByRole("button", { name: "Check answer" }).click();
    await expect(card.getByText("Correct", { exact: true })).toBeVisible();
    await expect(card.getByText("2 attempts")).toBeVisible();
  });

  test("saved answers are restored after a reload", async ({ page }) => {
    await page.goto(LESSON);
    const card = page.getByTestId("exercise-arrays-map-ex-2");
    await card.getByLabel(/Expected console output/).fill("my guess");
    await card.getByRole("button", { name: "Check answer" }).click();
    await page.reload();
    await expect(page.getByTestId("exercise-arrays-map-ex-2").getByLabel(/Expected console output/)).toHaveValue("my guess");
  });

  test("code exercise runs tests in the sandbox", async ({ page }) => {
    await page.goto(LESSON);
    const card = page.getByTestId("exercise-arrays-map-ex-1");
    await card.getByRole("button", { name: "Run tests" }).click();
    await expect(card.getByText(/of 3 tests passed/)).toBeVisible();
    const editor = card.getByRole("textbox", { name: /Your solution code editor/ });
    await editor.click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.press("Delete");
    await editor.fill("function squareAll(numbers) {\nreturn numbers.map((n) => n * n);\n}");
    await card.getByRole("button", { name: "Run tests" }).click();
    await expect(card.getByText("All tests passed.")).toBeVisible();
  });

  test("hints are progressive and solutions need confirmation", async ({ page }) => {
    await page.goto(LESSON);
    const card = page.getByTestId("exercise-arrays-map-ex-3");
    await card.getByRole("button", { name: /Show hint/ }).click();
    await expect(card.getByText("Hint 1:")).toBeVisible();
    await expect(card.getByText("Hint 2:")).toHaveCount(0);
    await card.getByRole("button", { name: "Show solution" }).click();
    await page.getByRole("dialog", { name: "Reveal the solution?" }).getByRole("button", { name: "Show solution" }).click();
    await expect(card.getByText("Blank 1: map")).toBeVisible();
  });

  test("quiz scoring, review and retry incorrect", async ({ page }) => {
    await page.goto(LESSON);
    const quiz = page.getByTestId("quiz-runner");
    await quiz.getByRole("radio", { name: /\[2, 3, 4\]/ }).check(); // correct
    await quiz.getByRole("button", { name: "Next" }).click();
    await quiz.getByRole("radio", { name: /Every number in/ }).check(); // wrong
    await quiz.getByRole("button", { name: "Next" }).click();
    await quiz.getByRole("radio", { name: /braces are treated/ }).check(); // correct
    await quiz.getByRole("button", { name: "Next" }).click();
    await quiz.getByRole("radio", { name: "False" }).check(); // correct
    await quiz.getByTestId("submit-quiz").click();
    const results = page.getByTestId("quiz-results");
    await expect(results.getByTestId("quiz-score")).toContainText("3/4");
    await results.getByRole("button", { name: /Retry 1 incorrect/ }).click();
    await expect(page.getByText("Question 1 of 1")).toBeVisible();
  });

  test("submitting with unanswered questions asks for confirmation", async ({ page }) => {
    await page.goto(LESSON);
    const quiz = page.getByTestId("quiz-runner");
    await quiz.getByRole("button", { name: "Question 4" }).click();
    await quiz.getByTestId("submit-quiz").click();
    await expect(page.getByRole("dialog", { name: "Submit with unanswered questions?" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByTestId("quiz-results")).toHaveCount(0);
  });

  test("completion persists across reloads and drives the dashboard", async ({ page }) => {
    await page.goto(LESSON);
    await expect(page.getByTestId("lesson-status")).toContainText("In progress");
    await page.getByTestId("mark-complete").click();
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");
    await page.reload();
    await expect(page.getByTestId("lesson-status")).toContainText("Completed");
    await page.goto("/");
    await page.getByTestId("continue-learning").click();
    await expect(page).toHaveURL(/\/learn\/arrays\/map\?resume=1/);
  });
});

test.describe("search", () => {
  test("keyboard shortcut opens search, results are navigable", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByTestId("search-dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("combobox").fill("map");
    await expect(dialog.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/learn\//);
  });

  test("finds Cypress and Playwright APIs", async ({ page }) => {
    await page.goto("/search?q=cy.visit");
    await expect(page.getByRole("link", { name: /cy\.visit/i }).first()).toBeVisible();
    await page.goto("/search?q=getByRole");
    await expect(page.getByRole("link", { name: /getByRole/ }).first()).toBeVisible();
  });

  test("shows a clear no-results message", async ({ page }) => {
    await page.goto("/search?q=zzqxqzz");
    await expect(page.getByText(/No results for “zzqxqzz”/)).toBeVisible();
  });
});

test.describe("personal workspace", () => {
  test("bookmarks a lesson and lists it", async ({ page }) => {
    await page.goto(LESSON);
    await page.getByTestId("bookmark-toggle").click();
    await expect(page.getByTestId("bookmark-toggle")).toHaveAttribute("aria-pressed", "true");
    await page.goto("/bookmarks");
    await expect(page.getByRole("link", { name: "map" })).toBeVisible();
    await page.getByRole("button", { name: "Remove bookmark" }).click();
    await expect(page.getByText("No bookmarks yet")).toBeVisible();
  });

  test("creates, edits, previews and deletes a note", async ({ page }) => {
    await page.goto("/notes");
    await page.getByTestId("new-note").click();
    const editor = page.getByTestId("note-editor");
    await editor.getByPlaceholder("Note title").fill("Closures cheat sheet");
    await editor.getByLabel("Note content (Markdown)").fill("## Key idea\nA closure **remembers** its scope.\n\n```js\nconst f = () => 1;\n```");
    await expect(editor.getByTestId("note-save-status")).toHaveText("All changes saved");
    await page.reload();
    await expect(page.getByRole("button", { name: /Closures cheat sheet/ })).toBeVisible();
    await editor.getByRole("button", { name: "Preview" }).click();
    await expect(editor.getByTestId("note-preview").getByRole("heading", { name: "Key idea" })).toBeVisible();
    await expect(editor.getByTestId("note-preview").locator("strong")).toHaveText("remembers");
    await editor.getByRole("button", { name: "Delete note" }).click();
    await page.getByRole("dialog", { name: "Delete this note?" }).getByRole("button", { name: "Delete note" }).click();
    await expect(page.getByText("No notes yet")).toBeVisible();
  });

  test("note content cannot inject HTML", async ({ page }) => {
    await page.goto("/notes");
    await page.getByTestId("new-note").click();
    const editor = page.getByTestId("note-editor");
    await editor.getByLabel("Note content (Markdown)").fill('<img src=x onerror="window.__xss=1"> [bad](javascript:alert(1))');
    await editor.getByRole("button", { name: "Preview" }).click();
    await expect(editor.getByTestId("note-preview")).toContainText("<img src=x");
    await expect(editor.getByTestId("note-preview").locator("img")).toHaveCount(0);
    await expect(editor.getByTestId("note-preview").locator('a[href^="javascript"]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });

  test("theme preference persists", async ({ page }) => {
    await page.goto("/settings");
    await page.getByTestId("theme-select").selectOption("dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByTestId("theme-select").selectOption("light");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("recovers from corrupted stored data", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("jsacademy:state:v1", "{not json"));
    await page.reload();
    await expect(page.getByRole("alert").filter({ hasText: "repaired" })).toBeVisible();
    await expect(page.getByTestId("onboarding")).toBeVisible();
  });

  test("assessments respect progression rules", async ({ page }) => {
    await page.goto("/quizzes");
    await expect(page.getByTestId("mode-final").getByRole("button", { name: "Configure" })).toBeDisabled();
    await page.goto("/quizzes/run?kind=final&count=5&seed=x");
    await expect(page.getByRole("heading", { name: "This assessment is locked" })).toBeVisible();
  });

  test("unlocked mixed practice builds and scores a quiz", async ({ page }) => {
    await page.goto("/settings");
    await page.getByLabel(/Unlock all assessments/).check();
    await page.goto("/quizzes/run?kind=mixed&count=3&seed=abc");
    await expect(page.getByText("Question 1 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Question 3" }).click();
    await page.getByTestId("submit-quiz").click();
    await page.getByRole("button", { name: "Submit anyway" }).click();
    await expect(page.getByTestId("quiz-score")).toContainText("/3");
  });
});

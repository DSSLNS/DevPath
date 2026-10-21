import type { KbNote } from "@/content/types";

export const e2eDebuggingFailures: KbNote = {
  id: "e2e-debugging-failures",
  slug: "e2e-debugging-failures",
  category: "fundamentals",
  title: "Debugging E2E Test Failures",
  summary:
    "A systematic approach to a red test: read the error, reproduce it, inspect the evidence (command log, trace, screenshots, network), classify the cause, then fix the right thing.",
  tech: ["cypress", "playwright"],
  difficulty: "intermediate",
  tags: ["debugging", "trace viewer", "command log", "time travel", "root cause"],
  prerequisites: ["Running Cypress and Playwright tests", "Browser DevTools basics", "Reading stack traces"],
  explanation: [
    {
      kind: "paragraph",
      text: "An E2E failure says *something* went wrong somewhere between the browser and the database. Before touching the test, find out **which layer** failed and **why**. Jumping straight to \"add a wait\" or \"change the selector\" often hides a real bug.",
    },
    {
      kind: "diagram",
      title: "Failure triage flow",
      variant: "flow",
      steps: [
        { label: "Read the error", detail: "Which command/assertion failed, expected vs received, timeout?" },
        { label: "Look at evidence", detail: "Screenshot, video, trace, command log, network, console" },
        { label: "Reproduce", detail: "Run the single test locally, headed, same environment" },
        { label: "Classify", detail: "App bug, test bug, data problem, environment problem, flakiness" },
        { label: "Fix + guard", detail: "Fix root cause; add a lower-level test if it was an app bug" },
      ],
    },
    {
      kind: "table",
      caption: "Tools for each runner",
      headers: ["Need", "Cypress", "Playwright"],
      rows: [
        ["Watch it run", "`npx cypress open` (time-travel command log)", "`npx playwright test --ui` or `--headed`"],
        ["Pause and inspect", "`cy.pause()`, `cy.debug()`, DevTools in the runner", "`await page.pause()`, `--debug` (Inspector)"],
        ["Post-mortem on CI", "Screenshots on failure, optional video, Cypress Cloud replay", "Trace (`trace: 'on-first-retry'`), screenshots, video, HTML report"],
        ["Find the right selector", "Selector playground", "Pick locator in UI mode / codegen"],
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Classify before fixing",
      text: "**App bug** → file it, keep the test red or mark it as expected-to-fail with a ticket. **Test bug** → fix the selector/wait/assertion. **Data/env** → fix the setup, not the assertion.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Cypress: pause and log",
      code: `cy.get("[data-testid=checkout]").click();
cy.pause(); // stops in the runner; step through commands
cy.get("[data-testid=summary]").then(($el) => {
  console.log("summary html", $el.html()); // see it in DevTools console
});`,
    },
    {
      kind: "code",
      language: "bash",
      title: "Playwright: debug one test, open a CI trace",
      code: `npx playwright test tests/checkout.spec.ts -g "applies coupon" --debug
npx playwright show-trace test-results/checkout-applies-coupon/trace.zip`,
    },
  ],
  code: {
    title: "Adding debug context to a failing Playwright test",
    language: "ts",
    code: `import { test, expect } from "@playwright/test";

test("applies a valid coupon", async ({ page }, testInfo) => {
  // Surface browser errors in the test output
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("[browser error]", msg.text());
  });
  page.on("response", (res) => {
    if (res.status() >= 400) console.log("[http]", res.status(), res.url());
  });

  await test.step("open cart with one item", async () => {
    await page.goto("/cart?seed=one-item");
    await expect(page.getByTestId("line-item")).toHaveCount(1);
  });

  await test.step("apply coupon", async () => {
    await page.getByLabel("Coupon code").fill("SAVE10");
    await page.getByRole("button", { name: "Apply" }).click();
  });

  await test.step("verify discount", async () => {
    await expect(page.getByTestId("discount-row")).toContainText("-10%");
  });

  // Attach extra evidence to the HTML report
  await testInfo.attach("cart-state", {
    body: JSON.stringify(await page.evaluate(() => localStorage.getItem("cart"))),
    contentType: "application/json",
  });
});`,
  },
  walkthrough: [
    { line: 'page.on("console", (msg) => {', explanation: "Logs browser console errors into the test output, so a JavaScript crash in the app is visible next to the assertion failure." },
    { line: 'if (res.status() >= 400) console.log("[http]", res.status(), res.url());', explanation: "Failed API calls are often the real root cause behind a UI assertion timing out." },
    { line: 'await test.step("apply coupon", async () => {', explanation: "Steps group actions in the report and trace, so you immediately see which phase failed." },
    { line: 'await testInfo.attach("cart-state", {', explanation: "Attachments add custom evidence to the HTML report for post-mortem debugging on CI." },
  ],
  whenToUse: [
    "Every time a test fails, before changing any code.",
    "When a failure only happens in CI: rely on traces, screenshots and logs since you cannot watch the run.",
  ],
  mistakes: [
    "Re-running until green and moving on, leaving a real race condition or app bug undiagnosed.",
    "Changing assertions to match the new (wrong) behaviour without confirming the behaviour change was intended.",
    "Debugging only the UI layer when the network panel shows a 500 response from the API.",
    "Leaving `cy.pause()`, `page.pause()` or `test.only` in committed code (use `forbidOnly: !!process.env.CI` in Playwright).",
  ],
  debugging: [
    "In Cypress, click a command in the log to time-travel to the DOM snapshot at that moment; check the console for the yielded subject.",
    "In the Playwright trace viewer, check the *Network* and *Console* tabs, and the before/after DOM snapshots of the failing action.",
    "Reproduce with the same viewport, browser and environment as CI; many failures are responsive-layout or data differences.",
  ],
  relatedNotes: ["e2e-flaky-tests", "e2e-assertions"],
  relatedLessons: ["debugging-stack-traces", "dom-devtools", "debugging-network-inspection", "debugging-console-debugging"],
  practice:
    "Break a passing test on purpose by changing the expected text. Run it on CI-like settings (headless, trace on), then open the trace or Cypress screenshot and write down the three pieces of evidence that tell you exactly what went wrong.",
  docs: [
    { title: "Cypress: Debugging", url: "https://docs.cypress.io/app/guides/debugging" },
    { title: "Playwright: Debugging tests", url: "https://playwright.dev/docs/debug" },
    { title: "Playwright: Trace viewer", url: "https://playwright.dev/docs/trace-viewer" },
    { title: "Playwright: UI mode", url: "https://playwright.dev/docs/test-ui-mode" },
  ],
  versionNote: "Playwright UI mode requires 1.32+; examples written for Playwright 1.40+ and Cypress 13+.",
};

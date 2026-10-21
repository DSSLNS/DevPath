import { expect, test } from "@playwright/test";

test("mobile navigation uses bottom nav and drawer without overflow", async ({ page }) => {
  await page.goto("/learn/arrays/map");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("navigation", { name: "Quick navigation" })).toBeVisible();
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const drawer = page.getByRole("dialog", { name: "Navigation" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "E2E Testing Notes" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "E2E Testing Notes" })).toBeVisible();
  await expect(drawer).toBeHidden();
});

test("key pages have no horizontal overflow on mobile", async ({ page }) => {
  for (const url of ["/", "/learn", "/practice", "/quizzes", "/e2e", "/projects", "/notes", "/progress", "/settings", "/practice/playground"]) {
    await page.goto(url);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow on ${url}`).toBeLessThanOrEqual(1);
  }
});

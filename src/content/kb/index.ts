import { fundamentalsNotes } from "./fundamentals";
import { jsForTestingNotes } from "./js-for-testing";
import { cypressNotes } from "./cypress";
import { playwrightNotes } from "./playwright";
import { ecommerceNotes } from "./ecommerce";
import { bestPracticesNotes } from "./best-practices";
import type { KbCategory, KbNote } from "@/content/types";

export const kbNotes: KbNote[] = [
  ...fundamentalsNotes,
  ...jsForTestingNotes,
  ...cypressNotes,
  ...playwrightNotes,
  ...ecommerceNotes,
  ...bestPracticesNotes,
];

export const kbCategories: { id: KbCategory; title: string; description: string }[] = [
  { id: "fundamentals", title: "E2E Fundamentals", description: "What E2E testing is, test design, environments, data, isolation and flakiness." },
  { id: "js-for-testing", title: "JavaScript for Test Automation", description: "The JavaScript you actually use when writing automated tests." },
  { id: "cypress", title: "Cypress", description: "Cypress architecture, commands, assertions, intercepts, fixtures and CI." },
  { id: "playwright", title: "Playwright", description: "Playwright locators, auto-waiting, fixtures, network control, tracing and CI." },
  { id: "ecommerce", title: "E-commerce Test Examples", description: "Real-world scenarios: login, PLP/PDP, variants, search, cart, checkout and payments." },
  { id: "best-practices", title: "Reliable Automation Best Practices", description: "Selectors, waiting, isolation, evidence and mocking decisions that keep suites stable." },
];

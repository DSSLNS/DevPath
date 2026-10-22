# Implementation status

Last updated 2026-10-22. Key: ✅ complete · 🟡 partial · ⬜ not yet implemented.

## Application features

| Area | Status | Notes |
| --- | --- | --- |
| Responsive app shell | ✅ | Sidebar with curriculum tree, top bar, mobile drawer and bottom nav, skip link |
| Light/dark themes, persisted | ✅ | No flash on load; follows the system setting when set to "system" |
| Dashboard | ✅ | Onboarding state for new learners (no invented data); Continue Learning resumes the last section |
| Lesson pages | ✅ | Every section required by the brief, table of contents, previous/next navigation, explicit completion with summary |
| Sandboxed code runner | ✅ | Run, reset, copy, clear, example picker, live console, line numbers on errors, syntax pre-check, timeout, DOM preview |
| Exercise engine (10 types) | ✅ | Hints, explanations, retry, attempt tracking, solution only after confirmation, answers restored after reload |
| Quizzes and assessments | ✅ | Lesson, module, mixed, challenge, interview, final and revision; timer; review; retry incorrect; history; progression rules |
| Practice Lab | ✅ | Playground with example library; filters by topic, difficulty, time and status; auto-tested or self-reviewed challenges |
| E2E knowledge base | ✅ | Category, technology, difficulty and text filters; all 13 note sections; bookmarks |
| Projects | ✅ | Steps and checklist tracked, solution hidden until revealed, completion |
| Personal notes | ✅ | Markdown with preview, code blocks, tags, linked lessons, pin, bookmark, search, sort, autosave status, delete confirmation |
| Global search | ✅ | Ctrl/⌘ K or `/`, keyboard navigation, categories, difficulty filter, recent searches, suggestions, no-results guidance |
| Progress, mastery and revision | ✅ | Transparent rules, topic breakdown, optional achievements and streak, revision queue |
| Settings and data | ✅ | Theme, editor font, mastery threshold, time limit, path, unlock-all, export/import, reset with confirmation |
| Accessibility | 🟡 | Semantic landmarks, labels, focus styles, keyboard access, ARIA live regions and accessible dialogs are in place. No formal WCAG audit with assistive technology has been done yet. |
| Technology catalog | ✅ | 51 technologies in 7 categories (4 with lessons, 4 with reference notes only, 43 planned), with search, category, level and availability filters, and four sort orders. Planned technologies show their outline and are labelled as planned. |
| Course roadmaps and day pages | ✅ | Day-by-day plans with weekly reviews, end-of-day assessments built only from that day's lessons, coding tasks and a day summary |
| Full lesson format | ✅ | Best practices, quick revision and cheat sheet, end-of-lesson assessment and completion criteria. Required for new modules; legacy JS lessons still need these fields added. |
| HTML/CSS practice (`web` runtime) | ✅ | Sandboxed preview. Exercises are auto-tested in the app and verified in jsdom by the checker. |
| Accounts | Removed by design | DevPath has no login. Everything is open, and progress is saved in the browser (export, import and reset are in Settings). |
| Daily goal and active time | ✅ | Optional: set or dismiss it from the dashboard, and change or turn it off in Settings. Time counts only while you're active. |
| Dashboard and learning paths | ✅ | Dashboard built around 4 career paths (Frontend, Backend, Testing & Automation, Full Stack) with dedicated path pages. Paths are step sequences over shared courses with completed / up next / upcoming / coming soon status. Also the 3 JavaScript tracks. |
| Server-side code execution (Node.js, SQL, Cypress, Playwright) | ⬜ | Not built. These technologies are labelled "guided" and no code is claimed to run. A safe implementation needs an isolated execution service such as microVM sandboxes. |

## Content

Every published lesson passes the automated checker: full structure, verified outputs, and solutions that pass their tests.

| Module | Published / planned lessons |
| --- | --- |
| 1 Introduction to Programming | 4 / 10 |
| 2 Variables and Data Types | **0** / 12 ⬜ |
| 3 Operators and Expressions | 5 / 11 |
| 4 Conditional Statements and Loops | 5 / 9 |
| 5 Functions | 3 / 15 |
| 6 Arrays | 6 / 18 |
| 7 Objects | 1 / 13 |
| 8 Modern JavaScript (ES6+) | **0** / 13 ⬜ |
| 9 Advanced JavaScript | 3 / 20 |
| 10 DOM and Browser APIs | 3 / 18 |
| 11 Asynchronous JavaScript | 3 / 22 |
| 12 Errors, Debugging, and Code Quality | 4 / 17 |
| 13 Modules, npm, and Developer Tools | **0** / 12 ⬜ |
| 14 Browser Networking and APIs | 2 / 14 |
| 15 TypeScript Foundations | **0** / 13 ⬜ |
| 16 React Fundamentals | 4 / 22 |
| 17 HTML Foundations | 4 / 12 (Days 1–2 complete) |
| 18 CSS Foundations | 4 / 12 (Days 1–2 complete) |
| **Total** | **51 / 263** 🟡 |

### By technology

| Technology | Status | Published lessons |
| --- | --- | --- |
| HTML | 🟡 Days 1–2 complete | What HTML Is, Document Structure, Headings and Text, Links and Navigation |
| CSS | 🟡 Days 1–2 complete | What CSS Is, Selectors, Cascade and Specificity, Box Model |
| JavaScript | 🟡 39 lessons | See the modules above (m01–m14) |
| TypeScript | ⬜ planned | 0 / 13 |
| React | 🟡 4 lessons | Why React, Components, JSX, Props |
| Cypress, Playwright, Testing fundamentals, E2E testing | 📚 reference notes | 14 Cypress and 14 Playwright notes, plus 10 fundamentals notes shared by the last two. No day-by-day lessons yet. |
| The other 42 technologies | ⬜ planned | Outline only, clearly labelled as planned |

- **Exercises:** 476 lesson exercises, quiz questions and challenges. 300 of them are auto-gradable and feed assessments.
- **E2E knowledge base:** 38 notes in 3 of 6 categories (Fundamentals 10, Cypress 14, Playwright 14). These are still missing:
  - **Cypress:** aliases, fixtures, custom commands, hooks/`cy.session`, `cy.intercept`, network assertions, waiting, retries, screenshots and videos, environment config, CI, debugging.
  - **Playwright:** multiple browsers, trace viewer, screenshots, parallel execution, CI.
  - **Whole categories:** JavaScript for Test Automation, E-commerce examples, Best Practices. ⬜
- **Practice Lab:** 15 challenges (fundamentals, arrays, objects, 5 each). Async, DOM, API, debugging, React, Cypress and Playwright challenges are not written yet. ⬜ The engine supports all of them: DOM tests in the sandbox, and self-review for React and the test tools.
- **Projects:** 4 of 13 (Calculator, Number Guessing Game, To-Do List, Form Validation). The other 9 are listed as planned. ⬜
- **Glossary:** the dedicated glossary is empty. The Concepts page currently lists every term defined across lessons.

Unwritten lessons, notes and projects appear in the app as **planned**. They are never shown as clickable or as complete.

## Known limitations

- The DOM sandbox can briefly freeze tabs in browsers that run sandboxed iframes in-process (see SECURITY.md).
- Short-answer questions are checked for keywords only, and the UI says so.
- React, Cypress and Playwright challenges are self-reviewed and are labelled as such.
- Data is stored per browser. Use export/import in Settings to move it.

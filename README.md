# DevPath

An interactive platform for learning web development step by step, from your first HTML page to JavaScript, frameworks, backends and test automation.

It has these parts:

- **Learn** (`/courses`): "What would you like to learn today?" Technology cards in seven categories (web fundamentals, frontend, backend, databases, testing, tools, web platform) with search, filters and sorting. Each technology with lessons has a **day-by-day roadmap** of 30–60-minute days, weekly reviews, day assessments and day summaries.
- **Lessons**: explanation, syntax, examples, walkthrough, diagrams, real-world use, a sandboxed playground, best practices, common mistakes, debugging tips, quick revision and cheat sheet, practice exercises, an end-of-lesson assessment, and completion criteria.
- **Practice**: JavaScript runs in an isolated worker. DOM code runs and HTML/CSS pages render in a sandboxed preview. Exercises and challenges are checked by automated tests.
- **Learning paths**: Frontend Development, Backend Development, Testing & Automation and Full Stack Development, built as ordered steps over shared courses, plus the original JavaScript tracks.
- **Quizzes & Assessments**, the **E2E Testing Notes** knowledge base, **Projects**, notes, bookmarks, progress, mastery and revision.
- **No accounts**: everything is open immediately. Progress, assessment attempts, bookmarks, notes, the optional daily goal and the last visited lesson are saved in this browser's `localStorage`. They're tied to this browser on this device and aren't synced. Use Settings to export or import a backup, or to reset progress.

Content coverage per technology and known limitations are listed in [docs/STATUS.md](docs/STATUS.md). The expansion plan and audit are in [docs/DEVPATH_PLAN.md](docs/DEVPATH_PLAN.md).

## Requirements

- Node.js **22.13 or later** (Node 24 recommended). With nvm, run `nvm use 24`. Older versions such as Node 16 cannot run the test tools or the built-in SQLite driver.
- npm 10 or later.

No environment variables, database or external services are required.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server. Runs `gen:routes` first. |
| `npm run build` / `npm start` | Production build and server. |
| `npm run typecheck` | Run TypeScript in strict mode. |
| `npm run lint` | Run ESLint, including the React Hooks compiler rules. |
| `npm run format` / `format:check` | Run Prettier. |
| `npm test` | Run Vitest unit and integration tests, including full content verification. |
| `npm run test:e2e` | Run Playwright E2E tests against the production build. Run `npm run build` first. On a new machine, install the browser first with `npx playwright install chromium`. |
| `npm run content:check` | Validate and execute all content (see below). |
| `npm run content:lesson -- <file>` | Check one lesson file before registering it. |
| `npm run gen:routes` | Regenerate `src/generated/routes.json`, which the 404 proxy uses. |

## Project structure

```
src/
  app/                    Routes (Next.js App Router)
  components/             UI by feature: layout, lesson, exercises, quiz, editor, notes, ...
  content/                All learning content as typed TypeScript data
    types.ts              Content schema
    curriculum/           manifest.ts plus one folder per module, one file per lesson
    technologies/         Technology catalog, categories and the roadmap (day plan) builder
    kb/ practice/ projects/ glossary.ts paths.ts
    validate.ts verify.ts Structural validation and executable verification
  lib/
    sandbox/              Code execution: shared runtime, browser sandbox, Node runner for tests
    store/                Learner state: versioned schema, validation and migration, localStorage adapter, hooks
    courses.ts days.ts    Per-technology and per-day progress
    catalog/              Slim content index sent to the client
    exercises/grade.ts    Grading for every exercise type
    progress.ts quiz.ts   Mastery, weak topics, progression rules, quiz builder
    search/               Search index builder (server) and ranking (client)
  proxy.ts                Returns a real 404 for unknown content slugs
scripts/                  content-check.ts, check-lesson.ts, gen-routes.ts
tests/unit, tests/e2e     Vitest and Playwright suites
docs/                     Content guide, architecture, security, status
```

## Adding content

The full authoring guide is [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md). To add a lesson:

1. Add `[slug, title]` to the module in `src/content/curriculum/manifest.ts`.
2. Create `src/content/curriculum/mNN-<module>/<slug>.ts`, which exports a `Lesson`. Use `m06-arrays/map.ts` as the reference.
3. Import it in the module's `index.ts`, in manifest order.
4. Run `npm run content:check -- --module mNN`.

The checker enforces the lesson structure, including 2 beginner exercises, 1 intermediate exercise, 1 debugging exercise, 3 MCQs and a challenge. It also checks that every ID is unique and every reference resolves. It **runs the code** too: documented outputs must match the sandbox, reference solutions must pass their tests, and starter or buggy code must fail them. Lessons listed in the manifest but not written yet appear in the app as *planned*. Use `--strict` to fail on those.

## Deployment

This is a standard Next.js 16 app with Cache Components. Course, path, lesson, note, challenge and project pages are prerendered. There are no server secrets, database or environment variables.

- **Vercel:** import the repository or run `vercel deploy`. No configuration is needed.
- **Self-hosted:** run `npm run build && npm start` on Node 22.13+.

## Testing

- **Unit and integration (Vitest):**
  - grading and quiz building
  - store persistence, recovery and saved-setting migration
  - active-time tracking and goal settings
  - the HTML/CSS web runtime
  - roadmap integrity, and the career paths' steps, shared courses and progress rules
  - search, mastery rules, markdown sanitisation, sandbox behaviour, and full content verification
- **E2E (Playwright, desktop and mobile):**
  - the dashboard opens with no login, and auth routes don't exist
  - local progress persists and resets with confirmation; the optional goal can be set or skipped
  - the four path cards, path pages, step status and course links, and hero search
  - the course catalog, day pages and the HTML preview
  - plus the original suite: lessons, the sandbox, exercises, quizzes, search, notes, bookmarks, themes and mobile layout

```bash
npm test
npm run build && npm run test:e2e   # first time: npx playwright install chromium
```

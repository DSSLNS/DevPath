# DevPath

An interactive platform for learning web development step by step, from your first HTML page to JavaScript, frameworks, backends and test automation.

It has these parts:

- **Learn** (`/courses`): "What would you like to learn today?" Technology cards in seven categories (web fundamentals, frontend, backend, databases, testing, tools, web platform) with search, filters and sorting. Each technology with lessons has a **day-by-day roadmap** of 30–60-minute days, weekly reviews, day assessments and day summaries.
- **Lessons**: explanation, syntax, examples, walkthrough, diagrams, real-world use, a sandboxed playground, best practices, common mistakes, debugging tips, quick revision and cheat sheet, practice exercises, an end-of-lesson assessment, and completion criteria.
- **Practice**: JavaScript runs in an isolated worker. DOM code runs and HTML/CSS pages render in a sandboxed preview. Exercises and challenges are checked by automated tests.
- **Learning paths**: Frontend, Backend, Full-Stack and Test Automation career paths, plus the original JavaScript tracks.
- **Quizzes & Assessments**, the **E2E Testing Notes** knowledge base, **Projects**, notes, bookmarks, progress, mastery and revision.
- **Accounts (optional)**: sign up, log in, log out and reset your password. Progress syncs to the server and follows you across devices. An optional daily goal tracks active learning time. Guests can use everything, with progress saved in the browser, and can add it to an account later.

Content coverage per technology and known limitations are listed in [docs/STATUS.md](docs/STATUS.md). The expansion plan and audit are in [docs/DEVPATH_PLAN.md](docs/DEVPATH_PLAN.md).

## Requirements

- Node.js **22.13 or later** (Node 24 recommended). With nvm, run `nvm use 24`. Older versions such as Node 16 cannot run the test tools or the built-in SQLite driver.
- npm 10 or later.

Guest mode needs no configuration. Accounts need a database:

- **Local development:** a SQLite file created automatically at `.data/devpath.db`, using Node's built-in `node:sqlite`.
- **Production:** PostgreSQL via `DATABASE_URL`.

Copy `.env.example` to `.env.local` and read the comments.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate           # creates the account and progress tables
npm run dev                  # http://localhost:3000
```

In development, password-reset emails are printed in the terminal running `npm run dev`. Set `RESEND_API_KEY` and `EMAIL_FROM` to send real email.

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
| `npm run db:migrate` | Create or update the database tables (SQLite locally, Postgres when `DATABASE_URL` is set). |
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
    store/                Learner state: schema, validation, local and server adapters, merge, hooks
    server/               Auth (Better Auth), database, email, progress persistence rules
    courses.ts days.ts    Per-technology and per-day progress
    catalog/              Slim content index sent to the client
    exercises/grade.ts    Grading for every exercise type
    progress.ts quiz.ts   Mastery, weak topics, progression rules, quiz builder
    search/               Search index builder (server) and ranking (client)
  proxy.ts                Returns a real 404 for unknown content slugs
scripts/                  content-check.ts, check-lesson.ts, db-migrate.ts, gen-routes.ts
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

This is a standard Next.js 16 app with Cache Components. Course, lesson, note, challenge and project pages are prerendered. The account page and APIs are dynamic.

1. Provision PostgreSQL and set `DATABASE_URL`, `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`. Set `RESEND_API_KEY` and `EMAIL_FROM` for password-reset email.
2. Run `npm run db:migrate` against the production database.
3. Run `npm run build && npm start` on Node 22.13+, or deploy to any Node host such as Vercel.

The local SQLite fallback is for development and single-server setups only.

## Testing

- **Unit and integration (Vitest, 77 tests):**
  - grading and quiz building
  - store persistence and state merging (conflicts and guest import)
  - progress API rules: revisions, conflicts, per-user isolation, validation and size limits
  - active-time tracking, goal settings and auth form validation, including open-redirect protection
  - the HTML/CSS web runtime
  - roadmap integrity: every lesson is scheduled exactly once and days fit the time budget
  - search, mastery rules, markdown sanitisation, sandbox behaviour, and full content verification
- **E2E (Playwright, 38 tests, desktop and mobile):**
  - everything from the original suite
  - the technology catalog's search and filters, course roadmaps and day pages, and the HTML preview
  - sign-up and login validation, the optional goal popup
  - progress persisting across logout and login, guest-progress import, the full password-reset flow
  - two devices saving at once
  - API and account-page access control, and per-user data isolation

  The E2E server uses a throwaway SQLite database (`.data/e2e.db`) and writes emails to `.data/e2e-mail.log`.

```bash
npm test
npm run build && npm run test:e2e   # first time: npx playwright install chromium
```

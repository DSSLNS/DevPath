# JS Academy

An interactive platform for learning JavaScript, from first principles to professional practice, with an E2E testing knowledge base for Cypress and Playwright.

It has these parts:

- **Learn JavaScript**: a 16-module curriculum. Each lesson includes explanations, diagrams, a sandboxed code playground, practice exercises, a quiz and an explicit completion step.
- **Practice Lab**: challenges that are either auto-tested in the sandbox or reviewed by the learner against a checklist, plus a standalone playground.
- **Quizzes & Assessments**: lesson quizzes, module assessments, mixed practice, challenge mode, mock interviews, a final assessment and revision quizzes.
- **E2E Testing Notes**: a knowledge base for Cypress and Playwright.
- **Projects**: guided projects with steps, starter code, reference solutions and testing checklists.
- **Personal workspace**: Markdown notes with autosave, bookmarks, progress tracking, mastery and revision mode.
- **Global search** (Ctrl/⌘ K or `/`) across lessons, concepts, code examples, exercises, E2E notes and your own notes.

Current content coverage and known limitations are listed in [docs/STATUS.md](docs/STATUS.md).

## Requirements

- Node.js **20.9 or later** (developed on Node 22). On a machine with nvm, run `nvm use 22`.
- npm 10 or later.

No environment variables, database or external services are required. All learner data is stored in the browser's `localStorage`.

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
| `npm run gen:routes` | Regenerate `src/generated/routes.json`, which the 404 proxy uses. |

## Project structure

```
src/
  app/                    Routes (Next.js App Router)
  components/             UI by feature: layout, lesson, exercises, quiz, editor, notes, ...
  content/                All learning content as typed TypeScript data
    types.ts              Content schema
    curriculum/           manifest.ts plus one folder per module, one file per lesson
    kb/ practice/ projects/ glossary.ts paths.ts
    validate.ts verify.ts Structural validation and executable verification
  lib/
    sandbox/              Code execution: shared runtime, browser sandbox, Node runner for tests
    store/                Learner state: schema, validation, persistence adapter, hooks
    catalog/              Slim content index sent to the client
    exercises/grade.ts    Grading for every exercise type
    progress.ts quiz.ts   Mastery, weak topics, progression rules, quiz builder
    search/               Search index builder (server) and ranking (client)
  proxy.ts                Returns a real 404 for unknown content slugs
scripts/                  content-check.ts, gen-routes.ts
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

This is a standard Next.js 16 app with Cache Components. Lesson, note, challenge and project pages are prerendered at build time.

- **Vercel**: import the repository. No configuration is needed.
- **Self-hosted**: run `npm run build && npm start` behind a reverse proxy on Node 20.9 or later.

There are no server secrets. If you later add accounts, see the persistence notes in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Testing

- **Unit and integration (Vitest, 55 tests)**: grading, store persistence and recovery, search ranking, mastery and progression rules, the quiz builder, markdown sanitisation, sandbox formatting and timeouts, and full content verification.
- **E2E (Playwright, 28 tests, desktop and mobile)**: navigation, lesson rendering, code execution and sandbox boundaries (network, storage, parent access, infinite loops), exercises, hints and solutions, quiz scoring and retries, completion persistence and Continue Learning, search including the no-results case, bookmarks, notes CRUD and XSS safety, theme persistence, corrupted-storage recovery, progression locks, 404s, and mobile layout overflow.

# DevPath expansion plan

This plan covers how the JavaScript-only app (formerly "JS Academy") grows into DevPath, a multi-technology web development learning platform. It starts with an audit of the existing app, then sets out the extension design and the phased delivery.

## 1. Audit (Phase 1)

### What exists and works

| Area | Implementation | Reuse |
| --- | --- | --- |
| Framework | Next.js 16 App Router with Cache Components, React 19, TypeScript, Tailwind v4 | Kept as is |
| Content model | Typed TS data in `src/content` (`Lesson`, `Module`, `Exercise`, `KbNote`, `Challenge`, `Project`) | Extended, not replaced |
| Lesson page | `/learn/[module]/[lesson]`: intro, objectives, prerequisites, terms, sections, playground, mistakes, debugging, practice, quiz, summary, completion | Reused for every technology |
| Exercise engine | 10 exercise types graded by pure functions (`lib/exercises/grade.ts`) | Reused; adds a `web` runtime for HTML/CSS |
| Sandbox | Opaque-origin iframe and worker, CSP `default-src 'none'`, time limit (`lib/sandbox`) | Reused; adds a full-document `web` runtime |
| Content verification | `npm run content:check` executes every documented output, solution and starter | Reused; also verifies HTML/CSS exercises in jsdom |
| Quizzes | Seeded quiz builder, history, retry, progression rules | Reused for day assessments |
| Progress | `LearnerStore` + `StorageAdapter`, versioned and validated `PersistedState`, stored in localStorage | Extended with a server adapter, goals and active time |
| Design system | Semantic CSS tokens with light and dark themes, accessible primitives (`components/ui`) | Kept |
| Tests | Vitest (55 unit tests) and Playwright (desktop and mobile E2E) | Extended |

### Gaps against the brief

1. Only JavaScript has a curriculum (43 of 239 planned lessons are written). TypeScript and React live inside the JS curriculum.
2. There's no technology catalog, no course pages and no day-by-day roadmap.
3. There are no accounts and no server database. Progress is per browser only.
4. There's no daily goal or active-time tracking.
5. HTML and CSS can't be practised: the sandbox runs JavaScript only, or DOM scripts against fixed markup.

### Issues found

- Default `node` on the dev machine is v16. Vitest 5 and Next 16 need Node 20.9+ (Node 22.13+ for `node:sqlite`), so `engines` is now `>=22.13`.
- The `/learn` overview assumes a single curriculum. It now shows only JavaScript-track modules; other technologies have course pages.

## 2. Extension design

### Technologies, courses and roadmaps

- `src/content/technologies/` registers **categories** (A–G from the brief) and **technologies**. A technology optionally owns a **course**: an ordered list of module ids plus a **roadmap** of weeks and days. Each day lists the lesson ids it covers.
- Lessons stay in modules, so every existing engine (lesson page, grader, quizzes, search, progress) works for new technologies unchanged. New modules (`m17` HTML, `m18` CSS, …) are added to the manifest like the JS ones.
- A day's status is derived from content: **available** (all lessons written), **partial** or **planned**. Planned items are visible but never clickable or counted as complete.
- Estimated duration comes from the roadmap: the published lesson minutes plus a labelled estimate for planned lessons. Nothing is invented for courses without a roadmap, which show "Curriculum planned".
- The validator checks that every roadmap lesson exists in the manifest and every manifest lesson of a course is scheduled exactly once.

### Lesson engine additions

- Optional `bestPractices`, `cheatSheet` and `completionCriteria` fields, rendered in the lesson page.
- A `web` runtime: the learner edits a whole HTML document (with `<style>` and optional `<script>`). It renders in the same opaque-origin, no-network sandbox, and tests run against the rendered document. The content checker verifies solutions and starters in jsdom.
- Day pages (`/courses/[tech]/day/[n]`) bring together the objectives, the day's lessons, an end-of-day assessment built from the day's quiz questions, and a day summary.

### Accounts (removed)

An earlier increment added accounts with Better Auth and a Postgres-backed progress API. They were removed at the product owner's request. DevPath has no login, and all progress stays in browser storage.

### Goals and time

- An optional "What is your learning goal?" dialog opens from the dashboard's Today card or from Settings. It is never required and can be skipped or disabled.
- Active time is counted only while a lesson or practice page is visible and the learner has interacted in the last 60 seconds. It is stored per day and per lesson.

## 3. Phases and status

| Phase | Scope | Status |
| --- | --- | --- |
| 1 Audit | This document | ✅ |
| 2 Catalog | Categories, technology cards with search, filter and sort, course pages, roadmaps | ✅ |
| 3 Lesson engine | Full lesson format, `web` runtime, day pages, day assessments and summaries | ✅ engine; 🟡 content (8 new lessons, HTML and CSS Days 1–2) |
| 4 Auth | Built, then removed by request: DevPath has no login | — |
| 5 Progress | Local progress, active time, optional goal, dashboard overview | ✅ |
| 6 Assessment engine | Existing engine (10 question types) plus day and week assessments | ✅ |
| 7 Practice | `web` runtime for HTML/CSS. Node.js, SQL and test-tool execution need an isolated server-side sandbox and aren't built; those courses are labelled "guided". | 🟡 |
| 8 Paths and projects | Four career paths with path pages. The project library still has only the original 4 JS projects. | 🟡 |
| 9 QA | 78 unit and 38 E2E tests, lint and typecheck clean. No formal accessibility audit with assistive technology yet. | 🟡 |

## Next steps (recommended order)

1. Finish HTML (Days 3–6) and CSS (Days 3–8) with parallel lesson writers, using `npm run content:lesson` as the gate.
2. Add the full-format fields (best practices, cheat sheet, completion criteria) to the 39 existing JavaScript lessons, then write the 12 lessons of the empty Variables module (m02), which blocks Week 1 of the JavaScript roadmap.
3. Write TypeScript (m15) with an in-browser TypeScript compile step for practice.
4. Add projects with milestones and acceptance criteria per technology (portfolio page, landing page, etc.).
5. For Node.js, Express and SQL practice, choose an isolated execution service such as microVM sandboxes before writing those courses' interactive exercises.

See [STATUS.md](STATUS.md) for content coverage per technology.

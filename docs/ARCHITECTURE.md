# Architecture

## Rendering

- **Next.js 16 App Router with Cache Components.** Content pages (lessons, KB notes, challenges, projects, modules) are server components prerendered with `generateStaticParams`. Interactive parts are client islands: the code runner, exercises, quizzes, completion and bookmarks.
- **Client components never import `@/content`.** That would ship every lesson to the browser. Instead:
  - The root layout passes a slim **catalog** (`src/lib/catalog`) with IDs, titles, slugs, exercise IDs and question metadata. Dashboards, progress, the sidebar and filters run against it.
  - Full question bodies are served from `/question-bank.json` and fetched lazily on assessment pages.
  - The search index is served from `/search-index.json` and fetched lazily when search opens. Both JSON routes are prerendered at build time.
- `src/proxy.ts` gives real 404s for unknown content slugs. Streaming dynamic segments would otherwise return a 200 with the not-found UI. `dynamicParams` isn't available with Cache Components.

## Technologies, courses and roadmaps

- `src/content/technologies/index.ts` registers categories and technologies. A technology's course is a list of curriculum modules (`moduleIds`). Lessons stay in modules, so the lesson page, grader, quizzes, search and progress work for every technology unchanged.
- `technologies/roadmap.ts` builds the day-by-day roadmap. Days use explicit `dayPlan` groups when given; otherwise lessons are grouped within a 60-minute budget, with planned lessons estimated at 25 minutes and flagged as estimates. A review day follows every six learning days. A unit test checks that every manifest lesson of a course is scheduled exactly once.
- Routes: `/courses` (catalog), `/courses/[tech]` (roadmap), `/courses/[tech]/day/[n]` (day plan, end-of-day assessment, coding tasks, day summary). Days with no written lessons have no page and return 404.
- Day assessments reuse `QuizRunner` with `kind: "day"` and `quizId: day:<tech>:<n>`. Questions come only from that day's lessons (`assessmentQuestions`).
- The global catalog sent to the client includes slim technology entries (counts and lesson ids). Roadmaps are rendered on the server and never shipped as a whole.

## State and persistence

- `src/lib/store/store.ts` holds an immutable `LearnerStore` exposed through `useSyncExternalStore`. Server rendering and hydration use the empty default state. The real state loads on mount, and components that restore saved input remount once at that point (keyed by `hydrated`), so there are no hydration mismatches.
- Persistence goes through a `StorageAdapter`:
  - **Guests:** `localStorageAdapter`, with cross-tab sync through the `storage` event.
  - **Signed-in learners:** `serverAdapter` (`lib/store/server-adapter.ts`).
    - It loads from `GET /api/progress` and saves with debounced `PUT /api/progress` carrying the last known `revision`.
    - A 409 means another device saved first. The client merges the server copy with its own (`lib/store/merge.ts`) and saves again.
    - Network failures keep the latest snapshot in memory and retry with backoff and on `online`.
    - Nothing is written to localStorage, and logout does a full reload.
- `components/layout/providers.tsx` bootstraps on mount: `GET /api/auth/get-session`, then either the server or the guest adapter. After sign-in, guest progress found in the browser is offered for import. It is merged only on confirmation, and then the guest copy is removed.
- The schema is versioned (`version: 1`). `parseState` validates every field on the client and again on the server before anything is stored.

## Accounts and server data

| Concern | Module | Notes |
| --- | --- | --- |
| Auth | `lib/server/auth.ts`, `app/api/auth/[...all]` | Better Auth with email and password: scrypt hashing, httpOnly session cookies, reset tokens that expire after 1 hour, sessions revoked on reset, and built-in rate limiting in production. |
| Database | `lib/server/db.ts` | Postgres when `DATABASE_URL` is set, otherwise `node:sqlite`. Tables come from Better Auth's schema plus a `learnerState` model (`userId` unique, `state` JSON text, `revision`). Run `npm run db:migrate`; local SQLite also migrates automatically in development. |
| Progress API | `app/api/progress/route.ts`, `lib/server/progress.ts` | The user id always comes from the session. Writes are validated, size-limited (1 MB), checked for a same-origin `Origin` header, and applied with compare-and-set on `revision`. |
| Protected page | `app/account/page.tsx` | The session is read inside `<Suspense>` (required by Cache Components). The page redirects to `/login?next=/account` without a session. |
| Email | `lib/server/email.ts` | Resend over HTTPS when configured, otherwise logged to the console in development. |

**Data model choice.** Progress is stored as one validated document per user, not as normalised rows. The learner state is already a versioned, validated document used by every feature, and storing it whole gives atomic cross-device saves with a single revision check. Course content is never stored per user. If reporting across users is needed later, normalised tables can be derived from these documents without changing the client.

**Goals and time.** `settings.dailyGoalMinutes` (0 means no goal) and `settings.goalPromptSeen` sync with the account. `lib/activity-time.ts` counts time only while the page is visible and the learner has interacted in the last 60 seconds. Time is stored per day (`timeLog`) and per lesson (`activeSeconds`). Merges take the maximum, never the sum, so time is never inflated.

## Engines

| Concern | Module | Notes |
| --- | --- | --- |
| Code execution | `lib/sandbox/*` | One runtime source string is shared by the browser sandbox and the Node/jsdom runner, so documented outputs are verified against exactly what learners see. |
| Grading | `lib/exercises/grade.ts` | Pure functions for all 10 exercise types. Code types are graded from test results. |
| HTML/CSS runtime | `lib/sandbox/browser.ts` (`runtime: "web"`), `web-document.ts` | The learner's page is the document. CSP and the test runtime are injected into `<head>`, and tests run after `DOMContentLoaded`. The checker verifies the same tests in jsdom. |
| Quizzes | `lib/quiz.ts`, `components/quiz/*` | Deterministic, seeded question selection. Configuration is encoded in the URL. Progression rules are enforced on the hub and again on the run page. |
| Progress | `lib/progress.ts` | Mastery, weak topics, staleness, streaks, achievements and unlock rules. The rules are shown in the UI. |
| Search | `lib/search/*` | Token and phrase scoring with category boosts. Personal notes are merged in on the client. |

## Design system

Semantic colour tokens are defined as CSS variables in `src/app/globals.css` (`--bg`, `--surface`, `--text`, `--primary`, `--success`, and so on), with complete light and dark sets. They're exposed to Tailwind through `@theme inline`. Components use only the semantic classes (`bg-surface`, `text-muted`, `border-border`, …). The theme is applied before first paint by an inline script, persisted in learner settings, and follows the system setting when set to "system". Motion respects `prefers-reduced-motion`.

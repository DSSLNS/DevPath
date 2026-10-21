# Architecture

## Rendering

- **Next.js 16 App Router with Cache Components.** Content pages (lessons, KB notes, challenges, projects, modules) are server components prerendered with `generateStaticParams`. Interactive parts are client islands: the code runner, exercises, quizzes, completion and bookmarks.
- **Client components never import `@/content`.** That would ship every lesson to the browser. Instead:
  - The root layout passes a slim **catalog** (`src/lib/catalog`) with IDs, titles, slugs, exercise IDs and question metadata. Dashboards, progress, the sidebar and filters run against it.
  - Full question bodies are served from `/question-bank.json` and fetched lazily on assessment pages.
  - The search index is served from `/search-index.json` and fetched lazily when search opens. Both JSON routes are prerendered at build time.
- `src/proxy.ts` gives real 404s for unknown content slugs. Streaming dynamic segments would otherwise return a 200 with the not-found UI. `dynamicParams` isn't available with Cache Components.

## State and persistence

- `src/lib/store/store.ts` holds an immutable `LearnerStore` exposed through `useSyncExternalStore`. Server rendering and hydration use the empty default state. The real state loads on mount, and components that restore saved input remount once at that point (keyed by `hydrated`), so there are no hydration mismatches.
- Persistence goes through a `StorageAdapter` interface. The MVP uses `localStorageAdapter`, with cross-tab sync through the `storage` event. To add accounts:
  1. Implement an adapter backed by an API, for example Postgres via Supabase, where `load` and `save` serialise `PersistedState`.
  2. Hydrate the store with it after sign-in.
  3. Optionally migrate the local state on first login.

  The schema is versioned (`version: 1`). `parseState` validates every field and is where migrations should go.

## Engines

| Concern | Module | Notes |
| --- | --- | --- |
| Code execution | `lib/sandbox/*` | One runtime source string is shared by the browser sandbox and the Node/jsdom runner, so documented outputs are verified against exactly what learners see. |
| Grading | `lib/exercises/grade.ts` | Pure functions for all 10 exercise types. Code types are graded from test results. |
| Quizzes | `lib/quiz.ts`, `components/quiz/*` | Deterministic, seeded question selection. Configuration is encoded in the URL. Progression rules are enforced on the hub and again on the run page. |
| Progress | `lib/progress.ts` | Mastery, weak topics, staleness, streaks, achievements and unlock rules. The rules are shown in the UI. |
| Search | `lib/search/*` | Token and phrase scoring with category boosts. Personal notes are merged in on the client. |

## Design system

Semantic colour tokens are defined as CSS variables in `src/app/globals.css` (`--bg`, `--surface`, `--text`, `--primary`, `--success`, and so on), with complete light and dark sets. They're exposed to Tailwind through `@theme inline`. Components use only the semantic classes (`bg-surface`, `text-muted`, `border-border`, …). The theme is applied before first paint by an inline script, persisted in learner settings, and follows the system setting when set to "system". Motion respects `prefers-reduced-motion`.

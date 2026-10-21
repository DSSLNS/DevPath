# JS Academy content guide

All learning content is typed TypeScript data in `src/content/`. Types live in
[`src/content/types.ts`](../src/content/types.ts); read it first. Nothing is
rendered as raw HTML; text fields support a small inline-markdown subset:
`` `code` ``, `**bold**`, `*italic*`, `[text](https://url)` (https or internal `/path` links only).

## Where content lives

| Content | Location | Registry |
| --- | --- | --- |
| Curriculum manifest (ids, slugs, order) | `src/content/curriculum/manifest.ts` | — |
| Lessons | `src/content/curriculum/mNN-<module-slug>/<lesson-slug>.ts` | that folder's `index.ts` |
| Knowledge-base notes | `src/content/kb/<category>/*.ts` | `src/content/kb/<category>/index.ts` |
| Practice challenges | `src/content/practice/<topic>.ts` | `src/content/practice/index.ts` |
| Projects | `src/content/projects/<slug>.ts` | `src/content/projects/index.ts` |
| Glossary | `src/content/glossary.ts` | — |

The reference lesson is
[`src/content/curriculum/m06-arrays/map.ts`](../src/content/curriculum/m06-arrays/map.ts).
Match its depth, tone and structure.

## Adding a lesson

1. Add `[slug, title]` to the module in `manifest.ts`. The lesson id is `${moduleSlug}-${lessonSlug}`, e.g. `arrays-map`.
2. Create `src/content/curriculum/mNN-<module>/<lesson-slug>.ts` exporting a `Lesson`. Use a camelCase export name derived from the slug, e.g. `export const sliceVsSplice: Lesson = {...}`.
3. Import it in the module `index.ts` and add it to `lessons` in manifest order.
4. Run `npm run content:check -- --module mNN` and fix every issue.

### Lesson requirements (enforced by the checker)

- `objectives` ≥ 2, `intro` non-empty, `terms` for new vocabulary.
- `sections` ≥ 3, in this order where relevant: `explanation`, `syntax`, `examples` (code blocks with `output`), `walkthrough`, `real-world`. Section ids are kebab-case.
- `commonMistakes` ≥ 2 (prefer `wrong`/`right` code pairs), `debugging` tips ≥ 1.
- `examples` ≥ 1 interactive playground example. Ids must be globally unique: `<lessonId>-example-<name>`.
- `exercises` (practice) need at least **2 beginner, 1 intermediate (or advanced), 1 debugging** exercise.
  A debugging exercise is `type: "find-bug"` or has `debugging: true`. Debugging exercises don't count toward beginner or intermediate.
- `quiz` needs at least **3 `mcq`** questions. Explain every option where useful.
- `challenge`: one short practical challenge, usually `type: "code"` with tests.
- `summary` ≥ 3 points, `references` ≥ 1 official https doc (MDN, react.dev, typescriptlang.org, nodejs.org, docs.cypress.io, playwright.dev, …).
- `prerequisites` / `related` must be valid lesson ids from the manifest.
- Exercise ids are globally unique: `<lessonId>-ex-<n>`, `<lessonId>-q<n>`, `<lessonId>-challenge`.

Use a mix of exercise types across a module: `code`, `find-bug`, `predict-output`,
`fill-blank`, `mcq`, `multi-select`, `true-false`, `match`, `order` and `short-answer`.

## Code execution rules (the checker runs your code)

The in-app sandbox (and the checker) run JavaScript in an isolated worker with **no DOM, no network, no storage**.
`fetch`, `localStorage`, `document` and `window` are **not available** in the `js` runtime.

- **`code` blocks with `output`**: the code is executed and its console output must match exactly.
  Only add `output` to plain runnable JavaScript (`language: "js"` or omitted). For TS, JSX, HTML, bash,
  Cypress or Playwright code, set the correct `language` and **do not** add `output`. Show the expected result in a comment or in prose instead.
- **Output format** follows Node's `util.inspect`, always on a single line:
  - top-level strings print raw: `console.log("hi")` → `hi`
  - nested strings use single quotes: `['a', 'b']` → `[ 'a', 'b' ]`; a string containing `'` uses double quotes
  - arrays `[ 1, 2, 3 ]`, empty `[]`; objects `{ a: 1, b: 'x' }`, empty `{}`; non-identifier keys are quoted: `{ 'first-name': 'Ada' }`
  - nesting deeper than 2 levels prints `[Object]` / `[Array]`
  - `Map(2) { 'a' => 1, 'b' => 2 }`, `Set(2) { 1, 2 }`, `[Function: name]`, `[Function (anonymous)]`, `[class User]`, class instances `User { name: 'Ada' }`
  - errors print `TypeError: message` (no stack). Dates print ISO strings. `-0` prints `-0`. BigInt prints `10n`.
  - `console.log` of a **Promise** prints `Promise {}`, so don't put that in verified output.
  - an uncaught error appears as a final line `Uncaught TypeError: message`
  - `console.error` and `console.warn` output is included in the comparison just like `console.log`
- Avoid nondeterminism in verified outputs: no `Math.random()`, `Date.now()` or timing values.
- Timers and promises work and run in real event-loop order. A run waits for pending timers, so keep delays ≤ 1000 ms.
- **`code` / `find-bug` exercises**: the reference `solution` must pass all tests, and the `starter` (or buggy `code`)
  must **fail** at least one test. Tests use the global `assert`:
  `assert.equal`, `assert.deepEqual`, `assert.ok`, `assert.notEqual`, `assert.throws(fn)`, `await assert.rejects(promiseOrFn)`.
  Tests run in the same scope as the learner code, so they can call the learner's functions and read `__logs`
  (an array of strings the learner printed). Write several tests, including edge cases.
- For async/API exercises, have the learner write functions that accept a `fetchFn` parameter, or let the tests
  define a fake: `const fakeFetch = async (url) => ({ ok: true, status: 200, json: async () => ({ id: 1 }) });`.
- **`predict-output`**: `answer` must exactly equal the sandbox output (verified).
- **DOM lessons**: for DOM code, set `runtime: "dom"` on blocks and examples and provide `html` on examples.
  DOM examples run in a sandboxed iframe with a visible preview. Blocks with `runtime: "dom"` aren't output-verified.
  DOM-based `code` exercises are NOT supported in lessons; use pure-function exercises such as "given this data,
  return the HTML string / class list", or use mcq, predict-output (non-DOM code), match and order exercises.
- `fill-blank` templates use `___` (three underscores) for each blank; `blanks[i].answers` lists accepted answers
  (compared ignoring whitespace).

## Quality bar

- Write for a beginner first, but be precise enough for a professional reviewer.
- Introduce every new technical term in `terms`, and keep examples small before you make them complex.
- Use realistic scenarios: products, carts, addresses, API errors, form input, search autocomplete and test automation.
- Use modern syntax (`const`/`let`, arrow functions, `async`/`await`). When showing a legacy pattern, explain the history and the modern alternative.
- Clearly mark optional or advanced lessons with `optional: true`.
- Never include real secrets, tokens or real payment card numbers. Use obvious placeholders such as `process.env.API_KEY` or `"test_token_123"`.
- Strings are TypeScript strings. Escape backticks and `${` inside template-literal content, or prefer normal
  double-quoted strings with `\n`.

## Knowledge-base notes (`KbNote`)

Each note needs: summary, prerequisites, explanation blocks, syntax blocks, one complete working `code` sample,
a `walkthrough` (≥ 3 entries, `line` = the code snippet being explained), `whenToUse`, `mistakes` (≥ 2), `debugging`,
`relatedNotes` (KB ids), `relatedLessons` (lesson ids), a `practice` task, and `docs` (official links).
Label technologies with `tech` (e.g. `["cypress", "javascript"]`). Add `versionNote` when an API is version-specific.
Payment examples must use the provider's documented **test** card numbers and test environments only.

## Practice challenges (`Challenge`)

`validation: "js"` challenges need `tests`. The `solution` must pass and the `starter` must fail.
`validation: "dom"` challenges need `html` and `tests`; they run in jsdom in the checker and in a sandboxed iframe in the app.
`validation: "manual"` challenges (React, Cypress, Playwright) cannot run in the browser and need a `checklist` of ≥ 3 review items.
The app labels them as self-reviewed and never claims they were validated automatically.

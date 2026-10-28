# DevPath content guide

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

## Full lesson format (required for every module after m16)

Lessons in new modules (HTML `m17`, CSS `m18` and later) must also include:

- `bestPractices` (≥ 2): recommended habits, with essential beginner practice first and advanced advice labelled as such.
- `cheatSheet` (≥ 3 rows of `{ item, meaning }`): the syntax, elements, properties or commands from the lesson.
- `completionCriteria` (≥ 2): what the learner can explain or build after the lesson, phrased as "You can …".
- At least **4 different exercise types** across `exercises`, `quiz` and `challenge`.

The lesson page renders these sections in this order: introduction, objectives and prerequisites, key terms, teaching `sections` (explanation → syntax → examples → walkthrough → real-world), playground, best practices, common mistakes, debugging, quick revision (key points and cheat sheet), practice, end-of-lesson assessment (quiz), then completion criteria. Visual explanations use `diagram` and `table` blocks.

Check a single lesson file before registering it:

```bash
npm run content:lesson -- src/content/curriculum/m17-html/links.ts
```

## HTML and CSS: the `web` runtime

HTML and CSS code runs with `runtime: "web"`. The code *is* the page: a complete HTML document, usually with a `<style>` element. It renders in the same opaque-origin, no-network sandbox as JavaScript, and the preview shows the result.

- **Code blocks:** `{ kind: "code", language: "html", runtime: "web", runnable: true, code: "<!doctype html>…" }`. Never add `output` to HTML or CSS blocks. For CSS-only snippets that aren't a full page, use `language: "css"` without `runnable`.
- **Playground examples:** `{ id, title, runtime: "web", code: "<!doctype html>…" }`.
- **Exercises:** `type: "code"` or `"find-bug"` with `runtime: "web"`. The learner edits a whole page; `starter`/`code` and `solution` are complete HTML documents. `tests` are JavaScript that run **against the rendered document** using `document`, `getComputedStyle` and `assert`. The checker verifies them in jsdom: the solution must pass, and the starter or buggy page must fail at least one test.
  - Learner `<script>` elements don't run during checking. Test markup and styles only.
  - Query the DOM the way a reviewer would: `document.querySelector("main h1")`, `document.querySelectorAll("nav a").length`, `el.getAttribute("href")`, `document.documentElement.lang`, `document.title`.
  - `getComputedStyle` applies the cascade, specificity, `!important` and inheritance. Computed values are normalised:
    - colours are `rgb(r, g, b)`, so `red` reads as `rgb(255, 0, 0)`
    - `font-weight: bold` reads as `"700"`
    - keywords read back as keywords (`display`, `position`, `flex-direction`, `justify-content`, `box-sizing`, …)
    - lengths written in `px` read back in `px`
  - Don't assert on `auto` margins, percentages, `em`/`rem` values or layout measurements such as `offsetWidth`. jsdom does no layout, so those differ from browsers.
  - jsdom ignores every rule whose selector list contains a pseudo-element. For example, `*, *::before, *::after { box-sizing: border-box }` has no effect in the checker, although browsers apply it. For rules like that, accept either the computed value or a matching rule found through `document.styleSheets`.
  - Give tests learner-friendly names and failure messages: `assert.ok(img.alt.trim(), "Every image needs a non-empty alt attribute")`.
- **Validation mode (`htmlCheck`, required).** Learner HTML is validated before it is previewed or graded, because browsers silently repair broken markup. Set a lesson default with `htmlCheck: { mode: "document" }` and override it per block, example or exercise:
  - `"snippet"`: a fragment such as `<h1>Hi</h1>`. No doctype, `<html>`, `<head>` or `<body>` is needed.
  - `"document"`: a complete page. A doctype, `<html>`, `<head>` with `<title>`, and `<body>` are required.
  - `"demo"`: markup that is broken on purpose to show browser error recovery. The problems are listed, but the preview always renders. Explain the recovery in the surrounding text.
  - Add `strict: true` to require explicit end tags, so an implicitly closed `<p>` becomes an error.

  The checker fails if any solution, example or runnable block has validation errors in its mode, or if a `"demo"` item has no problems. Starters and find-the-bug pages may be broken on purpose. In the app, an exercise passes only when the HTML has no errors **and** every test passes.
- `predict-output` runs JavaScript, so don't use it in HTML or CSS lessons. Use `mcq`, `multi-select`, `true-false`, `fill-blank`, `match`, `order`, `short-answer`, and `code`/`find-bug` with the web runtime.

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

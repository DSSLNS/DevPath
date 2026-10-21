# Code execution and data security

## Threat model

Learners run arbitrary JavaScript, and that code may be pasted from elsewhere. It must not be able to read or modify the learner's stored progress and notes, access cookies, make network requests, or freeze or navigate the application.

## Sandbox design (`src/lib/sandbox/browser.ts`)

1. **Opaque-origin iframe.** Every run creates a fresh `<iframe sandbox="allow-scripts">` **without** `allow-same-origin`. The frame gets a unique opaque origin, which means:
   - It cannot read `parent.document`, the app's `localStorage`, IndexedDB or cookies. Accessing `localStorage` throws, and an E2E test verifies this.
   - It cannot navigate the top window, open popups, submit forms or show modal dialogs. `allow-top-navigation`, `allow-popups`, `allow-forms` and `allow-modals` are all absent.
2. **Content Security Policy** inside the iframe: `default-src 'none'`. This blocks `fetch`, XHR, WebSockets, and images, scripts or fonts loaded from URLs. As defence in depth, the runtime also sets `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts` and `Worker` to `undefined`.
3. **Worker isolation for the JS runtime.** Learner code runs in a Web Worker started by the sandboxed iframe. The iframe itself never runs learner code, so an infinite loop cannot block it.
4. **Time limit.** The parent page destroys the iframe and its worker when the configurable limit (default 5 s) passes without a result. An E2E test verifies that `while (true) {}` is stopped and the app stays responsive.
5. **Output limits.** Output is capped at 500 log lines, and each line at 10,000 characters.
6. **No eval in the app context.** `new Function` and `eval` run only inside the sandbox. Messages from the sandbox are accepted only when `event.source` is that run's iframe.

### Known limitations

- **DOM runtime.** DOM examples and challenges run learner code in the iframe's own document, so the learner can interact with a live preview. Chromium on desktop puts sandboxed iframes in a separate process. In browsers that run them in-process, a synchronous infinite loop in DOM code can freeze the tab until the timeout removes the iframe.
- **Resources.** CPU and memory are not limited beyond the time limit. Very large allocations can still slow down the tab.
- **Not a security boundary for secrets.** The sandbox protects the learner's own data in a single-user, browser-only app. It has not been independently audited. Do not use it to run untrusted code that has access to server secrets.

## Rendering user content

- Personal notes use a small Markdown renderer (`src/lib/markdown.tsx`) that outputs React elements only. Raw HTML is shown as text, and links are limited to `https:`, `http:`, `mailto:` and same-site paths. `javascript:` and protocol-relative URLs are dropped. Unit and E2E tests cover this.
- No component uses `dangerouslySetInnerHTML`, apart from the inline script that applies the theme before first paint. That script is a constant.

## Stored data

- All data lives in `localStorage` under `jsacademy:state:v1`. It is validated on load: invalid entries are dropped and the learner is told. Saves that fail, for example because storage is full or blocked, produce a visible warning instead of failing silently.
- No credentials, tokens or payment data are stored. Payment content in the knowledge base uses only providers' documented **test** card numbers.

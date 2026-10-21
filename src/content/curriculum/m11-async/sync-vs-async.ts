import type { Lesson } from "@/content/types";

export const syncVsAsync: Lesson = {
  id: "async-sync-vs-async",
  slug: "sync-vs-async",
  title: "Synchronous vs Asynchronous Code",
  summary: "Understand why JavaScript runs one line at a time, what \"blocking\" means, and how asynchronous code lets slow work finish later without freezing the page.",
  difficulty: "beginner",
  minutes: 20,
  tech: ["javascript"],
  tags: ["async", "synchronous", "asynchronous", "setTimeout", "blocking", "non-blocking"],
  objectives: [
    "Explain the difference between synchronous and asynchronous code.",
    "Predict the order of console output when `setTimeout` is involved.",
    "Describe why blocking the main thread freezes a web page.",
    "Recognise that results of asynchronous work are not available on the next line.",
  ],
  prerequisites: ["functions-callbacks", "functions-arrow-functions"],
  intro: [
    {
      kind: "paragraph",
      text: "So far, every program you have written ran **top to bottom**: line 1 finishes, then line 2 starts. That is *synchronous* code. But real applications constantly wait for slow things — a product API, a database, a timer, a file. If JavaScript simply stopped and waited, the whole page would freeze: buttons would not respond and animations would stop.",
    },
    {
      kind: "paragraph",
      text: "*Asynchronous* code solves this. You start a slow task, tell JavaScript what to do **when it finishes**, and carry on with other work in the meantime. Everything in this module — callbacks, promises, `async`/`await`, `fetch` — builds on this one idea.",
    },
  ],
  terms: [
    { term: "Synchronous", definition: "Code that runs in order, one statement at a time; each statement finishes before the next begins." },
    { term: "Asynchronous", definition: "Code that starts work now and handles the result later, letting other code run in between." },
    { term: "Blocking", definition: "An operation that stops anything else from running until it finishes, e.g. a long `while` loop." },
    { term: "Non-blocking", definition: "An operation that returns immediately and delivers its result later, so the program can keep working." },
    { term: "Single-threaded", definition: "JavaScript has one main thread: it can only execute one piece of your code at a time." },
    { term: "Main thread", definition: "The thread that runs your JavaScript and, in browsers, also handles rendering and user input." },
  ],
  sections: [
    {
      id: "explanation",
      title: "One thread, many waiting tasks",
      blocks: [
        {
          kind: "paragraph",
          text: "JavaScript runs your code on a **single thread**. It cannot run two of your functions at the same time. Synchronous code holds that thread until it finishes. Asynchronous APIs like `setTimeout` and `fetch` hand the *waiting* to the environment (the browser or Node.js), and JavaScript is free to run the rest of your program. When the wait is over, your callback is queued and runs once the thread is free.",
        },
        {
          kind: "diagram",
          title: "Timeline: synchronous lines vs a timer callback",
          variant: "timeline",
          steps: [
            { label: "console.log(\"A\")", detail: "Runs immediately — synchronous." },
            { label: "setTimeout(cb, 0)", detail: "Registers a timer and returns immediately. `cb` does NOT run yet." },
            { label: "console.log(\"C\")", detail: "Runs immediately — the script keeps going." },
            { label: "Script finishes", detail: "The call stack is now empty." },
            { label: "cb runs → console.log(\"B\")", detail: "The timer callback runs only after the current code has finished." },
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Delay means \"at least\", not \"exactly\"",
          text: "`setTimeout(cb, 0)` does not run `cb` instantly. It means \"run `cb` as soon as possible **after** the current code finishes\". Even a 0 ms timer waits for all synchronous code.",
        },
        {
          kind: "table",
          caption: "Synchronous vs asynchronous",
          headers: ["", "Synchronous", "Asynchronous"],
          rows: [
            ["When does it run?", "Right now, in order", "Starts now, result handled later"],
            ["Blocks other code?", "Yes, until it finishes", "No, the program keeps going"],
            ["Typical examples", "Math, string and array methods", "Timers, `fetch`, reading files, user events"],
            ["How you get the result", "Return value", "Callback, promise, or `await`"],
          ],
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax: scheduling work for later",
      blocks: [
        {
          kind: "paragraph",
          text: "The simplest asynchronous API is `setTimeout`. It takes a callback and a delay in milliseconds, and returns a timer id straight away.",
        },
        {
          kind: "code",
          language: "js",
          code: `const timerId = setTimeout(() => {
  // runs later, after at least delayMs milliseconds
}, delayMs);`,
        },
        {
          kind: "list",
          items: [
            "The **first argument** is the function to run later (a callback).",
            "The **second argument** is the minimum delay in milliseconds (defaults to 0).",
            "`setTimeout` itself returns immediately — the next line runs before the callback.",
            "Later lessons show the modern ways to handle async results: promises and `async`/`await`.",
          ],
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "Synchronous code runs in order" },
        {
          kind: "code",
          language: "js",
          code: `console.log("Add to cart");
console.log("Update badge");
console.log("Show toast");`,
          output: "Add to cart\nUpdate badge\nShow toast",
          runnable: true,
        },
        { kind: "heading", text: "A timer runs after the current code" },
        {
          kind: "code",
          language: "js",
          code: `console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");`,
          output: "A\nC\nB",
          runnable: true,
        },
        { kind: "heading", text: "Shorter delays run first" },
        {
          kind: "code",
          language: "js",
          code: `setTimeout(() => console.log("slow request done"), 200);
setTimeout(() => console.log("fast request done"), 50);
console.log("both requests started");`,
          output: "both requests started\nfast request done\nslow request done",
          runnable: true,
        },
        { kind: "heading", text: "The result is not ready on the next line" },
        {
          kind: "code",
          language: "js",
          code: `let product = null;

setTimeout(() => {
  product = { id: 7, name: "Desk Lamp" };
  console.log("inside callback:", product.name);
}, 50);

console.log("right after setTimeout:", product);`,
          output: "right after setTimeout: null\ninside callback: Desk Lamp",
          runnable: true,
        },
      ],
    },
    {
      id: "walkthrough",
      title: "Code walkthrough",
      blocks: [
        {
          kind: "code",
          language: "js",
          code: `function loadProduct(id, onLoaded) {
  console.log("Requesting product", id);
  setTimeout(() => {
    onLoaded({ id, name: "Office Chair", price: 180 });
  }, 100);
}

loadProduct(42, (product) => {
  console.log("Loaded:", product.name);
});
console.log("Showing spinner...");`,
          output: "Requesting product 42\nShowing spinner...\nLoaded: Office Chair",
          runnable: true,
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "`loadProduct(42, ...)` is called. It logs `Requesting product 42` synchronously.",
            "`setTimeout` registers a timer for 100 ms (pretending to be a slow server) and returns immediately.",
            "`loadProduct` returns. Execution continues on the next line, logging `Showing spinner...`.",
            "The script finishes. About 100 ms later the timer fires and calls `onLoaded` with the product.",
            "Our callback logs `Loaded: Office Chair`. The UI never froze while waiting.",
          ],
        },
      ],
    },
    {
      id: "real-world",
      title: "Real-world applications",
      blocks: [
        {
          kind: "list",
          items: [
            "**Loading data:** a product page shows a spinner immediately, then renders the product when the API responds.",
            "**User input:** click and keypress handlers are asynchronous — they run later, when the user acts.",
            "**Test automation:** Cypress and Playwright wait for elements and network responses because the app updates asynchronously. A test that checks the page too early sees the *old* state.",
            "**Performance:** a long synchronous loop (e.g. sorting 1 million items) blocks clicks and scrolling. Breaking work up or moving it off the main thread keeps the UI responsive.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Blocking freezes the page",
          text: "While a synchronous loop runs, the browser cannot repaint or respond to clicks. A `while` loop that busy-waits for 3 seconds freezes the tab for 3 seconds. Never \"wait\" by looping — schedule work asynchronously instead.",
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Using an async result on the next line",
      wrong: `let price;
setTimeout(() => { price = 25; }, 100);
console.log(price * 2); // NaN — price is still undefined`,
      right: `setTimeout(() => {
  const price = 25;
  console.log(price * 2); // 50
}, 100);`,
      explanation: "Code after `setTimeout` runs *before* the callback. Use the value inside the callback (or, later, with promises and `await`).",
    },
    {
      title: "Expecting `setTimeout(fn, 0)` to run immediately",
      wrong: `setTimeout(() => console.log("first?"), 0);
console.log("second?");
// prints "second?" then "first?"`,
      right: `console.log("first");
setTimeout(() => console.log("later"), 0);`,
      explanation: "A 0 ms timer still waits until the current synchronous code finishes. If something must happen first, call it synchronously.",
    },
    {
      title: "Busy-waiting to pause execution",
      wrong: `const end = Date.now() + 2000;
while (Date.now() < end) {} // freezes everything for 2s
console.log("done");`,
      right: `setTimeout(() => console.log("done"), 2000); // page stays responsive`,
      explanation: "A busy loop blocks the single main thread. Schedule the work for later with a timer instead.",
    },
  ],
  debugging: [
    "Add numbered logs (`console.log(\"1 before\")`, `console.log(\"2 callback\")`) to see the real execution order.",
    "If a variable is unexpectedly `undefined` or `null`, check whether you read it **before** an async callback assigned it.",
    "In DevTools, the Performance panel shows long synchronous tasks (\"Long task\") that block the main thread.",
    "Remember: every callback passed to `setTimeout`, an event listener or `fetch` runs *later*, never in the middle of the current code.",
  ],
  examples: [
    {
      id: "async-sync-vs-async-example-order",
      title: "Predict the order",
      code: `console.log("1: start");

setTimeout(() => console.log("4: timer 100ms"), 100);
setTimeout(() => console.log("3: timer 0ms"), 0);

console.log("2: end of script");`,
    },
    {
      id: "async-sync-vs-async-example-loader",
      title: "Fake product loader",
      code: `function loadProduct(id, onLoaded) {
  setTimeout(() => onLoaded({ id, name: "Desk Lamp", price: 35 }), 200);
}

console.log("Loading...");
loadProduct(7, (product) => {
  console.log(\`Loaded \${product.name} ($\${product.price})\`);
});
console.log("Spinner visible, page still responsive");`,
    },
    {
      id: "async-sync-vs-async-example-variable",
      title: "Reading a value too early",
      code: `let user = "unknown";

setTimeout(() => {
  user = "Ada";
  console.log("in callback:", user);
}, 100);

console.log("too early:", user);`,
    },
  ],
  exercises: [
    {
      id: "async-sync-vs-async-ex-1",
      type: "predict-output",
      difficulty: "beginner",
      prompt: "What does this code print, in order?",
      code: `console.log("start");
setTimeout(() => console.log("timeout"), 0);
console.log("end");`,
      answer: "start\nend\ntimeout",
      hints: ["`setTimeout` never runs its callback before the current script finishes."],
      explanation: "`start` and `end` are synchronous. The timer callback runs afterwards, even with a 0 ms delay.",
    },
    {
      id: "async-sync-vs-async-ex-2",
      type: "code",
      difficulty: "beginner",
      prompt: "Write `scheduleMessage(message, ms, log)` that calls `log(message)` after `ms` milliseconds using `setTimeout`.",
      instructions: "Do not call `log` synchronously.",
      starter: `function scheduleMessage(message, ms, log) {
  // your code here
}
`,
      tests: [
        {
          name: "does not log synchronously",
          code: `const calls = [];
scheduleMessage("hi", 20, (m) => calls.push(m));
assert.deepEqual(calls, []);
await new Promise((r) => setTimeout(r, 40));`,
        },
        {
          name: "logs after the delay",
          code: `const calls = [];
scheduleMessage("Order shipped", 20, (m) => calls.push(m));
await new Promise((r) => setTimeout(r, 50));
assert.deepEqual(calls, ["Order shipped"]);`,
        },
      ],
      solution: `function scheduleMessage(message, ms, log) {
  setTimeout(() => log(message), ms);
}`,
      hints: ["`setTimeout(callback, ms)` runs `callback` later.", "The callback should call `log(message)`."],
      explanation: "Wrapping `log(message)` in an arrow function and passing it to `setTimeout` delays the call until the timer fires.",
    },
    {
      id: "async-sync-vs-async-ex-3",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Which of these operations is asynchronous?",
      options: [
        { id: "a", text: "`[3, 1, 2].sort()`", explanation: "Array methods run synchronously and return their result immediately." },
        { id: "b", text: "`\"lamp\".toUpperCase()`", explanation: "String methods are synchronous." },
        { id: "c", text: "`setTimeout(() => save(), 500)`", explanation: "Correct — the callback runs later; `setTimeout` returns immediately." },
        { id: "d", text: "`Math.max(4, 9)`", explanation: "Math functions are synchronous." },
      ],
      answer: "c",
      hints: ["Which one schedules work for the future?"],
      explanation: "`setTimeout` hands the waiting to the environment and runs the callback later. The others compute their result immediately.",
    },
    {
      id: "async-sync-vs-async-ex-4",
      type: "code",
      difficulty: "intermediate",
      prompt: "Write `fakeRequest(url, callback)` that immediately returns the string `\"pending\"`, and after 20 ms calls `callback({ url, status: 200 })`.",
      instructions: "This mimics how real network APIs return before the response arrives.",
      starter: `function fakeRequest(url, callback) {
  // your code here
}
`,
      tests: [
        {
          name: "returns \"pending\" synchronously",
          code: `assert.equal(fakeRequest("/api/cart", () => {}), "pending");
await new Promise((r) => setTimeout(r, 40));`,
        },
        {
          name: "calls back later with url and status",
          code: `let received = null;
fakeRequest("/api/products/7", (res) => { received = res; });
assert.equal(received, null);
await new Promise((r) => setTimeout(r, 50));
assert.deepEqual(received, { url: "/api/products/7", status: 200 });`,
        },
      ],
      solution: `function fakeRequest(url, callback) {
  setTimeout(() => callback({ url, status: 200 }), 20);
  return "pending";
}`,
      hints: ["Schedule the callback with `setTimeout` first, then `return \"pending\"`.", "Use shorthand `{ url, status: 200 }`."],
      explanation: "The function returns before the timer fires. The caller receives `\"pending\"` now and the response object later — exactly the shape of real asynchronous APIs.",
    },
    {
      id: "async-sync-vs-async-ex-5",
      type: "find-bug",
      difficulty: "beginner",
      debugging: true,
      prompt: "`getCartTotal` should pass the total of all prices to `done`, but `done` always receives `0`. Find and fix the bug.",
      code: `function getCartTotal(fetchPrices, done) {
  let total = 0;
  fetchPrices((prices) => {
    total = prices.reduce((sum, p) => sum + p, 0);
  });
  done(total);
}
`,
      tests: [
        {
          name: "passes the real total to done",
          code: `const fakeFetchPrices = (cb) => setTimeout(() => cb([10, 20, 5]), 10);
const result = await new Promise((resolve) => getCartTotal(fakeFetchPrices, resolve));
assert.equal(result, 35);`,
        },
        {
          name: "empty cart gives 0",
          code: `const fakeFetchPrices = (cb) => setTimeout(() => cb([]), 10);
const result = await new Promise((resolve) => getCartTotal(fakeFetchPrices, resolve));
assert.equal(result, 0);`,
        },
      ],
      solution: `function getCartTotal(fetchPrices, done) {
  fetchPrices((prices) => {
    const total = prices.reduce((sum, p) => sum + p, 0);
    done(total);
  });
}`,
      hints: ["When does the callback passed to `fetchPrices` run?", "Where is `done(total)` called relative to that callback?"],
      explanation: "`fetchPrices` is asynchronous, so `done(total)` ran before the prices arrived, while `total` was still `0`. Call `done` **inside** the callback, after the total has been computed.",
    },
    {
      id: "async-sync-vs-async-ex-6",
      type: "true-false",
      difficulty: "beginner",
      prompt: "JavaScript can run two of your functions at exactly the same time on the main thread.",
      answer: false,
      hints: ["How many threads does your JavaScript code run on?"],
      explanation: "JavaScript runs your code on a single main thread, one piece at a time. Asynchrony comes from the environment doing the *waiting*, not from running your code in parallel.",
    },
  ],
  quiz: [
    {
      id: "async-sync-vs-async-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What does this print?",
      code: `setTimeout(() => console.log("X"), 0);
console.log("Y");`,
      options: [
        { id: "a", text: "`X` then `Y`", explanation: "The timer callback can only run after the current script finishes." },
        { id: "b", text: "`Y` then `X`", explanation: "Correct — synchronous `Y` prints first; the 0 ms timer runs afterwards." },
        { id: "c", text: "Only `Y`", explanation: "The timer still fires; it just fires later." },
      ],
      answer: "b",
      hints: ["Is a 0 ms timer instant?"],
      explanation: "A timer callback always waits until the current synchronous code is done, so `Y` prints before `X`.",
    },
    {
      id: "async-sync-vs-async-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Why does a long synchronous loop freeze a web page?",
      options: [
        { id: "a", text: "Because loops are always slow", explanation: "Short loops are fast; the issue is long-running work." },
        {
          id: "b",
          text: "Because JavaScript's single main thread is busy and cannot handle clicks or repaint",
          explanation: "Correct — while your code runs, nothing else on the main thread can run.",
        },
        { id: "c", text: "Because the browser deletes event listeners during loops", explanation: "Listeners are not removed; they just cannot run until the thread is free." },
        { id: "d", text: "Because loops are asynchronous", explanation: "Loops are synchronous — that is exactly why they block." },
      ],
      answer: "b",
      hints: ["How many things can the main thread do at once?"],
      explanation: "The main thread runs your code, handles input and renders. A long synchronous task blocks all of it until it finishes.",
    },
    {
      id: "async-sync-vs-async-q3",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "What is logged?",
      code: `let status = "idle";
setTimeout(() => { status = "done"; }, 10);
console.log(status);`,
      options: [
        { id: "a", text: "`idle`", explanation: "Correct — the callback that sets `\"done\"` has not run yet." },
        { id: "b", text: "`done`", explanation: "The assignment happens later, inside the timer callback." },
        { id: "c", text: "`undefined`", explanation: "`status` was initialised to `\"idle\"`." },
      ],
      answer: "a",
      hints: ["Which runs first: the `console.log` or the timer callback?"],
      explanation: "The log is synchronous and runs before the 10 ms timer fires, so it sees the original value.",
    },
  ],
  challenge: {
    id: "async-sync-vs-async-challenge",
    type: "code",
    difficulty: "intermediate",
    prompt:
      "Write `loadProductName(fetchProduct, onDone)`. It must call `onDone(\"loading\")` **synchronously**, then call `fetchProduct(callback)`; when the product arrives, call `onDone(product.name.toUpperCase())`.",
    starter: `function loadProductName(fetchProduct, onDone) {
  // your code here
}
`,
    tests: [
      {
        name: "reports loading synchronously",
        code: `const states = [];
loadProductName((cb) => setTimeout(() => cb({ name: "lamp" }), 10), (s) => states.push(s));
assert.deepEqual(states, ["loading"]);
await new Promise((r) => setTimeout(r, 30));`,
      },
      {
        name: "reports the uppercased name later",
        code: `const states = [];
loadProductName((cb) => setTimeout(() => cb({ name: "office chair" }), 10), (s) => states.push(s));
await new Promise((r) => setTimeout(r, 30));
assert.deepEqual(states, ["loading", "OFFICE CHAIR"]);`,
      },
    ],
    solution: `function loadProductName(fetchProduct, onDone) {
  onDone("loading");
  fetchProduct((product) => {
    onDone(product.name.toUpperCase());
  });
}`,
    hints: ["Call `onDone(\"loading\")` first.", "Use the product only inside the callback you pass to `fetchProduct`."],
    explanation: "This is the shape of every loading UI: show a loading state immediately (synchronously), then update when the asynchronous result arrives.",
  },
  keyPoints: [
    "Synchronous code runs line by line; each line finishes before the next starts.",
    "JavaScript runs your code on **one main thread**; long synchronous work blocks everything, including the UI.",
    "Asynchronous APIs like `setTimeout` return immediately and run their callback **later**, after the current code finishes.",
    "A value produced asynchronously is not available on the next line — use it inside the callback (or with promises/`await`).",
  ],
  related: ["async-callbacks", "async-event-loop", "async-promises", "dom-timers"],
  references: [
    { title: "MDN: Introducing asynchronous JavaScript", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing" },
    { title: "MDN: setTimeout()", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout" },
  ],
};

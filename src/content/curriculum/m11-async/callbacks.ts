import type { Lesson } from "@/content/types";

export const callbacks: Lesson = {
  id: "async-callbacks",
  slug: "callbacks",
  title: "Callbacks",
  summary: "Use callback functions to receive the result of asynchronous work, and follow the error-first convention so failures are never silently lost.",
  difficulty: "beginner",
  minutes: 25,
  tech: ["javascript", "node"],
  tags: ["async", "callbacks", "error-first", "setTimeout", "continuation"],
  objectives: [
    "Pass a callback to an asynchronous function to receive its result later.",
    "Write and consume error-first callbacks `(error, result)`.",
    "Explain the difference between synchronous callbacks (like `map`) and asynchronous callbacks (like `setTimeout`).",
    "Avoid common callback bugs: calling twice, forgetting to call, and ignoring errors.",
  ],
  prerequisites: ["async-sync-vs-async", "functions-callbacks"],
  intro: [
    {
      kind: "paragraph",
      text: "An asynchronous function cannot `return` its result, because the result does not exist yet when the function returns. The oldest solution in JavaScript is the **callback**: you pass in a function, and the asynchronous code calls it when the work is done.",
    },
    {
      kind: "paragraph",
      text: "Callbacks still power event listeners, timers and many Node.js APIs, and they are the foundation that promises were built on. Understanding them makes everything later in this module easier to reason about.",
    },
  ],
  terms: [
    { term: "Callback", definition: "A function passed as an argument to another function, to be called by that function later." },
    { term: "Asynchronous callback", definition: "A callback invoked after the current code finishes, e.g. by a timer, event or network response." },
    { term: "Synchronous callback", definition: "A callback invoked immediately, before the outer function returns, e.g. the function you pass to `map`." },
    { term: "Error-first callback", definition: "A Node.js convention where the callback's first parameter is an error (or `null`) and the second is the result: `(err, data) => {}`." },
    { term: "Continuation", definition: "The code that should run *after* an operation finishes. With callbacks, the continuation lives inside the callback." },
  ],
  sections: [
    {
      id: "explanation",
      title: "Handing over \"what to do next\"",
      blocks: [
        {
          kind: "paragraph",
          text: "With synchronous code, you call a function and use its return value on the next line. With asynchronous code, you instead give the function a callback — your *continuation* — and the function calls it when the result is ready.",
        },
        {
          kind: "diagram",
          title: "Lifecycle of an asynchronous callback",
          variant: "timeline",
          steps: [
            { label: "getUser(7, callback)", detail: "You call the function and pass your callback." },
            { label: "getUser starts the work and returns", detail: "Returns `undefined` immediately; your code continues." },
            { label: "…waiting…", detail: "The environment (timer, network) does the waiting, not your code." },
            { label: "callback(null, user)", detail: "When the result is ready, the function calls your callback with it." },
          ],
        },
        {
          kind: "table",
          caption: "Synchronous vs asynchronous callbacks",
          headers: ["", "Synchronous callback", "Asynchronous callback"],
          rows: [
            ["Example", "`[1, 2].map((n) => n * 2)`", "`setTimeout(() => save(), 100)`"],
            ["When it runs", "Before the outer function returns", "After the current code finishes"],
            ["Result available", "On the next line", "Only inside the callback"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The error-first convention",
          text: "Node.js standardised callbacks as `(err, result)`. If something went wrong, `err` is an `Error` and `result` is missing. If it worked, `err` is `null`. **Always check `err` first.**",
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax",
      blocks: [
        { kind: "heading", text: "Writing a function that accepts a callback" },
        {
          kind: "code",
          language: "js",
          code: `function getProduct(id, callback) {
  setTimeout(() => {
    if (id <= 0) {
      callback(new Error("Invalid id"));      // failure: error first
    } else {
      callback(null, { id, name: "Mug" });     // success: null, then result
    }
  }, 100);
}`,
        },
        { kind: "heading", text: "Calling it" },
        {
          kind: "code",
          language: "js",
          code: `getProduct(1, (err, product) => {
  if (err) {
    // handle the error and stop
    return;
  }
  // use product
});`,
        },
        {
          kind: "list",
          items: [
            "The callback is usually the **last** parameter.",
            "Call it **exactly once** — either with an error, or with `null` and the result.",
            "Use `return` after handling an error so the success code does not run too.",
          ],
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "A callback receiving a result" },
        {
          kind: "code",
          language: "js",
          code: `function getPrice(sku, callback) {
  setTimeout(() => callback(19.99), 50);
}

getPrice("MUG-01", (price) => {
  console.log("Price:", price);
});
console.log("Request sent");`,
          output: "Request sent\nPrice: 19.99",
          runnable: true,
        },
        { kind: "heading", text: "Error-first callbacks" },
        {
          kind: "code",
          language: "js",
          code: `function getProduct(id, callback) {
  setTimeout(() => {
    if (id <= 0) callback(new Error("Invalid id"));
    else callback(null, { id, name: "Mug" });
  }, 50);
}

function handle(err, product) {
  if (err) {
    console.log("Failed:", err.message);
    return;
  }
  console.log("Got:", product.name);
}

getProduct(3, handle);
getProduct(-1, handle);`,
          output: "Got: Mug\nFailed: Invalid id",
          runnable: true,
        },
        { kind: "heading", text: "Synchronous callbacks run immediately" },
        {
          kind: "code",
          language: "js",
          code: `console.log("before");
[1, 2].forEach((n) => console.log("forEach", n));
setTimeout(() => console.log("timer"), 0);
console.log("after");`,
          output: "before\nforEach 1\nforEach 2\nafter\ntimer",
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
          code: `function checkStock(sku, callback) {
  const stock = { "LAMP-1": 4, "CHAIR-2": 0 };
  setTimeout(() => {
    if (!(sku in stock)) {
      callback(new Error(\`Unknown SKU \${sku}\`));
      return;
    }
    callback(null, stock[sku]);
  }, 30);
}

checkStock("LAMP-1", (err, qty) => {
  if (err) return console.log("Error:", err.message);
  console.log(qty > 0 ? \`\${qty} in stock\` : "Sold out");
});

checkStock("DESK-9", (err, qty) => {
  if (err) return console.log("Error:", err.message);
  console.log(qty);
});`,
          output: "4 in stock\nError: Unknown SKU DESK-9",
          runnable: true,
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "`checkStock` simulates a slow inventory service with `setTimeout`.",
            "If the SKU is unknown it calls `callback` with an `Error` **and returns**, so the success branch never also runs.",
            "Otherwise it calls `callback(null, quantity)` — `null` means \"no error\".",
            "Each caller checks `err` first. `return console.log(...)` is a compact way to log and stop.",
            "Both requests run concurrently; their callbacks fire in the order their timers complete.",
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
            "**Event listeners:** `button.addEventListener(\"click\", handler)` — `handler` is an asynchronous callback run on every click.",
            "**Node.js:** `fs.readFile(path, \"utf8\", (err, text) => {...})` uses error-first callbacks.",
            "**Timers:** `setTimeout` and `setInterval` take callbacks.",
            "**Test frameworks:** older Mocha/Jest tests use a `done` callback to signal that an asynchronous test has finished.",
          ],
        },
        {
          kind: "code",
          language: "js",
          title: "Node.js error-first callback (not runnable in the sandbox)",
          code: `import { readFile } from "node:fs";

readFile("config.json", "utf8", (err, text) => {
  if (err) {
    console.error("Could not read config:", err.message);
    return;
  }
  const config = JSON.parse(text);
  console.log("Loaded config for", config.env);
});`,
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Ignoring the error argument",
      wrong: `getProduct(id, (err, product) => {
  console.log(product.name); // TypeError when err is set
});`,
      right: `getProduct(id, (err, product) => {
  if (err) return console.error(err.message);
  console.log(product.name);
});`,
      explanation: "When an error occurs, `product` is `undefined`. Always check `err` before touching the result.",
    },
    {
      title: "Calling the callback twice",
      wrong: `function load(id, cb) {
  if (!id) cb(new Error("Missing id"));
  cb(null, { id }); // also runs when id is missing!
}`,
      right: `function load(id, cb) {
  if (!id) return cb(new Error("Missing id"));
  cb(null, { id });
}`,
      explanation: "Without `return`, execution continues and the callback runs a second time. Callers then handle both an error and a success.",
    },
    {
      title: "Calling the function instead of passing it",
      wrong: `setTimeout(showToast(), 1000); // runs now, passes undefined`,
      right: `setTimeout(showToast, 1000);
// or: setTimeout(() => showToast("Saved"), 1000);`,
      explanation: "`showToast()` calls the function immediately and passes its return value. Pass the function itself, or wrap the call in an arrow function.",
    },
    {
      title: "Trying to return a value from an async callback",
      wrong: `function getName(id) {
  getUser(id, (err, user) => {
    return user.name; // returns from the callback, not getName
  });
}`,
      right: `function getName(id, callback) {
  getUser(id, (err, user) => {
    if (err) return callback(err);
    callback(null, user.name);
  });
}`,
      explanation: "A `return` inside the callback only exits the callback. To pass the value on, accept your own callback (or use promises).",
    },
  ],
  debugging: [
    "If your callback never runs, check that the asynchronous function actually calls it on **every** path (including errors).",
    "If it runs twice, look for missing `return` statements after `callback(err)`.",
    "`TypeError: callback is not a function` usually means arguments are in the wrong order or the callback was not passed.",
    "Log at the start of the callback (`console.log(\"cb\", err, result)`) to see exactly what it receives.",
  ],
  examples: [
    {
      id: "async-callbacks-example-error-first",
      title: "Error-first product loader",
      code: `function getProduct(id, callback) {
  setTimeout(() => {
    if (id <= 0) return callback(new Error("Invalid id"));
    callback(null, { id, name: "Desk Lamp", price: 35 });
  }, 100);
}

getProduct(1, (err, product) => {
  if (err) return console.log("Error:", err.message);
  console.log("Loaded", product);
});

getProduct(0, (err, product) => {
  if (err) return console.log("Error:", err.message);
  console.log("Loaded", product);
});`,
    },
    {
      id: "async-callbacks-example-sync-async",
      title: "Sync vs async callbacks",
      code: `console.log("1");
["a", "b"].forEach((x) => console.log("sync callback", x));
setTimeout(() => console.log("async callback"), 0);
console.log("2");`,
    },
    {
      id: "async-callbacks-example-wrap",
      title: "Passing a result through your own callback",
      code: `function getUser(id, cb) {
  setTimeout(() => cb(null, { id, name: "Ada Lovelace" }), 50);
}

function getFirstName(id, cb) {
  getUser(id, (err, user) => {
    if (err) return cb(err);
    cb(null, user.name.split(" ")[0]);
  });
}

getFirstName(1, (err, first) => console.log(err ? err.message : first));`,
    },
  ],
  exercises: [
    {
      id: "async-callbacks-ex-1",
      type: "predict-output",
      difficulty: "beginner",
      prompt: "What does this print?",
      code: `function later(value, cb) {
  setTimeout(() => cb(value), 10);
}

later("B", (v) => console.log(v));
console.log("A");`,
      answer: "A\nB",
      hints: ["The callback is called from inside a timer."],
      explanation: "`later` schedules the callback and returns. `A` is logged synchronously; `B` is logged when the timer fires.",
    },
    {
      id: "async-callbacks-ex-2",
      type: "code",
      difficulty: "beginner",
      prompt: "Write `getGreeting(name, callback)` that, after 10 ms, calls `callback(null, \"Hello, <name>!\")`. If `name` is an empty string, call `callback(new Error(\"Name required\"))` instead.",
      starter: `function getGreeting(name, callback) {
  // your code here
}
`,
      tests: [
        {
          name: "greets a name",
          code: `const [err, msg] = await new Promise((r) => getGreeting("Ada", (e, m) => r([e, m])));
assert.equal(err, null);
assert.equal(msg, "Hello, Ada!");`,
        },
        {
          name: "errors on empty name",
          code: `const [err] = await new Promise((r) => getGreeting("", (e, m) => r([e, m])));
assert.ok(err instanceof Error);
assert.equal(err.message, "Name required");`,
        },
        {
          name: "is asynchronous",
          code: `let called = false;
getGreeting("Bo", () => { called = true; });
assert.equal(called, false);
await new Promise((r) => setTimeout(r, 30));
assert.equal(called, true);`,
        },
      ],
      solution: `function getGreeting(name, callback) {
  setTimeout(() => {
    if (name === "") return callback(new Error("Name required"));
    callback(null, \`Hello, \${name}!\`);
  }, 10);
}`,
      hints: ["Wrap the logic in `setTimeout(() => { ... }, 10)`.", "Use `return callback(err)` so the success line does not also run."],
      explanation: "The function follows the error-first convention: an `Error` on failure, or `null` plus the result on success — called exactly once, asynchronously.",
    },
    {
      id: "async-callbacks-ex-3",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Complete the error-first callback so errors are handled before the data is used.",
      template: `readOrders((___, orders) => {
  if (err) ___ console.error(err.message);
  console.log(orders.length);
});`,
      blanks: [{ answers: ["err"] }, { answers: ["return"] }],
      hints: ["The first parameter is the error.", "Which keyword stops the rest of the callback from running?"],
      explanation: "Error-first callbacks take `(err, data)`. `return` after handling the error prevents `orders.length` from throwing.",
    },
    {
      id: "async-callbacks-ex-4",
      type: "code",
      difficulty: "intermediate",
      prompt: "Write `getProductTitle(id, fetchProduct, callback)`. `fetchProduct(id, cb)` is an error-first function. Pass errors straight to `callback`; on success call `callback(null, \"<name> - $<price>\")` with the price to 2 decimals.",
      starter: `function getProductTitle(id, fetchProduct, callback) {
  // your code here
}
`,
      tests: [
        {
          name: "formats a product",
          code: `const fake = (id, cb) => setTimeout(() => cb(null, { id, name: "Mug", price: 12.5 }), 5);
const [err, title] = await new Promise((r) => getProductTitle(1, fake, (e, t) => r([e, t])));
assert.equal(err, null);
assert.equal(title, "Mug - $12.50");`,
        },
        {
          name: "passes errors through",
          code: `const boom = new Error("Not found");
const fake = (id, cb) => setTimeout(() => cb(boom), 5);
const [err, title] = await new Promise((r) => getProductTitle(99, fake, (e, t) => r([e, t])));
assert.equal(err, boom);
assert.equal(title, undefined);`,
        },
        {
          name: "calls callback exactly once on error",
          code: `let calls = 0;
const fake = (id, cb) => setTimeout(() => cb(new Error("x")), 5);
getProductTitle(1, fake, () => { calls++; });
await new Promise((r) => setTimeout(r, 30));
assert.equal(calls, 1);`,
        },
      ],
      solution: `function getProductTitle(id, fetchProduct, callback) {
  fetchProduct(id, (err, product) => {
    if (err) return callback(err);
    callback(null, \`\${product.name} - $\${product.price.toFixed(2)}\`);
  });
}`,
      hints: ["Call `fetchProduct(id, (err, product) => { ... })`.", "On error: `return callback(err);`."],
      explanation: "This is the standard way to compose callback APIs: forward errors unchanged, transform successful results, and always call the outer callback exactly once.",
    },
    {
      id: "async-callbacks-ex-5",
      type: "find-bug",
      difficulty: "intermediate",
      debugging: true,
      prompt: "`loadUser` sometimes calls its callback **twice** — once with an error and once with a user. Fix it so the callback is called exactly once.",
      code: `function loadUser(id, callback) {
  setTimeout(() => {
    if (typeof id !== "number") {
      callback(new Error("id must be a number"));
    }
    callback(null, { id, name: "User " + id });
  }, 10);
}
`,
      tests: [
        {
          name: "invalid id: callback called once with an error",
          code: `const calls = [];
loadUser("7", (err, user) => calls.push(err ? "error" : "user"));
await new Promise((r) => setTimeout(r, 30));
assert.deepEqual(calls, ["error"]);`,
        },
        {
          name: "valid id: returns the user",
          code: `const user = await new Promise((r) => loadUser(7, (e, u) => r(u)));
assert.deepEqual(user, { id: 7, name: "User 7" });`,
        },
      ],
      solution: `function loadUser(id, callback) {
  setTimeout(() => {
    if (typeof id !== "number") {
      return callback(new Error("id must be a number"));
    }
    callback(null, { id, name: "User " + id });
  }, 10);
}`,
      hints: ["What happens after `callback(new Error(...))` runs?", "Add a `return`."],
      explanation: "Calling the callback does not stop the function. Without `return`, the success call also runs. `return callback(err)` exits after reporting the error.",
    },
  ],
  quiz: [
    {
      id: "async-callbacks-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "In an error-first callback `(err, data) => {}`, what is `err` when the operation succeeds?",
      options: [
        { id: "a", text: "`null`", explanation: "Correct — `null` signals \"no error\"." },
        { id: "b", text: "An empty `Error`", explanation: "An `Error` object means something failed." },
        { id: "c", text: "The data", explanation: "Data comes second." },
        { id: "d", text: "`true`", explanation: "Booleans are not used for this convention." },
      ],
      answer: "a",
      hints: ["The first argument is reserved for errors."],
      explanation: "By convention, success calls `callback(null, result)`; failure calls `callback(error)`.",
    },
    {
      id: "async-callbacks-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What is wrong with `setTimeout(saveCart(), 500)`?",
      options: [
        { id: "a", text: "Nothing, it saves after 500 ms", explanation: "`saveCart()` runs immediately because of the parentheses." },
        {
          id: "b",
          text: "`saveCart` is called immediately and its return value is passed to `setTimeout`",
          explanation: "Correct — pass `saveCart` (no parentheses) or `() => saveCart()`.",
        },
        { id: "c", text: "The delay must be in seconds", explanation: "`setTimeout` uses milliseconds." },
      ],
      answer: "b",
      hints: ["What do the parentheses after `saveCart` do?"],
      explanation: "Callbacks must be passed as function values. Adding `()` calls the function right away.",
    },
    {
      id: "async-callbacks-q3",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "Which callback is **synchronous**?",
      options: [
        { id: "a", text: "The function passed to `addEventListener(\"click\", ...)`", explanation: "Event listeners run later, when the event happens." },
        { id: "b", text: "The function passed to `setTimeout`", explanation: "Timer callbacks run later." },
        { id: "c", text: "The function passed to `array.filter`", explanation: "Correct — `filter` calls it for each element before returning." },
      ],
      answer: "c",
      hints: ["Which one has finished calling the callback by the time the outer function returns?"],
      explanation: "Array methods call their callbacks synchronously. Timers and events call theirs asynchronously.",
    },
    {
      id: "async-callbacks-q4",
      type: "true-false",
      difficulty: "beginner",
      prompt: "Returning a value from inside an asynchronous callback makes the outer function return that value.",
      answer: false,
      hints: ["Which function does `return` exit?"],
      explanation: "`return` only exits the callback itself. By then the outer function has already returned.",
    },
  ],
  challenge: {
    id: "async-callbacks-challenge",
    type: "code",
    difficulty: "intermediate",
    prompt:
      "Write `withTimeout(task, ms, callback)`. `task(cb)` is an error-first async function. If it finishes within `ms`, forward its result. Otherwise call `callback(new Error(\"Timed out\"))`. The callback must be called **exactly once** either way.",
    starter: `function withTimeout(task, ms, callback) {
  // your code here
}
`,
    tests: [
      {
        name: "forwards a fast result",
        code: `const fast = (cb) => setTimeout(() => cb(null, "ok"), 10);
const [err, val] = await new Promise((r) => withTimeout(fast, 100, (e, v) => r([e, v])));
assert.equal(err, null);
assert.equal(val, "ok");`,
      },
      {
        name: "times out a slow task",
        code: `const slow = (cb) => setTimeout(() => cb(null, "late"), 100);
const [err] = await new Promise((r) => withTimeout(slow, 20, (e, v) => r([e, v])));
assert.equal(err.message, "Timed out");
await new Promise((r) => setTimeout(r, 120));`,
      },
      {
        name: "calls back only once",
        code: `let calls = 0;
const slow = (cb) => setTimeout(() => cb(null, "late"), 60);
withTimeout(slow, 20, () => { calls++; });
await new Promise((r) => setTimeout(r, 100));
assert.equal(calls, 1);`,
      },
    ],
    solution: `function withTimeout(task, ms, callback) {
  let done = false;
  const timer = setTimeout(() => {
    if (done) return;
    done = true;
    callback(new Error("Timed out"));
  }, ms);
  task((err, result) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    callback(err, result);
  });
}`,
    hints: ["Start a timer and run the task at the same time.", "Use a `done` flag so whichever finishes first wins and the other is ignored."],
    explanation:
      "Two asynchronous events race: the task and the timer. A shared `done` flag guarantees the callback is called once. Clearing the timer on success avoids leaving work scheduled. Later, `Promise.race` and `AbortController` make this pattern much simpler.",
  },
  keyPoints: [
    "A callback is a function you pass in so asynchronous code can call it with the result later.",
    "Asynchronous callbacks run after the current code finishes; synchronous callbacks (like `map`'s) run immediately.",
    "Error-first callbacks use `(err, result)`: check `err` first and `return` after handling it.",
    "A well-behaved async function calls its callback **exactly once** on every path.",
  ],
  related: ["async-callback-nesting", "async-promises", "async-sync-vs-async", "functions-callbacks", "dom-event-listeners"],
  references: [
    { title: "MDN: Callback function", url: "https://developer.mozilla.org/en-US/docs/Glossary/Callback_function" },
    { title: "Node.js: Error-first callbacks", url: "https://nodejs.org/en/learn/asynchronous-work/javascript-asynchronous-programming-and-callbacks" },
  ],
};

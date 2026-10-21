import type { Lesson } from "@/content/types";

export const callbackNesting: Lesson = {
  id: "async-callback-nesting",
  slug: "callback-nesting",
  title: "Callback Nesting",
  summary: "See why dependent asynchronous steps lead to deeply nested \"callback hell\", and learn techniques to flatten it before moving on to promises.",
  difficulty: "beginner",
  minutes: 25,
  tech: ["javascript"],
  tags: ["async", "callbacks", "callback hell", "pyramid of doom", "refactoring"],
  objectives: [
    "Run dependent asynchronous steps in sequence using nested callbacks.",
    "Identify the problems of callback hell: readability, repeated error handling, and lost errors.",
    "Flatten nested callbacks by extracting named functions.",
    "Explain why promises were introduced to solve these problems.",
  ],
  prerequisites: ["async-callbacks"],
  intro: [
    {
      kind: "paragraph",
      text: "Real tasks often have several asynchronous steps that depend on each other: *log in → load the user's cart → load the products in it → calculate shipping*. With callbacks, each step must start **inside** the callback of the previous one, because that is the only place its result exists.",
    },
    {
      kind: "paragraph",
      text: "Every step adds another level of indentation. The result is the infamous **callback hell** or **pyramid of doom**. In this lesson you will build one, feel the pain, and learn how to tame it — and why promises were invented.",
    },
  ],
  terms: [
    { term: "Callback hell", definition: "Code with many levels of nested callbacks, making it hard to read, change and handle errors in." },
    { term: "Pyramid of doom", definition: "Another name for callback hell, describing the triangular shape the indentation creates." },
    { term: "Sequential (dependent) steps", definition: "Asynchronous operations where each step needs the result of the previous one." },
    { term: "Inversion of control", definition: "Handing your continuation to someone else's code and trusting it to call it correctly (once, with the right arguments)." },
  ],
  sections: [
    {
      id: "explanation",
      title: "Why callbacks nest",
      blocks: [
        {
          kind: "paragraph",
          text: "Each result only exists inside its callback. To use the user to fetch their cart, the cart request must go inside the user callback. To use the cart to fetch products, that request goes inside the cart callback — and so on.",
        },
        {
          kind: "diagram",
          title: "Timeline of three dependent steps",
          variant: "timeline",
          steps: [
            { label: "getUser(1, cb1)", detail: "Start step 1." },
            { label: "cb1(user) → getCart(user.id, cb2)", detail: "Step 2 can only start once step 1 has finished." },
            { label: "cb2(cart) → getShipping(cart, cb3)", detail: "Step 3 needs the cart from step 2." },
            { label: "cb3(cost) → render", detail: "Finally we have everything we need." },
          ],
        },
        {
          kind: "list",
          items: [
            "**Readability:** the logic drifts to the right and is hard to follow.",
            "**Error handling is repeated** at every level — and easy to forget at one of them.",
            "**Errors thrown inside callbacks** cannot be caught by a `try/catch` around the outer call.",
            "**Inversion of control:** you trust each API to call your callback exactly once.",
          ],
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax: nested vs flattened",
      blocks: [
        { kind: "heading", text: "Nested (pyramid of doom)" },
        {
          kind: "code",
          language: "js",
          code: `getUser(1, (err, user) => {
  if (err) return handleError(err);
  getCart(user.id, (err, cart) => {
    if (err) return handleError(err);
    getShipping(cart, (err, cost) => {
      if (err) return handleError(err);
      render(user, cart, cost);
    });
  });
});`,
        },
        { kind: "heading", text: "Flattened with named functions" },
        {
          kind: "code",
          language: "js",
          code: `getUser(1, onUser);

function onUser(err, user) {
  if (err) return handleError(err);
  getCart(user.id, onCart);
}

function onCart(err, cart) {
  if (err) return handleError(err);
  getShipping(cart, onShipping);
}

function onShipping(err, cost) {
  if (err) return handleError(err);
  render(cost);
}`,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Preview: the promise version",
          text: "With promises and `async`/`await`, the same flow reads top to bottom: `const user = await getUser(1); const cart = await getCart(user.id); const cost = await getShipping(cart);` — with one `try/catch` for all errors.",
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "Three dependent steps" },
        {
          kind: "code",
          language: "js",
          code: `const getUser = (id, cb) => setTimeout(() => cb(null, { id, name: "Ada" }), 30);
const getCart = (userId, cb) => setTimeout(() => cb(null, { userId, items: 3, subtotal: 42 }), 30);
const getShipping = (cart, cb) => setTimeout(() => cb(null, cart.subtotal > 40 ? 0 : 5), 30);

getUser(1, (err, user) => {
  console.log("1. user:", user.name);
  getCart(user.id, (err, cart) => {
    console.log("2. cart items:", cart.items);
    getShipping(cart, (err, cost) => {
      console.log("3. shipping:", cost);
    });
  });
});`,
          output: "1. user: Ada\n2. cart items: 3\n3. shipping: 0",
          runnable: true,
        },
        { kind: "heading", text: "An error stops the chain" },
        {
          kind: "code",
          language: "js",
          code: `const getUser = (id, cb) => setTimeout(() => cb(null, { id }), 20);
const getCart = (userId, cb) => setTimeout(() => cb(new Error("Cart service down")), 20);

getUser(1, (err, user) => {
  if (err) return console.log("user failed:", err.message);
  getCart(user.id, (err, cart) => {
    if (err) return console.log("cart failed:", err.message);
    console.log("cart", cart);
  });
});`,
          output: "cart failed: Cart service down",
          runnable: true,
        },
        { kind: "heading", text: "try/catch cannot catch errors thrown in later callbacks" },
        {
          kind: "code",
          language: "js",
          code: `try {
  setTimeout(() => {
    throw new Error("thrown inside callback");
  }, 10);
  console.log("try block finished");
} catch (err) {
  console.log("caught:", err.message);
}`,
          output: "try block finished\nUncaught Error: thrown inside callback",
          runnable: true,
        },
      ],
    },
    {
      id: "walkthrough",
      title: "Code walkthrough: flattening the pyramid",
      blocks: [
        {
          kind: "code",
          language: "js",
          code: `const getUser = (id, cb) => setTimeout(() => cb(null, { id, name: "Ada" }), 20);
const getOrders = (user, cb) => setTimeout(() => cb(null, [{ total: 30 }, { total: 12 }]), 20);

function showOrderSummary(userId, done) {
  getUser(userId, handleUser);

  function handleUser(err, user) {
    if (err) return done(err);
    getOrders(user, (err, orders) => handleOrders(err, user, orders));
  }

  function handleOrders(err, user, orders) {
    if (err) return done(err);
    const total = orders.reduce((sum, o) => sum + o.total, 0);
    done(null, \`\${user.name} spent $\${total}\`);
  }
}

showOrderSummary(1, (err, text) => console.log(err ? err.message : text));`,
          output: "Ada spent $42",
          runnable: true,
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "`showOrderSummary` starts step 1 by calling `getUser` with a **named** handler instead of an inline arrow function.",
            "`handleUser` checks the error, then starts step 2. A small arrow function forwards `user` along with the new results.",
            "`handleOrders` computes the total and calls the outer `done` callback once.",
            "Every handler sits at the same indentation level — the pyramid is gone, though error checks are still repeated.",
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
            "**Checkout flows:** validate address → calculate tax → reserve stock → charge payment. Each step depends on the previous one.",
            "**Legacy code:** older Node.js and jQuery codebases are full of nested callbacks. You will read and refactor them.",
            "**Migration:** Node's `util.promisify` turns error-first callback functions into promise-returning ones, the first step in modernising such code.",
          ],
        },
        {
          kind: "code",
          language: "js",
          title: "Node.js: converting a callback API to promises (not runnable in the sandbox)",
          code: `import { promisify } from "node:util";
import { readFile } from "node:fs";

const readFileAsync = promisify(readFile);
const text = await readFileAsync("orders.json", "utf8");`,
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Forgetting error handling at one level",
      wrong: `getUser(1, (err, user) => {
  if (err) return fail(err);
  getCart(user.id, (err, cart) => {
    render(cart.items); // crashes if getCart failed
  });
});`,
      right: `getUser(1, (err, user) => {
  if (err) return fail(err);
  getCart(user.id, (err, cart) => {
    if (err) return fail(err);
    render(cart.items);
  });
});`,
      explanation: "Every level of a callback chain needs its own error check. Missing one means a crash or a silently ignored failure.",
    },
    {
      title: "Wrapping async calls in try/catch",
      wrong: `try {
  getUser(1, (err, user) => {
    throw new Error("boom");
  });
} catch (e) {
  // never reached
}`,
      right: `getUser(1, (err, user) => {
  try {
    riskyWork(user);
  } catch (e) {
    fail(e);
  }
});`,
      explanation: "By the time the callback runs, the outer `try` block has already finished. Handle errors inside the callback (or switch to promises).",
    },
    {
      title: "Running independent steps sequentially",
      wrong: `getProducts((e, products) => {
  getCategories((e, categories) => {
    render(products, categories); // categories waited for products for no reason
  });
});`,
      right: `// Independent requests can start together.
// Promise.all (later lesson) makes this easy:
// const [products, categories] = await Promise.all([getProducts(), getCategories()]);`,
      explanation: "Only nest when a step truly needs the previous result. Independent requests should run in parallel.",
    },
  ],
  debugging: [
    "Number your logs at each level (`console.log(\"step 2\", cart)`) to see how far the chain got before it stopped.",
    "If the chain stops silently, a level probably swallowed an error or never called the next callback.",
    "An `Uncaught` error from a callback cannot be caught by an outer `try/catch` — look inside the callback that threw.",
    "Extract each level into a named function so stack traces and breakpoints show meaningful names instead of `(anonymous)`.",
  ],
  examples: [
    {
      id: "async-callback-nesting-example-pyramid",
      title: "Checkout pyramid",
      code: `const validateAddress = (addr, cb) => setTimeout(() => cb(null, { ...addr, valid: true }), 30);
const calculateTax = (addr, cb) => setTimeout(() => cb(null, addr.country === "US" ? 0.08 : 0.2), 30);
const charge = (amount, cb) => setTimeout(() => cb(null, { id: "pay_test_123", amount }), 30);

const subtotal = 100;
validateAddress({ country: "US" }, (err, address) => {
  if (err) return console.log(err.message);
  calculateTax(address, (err, rate) => {
    if (err) return console.log(err.message);
    charge(subtotal * (1 + rate), (err, payment) => {
      if (err) return console.log(err.message);
      console.log("Charged", payment.amount, "with", payment.id);
    });
  });
});`,
    },
    {
      id: "async-callback-nesting-example-flat",
      title: "Same flow, flattened",
      code: `const validateAddress = (addr, cb) => setTimeout(() => cb(null, { ...addr, valid: true }), 30);
const calculateTax = (addr, cb) => setTimeout(() => cb(null, addr.country === "US" ? 0.08 : 0.2), 30);
const charge = (amount, cb) => setTimeout(() => cb(null, { id: "pay_test_123", amount }), 30);

const subtotal = 100;
validateAddress({ country: "DE" }, onAddress);

function onAddress(err, address) {
  if (err) return console.log(err.message);
  calculateTax(address, onTax);
}

function onTax(err, rate) {
  if (err) return console.log(err.message);
  charge(subtotal * (1 + rate), onCharged);
}

function onCharged(err, payment) {
  if (err) return console.log(err.message);
  console.log("Charged", payment.amount);
}`,
    },
  ],
  exercises: [
    {
      id: "async-callback-nesting-ex-1",
      type: "predict-output",
      difficulty: "beginner",
      prompt: "What does this print?",
      code: `const step = (name, cb) => setTimeout(() => { console.log(name); cb(); }, 10);

step("login", () => {
  step("load cart", () => {
    step("show cart", () => {});
  });
});
console.log("started");`,
      answer: "started\nlogin\nload cart\nshow cart",
      hints: ["Each step starts only after the previous one finishes.", "The synchronous log runs first."],
      explanation: "`started` prints synchronously. Each nested `step` starts inside the previous callback, so they print in sequence.",
    },
    {
      id: "async-callback-nesting-ex-2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Why do the steps in callback-based code end up nested?",
      options: [
        { id: "a", text: "JavaScript requires callbacks to be indented", explanation: "Indentation is style, not a language rule." },
        {
          id: "b",
          text: "Each step needs a result that only exists inside the previous step's callback",
          explanation: "Correct — the next step must start where the previous result is available.",
        },
        { id: "c", text: "Nesting makes the code run faster", explanation: "Nesting forces steps to run one after another; it does not speed anything up." },
      ],
      answer: "b",
      hints: ["Where is the result of an asynchronous callback available?"],
      explanation: "Results are only available inside callbacks, so dependent steps must start there, creating nesting.",
    },
    {
      id: "async-callback-nesting-ex-3",
      type: "code",
      difficulty: "beginner",
      prompt: "Using the provided `getUser(id, cb)` and `getCart(userId, cb)` error-first functions, write `getCartCount(id, callback)` that calls `callback(null, cart.items.length)`, or forwards any error.",
      starter: `const getUser = (id, cb) => setTimeout(() => (id > 0 ? cb(null, { id }) : cb(new Error("No user"))), 5);
const getCart = (userId, cb) => setTimeout(() => cb(null, { userId, items: ["mug", "tea"] }), 5);

function getCartCount(id, callback) {
  // your code here
}
`,
      tests: [
        {
          name: "counts items",
          code: `const [err, count] = await new Promise((r) => getCartCount(1, (e, c) => r([e, c])));
assert.equal(err, null);
assert.equal(count, 2);`,
        },
        {
          name: "forwards user errors",
          code: `const [err] = await new Promise((r) => getCartCount(0, (e, c) => r([e, c])));
assert.equal(err.message, "No user");`,
        },
      ],
      solution: `const getUser = (id, cb) => setTimeout(() => (id > 0 ? cb(null, { id }) : cb(new Error("No user"))), 5);
const getCart = (userId, cb) => setTimeout(() => cb(null, { userId, items: ["mug", "tea"] }), 5);

function getCartCount(id, callback) {
  getUser(id, (err, user) => {
    if (err) return callback(err);
    getCart(user.id, (err, cart) => {
      if (err) return callback(err);
      callback(null, cart.items.length);
    });
  });
}`,
      hints: ["Call `getCart` inside the `getUser` callback.", "Check `err` at both levels."],
      explanation: "Two dependent steps means one level of nesting. Each level forwards its error and stops.",
    },
    {
      id: "async-callback-nesting-ex-4",
      type: "code",
      difficulty: "intermediate",
      prompt: "Write `runInSequence(tasks, callback)`. `tasks` is an array of error-first functions `task(cb)`. Run them one after another (not nested by hand!), collect their results in order, and call `callback(null, results)`. Stop at the first error and call `callback(err)`.",
      starter: `function runInSequence(tasks, callback) {
  // your code here
}
`,
      tests: [
        {
          name: "collects results in order",
          code: `const t = (v, ms) => (cb) => setTimeout(() => cb(null, v), ms);
const [err, results] = await new Promise((r) => runInSequence([t("a", 20), t("b", 5), t("c", 10)], (e, res) => r([e, res])));
assert.equal(err, null);
assert.deepEqual(results, ["a", "b", "c"]);`,
        },
        {
          name: "runs one at a time",
          code: `const log = [];
const t = (v) => (cb) => { log.push("start " + v); setTimeout(() => { log.push("end " + v); cb(null, v); }, 5); };
await new Promise((r) => runInSequence([t(1), t(2)], r));
assert.deepEqual(log, ["start 1", "end 1", "start 2", "end 2"]);`,
        },
        {
          name: "stops at first error",
          code: `let ranThird = false;
const ok = (cb) => setTimeout(() => cb(null, 1), 5);
const bad = (cb) => setTimeout(() => cb(new Error("step 2 failed")), 5);
const third = (cb) => { ranThird = true; cb(null, 3); };
const [err] = await new Promise((r) => runInSequence([ok, bad, third], (e, res) => r([e, res])));
assert.equal(err.message, "step 2 failed");
assert.equal(ranThird, false);`,
        },
        {
          name: "empty list",
          code: `const [err, results] = await new Promise((r) => runInSequence([], (e, res) => r([e, res])));
assert.deepEqual(results, []);`,
        },
      ],
      solution: `function runInSequence(tasks, callback) {
  const results = [];
  function next(index) {
    if (index === tasks.length) return callback(null, results);
    tasks[index]((err, value) => {
      if (err) return callback(err);
      results.push(value);
      next(index + 1);
    });
  }
  next(0);
}`,
      hints: ["Write an inner `next(index)` function that runs `tasks[index]`.", "In the task's callback, store the result and call `next(index + 1)`.", "When `index === tasks.length`, you are done."],
      explanation: "A recursive `next` function turns an arbitrary-length chain into flat code: each completed task triggers the next one. This is essentially what promise chains and `for...of` with `await` do for you.",
    },
    {
      id: "async-callback-nesting-ex-5",
      type: "find-bug",
      difficulty: "intermediate",
      debugging: true,
      prompt: "`loadDashboard` should report errors through `done`, but when `getOrders` fails it crashes with a `TypeError` instead. Fix it.",
      code: `const getUser = (id, cb) => setTimeout(() => cb(null, { id, name: "Ada" }), 5);
const getOrders = (user, cb) => setTimeout(() => cb(user.id === 2 ? new Error("Orders unavailable") : null, [{ total: 10 }]), 5);

function loadDashboard(id, done) {
  getUser(id, (err, user) => {
    if (err) return done(err);
    getOrders(user, (err, orders) => {
      done(null, { name: user.name, orderCount: orders.length });
    });
  });
}
`,
      tests: [
        {
          name: "success",
          code: `const [err, data] = await new Promise((r) => loadDashboard(1, (e, d) => r([e, d])));
assert.deepEqual(data, { name: "Ada", orderCount: 1 });`,
        },
        {
          name: "forwards the orders error",
          code: `const [err, data] = await new Promise((r) => loadDashboard(2, (e, d) => r([e, d])));
assert.equal(err && err.message, "Orders unavailable");
assert.equal(data, undefined);`,
        },
      ],
      solution: `const getUser = (id, cb) => setTimeout(() => cb(null, { id, name: "Ada" }), 5);
const getOrders = (user, cb) => setTimeout(() => cb(user.id === 2 ? new Error("Orders unavailable") : null, [{ total: 10 }]), 5);

function loadDashboard(id, done) {
  getUser(id, (err, user) => {
    if (err) return done(err);
    getOrders(user, (err, orders) => {
      if (err) return done(err);
      done(null, { name: user.name, orderCount: orders.length });
    });
  });
}`,
      hints: ["Which level is missing an error check?"],
      explanation: "The inner callback ignored `err`. Each level of a callback chain needs `if (err) return done(err);`.",
    },
  ],
  quiz: [
    {
      id: "async-callback-nesting-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What is \"callback hell\"?",
      options: [
        { id: "a", text: "A runtime error thrown by callbacks", explanation: "It is a code-structure problem, not an error type." },
        { id: "b", text: "Deeply nested callbacks that are hard to read and maintain", explanation: "Correct." },
        { id: "c", text: "Calling a callback synchronously", explanation: "That is a separate concern." },
      ],
      answer: "b",
      hints: ["Think about the shape of the code."],
      explanation: "Callback hell describes many levels of nested callbacks with repeated error handling.",
    },
    {
      id: "async-callback-nesting-q2",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "Why can't a `try/catch` around `setTimeout(() => { throw err }, 10)` catch the error?",
      options: [
        { id: "a", text: "`try/catch` only works with promises", explanation: "`try/catch` works with any synchronous code." },
        {
          id: "b",
          text: "The callback runs later, after the `try` block has already finished",
          explanation: "Correct — the throwing code is not inside the `try` at the moment it runs.",
        },
        { id: "c", text: "Errors inside timers are ignored", explanation: "They are reported as uncaught errors." },
      ],
      answer: "b",
      hints: ["When does the callback run relative to the `try` block?"],
      explanation: "The `try` block only covers code executing while it is active. The callback runs on a later turn of the event loop.",
    },
    {
      id: "async-callback-nesting-q3",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Which technique flattens nested callbacks without changing the API?",
      options: [
        { id: "a", text: "Extracting each level into a named function", explanation: "Correct — handlers sit side by side instead of inside each other." },
        { id: "b", text: "Adding more indentation", explanation: "That makes it worse." },
        { id: "c", text: "Using `var` instead of `const`", explanation: "Variable keywords do not affect nesting." },
      ],
      answer: "a",
      hints: ["What can you give a name to?"],
      explanation: "Named handler functions remove the visual pyramid. Promises go further by also centralising error handling.",
    },
    {
      id: "async-callback-nesting-q4",
      type: "order",
      difficulty: "beginner",
      prompt: "Put these dependent checkout steps in the order they must run.",
      steps: ["Load the user", "Load the user's cart", "Calculate shipping for the cart", "Render the checkout page"],
      hints: ["Each step needs the previous result."],
      explanation: "Each step depends on the previous one's result, which is why callback code nests in exactly this order.",
    },
  ],
  challenge: {
    id: "async-callback-nesting-challenge",
    type: "code",
    difficulty: "intermediate",
    prompt:
      "Write `getShippingQuote(userId, api, callback)`. `api` has error-first methods `getUser(id, cb)`, `getCart(userId, cb)` and `getShipping(country, subtotal, cb)`. Load the user, then their cart, then shipping for `user.country` and `cart.subtotal`. Call `callback(null, { subtotal, shipping, total })` or forward the first error.",
    starter: `function getShippingQuote(userId, api, callback) {
  // your code here
}
`,
    tests: [
      {
        name: "computes a quote",
        code: `const api = {
  getUser: (id, cb) => setTimeout(() => cb(null, { id, country: "US" }), 5),
  getCart: (id, cb) => setTimeout(() => cb(null, { subtotal: 30 }), 5),
  getShipping: (country, subtotal, cb) => setTimeout(() => cb(null, country === "US" && subtotal < 50 ? 7 : 0), 5),
};
const [err, quote] = await new Promise((r) => getShippingQuote(1, api, (e, q) => r([e, q])));
assert.equal(err, null);
assert.deepEqual(quote, { subtotal: 30, shipping: 7, total: 37 });`,
      },
      {
        name: "forwards cart errors and skips shipping",
        code: `let shippingCalled = false;
const api = {
  getUser: (id, cb) => setTimeout(() => cb(null, { id, country: "US" }), 5),
  getCart: (id, cb) => setTimeout(() => cb(new Error("Cart down")), 5),
  getShipping: (c, s, cb) => { shippingCalled = true; cb(null, 0); },
};
const [err] = await new Promise((r) => getShippingQuote(1, api, (e, q) => r([e, q])));
assert.equal(err.message, "Cart down");
assert.equal(shippingCalled, false);`,
      },
    ],
    solution: `function getShippingQuote(userId, api, callback) {
  api.getUser(userId, (err, user) => {
    if (err) return callback(err);
    api.getCart(user.id, (err, cart) => {
      if (err) return callback(err);
      api.getShipping(user.country, cart.subtotal, (err, shipping) => {
        if (err) return callback(err);
        callback(null, { subtotal: cart.subtotal, shipping, total: cart.subtotal + shipping });
      });
    });
  });
}`,
    hints: ["Three dependent steps → two levels of nesting inside the first callback.", "The innermost callback still has access to `user` and `cart` via closures."],
    explanation:
      "Closures let the innermost callback use `user` and `cart` from outer levels. Notice the three identical error checks — the repetition promises eliminate.",
  },
  keyPoints: [
    "Dependent asynchronous steps with callbacks must nest, because each result only exists inside its callback.",
    "Deep nesting (callback hell) hurts readability and forces repeated error checks at every level.",
    "`try/catch` around an async call cannot catch errors thrown later in its callback.",
    "Named functions flatten the pyramid; promises and `async`/`await` solve the deeper problems.",
  ],
  related: ["async-callbacks", "async-promises", "async-async-await", "functions-closures"],
  references: [
    { title: "MDN: Introducing asynchronous JavaScript — callbacks", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing" },
    { title: "Node.js: util.promisify", url: "https://nodejs.org/api/util.html#utilpromisifyoriginal" },
  ],
};

import type { Lesson } from "@/content/types";

export const map: Lesson = {
  id: "arrays-map",
  slug: "map",
  title: "map",
  summary: "Transform every element of an array into a new value and get a brand-new array back.",
  difficulty: "beginner",
  minutes: 20,
  tech: ["javascript"],
  tags: ["arrays", "array methods", "map", "transformation", "immutability"],
  objectives: [
    "Use `map` to transform every element of an array into a new array.",
    "Explain why `map` never changes the original array.",
    "Use the `index` argument of the callback when position matters.",
    "Recognise when `map` is the wrong tool (filtering, side effects, single result).",
  ],
  prerequisites: ["functions-arrow-functions", "functions-callbacks", "arrays-creation-indexing"],
  intro: [
    {
      kind: "paragraph",
      text: "Almost every application transforms lists of data: prices need formatting, API results need reshaping, product names need to become HTML. `map` is the array method built for exactly this job: *take a list, produce a new list of the same length where each item has been transformed*.",
    },
    {
      kind: "paragraph",
      text: "Once you understand `map`, you will see it everywhere — in React components that render lists, in test helpers that build test data, and in code that prepares API responses for display.",
    },
  ],
  terms: [
    { term: "Callback", definition: "A function passed to another function, which that function calls for you. `map` calls your callback once per element." },
    { term: "Transformation", definition: "Turning one value into another, such as a number into a formatted price string." },
    { term: "Immutability", definition: "Not changing existing data. `map` returns a new array and leaves the original untouched." },
  ],
  sections: [
    {
      id: "explanation",
      title: "How map works",
      blocks: [
        {
          kind: "paragraph",
          text: "`map` walks through the array from the first element to the last. For each element it calls your callback and stores whatever the callback **returns** at the same position in a new array. When it finishes, it returns that new array.",
        },
        {
          kind: "diagram",
          title: "map([1, 2, 3], n => n * 2)",
          variant: "flow",
          steps: [
            { label: "1 → callback → 2", detail: "result[0] = 2" },
            { label: "2 → callback → 4", detail: "result[1] = 4" },
            { label: "3 → callback → 6", detail: "result[2] = 6" },
            { label: "return [2, 4, 6]", detail: "original [1, 2, 3] is unchanged" },
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Same length, every time",
          text: "The array returned by `map` always has the same length as the original. If you need fewer items, you want `filter`. If you need one value (like a total), you want `reduce`.",
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax",
      blocks: [
        {
          kind: "code",
          language: "js",
          code: "const newArray = array.map((element, index, array) => {\n  return transformedValue;\n});",
        },
        {
          kind: "list",
          items: [
            "`element` — the current item (you almost always use this).",
            "`index` — the position of the current item, starting at 0 (optional).",
            "`array` — the original array being mapped (rarely needed).",
            "The return value of the callback becomes the item in the new array.",
          ],
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "Doubling numbers" },
        {
          kind: "code",
          language: "js",
          code: "const numbers = [1, 2, 3, 4];\nconst doubled = numbers.map((n) => n * 2);\n\nconsole.log(doubled);\nconsole.log(numbers);",
          output: "[ 2, 4, 6, 8 ]\n[ 1, 2, 3, 4 ]",
          runnable: true,
        },
        { kind: "heading", text: "Formatting prices for display" },
        {
          kind: "code",
          language: "js",
          code: "const prices = [19.5, 5, 120];\nconst labels = prices.map((price) => `$${price.toFixed(2)}`);\n\nconsole.log(labels);",
          output: "[ '$19.50', '$5.00', '$120.00' ]",
          runnable: true,
        },
        { kind: "heading", text: "Picking one property from objects" },
        {
          kind: "code",
          language: "js",
          code: "const products = [\n  { id: 1, name: \"Desk Lamp\", price: 35 },\n  { id: 2, name: \"Office Chair\", price: 180 },\n];\n\nconst names = products.map((product) => product.name);\nconsole.log(names);",
          output: "[ 'Desk Lamp', 'Office Chair' ]",
          runnable: true,
        },
        { kind: "heading", text: "Using the index" },
        {
          kind: "code",
          language: "js",
          code: "const steps = [\"Add to cart\", \"Enter address\", \"Pay\"];\nconst numbered = steps.map((step, index) => `${index + 1}. ${step}`);\n\nconsole.log(numbered);",
          output: "[ '1. Add to cart', '2. Enter address', '3. Pay' ]",
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
          code: "const cart = [\n  { name: \"Mug\", price: 12, qty: 2 },\n  { name: \"Tea\", price: 8, qty: 3 },\n];\n\nconst lineTotals = cart.map((item) => ({\n  name: item.name,\n  total: item.price * item.qty,\n}));\n\nconsole.log(lineTotals);",
          output: "[ { name: 'Mug', total: 24 }, { name: 'Tea', total: 24 } ]",
          runnable: true,
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "`cart` is an array of two objects, each describing a line in a shopping cart.",
            "`cart.map(...)` calls the arrow function once for the Mug and once for the Tea.",
            "The arrow function returns a **new object** — the parentheses around `{ ... }` tell JavaScript this is an object literal, not a function body.",
            "Each new object keeps the `name` and adds a computed `total`.",
            "`lineTotals` is a new array of two objects; `cart` itself is unchanged.",
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
            "**React:** `products.map((p) => <ProductCard key={p.id} product={p} />)` renders one component per item.",
            "**API responses:** reshape server data (`snake_case` fields, nested objects) into the shape your UI expects.",
            "**Test automation:** build test data, e.g. `skus.map((sku) => ({ sku, qty: 1 }))`, or read text from a list of elements and compare it with expected values.",
          ],
        },
        {
          kind: "table",
          caption: "Choosing the right array method",
          headers: ["Goal", "Method", "Returns"],
          rows: [
            ["Transform every item", "`map`", "New array, same length"],
            ["Keep only some items", "`filter`", "New array, same or shorter"],
            ["Combine items into one value", "`reduce`", "Any single value"],
            ["Get the first matching item", "`find`", "The item or `undefined`"],
            ["Run a side effect for each item", "`forEach`", "`undefined`"],
          ],
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Forgetting to return a value",
      wrong: "const doubled = [1, 2].map((n) => {\n  n * 2;\n});\n// [ undefined, undefined ]",
      right: "const doubled = [1, 2].map((n) => {\n  return n * 2;\n});\n// or: [1, 2].map((n) => n * 2)",
      explanation: "With curly braces, an arrow function needs an explicit `return`. Without it, the callback returns `undefined` for every item.",
    },
    {
      title: "Returning an object without parentheses",
      wrong: "users.map((u) => { name: u.name });",
      right: "users.map((u) => ({ name: u.name }));",
      explanation: "`{` right after `=>` starts a function body, not an object. Wrap object literals in parentheses.",
    },
    {
      title: "Using map only for side effects",
      wrong: "items.map((item) => console.log(item));",
      right: "items.forEach((item) => console.log(item));",
      explanation: "If you ignore the returned array, `forEach` communicates your intent better and avoids creating an array you never use.",
    },
    {
      title: "Mutating objects inside map",
      wrong: "const updated = products.map((p) => {\n  p.price = p.price * 0.9;\n  return p;\n});",
      right: "const updated = products.map((p) => ({ ...p, price: p.price * 0.9 }));",
      explanation: "The new array still contains the *same* objects if you modify them in place, so the original data changes too. Return a copy instead.",
    },
  ],
  debugging: [
    "Seeing `undefined` in the result? Check that every path through your callback **returns** a value.",
    "Log inside the callback: `arr.map((x, i) => { console.log(i, x); return x * 2; })` to see each step.",
    "If the original array changed unexpectedly, look for assignments like `item.prop = ...` inside the callback.",
    "`TypeError: x.map is not a function` means the value is not an array — log `Array.isArray(x)` and check where the data came from (often an API returning an object or `null`).",
  ],
  examples: [
    {
      id: "arrays-map-example-prices",
      title: "Format prices",
      code: "const prices = [19.5, 5, 120];\n\nconst labels = prices.map((price) => `$${price.toFixed(2)}`);\n\nconsole.log(labels);\nconsole.log(prices); // unchanged",
    },
    {
      id: "arrays-map-example-reshape",
      title: "Reshape API data",
      code: "const apiUsers = [\n  { first_name: \"Ada\", last_name: \"Lovelace\", is_admin: true },\n  { first_name: \"Alan\", last_name: \"Turing\", is_admin: false },\n];\n\nconst users = apiUsers.map((u) => ({\n  fullName: `${u.first_name} ${u.last_name}`,\n  role: u.is_admin ? \"admin\" : \"member\",\n}));\n\nconsole.log(users);",
    },
    {
      id: "arrays-map-example-index",
      title: "Use the index",
      code: "const steps = [\"Add to cart\", \"Enter address\", \"Pay\"];\n\nconst numbered = steps.map((step, index) => `${index + 1}. ${step}`);\n\nnumbered.forEach((line) => console.log(line));",
    },
  ],
  exercises: [
    {
      id: "arrays-map-ex-1",
      type: "code",
      difficulty: "beginner",
      prompt: "Write a function `squareAll(numbers)` that returns a new array with every number squared.",
      instructions: "Use `map`. Do not modify the input array.",
      starter: "function squareAll(numbers) {\n  // your code here\n}\n\nconsole.log(squareAll([1, 2, 3]));",
      tests: [
        { name: "squares [1, 2, 3]", code: "assert.deepEqual(squareAll([1, 2, 3]), [1, 4, 9]);" },
        { name: "handles an empty array", code: "assert.deepEqual(squareAll([]), []);" },
        {
          name: "does not modify the input",
          code: "const input = [4, 5];\nsquareAll(input);\nassert.deepEqual(input, [4, 5]);",
        },
      ],
      solution: "function squareAll(numbers) {\n  return numbers.map((n) => n * n);\n}",
      hints: ["`map` takes a function that receives each number.", "Return `n * n` from the callback, and return the result of `map` from the function."],
      explanation: "`numbers.map((n) => n * n)` calls the arrow function for each number and collects the results in a new array, leaving `numbers` unchanged.",
    },
    {
      id: "arrays-map-ex-2",
      type: "predict-output",
      difficulty: "beginner",
      prompt: "What does this code print?",
      code: "const words = [\"cart\", \"checkout\"];\nconst upper = words.map((w) => w.toUpperCase());\nconsole.log(upper);\nconsole.log(words.length);",
      answer: "[ 'CART', 'CHECKOUT' ]\n2",
      hints: ["`map` returns a new array.", "The original array keeps its contents and length."],
      explanation: "`upper` is a new array with uppercase strings. `words` is unchanged, so its length is still 2.",
    },
    {
      id: "arrays-map-ex-3",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Complete the code so `names` contains each product's name.",
      template: "const names = products.___((product) => product.___);",
      blanks: [{ answers: ["map"] }, { answers: ["name", "[\"name\"]", "['name']"] }],
      hints: ["Which method transforms every element?", "Which property holds the product's name?"],
      explanation: "`products.map((product) => product.name)` returns an array of names in the same order as the products.",
    },
    {
      id: "arrays-map-ex-4",
      type: "code",
      difficulty: "intermediate",
      prompt: "Write `toCartLines(items)` that converts `{ name, price, qty }` objects into `{ name, total }` objects where `total = price * qty`, rounded to 2 decimal places.",
      instructions: "Return new objects — do not modify the originals. Use `Math.round(value * 100) / 100` to round.",
      starter: "function toCartLines(items) {\n  // your code here\n}\n",
      tests: [
        {
          name: "computes totals",
          code: "assert.deepEqual(toCartLines([{ name: \"Mug\", price: 12, qty: 2 }]), [{ name: \"Mug\", total: 24 }]);",
        },
        {
          name: "rounds to 2 decimals",
          code: "assert.deepEqual(toCartLines([{ name: \"Pen\", price: 0.1, qty: 3 }]), [{ name: \"Pen\", total: 0.3 }]);",
        },
        {
          name: "does not mutate input",
          code: "const items = [{ name: \"Tea\", price: 8, qty: 1 }];\ntoCartLines(items);\nassert.deepEqual(items, [{ name: \"Tea\", price: 8, qty: 1 }]);",
        },
      ],
      solution:
        "function toCartLines(items) {\n  return items.map((item) => ({\n    name: item.name,\n    total: Math.round(item.price * item.qty * 100) / 100,\n  }));\n}",
      hints: [
        "Return an object literal from the callback — remember the parentheses: `(item) => ({ ... })`.",
        "`0.1 * 3` is `0.30000000000000004` in JavaScript, which is why rounding is needed.",
      ],
      explanation:
        "Each callback call builds a fresh object with only `name` and `total`. Rounding with `Math.round(x * 100) / 100` removes floating-point noise such as `0.30000000000000004`.",
    },
    {
      id: "arrays-map-ex-5",
      type: "find-bug",
      difficulty: "beginner",
      debugging: true,
      prompt: "`getEmails` should return each user's email address, but it returns `[undefined, undefined]`. Find and fix the bug.",
      code: "function getEmails(users) {\n  return users.map((user) => {\n    user.email;\n  });\n}\n",
      tests: [
        {
          name: "returns emails",
          code: "assert.deepEqual(getEmails([{ email: \"a@x.com\" }, { email: \"b@x.com\" }]), [\"a@x.com\", \"b@x.com\"]);",
        },
      ],
      solution: "function getEmails(users) {\n  return users.map((user) => user.email);\n}",
      hints: ["What does an arrow function with `{ }` return if there is no `return` statement?"],
      explanation:
        "The callback uses a block body `{ ... }` without `return`, so it returns `undefined` for every user. Either add `return user.email;` or use the concise form `(user) => user.email`.",
    },
  ],
  quiz: [
    {
      id: "arrays-map-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What does `[1, 2, 3].map((n) => n + 1)` return?",
      options: [
        { id: "a", text: "`[2, 3, 4]`", explanation: "Correct — each element is increased by 1 and collected in a new array." },
        { id: "b", text: "`[1, 2, 3]`", explanation: "That is the original array; `map` returns a new, transformed array." },
        { id: "c", text: "`9`", explanation: "Combining values into one number is a job for `reduce`, not `map`." },
        { id: "d", text: "`undefined`", explanation: "`forEach` returns `undefined`; `map` returns an array." },
      ],
      answer: "a",
      hints: ["`map` returns an array of the same length."],
      explanation: "`map` applies `n + 1` to every element and returns `[2, 3, 4]`.",
    },
    {
      id: "arrays-map-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "After `const b = a.map((x) => x * 2)`, what is true about `a`?",
      options: [
        { id: "a", text: "Every number in `a` is doubled", explanation: "`map` does not modify the original array." },
        { id: "b", text: "`a` is unchanged", explanation: "Correct — `map` builds a new array and leaves `a` alone." },
        { id: "c", text: "`a` is now empty", explanation: "Nothing removes elements from `a`." },
      ],
      answer: "b",
      hints: ["Think about immutability."],
      explanation: "`map` is non-mutating: it returns a new array and leaves the original intact (as long as your callback does not mutate the items).",
    },
    {
      id: "arrays-map-q3",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "Why does `users.map((u) => { name: u.name })` produce an array of `undefined`?",
      options: [
        { id: "a", text: "`map` cannot return objects", explanation: "`map` can return any value, including objects." },
        {
          id: "b",
          text: "The braces are treated as a function body, so nothing is returned",
          explanation: "Correct — wrap the object in parentheses: `(u) => ({ name: u.name })`.",
        },
        { id: "c", text: "`u.name` is always undefined", explanation: "The property may well exist; the problem is the syntax." },
      ],
      answer: "b",
      hints: ["How does JavaScript interpret `{` right after `=>`?"],
      explanation: "After `=>`, `{` starts a block. `name:` becomes a label and nothing is returned. Parentheses make it an object literal.",
    },
    {
      id: "arrays-map-q4",
      type: "true-false",
      difficulty: "beginner",
      prompt: "`map` can return an array with fewer elements than the original.",
      answer: false,
      hints: ["Compare with `filter`."],
      explanation: "`map` always returns an array of the same length. Use `filter` to remove elements.",
    },
  ],
  challenge: {
    id: "arrays-map-challenge",
    type: "code",
    difficulty: "intermediate",
    prompt:
      "A product API returns `{ id, title, price_cents, in_stock }`. Write `toProductCards(apiProducts)` that returns `{ id, title, price, badge }` where `price` is a string like `\"$12.50\"` and `badge` is `\"In stock\"` or `\"Sold out\"`.",
    starter: "function toProductCards(apiProducts) {\n  // your code here\n}\n",
    tests: [
      {
        name: "maps one product",
        code: "assert.deepEqual(toProductCards([{ id: 7, title: \"Lamp\", price_cents: 1250, in_stock: true }]), [{ id: 7, title: \"Lamp\", price: \"$12.50\", badge: \"In stock\" }]);",
      },
      {
        name: "sold out badge",
        code: "assert.equal(toProductCards([{ id: 1, title: \"Chair\", price_cents: 9900, in_stock: false }])[0].badge, \"Sold out\");",
      },
      { name: "empty list", code: "assert.deepEqual(toProductCards([]), []);" },
    ],
    solution:
      "function toProductCards(apiProducts) {\n  return apiProducts.map((p) => ({\n    id: p.id,\n    title: p.title,\n    price: `$${(p.price_cents / 100).toFixed(2)}`,\n    badge: p.in_stock ? \"In stock\" : \"Sold out\",\n  }));\n}",
    hints: ["Divide cents by 100, then use `toFixed(2)`.", "Use a ternary for the badge."],
    explanation:
      "This is the classic \"adapt API data for the UI\" use of `map`: one input object becomes one output object with the fields and formats the interface needs.",
  },
  keyPoints: [
    "`map` calls a callback for every element and returns a **new array of the same length**.",
    "The callback's return value becomes the new element — forgetting `return` gives `undefined`.",
    "Wrap returned object literals in parentheses: `(x) => ({ ... })`.",
    "Use `filter` to remove items, `reduce` to compute one value, `forEach` for side effects only.",
  ],
  related: ["arrays-filter", "arrays-reduce", "arrays-foreach", "arrays-chaining", "react-lists-keys"],
  references: [
    { title: "MDN: Array.prototype.map()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map" },
  ],
};

import type { Challenge } from "@/content/types";

export const fundamentalsChallenges: Challenge[] = [
  {
    id: "ch-fundamentals-format-price",
    slug: "ch-fundamentals-format-price",
    title: "Format a price from cents",
    topic: "fundamentals",
    difficulty: "beginner",
    minutes: 10,
    statement: [
      {
        kind: "paragraph",
        text: "Payment APIs store money as **integer cents** to avoid floating-point rounding errors. Write `formatPrice(cents)` that turns cents into a display string for the product page.",
      },
      {
        kind: "list",
        items: [
          "Return a dollar sign, the whole dollars, a dot and exactly two cent digits: `1250` → `\"$12.50\"`.",
          "Negative amounts (refunds) put the minus sign before the dollar sign: `-305` → `\"-$3.05\"`.",
          "If `cents` is not an integer number (for example `12.5`, `\"100\"` or `NaN`), throw a `TypeError`.",
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'formatPrice(1250);  // "$12.50"\nformatPrice(5);     // "$0.05"\nformatPrice(-305);  // "-$3.05"\nformatPrice("100"); // throws TypeError',
      },
    ],
    expectedBehavior: [
      "Always shows exactly two digits after the dot.",
      "Handles zero and amounts under one dollar.",
      "Places the minus sign before the dollar sign for refunds.",
      "Rejects non-integer input with a TypeError.",
    ],
    starter: `function formatPrice(cents) {
  // TODO: validate the input, then build the string
  return "$" + cents / 100;
}
`,
    hints: [
      "`Number.isInteger(value)` is false for strings, NaN and decimals, so it handles all the invalid cases at once.",
      "Work with the absolute value: `Math.floor(abs / 100)` gives dollars and `abs % 100` gives cents.",
      "`String(n).padStart(2, \"0\")` turns `5` into `\"05\"`.",
    ],
    validation: "js",
    tests: [
      { name: "formats whole dollars and cents", code: `assert.equal(formatPrice(1250), "$12.50");` },
      { name: "pads cents to two digits", code: `assert.equal(formatPrice(5), "$0.05");\nassert.equal(formatPrice(1000), "$10.00");` },
      { name: "formats zero", code: `assert.equal(formatPrice(0), "$0.00");` },
      { name: "formats refunds", code: `assert.equal(formatPrice(-305), "-$3.05");` },
      {
        name: "throws a TypeError for invalid input",
        code: `for (const bad of ["100", 12.5, NaN, null, undefined]) {
  let err = null;
  try { formatPrice(bad); } catch (e) { err = e; }
  assert.ok(err instanceof TypeError, "Expected TypeError for " + String(bad));
}`,
      },
    ],
    solution: `function formatPrice(cents) {
  if (!Number.isInteger(cents)) {
    throw new TypeError("cents must be an integer");
  }
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return sign + "$" + dollars + "." + rest;
}
`,
    explanation:
      "Keeping money in integer cents means all arithmetic is exact. Formatting splits the absolute value into dollars (`Math.floor(abs / 100)`) and cents (`abs % 100`), pads the cents to two digits, and adds the sign in front. `Number.isInteger` rejects strings, `NaN` and fractional cents in one check, so bad data fails loudly instead of printing `$NaN`. In production you would usually use `Intl.NumberFormat`, but knowing how to do it by hand helps you debug formatting bugs.",
    relatedLessons: ["variables-numbers", "variables-strings", "debugging-throw"],
  },
  {
    id: "ch-fundamentals-shipping-cost",
    slug: "ch-fundamentals-shipping-cost",
    title: "Calculate shipping cost",
    topic: "fundamentals",
    difficulty: "beginner",
    minutes: 10,
    statement: [
      {
        kind: "paragraph",
        text: "Write `shippingCost(subtotal, country)` for the checkout page. It returns the shipping price in dollars using these rules:",
      },
      {
        kind: "table",
        headers: ["Country", "Rule"],
        rows: [
          ["`\"US\"`", "Free when subtotal is **50 or more**, otherwise `5.99`"],
          ["`\"CA\"`", "Always `9.99`"],
          ["Anything else", "`19.99`, or free when subtotal is **200 or more**"],
        ],
      },
      {
        kind: "paragraph",
        text: "Country codes may arrive in lowercase or with spaces from a form (`\" us \"`), so normalize them. If `subtotal` is not a finite number or is negative, throw a `RangeError`.",
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'shippingCost(49.99, "US"); // 5.99\nshippingCost(50, "us");    // 0\nshippingCost(10, "CA");    // 9.99\nshippingCost(250, "DE");   // 0\nshippingCost(-1, "US");    // throws RangeError',
      },
    ],
    expectedBehavior: [
      "Applies the free-shipping threshold inclusively (50 itself is free in the US).",
      "Normalizes country codes with trim + uppercase.",
      "Throws a RangeError for negative or non-numeric subtotals.",
    ],
    starter: `function shippingCost(subtotal, country) {
  if (country === "US") {
    if (subtotal > 50) return 0;
    return 5.99;
  }
  return 19.99;
}
`,
    hints: [
      "Normalize first: `const code = String(country).trim().toUpperCase();`",
      "Use `>=` for \"50 or more\". Off-by-one comparisons are a classic checkout bug.",
      "`Number.isFinite(subtotal)` is false for strings, NaN and Infinity.",
    ],
    validation: "js",
    tests: [
      { name: "US under threshold pays 5.99", code: `assert.equal(shippingCost(49.99, "US"), 5.99);` },
      { name: "US at exactly 50 ships free", code: `assert.equal(shippingCost(50, "US"), 0);` },
      { name: "normalizes the country code", code: `assert.equal(shippingCost(60, " us "), 0);\nassert.equal(shippingCost(10, "ca"), 9.99);` },
      { name: "Canada is always 9.99", code: `assert.equal(shippingCost(500, "CA"), 9.99);` },
      { name: "international rules", code: `assert.equal(shippingCost(199.99, "DE"), 19.99);\nassert.equal(shippingCost(200, "DE"), 0);` },
      {
        name: "rejects invalid subtotals",
        code: `for (const bad of [-1, NaN, "20", Infinity]) {
  let err = null;
  try { shippingCost(bad, "US"); } catch (e) { err = e; }
  assert.ok(err instanceof RangeError, "Expected RangeError for " + String(bad));
}`,
      },
    ],
    solution: `function shippingCost(subtotal, country) {
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw new RangeError("subtotal must be a non-negative number");
  }
  const code = String(country).trim().toUpperCase();

  switch (code) {
    case "US":
      return subtotal >= 50 ? 0 : 5.99;
    case "CA":
      return 9.99;
    default:
      return subtotal >= 200 ? 0 : 19.99;
  }
}
`,
    explanation:
      "Validate first (a guard clause), then normalize, then branch. A `switch` on the normalized code reads like the business rules table, and `default` covers every other country. The two subtle bugs in the starter are the strict `>` (which charges a customer at exactly 50) and comparing the raw form value without trimming or uppercasing it.",
    relatedLessons: ["control-flow-if-else", "control-flow-switch", "operators-comparison", "debugging-throw"],
  },
  {
    id: "ch-fundamentals-normalize-username",
    slug: "ch-fundamentals-normalize-username",
    title: "Normalize a username",
    topic: "fundamentals",
    difficulty: "intermediate",
    minutes: 15,
    statement: [
      {
        kind: "paragraph",
        text: "Users type all sorts of things into the sign-up form. Write `normalizeUsername(input)` that produces a clean, URL-safe handle, or returns `null` if that isn't possible.",
      },
      {
        kind: "list",
        ordered: true,
        items: [
          "Trim surrounding whitespace and lowercase everything.",
          "Replace each run of spaces with a single `-`.",
          "Remove every character that is not `a-z`, `0-9`, `-` or `_`.",
          "Collapse repeated dashes into one and remove dashes at the start or end.",
          "Return `null` if the result is shorter than 3 or longer than 20 characters, or if `input` is not a string.",
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'normalizeUsername("  Ada Lovelace ");  // "ada-lovelace"\nnormalizeUsername("Jo!!");             // null (too short after cleanup)\nnormalizeUsername("--Mr.  Robot--");   // "mr-robot"\nnormalizeUsername(42);                 // null',
      },
    ],
    expectedBehavior: [
      "Output only contains lowercase letters, digits, `-` and `_`.",
      "No leading, trailing or doubled dashes.",
      "Length rules are applied after cleaning.",
      "Non-string input returns null instead of throwing.",
    ],
    starter: `function normalizeUsername(input) {
  return input.toLowerCase().replace(" ", "-");
}
`,
    hints: [
      "`replace` with a string only replaces the first match; use a regular expression with the `g` flag.",
      "`/ +/g` matches runs of spaces, `/[^a-z0-9_-]/g` matches every disallowed character.",
      "`/-+/g` collapses dashes and `/^-|-$/g` strips them from the ends.",
      "Check the length at the very end, after all cleaning steps.",
    ],
    validation: "js",
    tests: [
      { name: "trims, lowercases and joins words", code: `assert.equal(normalizeUsername("  Ada Lovelace "), "ada-lovelace");` },
      { name: "removes punctuation and collapses dashes", code: `assert.equal(normalizeUsername("--Mr.  Robot--"), "mr-robot");` },
      { name: "keeps digits and underscores", code: `assert.equal(normalizeUsername("Dev_Ops 2024"), "dev_ops-2024");` },
      { name: "returns null when too short", code: `assert.equal(normalizeUsername("Jo!!"), null);\nassert.equal(normalizeUsername("   "), null);` },
      { name: "returns null when too long", code: `assert.equal(normalizeUsername("a".repeat(21)), null);\nassert.equal(normalizeUsername("a".repeat(20)), "a".repeat(20));` },
      { name: "returns null for non-strings", code: `assert.equal(normalizeUsername(42), null);\nassert.equal(normalizeUsername(undefined), null);` },
    ],
    solution: `function normalizeUsername(input) {
  if (typeof input !== "string") return null;

  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/ +/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (cleaned.length < 3 || cleaned.length > 20) return null;
  return cleaned;
}
`,
    explanation:
      "Each `.replace` does one job, so the pipeline is easy to read and debug: you can log after any step. The `g` flag matters: `\"a b c\".replace(\" \", \"-\")` only changes the first space. Validating the length **after** cleaning is important, because `\"Jo!!\"` looks long enough until the punctuation is removed. Returning `null` for bad input lets the form show a friendly message instead of crashing.",
    relatedLessons: ["variables-strings", "modern-js-modern-methods", "variables-typeof"],
  },
  {
    id: "ch-fundamentals-parse-quantity",
    slug: "ch-fundamentals-parse-quantity",
    title: "Parse a quantity input safely",
    topic: "fundamentals",
    difficulty: "intermediate",
    minutes: 15,
    statement: [
      {
        kind: "paragraph",
        text: "A quantity `<input>` always gives you a **string**. Write `parseQuantity(value)` that converts it to a whole number between 1 and 99, or returns `null` when the value is not acceptable.",
      },
      {
        kind: "paragraph",
        text: "Watch out for type-conversion traps: `Number(\"\")` is `0`, `Number(\"  \")` is `0`, `Number(\"1e2\")` is `100`, `Number(\"0x10\")` is `16`, and `parseInt(\"3abc\")` is `3`. Only plain digit strings (with optional surrounding whitespace) are allowed.",
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'parseQuantity("3");    // 3\nparseQuantity(" 12 "); // 12\nparseQuantity("");     // null\nparseQuantity("2.5");  // null\nparseQuantity("1e1");  // null\nparseQuantity("100");  // null (max is 99)',
      },
    ],
    expectedBehavior: [
      "Accepts digit-only strings, ignoring surrounding whitespace.",
      "Rejects empty strings, decimals, exponent and hex notation, and trailing letters.",
      "Rejects 0 and numbers above 99.",
      "Also accepts an actual integer number in range (some callers pass numbers).",
    ],
    starter: `function parseQuantity(value) {
  const n = parseInt(value);
  if (n > 99) return null;
  return n;
}
`,
    hints: [
      "Convert to a string and trim first: `String(value).trim()`.",
      "Use a regular expression to allow only digits: `/^[0-9]+$/.test(text)`.",
      "Only after the format check, convert with `Number(text)` and check the range.",
    ],
    validation: "js",
    tests: [
      { name: "parses plain digits", code: `assert.equal(parseQuantity("3"), 3);\nassert.equal(parseQuantity(" 12 "), 12);` },
      { name: "accepts integer numbers", code: `assert.equal(parseQuantity(7), 7);` },
      { name: "rejects empty and whitespace", code: `assert.equal(parseQuantity(""), null);\nassert.equal(parseQuantity("   "), null);` },
      { name: "rejects decimals, exponents and hex", code: `assert.equal(parseQuantity("2.5"), null);\nassert.equal(parseQuantity("1e1"), null);\nassert.equal(parseQuantity("0x10"), null);` },
      { name: "rejects trailing letters", code: `assert.equal(parseQuantity("3abc"), null);` },
      { name: "enforces the 1..99 range", code: `assert.equal(parseQuantity("0"), null);\nassert.equal(parseQuantity("99"), 99);\nassert.equal(parseQuantity("100"), null);\nassert.equal(parseQuantity("-2"), null);` },
      { name: "rejects null and undefined", code: `assert.equal(parseQuantity(null), null);\nassert.equal(parseQuantity(undefined), null);` },
    ],
    solution: `function parseQuantity(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!/^[0-9]+$/.test(text)) return null;

  const n = Number(text);
  if (n < 1 || n > 99) return null;
  return n;
}
`,
    explanation:
      "`Number()` and `parseInt()` are both too forgiving for user input: one turns blank strings into `0` and understands exponent/hex notation, the other silently ignores trailing garbage. Validating the **format** first with a strict regular expression, then converting, then checking the **range**, keeps each concern separate and handles every edge case. `null` and `undefined` are rejected explicitly because `String(null)` would be the text `\"null\"`.",
    relatedLessons: ["variables-type-conversion", "variables-type-coercion", "variables-numbers", "operators-truthy-falsy"],
  },
  {
    id: "ch-fundamentals-order-status-label",
    slug: "ch-fundamentals-order-status-label",
    title: "Order status badge",
    topic: "fundamentals",
    difficulty: "advanced",
    minutes: 20,
    statement: [
      {
        kind: "paragraph",
        text: "The order history page shows a badge for each order. Write `statusBadge(order)` that returns `{ label, tone }` based on the order object. Some fields may be missing because older orders were stored before they existed.",
      },
      {
        kind: "table",
        headers: ["Condition (check in this order)", "label", "tone"],
        rows: [
          ["`order.cancelledAt` is set", "`\"Cancelled\"`", "`\"neutral\"`"],
          ["`order.refund?.amount` is greater than 0", "`\"Refunded\"`", "`\"info\"`"],
          ["`order.status` is `\"delivered\"`", "`\"Delivered\"`", "`\"success\"`"],
          ["`order.status` is `\"shipped\"`", "`\"Shipped (N days)\"` where N is `order.etaDays ?? 5`", "`\"info\"`"],
          ["`order.payment?.status` is `\"failed\"`", "`\"Payment failed\"`", "`\"danger\"`"],
          ["anything else", "`\"Processing\"`", "`\"neutral\"`"],
        ],
      },
      {
        kind: "paragraph",
        text: "Note `etaDays` can legitimately be `0` (arrives today), so `||` would be a bug. `order` itself may be `null` or `undefined`: return the \"Processing\" badge.",
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'statusBadge({ status: "shipped", etaDays: 0 });\n// { label: "Shipped (0 days)", tone: "info" }\nstatusBadge({ status: "paid", refund: { amount: 15 } });\n// { label: "Refunded", tone: "info" }\nstatusBadge(null);\n// { label: "Processing", tone: "neutral" }',
      },
    ],
    expectedBehavior: [
      "Checks conditions in the documented priority order.",
      "Uses optional chaining for nested fields that may be missing.",
      "Uses nullish coalescing so an ETA of 0 is preserved.",
      "Never throws for missing or null data.",
    ],
    starter: `function statusBadge(order) {
  if (order.cancelledAt) return { label: "Cancelled", tone: "neutral" };
  if (order.refund.amount > 0) return { label: "Refunded", tone: "info" };
  if (order.status === "shipped") {
    return { label: "Shipped (" + (order.etaDays || 5) + " days)", tone: "info" };
  }
  return { label: "Processing", tone: "neutral" };
}
`,
    hints: [
      "`order?.refund?.amount` returns `undefined` instead of throwing when any link is missing.",
      "`undefined > 0` is `false`, which is exactly what you want here.",
      "`0 || 5` is `5` but `0 ?? 5` is `0`.",
      "Early returns keep the priority order obvious.",
    ],
    validation: "js",
    tests: [
      { name: "cancelled wins over everything", code: `assert.deepEqual(statusBadge({ cancelledAt: "2024-05-01", status: "delivered", refund: { amount: 10 } }), { label: "Cancelled", tone: "neutral" });` },
      { name: "refunded", code: `assert.deepEqual(statusBadge({ status: "delivered", refund: { amount: 15 } }), { label: "Refunded", tone: "info" });` },
      { name: "zero refund is ignored", code: `assert.deepEqual(statusBadge({ status: "delivered", refund: { amount: 0 } }), { label: "Delivered", tone: "success" });` },
      { name: "shipped keeps an ETA of 0", code: `assert.deepEqual(statusBadge({ status: "shipped", etaDays: 0 }), { label: "Shipped (0 days)", tone: "info" });` },
      { name: "shipped defaults ETA to 5", code: `assert.deepEqual(statusBadge({ status: "shipped" }), { label: "Shipped (5 days)", tone: "info" });` },
      { name: "payment failed", code: `assert.deepEqual(statusBadge({ status: "pending", payment: { status: "failed" } }), { label: "Payment failed", tone: "danger" });` },
      { name: "missing nested data falls back to Processing", code: `assert.deepEqual(statusBadge({ status: "pending" }), { label: "Processing", tone: "neutral" });\nassert.deepEqual(statusBadge(null), { label: "Processing", tone: "neutral" });\nassert.deepEqual(statusBadge(undefined), { label: "Processing", tone: "neutral" });` },
    ],
    solution: `function statusBadge(order) {
  if (order?.cancelledAt) return { label: "Cancelled", tone: "neutral" };
  if (order?.refund?.amount > 0) return { label: "Refunded", tone: "info" };
  if (order?.status === "delivered") return { label: "Delivered", tone: "success" };
  if (order?.status === "shipped") {
    const eta = order.etaDays ?? 5;
    return { label: "Shipped (" + eta + " days)", tone: "info" };
  }
  if (order?.payment?.status === "failed") return { label: "Payment failed", tone: "danger" };
  return { label: "Processing", tone: "neutral" };
}
`,
    explanation:
      "Real data is messy: older records miss fields, and `null` sneaks in from APIs. Optional chaining (`?.`) stops at the first `null`/`undefined` and yields `undefined`, which compares as `false`, so each check degrades gracefully. Nullish coalescing (`??`) only falls back for `null`/`undefined`, keeping a legitimate `0`. Ordered early returns encode the priority table directly, which makes the logic easy to review against the spec.",
    relatedLessons: ["operators-optional-chaining", "operators-nullish-coalescing", "operators-short-circuit", "control-flow-if-else"],
  },
];

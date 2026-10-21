import type { Challenge } from "@/content/types";

export const objectsChallenges: Challenge[] = [
  {
    id: "ch-objects-sanitize-user",
    slug: "ch-objects-sanitize-user",
    title: "Remove sensitive fields from a user",
    topic: "objects",
    difficulty: "beginner",
    minutes: 10,
    statement: [
      {
        kind: "paragraph",
        text: "Before sending a user record to the browser, the API must strip secrets. Write `toPublicUser(user)` that returns a **new** object without `password`, `token` and `ssn`, and adds a `displayName` built from `firstName` and `lastName`.",
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'toPublicUser({\n  id: 7, firstName: "Ada", lastName: "Lovelace",\n  email: "ada@example.com", password: "hunter2", token: "test_token_123",\n});\n// { id: 7, firstName: "Ada", lastName: "Lovelace",\n//   email: "ada@example.com", displayName: "Ada Lovelace" }',
      },
      {
        kind: "paragraph",
        text: "If `lastName` is missing, `displayName` is just the first name (no trailing space). The original object must not change.",
      },
    ],
    expectedBehavior: [
      "Removes `password`, `token` and `ssn` if present.",
      "Keeps every other property.",
      "Adds a trimmed `displayName`.",
      "Does not mutate the input object.",
    ],
    starter: `function toPublicUser(user) {
  delete user.password;
  user.displayName = user.firstName + " " + user.lastName;
  return user;
}
`,
    hints: [
      "Rest destructuring collects \"everything else\": `const { password, token, ssn, ...rest } = user;`",
      "Build the name from the parts that exist: `[first, last].filter(Boolean).join(\" \")`.",
      "`delete` mutates the original object, which is exactly what we want to avoid.",
    ],
    validation: "js",
    tests: [
      {
        name: "removes secrets and adds displayName",
        code: `const result = toPublicUser({ id: 7, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", password: "hunter2", token: "test_token_123" });
assert.deepEqual(result, { id: 7, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", displayName: "Ada Lovelace" });`,
      },
      {
        name: "removes ssn too",
        code: `const result = toPublicUser({ id: 1, firstName: "Alan", lastName: "Turing", ssn: "000-00-0000" });
assert.equal("ssn" in result, false);`,
      },
      {
        name: "handles a missing last name",
        code: `assert.equal(toPublicUser({ id: 2, firstName: "Grace" }).displayName, "Grace");`,
      },
      {
        name: "does not mutate the original",
        code: `const user = { id: 3, firstName: "Linus", lastName: "T", password: "secret" };
toPublicUser(user);
assert.deepEqual(user, { id: 3, firstName: "Linus", lastName: "T", password: "secret" });`,
      },
    ],
    solution: `function toPublicUser(user) {
  const { password, token, ssn, ...rest } = user;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return { ...rest, displayName };
}
`,
    explanation:
      "Object rest destructuring picks out the fields you want to drop and gathers the remaining properties into a brand-new object, so the caller's data is never mutated. `delete` would modify the original, which can leak into caches or other parts of the app. Building the display name from a filtered array avoids `\"Grace undefined\"` and stray spaces. (Linters may warn that `password`, `token` and `ssn` are unused; that is expected for this pattern.)",
    relatedLessons: ["objects-destructuring", "objects-spread", "objects-references", "networking-authentication"],
  },
  {
    id: "ch-objects-validate-address",
    slug: "ch-objects-validate-address",
    title: "Validate a shipping address",
    topic: "objects",
    difficulty: "intermediate",
    minutes: 20,
    statement: [
      {
        kind: "paragraph",
        text: "Write `validateAddress(address)` for the checkout form. Return an object mapping **field names to error messages**. An empty object means the address is valid.",
      },
      {
        kind: "table",
        headers: ["Field", "Rule", "Message"],
        rows: [
          ["`name`", "required (after trimming)", "`\"Name is required\"`"],
          ["`line1`", "required (after trimming)", "`\"Street address is required\"`"],
          ["`city`", "required (after trimming)", "`\"City is required\"`"],
          ["`country`", "must be `\"US\"` or `\"CA\"`", "`\"Unsupported country\"`"],
          ["`postalCode`", "US: exactly 5 digits. CA: letter-digit-letter, optional space, digit-letter-digit (case-insensitive)", "`\"Invalid postal code\"`"],
        ],
      },
      {
        kind: "paragraph",
        text: "Only check `postalCode` when the country is supported. Missing fields count as empty. `line2` is optional and never produces an error.",
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'validateAddress({ name: "Ada", line1: "1 Main St", city: "Austin", country: "US", postalCode: "7870" });\n// { postalCode: "Invalid postal code" }\nvalidateAddress({ name: " ", line1: "9 Rue", city: "Toronto", country: "CA", postalCode: "m5v 2t6" });\n// { name: "Name is required" }',
      },
    ],
    expectedBehavior: [
      "Returns `{}` for a valid address.",
      "Reports every invalid field at once (not just the first).",
      "Treats whitespace-only values as missing.",
      "Validates postal codes per country.",
    ],
    starter: `function validateAddress(address) {
  const errors = {};
  if (!address.name) errors.name = "Name is required";
  if (address.postalCode.length !== 5) errors.postalCode = "Invalid postal code";
  return errors;
}
`,
    hints: [
      "A small helper avoids repetition: `const blank = (v) => !String(v ?? \"\").trim();`",
      "US ZIP: `/^[0-9]{5}$/`. Canadian: `/^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/i`.",
      "Store the regexes in an object keyed by country, then look up `patterns[country]`.",
    ],
    validation: "js",
    tests: [
      {
        name: "valid US address",
        code: `assert.deepEqual(validateAddress({ name: "Ada", line1: "1 Main St", city: "Austin", country: "US", postalCode: "78701" }), {});`,
      },
      {
        name: "valid Canadian address, lowercase without space",
        code: `assert.deepEqual(validateAddress({ name: "Ada", line1: "9 Rue", city: "Toronto", country: "CA", postalCode: "m5v2t6" }), {});
assert.deepEqual(validateAddress({ name: "Ada", line1: "9 Rue", city: "Toronto", country: "CA", postalCode: "M5V 2T6" }), {});`,
      },
      {
        name: "invalid ZIP codes",
        code: `const base = { name: "Ada", line1: "1 Main St", city: "Austin", country: "US" };
for (const zip of ["7870", "787011", "7870a", ""]) {
  assert.deepEqual(validateAddress({ ...base, postalCode: zip }), { postalCode: "Invalid postal code" }, "ZIP " + zip);
}`,
      },
      {
        name: "reports all missing fields",
        code: `assert.deepEqual(validateAddress({ name: "  ", country: "US", postalCode: "12345" }), {
  name: "Name is required",
  line1: "Street address is required",
  city: "City is required",
});`,
      },
      {
        name: "unsupported country skips postal check",
        code: `assert.deepEqual(validateAddress({ name: "Ada", line1: "1 St", city: "Paris", country: "FR", postalCode: "75001" }), { country: "Unsupported country" });`,
      },
      {
        name: "empty object reports everything without crashing",
        code: `const errors = validateAddress({});
assert.deepEqual(Object.keys(errors).sort(), ["city", "country", "line1", "name"]);`,
      },
    ],
    solution: `const POSTAL_PATTERNS = {
  US: /^[0-9]{5}$/,
  CA: /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/i,
};

const REQUIRED = {
  name: "Name is required",
  line1: "Street address is required",
  city: "City is required",
};

function validateAddress(address) {
  const errors = {};
  const blank = (value) => !String(value ?? "").trim();

  for (const [field, message] of Object.entries(REQUIRED)) {
    if (blank(address[field])) errors[field] = message;
  }

  const pattern = POSTAL_PATTERNS[address.country];
  if (!pattern) {
    errors.country = "Unsupported country";
  } else if (!pattern.test(String(address.postalCode ?? "").trim())) {
    errors.postalCode = "Invalid postal code";
  }

  return errors;
}
`,
    explanation:
      "Returning an **errors object** keyed by field name is the shape most form libraries use: the UI can show each message next to its input, and `Object.keys(errors).length === 0` means valid. Driving the required checks from a config object (`REQUIRED`) and the postal rules from a lookup table (`POSTAL_PATTERNS`) means adding a field or a country is a one-line change. `value ?? \"\"` guards against missing properties before calling `.trim()`.",
    relatedLessons: ["objects-keys-values-entries", "objects-dot-bracket", "dom-forms-validation", "objects-object-literals"],
  },
  {
    id: "ch-objects-inventory-index",
    slug: "ch-objects-inventory-index",
    title: "Build an inventory index",
    topic: "objects",
    difficulty: "intermediate",
    minutes: 15,
    statement: [
      {
        kind: "paragraph",
        text: "Several warehouses report stock as separate rows. Write `buildInventory(rows)` that returns an object keyed by `sku` with the combined stock and the list of warehouses that hold it.",
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'buildInventory([\n  { sku: "MUG-01", warehouse: "east", qty: 4 },\n  { sku: "TEE-02", warehouse: "east", qty: 0 },\n  { sku: "MUG-01", warehouse: "west", qty: 6 },\n]);\n// {\n//   "MUG-01": { qty: 10, warehouses: ["east", "west"], inStock: true },\n//   "TEE-02": { qty: 0, warehouses: [], inStock: false },\n// }',
      },
      {
        kind: "list",
        items: [
          "`warehouses` lists each warehouse **once**, in first-seen order, and only if it reported `qty > 0` for that SKU.",
          "`inStock` is `qty > 0`.",
          "SKUs are case-insensitive: `\"mug-01\"` and `\"MUG-01\"` are the same product. Use the uppercase form as the key.",
        ],
      },
    ],
    expectedBehavior: [
      "Sums quantities per SKU across rows.",
      "Normalizes SKU keys to uppercase.",
      "Lists warehouses without duplicates and skips zero-quantity rows.",
      "Computes `inStock` from the final quantity.",
    ],
    starter: `function buildInventory(rows) {
  const index = {};
  for (const row of rows) {
    index[row.sku] = { qty: row.qty, warehouses: [row.warehouse], inStock: row.qty > 0 };
  }
  return index;
}
`,
    hints: [
      "Look up the existing entry first and only create it when missing.",
      "Use `includes` (or a `Set`) to avoid listing a warehouse twice.",
      "Compute `inStock` after all rows are processed, or update it on every row.",
    ],
    validation: "js",
    tests: [
      {
        name: "combines rows per sku",
        code: `assert.deepEqual(buildInventory([
  { sku: "MUG-01", warehouse: "east", qty: 4 },
  { sku: "TEE-02", warehouse: "east", qty: 0 },
  { sku: "MUG-01", warehouse: "west", qty: 6 },
]), {
  "MUG-01": { qty: 10, warehouses: ["east", "west"], inStock: true },
  "TEE-02": { qty: 0, warehouses: [], inStock: false },
});`,
      },
      {
        name: "normalizes sku case",
        code: `const r = buildInventory([{ sku: "mug-01", warehouse: "east", qty: 1 }, { sku: "MUG-01", warehouse: "west", qty: 2 }]);
assert.deepEqual(Object.keys(r), ["MUG-01"]);
assert.equal(r["MUG-01"].qty, 3);`,
      },
      {
        name: "does not duplicate warehouses",
        code: `const r = buildInventory([{ sku: "A", warehouse: "east", qty: 1 }, { sku: "A", warehouse: "east", qty: 2 }]);
assert.deepEqual(r.A.warehouses, ["east"]);
assert.equal(r.A.qty, 3);`,
      },
      { name: "empty input", code: `assert.deepEqual(buildInventory([]), {});` },
    ],
    solution: `function buildInventory(rows) {
  const index = {};
  for (const { sku, warehouse, qty } of rows) {
    const key = sku.toUpperCase();
    const entry = (index[key] ??= { qty: 0, warehouses: [], inStock: false });

    entry.qty += qty;
    if (qty > 0 && !entry.warehouses.includes(warehouse)) {
      entry.warehouses.push(warehouse);
    }
    entry.inStock = entry.qty > 0;
  }
  return index;
}
`,
    explanation:
      "Indexing rows into an object keyed by an id is one of the most common data transformations in frontend code: it turns repeated `find` calls (O(n) each) into O(1) lookups. The starter overwrites the entry on every row. The fix is the get-or-create pattern (`index[key] ??= {...}`), then updating the shared entry. Normalizing the key avoids duplicate products that differ only in letter case.",
    relatedLessons: ["objects-data-transformations", "objects-arrays-of-objects", "objects-dot-bracket", "modern-js-set-map"],
  },
  {
    id: "ch-objects-merge-settings",
    slug: "ch-objects-merge-settings",
    title: "Deep-merge user settings",
    topic: "objects",
    difficulty: "advanced",
    minutes: 25,
    statement: [
      {
        kind: "paragraph",
        text: "An app ships default settings and stores only the user's overrides. Write `mergeSettings(defaults, overrides)` that returns a new object combining both.",
      },
      {
        kind: "list",
        items: [
          "Nested **plain objects** are merged recursively.",
          "Arrays and primitive values from `overrides` **replace** the default value (arrays are not concatenated).",
          "An override of `undefined` is ignored (keeps the default); `null` is a real value and replaces it.",
          "Neither input object may be mutated, and the result must not share nested objects with `defaults` (changing the result must not change the defaults).",
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'const defaults = {\n  theme: "light",\n  notifications: { email: true, sms: false, digest: { frequency: "weekly" } },\n  pinned: ["home"],\n};\nmergeSettings(defaults, { notifications: { sms: true, digest: { frequency: "daily" } }, pinned: ["orders"] });\n// { theme: "light",\n//   notifications: { email: true, sms: true, digest: { frequency: "daily" } },\n//   pinned: ["orders"] }',
      },
    ],
    expectedBehavior: [
      "Recursively merges nested plain objects.",
      "Replaces arrays and primitives.",
      "Ignores `undefined` overrides, applies `null`.",
      "Returns a fully independent object (no shared nested references with defaults).",
    ],
    starter: `function mergeSettings(defaults, overrides) {
  return { ...defaults, ...overrides };
}
`,
    hints: [
      "Spread is **shallow**: `{ ...a, ...b }` replaces the whole `notifications` object.",
      "Write a helper `isPlainObject(v)` that returns true for `{}`-style objects but false for arrays and null.",
      "Start from a deep copy of the defaults (`structuredClone(defaults)`), then walk the overrides.",
      "Recurse when both sides are plain objects; otherwise assign the override value.",
    ],
    validation: "js",
    tests: [
      {
        name: "merges nested objects",
        code: `const defaults = { theme: "light", notifications: { email: true, sms: false, digest: { frequency: "weekly" } }, pinned: ["home"] };
assert.deepEqual(
  mergeSettings(defaults, { notifications: { sms: true, digest: { frequency: "daily" } }, pinned: ["orders"] }),
  { theme: "light", notifications: { email: true, sms: true, digest: { frequency: "daily" } }, pinned: ["orders"] },
);`,
      },
      {
        name: "arrays are replaced, not concatenated",
        code: `assert.deepEqual(mergeSettings({ tags: ["a", "b"] }, { tags: ["c"] }), { tags: ["c"] });`,
      },
      {
        name: "undefined is ignored, null applies",
        code: `assert.deepEqual(mergeSettings({ a: 1, b: 2 }, { a: undefined, b: null }), { a: 1, b: null });`,
      },
      {
        name: "adds new keys",
        code: `assert.deepEqual(mergeSettings({ a: { x: 1 } }, { a: { y: 2 }, c: 3 }), { a: { x: 1, y: 2 }, c: 3 });`,
      },
      {
        name: "does not mutate inputs",
        code: `const defaults = { n: { email: true } };
const overrides = { n: { sms: true } };
mergeSettings(defaults, overrides);
assert.deepEqual(defaults, { n: { email: true } });
assert.deepEqual(overrides, { n: { sms: true } });`,
      },
      {
        name: "result does not share nested objects with defaults",
        code: `const defaults = { n: { email: true }, list: [1] };
const result = mergeSettings(defaults, {});
result.n.email = false;
result.list.push(2);
assert.equal(defaults.n.email, true);
assert.deepEqual(defaults.list, [1]);`,
      },
    ],
    solution: `function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeSettings(defaults, overrides) {
  const result = structuredClone(defaults);

  for (const [key, value] of Object.entries(overrides ?? {})) {
    if (value === undefined) continue;

    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = mergeSettings(result[key], value);
    } else {
      result[key] = structuredClone(value);
    }
  }
  return result;
}
`,
    explanation:
      "Object spread only copies one level, so nested settings are replaced wholesale and nested objects stay **shared by reference** with the defaults. A later `result.notifications.email = false` would then silently change the defaults for every user. Cloning the defaults with `structuredClone` breaks all shared references; recursion handles each nested level; and cloning override values keeps the result independent from the overrides too. Choosing to replace arrays (instead of concatenating) is a deliberate API decision: it matches how users expect a saved list to behave.",
    relatedLessons: ["objects-shallow-deep-copy", "objects-spread", "objects-nested-objects", "functions-recursion", "objects-references"],
  },
  {
    id: "ch-objects-diff-changes",
    slug: "ch-objects-diff-changes",
    title: "Diff two records for an audit log",
    topic: "objects",
    difficulty: "advanced",
    minutes: 20,
    statement: [
      {
        kind: "paragraph",
        text: "When an admin edits a product, the audit log stores only what changed. Write `diffRecords(before, after)` that compares **top-level** keys and returns:",
      },
      {
        kind: "code",
        language: "js",
        code: "{ added: { key: newValue }, removed: { key: oldValue }, changed: { key: { from, to } } }",
      },
      {
        kind: "list",
        items: [
          "A key is **added** if it is only in `after`, **removed** if only in `before`.",
          "A key is **changed** if both have it and the values differ. Compare primitives with `Object.is`, and arrays/objects by their JSON representation (`JSON.stringify`).",
          "Unchanged keys do not appear anywhere.",
          "Each of the three groups is always present, even if empty.",
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'diffRecords(\n  { name: "Mug", price: 10, tags: ["kitchen"], sku: "M1" },\n  { name: "Mug", price: 12, tags: ["kitchen", "gift"], color: "red" },\n);\n// { added: { color: "red" },\n//   removed: { sku: "M1" },\n//   changed: { price: { from: 10, to: 12 },\n//              tags: { from: ["kitchen"], to: ["kitchen", "gift"] } } }',
      },
    ],
    expectedBehavior: [
      "Detects added, removed and changed keys.",
      "Treats equal arrays/objects as unchanged even if they are different references.",
      "Compares falsy values such as `0`, `\"\"`, `false` and `null` correctly (no truthiness checks).",
      "Always returns all three groups.",
    ],
    starter: `function diffRecords(before, after) {
  const changed = {};
  for (const key in after) {
    if (before[key] !== after[key]) changed[key] = { from: before[key], to: after[key] };
  }
  return { changed };
}
`,
    hints: [
      "Build the set of all keys: `new Set([...Object.keys(before), ...Object.keys(after)])`.",
      "Use `Object.hasOwn(obj, key)` (or `key in obj`) to tell \"missing\" from \"set to undefined/0/false\".",
      "Write a small `isEqual(a, b)` helper: `Object.is` for primitives, `JSON.stringify` when both are objects.",
    ],
    validation: "js",
    tests: [
      {
        name: "detects added, removed and changed",
        code: `assert.deepEqual(
  diffRecords({ name: "Mug", price: 10, tags: ["kitchen"], sku: "M1" }, { name: "Mug", price: 12, tags: ["kitchen", "gift"], color: "red" }),
  { added: { color: "red" }, removed: { sku: "M1" }, changed: { price: { from: 10, to: 12 }, tags: { from: ["kitchen"], to: ["kitchen", "gift"] } } },
);`,
      },
      {
        name: "equal arrays and objects are unchanged",
        code: `assert.deepEqual(diffRecords({ tags: ["a"], dims: { w: 1 } }, { tags: ["a"], dims: { w: 1 } }), { added: {}, removed: {}, changed: {} });`,
      },
      {
        name: "falsy values are compared correctly",
        code: `assert.deepEqual(diffRecords({ stock: 0, note: "" }, { stock: null, note: "" }), { added: {}, removed: {}, changed: { stock: { from: 0, to: null } } });`,
      },
      {
        name: "keys added with falsy values count as added",
        code: `assert.deepEqual(diffRecords({}, { onSale: false }), { added: { onSale: false }, removed: {}, changed: {} });`,
      },
      {
        name: "returns all groups when nothing changed",
        code: `assert.deepEqual(diffRecords({}, {}), { added: {}, removed: {}, changed: {} });`,
      },
    ],
    solution: `function isEqual(a, b) {
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return Object.is(a, b);
}

function diffRecords(before, after) {
  const result = { added: {}, removed: {}, changed: {} };
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    const inBefore = Object.hasOwn(before, key);
    const inAfter = Object.hasOwn(after, key);

    if (!inBefore) result.added[key] = after[key];
    else if (!inAfter) result.removed[key] = before[key];
    else if (!isEqual(before[key], after[key])) {
      result.changed[key] = { from: before[key], to: after[key] };
    }
  }
  return result;
}
`,
    explanation:
      "Two objects are different references even when they hold identical data, so `!==` reports every array as changed. Comparing by JSON is a pragmatic structural check for simple API data (it is order-sensitive for keys and ignores `undefined` values, which is acceptable here). Using `Object.hasOwn` distinguishes a missing key from a key whose value is falsy, which a truthiness check would get wrong. Collecting the union of keys with a `Set` ensures removed keys are visited too.",
    relatedLessons: ["objects-keys-values-entries", "objects-references", "variables-equality", "modern-js-set-map", "networking-json-serialization"],
  },
];

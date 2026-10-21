import type { Challenge } from "@/content/types";

export const arraysChallenges: Challenge[] = [
  {
    id: "ch-arrays-cart-total",
    slug: "ch-arrays-cart-total",
    title: "Shopping cart total",
    topic: "arrays",
    difficulty: "beginner",
    minutes: 10,
    statement: [
      {
        kind: "paragraph",
        text: "Write `cartTotal(items)` that returns the total price of a cart. Each item has a `price` (dollars) and a `qty`. Round the result to **2 decimal places** (as a number), because `0.1 + 0.2` is `0.30000000000000004` in JavaScript.",
      },
      {
        kind: "paragraph",
        text: "Items with a missing `qty` count as 1. Items with `qty` of 0 contribute nothing. An empty cart totals `0`.",
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'cartTotal([\n  { name: "Mug", price: 12.5, qty: 2 },\n  { name: "Sticker", price: 0.1, qty: 3 },\n]); // 25.3\ncartTotal([]); // 0',
      },
    ],
    expectedBehavior: [
      "Sums `price * qty` for every item.",
      "Treats a missing `qty` as 1.",
      "Returns a number rounded to cents, without floating-point noise.",
      "Returns 0 for an empty cart.",
    ],
    starter: `function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty);
}
`,
    hints: [
      "`reduce` needs an initial value (`0`), otherwise the first **item object** becomes the accumulator and an empty array throws.",
      "`item.qty ?? 1` gives the default only when `qty` is missing.",
      "Round with `Math.round(total * 100) / 100`.",
    ],
    validation: "js",
    tests: [
      { name: "sums price × qty", code: `assert.equal(cartTotal([{ price: 12.5, qty: 2 }, { price: 3, qty: 1 }]), 28);` },
      { name: "rounds floating-point noise", code: `assert.equal(cartTotal([{ price: 0.1, qty: 1 }, { price: 0.2, qty: 1 }]), 0.3);\nassert.equal(cartTotal([{ name: "Mug", price: 12.5, qty: 2 }, { name: "Sticker", price: 0.1, qty: 3 }]), 25.3);` },
      { name: "empty cart is 0", code: `assert.equal(cartTotal([]), 0);` },
      { name: "missing qty counts as 1", code: `assert.equal(cartTotal([{ price: 4.99 }]), 4.99);` },
      { name: "qty 0 contributes nothing", code: `assert.equal(cartTotal([{ price: 10, qty: 0 }, { price: 5, qty: 2 }]), 10);` },
    ],
    solution: `function cartTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0);
  return Math.round(total * 100) / 100;
}
`,
    explanation:
      "`reduce` folds the array into a single number. Always pass the initial value `0`: without it, `reduce` uses the first element (an object here) as the accumulator and throws on an empty array. `?? 1` defaults only a missing quantity, keeping an explicit `0`. Finally, rounding to cents removes binary floating-point noise before the value reaches the UI. Production systems often store cents as integers to avoid the problem entirely.",
    relatedLessons: ["arrays-reduce", "arrays-arrays-of-objects", "variables-numbers", "operators-nullish-coalescing"],
  },
  {
    id: "ch-arrays-product-search",
    slug: "ch-arrays-product-search",
    title: "Product search",
    topic: "arrays",
    difficulty: "beginner",
    minutes: 15,
    statement: [
      {
        kind: "paragraph",
        text: "Write `searchProducts(products, query)` for the store's search box. A product matches when the query appears in its `name` **or** in any of its `tags`, ignoring case and surrounding whitespace.",
      },
      {
        kind: "list",
        items: [
          "An empty or whitespace-only query returns **all** products (as a new array).",
          "Keep the original order.",
          "Never modify the original `products` array.",
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'const products = [\n  { id: 1, name: "Running Shoes", tags: ["sport", "footwear"] },\n  { id: 2, name: "Yoga Mat", tags: ["sport", "fitness"] },\n  { id: 3, name: "Coffee Mug", tags: ["kitchen"] },\n];\nsearchProducts(products, "  SHOE ").map((p) => p.id); // [1]\nsearchProducts(products, "sport").map((p) => p.id);   // [1, 2]',
      },
    ],
    expectedBehavior: [
      "Case-insensitive, trimmed matching on name and tags.",
      "Partial matches count (\"shoe\" matches \"Running Shoes\").",
      "Empty query returns a copy of all products.",
      "Products without a `tags` array still work.",
    ],
    starter: `function searchProducts(products, query) {
  return products.filter((p) => p.name.includes(query));
}
`,
    hints: [
      "Normalize once before filtering: `const q = query.trim().toLowerCase();`",
      "`array.some(fn)` returns true if any tag matches.",
      "`(p.tags ?? [])` protects against products without tags.",
    ],
    validation: "js",
    tests: [
      {
        name: "matches names case-insensitively",
        code: `const products = [{ id: 1, name: "Running Shoes", tags: ["sport"] }, { id: 2, name: "Yoga Mat", tags: ["fitness"] }];
assert.deepEqual(searchProducts(products, "  SHOE ").map((p) => p.id), [1]);`,
      },
      {
        name: "matches tags",
        code: `const products = [{ id: 1, name: "Running Shoes", tags: ["sport", "footwear"] }, { id: 2, name: "Yoga Mat", tags: ["sport", "fitness"] }, { id: 3, name: "Coffee Mug", tags: ["kitchen"] }];
assert.deepEqual(searchProducts(products, "Sport").map((p) => p.id), [1, 2]);`,
      },
      {
        name: "empty query returns a new array with everything",
        code: `const products = [{ id: 1, name: "A", tags: [] }, { id: 2, name: "B", tags: [] }];
const result = searchProducts(products, "   ");
assert.deepEqual(result.map((p) => p.id), [1, 2]);
assert.ok(result !== products, "Should return a new array");`,
      },
      {
        name: "handles products without tags",
        code: `const products = [{ id: 1, name: "Lamp" }, { id: 2, name: "Desk", tags: ["office"] }];
assert.deepEqual(searchProducts(products, "office").map((p) => p.id), [2]);`,
      },
      { name: "no match returns an empty array", code: `assert.deepEqual(searchProducts([{ id: 1, name: "Lamp", tags: [] }], "zzz"), []);` },
    ],
    solution: `function searchProducts(products, query) {
  const q = query.trim().toLowerCase();
  if (q === "") return [...products];

  return products.filter((p) => {
    const inName = p.name.toLowerCase().includes(q);
    const inTags = (p.tags ?? []).some((tag) => tag.toLowerCase().includes(q));
    return inName || inTags;
  });
}
`,
    explanation:
      "`filter` builds a new array of matching products without touching the original. Normalizing the query once (trim + lowercase) and each candidate string the same way makes matching case-insensitive. `some` short-circuits as soon as one tag matches. Returning `[...products]` for an empty query keeps the function's contract consistent: the caller always gets a fresh array it can safely sort or modify.",
    relatedLessons: ["arrays-filter", "arrays-some-every", "arrays-includes-indexof", "variables-strings"],
  },
  {
    id: "ch-arrays-group-orders",
    slug: "ch-arrays-group-orders",
    title: "Group orders by status",
    topic: "arrays",
    difficulty: "intermediate",
    minutes: 15,
    statement: [
      {
        kind: "paragraph",
        text: "The admin dashboard shows orders in columns. Write `groupOrders(orders)` that returns an object whose keys are statuses and whose values are `{ count, total, ids }` for that status.",
      },
      {
        kind: "list",
        items: [
          "`count`: number of orders with that status.",
          "`total`: sum of their `amount`, rounded to 2 decimals.",
          "`ids`: order ids in the original order.",
          "Orders without a `status` go into the `\"unknown\"` group.",
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'groupOrders([\n  { id: "A1", status: "paid", amount: 20 },\n  { id: "A2", status: "shipped", amount: 15.5 },\n  { id: "A3", status: "paid", amount: 9.99 },\n]);\n// {\n//   paid: { count: 2, total: 29.99, ids: ["A1", "A3"] },\n//   shipped: { count: 1, total: 15.5, ids: ["A2"] },\n// }',
      },
    ],
    expectedBehavior: [
      "Creates a group the first time a status is seen.",
      "Accumulates count, total and ids per status.",
      "Places orders without status under `unknown`.",
      "Returns `{}` for an empty list and does not modify the input.",
    ],
    starter: `function groupOrders(orders) {
  const groups = {};
  for (const order of orders) {
    groups[order.status].count++;
    groups[order.status].total += order.amount;
    groups[order.status].ids.push(order.id);
  }
  return groups;
}
`,
    hints: [
      "Before updating a group, create it if it does not exist yet: `groups[key] ??= { count: 0, total: 0, ids: [] }`.",
      "`reduce` with `{}` as the initial value is a natural fit, but a `for...of` loop is fine too.",
      "Round each total at the end with `Math.round(x * 100) / 100`.",
    ],
    validation: "js",
    tests: [
      {
        name: "groups by status",
        code: `const result = groupOrders([
  { id: "A1", status: "paid", amount: 20 },
  { id: "A2", status: "shipped", amount: 15.5 },
  { id: "A3", status: "paid", amount: 9.99 },
]);
assert.deepEqual(result, {
  paid: { count: 2, total: 29.99, ids: ["A1", "A3"] },
  shipped: { count: 1, total: 15.5, ids: ["A2"] },
});`,
      },
      {
        name: "rounds totals",
        code: `const result = groupOrders([{ id: "1", status: "paid", amount: 0.1 }, { id: "2", status: "paid", amount: 0.2 }]);
assert.equal(result.paid.total, 0.3);`,
      },
      {
        name: "missing status goes to unknown",
        code: `const result = groupOrders([{ id: "X", amount: 5 }]);
assert.deepEqual(result, { unknown: { count: 1, total: 5, ids: ["X"] } });`,
      },
      { name: "empty list", code: `assert.deepEqual(groupOrders([]), {});` },
      {
        name: "does not mutate input",
        code: `const orders = [{ id: "A1", status: "paid", amount: 20 }];
groupOrders(orders);
assert.deepEqual(orders, [{ id: "A1", status: "paid", amount: 20 }]);`,
      },
    ],
    solution: `function groupOrders(orders) {
  const groups = orders.reduce((acc, order) => {
    const key = order.status ?? "unknown";
    acc[key] ??= { count: 0, total: 0, ids: [] };
    acc[key].count += 1;
    acc[key].total += order.amount;
    acc[key].ids.push(order.id);
    return acc;
  }, {});

  for (const group of Object.values(groups)) {
    group.total = Math.round(group.total * 100) / 100;
  }
  return groups;
}
`,
    explanation:
      "Grouping is a classic `reduce` into an object. The key step is initializing a bucket the first time you see a key; the starter crashes with `Cannot read properties of undefined` because it skips that. The logical nullish assignment `??=` creates the bucket only if it is missing. Rounding once at the end avoids accumulating rounding errors. Newer runtimes also offer `Object.groupBy`, which handles the bucketing for you, but you would still need a second pass for counts and totals.",
    relatedLessons: ["arrays-reduce", "arrays-arrays-of-objects", "objects-data-transformations", "objects-keys-values-entries"],
  },
  {
    id: "ch-arrays-paginate",
    slug: "ch-arrays-paginate",
    title: "Paginate a product list",
    topic: "arrays",
    difficulty: "intermediate",
    minutes: 15,
    statement: [
      {
        kind: "paragraph",
        text: "Write `paginate(items, page, pageSize)` for a product grid. Pages are **1-based**. Return an object describing the requested page:",
      },
      {
        kind: "code",
        language: "js",
        code: "{ items, page, pageSize, totalItems, totalPages, hasPrev, hasNext }",
      },
      {
        kind: "list",
        items: [
          "Clamp `page` into the valid range: below 1 becomes 1, above `totalPages` becomes `totalPages`.",
          "An empty list has `totalPages: 1`, `page: 1` and no items.",
          "`pageSize` defaults to 10. Throw a `RangeError` if it is not a positive integer.",
          "Do not modify `items`.",
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: "const ids = [1, 2, 3, 4, 5, 6, 7];\npaginate(ids, 2, 3);\n// { items: [4, 5, 6], page: 2, pageSize: 3, totalItems: 7,\n//   totalPages: 3, hasPrev: true, hasNext: true }\npaginate(ids, 99, 3).page; // 3",
      },
    ],
    expectedBehavior: [
      "Returns the correct slice for a 1-based page.",
      "Computes totalPages with `Math.ceil` (minimum 1).",
      "Clamps out-of-range pages.",
      "Sets hasPrev / hasNext correctly on the first and last page.",
    ],
    starter: `function paginate(items, page, pageSize) {
  const start = page * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems: items.length,
    totalPages: items.length / pageSize,
    hasPrev: page > 1,
    hasNext: true,
  };
}
`,
    hints: [
      "For 1-based pages the first index is `(page - 1) * pageSize`.",
      "`Math.max(1, Math.ceil(total / size))` handles both partial pages and empty lists.",
      "Clamp with `Math.min(Math.max(page, 1), totalPages)`.",
      "`slice` never mutates and never throws when the end is past the array length.",
    ],
    validation: "js",
    tests: [
      {
        name: "returns a middle page",
        code: `assert.deepEqual(paginate([1, 2, 3, 4, 5, 6, 7], 2, 3), { items: [4, 5, 6], page: 2, pageSize: 3, totalItems: 7, totalPages: 3, hasPrev: true, hasNext: true });`,
      },
      {
        name: "last partial page",
        code: `const r = paginate([1, 2, 3, 4, 5, 6, 7], 3, 3);
assert.deepEqual(r.items, [7]);
assert.equal(r.hasNext, false);
assert.equal(r.hasPrev, true);`,
      },
      {
        name: "first page has no previous",
        code: `const r = paginate([1, 2, 3], 1, 2);
assert.deepEqual(r.items, [1, 2]);
assert.equal(r.hasPrev, false);
assert.equal(r.hasNext, true);`,
      },
      {
        name: "clamps out-of-range pages",
        code: `assert.equal(paginate([1, 2, 3, 4, 5, 6, 7], 99, 3).page, 3);
assert.deepEqual(paginate([1, 2, 3, 4, 5, 6, 7], 99, 3).items, [7]);
assert.equal(paginate([1, 2, 3], -4, 2).page, 1);`,
      },
      {
        name: "empty list",
        code: `assert.deepEqual(paginate([], 1, 5), { items: [], page: 1, pageSize: 5, totalItems: 0, totalPages: 1, hasPrev: false, hasNext: false });`,
      },
      { name: "pageSize defaults to 10", code: `const items = Array.from({ length: 25 }, (_, i) => i);\nconst r = paginate(items, 3);\nassert.equal(r.totalPages, 3);\nassert.deepEqual(r.items, [20, 21, 22, 23, 24]);` },
      {
        name: "rejects invalid page sizes",
        code: `for (const bad of [0, -1, 2.5]) {
  let err = null;
  try { paginate([1], 1, bad); } catch (e) { err = e; }
  assert.ok(err instanceof RangeError, "Expected RangeError for " + bad);
}`,
      },
    ],
    solution: `function paginate(items, page, pageSize = 10) {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("pageSize must be a positive integer");
  }
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    totalItems,
    totalPages,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}
`,
    explanation:
      "Pagination bugs are almost always off-by-one errors. With 1-based pages, the start index is `(page - 1) * pageSize`. `Math.ceil` counts a final partial page, and `Math.max(1, ...)` makes an empty list have one (empty) page so the UI can still show \"Page 1 of 1\". Clamping the requested page protects against stale links (for example `?page=99` after filters shrink the list). `slice` is non-mutating and tolerant of out-of-range end indexes.",
    relatedLessons: ["arrays-slice-vs-splice", "networking-pagination", "functions-default-parameters", "variables-numbers"],
  },
  {
    id: "ch-arrays-sort-products",
    slug: "ch-arrays-sort-products",
    title: "Sort products without mutating",
    topic: "arrays",
    difficulty: "advanced",
    minutes: 20,
    statement: [
      {
        kind: "paragraph",
        text: "The product grid has a \"Sort by\" dropdown. Write `sortProducts(products, sortBy)` that returns a **new** sorted array and leaves `products` untouched (React state must never be mutated).",
      },
      {
        kind: "table",
        headers: ["sortBy", "Order", "Tie-breaker"],
        rows: [
          ["`\"price-asc\"`", "price low → high", "name A → Z"],
          ["`\"price-desc\"`", "price high → low", "name A → Z"],
          ["`\"rating\"`", "rating high → low (missing rating counts as 0)", "more `reviews` first"],
          ["`\"name\"`", "name A → Z, case-insensitive", "—"],
          ["anything else", "original order (still a new array)", "—"],
        ],
      },
      {
        kind: "code",
        language: "js",
        title: "Example",
        code: 'const products = [\n  { name: "Lamp", price: 30, rating: 4.5, reviews: 10 },\n  { name: "desk", price: 120, rating: 4.5, reviews: 80 },\n  { name: "Chair", price: 30, rating: 3.9, reviews: 5 },\n];\nsortProducts(products, "price-asc").map((p) => p.name);\n// ["Chair", "Lamp", "desk"]\nsortProducts(products, "rating").map((p) => p.name);\n// ["desk", "Lamp", "Chair"]',
      },
    ],
    expectedBehavior: [
      "Never mutates the input array.",
      "Compares prices numerically (not as strings).",
      "Applies the documented tie-breakers.",
      "Sorts names case-insensitively with `localeCompare`.",
      "Unknown sort keys return a copy in the original order.",
    ],
    starter: `function sortProducts(products, sortBy) {
  if (sortBy === "price-asc") return products.sort((a, b) => a.price > b.price);
  if (sortBy === "price-desc") return products.sort((a, b) => b.price > a.price);
  if (sortBy === "name") return products.sort();
  return products;
}
`,
    hints: [
      "Copy first: `[...products].sort(...)` or `products.toSorted(...)`.",
      "A comparator must return a **number**: negative, zero or positive. `a.price - b.price` works; `a.price > b.price` (a boolean) does not.",
      "Chain tie-breakers with `||`: `a.price - b.price || a.name.localeCompare(b.name)`.",
      "For case-insensitive names use `a.name.localeCompare(b.name, undefined, { sensitivity: \"base\" })`.",
    ],
    validation: "js",
    tests: [
      {
        name: "price ascending with name tie-breaker",
        code: `const products = [{ name: "Lamp", price: 30 }, { name: "Desk", price: 120 }, { name: "Chair", price: 30 }, { name: "Pen", price: 2 }];
assert.deepEqual(sortProducts(products, "price-asc").map((p) => p.name), ["Pen", "Chair", "Lamp", "Desk"]);`,
      },
      {
        name: "price descending is numeric",
        code: `const products = [{ name: "A", price: 9 }, { name: "B", price: 100 }, { name: "C", price: 25 }];
assert.deepEqual(sortProducts(products, "price-desc").map((p) => p.name), ["B", "C", "A"]);`,
      },
      {
        name: "rating with reviews tie-breaker and missing rating",
        code: `const products = [
  { name: "Lamp", rating: 4.5, reviews: 10 },
  { name: "New", reviews: 0 },
  { name: "Desk", rating: 4.5, reviews: 80 },
  { name: "Chair", rating: 3.9, reviews: 5 },
];
assert.deepEqual(sortProducts(products, "rating").map((p) => p.name), ["Desk", "Lamp", "Chair", "New"]);`,
      },
      {
        name: "name is case-insensitive",
        code: `const products = [{ name: "lamp" }, { name: "Desk" }, { name: "chair" }];
assert.deepEqual(sortProducts(products, "name").map((p) => p.name), ["chair", "Desk", "lamp"]);`,
      },
      {
        name: "does not mutate the input",
        code: `const products = [{ name: "B", price: 2 }, { name: "A", price: 1 }];
const result = sortProducts(products, "price-asc");
assert.deepEqual(products.map((p) => p.name), ["B", "A"]);
assert.ok(result !== products, "Should return a new array");`,
      },
      {
        name: "unknown key returns a copy in original order",
        code: `const products = [{ name: "B" }, { name: "A" }];
const result = sortProducts(products, "featured");
assert.deepEqual(result.map((p) => p.name), ["B", "A"]);
assert.ok(result !== products, "Should return a new array");`,
      },
    ],
    solution: `function sortProducts(products, sortBy) {
  const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  const comparators = {
    "price-asc": (a, b) => a.price - b.price || byName(a, b),
    "price-desc": (a, b) => b.price - a.price || byName(a, b),
    rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0),
    name: byName,
  };

  const compare = comparators[sortBy];
  const copy = [...products];
  return compare ? copy.sort(compare) : copy;
}
`,
    explanation:
      "`Array.prototype.sort` sorts **in place**, so calling it on state or props silently changes data elsewhere. Copying first (or using `toSorted`) fixes that. Comparators must return a number; returning a boolean happens to work in some engines and fails in others. Without a comparator, `sort()` converts values to strings, which is why `[9, 100, 25].sort()` gives `[100, 25, 9]`. A lookup table of comparators keeps the branching flat, and `||` chains tie-breakers because `0` (equal) is falsy.",
    relatedLessons: ["arrays-sort-reverse", "arrays-copying", "arrays-spread", "advanced-immutability"],
  },
];

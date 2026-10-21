import type { Lesson } from "@/content/types";

export const updatingContent: Lesson = {
  id: "dom-updating-content",
  slug: "updating-content",
  title: "Updating Text and HTML",
  summary: "Change what users see with textContent, innerHTML and attributes — and avoid the XSS security hole that careless innerHTML creates.",
  difficulty: "beginner",
  minutes: 25,
  tech: ["javascript", "dom"],
  tags: ["dom", "textContent", "innerHTML", "innerText", "attributes", "xss", "security"],
  objectives: [
    "Update text safely with `textContent`.",
    "Explain when `innerHTML` is appropriate and why it is dangerous with user data.",
    "Compare `textContent`, `innerText` and `innerHTML`.",
    "Read and write attributes, properties and `data-*` values.",
    "Escape untrusted text before building HTML strings.",
  ],
  prerequisites: ["dom-selecting-elements", "modern-js-template-literals"],
  intro: [
    {
      kind: "paragraph",
      text: "Once you have an element, the most common job is changing what it shows: the cart count, a price, a search result message, an error under a form field. The DOM gives you a few ways to do this, and choosing the right one matters for **correctness**, **performance** and especially **security**.",
    },
    {
      kind: "paragraph",
      text: "The rule of thumb professionals follow: *use `textContent` for text; use `innerHTML` only with HTML you fully control*. This lesson explains why.",
    },
  ],
  terms: [
    { term: "`textContent`", definition: "Gets or sets the text of an element and all its descendants. Setting it replaces all children with a single text node; HTML characters are shown literally." },
    { term: "`innerHTML`", definition: "Gets or sets the HTML markup inside an element. Setting it makes the browser parse the string as HTML." },
    { term: "`innerText`", definition: "Like `textContent` but layout-aware: it respects CSS (hidden elements are skipped) and is slower because it may trigger layout." },
    { term: "Attribute", definition: "A name/value pair written in HTML, e.g. `href` in `<a href=\"/cart\">`. Read with `getAttribute`." },
    { term: "Property", definition: "A field on the DOM object, e.g. `input.value` or `link.href`. Often mirrors an attribute but not always." },
    { term: "XSS (cross-site scripting)", definition: "An attack where untrusted input is injected into a page as HTML/JS and runs in other users' browsers." },
    { term: "Escaping", definition: "Replacing special characters such as `<` and `&` with entities (`&lt;`, `&amp;`) so they display as text instead of being parsed as HTML." },
  ],
  sections: [
    {
      id: "explanation",
      title: "Text vs HTML",
      blocks: [
        {
          kind: "paragraph",
          text: "`textContent` treats your string as **plain text**. If the string contains `<b>`, the user literally sees `<b>`. `innerHTML` treats the string as **markup**: the browser parses it and creates new elements.",
        },
        {
          kind: "table",
          caption: "Choosing a content property",
          headers: ["Property", "Parses HTML?", "Considers CSS?", "Use for"],
          rows: [
            ["`textContent`", "No", "No (fast)", "Almost all text updates"],
            ["`innerText`", "No", "Yes (slower)", "Reading text as the user sees it"],
            ["`innerHTML`", "Yes", "—", "Inserting trusted, static markup"],
            ["`outerHTML`", "Yes", "—", "Replacing the element itself with markup (rare)"],
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "innerHTML + user input = XSS",
          text: "If a product review contains `<img src=x onerror=\"stealCookies()\">` and you insert it with `innerHTML`, the browser creates that image, the load fails, and the attacker's code runs for every visitor. With `textContent` the same review is displayed harmlessly as text.",
        },
        {
          kind: "diagram",
          title: "What happens when you set innerHTML",
          variant: "flow",
          steps: [
            { label: "Old children removed", detail: "Their event listeners and state are gone" },
            { label: "String parsed as HTML", detail: "The browser's HTML parser runs" },
            { label: "New nodes created", detail: "Elements, text, attributes (including event-handler attributes)" },
            { label: "Page re-rendered", detail: "Any references you held to old children are now detached" },
          ],
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
          runtime: "dom",
          code: "// Text\nbadge.textContent = String(cartCount);\n\n// Trusted markup only\nbanner.innerHTML = \"<strong>Free shipping</strong> on orders over $50\";\n\n// Attributes\nlink.getAttribute(\"href\");          // exactly what is in the HTML: \"/cart\"\nlink.setAttribute(\"aria-label\", \"Open cart\");\nlink.removeAttribute(\"title\");\nlink.hasAttribute(\"download\");      // true/false\n\n// Properties\ninput.value = \"\";                   // current value typed by the user\nbutton.disabled = true;             // boolean property\nimg.alt = \"Desk lamp\";\n\n// data-* attributes via dataset (kebab-case → camelCase)\ncard.dataset.productId;             // reads data-product-id\ncard.dataset.inStock = \"false\";     // writes data-in-stock",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Attributes vs properties",
          text: "`input.getAttribute(\"value\")` is the *initial* value written in the HTML. `input.value` is the *current* value the user typed. Likewise `link.getAttribute(\"href\")` may be `\"/cart\"` while `link.href` is the full URL `\"https://shop.example/cart\"`.",
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "textContent shows HTML literally" },
        {
          kind: "code",
          language: "js",
          runtime: "dom",
          runnable: true,
          code: "const review = document.querySelector(\"#review\");\nconst userText = \"Great lamp! <b>5 stars</b>\";\n\nreview.textContent = userText;\nconsole.log(review.children.length); // 0 — no <b> element was created\n\nreview.innerHTML = userText;\nconsole.log(review.children.length); // 1 — the <b> was parsed",
        },
        { kind: "heading", text: "Escaping text before building HTML strings" },
        {
          kind: "paragraph",
          text: "If you must build an HTML string (for example a template), escape every piece of untrusted data first:",
        },
        {
          kind: "code",
          language: "js",
          code: "function escapeHtml(text) {\n  return String(text)\n    .replaceAll(\"&\", \"&amp;\")\n    .replaceAll(\"<\", \"&lt;\")\n    .replaceAll(\">\", \"&gt;\")\n    .replaceAll('\"', \"&quot;\")\n    .replaceAll(\"'\", \"&#39;\");\n}\n\nconst name = '<img src=x onerror=\"alert(1)\">';\nconsole.log(`<li>${escapeHtml(name)}</li>`);",
          output: "<li>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</li>",
          runnable: true,
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Order matters",
          text: "Escape `&` first. Otherwise the `&` inside `&lt;` would be escaped again into `&amp;lt;`.",
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
          runtime: "dom",
          code: "function renderCartSummary(cart) {\n  const count = document.querySelector(\"#cart-count\");\n  const total = document.querySelector(\"#cart-total\");\n  const checkout = document.querySelector(\"#checkout\");\n\n  count.textContent = String(cart.items.length);\n  total.textContent = `$${cart.total.toFixed(2)}`;\n  checkout.disabled = cart.items.length === 0;\n  checkout.setAttribute(\"aria-label\", `Checkout ${cart.items.length} items`);\n}",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Query the three elements the function is responsible for.",
            "`textContent` is used for numbers and prices — no HTML is needed, so no XSS risk.",
            "The total is formatted with a template literal and `toFixed(2)`.",
            "`disabled` is a boolean **property**: `true` disables the button, `false` enables it.",
            "`setAttribute` updates the accessible name screen readers announce.",
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
            "**User-generated content** (reviews, names, search terms echoed back) must always be inserted as text.",
            "**Static templates** you write yourself can use `innerHTML`, but `createElement` (next lesson) or a `<template>` element is often cleaner.",
            "**Sanitizers:** when you truly must render user-supplied HTML (e.g. a rich-text editor), use a vetted sanitizer such as DOMPurify; the emerging `setHTML()` / Sanitizer API aims to make this built-in.",
            "**Frameworks:** React escapes text in JSX automatically; its escape hatch is deliberately named `dangerouslySetInnerHTML`.",
            "**Tests:** assertions like `should(\"have.text\", \"3\")` read the element's text content.",
          ],
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Inserting user input with innerHTML",
      wrong: "results.innerHTML = `No results for ${searchTerm}`;",
      right: "results.textContent = `No results for ${searchTerm}`;",
      explanation: "A search term like `<img src=x onerror=...>` would run as code. `textContent` displays it safely.",
    },
    {
      title: "Using += with innerHTML in a loop",
      wrong: "for (const p of products) {\n  list.innerHTML += `<li>${p.name}</li>`; // re-parses everything each time\n}",
      right: "list.innerHTML = products\n  .map((p) => `<li>${escapeHtml(p.name)}</li>`)\n  .join(\"\");",
      explanation: "`+=` serializes and re-parses the whole list on every iteration, which is slow and destroys existing listeners. Build the string once (escaped!) or create elements.",
    },
    {
      title: "Reading value via getAttribute",
      wrong: "const email = input.getAttribute(\"value\"); // initial HTML value, not what was typed",
      right: "const email = input.value;",
      explanation: "The `value` attribute holds the default; the `value` property holds the current input.",
    },
    {
      title: "Forgetting that numbers become strings",
      wrong: "badge.textContent = 2;\nconst next = badge.textContent + 1; // \"21\"",
      right: "const next = Number(badge.textContent) + 1; // 3",
      explanation: "DOM text is always a string. Convert with `Number()` before doing arithmetic — better still, keep the count in a variable and only *render* it.",
    },
  ],
  debugging: [
    "Seeing raw `<b>` tags on screen? You used `textContent` where you intended trusted markup — or, more likely, that's correct and the data should not contain HTML.",
    "Event listeners stopped working after an update? `innerHTML` replaced the elements they were attached to. Re-attach them or use event delegation.",
    "Inspect the element in DevTools after updating: the Elements panel shows whether you created text or child elements.",
    "If `getAttribute` and the property disagree, remember one is the HTML default and the other is the live state.",
  ],
  examples: [
    {
      id: "dom-updating-content-example-text-vs-html",
      title: "textContent vs innerHTML",
      runtime: "dom",
      html: "<p id=\"safe\"></p>\n<p id=\"unsafe\"></p>",
      code: "const review = 'Nice mug <img src=\"x\" onerror=\"console.log(\\'XSS ran!\\')\">';\n\ndocument.querySelector(\"#safe\").textContent = review;\nconsole.log(\"safe children:\", document.querySelector(\"#safe\").children.length);\n\ndocument.querySelector(\"#unsafe\").innerHTML = review;\nconsole.log(\"unsafe children:\", document.querySelector(\"#unsafe\").children.length);\nconsole.log(\"An <img> with an onerror handler now exists in the page — in a real browser its code would run.\");",
    },
    {
      id: "dom-updating-content-example-cart",
      title: "Render a cart summary",
      runtime: "dom",
      html: "<header>\n  Cart: <span id=\"cart-count\">0</span> items — <span id=\"cart-total\">$0.00</span>\n  <button id=\"checkout\" disabled>Checkout</button>\n</header>",
      code: "const cart = { items: [\"Mug\", \"Tea\"], total: 31.5 };\n\ndocument.querySelector(\"#cart-count\").textContent = String(cart.items.length);\ndocument.querySelector(\"#cart-total\").textContent = `$${cart.total.toFixed(2)}`;\n\nconst checkout = document.querySelector(\"#checkout\");\ncheckout.disabled = cart.items.length === 0;\ncheckout.setAttribute(\"aria-label\", `Checkout ${cart.items.length} items`);\n\nconsole.log(document.querySelector(\"header\").textContent.replace(/\\s+/g, \" \").trim());\nconsole.log(\"disabled:\", checkout.disabled, \"| label:\", checkout.getAttribute(\"aria-label\"));",
    },
    {
      id: "dom-updating-content-example-attributes",
      title: "Attributes, properties and dataset",
      runtime: "dom",
      html: "<a id=\"link\" href=\"/cart\">Cart</a>\n<input id=\"qty\" value=\"1\">\n<article id=\"card\" data-product-id=\"42\" data-in-stock=\"true\">Lamp</article>",
      code: "const link = document.querySelector(\"#link\");\nconsole.log(link.getAttribute(\"href\"), \"vs\", link.href);\n\nconst qty = document.querySelector(\"#qty\");\nqty.value = \"3\"; // as if the user typed 3\nconsole.log(\"attribute:\", qty.getAttribute(\"value\"), \"property:\", qty.value);\n\nconst card = document.querySelector(\"#card\");\nconsole.log(card.dataset.productId, card.dataset.inStock);\ncard.dataset.inStock = \"false\";\nconsole.log(card.outerHTML);",
    },
  ],
  exercises: [
    {
      id: "dom-updating-content-ex-1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Which property should you use to show a customer's name (typed into a form) in a greeting?",
      options: [
        { id: "a", text: "`innerHTML`", explanation: "User input inserted as HTML can execute scripts (XSS)." },
        { id: "b", text: "`textContent`", explanation: "Correct — the name is displayed as text, never parsed as HTML." },
        { id: "c", text: "`outerHTML`", explanation: "That replaces the element itself with parsed markup — also unsafe." },
      ],
      answer: "b",
      hints: ["Is the name trusted?"],
      explanation: "Anything from users must be treated as text. `textContent` guarantees it is never interpreted as HTML.",
    },
    {
      id: "dom-updating-content-ex-2",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Complete the code to read the `data-product-id` attribute and disable the button.",
      template: "const id = card.___.productId;\nbutton.___ = true;",
      blanks: [{ answers: ["dataset"] }, { answers: ["disabled"] }],
      hints: ["`data-*` attributes are exposed through one object.", "Which boolean property makes a button unclickable?"],
      explanation: "`dataset` maps `data-product-id` to `dataset.productId`. The `disabled` property toggles a form control on or off.",
    },
    {
      id: "dom-updating-content-ex-3",
      type: "code",
      difficulty: "beginner",
      prompt: "Write `escapeHtml(text)` that replaces `&`, `<`, `>`, `\"` and `'` with `&amp;`, `&lt;`, `&gt;`, `&quot;` and `&#39;`.",
      instructions: "Convert the input with `String()` first so numbers work too.",
      starter: "function escapeHtml(text) {\n  // your code here\n}\n",
      tests: [
        { name: "escapes tags", code: "assert.equal(escapeHtml(\"<b>hi</b>\"), \"&lt;b&gt;hi&lt;/b&gt;\");" },
        { name: "escapes ampersand first", code: "assert.equal(escapeHtml(\"Tom & Jerry <3\"), \"Tom &amp; Jerry &lt;3\");" },
        { name: "escapes quotes", code: "assert.equal(escapeHtml(`say \"hi\" it's`), \"say &quot;hi&quot; it&#39;s\");" },
        { name: "numbers", code: "assert.equal(escapeHtml(42), \"42\");" },
      ],
      solution:
        "function escapeHtml(text) {\n  return String(text)\n    .replaceAll(\"&\", \"&amp;\")\n    .replaceAll(\"<\", \"&lt;\")\n    .replaceAll(\">\", \"&gt;\")\n    .replaceAll('\"', \"&quot;\")\n    .replaceAll(\"'\", \"&#39;\");\n}",
      hints: ["`replaceAll` replaces every occurrence.", "Do `&` before the others."],
      explanation: "Escaping turns markup characters into entities so the browser displays them instead of parsing them. Escaping `&` first prevents double-escaping.",
    },
    {
      id: "dom-updating-content-ex-4",
      type: "code",
      difficulty: "intermediate",
      prompt: "Write `productListHtml(products)` that returns an HTML string of `<li>` items like `<li data-id=\"7\">Lamp — $12.50</li>`, joined with no separator. Names must be escaped. Use the `escapeHtml` function provided in the starter.",
      starter:
        "function escapeHtml(text) {\n  return String(text).replaceAll(\"&\", \"&amp;\").replaceAll(\"<\", \"&lt;\").replaceAll(\">\", \"&gt;\").replaceAll('\"', \"&quot;\").replaceAll(\"'\", \"&#39;\");\n}\n\nfunction productListHtml(products) {\n  // your code here\n}\n",
      tests: [
        {
          name: "one product",
          code: "assert.equal(productListHtml([{ id: 7, name: \"Lamp\", price: 12.5 }]), '<li data-id=\"7\">Lamp — $12.50</li>');",
        },
        {
          name: "escapes names",
          code: "assert.equal(productListHtml([{ id: 1, name: \"<script>\", price: 1 }]), '<li data-id=\"1\">&lt;script&gt; — $1.00</li>');",
        },
        {
          name: "joins multiple",
          code: "assert.equal(productListHtml([{ id: 1, name: \"A\", price: 1 }, { id: 2, name: \"B\", price: 2 }]), '<li data-id=\"1\">A — $1.00</li><li data-id=\"2\">B — $2.00</li>');",
        },
        { name: "empty", code: "assert.equal(productListHtml([]), \"\");" },
      ],
      solution:
        "function escapeHtml(text) {\n  return String(text).replaceAll(\"&\", \"&amp;\").replaceAll(\"<\", \"&lt;\").replaceAll(\">\", \"&gt;\").replaceAll('\"', \"&quot;\").replaceAll(\"'\", \"&#39;\");\n}\n\nfunction productListHtml(products) {\n  return products\n    .map((p) => `<li data-id=\"${escapeHtml(p.id)}\">${escapeHtml(p.name)} — $${p.price.toFixed(2)}</li>`)\n    .join(\"\");\n}",
      hints: ["`map` each product to a string, then `join(\"\")`.", "Escape the name (and, defensively, the id)."],
      explanation: "Building the full string once and assigning it with a single `innerHTML =` is far faster than `+=` in a loop, and escaping keeps it safe.",
    },
    {
      id: "dom-updating-content-ex-5",
      type: "find-bug",
      difficulty: "intermediate",
      debugging: true,
      prompt: "`escapeHtml` produces `&amp;lt;` for `<`. Find and fix the ordering bug.",
      code: "function escapeHtml(text) {\n  return String(text)\n    .replaceAll(\"<\", \"&lt;\")\n    .replaceAll(\">\", \"&gt;\")\n    .replaceAll(\"&\", \"&amp;\");\n}\n",
      tests: [
        { name: "less-than", code: "assert.equal(escapeHtml(\"<\"), \"&lt;\");" },
        { name: "ampersand", code: "assert.equal(escapeHtml(\"a & b\"), \"a &amp; b\");" },
        { name: "mixed", code: "assert.equal(escapeHtml(\"<a&b>\"), \"&lt;a&amp;b&gt;\");" },
      ],
      solution:
        "function escapeHtml(text) {\n  return String(text)\n    .replaceAll(\"&\", \"&amp;\")\n    .replaceAll(\"<\", \"&lt;\")\n    .replaceAll(\">\", \"&gt;\");\n}",
      hints: ["What does the `&` replacement do to the `&` inside `&lt;`?"],
      explanation: "Replacing `&` last re-escapes the ampersands introduced by `&lt;` and `&gt;`. Replace `&` first.",
    },
  ],
  quiz: [
    {
      id: "dom-updating-content-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "After `el.textContent = \"<em>Hi</em>\"`, what does the user see?",
      options: [
        { id: "a", text: "*Hi* in italics", explanation: "That would happen with `innerHTML`." },
        { id: "b", text: "The literal text `<em>Hi</em>`", explanation: "Correct — `textContent` never parses HTML." },
        { id: "c", text: "Nothing; the assignment throws", explanation: "Any string is valid text." },
      ],
      answer: "b",
      hints: ["Text vs markup."],
      explanation: "`textContent` creates a single text node, so angle brackets are displayed as characters.",
    },
    {
      id: "dom-updating-content-q2",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "A list's buttons stop responding to clicks after `list.innerHTML += \"<li>New</li>\"`. Why?",
      options: [
        { id: "a", text: "`+=` is not allowed on `innerHTML`", explanation: "It is allowed — it just has a hidden cost." },
        { id: "b", text: "All existing children were destroyed and re-created from HTML, losing their listeners", explanation: "Correct." },
        { id: "c", text: "The new `li` captures all click events", explanation: "Elements don't steal each other's events." },
      ],
      answer: "b",
      hints: ["`a += b` means `a = a + b`."],
      explanation: "`innerHTML +=` serializes the current children to a string, appends, and re-parses — creating brand-new elements without the old listeners.",
    },
    {
      id: "dom-updating-content-q3",
      type: "mcq",
      difficulty: "beginner",
      prompt: "The user typed `5` into `<input id=\"qty\" value=\"1\">`. What does `qty.getAttribute(\"value\")` return?",
      options: [
        { id: "a", text: "`\"5\"`", explanation: "That is `qty.value`, the current value property." },
        { id: "b", text: "`\"1\"`", explanation: "Correct — the attribute keeps the initial value from the HTML." },
        { id: "c", text: "`5` (a number)", explanation: "Attributes are always strings, and this one wasn't changed." },
      ],
      answer: "b",
      hints: ["Attribute = HTML default, property = live state."],
      explanation: "Typing changes the `value` property, not the `value` attribute.",
    },
    {
      id: "dom-updating-content-q4",
      type: "multi-select",
      difficulty: "intermediate",
      prompt: "Which of these are safe ways to display an untrusted product review?",
      options: [
        { id: "a", text: "`el.textContent = review`", explanation: "Safe — treated as text." },
        { id: "b", text: "`el.innerHTML = review`", explanation: "Unsafe — parsed as HTML." },
        { id: "c", text: "`el.innerHTML = `<p>${escapeHtml(review)}</p>``", explanation: "Safe — every special character is escaped first." },
        { id: "d", text: "`el.append(review)` (string argument)", explanation: "Safe — `append` with a string creates a text node." },
      ],
      answers: ["a", "c", "d"],
      hints: ["Which options parse the review as HTML without escaping?"],
      explanation: "Text APIs (`textContent`, `append(string)`) and properly escaped strings are safe. Raw `innerHTML` with untrusted data is not.",
    },
  ],
  challenge: {
    id: "dom-updating-content-challenge",
    type: "code",
    difficulty: "intermediate",
    prompt:
      "Write `highlightMatch(text, query)` for search autocomplete. Return an HTML string where the **first** case-insensitive occurrence of `query` in `text` is wrapped in `<mark>…</mark>`. Everything must be escaped (use the provided `escapeHtml`). If `query` is empty or not found, return the escaped text.",
    starter:
      "function escapeHtml(text) {\n  return String(text).replaceAll(\"&\", \"&amp;\").replaceAll(\"<\", \"&lt;\").replaceAll(\">\", \"&gt;\").replaceAll('\"', \"&quot;\").replaceAll(\"'\", \"&#39;\");\n}\n\nfunction highlightMatch(text, query) {\n  // your code here\n}\n",
    tests: [
      { name: "basic", code: "assert.equal(highlightMatch(\"Desk Lamp\", \"lamp\"), \"Desk <mark>Lamp</mark>\");" },
      { name: "not found", code: "assert.equal(highlightMatch(\"Mug\", \"tea\"), \"Mug\");" },
      { name: "empty query", code: "assert.equal(highlightMatch(\"Mug\", \"\"), \"Mug\");" },
      { name: "escapes text", code: "assert.equal(highlightMatch(\"<b>Lamp</b>\", \"lamp\"), \"&lt;b&gt;<mark>Lamp</mark>&lt;/b&gt;\");" },
      { name: "first occurrence only", code: "assert.equal(highlightMatch(\"tea teapot\", \"tea\"), \"<mark>tea</mark> teapot\");" },
    ],
    solution:
      "function escapeHtml(text) {\n  return String(text).replaceAll(\"&\", \"&amp;\").replaceAll(\"<\", \"&lt;\").replaceAll(\">\", \"&gt;\").replaceAll('\"', \"&quot;\").replaceAll(\"'\", \"&#39;\");\n}\n\nfunction highlightMatch(text, query) {\n  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;\n  if (index === -1) return escapeHtml(text);\n  const before = text.slice(0, index);\n  const match = text.slice(index, index + query.length);\n  const after = text.slice(index + query.length);\n  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;\n}",
    hints: [
      "Find the index on lowercased copies, but slice the original text to keep its casing.",
      "Escape each of the three pieces separately, then add the `<mark>` tags you trust.",
    ],
    explanation: "Only the `<mark>` tags are trusted markup; every piece of data is escaped. This is the safe pattern for building HTML strings from user-facing data.",
  },
  keyPoints: [
    "Use `textContent` for text — it is fast and never parses HTML.",
    "`innerHTML` parses markup: only use it with trusted content or escaped data, and avoid `+=` in loops.",
    "`innerText` is layout-aware and slower; prefer `textContent` unless you need visible text only.",
    "Attributes are the HTML defaults (`getAttribute`); properties are the live state (`input.value`, `button.disabled`).",
    "`dataset` maps `data-*` attributes to camelCase properties.",
  ],
  related: ["dom-selecting-elements", "dom-creating-removing", "dom-classes-styles", "dom-imperative-vs-declarative"],
  references: [
    { title: "MDN: Node.textContent", url: "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent" },
    { title: "MDN: Element.innerHTML (security considerations)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML" },
    { title: "MDN: HTMLElement.dataset", url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset" },
    { title: "MDN: Cross-site scripting (XSS)", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS" },
  ],
};

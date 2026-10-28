import type { Lesson } from "@/content/types";

const sampler = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Selector sampler</title>
  <style>
    /* Universal selector: every element */
    * {
      box-sizing: border-box;
    }

    /* Type selector: every <body> element */
    body {
      font-family: system-ui, sans-serif;
      padding: 16px;
    }

    /* Selector list (grouping): both h1 and h2 */
    h1, h2 {
      color: rgb(30, 64, 175);
    }

    /* Class selector: anything with class="note" */
    .note {
      background-color: rgb(254, 243, 199);
      padding: 8px;
    }

    /* ID selector: the single element with id="newsletter" */
    #newsletter {
      border: 2px solid rgb(30, 64, 175);
      padding: 12px;
    }

    /* Attribute selectors */
    input[type="email"] {
      background-color: rgb(239, 246, 255);
    }

    a[href^="https"] {
      color: rgb(22, 101, 52);
    }

    /* Compound selector: <p> elements that ALSO have class="note" */
    p.note {
      font-weight: 700;
    }
  </style>
</head>
<body>
  <h1>Weekly deals</h1>
  <p>Fresh offers every Monday.</p>
  <p class="note">Prices include tax.</p>
  <div class="note">This div is a note too, but it is not a paragraph.</div>

  <h2>Links</h2>
  <p><a href="/deals">Internal link (not green)</a></p>
  <p><a href="https://example.com">External https link (green)</a></p>

  <section id="newsletter">
    <h2>Newsletter</h2>
    <input type="email" placeholder="you@example.com">
    <input type="text" placeholder="Your name">
  </section>
</body>
</html>`;

const combinators = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Combinators</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 16px;
    }

    /* Descendant: every p anywhere inside .card */
    .card p {
      font-style: italic;
    }

    /* Child: only p elements whose PARENT is .card */
    .card > p {
      color: rgb(185, 28, 28);
    }

    /* Adjacent sibling: the p that comes RIGHT AFTER an h2 */
    h2 + p {
      font-weight: 700;
    }

    /* General sibling: every ul that comes after an h2 (same parent) */
    h2 ~ ul {
      background-color: rgb(236, 253, 245);
    }
  </style>
</head>
<body>
  <article class="card">
    <h2>Desk Lamp</h2>
    <p>Direct child, right after h2: red, italic and bold.</p>
    <p>Direct child: red and italic.</p>
    <div class="details">
      <p>Grandchild: italic only (not red).</p>
    </div>
    <ul>
      <li>Comes after the h2, so it gets a green background.</li>
    </ul>
  </article>
</body>
</html>`;

const pseudo = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Pseudo-classes and pseudo-elements</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 16px;
    }

    /* Zebra stripes: 2nd, 4th, 6th ... item */
    .orders li:nth-child(2n) {
      background-color: rgb(243, 244, 246);
    }

    .orders li:first-child {
      font-weight: 700;
    }

    .orders li:last-child {
      color: rgb(107, 114, 128);
    }

    /* Every button except the ones with class="ghost" */
    button:not(.ghost) {
      background-color: rgb(37, 99, 235);
      color: rgb(255, 255, 255);
      border: none;
      padding: 8px 12px;
    }

    /* State: the mouse is over the button */
    button:hover {
      background-color: rgb(29, 78, 216);
    }

    /* State: focused by the keyboard (Tab key) */
    button:focus-visible {
      outline: 3px solid rgb(245, 158, 11);
      outline-offset: 2px;
    }

    /* Pseudo-elements: generated content and the first line */
    .required::after {
      content: " *";
      color: rgb(185, 28, 28);
    }

    .intro::first-line {
      font-weight: 700;
    }
  </style>
</head>
<body>
  <p class="intro">Your recent orders are listed below. The first line of this paragraph is bold because of the ::first-line pseudo-element, however wide the window is.</p>

  <ul class="orders">
    <li>Order #1001 (header row, bold)</li>
    <li>Order #1002</li>
    <li>Order #1003</li>
    <li>Order #1004</li>
    <li>Order #1005 (last, grey)</li>
  </ul>

  <label class="required">Email</label>

  <p>
    <button>Hover me, then press Tab</button>
    <button class="ghost">Ghost button (unstyled)</button>
  </p>
</body>
</html>`;

const recipeStarter = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Recipe</title>
  <style>
    /* 1. Make h1 AND h2 blue: rgb(30, 64, 175) using ONE rule */

    /* 2. Make every paragraph dark grey: rgb(55, 65, 81) */

    /* 3. Give elements with class "tip" a yellow background: rgb(254, 243, 199) */

  </style>
</head>
<body>
  <h1>Tomato Soup</h1>
  <p>A quick soup for cold evenings.</p>
  <h2>Steps</h2>
  <p>Simmer the tomatoes for 20 minutes.</p>
  <p class="tip">Tip: add a pinch of sugar to balance the acidity.</p>
</body>
</html>`;

const recipeSolution = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Recipe</title>
  <style>
    h1, h2 {
      color: rgb(30, 64, 175);
    }

    p {
      color: rgb(55, 65, 81);
    }

    .tip {
      background-color: rgb(254, 243, 199);
    }
  </style>
</head>
<body>
  <h1>Tomato Soup</h1>
  <p>A quick soup for cold evenings.</p>
  <h2>Steps</h2>
  <p>Simmer the tomatoes for 20 minutes.</p>
  <p class="tip">Tip: add a pinch of sugar to balance the acidity.</p>
</body>
</html>`;

const helpBody = `<body>
  <article class="card">
    <h2>Help centre</h2>
    <p>Answers to common questions.</p>
    <div class="extra">
      <p>Nested note: must keep its default colour.</p>
    </div>
    <ol class="steps">
      <li>Open your account</li>
      <li>Choose Orders</li>
      <li>Pick the order</li>
      <li>Press Return item</li>
    </ol>
    <p>
      <a href="/contact">Contact us</a>
      <a href="https://status.example.com">Service status</a>
    </p>
    <p>
      <span class="tag tag-active">Orders</span>
      <span class="tag">Payments</span>
      <span class="tag">Delivery</span>
    </p>
  </article>
</body>
</html>`;

const helpStarter = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Help centre</title>
  <style>
    /* 1. Paragraphs that are DIRECT children of .card: rgb(17, 94, 89) */

    /* 2. Every second step in .steps: background rgb(243, 244, 246) */

    /* 3. Links whose href starts with "https": rgb(124, 58, 237) */

    /* 4. Tags that do NOT have the class tag-active: rgb(107, 114, 128) */

  </style>
</head>
${helpBody}`;

const helpSolution = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Help centre</title>
  <style>
    .card > p {
      color: rgb(17, 94, 89);
    }

    .steps li:nth-child(2n) {
      background-color: rgb(243, 244, 246);
    }

    a[href^="https"] {
      color: rgb(124, 58, 237);
    }

    .tag:not(.tag-active) {
      color: rgb(107, 114, 128);
    }
  </style>
</head>
${helpBody}`;

const cartBuggy = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cart summary</title>
  <style>
    price {
      font-weight: 700;
    }

    button .primary {
      background-color: rgb(37, 99, 235);
    }

    .badge {
      color: rgb(22, 101, 52);
    }
  </style>
</head>
<body>
  <section class="cart">
    <h2>Your cart <span class=".badge">3 items</span></h2>
    <p>Subtotal: <span class="price">$84.00</span></p>
    <button class="primary">Checkout</button>
    <button>Continue shopping</button>
  </section>
</body>
</html>`;

const cartFixed = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cart summary</title>
  <style>
    .price {
      font-weight: 700;
    }

    button.primary {
      background-color: rgb(37, 99, 235);
    }

    .badge {
      color: rgb(22, 101, 52);
    }
  </style>
</head>
<body>
  <section class="cart">
    <h2>Your cart <span class="badge">3 items</span></h2>
    <p>Subtotal: <span class="price">$84.00</span></p>
    <button class="primary">Checkout</button>
    <button>Continue shopping</button>
  </section>
</body>
</html>`;

const shopBody = `<body>
  <header class="shop-header">
    <input type="search" placeholder="Search products">
    <input type="text" placeholder="Postcode">
    <a href="/cart">Cart</a>
  </header>

  <ul class="product-list">
    <li class="product">
      <h2>Desk Lamp</h2>
      <p class="price">$35.00</p>
      <ul class="specs">
        <li>LED bulb</li>
        <li>Dimmable</li>
      </ul>
      <a href="https://reviews.example.com/desk-lamp">Read reviews</a>
    </li>
    <li class="product sold-out">
      <h2>Office Chair</h2>
      <p class="price">$180.00</p>
      <ul class="specs">
        <li>Mesh back</li>
        <li>Adjustable height</li>
      </ul>
    </li>
    <li class="product">
      <h2>Notebook</h2>
      <p class="price">$4.50</p>
    </li>
    <li class="product">
      <h2>Monitor Stand</h2>
      <p class="price">$42.00</p>
    </li>
  </ul>
</body>
</html>`;

const shopStarter = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Product list</title>
  <style>
    /* 1. Even product rows (direct li children of .product-list): background rgb(243, 244, 246) */

    /* 2. Products that are sold out: text colour rgb(156, 163, 175) */

    /* 3. Prices: font-weight 700 */

    /* 4. External links (href starts with "https"): colour rgb(37, 99, 235) */

    /* 5. The search input only: background rgb(239, 246, 255) */

  </style>
</head>
${shopBody}`;

const shopSolution = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Product list</title>
  <style>
    .product-list > li:nth-child(2n) {
      background-color: rgb(243, 244, 246);
    }

    .product.sold-out {
      color: rgb(156, 163, 175);
    }

    .price {
      font-weight: 700;
    }

    a[href^="https"] {
      color: rgb(37, 99, 235);
    }

    input[type="search"] {
      background-color: rgb(239, 246, 255);
    }
  </style>
</head>
${shopBody}`;

export const selectors: Lesson = {
  id: "css-selectors",
  slug: "selectors",
  title: "Selectors",
  summary:
    "Learn how CSS picks the elements it styles: type, class, id, attribute and universal selectors, combinators, pseudo-classes and pseudo-elements.",
  difficulty: "beginner",
  minutes: 30,
  tech: ["css", "html"],
  htmlCheck: { mode: "document" },
  tags: ["css", "selectors", "class", "id", "combinators", "pseudo-classes", "pseudo-elements", "attribute selectors"],
  objectives: [
    "Target elements with type, class, id, universal and attribute selectors.",
    "Group selectors with a comma and build compound selectors such as `button.primary`.",
    "Explain the difference between the descendant, child (`>`), adjacent sibling (`+`) and general sibling (`~`) combinators.",
    "Use common pseudo-classes (`:hover`, `:focus-visible`, `:first-child`, `:nth-child()`, `:not()`) and the `::before`, `::after` and `::first-line` pseudo-elements.",
    "Choose purpose-based class names and prefer classes over ids for styling.",
  ],
  prerequisites: ["css-what-is-css"],
  intro: [
    {
      kind: "paragraph",
      text: "A CSS rule has two halves: *what* to style and *how* to style it. The **selector** is the \"what\". It is a pattern the browser compares against every element on the page; each element that fits the pattern receives the declarations inside the curly braces.",
    },
    {
      kind: "paragraph",
      text: "Selectors decide whether your styles land on exactly the right elements, on too many, or on none at all. Most \"my CSS does nothing\" moments are really selector problems: a missing dot, an extra space, or a pattern that matches a different part of the page than you expected.",
    },
    {
      kind: "paragraph",
      text: "You will use selectors everywhere: in stylesheets, in JavaScript (`document.querySelector(\".cart\")` takes the very same patterns), and in testing tools such as Cypress and Playwright that find buttons and inputs by selector. By the end of this lesson you will be able to read a selector out loud, predict which elements it matches, and write precise selectors for real page components.",
    },
  ],
  terms: [
    { term: "Selector", definition: "The part of a CSS rule before `{` that describes which elements the rule applies to." },
    { term: "Type selector", definition: "A selector that is just an element name, such as `p` or `button`. It matches every element of that type." },
    { term: "Class selector", definition: "A dot followed by a class name, such as `.card`. It matches every element whose `class` attribute contains that name." },
    { term: "ID selector", definition: "A `#` followed by an id, such as `#checkout`. It matches the element whose `id` attribute equals that value; an id should be unique in the page." },
    { term: "Universal selector", definition: "The asterisk `*`, which matches every element." },
    { term: "Attribute selector", definition: "A selector in square brackets that matches elements by their attributes, such as `[type=\"email\"]` or `[href^=\"https\"]`." },
    { term: "Selector list", definition: "Several selectors separated by commas (`h1, h2`). The rule applies to elements matching *any* of them. Also called grouping." },
    { term: "Compound selector", definition: "Simple selectors written together with no space, such as `button.primary`. An element must match *all* parts at once." },
    { term: "Combinator", definition: "A symbol between selectors that describes a relationship in the document tree: a space (descendant), `>` (child), `+` (adjacent sibling) or `~` (general sibling)." },
    { term: "DOM tree", definition: "The browser's tree of element objects built from your HTML. Elements inside another element are its *children* (and *descendants*); elements sharing the same parent are *siblings*." },
    { term: "Pseudo-class", definition: "A keyword after a single colon, such as `:hover` or `:first-child`, that matches elements by state or position rather than by name or attribute." },
    { term: "Pseudo-element", definition: "A keyword after a double colon, such as `::before` or `::first-line`, that styles a part of an element or content the browser generates." },
    { term: "Specificity", definition: "A score the browser calculates for each selector. When two rules set the same property on the same element, the more specific selector usually wins. Covered fully in the next lesson." },
  ],
  sections: [
    {
      id: "explanation",
      title: "How selectors find elements",
      blocks: [
        {
          kind: "paragraph",
          text: "When the browser has built the DOM tree from your HTML and read your CSS, it checks every rule's selector against the elements in the tree. A selector is a yes/no question asked of each element: *\"Are you a `p`?\"*, *\"Do you have the class `note`?\"*, *\"Is your parent a `.card`?\"* Every element that answers yes gets the rule's declarations.",
        },
        {
          kind: "diagram",
          title: "From selector to styled element",
          variant: "flow",
          steps: [
            { label: "Browser parses HTML", detail: "builds the DOM tree of elements" },
            { label: "Browser parses CSS", detail: "reads each rule: selector + declarations" },
            { label: "Matching", detail: "each selector is tested against every element" },
            { label: "Conflicts resolved", detail: "if several rules set the same property, the cascade and specificity decide" },
            { label: "Page painted", detail: "every element is drawn with its final styles" },
          ],
        },
        { kind: "heading", text: "The basic selectors" },
        {
          kind: "table",
          caption: "Simple selectors",
          headers: ["Selector", "Example", "Matches"],
          rows: [
            ["Type", "`p`", "Every `<p>` element"],
            ["Class", "`.card`", "Every element with `card` in its `class` attribute"],
            ["ID", "`#checkout`", "The element with `id=\"checkout\"`"],
            ["Universal", "`*`", "Every element"],
            ["Attribute present", "`[disabled]`", "Elements that have a `disabled` attribute, whatever its value"],
            ["Attribute equals", "`[type=\"email\"]`", "Elements whose `type` is exactly `email`"],
            ["Attribute starts with", "`[href^=\"https\"]`", "Elements whose `href` begins with `https`"],
          ],
        },
        {
          kind: "paragraph",
          text: "An element can have several classes separated by spaces: `<button class=\"btn primary\">` matches `.btn` *and* `.primary`. That is why classes are the workhorse of CSS: you can mix and reuse them freely, while an id must be unique and can appear only once per page.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Other attribute operators",
          text: "Besides `=` and `^=`, there are `$=` (ends with, e.g. `[href$=\".pdf\"]`) and `*=` (contains anywhere). You will mostly need `[attr]`, `=` and `^=`.",
        },
        { kind: "heading", text: "Grouping versus compound selectors" },
        {
          kind: "paragraph",
          text: "A comma and \"no space\" mean very different things. `h1, h2` is a **selector list**: style `h1` elements *and also* `h2` elements. `button.primary` is a **compound selector**: style elements that are a `button` *and at the same time* have the class `primary`. Read the comma as \"or\" and the missing space as \"and\".",
        },
        { kind: "heading", text: "Combinators and the DOM tree" },
        {
          kind: "paragraph",
          text: "Combinators match elements by where they sit in the tree. Take this markup: an `<article class=\"card\">` containing an `<h2>`, two `<p>` elements, and a `<div>` that holds one more `<p>`.",
        },
        {
          kind: "diagram",
          title: "The DOM tree of a card",
          variant: "stack",
          steps: [
            { label: "article.card", detail: "the parent of everything below" },
            { label: "├─ h2", detail: "child of .card; first child" },
            { label: "├─ p (A)", detail: "child of .card; comes right after h2" },
            { label: "├─ p (B)", detail: "child of .card; sibling of A, two steps after h2" },
            { label: "└─ div.details", detail: "child of .card" },
            { label: "     └─ p (C)", detail: "grandchild of .card: a descendant, but NOT a child" },
          ],
        },
        {
          kind: "table",
          caption: "Which paragraphs does each combinator match in the tree above?",
          headers: ["Selector", "Name", "Read it as", "Matches"],
          rows: [
            ["`.card p`", "Descendant (space)", "a `p` anywhere inside `.card`", "A, B, C"],
            ["`.card > p`", "Child", "a `p` whose parent is `.card`", "A, B"],
            ["`h2 + p`", "Adjacent sibling", "a `p` immediately after an `h2`, same parent", "A"],
            ["`h2 ~ p`", "General sibling", "any `p` after an `h2`, same parent", "A, B"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Read selectors right to left",
          text: "The **rightmost** part is the element that actually gets styled. `.card > p` styles paragraphs, not cards; the `.card >` part is only a condition about the paragraph's parent.",
        },
        { kind: "heading", text: "Pseudo-classes: state and position" },
        {
          kind: "paragraph",
          text: "A pseudo-class adds a condition that is not written in the HTML. Some depend on what the user is doing, others on an element's position among its siblings.",
        },
        {
          kind: "table",
          caption: "Common pseudo-classes",
          headers: ["Pseudo-class", "Matches when…"],
          rows: [
            ["`:hover`", "the mouse pointer is over the element"],
            ["`:focus`", "the element has focus (clicked into, or reached with Tab)"],
            ["`:focus-visible`", "the element has focus *and* the browser decides a focus ring should be shown, typically for keyboard users"],
            ["`:first-child`", "the element is the first child of its parent"],
            ["`:last-child`", "the element is the last child of its parent"],
            ["`:nth-child(2n)`", "the element is the 2nd, 4th, 6th… child of its parent (also `even`, `odd`, `2n+1`, or a number such as `3`)"],
            ["`:not(.x)`", "the element does **not** match the selector inside the brackets"],
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: ":first-child means first child, not first of its type",
          text: "`p:first-child` matches a `p` only if it is the very first child of its parent. If an `h2` comes first, no paragraph matches. `:nth-child` counts all element siblings in the same way. When you need \"the first paragraph\", use `p:first-of-type`.",
        },
        { kind: "heading", text: "Pseudo-elements: parts of an element" },
        {
          kind: "paragraph",
          text: "Pseudo-elements use a double colon. `::before` and `::after` create an extra box at the start or end of an element's content. They only appear when you set the `content` property (even `content: \"\"`). `::first-line` styles whichever text currently fits on the first line, so it changes as the window is resized. Use generated content for decoration such as icons or a required-field asterisk, not for important text, because it is not part of the HTML.",
        },
        { kind: "heading", text: "Classes over ids, and naming by purpose" },
        {
          kind: "paragraph",
          text: "Both `.checkout` and `#checkout` work, but an id selector is far more *specific* than a class selector, so later rules struggle to override it, and an id can only be used once per page. For styling, prefer classes. Keep ids for page anchors (`href=\"#reviews\"`), linking a `<label for>` to an input, and JavaScript hooks. Name classes after what something **is or does** (`.price`, `.error-message`, `.btn-primary`), not how it looks today (`.red-text`, `.big-left`). When the design changes from red to orange, `.error-message` is still accurate; `.red-text` becomes a lie.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Coming next: specificity",
          text: "What happens when `.card p` says red and `p` says blue? The browser compares the selectors' **specificity**: roughly, ids beat classes, and classes (plus attributes and pseudo-classes) beat element names. You will learn the full rules in [The Cascade, Specificity and Inheritance](/learn/css/cascade-specificity).",
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax",
      blocks: [
        {
          kind: "code",
          language: "css",
          title: "Anatomy of a rule",
          code: "selector {\n  property: value;\n}\n\n/* example */\n.card > p {\n  color: rgb(55, 65, 81);\n}",
        },
        {
          kind: "code",
          language: "css",
          title: "Selector cheat code",
          code: "p { }                  /* type */\n.price { }             /* class */\n#main { }              /* id */\n* { }                  /* universal */\n[disabled] { }         /* has attribute */\ninput[type=\"email\"] { } /* attribute equals (compound with a type) */\na[href^=\"https\"] { }    /* attribute starts with */\nh1, h2, h3 { }         /* selector list: h1 OR h2 OR h3 */\nbutton.primary { }     /* compound: a button AND class primary */\n.btn.large { }         /* compound: both classes on one element */\nnav a { }              /* descendant */\nul > li { }            /* child */\nh2 + p { }             /* adjacent sibling */\nh2 ~ p { }             /* general sibling */\na:hover { }            /* pseudo-class */\nli:nth-child(odd) { }  /* pseudo-class with an argument */\n.tag:not(.active) { }  /* negation */\n.quote::before { }     /* pseudo-element */",
        },
        {
          kind: "list",
          items: [
            "Class names and ids are **case-sensitive**: `.Card` does not match `class=\"card\"`.",
            "In the HTML you write the bare name (`class=\"card\"`); the dot or hash only appears in CSS.",
            "Spaces matter: `button.primary` (no space) is one element; `button .primary` (space) is a `.primary` element *inside* a button.",
            "Spaces around `>`, `+` and `~` are optional: `ul>li` and `ul > li` are the same. Spaces are easier to read.",
            "If any selector in a comma-separated list is invalid, the browser throws away the whole rule.",
          ],
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "Basic, attribute and grouped selectors" },
        {
          kind: "paragraph",
          text: "Run this page and compare each element with the rule that targets it. Notice that `p.note` makes only the *paragraph* note bold, while `.note` gives both notes a yellow background.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: sampler },
        { kind: "heading", text: "Combinators side by side" },
        {
          kind: "paragraph",
          text: "The nested paragraph inside `.details` is italic (descendant rule) but not red (child rule), because its parent is the `div`, not the card.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: combinators },
        { kind: "heading", text: "Pseudo-classes and pseudo-elements" },
        {
          kind: "paragraph",
          text: "Hover over the blue button, then click in the page and press Tab to see the `:focus-visible` outline. The asterisk after \"Email\" comes from `::after`; it is not in the HTML.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: pseudo },
      ],
    },
    {
      id: "walkthrough",
      title: "Code walkthrough",
      blocks: [
        {
          kind: "paragraph",
          text: "Here is a small stylesheet for a site navigation bar. Each rule uses a different kind of selector.",
        },
        {
          kind: "code",
          language: "css",
          code: ".site-nav > ul {\n  list-style: none;\n}\n\n.site-nav a {\n  color: rgb(31, 41, 55);\n}\n\n.site-nav a[aria-current=\"page\"] {\n  font-weight: 700;\n}\n\n.site-nav li + li {\n  border-left: 1px solid rgb(209, 213, 219);\n}\n\n.site-nav a:hover,\n.site-nav a:focus-visible {\n  text-decoration: underline;\n}\n\n.site-nav a[href^=\"https\"]::after {\n  content: \" ↗\";\n}",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "`.site-nav > ul` targets only the list that is a **direct child** of the nav, so a dropdown list nested deeper is not affected.",
            "`.site-nav a` uses the **descendant** combinator: every link anywhere inside the nav gets the dark grey colour.",
            "`.site-nav a[aria-current=\"page\"]` adds an **attribute** condition. Only the link marked as the current page becomes bold. Using an attribute that also helps screen readers means the style and the accessibility information never drift apart.",
            "`.site-nav li + li` matches every `li` that comes **immediately after** another `li`. That is every item except the first, so the dividers appear *between* items, never before the first one.",
            "`.site-nav a:hover, .site-nav a:focus-visible` is a **selector list** with two **pseudo-classes**: the underline appears for mouse users and for keyboard users alike.",
            "`.site-nav a[href^=\"https\"]::after` combines an attribute selector with a **pseudo-element**: links to other websites get a small arrow added after their text, without changing the HTML.",
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
            "**Component styling:** design systems are built from classes such as `.card`, `.card-title` and `.btn-primary` that any page can reuse.",
            "**Forms:** `input[type=\"email\"]`, `[disabled]` and `[required]` style fields by their purpose and state without extra classes. You will meet form-state pseudo-classes in *Built-in Form Validation* (an upcoming HTML lesson).",
            "**Tables and lists:** `tr:nth-child(even)` creates zebra stripes that stay correct when rows are added or removed.",
            "**Accessibility:** `:focus-visible` gives keyboard users a clear focus ring without showing it on every mouse click.",
            "**JavaScript:** `document.querySelector(\".cart > .total\")` and `querySelectorAll(\"li:not(.done)\")` use exactly the selector syntax from this lesson.",
            "**Test automation:** Cypress and Playwright locate elements with selectors such as `[data-testid=\"checkout-button\"]`. Attribute selectors on dedicated test attributes keep tests stable when classes change.",
          ],
        },
        {
          kind: "table",
          caption: "Which selector should I reach for?",
          headers: ["Situation", "Good choice", "Why"],
          rows: [
            ["Base styles for all paragraphs", "`p`", "Sets a default for every element of a type"],
            ["A reusable component", "`.card`", "Reusable, low specificity, easy to override"],
            ["One variant of a component", "`.btn.primary` or `.btn-primary`", "Builds on the base class"],
            ["Elements by their HTML state", "`[disabled]`, `[aria-current=\"page\"]`", "Style follows the real state"],
            ["Only direct children", "`.menu > li`", "Nested menus stay unaffected"],
            ["Keyboard focus styles", "`:focus-visible`", "Visible for keyboard users, quiet for mouse clicks"],
            ["Styling a single unique element", "a class, not `#id`", "Ids are hard to override and cannot be reused"],
          ],
        },
      ],
    },
  ],
  bestPractices: [
    "**Style with classes.** Give components meaningful class names and target those, rather than ids or long chains of element names.",
    "**Name classes by purpose**, such as `.price`, `.error-message` or `.product-card`, not by appearance, such as `.red` or `.big-text`.",
    "**Keep selectors short.** `.product-title` is easier to read, reuse and override than `body main section div ul li h2`. Deep selectors break as soon as the HTML structure changes.",
    "**Never remove focus styles without replacing them.** If you change `outline`, provide a clear `:focus-visible` style so keyboard users can see where they are.",
    "**Use `>` when you mean \"direct child\"** so nested content (dropdowns, nested lists, embedded components) is not styled by accident.",
    "**Advanced:** style by real attributes and states (`[aria-expanded=\"true\"]`, `[disabled]`) when they exist, so the visual state can never disagree with the accessible state.",
  ],
  commonMistakes: [
    {
      title: "Forgetting the dot on a class selector",
      wrong: "price {\n  font-weight: 700;\n}",
      right: ".price {\n  font-weight: 700;\n}",
      explanation: "Without the dot, `price` is a *type* selector looking for a `<price>` element, which does not exist. Class selectors always start with `.`.",
    },
    {
      title: "Writing the dot in the HTML",
      wrong: "<span class=\".badge\">New</span>",
      right: "<span class=\"badge\">New</span>",
      explanation: "The dot belongs only in CSS. In HTML, the `class` attribute holds the bare name. `class=\".badge\"` creates a class literally called `.badge`, which `.badge` in CSS does not match.",
    },
    {
      title: "An accidental space in a compound selector",
      wrong: "button .primary {\n  background-color: rgb(37, 99, 235);\n}",
      right: "button.primary {\n  background-color: rgb(37, 99, 235);\n}",
      explanation: "A space is the descendant combinator. `button .primary` looks for a `.primary` element *inside* a button. To target a button that *has* the class, write them together with no space.",
    },
    {
      title: "Expecting :first-child to mean \"first of this type\"",
      wrong: "/* HTML: <article><h2>…</h2><p>Intro</p>…</article> */\narticle p:first-child {\n  font-size: 20px;\n}",
      right: "article p:first-of-type {\n  font-size: 20px;\n}",
      explanation: "The `h2` is the first child, so no `p` is a first child and nothing matches. `:first-of-type` counts only siblings of the same element type.",
    },
    {
      title: "Using ::before or ::after without content",
      wrong: ".required::after {\n  color: rgb(185, 28, 28);\n}",
      right: ".required::after {\n  content: \" *\";\n  color: rgb(185, 28, 28);\n}",
      explanation: "The generated box only exists when `content` is set. Without it, the rule has nothing to style.",
    },
    {
      title: "Removing the focus outline for everyone",
      wrong: "button:focus {\n  outline: none;\n}",
      right: "button:focus-visible {\n  outline: 3px solid rgb(245, 158, 11);\n}",
      explanation: "Keyboard users rely on the focus ring to know where they are. If the default outline doesn't suit your design, replace it with your own `:focus-visible` style rather than deleting it.",
    },
  ],
  debugging: [
    "**Inspect the element.** Right-click it and choose *Inspect*. The *Styles* pane in DevTools lists every rule whose selector matches, most specific first. If your rule is missing from the list, the selector does not match; if it is there but crossed out, another rule won (a specificity issue, covered next lesson).",
    "**Test the selector in the Console.** Type `document.querySelectorAll(\".card > p\")` in the DevTools Console. The result shows exactly which elements match, and hovering an entry highlights it on the page.",
    "**Force states.** To debug `:hover` or `:focus-visible` rules, select the element in the *Elements* panel and use the `:hov` button in the Styles pane to force the state on without moving the mouse.",
    "**Check spelling and case.** Compare the class in the HTML with the selector letter by letter: `.product-card` vs `product_card` vs `.ProductCard` are all different.",
    "**Look for invalid selectors.** One typo in a selector list (`h1, h2!, h3`) discards the whole rule. Run your CSS through the [W3C CSS Validator](https://jigsaw.w3.org/css-validator/) to catch syntax errors.",
  ],
  examples: [
    { id: "css-selectors-example-sampler", title: "Selector sampler", runtime: "web", code: sampler },
    { id: "css-selectors-example-combinators", title: "Combinators side by side", runtime: "web", code: combinators },
    { id: "css-selectors-example-pseudo", title: "Pseudo-classes and pseudo-elements", runtime: "web", code: pseudo },
  ],
  exercises: [
    {
      id: "css-selectors-ex-1",
      type: "code",
      runtime: "web",
      difficulty: "beginner",
      prompt: "Style the recipe page with type, class and grouped selectors.",
      instructions:
        "Inside the `<style>` element: (1) make `h1` and `h2` the colour `rgb(30, 64, 175)` using **one** rule with a selector list; (2) make every paragraph `rgb(55, 65, 81)`; (3) give elements with the class `tip` the background colour `rgb(254, 243, 199)`. Don't change the HTML.",
      starter: recipeStarter,
      tests: [
        {
          name: "h1 is blue",
          code: "assert.equal(getComputedStyle(document.querySelector(\"h1\")).color, \"rgb(30, 64, 175)\", \"The h1 should be rgb(30, 64, 175)\");",
        },
        {
          name: "h2 is blue",
          code: "assert.equal(getComputedStyle(document.querySelector(\"h2\")).color, \"rgb(30, 64, 175)\", \"The h2 should be rgb(30, 64, 175)\");",
        },
        {
          name: "every paragraph is dark grey",
          code: "const ps = document.querySelectorAll(\"p\");\nassert.equal(ps.length, 3, \"Keep all three paragraphs\");\nps.forEach((p) => assert.equal(getComputedStyle(p).color, \"rgb(55, 65, 81)\", \"Every <p> should be rgb(55, 65, 81)\"));",
        },
        {
          name: "the tip has a yellow background",
          code: "assert.equal(getComputedStyle(document.querySelector(\".tip\")).backgroundColor, \"rgb(254, 243, 199)\", \"Use a .tip class selector for the background\");",
        },
        {
          name: "other paragraphs have no yellow background",
          code: "const first = document.querySelector(\"p:not(.tip)\");\nassert.notEqual(getComputedStyle(first).backgroundColor, \"rgb(254, 243, 199)\", \"Only the .tip paragraph should be yellow\");",
        },
      ],
      solution: recipeSolution,
      hints: [
        "A selector list separates selectors with a comma: `h1, h2 { … }`.",
        "A type selector is just the element name: `p { … }`.",
        "A class selector starts with a dot: `.tip { … }`.",
      ],
      explanation:
        "`h1, h2` applies one rule to both heading levels, `p` matches every paragraph, and `.tip` matches only the element whose `class` contains `tip`. Because the tip is also a `p`, it gets both the grey text *and* the yellow background.",
    },
    {
      id: "css-selectors-ex-2",
      type: "match",
      difficulty: "beginner",
      prompt: "Match each selector with the elements it selects.",
      pairs: [
        { left: "`p`", right: "Every `<p>` element" },
        { left: "`.note`", right: "Every element with the class `note`" },
        { left: "`#cart`", right: "The element with `id=\"cart\"`" },
        { left: "`*`", right: "Every element on the page" },
        { left: "`a[target]`", right: "Links that have a `target` attribute" },
        { left: "`h2 + p`", right: "A `<p>` that comes immediately after an `<h2>`" },
      ],
      hints: ["`.` means class and `#` means id.", "Square brackets test attributes.", "`+` means \"immediately after\"."],
      explanation:
        "Type selectors are bare names, classes use `.`, ids use `#`, `*` matches everything, `[attr]` checks for an attribute, and `+` is the adjacent sibling combinator.",
    },
    {
      id: "css-selectors-ex-3",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Fill in the missing symbols so each selector matches its comment.",
      template:
        "/* li elements whose parent is .menu */\n.menu ___ li { }\n\n/* inputs whose type is exactly \"email\" */\ninput[type___\"email\"] { }\n\n/* button elements that also have the class primary */\nbutton___primary { }\n\n/* links whose href starts with \"https\" */\na[href___\"https\"] { }",
      blanks: [{ answers: [">"] }, { answers: ["="] }, { answers: ["."] }, { answers: ["^="] }],
      hints: [
        "\"Whose parent is\" means the child combinator.",
        "A compound selector has no space between its parts.",
        "\"Starts with\" uses a caret before the equals sign.",
      ],
      explanation:
        "`.menu > li` uses the child combinator, `[type=\"email\"]` is an exact attribute match, `button.primary` is a compound selector with no space, and `[href^=\"https\"]` matches values that start with `https`.",
    },
    {
      id: "css-selectors-ex-4",
      type: "code",
      runtime: "web",
      difficulty: "intermediate",
      prompt: "Style a help-centre card using combinators, attribute selectors and pseudo-classes.",
      instructions:
        "Add four rules: (1) paragraphs that are **direct children** of `.card` get `color: rgb(17, 94, 89)`; the paragraph inside `.extra` must keep its default colour. (2) Every second step in `.steps` gets `background-color: rgb(243, 244, 246)`. (3) Links whose `href` starts with `https` get `color: rgb(124, 58, 237)`. (4) Elements with class `tag` that do **not** have the class `tag-active` get `color: rgb(107, 114, 128)`. Don't change the HTML.",
      starter: helpStarter,
      tests: [
        {
          name: "direct child paragraphs are teal",
          code: "const ps = document.querySelectorAll(\".card > p\");\nassert.ok(ps.length >= 1, \"Keep the paragraphs inside .card\");\nassert.equal(getComputedStyle(ps[0]).color, \"rgb(17, 94, 89)\", \"Paragraphs that are direct children of .card should be rgb(17, 94, 89)\");",
        },
        {
          name: "the nested paragraph is not teal",
          code: "const nested = document.querySelector(\".extra p\");\nassert.notEqual(getComputedStyle(nested).color, \"rgb(17, 94, 89)\", \"The paragraph inside .extra is a grandchild; use the child combinator > so it is not matched\");",
        },
        {
          name: "even steps are striped, odd steps are not",
          code: "const steps = document.querySelectorAll(\".steps li\");\nassert.equal(getComputedStyle(steps[1]).backgroundColor, \"rgb(243, 244, 246)\", \"Step 2 should be striped\");\nassert.equal(getComputedStyle(steps[3]).backgroundColor, \"rgb(243, 244, 246)\", \"Step 4 should be striped\");\nassert.notEqual(getComputedStyle(steps[0]).backgroundColor, \"rgb(243, 244, 246)\", \"Step 1 should not be striped\");\nassert.notEqual(getComputedStyle(steps[2]).backgroundColor, \"rgb(243, 244, 246)\", \"Step 3 should not be striped\");",
        },
        {
          name: "only the https link is purple",
          code: "assert.equal(getComputedStyle(document.querySelector('a[href^=\"https\"]')).color, \"rgb(124, 58, 237)\", \"The https link should be rgb(124, 58, 237)\");\nassert.notEqual(getComputedStyle(document.querySelector('a[href=\"/contact\"]')).color, \"rgb(124, 58, 237)\", \"The internal /contact link should not be purple\");",
        },
        {
          name: "inactive tags are grey, the active tag is not",
          code: "const tags = document.querySelectorAll(\".tag\");\nassert.notEqual(getComputedStyle(tags[0]).color, \"rgb(107, 114, 128)\", \"The .tag-active tag should not be grey\");\nassert.equal(getComputedStyle(tags[1]).color, \"rgb(107, 114, 128)\", \"Inactive tags should be grey\");\nassert.equal(getComputedStyle(tags[2]).color, \"rgb(107, 114, 128)\", \"Inactive tags should be grey\");",
        },
      ],
      solution: helpSolution,
      hints: [
        "The child combinator is `>`: `.card > p`.",
        "`:nth-child(2n)` (or `:nth-child(even)`) matches the 2nd, 4th, … child.",
        "\"Starts with\" in an attribute selector is `^=`.",
        "`:not()` takes a selector: `.tag:not(.tag-active)`.",
      ],
      explanation:
        "`.card > p` only matches paragraphs whose parent is the card, so the paragraph inside `.extra` is skipped (a descendant selector `.card p` would have matched it). `.steps li:nth-child(2n)` stripes items 2 and 4, `a[href^=\"https\"]` picks external links by their URL, and `.tag:not(.tag-active)` styles every tag except the active one.",
    },
    {
      id: "css-selectors-ex-5",
      type: "find-bug",
      runtime: "web",
      difficulty: "beginner",
      debugging: true,
      prompt:
        "This cart summary should show a bold price, a blue Checkout button and a green item badge, but none of the styles appear. There are three selector bugs (one is in the HTML). Find and fix them.",
      code: cartBuggy,
      tests: [
        {
          name: "the price is bold",
          code: "assert.equal(getComputedStyle(document.querySelector(\".cart p span\")).fontWeight, \"700\", \"The price should have font-weight 700. Is your class selector missing something?\");",
        },
        {
          name: "the Checkout button is blue",
          code: "const btn = document.querySelectorAll(\"button\")[0];\nassert.equal(getComputedStyle(btn).backgroundColor, \"rgb(37, 99, 235)\", \"The Checkout button should be rgb(37, 99, 235). A space means 'inside'.\");",
        },
        {
          name: "the other button is not blue",
          code: "const other = document.querySelectorAll(\"button\")[1];\nassert.notEqual(getComputedStyle(other).backgroundColor, \"rgb(37, 99, 235)\", \"Only the button with class primary should be blue\");",
        },
        {
          name: "the badge is green",
          code: "assert.equal(getComputedStyle(document.querySelector(\"h2 span\")).color, \"rgb(22, 101, 52)\", \"The badge should be rgb(22, 101, 52). Check the class attribute in the HTML.\");",
        },
      ],
      solution: cartFixed,
      hints: [
        "Which selector is missing the dot that marks a class?",
        "`button .primary` has a space. What does a space mean between two selectors?",
        "Look at the `class` attribute of the badge in the HTML. Does it need a dot there?",
      ],
      explanation:
        "`price` is a type selector for a non-existent `<price>` element; it must be `.price`. `button .primary` looks for a `.primary` element *inside* a button; the button itself has the class, so the compound selector `button.primary` is needed. Finally, `class=\".badge\"` creates a class named `.badge` with a dot in it; the HTML must say `class=\"badge\"`.",
    },
  ],
  quiz: [
    {
      id: "css-selectors-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Which paragraphs does `.card > p` select?",
      code: "<div class=\"card\">\n  <p>A</p>\n  <div>\n    <p>B</p>\n  </div>\n  <p>C</p>\n</div>",
      options: [
        { id: "a", text: "A and C", explanation: "Correct. A and C are direct children of `.card`; B's parent is the inner `div`." },
        { id: "b", text: "A, B and C", explanation: "That is what the descendant selector `.card p` would match. `>` only allows direct children." },
        { id: "c", text: "Only A", explanation: "C is also a direct child of `.card`. Position among siblings doesn't matter here." },
        { id: "d", text: "Only B", explanation: "B is a grandchild of `.card`, so the child combinator excludes it." },
      ],
      answer: "a",
      hints: ["`>` means \"whose parent is\"."],
      explanation: "The child combinator matches only elements whose **parent** is `.card`. A and C qualify; B is nested one level deeper.",
    },
    {
      id: "css-selectors-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What is the difference between `h1, h2 { }` and `h1 h2 { }`?",
      options: [
        {
          id: "a",
          text: "`h1, h2` styles every h1 and every h2; `h1 h2` styles only h2 elements inside an h1",
          explanation: "Correct. The comma creates a selector list; the space is the descendant combinator.",
        },
        { id: "b", text: "There is no difference; the comma is optional", explanation: "The comma changes the meaning completely: without it you get a descendant selector." },
        { id: "c", text: "`h1 h2` styles h1 and h2; `h1, h2` styles h2 inside h1", explanation: "This has them the wrong way round." },
        { id: "d", text: "`h1, h2` is invalid CSS", explanation: "Selector lists are valid and very common." },
      ],
      answer: "a",
      hints: ["Read the comma as \"or\" and the space as \"inside\"."],
      explanation: "A comma groups independent selectors that share one declaration block. A space requires the right-hand element to be nested inside the left-hand one.",
    },
    {
      id: "css-selectors-q3",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "Given the markup, which paragraphs does `h2 + p` select?",
      code: "<section>\n  <h2>Shipping</h2>\n  <p>One</p>\n  <p>Two</p>\n  <p>Three</p>\n</section>",
      options: [
        { id: "a", text: "One, Two and Three", explanation: "That is what the general sibling combinator `h2 ~ p` would match." },
        { id: "b", text: "Only One", explanation: "Correct. `+` matches the single element immediately after the `h2`." },
        { id: "c", text: "Two and Three", explanation: "`+` matches the element directly after the `h2`, which is One." },
        { id: "d", text: "None, because the paragraphs are not inside the h2", explanation: "Sibling combinators work on elements that share a parent, not on nested elements." },
      ],
      answer: "b",
      hints: ["`+` means \"immediately after\"; `~` means \"anywhere after\"."],
      explanation: "The adjacent sibling combinator `+` matches only the next sibling. To match all following paragraphs, use `h2 ~ p`.",
    },
    {
      id: "css-selectors-q4",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Why is a class usually a better choice than an id for styling?",
      options: [
        { id: "a", text: "Id selectors don't work in modern browsers", explanation: "Id selectors work everywhere; the issue is reuse and specificity." },
        {
          id: "b",
          text: "Classes can be reused on many elements and are easier to override",
          explanation: "Correct. An id may appear only once per page and has a much higher specificity, which makes later overrides difficult.",
        },
        { id: "c", text: "Classes load faster", explanation: "There is no meaningful speed difference for styling." },
        { id: "d", text: "Ids can only be used by JavaScript", explanation: "Ids can be used in CSS, links (`#section`) and labels too. They are just a poor fit for reusable styles." },
      ],
      answer: "b",
      hints: ["Think about reuse and about which rule wins in a conflict."],
      explanation: "Classes are reusable and have moderate specificity, so components stay flexible. Keep ids for unique anchors, form labels and scripts.",
    },
    {
      id: "css-selectors-q5",
      type: "multi-select",
      difficulty: "intermediate",
      prompt: "Which selectors match this element? Select all that apply.",
      code: "<button class=\"btn primary\" type=\"submit\">Pay now</button>",
      options: [
        { id: "a", text: "`.btn.primary`", explanation: "Matches: the element has both classes." },
        { id: "b", text: "`button.primary`", explanation: "Matches: it is a button and has the class `primary`." },
        { id: "c", text: "`[type=\"submit\"]`", explanation: "Matches: the `type` attribute is exactly `submit`." },
        { id: "d", text: "`.btn .primary`", explanation: "No match: the space means a `.primary` element inside a `.btn` element." },
        { id: "e", text: "`#primary`", explanation: "No match: `primary` is a class, not an id." },
        { id: "f", text: "`button:not(.primary)`", explanation: "No match: the button *does* have the class `primary`, so `:not(.primary)` rules it out." },
      ],
      answers: ["a", "b", "c"],
      hints: ["No space means \"same element\".", "Check whether `primary` is a class or an id."],
      explanation: "Compound selectors (`.btn.primary`, `button.primary`) and attribute selectors test the element itself. A space or a `#` changes the meaning.",
    },
    {
      id: "css-selectors-q6",
      type: "true-false",
      difficulty: "beginner",
      prompt: "A `::before` pseudo-element shows nothing unless the rule sets the `content` property.",
      answer: true,
      hints: ["What would the browser put inside the generated box?"],
      explanation: "True. `::before` and `::after` are only generated when `content` has a value. Use `content: \"\"` for purely decorative boxes.",
    },
    {
      id: "css-selectors-q7",
      type: "order",
      difficulty: "beginner",
      prompt: "Put the steps the browser takes to apply `.card > p { color: rgb(17, 94, 89); }` in order.",
      steps: [
        "Parse the HTML into a DOM tree",
        "Parse the CSS and read the rule's selector",
        "For each `p`, check whether its parent has the class `card`",
        "Resolve any conflicts with other rules using the cascade and specificity",
        "Paint the matching paragraphs in the new colour",
      ],
      hints: ["Matching can only happen once both the tree and the rule exist.", "Conflicts are resolved after matching, before painting."],
      explanation:
        "The browser needs both the DOM tree and the parsed rule before it can match. It tests the rightmost part (`p`) and then the condition (`.card >`), resolves conflicts, and finally paints.",
    },
  ],
  challenge: {
    id: "css-selectors-challenge",
    type: "code",
    runtime: "web",
    difficulty: "intermediate",
    prompt:
      "Style a product listing using only the existing classes, attributes and structure. Write five rules in the `<style>` element without changing the HTML.",
    instructions:
      "(1) Every **even** product row (an `li` that is a direct child of `.product-list`) gets `background-color: rgb(243, 244, 246)`. The small `.specs` lists inside products must **not** be striped. (2) Products that have both `product` and `sold-out` classes get `color: rgb(156, 163, 175)`. (3) Elements with class `price` get `font-weight: 700`. (4) Links whose `href` starts with `https` get `color: rgb(37, 99, 235)`; the internal `/cart` link must not. (5) Only the search input (`type=\"search\"`) gets `background-color: rgb(239, 246, 255)`; the text input must not.",
    starter: shopStarter,
    tests: [
      {
        name: "even product rows are striped",
        code: "const rows = document.querySelectorAll(\".product-list > li\");\nassert.equal(rows.length, 4, \"Keep the four products\");\nassert.equal(getComputedStyle(rows[1]).backgroundColor, \"rgb(243, 244, 246)\", \"Product 2 should be striped\");\nassert.equal(getComputedStyle(rows[3]).backgroundColor, \"rgb(243, 244, 246)\", \"Product 4 should be striped\");\nassert.notEqual(getComputedStyle(rows[0]).backgroundColor, \"rgb(243, 244, 246)\", \"Product 1 should not be striped\");",
      },
      {
        name: "nested spec items are not striped",
        code: "const spec = document.querySelectorAll(\".specs li\")[1];\nassert.notEqual(getComputedStyle(spec).backgroundColor, \"rgb(243, 244, 246)\", \"The second item in a .specs list should not be striped. Use the child combinator > after .product-list\");",
      },
      {
        name: "sold-out products are grey",
        code: "assert.equal(getComputedStyle(document.querySelector(\".sold-out\")).color, \"rgb(156, 163, 175)\", \"The sold-out product should be rgb(156, 163, 175)\");\nassert.notEqual(getComputedStyle(document.querySelector(\".product-list > li\")).color, \"rgb(156, 163, 175)\", \"Products that are in stock should not be grey\");",
      },
      {
        name: "prices are bold",
        code: "document.querySelectorAll(\".price\").forEach((p) => assert.equal(getComputedStyle(p).fontWeight, \"700\", \"Every .price should have font-weight 700\"));",
      },
      {
        name: "only external links are blue",
        code: "assert.equal(getComputedStyle(document.querySelector('a[href^=\"https\"]')).color, \"rgb(37, 99, 235)\", \"The https review link should be rgb(37, 99, 235)\");\nassert.notEqual(getComputedStyle(document.querySelector('a[href=\"/cart\"]')).color, \"rgb(37, 99, 235)\", \"The internal /cart link should not be blue\");",
      },
      {
        name: "only the search input is tinted",
        code: "assert.equal(getComputedStyle(document.querySelector('input[type=\"search\"]')).backgroundColor, \"rgb(239, 246, 255)\", \"The search input should be rgb(239, 246, 255)\");\nassert.notEqual(getComputedStyle(document.querySelector('input[type=\"text\"]')).backgroundColor, \"rgb(239, 246, 255)\", \"The text input should keep its default background\");",
      },
    ],
    solution: shopSolution,
    hints: [
      "`.product-list li:nth-child(2n)` would also match the second spec item. Which combinator limits it to direct children?",
      "A product that is sold out has two classes; write them together with no space.",
      "Use attribute selectors for the link (`^=`) and the input (`=`).",
    ],
    explanation:
      "`.product-list > li:nth-child(2n)` stripes only top-level rows, `.product.sold-out` requires both classes on the same element, `.price` styles every price, `a[href^=\"https\"]` picks external links by URL, and `input[type=\"search\"]` picks one kind of input. None of these needed extra classes or ids: the right selectors used what the HTML already said.",
  },
  keyPoints: [
    "A selector is a pattern; every element that matches it receives the rule's declarations. The rightmost part is the element being styled.",
    "Type (`p`), class (`.card`), id (`#main`), universal (`*`) and attribute (`[type=\"email\"]`, `[href^=\"https\"]`) are the basic selectors.",
    "A comma means \"or\" (`h1, h2`); no space means \"and, on the same element\" (`button.primary`).",
    "Combinators: space = descendant, `>` = direct child, `+` = the next sibling, `~` = any later sibling.",
    "Pseudo-classes (`:hover`, `:focus-visible`, `:nth-child(2n)`, `:not()`) match by state or position; pseudo-elements (`::before`, `::after`, `::first-line`) style parts or generated content.",
    "Prefer reusable, purpose-named classes over ids. When rules conflict, specificity decides, which is the topic of the next lesson.",
  ],
  cheatSheet: [
    { item: "`p`", meaning: "Type selector: every `<p>`" },
    { item: "`.card`", meaning: "Class selector: elements with class `card`" },
    { item: "`#main`", meaning: "ID selector: the element with `id=\"main\"`" },
    { item: "`*`", meaning: "Universal selector: every element" },
    { item: "`[type=\"email\"]`", meaning: "Attribute equals a value" },
    { item: "`[href^=\"https\"]`", meaning: "Attribute starts with a value" },
    { item: "`h1, h2`", meaning: "Selector list: h1 or h2" },
    { item: "`button.primary`", meaning: "Compound: a button that has class `primary`" },
    { item: "`nav a`", meaning: "Descendant: `a` anywhere inside `nav`" },
    { item: "`ul > li`", meaning: "Child: `li` whose parent is `ul`" },
    { item: "`h2 + p`", meaning: "Adjacent sibling: the `p` right after an `h2`" },
    { item: "`h2 ~ p`", meaning: "General sibling: every later `p` sharing the parent" },
    { item: "`:hover`, `:focus-visible`", meaning: "Pointer over the element; keyboard-visible focus" },
    { item: "`:first-child`, `:last-child`, `:nth-child(2n)`", meaning: "Position among siblings" },
    { item: "`:not(.active)`", meaning: "Elements that do not match the inner selector" },
    { item: "`::before`, `::after`, `::first-line`", meaning: "Generated content (needs `content`) and the first line of text" },
  ],
  completionCriteria: [
    "You can read a selector such as `.card > p` or `button.primary` aloud and say exactly which elements it matches.",
    "You can choose between the descendant, child, adjacent sibling and general sibling combinators for a given piece of HTML.",
    "You can use attribute selectors and pseudo-classes such as `:nth-child()` and `:not()` to style elements without adding extra classes.",
    "You can explain why classes named by purpose are preferred over ids for styling.",
    "You can debug a selector that doesn't match by using the DevTools Styles pane and `document.querySelectorAll` in the Console.",
  ],
  related: ["css-cascade-specificity", "css-box-model", "css-colors-typography", "css-organizing-css", "html-accessibility", "dom-selecting-elements"],
  references: [
    { title: "MDN: CSS selectors", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors" },
    { title: "MDN: Pseudo-classes", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes" },
    { title: "MDN: Pseudo-elements", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements" },
    { title: "W3C: Selectors Level 4", url: "https://www.w3.org/TR/selectors-4/" },
    { title: "web.dev Learn CSS: Selectors", url: "https://web.dev/learn/css/selectors" },
    { title: "W3C WAI: Understanding Focus Visible (WCAG 2.4.7)", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html" },
  ],
};

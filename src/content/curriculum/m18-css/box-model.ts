import type { Lesson } from "@/content/types";

/**
 * Test helper source shared by web-runtime tests that check the universal
 * `box-sizing` reset. It accepts either a computed `border-box` value or a
 * universal (`*`) rule in the page's stylesheets that sets `box-sizing: border-box`.
 * (Checking the stylesheet keeps the test reliable in every DOM implementation.)
 */
const HAS_BORDER_BOX_RESET = `const hasBorderBoxReset = (el) => {
  if (getComputedStyle(el).boxSizing === "border-box") return true;
  const rules = [];
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) rules.push(rule);
  }
  return rules.some((rule) =>
    typeof rule.selectorText === "string" &&
    rule.selectorText.split(",").some((part) => part.trim() === "*") &&
    rule.style.getPropertyValue("box-sizing").trim() === "border-box"
  );
};
`;

const LAYERS_EXAMPLE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Box model layers</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    /* The dashed outline shows where the parent's content area starts,
       so you can see the margin of .box as empty space. */
    .stage {
      outline: 2px dashed rgb(148, 163, 184);
    }

    .box {
      width: 220px;
      padding: 20px;                       /* space inside the border */
      border: 6px solid rgb(30, 64, 175);  /* the visible edge */
      margin: 30px;                        /* space outside the border */
      background-color: rgb(219, 234, 254);
    }
  </style>
</head>
<body>
  <div class="stage">
    <div class="box">Content area: this text lives here.</div>
  </div>
  <p>Light blue = content + padding (background shows through padding).<br>
     Dark blue = border. Gap between the dashed line and the border = margin.</p>
</body>
</html>`;

const SIZING_EXAMPLE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>content-box vs border-box</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .box {
      width: 200px;
      padding: 16px;
      border: 2px solid rgb(15, 23, 42);
      margin-bottom: 16px;
      background-color: rgb(254, 243, 199);
    }

    .content-box {
      box-sizing: content-box;   /* the default */
    }

    .border-box {
      box-sizing: border-box;    /* width includes padding and border */
    }
  </style>
</head>
<body>
  <div class="box content-box">content-box: 200 + 32 + 4 = 236px wide</div>
  <div class="box border-box">border-box: exactly 200px wide</div>
  <p>Right-click each box and choose Inspect to compare the box-model diagrams.</p>
</body>
</html>`;

const SPACING_EXAMPLE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Margin collapsing and centring</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .note {
      padding: 12px 16px;
      border-left: 4px solid rgb(22, 163, 74);
      background-color: rgb(220, 252, 231);
    }

    .first {
      margin-bottom: 24px;
    }

    .second {
      margin-top: 16px;   /* collapses with the 24px above: gap is 24px, not 40px */
    }

    .centred {
      width: 260px;
      margin: 32px auto 0; /* top 32px, left and right auto, bottom 0 */
      padding: 16px;
      border: 2px solid rgb(22, 163, 74);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="note first">First note (margin-bottom: 24px)</div>
  <div class="note second">Second note (margin-top: 16px)</div>
  <div class="centred">Centred with margin: 32px auto 0</div>
</body>
</html>`;

const EX1_STARTER = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Shipping notice</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .notice {
      background-color: rgb(239, 246, 255);
      /* Add padding, a border and a bottom margin here */
    }
  </style>
</head>
<body>
  <div class="notice">Free shipping on orders over $50.</div>
  <p>Browse our new arrivals below.</p>
</body>
</html>`;

const EX1_SOLUTION = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Shipping notice</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .notice {
      background-color: rgb(239, 246, 255);
      padding: 16px;
      border: 2px solid rgb(37, 99, 235);
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="notice">Free shipping on orders over $50.</div>
  <p>Browse our new arrivals below.</p>
</body>
</html>`;

const EX4_STARTER = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Product tile</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .tile {
      box-sizing: content-box;
      width: 320px;   /* fix this value */
      padding: 20px;
      border: 4px solid rgb(71, 85, 105);
    }
  </style>
</head>
<body>
  <div class="tile">
    <h2>Desk Lamp</h2>
    <p>$35.00</p>
  </div>
</body>
</html>`;

const EX4_SOLUTION = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Product tile</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .tile {
      box-sizing: content-box;
      width: 272px;   /* 320 - (2 x 20px padding) - (2 x 4px border) */
      padding: 20px;
      border: 4px solid rgb(71, 85, 105);
    }
  </style>
</head>
<body>
  <div class="tile">
    <h2>Desk Lamp</h2>
    <p>$35.00</p>
  </div>
</body>
</html>`;

const EX5_BUGGY = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Promo banner</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .promo {
      background-color: rgb(250, 204, 21);
      border: 2px solid rgb(161, 98, 7);
      margin: 24px 8px;
    }
  </style>
</head>
<body>
  <div class="promo">Summer sale: 20% off all lamps</div>
  <p>Sale ends Sunday.</p>
</body>
</html>`;

const EX5_SOLUTION = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Promo banner</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
    }

    .promo {
      background-color: rgb(250, 204, 21);
      border: 2px solid rgb(161, 98, 7);
      padding: 8px 24px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="promo">Summer sale: 20% off all lamps</div>
  <p>Sale ends Sunday.</p>
</body>
</html>`;

const CHALLENGE_STARTER = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Pricing plans</title>
  <style>
    /* 1. Add the border-box reset here */

    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
      color: rgb(15, 23, 42);
    }

    .plan {
      background-color: rgb(255, 255, 255);
    }

    .plan-header {
    }

    .plan-price {
      font-size: 32px;
      font-weight: 700;
    }

    .cta {
      background-color: rgb(37, 99, 235);
      color: rgb(255, 255, 255);
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main>
    <article class="plan">
      <header class="plan-header">
        <h2>Starter</h2>
      </header>
      <p class="plan-price">$9 / month</p>
      <p>Up to 3 projects and email support.</p>
      <a class="cta" href="#signup-starter">Choose Starter</a>
    </article>

    <article class="plan">
      <header class="plan-header">
        <h2>Pro</h2>
      </header>
      <p class="plan-price">$29 / month</p>
      <p>Unlimited projects and priority support.</p>
      <a class="cta" href="#signup-pro">Choose Pro</a>
    </article>
  </main>
</body>
</html>`;

const CHALLENGE_SOLUTION = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Pricing plans</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, sans-serif;
      margin: 24px;
      color: rgb(15, 23, 42);
    }

    .plan {
      background-color: rgb(255, 255, 255);
      width: 320px;
      padding: 24px;
      border: 1px solid rgb(203, 213, 225);
      margin-bottom: 32px;
    }

    .plan-header {
      padding-bottom: 16px;
      border-bottom: 2px solid rgb(37, 99, 235);
      margin-bottom: 16px;
    }

    .plan-price {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .cta {
      background-color: rgb(37, 99, 235);
      color: rgb(255, 255, 255);
      text-decoration: none;
      padding: 12px 20px;
    }
  </style>
</head>
<body>
  <main>
    <article class="plan">
      <header class="plan-header">
        <h2>Starter</h2>
      </header>
      <p class="plan-price">$9 / month</p>
      <p>Up to 3 projects and email support.</p>
      <a class="cta" href="#signup-starter">Choose Starter</a>
    </article>

    <article class="plan">
      <header class="plan-header">
        <h2>Pro</h2>
      </header>
      <p class="plan-price">$29 / month</p>
      <p>Unlimited projects and priority support.</p>
      <a class="cta" href="#signup-pro">Choose Pro</a>
    </article>
  </main>
</body>
</html>`;

const WALKTHROUGH_CODE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Order summary</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    .summary {
      width: 360px;
      padding: 24px 20px;
      border: 1px solid rgb(203, 213, 225);
      border-top: 4px solid rgb(37, 99, 235);
      margin: 0 auto 40px;
    }

    .summary h2 {
      margin: 0 0 16px;
    }

    .total {
      padding-top: 12px;
      border-top: 1px dashed rgb(148, 163, 184);
    }
  </style>
</head>
<body>
  <section class="summary">
    <h2>Order summary</h2>
    <p>2 x Mug: $24.00</p>
    <p class="total">Total: $24.00</p>
  </section>
</body>
</html>`;

export const boxModel: Lesson = {
  id: "css-box-model",
  slug: "box-model",
  title: "The Box Model",
  summary:
    "Every element is a rectangle made of content, padding, border and margin. Learn how those layers add up to an element's size, how `box-sizing: border-box` makes sizes predictable, and how to space things with padding and margin.",
  difficulty: "beginner",
  minutes: 30,
  tech: ["css", "html"],
  tags: ["css", "box model", "padding", "margin", "border", "box-sizing", "spacing", "devtools"],
  objectives: [
    "Name the four layers of the CSS box (content, padding, border, margin) and say what each one is for.",
    "Calculate an element's rendered width under `box-sizing: content-box` and under `box-sizing: border-box`.",
    "Write `padding`, `margin` and `border` shorthands with 1, 2, 3 or 4 values and predict which side gets which value.",
    "Choose between padding and margin for a given spacing problem.",
    "Explain vertical margin collapsing and centre a fixed-width block with `margin: 0 auto`.",
    "Inspect an element's box in the browser DevTools box-model diagram.",
  ],
  prerequisites: ["css-cascade-specificity"],
  intro: [
    {
      kind: "paragraph",
      text: "**What it is.** To a browser, every element on a page is a rectangular box. The *box model* is the set of rules that describes that box: the content in the middle, an optional cushion of space around it (**padding**), an edge line (**border**), and empty space that pushes other boxes away (**margin**).",
    },
    {
      kind: "paragraph",
      text: "**Why it matters.** Almost every layout question you will ask (*why is this card too wide?*, *why is there a gap here?*, *why doesn't my background reach the edge?*) is really a box-model question. Once you can see the four layers, spacing stops being trial and error.",
    },
    {
      kind: "paragraph",
      text: "**Where it is used.** Everywhere: buttons get padding so their text isn't cramped, cards get borders and margins to separate them, forms use margins to space fields, and nearly every modern stylesheet starts with a `box-sizing` reset you will learn today.",
    },
    {
      kind: "paragraph",
      text: "**What you'll understand.** By the end you can read a box's size from its CSS, write the spacing shorthands confidently, pick padding or margin on purpose, recognise margin collapsing, and confirm all of it in DevTools.",
    },
  ],
  terms: [
    { term: "Box model", definition: "The model browsers use to treat every element as a rectangle made of content, padding, border and margin." },
    { term: "Content area", definition: "The innermost part of the box, where text, images or child elements appear. Its size is set by `width`/`height` under the default `content-box` sizing." },
    { term: "Padding", definition: "Transparent space between the content and the border. The element's background colour fills it." },
    { term: "Border", definition: "A line drawn around the padding. It has a width, a style (such as `solid` or `dashed`) and a colour." },
    { term: "Margin", definition: "Space outside the border that separates the box from its neighbours. It is always transparent; the background never fills it." },
    { term: "`box-sizing`", definition: "The property that decides what `width` and `height` measure: just the content (`content-box`, the default) or content + padding + border (`border-box`)." },
    { term: "Shorthand property", definition: "A property that sets several related properties at once, such as `padding`, which sets `padding-top`, `padding-right`, `padding-bottom` and `padding-left`." },
    { term: "Longhand property", definition: "A property that sets exactly one value, such as `margin-left` or `border-top-width`." },
    { term: "Block box", definition: "A box that starts on a new line and stretches across the available width, like `<div>`, `<p>` or `<section>`." },
    { term: "Inline box", definition: "A box that sits inside a line of text, like `<a>`, `<strong>` or `<span>`. It ignores `width`/`height`, and its vertical padding and margin don't push lines apart." },
    { term: "Margin collapsing", definition: "When the top and bottom margins of block boxes touch vertically, they combine into one margin equal to the larger value instead of adding up." },
    { term: "Universal selector (`*`)", definition: "A selector that matches every element. Used in the `box-sizing` reset." },
  ],
  sections: [
    {
      id: "explanation",
      title: "Every element is a box",
      blocks: [
        {
          kind: "paragraph",
          text: "Open any web page and imagine drawing a rectangle around each heading, paragraph, image and link. That rectangle is the element's box. The browser lays those boxes out one after another (or side by side, or nested) to build the page. Each box has four layers, from the inside out:",
        },
        {
          kind: "diagram",
          title: "The four layers of a CSS box (inside to outside)",
          variant: "stack",
          steps: [
            { label: "Content", detail: "Text, images or child elements. Sized by `width` and `height`." },
            { label: "Padding", detail: "Breathing room inside the box. The background colour shows here." },
            { label: "Border", detail: "The edge line. Can be any width, style and colour, or none at all." },
            { label: "Margin", detail: "Empty, transparent space outside the border that keeps neighbours away." },
          ],
        },
        {
          kind: "table",
          caption: "What each layer does",
          headers: ["Layer", "Inside or outside the border?", "Background colour visible?", "Typical use", "Properties"],
          rows: [
            ["Content", "Inside", "Yes", "The actual text or image", "`width`, `height`"],
            ["Padding", "Inside", "Yes", "Space between text and the edge of a button or card", "`padding`, `padding-top`, ..."],
            ["Border", "It *is* the edge", "Border has its own colour", "Outlines, dividers, card edges", "`border`, `border-width`, `border-style`, `border-color`, ..."],
            ["Margin", "Outside", "No, always transparent", "Space between one element and the next", "`margin`, `margin-top`, ..."],
          ],
        },
        {
          kind: "heading",
          text: "How big is the box? `content-box` vs `border-box`",
        },
        {
          kind: "paragraph",
          text: "By default, CSS uses `box-sizing: content-box`. That means `width` sets the width of the **content area only**. Padding and border are then added *on top*. This surprises almost every beginner:",
        },
        {
          kind: "table",
          caption: "Same CSS, two sizing modes: width: 200px; padding: 16px; border: 2px solid",
          headers: ["", "`content-box` (default)", "`border-box`"],
          rows: [
            ["What `width` measures", "Content only", "Content + padding + border"],
            ["Content width", "200px", "200 - 16 - 16 - 2 - 2 = **164px**"],
            ["Left + right padding", "16 + 16 = 32px", "16 + 16 = 32px"],
            ["Left + right border", "2 + 2 = 4px", "2 + 2 = 4px"],
            ["Width on screen (border edge to border edge)", "200 + 32 + 4 = **236px**", "**200px**"],
          ],
        },
        {
          kind: "paragraph",
          text: "The same arithmetic applies to `height` and to top/bottom padding and border. Margin is **never** included in either mode: it is extra space *outside* the box, so a box with `margin: 10px` still occupies 20px more horizontal room on the page.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "The border-box reset",
          text: "Because `border-box` makes `width` mean *what you see*, most modern projects switch every element to it with three lines at the top of the stylesheet: `*, *::before, *::after { box-sizing: border-box; }`. `*` matches every element, and `::before`/`::after` cover generated content you will meet later. Content then shrinks to fit inside the width you asked for.",
        },
        {
          kind: "heading",
          text: "Margin vs padding",
        },
        {
          kind: "paragraph",
          text: "Both add space, but in different places. **Padding is inside** the border, so it makes the box itself bigger and the background colour (and clickable area of a link or button) grows with it. **Margin is outside** the border, so it moves the box away from its neighbours without changing how the box looks. Rule of thumb: *space inside a component → padding; space between components → margin.*",
        },
        {
          kind: "heading",
          text: "Block boxes vs inline boxes",
        },
        {
          kind: "paragraph",
          text: "Elements like `<div>`, `<p>`, `<h1>` and `<section>` make **block** boxes: they start on a new line, fill the available width, and respect every box-model property. Elements like `<a>`, `<span>` and `<strong>` make **inline** boxes that flow inside a line of text, and they behave differently:",
        },
        {
          kind: "table",
          caption: "Box-model properties on block and inline boxes",
          headers: ["Property", "Block box (e.g. `<p>`)", "Inline box (e.g. `<a>`)"],
          rows: [
            ["`width` / `height`", "Applied", "Ignored"],
            ["Left/right padding, border, margin", "Applied", "Applied: pushes neighbouring text sideways"],
            ["Top/bottom padding and border", "Applied, pushes content down", "Painted (the background grows) but does **not** push other lines away, so it can overlap them"],
            ["Top/bottom margin", "Applied", "Ignored"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Coming up later",
          text: "You can change how a box behaves with the `display` property (for example `display: inline-block` gives a link full box-model behaviour while staying in the line). That is covered in *Display and Positioning*, later in this course.",
        },
        {
          kind: "heading",
          text: "Vertical margin collapsing",
        },
        {
          kind: "paragraph",
          text: "When two block boxes are stacked and the bottom margin of the first touches the top margin of the second, the browser does not add them. It keeps only the **larger** one. A `margin-bottom: 24px` followed by a `margin-top: 16px` creates a 24px gap, not 40px. This is called *margin collapsing*, and it exists so that headings and paragraphs with margins on both sides don't end up with double gaps.",
        },
        {
          kind: "list",
          items: [
            "It only happens to **vertical** (top/bottom) margins. Left and right margins never collapse.",
            "It happens between adjacent siblings, and also between a parent and its first or last child when no padding or border separates them. That's why a child's `margin-top` can seem to \"leak\" out of its parent: add `padding-top` or a border to the parent and it stops.",
            "It does not happen inside flex or grid containers (later lessons), or for inline boxes.",
          ],
        },
        {
          kind: "heading",
          text: "Centring a block with `margin: 0 auto`",
        },
        {
          kind: "paragraph",
          text: "A block box with a fixed `width` (narrower than its container) can be centred horizontally with `margin-left: auto; margin-right: auto;`, usually written `margin: 0 auto`. The browser takes the leftover horizontal space and splits it equally between the two `auto` margins. It needs a width: a block without one already fills the whole container, so there is nothing left to share. `auto` margins don't centre vertically in normal block layout.",
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax",
      blocks: [
        { kind: "heading", text: "Padding and margin: longhands" },
        {
          kind: "code",
          language: "css",
          code: ".card {\n  padding-top: 16px;\n  padding-right: 24px;\n  padding-bottom: 16px;\n  padding-left: 24px;\n\n  margin-top: 0;\n  margin-bottom: 32px;\n}",
        },
        { kind: "heading", text: "Padding and margin: shorthands (clockwise from the top)" },
        {
          kind: "paragraph",
          text: "The `padding` and `margin` shorthands accept one to four values. Think of a clock starting at 12: **T**op, **R**ight, **B**ottom, **L**eft (\"TRouBLe\"). When you give fewer than four, the missing sides copy their opposite side.",
        },
        {
          kind: "table",
          caption: "How many values → which sides",
          headers: ["Shorthand", "Top", "Right", "Bottom", "Left"],
          rows: [
            ["`padding: 10px;`", "10px", "10px", "10px", "10px"],
            ["`padding: 10px 20px;`", "10px", "20px", "10px", "20px"],
            ["`padding: 10px 20px 30px;`", "10px", "20px", "30px", "20px"],
            ["`padding: 10px 20px 30px 40px;`", "10px", "20px", "30px", "40px"],
          ],
        },
        {
          kind: "code",
          language: "css",
          code: ".button {\n  padding: 8px 16px;        /* 8px top/bottom, 16px left/right */\n}\n\n.section {\n  margin: 0 0 48px;         /* top 0, left/right 0, bottom 48px */\n}\n\n.page {\n  width: 960px;\n  margin: 0 auto;           /* centre a fixed-width block */\n}",
        },
        { kind: "heading", text: "Borders" },
        {
          kind: "paragraph",
          text: "The `border` shorthand takes a width, a style and a colour, in any order. The **style is required**: without it the style is `none` and no border is drawn. You can also target one side (`border-top`) or one aspect (`border-width`, which takes 1-4 values just like padding).",
        },
        {
          kind: "code",
          language: "css",
          code: ".card {\n  border: 2px solid rgb(203, 213, 225);       /* all four sides */\n  border-bottom: 4px solid rgb(37, 99, 235);  /* override one side */\n}\n\n.divider {\n  border-top: 1px dashed rgb(148, 163, 184);  /* a single line */\n}\n\n.input {\n  border-width: 1px 1px 2px;                  /* top, left/right, bottom */\n  border-style: solid;\n  border-color: rgb(100, 116, 139);\n}",
        },
        { kind: "heading", text: "Sizing and the reset" },
        {
          kind: "code",
          language: "css",
          code: "/* Put this at the very top of your stylesheet */\n*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}\n\n.sidebar {\n  width: 300px;    /* with border-box: 300px on screen, padding included */\n  padding: 20px;\n}",
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "See the four layers" },
        {
          kind: "paragraph",
          text: "Each layer is given a visibly different treatment. Notice that the light-blue background fills the padding but stops at the border, and the margin is just empty space.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: LAYERS_EXAMPLE },
        { kind: "heading", text: "Compare content-box and border-box" },
        {
          kind: "paragraph",
          text: "Both boxes have the same `width`, `padding` and `border`. Only `box-sizing` differs, and the first box comes out 36px wider.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: SIZING_EXAMPLE },
        { kind: "heading", text: "Margin collapsing and centring" },
        {
          kind: "paragraph",
          text: "The gap between the two notes is 24px (the larger margin), not 40px. The last box has a fixed width and `auto` left/right margins, so it sits in the middle.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: SPACING_EXAMPLE },
      ],
    },
    {
      id: "walkthrough",
      title: "Code walkthrough",
      blocks: [
        {
          kind: "paragraph",
          text: "Here is a small order-summary card that uses every idea from this lesson. Read it once, then follow the line-by-line notes.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: WALKTHROUGH_CODE },
        {
          kind: "list",
          ordered: true,
          items: [
            "`*, *::before, *::after { box-sizing: border-box; }` switches every element to border-box sizing, so the `width` we write is the width we see.",
            "`.summary { width: 360px; }`: because of the reset, the card is exactly 360px from border edge to border edge, padding and border included. The content area is 360 - 20 - 20 - 1 - 1 = 318px.",
            "`padding: 24px 20px;`: two values, so 24px top and bottom and 20px left and right. The text never touches the border.",
            "`border: 1px solid ...;` draws a thin grey line on all four sides.",
            "`border-top: 4px solid ...;` comes later in the same rule, so it overrides just the top side with a thicker blue line (the cascade from the previous lesson at work).",
            "`margin: 0 auto 40px;`: three values, so top 0, left and right `auto` (centres the fixed-width card), bottom 40px of space before whatever comes next.",
            "`.summary h2 { margin: 0 0 16px; }` removes the heading's default top margin (which could otherwise collapse through the card's top edge if there were no padding) and keeps 16px below it.",
            "`.total { padding-top: 12px; border-top: 1px dashed ...; }`: the dashed line separates the total, and padding (not margin) puts space *between the line and the text*, because the line belongs to this box.",
          ],
        },
      ],
    },
    {
      id: "real-world",
      title: "Real-world use and DevTools",
      blocks: [
        {
          kind: "list",
          items: [
            "**Buttons and links styled as buttons:** padding sets the size of the clickable area, e.g. `padding: 12px 20px`. Bigger padding = easier to tap on a phone.",
            "**Cards and panels:** a border (or a subtle background) plus padding inside, and margin between cards.",
            "**Page containers:** a fixed or maximum width plus `margin: 0 auto` centres the main content on wide screens.",
            "**Form fields:** `margin-bottom` on each field group creates consistent vertical rhythm.",
            "**Design systems:** teams pick a spacing scale (4px, 8px, 16px, 24px, 32px ...) and use only those values for padding and margin, so every page feels consistent.",
          ],
        },
        { kind: "heading", text: "Inspecting the box in DevTools" },
        {
          kind: "diagram",
          title: "Reading an element's box in browser DevTools",
          variant: "flow",
          steps: [
            { label: "Right-click the element → Inspect", detail: "The Elements (Chrome/Edge) or Inspector (Firefox) panel opens with the element selected." },
            { label: "Hover the element in the HTML tree", detail: "The page highlights content (blue), padding (green), border (yellow) and margin (orange)." },
            { label: "Open the Computed (Chrome) or Layout (Firefox) tab", detail: "A nested box-model diagram shows the exact pixel value of every side." },
            { label: "Double-click a value in the diagram", detail: "Edit it live to try a different padding or margin, then copy the value that works into your CSS." },
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Find out which rule set the value",
          text: "In the Computed tab, expand a property such as `margin-top` to see which rule and file it came from. A struck-through declaration in the Styles pane lost the cascade to another rule.",
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Expecting `width` to include padding and border",
      wrong: ".sidebar {\n  width: 300px;\n  padding: 20px;\n  border: 2px solid rgb(0, 0, 0);\n}\n/* Renders 344px wide and overflows a 300px column */",
      right: "*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n.sidebar {\n  width: 300px;\n  padding: 20px;\n  border: 2px solid rgb(0, 0, 0);\n}\n/* Renders exactly 300px wide */",
      explanation: "Under the default `content-box`, `width` is only the content. 300 + 40 + 4 = 344px. Add the border-box reset (or subtract the padding and border yourself).",
    },
    {
      title: "Using margin when you want the background to grow",
      wrong: ".badge {\n  background-color: rgb(220, 252, 231);\n  margin: 8px 12px;\n}",
      right: ".badge {\n  background-color: rgb(220, 252, 231);\n  padding: 8px 12px;\n}",
      explanation: "Margin is outside the border and always transparent, so the coloured area stays tight around the text. Padding is inside, so the background fills it.",
    },
    {
      title: "Getting the shorthand order wrong",
      wrong: "/* Meant: 8px top/bottom, 24px left/right */\n.tab {\n  padding: 24px 8px;\n}",
      right: ".tab {\n  padding: 8px 24px;\n}",
      explanation: "Values go clockwise from the **top**: top, right, bottom, left. With two values, the first is top/bottom and the second is left/right.",
    },
    {
      title: "Writing a border without a style",
      wrong: ".card {\n  border: 2px rgb(37, 99, 235);\n}",
      right: ".card {\n  border: 2px solid rgb(37, 99, 235);\n}",
      explanation: "`border-style` defaults to `none`, and a border with style `none` is not drawn (its used width becomes 0). Always include a style such as `solid`, `dashed` or `dotted`.",
    },
    {
      title: "Adding margins and expecting them to add up vertically",
      wrong: "h2 { margin-bottom: 24px; }\np  { margin-top: 24px; }\n/* Expected a 48px gap, got 24px */",
      right: "h2 { margin-bottom: 24px; }\np  { margin-top: 0; }\n/* Put the spacing on one side only */",
      explanation: "Adjacent vertical margins collapse to the larger value. Many teams avoid confusion by adding space in one direction only, usually `margin-bottom`.",
    },
  ],
  debugging: [
    "**Box too wide or overflowing?** Inspect it and look at the box-model diagram in the Computed/Layout tab. If padding and border sit *outside* the width you set, the element is using `content-box`; check that your `box-sizing` reset exists and isn't overridden.",
    "**Unexpected gap?** Hover elements in the DevTools HTML tree: orange highlight is margin, green is padding. Often the gap is a default margin from the browser (on `body`, `h1`-`h6`, `p`, `ul`) rather than one you wrote.",
    "**Gap smaller than expected between stacked blocks?** That's margin collapsing: only the larger vertical margin applies. If a child's top margin appears *above* its parent, give the parent `padding-top` or a border.",
    "**Padding or margin on a link doesn't push lines apart?** Links are inline boxes: vertical margin is ignored and vertical padding doesn't affect line spacing. Check the element's `display` value in the Computed tab.",
    "**Border not showing?** In the Styles pane, check that `border-style` is not `none` and that the declaration isn't struck through by a more specific rule.",
    "**`margin: 0 auto` not centring?** The element needs a `width` (or `max-width`) smaller than its container and must be a block box; check both in DevTools.",
  ],
  bestPractices: [
    "Start every stylesheet with the border-box reset `*, *::before, *::after { box-sizing: border-box; }` so `width` and `height` mean what you see.",
    "Use **padding** for space inside a component (between its edge and its content) and **margin** for space between components.",
    "Pick a small spacing scale (for example 4, 8, 12, 16, 24, 32, 48px) and stick to it for padding and margin; consistent spacing looks deliberate.",
    "Prefer adding vertical space in one direction (usually `margin-bottom`) to avoid surprises from margin collapsing.",
    "Use the shorthand when you set all sides and a longhand (such as `margin-bottom`) when you only mean one side, so you don't accidentally reset the others to 0.",
    "Give clickable elements generous padding so they are easy to hit with a finger (WCAG recommends targets of at least 24 by 24 CSS pixels).",
    "*Advanced:* the `margin-inline`, `padding-block` and similar logical properties follow the writing direction of the page, which helps sites that support right-to-left languages.",
  ],
  examples: [
    { id: "css-box-model-example-layers", title: "The four layers", runtime: "web", code: LAYERS_EXAMPLE },
    { id: "css-box-model-example-sizing", title: "content-box vs border-box", runtime: "web", code: SIZING_EXAMPLE },
    { id: "css-box-model-example-spacing", title: "Margin collapsing and centring", runtime: "web", code: SPACING_EXAMPLE },
  ],
  exercises: [
    {
      id: "css-box-model-ex-1",
      type: "code",
      runtime: "web",
      difficulty: "beginner",
      prompt: "The shipping notice is cramped and runs straight into the next paragraph. Give `.notice` 16px of padding on every side, a 2px solid border (any colour) and 24px of space below it.",
      instructions: "Edit only the `.notice` rule. Use `px` values.",
      starter: EX1_STARTER,
      tests: [
        {
          name: "the notice has 16px padding on all four sides",
          code: `const s = getComputedStyle(document.querySelector(".notice"));
for (const side of ["Top", "Right", "Bottom", "Left"]) {
  assert.equal(s["padding" + side], "16px", "padding-" + side.toLowerCase() + " should be 16px");
}`,
        },
        {
          name: "the notice has a 2px solid border on all four sides",
          code: `const s = getComputedStyle(document.querySelector(".notice"));
for (const side of ["Top", "Right", "Bottom", "Left"]) {
  assert.equal(s["border" + side + "Width"], "2px", "border-" + side.toLowerCase() + "-width should be 2px");
  assert.equal(s["border" + side + "Style"], "solid", "border-" + side.toLowerCase() + "-style should be solid");
}`,
        },
        {
          name: "there is 24px of margin below the notice",
          code: `assert.equal(getComputedStyle(document.querySelector(".notice")).marginBottom, "24px", "Use margin-bottom: 24px for the space below the box");`,
        },
      ],
      solution: EX1_SOLUTION,
      hints: [
        "`padding: 16px;` sets all four sides at once.",
        "The `border` shorthand needs a width, a style and a colour: `border: 2px solid rgb(37, 99, 235);`.",
        "Space *outside* the box, below it, is `margin-bottom`.",
      ],
      explanation:
        "`padding: 16px` adds space inside the border (the light background fills it), `border: 2px solid ...` draws the edge, and `margin-bottom: 24px` pushes the paragraph below away. Padding is inside, margin is outside.",
    },
    {
      id: "css-box-model-ex-2",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Complete the reset so that every element (and its `::before`/`::after` content) includes padding and border in its `width` and `height`.",
      template: "___,\n*::before,\n*::after {\n  ___: ___;\n}",
      blanks: [{ answers: ["*"] }, { answers: ["box-sizing"] }, { answers: ["border-box"] }],
      hints: ["Which selector matches every element?", "The property's name contains the word *sizing*."],
      explanation:
        "`*, *::before, *::after { box-sizing: border-box; }` is the standard reset. `*` matches every element, and `box-sizing: border-box` makes `width`/`height` measure the box up to and including its border.",
    },
    {
      id: "css-box-model-ex-3",
      type: "match",
      difficulty: "beginner",
      prompt: "Match each `margin` shorthand to the sides it sets.",
      pairs: [
        { left: "`margin: 12px;`", right: "12px on all four sides" },
        { left: "`margin: 12px 24px;`", right: "12px top and bottom, 24px left and right" },
        { left: "`margin: 12px 24px 36px;`", right: "12px top, 24px left and right, 36px bottom" },
        { left: "`margin: 12px 24px 36px 48px;`", right: "12px top, 24px right, 36px bottom, 48px left" },
      ],
      hints: ["Values go clockwise starting at the top: top, right, bottom, left.", "A missing side copies the side opposite to it."],
      explanation:
        "One value applies everywhere. Two values are vertical then horizontal. Three values are top, left/right, bottom. Four values go clockwise: top, right, bottom, left.",
    },
    {
      id: "css-box-model-ex-4",
      type: "code",
      runtime: "web",
      difficulty: "intermediate",
      prompt:
        "The design says the product tile must be **exactly 320px wide on screen**, measured from the outer edge of its border. The tile keeps `box-sizing: content-box`, `padding: 20px` and a 4px border. Work out the correct `width` and fix it.",
      instructions:
        "Don't change `box-sizing`, `padding` or `border`. Only change the `width` value. Show your working in a CSS comment if you like.",
      starter: EX4_STARTER,
      tests: [
        {
          name: "the tile still uses content-box sizing",
          code: `assert.equal(getComputedStyle(document.querySelector(".tile")).boxSizing, "content-box", "Keep box-sizing: content-box for this exercise");`,
        },
        {
          name: "padding and border are unchanged",
          code: `const s = getComputedStyle(document.querySelector(".tile"));
assert.equal(s.paddingLeft, "20px", "padding-left should stay 20px");
assert.equal(s.paddingRight, "20px", "padding-right should stay 20px");
assert.equal(s.borderLeftWidth, "4px", "border-left-width should stay 4px");
assert.equal(s.borderRightWidth, "4px", "border-right-width should stay 4px");`,
        },
        {
          name: "width + padding + border adds up to 320px",
          code: `const s = getComputedStyle(document.querySelector(".tile"));
const px = (v) => parseFloat(v);
const total = px(s.width) + px(s.paddingLeft) + px(s.paddingRight) + px(s.borderLeftWidth) + px(s.borderRightWidth);
assert.equal(total, 320, "The tile is " + total + "px wide on screen; it should be 320px");`,
        },
      ],
      solution: EX4_SOLUTION,
      hints: [
        "Under `content-box`, on-screen width = `width` + left padding + right padding + left border + right border.",
        "Padding adds 20 + 20 = 40px and the border adds 4 + 4 = 8px.",
        "320 - 40 - 8 = ?",
      ],
      explanation:
        "With `content-box`, padding and border are added outside the `width`. 320px total minus 40px of padding minus 8px of border leaves a content width of **272px**. With the border-box reset you could simply write `width: 320px`, which is why most projects use it.",
    },
    {
      id: "css-box-model-ex-5",
      type: "find-bug",
      runtime: "web",
      difficulty: "beginner",
      debugging: true,
      prompt:
        "The yellow promo banner should have its yellow background extend **8px above and below** the text and **24px to the left and right**, with a **16px gap** below the banner. Instead the yellow hugs the text and the banner is pushed around. Find and fix the bug.",
      code: EX5_BUGGY,
      tests: [
        {
          name: "the yellow background has 8px of space above and below the text",
          code: `const s = getComputedStyle(document.querySelector(".promo"));
assert.equal(s.paddingTop, "8px", "padding-top should be 8px (space inside the banner)");
assert.equal(s.paddingBottom, "8px", "padding-bottom should be 8px");`,
        },
        {
          name: "the yellow background has 24px of space left and right of the text",
          code: `const s = getComputedStyle(document.querySelector(".promo"));
assert.equal(s.paddingLeft, "24px", "padding-left should be 24px");
assert.equal(s.paddingRight, "24px", "padding-right should be 24px");`,
        },
        {
          name: "there is a 16px gap below the banner",
          code: `assert.equal(getComputedStyle(document.querySelector(".promo")).marginBottom, "16px", "Use margin-bottom: 16px for the space below the banner");`,
        },
      ],
      solution: EX5_SOLUTION,
      hints: [
        "Does the background colour show through margin or through padding?",
        "Check the order of the two values too: the first is top/bottom, the second is left/right.",
      ],
      explanation:
        "There were two bugs. The space was added with `margin`, which is outside the border and transparent, so the yellow never grew. And `24px 8px` put 24px on top/bottom and 8px on the sides, the reverse of the design. The fix is `padding: 8px 24px` for space inside the banner and `margin-bottom: 16px` for the gap below it.",
    },
  ],
  quiz: [
    {
      id: "css-box-model-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "With the default `box-sizing: content-box`, how wide is this box on screen (border edge to border edge)?",
      code: ".box {\n  width: 200px;\n  padding: 16px;\n  border: 2px solid rgb(0, 0, 0);\n  margin: 10px;\n}",
      options: [
        { id: "a", text: "200px", explanation: "That would be true with `border-box`. Under `content-box`, `width` is only the content area." },
        { id: "b", text: "232px", explanation: "This adds the padding (32px) but forgets the 2px border on each side." },
        { id: "c", text: "236px", explanation: "Correct: 200 content + 16 + 16 padding + 2 + 2 border = 236px." },
        { id: "d", text: "256px", explanation: "This also adds the margin, but margin is space outside the box, not part of its visible width." },
      ],
      answer: "c",
      hints: ["Add content, both paddings and both borders. Leave margin out."],
      explanation: "Under `content-box`, the visible width is `width` + left/right padding + left/right border: 200 + 32 + 4 = 236px. Margin adds space around the box but isn't part of it.",
    },
    {
      id: "css-box-model-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "The same `.box` now has `box-sizing: border-box`. How wide is its **content area**?",
      code: ".box {\n  box-sizing: border-box;\n  width: 200px;\n  padding: 16px;\n  border: 2px solid rgb(0, 0, 0);\n}",
      options: [
        { id: "a", text: "200px", explanation: "200px is the whole box including padding and border, not the content area." },
        { id: "b", text: "164px", explanation: "Correct: 200 - 32 (padding) - 4 (border) = 164px." },
        { id: "c", text: "168px", explanation: "This subtracts the padding but forgets the border." },
        { id: "d", text: "236px", explanation: "That's the content-box result for the visible width, not this one." },
      ],
      answer: "b",
      hints: ["With `border-box`, padding and border are taken *out* of the width."],
      explanation: "`border-box` makes `width` cover content + padding + border. The content gets what's left: 200 - 16 - 16 - 2 - 2 = 164px.",
    },
    {
      id: "css-box-model-q3",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What does `margin: 10px 20px 30px;` set the **left** margin to?",
      options: [
        { id: "a", text: "10px", explanation: "10px is the top margin." },
        { id: "b", text: "20px", explanation: "Correct: with three values, the middle one applies to both left and right." },
        { id: "c", text: "30px", explanation: "30px is the bottom margin." },
        { id: "d", text: "0", explanation: "Missing sides aren't set to 0; they copy the opposite side." },
      ],
      answer: "b",
      hints: ["Three values mean top, left-and-right, bottom."],
      explanation: "With three values, the order is top, then left and right together, then bottom. The missing left value copies the right value, 20px.",
    },
    {
      id: "css-box-model-q4",
      type: "mcq",
      difficulty: "beginner",
      prompt: "A link styled as a button has a blue background. You want the blue area to be bigger around the text. Which property should you increase?",
      options: [
        { id: "a", text: "`margin`", explanation: "Margin is outside the border and is always transparent, so the blue area would not grow." },
        { id: "b", text: "`padding`", explanation: "Correct: padding is inside the box, so the background colour fills it." },
        { id: "c", text: "`border-style`", explanation: "This changes how the border line is drawn, not the space around the text." },
        { id: "d", text: "`box-sizing`", explanation: "This changes what `width` measures; it adds no space on its own." },
      ],
      answer: "b",
      hints: ["Which layer does the background colour paint?"],
      explanation: "The background covers the content and padding areas (and by default extends under the border). Increasing padding grows the coloured, clickable area.",
    },
    {
      id: "css-box-model-q5",
      type: "true-false",
      difficulty: "beginner",
      prompt: "A paragraph with `margin-bottom: 24px` is followed by a paragraph with `margin-top: 16px`. The gap between them is 40px.",
      answer: false,
      hints: ["What happens when two vertical margins touch?"],
      explanation: "Adjacent vertical margins collapse: only the larger one is used, so the gap is 24px. Horizontal margins never collapse.",
    },
    {
      id: "css-box-model-q6",
      type: "multi-select",
      difficulty: "intermediate",
      prompt: "Using the default `content-box`, which of these changes make an element's **visible box** (border edge to border edge) wider? Select all that apply.",
      options: [
        { id: "a", text: "Increasing `width`", explanation: "Yes: `width` is the content area, which is part of the visible box." },
        { id: "b", text: "Increasing `padding-left`", explanation: "Yes: padding is inside the border and is added to the width." },
        { id: "c", text: "Increasing `border-right-width`", explanation: "Yes: the border is added on top of content and padding." },
        { id: "d", text: "Increasing `margin-left`", explanation: "No: margin moves the box and takes up space around it, but the box itself stays the same size." },
        { id: "e", text: "Switching to `box-sizing: border-box`", explanation: "No: this keeps the visible box at the `width` value, so it can only make it the same size or narrower." },
      ],
      answers: ["a", "b", "c"],
      hints: ["The visible box is content + padding + border."],
      explanation: "Under `content-box`, visible width = width + horizontal padding + horizontal border. Margin is outside the box, and switching to `border-box` folds padding and border back into the width.",
    },
    {
      id: "css-box-model-q7",
      type: "order",
      difficulty: "beginner",
      prompt: "Put the layers of a CSS box in order, from the innermost to the outermost.",
      steps: ["Content", "Padding", "Border", "Margin"],
      hints: ["The background colour fills the first two layers."],
      explanation: "Content sits in the middle, padding surrounds it, the border wraps the padding, and margin is the transparent space outside the border.",
    },
  ],
  challenge: {
    id: "css-box-model-challenge",
    type: "code",
    runtime: "web",
    difficulty: "intermediate",
    prompt:
      "Style the pricing page so each plan is a neat, evenly spaced card. Only spacing, sizing and borders are missing; the colours are already there.",
    instructions:
      "1. Add the border-box reset (`*, *::before, *::after`).\n2. `.plan`: `width: 320px`, 24px padding on every side, a 1px solid border, and 32px of margin below each card.\n3. `.plan-header`: 16px of padding below the heading, a 2px solid bottom border, and 16px of margin below the header.\n4. `.plan-price`: no top margin and 8px of bottom margin (one shorthand line).\n5. `.cta`: 12px padding top and bottom, 20px left and right (one shorthand line).",
    starter: CHALLENGE_STARTER,
    tests: [
      {
        name: "the page uses the border-box reset",
        code: `${HAS_BORDER_BOX_RESET}assert.ok(hasBorderBoxReset(document.querySelector(".plan")), "Add *, *::before, *::after { box-sizing: border-box; } at the top of the stylesheet");`,
      },
      {
        name: "each plan is 320px wide with 24px padding on every side",
        code: `for (const plan of document.querySelectorAll(".plan")) {
  const s = getComputedStyle(plan);
  assert.equal(s.width, "320px", ".plan should have width: 320px");
  for (const side of ["Top", "Right", "Bottom", "Left"]) {
    assert.equal(s["padding" + side], "24px", ".plan padding-" + side.toLowerCase() + " should be 24px");
  }
}`,
      },
      {
        name: "each plan has a 1px solid border and 32px of margin below",
        code: `for (const plan of document.querySelectorAll(".plan")) {
  const s = getComputedStyle(plan);
  for (const side of ["Top", "Right", "Bottom", "Left"]) {
    assert.equal(s["border" + side + "Width"], "1px", ".plan border-" + side.toLowerCase() + "-width should be 1px");
    assert.equal(s["border" + side + "Style"], "solid", ".plan border-" + side.toLowerCase() + "-style should be solid");
  }
  assert.equal(s.marginBottom, "32px", ".plan should have margin-bottom: 32px");
}`,
      },
      {
        name: "the plan header has bottom padding, a bottom border and bottom margin",
        code: `const s = getComputedStyle(document.querySelector(".plan-header"));
assert.equal(s.paddingBottom, "16px", ".plan-header should have padding-bottom: 16px");
assert.equal(s.borderBottomWidth, "2px", ".plan-header should have a 2px bottom border");
assert.equal(s.borderBottomStyle, "solid", "The .plan-header bottom border should be solid");
assert.equal(s.marginBottom, "16px", ".plan-header should have margin-bottom: 16px");`,
      },
      {
        name: "the price has no top margin and 8px bottom margin",
        code: `const s = getComputedStyle(document.querySelector(".plan-price"));
assert.equal(parseFloat(s.marginTop), 0, ".plan-price should have margin-top: 0");
assert.equal(s.marginBottom, "8px", ".plan-price should have margin-bottom: 8px");`,
      },
      {
        name: "the call-to-action link has 12px vertical and 20px horizontal padding",
        code: `const s = getComputedStyle(document.querySelector(".cta"));
assert.equal(s.paddingTop, "12px", ".cta padding-top should be 12px");
assert.equal(s.paddingBottom, "12px", ".cta padding-bottom should be 12px");
assert.equal(s.paddingLeft, "20px", ".cta padding-left should be 20px");
assert.equal(s.paddingRight, "20px", ".cta padding-right should be 20px");`,
      },
    ],
    solution: CHALLENGE_SOLUTION,
    hints: [
      "The reset goes first: `*, *::before, *::after { box-sizing: border-box; }`.",
      "`padding: 24px;` and `border: 1px solid rgb(203, 213, 225);` cover all four sides.",
      "A bottom-only border is `border-bottom: 2px solid ...`.",
      "`margin: 0 0 8px;` means top 0, left/right 0, bottom 8px. `padding: 12px 20px;` means 12px top/bottom, 20px left/right.",
    ],
    explanation:
      "The reset makes each 320px card exactly 320px on screen even with 24px padding and a 1px border (content width 270px). Padding creates space *inside* cards and the button, borders draw the card edge and header divider, and margins create space *between* the header, price and the next card. Note that `.cta` is an inline link: its vertical padding paints a bigger blue area but doesn't push lines apart. A later lesson on `display` shows how `inline-block` fixes that.",
  },
  keyPoints: [
    "Every element is a box: **content → padding → border → margin**, from the inside out.",
    "Under the default `content-box`, visible width = `width` + padding + border (200 + 32 + 4 = 236px). Under `border-box`, visible width = `width` (200px).",
    "Start stylesheets with `*, *::before, *::after { box-sizing: border-box; }` so sizes are predictable.",
    "Shorthands go clockwise from the top: **T R B L**. Two values = vertical, horizontal. Three = top, horizontal, bottom.",
    "`border` needs a style (`solid`, `dashed`, ...) or nothing is drawn.",
    "Padding is inside (background shows); margin is outside (always transparent).",
    "Adjacent vertical margins collapse to the larger value; horizontal margins never collapse.",
    "Inline boxes ignore `width`, `height` and vertical margins; `margin: 0 auto` centres a block that has a width.",
  ],
  cheatSheet: [
    { item: "`padding: 16px;`", meaning: "16px inside the border on all four sides" },
    { item: "`padding: 8px 16px;`", meaning: "8px top and bottom, 16px left and right" },
    { item: "`margin: 0 0 24px;`", meaning: "Top 0, left/right 0, bottom 24px" },
    { item: "`margin: 4px 8px 12px 16px;`", meaning: "Top, right, bottom, left (clockwise)" },
    { item: "`margin-bottom: 24px;`", meaning: "Longhand: set one side only" },
    { item: "`border: 2px solid rgb(0, 0, 0);`", meaning: "Width, style and colour on all sides (style is required)" },
    { item: "`border-top: 1px dashed gray;`", meaning: "Border on one side only" },
    { item: "`box-sizing: content-box;`", meaning: "Default: `width` = content only; padding and border are added" },
    { item: "`box-sizing: border-box;`", meaning: "`width` includes padding and border" },
    { item: "`*, *::before, *::after { box-sizing: border-box; }`", meaning: "The standard reset applied to every element" },
    { item: "`margin: 0 auto;`", meaning: "Centre a block box that has a width" },
    { item: "DevTools → Computed / Layout tab", meaning: "Shows the element's box-model diagram with exact values" },
  ],
  completionCriteria: [
    "You can name the four layers of a CSS box and point to each one in the DevTools box-model diagram.",
    "You can calculate an element's on-screen width under both `content-box` and `border-box`.",
    "You can add the `border-box` reset and explain why projects use it.",
    "You can write `padding`, `margin` and `border` with shorthands and longhands and predict which side gets which value.",
    "You can choose padding or margin for a spacing problem and explain why the background shows through one but not the other.",
    "You can explain why two stacked vertical margins of 24px and 16px make a 24px gap.",
  ],
  related: ["css-units-sizing", "css-display-positioning", "css-flexbox", "css-grid", "css-organizing-css"],
  references: [
    {
      title: "MDN: Introduction to the CSS basic box model",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model",
    },
    { title: "MDN: box-sizing", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing" },
    {
      title: "MDN: Mastering margin collapsing",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing",
    },
    { title: "web.dev Learn CSS: Box model", url: "https://web.dev/learn/css/box-model" },
    { title: "W3C: CSS Box Model Module Level 3", url: "https://www.w3.org/TR/css-box-3/" },
    { title: "W3C: CSS Box Sizing Module Level 3 (box-sizing)", url: "https://www.w3.org/TR/css-sizing-3/#box-sizing" },
    { title: "Chrome DevTools: View and change CSS", url: "https://developer.chrome.com/docs/devtools/css" },
  ],
};

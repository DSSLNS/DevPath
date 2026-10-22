import type { Lesson } from "@/content/types";

// Complete HTML documents used by the web runtime. Kept as constants so the
// markup stays readable; none of them contain backticks or `${`.

const firstStyledPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Corner Bakery</title>
    <style>
      /* Page-wide look */
      body {
        background-color: #fff8e7;
        font-family: Georgia, serif;
      }

      h1 {
        color: #7c2d12;
        text-align: center;
      }

      p {
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <h1>Corner Bakery</h1>
    <p>Fresh sourdough every morning from 7 am.</p>
  </body>
</html>`;

const threeWaysPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Three ways to add CSS</title>
    <!-- In a real project you would also have:
         <link rel="stylesheet" href="styles.css">
         The playground has no network, so that file cannot load here. -->
    <style>
      /* Internal stylesheet: applies to every <p> on this page */
      p {
        color: darkslategray;
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <h1>Shipping update</h1>
    <p>Orders placed before 2 pm ship the same day.</p>
    <p>Free delivery on orders over $50.</p>
    <!-- Inline style: applies to this one element only -->
    <p style="color: crimson;">Warehouse closed on Monday.</p>
  </body>
</html>`;

const firstPropertiesPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Sale banner</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
      }

      h1 {
        color: white;
        background-color: #1d4ed8;
        text-align: center;
        font-size: 36px;
      }

      p {
        color: #334155;
        font-size: 18px;
        text-align: center;
      }

      footer {
        color: gray;
        font-size: 14px;
        text-align: right;
      }
    </style>
  </head>
  <body>
    <h1>Summer Sale</h1>
    <p>Everything in the garden range is 20% off this week.</p>
    <footer>Offer ends Sunday at midnight.</footer>
  </body>
</html>`;

const invalidDeclarationsPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Spot the ignored declarations</title>
    <style>
      h1 {
        colour: purple;          /* misspelled property: ignored */
        text-align: centre;      /* misspelled value: ignored */
        font-size: 40px;         /* valid: applied */
      }

      p {
        color: green             /* missing semicolon... */
        font-size: 20px;         /* ...so this line is swallowed too */
        background-color: #fef9c3; /* valid: applied */
      }
    </style>
  </head>
  <body>
    <h1>Order confirmed</h1>
    <p>Right-click this text, choose Inspect, and look for struck-through rules in the Styles pane.</p>
  </body>
</html>`;

const walkthroughPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Store notice</title>
    <style>
      /* Base text style for the whole page */
      body {
        font-family: Verdana, sans-serif;
        background-color: whitesmoke;
      }

      h1 {
        color: navy;
        text-align: center;
      }

      p {
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <h1>Store notice</h1>
    <p>We are open late on Fridays.</p>
    <p style="color: firebrick;">Closed on public holidays.</p>
  </body>
</html>`;

// --- exercise pages ---------------------------------------------------------

const ex1Starter = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Book club</title>
    <!-- Add a <style> element here -->
  </head>
  <body>
    <h1>Thursday Book Club</h1>
    <p>This month we are reading a mystery novel.</p>
  </body>
</html>`;

const ex1Solution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Book club</title>
    <style>
      h1 {
        color: navy;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>Thursday Book Club</h1>
    <p>This month we are reading a mystery novel.</p>
  </body>
</html>`;

const ex3Starter = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Return policy</title>
  </head>
  <body>
    <h1 style="color: darkred; text-align: center;">Return policy</h1>
    <p style="font-size: 18px;">You can return any item within 30 days.</p>
    <p style="font-size: 18px;">Keep your receipt as proof of purchase.</p>
    <footer style="text-align: right; color: gray;">Questions? Ask at the front desk.</footer>
  </body>
</html>`;

const ex3Solution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Return policy</title>
    <style>
      h1 {
        color: darkred;
        text-align: center;
      }

      p {
        font-size: 18px;
      }

      footer {
        text-align: right;
        color: gray;
      }
    </style>
  </head>
  <body>
    <h1>Return policy</h1>
    <p>You can return any item within 30 days.</p>
    <p>Keep your receipt as proof of purchase.</p>
    <footer>Questions? Ask at the front desk.</footer>
  </body>
</html>`;

const ex4Buggy = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Delivery status</title>
    <style>
      h1 {
        color: darkgreen
        text-align: center;
      }

      p {
        font-size: 18 px;
        backround-color: lightyellow;
      }
    </style>
  </head>
  <body>
    <h1>Your parcel is on its way</h1>
    <p>Expected delivery: tomorrow between 9 am and 1 pm.</p>
  </body>
</html>`;

const ex4Solution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Delivery status</title>
    <style>
      h1 {
        color: darkgreen;
        text-align: center;
      }

      p {
        font-size: 18px;
        background-color: lightyellow;
      }
    </style>
  </head>
  <body>
    <h1>Your parcel is on its way</h1>
    <p>Expected delivery: tomorrow between 9 am and 1 pm.</p>
  </body>
</html>`;

const challengeStarter = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Green Leaf Cafe</title>
    <!-- Add your <style> element here -->
  </head>
  <body>
    <h1>Green Leaf Cafe</h1>
    <p>Breakfast, lunch and the best oat-milk latte in town.</p>
    <p>Open Monday to Saturday, 8 am to 4 pm.</p>
    <footer>Prices include tax.</footer>
  </body>
</html>`;

const challengeSolution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Green Leaf Cafe</title>
    <style>
      /* Page background and font for everything */
      body {
        background-color: #f0fdf4;
        font-family: Georgia, serif;
      }

      /* Cafe name */
      h1 {
        color: #166534;
        text-align: center;
        font-size: 40px;
      }

      /* Description and opening hours */
      p {
        font-size: 18px;
        text-align: center;
      }

      /* Small print */
      footer {
        color: gray;
        font-size: 14px;
        text-align: right;
      }
    </style>
  </head>
  <body>
    <h1>Green Leaf Cafe</h1>
    <p>Breakfast, lunch and the best oat-milk latte in town.</p>
    <p>Open Monday to Saturday, 8 am to 4 pm.</p>
    <footer>Prices include tax.</footer>
  </body>
</html>`;

export const whatIsCss: Lesson = {
  id: "css-what-is-css",
  slug: "what-is-css",
  title: "What CSS Is and How to Add It",
  summary:
    "Learn what CSS does, how a CSS rule is built, the three ways to attach CSS to an HTML page, and your first five properties: color, background-color, font-family, font-size and text-align.",
  difficulty: "beginner",
  minutes: 30,
  tech: ["css", "html"],
  tags: ["css", "stylesheet", "style element", "link element", "inline styles", "css syntax", "devtools"],
  objectives: [
    "Explain what CSS is and why content (HTML) and presentation (CSS) are kept separate.",
    "Name every part of a CSS rule: selector, declaration block, declaration, property, value and semicolon.",
    "Add CSS to a page with an inline `style` attribute, a `<style>` element, and an external stylesheet linked with `<link rel=\"stylesheet\">`, and choose the right one for the job.",
    "Write CSS comments and recognise the browser's default (user-agent) styles.",
    "Use `color`, `background-color`, `font-family`, `font-size` and `text-align` to style text.",
    "Find ignored (invalid) declarations using the browser DevTools Styles pane.",
  ],
  prerequisites: ["html-document-structure"],
  intro: [
    {
      kind: "paragraph",
      text: "**What it is:** CSS (Cascading Style Sheets) is the language that controls how HTML looks: colours, fonts, sizes, spacing, layout and even animation. HTML says *what* something is (a heading, a paragraph, a link); CSS says *how it should appear*.",
    },
    {
      kind: "paragraph",
      text: "**Why it matters:** Without CSS, every web page would look like a plain document: black serif text on a white background, stacked from top to bottom. CSS turns that structure into a branded, readable, usable interface, and it lets one stylesheet restyle hundreds of pages at once.",
    },
    {
      kind: "paragraph",
      text: "**Where it is used:** every website and web app you use, from online shops and news sites to email templates, browser extensions and desktop apps built with web technology. Frameworks such as React still rely on plain CSS rules underneath.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "By the end of this lesson you will understand",
      text: "How a browser combines HTML and CSS into a page, how to read and write a CSS rule, the three places CSS can live, why a typo silently does nothing instead of breaking the page, and how to style text with five everyday properties.",
    },
  ],
  terms: [
    { term: "CSS", definition: "Cascading Style Sheets: the language that describes how HTML elements are presented on screen, on paper or in other media." },
    { term: "Stylesheet", definition: "A collection of CSS rules. It can live in a separate `.css` file or inside a `<style>` element." },
    { term: "Rule (ruleset)", definition: "One unit of CSS: a selector followed by a declaration block, for example `h1 { color: navy; }`." },
    { term: "Selector", definition: "The part of a rule that chooses which elements the rule applies to, such as `h1` or `p`." },
    { term: "Declaration block", definition: "The curly braces `{ }` after a selector and everything inside them." },
    { term: "Declaration", definition: "One `property: value;` pair inside a declaration block, such as `color: navy;`." },
    { term: "Property", definition: "The feature you want to change, such as `color` or `font-size`." },
    { term: "Value", definition: "The setting you give a property, such as `navy` or `18px`." },
    { term: "Inline style", definition: "CSS written directly in an element's `style` attribute. It affects only that one element." },
    { term: "Internal stylesheet", definition: "CSS written inside a `<style>` element, usually in the `<head>`. It affects the whole page it is in." },
    { term: "External stylesheet", definition: "CSS saved in its own `.css` file and connected with `<link rel=\"stylesheet\" href=\"…\">`. Many pages can share it." },
    { term: "User-agent stylesheet", definition: "The browser's built-in default styles, for example large bold headings and blue underlined links. Your CSS is applied on top of them." },
    { term: "Separation of concerns", definition: "Keeping content (HTML), presentation (CSS) and behaviour (JavaScript) in separate places so each is easier to change." },
    { term: "DevTools", definition: "Developer tools built into the browser (open with F12 or right-click → Inspect). The Elements/Inspector panel shows which CSS applies to each element." },
  ],
  sections: [
    {
      id: "explanation",
      title: "How CSS and HTML work together",
      blocks: [
        {
          kind: "paragraph",
          text: "Think of a web page as a house. HTML is the structure: walls, rooms and doors. CSS is the decoration: paint, wallpaper, furniture placement. You can repaint every room without moving a single wall, and in the same way you can completely restyle a page without touching its HTML.",
        },
        {
          kind: "paragraph",
          text: "This split is called **separation of concerns**. HTML stays focused on meaning (this is a heading, this is a list of products), and CSS handles appearance. Because the two are separate, a design team can change the brand colour in one stylesheet and every page that uses it updates.",
        },
        {
          kind: "diagram",
          title: "How a browser turns HTML and CSS into a styled page",
          variant: "flow",
          steps: [
            { label: "1. Read the HTML", detail: "The browser parses the markup into a tree of elements (the DOM)." },
            { label: "2. Collect the CSS", detail: "Its own default styles, then every `<link>` stylesheet and `<style>` element, plus inline `style` attributes." },
            { label: "3. Match selectors", detail: "For each element, find every rule whose selector matches it (`h1 { … }` matches every `<h1>`)." },
            { label: "4. Resolve conflicts", detail: "If two rules set the same property, the cascade decides which one wins." },
            { label: "5. Lay out and paint", detail: "The browser works out sizes and positions, then draws pixels on the screen." },
          ],
        },
        {
          kind: "heading",
          text: "The browser already has styles",
        },
        {
          kind: "paragraph",
          text: "Even a page with no CSS is not completely unstyled. Every browser ships a **user-agent stylesheet** that makes `<h1>` large and bold, adds space around paragraphs, underlines links and indents lists. Your own CSS is layered on top of those defaults, which is why a heading is still bold after you only change its colour.",
        },
        {
          kind: "heading",
          text: "CSS is forgiving",
        },
        {
          kind: "paragraph",
          text: "A typo in JavaScript usually stops the script with an error. CSS behaves differently: when the browser meets a declaration it does not understand, such as `colr: red;` or `font-size: big;`, it **ignores that one declaration** and carries on with the rest. Nothing crashes and no error appears on the page. The design simply does not change, which is why you need DevTools to find these mistakes.",
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Why \"cascading\"?",
          text: "Several rules can target the same element, and the browser needs a fair way to choose between them. That decision process is the *cascade*. For now, remember two facts: an inline `style` attribute beats rules in a stylesheet, and when two equal rules clash, the later one wins. The full rules are in the [cascade and specificity lesson](/learn/css/cascade-specificity).",
        },
      ],
    },
    {
      id: "syntax",
      title: "Anatomy of a CSS rule",
      blocks: [
        {
          kind: "code",
          language: "css",
          title: "One rule with two declarations",
          code: "h1 {\n  color: navy;\n  text-align: center;\n}",
        },
        {
          kind: "table",
          caption: "Parts of the rule above",
          headers: ["Part", "In the example", "What it does"],
          rows: [
            ["Selector", "`h1`", "Chooses which elements are styled: here, every `<h1>` on the page."],
            ["Declaration block", "`{ … }`", "Groups all the declarations for that selector."],
            ["Declaration", "`color: navy;`", "One instruction: set one property to one value."],
            ["Property", "`color`", "The feature to change. Property names are fixed words defined by the CSS specifications."],
            ["Colon `:`", "between `color` and `navy`", "Separates the property from its value."],
            ["Value", "`navy`", "The setting for the property. Each property accepts specific kinds of values."],
            ["Semicolon `;`", "after `navy`", "Ends the declaration. Required between declarations; recommended after the last one too."],
          ],
        },
        {
          kind: "heading",
          text: "Comments",
        },
        {
          kind: "code",
          language: "css",
          code: "/* This is a CSS comment. It can be one line... */\n\n/*\n   ...or span several lines.\n   The browser ignores everything between the markers.\n*/\np {\n  font-size: 18px; /* comments can sit after a declaration */\n}",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Only one comment style",
          text: "CSS comments always start with `/*` and end with `*/`. `//` is **not** a comment in CSS, and HTML comments (`<!-- -->`) do not belong inside a stylesheet. Using either one usually makes the browser ignore the declaration that follows.",
        },
        {
          kind: "heading",
          text: "Three ways to add CSS to a page",
        },
        {
          kind: "code",
          language: "html",
          title: "1. Inline: a style attribute on one element",
          code: "<p style=\"color: crimson; font-size: 18px;\">Warehouse closed on Monday.</p>",
        },
        {
          kind: "code",
          language: "html",
          title: "2. Internal: a <style> element in the <head>",
          code: "<head>\n  <meta charset=\"utf-8\">\n  <title>Shop</title>\n  <style>\n    p {\n      color: darkslategray;\n    }\n  </style>\n</head>",
        },
        {
          kind: "code",
          language: "html",
          title: "3. External: a <link> to a separate .css file",
          code: "<!-- index.html -->\n<head>\n  <meta charset=\"utf-8\">\n  <title>Shop</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n\n<!-- styles.css (a separate file, no <style> tags inside) -->\np {\n  color: darkslategray;\n}",
        },
        {
          kind: "table",
          caption: "Choosing where your CSS lives",
          headers: ["Method", "Where it goes", "Affects", "Use it for"],
          rows: [
            ["Inline `style=\"…\"`", "On a single element", "Only that element", "Quick experiments, or values set by JavaScript. Avoid for normal styling."],
            ["`<style>` element", "Inside `<head>`", "Every matching element on this one page", "Single-page demos, prototypes, learning, and this course's playground."],
            ["`<link rel=\"stylesheet\">`", "Inside `<head>`, pointing at a `.css` file", "Every page that links the file", "Real websites. This is the professional default."],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "About the playground",
          text: "The lesson playground runs pages in a sandbox with no network or file system, so a `<link>` to `styles.css` has nothing to load. That is why the runnable examples here use `<style>` elements. In real projects, external stylesheets are the norm.",
        },
        {
          kind: "heading",
          text: "Your first five properties",
        },
        {
          kind: "table",
          headers: ["Property", "What it changes", "Example values"],
          rows: [
            ["`color`", "The text colour of an element", "`navy`, `#1d4ed8`, `rgb(29, 78, 216)`"],
            ["`background-color`", "The colour behind the element's content", "`lightyellow`, `#fff8e7`, `white`"],
            ["`font-family`", "The typeface. List several, separated by commas, ending with a generic family as a fallback", "`Georgia, serif`, `Arial, Helvetica, sans-serif`"],
            ["`font-size`", "How large the text is. In this lesson we use pixels (`px`)", "`14px`, `18px`, `32px`"],
            ["`text-align`", "Horizontal alignment of text inside the element", "`left`, `center`, `right`, `justify`"],
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "American spelling",
          text: "CSS uses US English: `color` and `center`, never `colour` or `centre`. The British spellings are invalid and silently ignored.",
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "A first styled page" },
        {
          kind: "paragraph",
          text: "Three rules in a `<style>` element: one for the whole `body`, one for the heading and one for paragraphs. Run it, then delete the whole `<style>` element to see the browser's default look.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: firstStyledPage },
        { kind: "heading", text: "Inline style next to a <style> element" },
        {
          kind: "paragraph",
          text: "Every paragraph gets the dark slate colour from the `<style>` element, except the last one, whose inline `style` attribute overrides it with crimson. The `font-size` from the `<style>` element still applies to that last paragraph because the inline style only changes `color`.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: threeWaysPage },
        { kind: "heading", text: "Invalid declarations are skipped" },
        {
          kind: "paragraph",
          text: "This page contains deliberate mistakes. Run it: the heading is large (that declaration is valid) but neither purple nor centred, and the paragraph is neither green nor 20px, yet its yellow background still works. Then open DevTools and inspect each element.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: invalidDeclarationsPage },
        {
          kind: "callout",
          tone: "info",
          title: "What the missing semicolon did",
          text: "Without a `;` after `green`, the browser reads `color: green font-size: 20px;` as *one* declaration whose value is `green font-size: 20px`. That is not a valid colour, so the whole thing is thrown away, and you lose two styles for the price of one missing character.",
        },
      ],
    },
    {
      id: "walkthrough",
      title: "Code walkthrough",
      blocks: [
        { kind: "code", language: "html", runtime: "web", runnable: true, code: walkthroughPage },
        {
          kind: "list",
          ordered: true,
          items: [
            "`<style>` sits inside `<head>`, next to `<meta>` and `<title>`. Styles placed there are ready before the body is drawn, so the page never flashes unstyled.",
            "`/* Base text style for the whole page */` is a comment. The browser skips it; it is there for the next person who reads the code.",
            "`body { … }` targets the `<body>` element. `font-family: Verdana, sans-serif;` asks for Verdana and falls back to any sans-serif font if Verdana is missing. Text inside the body **inherits** this font, so you do not repeat it for every element.",
            "`background-color: whitesmoke;` paints the page background a very light grey.",
            "`h1 { color: navy; text-align: center; }` has two declarations, each ending with a semicolon. The heading becomes navy and centred; it stays bold and large because those come from the browser's default styles.",
            "`p { font-size: 18px; }` makes **every** paragraph 18 pixels tall, because the selector `p` matches all `<p>` elements.",
            "The second `<p>` has `style=\"color: firebrick;\"`. That inline style applies to this paragraph only and turns it dark red. It still gets `font-size: 18px` from the `p` rule because nothing overrides that property.",
          ],
        },
      ],
    },
    {
      id: "real-world",
      title: "Real-world use",
      blocks: [
        {
          kind: "list",
          items: [
            "**Websites and shops:** a site usually has one or a few external stylesheets, such as `styles.css`, linked from every page. Changing the brand colour in that file updates the whole site.",
            "**Frameworks and build tools:** tools like Next.js, Vite or WordPress themes still produce ordinary `.css` files and `<link>` tags in the final HTML, even if you write the CSS in a different way.",
            "**Email templates:** many email programs strip `<style>` and `<link>`, so HTML emails often rely on inline `style` attributes. That is one of the few places inline styles are the normal choice.",
            "**JavaScript-driven styling:** scripts sometimes set inline styles, for example `element.style.color = \"red\"`, to reflect live changes such as a validation error. You will see this in the DOM lessons.",
            "**Debugging in DevTools:** front-end developers spend a lot of time in the Styles pane, toggling declarations on and off and trying new values before copying them into the stylesheet.",
          ],
        },
        {
          kind: "table",
          caption: "Where you will meet each method",
          headers: ["Situation", "Typical choice", "Why"],
          rows: [
            ["Multi-page website", "External stylesheet", "One file, cached by the browser, shared by every page."],
            ["Single demo page or code playground", "`<style>` element", "Everything in one file; easy to share."],
            ["HTML email", "Inline `style`", "Many mail clients ignore other methods."],
            ["One-off override while debugging", "DevTools or temporary inline style", "Fast to try; move the final value into the stylesheet."],
          ],
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Forgetting the semicolon between declarations",
      wrong: "h1 {\n  color: navy\n  text-align: center;\n}",
      right: "h1 {\n  color: navy;\n  text-align: center;\n}",
      explanation:
        "Without the semicolon, both lines become one invalid declaration and **both** styles are lost. End every declaration with `;`, including the last one, so adding a new line later cannot break it.",
    },
    {
      title: "Using British spelling or made-up property names",
      wrong: "p {\n  colour: green;\n  text-align: centre;\n  font-colour: red;\n}",
      right: "p {\n  color: green;\n  text-align: center;\n}",
      explanation:
        "Property names and keyword values are fixed. `colour`, `centre` and `font-colour` do not exist, so the browser ignores them without any warning on the page. Text colour is simply `color`.",
    },
    {
      title: "Putting a space between a number and its unit",
      wrong: "p {\n  font-size: 18 px;\n}",
      right: "p {\n  font-size: 18px;\n}",
      explanation: "`18 px` is two separate tokens, not a length, so the declaration is invalid. Write the number and unit together: `18px`. A bare number like `font-size: 18;` is also invalid.",
    },
    {
      title: "Wrapping an external stylesheet in <style> tags",
      wrong: "/* styles.css */\n<style>\n  p { color: navy; }\n</style>",
      right: "/* styles.css */\np {\n  color: navy;\n}",
      explanation: "A `.css` file contains only CSS. `<style>` is HTML and belongs in an `.html` file. Inside a `.css` file the tags are garbage that can cause the first rule to be ignored.",
    },
    {
      title: "Using // or <!-- --> for comments",
      wrong: "p {\n  // make the text bigger\n  font-size: 18px;\n}",
      right: "p {\n  /* make the text bigger */\n  font-size: 18px;\n}",
      explanation: "CSS has only one comment syntax, `/* … */`. A `//` line is treated as broken CSS and swallows the next declaration, so `font-size` silently stops working.",
    },
    {
      title: "Styling everything with inline style attributes",
      wrong: "<p style=\"color: gray; font-size: 14px;\">Shipping info</p>\n<p style=\"color: gray; font-size: 14px;\">Returns info</p>",
      right: "<style>\n  p {\n    color: gray;\n    font-size: 14px;\n  }\n</style>\n<p>Shipping info</p>\n<p>Returns info</p>",
      explanation: "Inline styles repeat the same values on every element, mix design into your content, and are hard to override later. Write one rule and let the selector find the elements.",
    },
  ],
  debugging: [
    "**Inspect the element:** right-click it and choose *Inspect* (or press F12). The Styles pane (Chrome, Edge) or Rules pane (Firefox) lists every rule that matches the element, including the browser's own `user agent stylesheet` rules.",
    "**Look for struck-through declarations:** a line drawn through a declaration means it is not being used. If it also shows a warning icon (a yellow triangle in Chrome, a warning sign in Firefox), the property name or value is invalid, so check spelling, units and the semicolon on the line above. A strike-through *without* a warning means another rule won; see the cascade lesson.",
    "**Check the Computed tab:** it shows the final value of every property for the selected element, for example `color: rgb(0, 0, 128)`. If the value is not what you wrote, click through to see which rule supplied it.",
    "**Rule not listed at all?** Then the selector does not match the element, or the stylesheet did not load. For external files, open the Network panel and look for `styles.css`: a 404 status means the `href` path is wrong.",
    "**Try values live:** click any value in the Styles pane to edit it, or untick a checkbox to switch a declaration off. Nothing is saved, so copy the working value back into your file.",
    "**Validate your CSS:** paste it into the [W3C CSS Validation Service](https://jigsaw.w3.org/css-validator/) to get a list of unknown properties and invalid values with line numbers.",
  ],
  bestPractices: [
    "**Essential:** keep styling in a stylesheet, not in `style` attributes. Use a `<style>` element while learning and external `.css` files in real projects.",
    "**Essential:** end every declaration with a semicolon and put each declaration on its own line, indented inside the braces. Mistakes become much easier to spot.",
    "**Essential:** always finish a `font-family` list with a generic family such as `serif`, `sans-serif` or `monospace`, so text still looks reasonable if the preferred font is missing.",
    "Put `<style>` and `<link rel=\"stylesheet\">` inside `<head>`, so styles load before the content is shown.",
    "Use comments to label sections of a stylesheet and to explain *why* a value was chosen, not to repeat what the code already says.",
    "Check text colour against its background colour so it stays readable. The accessibility lesson covers contrast ratios in detail.",
    "**Advanced:** for multi-page sites, share one external stylesheet so the browser can cache it and every page stays consistent. The *Organizing Reusable CSS* lesson (later in this course) covers structuring larger stylesheets.",
  ],
  cheatSheet: [
    { item: "`selector { property: value; }`", meaning: "The shape of every CSS rule." },
    { item: "`/* comment */`", meaning: "The only CSS comment syntax. Works on one or many lines." },
    { item: "`<p style=\"color: red;\">`", meaning: "Inline style: affects only this element." },
    { item: "`<style> … </style>`", meaning: "Internal stylesheet in the `<head>`: affects this page." },
    { item: "`<link rel=\"stylesheet\" href=\"styles.css\">`", meaning: "External stylesheet in the `<head>`: shared by every page that links it." },
    { item: "`color: navy;`", meaning: "Text colour." },
    { item: "`background-color: lightyellow;`", meaning: "Background colour behind the element's content." },
    { item: "`font-family: Georgia, serif;`", meaning: "Typeface list, ending with a generic fallback." },
    { item: "`font-size: 18px;`", meaning: "Text size in pixels; no space between number and unit." },
    { item: "`text-align: center;`", meaning: "Horizontal alignment: `left`, `center`, `right` or `justify`." },
    { item: "Struck-through declaration with a warning icon", meaning: "DevTools is telling you the declaration is invalid and was ignored." },
  ],
  examples: [
    {
      id: "css-what-is-css-example-first-page",
      title: "A first styled page",
      runtime: "web",
      code: firstStyledPage,
    },
    {
      id: "css-what-is-css-example-inline-vs-style",
      title: "Inline style vs <style> element",
      runtime: "web",
      code: threeWaysPage,
    },
    {
      id: "css-what-is-css-example-five-properties",
      title: "Five first properties: a sale banner",
      runtime: "web",
      code: firstPropertiesPage,
    },
    {
      id: "css-what-is-css-example-invalid",
      title: "Find the ignored declarations",
      runtime: "web",
      code: invalidDeclarationsPage,
    },
  ],
  exercises: [
    {
      id: "css-what-is-css-ex-1",
      type: "code",
      runtime: "web",
      difficulty: "beginner",
      prompt: "Add a `<style>` element to the page's `<head>` with one rule that makes the `<h1>` **navy** and **centred**.",
      instructions: "Use the selector `h1` and two declarations: `color` and `text-align`. Do not use a `style` attribute.",
      starter: ex1Starter,
      tests: [
        {
          name: "the page has a <style> element in the head",
          code: "assert.ok(document.querySelector(\"head style\"), \"Add a <style> element inside <head>\");",
        },
        {
          name: "the heading is navy",
          code: "const h1 = document.querySelector(\"h1\");\nassert.equal(getComputedStyle(h1).color, \"rgb(0, 0, 128)\", \"Set color: navy; on the h1\");",
        },
        {
          name: "the heading is centred",
          code: "const h1 = document.querySelector(\"h1\");\nassert.equal(getComputedStyle(h1).textAlign, \"center\", \"Set text-align: center; (US spelling) on the h1\");",
        },
        {
          name: "no inline style attribute is used",
          code: "assert.equal(document.querySelector(\"h1\").hasAttribute(\"style\"), false, \"Style the heading from the <style> element, not a style attribute\");",
        },
      ],
      solution: ex1Solution,
      hints: [
        "A `<style>` element goes inside `<head>`, after `<title>` is fine.",
        "The rule looks like `h1 { property: value; property: value; }`.",
        "The property for alignment is `text-align` and the value is `center` (US spelling).",
      ],
      explanation:
        "`h1 { color: navy; text-align: center; }` inside a `<style>` element selects every `<h1>` on the page and sets two properties. `navy` is a named colour; browsers report it as `rgb(0, 0, 128)` in the Computed tab.",
    },
    {
      id: "css-what-is-css-ex-2",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Complete the rule so every paragraph uses an 18-pixel font and a light yellow background. Each blank is one property name, value or symbol.",
      template: "p ___\n  font-size: ___;\n  ___: lightyellow;\n}",
      blanks: [{ answers: ["{"] }, { answers: ["18px"] }, { answers: ["background-color"] }],
      hints: [
        "A declaration block opens with a curly brace.",
        "Write the number and the unit together, with no space.",
        "The background property has a hyphen in its name.",
      ],
      explanation: "The full rule is `p { font-size: 18px; background-color: lightyellow; }`. `{` opens the declaration block, `18px` is a valid length, and `background-color` is the property for the colour behind the content.",
    },
    {
      id: "css-what-is-css-ex-3",
      type: "code",
      runtime: "web",
      difficulty: "intermediate",
      prompt:
        "This return-policy page styles everything with inline `style` attributes, and the paragraph style is repeated. Move all of the styling into a single `<style>` element in the `<head>` so the page **looks exactly the same** but has no `style` attributes left.",
      instructions:
        "Write one rule each for `h1`, `p` and `footer`. Remove every `style=\"…\"` attribute from the body.",
      starter: ex3Starter,
      tests: [
        {
          name: "no element has a style attribute",
          code: "const inline = document.querySelectorAll(\"body [style]\");\nassert.equal(inline.length, 0, \"Remove every style attribute; found \" + inline.length);",
        },
        {
          name: "a <style> element is in the head",
          code: "assert.ok(document.querySelector(\"head style\"), \"Add a <style> element inside <head>\");",
        },
        {
          name: "the heading is still dark red and centred",
          code: "const s = getComputedStyle(document.querySelector(\"h1\"));\nassert.equal(s.color, \"rgb(139, 0, 0)\", \"h1 should be darkred\");\nassert.equal(s.textAlign, \"center\", \"h1 should be centred\");",
        },
        {
          name: "both paragraphs are still 18px",
          code: "const ps = document.querySelectorAll(\"p\");\nassert.equal(ps.length, 2, \"Keep both paragraphs\");\nps.forEach((p) => assert.equal(getComputedStyle(p).fontSize, \"18px\", \"Every paragraph should have font-size: 18px\"));",
        },
        {
          name: "the footer is still grey and right-aligned",
          code: "const s = getComputedStyle(document.querySelector(\"footer\"));\nassert.equal(s.color, \"rgb(128, 128, 128)\", \"footer should be gray\");\nassert.equal(s.textAlign, \"right\", \"footer should be right-aligned\");",
        },
      ],
      solution: ex3Solution,
      hints: [
        "Copy the text inside each `style=\"…\"` attribute into the braces of a rule whose selector is that element's tag name.",
        "The two paragraphs share one rule: `p { font-size: 18px; }`.",
        "After the `<style>` element works, delete the `style` attributes and check nothing changed in the preview.",
      ],
      explanation:
        "The declarations inside an inline `style` attribute have exactly the same syntax as those in a rule, so moving them is mostly copy and paste. Using the selector `p` styles both paragraphs with one declaration instead of two, which is the main reason stylesheets beat inline styles.",
    },
    {
      id: "css-what-is-css-ex-4",
      type: "find-bug",
      runtime: "web",
      difficulty: "beginner",
      debugging: true,
      prompt:
        "The delivery page should show a **dark green, centred** heading and an **18px** paragraph on a **light yellow** background. None of these styles appear. Find and fix the three bugs in the CSS.",
      instructions: "Open DevTools on the preview if you like: every broken declaration is struck through with a warning icon.",
      code: ex4Buggy,
      tests: [
        {
          name: "the heading is dark green",
          code: "assert.equal(getComputedStyle(document.querySelector(\"h1\")).color, \"rgb(0, 100, 0)\", \"h1 should be darkgreen. Check the end of the color line\");",
        },
        {
          name: "the heading is centred",
          code: "assert.equal(getComputedStyle(document.querySelector(\"h1\")).textAlign, \"center\", \"h1 should be centred\");",
        },
        {
          name: "the paragraph is 18px",
          code: "assert.equal(getComputedStyle(document.querySelector(\"p\")).fontSize, \"18px\", \"Paragraph font-size should be 18px. Check the unit\");",
        },
        {
          name: "the paragraph has a light yellow background",
          code: "assert.equal(getComputedStyle(document.querySelector(\"p\")).backgroundColor, \"rgb(255, 255, 224)\", \"Paragraph should have background-color: lightyellow. Check the spelling\");",
        },
      ],
      solution: ex4Solution,
      hints: [
        "Look at the end of each line in the `h1` rule. Is every declaration finished?",
        "Is there a space somewhere a length should not have one?",
        "Read the property names letter by letter.",
      ],
      explanation:
        "Bug 1: `color: darkgreen` had no semicolon, so it merged with the next line and both heading styles were dropped. Bug 2: `18 px` is not a valid length; it must be `18px`. Bug 3: `backround-color` is misspelled, so the browser does not recognise the property. CSS ignored all three silently, which is why DevTools' struck-through declarations are the fastest way to find them.",
    },
  ],
  quiz: [
    {
      id: "css-what-is-css-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What is the main job of CSS on a web page?",
      options: [
        { id: "a", text: "To define the structure and meaning of content", explanation: "That is HTML's job: headings, paragraphs, lists and links." },
        { id: "b", text: "To control how content is presented: colours, fonts, sizes and layout", explanation: "Correct. CSS describes the appearance of the HTML elements." },
        { id: "c", text: "To store data in a database", explanation: "CSS runs in the browser and has nothing to do with databases." },
        { id: "d", text: "To add interactive behaviour such as responding to clicks", explanation: "Behaviour is mostly JavaScript's job. CSS can react to states like hover, but its purpose is presentation." },
      ],
      answer: "b",
      hints: ["Think about separation of concerns: content, presentation, behaviour."],
      explanation: "HTML provides content and meaning, CSS provides presentation, and JavaScript provides behaviour.",
    },
    {
      id: "css-what-is-css-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "In the rule `p { font-size: 18px; }`, what is `font-size`?",
      code: "p {\n  font-size: 18px;\n}",
      options: [
        { id: "a", text: "The selector", explanation: "The selector is `p`, the part before the braces." },
        { id: "b", text: "The value", explanation: "The value is `18px`, after the colon." },
        { id: "c", text: "The property", explanation: "Correct. `font-size` names the feature being changed." },
        { id: "d", text: "The declaration block", explanation: "The declaration block is the whole `{ … }` section." },
      ],
      answer: "c",
      hints: ["A declaration is written `property: value;`."],
      explanation: "In a declaration, the word before the colon is the property and the part after it is the value. `font-size: 18px;` as a whole is one declaration.",
    },
    {
      id: "css-what-is-css-q3",
      type: "mcq",
      difficulty: "beginner",
      prompt: "You are building a 20-page company website. Where should most of the CSS go?",
      options: [
        { id: "a", text: "In `style` attributes on each element", explanation: "You would repeat the same styles hundreds of times and every change would mean editing every page." },
        { id: "b", text: "In a `<style>` element copied into each page", explanation: "Better than inline, but a change still means editing all 20 copies." },
        { id: "c", text: "In one external `.css` file linked from every page with `<link rel=\"stylesheet\">`", explanation: "Correct. One file, one place to change, and the browser can cache it between pages." },
        { id: "d", text: "In an HTML comment at the top of each page", explanation: "Comments are ignored by the browser; nothing in them is applied." },
      ],
      answer: "c",
      hints: ["Which option lets you change the brand colour in exactly one place?"],
      explanation: "External stylesheets are shared by every page that links them, which keeps the site consistent and easy to maintain.",
    },
    {
      id: "css-what-is-css-q4",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "What does the browser do with this rule?",
      code: "h2 {\n  colour: teal;\n  font-size: 24px;\n}",
      options: [
        { id: "a", text: "Shows an error message on the page", explanation: "CSS never displays errors on the page. Problems are silent." },
        { id: "b", text: "Ignores the whole stylesheet", explanation: "One bad declaration does not stop the rest of the stylesheet." },
        { id: "c", text: "Ignores `colour: teal;` but still applies `font-size: 24px;`", explanation: "Correct. Only the invalid declaration is dropped." },
        { id: "d", text: "Treats `colour` as `color` and makes the heading teal", explanation: "Browsers do not autocorrect property names. `colour` is simply unknown." },
      ],
      answer: "c",
      hints: ["CSS is forgiving: it skips what it does not understand."],
      explanation: "The CSS parser skips an invalid declaration and keeps going. In DevTools, `colour: teal` appears struck through with a warning icon.",
    },
    {
      id: "css-what-is-css-q5",
      type: "multi-select",
      difficulty: "beginner",
      prompt: "Which of these correctly add CSS to an HTML page? Select all that apply.",
      options: [
        { id: "a", text: "`<p style=\"color: navy;\">`", explanation: "Correct: an inline style attribute." },
        { id: "b", text: "`<style> p { color: navy; } </style>` inside `<head>`", explanation: "Correct: an internal stylesheet." },
        { id: "c", text: "`<link rel=\"stylesheet\" href=\"styles.css\">` inside `<head>`", explanation: "Correct: an external stylesheet." },
        { id: "d", text: "`<css src=\"styles.css\"></css>`", explanation: "There is no `<css>` element in HTML." },
        { id: "e", text: "`<script src=\"styles.css\"></script>`", explanation: "`<script>` loads JavaScript, not CSS." },
      ],
      answers: ["a", "b", "c"],
      hints: ["There are exactly three standard ways."],
      explanation: "Inline `style` attributes, `<style>` elements and `<link rel=\"stylesheet\">` are the three standard ways. `<css>` does not exist and `<script>` is for JavaScript.",
    },
    {
      id: "css-what-is-css-q6",
      type: "true-false",
      difficulty: "beginner",
      prompt: "A page with no CSS at all is shown with no styling whatsoever: headings, paragraphs and links all look identical.",
      answer: false,
      hints: ["Why is an `<h1>` big and bold even on a page you have not styled?"],
      explanation: "Browsers apply a built-in user-agent stylesheet, so headings are large and bold, links are blue and underlined, and paragraphs have space around them, even before you write any CSS.",
    },
    {
      id: "css-what-is-css-q7",
      type: "match",
      difficulty: "beginner",
      prompt: "Match each part of `h1 { color: navy; }` to its name.",
      pairs: [
        { left: "`h1`", right: "Selector" },
        { left: "`color`", right: "Property" },
        { left: "`navy`", right: "Value" },
        { left: "`color: navy;`", right: "Declaration" },
        { left: "`{ color: navy; }`", right: "Declaration block" },
      ],
      hints: ["The selector chooses elements; the declaration block holds the instructions."],
      explanation: "The selector `h1` picks the elements, the braces form the declaration block, and inside it `color: navy;` is a declaration made of the property `color` and the value `navy`.",
    },
  ],
  challenge: {
    id: "css-what-is-css-challenge",
    type: "code",
    runtime: "web",
    difficulty: "beginner",
    prompt:
      "A local cafe has an unstyled landing page. Give it a fresh look using **one `<style>` element** in the `<head>` and only the five properties from this lesson.",
    instructions:
      "Requirements:\n- `body`: background colour `#f0fdf4` and the font list `Georgia, serif`.\n- `h1`: colour `#166534`, centred, `40px`.\n- Every `p`: `18px` and centred.\n- `footer`: `gray`, `14px`, right-aligned.\n- Do not use any `style` attributes. Add at least one CSS comment to label your rules.",
    starter: challengeStarter,
    tests: [
      {
        name: "styles live in a <style> element, not style attributes",
        code: "assert.ok(document.querySelector(\"head style\"), \"Add a <style> element inside <head>\");\nassert.equal(document.querySelectorAll(\"body [style]\").length, 0, \"Do not use style attributes\");",
      },
      {
        name: "the page background is pale green",
        code: "assert.equal(getComputedStyle(document.body).backgroundColor, \"rgb(240, 253, 244)\", \"body needs background-color: #f0fdf4\");",
      },
      {
        name: "the page uses Georgia with a serif fallback",
        code: "const family = getComputedStyle(document.body).fontFamily;\nassert.ok(family.includes(\"Georgia\"), \"body font-family should start with Georgia\");\nassert.ok(/serif\\s*$/.test(family), \"End the font list with the generic family serif\");",
      },
      {
        name: "the heading is dark green, centred and 40px",
        code: "const s = getComputedStyle(document.querySelector(\"h1\"));\nassert.equal(s.color, \"rgb(22, 101, 52)\", \"h1 color should be #166534\");\nassert.equal(s.textAlign, \"center\", \"h1 should be centred\");\nassert.equal(s.fontSize, \"40px\", \"h1 font-size should be 40px\");",
      },
      {
        name: "every paragraph is 18px and centred",
        code: "document.querySelectorAll(\"p\").forEach((p) => {\n  const s = getComputedStyle(p);\n  assert.equal(s.fontSize, \"18px\", \"Each p should be 18px\");\n  assert.equal(s.textAlign, \"center\", \"Each p should be centred\");\n});",
      },
      {
        name: "the footer is grey, 14px and right-aligned",
        code: "const s = getComputedStyle(document.querySelector(\"footer\"));\nassert.equal(s.color, \"rgb(128, 128, 128)\", \"footer color should be gray\");\nassert.equal(s.fontSize, \"14px\", \"footer font-size should be 14px\");\nassert.equal(s.textAlign, \"right\", \"footer should be right-aligned\");",
      },
      {
        name: "the stylesheet has a comment",
        code: "const css = document.querySelector(\"head style\")?.textContent ?? \"\";\nassert.ok(/\\/\\*[\\s\\S]*?\\*\\//.test(css), \"Add at least one /* comment */ to your stylesheet\");",
      },
    ],
    solution: challengeSolution,
    hints: [
      "Start with an empty `<style>` element in the `<head>`, then add one rule per element type: `body`, `h1`, `p`, `footer`.",
      "Hex colours like `#166534` are valid values for `color` and `background-color`.",
      "Check the preview after each rule, and use DevTools if something does not change.",
    ],
    explanation:
      "Four rules cover the whole page because each selector matches every element of that type. Setting `font-family` on `body` is enough: headings, paragraphs and the footer inherit it. Hex colours are reported back by the browser in `rgb()` form, which is what DevTools' Computed tab shows too.",
  },
  keyPoints: [
    "HTML describes content and meaning; CSS describes presentation. Keeping them separate makes both easier to change.",
    "A rule is `selector { property: value; }`. The selector picks elements; each declaration sets one property.",
    "CSS can be added inline (`style` attribute), internally (`<style>` in `<head>`) or externally (`<link rel=\"stylesheet\" href=\"…\">`). External files are the norm for real sites.",
    "Browsers apply default user-agent styles first; your CSS is layered on top.",
    "Invalid declarations are silently ignored, not reported on the page. Find them in DevTools as struck-through lines with a warning icon.",
    "Comments use `/* … */` only. US spellings (`color`, `center`) and units without spaces (`18px`) are required.",
    "When rules conflict, the cascade decides the winner; inline styles beat stylesheet rules (details in the cascade lesson).",
  ],
  completionCriteria: [
    "You can explain the difference between what HTML does and what CSS does.",
    "You can label the selector, declaration block, declarations, properties and values in any simple CSS rule.",
    "You can add CSS to a page in all three ways and explain why external stylesheets are preferred for real websites.",
    "You can style text with `color`, `background-color`, `font-family`, `font-size` and `text-align`.",
    "You can use DevTools to find a declaration the browser ignored and fix it.",
  ],
  related: [
    "html-what-is-html",
    "html-head-metadata-seo",
    "css-selectors",
    "css-cascade-specificity",
    "css-box-model",
    "css-colors-typography",
    "css-units-sizing",
    "css-organizing-css",
  ],
  references: [
    { title: "MDN: CSS reference and guides", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { title: "MDN: CSS syntax", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax" },
    { title: "MDN: <style> element", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style" },
    { title: "MDN: <link> element", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link" },
    { title: "WHATWG HTML Living Standard: the style element", url: "https://html.spec.whatwg.org/multipage/semantics.html#the-style-element" },
    { title: "W3C: CSS Syntax Module Level 3 (error handling)", url: "https://www.w3.org/TR/css-syntax-3/#error-handling" },
    { title: "web.dev: Learn CSS", url: "https://web.dev/learn/css" },
    { title: "Chrome DevTools: view and change CSS", url: "https://developer.chrome.com/docs/devtools/css" },
    { title: "W3C CSS Validation Service", url: "https://jigsaw.w3.org/css-validator/" },
  ],
};

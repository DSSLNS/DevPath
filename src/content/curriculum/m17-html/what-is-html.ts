import type { Lesson } from "@/content/types";

// Complete HTML documents used by the web runtime. Template literals keep the
// markup readable; none of them contain backticks or `${`.

const minimalPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Green Leaf Plant Shop</title>
  </head>
  <body>
    <h1>Green Leaf Plant Shop</h1>
    <p>Fresh houseplants, delivered to your door.</p>
    <p>Today only: <strong>free delivery</strong> on every order.</p>
  </body>
</html>`;

const anatomyPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Element anatomy</title>
  </head>
  <body>
    <h1>Monstera Deliciosa</h1>

    <!-- A paragraph with an attribute (class) and nested elements -->
    <p class="description">
      A <em>very</em> forgiving plant that likes <strong>bright, indirect light</strong>.
    </p>

    <!-- Void elements: no content, no closing tag -->
    <img src="monstera.jpg" alt="A monstera plant with large split leaves">
    <hr>

    <p>Price: $24<br>Pot not included.</p>
  </body>
</html>`;

const whitespacePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Whitespace collapsing</title>
  </head>
  <body>
    <p>These     words     have     lots     of     spaces.</p>

    <p>
      This sentence
      is split across
      several lines in the source.
    </p>

    <p>A line break you really want:<br>needs a br element.</p>

    <pre>pre   keeps
   spaces   and
      line breaks</pre>
  </body>
</html>`;

const toleranceBuggyPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Error tolerance</title>
  </head>
  <body>
    <h1>Weekend sale</h1>
    <!-- Bug: the strong element is never closed -->
    <p>Order <strong>before Sunday</p>
    <p>Delivery takes two working days.</p>
    <p>Questions? Ask our plant team.</p>
  </body>
</html>`;

const walkthroughPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Opening hours</title>
  </head>
  <body>
    <h1>Opening hours</h1>
    <p class="note">We are open <strong>every day</strong>.</p>
    <img src="shop-front.jpg" alt="The green front door of our shop">
    <p>Mon to Fri: 9am to 6pm<br>Sat and Sun: 10am to 4pm</p>
  </body>
</html>`;

// --- Exercise pages -------------------------------------------------------

const ex2Starter = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>My first page</title>
  </head>
  <body>
    My Plant Shop
    We sell cactus and succulents.
  </body>
</html>`;

const ex2Solution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>My Plant Shop</h1>
    <p>We sell cactus and succulents.</p>
  </body>
</html>`;

const ex4Starter = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Product card</title>
  </head>
  <body>
    <article>
      <!-- Build the product card here -->
    </article>
  </body>
</html>`;

const ex4Solution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Product card</title>
  </head>
  <body>
    <article>
      <h2>Snake Plant</h2>
      <img src="snake-plant.jpg" alt="A tall snake plant in a white pot">
      <p class="price">Only <strong>$18</strong></p>
      <p>Hard to kill and happy in low light.</p>
    </article>
  </body>
</html>`;

const ex5Buggy = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Spring sale</title>
  </head>
  <body>
    <h1>Spring sale</h1>
    <img src=logo.png alt=Green Leaf logo>
    <p>Everything is <strong>20% off</p>
    <p>Free delivery on orders over $30.</p>
  </body>
</html>`;

const ex5Solution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Spring sale</title>
  </head>
  <body>
    <h1>Spring sale</h1>
    <img src="logo.png" alt="Green Leaf logo">
    <p>Everything is <strong>20% off</strong></p>
    <p>Free delivery on orders over $30.</p>
  </body>
</html>`;

const challengeStarter = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Sunrise Bakery</title>
  </head>
  <body>
    Sunrise Bakery opens on Saturday

    Join us for our grand opening. The first 50 customers get a free croissant.

    bread.jpg - a basket of fresh bread

    12 Mill Street
    Riverside
  </body>
</html>`;

const challengeSolution = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Sunrise Bakery</title>
  </head>
  <body>
    <h1>Sunrise Bakery opens on Saturday</h1>

    <p id="intro">Join us for our grand opening. <strong>The first 50 customers get a free croissant.</strong></p>

    <img src="bread.jpg" alt="A basket of fresh bread">

    <hr>

    <p class="address">12 Mill Street<br>Riverside</p>
  </body>
</html>`;

export const whatIsHtml: Lesson = {
  id: "html-what-is-html",
  slug: "what-is-html",
  title: "What HTML Is and How Browsers Use It",
  summary:
    "Learn what HTML is, how elements, tags and attributes fit together, and how a browser turns your HTML file into the page you see.",
  difficulty: "beginner",
  minutes: 30,
  tech: ["html"],
  tags: ["html", "elements", "tags", "attributes", "dom", "browser", "devtools", "markup"],
  objectives: [
    "Explain what HTML is and why it is a markup language rather than a programming language.",
    "Describe the different jobs of HTML, CSS and JavaScript on a web page.",
    "Name the parts of an element: opening tag, attributes, content and closing tag.",
    "Nest elements correctly and describe parent, child and sibling relationships.",
    "Recognise void elements such as `<img>` and `<br>` that have no closing tag.",
    "Explain how a browser parses HTML into the DOM tree and renders it, and inspect that tree with DevTools.",
    "Predict how whitespace in your source code appears on the page.",
    "Explain why browsers forgive HTML mistakes and how to catch those mistakes anyway.",
  ],
  prerequisites: [],
  intro: [
    {
      kind: "paragraph",
      text: "Every web page you have ever visited, from a search engine to an online shop, is built on **HTML** (HyperText Markup Language). HTML is plain text that tells the browser *what each piece of content is*: this line is the main heading, this is a paragraph, this is an image, this is a link to another page.",
    },
    {
      kind: "paragraph",
      text: "You need only two free tools to write HTML. A **text editor** is a program for editing plain text files (VS Code is a popular choice; any plain-text editor works, but not a word processor like Word). A **browser** (Chrome, Firefox, Safari, Edge) is the program that opens web pages and displays them. You save your HTML in a **file**, a named piece of data on your computer such as `index.html`, and open that file in the browser.",
    },
    {
      kind: "paragraph",
      text: "HTML is the foundation that everything else sits on. CSS styles HTML, JavaScript makes HTML interactive, frameworks like React generate HTML, and search engines, screen readers and automated tests all read HTML. If the HTML is wrong, everything built on top of it becomes harder.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "What you will understand by the end",
      text: "You will be able to read and write simple HTML, name every part of an element, explain what happens between saving an `.html` file and seeing a page on screen, and use your browser's DevTools to look at how the browser understood your code.",
    },
  ],
  terms: [
    { term: "HTML", definition: "HyperText Markup Language: the standard language for describing the content and structure of web pages." },
    { term: "Markup language", definition: "A language that labels (marks up) pieces of text to say what they are. It describes content; it does not make decisions or do calculations like a programming language." },
    { term: "Hypertext", definition: "Text that contains links to other text. The \"HT\" in HTML: pages link to other pages." },
    { term: "Element", definition: "One piece of a page, such as a heading or a paragraph. Usually written as an opening tag, some content and a closing tag." },
    { term: "Tag", definition: "The labels in angle brackets that mark where an element starts and ends, such as `<p>` (opening tag) and `</p>` (closing tag)." },
    { term: "Attribute", definition: "Extra information written inside an opening tag as `name=\"value\"`, such as `alt=\"A red mug\"` on an image." },
    { term: "Content", definition: "Whatever sits between an element's opening and closing tags: text, other elements, or both." },
    { term: "Nesting", definition: "Placing elements inside other elements. The outer element is the parent and the inner elements are its children." },
    { term: "Void element", definition: "An element that can never have content, so it has no closing tag. Examples: `<img>`, `<br>`, `<hr>`, `<input>`, `<meta>`." },
    { term: "Browser", definition: "A program (Chrome, Firefox, Safari, Edge) that downloads web pages, understands their HTML, CSS and JavaScript, and draws them on screen." },
    { term: "Parsing", definition: "Reading text and working out its structure. The browser parses HTML to find each element and how elements are nested." },
    { term: "DOM", definition: "Document Object Model: the tree of objects the browser builds in memory from your HTML. CSS and JavaScript work with the DOM, not with your original text." },
    { term: "Rendering", definition: "The browser's process of turning the DOM and CSS into pixels on the screen." },
    { term: "DevTools", definition: "Developer tools built into every major browser. The Elements panel (Inspector in Firefox) shows the live DOM tree of the current page." },
    { term: "Whitespace", definition: "Spaces, tabs and line breaks. In normal HTML text, runs of whitespace are collapsed into a single space when displayed." },
    { term: "HTML Living Standard", definition: "The official, continuously updated specification of HTML, maintained by the WHATWG and followed by all major browsers." },
  ],
  sections: [
    {
      id: "explanation",
      title: "What HTML is and how the browser uses it",
      blocks: [
        { kind: "heading", text: "HTML labels content" },
        {
          kind: "paragraph",
          text: "Imagine handing a printer a page of text and a set of sticky notes: \"this is the title\", \"this is a paragraph\", \"this word is important\". HTML is those sticky notes. You wrap content in **tags**, and the tags tell the browser what the content *means*. The browser then decides how to show it, for example by making headings large and bold.",
        },
        {
          kind: "paragraph",
          text: "HTML is a **markup language**, not a programming language. It has no variables, no `if` statements and no loops; it cannot add two numbers or react to a click by itself. It only describes structure and meaning. That is not a weakness: describing content clearly is a real skill, and it is the part of a website that every visitor, search engine and assistive technology relies on.",
        },
        { kind: "heading", text: "HTML, CSS and JavaScript have different jobs" },
        {
          kind: "table",
          caption: "The three languages of the web",
          headers: ["Language", "Job", "Analogy (a house)", "Example"],
          rows: [
            ["HTML", "Structure and meaning of the content", "Walls, rooms and doors", "`<h1>Plant Shop</h1>`"],
            ["CSS", "Presentation: colours, fonts, spacing, layout", "Paint, furniture and decoration", "`h1 { color: green; }`"],
            ["JavaScript", "Behaviour: reacting to the user, changing the page", "Electricity: lights and doorbells", "Showing a message when a button is clicked"],
          ],
        },
        {
          kind: "paragraph",
          text: "A page works with HTML alone, but it looks plain. CSS and JavaScript are optional layers on top. You will meet CSS in the [CSS course](/learn/css) and a fuller comparison in the planned *HTML vs CSS vs JavaScript* lesson.",
        },
        { kind: "heading", text: "Anatomy of an element" },
        {
          kind: "paragraph",
          text: "Most of HTML is made of **elements**. An element usually has four parts:",
        },
        {
          kind: "code",
          language: "html",
          title: "One element, four parts",
          code: "<p class=\"intro\">Fresh plants every week.</p>\n<!--\n<p ...>            opening tag   (starts the element)\nclass=\"intro\"      attribute     (extra information: name=\"value\")\nFresh plants...    content       (what the element contains)\n</p>               closing tag   (ends the element; note the slash)\n-->",
        },
        {
          kind: "table",
          caption: "Element anatomy",
          headers: ["Part", "Example", "Purpose"],
          rows: [
            ["Opening tag", "`<p>`", "Marks where the element starts and names its type (`p` = paragraph)."],
            ["Attribute", "`class=\"intro\"`", "Adds information about the element. Lives only inside the opening tag."],
            ["Content", "`Fresh plants every week.`", "The text and/or child elements the element contains."],
            ["Closing tag", "`</p>`", "Marks where the element ends. Same name as the opening tag, with a `/`."],
          ],
        },
        {
          kind: "paragraph",
          text: "People often say \"tag\" when they mean \"element\". Strictly, `<p>` and `</p>` are *tags*, and the whole thing from `<p>` to `</p>` (including the content) is the *element*. Knowing the difference helps when reading documentation and error messages.",
        },
        { kind: "heading", text: "Nesting: elements inside elements" },
        {
          kind: "paragraph",
          text: "Elements can contain other elements. In `<p>Order <strong>today</strong></p>`, the `strong` element is **nested** inside the `p`. The `p` is the **parent**, `strong` is its **child**, and elements that share a parent are **siblings**. Nesting must be tidy: the element opened last must be closed first, like boxes inside boxes.",
        },
        { kind: "heading", text: "Void elements" },
        {
          kind: "paragraph",
          text: "A few elements can never contain anything, so they have no closing tag. These are **void elements**. An image is the classic example: everything it needs is in its attributes, so it is just `<img src=\"mug.jpg\" alt=\"A red mug\">`. Others you will meet are `<br>` (line break), `<hr>` (thematic break), `<input>` (form field), `<meta>` and `<link>`. You may see `<br />` with a slash in older code; in HTML that slash is allowed but does nothing.",
        },
        { kind: "heading", text: "From file to page: how the browser works" },
        {
          kind: "paragraph",
          text: "When you open an HTML file, the browser does not display your text directly. It first reads it and builds a model of the page in memory, then draws that model.",
        },
        {
          kind: "diagram",
          title: "How a browser turns HTML into a page",
          variant: "flow",
          steps: [
            { label: "1. Load the file", detail: "The browser reads index.html from your computer or downloads it from a web server. At this point it is just a stream of bytes." },
            { label: "2. Decode the text", detail: "Bytes become characters using the page's character encoding (UTF-8; the next lesson explains <meta charset>)." },
            { label: "3. Tokenise", detail: "The parser splits the text into tokens: start tag <p>, text \"Order \", start tag <strong>, end tag </strong> …" },
            { label: "4. Build the DOM tree", detail: "Tokens become nodes in a tree. Nesting in your HTML becomes parent and child nodes in the tree. Mistakes are silently repaired here." },
            { label: "5. Apply CSS", detail: "The browser's built-in styles (and any CSS you add) decide how each node should look." },
            { label: "6. Layout and paint", detail: "The browser works out the size and position of every box, then paints the pixels you see." },
          ],
        },
        {
          kind: "paragraph",
          text: "The **DOM** (Document Object Model) is the important idea here. It is a tree: the `html` element at the top, `head` and `body` below it, and every other element hanging off those branches. CSS styles the DOM, JavaScript reads and changes the DOM, and browser DevTools show you the DOM.",
        },
        {
          kind: "code",
          language: "text",
          title: "The DOM tree for a tiny page",
          code: "html\n├── head\n│   └── title  →  \"Plant Shop\"\n└── body\n    ├── h1  →  \"Plant Shop\"\n    └── p\n        ├── \"Order \"\n        └── strong  →  \"today\"",
        },
        { kind: "heading", text: "Whitespace collapses" },
        {
          kind: "paragraph",
          text: "Spaces, tabs and line breaks in your source are mostly for *you*, to keep the code readable. When the browser displays normal text, any run of whitespace becomes a single space. Ten spaces show as one; a line break in your file shows as a space. To force a line break inside text, use `<br>`; to start a new block of text, use a new element such as another `<p>`. (The `<pre>` element is an exception: it keeps whitespace exactly as written. This collapsing is actually controlled by a CSS default, which you can change later.)",
        },
        { kind: "heading", text: "Browsers forgive mistakes, which hides them" },
        {
          kind: "paragraph",
          text: "Programming languages usually stop with an error when you make a mistake. HTML does not. The HTML standard tells browsers exactly how to recover from almost any mistake, such as a missing closing tag or tags closed in the wrong order, so the page always shows *something*. This keeps the web working, but it means a mistake can sit unnoticed until it causes strange styling, a broken layout or a failing test. The browser's guess is not always what you meant.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "No error message does not mean no error",
          text: "Because the browser repairs your HTML quietly, you need to check it yourself: inspect the DOM in DevTools and run the page through the [W3C Nu HTML Checker](https://validator.w3.org/nu/).",
        },
        { kind: "heading", text: "Who decides what HTML is?" },
        {
          kind: "paragraph",
          text: "HTML is defined by the **HTML Living Standard**, maintained by the WHATWG (Web Hypertext Application Technology Working Group), a group that includes the major browser makers. It is called *living* because it is updated continuously instead of in numbered versions. You will still hear \"HTML5\", which was the last numbered version; today \"HTML\" simply means the Living Standard. MDN Web Docs is the friendliest place to look things up, and the standard itself is the final authority.",
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax",
      blocks: [
        {
          kind: "code",
          language: "html",
          title: "General shapes",
          code: "<!-- A normal element: opening tag, content, closing tag -->\n<tagname attribute=\"value\">content</tagname>\n\n<!-- Several attributes are separated by spaces -->\n<img src=\"photo.jpg\" alt=\"Description of the photo\">\n\n<!-- A void element: no content and no closing tag -->\n<br>\n\n<!-- Nesting: close the inner element before the outer one -->\n<p>Text with <strong>important words</strong> inside.</p>\n\n<!-- A comment: ignored by the browser, useful notes for people -->",
        },
        {
          kind: "list",
          items: [
            "Tag names go between `<` and `>`. Closing tags add a slash: `</p>`.",
            "Write tag and attribute names in **lowercase**. HTML ignores case (`<P>` works), but lowercase is the universal convention.",
            "Attributes go only in the opening tag, written `name=\"value\"`, separated by spaces. Always quote values; quotes are required when a value contains spaces.",
            "Some attributes are **boolean**: their presence alone means \"on\", e.g. `<p hidden>` hides the paragraph.",
            "Comments start with `<!--` and end with `-->`. They are not shown on the page but anyone can read them with View Source, so never put secrets in them.",
            "The browser needs a little boilerplate around your content (`<!doctype html>`, `<html>`, `<head>`, `<body>`). The minimal page below includes it; the next lesson explains every line.",
          ],
        },
        {
          kind: "code",
          language: "html",
          title: "A minimal complete page",
          runtime: "web",
          runnable: true,
          code: minimalPage,
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "Attributes, nesting and void elements" },
        {
          kind: "paragraph",
          text: "This page shows a paragraph with an attribute and nested elements, plus three void elements. The image file does not exist in the sandbox, so the browser shows its `alt` text instead, which is exactly why `alt` matters.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: anatomyPage },
        { kind: "heading", text: "Whitespace collapsing" },
        {
          kind: "paragraph",
          text: "Run this and compare the source with the result. The extra spaces and line breaks disappear everywhere except inside `<pre>`, and only `<br>` creates a real line break inside a paragraph.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: whitespacePage },
        { kind: "heading", text: "Error tolerance in action" },
        {
          kind: "paragraph",
          text: "The `<strong>` below is never closed. The browser does not complain. Instead it carries the bold formatting into the next paragraphs, because it thinks you still want bold text. Run it, then open DevTools and look at the repaired DOM.",
        },
        { kind: "code", language: "html", runtime: "web", runnable: true, code: toleranceBuggyPage },
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
            "`<!doctype html>` tells the browser to use modern, standards-based behaviour. It is not an element; the next lesson covers it.",
            "`<html lang=\"en\">` is the root element: every other element is nested inside it. `lang=\"en\"` is an attribute saying the page is in English.",
            "`<head>` holds information *about* the page that is not shown in the page itself. `<meta charset=\"utf-8\">` is a void element that sets the text encoding, and `<title>` sets the text on the browser tab.",
            "`<body>` holds everything visible. Each indented line inside it is a child of `body`.",
            "`<h1>Opening hours</h1>` is the main heading: opening tag, text content, closing tag.",
            "`<p class=\"note\">` opens a paragraph with a `class` attribute (a label CSS can target later). Inside it, `<strong>every day</strong>` is a nested child marking important words; it closes before `</p>`.",
            "`<img src=\"shop-front.jpg\" alt=\"…\">` is a void element. `src` says which image file to load and `alt` describes it for people who cannot see it. No `</img>` exists.",
            "In the last paragraph, `<br>` forces a line break between the weekday and weekend hours. Without it, both would run together on one line, because the line break in the source would collapse into a space.",
            "`</body>` and `</html>` close the two outer elements, last-opened first.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Try it",
          text: "Load the page into the playground, delete the `<br>`, and run it again. Then add ten spaces between two words. Predict the result before you run it.",
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
            "**Every website and web app** sends HTML to the browser first. Even apps built with React or Next.js end up as HTML elements in the DOM.",
            "**Search engines** read your HTML to understand what a page is about. A clear `h1` and real paragraphs help them; text hidden in images does not.",
            "**Screen readers** (software that reads pages aloud for blind and low-vision users) announce elements by type: \"heading level 1\", \"image, A basket of bread\". Correct elements and `alt` text make that possible.",
            "**Emails, e-books and app help screens** are often written in HTML too.",
            "**Test automation** tools such as Cypress and Playwright find things on a page through the DOM, for example `getByRole(\"heading\")`. Well-structured HTML makes tests simpler and more reliable.",
          ],
        },
        {
          kind: "table",
          caption: "Where you will see your HTML",
          headers: ["Tool", "How to open it", "What it shows"],
          rows: [
            ["View Source", "Right-click the page → View Page Source, or `Ctrl+U` (Windows/Linux) / `Cmd+Option+U` (Mac, Chrome)", "Your original text, exactly as the browser received it"],
            ["DevTools Elements panel", "Right-click an element → Inspect, or `F12` / `Cmd+Option+I`", "The live DOM tree, after the browser parsed and repaired it (and after any JavaScript changes)"],
            ["W3C Nu HTML Checker", "[validator.w3.org/nu](https://validator.w3.org/nu/)", "A list of mistakes in your markup, with line numbers"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Source vs DOM",
          text: "View Source shows what you wrote. The Elements panel shows what the browser understood. When they differ, the browser has repaired a mistake (or JavaScript has changed the page), and that difference is usually your bug.",
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Forgetting a closing tag",
      wrong: "<p>Order <strong>before Sunday</p>\n<p>Delivery takes two days.</p>",
      right: "<p>Order <strong>before Sunday</strong></p>\n<p>Delivery takes two days.</p>",
      explanation: "The browser does not show an error. It keeps `strong` \"open\" and makes the next paragraph bold too. Close every non-void element you open.",
    },
    {
      title: "Closing nested elements in the wrong order",
      wrong: "<p>This is <em>very</p></em> important.",
      right: "<p>This is <em>very</em> important.</p>",
      explanation: "Nested elements must close in reverse order: last opened, first closed. Overlapping tags force the browser to guess, and its guess may not match your intent.",
    },
    {
      title: "Adding a closing tag to a void element",
      wrong: "<img src=\"mug.jpg\" alt=\"A red mug\"></img>\n<br></br>",
      right: "<img src=\"mug.jpg\" alt=\"A red mug\">\n<br>",
      explanation: "Void elements cannot have content, so they have no closing tag. `</img>` is simply ignored, but `</br>` is actually treated as another `<br>`, giving you two line breaks.",
    },
    {
      title: "Unquoted attribute values containing spaces",
      wrong: "<img src=logo.png alt=Green Leaf logo>",
      right: "<img src=\"logo.png\" alt=\"Green Leaf logo\">",
      explanation: "Without quotes, the value ends at the first space. Here `alt` becomes just `Green`, and `Leaf` and `logo` become two meaningless attributes. Always quote attribute values.",
    },
    {
      title: "Using spaces and blank lines for layout",
      wrong: "<p>Name:          Ada\n\n\nCity:          London</p>",
      right: "<p>Name: Ada</p>\n<p>City: London</p>",
      explanation: "Whitespace collapses to a single space, so this shows on one line. Use separate elements for separate pieces of content, and CSS for spacing.",
    },
    {
      title: "Choosing elements for their default look",
      wrong: "<h1>Free delivery today!</h1> <!-- just wanted big text -->",
      right: "<p><strong>Free delivery today!</strong></p> <!-- size comes from CSS -->",
      explanation: "Pick an element for what the content *is*, not how it looks by default. Headings describe page structure for search engines and screen readers. Appearance is CSS's job.",
    },
  ],
  debugging: [
    "**Compare source with the DOM.** Open View Source (`Ctrl+U` / `Cmd+Option+U`) and the DevTools Elements panel (`F12` / `Cmd+Option+I`) side by side. If an element appears somewhere you did not put it, or appears twice, the browser repaired a mistake near that spot.",
    "**Inspect the odd-looking element.** Right-click the text that looks wrong (unexpectedly bold, in the wrong place) and choose Inspect. DevTools highlights its element and shows its parents, so you can see what it is nested inside.",
    "**Run the validator.** Paste your code into the [W3C Nu HTML Checker](https://validator.w3.org/nu/#textarea). It lists errors such as \"End tag `p` implied, but there were open elements\" with line numbers. Fix the first error first; later ones are often caused by it.",
    "**Check attribute values in DevTools.** If an image or link misbehaves, select it in the Elements panel and read its attributes. Missing quotes show up immediately as extra, strange attributes.",
    "**Let your editor help.** Editors such as VS Code colour tags and attributes differently and highlight matching opening/closing tags. If the colours suddenly look wrong after a certain line, the mistake is usually just before it.",
    "**Reload after saving.** If your change does not appear, make sure you saved the file and refreshed the browser tab that shows *that* file.",
  ],
  examples: [
    { id: "html-what-is-html-example-first-page", title: "A first complete page", runtime: "web", code: minimalPage },
    { id: "html-what-is-html-example-anatomy", title: "Attributes, nesting and void elements", runtime: "web", code: anatomyPage },
    { id: "html-what-is-html-example-whitespace", title: "Whitespace collapsing", runtime: "web", code: whitespacePage },
    { id: "html-what-is-html-example-error-tolerance", title: "A forgiven mistake (unclosed strong)", runtime: "web", code: toleranceBuggyPage },
  ],
  exercises: [
    {
      id: "html-what-is-html-ex-1",
      type: "match",
      difficulty: "beginner",
      prompt: "Match each part of `<img src=\"cup.jpg\" alt=\"A blue cup\">` and `<p>Hello</p>` to what it is.",
      pairs: [
        { left: "`<p>`", right: "Opening tag" },
        { left: "`</p>`", right: "Closing tag" },
        { left: "`alt=\"A blue cup\"`", right: "Attribute" },
        { left: "`Hello`", right: "Content" },
        { left: "`<img ...>`", right: "Void element" },
      ],
      hints: ["Attributes are written as `name=\"value\"`.", "Which element has no closing tag?"],
      explanation: "`<p>` opens the paragraph and `</p>` closes it; `Hello` is its content. `alt=\"A blue cup\"` is an attribute of the image, and `<img>` is a void element because it never has content or a closing tag.",
    },
    {
      id: "html-what-is-html-ex-2",
      type: "code",
      runtime: "web",
      difficulty: "beginner",
      prompt: "The text in this page has no markup. Turn `My Plant Shop` into the main heading (`h1`) and the second line into a paragraph (`p`).",
      instructions: "Edit only the `<body>`. Keep the text exactly as it is.",
      starter: ex2Starter,
      tests: [
        {
          name: "There is an h1 with the shop name",
          code: "const h1 = document.querySelector(\"body h1\");\nassert.ok(h1, \"Add an <h1> element inside <body>\");\nassert.equal(h1.textContent.trim(), \"My Plant Shop\", \"The h1 should contain exactly: My Plant Shop\");",
        },
        {
          name: "There is a paragraph with the description",
          code: "const p = document.querySelector(\"body p\");\nassert.ok(p, \"Add a <p> element inside <body>\");\nassert.equal(p.textContent.trim(), \"We sell cactus and succulents.\", \"The paragraph should contain: We sell cactus and succulents.\");",
        },
        {
          name: "The heading and paragraph are separate elements",
          code: "const h1 = document.querySelector(\"h1\");\nassert.ok(h1 && !h1.querySelector(\"p\") && !h1.textContent.includes(\"cactus\"), \"Close the h1 before starting the paragraph\");",
        },
      ],
      solution: ex2Solution,
      hints: [
        "Wrap the first line: `<h1>My Plant Shop</h1>`.",
        "Wrap the second line in `<p>` and `</p>`.",
      ],
      explanation: "Wrapping text in tags tells the browser what it is. Without tags, both lines collapse into one run of plain text; with them, the browser knows one is the main heading and one is a paragraph, and shows them as separate blocks.",
    },
    {
      id: "html-what-is-html-ex-3",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Fill in the blanks so this is valid HTML: a paragraph with a `class` attribute containing an important word, followed by an image.",
      template: "<p ___=\"welcome\">Welcome to our <strong>bakery</___>.</___>\n<img src=\"cake.jpg\" ___=\"A chocolate cake\">",
      blanks: [{ answers: ["class"] }, { answers: ["strong"] }, { answers: ["p"] }, { answers: ["alt"] }],
      hints: [
        "Which attribute gives an element a reusable label for CSS?",
        "Close the inner element first, then the outer one.",
        "Which image attribute describes the picture in words?",
      ],
      explanation: "`class=\"welcome\"` is an attribute in the opening tag. `strong` is nested in `p`, so `</strong>` comes before `</p>`. `alt` gives the image a text description. Note there is no `</img>`: images are void elements.",
    },
    {
      id: "html-what-is-html-ex-4",
      type: "code",
      runtime: "web",
      difficulty: "intermediate",
      prompt: "Build a product card inside the `<article>`: a `h2` heading with the product name, an `img` with `src` and a meaningful `alt`, a paragraph with `class=\"price\"` whose price is wrapped in `<strong>`, and one more paragraph describing the product.",
      instructions: "Use any plant you like. Everything must be nested inside the existing `<article>` element.",
      starter: ex4Starter,
      tests: [
        {
          name: "The article has an h2 heading",
          code: "const h2 = document.querySelector(\"article > h2\");\nassert.ok(h2 && h2.textContent.trim().length > 0, \"Add an <h2> with the product name directly inside <article>\");",
        },
        {
          name: "The image has src and a meaningful alt",
          code: "const img = document.querySelector(\"article img\");\nassert.ok(img, \"Add an <img> inside the article\");\nassert.ok((img.getAttribute(\"src\") || \"\").trim(), \"The image needs a src attribute\");\nassert.ok((img.getAttribute(\"alt\") || \"\").trim().length >= 5, \"Give the image a meaningful alt text (at least a few words)\");",
        },
        {
          name: "The price paragraph has a strong price",
          code: "const price = document.querySelector(\"article p.price\");\nassert.ok(price, \"Add a <p class=\\\"price\\\"> inside the article\");\nconst strong = price.querySelector(\"strong\");\nassert.ok(strong && strong.textContent.trim(), \"Wrap the price in <strong> inside the price paragraph\");",
        },
        {
          name: "There is a description paragraph",
          code: "const paragraphs = document.querySelectorAll(\"article p\");\nassert.ok(paragraphs.length >= 2, \"Add a second paragraph that describes the product\");",
        },
        {
          name: "Nothing leaked outside the article",
          code: "assert.equal(document.querySelectorAll(\"body > p, body > img, body > h2\").length, 0, \"Keep the card's elements inside <article>\");",
        },
      ],
      solution: ex4Solution,
      hints: [
        "Write the elements between `<article>` and `</article>` so they become its children.",
        "`<img>` is a void element: `<img src=\"plant.jpg\" alt=\"...\">` with no closing tag.",
        "Nest the price: `<p class=\"price\">Only <strong>$18</strong></p>`.",
      ],
      explanation: "The card is a small tree: `article` is the parent of `h2`, `img` and two `p` elements, and the price paragraph is in turn the parent of `strong`. Each element closes before its parent closes, and the image needs no closing tag at all.",
    },
    {
      id: "html-what-is-html-ex-5",
      type: "find-bug",
      runtime: "web",
      difficulty: "beginner",
      debugging: true,
      prompt: "This sale page has two bugs. The logo's alt text reads only \"Green\", and the delivery paragraph is unexpectedly bold. Fix both.",
      code: ex5Buggy,
      tests: [
        {
          name: "The logo has the full alt text",
          code: "const img = document.querySelector(\"img\");\nassert.equal(img.getAttribute(\"alt\"), \"Green Leaf logo\", \"alt should be exactly \\\"Green Leaf logo\\\" — check the quotes\");",
        },
        {
          name: "Only one strong element exists",
          code: "assert.equal(document.querySelectorAll(\"strong\").length, 1, \"The browser created extra <strong> elements because one was never closed\");",
        },
        {
          name: "The delivery paragraph is not bold",
          code: "const p = document.querySelectorAll(\"body > p\")[1];\nassert.ok(p && !p.querySelector(\"strong\"), \"The second paragraph should not contain <strong>\");",
        },
      ],
      solution: ex5Solution,
      hints: [
        "Attribute values that contain spaces must be in quotes.",
        "Find the `<strong>` that has no matching `</strong>`.",
        "Open DevTools on the buggy page: how many `strong` elements does the Elements panel show?",
      ],
      explanation: "Without quotes, `alt=Green Leaf logo` ends at the first space, so the browser reads `alt=\"Green\"` plus two junk attributes. The unclosed `<strong>` is repaired by the browser, which re-opens it inside the next paragraph and makes it bold. Neither mistake produces an error message, which is why checking the DOM and using a validator matter.",
    },
  ],
  quiz: [
    {
      id: "html-what-is-html-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Which statement best describes HTML?",
      options: [
        { id: "a", text: "A programming language that runs calculations in the browser", explanation: "That describes JavaScript. HTML cannot calculate or make decisions." },
        { id: "b", text: "A markup language that describes the structure and meaning of content", explanation: "Correct. HTML labels content (heading, paragraph, image) so the browser knows what each part is." },
        { id: "c", text: "A styling language for colours and layout", explanation: "That is CSS's job." },
        { id: "d", text: "A program you install to view web pages", explanation: "That is a browser." },
      ],
      answer: "b",
      hints: ["Think about the \"M\" in HTML."],
      explanation: "HTML is a markup language: it marks up content to describe structure and meaning. CSS handles presentation and JavaScript handles behaviour.",
    },
    {
      id: "html-what-is-html-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Which of these is a void element?",
      options: [
        { id: "a", text: "`<p>`", explanation: "Paragraphs contain text, so they have content and a closing tag." },
        { id: "b", text: "`<strong>`", explanation: "`strong` wraps the important words, so it needs `</strong>`." },
        { id: "c", text: "`<br>`", explanation: "Correct. A line break has no content and never has a closing tag." },
        { id: "d", text: "`<h1>`", explanation: "Headings contain text and need `</h1>`." },
      ],
      answer: "c",
      hints: ["Which element could never contain any text?"],
      explanation: "Void elements such as `<br>`, `<img>`, `<hr>`, `<input>` and `<meta>` cannot have content, so they have no closing tag.",
    },
    {
      id: "html-what-is-html-q3",
      type: "mcq",
      difficulty: "beginner",
      prompt: "The source contains `<p>Hello          world</p>` (ten spaces), and the paragraph is split across two lines in the editor. How does it appear on the page?",
      options: [
        { id: "a", text: "`Hello` and `world` separated by ten spaces", explanation: "Runs of whitespace collapse in normal text." },
        { id: "b", text: "`Hello` and `world` on two separate lines", explanation: "A line break in the source collapses into a space too. You would need `<br>` for a real break." },
        { id: "c", text: "`Hello world` with a single space", explanation: "Correct. All spaces and line breaks between the words collapse into one space." },
        { id: "d", text: "`Helloworld` with no space", explanation: "Whitespace collapses to one space, not to nothing." },
      ],
      answer: "c",
      hints: ["What happens to runs of whitespace in ordinary text?"],
      explanation: "In normal HTML text, any sequence of spaces, tabs and line breaks is displayed as a single space. Use `<br>` or separate elements for line breaks and CSS for spacing.",
    },
    {
      id: "html-what-is-html-q4",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "Your page source has `<p>Sale <strong>today</p><p>More info</p>`. What does the DevTools Elements panel show for the second paragraph?",
      options: [
        { id: "a", text: "An error message instead of the paragraph", explanation: "Browsers do not show error messages for HTML mistakes; they repair them." },
        { id: "b", text: "`<p><strong>More info</strong></p>`, because the browser re-opened the unclosed `strong`", explanation: "Correct. The Elements panel shows the repaired DOM, and the formatting leaks into the next paragraph." },
        { id: "c", text: "Exactly `<p>More info</p>`, the same as the source", explanation: "The Elements panel shows the DOM after repair, not your original text. View Source shows the original." },
        { id: "d", text: "Nothing: the paragraph is deleted", explanation: "The browser keeps the content; it only adjusts the tree." },
      ],
      answer: "b",
      hints: ["The Elements panel shows the DOM, not the file."],
      explanation: "The parser keeps track of open formatting elements like `strong`. When the first `p` closes with `strong` still open, the parser re-creates `strong` inside the next paragraph. DevTools shows this repaired DOM, which is why comparing source and DOM is such a useful debugging habit.",
    },
    {
      id: "html-what-is-html-q5",
      type: "true-false",
      difficulty: "beginner",
      prompt: "If your HTML contains a mistake such as a missing closing tag, the browser refuses to display the page and shows an error.",
      answer: false,
      hints: ["How do browsers handle mistakes in HTML compared with programming languages?"],
      explanation: "False. The HTML standard defines how browsers recover from mistakes, so the page still displays, possibly not as you intended. That is why you check your markup with DevTools and the validator.",
    },
    {
      id: "html-what-is-html-q6",
      type: "multi-select",
      difficulty: "beginner",
      prompt: "Select every statement that is true about attributes.",
      options: [
        { id: "a", text: "They are written inside the opening tag", explanation: "Correct. Attributes never appear in closing tags." },
        { id: "b", text: "They usually take the form `name=\"value\"`", explanation: "Correct. Boolean attributes such as `hidden` can appear without a value." },
        { id: "c", text: "They can be placed in the closing tag, like `</p class=\"x\">`", explanation: "Wrong. Closing tags hold only the element name." },
        { id: "d", text: "Values containing spaces must be in quotes", explanation: "Correct. Without quotes the value stops at the first space." },
        { id: "e", text: "An element can have only one attribute", explanation: "Wrong. Separate several attributes with spaces, as in `<img src=\"a.jpg\" alt=\"...\">`." },
      ],
      answers: ["a", "b", "d"],
      hints: ["Look at how `<img>` combines `src` and `alt`."],
      explanation: "Attributes live in the opening tag, are written `name=\"value\"` (always quote the value), and an element can have as many as it needs, separated by spaces.",
    },
    {
      id: "html-what-is-html-q7",
      type: "order",
      difficulty: "intermediate",
      prompt: "Put the steps the browser takes to show an HTML file in order.",
      steps: [
        "Load the bytes of the HTML file",
        "Decode the bytes into characters",
        "Split the text into tokens (tags and text)",
        "Build the DOM tree from the tokens",
        "Work out the styles for each element",
        "Lay out the boxes and paint the pixels",
      ],
      hints: ["The DOM must exist before the browser can decide how it looks.", "Painting is always last."],
      explanation: "Bytes are decoded into characters, the parser turns characters into tokens and tokens into the DOM tree, styles are applied to the tree, and finally layout and painting put pixels on the screen.",
    },
  ],
  challenge: {
    id: "html-what-is-html-challenge",
    type: "code",
    runtime: "web",
    difficulty: "beginner",
    prompt: "A local bakery wrote its opening announcement as plain text. Mark it up so the browser understands it: the first line is the main heading, the announcement is a paragraph with the free-croissant sentence marked as important, the photo becomes a real image, a thematic break separates the address, and the address keeps its two lines.",
    instructions: "1. Wrap the first line in `<h1>`.\n2. Make the announcement a `<p id=\"intro\">`, and wrap the sentence about free croissants in `<strong>`.\n3. Replace the `bread.jpg` line with an `<img>` whose `src` is `bread.jpg` and whose `alt` describes the photo.\n4. Add an `<hr>` before the address.\n5. Put the address in a `<p class=\"address\">` and use `<br>` so the street and town are on separate lines.",
    starter: challengeStarter,
    tests: [
      {
        name: "Main heading",
        code: "const h1 = document.querySelector(\"h1\");\nassert.ok(h1, \"Add an <h1> element\");\nassert.equal(h1.textContent.trim(), \"Sunrise Bakery opens on Saturday\", \"The h1 should contain the first line of text\");\nassert.equal(document.querySelectorAll(\"h1\").length, 1, \"Use exactly one h1 on the page\");",
      },
      {
        name: "Intro paragraph with important sentence",
        code: "const intro = document.querySelector(\"p#intro\");\nassert.ok(intro, \"Add a <p id=\\\"intro\\\"> for the announcement\");\nconst strong = intro.querySelector(\"strong\");\nassert.ok(strong, \"Wrap the free-croissant sentence in <strong> inside the intro paragraph\");\nassert.ok(strong.textContent.includes(\"croissant\"), \"The <strong> should contain the sentence about the free croissant\");",
      },
      {
        name: "Image with src and alt",
        code: "const img = document.querySelector(\"img\");\nassert.ok(img, \"Replace the bread.jpg line with an <img> element\");\nassert.equal(img.getAttribute(\"src\"), \"bread.jpg\", \"The image src should be bread.jpg\");\nassert.ok((img.getAttribute(\"alt\") || \"\").trim().length >= 5, \"Describe the photo in the alt attribute\");\nassert.ok(!document.body.textContent.includes(\"bread.jpg\"), \"Remove the plain-text bread.jpg line\");",
      },
      {
        name: "Thematic break before the address",
        code: "const hr = document.querySelector(\"hr\");\nassert.ok(hr, \"Add an <hr> element\");\nconst address = document.querySelector(\"p.address\");\nassert.ok(address && (hr.compareDocumentPosition(address) & Node.DOCUMENT_POSITION_FOLLOWING), \"The <hr> should come before the address paragraph\");",
      },
      {
        name: "Address on two lines",
        code: "const address = document.querySelector(\"p.address\");\nassert.ok(address, \"Add a <p class=\\\"address\\\">\");\nassert.equal(address.querySelectorAll(\"br\").length, 1, \"Use one <br> between the street and the town\");\nassert.ok(address.textContent.includes(\"12 Mill Street\") && address.textContent.includes(\"Riverside\"), \"Keep the full address text\");",
      },
    ],
    solution: challengeSolution,
    hints: [
      "Start with the easy wrapping: `<h1>…</h1>` and `<p id=\"intro\">…</p>`.",
      "`<img>`, `<hr>` and `<br>` are void elements, so none of them gets a closing tag.",
      "Line breaks in your source collapse into spaces; only `<br>` keeps the street and town on separate lines.",
      "Check your result in DevTools: is the `strong` inside `p#intro`, and is the `br` inside `p.address`?",
    ],
    explanation: "Plain text gives the browser no structure, so everything collapses into one run of text. Marking it up gives each part a role: a heading, a paragraph with an important sentence, an image with a text alternative, a thematic break, and an address whose line break is explicit. This is exactly what real pages do, and it is what makes them readable by browsers, search engines and screen readers alike.",
  },
  keyPoints: [
    "HTML is a **markup language**: it describes what content is (structure and meaning). CSS controls looks and JavaScript adds behaviour.",
    "An element is usually **opening tag + content + closing tag**; attributes go in the opening tag as `name=\"value\"`.",
    "Elements nest like boxes: close the last-opened element first. Nesting creates parent, child and sibling relationships.",
    "**Void elements** (`img`, `br`, `hr`, `input`, `meta`, `link`) have no content and no closing tag.",
    "The browser parses HTML into the **DOM tree**, applies styles, then lays out and paints the page.",
    "Runs of whitespace collapse into a single space; use `<br>` or new elements for line breaks.",
    "Browsers silently repair mistakes, so check your HTML with the DevTools Elements panel and the W3C validator.",
    "The **HTML Living Standard** (WHATWG) is the official, continuously updated definition of HTML.",
  ],
  bestPractices: [
    "**Essential:** close every non-void element you open, and close nested elements in reverse order.",
    "**Essential:** write tag and attribute names in lowercase and always put attribute values in double quotes.",
    "**Essential:** indent nested elements consistently (two spaces per level is common) so the tree structure is visible in your code.",
    "Choose elements for their meaning, not their default appearance; leave visual decisions to CSS.",
    "Give every `<img>` a `src` and a meaningful `alt`.",
    "Check new pages with the DevTools Elements panel and the [W3C Nu HTML Checker](https://validator.w3.org/nu/) instead of trusting that \"it looks fine\".",
    "Use comments (`<!-- -->`) for short notes to your future self, never for passwords or private data: anyone can read them with View Source.",
    "*Advanced:* when you need exact rules (for example, which end tags may be omitted), read the HTML Living Standard rather than old tutorials.",
  ],
  cheatSheet: [
    { item: "`<p>…</p>`", meaning: "An element: opening tag, content, closing tag" },
    { item: "`<tag name=\"value\">`", meaning: "An attribute, written inside the opening tag" },
    { item: "`<p>Text <strong>bold</strong></p>`", meaning: "Nesting: `strong` is a child of `p`" },
    { item: "`<img src=\"a.jpg\" alt=\"…\">`", meaning: "Void element: no content, no closing tag" },
    { item: "`<br>` / `<hr>`", meaning: "Line break / thematic break (both void)" },
    { item: "`<!-- note -->`", meaning: "Comment: not displayed, but visible in View Source" },
    { item: "`<pre>`", meaning: "Preformatted text: keeps spaces and line breaks" },
    { item: "View Source (`Ctrl+U` / `Cmd+Option+U`)", meaning: "Shows the original HTML text" },
    { item: "Inspect (`F12` / `Cmd+Option+I`)", meaning: "DevTools Elements panel: shows the live DOM tree" },
    { item: "validator.w3.org/nu", meaning: "W3C Nu HTML Checker: finds mistakes the browser hides" },
  ],
  completionCriteria: [
    "You can explain in your own words what HTML is and how its job differs from CSS and JavaScript.",
    "You can label the opening tag, attributes, content and closing tag of any element.",
    "You can nest elements correctly and name the parent and children of an element.",
    "You can write void elements like `<img>` and `<br>` without closing tags.",
    "You can describe how a browser turns an HTML file into a DOM tree and then a visible page.",
    "You can use View Source, the DevTools Elements panel and the W3C validator to find a hidden HTML mistake.",
  ],
  related: [
    "html-document-structure",
    "html-text-content",
    "html-links",
    "html-images-media",
    "introduction-html-css-js",
    "css-what-is-css",
  ],
  references: [
    { title: "MDN: Basic HTML syntax", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax" },
    { title: "MDN: HTML elements reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element" },
    { title: "MDN: Void element", url: "https://developer.mozilla.org/en-US/docs/Glossary/Void_element" },
    { title: "MDN: How browsers work (populating the page)", url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work" },
    { title: "MDN: How whitespace is handled by HTML, CSS, and in the DOM", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_text/Whitespace" },
    { title: "WHATWG: HTML Living Standard", url: "https://html.spec.whatwg.org/multipage/" },
    { title: "WHATWG: HTML syntax (elements and void elements)", url: "https://html.spec.whatwg.org/multipage/syntax.html#elements-2" },
    { title: "Chrome DevTools: View and change the DOM", url: "https://developer.chrome.com/docs/devtools/dom" },
    { title: "W3C Nu HTML Checker", url: "https://validator.w3.org/nu/" },
    { title: "web.dev: Learn HTML", url: "https://web.dev/learn/html" },
  ],
};

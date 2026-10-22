import type { Lesson } from "@/content/types";

export const documentStructure: Lesson = {
  id: "html-document-structure",
  slug: "document-structure",
  title: "HTML Document Structure",
  summary:
    "Learn every line of the standard HTML page skeleton — doctype, html, head, body, charset, viewport and title — and how to create and open your own page.",
  difficulty: "beginner",
  minutes: 30,
  tech: ["html"],
  tags: ["html", "doctype", "head", "body", "meta", "title", "lang", "boilerplate", "file naming"],
  objectives: [
    "Write the standard HTML skeleton from memory and explain what every line does.",
    "Explain why `<!doctype html>` matters and what standards mode and quirks mode are.",
    "Decide whether an element belongs in `<head>` (information about the page) or `<body>` (the visible content).",
    "Set the page language, character encoding, viewport and title correctly.",
    "Write HTML comments, indent nested elements consistently, and name and open an HTML file on your own computer.",
  ],
  prerequisites: ["html-what-is-html"],
  intro: [
    {
      kind: "paragraph",
      text: "Every web page you have ever visited — a shop, a news site, a login screen — starts from the same small skeleton of about ten lines. Those lines tell the browser which rules to use, which language the page is written in, how to decode the characters in the file, how to size the page on a phone, and what to show in the browser tab.",
    },
    {
      kind: "paragraph",
      text: "**Why it matters:** if a skeleton line is missing, the page often still *seems* to work, which is exactly what makes these bugs sneaky. A missing doctype silently switches the browser into an old compatibility mode that changes how CSS behaves. A missing charset turns `café` into `cafÃ©`. A missing viewport makes your page tiny on phones. A missing `lang` makes screen readers mispronounce the whole page.",
    },
    {
      kind: "paragraph",
      text: "**Where it is used:** literally everywhere. Code editors generate this skeleton for you, frameworks such as Next.js produce it on the server, and testers check it when they audit a page for accessibility or SEO.",
    },
    {
      kind: "paragraph",
      text: "**What you'll understand by the end:** what each line of the skeleton does and what breaks without it, the difference between `<head>` and `<body>`, how to leave notes with comments, how to indent and name your files, and how to create a page on your computer and open it in a browser.",
    },
  ],
  terms: [
    {
      term: "Document",
      definition: "One complete HTML page, usually stored as one `.html` file. The browser turns it into a tree of elements it can display.",
    },
    {
      term: "Doctype",
      definition: "The `<!doctype html>` line at the very top of a page. It is not an element; it is an instruction that tells the browser to use modern, standards-based rendering.",
    },
    {
      term: "Standards mode",
      definition: "The modern rendering mode browsers use when the page starts with `<!doctype html>`. CSS and layout follow the current specifications.",
    },
    {
      term: "Quirks mode",
      definition: "A backwards-compatibility mode browsers switch to when the doctype is missing or ancient. It imitates bugs of 1990s browsers so very old sites keep working, and it makes some CSS behave unexpectedly.",
    },
    {
      term: "Root element",
      definition: "The outermost element of the page, `<html>`. Every other element lives inside it.",
    },
    {
      term: "Metadata",
      definition: "Information *about* the page (its encoding, title, language, linked files) rather than content shown in the page itself. It lives in `<head>`.",
    },
    {
      term: "Character encoding",
      definition: "The rule for turning the bytes stored in a file into readable characters. UTF-8 is the encoding the web uses; it covers every language and emoji.",
    },
    {
      term: "Viewport",
      definition: "The visible area of the page inside the browser window. On phones, a `viewport` meta tag tells the browser to match the page width to the device's screen width.",
    },
    {
      term: "Comment",
      definition: "A note in the source code written between `<!--` and `-->`. Browsers ignore it, so it never appears on the page, but anyone can read it with View Source.",
    },
    {
      term: "Boilerplate",
      definition: "Standard code that you write the same way at the start of every file. The HTML skeleton is the most common example.",
    },
    {
      term: "Void element",
      definition: "An element that has no content and no closing tag, such as `<meta>` and `<link>`. You write only the start tag.",
    },
  ],
  sections: [
    {
      id: "explanation",
      title: "How a page is organised",
      blocks: [
        {
          kind: "paragraph",
          text: "An HTML document has a fixed shape. First comes the **doctype**, which picks the rendering mode. Then the **root element** `<html>` wraps everything else. Inside it sit exactly two children: `<head>`, which holds information *about* the page, and `<body>`, which holds what the visitor actually sees.",
        },
        {
          kind: "diagram",
          title: "The shape of every HTML document",
          variant: "stack",
          steps: [
            { label: "<!doctype html>", detail: "Not an element. Switches the browser into standards mode." },
            { label: "<html lang=\"en\">", detail: "The root element. `lang` declares the language of the content." },
            { label: "<head>", detail: "Metadata: charset, viewport, title, links to CSS. Mostly invisible." },
            { label: "<body>", detail: "Everything visible: headings, text, images, links, forms." },
          ],
        },
        {
          kind: "paragraph",
          text: "When you open a page, the browser does not simply paint the text in the file. It reads the file from top to bottom and builds a tree of objects called the **DOM** (Document Object Model). Every skeleton line influences one step of that process:",
        },
        {
          kind: "diagram",
          title: "From .html file to a page on screen",
          variant: "flow",
          steps: [
            { label: "Read bytes", detail: "The browser loads the file. `<meta charset=\"utf-8\">` tells it how to turn bytes into characters." },
            { label: "Check the doctype", detail: "`<!doctype html>` present → standards mode. Missing → quirks mode." },
            { label: "Parse into a tree (DOM)", detail: "Tags become element objects nested inside `html`, `head` and `body`." },
            { label: "Apply styles", detail: "Built-in browser styles plus any CSS you link or write." },
            { label: "Lay out and paint", detail: "The viewport setting decides how wide the layout is on a phone; then pixels are drawn." },
            { label: "Show tab text", detail: "The `<title>` text appears in the tab, history and bookmarks." },
          ],
        },
        { kind: "heading", text: "Standards mode vs quirks mode" },
        {
          kind: "paragraph",
          text: "In the early web, browsers disagreed about how CSS should work. When standards arrived, browsers could not simply fix their behaviour, because millions of existing pages depended on the old bugs. Their solution: if a page starts with a modern doctype, use the standard rules; if not, assume it is an old page and use the old buggy rules (**quirks mode**). That is why the doctype still matters today even though it looks like a relic.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Quirks mode fails quietly",
          text: "Nothing on the page tells you that you are in quirks mode. The symptoms show up later: percentage heights that do nothing, table text that ignores your font size, box sizes that differ between browsers. Always start with `<!doctype html>` and you never have to learn those quirks.",
        },
        { kind: "heading", text: "head vs body" },
        {
          kind: "table",
          caption: "What goes where",
          headers: ["", "`<head>`", "`<body>`"],
          rows: [
            ["Purpose", "Information about the page, for the browser, search engines and other tools", "The content people see and interact with"],
            ["Visible on the page?", "No (the title appears in the tab, not in the page)", "Yes"],
            ["Typical elements", "`<meta>`, `<title>`, `<link>`, `<style>`, `<script>`", "`<h1>`, `<p>`, `<img>`, `<a>`, `<nav>`, `<main>`, `<form>`"],
            ["How many per page", "Exactly one", "Exactly one"],
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "The browser repairs missing tags",
          text: "The HTML standard lets you leave out the `<html>`, `<head>` and `<body>` tags, and browsers create those elements anyway. Professionals still write them out: it makes the structure obvious, lets you put `lang` on `<html>`, and avoids surprises when an element ends up in the wrong section.",
        },
      ],
    },
    {
      id: "syntax",
      title: "Syntax: the standard skeleton",
      blocks: [
        {
          kind: "paragraph",
          text: "This is the skeleton you will start almost every page with. Learn it by heart — you will type it hundreds of times (most editors also generate it if you type `!` and press Tab).",
        },
        {
          kind: "code",
          language: "html",
          runtime: "web",
          runnable: true,
          title: "index.html",
          code: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, web!</h1>\n    <p>This page has a complete, valid structure.</p>\n  </body>\n</html>",
        },
        {
          kind: "table",
          caption: "Each line of the skeleton",
          headers: ["Line", "What it does", "What breaks without it"],
          rows: [
            ["`<!doctype html>`", "Selects standards mode. Must be the very first thing in the file.", "The browser falls back to quirks mode and some CSS behaves strangely."],
            ["`<html lang=\"en\">`", "Root element; `lang` declares the content language.", "Screen readers may use the wrong voice and pronunciation; translation tools must guess."],
            ["`<head>` … `</head>`", "Container for metadata.", "The browser invents one, but your structure is harder to read."],
            ["`<meta charset=\"utf-8\">`", "Tells the browser the file is UTF-8 encoded.", "Accented letters, symbols and emoji can turn into garbage like `Ã©`."],
            ["`<meta name=\"viewport\" …>`", "Makes the layout width match the phone's screen.", "Phones render a desktop-width page and zoom out, so text is tiny."],
            ["`<title>` … `</title>`", "Text for the tab, bookmarks, history and search results.", "The tab shows the file name or URL instead; the page is hard to find."],
            ["`<body>` … `</body>`", "Container for all visible content.", "The browser invents one, but stray content can end up in odd places."],
          ],
        },
        { kind: "heading", text: "Attribute anatomy" },
        {
          kind: "paragraph",
          text: "Several skeleton lines use **attributes**: extra settings written inside a start tag as `name=\"value\"`. In `<html lang=\"en\">`, the attribute name is `lang` and its value is `en`. `<meta>` has no closing tag because it is a **void element** — it never contains anything.",
        },
        { kind: "heading", text: "Comments" },
        {
          kind: "code",
          language: "html",
          code: "<!-- This is a comment. The browser ignores it. -->\n\n<!--\n  Comments can span\n  several lines.\n-->",
        },
        {
          kind: "list",
          items: [
            "A comment starts with `<!--` and ends with `-->`.",
            "Comments cannot be nested: the first `-->` ends the comment.",
            "Comments are not shown on the page, but anyone can read them with **View Source**. Never put passwords, keys or private notes in them.",
          ],
        },
        { kind: "heading", text: "Linking CSS and JavaScript (preview)" },
        {
          kind: "paragraph",
          text: "Later you will connect separate CSS and JavaScript files to a page. You only need to recognise these two lines for now; the CSS course and JavaScript lessons cover them properly.",
        },
        {
          kind: "code",
          language: "html",
          code: "<head>\n  <!-- ... charset, viewport, title ... -->\n  <link rel=\"stylesheet\" href=\"styles.css\">\n  <script src=\"app.js\" defer></script>\n</head>",
        },
      ],
    },
    {
      id: "examples",
      title: "Examples",
      blocks: [
        { kind: "heading", text: "Comments and indentation in a small page" },
        {
          kind: "paragraph",
          text: "Indent each nested element one level (2 spaces is the most common convention) so you can see at a glance what is inside what. Browsers ignore the extra spaces, but humans rely on them.",
        },
        {
          kind: "code",
          language: "html",
          runtime: "web",
          runnable: true,
          code: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Opening Hours | Corner Café</title>\n  </head>\n  <body>\n    <!-- Page heading -->\n    <h1>Corner Café</h1>\n\n    <!-- Opening hours: update every season -->\n    <p>Monday to Friday: 7:00 – 18:00</p>\n    <p>Saturday: 8:00 – 14:00</p>\n  </body>\n</html>",
        },
        {
          kind: "paragraph",
          text: "Notice that `é` and the dash `–` display correctly because of `<meta charset=\"utf-8\">`. The comments do not appear in the preview.",
        },
        { kind: "heading", text: "A page in another language" },
        {
          kind: "paragraph",
          text: "`lang` takes a language code such as `en` (English), `es` (Spanish), `fr` (French), `hi` (Hindi) or `ja` (Japanese). You can add a region: `en-GB`, `pt-BR`.",
        },
        {
          kind: "code",
          language: "html",
          runtime: "web",
          runnable: true,
          code: "<!doctype html>\n<html lang=\"es\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Menú del día | Café de la Esquina</title>\n  </head>\n  <body>\n    <h1>Menú del día</h1>\n    <p>Sopa, pan y café: 9,50 €</p>\n  </body>\n</html>",
        },
        { kind: "heading", text: "What a missing title looks like" },
        {
          kind: "code",
          language: "html",
          code: "<!-- No <title>: the tab shows something like \"index.html\" or the URL -->\n<head>\n  <meta charset=\"utf-8\">\n</head>",
        },
      ],
    },
    {
      id: "walkthrough",
      title: "Line-by-line walkthrough",
      blocks: [
        {
          kind: "paragraph",
          text: "Here is a realistic starting page for a small online store's product page. Read the code first, then each numbered note below.",
        },
        {
          kind: "code",
          language: "html",
          runtime: "web",
          runnable: true,
          title: "product.html",
          code: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Ceramic Mug | Clay & Co.</title>\n  </head>\n  <body>\n    <!-- Product details -->\n    <h1>Ceramic Mug</h1>\n    <p>Hand-glazed, 350 ml, dishwasher safe.</p>\n    <p>Price: €18</p>\n  </body>\n</html>",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "`<!doctype html>` — the first line in the file, before any spaces or comments. It switches on standards mode. Case does not matter (`<!DOCTYPE html>` works too), but there is nothing else to add: no version number, no URL.",
            "`<html lang=\"en\">` — opens the root element. Every other tag is inside it. `lang=\"en\"` tells screen readers, translators and search engines that the content is English.",
            "`<head>` — opens the metadata section. Nothing in here is drawn on the page.",
            "`<meta charset=\"utf-8\">` — declares the encoding. Put it first in `<head>`: the browser must see it within the first 1024 bytes of the file, before it reads any text that needs decoding (such as the `€` in the title).",
            "`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">` — on phones, makes the page as wide as the screen and starts at 100% zoom. Making layouts adapt to screen sizes is covered in the responsive design lesson.",
            "`<title>Ceramic Mug | Clay & Co.</title>` — the tab text. A good pattern is *specific page first, site name second*, so the useful part stays visible in narrow tabs.",
            "`</head>` then `<body>` — metadata ends and visible content begins.",
            "`<!-- Product details -->` — a comment for other developers. Not displayed.",
            "`<h1>` and `<p>` — the visible content, indented one level deeper than `<body>` because they are inside it.",
            "`</body>` and `</html>` — close the body and the root element, in the reverse order they were opened.",
          ],
        },
      ],
    },
    {
      id: "real-world",
      title: "Real-world use: files, folders and opening pages",
      blocks: [
        { kind: "heading", text: "Creating and opening a page on your computer" },
        {
          kind: "list",
          ordered: true,
          items: [
            "Create a folder for the project, for example `my-site`.",
            "Open it in a code editor (VS Code is a popular free choice) and create a file named `index.html`.",
            "Type the skeleton, add some content and **save** the file.",
            "Open it in a browser: double-click the file, drag it onto a browser window, or right-click → *Open with*. The address bar shows a `file://` URL, meaning the page is read from your disk, not from the internet.",
            "After each change, save in the editor and **reload** the browser tab (Ctrl+R / Cmd+R). The browser does not notice file changes on its own.",
          ],
        },
        { kind: "heading", text: "Naming files" },
        {
          kind: "table",
          caption: "File-naming conventions",
          headers: ["Rule", "Good", "Avoid", "Why"],
          rows: [
            ["Call the home page `index.html`", "`index.html`", "`home page.html`", "Web servers send `index.html` automatically when someone visits a folder, e.g. `example.com/`."],
            ["Use lowercase only", "`about.html`", "`About.HTML`", "Many servers are case-sensitive: `About.html` and `about.html` are different files there."],
            ["No spaces", "`contact-us.html`", "`contact us.html`", "Spaces become `%20` in URLs and break easily. Use hyphens."],
            ["Use the `.html` extension", "`menu.html`", "`menu.txt`, `menu`", "The extension tells your computer and the server what type of file it is."],
          ],
        },
        { kind: "heading", text: "Where you will meet the skeleton" },
        {
          kind: "list",
          items: [
            "**Editors:** typing `!` + Tab in VS Code (Emmet) inserts the skeleton.",
            "**Frameworks:** Next.js, Astro and others generate `<html lang>`, `<head>` and `<body>` for you, but you still choose the `lang`, title and metadata.",
            "**Audits:** accessibility checkers (such as Lighthouse in Chrome DevTools) flag a missing `lang`, missing `<title>` or missing viewport.",
            "**Search results:** the `<title>` is usually the blue headline people click in a search engine, which is why it gets its own lesson later (metadata and SEO).",
          ],
        },
      ],
    },
  ],
  commonMistakes: [
    {
      title: "Forgetting the doctype (or putting something before it)",
      wrong: "<!-- My page -->\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <title>Shop</title>\n  </head>",
      right: "<!doctype html>\n<!-- My page -->\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <title>Shop</title>\n  </head>",
      explanation:
        "Without `<!doctype html>` the page renders in quirks mode. Make the doctype the very first line; comments and everything else come after it.",
    },
    {
      title: "Putting visible content in the head",
      wrong: "<head>\n  <meta charset=\"utf-8\">\n  <title>Blog</title>\n  <h1>Welcome to my blog</h1>\n</head>\n<body>\n</body>",
      right: "<head>\n  <meta charset=\"utf-8\">\n  <title>Blog</title>\n</head>\n<body>\n  <h1>Welcome to my blog</h1>\n</body>",
      explanation:
        "`<head>` is for metadata only. When the browser meets a visible element there, it closes the head early and moves the element into the body, which can drag later metadata into the body too. Keep headings, paragraphs and images inside `<body>`.",
    },
    {
      title: "Putting the title or charset in the body",
      wrong: "<head>\n</head>\n<body>\n  <title>Contact</title>\n  <meta charset=\"utf-8\">\n  <p>Email us.</p>\n</body>",
      right: "<head>\n  <meta charset=\"utf-8\">\n  <title>Contact</title>\n</head>\n<body>\n  <p>Email us.</p>\n</body>",
      explanation:
        "Metadata elements belong in `<head>`. A `<meta charset>` in the body arrives too late to choose the encoding, and the HTML validator reports both elements as errors.",
    },
    {
      title: "Missing or wrong `lang`",
      wrong: "<html>\n<!-- or, for an English page: -->\n<html lang=\"english\">",
      right: "<html lang=\"en\">",
      explanation:
        "`lang` needs a standard language code like `en`, `fr` or `en-GB`, not a word like `english`. Without it, assistive technology has to guess the language.",
    },
    {
      title: "Spaces and capitals in file names",
      wrong: "My Home Page.HTML",
      right: "index.html",
      explanation:
        "Use lowercase, hyphen-separated names with the `.html` extension, and call the home page `index.html`. Spaces turn into `%20` in URLs, and capitals cause \"file not found\" errors on case-sensitive servers.",
    },
    {
      title: "Writing a closing tag for a void element",
      wrong: "<meta charset=\"utf-8\"></meta>",
      right: "<meta charset=\"utf-8\">",
      explanation:
        "`<meta>` and `<link>` are void elements: they never have content or an end tag. A stray `</meta>` is an error the validator will report. (`<meta charset=\"utf-8\" />` with a slash is allowed but not required.)",
    },
  ],
  debugging: [
    "**Weird characters such as `Ã©` or `�`?** Check that `<meta charset=\"utf-8\">` is the first element in `<head>` and that your editor saves the file as UTF-8 (VS Code shows the encoding in the bottom status bar).",
    "**Check the rendering mode:** open DevTools (F12 or Ctrl+Shift+I / Cmd+Option+I), go to the **Console** and type `document.compatMode`. `\"CSS1Compat\"` means standards mode; `\"BackCompat\"` means quirks mode, so your doctype is missing or wrong.",
    "**Check where elements really ended up:** the DevTools **Elements** panel (Inspector in Firefox) shows the tree the browser *built*, not the file you wrote. If your `<title>` or `<meta>` appears inside `<body>` there, it was in the wrong place in your file.",
    "**View Source vs Elements:** right-click → *View Page Source* shows your file exactly as written; the Elements panel shows the browser's repaired version. Comparing the two reveals tags the browser added or moved.",
    "**Run the validator:** paste your code into the W3C Nu HTML Checker (validator.w3.org/nu) using *Validate by Direct Input*. It reports a missing doctype, missing `<title>`, missing `lang` (as a warning) and misplaced elements, with line numbers.",
    "**Change not showing?** Make sure you saved the file, that you are viewing the same file (check the `file://` path in the address bar), and then reload the tab.",
  ],
  examples: [
    {
      id: "html-document-structure-example-skeleton",
      title: "The standard skeleton",
      runtime: "web",
      code: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>My First Page</title>\n  </head>\n  <body>\n    <!-- Try changing the heading and the paragraph -->\n    <h1>Hello, web!</h1>\n    <p>Characters like é, ñ, € and 😀 display correctly because of the charset line.</p>\n  </body>\n</html>",
    },
    {
      id: "html-document-structure-example-self-inspect",
      title: "A page that reports its own structure",
      runtime: "web",
      code: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Structure Report</title>\n  </head>\n  <body>\n    <h1>What the browser knows about this page</h1>\n    <ul>\n      <li>Rendering mode: <strong id=\"mode\"></strong></li>\n      <li>Language: <strong id=\"lang\"></strong></li>\n      <li>Title: <strong id=\"title\"></strong></li>\n      <li>Encoding: <strong id=\"charset\"></strong></li>\n    </ul>\n    <p>Delete the doctype line and run again: the mode changes to BackCompat (quirks mode).</p>\n\n    <!-- A tiny script that reads the page's own settings (you will learn JavaScript later) -->\n    <script>\n      document.getElementById(\"mode\").textContent = document.compatMode;\n      document.getElementById(\"lang\").textContent = document.documentElement.lang || \"(not set)\";\n      document.getElementById(\"title\").textContent = document.title || \"(no title)\";\n      document.getElementById(\"charset\").textContent = document.characterSet;\n    </script>\n  </body>\n</html>",
    },
    {
      id: "html-document-structure-example-store-page",
      title: "A store page with comments",
      runtime: "web",
      code: "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <!-- 1. Encoding first -->\n    <meta charset=\"utf-8\">\n    <!-- 2. Fit the screen on phones -->\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <!-- 3. Specific page first, site name second -->\n    <title>Ceramic Mug | Clay & Co.</title>\n  </head>\n  <body>\n    <h1>Ceramic Mug</h1>\n    <p>Hand-glazed, 350 ml, dishwasher safe.</p>\n    <p>Price: €18</p>\n  </body>\n</html>",
    },
  ],
  exercises: [
    {
      id: "html-document-structure-ex-1",
      type: "order",
      difficulty: "beginner",
      prompt: "Put the lines of the standard HTML skeleton in the correct order, from the top of the file to the bottom.",
      steps: [
        "<!doctype html>",
        "<html lang=\"en\">",
        "<head>",
        "<meta charset=\"utf-8\">",
        "<title>Home</title>",
        "</head>",
        "<body>",
        "</body>",
        "</html>",
      ],
      hints: [
        "The doctype is always first, and the root element wraps everything after it.",
        "The charset declaration is the first thing inside `<head>`.",
        "Elements close in the reverse order they were opened.",
      ],
      explanation:
        "Doctype first, then the root `<html>`. Inside it, `<head>` (charset first, then title) comes before `<body>`. Closing tags appear in reverse order: `</body>` then `</html>`.",
    },
    {
      id: "html-document-structure-ex-2",
      type: "code",
      runtime: "web",
      difficulty: "beginner",
      prompt:
        "This bakery page is missing two things: the page language and a tab title. Add `lang=\"en\"` to the `<html>` element and add a `<title>` in the head with the text `Lena's Bakery`.",
      instructions: "Keep the existing doctype, charset and body content. Only add what is missing.",
      starter:
        "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n  </head>\n  <body>\n    <h1>Lena's Bakery</h1>\n    <p>Fresh bread every morning from 6:30.</p>\n  </body>\n</html>",
      tests: [
        {
          name: "The page language is English",
          code: "assert.equal(document.documentElement.lang, \"en\", \"Add lang=\\\"en\\\" to the <html> start tag\");",
        },
        {
          name: "The head contains a title",
          code: "assert.ok(document.head.querySelector(\"title\"), \"Add a <title> element inside <head>\");",
        },
        {
          name: "The title text is Lena's Bakery",
          code: "assert.equal(document.title.trim(), \"Lena's Bakery\", \"The <title> text should be exactly: Lena's Bakery\");",
        },
        {
          name: "The visible heading is still in the body",
          code: "assert.ok(document.body.querySelector(\"h1\"), \"Keep the <h1> inside <body>\");",
        },
      ],
      solution:
        "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <title>Lena's Bakery</title>\n  </head>\n  <body>\n    <h1>Lena's Bakery</h1>\n    <p>Fresh bread every morning from 6:30.</p>\n  </body>\n</html>",
      hints: [
        "Attributes go inside the start tag: `<html lang=\"en\">`.",
        "The `<title>` goes inside `<head>`, after the `<meta charset>` line.",
      ],
      explanation:
        "`lang=\"en\"` on the root element declares the language for the whole page, and the `<title>` in the head gives the browser tab its text. The `<h1>` is the visible heading; the title is not shown inside the page.",
    },
    {
      id: "html-document-structure-ex-3",
      type: "fill-blank",
      difficulty: "beginner",
      prompt: "Complete the skeleton of an English page so it uses standards mode, UTF-8 encoding and has a tab title.",
      template:
        "<!___ html>\n<html lang=\"___\">\n  <head>\n    <meta ___=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <___>Home</title>\n  </head>\n  <body></body>\n</html>",
      blanks: [
        { answers: ["doctype", "DOCTYPE", "Doctype"] },
        { answers: ["en", "en-US", "en-GB", "en-IN", "en-AU", "en-CA"] },
        { answers: ["charset"] },
        { answers: ["title"] },
      ],
      hints: [
        "The first line declares the document type.",
        "English uses a two-letter language code.",
        "The attribute that sets the character encoding is short for *character set*.",
      ],
      explanation:
        "`<!doctype html>` selects standards mode, `lang=\"en\"` declares English, `charset=\"utf-8\"` sets the encoding and `<title>` provides the tab text.",
    },
    {
      id: "html-document-structure-ex-4",
      type: "code",
      runtime: "web",
      difficulty: "intermediate",
      prompt:
        "You were given only the body content of a contact page. Turn it into a complete document: doctype, `<html lang=\"en\">`, a head containing a UTF-8 charset, a viewport meta tag (`width=device-width, initial-scale=1`) and the title `Contact | Green Leaf Garden Centre`, and a body containing the existing heading and paragraph.",
      instructions: "Indent nested elements by 2 spaces per level so the structure is easy to read.",
      starter: "<h1>Contact us</h1>\n<p>Call 555-0142 or visit us at 12 Fern Road.</p>",
      tests: [
        {
          name: "Starts with a doctype (standards mode)",
          code: "assert.ok(document.doctype && document.doctype.name === \"html\", \"Begin the file with <!doctype html>\");\nassert.equal(document.compatMode, \"CSS1Compat\", \"The page should render in standards mode\");",
        },
        {
          name: "The page language is English",
          code: "assert.equal(document.documentElement.lang, \"en\", \"Add lang=\\\"en\\\" to <html>\");",
        },
        {
          name: "UTF-8 charset is declared in the head",
          code: "const meta = document.head.querySelector(\"meta[charset]\");\nassert.ok(meta, \"Add <meta charset=\\\"utf-8\\\"> inside <head>\");\nassert.equal(meta.getAttribute(\"charset\").toLowerCase(), \"utf-8\", \"The charset should be utf-8\");",
        },
        {
          name: "Viewport meta is in the head",
          code: "const vp = document.head.querySelector(\"meta[name='viewport']\");\nassert.ok(vp, \"Add <meta name=\\\"viewport\\\" ...> inside <head>\");\nconst content = (vp.getAttribute(\"content\") || \"\").replace(/\\s/g, \"\");\nassert.ok(content.includes(\"width=device-width\"), \"The viewport content should include width=device-width\");\nassert.ok(content.includes(\"initial-scale=1\"), \"The viewport content should include initial-scale=1\");",
        },
        {
          name: "Title is set in the head",
          code: "assert.ok(document.head.querySelector(\"title\"), \"Put the <title> inside <head>\");\nassert.equal(document.title.trim(), \"Contact | Green Leaf Garden Centre\", \"Use the exact title text from the task\");",
        },
        {
          name: "Heading and paragraph are in the body",
          code: "assert.equal(document.body.querySelector(\"h1\")?.textContent.trim(), \"Contact us\", \"Keep the <h1> inside <body>\");\nassert.ok(document.body.querySelector(\"p\"), \"Keep the paragraph inside <body>\");",
        },
      ],
      solution:
        "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Contact | Green Leaf Garden Centre</title>\n  </head>\n  <body>\n    <h1>Contact us</h1>\n    <p>Call 555-0142 or visit us at 12 Fern Road.</p>\n  </body>\n</html>",
      hints: [
        "Start by typing the full skeleton, then move the two content lines inside `<body>`.",
        "The viewport tag is `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">`.",
        "The tab title is not the same as the visible heading — both are needed.",
      ],
      explanation:
        "A complete document wraps the content in `<html>` and separates metadata (`<head>`: charset, viewport, title) from visible content (`<body>`). The doctype at the top keeps the page in standards mode.",
    },
    {
      id: "html-document-structure-ex-5",
      type: "find-bug",
      runtime: "web",
      difficulty: "intermediate",
      debugging: true,
      prompt:
        "A teammate's event page shows the file name in the browser tab, shows `Ã©` on some machines, and DevTools reports `document.compatMode` as `\"BackCompat\"`. Find and fix the structural bugs.",
      instructions: "Look at the very first line, and at which elements ended up in `<body>` that belong in `<head>`.",
      code:
        "<html lang=\"en\">\n  <head>\n  </head>\n  <body>\n    <meta charset=\"utf-8\">\n    <title>Café Jazz Night | City Events</title>\n    <h1>Café Jazz Night</h1>\n    <p>Friday at 20:00. Free entry.</p>\n  </body>\n</html>",
      tests: [
        {
          name: "The page renders in standards mode",
          code: "assert.equal(document.compatMode, \"CSS1Compat\", \"compatMode is BackCompat: add <!doctype html> as the first line\");",
        },
        {
          name: "The charset is declared in the head",
          code: "assert.ok(document.head.querySelector(\"meta[charset]\"), \"Move <meta charset=\\\"utf-8\\\"> into <head>\");\nassert.equal(document.body.querySelector(\"meta\"), null, \"<body> should not contain <meta> elements\");",
        },
        {
          name: "The title is in the head",
          code: "assert.ok(document.head.querySelector(\"title\"), \"Move <title> into <head>\");\nassert.equal(document.body.querySelector(\"title\"), null, \"<body> should not contain a <title>\");",
        },
        {
          name: "Visible content stays in the body",
          code: "assert.ok(document.body.querySelector(\"h1\"), \"Keep the <h1> in <body>\");\nassert.ok(document.body.querySelector(\"p\"), \"Keep the paragraph in <body>\");",
        },
      ],
      solution:
        "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <title>Café Jazz Night | City Events</title>\n  </head>\n  <body>\n    <h1>Café Jazz Night</h1>\n    <p>Friday at 20:00. Free entry.</p>\n  </body>\n</html>",
      hints: [
        "`BackCompat` means quirks mode. What line switches on standards mode?",
        "Open the Elements panel in your head: where do `<meta>` and `<title>` sit right now?",
        "Metadata goes in `<head>`, visible content goes in `<body>`.",
      ],
      explanation:
        "Three bugs: the missing doctype caused quirks mode; `<meta charset>` sat in the body, too late to choose the encoding; and `<title>` was in the body, where it does not belong. Adding the doctype and moving both metadata elements into `<head>` fixes all three symptoms.",
    },
  ],
  quiz: [
    {
      id: "html-document-structure-q1",
      type: "mcq",
      difficulty: "beginner",
      prompt: "What happens if you leave `<!doctype html>` out of a page?",
      options: [
        {
          id: "a",
          text: "The page does not load at all",
          explanation: "Browsers are forgiving; the page still loads. The problem is subtler than that.",
        },
        {
          id: "b",
          text: "The browser renders the page in quirks mode, so some CSS behaves like in very old browsers",
          explanation: "Correct — without a doctype the browser assumes an old page and switches to quirks mode.",
        },
        {
          id: "c",
          text: "The text is displayed with the wrong characters",
          explanation: "Garbled characters come from a missing or wrong charset, not from the doctype.",
        },
        {
          id: "d",
          text: "Nothing at all; the doctype is only a comment",
          explanation: "The doctype is not a comment. It directly controls the rendering mode.",
        },
      ],
      answer: "b",
      hints: ["Think about standards mode vs quirks mode."],
      explanation: "The doctype selects standards mode. Without it, browsers use quirks mode, which imitates old browser bugs.",
    },
    {
      id: "html-document-structure-q2",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Which element belongs in `<body>` rather than `<head>`?",
      options: [
        { id: "a", text: "`<title>`", explanation: "The title is metadata; it goes in the head and shows in the tab." },
        { id: "b", text: "`<meta charset=\"utf-8\">`", explanation: "The charset declaration is metadata and should be first in the head." },
        { id: "c", text: "`<h1>`", explanation: "Correct — headings are visible content, so they go in the body." },
        { id: "d", text: "`<link rel=\"stylesheet\" href=\"styles.css\">`", explanation: "Links to stylesheets are metadata and go in the head." },
      ],
      answer: "c",
      hints: ["Which one is shown inside the page itself?"],
      explanation: "`<head>` holds information about the page; `<body>` holds what visitors see. An `<h1>` is visible content.",
    },
    {
      id: "html-document-structure-q3",
      type: "mcq",
      difficulty: "beginner",
      prompt: "Where does the text inside `<title>` appear?",
      options: [
        { id: "a", text: "As the largest heading at the top of the page", explanation: "That is `<h1>`. The title is not displayed inside the page." },
        {
          id: "b",
          text: "In the browser tab, bookmarks, history and usually as the headline in search results",
          explanation: "Correct — the title identifies the page outside of its content.",
        },
        { id: "c", text: "Only in the source code, nowhere else", explanation: "Browsers and search engines both use it." },
      ],
      answer: "b",
      hints: ["Look at the top of your browser right now."],
      explanation: "The `<title>` labels the page in tabs, bookmarks, history and search results, and screen readers announce it when the page loads.",
    },
    {
      id: "html-document-structure-q4",
      type: "mcq",
      difficulty: "intermediate",
      prompt: "A French page shows `prÃ©sentation` instead of `présentation`. What is the most likely fix?",
      options: [
        { id: "a", text: "Change `<html lang=\"fr\">` to `<html lang=\"en\">`", explanation: "`lang` affects pronunciation and translation, not how bytes are decoded." },
        { id: "b", text: "Add `<!doctype html>`", explanation: "The doctype controls rendering mode, not character decoding." },
        {
          id: "c",
          text: "Add `<meta charset=\"utf-8\">` as the first element in `<head>` and save the file as UTF-8",
          explanation: "Correct — the browser is decoding UTF-8 bytes with the wrong encoding.",
        },
        { id: "d", text: "Add the viewport meta tag", explanation: "The viewport only controls sizing on mobile devices." },
      ],
      answer: "c",
      hints: ["Which line tells the browser how to turn bytes into characters?"],
      explanation: "`Ã©` is what UTF-8 bytes for `é` look like when decoded with an older encoding. Declaring `utf-8` early in the head fixes it.",
    },
    {
      id: "html-document-structure-q5",
      type: "true-false",
      difficulty: "beginner",
      prompt: "HTML comments (`<!-- ... -->`) are hidden from visitors, so it is safe to store a password in one.",
      answer: false,
      hints: ["What does View Source show?"],
      explanation: "Comments are not rendered, but they are sent to every visitor as part of the file. Anyone can read them with View Source or DevTools.",
    },
    {
      id: "html-document-structure-q6",
      type: "multi-select",
      difficulty: "beginner",
      prompt: "Which of these are good file names for pages on a website? Select all that apply.",
      options: [
        { id: "a", text: "`index.html`", explanation: "Correct — the conventional name for a folder's main page." },
        { id: "b", text: "`about-us.html`", explanation: "Correct — lowercase, hyphen instead of a space, `.html` extension." },
        { id: "c", text: "`Contact Page.html`", explanation: "Contains a space and a capital letter; the space becomes `%20` in the URL." },
        { id: "d", text: "`PRICING.HTML`", explanation: "Capitals cause mismatches on case-sensitive servers. Use lowercase." },
        { id: "e", text: "`faq.html`", explanation: "Correct — short, lowercase, no spaces." },
      ],
      answers: ["a", "b", "e"],
      hints: ["Lowercase, no spaces, `.html` extension."],
      explanation: "Use lowercase names with hyphens instead of spaces, and `index.html` for the home page of a folder.",
    },
    {
      id: "html-document-structure-q7",
      type: "match",
      difficulty: "beginner",
      prompt: "Match each skeleton line to its job.",
      pairs: [
        { left: "`<!doctype html>`", right: "Switches on standards mode" },
        { left: "`<html lang=\"en\">`", right: "Declares the language of the content" },
        { left: "`<meta charset=\"utf-8\">`", right: "Says how to decode the file's bytes into characters" },
        { left: "`<meta name=\"viewport\" ...>`", right: "Fits the layout width to a phone's screen" },
        { left: "`<title>`", right: "Provides the browser tab and bookmark text" },
      ],
      hints: ["Each line has exactly one job."],
      explanation:
        "Doctype → rendering mode; `lang` → language; charset → encoding; viewport → mobile width; title → tab text.",
    },
  ],
  challenge: {
    id: "html-document-structure-challenge",
    type: "code",
    runtime: "web",
    difficulty: "intermediate",
    prompt:
      "A small outdoor-gear shop needs the starting file for its product page. The current draft has several problems. Rebuild it as a complete, correct document:\n\n- a doctype so the page uses standards mode\n- `lang=\"en\"` on the root element\n- a `<head>` containing, in this order, `<meta charset=\"utf-8\">`, a viewport meta tag and the title `Trail Runner X2 | Summit Outfitters`\n- a `<body>` with an `<h1>` reading `Trail Runner X2`, the description paragraph and the price paragraph\n- at least one HTML comment that labels a part of the page for other developers",
    instructions: "Do not put any visible content in the head, and do not put any metadata in the body.",
    starter:
      "<html>\n  <head>\n    <h1>Trail Runner X2</h1>\n  </head>\n  <body>\n    <title>trail runner</title>\n    <p>Lightweight trail shoe with a grippy sole.</p>\n    <p>Price: $129</p>\n  </body>\n</html>",
    tests: [
      {
        name: "Standards mode and English language",
        code: "assert.equal(document.compatMode, \"CSS1Compat\", \"Add <!doctype html> as the first line\");\nassert.equal(document.documentElement.lang, \"en\", \"Add lang=\\\"en\\\" to <html>\");",
      },
      {
        name: "Charset and viewport are in the head",
        code: "const meta = document.head.querySelector(\"meta[charset]\");\nassert.ok(meta && meta.getAttribute(\"charset\").toLowerCase() === \"utf-8\", \"Add <meta charset=\\\"utf-8\\\"> inside <head>\");\nconst vp = document.head.querySelector(\"meta[name='viewport']\");\nassert.ok(vp && (vp.getAttribute(\"content\") || \"\").replace(/\\s/g, \"\").includes(\"width=device-width\"), \"Add a viewport meta tag with width=device-width inside <head>\");",
      },
      {
        name: "Charset comes before the title",
        code: "const all = [...document.head.querySelectorAll(\"meta[charset], title\")];\nassert.ok(all.length >= 2 && all[0].matches(\"meta[charset]\"), \"Put <meta charset> before <title> in the head\");",
      },
      {
        name: "Correct title in the head",
        code: "assert.ok(document.head.querySelector(\"title\"), \"The <title> must be inside <head>\");\nassert.equal(document.title.trim(), \"Trail Runner X2 | Summit Outfitters\", \"Use the exact title text: Trail Runner X2 | Summit Outfitters\");",
      },
      {
        name: "Visible content is in the body only",
        code: "assert.equal(document.body.querySelector(\"h1\")?.textContent.trim(), \"Trail Runner X2\", \"The <h1> must be inside <body> and read Trail Runner X2\");\nassert.ok(document.body.querySelectorAll(\"p\").length >= 2, \"Keep both paragraphs in <body>\");\nassert.equal(document.head.querySelector(\"h1, p\"), null, \"The head must not contain visible content\");\nassert.equal(document.body.querySelector(\"title, meta\"), null, \"The body must not contain <title> or <meta>\");",
      },
      {
        name: "Includes an HTML comment",
        code: "const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);\nassert.ok(walker.nextNode(), \"Add at least one comment, e.g. <!-- Product details -->\");",
      },
    ],
    solution:
      "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>Trail Runner X2 | Summit Outfitters</title>\n  </head>\n  <body>\n    <!-- Product details -->\n    <h1>Trail Runner X2</h1>\n    <p>Lightweight trail shoe with a grippy sole.</p>\n    <p>Price: $129</p>\n  </body>\n</html>",
    hints: [
      "Start from the standard skeleton, then move the content into the right places.",
      "The `<h1>` is visible content; the `<title>` is metadata. They are currently swapped.",
      "A comment looks like `<!-- Product details -->`.",
    ],
    explanation:
      "The draft had no doctype (quirks mode), no `lang`, no charset or viewport, a heading in the head and a title in the body. The fixed page follows the standard skeleton: doctype, `<html lang=\"en\">`, a head with charset first, then viewport and a descriptive *page | site* title, and a body holding only visible content, with a comment labelling the product section.",
  },
  bestPractices: [
    "**Start every page from the full skeleton**: `<!doctype html>`, `<html lang>`, `<head>` with charset, viewport and title, then `<body>`. Keep a copy or use your editor's snippet so you never forget a line.",
    "**Make `<meta charset=\"utf-8\">` the first element in `<head>`**, and save your files as UTF-8 in your editor.",
    "**Write a unique, descriptive `<title>` for every page**, putting the specific part first: `Contact | Green Leaf Garden Centre`, not `Green Leaf Garden Centre` on every page.",
    "**Set `lang` to the language of the content** using a standard code (`en`, `es`, `en-GB`).",
    "**Indent consistently** (2 spaces per nesting level is the most common convention) and close elements in reverse order of opening.",
    "**Name files in lowercase with hyphens**, and use `index.html` for a folder's main page.",
    "**Use comments to explain why, not what**: `<!-- Hours change seasonally; check with the owner -->` helps more than `<!-- paragraph -->`. Never put secrets in comments.",
    "**Advanced:** run your pages through the W3C Nu HTML Checker and an accessibility audit such as Lighthouse before publishing; both catch skeleton mistakes automatically.",
  ],
  cheatSheet: [
    { item: "`<!doctype html>`", meaning: "First line of every page; turns on standards mode" },
    { item: "`<html lang=\"en\">` … `</html>`", meaning: "Root element wrapping the whole page; `lang` sets the content language" },
    { item: "`<head>` … `</head>`", meaning: "Metadata: encoding, viewport, title, links to CSS/JS" },
    { item: "`<meta charset=\"utf-8\">`", meaning: "Decode the file as UTF-8; first element in the head" },
    { item: "`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">`", meaning: "Fit the page width to the device screen on phones" },
    { item: "`<title>Page | Site</title>`", meaning: "Tab, bookmark, history and search-result text" },
    { item: "`<body>` … `</body>`", meaning: "All visible content" },
    { item: "`<!-- note -->`", meaning: "Comment; ignored by the browser but visible in the source" },
    { item: "`<link rel=\"stylesheet\" href=\"styles.css\">`", meaning: "Connects a CSS file (covered in the CSS course)" },
    { item: "`index.html`", meaning: "Default page name for a folder; use lowercase, hyphens, no spaces" },
    { item: "`document.compatMode`", meaning: "Type in the DevTools Console: `CSS1Compat` = standards, `BackCompat` = quirks" },
  ],
  keyPoints: [
    "Every page starts with `<!doctype html>`; without it the browser silently uses quirks mode.",
    "`<html lang=\"…\">` is the root element and tells assistive technology and translators which language the page uses.",
    "`<head>` holds metadata (charset, viewport, title, links); `<body>` holds everything visible.",
    "`<meta charset=\"utf-8\">` goes first in the head so every character decodes correctly.",
    "The viewport meta tag makes pages fit phone screens; `<title>` labels the tab, bookmarks and search results.",
    "Comments (`<!-- -->`) are invisible on the page but public in the source code.",
    "Name files in lowercase with hyphens, call the home page `index.html`, save, then reload to see changes.",
  ],
  completionCriteria: [
    "You can write the complete HTML skeleton from memory without looking it up.",
    "You can explain what each skeleton line does and what goes wrong when it is missing.",
    "You can explain the difference between standards mode and quirks mode and check which one a page uses in DevTools.",
    "You can decide whether an element belongs in `<head>` or `<body>`.",
    "You can create an `index.html` file on your computer, open it in a browser and see your changes after saving and reloading.",
  ],
  related: ["html-text-content", "html-head-metadata-seo", "html-accessibility", "css-what-is-css", "css-responsive-design"],
  references: [
    { title: "MDN: Basic HTML syntax (Learn web development)", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax" },
    { title: "MDN: <!DOCTYPE>", url: "https://developer.mozilla.org/en-US/docs/Glossary/Doctype" },
    { title: "MDN: Quirks mode and standards mode", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode" },
    { title: "MDN: <meta> element", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta" },
    { title: "MDN: <title> element", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/title" },
    { title: "HTML Living Standard (WHATWG): The DOCTYPE", url: "https://html.spec.whatwg.org/multipage/syntax.html#the-doctype" },
    { title: "HTML Living Standard (WHATWG): Document metadata", url: "https://html.spec.whatwg.org/multipage/semantics.html#document-metadata" },
    { title: "W3C WAI: Understanding SC 3.1.1 Language of Page", url: "https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html" },
    { title: "W3C Nu HTML Checker", url: "https://validator.w3.org/nu/" },
    { title: "web.dev: Document structure (Learn HTML)", url: "https://web.dev/learn/html/document-structure" },
  ],
};

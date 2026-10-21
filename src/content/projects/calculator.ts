import type { Project } from "@/content/types";

export const calculator: Project = {
  id: "proj-calculator",
  slug: "calculator",
  order: 1,
  title: "Calculator",
  summary:
    "Build an accessible four-function calculator with keyboard support, operator chaining and safe floating-point formatting, without ever using `eval`.",
  difficulty: "beginner",
  tech: ["javascript", "dom"],
  hours: 3,
  relatedLessons: [
    "dom-selecting-elements",
    "dom-updating-content",
    "dom-event-listeners",
    "dom-event-delegation",
    "control-flow-switch",
    "variables-numbers",
    "variables-type-conversion",
    "functions-pure-functions",
  ],
  intro: [
    {
      kind: "paragraph",
      text: "A calculator looks simple, but it is a great first project because it forces you to think about **state**: what number is being typed, which operator was chosen, and what happens when the user presses `=` twice or divides by zero.",
    },
    {
      kind: "paragraph",
      text: "You will keep all of that state in one plain object, update it with small functions, and then *render* the state to the screen. This \"state → render\" pattern is exactly how React works, so you are also preparing for the React projects later.",
    },
    {
      kind: "callout",
      tone: "warning",
      title: "No eval",
      text: "Many tutorials build the expression as a string and call `eval()`. That is unsafe (it runs arbitrary code) and hides the logic you are here to learn. You will implement the arithmetic yourself.",
    },
  ],
  requirements: [
    "Digits 0–9 and a decimal point can be entered; a number can contain at most one decimal point.",
    "The four operators `+`, `−`, `×` and `÷` work, and pressing a second operator evaluates the pending one first (operator chaining: `2 + 3 + 4 =` gives `9`).",
    "`=` shows the result; `C` clears everything; `⌫` deletes the last typed digit.",
    "Dividing by zero shows a friendly message instead of `Infinity` and resets the calculator.",
    "Results avoid floating-point noise: `0.1 + 0.2` displays `0.3`.",
    "Every action works with the keyboard (digits, `.`, `+ - * /`, `Enter`/`=`, `Backspace`, `Escape`).",
    "The display is announced to screen readers and every button has an accessible name.",
  ],
  userStories: [
    "As a shopper I want to add up a few prices quickly so that I know roughly what I will spend.",
    "As a keyboard user I want to type numbers and operators on my keyboard so that I do not have to click every button.",
    "As a screen-reader user I want the result to be announced so that I know the calculation finished.",
    "As a user who makes mistakes I want to delete the last digit so that I don't have to start the whole calculation again.",
  ],
  skills: [
    "Modelling UI state with a plain object",
    "Event delegation with `data-*` attributes",
    "Keyboard events and `event.key`",
    "Pure functions for arithmetic",
    "Floating-point formatting with `toPrecision`",
    "Accessible live regions with `<output>`",
  ],
  steps: [
    {
      id: "markup",
      title: "Step 1 — Build the markup and layout",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** create a display and a grid of real `<button>` elements. Each button carries a `data-action` (what kind of key it is) and, where needed, a `data-value`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** `<button>` gives you keyboard focus, `Enter`/`Space` activation and screen-reader semantics for free. `data-*` attributes let one click handler understand every key, so you don't need 18 separate listeners.",
        },
        {
          kind: "code",
          language: "html",
          title: "index.html (excerpt)",
          code: `<output id="display" class="display" aria-live="polite">0</output>
<div class="keys">
  <button type="button" data-action="clear">C</button>
  <button type="button" data-action="operator" data-value="/" aria-label="divide">÷</button>
  <button type="button" data-action="digit" data-value="7">7</button>
  <!-- … -->
</div>`,
        },
        {
          kind: "callout",
          tone: "tip",
          text: "`<output>` has an implicit `status` role. Combined with `aria-live=\"polite\"`, screen readers announce its new value without stealing focus.",
        },
      ],
    },
    {
      id: "state",
      title: "Step 2 — Model the state and render it",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** store everything the calculator knows in one object and write a single `render()` function that copies that state into the DOM.",
        },
        {
          kind: "paragraph",
          text: "**Why:** if only `render()` touches the display, the screen can never drift out of sync with your data. Every handler just changes `state` and calls `render()`.",
        },
        {
          kind: "code",
          language: "js",
          code: `const state = {
  current: "0",     // the number being typed, kept as a string
  previous: null,   // the left-hand operand, or null
  operator: null,   // "+", "-", "*", "/" or null
  overwrite: false, // true right after an operator or "="
};

function render() {
  display.textContent = state.current;
}`,
        },
        {
          kind: "callout",
          tone: "info",
          text: "Keep `current` as a **string** while the user types. `Number(\"0.\")` is `0`, so storing a number would lose the trailing decimal point the user just typed.",
        },
      ],
    },
    {
      id: "input",
      title: "Step 3 — Handle digits and the decimal point",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** append digits to `current`, replacing the leading `0` or starting fresh after an operator.",
        },
        {
          kind: "paragraph",
          text: "**Why:** the `overwrite` flag is what makes `5 + 3` work: after pressing `+`, the next digit must *start a new number* rather than produce `53`.",
        },
        {
          kind: "code",
          language: "js",
          code: `function inputDigit(digit) {
  if (state.overwrite || state.current === "0") {
    state.current = digit;
    state.overwrite = false;
  } else if (state.current.length < MAX_LENGTH) {
    state.current += digit;
  }
}

function inputDecimal() {
  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
  } else if (!state.current.includes(".")) {
    state.current += ".";
  }
}`,
        },
      ],
    },
    {
      id: "arithmetic",
      title: "Step 4 — Implement the arithmetic as a pure function",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** write `compute(a, b, operator)` that only takes numbers and returns a number (or `null` for an invalid operation).",
        },
        {
          kind: "paragraph",
          text: "**Why:** a pure function has no DOM or global state, so you can test it in the console in seconds: `compute(6, 3, \"/\")`. Bugs in maths and bugs in UI stay separate.",
        },
        {
          kind: "code",
          language: "js",
          code: `function compute(a, b, operator) {
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? null : a / b;
    default: return b;
  }
}

// 0.1 + 0.2 is 0.30000000000000004 in binary floating point.
// Rounding to 12 significant digits removes that noise.
function formatNumber(value) {
  return String(Number(value.toPrecision(12)));
}`,
        },
      ],
    },
    {
      id: "operators",
      title: "Step 5 — Operators, equals and chaining",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** when an operator is pressed, evaluate any pending operation first, then remember the new operator. `=` evaluates and clears the operator.",
        },
        {
          kind: "paragraph",
          text: "**Why:** this is how a pocket calculator behaves. Without it, `2 + 3 + 4` would forget the `2`.",
        },
        {
          kind: "code",
          language: "js",
          code: `function chooseOperator(nextOperator) {
  // Pressing two operators in a row just swaps the operator.
  if (state.operator && !state.overwrite) evaluate();
  if (state.current === ERROR) return;
  state.previous = state.current;
  state.operator = nextOperator;
  state.overwrite = true;
}

function evaluate() {
  if (state.operator === null || state.previous === null) return;
  const result = compute(Number(state.previous), Number(state.current), state.operator);
  if (result === null) {
    reset();
    state.current = ERROR;
  } else {
    state.current = formatNumber(result);
  }
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
}`,
        },
      ],
    },
    {
      id: "events",
      title: "Step 6 — Wire up clicks and the keyboard",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** one click listener on the `.keys` container (event delegation) and one `keydown` listener on `document`. Both translate the event into a call to the same `handleAction` function.",
        },
        {
          kind: "paragraph",
          text: "**Why:** having a single entry point means clicking `7` and pressing the `7` key run identical code, so they can never behave differently.",
        },
        {
          kind: "code",
          language: "js",
          code: `keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  const mapped = KEY_MAP[event.key] ?? (/^[0-9]$/.test(event.key) ? ["digit", event.key] : null);
  if (!mapped) return;
  event.preventDefault(); // e.g. stop "/" opening Firefox quick-find
  handleAction(...mapped);
});`,
        },
        {
          kind: "callout",
          tone: "tip",
          text: "`closest(\"button\")` is important: if a button ever contains an icon `<span>`, `event.target` would be the span, not the button.",
        },
      ],
    },
  ],
  starter: [
    {
      filename: "index.html",
      language: "html",
      code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Calculator</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="calculator" aria-label="Calculator">
      <h1 class="visually-hidden">Calculator</h1>
      <!-- TODO: add an <output> display with aria-live="polite" -->
      <div class="keys">
        <!-- TODO: add buttons with data-action and data-value attributes -->
      </div>
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    },
    {
      filename: "styles.css",
      language: "css",
      code: `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #f1f5f9;
}
.calculator {
  width: min(320px, 92vw);
  padding: 1rem;
  border-radius: 1rem;
  background: #0f172a;
}
.keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const display = document.querySelector("#display");
const keys = document.querySelector(".keys");

const state = {
  current: "0",
  previous: null,
  operator: null,
  overwrite: false,
};

function render() {
  // TODO: show state.current in the display
}

function compute(a, b, operator) {
  // TODO: return the result, or null when dividing by zero
}

function handleAction(action, value) {
  // TODO: call the right function for each action, then render()
}

// TODO: listen for clicks on .keys and keydown on document

render();`,
    },
  ],
  solution: [
    {
      filename: "index.html",
      language: "html",
      code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Calculator</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="calculator" aria-label="Calculator">
      <h1 class="visually-hidden">Calculator</h1>
      <p id="expression" class="expression" aria-hidden="true"></p>
      <output id="display" class="display" aria-live="polite">0</output>
      <div class="keys">
        <button type="button" class="key key--fn" data-action="clear" aria-label="clear">C</button>
        <button type="button" class="key key--fn" data-action="backspace" aria-label="delete last digit">⌫</button>
        <button type="button" class="key key--fn" data-action="sign" aria-label="toggle sign">±</button>
        <button type="button" class="key key--op" data-action="operator" data-value="/" aria-label="divide">÷</button>

        <button type="button" class="key" data-action="digit" data-value="7">7</button>
        <button type="button" class="key" data-action="digit" data-value="8">8</button>
        <button type="button" class="key" data-action="digit" data-value="9">9</button>
        <button type="button" class="key key--op" data-action="operator" data-value="*" aria-label="multiply">×</button>

        <button type="button" class="key" data-action="digit" data-value="4">4</button>
        <button type="button" class="key" data-action="digit" data-value="5">5</button>
        <button type="button" class="key" data-action="digit" data-value="6">6</button>
        <button type="button" class="key key--op" data-action="operator" data-value="-" aria-label="subtract">−</button>

        <button type="button" class="key" data-action="digit" data-value="1">1</button>
        <button type="button" class="key" data-action="digit" data-value="2">2</button>
        <button type="button" class="key" data-action="digit" data-value="3">3</button>
        <button type="button" class="key key--op" data-action="operator" data-value="+" aria-label="add">+</button>

        <button type="button" class="key key--wide" data-action="digit" data-value="0">0</button>
        <button type="button" class="key" data-action="decimal" aria-label="decimal point">.</button>
        <button type="button" class="key key--equals" data-action="equals" aria-label="equals">=</button>
      </div>
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    },
    {
      filename: "styles.css",
      language: "css",
      code: `* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #f1f5f9;
}

.calculator {
  width: min(320px, 92vw);
  padding: 1rem;
  border-radius: 1rem;
  background: #0f172a;
  box-shadow: 0 10px 30px rgb(15 23 42 / 0.3);
}

.expression {
  min-height: 1.25rem;
  margin: 0;
  text-align: right;
  color: #94a3b8;
  font-size: 0.9rem;
}

.display {
  display: block;
  margin-bottom: 1rem;
  padding: 0.5rem;
  text-align: right;
  font-size: 2.25rem;
  color: #f8fafc;
  overflow-wrap: anywhere;
}

.keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.key {
  padding: 1rem 0;
  border: 0;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  background: #334155;
  color: #f8fafc;
  cursor: pointer;
}

.key:hover { background: #475569; }
.key:focus-visible { outline: 3px solid #38bdf8; outline-offset: 2px; }
.key--fn { background: #64748b; }
.key--op { background: #f59e0b; color: #0f172a; }
.key--equals { background: #22c55e; color: #0f172a; }
.key--wide { grid-column: span 2; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector(".keys");

const MAX_LENGTH = 16;
const ERROR = "Cannot divide by zero";
const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };
const KEY_MAP = {
  ".": ["decimal"],
  ",": ["decimal"],
  "+": ["operator", "+"],
  "-": ["operator", "-"],
  "*": ["operator", "*"],
  "/": ["operator", "/"],
  "=": ["equals"],
  Enter: ["equals"],
  Backspace: ["backspace"],
  Escape: ["clear"],
};

const state = {
  current: "0",
  previous: null,
  operator: null,
  overwrite: false,
};

// ---------- pure helpers ----------

function compute(a, b, operator) {
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? null : a / b;
    default: return b;
  }
}

function formatNumber(value) {
  return String(Number(value.toPrecision(12)));
}

// ---------- state updates ----------

function reset() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
}

function inputDigit(digit) {
  if (state.current === ERROR) reset();
  if (state.overwrite || state.current === "0") {
    state.current = digit;
    state.overwrite = false;
  } else if (state.current.length < MAX_LENGTH) {
    state.current += digit;
  }
}

function inputDecimal() {
  if (state.current === ERROR) reset();
  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
  } else if (!state.current.includes(".")) {
    state.current += ".";
  }
}

function backspace() {
  if (state.overwrite || state.current === ERROR) return;
  state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
  if (state.current === "-") state.current = "0";
}

function toggleSign() {
  if (state.current === ERROR || state.current === "0") return;
  state.current = state.current.startsWith("-") ? state.current.slice(1) : "-" + state.current;
}

function evaluate() {
  if (state.operator === null || state.previous === null) return;
  const result = compute(Number(state.previous), Number(state.current), state.operator);
  if (result === null) {
    reset();
    state.current = ERROR;
    state.overwrite = true;
    return;
  }
  state.current = formatNumber(result);
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
}

function chooseOperator(nextOperator) {
  if (state.current === ERROR) return;
  if (state.operator && !state.overwrite) evaluate();
  if (state.current === ERROR) return;
  state.previous = state.current;
  state.operator = nextOperator;
  state.overwrite = true;
}

// ---------- rendering ----------

function render() {
  display.textContent = state.current;
  expression.textContent =
    state.operator && state.previous !== null
      ? state.previous + " " + SYMBOLS[state.operator]
      : "";
}

// ---------- events ----------

function handleAction(action, value) {
  switch (action) {
    case "digit": inputDigit(value); break;
    case "decimal": inputDecimal(); break;
    case "operator": chooseOperator(value); break;
    case "equals": evaluate(); break;
    case "backspace": backspace(); break;
    case "sign": toggleSign(); break;
    case "clear": reset(); break;
    default: return;
  }
  render();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const mapped = KEY_MAP[event.key] ?? (/^[0-9]$/.test(event.key) ? ["digit", event.key] : null);
  if (!mapped) return;
  event.preventDefault();
  handleAction(...mapped);
});

render();`,
    },
  ],
  decisions: [
    {
      title: "No eval, explicit state machine",
      text: "`eval` would execute any string as code, a security risk, and it would also accept invalid input like `2++3`. A small state object with explicit transitions is safer and easier to debug.",
    },
    {
      title: "The current number is stored as a string",
      text: "While typing, `\"0.\"` and `\"0.50\"` are meaningful to the user but would be lost as numbers. We convert with `Number()` only at the moment of calculation.",
    },
    {
      title: "Rounding with `toPrecision(12)`",
      text: "JavaScript numbers are binary floating point, so `0.1 + 0.2` is not exactly `0.3`. Rounding the *display* to 12 significant digits hides that noise without affecting normal results.",
    },
    {
      title: "One `handleAction` for mouse and keyboard",
      text: "Both input methods funnel into the same function, so a bug fix applies to both and the behaviour cannot diverge.",
    },
    {
      title: "Ignoring modifier shortcuts",
      text: "The `keydown` handler returns early when Ctrl/Cmd/Alt is held, so browser shortcuts such as Ctrl+R still work.",
    },
  ],
  testingChecklist: [
    "`2 + 3 =` shows `5`; `2 + 3 + 4 =` shows `9` (chaining).",
    "`0.1 + 0.2 =` shows `0.3`, and `1 . . 5` produces `1.5` (only one decimal point).",
    "`8 ÷ 0 =` shows “Cannot divide by zero”, and typing a digit afterwards starts a fresh number.",
    "After `=`, typing a digit starts a new number instead of appending to the result.",
    "Pressing `+` then `×` uses multiplication (the last operator wins).",
    "`⌫` removes the last digit and never leaves the display empty.",
    "All actions work using only the keyboard; `Tab` moves focus visibly between buttons.",
    "With a screen reader (VoiceOver/NVDA), the result is announced after `=`.",
  ],
  extensions: [
    "Add a percentage key that converts the current number (`50 %` → `0.5`) and works in `200 + 10 %`.",
    "Keep a history panel of the last 10 calculations, and let the user click one to reuse its result.",
    "Move `compute`, `formatNumber` and the state transitions into an ES module and write unit tests for them.",
    "Support pressing `=` repeatedly to repeat the last operation (`2 + 3 = = =` → 11).",
  ],
};

import type { Project } from "@/content/types";

export const todoList: Project = {
  id: "proj-todo-list",
  slug: "todo-list",
  order: 3,
  title: "To-Do List",
  summary:
    "A to-do app with add, complete, delete, filters, a remaining-items counter and `localStorage` persistence, built with event delegation and a single render function.",
  difficulty: "beginner",
  tech: ["javascript", "dom"],
  hours: 4,
  relatedLessons: [
    "dom-creating-removing",
    "dom-event-delegation",
    "dom-forms-validation",
    "dom-local-session-storage",
    "arrays-filter",
    "arrays-map",
    "arrays-find-findindex",
    "async-json",
    "objects-arrays-of-objects",
  ],
  intro: [
    {
      kind: "paragraph",
      text: "The to-do list is the “hello world” of interactive apps for a reason: it covers creating, reading, updating and deleting data (CRUD), rendering lists, and saving data between visits.",
    },
    {
      kind: "paragraph",
      text: "You will store the tasks as an **array of objects** and treat the DOM as a picture of that array. Every change follows the same loop: *update the array → save → render*.",
    },
    {
      kind: "diagram",
      title: "The update loop",
      variant: "flow",
      steps: [
        { label: "User action", detail: "submit, checkbox change, delete click" },
        { label: "Update state", detail: "replace the todos array" },
        { label: "Persist", detail: "JSON.stringify → localStorage" },
        { label: "Render", detail: "rebuild the list from state" },
      ],
    },
  ],
  requirements: [
    "Users can add a task with a text field; empty or whitespace-only tasks are rejected with a message.",
    "Each task has a labelled checkbox to mark it complete and a delete button with an accessible name.",
    "Filter buttons show All, Active or Completed tasks, and indicate the active filter with `aria-pressed`.",
    "A counter shows how many tasks are left (“1 item left” / “3 items left”).",
    "A “Clear completed” button removes all completed tasks.",
    "Tasks and the selected filter survive a page reload (`localStorage`).",
    "Task text is rendered with `textContent`, never `innerHTML`, so user input can't inject HTML.",
  ],
  userStories: [
    "As a busy person I want to jot down a task quickly so that I don't forget it.",
    "As a user I want to tick off finished tasks so that I can see my progress.",
    "As a user I want to show only active tasks so that I can focus on what's left.",
    "As a returning user I want my list to still be there tomorrow so that I can keep using it.",
  ],
  skills: [
    "Arrays of objects as application state",
    "Immutable updates with `map`, `filter` and spread",
    "Creating elements with `createElement` and `textContent`",
    "Event delegation with `closest` and `data-id`",
    "`localStorage` with `JSON.stringify` / `JSON.parse` and error handling",
    "Accessible names for icon buttons and toggle buttons",
  ],
  steps: [
    {
      id: "state-shape",
      title: "Step 1 — Decide the shape of your data",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** each task is an object `{ id, text, done }`, and the app state is `{ todos, filter }`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** a stable `id` lets you find a task even after the list is filtered or reordered. Array indexes change when items are removed, so they are not safe identifiers.",
        },
        {
          kind: "code",
          language: "js",
          code: `const state = {
  todos: [
    { id: "a1", text: "Buy milk", done: false },
    { id: "b2", text: "Book dentist", done: true },
  ],
  filter: "all", // "all" | "active" | "completed"
};

const createId = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);`,
        },
      ],
    },
    {
      id: "add",
      title: "Step 2 — Add tasks from a form",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** listen for the form's `submit` event, trim the text, reject empty input, then create a *new* array that includes the new task.",
        },
        {
          kind: "paragraph",
          text: "**Why:** building a new array (`[...old, item]`) instead of mutating keeps updates predictable and is exactly what React will require later.",
        },
        {
          kind: "code",
          language: "js",
          code: `form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    announce("Please type a task first.");
    input.focus();
    return;
  }
  setState({ todos: [...state.todos, { id: createId(), text, done: false }] });
  form.reset();
  input.focus();
});`,
        },
      ],
    },
    {
      id: "render",
      title: "Step 3 — Render the list safely",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** clear the `<ul>` and create one `<li>` per visible task with `createElement`. Put user text in with `textContent`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** `innerHTML` with user text is a cross-site scripting (XSS) risk: a task called `<img src=x onerror=alert(1)>` would run code. `textContent` always treats text as text.",
        },
        {
          kind: "code",
          language: "js",
          code: `function createTodoItem(todo) {
  const li = document.createElement("li");
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = \`todo-\${todo.id}\`;
  checkbox.checked = todo.done;

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = todo.text;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.dataset.action = "delete";
  remove.setAttribute("aria-label", \`Delete "\${todo.text}"\`);
  remove.textContent = "✕";

  li.append(checkbox, label, remove);
  return li;
}`,
        },
      ],
    },
    {
      id: "delegation",
      title: "Step 4 — Toggle and delete with event delegation",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** attach **one** `change` listener and **one** `click` listener to the `<ul>`, then use `closest(\"li\")` to find which task was used.",
        },
        {
          kind: "paragraph",
          text: "**Why:** list items are recreated on every render. Listeners attached to individual items would be lost (or duplicated); a listener on the stable parent keeps working.",
        },
        {
          kind: "code",
          language: "js",
          code: `list.addEventListener("change", (event) => {
  if (event.target.type !== "checkbox") return;
  const id = event.target.closest("li").dataset.id;
  setState({
    todos: state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  });
});

list.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;
  const id = button.closest("li").dataset.id;
  setState({ todos: state.todos.filter((t) => t.id !== id) });
});`,
        },
      ],
    },
    {
      id: "persist",
      title: "Step 5 — Persist to localStorage",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** save the state as JSON on every change, and load it on start-up with a `try/catch`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** `localStorage` only stores strings. Stored data can also be corrupted or blocked (private mode, full quota), so loading must never crash the app.",
        },
        {
          kind: "code",
          language: "js",
          code: `const STORAGE_KEY = "todo-app:v1";

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.todos)) return saved;
  } catch {
    // corrupted JSON or storage disabled: fall back to defaults
  }
  return { todos: [], filter: "all" };
}

function setState(patch) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    announce("Could not save your tasks in this browser.");
  }
  render();
}`,
        },
        {
          kind: "callout",
          tone: "tip",
          text: "Putting a version in the key (`todo-app:v1`) lets you change the data shape later and migrate or ignore old data safely.",
        },
      ],
    },
    {
      id: "filters",
      title: "Step 6 — Filters and the counter",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** derive the visible list and the count from `state` during render. Mark the selected filter button with `aria-pressed=\"true\"`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** the filtered list is *derived data*. Don't store it; compute it, so it can never be stale.",
        },
        {
          kind: "code",
          language: "js",
          code: `const FILTERS = {
  all: () => true,
  active: (t) => !t.done,
  completed: (t) => t.done,
};

const visible = state.todos.filter(FILTERS[state.filter]);
const left = state.todos.filter((t) => !t.done).length;
counter.textContent = \`\${left} \${left === 1 ? "item" : "items"} left\`;`,
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
    <title>To-Do List</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="app">
      <h1>To-do</h1>
      <form id="todo-form">
        <label for="todo-input">New task</label>
        <input id="todo-input" autocomplete="off" />
        <button type="submit">Add</button>
      </form>
      <ul id="todo-list"></ul>
      <!-- TODO: footer with counter, filter buttons and "Clear completed" -->
      <p id="announcer" class="visually-hidden" aria-live="polite"></p>
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    },
    {
      filename: "styles.css",
      language: "css",
      code: `body { font-family: system-ui, sans-serif; background: #f1f5f9; margin: 0; }
.app { width: min(560px, 92vw); margin: 3rem auto; padding: 1.5rem; background: white; border-radius: 1rem; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const STORAGE_KEY = "todo-app:v1";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const announcer = document.querySelector("#announcer");

let state = { todos: [], filter: "all" };

function setState(patch) {
  // TODO: merge patch into state, save to localStorage, render
}

function render() {
  // TODO: rebuild the list from state.todos
}

// TODO: submit handler, list change/click handlers, filters

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
    <title>To-Do List</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="app">
      <h1>To-do</h1>

      <form id="todo-form" class="todo-form">
        <label for="todo-input">New task</label>
        <div class="row">
          <input id="todo-input" name="text" autocomplete="off" maxlength="200" placeholder="e.g. Buy milk" />
          <button type="submit">Add</button>
        </div>
      </form>

      <ul id="todo-list" class="todo-list" aria-label="Tasks"></ul>
      <p id="empty" class="empty" hidden>Nothing to show here.</p>

      <footer class="footer">
        <span id="counter" aria-live="polite"></span>
        <div class="filters" role="group" aria-label="Filter tasks">
          <button type="button" data-filter="all">All</button>
          <button type="button" data-filter="active">Active</button>
          <button type="button" data-filter="completed">Completed</button>
        </div>
        <button type="button" id="clear-completed">Clear completed</button>
      </footer>

      <p id="announcer" class="visually-hidden" aria-live="polite"></p>
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    },
    {
      filename: "styles.css",
      language: "css",
      code: `* { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f1f5f9; margin: 0; color: #0f172a; }
.app { width: min(560px, 92vw); margin: 3rem auto; padding: 1.5rem; background: white; border-radius: 1rem; box-shadow: 0 4px 20px rgb(0 0 0 / 0.06); }

.todo-form label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
.row { display: flex; gap: 0.5rem; }
.row input { flex: 1; padding: 0.6rem; font-size: 1rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }

button { padding: 0.5rem 0.9rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: white; cursor: pointer; font: inherit; }
button[type="submit"] { background: #2563eb; color: white; border-color: #2563eb; }
button:focus-visible, input:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }

.todo-list { list-style: none; padding: 0; margin: 1rem 0; }
.todo-list li { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #e2e8f0; }
.todo-list label { flex: 1; overflow-wrap: anywhere; }
.todo-list li.done label { text-decoration: line-through; color: #64748b; }
.todo-list input[type="checkbox"] { width: 1.2rem; height: 1.2rem; }
.delete { border: 0; color: #b91c1c; font-size: 1rem; }

.empty { color: #64748b; text-align: center; }

.footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.9rem; }
.filters { display: flex; gap: 0.25rem; }
.filters button[aria-pressed="true"] { background: #0f172a; color: white; border-color: #0f172a; }

.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const STORAGE_KEY = "todo-app:v1";
const FILTERS = {
  all: () => true,
  active: (todo) => !todo.done,
  completed: (todo) => todo.done,
};

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const empty = document.querySelector("#empty");
const counter = document.querySelector("#counter");
const filterButtons = document.querySelectorAll("[data-filter]");
const clearCompletedButton = document.querySelector("#clear-completed");
const announcer = document.querySelector("#announcer");

const createId = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);

// ---------- state ----------

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.todos)) {
      return { todos: saved.todos, filter: FILTERS[saved.filter] ? saved.filter : "all" };
    }
  } catch {
    // Corrupted JSON or storage disabled: start fresh.
  }
  return { todos: [], filter: "all" };
}

let state = loadState();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    announce("Could not save your tasks in this browser.");
  }
}

function setState(patch) {
  state = { ...state, ...patch };
  save();
  render();
}

function announce(text) {
  announcer.textContent = text;
}

// ---------- rendering ----------

function createTodoItem(todo) {
  const li = document.createElement("li");
  li.dataset.id = todo.id;
  li.classList.toggle("done", todo.done);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = \`todo-\${todo.id}\`;
  checkbox.checked = todo.done;

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = todo.text;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.dataset.action = "delete";
  remove.setAttribute("aria-label", \`Delete "\${todo.text}"\`);
  remove.textContent = "✕";

  li.append(checkbox, label, remove);
  return li;
}

function render() {
  const visible = state.todos.filter(FILTERS[state.filter]);
  list.replaceChildren(...visible.map(createTodoItem));
  empty.hidden = visible.length > 0;

  const left = state.todos.filter((todo) => !todo.done).length;
  counter.textContent = \`\${left} \${left === 1 ? "item" : "items"} left\`;

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === state.filter));
  });
  clearCompletedButton.disabled = !state.todos.some((todo) => todo.done);
}

// ---------- events ----------

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    announce("Please type a task first.");
    input.focus();
    return;
  }
  setState({ todos: [...state.todos, { id: createId(), text, done: false }] });
  announce(\`Added "\${text}".\`);
  form.reset();
  input.focus();
});

list.addEventListener("change", (event) => {
  if (event.target.type !== "checkbox") return;
  const id = event.target.closest("li").dataset.id;
  setState({
    todos: state.todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
  });
  // render() replaced the checkbox, so restore focus to the new one.
  document.getElementById(\`todo-\${id}\`)?.focus();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;
  const id = button.closest("li").dataset.id;
  const removed = state.todos.find((todo) => todo.id === id);
  setState({ todos: state.todos.filter((todo) => todo.id !== id) });
  announce(\`Deleted "\${removed.text}".\`);
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setState({ filter: button.dataset.filter }));
});

clearCompletedButton.addEventListener("click", () => {
  const count = state.todos.filter((todo) => todo.done).length;
  setState({ todos: state.todos.filter((todo) => !todo.done) });
  announce(\`Cleared \${count} completed \${count === 1 ? "task" : "tasks"}.\`);
});

render();`,
    },
  ],
  decisions: [
    {
      title: "Re-render the whole list",
      text: "Rebuilding the list on every change is simple and fast enough for hundreds of items. It removes a whole class of bugs where the DOM and the data disagree. React automates the same idea efficiently with reconciliation.",
    },
    {
      title: "Event delegation on the `<ul>`",
      text: "Because items are recreated on each render, listeners live on the stable parent. `closest(\"li\").dataset.id` identifies the task.",
    },
    {
      title: "`textContent` for user input",
      text: "User-provided text is never parsed as HTML, which prevents XSS.",
    },
    {
      title: "Restoring focus after re-render",
      text: "Replacing the list destroys the focused checkbox. We focus its replacement (or the input after deletion) so keyboard users don't get thrown to the top of the page.",
    },
    {
      title: "Defensive `loadState`",
      text: "Saved data is validated (`Array.isArray`) and parsing is wrapped in `try/catch`, so a corrupted value can't break the app on start-up.",
    },
  ],
  testingChecklist: [
    "Adding an empty or whitespace-only task shows a message and adds nothing.",
    "Adding a task called `<b>bold</b>` displays those characters literally (no bold text).",
    "Ticking a checkbox strikes the task through and updates “items left”; the counter says “1 item left” in the singular.",
    "Each filter shows the right tasks and the active filter button has `aria-pressed=\"true\"` (check in DevTools).",
    "“Clear completed” removes only completed tasks and is disabled when there are none.",
    "Reloading the page keeps tasks and the selected filter.",
    "Set `localStorage[\"todo-app:v1\"] = \"{broken\"` in the console and reload: the app starts empty instead of crashing.",
    "The whole app is usable with only `Tab`, `Space` and `Enter`.",
  ],
  extensions: [
    "Double-click (or press an Edit button) to edit a task inline; `Enter` saves, `Escape` cancels.",
    "Add due dates and sort tasks by date, highlighting overdue tasks.",
    "Sync the selected filter with the URL hash (`#/active`) so it can be bookmarked.",
    "Add drag-and-drop reordering, plus keyboard-accessible “Move up/down” buttons.",
  ],
};

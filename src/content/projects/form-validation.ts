import type { Project } from "@/content/types";

export const formValidation: Project = {
  id: "proj-form-validation",
  slug: "form-validation",
  order: 4,
  title: "Accessible Sign-Up Form Validation",
  summary:
    "Validate a sign-up form with clear, accessible inline errors: validate on blur and on submit, link messages with `aria-describedby`, mark fields with `aria-invalid`, and focus the first problem.",
  difficulty: "beginner",
  tech: ["javascript", "dom"],
  hours: 4,
  relatedLessons: [
    "dom-forms-validation",
    "dom-event-listeners",
    "dom-event-objects",
    "dom-classes-styles",
    "functions-pure-functions",
    "functions-higher-order",
    "objects-keys-values-entries",
    "variables-strings",
  ],
  intro: [
    {
      kind: "paragraph",
      text: "Forms are where users and businesses meet: sign-ups, checkouts, address entry. A bad validation experience (errors that appear too early, vague messages, or errors a screen reader never announces) directly costs customers.",
    },
    {
      kind: "paragraph",
      text: "In this project you will build validation that is **helpful** (specific messages), **well-timed** (after the user leaves a field, not on the first keystroke) and **accessible** (messages linked to fields and announced). You will also keep the rules in plain functions so they are easy to test.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Client-side validation is for UX",
      text: "Anyone can bypass browser JavaScript. A real server must validate again. Client-side validation exists to give fast, friendly feedback.",
    },
  ],
  requirements: [
    "Fields: full name (required, 2+ characters), email (required, valid format), password (8+ characters with a number and an uppercase letter), confirm password (must match), and a required terms checkbox.",
    "A field is validated when it loses focus (`blur`); once it has shown an error, it re-validates as the user types so the error disappears as soon as it's fixed.",
    "On submit, every field is validated; if any are invalid, the first invalid field receives focus and a summary is announced.",
    "Each error message is linked to its field with `aria-describedby`, and invalid fields have `aria-invalid=\"true\"`.",
    "On success, the form shows a confirmation message and resets.",
    "Validation rules live in pure functions that take values and return an error string (or an empty string).",
  ],
  userStories: [
    "As a new customer I want to know exactly what's wrong with my password so that I can fix it in one attempt.",
    "As a screen-reader user I want errors read out with the field they belong to so that I can find and fix them.",
    "As a user I don't want to see red errors while I'm still typing my email so that the form doesn't feel hostile.",
    "As a keyboard user I want focus to jump to the first error after submitting so that I don't have to search for it.",
  ],
  skills: [
    "The Constraint Validation API (`input.validity`)",
    "`blur`, `input` and `submit` events",
    "Data-driven validation with a rules object",
    "ARIA attributes: `aria-invalid`, `aria-describedby`, `aria-live`",
    "Focus management",
    "`FormData` and `Object.fromEntries`",
  ],
  steps: [
    {
      id: "markup",
      title: "Step 1 — Accessible markup first",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** each field gets a visible `<label>`, an optional hint, and an empty error element. The input points to the hint and error with `aria-describedby`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** when a screen-reader user focuses the field, they hear the label, the hint and the current error together. `novalidate` on the form turns off the browser's own bubbles so we control the messages, but we keep `required`, `type=\"email\"` and `autocomplete` for semantics and autofill.",
        },
        {
          kind: "code",
          language: "html",
          code: `<form id="signup" novalidate>
  <div class="field">
    <label for="password">Password</label>
    <p id="password-hint" class="hint">At least 8 characters, including a number and an uppercase letter.</p>
    <input id="password" name="password" type="password" autocomplete="new-password"
           required aria-describedby="password-hint password-error" />
    <p id="password-error" class="error"></p>
  </div>
</form>`,
        },
      ],
    },
    {
      id: "rules",
      title: "Step 2 — Write the rules as pure functions",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** a `validators` object maps each field name to a function `(value, allValues) => errorMessage`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** the confirm-password rule needs the other values, so every validator receives all of them. Because the functions don't touch the DOM, you can test them directly: `validators.password(\"abc\")`.",
        },
        {
          kind: "code",
          language: "js",
          code: `const validators = {
  fullName: (value) => {
    if (!value.trim()) return "Enter your full name.";
    if (value.trim().length < 2) return "Name must be at least 2 characters.";
    return "";
  },
  password: (value) => {
    if (!value) return "Create a password.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[0-9]/.test(value)) return "Password must include a number.";
    if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
    return "";
  },
  confirmPassword: (value, values) =>
    value === values.password ? "" : "Passwords do not match.",
};`,
        },
        {
          kind: "callout",
          tone: "tip",
          text: "For email, let the browser decide: `input.validity.typeMismatch` is `true` when a `type=\"email\"` field doesn't look like an email. Writing a “perfect” email regex is famously hard.",
        },
      ],
    },
    {
      id: "show-errors",
      title: "Step 3 — Show and clear errors in one place",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** a `setFieldError(input, message)` function updates the error text, `aria-invalid` and a CSS class.",
        },
        {
          kind: "paragraph",
          text: "**Why:** if three places set errors differently, one will forget `aria-invalid`. A single function keeps the visual and accessible state in sync.",
        },
        {
          kind: "code",
          language: "js",
          code: `function setFieldError(input, message) {
  const errorEl = document.getElementById(\`\${input.id}-error\`);
  errorEl.textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  input.closest(".field").classList.toggle("field--invalid", Boolean(message));
}`,
        },
      ],
    },
    {
      id: "timing",
      title: "Step 4 — Validate at the right time",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** validate on `blur` and remember the field was *touched*. On `input`, only re-validate fields that were touched.",
        },
        {
          kind: "paragraph",
          text: "**Why:** errors that appear on the first keystroke (“email invalid” after typing `a`) are frustrating. But once an error is shown, users want it to disappear the moment they fix it.",
        },
        {
          kind: "code",
          language: "js",
          code: `const touched = new Set();

form.addEventListener("focusout", (event) => {
  if (!(event.target.name in validators)) return;
  touched.add(event.target.name);
  validateField(event.target);
});

form.addEventListener("input", (event) => {
  const { name } = event.target;
  if (touched.has(name)) validateField(event.target);
  // Changing the password can fix or break the confirmation.
  if (name === "password" && touched.has("confirmPassword")) {
    validateField(form.elements.confirmPassword);
  }
});`,
        },
        {
          kind: "callout",
          tone: "info",
          text: "`focusout` is used instead of `blur` because `blur` does not bubble. `focusout` does, so one listener on the form covers every field (event delegation).",
        },
      ],
    },
    {
      id: "submit",
      title: "Step 5 — Validate everything on submit",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** on submit, validate every field, count the errors, announce a summary and focus the first invalid field. If everything passes, read the values with `FormData`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** users who never focused a field must still see its error. Focusing the first problem saves keyboard users from hunting.",
        },
        {
          kind: "code",
          language: "js",
          code: `form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = Object.keys(validators).map((name) => form.elements[name]);
  const invalid = fields.filter((input) => !validateField(input));

  if (invalid.length) {
    fields.forEach((input) => touched.add(input.name));
    status.textContent = \`Please fix \${invalid.length} \${invalid.length === 1 ? "error" : "errors"}.\`;
    invalid[0].focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  console.log("Ready to send", { ...data, password: "[hidden]", confirmPassword: "[hidden]" });
});`,
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
    <title>Sign up</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="card">
      <h1>Create your account</h1>
      <form id="signup" novalidate>
        <div class="field">
          <label for="fullName">Full name</label>
          <input id="fullName" name="fullName" autocomplete="name" required aria-describedby="fullName-error" />
          <p id="fullName-error" class="error"></p>
        </div>
        <!-- TODO: email, password (+ hint), confirmPassword, terms checkbox -->
        <button type="submit">Create account</button>
      </form>
      <p id="status" role="status" aria-live="polite"></p>
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    },
    {
      filename: "styles.css",
      language: "css",
      code: `body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; }
.card { width: min(460px, 92vw); margin: 3rem auto; padding: 1.5rem; background: white; border-radius: 1rem; }
.field { margin-bottom: 1rem; }
.error { color: #b91c1c; min-height: 1.2em; margin: 0.25rem 0 0; }`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const form = document.querySelector("#signup");
const statusEl = document.querySelector("#status");

const validators = {
  fullName: (value) => {
    // TODO
    return "";
  },
  // TODO: email, password, confirmPassword, terms
};

function setFieldError(input, message) {
  // TODO: update error text, aria-invalid and a CSS class
}

function validateField(input) {
  // TODO: run the matching validator, show the error, return true when valid
}

// TODO: focusout, input and submit listeners`,
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
    <title>Sign up</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="card">
      <h1>Create your account</h1>
      <p class="hint">All fields are required.</p>

      <form id="signup" novalidate>
        <div class="field">
          <label for="fullName">Full name</label>
          <input id="fullName" name="fullName" autocomplete="name" required aria-describedby="fullName-error" />
          <p id="fullName-error" class="error"></p>
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-error" />
          <p id="email-error" class="error"></p>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <p id="password-hint" class="hint">At least 8 characters, including a number and an uppercase letter.</p>
          <input id="password" name="password" type="password" autocomplete="new-password" required
                 aria-describedby="password-hint password-error" />
          <p id="password-error" class="error"></p>
        </div>

        <div class="field">
          <label for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required
                 aria-describedby="confirmPassword-error" />
          <p id="confirmPassword-error" class="error"></p>
        </div>

        <div class="field field--checkbox">
          <input id="terms" name="terms" type="checkbox" required aria-describedby="terms-error" />
          <label for="terms">I agree to the terms of service</label>
          <p id="terms-error" class="error"></p>
        </div>

        <button type="submit">Create account</button>
      </form>

      <p id="status" class="status" role="status" aria-live="polite"></p>
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    },
    {
      filename: "styles.css",
      language: "css",
      code: `* { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f8fafc; margin: 0; color: #0f172a; }
.card { width: min(460px, 92vw); margin: 3rem auto; padding: 1.5rem; background: white; border-radius: 1rem; box-shadow: 0 4px 20px rgb(0 0 0 / 0.06); }

.field { margin-bottom: 1rem; }
.field label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
.field input:not([type="checkbox"]) { width: 100%; padding: 0.6rem; font-size: 1rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }
.field--invalid input { border-color: #b91c1c; border-width: 2px; }

.field--checkbox { display: grid; grid-template-columns: auto 1fr; gap: 0.5rem; align-items: center; }
.field--checkbox label { font-weight: 400; margin: 0; }
.field--checkbox .error { grid-column: 1 / -1; }

.hint { color: #475569; font-size: 0.9rem; margin: 0 0 0.25rem; }
.error { color: #b91c1c; min-height: 1.2em; margin: 0.25rem 0 0; font-size: 0.9rem; }
.error:not(:empty)::before { content: "⚠ "; }

button { width: 100%; padding: 0.75rem; font-size: 1rem; border: 0; border-radius: 0.5rem; background: #2563eb; color: white; cursor: pointer; }
input:focus-visible, button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }

.status { font-weight: 600; }
.status--success { color: #15803d; }
.status--error { color: #b91c1c; }`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const form = document.querySelector("#signup");
const statusEl = document.querySelector("#status");

// ---------- rules (pure functions) ----------

const validators = {
  fullName: (value) => {
    if (!value.trim()) return "Enter your full name.";
    if (value.trim().length < 2) return "Name must be at least 2 characters.";
    return "";
  },
  email: (value, _values, input) => {
    if (!value.trim()) return "Enter your email address.";
    if (input?.validity.typeMismatch) return "Enter an email address like name@example.com.";
    return "";
  },
  password: (value) => {
    if (!value) return "Create a password.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[0-9]/.test(value)) return "Password must include a number.";
    if (!/[A-Z]/.test(value)) return "Password must include an uppercase letter.";
    return "";
  },
  confirmPassword: (value, values) => {
    if (!value) return "Confirm your password.";
    return value === values.password ? "" : "Passwords do not match.";
  },
  terms: (_value, _values, input) =>
    input?.checked ? "" : "You must accept the terms to continue.",
};

// ---------- DOM helpers ----------

const touched = new Set();

function currentValues() {
  return {
    fullName: form.elements.fullName.value,
    email: form.elements.email.value,
    password: form.elements.password.value,
    confirmPassword: form.elements.confirmPassword.value,
  };
}

function setFieldError(input, message) {
  const errorEl = document.getElementById(\`\${input.id}-error\`);
  errorEl.textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  input.closest(".field").classList.toggle("field--invalid", Boolean(message));
}

function validateField(input) {
  const validate = validators[input.name];
  if (!validate) return true;
  const message = validate(input.value, currentValues(), input);
  setFieldError(input, message);
  return message === "";
}

function setStatus(text, tone) {
  status.textContent = text;
  status.className = tone ? \`status status--\${tone}\` : "status";
}

// ---------- events ----------

form.addEventListener("focusout", (event) => {
  const input = event.target;
  if (!(input.name in validators)) return;
  // Don't nag about an untouched empty field the user just tabbed through.
  if (input.type !== "checkbox" && input.value === "" && !touched.has(input.name)) return;
  touched.add(input.name);
  validateField(input);
});

form.addEventListener("input", (event) => {
  const input = event.target;
  if (touched.has(input.name)) validateField(input);
  if (input.name === "password" && touched.has("confirmPassword")) {
    validateField(form.elements.confirmPassword);
  }
});

form.addEventListener("change", (event) => {
  if (event.target.type === "checkbox") {
    touched.add(event.target.name);
    validateField(event.target);
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const inputs = Object.keys(validators).map((name) => form.elements[name]);
  inputs.forEach((input) => touched.add(input.name));

  const invalid = inputs.filter((input) => !validateField(input));
  if (invalid.length) {
    setStatus(\`Please fix \${invalid.length} \${invalid.length === 1 ? "error" : "errors"} before continuing.\`, "error");
    invalid[0].focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  // Never log real passwords. In a real app you would POST this to your server.
  console.log("Ready to send", { ...data, password: "[hidden]", confirmPassword: "[hidden]" });

  setStatus(\`Welcome, \${data.fullName.trim()}! Your account has been created.\`, "success");
  form.reset();
  touched.clear();
  inputs.forEach((input) => setFieldError(input, ""));
});`,
    },
  ],
  decisions: [
    {
      title: "`novalidate` + Constraint Validation API",
      text: "We disable the browser's inconsistent bubbles but still use `validity.typeMismatch` for email, so we benefit from the browser's well-tested parsing without writing a fragile regex.",
    },
    {
      title: "Validate on blur, re-validate on input",
      text: "This “reward early, punish late” pattern avoids premature errors while letting errors vanish as soon as they're fixed.",
    },
    {
      title: "Errors stay in the DOM, empty when valid",
      text: "Error `<p>` elements always exist and are referenced by `aria-describedby`, so the relationship never breaks. Their `min-height` also prevents layout jumps.",
    },
    {
      title: "Rules receive all values",
      text: "Cross-field rules (confirm password) need more than one value. Passing `values` to every validator keeps the signature uniform.",
    },
    {
      title: "Server validation still required",
      text: "This code improves UX only. The server must re-check every rule, including uniqueness of the email, which the client can't know.",
    },
  ],
  testingChecklist: [
    "Tabbing through empty fields without typing does not show errors; submitting the empty form shows errors on every field and focuses “Full name”.",
    "Typing `ana@` then leaving the email field shows the format error; finishing it as `ana@example.com` removes the error while typing.",
    "Passwords `short`, `longpassword`, `longpassword1` each show the specific missing rule; `Longpassword1` passes.",
    "Changing the password after confirming it updates the “Passwords do not match” message.",
    "In DevTools, invalid inputs have `aria-invalid=\"true\"` and an `aria-describedby` pointing to a non-empty error.",
    "With a screen reader, focusing an invalid field reads the label, hint and error.",
    "A successful submit shows the welcome message, resets the form and clears all error styles.",
  ],
  extensions: [
    "Add a password-strength meter with an accessible text equivalent (“Strength: strong”).",
    "Add a “Show password” toggle button with `aria-pressed`.",
    "Simulate an async check (“email already registered”) with a `setTimeout`-based fake API and a loading state on the submit button.",
    "Show an error summary list at the top of the form with links that jump to each invalid field.",
  ],
};

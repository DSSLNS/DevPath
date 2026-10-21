import type { Project } from "@/content/types";

export const numberGuessingGame: Project = {
  id: "proj-number-guessing-game",
  slug: "number-guessing-game",
  order: 2,
  title: "Number Guessing Game",
  summary:
    "Guess a secret number between 1 and 100 in ten attempts. Practise random numbers, input validation, conditionals and accessible feedback messages.",
  difficulty: "beginner",
  tech: ["javascript", "dom"],
  hours: 2,
  relatedLessons: [
    "variables-numbers",
    "variables-type-conversion",
    "control-flow-if-else",
    "operators-comparison",
    "arrays-includes-indexof",
    "dom-forms-validation",
    "dom-updating-content",
    "functions-pure-functions",
  ],
  intro: [
    {
      kind: "paragraph",
      text: "The computer picks a whole number from 1 to 100. You guess, and the game tells you whether the secret is **higher** or **lower**. You have ten attempts.",
    },
    {
      kind: "paragraph",
      text: "Small as it is, the game covers a lot: generating random integers correctly, turning text input into numbers, rejecting bad input, comparing values, and managing a *game over* state. You will also make the feedback accessible, so screen-reader users hear every hint.",
    },
  ],
  requirements: [
    "A random integer from 1 to 100 (inclusive) is chosen when the game starts.",
    "The player submits guesses with a form (button click or `Enter`).",
    "Invalid input (empty, not a whole number, outside 1–100, or already guessed) shows an error and does not use up an attempt.",
    "After each valid guess the game says “Too low”, “Too high” or “Correct”, and shows the remaining attempts and previous guesses.",
    "The game ends on a correct guess or after 10 attempts; the input is disabled and a “Play again” button appears.",
    "Feedback is announced to assistive technology through a live region.",
  ],
  userStories: [
    "As a player I want a clear hint after every guess so that I can narrow down the number.",
    "As a player I want to see my previous guesses so that I don't waste attempts repeating them.",
    "As a player who mistypes I want my invalid input rejected without penalty so that the game feels fair.",
    "As a screen-reader user I want hints announced automatically so that I can play without looking for them.",
  ],
  skills: [
    "`Math.random` and `Math.floor` for inclusive integer ranges",
    "Form `submit` events and `preventDefault`",
    "Number parsing with `Number` and `Number.isInteger`",
    "Guard clauses and `if / else if / else`",
    "Separating pure game logic from DOM code",
    "Live regions and focus management",
  ],
  steps: [
    {
      id: "random-number",
      title: "Step 1 — Generate the secret number",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** write a `randomInt(min, max)` helper that returns a whole number where both `min` and `max` are possible.",
        },
        {
          kind: "paragraph",
          text: "**Why:** `Math.random()` returns a decimal from 0 (inclusive) up to but *not including* 1. Multiplying by the size of the range `(max - min + 1)` and flooring gives every integer an equal chance. Forgetting the `+ 1` means `max` can never be picked, a classic off-by-one bug.",
        },
        {
          kind: "code",
          language: "js",
          code: `function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}`,
        },
      ],
    },
    {
      id: "pure-logic",
      title: "Step 2 — Write the game rules as pure functions",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** two functions with no DOM access: `validateGuess` returns an error message (or an empty string), and `compareGuess` returns `\"low\"`, `\"high\"` or `\"correct\"`.",
        },
        {
          kind: "paragraph",
          text: "**Why:** you can test these in the console with any input, and the UI code stays short. If the rules change (say, 1–1000), you change them in one place.",
        },
        {
          kind: "code",
          language: "js",
          code: `function validateGuess(raw, previousGuesses) {
  if (raw.trim() === "") return "Please enter a number.";
  const guess = Number(raw);
  if (!Number.isInteger(guess)) return "Please enter a whole number.";
  if (guess < MIN || guess > MAX) return \`Your guess must be between \${MIN} and \${MAX}.\`;
  if (previousGuesses.includes(guess)) return \`You already guessed \${guess}.\`;
  return "";
}

function compareGuess(guess, secret) {
  if (guess === secret) return "correct";
  return guess < secret ? "low" : "high";
}`,
        },
        {
          kind: "callout",
          tone: "warning",
          text: "Input values are **always strings**. `\"50\" < 7` happens to work through coercion, but `\"50\" === 50` is `false`. Convert with `Number()` once, then compare numbers.",
        },
      ],
    },
    {
      id: "state",
      title: "Step 3 — Keep game state in one object",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** a `game` object holds the secret, the guesses so far and whether the game is over. `newGame()` resets it.",
        },
        {
          kind: "paragraph",
          text: "**Why:** remaining attempts can be *derived* from `guesses.length`, so you never store a second counter that could get out of sync.",
        },
        {
          kind: "code",
          language: "js",
          code: `const game = { secret: 0, guesses: [], over: false };

function newGame() {
  game.secret = randomInt(MIN, MAX);
  game.guesses = [];
  game.over = false;
}

const attemptsLeft = () => MAX_ATTEMPTS - game.guesses.length;`,
        },
      ],
    },
    {
      id: "form",
      title: "Step 4 — Handle the form submit",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** listen for `submit` on the form, call `preventDefault()`, validate, compare and update the message.",
        },
        {
          kind: "paragraph",
          text: "**Why:** listening to `submit` instead of the button's `click` means pressing `Enter` in the input works automatically. `preventDefault()` stops the browser from reloading the page.",
        },
        {
          kind: "code",
          language: "js",
          code: `form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (game.over) return;

  const error = validateGuess(input.value, game.guesses);
  if (error) {
    showMessage(error, "error");
    input.select();
    return;
  }

  const guess = Number(input.value);
  game.guesses.push(guess);
  const result = compareGuess(guess, game.secret);
  // …update the message based on result
});`,
        },
      ],
    },
    {
      id: "game-over",
      title: "Step 5 — End the game and offer a restart",
      blocks: [
        {
          kind: "paragraph",
          text: "**What:** when the guess is correct or no attempts remain, disable the input, reveal a “Play again” button and move focus to it.",
        },
        {
          kind: "paragraph",
          text: "**Why:** disabling the input prevents extra guesses. Moving focus to the new button tells keyboard and screen-reader users what they can do next.",
        },
        {
          kind: "code",
          language: "js",
          code: `function endGame(text, tone) {
  game.over = true;
  input.disabled = true;
  submitButton.disabled = true;
  showMessage(text, tone);
  restartButton.hidden = false;
  restartButton.focus();
}`,
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
    <title>Number Guessing Game</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="game">
      <h1>Guess the number</h1>
      <p>I'm thinking of a number between 1 and 100.</p>
      <form id="guess-form" novalidate>
        <label for="guess">Your guess</label>
        <input id="guess" type="number" min="1" max="100" step="1" inputmode="numeric" />
        <button type="submit">Guess</button>
      </form>
      <!-- TODO: add a live region for messages -->
      <!-- TODO: show attempts left and previous guesses -->
    </main>
    <script src="app.js"></script>
  </body>
</html>`,
    },
    {
      filename: "styles.css",
      language: "css",
      code: `body {
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #f8fafc;
}
.game {
  width: min(420px, 92vw);
  padding: 1.5rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.08);
}`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const MIN = 1;
const MAX = 100;
const MAX_ATTEMPTS = 10;

function randomInt(min, max) {
  // TODO: return an integer from min to max, inclusive
}

function validateGuess(raw, previousGuesses) {
  // TODO: return an error message string, or "" if the guess is valid
}

function compareGuess(guess, secret) {
  // TODO: return "low", "high" or "correct"
}

// TODO: create game state, handle form submit, end the game, restart`,
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
    <title>Number Guessing Game</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="game">
      <h1>Guess the number</h1>
      <p>I'm thinking of a number between 1 and 100. You have 10 attempts.</p>

      <form id="guess-form" class="guess-form" novalidate>
        <label for="guess">Your guess</label>
        <div class="row">
          <input id="guess" name="guess" type="number" min="1" max="100" step="1" inputmode="numeric" autocomplete="off" />
          <button id="submit" type="submit">Guess</button>
        </div>
      </form>

      <p id="message" class="message" role="status" aria-live="polite"></p>

      <dl class="stats">
        <div>
          <dt>Attempts left</dt>
          <dd id="attempts">10</dd>
        </div>
        <div>
          <dt>Previous guesses</dt>
          <dd id="history">None yet</dd>
        </div>
      </dl>

      <button id="restart" type="button" class="restart" hidden>Play again</button>
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
  font-family: system-ui, sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #f8fafc;
  color: #0f172a;
}

.game {
  width: min(420px, 92vw);
  padding: 1.5rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 4px 20px rgb(0 0 0 / 0.08);
}

.guess-form label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
.row { display: flex; gap: 0.5rem; }
.row input { flex: 1; padding: 0.6rem; font-size: 1rem; border: 1px solid #94a3b8; border-radius: 0.5rem; }

button {
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #2563eb;
  color: white;
  cursor: pointer;
}
button:disabled { background: #94a3b8; cursor: not-allowed; }
button:focus-visible, input:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }

.message { min-height: 1.5rem; font-weight: 600; }
.message--error { color: #b91c1c; }
.message--hint { color: #1d4ed8; }
.message--success { color: #15803d; }
.message--lost { color: #7c2d12; }

.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.stats dt { font-size: 0.85rem; color: #475569; }
.stats dd { margin: 0; font-weight: 600; }

.restart { margin-top: 1rem; width: 100%; background: #16a34a; }`,
    },
    {
      filename: "app.js",
      language: "js",
      code: `const MIN = 1;
const MAX = 100;
const MAX_ATTEMPTS = 10;

const form = document.querySelector("#guess-form");
const input = document.querySelector("#guess");
const submitButton = document.querySelector("#submit");
const message = document.querySelector("#message");
const attemptsEl = document.querySelector("#attempts");
const historyEl = document.querySelector("#history");
const restartButton = document.querySelector("#restart");

// ---------- pure logic ----------

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function validateGuess(raw, previousGuesses) {
  if (raw.trim() === "") return "Please enter a number.";
  const guess = Number(raw);
  if (!Number.isInteger(guess)) return "Please enter a whole number.";
  if (guess < MIN || guess > MAX) return \`Your guess must be between \${MIN} and \${MAX}.\`;
  if (previousGuesses.includes(guess)) return \`You already guessed \${guess}. Try a different number.\`;
  return "";
}

function compareGuess(guess, secret) {
  if (guess === secret) return "correct";
  return guess < secret ? "low" : "high";
}

// ---------- state ----------

const game = { secret: 0, guesses: [], over: false };
const attemptsLeft = () => MAX_ATTEMPTS - game.guesses.length;

// ---------- UI ----------

function showMessage(text, tone) {
  message.textContent = text;
  message.className = \`message message--\${tone}\`;
}

function renderStats() {
  attemptsEl.textContent = String(attemptsLeft());
  historyEl.textContent = game.guesses.length ? game.guesses.join(", ") : "None yet";
}

function endGame(text, tone) {
  game.over = true;
  input.disabled = true;
  submitButton.disabled = true;
  showMessage(text, tone);
  restartButton.hidden = false;
  restartButton.focus();
}

function newGame() {
  game.secret = randomInt(MIN, MAX);
  game.guesses = [];
  game.over = false;
  input.disabled = false;
  submitButton.disabled = false;
  input.value = "";
  restartButton.hidden = true;
  showMessage("", "hint");
  renderStats();
  input.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (game.over) return;

  const error = validateGuess(input.value, game.guesses);
  if (error) {
    showMessage(error, "error");
    input.select();
    return;
  }

  const guess = Number(input.value);
  game.guesses.push(guess);
  renderStats();
  const result = compareGuess(guess, game.secret);

  if (result === "correct") {
    const tries = game.guesses.length;
    endGame(\`Correct! \${guess} was the number. You got it in \${tries} \${tries === 1 ? "try" : "tries"}.\`, "success");
  } else if (attemptsLeft() === 0) {
    endGame(\`Out of attempts. The number was \${game.secret}.\`, "lost");
  } else {
    const direction = result === "low" ? "Too low" : "Too high";
    showMessage(\`\${direction}! \${attemptsLeft()} attempts left.\`, "hint");
    input.select();
  }
});

restartButton.addEventListener("click", newGame);

newGame();`,
    },
  ],
  decisions: [
    {
      title: "`novalidate` with custom validation",
      text: "Native browser bubbles look different in each browser and can't express “you already guessed 42”. We keep `type=\"number\"`, `min` and `max` for the mobile keyboard and semantics, but show our own messages in the live region.",
    },
    {
      title: "Derived state instead of counters",
      text: "Attempts left is computed from `guesses.length`. Storing a separate `attempts` variable creates two sources of truth that can disagree after a bug or a restart.",
    },
    {
      title: "Invalid guesses are free",
      text: "Validation runs *before* the guess is recorded, so a typo never costs an attempt. Fairness rules like this belong in requirements, and you should test them explicitly.",
    },
    {
      title: "Focus moves to “Play again”",
      text: "When the input becomes disabled it loses focus. Moving focus to the restart button keeps keyboard users oriented.",
    },
  ],
  testingChecklist: [
    "Temporarily `console.log(game.secret)` and verify that guessing it shows the success message.",
    "Submitting an empty field, `abc`, `3.5`, `0` and `101` shows an error and does not change “Attempts left”.",
    "Repeating a previous guess shows “You already guessed …”.",
    "After 10 wrong guesses the input is disabled and the secret number is revealed.",
    "“Play again” resets the history, the attempts and the message, and focuses the input.",
    "Pressing `Enter` in the input submits a guess.",
    "In the console, run `randomInt(1, 3)` many times and confirm you see 1, 2 and 3 (and never 0 or 4).",
  ],
  extensions: [
    "Add difficulty levels (1–10, 1–100, 1–1000) that also change the number of attempts.",
    "Store the best score (fewest tries) in `localStorage` and display it.",
    "Show a “warmer / colder” hint by comparing the distance of the current and previous guess.",
    "Move the pure functions into a module and write unit tests for `validateGuess` and `compareGuess`.",
  ],
};

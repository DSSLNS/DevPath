import type { KbNote } from "@/content/types";

export const cyType: KbNote = {
  id: "cy-type",
  slug: "cy-type",
  category: "cypress",
  title: ".type(): Typing Text and Special Keys",
  summary:
    "`.type(text)` types into inputs, textareas and contenteditable elements key by key, firing real keyboard events. Curly-brace sequences like `{enter}`, `{backspace}` and `{selectall}` send special keys; `delay` controls typing speed.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["type", "keyboard", "special keys", "delay", "forms"],
  prerequisites: ["`cy.get` with input selectors", "Keyboard events (keydown, input, keyup)"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "For each character Cypress fires `keydown`, `keypress`, `beforeinput`, `input` and `keyup`, just like a user. That means frameworks like React see controlled input changes, and search-as-you-type features trigger correctly.",
    },
    {
      kind: "table",
      headers: ["Sequence", "Effect"],
      rows: [
        ["`{enter}`", "Presses Enter (submits forms with a submit button)"],
        ["`{backspace}` / `{del}`", "Deletes one character left / right"],
        ["`{selectall}`", "Selects all text, so the next typing replaces it"],
        ["`{esc}`", "Escape, e.g. to close a dropdown"],
        ["`{uparrow}` / `{downarrow}`", "Arrow keys, e.g. navigate autocomplete suggestions"],
        ["`{moveToEnd}` / `{moveToStart}`", "Move the caret"],
        ["`{{}`", "Types a literal `{`"],
      ],
    },
    {
      kind: "list",
      items: [
        "`delay` (ms between keys, default 10). Use `{ delay: 0 }` for long text, a larger value to test debounced search.",
        "`{ log: false }` hides sensitive input (passwords) from the Command Log.",
        "`{ parseSpecialCharSequences: false }` types braces literally, useful for JSON input.",
        "Typing appends to existing text; use `.clear()` first or `{selectall}` to replace.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Modifier keys",
      text:
        "Cypress supports `{shift}`, `{ctrl}`, `{alt}` and `{meta}` modifiers inside type sequences, but these are simulated events, not OS-level key presses; browser shortcuts like Ctrl+T will not open a tab.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Forms",
      code:
        "cy.get('[data-cy=email]').type('shopper@example.com')\ncy.get('[data-cy=search]').type('running shoes{enter}')\ncy.get('[data-cy=qty]').type('{selectall}3')\ncy.get('[data-cy=promo]').type('SAVE10', { delay: 0 })\ncy.get('[data-cy=password]').type(Cypress.env('password'), { log: false })\ncy.get('[data-cy=notes]').type('{\"gift\": true}', { parseSpecialCharSequences: false })",
    },
  ],
  code: {
    title: "cypress/e2e/catalog/search-autocomplete.cy.js",
    language: "js",
    code:
      "describe('Search autocomplete', () => {\n  beforeEach(() => {\n    cy.intercept('GET', '/api/search/suggest*').as('suggest')\n    cy.visit('/')\n  })\n\n  it('selects a suggestion with the keyboard', () => {\n    cy.get('[data-cy=search-input]').type('jack', { delay: 50 })\n    cy.wait('@suggest').its('request.url').should('include', 'q=jack')\n\n    cy.get('[data-cy=suggestion]').should('have.length.at.least', 2)\n    cy.get('[data-cy=search-input]').type('{downarrow}{downarrow}{enter}')\n\n    cy.location('pathname').should('match', /^\\/products\\//)\n  })\n\n  it('submits a full search with Enter', () => {\n    cy.get('[data-cy=search-input]').type('rain jacket{enter}')\n    cy.location('search').should('include', 'q=rain+jacket')\n    cy.get('[data-cy=results-heading]').should('contain', 'rain jacket')\n  })\n\n  it('closes suggestions with Escape', () => {\n    cy.get('[data-cy=search-input]').type('boot')\n    cy.get('[data-cy=suggestions]').should('be.visible')\n    cy.get('[data-cy=search-input]').type('{esc}')\n    cy.get('[data-cy=suggestions]').should('not.exist')\n  })\n})",
  },
  walkthrough: [
    { line: "cy.get('[data-cy=search-input]').type('jack', { delay: 50 })", explanation: "Types slowly enough for a debounced search to behave as it does for a real user." },
    { line: "cy.wait('@suggest').its('request.url').should('include', 'q=jack')", explanation: "Waits for the suggestion request instead of a fixed time and checks the query sent." },
    { line: "cy.get('[data-cy=search-input]').type('{downarrow}{downarrow}{enter}')", explanation: "Moves to the second suggestion and chooses it with Enter, testing keyboard accessibility." },
    { line: "cy.location('search').should('include', 'q=rain+jacket')", explanation: "Asserts the form submission encoded the query into the URL." },
  ],
  whenToUse: [
    "Filling any text field: login, search, addresses, promo codes.",
    "Testing keyboard behaviour: Enter to submit, Escape to close, arrows to navigate.",
    "Testing debounced or as-you-type features (with a realistic `delay`).",
  ],
  mistakes: [
    "Typing into a field that already has text and getting `3` appended to `1` (`13`). Clear first.",
    "Logging real passwords; use `{ log: false }` and environment variables.",
    "Typing curly braces in JSON or code samples without `parseSpecialCharSequences: false`.",
    "Using `.type()` on a `<select>` or checkbox; use `.select()` / `.check()`.",
    "Typing into a disabled or readonly input and getting an actionability error; check why it is disabled.",
  ],
  debugging: [
    "Click the TYPE command in the log to see every key and the events fired for it in the console.",
    "If the app misses characters, it may re-render the input mid-typing; assert it is ready first or increase `delay`.",
    "If `{enter}` does not submit, check the form has a submit button or the app handles `keydown` for Enter.",
  ],
  relatedNotes: ["cy-clear", "cy-click"],
  relatedLessons: ["dom-forms-validation", "dom-event-listeners", "react-controlled-forms"],
  practice:
    "Test the promo code field: type `save10` in lowercase, press Enter, and assert the field is upper-cased to `SAVE10` and the order summary shows a 10% discount line.",
  docs: [{ title: ".type()", url: "https://docs.cypress.io/api/commands/type" }],
  versionNote: "Cypress 12+",
};

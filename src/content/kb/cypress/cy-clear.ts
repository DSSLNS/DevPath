import type { KbNote } from "@/content/types";

export const cyClear: KbNote = {
  id: "cy-clear",
  slug: "cy-clear",
  category: "cypress",
  title: ".clear(): Emptying Inputs",
  summary:
    "`.clear()` empties an input or textarea by selecting all text and deleting it, firing the same input events as a user. Combine it with `.type()` to replace pre-filled values like quantities or saved addresses.",
  tech: ["cypress", "javascript"],
  difficulty: "beginner",
  tags: ["clear", "forms", "inputs", "type"],
  prerequisites: ["`.type()` basics", "Controlled vs uncontrolled inputs (helpful for React apps)"],
  explanation: [
    {
      kind: "paragraph",
      text:
        "`.clear()` is an alias for `.type('{selectall}{backspace}')`. Because it types, it has the same actionability rules: the element must be visible, enabled and not readonly. It yields the same element, so you can chain `.type()` straight after.",
    },
    {
      kind: "list",
      items: [
        "Use it before typing into fields that may be pre-filled (profile forms, quantity inputs, saved addresses).",
        "Assert the result with `.should('have.value', '')`.",
        "Clearing fires `input` events, so validation like 'Email is required' should appear; test that behaviour.",
      ],
    },
    {
      kind: "callout",
      tone: "tip",
      title: "Number inputs",
      text:
        "For `<input type=\"number\">` with a minimum of 1, clearing may leave the app showing a validation error or resetting to 1. Assert what *your* app does rather than assuming.",
    },
  ],
  syntax: [
    {
      kind: "code",
      language: "js",
      title: "Usage",
      code:
        "cy.get('[data-cy=qty]').clear()\ncy.get('[data-cy=qty]').clear().type('3')\ncy.get('[data-cy=email]').clear().should('have.value', '')\ncy.get('[data-cy=notes]').clear({ force: true }) // avoid unless justified",
    },
  ],
  code: {
    title: "cypress/e2e/account/edit-profile.cy.js",
    language: "js",
    code:
      "describe('Edit profile', () => {\n  beforeEach(() => {\n    cy.login('shopper@example.com', 'Test1234!')\n    cy.intercept('PUT', '/api/profile').as('saveProfile')\n    cy.visit('/account/profile')\n  })\n\n  it('replaces the saved phone number', () => {\n    cy.get('[data-cy=phone]')\n      .should('have.value', '555-0100')\n      .clear()\n      .type('555-0199')\n\n    cy.contains('button', 'Save').click()\n    cy.wait('@saveProfile').its('request.body.phone').should('eq', '555-0199')\n    cy.contains('Profile updated').should('be.visible')\n  })\n\n  it('shows a required error when the name is cleared', () => {\n    cy.get('[data-cy=full-name]').clear().blur()\n    cy.get('[data-cy=full-name-error]').should('have.text', 'Name is required')\n    cy.contains('button', 'Save').should('be.disabled')\n  })\n})",
  },
  walkthrough: [
    { line: ".should('have.value', '555-0100')", explanation: "Confirms the form loaded the saved value before editing, so the test does not race the profile API." },
    { line: ".clear()\n      .type('555-0199')", explanation: "Replaces the value instead of appending to it." },
    { line: "cy.wait('@saveProfile').its('request.body.phone').should('eq', '555-0199')", explanation: "Verifies the cleared and re-typed value is what was actually sent to the server." },
    { line: "cy.get('[data-cy=full-name]').clear().blur()", explanation: "`.blur()` triggers on-blur validation, as when a user tabs away from an empty field." },
  ],
  whenToUse: [
    "Editing pre-filled forms (profile, address book, cart quantity).",
    "Testing required-field validation by emptying a field.",
  ],
  mistakes: [
    "Typing into a pre-filled field without clearing, producing `555-0100555-0199`.",
    "Clearing before the app has loaded the saved value; the app then fills it again after you cleared. Assert the initial value first.",
    "Using `.clear()` on a `<select>` or checkbox; it only works on text-like inputs and contenteditable.",
  ],
  debugging: [
    "If the field refills after clearing, look for an API response or re-render that resets form state; wait for that request first.",
    "Check the Command Log snapshot before and after CLEAR to confirm the value changed.",
  ],
  relatedNotes: ["cy-type", "cy-assertions"],
  relatedLessons: ["dom-forms-validation", "react-controlled-forms"],
  practice:
    "In the cart, clear the quantity of the first line item, type `5`, blur, and assert the line total and cart subtotal both update.",
  docs: [{ title: ".clear()", url: "https://docs.cypress.io/api/commands/clear" }],
  versionNote: "Cypress 12+",
};

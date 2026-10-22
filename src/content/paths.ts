import type { LearningPath, PathStep } from "@/content/types";
import { getTechnology } from "./technologies";

/**
 * Learning paths.
 *
 * The four career paths are ordered steps that reference shared courses (technologies), so the
 * same React or JavaScript lessons serve Frontend and Full Stack without being copied. Module and
 * technology lists are derived from the steps. The JavaScript tracks are the original module-based paths.
 */
function careerPath(path: Omit<LearningPath, "moduleIds" | "technologyIds"> & { steps: PathStep[] }): LearningPath {
  const technologyIds = [...new Set(path.steps.map((s) => s.techId))];
  for (const id of technologyIds) if (!getTechnology(id)) throw new Error(`Path ${path.id} references unknown technology "${id}"`);
  return { ...path, technologyIds, moduleIds: [...new Set(technologyIds.flatMap((id) => getTechnology(id)?.moduleIds ?? []))] };
}

const step = (id: string, title: string, techId: string, description: string, noteIds?: string[]): PathStep => ({ id, title, techId, description, noteIds });

export const frontendPath = careerPath({
  id: "frontend",
  title: "Frontend Development",
  description: "Learn how to build attractive, responsive, accessible user interfaces for websites and web applications.",
  accent: "frontend",
  sequence: "HTML → CSS → Responsive Design → JavaScript → Git → TypeScript → React → Tailwind CSS → Next.js → Frontend Testing → Projects",
  skills: [
    "Structure pages with semantic, accessible HTML",
    "Style and lay out responsive interfaces with CSS, Flexbox and Grid",
    "Add interactivity and fetch data with JavaScript",
    "Build component-based apps with React, TypeScript and Next.js",
    "Test, optimise and ship frontend code",
  ],
  prerequisites: "None. Start with HTML if you've never written code. If you already know some HTML and CSS, jump straight to JavaScript.",
  projectIds: ["proj-calculator", "proj-todo-list", "proj-form-validation", "proj-number-guessing-game"],
  steps: [
    step("html", "HTML", "html", "Document structure, text, links, media, tables and forms: the skeleton of every page."),
    step("css", "CSS", "css", "Selectors, the cascade, the box model, Flexbox and Grid."),
    step("responsive", "Responsive Web Design", "responsive-design", "Layouts that adapt from phones to large screens."),
    step("javascript", "JavaScript", "javascript", "Variables, functions, arrays, objects, the DOM, events and asynchronous code."),
    step("git", "Git", "git", "Version control: commits, branches and merging, so you can share and review code."),
    step("typescript", "TypeScript", "typescript", "Static types that catch mistakes early in larger codebases."),
    step("css-architecture", "CSS architecture and reusable styling", "css", "Organising CSS so it stays maintainable (taught in the CSS course's *Organizing Reusable CSS* lesson)."),
    step("react", "React", "react", "Components, JSX, props, state and events."),
    step("react-hooks", "React Hooks and state management", "react", "`useState`, `useEffect`, `useRef`, `useContext`, `useReducer` and custom hooks (in the React course)."),
    step("routing-forms", "Routing and forms", "react", "Controlled forms, lifting state and client-side routing (in the React course)."),
    step("tailwind", "Tailwind CSS", "tailwind", "Utility-first styling with responsive and state variants."),
    step("nextjs", "Next.js", "nextjs", "Routing, layouts, server rendering and data fetching on top of React."),
    step("api-integration", "Frontend API integration", "javascript", "Fetch, HTTP methods, JSON, loading and error states (JavaScript's Async and Networking modules)."),
    step("accessibility", "Accessibility", "accessibility", "Keyboard access, accessible names, ARIA basics and colour contrast."),
    step("performance", "Frontend performance optimization", "performance", "Core Web Vitals, images, fonts and the cost of JavaScript."),
    step("frontend-testing", "Frontend testing fundamentals", "js-testing", "Unit and component tests with assertions and mocks."),
  ],
});

export const backendPath = careerPath({
  id: "backend",
  title: "Backend Development",
  description: "Learn how servers, APIs, databases, authentication concepts, and business logic power web applications.",
  accent: "backend",
  sequence: "JavaScript → Node.js → HTTP and REST → Express.js → Postman → SQL/PostgreSQL or MongoDB → Database Integration → Backend Testing → Deployment",
  skills: [
    "Run JavaScript on the server with Node.js and npm",
    "Design and build REST APIs with Express.js",
    "Validate requests, handle errors and log what happens",
    "Store and query data with SQL databases or MongoDB",
    "Test, secure and deploy backend services",
  ],
  prerequisites: "Comfort with JavaScript fundamentals: variables, functions, arrays, objects and async code. The JavaScript course covers all of these.",
  projectIds: [],
  steps: [
    step("javascript", "JavaScript fundamentals for backend", "javascript", "Functions, objects, modules, promises and `async`/`await`: everything Node.js builds on."),
    step("nodejs", "Node.js", "nodejs", "The runtime, modules, the file system and asynchronous I/O."),
    step("npm", "npm and package management", "npm", "Installing, updating and auditing dependencies; package.json scripts."),
    step("http", "HTTP and REST API fundamentals", "http", "Requests, responses, methods, status codes and headers."),
    step("express", "Express.js", "express", "Creating a server and handling requests."),
    step("routing-middleware", "Routing and middleware", "express", "Route parameters, routers and the middleware chain (in the Express.js course)."),
    step("validation-errors", "Request validation and error handling", "express", "Rejecting bad input clearly and returning consistent errors (in the Express.js course)."),
    step("api-design", "API design", "rest-apis", "Resources, versioning, pagination and error formats clients can rely on."),
    step("postman", "Postman API testing", "api-testing", "Collections, environments and response checks for your endpoints."),
    step("sql", "SQL fundamentals", "sql", "SELECT, JOIN, GROUP BY and changing data."),
    step("postgresql", "PostgreSQL", "postgresql", "A production relational database: types, constraints, indexes and transactions."),
    step("mongodb", "MongoDB", "mongodb", "Document data modelling and queries, as an alternative to SQL."),
    step("db-integration", "Database integration", "prisma", "Connecting your API to a database with an ORM and migrations."),
    step("auth-concepts", "Authentication and authorization concepts", "auth", "How sessions, password hashing and roles work, taught as concepts for the apps *you* build."),
    step("security", "Backend security", "security", "Injection, XSS, CSRF, secure cookies and managing secrets."),
    step("logging-debugging", "Logging and debugging", "debugging", "Reading stack traces, structured logs and breakpoints."),
    step("backend-testing", "Backend testing", "js-testing", "Unit and integration tests for routes and business logic."),
    step("deployment", "Deployment", "deployment", "Builds, hosting, domains, HTTPS and rollbacks."),
    step("env-vars", "Environment variables", "env-vars", "Per-environment configuration that keeps secrets out of code."),
  ],
});

export const testingPath = careerPath({
  id: "testing",
  title: "Testing & Automation",
  description: "Learn how to validate web applications, test APIs, identify defects, and automate reliable end-to-end workflows.",
  accent: "testing",
  sequence: "Testing Fundamentals → Test Case Design → HTML/CSS/JavaScript Basics → HTTP and APIs → Postman → JavaScript Automation → Cypress or Playwright → CI/CD → Automation Projects",
  skills: [
    "Design test scenarios and cases, including negative and edge cases",
    "Test APIs with Postman and automated checks",
    "Write maintainable UI and end-to-end tests with Cypress and Playwright",
    "Use fixtures, network interception and stable assertions",
    "Run suites in CI and debug flaky tests",
  ],
  prerequisites: "None to start. Basic HTML, CSS and JavaScript are taught along the way, before automation.",
  projectIds: ["proj-form-validation", "proj-todo-list"],
  steps: [
    step("fundamentals", "Software testing fundamentals", "testing-fundamentals", "Why we test, test levels and the test pyramid.", ["e2e-test-pyramid", "e2e-what-is-e2e-testing"]),
    step("manual", "Manual testing", "manual-testing", "Exploratory testing, bug reports and regression checks."),
    step("cases", "Test scenarios and test cases", "testing-fundamentals", "Turning requirements into scenarios and step-by-step cases.", ["e2e-test-scenarios-and-cases"]),
    step("pos-neg-edge", "Positive, negative and edge-case testing", "manual-testing", "Boundary values, equivalence classes and invalid input."),
    step("html-css", "HTML and CSS for testers", "html", "Page structure and selectors, which every UI test depends on (HTML and CSS courses)."),
    step("javascript-basics", "JavaScript fundamentals for testers", "javascript", "Variables, functions, arrays, objects and async code: the language of Cypress and Playwright."),
    step("devtools", "Browser developer tools", "devtools", "Inspecting elements, the console and the network panel."),
    step("api-fundamentals", "API testing fundamentals", "http", "HTTP methods, status codes and headers from a tester's point of view."),
    step("postman", "Postman", "api-testing", "Collections, environments, positive and negative API checks."),
    step("js-automation", "JavaScript for test automation", "javascript", "Async/await, modules and data handling for automation code."),
    step("cypress", "Cypress", "cypress", "Commands, selectors, assertions and configuration.", ["cy-installation-config", "cy-get", "cy-assertions"]),
    step("playwright", "Playwright", "playwright", "Locators, auto-waiting, actions and assertions.", ["pw-fundamentals", "pw-locators", "pw-assertions"]),
    step("ui-automation", "UI automation", "e2e-testing", "Automating user journeys through the real interface.", ["e2e-test-architecture"]),
    step("e2e", "End-to-end testing", "e2e-testing", "Choosing scenarios and managing test data and environments.", ["e2e-test-data-management", "e2e-test-environments"]),
    step("fixtures", "Fixtures and reusable test utilities", "playwright", "Sharing setup and helpers across tests.", ["pw-fixtures", "pw-hooks-auth"]),
    step("network", "Network interception and mocking", "playwright", "Stubbing APIs and asserting on requests.", ["pw-network-interception", "pw-api-testing"]),
    step("assertions-isolation", "Assertions and test isolation", "e2e-testing", "Web-first assertions and independent tests.", ["e2e-assertions", "e2e-test-isolation"]),
    step("reporting", "Test reporting", "test-automation", "Readable reports, screenshots and traces."),
    step("cicd", "CI/CD integration", "cicd", "Running tests on every change."),
    step("framework", "Automation framework design", "test-automation", "Page objects, helpers and suite structure.", ["e2e-test-architecture"]),
    step("flaky", "Debugging flaky tests", "e2e-testing", "Finding and fixing timing and data problems.", ["e2e-flaky-tests", "e2e-debugging-failures"]),
  ],
});

export const fullstackPath = careerPath({
  id: "fullstack",
  title: "Full Stack Development",
  description: "Learn to build complete web applications by combining frontend interfaces, backend APIs, databases, and testing.",
  accent: "fullstack",
  sequence: "Web Fundamentals → JavaScript → TypeScript → React → Backend Fundamentals → Node.js and Express.js → Database → API Integration → Testing → Deployment",
  skills: [
    "Build interfaces with HTML, CSS, React and Tailwind CSS",
    "Build APIs with Node.js and Express.js backed by a database",
    "Connect frontend to backend with validation and error handling",
    "Test at unit, integration and end-to-end level",
    "Collaborate with Git and GitHub and deploy complete apps",
  ],
  prerequisites: "None. Full stack combines the Frontend and Backend paths. It reuses the same courses, so progress made in either path counts here too.",
  projectIds: ["proj-todo-list", "proj-form-validation"],
  steps: [
    step("html", "HTML", "html", "Page structure and forms."),
    step("css", "CSS", "css", "Styling and layout."),
    step("javascript", "JavaScript", "javascript", "The language used on both client and server."),
    step("typescript", "TypeScript", "typescript", "Shared types across frontend and backend."),
    step("react", "React", "react", "Component-based user interfaces."),
    step("tailwind", "Tailwind CSS", "tailwind", "Fast, consistent styling."),
    step("nextjs", "Next.js fundamentals", "nextjs", "Full-stack React with routing and server rendering."),
    step("nodejs", "Node.js", "nodejs", "JavaScript on the server."),
    step("express", "Express.js", "express", "Routes, middleware and controllers."),
    step("rest", "REST APIs", "rest-apis", "Designing the API your frontend calls."),
    step("database", "PostgreSQL or MongoDB", "postgresql", "Storing application data (the MongoDB course is an alternative)."),
    step("integration", "Frontend-to-backend integration", "javascript", "Fetch, JSON and loading and error states (JavaScript Networking module)."),
    step("validation", "Form validation", "html", "Built-in browser validation plus server-side checks (HTML forms lessons)."),
    step("errors", "Error handling", "express", "Consistent error responses and user-friendly messages."),
    step("security", "Security fundamentals", "security", "Protecting users and data across the stack."),
    step("testing", "Unit, integration and end-to-end testing", "js-testing", "Testing each layer, with E2E tests on top.", ["e2e-test-pyramid"]),
    step("git", "Git and GitHub", "github", "Branches, pull requests and code review."),
    step("deployment", "Deployment", "deployment", "Putting the whole stack online."),
  ],
});

/** The four primary career paths, in dashboard order. */
export const careerPaths: LearningPath[] = [frontendPath, backendPath, testingPath, fullstackPath];

export const learningPaths: LearningPath[] = [
  ...careerPaths,
  {
    id: "javascript",
    title: "JavaScript: Zero to Professional",
    description: "The full curriculum, from your first program to advanced JavaScript, TypeScript and React.",
    moduleIds: ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m08", "m09", "m10", "m11", "m12", "m13", "m14", "m15", "m16"],
  },
  {
    id: "qa-automation",
    title: "JavaScript for QA Automation",
    description: "The JavaScript a QA engineer needs for Cypress and Playwright, paired with the E2E knowledge base.",
    moduleIds: ["m01", "m02", "m03", "m04", "m05", "m06", "m07", "m10", "m11", "m12", "m14"],
  },
  {
    id: "react-ready",
    title: "Strong Foundations for React",
    description: "For React developers who want deeper JavaScript knowledge before (or alongside) React itself.",
    moduleIds: ["m05", "m06", "m07", "m08", "m09", "m11", "m15", "m16"],
  },
];

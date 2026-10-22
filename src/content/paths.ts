import type { LearningPath } from "@/content/types";
import { getTechnology } from "./technologies";

function careerPath(path: Omit<LearningPath, "moduleIds"> & { technologyIds: string[] }): LearningPath {
  return { ...path, moduleIds: path.technologyIds.flatMap((id) => getTechnology(id)?.moduleIds ?? []) };
}

export const learningPaths: LearningPath[] = [
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
  careerPath({
    id: "frontend-developer",
    title: "Become a Frontend Developer",
    description: "Build accessible, responsive and interactive interfaces, from your first HTML page to deployed React and Next.js apps.",
    technologyIds: ["html", "css", "javascript", "git", "typescript", "react", "nextjs", "js-testing", "deployment"],
    reasons: {
      html: "Every page starts as HTML. Semantic markup is the foundation for accessibility and SEO.",
      css: "Layout, spacing and responsive design turn markup into a usable interface.",
      javascript: "Interactivity, data handling and every frontend framework are built on JavaScript.",
      git: "Every team uses version control. You'll need it to share and review code.",
      typescript: "Most professional frontend codebases use TypeScript to catch mistakes early.",
      react: "The most widely used library for building component-based interfaces.",
      nextjs: "Adds routing, server rendering and data fetching on top of React.",
      "js-testing": "Tests let you change code with confidence.",
      deployment: "Ship your work so real users and employers can see it.",
    },
  }),
  careerPath({
    id: "backend-developer",
    title: "Become a Backend Developer",
    description: "Build secure APIs and services with Node.js, Express and databases.",
    technologyIds: ["javascript", "nodejs", "express", "http", "rest-apis", "sql", "mongodb", "auth", "api-testing", "deployment"],
    reasons: {
      javascript: "Node.js runs JavaScript, so solid language fundamentals come first.",
      nodejs: "The runtime for your server code: modules, files, environment and async I/O.",
      express: "A minimal, widely used framework for routes, middleware and APIs.",
      http: "Every API is HTTP underneath: methods, status codes, headers and caching.",
      "rest-apis": "Design APIs that clients can understand and rely on.",
      sql: "Most applications store their data in a relational database.",
      mongodb: "Document databases are common too. Learn when each model fits.",
      auth: "Protect user accounts and data correctly.",
      "api-testing": "Verify your endpoints, including the error cases.",
      deployment: "Run your service reliably in production.",
    },
  }),
  careerPath({
    id: "fullstack-developer",
    title: "Become a Full-Stack Developer",
    description: "Combine frontend and backend skills to build complete applications end to end.",
    technologyIds: ["html", "css", "javascript", "typescript", "react", "nodejs", "express", "sql", "auth", "js-testing", "deployment"],
    reasons: {
      html: "The structure of every interface you build.",
      css: "Styling and responsive layout.",
      javascript: "The language used on both the client and the server.",
      typescript: "Shared types between frontend and backend prevent whole classes of bugs.",
      react: "Build the user interface from components.",
      nodejs: "Run JavaScript on the server.",
      express: "Build the API your React app talks to.",
      sql: "Persist and query application data.",
      auth: "Sign users in and protect their data.",
      "js-testing": "Keep both halves of the app working as it grows.",
      deployment: "Put the whole stack online.",
    },
  }),
  careerPath({
    id: "test-automation-engineer",
    title: "Become a Test Automation Engineer",
    description: "Design and automate reliable tests for web applications and APIs.",
    technologyIds: ["testing-fundamentals", "html", "css", "javascript", "git", "api-testing", "cypress", "playwright", "cicd", "test-automation"],
    reasons: {
      "testing-fundamentals": "Know what to test and why before automating anything.",
      html: "Selectors and assertions depend on understanding page structure.",
      css: "Enough CSS to understand visibility, layout and selectors.",
      javascript: "Cypress and Playwright tests are written in JavaScript or TypeScript.",
      git: "Automation code lives in repositories and goes through code review.",
      "api-testing": "Fast, stable checks below the UI.",
      cypress: "A popular end-to-end framework with an interactive runner.",
      playwright: "Cross-browser automation with auto-waiting and tracing.",
      cicd: "Tests deliver value when they run on every change.",
      "test-automation": "Structure suites so they stay maintainable.",
    },
  }),
];

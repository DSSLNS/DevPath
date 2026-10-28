import type { Difficulty } from "@/content/types";

/**
 * Projects on the roadmap that aren't written yet. They are shown as "Coming soon" with their
 * requirements so learners can see what's ahead; their action links to the learning path that
 * teaches the needed skills, never to a missing project page.
 */
export interface PlannedProject {
  id: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  technologies: string[];
  skills: string[];
  requirements: string[];
  pathId: string;
  preview: "portfolio" | "dashboard" | "api" | "fullstack" | "tests";
}

export const plannedProjects: PlannedProject[] = [
  {
    id: "planned-portfolio",
    title: "Responsive Portfolio Website",
    summary: "A personal portfolio that looks great on phones, tablets and desktops.",
    difficulty: "beginner",
    technologies: ["HTML", "CSS"],
    skills: ["Semantic HTML", "Flexbox and Grid", "Media queries", "Accessible navigation"],
    requirements: ["Home, projects and contact sections with a skip link", "Responsive layout from 320px to 1440px", "Valid HTML with descriptive link text and alt text"],
    pathId: "frontend",
    preview: "portfolio",
  },
  {
    id: "planned-react-dashboard",
    title: "React Dashboard",
    summary: "A data dashboard built from reusable React components with filters and charts.",
    difficulty: "intermediate",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    skills: ["Components and props", "State and effects", "Data fetching", "Loading and error states"],
    requirements: ["Summary cards and a sortable, filterable table", "Data loaded from an API with loading and error states", "Keyboard-accessible filters"],
    pathId: "frontend",
    preview: "dashboard",
  },
  {
    id: "planned-express-api",
    title: "Node.js and Express.js API",
    summary: "A REST API for a task app with validation, error handling and tests.",
    difficulty: "intermediate",
    technologies: ["Node.js", "Express.js", "Postman"],
    skills: ["Routing and middleware", "Request validation", "Error handling", "API testing"],
    requirements: ["CRUD endpoints with correct status codes", "Validation errors returned as consistent JSON", "A Postman collection covering positive and negative cases"],
    pathId: "backend",
    preview: "api",
  },
  {
    id: "planned-fullstack",
    title: "Full-Stack Application",
    summary: "A complete app with a React frontend, an Express API and a database.",
    difficulty: "advanced",
    technologies: ["React", "Node.js", "Express.js", "PostgreSQL"],
    skills: ["Frontend-to-backend integration", "Database design", "Form validation", "Deployment"],
    requirements: ["Create, list, update and delete records end to end", "Server-side validation mirrored in the UI", "Deployed with environment-based configuration"],
    pathId: "fullstack",
    preview: "fullstack",
  },
  {
    id: "planned-test-framework",
    title: "Playwright Test Automation Framework",
    summary: "A maintainable end-to-end suite for a web shop, ready to run in CI.",
    difficulty: "advanced",
    technologies: ["Playwright", "JavaScript", "CI/CD"],
    skills: ["Locators and assertions", "Fixtures", "Network interception", "Reporting"],
    requirements: ["Login, search and checkout journeys covered", "Reusable fixtures and page helpers", "HTML report and CI workflow"],
    pathId: "testing",
    preview: "tests",
  },
];

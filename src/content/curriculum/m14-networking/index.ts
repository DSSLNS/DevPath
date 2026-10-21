import type { Module } from "@/content/types";

// Lesson imports (keep in manifest order)
import { httpMethods } from "./http-methods";
import { crudRequests } from "./crud-requests";

export const networkingModule: Module = {
  id: "m14",
  slug: "networking",
  order: 14,
  title: "Browser Networking and APIs",
  description:
    "Call REST APIs correctly: methods, headers, bodies, authentication, CORS, pagination, retries and errors.",
  prerequisites: ["m11"],
  path: "javascript",
  lessons: [httpMethods, crudRequests],
};

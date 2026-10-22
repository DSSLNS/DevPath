"use client";

import { createAuthClient } from "better-auth/react";

/** Browser auth client. Talks to /api/auth/* on the same origin; tokens stay in httpOnly cookies. */
export const authClient = createAuthClient();

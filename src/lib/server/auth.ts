import { betterAuth, type BetterAuthOptions, type BetterAuthPlugin } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { databaseKind, getDatabase } from "./db";
import { sendEmail } from "./email";
import { siteConfig } from "@/config/site";

export const MIN_PASSWORD_LENGTH = 10;

/** Stores one validated learner-state document per user (see app/api/progress). */
const learnerStatePlugin = {
  id: "devpath-learner-state",
  schema: {
    learnerState: {
      fields: {
        userId: { type: "string", required: true, unique: true, references: { model: "user", field: "id", onDelete: "cascade" } },
        state: { type: "string", required: true },
        revision: { type: "number", required: true },
        updatedAt: { type: "date", required: true },
      },
    },
  },
} satisfies BetterAuthPlugin;

export async function authOptions(): Promise<BetterAuthOptions> {
  return {
    appName: siteConfig.name,
    database: await getDatabase(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: 128,
      autoSignIn: true,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: `Reset your ${siteConfig.name} password`,
          text: `Hi ${user.name},\n\nSomeone (hopefully you) asked to reset your ${siteConfig.name} password. Open this link within one hour to choose a new one:\n\n${url}\n\nIf you didn't ask for this, you can ignore this email. Your password won't change.`,
        });
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    // On in production. DEVPATH_RATE_LIMIT=off exists only for the automated E2E suite, which signs in many times from one IP.
    rateLimit: { enabled: process.env.DEVPATH_RATE_LIMIT === "off" ? false : process.env.NODE_ENV === "production" || process.env.DEVPATH_RATE_LIMIT === "on", window: 60, max: 30 },
    telemetry: { enabled: false },
    plugins: [learnerStatePlugin, nextCookies()],
  };
}

async function createAuth() {
  const options = await authOptions();
  // Local development convenience: keep the SQLite schema current without a manual migrate step.
  if (databaseKind() === "sqlite" && process.env.NODE_ENV !== "production") {
    const { getMigrations } = await import("better-auth/db/migration");
    await (await getMigrations(options)).runMigrations();
  }
  return betterAuth(options);
}

type Auth = Awaited<ReturnType<typeof createAuth>>;
const globalForAuth = globalThis as unknown as { __devpathAuth?: Promise<Auth> };

/** Lazily created so builds and pages that never touch auth don't open a database. */
export function getAuth(): Promise<Auth> {
  return (globalForAuth.__devpathAuth ??= createAuth());
}

/**
 * Creates or updates the database tables for accounts, sessions and learner progress.
 *   npm run db:migrate
 * Uses DATABASE_URL (Postgres) when set, otherwise the local SQLite file.
 */
import { getMigrations } from "better-auth/db/migration";
import { authOptions } from "@/lib/server/auth";
import { databaseKind } from "@/lib/server/db";

async function main() {
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(await authOptions());
  if (!toBeCreated.length && !toBeAdded.length) {
    console.log(`Database (${databaseKind()}) is up to date.`);
    return;
  }
  await runMigrations();
  console.log(
    `Migrated ${databaseKind()} database: created ${toBeCreated.map((t) => t.table).join(", ") || "no tables"}` +
      `${toBeAdded.length ? `; added columns to ${toBeAdded.map((t) => t.table).join(", ")}` : ""}.`,
  );
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);

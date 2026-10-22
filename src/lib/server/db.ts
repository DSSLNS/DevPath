import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import type { Pool } from "pg";

/**
 * Database connection used by Better Auth (accounts, sessions) and learner progress.
 *
 * - `DATABASE_URL=postgres://…` → PostgreSQL (production).
 * - Otherwise → SQLite file at `SQLITE_PATH` (default `.data/devpath.db`) using Node's built-in
 *   `node:sqlite`, so local development needs no database server.
 */
export type Database = DatabaseSync | Pool;

const globalForDb = globalThis as unknown as { __devpathDb?: Database };

export function databaseKind(): "postgres" | "sqlite" {
  return /^postgres(ql)?:\/\//.test(process.env.DATABASE_URL ?? "") ? "postgres" : "sqlite";
}

export async function getDatabase(): Promise<Database> {
  if (globalForDb.__devpathDb) return globalForDb.__devpathDb;
  let db: Database;
  if (databaseKind() === "postgres") {
    const { Pool } = await import("pg");
    db = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  } else {
    const { DatabaseSync } = await import("node:sqlite");
    const file = resolve(/*turbopackIgnore: true*/ process.env.SQLITE_PATH ?? ".data/devpath.db");
    mkdirSync(dirname(file), { recursive: true });
    const sqlite = new DatabaseSync(file);
    sqlite.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    db = sqlite;
  }
  globalForDb.__devpathDb = db;
  return db;
}

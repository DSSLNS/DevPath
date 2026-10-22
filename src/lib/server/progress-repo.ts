import { getAuth } from "./auth";
import type { ProgressRepo } from "./progress";

interface Row {
  id: string;
  userId: string;
  state: string;
  revision: number;
}

/** ProgressRepo backed by Better Auth's database adapter (works for SQLite and Postgres). */
export async function progressRepo(): Promise<ProgressRepo> {
  const { adapter } = await (await getAuth()).$context;
  const model = "learnerState";
  return {
    async get(userId) {
      const row = await adapter.findOne<Row>({ model, where: [{ field: "userId", value: userId }] });
      return row ? { state: row.state, revision: Number(row.revision) } : null;
    },
    async create(userId, state) {
      try {
        await adapter.create({ model, data: { userId, state, revision: 1, updatedAt: new Date() } });
        return true;
      } catch {
        // Unique constraint on userId: another request created the record first.
        return false;
      }
    },
    async update(userId, baseRevision, state) {
      const updated = await adapter.update({
        model,
        where: [
          { field: "userId", value: userId },
          { field: "revision", value: baseRevision },
        ],
        update: { state, revision: baseRevision + 1, updatedAt: new Date() },
      });
      return updated !== null;
    },
  };
}

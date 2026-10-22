import { describe, expect, it } from "vitest";
import { MAX_STATE_BYTES, readProgress, writeProgress, type ProgressRecord, type ProgressRepo } from "@/lib/server/progress";
import { createDefaultState } from "@/lib/store/schema";

/** In-memory repo with the same compare-and-set semantics as the database adapter. */
function memoryRepo(): ProgressRepo & { rows: Map<string, ProgressRecord> } {
  const rows = new Map<string, ProgressRecord>();
  return {
    rows,
    async get(userId) {
      return rows.get(userId) ?? null;
    },
    async create(userId, state) {
      if (rows.has(userId)) return false;
      rows.set(userId, { state, revision: 1 });
      return true;
    },
    async update(userId, base, state) {
      const row = rows.get(userId);
      if (!row || row.revision !== base) return false;
      rows.set(userId, { state, revision: base + 1 });
      return true;
    },
  };
}

const body = (state: unknown, baseRevision: number) => JSON.stringify({ state, baseRevision });

describe("writeProgress", () => {
  it("creates, then updates with increasing revisions", async () => {
    const repo = memoryRepo();
    const s = createDefaultState();
    expect(await writeProgress(repo, "alice", body(s, 0))).toEqual({ status: 200, revision: 1 });
    expect(await writeProgress(repo, "alice", body(s, 1))).toEqual({ status: 200, revision: 2 });
    expect((await readProgress(repo, "alice")).revision).toBe(2);
  });

  it("returns 409 with the current state when the base revision is stale", async () => {
    const repo = memoryRepo();
    const s = createDefaultState();
    await writeProgress(repo, "alice", body({ ...s, activity: ["2026-01-01"] }, 0));
    const res = await writeProgress(repo, "alice", body(s, 0));
    expect(res.status).toBe(409);
    if (res.status === 409) {
      expect(res.revision).toBe(1);
      expect(res.state?.activity).toEqual(["2026-01-01"]);
    }
  });

  it("keeps users isolated: each record is keyed by the session user", async () => {
    const repo = memoryRepo();
    await writeProgress(repo, "alice", body({ ...createDefaultState(), lastLessonId: "secret-a" }, 0));
    expect(await readProgress(repo, "bob")).toEqual({ state: null, revision: 0 });
    // Bob writing revision 1 creates nothing for Alice and cannot overwrite her record.
    expect((await writeProgress(repo, "bob", body(createDefaultState(), 1))).status).toBe(409);
    expect((await readProgress(repo, "alice")).state?.lastLessonId).toBe("secret-a");
  });

  it("sanitises the stored state with the shared schema", async () => {
    const repo = memoryRepo();
    await writeProgress(repo, "alice", body({ ...createDefaultState(), lessons: { ok: { firstOpenedAt: "1", lastOpenedAt: "1" }, bad: 42 }, extra: "<script>" }, 0));
    const stored = JSON.parse(repo.rows.get("alice")!.state);
    expect(Object.keys(stored.lessons)).toEqual(["ok"]);
    expect(stored.extra).toBeUndefined();
  });

  it("rejects malformed and oversized bodies", async () => {
    const repo = memoryRepo();
    expect((await writeProgress(repo, "a", "not json")).status).toBe(400);
    expect((await writeProgress(repo, "a", body({ version: 2 }, 0))).status).toBe(400);
    expect((await writeProgress(repo, "a", body(createDefaultState(), -1))).status).toBe(400);
    expect((await writeProgress(repo, "a", body(createDefaultState(), 1.5))).status).toBe(400);
    expect((await writeProgress(repo, "a", "x".repeat(MAX_STATE_BYTES + 1))).status).toBe(413);
    expect(repo.rows.size).toBe(0);
  });
});

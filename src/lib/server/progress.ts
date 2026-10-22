/**
 * Learner-progress persistence rules, independent of the HTTP layer and database so they
 * can be unit-tested. The user id ALWAYS comes from the verified session, never from the
 * request body, so one user can never read or write another user's record.
 */
import { parseState, type PersistedState } from "@/lib/store/schema";

export const MAX_STATE_BYTES = 1_000_000;

export interface ProgressRecord {
  state: string;
  revision: number;
}

export interface ProgressRepo {
  get(userId: string): Promise<ProgressRecord | null>;
  /** Creates the first record. Returns false if one already exists (lost a race). */
  create(userId: string, state: string): Promise<boolean>;
  /** Writes only if the stored revision still equals `baseRevision`. Returns false otherwise. */
  update(userId: string, baseRevision: number, state: string): Promise<boolean>;
}

export type WriteResult =
  | { status: 200; revision: number }
  | { status: 409; revision: number; state: PersistedState | null }
  | { status: 400 | 413; error: string };

export async function readProgress(repo: ProgressRepo, userId: string): Promise<{ state: PersistedState | null; revision: number }> {
  const row = await repo.get(userId);
  if (!row) return { state: null, revision: 0 };
  return { state: parseState(row.state).state, revision: row.revision };
}

export async function writeProgress(repo: ProgressRepo, userId: string, rawBody: string): Promise<WriteResult> {
  if (rawBody.length > MAX_STATE_BYTES) return { status: 413, error: "Progress data is too large." };
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { status: 400, error: "Request body must be JSON." };
  }
  if (typeof body !== "object" || body === null) return { status: 400, error: "Request body must be an object." };
  const { state, baseRevision } = body as { state?: unknown; baseRevision?: unknown };
  if (typeof baseRevision !== "number" || !Number.isInteger(baseRevision) || baseRevision < 0) {
    return { status: 400, error: "baseRevision must be a non-negative integer." };
  }
  if (typeof state !== "object" || state === null || (state as { version?: unknown }).version !== 1) {
    return { status: 400, error: "state must be a version 1 learner state." };
  }
  // Re-validate every field with the same parser the client uses; unknown or malformed data is dropped.
  const sanitized = JSON.stringify(parseState(JSON.stringify(state)).state);

  const conflict = async (): Promise<WriteResult> => {
    const current = await readProgress(repo, userId);
    return { status: 409, revision: current.revision, state: current.state };
  };

  if (baseRevision === 0) {
    return (await repo.create(userId, sanitized)) ? { status: 200, revision: 1 } : conflict();
  }
  return (await repo.update(userId, baseRevision, sanitized)) ? { status: 200, revision: baseRevision + 1 } : conflict();
}

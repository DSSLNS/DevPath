import { NextResponse } from "next/server";
import { getAuth } from "@/lib/server/auth";
import { readProgress, writeProgress } from "@/lib/server/progress";
import { progressRepo } from "@/lib/server/progress-repo";

const NO_STORE = { "Cache-Control": "private, no-store" };

async function sessionUser(request: Request) {
  const session = await (await getAuth()).api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

/** The signed-in learner's profile and saved progress. 401 for guests. */
export async function GET(request: Request) {
  const user = await sessionUser(request);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401, headers: NO_STORE });
  const progress = await readProgress(await progressRepo(), user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email }, ...progress }, { headers: NO_STORE });
}

/** Saves the learner's progress with optimistic concurrency (`baseRevision`). */
export async function PUT(request: Request) {
  // Reject cross-site writes: browsers always send Origin on PUT.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin && origin !== process.env.BETTER_AUTH_URL) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403, headers: NO_STORE });
  }
  const user = await sessionUser(request);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401, headers: NO_STORE });
  const result = await writeProgress(await progressRepo(), user.id, await request.text());
  const { status, ...body } = result;
  return NextResponse.json(body, { status, headers: NO_STORE });
}

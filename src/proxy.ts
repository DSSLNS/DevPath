import { NextResponse, type NextRequest } from "next/server";
import routes from "@/generated/routes.json";

const valid = new Set<string>(routes);
// Static (non-content) routes under the same prefixes.
const STATIC = new Set(["/practice/playground"]);

/**
 * Dynamic content routes stream their response, so an unknown slug would otherwise
 * render the not-found UI with a 200 status. Unknown slugs are rewritten to an
 * unmatched path so they return a real 404.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "");
  if (valid.has(path) || STATIC.has(path)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/__not-found", request.url));
}

export const config = {
  matcher: ["/learn/:module/:path*", "/e2e/:slug+", "/practice/:slug+", "/projects/:slug+", "/courses/:path+"],
};

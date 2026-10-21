import { buildSearchIndex } from "@/lib/search/build-index";

// Prerendered at build time; fetched lazily by the client when search is first opened.
export async function GET() {
  return Response.json(buildSearchIndex());
}

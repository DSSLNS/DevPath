import { questionBank } from "@/content";

// Prerendered at build time. Full question bodies are only needed by the assessment runner.
export async function GET() {
  return Response.json(questionBank);
}

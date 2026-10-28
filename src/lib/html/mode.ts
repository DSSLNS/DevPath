/** For free-form playgrounds only: a page that starts with a doctype or <html> is checked as a document. */
export function detectHtmlMode(code: string): "snippet" | "document" {
  return /^\s*(<!--[\s\S]*?-->\s*)*(<!doctype|<html\b)/i.test(code) ? "document" : "snippet";
}

/** Shared by the browser sandbox and the Node/jsdom runner for the "web" runtime. */

const LEADING_DOCTYPE = /^(\s*(?:<!--[\s\S]*?-->\s*)*<!doctype[^>]*>)/i;
const DOCUMENT_TAG = /<(html|head|body)(\s[^>]*)?>/i;

/**
 * Makes `inject` the first content of the document's <head>, whatever the learner wrote.
 *
 * Markup placed right after the doctype (or at the very start) is parsed into the head before
 * any learner element, and a later learner <html>/<head> tag is merged into it by the HTML parser.
 * The learner's doctype is kept, so standards vs quirks mode behaves exactly as they wrote it.
 * Fragments without document tags get a standard skeleton.
 */
export function injectIntoHead(html: string, inject: string) {
  const doctype = LEADING_DOCTYPE.exec(html);
  if (doctype) return doctype[1] + inject + html.slice(doctype[1].length);
  if (DOCUMENT_TAG.test(html)) return inject + html;
  return `<!doctype html><html><head><meta charset="utf-8">${inject}</head><body>${html}</body></html>`;
}

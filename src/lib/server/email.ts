
interface Email {
  to: string;
  subject: string;
  text: string;
}

/**
 * Sends transactional email through Resend when `RESEND_API_KEY` and `EMAIL_FROM` are set.
 * Without them (local development) the message is printed to the server console so the
 * flow can still be tested; the UI tells the learner where to look.
 */
export function emailConfigured() {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

export async function sendEmail(email: Email) {
  // Automated tests read outgoing mail from a file instead of a real inbox.
  if (process.env.DEVPATH_EMAIL_LOG) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(/*turbopackIgnore: true*/ process.env.DEVPATH_EMAIL_LOG, JSON.stringify(email) + "\n");
    return;
  }
  if (!emailConfigured()) {
    if (process.env.NODE_ENV === "production" && !process.env.DEVPATH_ALLOW_CONSOLE_EMAIL) {
      console.error(`[email] Not sent: RESEND_API_KEY / EMAIL_FROM are not configured (subject: "${email.subject}").`);
      return;
    }
    console.info(`\n[email:dev] To: ${email.to}\n[email:dev] Subject: ${email.subject}\n${email.text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: email.to, subject: email.subject, text: email.text }),
  });
  if (!res.ok) console.error(`[email] Resend responded ${res.status} for "${email.subject}".`);
}

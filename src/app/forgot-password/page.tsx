import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/account/auth-forms";
import { emailConfigured } from "@/lib/server/email";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function Page() {
  return <ForgotPasswordForm devEmail={!emailConfigured()} />;
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 h-96 max-w-md animate-pulse rounded-lg bg-surface" aria-busy="true" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 h-96 max-w-md animate-pulse rounded-lg bg-surface" aria-busy="true" />}>
      <SignUpForm />
    </Suspense>
  );
}

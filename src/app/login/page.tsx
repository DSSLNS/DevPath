import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 h-96 max-w-md animate-pulse rounded-lg bg-surface" aria-busy="true" />}>
      <LoginForm />
    </Suspense>
  );
}

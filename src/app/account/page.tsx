import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/server/auth";
import { AccountView } from "@/components/account/account-view";
import { PageHeader } from "@/components/ui/card";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Account" description="Your profile, password, daily goal and session." />
      <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-surface" aria-busy="true" />}>
        <Account />
      </Suspense>
    </div>
  );
}

/** Server-side guard: the account page is only rendered for a valid session. */
async function Account() {
  // Read the request first: it marks this component as dynamic before any auth or database work.
  const requestHeaders = await headers();
  const session = await (await getAuth()).api.getSession({ headers: requestHeaders });
  if (!session) redirect("/login?next=/account");
  const { user } = session;
  return <AccountView user={{ name: user.name, email: user.email, createdAt: new Date(user.createdAt).toISOString() }} />;
}

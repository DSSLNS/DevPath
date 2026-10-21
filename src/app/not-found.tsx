import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">This page doesn&apos;t exist, or the lesson hasn&apos;t been published yet.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/" className={buttonClass("primary")}>
          Go to dashboard
        </Link>
        <Link href="/learn" className={buttonClass("secondary")}>
          Browse curriculum
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeNext, validateEmail, validateName, validatePassword, PASSWORD_MIN } from "@/lib/auth-validation";
import { AuthCard, Field, FormError, GuestNote, SubmitButton } from "./auth-form";

/** Full page load after auth changes, so progress is re-loaded from the right place (account or browser). */
function goTo(path: string) {
  window.location.assign(path);
}

export function SignUpForm() {
  const next = safeNext(useSearchParams().get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: confirm !== password ? "The passwords don't match." : null,
    };
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;
    setBusy(true);
    setFormError(null);
    const { error } = await authClient.signUp.email({ name: name.trim(), email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) {
      if (error.code === "USER_ALREADY_EXISTS" || error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || error.status === 422) {
        setErrors((x) => ({ ...x, email: "An account with this email already exists. Log in instead, or reset your password." }));
      } else if (error.status === 429) {
        setFormError("Too many attempts. Please wait a minute and try again.");
      } else {
        setFormError(error.message || "We couldn't create your account. Please try again.");
      }
      return;
    }
    goTo(next);
  };

  return (
    <AuthCard
      title="Create your DevPath account"
      description="Save your progress, set an optional daily goal and pick up where you left off on any device."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <FormError message={formError} />
        <Field label="Name or display name" name="name" value={name} onChange={setName} autoComplete="name" error={errors.name} />
        <Field label="Email address" name="email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
        <Field
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={errors.password}
          hint={`At least ${PASSWORD_MIN} characters, with a letter and a number.`}
        />
        <Field label="Confirm password" name="confirm" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
        <SubmitButton busy={busy}>Create account</SubmitButton>
      </form>
      <GuestNote />
    </AuthCard>
  );
}

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const reset = params.get("reset") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = { email: validateEmail(email), password: password ? null : "Enter your password." };
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;
    setBusy(true);
    setFormError(null);
    const { error } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (error) {
      setFormError(error.status === 429 ? "Too many attempts. Please wait a minute and try again." : "That email and password don't match an account. Check them and try again.");
      return;
    }
    goTo(next);
  };

  return (
    <AuthCard
      title="Log in to DevPath"
      description="Continue learning where you left off."
      footer={
        <>
          New to DevPath?{" "}
          <Link href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {reset && (
        <p role="status" className="mb-4 flex gap-2 rounded-md bg-success-soft px-3 py-2 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Your password was changed. Log in with your new password.
        </p>
      )}
      <form onSubmit={submit} noValidate>
        <FormError message={formError} />
        <Field label="Email address" name="email" type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
        <Field label="Password" name="password" type="password" value={password} onChange={setPassword} autoComplete="current-password" error={errors.password} />
        <div className="-mt-2 mb-4 text-right text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>
        <SubmitButton busy={busy}>Log in</SubmitButton>
      </form>
      <GuestNote />
    </AuthCard>
  );
}

export function ForgotPasswordForm({ devEmail }: { devEmail: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateEmail(email);
    setError(v);
    if (v) return;
    setBusy(true);
    const { error: err } = await authClient.requestPasswordReset({ email: email.trim().toLowerCase(), redirectTo: "/reset-password" });
    setBusy(false);
    if (err?.status === 429) {
      setFormError("Too many requests. Please wait a minute and try again.");
      return;
    }
    // Same message whether or not the account exists, so this form can't be used to discover accounts.
    setSent(true);
  };

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email address you signed up with and we'll send you a link to choose a new password."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="space-y-2 text-sm">
          <p className="flex gap-2 rounded-md bg-success-soft px-3 py-2 text-success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> If an account exists for that email, a reset link is on its way. The link expires in one
            hour.
          </p>
          {devEmail && (
            <p className="text-muted">
              Development mode: email sending isn&apos;t configured, so the reset link is printed in the server console instead.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <FormError message={formError} />
          <Field label="Email address" name="email" type="email" value={email} onChange={setEmail} autoComplete="email" error={error} />
          <SubmitButton busy={busy}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const linkError = params.get("error");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token || linkError) {
    return (
      <AuthCard title="This reset link can't be used" description="It may have expired (links last one hour) or already been used.">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Request a new reset link
        </Link>
      </AuthCard>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = { password: validatePassword(password), confirm: confirm !== password ? "The passwords don't match." : null };
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;
    setBusy(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setBusy(false);
    if (error) {
      setFormError("This reset link has expired or was already used. Request a new one.");
      return;
    }
    goTo("/login?reset=1");
  };

  return (
    <AuthCard title="Choose a new password" description="For your security, you'll be signed out of other devices.">
      <form onSubmit={submit} noValidate>
        <FormError message={formError} />
        <Field
          label="New password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={errors.password}
          hint={`At least ${PASSWORD_MIN} characters, with a letter and a number.`}
        />
        <Field label="Confirm new password" name="confirm" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
        <SubmitButton busy={busy}>Change password</SubmitButton>
      </form>
    </AuthCard>
  );
}

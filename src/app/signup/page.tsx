"use client";

import { useActionState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";
import { signupAction } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, {});
  const err = state.fieldErrors ?? {};
  const v = state.values;

  const errorProps = (name: string) =>
    err[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};
  const errorText = (name: string) =>
    err[name] ? (
      <span id={`${name}-error`} className="field-error">
        {err[name]}
      </span>
    ) : null;

  return (
    <AuthShell
      wide
      title="Create your account"
      lead="Set up your account to start tracking your cases and hearing dates."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        {state.error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="su-name" className="field-label">
            Full name
          </label>
          <input
            id="su-name"
            name="name"
            required
            autoComplete="name"
            defaultValue={v?.name}
            className="field mt-1"
            {...errorProps("name")}
          />
          {errorText("name")}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="su-email" className="field-label">
              Email
            </label>
            <input
              id="su-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={v?.email}
              className="field mt-1"
              {...errorProps("email")}
            />
            {errorText("email")}
          </div>
          <div>
            <label htmlFor="su-phone" className="field-label">
              WhatsApp / contact number
            </label>
            <input
              id="su-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+92 300 1234567"
              defaultValue={v?.phone}
              className="field mt-1"
              {...errorProps("phone")}
            />
            {errorText("phone") ?? <span className="field-hint">Used for hearing reminders.</span>}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <label htmlFor="su-username" className="field-label">
            Username
          </label>
          <input
            id="su-username"
            name="username"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={v?.username}
            className="field mt-1"
            {...errorProps("username")}
          />
          {errorText("username") ?? (
            <span className="field-hint">You&apos;ll use this to sign in. Letters, numbers, dots, dashes, underscores.</span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="su-password" className="field-label">
              Password
            </label>
            <PasswordInput
              id="su-password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="field"
              {...errorProps("password")}
            />
            {errorText("password") ?? <span className="field-hint">At least 8 characters.</span>}
          </div>
          <div>
            <label htmlFor="su-confirm" className="field-label">
              Confirm password
            </label>
            <PasswordInput
              id="su-confirm"
              name="confirmPassword"
              required
              autoComplete="new-password"
              className="field"
              {...errorProps("confirmPassword")}
            />
            {errorText("confirmPassword")}
          </div>
        </div>

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

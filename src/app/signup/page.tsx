"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/components/Toaster";
import { signupAction } from "./actions";

const input =
  "w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, {});
  const err = state.fieldErrors ?? {};
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast(state.error, "error");
    else if (state.fieldErrors) toast("Please fix the highlighted fields.", "error");
  }, [state, toast]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start managing your monthly schedule.</p>
        <form action={formAction} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="signup-name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="signup-name"
              name="name"
              required
              autoComplete="name"
              defaultValue={state.values?.name}
              className={`mt-1 ${input}`}
            />
            {err.name && <span className="text-xs text-red-600">{err.name}</span>}
          </div>
          <div>
            <label htmlFor="signup-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={state.values?.email}
              className={`mt-1 ${input}`}
            />
            {err.email && <span className="text-xs text-red-600">{err.email}</span>}
          </div>
          <div>
            <label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </label>
            <PasswordInput
              id="signup-password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={input}
            />
            {err.password ? (
              <span className="text-xs text-red-600">{err.password}</span>
            ) : (
              <span className="text-xs text-slate-500">At least 8 characters.</span>
            )}
          </div>
          <div>
            <label htmlFor="signup-confirm" className="text-sm font-medium">
              Confirm password
            </label>
            <PasswordInput
              id="signup-confirm"
              name="confirmPassword"
              required
              autoComplete="new-password"
              className={input}
            />
            {err.confirmPassword && <span className="text-xs text-red-600">{err.confirmPassword}</span>}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

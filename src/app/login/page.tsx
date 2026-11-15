"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/components/Toaster";
import { loginAction } from "./actions";

const input =
  "w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast(state.error, "error");
  }, [state, toast]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Lawyer Schedule</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage your monthly schedule.</p>
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={state.email}
              className={`mt-1 ${input}`}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-sm font-medium">
              Password
            </label>
            <PasswordInput
              id="login-password"
              name="password"
              required
              autoComplete="current-password"
              className={input}
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-600" aria-hidden="true">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          New here?{" "}
          <Link href="/signup" className="font-medium text-slate-900 underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { setFlash } from "@/lib/flash";

export type LoginState = { error?: string; email?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  try {
    // redirect: false so we can queue the success toast before redirecting ourselves.
    await signIn("credentials", { email, password: formData.get("password"), redirect: false });
  } catch (error) {
    // Keep the email so the form doesn't wipe it after a failed attempt.
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { error: "Incorrect email or password.", email };
      // e.g. the database couldn't be reached
      console.error("Sign-in failed:", error);
      return { error: "Sign-in is temporarily unavailable. Please try again in a moment.", email };
    }
    throw error;
  }
  await setFlash("Signed in successfully.");
  redirect("/schedule");
}

"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { setFlash } from "@/lib/flash";

export type LoginState = { error?: string; username?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  try {
    // redirect: false so we can queue the success toast before redirecting ourselves.
    await signIn("credentials", { username, password: formData.get("password"), redirect: false });
  } catch (error) {
    // Keep the username so the form doesn't wipe it after a failed attempt.
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { error: "Incorrect username or password.", username };
      // e.g. the database couldn't be reached
      console.error("Sign-in failed:", error);
      return { error: "Sign-in is temporarily unavailable. Please try again in a moment.", username };
    }
    throw error;
  }
  await setFlash("Signed in successfully.");
  redirect("/calendar");
}

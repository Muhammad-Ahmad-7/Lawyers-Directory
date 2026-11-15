"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn } from "@/auth";
import { setFlash } from "@/lib/flash";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: { name: string; email: string };
};

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(100),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(200, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const values = { name: raw.name, email: raw.email };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors, values };
  }
  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return { fieldErrors: { email: "An account with this email already exists. Sign in instead." }, values };
    }
    await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { fieldErrors: { email: "An account with this email already exists. Sign in instead." }, values };
    }
    console.error("Sign-up failed:", error);
    return { error: "Couldn't create the account right now. Please try again in a moment.", values };
  }

  // Account created: sign the new user in straight away.
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      await setFlash("Account created. Please sign in.", "info");
      redirect("/login");
    }
    throw error;
  }
  await setFlash(`Account created. Welcome, ${name}!`);
  redirect("/schedule");
}

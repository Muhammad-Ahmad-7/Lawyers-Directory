"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { setFlash } from "@/lib/flash";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { fieldErrors, signupSchema } from "@/lib/validation";

type SignupValues = { name: string; username: string; email: string; phone: string };

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: SignupValues;
};

const USERNAME_TAKEN = "This username is taken. Choose another one.";

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const get = (k: string) => String(formData.get(k) ?? "");
  const raw = {
    name: get("name"),
    username: get("username"),
    email: get("email"),
    phone: get("phone"),
    password: get("password"),
    confirmPassword: get("confirmPassword"),
  };
  const values: SignupValues = { name: raw.name, username: raw.username, email: raw.email, phone: raw.phone };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  const { name, username, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (existing) return { fieldErrors: { username: USERNAME_TAKEN }, values };
    await prisma.user.create({
      data: { name, username, email, phone, passwordHash: await hashPassword(password) },
    });
  } catch (error) {
    // Two sign-ups racing for the same username.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { fieldErrors: { username: USERNAME_TAKEN }, values };
    }
    console.error("Sign-up failed:", error);
    return { error: "Couldn't create the account right now. Please try again in a moment.", values };
  }

  // Account created: sign the new user in straight away.
  try {
    await signIn("credentials", { username, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      await setFlash("Account created. Please sign in.", "info");
      redirect("/login");
    }
    throw error;
  }
  await setFlash(`Account created. Welcome, ${name}!`);
  redirect("/calendar");
}

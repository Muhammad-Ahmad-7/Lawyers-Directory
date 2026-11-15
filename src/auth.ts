import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/db";
import { getDummyHash, verifyPassword } from "./lib/password";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        // Always run a hash check so an unknown email takes as long as a wrong password.
        const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await getDummyHash()));
        if (!user || !ok) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});

/** Returns the logged-in user's id, or sends the visitor to /login. Use in every page and server action. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  return id;
}

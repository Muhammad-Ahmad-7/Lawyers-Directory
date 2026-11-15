import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe part of the auth config (used by middleware).
 * The Credentials provider, which needs Prisma and bcrypt, is added in auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const loggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const onAuthPage = path.startsWith("/login") || path.startsWith("/signup");
      if (onAuthPage) {
        if (loggedIn) return Response.redirect(new URL("/schedule", request.nextUrl));
        return true;
      }
      return loggedIn; // false → redirect to /login
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

import type { NextAuthConfig } from "next-auth";

// Edge-safe config: χωρίς providers (Prisma/bcrypt δεν τρέχουν σε Edge Runtime).
// Χρησιμοποιείται μόνο από το middleware για τον έλεγχο προστατευμένων routes.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isProtected =
        request.nextUrl.pathname.startsWith("/profil") ||
        request.nextUrl.pathname.startsWith("/diavatirio") ||
        request.nextUrl.pathname.startsWith("/admin");
      return isProtected ? !!auth?.user : true;
    },
  },
} satisfies NextAuthConfig;

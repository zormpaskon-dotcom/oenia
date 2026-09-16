import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Κωδικός", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Το role μπαίνει στο JWT μόνο κατά το sign-in (όταν υπάρχει `user`),
    // ίδιο trust model με το id — έτσι το middleware (Edge runtime, χωρίς
    // πρόσβαση σε Prisma) μπορεί να ελέγξει "authenticated user ≠ admin user"
    // χωρίς DB query, βλ. lib/auth.config.ts.
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    // Το session callback είναι στο lib/auth.config.ts (κληρονομείται εδώ
    // μέσω του ...authConfig.callbacks παραπάνω) ώστε να το μοιράζεται και
    // το middleware — βλ. σχόλιο εκεί.
  },
});

export { AuthError };

import type { NextAuthConfig } from "next-auth";

// Edge-safe config: χωρίς providers (Prisma/bcrypt δεν τρέχουν σε Edge Runtime).
// Χρησιμοποιείται μόνο από το middleware για τον έλεγχο προστατευμένων routes.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    // Ορίζεται εδώ (όχι μόνο στο lib/auth.ts) γιατί το middleware χτίζει το
    // δικό του, ξεχωριστό NextAuth instance από ΑΥΤΟ ΤΟ config — αν το
    // session callback υπήρχε μόνο στο lib/auth.ts, το middleware θα έβλεπε
    // auth.user χωρίς role (το JWT θα το είχε, αλλά χωρίς session callback
    // εδώ δεν θα «περνούσε» στο auth.user) και το authorized() παρακάτω θα
    // απέρριπτε ακόμα και πραγματικούς admins. Το lib/auth.ts κληρονομεί
    // αυτό το callback μέσω spread (...authConfig.callbacks), άρα υπάρχει
    // ένα μόνο σημείο αλήθειας για το session shape.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && token.role) session.user.role = token.role;
      return session;
    },
    authorized({ auth, request }) {
      // /admin απαιτεί ρητά role "ADMIN" (όχι μόνο σύνδεση) — literal string
      // αντί για το UserRole enum του @prisma/client, ώστε αυτό το αρχείο να
      // παραμείνει edge-safe (βλ. σχόλιο στην κορυφή). Το role έρχεται από το
      // JWT (lib/auth.ts), όχι από DB query, άρα δουλεύει κανονικά στο Edge.
      // Κάθε admin σελίδα/action συνεχίζει να κάνει ΚΑΙ το δικό της
      // requireAdmin() έλεγχο — αυτό είναι επιπλέον στρώμα, όχι αντικατάσταση.
      if (request.nextUrl.pathname.startsWith("/admin")) {
        return auth?.user?.role === "ADMIN";
      }
      const isProtected =
        request.nextUrl.pathname.startsWith("/profil") ||
        request.nextUrl.pathname.startsWith("/diavatirio");
      return isProtected ? !!auth?.user : true;
    },
  },
} satisfies NextAuthConfig;

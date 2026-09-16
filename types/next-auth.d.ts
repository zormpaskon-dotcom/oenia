import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
  interface User {
    role: UserRole;
  }
}

// next-auth/jwt.d.ts κάνει `export * from "@auth/core/jwt"` — re-export, όχι
// το module όπου δηλώνεται το interface. Το declaration merging πρέπει να
// στοχεύει το πραγματικό source module, αλλιώς αγνοείται σιωπηλά.
declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

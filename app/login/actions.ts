"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, AuthError } from "@/lib/auth";

export type AuthActionState = { error: string | null };

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Συμπλήρωσε email και κωδικό." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Λάθος email ή κωδικός." };
    }
    throw err;
  }

  redirect("/profil");
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Πες μας το όνομά σου." };
  if (!email) return { error: "Χρειαζόμαστε ένα έγκυρο email." };
  if (password.length < 8) return { error: "Ο κωδικός χρειάζεται τουλάχιστον 8 χαρακτήρες." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Υπάρχει ήδη λογαριασμός με αυτό το email." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashedPassword } });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/login");
    }
    throw err;
  }

  redirect("/profil");
}

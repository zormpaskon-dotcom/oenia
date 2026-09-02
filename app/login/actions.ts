"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, AuthError } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

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

  const ip = await clientIp();
  const allowed = await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Πάρα πολλές προσπάθειες σύνδεσης. Δοκίμασε ξανά σε λίγα λεπτά." };
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
  // Honeypot: αόρατο πεδίο για ανθρώπους, ελκυστικό για bots. Αν είναι
  // γεμάτο, πρόκειται σχεδόν σίγουρα για bot — απορρίπτουμε αθόρυβα.
  if (String(formData.get("website") ?? "").trim()) {
    return { error: "Κάτι πήγε στραβό. Δοκίμασε ξανά." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Πες μας το όνομά σου." };
  if (!email) return { error: "Χρειαζόμαστε ένα έγκυρο email." };
  if (password.length < 8) return { error: "Ο κωδικός χρειάζεται τουλάχιστον 8 χαρακτήρες." };

  const ip = await clientIp();
  const allowed = await rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return { error: "Πάρα πολλοί λογαριασμοί από εδώ. Δοκίμασε ξανά αργότερα." };
  }

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

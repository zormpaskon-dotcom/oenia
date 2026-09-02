"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SettingsActionState = { error: string | null; success: boolean };

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Πρέπει να συνδεθείς.", success: false };

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const newsletterOptIn = formData.get("newsletterOptIn") === "on";
  const isPublicProfile = formData.get("isPublicProfile") === "on";
  const newPassword = String(formData.get("password") ?? "");

  if (!name) return { error: "Το όνομα δεν μπορεί να είναι κενό.", success: false };
  if (newPassword && newPassword.length < 8) {
    return { error: "Ο νέος κωδικός χρειάζεται τουλάχιστον 8 χαρακτήρες.", success: false };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      city: city || null,
      newsletterOptIn,
      isPublicProfile,
      ...(newPassword ? { password: await bcrypt.hash(newPassword, 10) } : {}),
    },
  });

  revalidatePath("/profil");
  return { error: null, success: true };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

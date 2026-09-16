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

export type DeleteAccountState = { error: string | null };

// Πλήρης, μόνιμη διαγραφή λογαριασμού — καμία περίοδος χάριτος/soft-delete
// (NEEDS LEGAL DECISION αν χρειάζεται τέτοια, δεν προϋποτίθεται εδώ).
// CellarEntry διαγράφεται αυτόματα (onDelete: Cascade — καθαρά προσωπικό,
// καμία δημόσια αξία). Τα Review ΔΕΝ διαγράφονται· αποσυνδέονται μόνο από
// τον χρήστη (onDelete: SetNull στο schema — το Postgres το κάνει αυτόματα
// κατά το user.delete, το review.rating/note παραμένουν άθικτα, άρα το
// Wine.avgRating/reviewCount δεν χρειάζεται recompute). Winery.claimedById/
// Article.authorId ΔΕΝ κάνουν cascade (προαιρετικές σχέσεις χωρίς δικό τους
// onDelete) — αποσυνδέονται ρητά πριν τη διαγραφή ώστε το ίδιο το
// winery/article περιεχόμενο να ΜΗΝ διαγραφεί, μόνο ο σύνδεσμος με τον χρήστη.
export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const session = await auth();
  if (!session?.user) return { error: "Πρέπει να συνδεθείς." };

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return { error: "Ο λογαριασμός δεν βρέθηκε." };

  const confirmEmail = String(formData.get("confirmEmail") ?? "").trim();
  if (confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
    return { error: "Το email δεν ταιριάζει. Πληκτρολόγησε ακριβώς το email του λογαριασμού σου." };
  }

  await prisma.$transaction([
    prisma.winery.updateMany({ where: { claimedById: userId }, data: { claimedById: null } }),
    prisma.article.updateMany({ where: { authorId: userId }, data: { authorId: null } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  await signOut({ redirectTo: "/" });
  return { error: null };
}

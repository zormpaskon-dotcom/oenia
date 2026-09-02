"use server";

import { revalidatePath } from "next/cache";
import { CellarStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setCellarStatusAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const wineId = String(formData.get("wineId") ?? "");
  const status = String(formData.get("status") ?? "");
  const wineSlug = String(formData.get("wineSlug") ?? "");
  if (!wineId) return;

  if (status === "NONE") {
    await prisma.cellarEntry.deleteMany({
      where: { userId: session.user.id, wineId },
    });
  } else if (status === CellarStatus.WANT_TO_TRY || status === CellarStatus.TRIED) {
    await prisma.cellarEntry.upsert({
      where: { userId_wineId: { userId: session.user.id, wineId } },
      update: { status },
      create: { userId: session.user.id, wineId, status },
    });
  }

  if (wineSlug) revalidatePath(`/krasia/${wineSlug}`);
  revalidatePath("/profil");
}

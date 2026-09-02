"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ReviewActionState = { error: string | null };

export async function submitReviewAction(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Πρέπει να συνδεθείς για να αξιολογήσεις." };

  const wineId = String(formData.get("wineId") ?? "");
  const wineSlug = String(formData.get("wineSlug") ?? "");
  const rating = Number(formData.get("rating"));
  const note = String(formData.get("note") ?? "").trim();

  if (!wineId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Διάλεξε βαθμολογία από 1 έως 5." };
  }

  await prisma.review.upsert({
    where: { userId_wineId: { userId: session.user.id, wineId } },
    update: { rating, note: note || null },
    create: { userId: session.user.id, wineId, rating, note: note || null },
  });

  const agg = await prisma.review.aggregate({
    where: { wineId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  await prisma.wine.update({
    where: { id: wineId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count._all,
    },
  });

  if (wineSlug) revalidatePath(`/krasia/${wineSlug}`);
  revalidatePath("/profil");

  return { error: null };
}

export async function reportReviewAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const reviewId = String(formData.get("reviewId") ?? "");
  const wineSlug = String(formData.get("wineSlug") ?? "");
  if (!reviewId) return;

  await prisma.review.update({
    where: { id: reviewId },
    data: { isFlagged: true },
  });

  if (wineSlug) revalidatePath(`/krasia/${wineSlug}`);
}

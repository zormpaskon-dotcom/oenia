"use server";

import { revalidatePath } from "next/cache";
import { ContentStatus, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== UserRole.ADMIN) throw new Error("Unauthorized");
}

export async function approveWineryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.winery.update({ where: { id }, data: { status: ContentStatus.PUBLISHED } });
  revalidatePath("/admin");
  revalidatePath("/oinopoieia");
}

export async function rejectWineryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.winery.update({ where: { id }, data: { status: ContentStatus.REJECTED } });
  revalidatePath("/admin");
}

export async function unflagReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.review.update({ where: { id }, data: { isFlagged: false } });
  revalidatePath("/admin");
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const review = await prisma.review.findUnique({ where: { id }, select: { wineId: true } });
  if (!review) return;

  await prisma.review.delete({ where: { id } });

  const agg = await prisma.review.aggregate({
    where: { wineId: review.wineId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.wine.update({
    where: { id: review.wineId },
    data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count._all },
  });

  revalidatePath("/admin");
}

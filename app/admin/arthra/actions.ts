"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArticleCategory, ContentStatus, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { optionalFile, uploadImage } from "@/lib/upload";

export type ArticleFormState = { error: string | null };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== UserRole.ADMIN) throw new Error("Unauthorized");
}

async function uniqueArticleSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || "arthro";
  let attempt = 0;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }
}

function readArticleForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const regionId = String(formData.get("regionId") ?? "");
  const readMinutesRaw = String(formData.get("readMinutes") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const isSponsored = formData.get("isSponsored") === "on";
  const sponsorName = String(formData.get("sponsorName") ?? "").trim();
  const publishNow = formData.get("publishNow") === "on";

  return {
    title,
    slugInput,
    excerpt,
    body,
    category,
    regionId,
    readMinutes: readMinutesRaw ? Number(readMinutesRaw) : null,
    tags: tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    isSponsored,
    sponsorName,
    publishNow,
  };
}

export async function createArticleAction(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireAdmin();
  const f = readArticleForm(formData);

  if (!f.title) return { error: "Ο τίτλος είναι υποχρεωτικός." };
  if (!f.body) return { error: "Το κείμενο του άρθρου είναι υποχρεωτικό." };
  if (!Object.values(ArticleCategory).includes(f.category as ArticleCategory)) {
    return { error: "Διάλεξε κατηγορία." };
  }

  let coverImage: string | null = null;
  const coverFile = optionalFile(formData, "coverImage");
  if (coverFile) {
    const result = await uploadImage(coverFile, "articles");
    if (!result.ok) return { error: result.error };
    coverImage = result.url;
  }

  const slug = await uniqueArticleSlug(slugify(f.slugInput || f.title));

  await prisma.article.create({
    data: {
      title: f.title,
      slug,
      excerpt: f.excerpt || null,
      body: f.body,
      category: f.category as ArticleCategory,
      regionId: f.regionId || null,
      readMinutes: f.readMinutes,
      tags: f.tags,
      isSponsored: f.isSponsored,
      sponsorName: f.isSponsored ? f.sponsorName || null : null,
      coverImage,
      status: f.publishNow ? ContentStatus.PUBLISHED : ContentStatus.PENDING,
      publishedAt: f.publishNow ? new Date() : null,
    },
  });

  revalidatePath("/admin/arthra");
  revalidatePath("/arthra");
  redirect("/admin/arthra");
}

export async function updateArticleAction(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Λείπει το άρθρο." };

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { error: "Το άρθρο δεν βρέθηκε." };

  const f = readArticleForm(formData);
  if (!f.title) return { error: "Ο τίτλος είναι υποχρεωτικός." };
  if (!f.body) return { error: "Το κείμενο του άρθρου είναι υποχρεωτικό." };
  if (!Object.values(ArticleCategory).includes(f.category as ArticleCategory)) {
    return { error: "Διάλεξε κατηγορία." };
  }

  let coverImage = existing.coverImage;
  const coverFile = optionalFile(formData, "coverImage");
  if (coverFile) {
    const result = await uploadImage(coverFile, "articles");
    if (!result.ok) return { error: result.error };
    coverImage = result.url;
  }

  const slug = await uniqueArticleSlug(slugify(f.slugInput || f.title), id);
  const wasPublished = existing.status === ContentStatus.PUBLISHED;

  await prisma.article.update({
    where: { id },
    data: {
      title: f.title,
      slug,
      excerpt: f.excerpt || null,
      body: f.body,
      category: f.category as ArticleCategory,
      regionId: f.regionId || null,
      readMinutes: f.readMinutes,
      tags: f.tags,
      isSponsored: f.isSponsored,
      sponsorName: f.isSponsored ? f.sponsorName || null : null,
      coverImage,
      status: f.publishNow ? ContentStatus.PUBLISHED : ContentStatus.PENDING,
      publishedAt: f.publishNow ? existing.publishedAt ?? new Date() : wasPublished ? existing.publishedAt : null,
    },
  });

  revalidatePath("/admin/arthra");
  revalidatePath("/arthra");
  revalidatePath(`/arthra/${slug}`);
  redirect("/admin/arthra");
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/arthra");
  revalidatePath("/arthra");
}

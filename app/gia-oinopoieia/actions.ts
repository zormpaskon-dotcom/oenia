"use server";

import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { optionalFile, uploadImage } from "@/lib/upload";

export type WinerySubmitState = { error: string | null; success: boolean };

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || "oinopoieio";
  let attempt = 0;
  while (await prisma.winery.findUnique({ where: { slug }, select: { id: true } })) {
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }
  return slug;
}

export async function submitWineryAction(
  _prevState: WinerySubmitState,
  formData: FormData
): Promise<WinerySubmitState> {
  // Honeypot: αόρατο πεδίο για ανθρώπους, ελκυστικό για bots.
  if (String(formData.get("company") ?? "").trim()) {
    return { error: "Κάτι πήγε στραβό. Δοκίμασε ξανά.", success: false };
  }

  const ip = await clientIp();
  const allowed = await rateLimit(`winery-submit:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return { error: "Πάρα πολλές αιτήσεις από εδώ. Δοκίμασε ξανά αργότερα.", success: false };
  }

  const name = String(formData.get("name") ?? "").trim();
  const regionId = String(formData.get("regionId") ?? "");
  const foundedYearRaw = String(formData.get("foundedYear") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const acceptsVisitors = formData.get("acceptsVisitors") === "on";
  const isOrganic = formData.get("isOrganic") === "on";

  if (!name) return { error: "Το όνομα του οινοποιείου είναι υποχρεωτικό.", success: false };
  if (!regionId) return { error: "Διάλεξε περιοχή.", success: false };

  const region = await prisma.region.findUnique({ where: { id: regionId } });
  if (!region) return { error: "Η περιοχή δεν βρέθηκε.", success: false };

  const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : null;
  if (foundedYearRaw && (!Number.isInteger(foundedYear) || foundedYear! < 1800 || foundedYear! > new Date().getFullYear())) {
    return { error: "Το έτος ίδρυσης δεν είναι έγκυρο.", success: false };
  }

  let coverImage: string | null = null;
  const coverFile = optionalFile(formData, "coverImage");
  if (coverFile) {
    const result = await uploadImage(coverFile, "wineries");
    if (!result.ok) return { error: result.error, success: false };
    coverImage = result.url;
  }

  const slug = await uniqueSlug(slugify(name));

  await prisma.winery.create({
    data: {
      name,
      slug,
      regionId,
      foundedYear,
      description: description || null,
      websiteUrl: websiteUrl || null,
      email: email || null,
      phone: phone || null,
      acceptsVisitors,
      isOrganic,
      coverImage,
      status: ContentStatus.PENDING,
      isVerified: false,
    },
  });

  return { error: null, success: true };
}

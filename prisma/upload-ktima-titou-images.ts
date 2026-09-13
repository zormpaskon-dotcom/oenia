// Ανεβάζει τις φωτογραφίες ετικέτας των 2 κρασιών Μικρό Κτήμα Τίτου, με άδεια
// του χρήστη, απευθείας από το επίσημο site τους (mikroktimatitos.com). Ίδιο
// μοτίβο με upload-sclavos-images.ts — fetch() από το source URL.

import fs from "node:fs";
import path from "node:path";

const envLocalPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envLocalPath)) {
  for (const line of fs.readFileSync(envLocalPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim().replace(/^"(.*)"$/, "$1");
    if (!process.env[key]) process.env[key] = value;
  }
}

import { put } from "@vercel/blob";
import { prisma } from "../lib/prisma";

const WINE_IMAGE_MAP: Record<string, string> = {
  "mikro-ktima-titou-goumenissa": "https://www.mikroktimatitos.com/wp-content/uploads/2022/09/wine_photo.png",
  "mikro-ktima-titou-negoska": "https://www.mikroktimatitos.com/wp-content/uploads/2023/09/negoska_gr-2.png",
};

const WINERY_LOGO = "https://www.mikroktimatitos.com/wp-content/uploads/2022/09/logo_header.png";
const WINERY_COVER = "https://www.mikroktimatitos.com/wp-content/uploads/2022/11/intro_photo.png";

// Premium WineryProfile (lib/winery-images.ts) — το προϋπάρχον hero
// (intro_photo.png) ήταν hotlinked απευθείας στο mikroktimatitos.com και
// σπάει στο production (naturalWidth:0, το site μπλοκάρει cross-origin
// Referer). Αντικαθίσταται με φωτογραφίες από το ίδιο site, ανεβασμένες στο
// δικό μας Blob. Πηγή: https://www.mikroktimatitos.com/kthma/ (gallery).
const PROFILE_IMAGE_MAP: Record<string, string> = {
  hero: "https://www.mikroktimatitos.com/wp-content/uploads/2024/07/kthma-gallery-6.jpg",
  vineyard: "https://www.mikroktimatitos.com/wp-content/uploads/2022/11/kthma-gallery-1.jpg",
  winery: "https://www.mikroktimatitos.com/wp-content/uploads/2024/07/kthma-gallery-2.jpg",
  editorial: "https://www.mikroktimatitos.com/wp-content/uploads/2022/11/kthma-gallery-4.jpg",
};

async function fetchSource(url: string): Promise<Buffer> {
  // Το site έχει hotlink protection βάσει Referer — 503 χωρίς αυτό το header.
  const res = await fetch(url, {
    headers: {
      Referer: "https://www.mikroktimatitos.com/krasia/",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`${res.status} για ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, url] of Object.entries(WINE_IMAGE_MAP)) {
    try {
      const buffer = await fetchSource(url);
      const blob = await put(`wines/${slug}-${Date.now()}.png`, buffer, { access: "public", contentType: "image/png" });
      await prisma.wine.update({ where: { slug }, data: { labelImage: blob.url } });
      console.log(`✓ ${slug} -> ${blob.url}`);
    } catch (e) {
      console.error(`✗ ${slug}: ${(e as Error).message}`);
    }
  }

  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "mikro-ktima-titou" } });
  try {
    const logoBuffer = await fetchSource(WINERY_LOGO);
    const logoBlob = await put(`wineries/mikro-ktima-titou-logo-${Date.now()}.png`, logoBuffer, { access: "public", contentType: "image/png" });
    const coverBuffer = await fetchSource(WINERY_COVER);
    const coverBlob = await put(`wineries/mikro-ktima-titou-cover-${Date.now()}.png`, coverBuffer, { access: "public", contentType: "image/png" });
    await prisma.winery.update({
      where: { id: winery.id },
      data: { logoImage: logoBlob.url, coverImage: coverBlob.url },
    });
    console.log(`✓ winery logo -> ${logoBlob.url}`);
    console.log(`✓ winery cover -> ${coverBlob.url}`);
  } catch (e) {
    console.error(`✗ winery images: ${(e as Error).message}`);
  }

  console.log("\nProfile gallery (για lib/winery-images.ts, hardcode τα URLs χειροκίνητα):");
  for (const [category, url] of Object.entries(PROFILE_IMAGE_MAP)) {
    try {
      const buffer = await fetchSource(url);
      const blob = await put(`wineries/mikro-ktima-titou-${category}-${Date.now()}.jpg`, buffer, { access: "public", contentType: "image/jpeg" });
      console.log(`✓ ${category} -> ${blob.url}`);
    } catch (e) {
      console.error(`✗ ${category}: ${(e as Error).message}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

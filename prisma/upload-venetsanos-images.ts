// Ανεβάζει τις φωτογραφίες ετικέτας του Venetsanos Winery (κατεβασμένες
// από τις επίσημες σελίδες προϊόντων στο venetsanoswinery.com) στο Vercel
// Blob και ενημερώνει το labelImage κάθε κρασιού.

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

const SOURCE_DIR = "/tmp/venetsanos_img";

const IMAGE_MAP: Record<string, { file: string; contentType: string }> = {
  "venetsanos-assyrtiko": { file: "santorini.jpg", contentType: "image/jpeg" },
  "venetsanos-theory": { file: "theory.jpg", contentType: "image/jpeg" },
  "venetsanos-platani-athiri": { file: "platani_athiri.jpg", contentType: "image/jpeg" },
  "venetsanos-nykteri": { file: "nykteri.jpg", contentType: "image/jpeg" },
  "venetsanos-mandilaria": { file: "mandilaria.jpg", contentType: "image/jpeg" },
  "venetsanos-roseate": { file: "roseate.jpg", contentType: "image/jpeg" },
  "venetsanos-anagallis": { file: "anagallis.jpg", contentType: "image/jpeg" },
  "venetsanos-liastos": { file: "liastos.png", contentType: "image/png" },
  "venetsanos-vinsanto": { file: "vinsanto.jpg", contentType: "image/jpeg" },
  "venetsanos-vinsanto-12-years": { file: "vinsanto_12years.jpg", contentType: "image/jpeg" },
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, { file, contentType }] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(SOURCE_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const ext = contentType === "image/png" ? "png" : "jpg";
    const blob = await put(`wines/${slug}-${Date.now()}.${ext}`, buffer, {
      access: "public",
      contentType,
    });
    await prisma.wine.update({
      where: { slug },
      data: { labelImage: blob.url },
    });
    console.log(`✓ ${slug} -> ${blob.url}`);
  }

  console.log(`Done: ${Object.keys(IMAGE_MAP).length} φωτογραφίες ανέβηκαν.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

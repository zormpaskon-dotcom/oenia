// Ανεβάζει τις πραγματικές φωτογραφίες ετικέτας του Κτήματος Μουσών στο
// Vercel Blob και ενημερώνει το labelImage κάθε κρασιού. Οι φωτογραφίες
// δόθηκαν από τον χρήστη (απευθείας από το οινοποιείο) με άδεια χρήσης.

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

const SOURCE_DIR = "/Users/konstantinoszormpas/Desktop/muses";

const IMAGE_MAP: Record<string, string> = {
  "muses-estate-mouchtaro": "PACKSHOT MOUHTARO GREEK_2024.jpg",
  "muses-unicorn-mouchtaro": "FINAL mockup UNICORN 2022.jpg",
  "muses-chardonnay-fume": "PACKSHOT CHARDONNAY FUME_2025.jpg",
  "muses-cabernet-sauvignon": "PACKSHOT CABERNET SAUVIGNON_2022.jpg",
  "muses-crispy-assyrtiko": "PACKSHOT MUSES ESTATE ASSYRTIKO_BRUSH_GREEK copy.jpg",
  "muses-syrah": "PACKSHOT SYRAH 2022 QR 2 2.jpg",
  "muses-chrisolithos-white": "PACKSHOT CHRISOLITHOS WHITE 2022_NEW BOTTLE.jpg",
  "muses-chrisolithos-red": "PACKSHOT CHRISOLITHOS RED 2021_NEW BOTTLE.jpg",
  "muses-amuse-white": "PACKSHOT AMUSE WHITE 2025.jpg",
  "muses-amuse-rose": "PACKSHOT AMUSE ROSE 2025.jpg",
  "muses-ennea-white": "PACKSHOT KM 9 WHITE 2025.jpg",
  "muses-ennea-red": "PROSX PACKSHOT KM 9 RED 2022_NEW BOTTLE.jpg",
  "muses-ennea-rose": "PACKSHOT KM 9 ROSE 2022_NEW BOTTLE.jpg",
  "muses-ennea-savatiano": "PACKSHOT KM 9 WHITE 2022_NEW BOTTLE. SAVATIANOjpg.jpg",
  "muses-sweet-muse": "PACKSHOT SWEET MUSE.jpg",
  "muses-clione-white": "FINAL PACKSHOT NEW CLIONES WHITE.jpg",
  "muses-clione-red": "PACKSHOT NEW CLIONES RED.jpg",
  "muses-clione-rose": "PACKSHOT NEW CLIONES ROSE.jpg",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, filename] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(SOURCE_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const blob = await put(`wines/${slug}-${Date.now()}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
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

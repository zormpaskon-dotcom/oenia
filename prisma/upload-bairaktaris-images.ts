// Ανεβάζει τις πραγματικές φωτογραφίες ετικέτας του Κτήματος Μπαϊρακτάρη
// στο Vercel Blob και ενημερώνει το labelImage κάθε κρασιού. Οι
// φωτογραφίες δόθηκαν από τον χρήστη (απευθείας από το οινοποιείο).

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

const SOURCE_DIR = "/Users/konstantinoszormpas/Downloads";

const IMAGE_MAP: Record<string, string> = {
  "bairaktaris-313": "313-no-bg-Small.png",
  "bairaktaris-ktima": "Untitled-design-5.png",
  "bairaktaris-monolithos-red": "Red_χωρις-background-Small.png",
  "bairaktaris-rock-n-rose": "RockNRose_χωρις-background-Small.png",
  "bairaktaris-monolithos-rose": "Rose_χωρις-background-Small.png",
  "bairaktaris-sustainable-roditis": "Roditis_χωρις-background-Small.png",
  "bairaktaris-monolithos-white": "White_χωρις-background-Small.png",
  "bairaktaris-thesis-malagousia": "Thesis_χωρις-background-Small.png",
  "bairaktaris-rarus-k": "Rarus_no_bg-Small.png",
  "bairaktaris-terra-opus": "me-skia.png",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, filename] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(SOURCE_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const blob = await put(`wines/${slug}-${Date.now()}.png`, buffer, {
      access: "public",
      contentType: "image/png",
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

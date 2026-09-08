// Ανεβάζει τις πραγματικές φωτογραφίες ετικέτας του Κτήματος Κατώγι
// Αβέρωφ στο Vercel Blob και ενημερώνει το labelImage κάθε κρασιού.
// Φωτογραφίες από τις επίσημες σελίδες προϊόντων στο katogiaveroff.gr.

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

const SOURCE_DIR = "/tmp/katogi_img";

const IMAGE_MAP: Record<string, string> = {
  "katogi-averoff-white": "katogi-white.png",
  "katogi-averoff-rose": "katogi-rose.png",
  "katogi-averoff-red": "katogi-red.png",
  "inima-negoska-rose": "inima-negoska-rose.png",
  "inima-xinomavro": "inima-xinomavro.png",
  "inima-sauvignon-blanc": "inima-sauvignon-blanc.png",
  "inima-chardonnay-debina": "inima-chardonnay-debina.png",
  "alba-di-munte": "alba-di-munte.png",
  "rossiu-di-munte-yiniets": "yiniets.png",
  "rossiu-di-munte-vlachiko": "vlachiko.png",
  "rossiu-di-munte-pinot-noir": "pinot-noir.png",
  flogero: "flogero.png",
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

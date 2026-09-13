// Ανεβάζει τις 7 πραγματικές φωτογραφίες ετικέτας του Κτήμα Κίκονες, με άδεια
// του χρήστη, από τοπικά αρχεία (~/Desktop/reoenia). Ίδιο μοτίβο με
// upload-douloufakis-images.ts.

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

const SOURCE_DIR = "/Users/konstantinoszormpas/Desktop/reoenia";

const IMAGE_MAP: Record<string, string> = {
  "kikones-maron-sangiovese": "MARON RED 2021.png",
  "kikones-maron-lefkos": "MARON WHITE 2024.png",
  "kikones-chardonnay": "CHARDONNAY 2022.jpg",
  "kikones-roze": "ROSE 2025.png",
  "kikones-limnio": "ΛΗΜΝΙΟ ΚΙΚΟΝΕΣ.png",
  "kikones-ippeas": "IPPEAS KIKONES 2018.png",
  "kikones-syrah": "Syrah Kikones.jpg",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, filename] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(SOURCE_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    const blob = await put(`wines/${slug}-${Date.now()}${ext}`, buffer, {
      access: "public",
      contentType,
    });
    await prisma.wine.update({ where: { slug }, data: { labelImage: blob.url } });
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

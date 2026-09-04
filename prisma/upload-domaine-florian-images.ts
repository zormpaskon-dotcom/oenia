// Ανεβάζει τις φωτογραφίες ετικέτας των 8 κρασιών Domaine Florian που
// έχουν πλέον πραγματικά στοιχεία (seed-domaine-florian.ts). Ίδιο
// μοτίβο με το upload-douloufakis-images.ts — διαβάζει το .env.local
// χειροκίνητα πριν από το @vercel/blob import.

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

const SOURCE_DIR = "/Users/konstantinoszormpas/Desktop/domaine florian";

const IMAGE_MAP: Record<string, string> = {
  "domaine-florian-syrah": "SHY15-Front.jpg",
  "domaine-florian-casanova-barrique": "CASB13.jpg",
  "domaine-florian-chardonnay": "CH-21.jpg",
  "domaine-florian-chardonnay-barrique": "CHB-19.jpg",
  "domaine-florian-malagousia": "MAL-22.jpg",
  "domaine-florian-sauvignon-blanc": "SB-20.jpg",
  "domaine-florian-sauvignon-blanc-fume": "SBF-21.jpg",
  "domaine-florian-syrah-rose": "ROS-SYR-22.jpg",
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

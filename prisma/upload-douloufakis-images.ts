// Ανεβάζει τις 20 πραγματικές φωτογραφίες ετικέτας του Δουλουφάκη στο
// Vercel Blob και ενημερώνει το labelImage κάθε κρασιού. Τρέχεται
// ξεχωριστά από το seed-douloufakis.ts επειδή χρειάζεται
// BLOB_READ_WRITE_TOKEN, που δεν φορτώνεται αυτόματα σε standalone
// tsx scripts (μόνο μέσα από το Next.js runtime) — γι' αυτό διαβάζουμε
// το .env.local χειροκίνητα πριν από οτιδήποτε άλλο.

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

const SOURCE_DIR = "/Users/konstantinoszormpas/Desktop/douloufakis";

const IMAGE_MAP: Record<string, string> = {
  "douloufakis-dafnios-vidiano": "douloufakis-dafnios-white-wine-photo.png",
  "douloufakis-dafnios-red": "douloufakis-dafnios-red-wine-photo.png",
  "douloufakis-sauvignon-blanc": "douloufakis-sauvignon-blanc-wine-photo.png",
  "douloufakis-alargo-red": "douloufakis-alargo-red-wine-photo.png",
  "douloufakis-tachtas": "ΤΑΧΤΑΣ-ΛΕΥΚΟΣ-ΦΩΤΟΓΡΑΦΙΑ-ΣΕ-ΥΨΗΛΗ-ΑΝΑΛΥΣΗ.png",
  "douloufakis-notos-borias": "Notos-1-1-scaled.png",
  "douloufakis-dafnios-rose": "douloufakis-dafnios-rose-wine-photo.png",
  "douloufakis-afrodis": "douloufakis-sparkling-white-wine-photo.png",
  "douloufakis-aspros-lagos-white": "website_no-vintage-scaled.png",
  "douloufakis-enotria-white": "MG_8764-3-scaled.png",
  "douloufakis-epoch-red": "douloufakis-epoch-red-wine-photo.png",
  "douloufakis-alargo-white": "douloufakis-alargo-white-wine-photo.png",
  "douloufakis-sangiovese": "douloufakis-sangiovese-red-wine-photo.png",
  "douloufakis-epoch-white": "douloufakis-epoch-white-wine-photo.png",
  "douloufakis-enotria-red": "MG_8814-1-scaled-2.png",
  "douloufakis-aspros-lagos-red": "douloufakis-aspros-lagos-red-wine-photo.png",
  "douloufakis-femina": "Femina_white-background__-scaled.png",
  "douloufakis-enotria-rose": "MG_8790-1-scaled-3.png",
  "douloufakis-grande-reserve-dafnes": "douloufakis-grand-reserve-red-wine-photo.png",
  "douloufakis-helios": "douloufakis-helios-red-wine-photo.png",
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

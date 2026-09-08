// Ανεβάζει τις φωτογραφίες ετικέτας του Domaine Porto Carras (κατεβασμένες
// από τις επίσημες σελίδες προϊόντων στο domaineportocarras.com) στο
// Vercel Blob και ενημερώνει το labelImage κάθε κρασιού.

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

const SOURCE_DIR = "/tmp/portocarras_img";

const IMAGE_MAP: Record<string, { file: string; contentType: string }> = {
  "porto-carras-malagouzia": { file: "malagouzia.jpg", contentType: "image/jpeg" },
  "porto-carras-blanc-de-blancs": { file: "blanc-de-blancs.jpeg", contentType: "image/jpeg" },
  "porto-carras-rose-5": { file: "rose-5.jpg", contentType: "image/jpeg" },
  "porto-carras-chateau-2016": { file: "chateau-2016.jpg", contentType: "image/jpeg" },
  "porto-carras-plagies-melitona-2024": { file: "plagies-melitona-2024.jpg", contentType: "image/jpeg" },
  "porto-carras-le-grand-blanc-2019": { file: "le-grand-blanc-2019.jpg", contentType: "image/jpeg" },
  "porto-carras-porfyrogennitos": { file: "porfyrogennitos.jpg", contentType: "image/jpeg" },
  "porto-carras-asyrtiko-2023": { file: "asyrtiko-2023.jpg", contentType: "image/jpeg" },
  "porto-carras-limnio-2022": { file: "limnio-2022.jpg", contentType: "image/jpeg" },
  "porto-carras-chateau": { file: "chateau.jpg", contentType: "image/jpeg" },
  "porto-carras-syrah": { file: "syrah.jpg", contentType: "image/jpeg" },
  "porto-carras-magnus-b": { file: "magnus-b.jpg", contentType: "image/jpeg" },
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, { file, contentType }] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(SOURCE_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const blob = await put(`wines/${slug}-${Date.now()}.jpg`, buffer, {
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

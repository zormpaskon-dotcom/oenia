// Ανεβάζει τις επίσημες φωτογραφίες του T-Oinos (λογότυπο + 6 ετικέτες
// μπουκαλιών) στο Vercel Blob — από το επίσημο press kit του οινοποιείου
// (τοπικά αρχεία, "web use" resolution).

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

const PRESS_KIT = "/Users/konstantinoszormpas/Desktop/PRESS KIT";
const BOTTLES = `${PRESS_KIT}/PHOTOS/Bottles photos/bottles no date on label/web use`;

const WINE_IMAGES: { slug: string; file: string }[] = [
  { slug: "t-oinos-clos-stegasta-assyrtiko", file: "Clos Stegasta ASYRTIKO  .jpg" },
  { slug: "t-oinos-clos-stegasta-assyrtiko-rare", file: "Clos Stegasta ASYRTIKO RARE  .jpg" },
  { slug: "t-oinos-clos-stegasta-mavrotragano", file: "Clos Stegasta Mavrotragano .jpg" },
  { slug: "t-oinos-clos-stegasta-mavrotragano-rare", file: "Clos Stegasta Mavrotragano RARE .jpg" },
  { slug: "t-oinos-clos-stegasta-rose", file: "Clos Stegasta Rose.jpg" },
  { slug: "t-oinos-mavrose", file: "Mavrose.jpg" },
];

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  const logoPath = `${PRESS_KIT}/TOINOS_LOGO/TOINOS_LOGO-01.png`;
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBlob = await put(`wineries/t-oinos-logo-${Date.now()}.png`, logoBuffer, {
    access: "public",
    contentType: "image/png",
  });
  await prisma.winery.update({ where: { slug: "t-oinos" }, data: { logoImage: logoBlob.url } });
  console.log(`✓ winery logo -> ${logoBlob.url}`);

  for (const { slug, file } of WINE_IMAGES) {
    const filePath = path.join(BOTTLES, file);
    const buffer = fs.readFileSync(filePath);
    const blob = await put(`wines/${slug}-${Date.now()}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
    });
    await prisma.wine.update({ where: { slug }, data: { labelImage: blob.url } });
    console.log(`✓ ${slug} -> ${blob.url}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

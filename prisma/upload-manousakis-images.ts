// Ανεβάζει τις φωτογραφίες ετικέτας του Manousakis Winery στο Vercel
// Blob. Οι φωτογραφίες κατέβηκαν απευθείας από τα static.wixstatic.com
// URLs που είναι ενσωματωμένα στη σελίδα προϊόντων του επίσημου site.

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

const SOURCE_DIR = "/tmp/manousakis_img";

const IMAGE_MAP: Record<string, string> = {
  "manousakis-nostos-red": "blend.jpg",
  "manousakis-nostos-roussanne": "roussanne.jpg",
  "manousakis-nostos-assyrtiko": "assyrtiko.jpg",
  "manousakis-nostos-vidiano": "vidiano.jpg",
  "manousakis-nostos-muscat-of-spina": "muscat-spina.jpg",
  "manousakis-nostos-muscat-of-spina-orange": "muscat-spina-orange.jpg",
  "manousakis-nostos-romeiko": "romeiko.jpg",
  "manousakis-fumm": "fumm.jpg",
  "manousakis-nostos-pink": "pink.jpg",
  "manousakis-hartman-molavi": "hartman-molavi.jpg",
  "manousakis-planet-romeiko": "planet-romeiko.jpg",
  "manousakis-nostos-grenache": "grenache.jpg",
  "manousakis-nostos-mourvedre": "mourvedre.jpg",
  "manousakis-nostos-syrah": "syrah.jpg",
  "manousakis-nostos-alexandras": "alexandras.jpg",
  "manousakis-mrs": "mrs.jpg",
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

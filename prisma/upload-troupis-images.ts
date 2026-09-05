// Ανεβάζει τις φωτογραφίες ετικέτας των κρασιών Troupis Winery, με άδεια
// του οινοποιείου, από τοπικό φάκελο (WeTransfer). Ίδιο μοτίβο με τα
// προηγούμενα upload-*.ts.

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

const SOURCE_DIR = "/Users/konstantinoszormpas/Desktop/Gmail/wetransfer_troupis-winery_2026-09-05_0733";

const IMAGE_MAP: Record<string, string> = {
  "tomi-mantineia": "Troupis Winery - TOMH LEUKO HR.png",
  "tomi-roze": "Troupis Winery - TOMH ROSE HR.png",
  "holy-mania": "Troupis Winery - HOLY MANIA HR.png",
  "hoof-lur": "Troupis Winery - HOOF & LUR HR.png",
  "ekato": "Troupis Winery - EKATO HR.png",
  "pitys-ritinitis": "Troupis Winery - PITYS RITINITIS HR.png",
  "troupis-nemea": "Troupis Winery - NEMEA HR.png",
  "route-111": "Troupis Winery - ROUTE 111 HR.png",
  "sweet-route": "Troupis Winery - SWEET ROUTE HR.png",
  "route-gris": "Troupis Winery - ROUTE GRIS HR.png",
  "troupis-fteri-moschofilero": "Troupis Winery - FTERI LEUKO HR.png",
  "fteri-agiorgitiko-moschofilero": "Troupis Winery - FTERI ROZE HR.png",
  "fteri-agiorgitiko": "Troupis Winery - FTERI KOKKINO HR.png",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, filename] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(SOURCE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`✗ ${slug}: δεν βρέθηκε το αρχείο ${filePath}`);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const blob = await put(`wines/${slug}-${Date.now()}.png`, buffer, {
      access: "public",
      contentType: "image/png",
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

// Ανεβάζει τις φωτογραφίες ετικέτας των κρασιών Κτήμα Άλφα, με άδεια του
// οινοποιείου, από τοπικό φάκελο. Ίδιο μοτίβο με τα προηγούμενα upload-*.ts.

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

const SOURCE_DIR = "/Users/konstantinoszormpas/Desktop/Gmail";

const IMAGE_MAP: Record<string, string> = {
  "ecosystem-asyrtiko-agia-kyriaki": "Οικοσύστημα Ασύρτικο.jpg",
  "ecosystem-chardonnay-trampa": "Οικοσύστημα Chardonnay .jpg",
  "ecosystem-sauvignon-blanc-fume": "Οικοσύστημα Sauvignon Blanc Fume.jpg",
  "ecosystem-malagouzia-latypes": "Οικοσύστημα Μαλαγουζιά.jpg",
  "ecosystem-xinomayro-reserve-mparmpa-giannis": "Οικοσύστημα Ξινόμαυρο Reserve.jpg",
  "ecosystem-pinot-noir-strofi": "Οικοσύστημα Pinot Noir.jpg",
  "ecosystem-tannat-vrachos": "Οικοσύστημα Tannat.jpg",
  "alpha-one": "Κτήμα Άλφα One.jpg",
  "ktima-alfa-erythro-smx": "Κτήμα Άλφα S.M.X..jpg",
  "ktima-alfa-sauvignon-blanc": "Κτήμα Άλφα Sauvignon Blanc.jpg",
  "omega-opsimos-trygos": "Ωμέγα Late Harvest Ωμέγα Λευκός 500.jpeg",
  "chelones-malagoyzia": "Single Vineyard Μαλαγουζιά Χελώνες.JPG",
  "chelones-syrah": "Single Vineyard Syrah Χελώνες.jpg",
  "skantzochoiros-xinomayro": "Single Vineyard Ξινόμαυρο Σκαντζόχοιρος.jpg",
  "axia": "Αξία.JPG",
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
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : "image/jpeg";
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

// Ανεβάζει τις πραγματικές φωτογραφίες ετικέτας του Gaia Wines στο Vercel
// Blob και ενημερώνει το labelImage κάθε κρασιού. Οι φωτογραφίες δόθηκαν
// από τον χρήστη (TIFF από το gaiawines.gr, μετατράπηκαν σε JPG) με άδεια
// του οινοποιείου. Η Ammonite δεν ήταν στα TIFF — κατέβηκε απευθείας από
// το επίσημο site (μικρότερης ανάλυσης, είναι το μόνο διαθέσιμο εκεί).

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

const SOURCE_DIR = "/tmp/gaia_jpg";

const IMAGE_MAP: Record<string, string> = {
  "agiorgitiko-by-gaia": "gaiawines-assets-wines-gr-agiorgitiko-tis-gaias.jpg",
  "gaia-thalassitis": "gaiawines-assets-wines-gr-thalassitis.jpg",
  "gaia-thalassitis-cellar-aged": "THALASSITIS-cellar-aged-GR-906-x-2560pxl.jpg",
  "gaia-nychteri": "NYCHTERI-EU-new.jpg",
  "gaia-ammonite": "gaia-ammonite-reference.jpg",
  "gaia-asyrtiko-wild-ferment": "gaiawines-assets-wines-gr-asyrtiko-tis-gaias.jpg",
  "gaia-asyrtiko-clay": "ASSYRTIKO-CLAY-POP-wild-ferment.jpg",
  "gaia-vinsanto": "VISANTO-8-442x630-tiff.jpg",
  "gaia-ritinitis-nobilis": "gaiawines-assets-wines-gr-ritinitis-nobilis.jpg",
  "gaia-ktima-gaias": "gaiawines-assets-wines-gr-ktima-gaias.jpg",
  "gaia-optimus": "OPTIMUS-906x2156-1.jpg",
  "gaia-anatolikos": "gaiawines-assets-wines-gr-anatolikos-new.jpg",
  "gaia-4-6h": "gaiawines-assets-wines-gr-4-6h.jpg",
  "gaia-s-red": "GAIA-S-red.jpg",
  "gaia-s-white": "GAIASwhite.jpg",
  "gaia-s-rose": "GAIASrose.jpg",
  "gaia-monograph-asyrtiko": "gaiawines-assets-wines-gr-monograph-asyrtiko.jpg",
  "gaia-monograph-agiorgitiko": "gaiawines-assets-wines-gr-monograph-agiorgitiko.jpg",
  "gaia-monograph-agiorgitiko-syrah": "gaiawines-assets-wines-gr-monograph-agiorgitiko-syrah.jpg",
  "gaia-monograph-rose": "gaiawines-assets-wines-gr-monograph-rose.jpg",
  "gaia-monograph-multi": "multi.jpg",
  "gaia-monograph-moschofilero": "MONOGRAPH-mosxo-443x630-1.jpg",
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

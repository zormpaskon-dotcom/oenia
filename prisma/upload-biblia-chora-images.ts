// Ανεβάζει τις φωτογραφίες ετικέτας των κρασιών Κτήμα Βιβλία Χώρα, με άδεια
// του οινοποιείου, απευθείας από τις φωτογραφίες προϊόντος του site τους
// (bibliachora.gr/wp-content/uploads/...). Ίδιο μοτίβο με
// upload-douloufakis-images.ts / upload-domaine-florian-images.ts, αλλά εδώ
// οι εικόνες κατεβαίνουν με fetch() αντί να διαβάζονται τοπικά.

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

const IMAGE_MAP: Record<string, string> = {
  "ktima-vivlia-chora-leyko": "https://bibliachora.gr/wp-content/uploads/2021/07/ktima-white-eng.png",
  "ktima-vivlia-chora-roze": "https://bibliachora.gr/wp-content/uploads/2021/07/ktima-rose-eng.png",
  "ktima-vivlia-chora-erythro": "https://bibliachora.gr/wp-content/uploads/2021/07/ktima-red-eng.png",
  "areti-leyko": "https://bibliachora.gr/wp-content/uploads/2021/07/areti_white.png",
  "areti-erythro": "https://bibliachora.gr/wp-content/uploads/2021/07/areti-red.png",
  "vivlinos-roze": "https://bibliachora.gr/wp-content/uploads/2021/07/biblinos-rose.png",
  "vivlinos-erythro": "https://bibliachora.gr/wp-content/uploads/2021/07/biblinos-red.png",
  "plagios-leyko": "https://bibliachora.gr/wp-content/uploads/2021/07/plagios-white-eng.png",
  "plagios-erythro": "https://bibliachora.gr/wp-content/uploads/2021/07/plagios-red-eng.png",
  "ovilos-leyko": "https://bibliachora.gr/wp-content/uploads/2021/07/ovilos-white-eng.png",
  "ovilos-erythro": "https://bibliachora.gr/wp-content/uploads/2021/07/ovilos-red-eng.png",
  "sole-erythro": "https://bibliachora.gr/wp-content/uploads/2021/07/sole-pinot-noir.png",
  "sole-vidiano": "https://bibliachora.gr/wp-content/uploads/2021/07/sole-vidiano-1.png",
  "sole-semillon": "https://bibliachora.gr/wp-content/uploads/2021/07/semillon-traminer.png",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, url] of Object.entries(IMAGE_MAP)) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`✗ ${slug}: αποτυχία λήψης ${url} (${res.status})`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
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

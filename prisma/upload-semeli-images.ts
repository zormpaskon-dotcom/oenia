// Ανεβάζει τις φωτογραφίες ετικέτας των 27 κρασιών Semeli Estate, με άδεια
// του οινοποιείου, απευθείας από τις φωτογραφίες προϊόντος του site τους
// (semeliestate.gr). Ίδιο μοτίβο με upload-monsieur-nicolas-images.ts.

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
  // Λευκά
  "semeli-thea-mantinia": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Thea-1.png",
  "semeli-mantinia": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Mantinia-1.png",
  "semeli-elixir": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Elixir-1.png",
  "semeli-malagousia": "https://www.semeliestate.gr/wp-content/uploads/2017/01/malagousia.png",
  "semeli-aetheria": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Aetheria-1.png",
  "semeli-sofia": "https://www.semeliestate.gr/wp-content/uploads/2024/10/SemeliEstate_Sofia-1.png",
  "oreinos-helios-lefkos": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Semeli_OreinosHeliosWhite.png",
  "semeli-armonia-lefkos": "https://www.semeliestate.gr/wp-content/uploads/2025/05/Semeli_Armonia_White.png",
  "giorti-lefkos": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Semeli_Giorti_White_Stelvin.png",
  // Ερυθρά
  "chateau-semeli": "https://www.semeliestate.gr/wp-content/uploads/2017/01/chateau-temp.png",
  "semeli-spondee": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Spondee.png",
  "semeli-nemea-reserve": "https://www.semeliestate.gr/wp-content/uploads/2017/01/NemeaReserve-1.png",
  "oreinos-helios-erythros": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Semeli_OreinosHeliosRed.png",
  "giorti-erythros": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Semeli_Giorti_Red_Stelvin.png",
  "semeli-nemea-grande-reserve": "https://www.semeliestate.gr/wp-content/uploads/2017/01/GrandeReserve-1.png",
  "ktima-semeli": "https://www.semeliestate.gr/wp-content/uploads/2024/10/ktima_bottle.jpg",
  "semeli-espera": "https://www.semeliestate.gr/wp-content/uploads/2024/10/espera_4.png",
  "semeli-armonia-erythros": "https://www.semeliestate.gr/wp-content/uploads/2025/06/Semeli_Armonia_Red.png",
  // Ροζέ
  "semeli-delear": "https://www.semeliestate.gr/wp-content/uploads/2017/01/Delear-1.png",
  "oreinos-helios-roze": "https://www.semeliestate.gr/wp-content/uploads/2017/07/Semeli_OreinosHeliosRose.png",
  "giorti-roze": "https://www.semeliestate.gr/wp-content/uploads/2024/10/Semeli_Giorti_Rose_Stelvin.png",
  "semeli-armonia-roze": "https://www.semeliestate.gr/wp-content/uploads/2025/06/Semeli_Armonia_Rose.png",
  // Ημίγλυκα (Piccolo Mondo)
  "piccolo-mondo-lefkos": "https://www.semeliestate.gr/wp-content/uploads/2017/01/PiccoloWhite-1.png",
  "piccolo-mondo-erythros": "https://www.semeliestate.gr/wp-content/uploads/2017/01/PiccoloRed-1.png",
  "piccolo-mondo-roze": "https://www.semeliestate.gr/wp-content/uploads/2019/07/PiccoloRose-1.png",
  // Χαμηλού αλκοόλ
  "semeli-low-lefko": "https://www.semeliestate.gr/wp-content/uploads/2024/10/low_white.png",
  "semeli-low-roze": "https://www.semeliestate.gr/wp-content/uploads/2024/10/low_rose.png",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  let ok = 0;
  for (const [slug, url] of Object.entries(IMAGE_MAP)) {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      console.error(`✗ ${slug}: αποτυχία λήψης ${url} (${res.status})`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = url.toLowerCase().endsWith(".jpg") || url.toLowerCase().endsWith(".jpeg") ? "jpg" : "png";
    const contentType = ext === "jpg" ? "image/jpeg" : "image/png";
    const blob = await put(`wines/${slug}-${Date.now()}.${ext}`, buffer, {
      access: "public",
      contentType,
    });
    await prisma.wine.update({ where: { slug }, data: { labelImage: blob.url } });
    console.log(`✓ ${slug} -> ${blob.url}`);
    ok++;
  }

  console.log(`Done: ${ok}/${Object.keys(IMAGE_MAP).length} φωτογραφίες ανέβηκαν.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

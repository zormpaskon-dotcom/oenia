// Ανεβάζει τις φωτογραφίες ετικέτας των κρασιών Winery Monsieur Nicolas, με
// άδεια του οινοποιείου, απευθείας από τις φωτογραφίες προϊόντος του site
// τους (winerymonsieurnicolas.gr). Ίδιο μοτίβο με upload-biblia-chora-images.ts.

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

const BASE = "https://winerymonsieurnicolas.gr";

const IMAGE_MAP: Record<string, string> = {
  "noblis": "/system/uploads/image/image/92/big_wine_NOBLIS_WHITE_WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS_ONLINE.png",
  "noblis-magnum": "/system/uploads/image/image/137/big_wine_NOBLIS_MAGNUM_WHITE_WINE_WINERY_MONSIEUR_NICOLAS_ONLINE.png",
  "moi-je-men-fous-erythro": "/system/uploads/image/image/42/big_wine_MOI__JE_M_EN_FOUS__RED_DRY_WINE_WINERY_MONSIEUR_NICOLAS.png",
  "moi-je-men-fous-erythro-palaiomeno": "/system/uploads/image/image/93/big_wine_MOI__JE_M__EN_FOUS_AGED_RED_WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS_ONLINE.png",
  "moi-je-men-fous-leyko": "/system/uploads/image/image/40/big_wine_MOI__JE_M_EN_FOUS__WHITE_DRY_WINE_WINERY_MONSIEUR_NICOLAS.png",
  "moi-je-men-fous-roze": "/system/uploads/image/image/41/big_wine_MOI__JE_M_EN_FOUS__ROSE_DRY_WINE_WINERY_MONSIEUR_NICOLAS.png",
  "i-kyra-tis-limnis": "/system/uploads/image/image/30/big_wine_%CE%97_%CE%9A%CE%A5%CE%A1%CE%91_%CE%A4%CE%97%CE%A3_%CE%9B%CE%99%CE%9C%CE%9D%CE%97%CE%A3_WHITE_DRY_WINE_WIENRY_MONSIEUR_NICOLAS_KARAMITROS.png",
  "deucalion": "/system/uploads/image/image/102/big_wine_DEUCALION_WHITE__WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS_ONLINE.png",
  "snob-white": "/system/uploads/image/image/136/big_wine_SNOB_BRUT_SPARKLING_WHITE_WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS_ONLINE_A.png",
  "snob": "/system/uploads/image/image/125/big_wine_SNOB_ROSE_SPARKLING_WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS_ONLINE_C.png",
  "hit-the-road-white": "/system/uploads/image/image/97/big_wine_HIT_THE_ROAD_WHITE__WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS_ONLINE.png",
  "hit-the-road-red": "/system/uploads/image/image/98/big_wine_HIT_THE_ROAD_RED_WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS_ONLINE.png",
  "messenicola": "/system/uploads/image/image/103/big_wine_WINERY_MONSIEUR_NICOLAS_KARAMITROS_MESSENICOLA__RED_DRY_WINE__1_.png",
  "messenicola-syllekton": "/system/uploads/image/image/32/big_wine_MESSENICOLA_%CE%A3%CE%A5%CE%9B%CE%9B%CE%95%CE%9A%CE%A4%CE%A9%CE%9D_RED_DRY_WINE_WINERY_MONSIEUR_NICOLAS_KARAMITROS.png",
  "paradise-can-wait": "/system/uploads/image/image/39/big_wine_PARADISE_CAN_WAIT_RED_DRY_WINE_WINERY_MONSIEUR_NICOLAS.png",
  "apo-dyo-xoria": "/system/uploads/image/image/44/big_wine_%CE%91%CE%A0%CE%9F_%CE%94%CE%A5%CE%9F_%CE%A7%CE%A9%CE%A1%CE%99%CE%91_ROSE_DRY_WINE_WINERY_MONSIEUR_NICOLAS.png",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, urlPath] of Object.entries(IMAGE_MAP)) {
    const url = urlPath.startsWith("http") ? urlPath : `${BASE}${urlPath}`;
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

// Batch 1/7 των οινοποιείων που δεν είχαν ΚΑΜΙΑ φωτογραφία (ούτε winery
// logo, ούτε wine label) — μέρος της αρχικής λίστας ~88 οινοποιείων που
// είχε προστεθεί μόνο με κειμενικά στοιχεία, χωρίς εικόνες. Λογότυπο +
// φωτογραφία μπουκαλιού ανά οινοποιείο, απευθείας από το επίσημο site.
//
// Batch 1: Acra, Akriotou, Anatolikos, Anhydrous, Aoton, Argyriou,
// Artemis Karamolegos, Artisans Vignerons de Naoussa, Boutari, Cair.

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

type Entry = {
  wineryId: string;
  logoUrl?: string;
  wineSlug: string;
  wineImageUrl: string;
};

const ENTRIES: Entry[] = [
  {
    wineryId: "acra-winery",
    logoUrl: "https://www.acrawinery.com/assets/logo-dark-DXPPtvbL.png",
    wineSlug: "acra-nemea",
    wineImageUrl: "https://www.acrawinery.com/assets/bottle-nemea-CnoeIr_R.png",
  },
  {
    wineryId: "akriotou-microwinery",
    logoUrl: "https://akriotouwines.gr/wp-content/uploads/2018/12/logonew.png",
    wineSlug: "akriotou-orivatis-savatiano",
    wineImageUrl: "https://akriotouwines.gr/wp-content/uploads/2022/03/OrivatisWhite2-500x500.png",
  },
  {
    wineryId: "anatolikos-vineyards",
    logoUrl: "https://anatolikoswinery.gr/wp-content/uploads/2022/01/logo-white.png",
    wineSlug: "anatolikos-fine-assyrtiko",
    wineImageUrl: "https://anatolikoswinery.gr/wp-content/uploads/2022/01/present_Fine_Assyrtiko.png",
  },
  {
    wineryId: "anhydrous-winery",
    logoUrl: "https://www.anhydrouswinery.com/wp-content/uploads/2021/03/AnhydrousLogo-512.png",
    wineSlug: "anhydrous-afourae",
    wineImageUrl: "https://www.anhydrouswinery.com/wp-content/uploads/2022/08/Anhydrous-Afoura.jpg",
  },
  {
    wineryId: "aoton-winery",
    logoUrl: "https://aoton.gr/wp-content/uploads/2018/12/cropped-aoton_logo_white_letters.png",
    wineSlug: "aoton-savatiano",
    wineImageUrl: "https://aoton.gr/wp-content/uploads/2021/02/Savatiano-2019-1.png",
  },
  {
    wineryId: "argyriou-winery",
    logoUrl: "https://static.wixstatic.com/media/b105d0_1a0583e535e3464b8a31b9e4c9b0d328~mv2.png",
    wineSlug: "argyriou-erohos-red",
    wineImageUrl: "https://static.wixstatic.com/media/b105d0_fcfd35adbffd483f8a4f11384d0b2c8d~mv2.jpg",
  },
  {
    wineryId: "artemis-karamolegos",
    logoUrl: "https://www.artemiskaramolegos-winery.com/wp-content/uploads/2024/01/Artemis-Karamolegos-WineryLogo.png",
    wineSlug: "karamolegos-santorini",
    wineImageUrl: "https://www.artemiskaramolegos-winery.com/wp-content/uploads/2025/05/Santorini-Kouloura-scaled.jpg",
  },
  {
    wineryId: "artisans-vignerons-de-naoussa",
    logoUrl: "https://artisansvignerons.gr/wp-content/uploads/2019/12/logo.png",
    wineSlug: "artisans-vignerons-de-naoussa-skyphos-xinomavro",
    wineImageUrl: "https://artisansvignerons.gr/wp-content/uploads/2023/04/Artisans-Xinomavro-2019-2.png",
  },
  {
    wineryId: "boutari",
    // Κανένα καθαρό <img> logo βρέθηκε στο boutari.gr (πιθανώς inline SVG) — μόνο η φωτογραφία κρασιού.
    wineSlug: "naoussa-boutari",
    wineImageUrl: "https://boutari.gr/wp-content/uploads/2024/03/MAR_1876-259x1024.png",
  },
  {
    wineryId: "cair-winery",
    logoUrl: "https://cair.gr/wp-content/uploads/2021/06/cair-logo-120.png",
    wineSlug: "cair-rodos-2400-athiri",
    wineImageUrl: "https://cair.gr/wp-content/uploads/2021/06/Rodos-2400.png",
  },
];

async function fetchBuffer(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function extOf(url: string) {
  const m = url.match(/\.(png|jpe?g|webp)(\?|$)/i);
  return (m?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  // Website URLs που δεν υπήρχαν στη βάση (βρέθηκαν κατά την έρευνα)
  await prisma.winery.update({ where: { slug: "aoton-winery" }, data: { websiteUrl: "https://aoton.gr" } });
  await prisma.winery.update({
    where: { slug: "artisans-vignerons-de-naoussa" },
    data: { websiteUrl: "https://artisansvignerons.gr" },
  });

  for (const entry of ENTRIES) {
    if (entry.logoUrl) {
      const logoBuffer = await fetchBuffer(entry.logoUrl);
      const logoBlob = await put(`wineries/${entry.wineryId}-logo-${Date.now()}.${extOf(entry.logoUrl)}`, logoBuffer, {
        access: "public",
      });
      await prisma.winery.update({ where: { slug: entry.wineryId }, data: { logoImage: logoBlob.url } });
      console.log(`✓ ${entry.wineryId} logo -> ${logoBlob.url}`);
    }

    const wineBuffer = await fetchBuffer(entry.wineImageUrl);
    const wineBlob = await put(`wines/${entry.wineSlug}-${Date.now()}.${extOf(entry.wineImageUrl)}`, wineBuffer, {
      access: "public",
    });
    await prisma.wine.update({ where: { slug: entry.wineSlug }, data: { labelImage: wineBlob.url } });
    console.log(`✓ ${entry.wineSlug} -> ${wineBlob.url}`);
  }

  console.log("\nBatch 1 done: 10 wineries, logos + wine label images.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

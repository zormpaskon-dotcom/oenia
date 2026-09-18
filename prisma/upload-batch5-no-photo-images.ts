// Batch 5/7 των οινοποιείων που δεν είχαν ΚΑΜΙΑ φωτογραφία. Λογότυπο +
// φωτογραφία μπουκαλιού ανά οινοποιείο, απευθείας από το επίσημο site.
//
// Batch 5: Tetramythos, Vassaltis, Vriniotis, Zacharias, Αμπελώνες
// Μάρκου, Ελληνικά Κελλάρια Οίνων (Κουρτάκης), Κτήμα Βογιατζή, Κτήμα
// Βουρβουκέλη, Κτήμα Γκλίναβος, Κτήμα Δαλαμάρα.
//
// Σημειώσεις εξαιρέσεων:
// - Ελληνικά Κελλάρια Οίνων (Κουρτάκης): το websiteUrl στη βάση
//   (seaop.gr) είναι στην πραγματικότητα ο σύνδεσμος επαγγελματιών
//   αλκοολούχων ποτών, όχι το site του οινοποιείου — δεν βρέθηκε κανένα
//   πραγματικό consumer-facing site της Κουρτάκης. Δεν αγγίχτηκε.
// - Κτήμα Δαλαμάρα: δεν βρέθηκε κανένα επίσημο site (μικρό boutique
//   οινοποιείο, πωλείται μόνο μέσω εισαγωγέων/καβών).
// - Κτήμα Γκλίναβος: το site (glinavos.gr) επιστρέφει HTTP 466
//   (bot/hotlink protection) σε ΚΑΘΕ αίτημα εικόνας, ακόμη και με
//   browser User-Agent και Referer — αδύνατη η αυτοματοποιημένη λήψη.
//   Το logo/wine URL έχουν ήδη εντοπιστεί σωστά (βλ. σχόλιο παρακάτω)
//   αλλά δεν μπόρεσαν να ανέβουν.

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
  wineSlug?: string;
  wineImageUrl?: string;
};

const ENTRIES: Entry[] = [
  {
    wineryId: "tetramythos-winery",
    logoUrl: "https://www.tetramythoswines.com/wp-content/uploads/2025/07/4MYTH-LOGO.png",
    wineSlug: "tetramythos-mavro-kalavritino",
    wineImageUrl: "https://www.tetramythoswines.com/wp-content/uploads/2025/07/black_kalavritino.png",
  },
  {
    wineryId: "vassaltis-vineyards",
    logoUrl: "https://vassaltis.com/wp-content/uploads/2021/01/Vassaltis-logotype-1-1.png",
    wineSlug: "vassaltis-santorini",
    wineImageUrl: "https://vassaltis.com/wp-content/uploads/2023/08/santorini-1.png",
  },
  {
    wineryId: "vriniotis-winery",
    logoUrl: "https://www.vriniotiswinery.gr/wp-content/uploads/2024/03/vriniotis-winery-logo_n.png",
    wineSlug: "vriniotis-vradiano",
    wineImageUrl: "https://www.vriniotiswinery.gr/wp-content/uploads/2017/02/vradiano_new.png",
  },
  {
    wineryId: "zacharias-winery",
    logoUrl: "https://zacharias.gr/wp-content/uploads/2021/04/logo.png",
    wineSlug: "zacharias-nemea",
    wineImageUrl: "https://zacharias.gr/wp-content/uploads/2021/05/Nemea-Zacharias.png",
  },
  {
    wineryId: "markou-vineyards",
    logoUrl: "https://markouvineyards.gr/wp-content/uploads/2023/10/markou-vineyards-logo.png",
    wineSlug: "markou-savvatiano",
    wineImageUrl: "https://markouvineyards.gr/wp-content/uploads/2023/10/MARKOU-VINEYARDS_-SAVATIANO.png",
  },
  {
    wineryId: "voyatzi-winery",
    logoUrl: "https://ktimavoyatzi.gr/wp-content/uploads/2024/10/ktima-voyatzi-full-logo-regular.png",
    wineSlug: "voyatzi-xinomavro",
    wineImageUrl: "https://ktimavoyatzi.gr/wp-content/uploads/2023/07/ksinomauro-kokkino-front.png",
  },
  {
    wineryId: "vourvoukeli-estate",
    logoUrl: "https://vourvoukeli.gr/wp-content/uploads/2016/12/GRYPA_LAND-e1480943141627.png",
    wineSlug: "vourvoukeli-assyrtiko",
    wineImageUrl: "https://vourvoukeli.gr/wp-content/uploads/2022/10/Assyrtiko-85x300.jpg",
  },
  // domaine-glinavos: URLs γνωστά αλλά μπλοκάρονται με HTTP 466 σε κάθε
  // αίτημα — glinavos.gr/wp-content/uploads/2025/11/LOGO-GKLINAVOS-ENG.png
  // και .../debina--682x1024.png. Παραλείφθηκε από αυτό το batch.
];

async function fetchBuffer(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function extOf(url: string) {
  const clean = url.split("?")[0];
  const m = clean.match(/\.(png|jpe?g|webp|svg)$/i);
  return (m?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const entry of ENTRIES) {
    if (entry.logoUrl) {
      const logoBuffer = await fetchBuffer(entry.logoUrl);
      const logoBlob = await put(`wineries/${entry.wineryId}-logo-${Date.now()}.${extOf(entry.logoUrl)}`, logoBuffer, {
        access: "public",
      });
      await prisma.winery.update({ where: { slug: entry.wineryId }, data: { logoImage: logoBlob.url } });
      console.log(`✓ ${entry.wineryId} logo -> ${logoBlob.url}`);
    }

    if (entry.wineSlug && entry.wineImageUrl) {
      const wineBuffer = await fetchBuffer(entry.wineImageUrl);
      const wineBlob = await put(`wines/${entry.wineSlug}-${Date.now()}.${extOf(entry.wineImageUrl)}`, wineBuffer, {
        access: "public",
      });
      await prisma.wine.update({ where: { slug: entry.wineSlug }, data: { labelImage: wineBlob.url } });
      console.log(`✓ ${entry.wineSlug} -> ${wineBlob.url}`);
    }
  }

  console.log("\nBatch 5 done: 7 wineries με πλήρη logo+wine (Κουρτάκης + Δαλαμάρα: κανένα site βρέθηκε· Γκλίναβος: site μπλοκάρει fetch με HTTP 466).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Logo backfill, batch 1/3, για οινοποιεία που είχαν ήδη φωτογραφίες
// κρασιού αλλά όχι δικό τους λογότυπο (`winery.logoImage`). Μόνο
// λογότυπο ανά οινοποιείο εδώ, απευθείας από το επίσημο site.
//
// Batch 1: Alpha Estate, Ktima Bairaktaris, Boutari, Costa Lazaridi,
// Domaine Florian, Domaine Porto Carras, Domaine Sigalas, Douloufakis,
// Gaia Wines, Gavalas Winery.
//
// Σημειώσεις:
// - Alpha Estate: το site logo είναι inline SVG με raster εικόνα μέσα
//   σε base64 data URI (όχι fetchable URL) — χρησιμοποιήθηκε το
//   apple-touch-icon (κόκκινο μονόγραμμα "A") αντ' αυτού.
// - Boutari: το κύριο λογότυπο είναι επίσης inline vector SVG (χωρίς
//   raster εικόνα μέσα) — χρησιμοποιήθηκε το site icon 192x192.
// - Domaine Florian: το websiteUrl στη βάση ήταν κενό. Βρέθηκε το
//   πραγματικό site (domaineflorian.com, όχι .gr) και ενημερώθηκε.
// - Domaine Sigalas: δεν βρέθηκε ξεχωριστό "logo" img — χρησιμοποιήθηκε
//   το android-icon-192x192 site icon.
// - Gavalas Winery: Wix-hosted εικόνα — αφαιρέθηκαν τα crop/fill
//   transform params από το URL (κρατήθηκε μόνο το βασικό ~mv2.jpg)
//   για πλήρη ανάλυση.

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
  logoUrl: string;
};

const ENTRIES: Entry[] = [
  { wineryId: "alpha-estate", logoUrl: "https://alpha-estate.com/wp-content/themes/alpha/assets/favicon/apple-touch-icon.png" },
  { wineryId: "bairaktaris", logoUrl: "https://bairaktariswines.gr/wp-content/uploads/2025/07/Logo-black-horizontal-1.png" },
  { wineryId: "boutari", logoUrl: "https://boutari.gr/wp-content/uploads/2023/12/cropped-boutari-fav-192x192.png" },
  { wineryId: "costa-lazaridi", logoUrl: "https://estates-costalazaridi.gr/wp-content/uploads/2026/02/ecl_logo.svg" },
  { wineryId: "domaine-florian", logoUrl: "https://www.domaineflorian.com/media/light-logo-icon-192x192-1.png" },
  { wineryId: "domaine-porto-carras", logoUrl: "https://domaineportocarras.com/assets/img/logo.png" },
  { wineryId: "domaine-sigalas", logoUrl: "https://sigalas-wine.com/android-icon-192x192.png" },
  { wineryId: "douloufakis", logoUrl: "https://media.douloufakis.wine/uploads/2026/06/cropped-WEBsite-icon-Picsart-BackgroundRemover-scaled-1-192x192.png" },
  { wineryId: "gaia-wines", logoUrl: "https://gaiawines.gr/wp-content/uploads/2025/01/GAIA-LOGO-website-512x512pxl.jpg" },
  { wineryId: "gavalas-winery", logoUrl: "https://static.wixstatic.com/media/8569ce_3b772ff4e8e6430597618dc1c4163b9a~mv2.jpg" },
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

  await prisma.winery.update({ where: { slug: "domaine-florian" }, data: { websiteUrl: "https://www.domaineflorian.com" } });

  for (const entry of ENTRIES) {
    const logoBuffer = await fetchBuffer(entry.logoUrl);
    const logoBlob = await put(`wineries/${entry.wineryId}-logo-${Date.now()}.${extOf(entry.logoUrl)}`, logoBuffer, {
      access: "public",
    });
    await prisma.winery.update({ where: { slug: entry.wineryId }, data: { logoImage: logoBlob.url } });
    console.log(`✓ ${entry.wineryId} logo -> ${logoBlob.url}`);
  }

  console.log("\nLogo batch 1/3 done: 10 wineries, 1 websiteUrl συμπληρώθηκε (Domaine Florian).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

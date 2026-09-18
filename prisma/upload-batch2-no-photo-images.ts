// Batch 2/7 των οινοποιείων που δεν είχαν ΚΑΜΙΑ φωτογραφία. Λογότυπο +
// φωτογραφία μπουκαλιού ανά οινοποιείο, απευθείας από το επίσημο site.
//
// Batch 2: Canava Chrissou-Tselepos, Château Harlaftis, Château Nico
// Lazaridi, Domaine Economou, Domaine Hatzimichalis, Domaine Karanika,
// Domaine Nerantzi, Estate Argyros, Estate Manolesakis, Estate
// Papaioannou.
//
// Σημειώσεις εξαιρέσεων (καμία φωτογραφία κρασιού δεν βρέθηκε):
// - Domaine Economou: το επίσημο site είναι ένα placeholder με μόνο
//   στοιχεία επικοινωνίας, καμία φωτογραφία προϊόντος πουθενά.
// - Domaine Karanika: το site φαίνεται να έχει μεταστραφεί αποκλειστικά
//   σε αφρώδη κρασιά — το "Old Vines" Ξινόμαυρο δεν βρέθηκε πουθενά.
// - Estate Argyros: η σελίδα /wines/ κάνει 302 redirect στο /tour/ ακόμα
//   και μετά την επιβεβαίωση ηλικίας — πιθανό πρόβλημα στο ίδιο το site
//   αυτή τη στιγμή. Πήρα μόνο το winery logo.

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
    wineryId: "canava-chrissou-tselepos",
    logoUrl: "https://tselepos.gr/wp-content/uploads/2019/12/tw_logo_retina.png",
    wineSlug: "canava-chrissou-nykteri",
    wineImageUrl: "https://tselepos.gr/wp-content/uploads/2019/11/canava_chryssou_nyxteri_GR-200x346.jpg",
  },
  {
    wineryId: "harlaftis-estate",
    logoUrl: "https://www.harlaftis.gr/imgs/xarlaftis_logo.png",
    wineSlug: "harlaftis-cabernet-sauvignon",
    wineImageUrl: "https://www.harlaftis.gr/imgs/wines/harlaftis_cabernet_sauvignon.jpg",
  },
  {
    wineryId: "nico-lazaridi",
    logoUrl: "https://chateau-lazaridi.com/wp-content/swift-ai/images/wp-content/uploads/2025/09/logo1-png.webp",
    wineSlug: "nico-lazaridi-magiko-vouno-red",
    wineImageUrl:
      "https://chateau-lazaridi.com/wp-content/swift-ai/images/wp-content/uploads/2025/10/MAGIC-MOUNTAIN-RED-2019-scaled-jpg.webp",
  },
  {
    wineryId: "domaine-economou",
    logoUrl: "https://domaine-economou.com/wp-content/uploads/2022/04/ek.png",
    // Καμία φωτογραφία κρασιού διαθέσιμη — το site είναι placeholder.
  },
  {
    wineryId: "domaine-hatzimichalis",
    logoUrl:
      "https://images.squarespace-cdn.com/content/v1/5fa046fb979c1b05b3dde3ff/1604341693101-9QLNCHU5N4W1H127BKT5/logo_KTHMA_XATZIM-removebg-preview.png",
    wineSlug: "ktima-chatzimichali-cabernet-sauvignon",
    wineImageUrl:
      "https://images.squarespace-cdn.com/content/v1/5fa046fb979c1b05b3dde3ff/1640285438741-0HND1SUYAQE957CYK5PS/Cabernet-Sauvignon-Red-Wine.jpg",
  },
  {
    wineryId: "domaine-karanika",
    logoUrl: "https://karanika.com/wp-content/uploads/2022/11/karanika-logo-02.svg",
    // Το "Old Vines" Ξινόμαυρο δεν βρέθηκε στο τρέχον site (φαίνεται να
    // έχουν μεταστραφεί αποκλειστικά σε αφρώδη κρασιά).
  },
  {
    wineryId: "domaine-nerantzi",
    logoUrl: "https://www.nerantzi.com/wp-content/uploads/2020/03/Logo-04.png",
    wineSlug: "nerantzi-assyrtiko",
    wineImageUrl: "https://www.nerantzi.com/wp-content/uploads/2020/06/assyrtiko.png",
  },
  {
    wineryId: "estate-argyros",
    logoUrl: "https://estateargyros.com/wp-content/uploads/2024/02/logo-EstateArgyros.webp",
    // /wines/ κάνει 302 redirect σε /tour/ — καμία φωτογραφία κρασιού βρέθηκε.
  },
  {
    wineryId: "manolesakis-estate",
    logoUrl:
      "https://manolesakis.gr/wp-content/uploads/2023/01/%CE%A3%CF%87%CE%AD%CE%B4%CE%B9%CE%BF-%CF%87%CF%89%CF%81%CE%AF%CF%82-%CF%84%CE%AF%CF%84%CE%BB%CE%BF-2023-01-11T124537.967.png",
    wineSlug: "gennima-psihis-white",
    wineImageUrl:
      "https://manolesakis.gr/wp-content/uploads/2023/03/%CE%93%CE%95%CE%9D%CE%9D%CE%97%CE%9C%CE%91-%CE%9B%CE%95%CE%A5%CE%9A%CE%9F-1-1.png",
  },
  {
    wineryId: "papaioannou-estate",
    logoUrl: "https://www.papaioannouwines.gr/images/logo_papaioannou.png",
    wineSlug: "papaioannou-palea-klimata",
    wineImageUrl: "https://www.papaioannouwines.gr/media/k2/items/cache/19f9cefdfb07230a68581d617885a3af_S.jpg",
  },
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

  // Website URLs που δεν υπήρχαν στη βάση (βρέθηκαν κατά την έρευνα)
  await prisma.winery.update({ where: { slug: "nico-lazaridi" }, data: { websiteUrl: "https://chateau-lazaridi.com/en/" } });
  await prisma.winery.update({ where: { slug: "manolesakis-estate" }, data: { websiteUrl: "https://manolesakis.gr/en/" } });
  await prisma.winery.update({ where: { slug: "papaioannou-estate" }, data: { websiteUrl: "https://www.papaioannouwines.gr" } });

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
    } else {
      console.log(`⚠ ${entry.wineryId}: καμία φωτογραφία κρασιού διαθέσιμη — παραλείφθηκε`);
    }
  }

  console.log("\nBatch 2 done: 10 wineries (8 πλήρη logo+wine, 1 μόνο logo χωρίς wine photo — Economou/Karanika, 1 μόνο logo — Argyros).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Batch 4/7 των οινοποιείων που δεν είχαν ΚΑΜΙΑ φωτογραφία. Λογότυπο +
// φωτογραφία μπουκαλιού ανά οινοποιείο, απευθείας από το επίσημο site.
//
// Batch 4: Magoutes, Monemvasia Winery Tsimbidi, Moraitis, Patoinos,
// Petrakopoulos, Pnevmatikakis, Rouvalis, Santo Wines, Sarris,
// Strataridakis.
//
// Σημειώσεις εξαιρέσεων:
// - Magoutes: δεν βρέθηκε ξεχωριστή σελίδα/φωτογραφία κρασιού (μόνο
//   ένα PDF γευσιγνωσίας).
// - Monemvasia Winery Tsimbidi: δεν βρέθηκε ξεχωριστό winery logo.
// - Petrakopoulos: το "Robola Bio" δεν αντιστοιχεί καθαρά σε καμία
//   τρέχουσα ετικέτα του site (Orina/Palia Armakia, Thymari Petras) —
//   ούτε logo βρέθηκε. Προστέθηκε μόνο το websiteUrl που έλειπε.
// - Pnevmatikakis: η σελίδα λευκού κρασιού δεν έδειξε προϊόντα.
// - Rouvalis: ο χρήστης αρνήθηκε ένα permission prompt για JS execution
//   στο domain αυτό ενώ έψαχνα το logo — δεν το ξαναζήτησα, μόνο η
//   φωτογραφία κρασιού (ήδη βρεθείσα πριν) χρησιμοποιήθηκε.

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
    wineryId: "magoutes-vineyard",
    logoUrl: "https://magoutes.com/wp-content/uploads/2025/03/MAGOUTES-SIATISTA-LOGO.png",
  },
  {
    wineryId: "monemvasia-winery-tsimbidi",
    wineSlug: "monemvasia-tsimbidi-assyrtiko",
    wineImageUrl: "https://www.monemvasiawinery.gr/wp-content/uploads/2025/05/tsimbidis_asyrtiko_new.jpg",
  },
  {
    wineryId: "moraitis-winery",
    logoUrl: "https://moraitiswines.gr/wp-content/uploads/2024/07/moraitis-logo-441.png",
    wineSlug: "moraitis-paros-monemvasia",
    wineImageUrl: "https://moraitiswines.gr/wp-content/uploads/2020/12/MORAITIS-MALVASIA2.png",
  },
  {
    wineryId: "patoinos-winery",
    logoUrl: "https://gr.patoinos.ch/images/u/patoinos_2025_logo_couleur_fond_gr-412.webp",
    wineSlug: "patoinos-assyrtiko",
    wineImageUrl: "https://gr.patoinos.ch/images/1/patoinos_2026_bouteilleblanc_couchee_sansombre-3578.png",
  },
  {
    wineryId: "pnevmatikakis-winery",
    logoUrl: "https://pnevmatikakiswinery.gr/wp-content/uploads/2021/04/white-small-1.png",
  },
  {
    wineryId: "rouvalis-winery",
    wineSlug: "rouvalis-asprolithi",
    wineImageUrl: "https://www.rouvaliswinery.gr/wp-content/uploads/2020/12/asprolithi-bottle-0x940-c-default.jpg",
  },
  {
    wineryId: "santo-wines",
    logoUrl: "https://santowines.gr/images/santowines-winery-new-logo-black.png",
    wineSlug: "santo-wines-nykteri",
    wineImageUrl: "https://santowines.gr/images/wines/NYKTERI_2021_NV.png",
  },
  {
    wineryId: "sarris-winery",
    logoUrl: "https://sarriswinery.com/wp-content/uploads/2020/03/LOGO_SARRIS_w60.png",
    wineSlug: "sarris-robola",
    wineImageUrl: "https://sarriswinery.com/wp-content/uploads/2020/04/ROBOLA-LEVKI-copy-1-e1740206659440.png",
  },
  {
    wineryId: "strataridakis-winery",
    logoUrl: "https://static.strataridakis.gr/img/logo-header.svg",
    wineSlug: "strataridakis-moschato-spinas",
    wineImageUrl: "https://static.strataridakis.gr/files/wines-top-photo/leyka/moschato-spinas.jpg",
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

  await prisma.winery.update({ where: { slug: "petrakopoulos-wines" }, data: { websiteUrl: "https://petrakopouloswines.gr/en/" } });

  for (const entry of ENTRIES) {
    if (entry.logoUrl) {
      const logoBuffer = await fetchBuffer(entry.logoUrl);
      const logoBlob = await put(`wineries/${entry.wineryId}-logo-${Date.now()}.${extOf(entry.logoUrl)}`, logoBuffer, {
        access: "public",
      });
      await prisma.winery.update({ where: { slug: entry.wineryId }, data: { logoImage: logoBlob.url } });
      console.log(`✓ ${entry.wineryId} logo -> ${logoBlob.url}`);
    } else {
      console.log(`⚠ ${entry.wineryId}: κανένα logo διαθέσιμο — παραλείφθηκε`);
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

  console.log("\nBatch 4 done: 10 wineries (7/10 logo, 7/10 wine photo, 1 websiteUrl συμπληρώθηκε).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

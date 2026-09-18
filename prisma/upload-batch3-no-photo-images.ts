// Batch 3/7 των οινοποιείων που δεν είχαν ΚΑΜΙΑ φωτογραφία. Λογότυπο +
// φωτογραφία μπουκαλιού ανά οινοποιείο, απευθείας από το επίσημο site.
//
// Batch 3: Gentilini, Hatzidakis, Idaia, Karavitakis, Kechris, Kitrvs,
// Kokotos Estate, Kontozisis, Koutsoyannopoulos, Lafazanis.
//
// Σημειώσεις εξαιρέσεων:
// - Karavitakis: η σελίδα /wines/ δείχνει "Coming soon…" στο ίδιο το
//   site τους αυτή τη στιγμή — καμία φωτογραφία κρασιού διαθέσιμη.
// - Lafazanis: δεν βρέθηκε ξεχωριστό winery logo (μόνο cover/hero photos).
// - Kontozisis: το "A-Grafo Limniona Ancestral" (ροζέ) δεν βρέθηκε με
//   αυτό το όνομα στο τρέχον site — η σειρά φαίνεται να μετονομάστηκε σε
//   "Sun". Χρησιμοποιήθηκε το "Sun Rose Limniona" ως το πλησιέστερο
//   αντίστοιχο (ίδιο χρώμα, ίδια ποικιλία).

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
    wineryId: "gentilini",
    logoUrl: "https://gentilini.gr/wp-content/uploads/2020/02/gentilini-logo170.png",
    wineSlug: "gentilini-robola",
    wineImageUrl: "https://gentilini.gr/wp-content/uploads/2023/05/gentilini-robola-2022.png",
  },
  {
    wineryId: "hatzidakis",
    logoUrl: "https://www.hatzidakiswines.gr/fileadmin/content/img/logo.png",
    wineSlug: "hatzidakis-mavrotragano",
    wineImageUrl: "https://www.hatzidakiswines.gr/fileadmin/content/img/labels/122020/Mavrotragano_car.png",
  },
  {
    wineryId: "idaia-winery",
    logoUrl: "https://www.idaiawinery.com/wp-content/uploads/2023/04/Idaia-Winery_new-Logo.png",
    wineSlug: "idaia-vidiano",
    wineImageUrl: "https://www.idaiawinery.com/wp-content/uploads/2023/06/VIDIANO-wine-e1742989242975.jpg",
  },
  {
    wineryId: "karavitakis",
    logoUrl: "https://www.karavitakiswines.com/wp-content/uploads/2018/07/logo01.png",
    // Η σελίδα /wines/ δείχνει "Coming soon…" — καμία φωτογραφία κρασιού.
  },
  {
    wineryId: "kechris",
    logoUrl: "https://www.kechris.gr/themes/default-bootstrap/img/top-logo-el-gr.jpg",
    wineSlug: "kechribari-retsina",
    wineImageUrl: "https://www.kechris.gr/95-big-on-height/%CE%BA%CE%B5%CF%87%CF%81%CE%B9%CE%BC%CF%80%CE%B1%CF%81%CE%B9.jpg",
  },
  {
    wineryId: "kitrvs",
    logoUrl: "https://kitrus.gr/wp-content/uploads/2022/12/logo-kitrus-black.svg",
    wineSlug: "kitrvs-malagousia",
    wineImageUrl: "https://kitrus.gr/wp-content/uploads/2022/11/1-980x1470.jpg",
  },
  {
    wineryId: "kokotos-estate",
    logoUrl: "https://kokotosestate.gr/wp-content/uploads/2025/09/kokotos-estate-logo.png",
    wineSlug: "kokotos-estate-cabernet-merlot",
    wineImageUrl: "https://kokotosestate.gr/wp-content/uploads/2020/09/kokotos-estate-2021.jpg",
  },
  {
    wineryId: "kontozisis-organic-vineyards",
    logoUrl: "https://kontozisiswines.com/wp-content/uploads/2025/03/LOGO.png",
    wineSlug: "kontozisis-a-grafo-limniona-ancestral",
    wineImageUrl: "https://kontozisiswines.com/wp-content/uploads/2025/03/sun-rose-limniona-kontozisi-980x1718.png",
  },
  {
    wineryId: "koutsoyannopoulos-winery",
    logoUrl: "https://kwm.gr/images/koutsogiannopoulos-santorini-wine-museum.png",
    wineSlug: "koutsoyannopoulos-santorini-assyrtiko",
    wineImageUrl: "https://kwm.gr/images/stories/virtuemart/product/KWM-ASSYRTIKO-750ml3.jpg",
  },
  {
    wineryId: "lafazanis-winery",
    // Δεν βρέθηκε ξεχωριστό winery logo.
    wineSlug: "lafazanis-nemea-agiorgitiko",
    wineImageUrl: "https://lafazanis.gr/wp-content/uploads/2026/01/OINOPEDIO-KLEONON-NEMEA.png",
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

  console.log("\nBatch 3 done: 10 wineries (9/10 logo, 9/10 wine photo).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Batch 7/7 (ΤΕΛΕΥΤΑΙΟ) των οινοποιείων που δεν είχαν ΚΑΜΙΑ φωτογραφία.
// Λογότυπο + φωτογραφία μπουκαλιού ανά οινοποιείο, απευθείας από το
// επίσημο site.
//
// Batch 7: Κτήμα Διαμαντάκος, Οινοποιείο Λυραράκη (2 κρασιά), Οινοποιείο
// Ντούγκος, Οινοποιείο Παπαγιαννάκος.
//
// Σημειώσεις εξαιρέσεων (κανένα επίσημο source βρέθηκε — 7 οινοποιεία
// παραμένουν χωρίς φωτογραφία):
// - Petrakopoulos Wines: το "Robola Bio" δεν αντιστοιχεί καθαρά σε καμία
//   τρέχουσα ετικέτα (Orina/Palia Armakia, Thymari Petras) — ούτε logo
//   βρέθηκε στο site.
// - Ελληνικά Κελλάρια Οίνων (Κουρτάκης): το websiteUrl στη βάση
//   (seaop.gr) ήταν λάθος site. Το πραγματικό official domain
//   (greekwinecellars.com) είναι πλέον νεκρό (DNS δεν επιλύεται). Η
//   εταιρεία εξαγοράστηκε από την Cavino το 2025, αλλά το "Kouros"
//   brand δεν εμφανίζεται ακόμα στον κατάλογο του cavino.gr.
// - Κτήμα Γκλίναβος: ολόκληρο το domain (glinavos.gr και το
//   products.glinavos.gr subdomain) είναι πλέον parked/νεκρό
//   (hosting placeholder «Websupport», όχι πια HTTP 466 block).
// - Κτήμα Δαλαμάρα: το dalamara.gr δείχνει ρητά "Under Constraction".
// - Κτήμα Ρωξάνη Μάτσα: κανένα δικό της site. Το "Μαλαγουζιά Μάτσα"
//   ήταν παλιά ετικέτα σε συνεργασία με τα Οινοποιεία Μπουτάρη
//   (boutari.gr) αλλά δεν εμφανίζεται πια στον τρέχοντα κατάλογό τους.
// - Μινώς Μηλιαράκης: το minoswines.gr δείχνει "Under construction".
// - Συνεταιρισμός Παραγωγών Ρομπόλας Κεφαλληνίας: δεν βρέθηκε ποτέ να
//   έχει δικό του website (μόνο Facebook + αναφορές σε wines of greece
//   / τουριστικά sites).

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
  wines?: { slug: string; imageUrl: string }[];
};

const ENTRIES: Entry[] = [
  {
    wineryId: "diamantakos",
    logoUrl: "https://diamantakos.gr/wp-content/uploads/2023/01/DIAMANTAKOS_LOGO_FINAL-1.png",
    wines: [
      // Το DB wine "diamantakos-xinomavro" αντιστοιχεί στην ετικέτα
      // "NAOUSSA" του site — Νάουσα ΠΟΠ είναι εξ ορισμού 100% Ξινόμαυρο.
      { slug: "diamantakos-xinomavro", imageUrl: "https://diamantakos.gr/wp-content/uploads/2024/02/Diamantakos_Naousa_Preknadi_2020.png" },
    ],
  },
  {
    wineryId: "lyrarakis",
    logoUrl: "https://moredigital.gr/logos/lyrarakis-black.jpg",
    wines: [
      { slug: "lyrarakis-plyto-psarades", imageUrl: "https://www.lyrarakis.com/img/bottles/Plyto.Psarades.Bottle.png" },
      { slug: "lyrarakis-dafni-psarades", imageUrl: "https://www.lyrarakis.com/img/bottles/Dafni.Psarades.Bottle.png" },
    ],
  },
  {
    wineryId: "oinopoieio-ntougkos",
    logoUrl: "https://dougos.gr/welcome/wp-content/uploads/2022/03/logo@2x-1.png",
    wines: [
      { slug: "rapsani-old-vines-ntougkos", imageUrl: "https://dougos.gr/welcome/wp-content/uploads/2022/03/dougosoldvinesnc.png" },
    ],
  },
  {
    wineryId: "papagiannakos-winery",
    logoUrl: "https://papagiannakos.gr/wp-content/uploads/2021/07/logo_200_98_black_greek.png",
    wines: [
      { slug: "papagiannakos-savatiano-old-vines", imageUrl: "https://papagiannakos.gr/wp-content/uploads/2022/12/savatiano-gr-600x900.png" },
    ],
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

  // websiteUrl διορθώσεις (βρέθηκαν λάθος/παρωχειμένα URLs στη βάση)
  await prisma.winery.update({ where: { slug: "oinopoieio-ntougkos" }, data: { websiteUrl: "https://dougos.gr" } });

  for (const entry of ENTRIES) {
    if (entry.logoUrl) {
      const logoBuffer = await fetchBuffer(entry.logoUrl);
      const logoBlob = await put(`wineries/${entry.wineryId}-logo-${Date.now()}.${extOf(entry.logoUrl)}`, logoBuffer, {
        access: "public",
      });
      await prisma.winery.update({ where: { slug: entry.wineryId }, data: { logoImage: logoBlob.url } });
      console.log(`✓ ${entry.wineryId} logo -> ${logoBlob.url}`);
    }

    for (const wine of entry.wines ?? []) {
      const wineBuffer = await fetchBuffer(wine.imageUrl);
      const wineBlob = await put(`wines/${wine.slug}-${Date.now()}.${extOf(wine.imageUrl)}`, wineBuffer, {
        access: "public",
      });
      await prisma.wine.update({ where: { slug: wine.slug }, data: { labelImage: wineBlob.url } });
      console.log(`✓ ${wine.slug} -> ${wineBlob.url}`);
    }
  }

  console.log(
    "\nBatch 7 (τελευταίο) done: 4 wineries με πλήρη logo+wine (5 φωτογραφίες κρασιού συνολικά). " +
      "7 wineries παραμένουν χωρίς φωτογραφία — κανένα χρησιμοποιήσιμο επίσημο source (βλ. σχόλια στην κορυφή)."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

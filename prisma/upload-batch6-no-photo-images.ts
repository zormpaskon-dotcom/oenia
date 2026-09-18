// Batch 6/7 των οινοποιείων που δεν είχαν ΚΑΜΙΑ φωτογραφία. Λογότυπο +
// φωτογραφία μπουκαλιού ανά οινοποιείο, απευθείας από το επίσημο site.
//
// Batch 6: Κτήμα Ζαφειράκη, Κτήμα Θεόπετρα (Τσιλιλής), Κτήμα Κυρ-Γιάννη,
// Κτήμα Κώστα Λαζαρίδη, Κτήμα Μερκούρη, Κτήμα Ρωξάνη Μάτσα, Κτήμα
// Τσέλεπος, Μινώς Μηλιαράκης, Οινοποιεία Αϊδαρίνη, Οινοποιείο Γκαράλη.
//
// Σημειώσεις εξαιρέσεων:
// - Κτήμα Κώστα Λαζαρίδη: το websiteUrl στη βάση (domaine-lazaridi.gr)
//   δείχνει "Account Suspended" — νεκρό domain. Βρέθηκε το πραγματικό,
//   ενεργό site (estates-costalazaridi.gr, ήδη γνωστό από
//   lib/winery-images.ts) και ενημερώθηκε το websiteUrl. Δεν βρέθηκε
//   ξεχωριστό logo σε αυτό το site.
// - Κτήμα Ρωξάνη Μάτσα: δεν βρέθηκε κανένα επίσημο site (μόνο κάβες/
//   retailers).
// - Μινώς Μηλιαράκης: δεν βρέθηκε κανένα επίσημο site.

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
    wineryId: "domaine-zafeirakis",
    logoUrl: "https://static.wixstatic.com/media/088689_9c56da41434644b8be815a7b26ee49f1~mv2.png",
    wineSlug: "zafeirakis-limniona",
    wineImageUrl: "https://static.wixstatic.com/media/088689_f7090333e47e440a9280eb129788acb4~mv2.jpg",
  },
  {
    wineryId: "theopetra-estate",
    logoUrl: "https://www.tsililis.gr/english/img/logo.png",
    wineSlug: "theopetra-limniona",
    wineImageUrl: "https://www.tsililis.gr/files/photoThumb/201811014326_limniona-erythros.jpg",
  },
  {
    wineryId: "kir-yianni",
    // Το logo.svg (theme assets path) επιστρέφει HTTP 403 σε αυτοματοποιημένα
    // αιτήματα — μόνο η φωτογραφία κρασιού (hosted αλλού) είναι προσβάσιμη.
    wineSlug: "kir-yianni-ramnista",
    wineImageUrl: "https://kiryianni-b3ddi.kinsta.storage/production/uploads/2015/09/KIR-YIANNI-ESTATE_RAMNISTA_ENG-614x1024.jpg",
  },
  {
    wineryId: "costa-lazaridi",
    // Κανένα ξεχωριστό logo βρέθηκε στο νέο (ενεργό) site.
    wineSlug: "amethystos-erythros",
    wineImageUrl: "https://estates-costalazaridi.gr/wp-content/uploads/2026/02/Amethystos-Rouge-1600x900.jpg",
  },
  {
    wineryId: "ktima-merkouri",
    logoUrl: "https://mercouri.gr/images_general/Logo.png",
    wineSlug: "ktima-merkouri-erythros",
    wineImageUrl: "https://mercouri.gr/images_general/wines_ktima_label.jpg",
  },
  {
    wineryId: "ktima-tselepos",
    logoUrl: "https://tselepos.gr/wp-content/uploads/2019/12/tw_logo_retina.png",
    wineSlug: "mantinia-tselepos",
    wineImageUrl: "https://tselepos.gr/wp-content/uploads/2019/10/KTIMA-TSELEPOU_MANTINIA_GR-200x346.jpg",
  },
  {
    wineryId: "oinopoieia-aidarini",
    logoUrl: "https://aidarini.gr/wp-content/uploads/2017/08/logo.png",
    wineSlug: "goumenissa-aidarini",
    wineImageUrl: "https://aidarini.gr/wp-content/uploads/2017/08/kl-go_s.jpg",
  },
  {
    wineryId: "garalis-winery",
    logoUrl: "https://garaliswinery.gr/wp-content/uploads/2022/09/garalis-logo.png",
    wineSlug: "garalis-moschato-alexandreias",
    wineImageUrl: "https://garaliswinery.gr/wp-content/uploads/2022/09/Muscat-Garalis.jpg",
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

  await prisma.winery.update({ where: { slug: "costa-lazaridi" }, data: { websiteUrl: "https://estates-costalazaridi.gr" } });

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
    }
  }

  console.log("\nBatch 6 done: 8 wineries (Ρωξάνη Μάτσα + Μινώς Μηλιαράκης παραλείφθηκαν — κανένα επίσημο site βρέθηκε). 1 websiteUrl διορθώθηκε (Costa Lazaridi, νεκρό domain).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

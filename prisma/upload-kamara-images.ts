// Ανεβάζει τις φωτογραφίες ετικέτας των 15 κρασιών Kamara Pure Winery, με
// άδεια του χρήστη, απευθείας από το επίσημο site (kamarawinery.com). Ίδιο
// μοτίβο με upload-sclavos-images.ts — fetch() από το source URL. Σε
// αντίθεση με το mikroktimatitos.com, αυτό το site ΔΕΝ έχει hotlink
// protection (επιβεβαιώθηκε με curl πριν το γράψιμο αυτού του script).

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

const BASE = "https://www.kamarawinery.com/";

const IMAGE_MAP: Record<string, string> = {
  "kamara-pure-nimbus-albus": "sites/default/files/2023-09/NIMBUS%20ALBUS%20CAPS%20LQ.jpg",
  "kamara-pure-nimbus-ritinitis": "sites/default/files/2023-09/NIMBUS%20RITINITIS%20CAPS%20LQ.jpg",
  "kamara-pure-nimbus-russus": "sites/default/files/2023-09/NIMBUS%20RUSSUS%20CAPS%20LQ.jpg",
  "kamara-pure-stalisma-leyko": "sites/default/files/2023-09/STALISMA%20WHITE%20CLEAR%20BOT%20MQ.jpg",
  "kamara-pure-stalisma-roze": "sites/default/files/2025-07/IMG_0480.jpg",
  "kamara-pure-tararam-tararam": "sites/default/files/2025-07/Tararam%20Tararam.jpg",
  "kamara-pure-shadow-play-white": "sites/default/files/2018-07/shadow%20play%20LQ-p1.jpg",
  "kamara-pure-shadow-play-red": "sites/default/files/2022-04/shadow%20play%20red%20LQ.jpg",
  "kamara-pure-thriamvos": "sites/default/files/2024-12/Thriamvos%20cut_0.jpg",
  "kamara-pure-pet-nat-rose-blooming-island": "sites/default/files/2023-09/island%20LQ.jpg",
  "kamara-pure-petnat-orange-blooming-mountain": "sites/default/files/2022-04/PET%20NAT%20ORANGE_0.jpg",
  "kamara-pure-keramos-amphora-orange": "sites/default/files/2021-06/KERAMOS%20ORANGEa.jpg",
  "kamara-pure-retsina": "sites/default/files/2023-09/RETSINA%20750ml%20LQ.jpg",
  "kamara-pure-retsina-chilled-red-pine": "sites/default/files/2026-06/Retsina%20Chilled%20Red%20Pine%202025.jpg",
  "kamara-pure-keramos-amphora-red": "sites/default/files/2021-06/kERAMOS%20RED%20a.jpg",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, relativeUrl] of Object.entries(IMAGE_MAP)) {
    const url = BASE + relativeUrl;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`✗ ${slug}: αποτυχία λήψης ${url} (${res.status})`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const blob = await put(`wines/${slug}-${Date.now()}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
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

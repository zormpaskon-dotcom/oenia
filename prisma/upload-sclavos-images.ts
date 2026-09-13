// Ανεβάζει τις φωτογραφίες ετικέτας των 14 κρασιών Sclavos Wines, με άδεια
// του οινοποιείου, απευθείας από το επίσημο site τους (sclavoswines.gr, CDN
// content.4ty.gr/reseller-content.4ty.gr). Ίδιο μοτίβο με
// upload-biblia-chora-images.ts — fetch() από το source URL, όχι τοπικά αρχεία.
// Η αντιστοίχιση slug -> URL επιβεβαιώθηκε 1:1 μέσω DOM-order εξαγωγής από τη
// σελίδα "Τα προϊόντα μας" (κάθε <tr> έχει τον τίτλο+κείμενο και τη φωτογραφία
// μαζί, καμία εικασία σειράς).

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

const IMAGE_MAP: Record<string, string> = {
  "sclavos-orgion": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws1.jpg",
  "sclavos-monambeles": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws2.jpg",
  "sclavos-synodos-bio": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws3.jpg",
  "sclavos-oinos-idys-tou-iliou": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws4.jpg",
  "sclavos-efranor": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws5.jpg",
  "sclavos-vino-di-sasso": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws6.jpg",
  "sclavos-tsaousi": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws7.jpg",
  "sclavos-metageitnion-bio": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws8.jpg",
  "sclavos-alchymiste-rose": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws9.jpg",
  "sclavos-zakynthino": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws10.jpg",
  "sclavos-lakomatia": "https://reseller-content.4ty.gr/site2/chris-ftp/akmakeup/krasia-winws11.jpg",
  "sclavos-moschato-orange": "https://reseller-content.4ty.gr/site2/chris-ftp/Desktop/krasi-orange3.jpg",
  "sclavos-vostilidi-orange": "https://reseller-content.4ty.gr/site2/chris-ftp/Desktop/krasi-orange2.jpg",
  "sclavos-zakynthino-orange": "https://reseller-content.4ty.gr/site2/chris-ftp/Desktop/krasi-orange1.jpg",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  for (const [slug, url] of Object.entries(IMAGE_MAP)) {
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
    await prisma.wine.update({
      where: { slug },
      data: { labelImage: blob.url },
    });
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

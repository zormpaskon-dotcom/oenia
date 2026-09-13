// Ανεβάζει τις φωτογραφίες ετικέτας των 12 κρασιών Μεσημβρία Οινοποιητική,
// με άδεια του χρήστη, απευθείας από το επίσημο site (mesimvriawines.gr).
// Ίδιο μοτίβο με upload-kamara-images.ts — fetch() από το source URL. Το
// site δεν έχει hotlink protection (επιβεβαιώθηκε με curl).

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
  "mesimvria-zoiforos-erythros": "https://mesimvriawines.gr/wp-content/uploads/2025/03/krasia_0003.jpg",
  "mesimvria-zoiforos-roze": "https://mesimvriawines.gr/wp-content/uploads/2025/03/krasia_0001.jpg",
  "mesimvria-zoiforos-leykos": "https://mesimvriawines.gr/wp-content/uploads/2016/03/krasia_0005-1.jpg",
  "mesimvria-makedonikos-zoiforos-erythros": "https://mesimvriawines.gr/wp-content/uploads/2025/03/krasia_0007-1.jpg",
  "mesimvria-makedonikos-zoiforos-leykos": "https://mesimvriawines.gr/wp-content/uploads/2025/03/krasia_0010-1.jpg",
  "mesimvria-makedonikos-zoiforos-roze": "https://mesimvriawines.gr/wp-content/uploads/2025/03/krasia_0013-1.jpg",
  "mesimvria-moschato-bello-erythros-imigliko": "https://mesimvriawines.gr/wp-content/uploads/2025/03/krasia_0016.jpg",
  "mesimvria-moschato-bello-leykos": "https://mesimvriawines.gr/wp-content/uploads/2025/03/krasia_0020.jpg",
  "mesimvria-moschato-bello-roze": "https://mesimvriawines.gr/wp-content/uploads/2025/04/krasia_0018.jpg",
  "mesimvria-flogoinos-erythros": "https://mesimvriawines.gr/wp-content/uploads/2025/04/product-flogoinos-red.jpg",
  "mesimvria-flogoinos-malagouzia": "https://mesimvriawines.gr/wp-content/uploads/2025/04/product-flogoinos-white.jpg",
  "mesimvria-retsina-basiliki": "https://mesimvriawines.gr/wp-content/uploads/2025/04/new-retsina.jpg",
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

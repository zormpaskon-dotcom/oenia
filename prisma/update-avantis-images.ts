// Ενημερώνει logoImage/coverImage του Avantis Estate. Το coverImage
// εμφανίζεται ήδη στο hero του winery page και στο "winery split" του wine
// page (αντικαθιστά το γενικό FALLBACK_WINERY_PHOTO) — άμεσα ορατή αλλαγή.
// Το logoImage αποθηκεύεται στο ίδιο πεδίο του schema, αλλά κανένα template
// του site δεν το renders σήμερα (κανένα winery δεν έχει ποτέ logoImage
// ορισμένο) — αποθηκεύεται για μελλοντική χρήση, όχι επειδή θα εμφανιστεί
// κάπου τώρα. Επαληθεύει ότι και τα δύο πεδία είναι ακόμα null πριν γράψει.

import { readFileSync } from "fs";
import { put } from "@vercel/blob";
import { prisma } from "../lib/prisma";

function readBlobToken(): string {
  const envLocal = readFileSync(`${__dirname}/../.env.local`, "utf-8");
  const match = envLocal.match(/^BLOB_READ_WRITE_TOKEN=(.+)$/m);
  if (!match) throw new Error("BLOB_READ_WRITE_TOKEN not found in .env.local");
  return match[1].trim().replace(/^["']|["']$/g, "");
}
const BLOB_TOKEN = readBlobToken();

async function main() {
  const winery = await prisma.winery.findUnique({
    where: { slug: "avantis-estate" },
    select: { id: true, logoImage: true, coverImage: true },
  });
  if (!winery) throw new Error("Winery avantis-estate not found");
  if (winery.logoImage !== null || winery.coverImage !== null) {
    throw new Error(
      `Winery "avantis-estate" έχει ήδη logoImage/coverImage — abort χωρίς αλλαγές.\nΤρέχον: logoImage=${winery.logoImage}, coverImage=${winery.coverImage}`
    );
  }

  const logoBuffer = readFileSync("/Users/konstantinoszormpas/Desktop/avantis-logo.png");
  const logoBlob = await put(`wineries/avantis-estate-logo-${Date.now()}.png`, logoBuffer, { access: "public", token: BLOB_TOKEN });
  console.log(`  ↑ logo → ${logoBlob.url}`);

  const coverBuffer = readFileSync("/Users/konstantinoszormpas/Desktop/AVANTIS-WINNERY_0.jpg");
  const coverBlob = await put(`wineries/avantis-estate-cover-${Date.now()}.jpg`, coverBuffer, { access: "public", token: BLOB_TOKEN });
  console.log(`  ↑ cover → ${coverBlob.url}`);

  await prisma.winery.update({
    where: { id: winery.id },
    data: { logoImage: logoBlob.url, coverImage: coverBlob.url },
  });
  console.log('✓ Winery "avantis-estate" logoImage + coverImage ενημερώθηκαν.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

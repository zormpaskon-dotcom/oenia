// Ανεβάζει 4 πραγματικές φωτογραφίες του Κτήματος Μερκούρη (δόθηκαν
// απευθείας από τον χρήστη, όχι από το επίσημο site) στο Vercel Blob, για
// χρήση στο lib/winery-images.ts premium template. Ίδιο μοτίβο .env.local
// parsing με το prisma/upload-douloufakis-images.ts.
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

const FILES: Record<string, string> = {
  hero: "/Users/konstantinoszormpas/Downloads/caption-3.jpg",
  vineyard: "/Users/konstantinoszormpas/Downloads/vineyard-view.jpg",
  // Ζητήθηκε ρητά: το "Μέσα στο κελάρι" να δείχνει τα βαρέλια, όχι την αυλή.
  winery: "/Users/konstantinoszormpas/Downloads/red-wine-maturing-in.jpg",
  editorial: "/Users/konstantinoszormpas/Downloads/birds-eye-view-of-the.jpg",
};

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }
  const urls: Record<string, string> = {};
  for (const [category, filePath] of Object.entries(FILES)) {
    const buffer = fs.readFileSync(filePath);
    const blob = await put(`wineries/ktima-merkouri-${category}-${Date.now()}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
    });
    urls[category] = blob.url;
    console.log(`✓ ${category} -> ${blob.url}`);
  }
  console.log("\nJSON:", JSON.stringify(urls, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

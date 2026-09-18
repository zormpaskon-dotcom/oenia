// Ανεβάζει την επίσημη φωτογραφία του "Άκρες Λευκό" στο Vercel Blob —
// απευθείας από skouras.gr/wines/lefkoi/akres-leuko (ελληνική σελίδα, το
// μόνο μέρος που φιλοξενεί αυτή τη distinct ετικέτα).

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

const IMAGE_URL = "https://skouras.gr/wp-content/uploads/2023/07/akres-white-1.png";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }
  const res = await fetch(IMAGE_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const blob = await put(`wines/akres-leyko-${Date.now()}.png`, buffer, {
    access: "public",
    contentType: "image/png",
  });
  await prisma.wine.update({ where: { slug: "akres-leyko" }, data: { labelImage: blob.url } });
  console.log(`✓ akres-leyko -> ${blob.url}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

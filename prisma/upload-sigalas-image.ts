// Ανεβάζει την επίσημη φωτογραφία ετικέτας του Domaine Sigalas Santorini
// (Ασύρτικο) στο Vercel Blob — κατέβηκε απευθείας από το sigalas-wine.com.
// Χρησιμοποιείται ως το "προτεινόμενο κρασί" της αρχικής σελίδας.

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

const SOURCE_URL = "https://sigalas-wine.com/wp-content/uploads/2026/05/Domaine-Sigalas_Santorini_ENG.png";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  const res = await fetch(SOURCE_URL);
  const buffer = Buffer.from(await res.arrayBuffer());
  const blob = await put(`wines/sigalas-santorini-assyrtiko-${Date.now()}.png`, buffer, {
    access: "public",
    contentType: "image/png",
  });
  await prisma.wine.update({
    where: { slug: "sigalas-santorini-assyrtiko" },
    data: { labelImage: blob.url },
  });
  console.log(`✓ sigalas-santorini-assyrtiko -> ${blob.url}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

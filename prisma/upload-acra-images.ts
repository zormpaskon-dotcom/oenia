// Ανεβάζει στο Vercel Blob τις εικόνες του Acra Winery που μόλις
// μπήκαν στη βάση ως hotlinked URLs από το acrawinery.com
// (prisma/enrich-acra-winery.ts) — ίδιο pattern με κάθε άλλο winery.

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

  // Cover image του winery
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "acra-winery" }, select: { coverImage: true } });
  if (winery.coverImage) {
    const buf = await fetchBuffer(winery.coverImage);
    const blob = await put(`wineries/acra-winery-cover-${Date.now()}.${extOf(winery.coverImage)}`, buf, { access: "public" });
    await prisma.winery.update({ where: { slug: "acra-winery" }, data: { coverImage: blob.url } });
    console.log(`✓ acra-winery coverImage -> ${blob.url}`);
  }

  const wineSlugs = ["acra-nemea", "acra-assyrtiko", "acra-malbec", "acra-kidonitsa"];
  for (const slug of wineSlugs) {
    const wine = await prisma.wine.findUniqueOrThrow({ where: { slug }, select: { labelImage: true } });
    if (!wine.labelImage) continue;
    const buf = await fetchBuffer(wine.labelImage);
    const blob = await put(`wines/${slug}-${Date.now()}.${extOf(wine.labelImage)}`, buf, { access: "public" });
    await prisma.wine.update({ where: { slug }, data: { labelImage: blob.url } });
    console.log(`✓ ${slug} -> ${blob.url}`);
  }

  console.log("\nAcra Winery: όλες οι εικόνες (cover + 4 wine labels) πλέον hosted στο Vercel Blob.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

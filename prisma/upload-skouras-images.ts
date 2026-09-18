// Ανεβάζει τις επίσημες φωτογραφίες μπουκαλιών + το λογότυπο του Κτήματος
// Σκούρα στο Vercel Blob — απευθείας από το skouras.gr/en/wines.

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

const LOGO_URL = "https://skouras.gr/wp-content/uploads/2026/08/40-logo-header-EN.png";

const WINE_IMAGES: { slug: string; url: string }[] = [
  { slug: "viognier-eclectique", url: "https://skouras.gr/wp-content/uploads/2023/07/viognier-eclectique-1.png" },
  { slug: "dum-vinum-sperum", url: "https://skouras.gr/wp-content/uploads/2023/07/dum-vinum-1.png" },
  { slug: "almyra", url: "https://skouras.gr/wp-content/uploads/2023/07/almyra.png" },
  { slug: "viognier-cuvee-larsinos", url: "https://skouras.gr/wp-content/uploads/2023/07/viognier-2023-1.png" },
  { slug: "salto", url: "https://skouras.gr/wp-content/uploads/2023/07/salto-usa-moscofilero-skouras.png" },
  { slug: "assyrtiko-skoyra", url: "https://skouras.gr/wp-content/uploads/2023/07/assyrtiko-1.png" },
  { slug: "moschofilero-skoyra", url: "https://skouras.gr/wp-content/uploads/2023/07/MOSCOFILERO__EU_0.png" },
  { slug: "zoe-white", url: "https://skouras.gr/wp-content/uploads/2023/06/zoe-white-us-1.png" },
  { slug: "peplo", url: "https://skouras.gr/wp-content/uploads/2023/07/peplo-rose-all-1.png" },
  { slug: "zoe-rose", url: "https://skouras.gr/wp-content/uploads/2023/07/zoe-ROSE-us-1.png" },
  { slug: "lavyrinthos", url: "https://skouras.gr/wp-content/uploads/2023/07/labyrinth-1.png" },
  { slug: "megas-oinos", url: "https://skouras.gr/wp-content/uploads/2023/07/megas-oenos-eu-1.png" },
  { slug: "grande-cuvee-nemea", url: "https://skouras.gr/wp-content/uploads/2023/07/NEMEA_GRAND_CUVEE-new.png" },
  { slug: "titanas", url: "https://skouras.gr/wp-content/uploads/2023/07/titanas-1.png" },
  { slug: "fleva", url: "https://skouras.gr/wp-content/uploads/2023/07/fleva-3.png" },
  { slug: "synoro", url: "https://skouras.gr/wp-content/uploads/2023/07/synoro-eu-1.png" },
  { slug: "nemea-saint-george", url: "https://skouras.gr/wp-content/uploads/2023/07/saint-george-novintage-1.png" },
  { slug: "portes-merlot", url: "https://skouras.gr/wp-content/uploads/2023/07/portes-merlot-1.png" },
  { slug: "zoe-red", url: "https://skouras.gr/wp-content/uploads/2023/07/zoe-red-site-us.png" },
];

async function fetchBuffer(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Λείπει το BLOB_READ_WRITE_TOKEN — έλεγξε το .env.local");
  }

  const logoBuffer = await fetchBuffer(LOGO_URL);
  const logoBlob = await put(`wineries/domaine-skouras-logo-${Date.now()}.png`, logoBuffer, {
    access: "public",
    contentType: "image/png",
  });
  await prisma.winery.update({ where: { slug: "domaine-skouras" }, data: { logoImage: logoBlob.url } });
  console.log(`✓ winery logo -> ${logoBlob.url}`);

  for (const { slug, url } of WINE_IMAGES) {
    const buffer = await fetchBuffer(url);
    const blob = await put(`wines/${slug}-${Date.now()}.png`, buffer, {
      access: "public",
      contentType: "image/png",
    });
    await prisma.wine.update({ where: { slug }, data: { labelImage: blob.url } });
    console.log(`✓ ${slug} -> ${blob.url}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
